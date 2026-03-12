const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getProfile,
  updateProfile
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// ================= ADMIN =================
router.get("/", protect, admin, getAllUsers);
router.delete("/:id", protect, admin, deleteUser);

// ================= USER =================
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;