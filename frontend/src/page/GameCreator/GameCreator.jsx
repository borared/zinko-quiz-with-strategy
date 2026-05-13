import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/GameCreator/Sidebar';
import QuestionEditor from '../../components/GameCreator/QuestionEditor';
import AnswerGrid from '../../components/GameCreator/AnswerGrid';
import BottomPanel from '../../components/GameCreator/BottomPanel';
import AiSidebar from '../../components/GameCreator/AiSidebar';
import { Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const GameCreator = () => {
  const navigate = useNavigate();
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);

  const handleGenerateQuiz = async (file, prompt, numQuestions) => {
    console.log('Generating quiz with prompt:', prompt, 'file:', file?.name);
    
    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('prompt', prompt);
    formData.append('numQuestions', numQuestions);
    
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-quiz', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate quiz');
      }
      
      const data = await response.json();
      
      const formattedQuestions = data.questions.map((q, index) => ({
        id: `q-${Date.now()}-${index}`,
        label: `QUESTION ${index + 1}`,
        text: q.question,
        answers: q.choices.map((choice, i) => ({
          id: String.fromCharCode(65 + i), // A, B, C, D
          text: choice,
          color: i === 0 ? 'bg-[#5D3FD3]' : i === 1 ? 'bg-[#FF6B4A]' : i === 2 ? 'bg-[#FF4B4B]' : 'bg-[#2D3436]',
          checked: i === q.correctAnswerIndex
        })),
        image: null
      }));
      
      setQuestions(formattedQuestions);
      setActiveQuestionId(formattedQuestions[0].id);
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const defaultAnswers = [
    { id: 'A', text: "", color: 'bg-[#5D3FD3]', checked: true },
    { id: 'B', text: "", color: 'bg-[#FF6B4A]', checked: false },
    { id: 'C', text: "", color: 'bg-[#FF4B4B]', checked: false },
    { id: 'D', text: "", color: 'bg-[#2D3436]', checked: false },
  ];

  const [questions, setQuestions] = useState([
    { id: 1, text: "What is the primary function of the mitochondr...", answers: defaultAnswers, image: null },
    { id: 2, text: "Identify the chemical element with the symbol...", answers: defaultAnswers, image: null },
    { id: 3, text: "How many planets are in our solar system?", answers: defaultAnswers, image: null },
  ]);
  const [activeQuestionId, setActiveQuestionId] = useState(1);

  const handleAddQuestion = () => {
    const newId = questions.length + 1;
    setQuestions([...questions, { id: newId, text: "New Question", answers: defaultAnswers, image: null }]);
    setActiveQuestionId(newId);
  };

  const handleToggleAnswer = (questionId, answerId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(ans => ({
            ...ans,
            checked: ans.id === answerId
          }))
        };
      }
      return q;
    }));
  };

  const handleImageChange = (questionId, imageUrl) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, image: imageUrl };
      }
      return q;
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] bg-white">
    
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
          questions={questions} 
          activeQuestionId={activeQuestionId} 
          onAddQuestion={handleAddQuestion}
          onSelectQuestion={setActiveQuestionId}
        />

        {/* Main Workspace */}
        <div 
          className="flex-1 overflow-y-auto bg-cover bg-center h-full relative"
          style={{ backgroundImage: "url('https://res.cloudinary.com/dicrvjstp/image/upload/v1778512239/Gemini_Generated_Image_o8qfs4o8qfs4o8qf_kqpgha.png')" }}
        >
          {/* Dark Overlay that grows with content */}
          <div className="bg-black/40 min-h-full w-full">
            <div className="max-w-6xl mx-auto flex flex-col gap-4 p-6 relative z-10">
            {/* Header Buttons */}
            <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm p-4 border-[3px] border-zk-black rounded-xl">
              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => navigate('/')}
                  className="bg-[#FF4B4B] text-white border-[2px] border-zk-black px-4 py-2 font-bold text-sm rounded-lg hover:opacity-90 transition-opacity"
                >
                  EXIT
                </button>
                <button className="bg-white text-zk-black border-[2px] border-zk-black px-4 py-2 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  PREVIEW
                </button>
                
                {/* Quiz Title Input */}
                <input 
                  type="text" 
                  placeholder="Enter Quiz Title..." 
                  className="border-[2px] border-zk-black px-4 py-2 font-bold text-zk-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zk-blue/30 transition-all w-64 rounded-lg"
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
                  className="bg-[#5D3FD3] text-white border-[2px] border-zk-black px-4 py-2 font-bold text-sm flex items-center gap-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Wand2 size={16} />
                  GENERATE QUIZ
                </button>
                <button className="bg-[#00C853] text-white border-[2px] border-zk-black px-6 py-2 font-bold text-sm rounded-lg hover:opacity-90 transition-opacity">
                  SAVE QUIZ
                </button>
              </div>
            </div>

            {/* Top Question Editor */}
            <QuestionEditor 
              activeQuestionId={activeQuestionId} 
              image={questions.find(q => q.id === activeQuestionId)?.image}
              onImageChange={(imageUrl) => handleImageChange(activeQuestionId, imageUrl)}
            />

            {/* Answer Grid */}
            <AnswerGrid 
              answers={questions.find(q => q.id === activeQuestionId)?.answers || []} 
              onToggleAnswer={(answerId) => handleToggleAnswer(activeQuestionId, answerId)}
            />

            {/* Bottom Panels */}
            <BottomPanel />
          </div>
        </div>
        </div>
      </div>
      
      {/* Right AI Sidebar */}
      <AiSidebar 
        isOpen={isAiSidebarOpen} 
        onClose={() => setIsAiSidebarOpen(false)} 
        onGenerate={handleGenerateQuiz} 
      />
    </div>
  );
};

export default GameCreator;
