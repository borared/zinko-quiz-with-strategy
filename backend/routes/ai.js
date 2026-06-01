const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * GET /api/ai/test
 */
router.get('/test', aiController.testAI);

/**
 * POST /api/ai/generate-quiz
 */
router.post('/generate-quiz', upload.single('file'), aiController.generateQuiz);

module.exports = router;
