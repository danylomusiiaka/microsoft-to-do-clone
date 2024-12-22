import { Router } from "express";
const router = Router();
import userModel from "../models/userModel.js";
import teamModel from "../models/teamModel.js";
import taskModel from "../models/taskModel.js";
import { createTransport } from "nodemailer";
import { hash, compare } from "bcrypt";
import { generateToken, verifyToken, generateRandomString } from "../config/authMiddleware.js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

router.post("/verify-email", async (req, res) => {
  const { email } = req.body;

  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    return res.status(400).send("Ця пошта вже зареєстрована");
  }

  const verificationKey = generateRandomString();
  const hashedKey = await hash(verificationKey, 10);

  const transporter = createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "To do Project LNU App",
    to: email,
    subject: "Підтвердіть свою пошту",
    html: `<h3>Ваш код доступу: ${verificationKey}</h3>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(401).send("Пошта не є валідною");
    }
    res.json({ hashedKey });
  });
});

router.post("/register", async (req, res) => {
  const { name, email, password, verificationKey, userInputKey } = req.body;

  const isMatch = await compare(userInputKey, verificationKey);

  if (!isMatch) {
    return res.status(400).send("Неправильний ключ верифікації");
  }
  const hashedPassword = await hash(password, 10);
  const user = new userModel({ name, email, password: hashedPassword, picture: "" });
  await user.save();

  const token = generateToken(user.id);
  res.json({ token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).send("Неправильна пошта або пароль");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).send("Неправильна пошта або пароль");
  }

  const token = generateToken(user.id);
  res.json({ token });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, path: "/" });
  res.send("Вихід з профілю виконаний успішно!");
});

router.delete("/delete", async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.userId);
    res.status(200).send("Profile deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting profile");
  }
});

router.get("/details", verifyToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).send("Користувач не знайдений");
    }

    const { name, email, picture, team, categories } = user;

    if (team) {
      const userTeam = await teamModel.findOne({ code: team });
      if (!userTeam) {
        user.team = "";
        await user.save();
        return res.json({ name, email, picture, team: "", categories });
      }
      if (!userTeam.categories) {
        userTeam.categories = [];
        await userTeam.save();
        return res.json({ name, email, picture, team, categories: [] });
      }
      return res.json({ name, email, picture, team, categories: userTeam.categories });
    }

    return res.json({ name, email, picture, team, categories });
  } catch (error) {
    console.log(error);

    return res.status(500).send("Error retrieving user profile");
  }
});

router.post("/update-field", verifyToken, async (req, res) => {
  const { fieldName, fieldValue } = req.body;

  try {
    const user = await userModel.findById(req.userId).select("-password");
    user[fieldName] = fieldValue;
    await user.save();
    res.status(200).send("Поле профілю оновлено");
  } catch (error) {
    res.status(500).send("Error updating user profile");
  }
});

router.post("/create-team", verifyToken, async (req, res) => {
  const teamCode = generateRandomString(12);
  const user = await userModel.findById(req.userId).select("-password");
  const team = new teamModel({
    code: teamCode,
    participants: [user.email],
    admins: [user.email],
  });
  await team.save();
  if (!user["team"]) {
    user["team"] = teamCode;
    await user.save();
    res.json(teamCode);
  }
});

router.post("/exit-team", verifyToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    const team = await teamModel.findOne({ code: user.team });

    if (team) {
      team.participants = team.participants.filter((participant) => participant !== user.email);
      if (team.participants.length === 0) {
        await teamModel.findByIdAndDelete(team._id);
        await taskModel.deleteMany({ author: team.code });
      } else {
        await team.save();
      }
    }
    user["team"] = "";
    await user.save();
    res.json("");
  } catch (error) {
    res.status(500).send("Error exiting team");
  }
});

router.post("/join-team", verifyToken, async (req, res) => {
  const { teamCode } = req.body;

  try {
    const team = await teamModel.findOne({ code: teamCode });

    if (!team) {
      return res.status(404).send("Команда не знайдена");
    }

    const user = await userModel.findById(req.userId).select("-password");
    if (team.participants.includes(user.email)) {
      return res.status(400).send("Ви вже є учасником цієї команди");
    }

    team.participants.push(user.email);
    await team.save();

    user.team = teamCode;
    await user.save();

    res.status(200).send("Ви успішно приєдналися до команди");
  } catch (error) {
    res.status(500).send("Помилка приєднання до команди");
  }
});

router.get("/team-members", verifyToken, async (req, res) => {
  const { teamCode } = req.query;
  try {
    const team = await teamModel.findOne({ code: teamCode });
    const participants = await userModel
      .find({ email: { $in: team.participants } })
      .select("email name picture");
    res.status(200).json(participants);
  } catch (error) {
    res.status(500).send("Помилка відображення учасників команди");
  }
});

export default router;
