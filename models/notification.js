const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.ObjectId,
      ref: "driver",
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);