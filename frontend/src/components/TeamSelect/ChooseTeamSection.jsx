import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTransition } from '../../context/TransitionContext';
import TeamHeader from './TeamHeader';
import TeamCard from './TeamCard';
import PlayerCount from './PlayerCount';
import WaitingBar from './WaitingBar';

// Reusable spring bounce variant
const bounceIn = (delay = 0) => ({
  initial: { scale: 0, opacity: 0, y: 60 },
  animate: { scale: 1, opacity: 1, y: 0 },
  transition: {
    delay,
    type: 'spring',
    stiffness: 400,
    damping: 18,
    mass: 0.8,
  },
});

const ChooseTeamSection = () => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const { blinkTo } = usePageTransition();

  const countA = 12;
  const countB = 14;

  const handleJoin = (team) => {
    setSelectedTeam(team);
    blinkTo('/team-warmup');
  };

  return (
    <div className="relative w-full h-screen max-h-screen overflow-hidden bg-zk-yellow flex flex-col items-center justify-center font-sans px-6 pb-14">

      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ y: [-12, 12, -12], x: [-6, 6, -6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#D4A322]/50 border-[3px] border-zk-black/10 pointer-events-none"
      />
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [45, 60, 45] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-24 right-12 w-16 h-16 md:w-24 md:h-24 rotate-45 bg-[#FFB020]/70 border-[3px] border-zk-black/10 pointer-events-none"
      />
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-6 w-8 h-8 rounded-full bg-[#5D3FD3]/20 border-[2px] border-zk-black/10 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">

        {/* Header bounces in first */}
        <motion.div {...bounceIn(0)} className="w-full flex justify-center">
          <TeamHeader />
        </motion.div>

        {/* Cards Row — each card bounces in with a slight delay */}
        <div className="flex flex-row items-start justify-center gap-6 w-full">
          <motion.div {...bounceIn(0.1)} className="flex-1 flex justify-center">
            <TeamCard
              team="A"
              badge="POWER"
              icon="⚡"
              bgColor="#4ADE80"
              onJoin={() => handleJoin('A')}
            />
          </motion.div>
          <motion.div {...bounceIn(0.22)} className="flex-1 flex justify-center">
            <TeamCard
              team="B"
              badge="SPEED"
              icon="🚀"
              bgColor="#F87171"
              onJoin={() => handleJoin('B')}
            />
          </motion.div>
        </div>

        {/* Player count bounces in last */}
        <motion.div {...bounceIn(0.35)} className="w-full flex justify-center">
          <PlayerCount countA={countA} countB={countB} />
        </motion.div>

      </div>

      {/* Waiting bar slides up from the bottom */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute bottom-0 left-0 w-full"
      >
        <WaitingBar />
      </motion.div>

    </div>
  );
};

export default ChooseTeamSection;

