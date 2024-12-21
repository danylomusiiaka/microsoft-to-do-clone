import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const mongodb_url = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/todoLNUProject";

connect(mongodb_url)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

export default mongoose;
