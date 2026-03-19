const itemModel = require("../models/itemModel");
const Notification = require("../models/notificationModel");
const reportModel = require("../models/reportModel");
const { getIO } = require("../sockets/socket");
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");
const getItemCreationTemplate = require("../utils/itemCreationEmailTemplate");
const userModel = require("../models/userModel");

//create item
const createItemController = async (req, res) => {
  try {
    const { itemName, description, imageUrl, itemType, question, location } =
      req.body || {};

    // validation
    if (
      !itemName ||
      !description ||
      !imageUrl ||
      !itemType ||
      !question ||
      !location
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // create item
    const item = await itemModel.create({
      itemName,
      description,
      imageUrl,
      itemType,
      question,
      location,
      user: req.user._id,
    });

    ////////////////// EMAIL //////////////////
    try {
      await sendEmail({
        to: req.user.email,
        subject: "Item Submitted Successfully 🎉",
        html: getItemCreationTemplate(
          req.user.firstName + " " + req.user.lastName,
          item.itemName,
          item.location,
          item.itemType,
        ),
      });
    } catch (err) {
      console.log("Email failed but item saved");
    }

    ////////////////// SOCKET //////////////////
    const io = getIO();

    // creator (MyListings)
    io.to(req.user._id.toString()).emit("myItemCreated", item);

    // dashboard (all users)
    io.emit("newItem", {
      message: "New item posted",
      item,
    });

    ////////////////// NOTIFICATIONS //////////////////

    // get all users except creator
    const users = await userModel.find({
      _id: { $ne: req.user._id },
    });

    // create + send notifications
    await Promise.all(
      users.map(async (user) => {
        const notification = await Notification.create({
          user: user._id,
          message: `${req.user.firstName} ${req.user.lastName} posted: ${item.itemName}`,
          itemId: item._id,
          itemType: item.itemType,
          type: "ITEM_CREATED",
        });

        // send to that specific user
        io.to(user._id.toString()).emit("newNotification", notification);
      }),
    );

    ////////////////// ADMIN //////////////////
    io.to("admin").emit("adminNewItem", {
      message: "New item needs review",
      item,
    });

    ////////////////// RESPONSE //////////////////
    res.status(201).send({
      success: true,
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Create Item API",
    });
  }
};
//get all items
const getItemsController = async (req, res) => {
  try {
    const { search = "", type = "all" } = req.query;

    let query = {
      isBlocked: false,
    };

    // Search (name + description)
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    //  Filter (lost / found)
    if (type.toLowerCase() === "lost") {
      query.itemType = "LOST";
    } else if (type.toLowerCase() === "found") {
      query.itemType = "FOUND";
    }

    const items = await itemModel.find(query).sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//get single item
const getSingleItemController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid item ID",
      });
    }
    const item = await itemModel
      .findById(id)
      .populate("user", "firstName lastName email");

    if (!item) {
      return res.status(404).send({
        success: false,
        message: "Item not found",
      });
    }
    if (item.isBlocked) {
      return res.status(403).send({
        success: false,
        message: "This item is blocked",
      });
    }
    res.status(200).send({
      success: true,
      item,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in Get single item API",
    });
  }
};
//get own items
const getMyItems = async (req, res) => {
  try {
    const userId = req.user._id;

    const items = await itemModel
      .find({
        user: userId,
      })
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get my Items API",
    });
  }
};
// delete item
const deleteItemController = async (req, res) => {
  try {
    const { id } = req.params;

    // check valid id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    const item = await itemModel.findById(id);

    // item not found
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // check ownership OR admin
    if (
      item.user.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this item",
      });
    }

    // delete item
    await item.deleteOne();
    //  SOCKET EMIT
    const io = getIO();

    // admin ko notify
    io.to("admin").emit("itemDeleted", {
      itemId: id,
    });

    // sab users ko notify (optional but recommended)
    io.emit("itemDeleted", {
      itemId: id,
    });

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// get item reports
const getItemReportsController = async (req, res) => {
  try {
    const { id } = req.params; // itemId

    // valid id check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    const reports = await reportModel
      .find({ item: id })
      .populate("reportedBy", "firstName lastName email") // user details
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createItemController,
  getItemsController,
  getSingleItemController,
  getMyItems,
  deleteItemController,
  getItemReportsController,
};
