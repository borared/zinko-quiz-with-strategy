const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { clerkMiddleware } = require('@clerk/express');
require('dotenv').config();

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
  'http://172.23.1.212:3000'
].filter(Boolean);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: FRONTEND_URLS,
  credentials: true,
}));

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URLS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initSocketHandler(io);

// ─── Webhooks (raw body — MUST come before express.json()) ───────────────────
app.use('/api/webhooks', webhookRoutes);

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Request Logger ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// ─── Clerk Middleware ─────────────────────────────────────────────────────────
app.use(clerkMiddleware());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Zinko API is running.' });
});

// Debug endpoint to check Clerk user ID
app.get('/api/debug/me', (req, res) => {
  const { getAuth } = require('@clerk/express');
  const { userId } = getAuth(req);
  res.json({
    clerkUserId: userId || 'Not authenticated',
    message: 'This is your current Clerk user ID. Compare it with the creator_id in your database.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', require('./routes/ai'));
app.use('/api/quizzes', require('./routes/quiz'));
app.use('/api/avatars', require('./routes/avatar'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/game', gameRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack || err.message || err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.'
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT} and http://172.23.1.212:${PORT}`);
  console.log(`🔌 Socket.io attached and listening`);
  console.log(`📊 Available routes:`);
  console.log(`   GET  /api/quizzes/user/:userId`);
  console.log(`   GET  /api/quizzes/:id`);
  console.log(`   POST /api/quizzes`);
  console.log(`   PUT  /api/quizzes/:id`);
  console.log(`   POST /api/game/host`);
  console.log(`   GET  /api/game/:pin`);
});
