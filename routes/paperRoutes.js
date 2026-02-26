const express = require("express");
const axios = require("axios");
const QuestionPaper = require("../models/QuestionPaper");

const router = express.Router();

// ================= USER HOME + SEARCH =================
router.get("/", async (req, res) => {
  try {
    let filter = {};

    if (req.query.branch) {
      filter.branch = req.query.branch;
    }

    if (req.query.semester) {
      filter.semester = Number(req.query.semester);
    }

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
      filters: req.query
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading papers");
  }
});

// ================= DOWNLOAD (FINAL & CORRECT) =================
router.get("/download/:id", async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);

    if (!paper || !paper.pdfUrl || !paper.filename) {
      return res.status(404).send("File not found");
    }

    // Fetch PDF from Cloudinary
    const response = await axios.get(paper.pdfUrl, {
      responseType: "arraybuffer"
    });

    // Tell browser this is a PDF file
    res.setHeader("Content-Type", "application/pdf");

    // Force correct filename
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${paper.filename}"`
    );

    // Send file buffer
    res.send(response.data);

  } catch (err) {
    console.error(err);
    res.status(500).send("Download failed");
  }
});

module.exports = router;