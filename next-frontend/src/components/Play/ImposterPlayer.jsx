import React, { useState } from 'react';
import { Fingerprint, Send, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImposterPlayer({ imposterData, team, isLeader, onSubmitClue, onSabotageVote }) {
  const { subPhase, round, isImposter, secret, imposterTeam, correctTeams, currentTeamTurn } = imposterData;
  const [clue, setClue] = useState('');
  const [hasSubmittedClue, setHasSubmittedClue] = useState(false);
  const [votedTeam, setVotedTeam] = useState(null);

  // Reset local state when round changes
  React.useEffect(() => {
    setClue('');
    setHasSubmittedClue(false);
    setVotedTeam(null);
  }, [round, subPhase]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clue.trim() || !isLeader || hasSubmittedClue) return;
    
    // Only 1 word allowed
    const singleWord = clue.trim().split(/\s+/)[0];
    onSubmitClue(singleWord);
    setHasSubmittedClue(true);
  };

  const handleVote = (t) => {
    if (votedTeam) return;
    onSabotageVote(t);
    setVotedTeam(t);
  };

  const isMyTurn = currentTeamTurn === team;

  const renderCluePhase = () => (
    <div className="flex flex-col items-center justify-center h-[100vh] max-w-md mx-auto text-center w-full px-4 overflow-hidden relative">
      
      {/* Sliding Drawer for Role/Secret */}
      <motion.div
        className="absolute -bottom-[300px] left-0 w-full h-[300px] bg-neutral-900 border-t-2 border-blue-500 z-50 flex flex-col items-center justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
        drag="y"
        dragConstraints={{ top: -300, bottom: 0 }}
        dragElastic={0.2}
        dragSnapToOrigin={true}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="p-6 text-center w-full">
          {isImposter ? (
            <div>
              <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-4">You are the Imposter!</h2>
              <p className="text-lg text-neutral-300 font-bold">Blend in. Don't let them catch you.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-neutral-400 uppercase tracking-widest mb-4">Secret Word:</h2>
              <p className="text-4xl font-black text-white tracking-widest uppercase break-words">{secret}</p>
            </div>
          )}
        </div>

        {/* Alert pointing to the tab */}
        <motion.div 
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.6 }}
          className="absolute -top-24 left-1/2 -ml-32 w-64 text-center pointer-events-none"
        >
            <div className="bg-white text-blue-600 font-bold text-sm px-4 py-2 rounded-md shadow-lg border-2 border-blue-600 relative inline-block">
              Pull up to see secret word
              {/* Tooltip triangle */}
              <div className="absolute -bottom-2 left-1/2 -ml-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-600"></div>
            </div>
        </motion.div>

        {/* The Pull Tab */}
        <div 
          className="absolute -top-10 left-1/2 -ml-16 w-32 h-10 bg-blue-600 rounded-t-xl border-2 border-b-0 border-blue-500 flex flex-row items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_-5px_15px_rgba(0,0,0,0.5)]"
        >
          <ChevronUp className="text-white w-8 h-8" />
        </div>
      </motion.div>

      {/* Main Clue Input Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 pb-16">
        <Fingerprint className="w-16 h-16 text-blue-500 mb-8" />
        
        {!isMyTurn ? (
          <div className="border-2 border-neutral-700 bg-neutral-900/50 p-6 w-full">
            <p className="text-xl font-bold text-neutral-400">
              Waiting for Team {currentTeamTurn} to submit their clue...
            </p>
            <p className="mt-8 text-neutral-400 font-bold text-sm uppercase tracking-widest animate-pulse flex items-center justify-center">
              Pull blue tab up for role <ChevronUp className="w-4 h-4 ml-1" />
            </p>
          </div>
        ) : isLeader ? (
          <form onSubmit={handleSubmit} className="w-full">
            <p className="text-xl font-bold mb-4">Round {round}: Enter your 1-word clue</p>
            <div className="flex w-full">
              <input
                type="text"
                maxLength={30}
                value={clue}
                onChange={(e) => setClue(e.target.value.replace(/\s/g, ''))} // Prevent spaces
                disabled={hasSubmittedClue}
                placeholder="describe your word..."
                className="flex-1 bg-neutral-900 border-2 border-r-0 border-blue-500 p-4 text-2xl font-bold text-white outline-none disabled:opacity-50 min-w-0 rounded-l-md"
              />
              <button
                type="submit"
                disabled={!clue.trim() || hasSubmittedClue}
                className="bg-blue-600 border-2 border-blue-500 px-6 flex items-center justify-center disabled:opacity-50 hover:bg-blue-500 transition-colors shrink-0 rounded-r-md"
              >
                <Send className="w-8 h-8 text-white" />
              </button>
            </div>
            {!hasSubmittedClue && (
              <p className="mt-8 text-neutral-400 font-bold text-sm uppercase tracking-widest animate-pulse flex items-center justify-center">
                Pull blue tab up for role <ChevronUp className="w-4 h-4 ml-1" />
              </p>
            )}
          </form>
        ) : (
          <div className="border-2 border-neutral-700 bg-neutral-900/50 p-6 w-full">
            <p className="text-xl font-bold text-neutral-400">Your Team Leader is typing the clue...</p>
            <p className="mt-8 text-neutral-400 font-bold text-sm uppercase tracking-widest animate-pulse flex items-center justify-center">
              Pull blue tab up for role <ChevronUp className="w-4 h-4 ml-1" />
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderVotingPhase = () => (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center w-full px-4">
      <h2 className="text-4xl font-black text-red-500 tracking-widest mb-4">Sabotage Round</h2>
      
      <p className="text-xl font-bold mb-8">
        {isImposter ? "Cast a fake vote to blend in!" : "Who is the Imposter? Vote now!"}
      </p>
      {isLeader ? (
        <div className="grid grid-cols-2 gap-4 w-full">
          {['A', 'B', 'C', 'D'].filter(t => t !== team).map(t => {
            const isSelected = votedTeam === t;
            const isDisabled = votedTeam !== null;
            return (
              <button
                key={t}
                onClick={() => handleVote(t)}
                disabled={isDisabled}
                className={`border-2 p-6 text-2xl font-black uppercase transition-colors ${
                  isSelected 
                    ? 'border-red-500 bg-red-500/20 text-red-500' 
                    : isDisabled 
                      ? 'border-neutral-700 bg-neutral-900 text-neutral-600 opacity-50'
                      : 'border-neutral-500 bg-neutral-800 hover:border-red-500 hover:bg-red-500/20 hover:text-red-500'
                }`}
              >
                Team {t}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xl font-bold text-neutral-400">Your Team Leader is voting...</p>
      )}
    </div>
  );

  const renderRevealPhase = () => {
    const isCorrect = correctTeams.includes(team);
    const wasImposter = isImposter;
    
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center w-full px-4">
        {wasImposter ? (
          <div className="border-2 border-red-500 bg-red-500/20 p-8 w-full flex flex-col items-center">
            <Fingerprint className="w-20 h-20 text-red-500 mb-4" />
            <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest mb-2">You were the Imposter</h2>
          </div>
        ) : (
          <div className={`border-2 p-8 w-full flex flex-col items-center ${isCorrect ? 'border-green-500 bg-green-500/20' : 'border-neutral-500 bg-neutral-800'}`}>
            <h2 className={`text-4xl font-black uppercase tracking-widest mb-2 ${isCorrect ? 'text-green-500' : 'text-neutral-400'}`}>
              {isCorrect ? 'CORRECT!' : 'WRONG!'}
            </h2>
            <p className="text-xl font-bold">The Imposter was Team {imposterTeam}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col font-sans text-white relative z-10">
      {subPhase === 'CLUE_PHASE' && renderCluePhase()}
      {subPhase === 'VOTING_PHASE' && renderVotingPhase()}
      {subPhase === 'REVEAL_PHASE' && renderRevealPhase()}
    </div>
  );
}
