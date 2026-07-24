const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const { requireCustomAuth } = require('../middleware/auth');
const { devOnly, aiLimiter } = require('../middleware/security');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed: PDF, DOCX, DOC, TXT'));
    }
  },
});

/**
 * @swagger
 * /api/ai/test:
 *   get:
 *     summary: GET /test
 *     tags: [Ai]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/test', devOnly, aiController.testAI);
/**
 * @swagger
 * /api/ai/generate-quiz:
 *   post:
 *     summary: POST /generate-quiz
 *     tags: [Ai]
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  '/generate-quiz',
  requireCustomAuth,
  aiLimiter,
  upload.single('file'),
  aiController.generateQuiz
);

module.exports = router;