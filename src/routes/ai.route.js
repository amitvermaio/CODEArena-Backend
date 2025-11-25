import express from "express";
const router = express.Router();
import { Server } from "socket.io";
import { generateContent } from "../services/ai.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

router.post('/bug-detector', async (req, res) => {
  const code = req.body.code;
  const bug = await generateContent(code);
  res.json(new ApiResponse(200, bug));
});

export default router;