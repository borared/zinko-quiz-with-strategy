import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

const PictureRacePlayer = ({ phase, selectedId, onSubmitAnswer }) => {
  const [inputValue, setInputValue] = useState('');

  // If the player has already answered (e.g. from a reconnect sync), set it.
  useEffect(() => {
    if (selectedId && selectedId !== 'synced-answer') {
      setInputValue(selectedId);
    }
  }, [selectedId]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || phase !== 'PLAYING') return;
    onSubmitAnswer(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  if (phase === 'ANSWERED' || selectedId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white w-full max-w-md mx-auto">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-zk-panel-bg p-8 rounded-2xl border-[3px] border-zk-border w-full flex flex-col items-center shadow-[6px_6px_0px_#000]"
        >
          <div className="w-20 h-20 rounded-full bg-zk-green flex items-center justify-center mb-6 border-[3px] border-zk-border shadow-inner">
            <CheckCircle2 size={40} className="text-zk-text" />
          </div>
          <h2 className="text-3xl font-black text-zk-text mb-2 uppercase text-center tracking-widest">Answer Locked!</h2>
          <p className="text-zk-text/70 font-bold text-center">
            {selectedId && selectedId !== 'synced-answer' ? (
              <>You guessed: <span className="text-zk-text bg-white px-2 py-1 rounded ml-1 font-black">{selectedId}</span></>
            ) : (
              "Waiting for other players..."
            )}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 w-full max-w-md mx-auto relative justify-end pb-[10vh]">
      <motion.form 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-4"
      >
        <div className="bg-zk-panel-bg p-6 rounded-2xl border-[3px] border-zk-border shadow-[6px_6px_0px_#000]">
          <label htmlFor="guessInput" className="block text-center font-black text-zk-text text-xl uppercase tracking-widest mb-4">
            Type Your Guess
          </label>
          <input
            id="guessInput"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What is the picture?"
            autoComplete="off"
            autoFocus
            className="w-full h-16 bg-white border-[3px] border-zk-border rounded-xl px-4 text-center text-2xl font-black text-zk-text placeholder:text-zk-text/30 focus:outline-none focus:border-zk-purple focus:ring-4 focus:ring-zk-purple/20 transition-all uppercase"
          />
        </div>
        
        <motion.button
          type="submit"
          disabled={!inputValue.trim()}
          whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
          className="w-full h-16 bg-zk-purple text-white border-[3px] border-zk-border rounded-xl font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-3 shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_#000]"
        >
          <Send size={24} />
          Submit
        </motion.button>
      </motion.form>
    </div>
  );
};

export default PictureRacePlayer;
