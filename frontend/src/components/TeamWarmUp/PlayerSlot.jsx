import { Users, Zap } from 'lucide-react';

// Individual player slot in the 2x2 grid
const PlayerSlot = ({ filled, isFirst, color }) => {
  const darkColor = color === 'green' ? '#1a7a2e' : '#8b1a1a';

  return (
    <div
      className="w-full aspect-square border-[2px] border-dashed flex items-center justify-center"
      style={{ borderColor: darkColor, backgroundColor: darkColor }}
    >
      {isFirst && (
        color === 'green'
          ? <Users size={28} color="white" opacity={0.9} />
          : <Zap size={28} color="white" opacity={0.9} />
      )}
    </div>
  );
};

export default PlayerSlot;
