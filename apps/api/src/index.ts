import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'NekoKu API',
    time: new Date().toISOString(),
  });
});

// Mount API v1
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🐾 NekoKu API server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check at http://localhost:${PORT}/api/health`);
});
