const express = require("express");
const axios = require("axios");
const QuestionPaper = require("../models/QuestionPaper");

const router = express.Router();

// ================= USER HOME + SEARCH =================
router.get("/", async (req, res) => {
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

    // Split into insem and endsem
    const insemPapers = allPapers.filter(p => p.examType === "insem");
    const endsemPapers = allPapers.filter(p => p.examType === "endsem");

    // Check if user searched
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

// ================= DOWNLOAD =================
router.get("/download/:id", async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);

    if (!paper || !paper.pdfUrl || !paper.filename) {
      return res.status(404).send("File not found");
    }

    const response = await axios.get(paper.pdfUrl, {
      responseType: "arraybuffer"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${paper.filename}"`
    );

    res.send(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Download failed");
  }
});

module.exports = router;