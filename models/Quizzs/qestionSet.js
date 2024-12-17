const questionSetSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    name: { type: String, required: true },              
    easeQuestion: { type: Number, required: true },
    mediumQuestion: { type: Number, required: true },
    hardQuestion: { type: Number, required: true },                             
  }, { timestamps: true });
  
  module.exports = mongoose.model("QuestionSet", questionSetSchema);
  