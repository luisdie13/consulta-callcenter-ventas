import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ingestTextDocument } from '../services/documentIngestionService';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype !== 'text/plain' && !file.originalname.endsWith('.txt')) {
      cb(new Error('Only .txt files are allowed'), false);
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  '/ingest',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      if (req.file.size === 0) {
        res.status(400).json({ error: 'File is empty' });
        return;
      }

      const { title, category, tags } = req.body;

      if (!title || !category) {
        res.status(400).json({ error: 'title and category are required' });
        return;
      }

      const content = req.file.buffer.toString('utf-8');

      const documentIds = await ingestTextDocument(
        title,
        category,
        content,
        tags || '',
        req.file.originalname
      );

      res.status(200).json({
        message: 'Document ingested successfully',
        documentIds,
        fileName: req.file.originalname,
      });
    } catch (error) {
      console.error('Document ingestion error:', error);
      res.status(500).json({
        error: 'Failed to ingest document',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
