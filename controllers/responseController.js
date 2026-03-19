const responseModel = require("../models/responseModel");
const { getIO } = require("../sockets/socket");
const sendEmail = require("../utils/sendEmail");
const { getApprovalEmailTemplate } = require("../utils/approvalEmailTemplate");
const itemModel = require("../models/itemModel");

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
    // notify item owner
    const io = getIO();

    io.to(item.user.toString()).emit("newResponse", response);
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
module.exports = { submitAnswerController, updateResponseStatusController };
