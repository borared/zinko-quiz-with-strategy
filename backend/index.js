const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const { clerkMiddleware } = require('@clerk/express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { validateEnv } = require('./lib/envValidation');
const { generalLimiter, devOnly } = require('./middleware/security');

validateEnv();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const webhookRoutes = require('./routes/webhooks');
const gameRoutes = require('./routes/game');

const { initSocketHandler } = require('./lib/socketHandler');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

const FRONTEND_URLS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: FRONTEND_URLS,
  credentials: true,
}));

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URLS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initSocketHandler(io);

// ─── Webhooks (raw body — MUST come before express.json()) ────────────────────
app.use('/api/webhooks', webhookRoutes);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));

// ─── Request Logger (development only) ────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
  });
}

// ─── Clerk Middleware ───────────────────────────────────────────────────────────
// Conditionally apply clerk middleware to prevent crashing if keys are missing
if (process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware());
} else {
  console.warn('⚠️ CLERK_SECRET_KEY is missing. Running in Auth-Bypass mode.');
  app.use((req, res, next) => {
    // Mock the clerk auth object to prevent getAuth() from throwing if used
    req.auth = { userId: null, sessionId: null };
    next();
  });
}

// ─── Swagger API Documentation ────────────────────────────────────────────────
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Zinko API is running.' });
});

app.get('/api/debug/me', devOnly, (req, res) => {
  const { getAuth } = require('@clerk/express');
  const { userId } = getAuth(req);
  res.json({
    clerkUserId: userId || 'Not authenticated',
    message: 'Development-only debug endpoint.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', require('./routes/ai'));
app.use('/api/quizzes', require('./routes/quiz'));
app.use('/api/flashcards', require('./routes/flashcard'));
app.use('/api/avatars', require('./routes/avatar'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/sceneries', require('./routes/scenery'));
app.use('/api/shop', require('./routes/shop'));
app.use('/api/social', require('./routes/social'));
app.use('/api/picture-races', require('./routes/pictureRace'));
app.use('/api/game', gameRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
  }
  if (err?.message?.includes('Unsupported file type')) {
    return res.status(400).json({ error: err.message });
  }

  console.error('Server Error:', err.stack || err.message || err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV !== 'production' ? err.message : 'Something went wrong.',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const HOST = '0.0.0.0';

function shutdown(signal) {
  console.log(`\n${signal} received. Closing server...`);
  io.close(() => {
    httpServer.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error('Run: npm run free-port');
    console.error('Or:  npm run dev (frees the port automatically)');
    process.exit(1);
  }
  throw err;
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log('Socket.io attached and listening');
});