const express = require("express");
const router = express.Router();
const taskModel = require("../models/taskModel");
const { verifyToken } = require("../config/authMiddleware");
const { broadcast } = require("../config/websocket");

router.post("/create", verifyToken, async (req, res) => {
  try {
    const newTask = new taskModel(req.body);
    await newTask.save();
    console.log(newTask.author);

    broadcast({ event: "taskCreated", task: newTask }, newTask.author); // Notify WebSocket clients
    res.status(201).json({ id: newTask._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/all", verifyToken, async (req, res) => {
  const { author } = req.query;
  try {
    const tasks = await taskModel.find({ author });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
