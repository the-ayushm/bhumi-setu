import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate Limiting (MoRD API Guard)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', limiter);

// Request Parsing & Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🏛️  Ministry of Rural Development — Land Acquisition Engine`);
  console.log(`📡  Server active on: http://localhost:${PORT}/api/v1`);
  console.log(`🛡️  RFCTLARR Act 2013 Statutory Compliance: ACTIVE`);
  console.log(`========================================================`);
});

export default app;
