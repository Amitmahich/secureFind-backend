const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    imageUrl: {
      type: String,
      required: true,
    },

    itemType: {
      type: String,
      enum: ["LOST", "FOUND"],
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    reports: {
      type: Number,
      default: 0,
    },
    // models/itemModel.js
    status: {
      type: String,
      enum: ["AVAILABLE", "CLAIMED"],
      default: "AVAILABLE",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Item", itemSchema);
