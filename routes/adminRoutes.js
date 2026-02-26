const express = require("express");
const router = express.Router();
const streamifier = require("streamifier");

const QuestionPaper = require("../models/QuestionPaper");
const upload = require("../middleware/upload"); // memory storage
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

    // Upload PDF to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw" }, // REQUIRED for PDFs
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    // Save ONLY Cloudinary URL in MongoDB
    await QuestionPaper.create({
  university: req.body.university,
  course: req.body.course,
  branch: req.body.branch,
  semester: Number(req.body.semester),
  subject: req.body.subject,
  year: Number(req.body.year),

  pdfUrl: result.secure_url,
  filename: req.file.originalname   // ✅ THIS MATCHES YOUR MODEL
});

    res.redirect("/admin/papers");
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

/* ========= ADMIN DASHBOARD ========= */
router.get("/papers", async (req, res) => {
  const papers = await QuestionPaper.find().sort({ year: -1 });

  res.render("home", {
    papers,
    isAdmin: true,
    filters: {}
  });
});

/* ========= DELETE ========= */
router.post("/delete/:id", async (req, res) => {
  await QuestionPaper.findByIdAndDelete(req.params.id);
  res.redirect("/admin/papers");
});

module.exports = router;