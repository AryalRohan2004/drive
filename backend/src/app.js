import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { openApiSpec } from './docs/openapi.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
// Raw body parser for Stripe webhook signature verification (must come before express.json)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
);

app.get('/', (_req, res) => {
  res.json({
    service: 'sanos-driving-backend',
    message: 'SANOS Driving School API',
    docs: '/api/health',
  });
});

app.get('/api/docs.json', (_req, res) => {
  res.json(openApiSpec);
});

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    explorer: true,
    customSiteTitle: 'SANOS Driving School API Docs',
    swaggerOptions: {
      url: '/api/docs.json',
    },
  })
);

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
