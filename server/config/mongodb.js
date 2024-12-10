const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/todoLNUProject")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

module.exports = mongoose;
