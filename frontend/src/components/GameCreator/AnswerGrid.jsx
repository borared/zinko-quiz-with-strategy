import React, { useState, useCallback, memo } from 'react';
import { Check, Image as ImageIcon } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';

const AnswerGrid = memo(() => {
  const { activeQuestion, updateActiveQuestion } = useQuiz();
  const [focusedAnswerId, setFocusedAnswerId] = useState(null);

  // ── All hooks MUST be above any early return (Rules of Hooks) ─────────────
  const handleToggleAnswer = useCallback((id) => {
    if (!activeQuestion) return;
    const updatedAnswers = activeQuestion.answers.map(ans => ({
      ...ans,
      checked: ans.id === id
    }));
    updateActiveQuestion({ answers: updatedAnswers });
  }, [activeQuestion, updateActiveQuestion]);

  const handleAnswerTextChange = useCallback((id, text) => {
    if (!activeQuestion) return;
    const updatedAnswers = activeQuestion.answers.map(ans =>
      ans.id === id ? { ...ans, text } : ans
    );
    updateActiveQuestion({ answers: updatedAnswers });
  }, [activeQuestion, updateActiveQuestion]);

  const insertText = (textToInsert) => {
    const activeEl = document.activeElement;
    if (activeEl && activeEl.isContentEditable) {
      document.execCommand('insertText', false, textToInsert);
    }
  };

  // Guard render (not an early hook return)
  if (!activeQuestion) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* Custom CSS for contenteditable placeholder */}
      <style>{`
        .rich-input:empty:before {
          content: 'Type answer choice here...';
          color: rgba(255, 255, 255, 0.5);
          pointer-events: none;
        }
      `}</style>

      {activeQuestion.answers.map((ans) => (
        <div 
          key={ans.id}
          className={`flex items-center gap-4 p-4 border-[3px] border-zk-black rounded-xl ${ans.color} text-white relative ${ans.checked ? 'animate-boing shadow-[0_0_15px_rgba(0,200,83,0.5)]' : ''}`}
        >
          {/* Math/Formatting Toolbar (shown when focused) */}
          {focusedAnswerId === ans.id && (
            <div 
              className="absolute bottom-full left-0 mb-2 bg-[#E0E0E0] border-[2px] border-zk-black flex items-center gap-3 p-1.5 text-zk-black font-bold z-20 rounded-lg"
              onMouseDown={(e) => e.preventDefault()} // Prevent losing focus on input
            >
              <button onClick={() => alert('Image upload for answer is not implemented yet!')} className="p-1 hover:bg-white transition-colors rounded"><ImageIcon size={18} /></button>
              <div className="border-l border-zk-black h-5 rounded-xl"></div>
              
              <button onClick={() => document.execCommand('bold')} className="p-1 hover:bg-white transition-colors px-1.5 text-sm font-bold rounded">B</button>
              <button onClick={() => document.execCommand('italic')} className="p-1 hover:bg-white transition-colors px-1.5 text-sm italic rounded">I</button>
              <button onClick={() => document.execCommand('subscript')} className="p-1 hover:bg-white transition-colors px-1.5 text-sm rounded">X₂</button>
              <button onClick={() => document.execCommand('superscript')} className="p-1 hover:bg-white transition-colors px-1.5 text-sm rounded">X²</button>
              
              <div className="border-l border-zk-black h-5 rounded-xl"></div>
              <button onClick={() => insertText('Ω')} className="p-1 hover:bg-white transition-colors px-1.5 text-sm rounded">Ω</button>
              <button onClick={() => insertText('f(x)')} className="p-1 hover:bg-white transition-colors px-1.5 text-sm rounded">f(x)</button>
            </div>
          )}

          <div className="w-10 h-10 bg-white border-[2px] border-zk-black flex items-center justify-center text-zk-black font-black text-lg rounded-lg">
            {ans.id}
          </div>

          <div 
            contentEditable="true"
            className="flex-1 bg-transparent border-none text-white font-bold text-lg focus:outline-none min-h-[1.5em] rich-input"
            onFocus={() => setFocusedAnswerId(ans.id)}
            onBlur={(e) => {
              setFocusedAnswerId(null);
              handleAnswerTextChange(ans.id, e.target.innerHTML);
            }}
            dangerouslySetInnerHTML={{ __html: ans.text || "" }}
          />

          <div 
            onClick={() => handleToggleAnswer(ans.id)}
            className={`w-8 h-8 rounded-full border-[2px] border-zk-black flex items-center justify-center cursor-pointer ${
              ans.checked ? 'bg-[#00C853]' : 'bg-white/20'
            }`}
          >
            {ans.checked && <Check size={16} strokeWidth={3} className="text-white" />}
          </div>
        </div>
      ))}
    </div>
  );
});

export default AnswerGrid;
