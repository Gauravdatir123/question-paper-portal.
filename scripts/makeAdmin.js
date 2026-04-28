require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const existing = await User.findOne({ email: "admin@sppu.com" });
  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  const user = await User.create({
    name: "Admin",
    email: "admin@sppu.com",
    password: "Admin@1234",
    role: "admin"
  });

  console.log("Admin created:", user.email);
  process.exit();
});