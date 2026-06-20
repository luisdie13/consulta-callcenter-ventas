import { Router, Request, Response } from 'express';
import { handleQuery } from '../services/queryService';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'question field is required and must be a string' });
      return;
    }

    if (question.trim().length === 0) {
      res.status(400).json({ error: 'question cannot be empty' });
      return;
    }

    const result = await handleQuery(question);

    res.status(200).json(result);
  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      error: 'Failed to process query',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
