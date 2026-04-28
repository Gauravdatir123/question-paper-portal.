const mongoose = require("mongoose");

const questionPaperSchema = new mongoose.Schema({
  university: { type: String, required: true },
  course: { type: String, required: true },
  academicYear: {
    type: String,
    enum: ["FE", "SE", "TE", "BE"],
    required: true
  },                                          // ← NEW
  branch: { type: String, required: true },
  semester: { type: Number, required: true },
  subject: { type: String, required: true },
  year: { type: Number, required: true },
  examType: {
    type: String,
    enum: ["insem", "endsem"],
    required: true,
    default: "endsem"
  },
  pdfUrl: { type: String, required: true },
  filename: { type: String, required: true }
});

module.exports = mongoose.model("QuestionPaper", questionPaperSchema);