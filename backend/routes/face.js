const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const jwt = require("jsonwebtoken");

// -------------------- TOKEN CHECK --------------------
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// -------------------- FORMAT FIX --------------------
// Convert descriptor object → flat numeric array
function convertDescriptor(desc) {
  // If descriptor is already an array: OK
  if (Array.isArray(desc)) return desc.map(Number);

  // If descriptor is an object (0,1,2 keys): convert to array
  return Object.keys(desc)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => Number(desc[k]));
}

// -------------------- REGISTER FACE --------------------
router.post("/register-face", verifyToken, async (req, res) => {
  try {
    let { descriptor } = req.body;
    const userId = req.user.id;

    if (!descriptor)
      return res.status(400).json({ message: "Descriptor missing" });

    // Convert incorrect descriptor into proper array
    descriptor = convertDescriptor(descriptor);

    // Must be 128 numbers
    if (descriptor.length !== 128) {
      return res.status(400).json({
        message: `Invalid descriptor length: ${descriptor.length}, expected 128`
      });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.faceDescriptor = descriptor;
    await user.save();

    res.json({ message: "Face registered successfully!" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- VERIFY FACE --------------------
function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}

router.post("/verify-face", verifyToken, async (req, res) => {
  try {
    let { descriptor } = req.body;
    const userId = req.user.id;

    descriptor = convertDescriptor(descriptor);

    if (descriptor.length !== 128)
      return res.status(400).json({ message: "Invalid descriptor length" });

    const user = await User.findById(userId);
    if (!user || !user.faceDescriptor.length) {
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

    return res.status(401).json({ message: "Face not recognized" });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
