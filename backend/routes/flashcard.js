const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const { requireCustomAuth } = require('../middleware/auth');

router.post('/', requireCustomAuth, flashcardController.createDeck);
router.get('/user/:userId', requireCustomAuth, flashcardController.getDecksByUser);
router.get('/:deckId', flashcardController.getDeckById);

module.exports = router;
