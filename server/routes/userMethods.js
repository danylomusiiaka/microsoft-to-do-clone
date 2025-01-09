import { Router } from "express";
const router = Router();
import userModel from "../models/userModel.js";
import teamModel from "../models/teamModel.js";
import taskModel from "../models/taskModel.js";
import { createTransport } from "nodemailer";
import { hash, compare } from "bcrypt";
import { generateToken, verifyToken, generateRandomString } from "../config/authMiddleware.js";
import { broadcast } from "../config/websocket.js";
import { rateLimit } from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    res.status(429).send("Забагато спроб входу, спробуйте через 15 хвилин");
  },
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    res.status(429).send("Забагато спроб реєстрації, спробуйте через 15 хвилин");
  },
  skipSuccessfulRequests: true,
});

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(429).send("Забагато спроб реєстрації, спробуйте через 15 хвилин");
  },
});

router.post("/verify-email", verificationLimiter, async (req, res) => {
  const { email } = req.body;

  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    return res.status(400).send("Ця пошта вже зареєстрована");
  }

  const verificationKey = generateRandomString();
  const hashedKey = await hash(verificationKey, 10);

  const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: '"To do Project LNU App" <microsoft.todo.clone@gmail.com>',
    to: email,
    subject: "Підтвердіть свою пошту",
    html: `<h3>Ваш код доступу: ${verificationKey}</h3>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);

      return res.status(401).send("Пошта не є валідною");
    }
    res.json({ hashedKey });
  });
});

router.post("/register", registerLimiter, async (req, res) => {
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

router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const userIp = req.ip;
  console.log(`User Ip: ${userIp}`);

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
    const { team } = user;

    if (team) {
      const userTeam = await teamModel.findOne({ code: team });
      if (!userTeam) {
        user.team = "";
        await user.save();
        return res.json({ ...user, team: "" });
      }
      return res.json({
        ...user.toObject(),
        categories: userTeam.categories,
        statuses: userTeam.statuses,
      });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).send("Error retrieving user profile");
  }
});

router.put("/update-field", verifyToken, async (req, res) => {
  const { fieldName, fieldValue } = req.body;

  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (fieldName === "statuses") {
      const tasks = await taskModel.find({ author: user.team || user.email });
      const statusNames = fieldValue.map((status) => status.name);
      if (statusNames.length >= 20) {
        return res.status(400).send("Ви досягнули ліміту створення статусів.");
      }
      const validStatuses = [...statusNames, "to do", "in progress", "done"];
      const invalidTasks = tasks.filter((task) => !validStatuses.includes(task.status));
      await taskModel.updateMany(
        { _id: { $in: invalidTasks.map((task) => task._id) } },
        { $set: { status: "to do" } }
      );

      if (user.team) {
        const team = await teamModel.findOne({ code: user.team });
        team[fieldName] = fieldValue;
        const updatedTodos = await taskModel.find({ author: user.team });
        broadcast({ event: "statusesUpdated", newStatuses: fieldValue, updatedTodos }, user.team);
        await team.save();
        return res.status(200).send("Поле профілю оновлено");
      }
    }

    user[fieldName] = fieldValue;
    await user.save();
    return res.status(200).send("Поле профілю оновлено");
  } catch (error) {
    return res.status(500).send("Помилка оновлення профілю");
  }
});

router.get("/statuses", verifyToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");

    if (user.team) {
      const userTeam = await teamModel.findOne({ code: user.team });
      return res.json(userTeam.statuses);
    }

    return res.json(user.statuses);
  } catch (error) {
    return res.status(500).send("Помилка оновлення профілю");
  }
});

export default router;
