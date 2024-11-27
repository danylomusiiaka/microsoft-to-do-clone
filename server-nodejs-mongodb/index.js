const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require("http");
const mongoose = require("./config/mongodb");
const { setupWebSocketServer } = require("./config/websocket");
require("dotenv").config({ path: ".env" });

const app = express();
const server = http.createServer(app);
const web_url = process.env.WEB_URL || "http://localhost:3000";

setupWebSocketServer(server);

// Middleware
app.use(
  cors({
    origin: web_url,
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

const userRoutes = require("./routes/userMethods");

app.use("/user", userRoutes);

server.listen(3001, () => {
  console.log("Server is listening on port 3001");
});
