const prisma = require('../lib/prisma');
const handleError = require('../lib/errorHandler');

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentClerkId = req.user.userId;

    if (!query || query.trim().length === 0) {
      return res.json({ users: [] });
    }

    const matchedUsers = await prisma.users.findMany({
      where: {
        username: {
          contains: query.trim(),
          mode: 'insensitive',
        },
        clerk_id: {
          not: currentClerkId,
        },
      },
      select: {
        clerk_id: true,
        username: true,
        first_name: true,
        last_name: true,
        avatar_url: true,
      },
      take: 10,
    });

    // Check relationship status for each matched user
    const userRelations = await Promise.all(
      matchedUsers.map(async (u) => {
        const friendship = await prisma.friendships.findFirst({
          where: {
            OR: [
              { user_id: currentClerkId, friend_id: u.clerk_id },
              { user_id: u.clerk_id, friend_id: currentClerkId },
            ],
          },
        });

        let relationship = 'none'; // 'none', 'friends', 'sent_pending', 'received_pending'
        if (friendship) {
          if (friendship.status === 'ACCEPTED') {
            relationship = 'friends';
          } else if (friendship.status === 'PENDING') {
            relationship = friendship.user_id === currentClerkId ? 'sent_pending' : 'received_pending';
          }
        }

        return {
          ...u,
          relationship,
        };
      })
    );

    res.json({ users: userRelations });
  } catch (error) {
    handleError(res, 'Failed to search users.', error);
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const currentClerkId = req.user.userId;
    const { targetClerkId } = req.body;

    if (!targetClerkId) {
      return res.status(400).json({ error: 'Target user clerk ID is required.' });
    }

    if (currentClerkId === targetClerkId) {
      return res.status(400).json({ error: 'You cannot add yourself.' });
    }

    const targetUser = await prisma.users.findUnique({
      where: { clerk_id: targetClerkId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check existing friendship
    const existing = await prisma.friendships.findFirst({
      where: {
        OR: [
          { user_id: currentClerkId, friend_id: targetClerkId },
          { user_id: targetClerkId, friend_id: currentClerkId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return res.status(400).json({ error: 'You are already friends.' });
      }
      if (existing.status === 'PENDING') {
        return res.status(400).json({ error: 'Friend request is already pending.' });
      }
    }

    // Create the request
    const friendship = await prisma.friendships.create({
      data: {
        user_id: currentClerkId,
        friend_id: targetClerkId,
        status: 'PENDING',
      },
    });

    // Notify the target user
    const currentUser = await prisma.users.findUnique({
      where: { clerk_id: currentClerkId },
      select: { username: true, first_name: true },
    });
    const senderName = currentUser.username || currentUser.first_name || 'Someone';

    await prisma.notifications.create({
      data: {
        user_id: targetClerkId,
        type: 'FRIEND_REQUEST',
        message: `${senderName} sent you a friend request.`,
        metadata: { senderClerkId: currentClerkId },
      },
    });

    res.status(201).json({ success: true, friendship });
  } catch (error) {
    handleError(res, 'Failed to send friend request.', error);
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const currentClerkId = req.user.userId;
    const { senderClerkId } = req.body;

    if (!senderClerkId) {
      return res.status(400).json({ error: 'Sender clerk ID is required.' });
    }

    const friendship = await prisma.friendships.findFirst({
      where: {
        user_id: senderClerkId,
        friend_id: currentClerkId,
        status: 'PENDING',
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Pending friend request not found.' });
    }

    await prisma.friendships.update({
      where: { id: friendship.id },
      data: {
        status: 'ACCEPTED',
        updated_at: new Date(),
      },
    });

    // Notify the sender that it was accepted
    const currentUser = await prisma.users.findUnique({
      where: { clerk_id: currentClerkId },
      select: { username: true, first_name: true },
    });
    const acceptorName = currentUser.username || currentUser.first_name || 'Someone';

    await prisma.notifications.create({
      data: {
        user_id: senderClerkId,
        type: 'FRIEND_ACCEPTED',
        message: `${acceptorName} accepted your friend request!`,
        metadata: { acceptorClerkId: currentClerkId },
      },
    });

    res.json({ success: true });
  } catch (error) {
    handleError(res, 'Failed to accept friend request.', error);
  }
};

const rejectFriendRequest = async (req, res) => {
  try {
    const currentClerkId = req.user.userId;
    const { senderClerkId } = req.body;

    if (!senderClerkId) {
      return res.status(400).json({ error: 'Sender clerk ID is required.' });
    }

    const friendship = await prisma.friendships.findFirst({
      where: {
        user_id: senderClerkId,
        friend_id: currentClerkId,
        status: 'PENDING',
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Pending friend request not found.' });
    }

    await prisma.friendships.delete({
      where: { id: friendship.id },
    });

    res.json({ success: true });
  } catch (error) {
    handleError(res, 'Failed to reject friend request.', error);
  }
};

const removeFriend = async (req, res) => {
  try {
    const currentClerkId = req.user.userId;
    const { friendClerkId } = req.body;

    if (!friendClerkId) {
      return res.status(400).json({ error: 'Friend clerk ID is required.' });
    }

    const friendship = await prisma.friendships.findFirst({
      where: {
        OR: [
          { user_id: currentClerkId, friend_id: friendClerkId, status: 'ACCEPTED' },
          { user_id: friendClerkId, friend_id: currentClerkId, status: 'ACCEPTED' },
        ],
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend connection not found.' });
    }

    await prisma.friendships.delete({
      where: { id: friendship.id },
    });

    res.json({ success: true });
  } catch (error) {
    handleError(res, 'Failed to remove friend.', error);
  }
};

const getFriends = async (req, res) => {
  try {
    const currentClerkId = req.user.userId;

    const friendships = await prisma.friendships.findMany({
      where: {
        OR: [
          { user_id: currentClerkId, status: 'ACCEPTED' },
          { friend_id: currentClerkId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: {
            clerk_id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
        friend: {
          select: {
            clerk_id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
      },
    });

    // Format output to return just friend objects
    const friendsList = friendships.map((f) => {
      return f.user_id === currentClerkId ? f.friend : f.user;
    });

    res.json({ friends: friendsList });
  } catch (error) {
    handleError(res, 'Failed to retrieve friends.', error);
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const currentClerkId = req.user.userId;

    // Incoming requests (people adding me)
    const incomingFriendships = await prisma.friendships.findMany({
      where: {
        friend_id: currentClerkId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            clerk_id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
      },
    });

    // Outgoing requests (people I added)
    const outgoingFriendships = await prisma.friendships.findMany({
      where: {
        user_id: currentClerkId,
        status: 'PENDING',
      },
      include: {
        friend: {
          select: {
            clerk_id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
      },
    });

    res.json({
      incoming: incomingFriendships.map((f) => f.user),
      outgoing: outgoingFriendships.map((f) => f.friend),
    });
  } catch (error) {
    handleError(res, 'Failed to retrieve pending requests.', error);
  }
};

module.exports = {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
};
