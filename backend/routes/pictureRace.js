const express = require('express');
const router = express.Router();
const { requireCustomAuth } = require('../middleware/auth');
const { createRace, getUserRaces, getRaceById, updateRace, deleteRace } = require('../controllers/pictureRaceController');

router.post('/', requireCustomAuth, createRace);
router.get('/user/:userId', requireCustomAuth, getUserRaces);
router.get('/:id', requireCustomAuth, getRaceById);
router.put('/:id', requireCustomAuth, updateRace);
router.delete('/:id', requireCustomAuth, deleteRace);

module.exports = router;
