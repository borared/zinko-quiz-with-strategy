const express = require('express');
const router = express.Router();
const multer = require('multer');
const officeParser = require('officeparser');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Groq is initialized inside the route handler after checking the key

router.get('/test', (req, res) => {
  res.json({ message: 'AI route is working!' });
});

router.post('/generate-quiz', upload.single('file'), async (req, res) => {
  try {
    const { numQuestions, prompt: userPrompt } = req.body;
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
      
      if (file.originalname.toLowerCase().endsWith('.pdf')) {
        console.log('Using pdf-parse for PDF...');
        try {
          const parser = new PDFParse({ data: file.buffer });
          const result = await parser.getText();
          extractedText = result.text;
          await parser.destroy();
          console.log(`Extracted ${extractedText.length} characters of text.`);
        } catch (err) {
          console.error('pdf-parse failed:', err);
          return res.status(500).json({ error: 'Failed to read PDF file.' });
        }
      } else {
        // Use officeparser for DOCX, PPTX
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
          return res.status(500).json({ error: 'Failed to read file content.' });
        }
        
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      }
    }

    // 2. Call Groq API
    console.log('Calling Groq API...');
    const prompt = `
You are an expert quiz generator. 
Generate exactly ${numQuestions} multiple-choice questions based on the instructions or text provided.
Each question must have exactly 4 choices (A, B, C, D) and only ONE correct answer.

${userPrompt ? `Custom Instructions from User: ${userPrompt}` : ''}

${extractedText ? `Lesson Text to use as reference:\n${extractedText}` : ''}

Format the output as a JSON array matching this exact structure:
[
  {
    "question": "Question text here",
    "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "correctAnswerIndex": 0 // 0 for A, 1 for B, 2 for C, 3 for D
  }
]

Return ONLY the raw JSON array. Do not include any markdown formatting or extra text.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5, // Low temperature for more factual extraction
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    console.log('AI Response received.');

    // 3. Parse JSON response
    let questions;
    try {
      // Sometimes AI adds ```json ... ``` code blocks, let's clean them up if present
      const cleanJson = responseContent.replace(/```json|```/g, '').trim();
      questions = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', responseContent);
      return res.status(500).json({ error: 'AI did not return a valid JSON format. Please try again.' });
    }

    res.json({ questions });

  } catch (error) {
    console.error('Error in /generate-quiz:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
