const { default: mongoose } = require("mongoose");

const resultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },                
    questionSetId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionSet", required: true }, 
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },           
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },   
        selectedOption: { type: [Number], required: true },                                       
        isCorrect: { type: Boolean, required: true }                                            
      }
    ],
    totalQuestions: { type: Number, required: true },                                           
    correctAnswers: { type: Number, required: true },                                           
    score: { type: Number, required: true },                                                    
    completedAt: { type: Date, default: Date.now }                                              
  });
  
  module.exports = mongoose.model("Result", resultSchema);
  