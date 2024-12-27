const { default: mongoose } = require("mongoose");

const resultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionSet_id: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionSet", required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  answers: [
    {
      question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
      selectedOption: { type: [Number], required: true },
      isCorrect: { type: Boolean, required: true }
    }
  ],
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
}, {
  timestamps: true
}
);

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;
