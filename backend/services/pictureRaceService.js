const pictureRaceRepository = require('../repositories/pictureRaceRepository');

const createPictureRace = async (raceData) => {
  return await pictureRaceRepository.createPictureRace(raceData);
};

const getPictureRacesByUserId = async (userId) => {
  return await pictureRaceRepository.getPictureRacesByUserId(userId);
};

const getPictureRaceById = async (id, userId) => {
  return await pictureRaceRepository.getPictureRaceById(id, userId);
};

const updatePictureRace = async (id, userId, raceData) => {
  return await pictureRaceRepository.updatePictureRace(id, userId, raceData);
};

const deletePictureRace = async (id, userId) => {
  return await pictureRaceRepository.deletePictureRace(id, userId);
};

module.exports = {
  createPictureRace,
  getPictureRacesByUserId,
  getPictureRaceById,
  updatePictureRace,
  deletePictureRace,
};
