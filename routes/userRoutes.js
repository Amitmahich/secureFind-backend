const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const {
  getAllUsersController,
  deleteUserController,
  toggleBlockUserController,
  getUserPhoneController,
  getAllUnblockedUsersController,
  getAllBlockedUsersController,
} = require("../controllers/userController");
const getAdminStats = require("../controllers/adminController");

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
// get blocked users
router.get(
  "/blocked-users",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllBlockedUsersController,
);

// get unblocked users
router.get(
  "/unblocked-users",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllUnblockedUsersController,
);
//get user phone
router.get("/user-phone/:id", authMiddleware, getUserPhoneController);
// get admin stats
router.get("/stats", authMiddleware, authorizeRoles("ADMIN"), getAdminStats);
module.exports = router;
