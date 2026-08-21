import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { battleBackgroundStyle } from '@/lib/lobbyScenery';
import { Fingerprint } from 'lucide-react';

export default function ImposterHost({ imposterData, background, onNextRound }) {
  const { subPhase, round, teams, teamNames, clues, votes, correctTeams, imposterTeam, secret, currentTeamTurn } = imposterData;

  const [clueQueue, setClueQueue] = React.useState([]);
  const [currentClue, setCurrentClue] = React.useState(null);
  const processedCluesRef = React.useRef({});

  React.useEffect(() => {
    const newQueueItems = [];
    Object.keys(clues).forEach(r => {
      Object.keys(clues[r]).forEach(team => {
        const clueText = clues[r][team];
        const clueKey = `${r}-${team}`;
        if (clueText && !processedCluesRef.current[clueKey]) {
          processedCluesRef.current[clueKey] = true;
          newQueueItems.push({ round: r, team, text: clueText });
        }
      });
    });

    if (newQueueItems.length > 0) {
      setClueQueue(prev => [...prev, ...newQueueItems]);
    }
  }, [clues]);

  React.useEffect(() => {
    if (!currentClue && clueQueue.length > 0) {
      setCurrentClue(clueQueue[0]);
      setClueQueue(prev => prev.slice(1));
    }
  }, [clueQueue, currentClue]);

  React.useEffect(() => {
    if (currentClue) {
      const timer = setTimeout(() => {
        setCurrentClue(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentClue]);

  const isPlayingClues = currentClue !== null || clueQueue.length > 0;
  const displayPhase = (subPhase === 'VOTING_PHASE' && isPlayingClues) ? 'CLUE_PHASE' : subPhase;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-zk-black text-white overflow-hidden relative p-8">
      
      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-12 mt-8">
          <div className="flex items-center gap-4 mb-2">
            <Fingerprint className="text-blue-500 w-12 h-12" />
            <h1 className="text-5xl font-black tracking-widest">Guess the Imposter</h1>
            <Fingerprint className="text-blue-500 w-12 h-12" />
          </div>
          {displayPhase === 'CLUE_PHASE' && (
            <p className="text-2xl text-neutral-400 font-bold tracking-wider">Round {round} of 3 - Submitting Clues</p>
          )}
          {displayPhase === 'VOTING_PHASE' && (
            <p className="text-2xl text-red-500 font-bold tracking-wider animate-pulse">Voting Phase: Catch the Imposter!</p>
          )}
        </div>

        {/* Clue Grid */}
        <div className="flex-1 w-full flex items-center justify-center">
          {displayPhase === 'REVEAL_PHASE' ? (
            <div className="flex flex-col items-center">
              <h2 className="text-6xl font-black text-zk-red mb-8 tracking-widest">
                The Imposter was Team {imposterTeam}!
              </h2>
              <div className="text-3xl text-neutral-300 font-bold mb-12">
                Secret Word: <span className="text-white text-4xl">{secret}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {teams.filter(t => t !== imposterTeam).map(t => {
                  const isCorrect = correctTeams.includes(t);
                  return (
                    <div key={t} className={`p-6 border-2 flex flex-col items-center justify-center ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                      <p className="text-xl font-bold mb-2">{teamNames[t] || `Team ${t}`}</p>
                      <p className="text-2xl font-black">{isCorrect ? 'Correct' : 'Wrong'}</p>
                    </div>
                  );
                })}
              </div>
              {(!correctTeams || correctTeams.length === 0) && onNextRound && (
                <button
                  onClick={onNextRound}
                  className="mt-12 bg-blue-600 hover:bg-blue-500 border-2 border-blue-400 text-white font-black text-2xl px-12 py-4 rounded-lg tracking-wide uppercase transition-colors shadow-lg active:scale-95 z-50 pointer-events-auto cursor-pointer"
                >
                  Proceed to Next Question
                </button>
              )}
            </div>
          ) : displayPhase === 'VOTING_PHASE' ? (
            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
              {teams.map(t => (
                <div key={t} className={`p-8 border-2 flex items-center justify-between ${votes[t] ? 'border-blue-500 bg-blue-500/20' : 'border-neutral-700 bg-neutral-900/50'}`}>
                  <span className="text-3xl font-black text-white">{teamNames[t] || `Team ${t}`}</span>
                  {votes[t] ? (
                    <span className="text-xl text-blue-400 font-bold tracking-widest">Voted</span>
                  ) : (
                    <span className="text-xl text-neutral-600 font-bold tracking-widest animate-pulse">Voting...</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 w-full">
              <AnimatePresence mode="wait">
                {currentClue ? (
                  <motion.div 
                    key={`${currentClue.round}-${currentClue.team}`}
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.1, opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <p className="text-4xl text-blue-400 font-bold tracking-widest mb-6">
                      {teamNames[currentClue.team] || `Team ${currentClue.team}`}
                    </p>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight break-words max-w-4xl px-4">
                      {currentClue.text}
                    </h2>
                  </motion.div>
                ) : (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <p className="text-3xl text-neutral-400 font-bold tracking-widest animate-pulse">
                      Waiting for {teamNames[currentTeamTurn] || `Team ${currentTeamTurn}`} to submit their clue...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
