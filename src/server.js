// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectMongoDB } from './db/connectMongoDB.js';
import logger from './middleware/logger.js';
import notFoundHandler from './middleware/notFoundHandler.js';
import errorHandler from './middleware/errorHandler.js';
import notesRouter from './routes/notesRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Global middleware =====
app.use(logger);        // pino-http
app.use(cors());
app.use(express.json());

// ===== Routes =====
app.use('/', notesRouter); // усі /notes... описані в notesRoutes.js

// *НЕ* використовуємо більше /test-error – видаляємо його з цього файлу

// 404 – після всіх роутів
app.use(notFoundHandler);

// Error handler – останній
app.use(errorHandler);

// ===== Start server only after DB connection =====
const startServer = async () => {
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start server', error);
  process.exit(1);
});
