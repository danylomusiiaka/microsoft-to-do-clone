const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken, generateRandomString } = require("../config/authMiddleware");
require("dotenv").config({ path: ".env" });

router.post("/verify-email", async (req, res) => {
  const { email } = req.body;

  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    return res.status(400).send("Ця пошта вже зареєстрована");
  }

  const verificationKey = generateRandomString();
  const hashedKey = await bcrypt.hash(verificationKey, 10);

  const transporter = nodemailer.createTransport({
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

  const isMatch = await bcrypt.compare(userInputKey, verificationKey);

  if (!isMatch) {
    return res.status(400).send("Неправильний ключ верифікації");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new userModel({ name, email, password: hashedPassword, picture: "" });
  await user.save();

  const token = generateToken(user.id);
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    maxAge: 7200000,
  });
  res.send("Реєстрація відбулася успішно!");
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
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    maxAge: 7200000,
  });
  res.send("Логін відбувся успішно!");
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
    const { name, email, picture } = user;
    res.json({ name, email, picture });
  } catch (error) {
    res.status(500).send("Error retrieving user profile");
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

module.exports = router;
