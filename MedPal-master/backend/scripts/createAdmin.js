const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User"); // rruga drejt modelit

async function createAdmin() {
  await mongoose.connect("mongodb://localhost:27017/your-db-name");
  const hashed = await bcrypt.hash("adminpass", 10);
  const admin = new User({
    name: "Super Admin",
    email: "gentamehanaaa@example.com",
    password: hashed,
    role: "admin",
    isVerified: true,
  });
  await admin.save();
  console.log("Admin user created");
  mongoose.disconnect();
}
createAdmin();
