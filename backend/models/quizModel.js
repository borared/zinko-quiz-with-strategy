const supabase = require('../lib/supabaseClient');

/**
 * Save a full quiz and its questions to Supabase.
 */
const createQuiz = async (quizData) => {
  const { title, creator_id, questions, cover_image, is_public, is_clone } = quizData;

  const insertData = {
    title,
    creator_id,
    cover_image: cover_image || null,
    is_public: is_public || false,
    updated_at: new Date().toISOString()
  };

  if (is_clone !== undefined) {
    insertData.is_clone = is_clone;
  }

  // 1. Insert the Quiz Metadata
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert(insertData)
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
  const { title, questions, cover_image, is_public } = quizData;

  // 1. Update Quiz Metadata
  const updateData = { title, cover_image, updated_at: new Date().toISOString() };
  if (is_public !== undefined) {
    updateData.is_public = is_public;
  }

  const { error: quizError } = await supabase
    .from('quizzes')
    .update(updateData)
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
 * Fetch all public quizzes from all users.
 */
const getPublicQuizzes = async () => {
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  if (!quizzes || quizzes.length === 0) return quizzes;

  // Extract unique creator_ids
  const creatorIds = [...new Set(quizzes.map(q => q.creator_id))];

  // Fetch users manually
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('clerk_id, first_name, last_name, username, avatar_url')
    .in('clerk_id', creatorIds);

  if (usersError) {
    console.error('Failed to fetch users for public quizzes:', usersError);
    return quizzes; // return without users gracefully
  }

  // Create a map for quick lookup
  const userMap = {};
  if (usersData) {
    usersData.forEach(u => {
      userMap[u.clerk_id] = u;
    });
  }

  // Map users back to quizzes
  return quizzes.map(q => ({
    ...q,
    users: userMap[q.creator_id] || null
  }));
};

/**
 * Update just the visibility of a quiz
 */
const updateQuizVisibility = async (quizId, isPublic) => {
  const { data, error } = await supabase
    .from('quizzes')
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq('id', quizId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a quiz (questions will be cascade deleted)
 */
const deleteQuiz = async (quizId) => {
  const { data, error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId);

  if (error) throw error;
  return data;
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
