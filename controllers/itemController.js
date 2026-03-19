const itemModel = require("../models/itemModel");
const reportModel = require("../models/reportModel");
const { getIO } = require("../sockets/socket");
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");
const getItemCreationTemplate = require("../utils/itemCreationEmailTemplate");

//create item
const createItemController = async (req, res) => {
  try {
    const { itemName, description, imageUrl, itemType, question, location } =
      req.body || {};
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
    const item = await itemModel.create({
      itemName,
      description,
      imageUrl,
      itemType,
      question,
      location,
      user: req.user._id,
    });
    /////////////////////////////// SEND MAIL PART START //////////////////////////////
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
      console.log(err);
      console.log("Email failed but item saved");
    }
    /////////////////////////////// SEND MAIL PART END //////////////////////////////
    ////////////////////////////////  SOCKET PART START  //////////////////////////////////////////////////
    const io = getIO();

    // notify all users
    io.emit("newItem", {
      message: "New item posted",
      item,
    });

    // notify Admin
    io.to("admin").emit("adminNewItem", {
      message: "New item needs review",
      item,
    });
    ////////////////////////////////  SOCKET PART END  //////////////////////////////////////////////////

    res.status(201).send({
      success: true,
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      massage: "Error in Create Item API",
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
