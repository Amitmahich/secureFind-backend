const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const { findById } = require("../models/itemModel");
const itemModel = require("../models/itemModel");
const reportModel = require("../models/reportModel");
const { getIO } = require("../sockets/socket");
const { createDiffieHellmanGroup } = require("crypto");
const Response = require("../models/responseModel");

const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel
      .find({ _id: { $ne: req.user._id } }) // exclude yourself
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get all users API",
    });
  }
};
// delete user
const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID",
      });
    }
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    // Only self and admin can delete user
    if (req.user._id.toString() !== id && req.user.role !== "ADMIN") {
      return res.status(403).send({
        success: false,
        message: "Not authorized",
      });
    }
    //getting user's items first(for socket)
    const items = await itemModel.find({ user: id }).select("_id");
    const itemIds = items.map((i) => i._id);

    //delete related data
    await itemModel.deleteMany({ user: id });
    await reportModel.deleteMany({ reportedBy: id });
    await reportModel.deleteMany({ item: { $in: itemIds } });

    //delete user
    await user.deleteOne();

    ///////////////////////////////SOCKET END//////////////////////////////////
    const io = getIO();
    io.to("admin").emit("userDeleted", {
      userId: id,
      deleteItems: itemIds,
      message: "User and related data deleted",
    });
    /////////////////////////////////SOCKET END///////////////////////////////////////

    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in Delete user API",
    });
  }
};
// block / unblock user
const toggleBlockUserController = async (req, res) => {
  try {
    const { id } = req.params;

    // valid id check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // admin cannot block himself
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }
    // toggle block
    user.isBlocked = !user.isBlocked;
    await user.save();

    //////////////////////////////////SOCKET PART START/////////////////////////////
    const io = getIO();

    io.to("admin").emit("userBlockStatusChanged", {
      userId: id,
      isBlocked: user.isBlocked,
    });
    res.status(200).json({
      success: true,
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//get user phone
const getUserPhoneController = async (req, res) => {
  try {
    const { id } = req.params; // responder id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // check if approved response exists
    const approvedResponse = await Response.findOne({
      responder: id,
      status: "APPROVED",
    }).populate("item");

    if (!approvedResponse) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view phone",
      });
    }

    //ensure requester is item owner
    if (approvedResponse.item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // fetch user phone
    const user = await User.findById(id).select("name phone email");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsersController,
  deleteUserController,
  toggleBlockUserController,
  getUserPhoneController,
};
