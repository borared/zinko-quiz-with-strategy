const { QUIZ_RULES } = require('../../packages/shared/src/constants/quiz.js');

const QUESTION_TYPE_GUIDE = `
QUESTION TYPES (use "questionType" on every item):

1) multiple_choice — default
   - Exactly 4 choices in "choices"
   - "correctAnswerIndex": 0-3
   - Good for facts, concepts, vocabulary

2) true_false — when user asks for true/false, T/F, yes/no facts, or quick checks
   - No "choices" array
   - "correctAnswer": "true" or "false" (lowercase)
   - Question must be a clear statement that is true or false

3) drag_layers — when user asks for drag & order, step order, sequencing, process order, timeline, ranking steps
   - No "choices" array
   - "steps": array of 2-6 short strings in the CORRECT top-to-bottom order
   - Each step is one draggable card; order in the array is the correct answer
   - Use for procedures, recipes, historical timelines, science process order, etc.

4) line_matching — when user asks for line matching, match pairs, connect terms, vocabulary matching, definition matching, translations, symbol matching
   - No "choices" array
   - "pairs": array of 2-6 objects, each with "left" and "right" short strings that belong together
   - Each left item matches exactly one right item; keep both sides concise (1-5 words each)
   - Use for vocabulary, definitions, country-capital, term-definition, cause-effect, tool-purpose, etc.

TYPE SELECTION RULES:
- Follow the USER REQUEST explicitly (e.g. "5 true false" → all true_false; "line matching about animals" → all line_matching).
- If they ask for a mix, vary types appropriately.
- If unspecified, prefer multiple_choice but use true_false, drag_layers, or line_matching when the content clearly fits better.
- Do NOT use drag_layers for simple single-answer trivia; use it when ORDER matters.
- Do NOT use line_matching for single-answer trivia; use it when PAIRING two related items matters.
`;

function buildGenerateQuizPrompt({
  numQuestions,
  userPrompt,
  extractedText,
  existingQuestions,
}) {
  return `
You are the "Zinko Game Editor". Your job is to manage questions for a specific round.
PLATFORM CONTEXT:
- Round Structure: R1 (Easy), R2 (Medium), R3 (Hard).
- Goal: Up to ${QUIZ_RULES.MAX_QUESTIONS_PER_ROUND} questions per round.
- Supported question types: multiple_choice, true_false, drag_layers, line_matching.

${QUESTION_TYPE_GUIDE}

CURRENT STATE OF THIS ROUND:
${existingQuestions.length > 0 ? existingQuestions.join('\n') : '(Empty Round)'}

USER REQUEST: "${userPrompt}"
${extractedText ? `REFERENCE CONTENT:\n${extractedText}` : ''}

INSTRUCTIONS:
1. ACT AS AN EDITOR. You are modifying the "CURRENT STATE" based on the "USER REQUEST".
2. If the user asks to REMOVE a question (e.g., "Remove Q8"), do not include that question in your output.
3. If the user asks to ADD questions, create new ones that are unique from the current list.
4. If the user asks to MODIFY, update the existing question's text or answers.
5. If the user provides a topic or file without specific edit instructions, generate about ${numQuestions} questions that fit the context and requested types.
6. If the USER REQUEST is written in Khmer or explicitly asks for Khmer language, generate the quiz in Khmer.
7. If the USER REQUEST is in any other non-English language, respond in that language.
8. For multiple_choice: randomize correctAnswerIndex (mix of 0,1,2,3). Make distractors plausible.
9. For true_false: alternate true/false as correct when generating many questions.
10. For drag_layers: use 3-4 steps for Easy, 4-5 for Medium, 4-6 for Hard unless user specifies otherwise.
11. For line_matching: use 3-4 pairs for Easy, 4-5 for Medium, 4-6 for Hard unless user specifies otherwise. Make left/right pairs unambiguous.

Return the FINAL, COMPLETE list of questions for this round after applying the changes.
Match the difficulty requested (Easy, Medium, or Hard).

Format as a JSON array. Examples:

Multiple choice:
{
  "questionType": "multiple_choice",
  "question": "What gas do plants absorb?",
  "choices": ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
  "correctAnswerIndex": 1
}

True or false:
{
  "questionType": "true_false",
  "question": "The Sun is a star.",
  "correctAnswer": "true"
}

Drag & order:
{
  "questionType": "drag_layers",
  "question": "Put the water cycle steps in the correct order.",
  "steps": ["Evaporation", "Condensation", "Precipitation", "Collection"]
}

Line matching:
{
  "questionType": "line_matching",
  "question": "Match each country to its capital.",
  "pairs": [
    { "left": "France", "right": "Paris" },
    { "left": "Japan", "right": "Tokyo" },
    { "left": "Brazil", "right": "Brasília" }
  ]
}

Return ONLY the raw JSON array.
`;
}

module.exports = {
  buildGenerateQuizPrompt,
  QUESTION_TYPE_GUIDE,
};