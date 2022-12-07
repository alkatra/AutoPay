const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Clients",
  new mongoose.Schema(
    {
      name: String,
      number: Number,
      customerCode: String,
      merchantID: String,
      itemName: String,
      clientIP: String,
      paymentToken: String,
      totalSuccess: Number,
      payments: [
        {
          amount: Number,
          startDate: Date,
          ignoreLastPayment: Boolean,
          lastPayment: Date,
          lastAttempted: Date,
          paymentFrequency: String,
          timesRecurringLeft: Number,
          successCount: Number,
          paymentHistory: Array,
        },
      ],
    },
    { collection: "clients" }
  )
);
