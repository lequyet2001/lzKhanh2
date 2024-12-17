const questionSchema = new mongoose.Schema({
    questionSetId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionSet", required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    createdAt: { type: Date, default: Date.now }
});
  
module.exports = mongoose.model("Question", questionSchema);
