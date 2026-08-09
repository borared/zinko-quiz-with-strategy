const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const { isValidUuid } = require('../lib/uuid');

const TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 60_000,
};

const createPictureRace = async (raceData) => {
  const {
    title,
    creator_id,
    questions,
    cover_image,
  } = raceData;

  return prisma.$transaction(async (tx) => {
    const race = await tx.picture_races.create({
      data: {
        title,
        creator_id,
        cover_image: cover_image || null,
      },
    });

    if (questions?.length) {
      await tx.picture_race_questions.createMany({
        data: questions.map((q, index) => ({
          game_id: race.id,
          question: q.question || null,
          original_image: q.original_image || null,
          image_url: q.image_url,
          answer: q.answer,
          crop_data: q.crop_data || null,
          order_index: index,
        })),
      });
    }

    return race;
  }, TRANSACTION_OPTIONS);
};

const getPictureRacesByUserId = async (userId) => {
  return prisma.picture_races.findMany({
    where: { creator_id: userId },
    include: {
      questions: {
        orderBy: { order_index: 'asc' },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

const getPictureRaceById = async (id, userId) => {
  if (!isValidUuid(id)) return null;
  return prisma.picture_races.findFirst({
    where: { 
      id,
      creator_id: userId
    },
    include: {
      questions: {
        orderBy: { order_index: 'asc' },
      },
    },
  });
};

const updatePictureRace = async (id, userId, raceData) => {
  if (!isValidUuid(id)) throw new Error('Invalid UUID');
  const { title, questions, cover_image } = raceData;

  return prisma.$transaction(async (tx) => {
    // Verify ownership
    const existing = await tx.picture_races.findFirst({
      where: { id, creator_id: userId }
    });
    if (!existing) throw new Error('Race not found or unauthorized');

    const race = await tx.picture_races.update({
      where: { id },
      data: {
        title,
        cover_image: cover_image || null,
      },
    });

    if (questions?.length) {
      // Clear old questions
      await tx.picture_race_questions.deleteMany({
        where: { game_id: id }
      });
      // Insert new questions
      await tx.picture_race_questions.createMany({
        data: questions.map((q, index) => ({
          game_id: id,
          question: q.question || null,
          original_image: q.original_image || null,
          image_url: q.image_url,
          answer: q.answer,
          crop_data: q.crop_data || null,
          order_index: index,
        })),
      });
    }

    return race;
  }, TRANSACTION_OPTIONS);
};

const deletePictureRace = async (id, userId) => {
  if (!isValidUuid(id)) throw new Error('Invalid UUID');
  
  return prisma.$transaction(async (tx) => {
    const existing = await tx.picture_races.findFirst({
      where: { id, creator_id: userId }
    });
    if (!existing) throw new Error('Race not found or unauthorized');

    return tx.picture_races.delete({
      where: { id }
    });
  });
};

module.exports = {
  createPictureRace,
  getPictureRacesByUserId,
  getPictureRaceById,
  updatePictureRace,
  deletePictureRace,
};
