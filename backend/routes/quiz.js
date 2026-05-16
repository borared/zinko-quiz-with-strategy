const express = require('express');
const { saveQuiz } = require('../lib/quizService');
const router = express.Router();

/**
 * POST /api/quizzes
 * Save a new quiz
 */
router.post('/', async (req, res) => {
  try {
    const { title, creator_id, questions } = req.body;

    if (!title || !creator_id || !questions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const quiz = await saveQuiz({ title, creator_id, questions, cover_image: req.body.cover_image });
    
    console.log(`✅ Quiz saved: ${quiz.title} by ${creator_id}`);
    res.status(201).json({ message: 'Quiz saved successfully', quiz });
  } catch (err) {
    console.error('❌ Error saving quiz:', err.message);
    res.status(500).json({ error: 'Failed to save quiz' });
  }
});

/**
 * GET /api/quizzes/user/:userId
 * Fetch all quizzes for a specific creator
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await require('../lib/supabaseClient')
      .from('quizzes')
      .select('*, questions(*)')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching quizzes:', err.message);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

/**
 * GET /api/quizzes/:id
 * Fetch a single quiz with its questions
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await require('../lib/supabaseClient')
      .from('quizzes')
      .select('*, questions(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching quiz:', err.message);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

/**
 * PUT /api/quizzes/:id
 * Update an existing quiz
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, questions, cover_image } = req.body;

    const supabase = require('../lib/supabaseClient');

    // 1. Update Quiz Metadata
    const { error: quizError } = await supabase
      .from('quizzes')
      .update({ title, cover_image, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (quizError) throw quizError;

    // 2. Delete existing questions (Simplest way to update)
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

    res.json({ message: 'Quiz updated successfully' });
  } catch (err) {
    console.error('❌ Error updating quiz:', err.message);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

module.exports = router;
