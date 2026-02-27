require("dotenv").config(); // MUST be first

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ================= VIEW ENGINE ================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ================= NOTES ROUTE (FIX) ================= */
app.get("/notes", (req, res) => {
  res.render("notes", {
    notes: [],
    filters: {}
  });
});

/* ================= OTHER ROUTES ================= */
app.use("/admin", require("./routes/adminRoutes"));
app.use("/", require("./routes/paperRoutes"));

/* ================= MONGODB + SERVER ================= */
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log("✅ MongoDB Connected");

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error("❌ MongoDB connection failed");
  console.error(err);
});