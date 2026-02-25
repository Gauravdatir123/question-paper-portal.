const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const QuestionPaper = require("../models/QuestionPaper");

const router = express.Router();

/* ========= MULTER ========= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/* ========= ROUTES ========= */

// UPLOAD PAGE
router.get("/upload", (req, res) => {
  res.render("admin/upload");
});

// HANDLE UPLOAD
router.post("/upload", upload.single("pdf"), async (req, res) => {
  const paper = new QuestionPaper({
    university: req.body.university,
    course: req.body.course,
    branch: req.body.branch,
    semester: Number(req.body.semester),
    subject: req.body.subject,
    year: Number(req.body.year),
    pdf: req.file.filename
  });

  await paper.save();
  res.redirect("/admin/papers");
});

// ADMIN DASHBOARD (DELETE VISIBLE)
router.get("/papers", async (req, res) => {
  const papers = await QuestionPaper.find().sort({ year: -1 });

  res.render("home", {
  papers,
  isAdmin: true,
  filters: {}   // ⭐ ADD THIS LINE
});
});

// DELETE
router.post("/delete/:id", async (req, res) => {
  const paper = await QuestionPaper.findById(req.params.id);

  if (paper) {
    const filePath = path.join(__dirname, "..", "uploads", paper.pdf);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await QuestionPaper.findByIdAndDelete(req.params.id);
  }

  res.redirect("/admin/papers");
});

module.exports = router;