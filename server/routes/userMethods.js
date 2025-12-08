import { Router } from "express";
const router = Router();
import userModel from "../models/userModel.js";
import teamModel from "../models/teamModel.js";
import taskModel from "../models/taskModel.js";
import authAttemptsModel from "../models/authAttemptsModel.js";
import { createTransport } from "nodemailer";
import { hash, compare } from "bcrypt";
import { generateAccess, generateTokens, verifyToken, generateRandomString } from "../config/authMiddleware.js";
import { broadcast } from "../config/websocket.js";
import { HALF_HOUR, TWO_DAYS, LOGIN_COUNT, REGISTER_COUNT } from "../config/constants.js";
import dotenv from "dotenv";
import pkg from "jsonwebtoken";
const { decode, verify } = pkg;
dotenv.config({ path: ".env" });

router.post("/verify-email", async (req, res) => {
  const { email } = req.body;

  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    try {
      const existingAttempt = await authAttemptsModel.findOne({ userIp: req.ip, email });
      if (!existingAttempt) {
        const newAttempt = new authAttemptsModel({
          userIp: req.ip,
          email,
          registerCount: REGISTER_COUNT - 1,
          waitUntilNextRegister: new Date(Date.now() + HALF_HOUR),
        });
        await newAttempt.save();
      } else {
        existingAttempt.clearTime = new Date(Date.now() + TWO_DAYS);
        if (existingAttempt.waitUntilNextRegister <= Date.now() || !existingAttempt.waitUntilNextRegister) {
          existingAttempt.registerCount = REGISTER_COUNT;
          existingAttempt.waitUntilNextRegister = new Date(Date.now() + HALF_HOUR);
        } else {
          if (existingAttempt.registerCount === 0) {
            return res.status(401).send("Забагато спроб реєстрації. Спробуйте через 30 хв");
          } else {
            existingAttempt.registerCount -= 1;
          }
        }
        await existingAttempt.save();
      }
    } catch (error) {
      console.error(error);
    }
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
      console.error(error);
      return res.status(401).send("Пошта не є валідною");
    }
    res.json({ hashedKey });
  });
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, verificationKey, userInputKey } = req.body;

    const isMatch = await compare(userInputKey, verificationKey);

    if (!isMatch) {
      try {
        const existingAttempt = await authAttemptsModel.findOne({ userIp: req.ip, email });
        if (!existingAttempt) {
          const newAttempt = new authAttemptsModel({
            userIp: req.ip,
            email,
            registerCount: REGISTER_COUNT - 1,
            waitUntilNextRegister: new Date(Date.now() + HALF_HOUR),
          });
          await newAttempt.save();
        } else {
          existingAttempt.clearTime = new Date(Date.now() + TWO_DAYS);
          if (existingAttempt.waitUntilNextRegister <= Date.now() || !existingAttempt.waitUntilNextRegister) {
            existingAttempt.registerCount = REGISTER_COUNT;
            existingAttempt.waitUntilNextRegister = new Date(Date.now() + HALF_HOUR);
          } else {
            if (existingAttempt.registerCount === 0) {
              return res.status(401).send("Забагато спроб реєстрації. Спробуйте через 30 хв");
            } else {
              if (!isMatch) {
                existingAttempt.registerCount -= 1;
              } else {
                existingAttempt.registerCount = REGISTER_COUNT;
              }
            }
          }
          await existingAttempt.save();
        }
      } catch (error) {
        console.error(error);
      }
      return res.status(400).send("Неправильний ключ верифікації");
    }
    const hashedPassword = await hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword, picture: "" });
    await user.save();

    const token = await generateTokens(user.id);
    res.json({ token });
  } catch (error) {
    res.status(401).send("Помилка регістрації.");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).send("Поля пошти або паролю не можуть бути пустими");
    }

    const user = await userModel.findOne({ email });
    const isMatch = await user?.comparePassword(password);

    if (!user || !isMatch) {
      try {
        const existingAttempt = await authAttemptsModel.findOne({ userIp: req.ip, email });
        if (!existingAttempt) {
          const newAttempt = new authAttemptsModel({
            userIp: req.ip,
            email,
            loginCount: LOGIN_COUNT - 1,
            waitUntilNextLogin: new Date(Date.now() + HALF_HOUR),
          });
          await newAttempt.save();
        } else {
          existingAttempt.clearTime = new Date(Date.now() + TWO_DAYS);
          if (existingAttempt.waitUntilNextLogin <= Date.now() || !existingAttempt.waitUntilNextLogin) {
            existingAttempt.loginCount = LOGIN_COUNT;
            existingAttempt.waitUntilNextLogin = new Date(Date.now() + HALF_HOUR);
          } else {
            if (existingAttempt.loginCount === 0) {
              return res.status(401).send("Забагато спроб входу. Спробуйте через 30 хв");
            } else {
              if (!user || !isMatch) {
                existingAttempt.loginCount -= 1;
              } else {
                existingAttempt.loginCount = LOGIN_COUNT;
              }
            }
          }
          await existingAttempt.save();
        }
      } catch (error) {
        console.error();
      }
      return res.status(401).send("Неправильна пошта або пароль");
    }

    const token = await generateTokens(user.id);
    res.json({ token });
  } catch (error) {
    res.status(401).send("Помилка входу.");
  }
});

router.get("/refresh", async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).send("Unauthorized");

  const payload = decode(token);

  if (!payload || !payload.id) {
    return res.status(401).send("Invalid token");
  }

  const user = await userModel.findById(payload.id);

  if (!user || !user.refreshToken) {
    return res.status(401).send("No refresh token found");
  }

  verify(user.refreshToken, process.env.JWT_SECRET, async (err) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        const token = await generateTokens(user.id);
        return res.json({ token });
      }
      return res.status(401).send("Термін дії токена закінчився. Будь ласка, залогуйтесь знову");
    }

    const newAccessToken = generateAccess(user.id);

    return res.json({ token: newAccessToken });
  });
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
    console.error(error);

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
      await taskModel.updateMany({ _id: { $in: invalidTasks.map((task) => task._id) } }, { $set: { status: "to do" } });

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
