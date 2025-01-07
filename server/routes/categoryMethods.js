import { Router } from "express";
const router = Router();
import { verifyToken } from "../config/authMiddleware.js";
import { broadcast } from "../config/websocket.js";
import userModel from "../models/userModel.js";
import taskModel from "../models/taskModel.js";
import teamModel from "../models/teamModel.js";

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { category } = req.body;
    const user = await userModel.findById(req.userId);

    if (user.team) {
      const userTeam = await teamModel.findOne({ code: user.team });
      if (!userTeam.categories) {
        userTeam.categories = [];
      }
      if (userTeam.categories.length >= 20) {
        return res.status(400).send(`Ваша команда досягнула ліміту створення списків.`);
      }
      if (userTeam.categories.includes(category)) {
        return res.status(400).send(`Категорія з таким ім'ям вже існує`);
      }
      userTeam.categories.push(category);
      await userTeam.save();

      broadcast({ event: "categoryCreated", categories: userTeam.categories }, userTeam.code);
      return res.status(200).json({
        message: `Ви успішно створили список`,
      });
    }

    if (!user.categories) {
      user.categories = [];
    }

    if (user.categories.length >= 20) {
      return res.status(400).send(`Ви досягнули ліміту створення списків.`);
    }

    user.categories.push(category);
    await user.save();

    return res.status(200).json({
      message: `Ви успішно створили список`,
    });
  } catch (error) {
    return res.status(500).send("Помилка створення списку");
  }
});

router.get("/all", verifyToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).send("Користувач не знайдений");
    }
    if (user.team) {
      const team = await teamModel.findOne({ code: user.team });
      if (!team) {
        return res.status(404).send("Команда не знайдена");
      }
      return res.json(team.categories);
    }
    return res.json(user.categories);
  } catch (error) {
    res.status(500).send("Помилка отримання категорій");
  }
});

router.put("/:name", verifyToken, async (req, res) => {
  const oldCategory = decodeURIComponent(req.params.name);
  const { newCategory } = req.body;

  try {
    const user = await userModel.findById(req.userId);
    const isTeam = Boolean(user.team);
    const userEntity = isTeam ? await teamModel.findOne({ code: user.team }) : user;
    userEntity.categories = userEntity.categories.map((cat) =>
      cat === oldCategory ? newCategory : cat
    );
    await userEntity.save();

    await taskModel.updateMany({ category: oldCategory }, { category: newCategory });
    const updatedTodos = await taskModel.find({ author: isTeam ? user.team : user.email });

    if (isTeam) {
      broadcast(
        {
          event: "categoryUpdated",
          updatedCategory: userEntity.categories,
          updatedTodos,
        },
        user.team
      );
    }
    return res.status(200).json({
      updatedCategory: userEntity.categories,
      updatedTodos,
      message: `Оновлення списку відбулось успішно`,
    });
  } catch (error) {
    res.status(500).json({ message: "Помилка у оновленні списку" });
  }
});

router.delete("/:name", verifyToken, async (req, res) => {
  const categoryName = decodeURIComponent(req.params.name);
  try {
    const user = await userModel.findById(req.userId);
    const isTeam = Boolean(user.team);
    const userEntity = isTeam ? await teamModel.findOne({ code: user.team }) : user;

    const category = userEntity.categories.find((cat) => cat === categoryName);

    userEntity.categories = userEntity.categories.filter((cat) => cat !== categoryName);
    await userEntity.save();

    await taskModel.deleteMany({ category });
    const remainingTasks = await taskModel.find({ author: isTeam ? user.team : user.email });

    if (isTeam) {
      broadcast(
        {
          event: "categoryDeleted",
          remainingCategories: userEntity.categories,
          remainingTasks,
        },
        user.team
      );
    }
    return res.status(200).json({
      remainingCategories: userEntity.categories,
      remainingTasks,
      message: `Видалення списку відбулось успішно`,
    });
  } catch (error) {
    res.status(500).json({ message: "Помилка у видаленні списку" });
  }
});

export default router;
