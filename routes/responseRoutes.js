const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  submitAnswerController,
  updateResponseStatusController,
  getMyResponsesController,
} = require("../controllers/responseController");

//get item responses
router.get("/get-my-responses", authMiddleware, getMyResponsesController);
//submit answer
router.post("/submit-answer/:itemId", authMiddleware, submitAnswerController);
//update response
router.patch(
  "/approve-response/:id",
  authMiddleware,
  updateResponseStatusController,
);

module.exports = router;
