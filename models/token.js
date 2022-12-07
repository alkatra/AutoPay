const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Token",
  new mongoose.Schema(
    {
      accessToken: String,
      expiresAt: Date,
    },
    { collection: "tokens" }
  )
);
