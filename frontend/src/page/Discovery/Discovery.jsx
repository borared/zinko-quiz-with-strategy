import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import QuizGrid from '../../components/Dashboard/QuizGrid';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Globe, Loader2, X, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Discovery = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [cloningId, setCloningId] = useState(null);
  const [previewQuiz, setPreviewQuiz] = useState(null);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/signin');
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      if (!isLoaded || !isSignedIn) return;
      
      try {
        const data = await api.get('/api/quizzes/public');
        // Filter out quizzes created by the current user so they only see others' public quizzes
        // Or keep them but mark them. Let's keep all for now, or maybe filter:
        const othersQuizzes = data.filter(q => q.creator_id !== user.id);
        setQuizzes(othersQuizzes);
      } catch (error) {
        console.error('Error fetching public quizzes:', error);
        setFetchError(error.message || 'Error fetching public quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicQuizzes();
  }, [isLoaded, isSignedIn, user]);

  const handleClone = async (quizId) => {
    if (cloningId) return;
    try {
      setCloningId(quizId);
      const response = await api.post(`/api/quizzes/${quizId}/clone`, {
        creator_id: user.id
      });
      // On success, redirect to dashboard or show success message
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to clone quiz:', err);
      alert('Failed to clone quiz: ' + (err?.response?.data?.error || err.message));
    } finally {
      setCloningId(null);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return <div className="min-h-screen bg-zk-yellow flex items-center justify-center font-bold text-xl">Loading...</div>;
  }

  return (
    <div className="flex bg-[#FFD54F] font-sans min-h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64 relative">
        {/* Cloning Overlay */}
        <AnimatePresence>
          {cloningId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            >
              <div className="bg-white border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 rounded-xl flex flex-col items-center gap-4">
                <Loader2 size={48} className="animate-spin text-zk-blue" />
                <h2 className="font-black text-xl uppercase tracking-widest text-zk-black">Cloning Quiz...</h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Discovery Banner */}
          <div className="bg-zk-blue rounded-2xl border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-white">
                <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                  <Globe size={36} />
                  DISCOVERY
                </h1>
                <p className="text-white/90 text-lg max-w-xl font-bold">
                  Explore and clone quizzes created by the Zinko community! 
                  Find the perfect quiz for your next session.
                </p>
              </div>
            </div>
            
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 right-32 w-48 h-48 bg-zk-yellow/20 rounded-full blur-2xl translate-y-1/4"></div>
          </div>

          {/* Public Quizzes */}
          <QuizGrid quizzes={quizzes} loading={loading} isDiscoveryMode={true} onClone={handleClone} onPreview={setPreviewQuiz} />
          
          {fetchError && (
            <div className="text-red-600 font-bold mt-4 bg-white p-4 border-[3px] border-zk-black rounded-lg inline-block">
              Unable to load public quizzes: {fetchError}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setPreviewQuiz(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-zk-blue p-6 border-b-[4px] border-zk-black flex justify-between items-start relative">
                <div className="text-white">
                  <h2 className="text-2xl font-black mb-1">{previewQuiz.title}</h2>
                  <p className="font-bold text-white/80">
                    By @{previewQuiz.users ? (previewQuiz.users.username || [previewQuiz.users.first_name, previewQuiz.users.last_name].filter(Boolean).join(' ') || 'Unknown') : 'Unknown'} • {previewQuiz.questions?.length || 0} Questions
                  </p>
                </div>
                <button
                  onClick={() => setPreviewQuiz(null)}
                  className="bg-white text-zk-black p-2 border-[2px] border-zk-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Questions List */}
              <div className="flex-1 overflow-y-auto p-6 bg-zk-yellow/10">
                <h3 className="font-black text-zk-black uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Target size={20} /> Question Preview
                </h3>
                <div className="flex flex-col gap-3">
                  {previewQuiz.questions?.map((q, idx) => (
                    <div key={q.id || idx} className="bg-white p-4 border-[2px] border-zk-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-zk-yellow px-2 py-0.5 rounded text-xs font-black border-[1.5px] border-zk-black">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          Round {q.round}
                        </span>
                      </div>
                      <p className="font-bold text-zk-black">{q.question_text}</p>
                    </div>
                  ))}
                  {(!previewQuiz.questions || previewQuiz.questions.length === 0) && (
                    <div className="text-center font-bold text-gray-500 py-8">
                      No questions found.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Action */}
              <div className="p-6 border-t-[4px] border-zk-black bg-white flex justify-end">
                <button
                  onClick={() => {
                    handleClone(previewQuiz.id);
                    setPreviewQuiz(null);
                  }}
                  className="bg-zk-blue text-white border-[3px] border-zk-black px-8 py-3 font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none rounded-xl transition-all"
                >
                  CLONE THIS QUIZ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discovery;
