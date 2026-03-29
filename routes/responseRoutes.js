const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  submitAnswerController,
  updateResponseStatusController,
  getMyResponsesController,
} = require("../controllers/responseController");
const { checkBlocked } = require("../middleware/checkBlocked");

//get item responses
router.get("/get-my-responses", authMiddleware, getMyResponsesController);
//submit answer
router.post(
  "/submit-answer/:itemId",
  authMiddleware,
  checkBlocked,
  submitAnswerController,
);
//update response
router.patch(
  "/approve-response/:id",
  authMiddleware,
  checkBlocked,
  updateResponseStatusController,
);

module.exports = router;
