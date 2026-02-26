const express = require("express");
const QuestionPaper = require("../models/QuestionPaper");

const router = express.Router();

// USER HOME + SEARCH
router.get("/", async (req, res) => {
  try {
    let filter = {};

    // Branch
    if (req.query.branch) {
      filter.branch = req.query.branch;
    }

    // Semester
    if (req.query.semester) {
      filter.semester = Number(req.query.semester);
    }

    // ✅ SUBJECT (FIXED)
    if (req.query.subject && req.query.subject.trim() !== "") {
      const subject = req.query.subject.trim();

      filter.subject = {
        $regex: subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i"
      };
    }

    const papers = await QuestionPaper.find(filter).sort({ year: -1 });

    res.render("home", {
      papers,
      isAdmin: false,
      filters: req.query   // 👈 IMPORTANT FOR KEEPING DATA
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading papers");
  }
});
// DOWNLOAD
router.get("/download/:id", async (req, res) => {
  const paper = await QuestionPaper.findById(req.params.id);

  if (!paper || !paper.pdfUrl) {
    return res.status(404).send("File not found");
  }

  // Redirect to Cloudinary PDF
  res.redirect(paper.pdfUrl);
});

module.exports = router;