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

/* ========= HANDLE BULK UPLOAD ========= */
router.post("/upload", upload.array("pdfs"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded");
    }

    const years = Array.isArray(req.body.years)
      ? req.body.years
      : [req.body.years];

    // Build a map: each file belongs to which year row
    // files are ordered by row, multiple files per row possible
    const filesByRow = [];
    let fileIndex = 0;

    // We don't know how many files per row from backend
    // So we assign year based on order of inputs
    // years array length = number of rows
    // files are grouped per row in order

    const totalRows = years.length;
    const totalFiles = req.files.length;
    const filesPerRow = Math.ceil(totalFiles / totalRows);

    for (let i = 0; i < totalRows; i++) {
      const rowFiles = req.files.slice(i * filesPerRow, (i + 1) * filesPerRow);
      filesByRow.push({ year: years[i], files: rowFiles });
    }

    const uploadPromises = [];

    filesByRow.forEach(({ year, files }) => {
      files.forEach(file => {
        const promise = new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "raw" },
            async (error, result) => {
              if (error) return reject(error);
              try {
                await QuestionPaper.create({
                  university: req.body.university,
                  course: req.body.course,
                  academicYear: req.body.academicYear,
                  branch: req.body.branch,
                  semester: Number(req.body.semester),
                  subject: req.body.subject,
                  year: Number(year),
                  examType: req.body.examType,
                  pdfUrl: result.secure_url,
                  filename: file.originalname
                });
                resolve();
              } catch (err) {
                reject(err);
              }
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        uploadPromises.push(promise);
      });
    });

    await Promise.all(uploadPromises);
    res.redirect("/admin/papers");

  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed: " + err.message);
  }
});

/* ========= ADMIN DASHBOARD ========= */
router.get("/papers", async (req, res) => {
  try {
    const papers = await QuestionPaper.find().sort({ year: -1 });
    res.render("home", {
      papers,
      insemPapers: papers.filter(p => p.examType === "insem"),
      endsemPapers: papers.filter(p => p.examType === "endsem"),
      searched: false,
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