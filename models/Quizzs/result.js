const { default: mongoose } = require("mongoose");

const resultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionSet_id: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionSet", required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
      selectedAnswer: { type: [String], required: false },
      isCorrect: { type: Boolean, required: true }
    }
  ],
  result: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
}, {
  timestamps: true
}
);

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;
