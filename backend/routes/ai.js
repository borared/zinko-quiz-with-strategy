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
You are the "Zinko Game Editor". Your job is to manage questions for a specific round.
PLATFORM CONTEXT:
- Round Structure: R1 (Easy), R2 (Medium), R3 (Hard).
- Goal: Exactly 8 questions per round for an 8-player battle.

CURRENT STATE OF THIS ROUND:
${existingQuestions.length > 0 ? existingQuestions.join('\n') : '(Empty Round)'}

USER REQUEST: "${userPrompt}"
${extractedText ? `REFERENCE CONTENT:\n${extractedText}` : ''}

INSTRUCTIONS:
1. ACT AS AN EDITOR. You are modifying the "CURRENT STATE" based on the "USER REQUEST".
2. If the user asks to REMOVE a question (e.g., "Remove Q8"), do not include that question in your output.
3. If the user asks to ADD questions, create new ones that are unique from the current list.
4. If the user asks to MODIFY, update the existing question's text or choices.
5. If the user provides a topic or file without specific edit instructions, generate ${numQuestions} questions that fit the context.

Return the FINAL, COMPLETE list of questions for this round after applying the changes.
Match the difficulty requested (Easy, Medium, or Hard).

Format the output as a JSON array:
[
  {
    "question": "Question text",
    "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "correctAnswerIndex": 0
  }
]
Return ONLY the raw JSON array.
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
