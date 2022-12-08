const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Log",
  new mongoose.Schema(
    {
      date: Date,
      message: String,
    },
    { collection: "logs" }
  )
);
