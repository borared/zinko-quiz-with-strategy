const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/user');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ─── Webhooks (raw body — MUST come before express.json()) ───────────────────
// svix needs the raw request body to verify the signature
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

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Available routes:`);
  console.log(`   GET  /api/quizzes/user/:userId`);
  console.log(`   GET  /api/quizzes/:id`);
  console.log(`   POST /api/quizzes`);
  console.log(`   PUT  /api/quizzes/:id`);
});

