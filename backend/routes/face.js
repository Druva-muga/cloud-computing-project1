const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const { verifyToken } = require("../middleware/auth.js"); // ✅ must resolve to a function

// Helper function for comparing faces
function euclideanDistance(desc1, desc2) {
  if (!Array.isArray(desc1) || !Array.isArray(desc2) || desc1.length !== desc2.length) {
    throw new Error("Invalid face descriptor format");
  }
  return Math.sqrt(desc1.reduce((acc, val, i) => acc + Math.pow(val - desc2[i], 2), 0));
}

// ✅ Register Face
router.post("/register-face", verifyToken, async (req, res) => {
  try {
    const { descriptor } = req.body;
    const userId = req.user.id;

    if (!descriptor) {
      return res.status(400).json({ message: "Missing face descriptor" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.faceDescriptor = descriptor;
    await user.save();

    res.json({ message: "✅ Face registered successfully!" });
  } catch (error) {
    console.error("Face registration error:", error);
    res.status(500).json({ message: "Server error during face registration" });
  }
});

// ✅ Verify Face and Mark Attendance
router.post("/verify-face", verifyToken, async (req, res) => {
  try {
    const { descriptor } = req.body;
    const userId = req.user.id;

    if (!descriptor) {
      return res.status(400).json({ message: "Missing face descriptor" });
    }

    const user = await User.findById(userId);
    if (!user || !user.faceDescriptor) {
      return res.status(404).json({ message: "Face not registered for this user" });
    }

    const distance = euclideanDistance(user.faceDescriptor, descriptor);
    console.log(`Face match distance: ${distance}`);

    if (distance < 0.45) {
      const today = new Date().toISOString().split("T")[0];
      await Attendance.findOneAndUpdate(
        { userId, date: today },
        { status: "Present (Face)" },
        { upsert: true, new: true }
      );

      res.json({ message: "✅ Face verified. Attendance marked!" });
    } else {
      res.status(401).json({ message: "❌ Face not recognized. Try again." });
    }
  } catch (error) {
    console.error("Face verification error:", error);
    res.status(500).json({ message: "Server error during face verification" });
  }
});

module.exports = router;
