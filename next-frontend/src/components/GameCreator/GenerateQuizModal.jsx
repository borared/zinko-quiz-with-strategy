"use client";
import React, { useState } from 'react';
import { X, Upload, Loader } from 'lucide-react';

const GenerateQuizModal = ({ isOpen, onClose, onGenerate }) => {
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a file first.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onGenerate(file, numQuestions);
      onClose();
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full p-6 relative rounded-xl">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-zk-yellow border-[2px] border-transparent hover:border-zk-black transition-colors rounded-xl"
        >
          <X size={24} className="text-zk-black" />
        </button>

        <h2 className="font-black text-2xl text-zk-black uppercase mb-4">Generate Quiz with AI</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* File Upload Area */}
          <div className="border-[3px] border-dashed border-zk-black p-6 flex flex-col items-center justify-center gap-2 bg-zk-yellow/10 hover:bg-zk-yellow/20 transition-colors cursor-pointer relative rounded-xl">
            <input 
              type="file" 
              accept=".pdf,.docx,.pptx" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload size={32} className="text-zk-black" />
            {file ? (
              <p className="font-bold text-zk-black text-center">{file.name}</p>
            ) : (
              <div className="text-center">
                <p className="font-bold text-zk-black">Drag & drop or click to upload</p>
                <p className="text-xs text-zk-black/60">Supports PDF, DOCX, PPTX</p>
              </div>
            )}
          </div>

          {/* Number of Questions */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-zk-black text-sm">How many questions?</label>
            <input 
              type="number" 
              min="1" 
              max="20" 
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              className="border-[3px] border-zk-black p-2 font-bold focus:outline-none focus:ring-2 focus:ring-zk-yellow rounded-xl"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#5D3FD3] text-white font-black py-3 border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Analyzing File...
              </>
            ) : (
              'Generate Questions'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GenerateQuizModal;
