const express = require('express');
const { requireCustomAuth } = require('../middleware/auth');
const socialController = require('../controllers/socialController');

const router = express.Router();

router.get('/search', requireCustomAuth, socialController.searchUsers);
router.post('/request', requireCustomAuth, socialController.sendFriendRequest);
router.post('/accept', requireCustomAuth, socialController.acceptFriendRequest);
router.post('/reject', requireCustomAuth, socialController.rejectFriendRequest);
router.delete('/remove', requireCustomAuth, socialController.removeFriend);
router.get('/friends', requireCustomAuth, socialController.getFriends);
router.get('/requests', requireCustomAuth, socialController.getPendingRequests);

module.exports = router;
