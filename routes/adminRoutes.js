const express = require("express");
const router = express.Router();
const streamifier = require("streamifier");

const QuestionPaper = require("../models/QuestionPaper");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

/* ========= UPLOAD PAGE ========= */
router.get("/upload", (req, res) => {
  res.render("admin/upload");
});

/* ========= HANDLE UPLOAD ========= */
router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    await QuestionPaper.create({
      university: req.body.university,
      course: req.body.course,
      academicYear: req.body.academicYear,   // ← NEW
      branch: req.body.branch,
      semester: Number(req.body.semester),
      subject: req.body.subject,
      year: Number(req.body.year),
      examType: req.body.examType,
      pdfUrl: result.secure_url,
      filename: req.file.originalname
    });

    res.redirect("/admin/papers");
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

/* ========= ADMIN DASHBOARD ========= */
router.get("/papers", async (req, res) => {
  try {
    const papers = await QuestionPaper.find().sort({ year: -1 });
    res.render("home", {
      papers,
      insemPapers: papers.filter(p => p.examType === "insem"),   // ← NEW
      endsemPapers: papers.filter(p => p.examType === "endsem"), // ← NEW
      searched: false,                                            // ← NEW
      isAdmin: true,
      filters: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading papers");
  }
});

/* ========= DELETE ========= */
router.post("/delete/:id", async (req, res) => {
  try {
    await QuestionPaper.findByIdAndDelete(req.params.id);
    res.redirect("/admin/papers");
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
});

module.exports = router;