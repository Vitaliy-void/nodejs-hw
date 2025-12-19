// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';

dotenv.config();

const app = express();

// порт з .env або 3000 за замовчуванням
const PORT = process.env.PORT || 3000;

// ===== Глобальні middleware =====
app.use(cors());
app.use(express.json());
app.use(pinoHttp()); // БЕЗ pino-pretty, просто стандартний логер

// ===== Маршрути =====

// GET /notes — всі нотатки
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

// GET /notes/:noteId — одна нотатка за ID
app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;

  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

// тестовий маршрут, який кидає помилку
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// ===== 404 middleware =====
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// ===== middleware для помилок (500) =====
app.use((err, req, res, next) => {
  // pino-http додає log на req, але це не обовʼязково
  if (req.log) {
    req.log.error(err);
  } else {
    console.error(err);
  }

  res.status(500).json({
    message: err.message || 'Internal server error',
  });
});

// ===== Запуск сервера =====
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
