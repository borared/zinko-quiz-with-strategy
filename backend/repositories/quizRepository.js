const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const { isValidUuid } = require('../lib/uuid');
const { normalizeSearchTerm } = require('../lib/searchUtils');

const PUBLIC_QUIZ_INCLUDE = {
  questions: {
    orderBy: { order_index: 'asc' },
  },
  creator: {
    select: {
      clerk_id: true,
      first_name: true,
      last_name: true,
      username: true,
    },
  },
};

const mapQuestionInput = (q, index, quizId) => ({
  quiz_id: quizId,
  question_text: q.question_text || q.text || 'Untitled Question',
  image_url: q.image_url || q.image || null,
  answers: q.answers,
  order_index: index,
  round: q.round || 1,
});

const syncQuizQuestions = async (tx, quizId, questions = []) => {
  const existingQuestions = await tx.questions.findMany({
    where: { quiz_id: quizId },
    select: { id: true },
  });
  const existingIds = new Set(existingQuestions.map((q) => q.id));
  const keptIds = new Set();

  for (let index = 0; index < questions.length; index++) {
    const q = questions[index];
    const data = mapQuestionInput(q, index, quizId);
    const questionId = q.id != null ? String(q.id) : null;

    if (questionId && isValidUuid(questionId) && existingIds.has(questionId)) {
      await tx.questions.update({
        where: { id: questionId },
        data,
      });
      keptIds.add(questionId);
      continue;
    }

    const created = await tx.questions.create({ data });
    keptIds.add(created.id);
  }

  const idsToDelete = [...existingIds].filter((id) => !keptIds.has(id));
  if (idsToDelete.length > 0) {
    await tx.questions.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }
};

/**
 * Save a full quiz and its questions.
 */
const createQuiz = async (quizData) => {
  const { title, creator_id, questions, cover_image, is_public = false, is_cloned = false } = quizData;

  return prisma.$transaction(async (tx) => {
    const quiz = await tx.quizzes.create({
      data: {
        title,
        creator_id,
        cover_image: cover_image || null,
        is_public,
        is_cloned,
      },
    });

    if (questions?.length) {
      await tx.questions.createMany({
        data: questions.map((q, index) => mapQuestionInput(q, index, quiz.id)),
      });
    }

    return quiz;
  });
};

/**
 * Update an existing quiz and its questions (upsert by UUID, delete removed).
 */
const updateQuiz = async (id, quizData) => {
  const { title, questions, cover_image } = quizData;

  await prisma.$transaction(async (tx) => {
    await tx.quizzes.update({
      where: { id },
      data: {
        title,
        cover_image,
        updated_at: new Date(),
      },
    });

    await syncQuizQuestions(tx, id, questions || []);
  });
};

/**
 * Fetch a single quiz with its questions.
 */
const getQuizById = async (id) => {
  return prisma.quizzes.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order_index: 'asc' },
      },
    },
  });
};

/**
 * Fetch questions for a quiz, ordered for gameplay.
 */
const getQuestionsByQuizId = async (quizId) => {
  return prisma.questions.findMany({
    where: { quiz_id: quizId },
    orderBy: { order_index: 'asc' },
  });
};

/**
 * Fetch quizzes for a specific creator with cursor pagination.
 */
const getQuizzesByUserId = async (userId, cursor = null, limit = 10) => {
  const where = {
    creator_id: userId,
    ...(cursor ? { created_at: { lt: new Date(cursor) } } : {}),
  };

  const queries = [
    prisma.quizzes.findMany({
      where,
      include: {
        questions: {
          orderBy: { order_index: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit + 1,
    }),
  ];

  if (!cursor) {
    queries.push(prisma.quizzes.count({ where: { creator_id: userId } }));
  }

  const [data, totalCount] = await Promise.all(queries);

  const hasNextPage = data.length > limit;
  const quizzes = data.slice(0, limit);
  const nextCursor = hasNextPage ? quizzes[quizzes.length - 1].created_at?.toISOString() : null;

  return {
    quizzes,
    nextCursor,
    hasNextPage,
    ...(totalCount !== undefined && { totalCount }),
  };
};

/**
 * Debug: fetch all quizzes with creator info.
 */
const getAllQuizzesDebug = async () => {
  return prisma.quizzes.findMany({
    select: {
      id: true,
      title: true,
      creator_id: true,
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
  });
};

/**
 * Fetch public quizzes with cursor pagination and optional fuzzy title search.
 * Matches literal substrings and normalized titles (ignores spaces, hyphens, etc.).
 */
const getPublicQuizzes = async (cursor = null, limit = 10, searchQuery = null) => {
  const trimmedSearch = searchQuery?.trim();

  if (trimmedSearch) {
    const normalized = normalizeSearchTerm(trimmedSearch);
    const cursorDate = cursor ? new Date(cursor) : null;

    const rows =
      normalized.length > 0
        ? await prisma.$queryRaw`
            SELECT id, created_at
            FROM quizzes
            WHERE is_public = true
            ${cursorDate ? Prisma.sql`AND created_at < ${cursorDate}` : Prisma.empty}
            AND (
              title ILIKE ${`%${trimmedSearch}%`}
              OR REGEXP_REPLACE(LOWER(title), '[^a-z0-9]', '', 'g') LIKE ${`%${normalized}%`}
            )
            ORDER BY created_at DESC
            LIMIT ${limit + 1}
          `
        : await prisma.$queryRaw`
            SELECT id, created_at
            FROM quizzes
            WHERE is_public = true
            ${cursorDate ? Prisma.sql`AND created_at < ${cursorDate}` : Prisma.empty}
            AND title ILIKE ${`%${trimmedSearch}%`}
            ORDER BY created_at DESC
            LIMIT ${limit + 1}
          `;

    const hasNextPage = rows.length > limit;
    const pageRows = rows.slice(0, limit);
    const ids = pageRows.map((row) => row.id);

    if (!ids.length) {
      return { quizzes: [], nextCursor: null, hasNextPage: false };
    }

    const quizzes = await prisma.quizzes.findMany({
      where: { id: { in: ids } },
      include: PUBLIC_QUIZ_INCLUDE,
    });

    const orderMap = new Map(pageRows.map((row, index) => [row.id, index]));
    quizzes.sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id));

    const nextCursor = hasNextPage
      ? pageRows[pageRows.length - 1].created_at?.toISOString?.() ??
        new Date(pageRows[pageRows.length - 1].created_at).toISOString()
      : null;

    return { quizzes, nextCursor, hasNextPage };
  }

  const where = {
    is_public: true,
    ...(cursor ? { created_at: { lt: new Date(cursor) } } : {}),
  };

  const results = await prisma.quizzes.findMany({
    where,
    include: PUBLIC_QUIZ_INCLUDE,
    orderBy: { created_at: 'desc' },
    take: limit + 1,
  });

  const hasNextPage = results.length > limit;
  const quizzes = results.slice(0, limit);
  const nextCursor = hasNextPage ? quizzes[quizzes.length - 1].created_at?.toISOString() : null;

  if (!quizzes.length) {
    return { quizzes: [], nextCursor: null, hasNextPage: false };
  }

  return { quizzes, nextCursor, hasNextPage };
};

/**
 * Update the visibility of a quiz.
 */
const updateQuizVisibility = async (id, is_public) => {
  return prisma.quizzes.update({
    where: { id },
    data: {
      is_public,
      updated_at: new Date(),
    },
  });
};

/**
 * Delete a quiz (questions cascade via FK).
 */
const deleteQuiz = async (id) => {
  await prisma.quizzes.delete({ where: { id } });
  return true;
};

module.exports = {
  createQuiz,
  updateQuiz,
  getQuizById,
  getQuestionsByQuizId,
  getQuizzesByUserId,
  getAllQuizzesDebug,
  getPublicQuizzes,
  updateQuizVisibility,
  deleteQuiz,
};