const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      // kisko notification jana hai
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },

    itemType: {
      type: String,
      enum: ["LOST", "FOUND"],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      enum: ["ITEM_CREATED", "ITEM_DELETED", "REPORT", "GENERAL"],
      default: "GENERAL",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
