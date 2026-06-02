const supabase = require('../lib/supabaseClient');

/**
 * Fetch a quiz by ID to verify ownership and get title for hosting a game.
 */
const getQuizForGameHost = async (quizId) => {
  const { data: quiz, error } = await supabase
    .from('quizzes')
    .select('id, title, creator_id')
    .eq('id', quizId)
    .single();

  if (error) throw error;
  return quiz;
};

module.exports = {
  getQuizForGameHost,
};
