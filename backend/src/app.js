import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/env.js';
import routes from './routes/index.js';
import errorMiddleware from './middleware/error.middleware.js';
import notFoundMiddleware from './middleware/not-found.middleware.js';

const app = express();

// Disable x-powered-by header
app.disable('x-powered-by');

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware
app.use(morgan('combined'));

// CORS middleware
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// API routes
app.use('/api/v1', routes);

// 404 middleware
app.use(notFoundMiddleware);

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
