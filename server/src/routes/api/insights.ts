import { Router } from "express";
import { answerInsightsQuestion } from "../../services/insights.js";

export const insightsRouter = Router();

insightsRouter.post("/ask", async (req, res) => {
  const { question } = req.body as { question?: string };
  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Missing question" });
  }
  try {
    const answer = await answerInsightsQuestion(question.trim());
    res.json({ answer });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
