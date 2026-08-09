const { z } = require('zod');
const pictureRaceService = require('../services/pictureRaceService');
const handleError = require('../lib/errorHandler');

const questionSchema = z.object({
  question: z.string().optional().nullable(),
  original_image: z.string().optional().nullable(),
  image_url: z.string().min(1, 'Image is required'),
  answer: z.string().min(1, 'Answer is required'),
  crop_data: z.any().optional(),
});

const raceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  questions: z.array(questionSchema).min(1, 'At least 1 question is required'),
  cover_image: z.string().nullable().optional(),
});

const createRace = async (req, res) => {
  try {
    const parsed = raceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues,
      });
    }

    const { title, questions, cover_image } = parsed.data;
    const creator_id = req.user.userId;

    const race = await pictureRaceService.createPictureRace({
      title,
      creator_id,
      questions,
      cover_image,
    });

    res.status(201).json({ message: 'Picture Race saved successfully', race });
  } catch (err) {
    handleError(res, 'Failed to save picture race', err);
  }
};

const getUserRaces = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await pictureRaceService.getPictureRacesByUserId(userId);
    res.json(data);
  } catch (err) {
    handleError(res, 'Failed to fetch picture races', err);
  }
};

const getRaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const race = await pictureRaceService.getPictureRaceById(id, userId);
    
    if (!race) {
      return res.status(404).json({ error: 'Picture Race not found' });
    }
    res.json(race);
  } catch (err) {
    handleError(res, 'Failed to fetch picture race', err);
  }
};

const updateRace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const parsed = raceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues,
      });
    }

    const race = await pictureRaceService.updatePictureRace(id, userId, parsed.data);
    res.json({ message: 'Picture Race updated successfully', race });
  } catch (err) {
    if (err.message === 'Race not found or unauthorized') {
      return res.status(403).json({ error: err.message });
    }
    handleError(res, 'Failed to update picture race', err);
  }
};

const deleteRace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    await pictureRaceService.deletePictureRace(id, userId);
    res.json({ message: 'Picture Race deleted successfully' });
  } catch (err) {
    if (err.message === 'Race not found or unauthorized') {
      return res.status(403).json({ error: err.message });
    }
    handleError(res, 'Failed to delete picture race', err);
  }
};

module.exports = {
  createRace,
  getUserRaces,
  getRaceById,
  updateRace,
  deleteRace,
};
