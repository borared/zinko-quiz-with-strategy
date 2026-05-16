const supabase = require('../lib/supabaseClient');

/**
 * Save a full quiz and its questions to Supabase.
 */
const saveQuiz = async (quizData) => {
  const { title, creator_id, questions, cover_image } = quizData;

  // 1. Insert the Quiz Metadata
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      title,
      creator_id,
      cover_image: cover_image || null,
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

module.exports = { saveQuiz };
