import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import documentRoutes from './routes/documentRoutes';
import queryRoutes from './routes/queryRoutes';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/documents', documentRoutes);
app.use('/api/query', queryRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
