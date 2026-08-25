import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import 'dotenv/config';
import { connectToMongoDB, startServer } from './utils.js';
import { authRouter } from './routes/auth.routes.js';
import { gardensRouter } from './routes/gardens.routes.js';
import { irrigationLinesRouter } from './routes/irrigationLines.routes.js';
import { irrigationRouter } from './routes/irrigation.routes.js';
import { uploadsRouter } from './routes/uploads.routes.js';
import cors from 'cors';
import helmet from 'helmet';
import { requireAuth } from './middleware/requireAuth.js';
import { assertR2Configuration } from './utils/r2.js';

const configuredOrigins =
  process.env.FRONTEND_URL || process.env.frontendUrl || 'http://localhost:5173,http://127.0.0.1:5173';

function normalizeOrigin(origin: string) {
  const trimmed = origin.trim().replace(/^['\"]|['\"]$/g, '');

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/$/, '');
  }
}

const allowedOrigins = configuredOrigins
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const uploadsDirectory = path.resolve(import.meta.dirname, '../uploads');

function isLocalDevOrigin(origin: string) {
  try {
    const url = new URL(normalizeOrigin(origin));
    return url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  } catch {
    return false;
  }
}

// create a new express application
const app = express();

// helmet is a middleware that helps to secure the express application by setting various HTTP headers
app.use(helmet());

// cors is a middleware that allows the express application to accept requests from the frontend specifically
// the origin is the URL of the frontend
// credentials: true means that the browser will send the credentials (cookies, authentication tokens, etc.) to the backend
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools/requests without browser origin (e.g., curl, Postman).
      if (!origin) return callback(null, true);
      const normalizedOrigin = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
      if (isLocalDevOrigin(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

// express.json() is a middleware that parses the request body and makes it available in req.body
app.use(express.json());

// express.urlencoded() is a middleware that parses the request body and makes it available in req.body
// extended: true means that the parser will support nested objects and arrays
app.use(express.urlencoded({ extended: true }));

const apiRouter = express.Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ ok: true });
});

apiRouter.use('/auth', authRouter);
apiRouter.use(requireAuth);

apiRouter.use('/uploads', uploadsRouter);
apiRouter.use('/gardens', gardensRouter);
apiRouter.use('/gardens/:gardenId/lines', irrigationLinesRouter);
apiRouter.use('/irrigation', irrigationRouter);

app.use('/api', apiRouter);

// Cross-Origin-Resource-Policy must be 'cross-origin' so browsers on the frontend
// origin can load images served from this backend origin (helmet sets same-origin by default).
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDirectory));

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// error handler (must be last)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// get the port and uri from the environment variables
const port = Number(process.env.PORT) || 3000;
const uri = process.env.MONGODB_URI;

// main function to start the server
async function main() {
  if (!uri) throw new Error('MONGODB_URI is not set');
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  if (process.env.NODE_ENV === 'production') {
    assertR2Configuration();
  }

  await connectToMongoDB(uri);

  await startServer(app, port);
  console.log(`✅ Server is running on port ${port}! 🚀`);
}

// catch any errors and exit the process
main().catch((error) => {
  console.error(`❌ Failed to start: ${error}`);
  process.exit(1);
});
