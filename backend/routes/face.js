const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const jwt = require("jsonwebtoken");

// verifyToken middleware (simple version)
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// Calculate Euclidean distance for face comparison
function euclideanDistance(d1, d2) {
  return Math.sqrt(d1.reduce((acc, val, i) => acc + Math.pow(val - d2[i], 2), 0));
}

// REGISTER FACE
router.post("/register-face", verifyToken, async (req, res) => {
  try {
    const { descriptor } = req.body;
    const userId = req.user.id;

    if (!descriptor) {
      return res.status(400).json({ message: "Descriptor missing" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.faceDescriptor = descriptor;
    await user.save();

    res.json({ message: "Face registered successfully!" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// VERIFY FACE & MARK ATTENDANCE
router.post("/verify-face", verifyToken, async (req, res) => {
  try {
    const { descriptor } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user || !user.faceDescriptor) {
      return res.status(404).json({ message: "Face not registered" });
    }

    const distance = euclideanDistance(user.faceDescriptor, descriptor);

    if (distance < 0.45) {
      const today = new Date().toISOString().split("T")[0];

      await Attendance.findOneAndUpdate(
        { userId, date: today },
        { status: "Present" },
        { upsert: true }
      );

      return res.json({ message: "Face verified. Attendance marked!" });
    }

    res.status(401).json({ message: "Face not recognized" });
  } catch (err) {
    console.error("Face verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
