import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/GameCreator/Sidebar';
import QuestionEditor from '../../components/GameCreator/QuestionEditor';
import AnswerGrid from '../../components/GameCreator/AnswerGrid';
import BottomPanel from '../../components/GameCreator/BottomPanel';
import AiSidebar from '../../components/GameCreator/AiSidebar';
import { Wand2, Image, Upload, Link as LinkIcon, X, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';


const GameCreator = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { user } = useUser();
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [activeRound, setActiveRound] = useState(1); // 1: Easy, 2: Medium, 3: Hard
  const [quizTitle, setQuizTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null); 
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ title: false, cover: false, round: null });

  useEffect(() => {
    if (quizId) {
      const fetchQuiz = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`);
          const data = await response.json();
          setQuizTitle(data.title);
          setCoverImage(data.cover_image);
          
          const formattedQuestions = data.questions.map(q => ({
            id: q.id,
            text: q.question_text,
            answers: q.answers,
            image: q.image_url,
            round: q.round || 1
          }));
          
          setQuestions(formattedQuestions);
          if (formattedQuestions.length > 0) {
            setActiveQuestionId(formattedQuestions[0].id);
          }
        } catch (error) {
          console.error('Error fetching quiz for edit:', error);
        }
      };
      fetchQuiz();
    }
  }, [quizId]);

  const handleGenerateQuiz = async (file, prompt, numQuestions) => {
    console.log('Generating quiz with prompt:', prompt, 'file:', file?.name);
    
    const difficulty = activeRound === 1 ? 'Easy' : activeRound === 2 ? 'Medium' : 'Hard';
    const enhancedPrompt = `[Round ${activeRound} - ${difficulty} Difficulty] ${prompt}`;
    
    // Get existing questions for THIS round to give the AI context
    const existingQuestionsInRound = questions
      .filter(q => q.round === activeRound)
      .map((q, idx) => `Q${idx + 1}: ${q.text}`);

    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('prompt', enhancedPrompt);
    formData.append('numQuestions', numQuestions || 8);
    formData.append('context', JSON.stringify(existingQuestionsInRound));
    
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
      
      const newFormattedQuestions = data.questions.map((q, index) => ({
        id: Date.now() + index, // Unique ID
        text: q.question,
        answers: q.choices.map((choice, i) => ({
          id: String.fromCharCode(65 + i), // A, B, C, D
          text: choice,
          color: i === 0 ? 'bg-[#5D3FD3]' : i === 1 ? 'bg-[#FF6B4A]' : i === 2 ? 'bg-[#FF4B4B]' : 'bg-[#2D3436]',
          checked: i === q.correctAnswerIndex
        })),
        image: null,
        round: activeRound
      }));
      
      setQuestions(prev => {
        // Keep questions from other rounds
        const otherRounds = prev.filter(q => q.round !== activeRound);
        // Replace current round with AI results
        return [...otherRounds, ...newFormattedQuestions];
      });

      if (newFormattedQuestions.length > 0) {
        setActiveQuestionId(newFormattedQuestions[0].id);
      }
      
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
        setIsImageModalOpen(false);
        setValidationErrors(prev => ({ ...prev, cover: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQuiz = async () => {
    const errors = {
      title: !quizTitle.trim(),
      cover: !coverImage
    };
    
    // Round counts validation
    const round1Count = questions.filter(q => q.round === 1).length;
    const round2Count = questions.filter(q => q.round === 2).length;
    const round3Count = questions.filter(q => q.round === 3).length;

    if (errors.title || errors.cover) {
      setValidationErrors(errors);
      setTimeout(() => setValidationErrors({ title: false, cover: false, round: null }), 3000);
      return;
    }

    // Note: We no longer block saving here. 
    // The "minimum 6 per round" is enforced in the Dashboard for Hosting.

    const url = quizId ? `http://localhost:5000/api/quizzes/${quizId}` : 'http://localhost:5000/api/quizzes';
    const method = quizId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle,
          creator_id: user.id,
          questions: questions,
          cover_image: coverImage
        }),
      });

      if (response.ok) {
        alert(quizId ? 'Quiz updated successfully!' : 'Quiz saved successfully!');
        navigate('/dashboard');
      } else {
        throw new Error('Failed to save quiz');
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Error saving quiz. Make sure backend is running.');
    }
  };


  const handleAddQuestion = () => {
    const newId = Date.now(); // Use timestamp for more reliable IDs
    setQuestions([...questions, { 
      id: newId, 
      text: "New Question", 
      answers: defaultAnswers, 
      image: null,
      round: activeRound 
    }]);
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

  const handleQuestionTextChange = (questionId, text) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, text };
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
          questions={questions.filter(q => q.round === activeRound)} 
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
            
            {/* Round Switcher Bar */}
            <div className="grid grid-cols-3 gap-4 mb-2">
              {[
                { id: 1, label: 'Round 1', difficulty: 'Easy', color: 'bg-zk-blue' },
                { id: 2, label: 'Round 2', difficulty: 'Medium', color: 'bg-zk-yellow' },
                { id: 3, label: 'Round 3', difficulty: 'Hard', color: 'bg-[#FF4B4B]' }
              ].map((round) => {
                const count = questions.filter(q => q.round === round.id).length;
                const isActive = activeRound === round.id;
                const isError = validationErrors.round === round.id;
                
                return (
                  <div key={round.id} className="relative">
                    <AnimatePresence>
                      {isError && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-16 left-0 right-0 bg-[#FF4B4B] text-white px-4 py-2 text-xs font-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-[3px] border-zk-black z-[100] flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <AlertCircle size={14} fill="white" className="text-[#FF4B4B]" />
                          MIN. 6 QUESTIONS NEEDED!
                          <div className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FF4B4B] border-r-[3px] border-b-[3px] border-zk-black rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => {
                        setActiveRound(round.id);
                        const roundQuestions = questions.filter(q => q.round === round.id);
                        if (roundQuestions.length > 0) setActiveQuestionId(roundQuestions[0].id);
                        else setActiveQuestionId(null);
                      }}
                      className={`w-full relative border-[3px] border-zk-black p-4 transition-all rounded-xl ${
                        isActive 
                          ? `${round.color} text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-y-1` 
                          : isError ? 'bg-red-50 border-red-500 animate-shake' : 'bg-white/90 text-zk-black hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white/70' : isError ? 'text-red-500' : 'text-zk-black/50'}`}>
                            {round.difficulty}
                          </p>
                          <h3 className="text-xl font-black uppercase leading-tight">{round.label}</h3>
                        </div>
                        <div className={`w-10 h-10 border-[3px] border-zk-black flex items-center justify-center font-black text-lg rounded-lg ${
                          count >= 8 ? 'bg-[#00C853] text-white' : count >= 6 ? 'bg-zk-blue text-white' : count > 0 ? 'bg-white text-zk-black' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {count}/8
                        </div>
                      </div>
                      {isActive && (
                        <motion.div 
                          layoutId="roundUnderline"
                          className="absolute -bottom-[3px] left-0 right-0 h-1 bg-white mx-4 rounded-full"
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            {/* Header Buttons */}
            <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm p-4 border-[3px] border-zk-black rounded-xl relative z-[60]">
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
                <div className="flex items-center gap-2 relative">
                  <AnimatePresence>
                    {validationErrors.title && (
                      <motion.div 
                        initial={{ opacity: 0, y: -15, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-16 left-0 bg-[#FF4B4B] text-white px-5 py-3 text-sm font-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-[3px] border-zk-black z-[9999] flex items-center gap-3 whitespace-nowrap"
                      >
                        <AlertCircle size={20} fill="white" className="text-[#FF4B4B]" />
                        PLEASE ENTER A QUIZ TITLE!
                        <div className="absolute -top-[11px] left-8 w-4 h-4 bg-[#FF4B4B] border-l-[3px] border-t-[3px] border-zk-black rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <input 
                    type="text" 
                    value={quizTitle}
                    onChange={(e) => {
                      setQuizTitle(e.target.value);
                      if (e.target.value.trim()) setValidationErrors(prev => ({ ...prev, title: false }));
                    }}
                    placeholder="Enter Quiz Title..." 
                    className={`border-[3px] ${validationErrors.title ? 'border-[#FF4B4B] animate-shake bg-red-50' : 'border-zk-black'} px-4 py-3 font-black text-zk-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/20 transition-all w-80 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                  />

                  <div className="relative">
                    <AnimatePresence>
                      {validationErrors.cover && (
                        <motion.div 
                          initial={{ opacity: 0, y: -15, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute top-16 right-0 bg-[#5D3FD3] text-white px-5 py-3 text-sm font-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-[3px] border-zk-black z-[9999] flex items-center gap-3 whitespace-nowrap"
                        >
                          <Image size={20} fill="white" className="text-[#5D3FD3]" />
                          SET A COVER IMAGE!
                          <div className="absolute -top-[11px] right-8 w-4 h-4 bg-[#5D3FD3] border-l-[3px] border-t-[3px] border-zk-black rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <button 
                      onClick={() => setIsImageModalOpen(true)}
                      title="Set Quiz Cover Image"
                      className={`w-14 h-14 bg-white border-[3px] ${validationErrors.cover ? 'border-[#FF4B4B] animate-shake' : 'border-zk-black'} flex items-center justify-center hover:bg-zk-yellow transition-all relative overflow-hidden rounded-xl group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                    >
                      {coverImage ? (
                        <img src={coverImage} className="w-full h-full object-cover" alt="Cover" />
                      ) : (
                        <Image size={28} className="text-zk-black" strokeWidth={2.5} />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload size={20} className="text-white" strokeWidth={3} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
                  className="bg-[#5D3FD3] text-white border-[2px] border-zk-black px-4 py-2 font-bold text-sm flex items-center gap-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Wand2 size={16} />
                  GENERATE QUIZ
                </button>
                <button 
                  onClick={handleSaveQuiz}
                  className="bg-[#00C853] text-white border-[2px] border-zk-black px-6 py-2 font-bold text-sm rounded-lg hover:opacity-90 transition-opacity"
                >
                  SAVE QUIZ
                </button>
              </div>
            </div>

            {questions.length > 0 ? (
              <>
                {/* Top Question Editor */}
                <QuestionEditor 
                  questionNumber={questions.findIndex(q => q.id === activeQuestionId) + 1} 
                  questionText={questions.find(q => q.id === activeQuestionId)?.text}
                  onQuestionTextChange={(text) => handleQuestionTextChange(activeQuestionId, text)}
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
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm border-[3px] border-zk-black rounded-2xl border-dashed">
                <div className="bg-zk-yellow p-6 border-[3px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl mb-6">
                  <Wand2 size={64} className="text-zk-black" />
                </div>
                <h2 className="text-3xl font-black text-zk-black mb-2 uppercase">
                  Round {activeRound} is Empty!
                </h2>
                <p className="text-zk-black/70 font-bold mb-8 text-center max-w-md">
                  Add 8 questions to satisfy the battle logic for this round.
                </p>
                <button 
                  onClick={handleAddQuestion}
                  className="bg-[#5D3FD3] text-white border-[3px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-10 py-4 font-black text-xl transition-transform hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none rounded-xl"
                >
                  + ADD TO ROUND {activeRound}
                </button>
              </div>
            )}
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
      {/* Cover Image Hub Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-[4px] border-zk-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full p-8 relative rounded-2xl"
          >
            <button 
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-zk-yellow border-[2px] border-transparent hover:border-zk-black transition-colors rounded-xl"
            >
              <X size={24} className="text-zk-black" />
            </button>

            <h2 className="text-3xl font-black text-zk-black uppercase mb-2">Quiz Cover Hub</h2>
            <p className="text-zk-black/60 font-bold mb-8 italic">Choose how you want to represent your masterpiece!</p>

            <div className="flex flex-col gap-6">
              {/* Option 1: URL */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-zk-black uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon size={14} /> Paste Image Link
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://example.com/image.png"
                    value={typeof coverImage === 'string' && !coverImage.startsWith('data:') ? coverImage : ''}
                    onChange={(e) => {
                      setCoverImage(e.target.value);
                      setValidationErrors(prev => ({ ...prev, cover: false }));
                    }}
                    className="flex-1 border-[3px] border-zk-black p-3 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-zk-yellow/30 rounded-xl"
                  />
                  <button 
                    onClick={() => setIsImageModalOpen(false)}
                    className="bg-zk-black text-white px-4 font-black text-xs uppercase rounded-xl hover:bg-zk-blue transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-[2px] bg-gray-100"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase">Or</span>
                <div className="flex-1 h-[2px] bg-gray-100"></div>
              </div>

              {/* Option 2: Upload */}
              <div 
                className="group border-[3px] border-dashed border-zk-black p-8 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-zk-yellow/10 transition-all cursor-pointer relative rounded-2xl"
              >
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-12 h-12 bg-white border-[3px] border-zk-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-y-[2px] group-hover:translate-x-[2px] group-hover:shadow-none transition-all rounded-xl pointer-events-none">
                  <Upload size={24} className="text-zk-black" />
                </div>
                <div className="text-center pointer-events-none">
                  <p className="font-black text-zk-black uppercase text-sm">Upload from Device</p>
                  <p className="text-[10px] text-zk-black/50 font-bold italic">PNG, JPG or GIF up to 5MB</p>
                </div>
              </div>
            </div>

            {coverImage && (
              <div className="mt-8 p-4 border-[3px] border-zk-black bg-zk-yellow/10 rounded-xl">
                <p className="text-[10px] font-black text-zk-black uppercase mb-2">Current Selection Preview:</p>
                <img src={coverImage} alt="Preview" className="w-full h-32 object-cover border-[2px] border-zk-black rounded-lg" />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GameCreator;
