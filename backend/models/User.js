const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "employee"], default: "employee" },
  faceDescriptor: { type: [Number], default: [] }, // ✅ Added for face recognition
});

module.exports = mongoose.model("User", UserSchema);
