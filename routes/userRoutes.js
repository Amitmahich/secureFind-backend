const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const {
  getAllUsersController,
  deleteUserController,
  toggleBlockUserController,
} = require("../controllers/userController");

const router = express.Router();

// get-all-users
router.get(
  "/get-all-users",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllUsersController,
);
//delete-user
router.delete("/delete-user/:id", authMiddleware, deleteUserController);
//blocked-unblocked user
router.patch(
  "/block-unblock-user/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  toggleBlockUserController,
);

module.exports = router;
