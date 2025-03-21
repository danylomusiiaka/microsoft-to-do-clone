import express, { json } from "express";
import cors from "cors";
import pkg from "body-parser";
const { urlencoded } = pkg;
import cookieParser from "cookie-parser";
import { createServer } from "http";
import "./config/mongodb.js";
import { setupWebSocketServer } from "./config/websocket.js";
import cron from "./config/cron.js";
const { job } = cron;
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const app = express();
const server = createServer(app);
const web_url = process.env.WEB_URL || "http://localhost:3000";
const port = process.env.PORT || 3001;

app.set("trust proxy", true);

setupWebSocketServer(server);

app.use(
  cors({
    origin: web_url,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
    credentials: true,
  })
);

app.use(json({ limit: "10mb" }));
app.use(urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

import userRoutes from "./routes/userMethods.js";

app.use("/user", userRoutes);

import taskRoutes from "./routes/taskMethods.js";

app.use("/task", taskRoutes);

import categoryRoutes from "./routes/categoryMethods.js";

app.use("/category", categoryRoutes);

import teamRoutes from "./routes/teamMethods.js";

app.use("/team", teamRoutes);

job.start();

import authAttemptsModel from "./models/authAttemptsModel.js";

app.get("/", async (req, res) => {
  try {
    await authAttemptsModel.deleteMany({ clearTime: { $lte: Date.now() } });
    res.status(200).send("Server is running");
  } catch (err) {
    res.status(500).send("Error occurred while cleaning up old auth attempts.");
  }
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
