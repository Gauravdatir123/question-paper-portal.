// ================= ENV (must be first) =================
require("dotenv").config();

// ================= IMPORTS =================
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

// ================= APP INIT =================
const app = express();

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= ROUTES =================

// Health check (important for Railway debugging)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
app.get("/about", (req, res) => {
  res.render("about");
});
// Notes route
app.get("/notes", (req, res) => {
  res.render("notes", {
    notes: [],
    filters: {}
  });
});

// Other routes
app.use("/admin", require("./routes/adminRoutes"));
app.use("/", require("./routes/paperRoutes"));

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

// 🚀 START SERVER FIRST (CRITICAL FOR RAILWAY)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed");
    console.error(err.message);
  });

// ================= SAFETY =================
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});