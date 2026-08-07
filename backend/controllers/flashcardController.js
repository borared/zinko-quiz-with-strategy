const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const handleError = require('../lib/errorHandler');

const flashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
  hint: z.string().optional().nullable(),
  order_index: z.number().int()
});

const deckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  cover_image: z.string().optional().nullable(),
  flashcards: z.array(flashcardSchema).min(1, 'At least 1 flashcard is required'),
});

const createDeck = async (req, res) => {
  try {
    const parsed = deckSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const { title, flashcards, cover_image } = parsed.data;
    const creator_id = req.user.userId;

    const deck = await prisma.flashcard_decks.create({
      data: {
        title,
        cover_image,
        creator_id,
        flashcards: {
          create: flashcards.map(fc => ({
            front: fc.front,
            back: fc.back,
            hint: fc.hint,
            order_index: fc.order_index
          }))
        }
      },
      include: {
        flashcards: true
      }
    });

    res.status(201).json({ message: 'Flashcard deck saved successfully', deck });
  } catch (err) {
    handleError(res, 'Failed to save flashcard deck', err);
  }
};

const getDecksByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { cursor, limit } = req.query;
    const take = limit ? parseInt(limit, 10) : 12;

    const query = {
      where: { creator_id: userId },
      take: take + 1,
      include: {
        flashcards: true,
        creator: {
          select: { username: true, avatar_url: true }
        }
      },
      orderBy: { created_at: 'desc' }
    };

    if (cursor && cursor !== 'start') {
      query.cursor = { id: cursor };
      query.skip = 1;
    }

    const [decks, totalCount] = await Promise.all([
      prisma.flashcard_decks.findMany(query),
      prisma.flashcard_decks.count({ where: { creator_id: userId } })
    ]);

    let hasNextPage = false;
    let nextCursor = null;

    if (decks.length > take) {
      hasNextPage = true;
      const nextItem = decks.pop();
      nextCursor = nextItem.id;
    } else if (decks.length > 0) {
      nextCursor = decks[decks.length - 1].id;
    }

    res.json({
      flashcards: decks,
      totalCount,
      nextCursor,
      hasNextPage
    });
  } catch (err) {
    handleError(res, 'Failed to fetch flashcard decks', err);
  }
};

const getDeckById = async (req, res) => {
  try {
    const { deckId } = req.params;

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(deckId)) {
      return res.status(400).json({ error: 'Invalid flashcard deck ID format' });
    }
    const deck = await prisma.flashcard_decks.findUnique({
      where: { id: deckId },
      include: {
        flashcards: {
          orderBy: { order_index: 'asc' }
        },
        creator: {
          select: { username: true, avatar_url: true }
        }
      }
    });

    if (!deck) {
      return res.status(404).json({ error: 'Flashcard deck not found' });
    }

    res.json(deck);
  } catch (err) {
    handleError(res, 'Failed to fetch flashcard deck', err);
  }
};

module.exports = {
  createDeck,
  getDecksByUser,
  getDeckById
};
