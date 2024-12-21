import express, { json } from "express";
import cors from "cors";
import pkg from "body-parser";
const { urlencoded } = pkg;
import cookieParser from "cookie-parser";
import { createServer } from "http";
import "./config/mongodb.js";
import { setupWebSocketServer } from "./config/websocket.js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const app = express();
const server = createServer(app);
const web_url = process.env.WEB_URL || "http://localhost:3000";

setupWebSocketServer(server);

// Middleware
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

server.listen(3001, () => {
  console.log("Server is listening on port 3001");
});
