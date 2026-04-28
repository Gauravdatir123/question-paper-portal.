// ================= ENV (must be first) =================
require("dotenv").config();

// ================= IMPORTS =================
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const { attachUser, requireAdmin } = require("./middleware/auth");
const QuestionPaper = require("./models/QuestionPaper");
const User = require("./models/User");

// ================= APP INIT =================
const app = express();

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= SESSION =================
app.use(session({
  secret: process.env.SESSION_SECRET || "sppu_secret_change_this",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

// ================= ATTACH USER TO ALL VIEWS =================
app.use(attachUser);

// ================= ROUTES =================
app.get("/health", (req, res) => res.status(200).send("OK"));

app.get("/about", (req, res) => res.render("about"));

app.get("/notes", (req, res) => {
  res.render("notes", { notes: [], filters: {} });
});

// ================= LANDING PAGE =================
app.get("/", async (req, res) => {
  try {
    const totalPapers = await QuestionPaper.countDocuments();
    const totalUsers = await User.countDocuments();
    res.render("landing", { totalPapers, totalUsers });
  } catch (err) {
    console.error(err);
    res.render("landing", { totalPapers: 0, totalUsers: 0 });
  }
});

// ================= PAPERS PAGE =================
app.get("/papers", async (req, res) => {
  try {
    let filter = {};

    if (req.query.branch) filter.branch = req.query.branch;
    if (req.query.semester) filter.semester = Number(req.query.semester);

    if (req.query.subject && req.query.subject.trim() !== "") {
      const subject = req.query.subject.trim();
      filter.subject = {
        $regex: subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i"
      };
    }

    const allPapers = await QuestionPaper.find(filter).sort({ year: -1 });
    const insemPapers = allPapers.filter(p => p.examType === "insem");
    const endsemPapers = allPapers.filter(p => p.examType === "endsem");
    const searched = Object.keys(req.query).some(k => req.query[k] !== "");

    res.render("home", {
      papers: allPapers,
      insemPapers,
      endsemPapers,
      searched,
      isAdmin: req.session.userRole === "admin",
      filters: req.query
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading papers");
  }
});

// ================= AUTH + ADMIN ROUTES =================
app.use("/", require("./routes/authRoutes"));
app.use("/admin", requireAdmin, require("./routes/adminRoutes"));
app.use("/", require("./routes/paperRoutes"));

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed");
    console.error(err.message);
  });

// ================= SAFETY =================
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});