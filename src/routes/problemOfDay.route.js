import express from "express";
import { ProblemOfDay } from "../models/problem/problemOfDay.model.js";
import Problem from "../models/problem/problem.model.js";

const router = express.Router();


const todayDate = () => new Date().toISOString().split("T")[0];

router.get("/", async (req, res) => {
  try {
    const today = todayDate();

    // Check if already exists
    let pod = await ProblemOfDay.findOne({ date: today }).populate("problemId");

    if (!pod) {
      // Pick random problem
      const count = await Problem.countDocuments();
      const random = Math.floor(Math.random() * count);
      const randomProblem = await Problem.findOne().skip(random);

      // Save it
      pod = new ProblemOfDay({
        problemId: randomProblem._id,
        date: today,
      });
      await pod.save();

      pod = await pod.populate("problemId");
    }

    res.json(pod.problemId);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

export default router;