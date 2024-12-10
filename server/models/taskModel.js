const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  status: { type: String },
  date: { type: String },
  description: { type: String },
  category: { type: String },
  isImportant: { type: Boolean, default: false },
  priority: { type: String },
});

module.exports = mongoose.model("Task", taskSchema);
