const supabase = require('../lib/supabaseClient');

/**
 * Save a full quiz and its questions to Supabase.
 */
const createQuiz = async (quizData) => {
  const { title, creator_id, questions, cover_image, is_public = false, is_cloned = false } = quizData;

  // 1. Insert the Quiz Metadata
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      title,
      creator_id,
      cover_image: cover_image || null,
      is_public,
      is_cloned,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (quizError) throw quizError;

  // 2. Prepare the Questions for insertion
  const questionsToInsert = questions.map((q, index) => ({
    quiz_id: quiz.id,
    question_text: q.text,
    image_url: q.image || null,
    answers: q.answers, // JSONB column
    order_index: index,
    round: q.round || 1, // Store the round index (1, 2, or 3)
  }));

  // 3. Insert all Questions
  const { error: questionsError } = await supabase
    .from('questions')
    .insert(questionsToInsert);

  if (questionsError) throw questionsError;

  return quiz;
};

/**
 * Update an existing quiz and its questions.
 */
const updateQuiz = async (id, quizData) => {
  const { title, questions, cover_image } = quizData;

  // 1. Update Quiz Metadata
  const { error: quizError } = await supabase
    .from('quizzes')
    .update({ title, cover_image, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (quizError) throw quizError;

  // 2. Delete existing questions
  await supabase.from('questions').delete().eq('quiz_id', id);

  // 3. Re-insert updated questions
  const questionsToInsert = questions.map((q, index) => ({
    quiz_id: id,
    question_text: q.text,
    image_url: q.image || null,
    answers: q.answers,
    order_index: index,
    round: q.round || 1,
  }));

  const { error: questionsError } = await supabase
    .from('questions')
    .insert(questionsToInsert);

  if (questionsError) throw questionsError;
};

/**
 * Fetch a single quiz with its questions.
 */
const getQuizById = async (id) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetch all quizzes for a specific creator.
 */
const getQuizzesByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Debug: fetch all quizzes with creator info.
 */
const getAllQuizzesDebug = async () => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, creator_id, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Fetch all public quizzes with creator details.
 */
const getPublicQuizzes = async () => {
  const { data: quizzes, error: quizError } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (quizError) throw quizError;
  if (!quizzes || quizzes.length === 0) return [];

  const creatorIds = [...new Set(quizzes.map(q => q.creator_id))];
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('clerk_id, first_name, last_name, username')
    .in('clerk_id', creatorIds);

  if (usersError) throw usersError;

  const usersMap = {};
  if (users) {
    users.forEach(u => {
      usersMap[u.clerk_id] = u;
    });
  }

  return quizzes.map(q => ({
    ...q,
    creator: usersMap[q.creator_id] || null,
  }));
};

/**
 * Update the visibility of a quiz.
 */
const updateQuizVisibility = async (id, is_public) => {
  const { data, error } = await supabase
    .from('quizzes')
    .update({ is_public, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a quiz.
 */
const deleteQuiz = async (id) => {
  // Delete questions first
  await supabase.from('questions').delete().eq('quiz_id', id);

  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

module.exports = {
  createQuiz,
  updateQuiz,
  getQuizById,
  getQuizzesByUserId,
  getAllQuizzesDebug,
  getPublicQuizzes,
  updateQuizVisibility,
  deleteQuiz,
};
