const officeParser = require('officeparser');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const { buildGenerateQuizPrompt } = require('../lib/aiQuizPrompt');
const { buildGenerateFlashcardPrompt } = require('../lib/aiFlashcardPrompt');
/**
 * Handle GET /api/ai/test
 */
const testAI = (req, res) => {
  res.json({ message: 'AI route is working!' });
};

/**
 * Handle POST /api/ai/generate-quiz
 * Generate a quiz using Groq AI
 */
const generateQuiz = async (req, res) => {
  try {
    const { numQuestions, prompt: userPrompt, context } = req.body;
    const file = req.file;
    const existingQuestions = context ? JSON.parse(context) : [];

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing in .env');
      return res.status(500).json({ error: 'Server configuration error: Missing Groq API Key in backend .env' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!file && !userPrompt) {
      return res.status(400).json({ error: 'Please provide a prompt or upload a file.' });
    }

    let extractedText = '';
    if (file) {
      console.log(`Processing file: ${file.originalname}`);
      
      const uploadsDir = path.join(__dirname, '../uploads');
      const tempFilePath = path.join(uploadsDir, `temp_${Date.now()}_${file.originalname}`);
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      fs.writeFileSync(tempFilePath, file.buffer);
      console.log(`Saved temp file to ${tempFilePath}`);
      
      try {
        console.log('Calling officeParser with file path...');
        extractedText = await officeParser.parseOffice(tempFilePath);
        console.log(`Extracted ${extractedText.length} characters of text.`);
      } catch (err) {
        console.error('officeParser failed:', err);
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        return res.status(500).json({ error: 'Failed to read file content.', details: err.message, stack: err.stack });
      }
      
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }

    // 2. Call Groq API
    console.log('Calling Groq API...');
    const prompt = buildGenerateQuizPrompt({
      numQuestions,
      userPrompt,
      extractedText,
      existingQuestions,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    console.log('AI Response received.');

    // 3. Parse JSON response
    let questions;
    try {
      const cleanJson = responseContent.replace(/```json|```/g, '').trim();
      questions = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', responseContent);
      return res.status(500).json({ error: 'AI did not return a valid JSON format. Please try again.' });
    }

    res.json({ questions });

  } catch (error) {
    console.error('Error in generate-quiz:', error);
    
    // Handle Groq SDK specific errors (like invalid API key, rate limits)
    if (error.status === 401) {
      return res.status(401).json({ error: 'The Groq API Key is invalid or expired. Please check your .env file.' });
    } else if (error.status === 429) {
      return res.status(429).json({ error: 'AI rate limit exceeded. Please try again later.' });
    } else if (error.error?.error?.message) {
      // Pass through specific API error messages if available
      return res.status(500).json({ error: `AI API Error: ${error.error.error.message}` });
    }

    res.status(500).json({ error: 'Internal server error while communicating with AI.' });
  }
};

/**
 * Handle POST /api/ai/generate-flashcards
 * Generate flashcards using Groq AI
 */
const generateFlashcards = async (req, res) => {
  try {
    const { numCards, prompt: userPrompt } = req.body;
    const file = req.file;

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing in .env');
      return res.status(500).json({ error: 'Server configuration error: Missing Groq API Key in backend .env' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!file && !userPrompt) {
      return res.status(400).json({ error: 'Please provide a prompt or upload a file.' });
    }

    let extractedText = '';
    if (file) {
      console.log(`Processing file: ${file.originalname}`);
      
      const uploadsDir = path.join(__dirname, '../uploads');
      const tempFilePath = path.join(uploadsDir, `temp_${Date.now()}_${file.originalname}`);
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      fs.writeFileSync(tempFilePath, file.buffer);
      console.log(`Saved temp file to ${tempFilePath}`);
      
      try {
        console.log('Calling officeParser with file path...');
        extractedText = await officeParser.parseOffice(tempFilePath);
        console.log(`Extracted ${extractedText.length} characters of text.`);
      } catch (err) {
        console.error('officeParser failed:', err);
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        return res.status(500).json({ error: 'Failed to read file content.', details: err.message, stack: err.stack });
      }
      
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }

    // 2. Call Groq API
    console.log('Calling Groq API for Flashcards...');
    const prompt = buildGenerateFlashcardPrompt({
      numCards,
      userPrompt,
      extractedText,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    console.log('AI Response received.');

    // 3. Parse JSON response
    let flashcards;
    try {
      const cleanJson = responseContent.replace(/```json|```/g, '').trim();
      flashcards = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', responseContent);
      return res.status(500).json({ error: 'AI did not return a valid JSON format. Please try again.' });
    }

    res.json({ flashcards });

  } catch (error) {
    console.error('Error in generate-flashcards:', error);
    
    if (error.status === 401) {
      return res.status(401).json({ error: 'The Groq API Key is invalid or expired. Please check your .env file.' });
    } else if (error.status === 429) {
      return res.status(429).json({ error: 'AI rate limit exceeded. Please try again later.' });
    } else if (error.error?.error?.message) {
      return res.status(500).json({ error: `AI API Error: ${error.error.error.message}` });
    }

    res.status(500).json({ error: 'Internal server error while communicating with AI.' });
  }
};

module.exports = {
  testAI,
  generateQuiz,
  generateFlashcards,
};
