import React, { useState } from 'react';
import { Upload, Loader, Sparkles, X } from 'lucide-react';

import { useQuiz } from '../../context/QuizContext';

const AiSidebar = ({ isOpen, onClose }) => {
  const { handleGenerateQuiz } = useQuiz();
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt && !file) {
      setError('Please provide a prompt or upload a file.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await handleGenerateQuiz(file, prompt, numQuestions);
      setPrompt('');
      setFile(null);
      onClose(); // Auto-close on success
    } catch (err) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed top-[76px] right-0 w-96 bg-white border-l-[3px] border-zk-black flex flex-col h-[calc(100vh-76px)] z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="p-4 bg-zk-yellow border-b-[3px] border-zk-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-zk-black" />
          <h2 className="font-black text-lg text-zk-black uppercase">Zinko Assistant</h2>
        </div>
        <button type="button" onClick={onClose} className="p-1 hover:bg-white border-[2px] border-transparent hover:border-zk-black transition-colors rounded-xl">
          <X size={20} className="text-zk-black" />
        </button>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Prompt Input */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-zk-black text-sm">What should I create?</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create questions about photosynthesis for a Medium difficulty round."
            className="border-[3px] border-zk-black p-2 font-bold text-sm h-32 focus:outline-none focus:ring-2 focus:ring-zk-yellow placeholder-gray-400 rounded-lg"
          />
        </div>

        {/* File Upload (Optional) */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-zk-black text-sm">Reference File (Optional)</label>
          <div className="border-[2px] border-dashed border-zk-black p-4 flex flex-col items-center justify-center gap-1 bg-gray-50 hover:bg-zk-yellow/10 transition-colors cursor-pointer relative rounded-xl">
            <input 
              type="file" 
              accept=".pdf,.docx,.pptx" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload size={20} className="text-zk-black" />
            {file ? (
              <p className="font-bold text-zk-black text-xs text-center truncate w-full">{file.name}</p>
            ) : (
              <div className="text-center">
                <p className="font-bold text-zk-black text-xs">Drop file here</p>
                <p className="text-[10px] text-zk-black/60">PDF, DOCX, PPTX</p>
              </div>
            )}
          </div>
        </div>

        {/* Number of Questions */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-zk-black text-sm">Number of questions</label>
          <input 
            type="number" 
            min="1" 
            max="20" 
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="border-[3px] border-zk-black p-2 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-zk-yellow rounded-lg"
          />
        </div>

        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="mt-auto bg-[#5D3FD3] text-white font-black py-3 border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={16} />
              Generating...
            </>
          ) : (
            'Generate'
          )}
          <Sparkles size={20} className="text-white" />
        </button>
      </form>
    </div>
  );
};

export default AiSidebar;
