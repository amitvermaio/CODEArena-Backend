import mongoose from "mongoose";

const problemOfDaySchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
  date: { type: String, unique: true, default: Date.now }, 
});

const ProblemOfDay = mongoose.model("ProblemOfDay", problemOfDaySchema);

export { ProblemOfDay };
