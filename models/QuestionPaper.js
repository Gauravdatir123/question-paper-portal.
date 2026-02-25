const mongoose = require("mongoose");

const questionPaperSchema = new mongoose.Schema({
  university: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  branch: {                 // 👈 ADD THIS
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  pdf: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("QuestionPaper", questionPaperSchema);