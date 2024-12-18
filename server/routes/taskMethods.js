const express = require("express");
const router = express.Router();
const taskModel = require("../models/taskModel");
const userModel = require("../models/userModel");
const { verifyToken } = require("../config/authMiddleware");
const { broadcast } = require("../config/websocket");

router.post("/create", verifyToken, async (req, res) => {
  try {
    const newTask = new taskModel(req.body);
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

    if (category === "Завдання") {
      await taskModel.deleteMany({});
      return res.status(200).json({ message: "Всі завдання видалено успішно" });
    }

    const result = await taskModel.deleteMany({ category });

    const isTeam = Boolean(user.team);

    const remainingTasks = await taskModel.find({ author: isTeam ? user.team : user.email });
    return res.status(200).json({
      remainingTasks,
      message: `Видалено ${result.deletedCount} завдань у списку ${category}`,
    });
  } catch (error) {
    return res.status(500).send("Сталася помилка у видаленні завдань");
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

module.exports = router;
