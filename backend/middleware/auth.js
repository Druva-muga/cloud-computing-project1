const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify ANY logged-in user
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store user id + role
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Verify ONLY admin
const verifyAdmin = async (req, res, next) => {
  verifyToken(req, res, async () => {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    next();
  });
};

module.exports = { verifyToken, verifyAdmin };
