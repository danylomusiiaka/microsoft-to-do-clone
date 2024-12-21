import { Schema, model } from "mongoose";

const taskSchema = new Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  status: { type: String },
  date: { type: String },
  description: { type: String },
  category: { type: String },
  isImportant: { type: Boolean, default: false },
  priority: { type: String },
  assignee: { type: String },
});

export default model("Task", taskSchema);
