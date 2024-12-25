import { Router } from "express";
const router = Router();
import taskModel from "../models/taskModel.js";
import userModel from "../models/userModel.js";
import { verifyToken } from "../config/authMiddleware.js";
import { broadcast } from "../config/websocket.js";

router.post("/create", verifyToken, async (req, res) => {
  try {
    const taskData = req.body;
    if (!taskData.assignee) {
      delete taskData.assignee;
    }
    const newTask = new taskModel(taskData);
    await newTask.save();

    broadcast({ event: "taskCreated", task: newTask }, newTask.author);
    res.status(201).json({ id: newTask._id });
  } catch (error) {
    res.status(500).send("Сталася помилка у створенні завдання");
  }
});

router.delete("/all", verifyToken, async (req, res) => {
  try {
    const { category } = req.query;
    const user = await userModel.findById(req.userId).select("-password");
    const author = user.team || user.email;
    const filter = { author };
    if (category && category !== "Завдання") {
      filter.category = category;
    }

    const result = await taskModel.deleteMany(filter);

    const message =
      category && category !== "Завдання"
        ? `Видалено ${result.deletedCount} завдань у списку ${category}`
        : "Всі завдання видалено успішно";

    res.status(200).json({ message });
  } catch (error) {
    res.status(500).send("Сталася помилка у видаленні завдань");
  }
});

router.get("/all", verifyToken, async (req, res) => {
  const { author } = req.query;
  try {
    const tasks = await taskModel.find({ author });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).send("Сталася помилка у відображенні завдань");
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const taskId = req.params.id;
  const updateTask = req.body;
  try {
    const updatedTask = await taskModel.findByIdAndUpdate(taskId, updateTask, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    broadcast({ event: "taskUpdated", task: updatedTask }, updatedTask.author);
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).send("Сталася помилка в оновленні завдання");
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const taskId = req.params.id;
  try {
    const deletedTask = await taskModel.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    broadcast({ event: "taskDeleted", taskId }, deletedTask.author);
    res.status(200).json("Task successfully deleted");
  } catch (error) {
    res.status(500).send("Сталася помилка у видаленні завдання");
  }
});

export default router;
