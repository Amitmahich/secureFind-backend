const responseModel = require("../models/responseModel");
const { getIO } = require("../sockets/socket");
const sendEmail = require("../utils/sendEmail");
const { getApprovalEmailTemplate } = require("../utils/approvalEmailTemplate");
const itemModel = require("../models/itemModel");

//get all responses
const getMyResponsesController = async (req, res) => {
  try {
    // items owned by user
    const items = await itemModel.find({ user: req.user._id }).select("_id");
    const itemIds = items.map((item) => item._id);

    // received (responses on my items)
    const received = await responseModel
      .find({ item: { $in: itemIds } })
      .populate("responder", "name email phone")
      .populate("item", "itemName user")
      .sort({ createdAt: -1 });

    // sent (responses I made)
    const sent = await responseModel
      .find({ responder: req.user._id })
      .populate("item", "itemName user")
      .sort({ createdAt: -1 });

    // hide phone if not approved
    received.forEach((r) => {
      if (r.status !== "APPROVED") {
        r.responder.phone = null;
      }
    });

    res.json({
      success: true,
      received,
      sent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// submit answer
const submitAnswerController = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { answer } = req.body || {};
    if (!answer) {
      return res.status(400).send({
        success: false,
        message: "Please provide answer",
      });
    }
    const item = await itemModel.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // own item check
    if (item.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot respond to your own item",
      });
    }
    const existingResponse = await responseModel.findOne({
      item: itemId,
      responder: req.user._id,
    });

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a response for this item",
      });
    }
    const response = await responseModel.create({
      item: itemId,
      responder: req.user._id,
      answer,
    });
    ////////////////////////////SOCKET START//////////////////////////
    const io = getIO();
    // populate before emit
    const populatedResponse = await responseModel
      .findById(response._id)
      .populate("item", "itemName user")
      .populate("responder", "name email");

    // notify item owner
    io.to(item.user.toString()).emit("newResponse", {
      response: populatedResponse,
    });
    //////////////////////SOCKET END//////////////////////////
    res.json({
      success: true,
      message: "Response submitted",
      response,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// update response
const updateResponseStatusController = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await responseModel
      .findById(id)
      .populate("item")
      .populate("responder");

    if (!response) {
      return res.status(404).json({
        message: "Response not found",
      });
    }

    // only item owner
    if (response.item.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    //already approved → no change allowed
    if (response.status === "APPROVED") {
      return res.status(400).json({
        message: "Already approved. Cannot change status.",
      });
    }

    // check if already someone approved
    const alreadyApproved = await responseModel.findOne({
      item: response.item._id,
      status: "APPROVED",
    });

    if (alreadyApproved) {
      return res.status(400).json({
        message: "Item already claimed",
      });
    }

    // approve
    response.status = "APPROVED";
    await response.save();
    /////////////////////////////SEND EMAIL START/////////////////////////////////////
    try {
      await sendEmail({
        to: response.responder.email,
        subject: "Your Claim is Approved 🎉",
        html: getApprovalEmailTemplate(
          response.responder.firstName + " " + response.responder.lastName,
          response.item.itemName,
          req.user.firstName + " " + req.user.lastName,
          req.user.mobile,
        ),
      });
    } catch (err) {
      console.log(err);
      console.log("Email failed but approval done");
    }
    ////////////////////////////////SEND EMAIL END

    // optionally mark item as claimed
    response.item.status = "CLAIMED";
    await response.item.save();
    //////////////////////////////////SOCKET PART START//////////////////////////////////
    // notify responder
    const io = getIO();

    io.to(response.responder._id.toString()).emit("responseApproved", {
      itemId: response.item._id,
      message: "Your response has been approved 🎉",
    });
    // notify owner also
    io.to(req.user._id.toString()).emit("responseUpdated", {
      responseId: response._id,
      status: "APPROVED",
    });
    //////////////////////////////////SOCKET PART END//////////////////////////////////

    res.json({
      success: true,
      message: "Response approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  submitAnswerController,
  updateResponseStatusController,
  getMyResponsesController,
};
