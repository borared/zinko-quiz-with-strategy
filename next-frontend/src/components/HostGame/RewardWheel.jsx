"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useSocketStore } from '@/store/useSocketStore';
import { SKILLS } from '@/config/skills';

const REWARDS = [
  { id: "BONUS_POINTS_20", label: "+20% Points!", sublabel: "Next Round", color: "#FFCD29", textColor: "#000000" },
  { id: "SKILL_CHARGE",  label: "Skill Charge!", sublabel: "+1 Charge", color: "#22c55e", textColor: "#ffffff" },
  { id: "NOTHING",       label: "Nothing!", sublabel: "Better luck next time", color: "#EF4444", textColor: "#ffffff" },
];

const SEGMENT_COUNT = REWARDS.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT; // 120 degrees each

// Builds an SVG pie slice path
function describeArc(cx, cy, r, startAngle, endAngle) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`;
}

function WheelSVG({ rotation }) {
  const cx = 200, cy = 200, r = 185;

  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
        {REWARDS.map((reward, i) => {
          const startAngle = i * SEGMENT_ANGLE - 90;
          const endAngle = startAngle + SEGMENT_ANGLE;
          const midAngle = startAngle + SEGMENT_ANGLE / 2;
          const midRad = (midAngle * Math.PI) / 180;
          const textR = r * 0.62;
          const tx = cx + textR * Math.cos(midRad);
          const ty = cy + textR * Math.sin(midRad);

          return (
            <g key={i}>
              {/* Segment fill */}
              <path
                d={describeArc(cx, cy, r, startAngle, endAngle)}
                fill={reward.color}
                stroke="#000"
                strokeWidth="3"
              />
              {/* Label */}
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                fill={reward.textColor}
                fontSize="22"
                fontWeight="900"
                fontFamily="Arial Black, Arial, sans-serif"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
              >
                <tspan x={tx} dy="-10">{reward.label}</tspan>
                <tspan x={tx} dy="24" fontSize="20" fontWeight="bold" opacity="0.9" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '1px' }}>{reward.sublabel}</tspan>
              </text>
            </g>
          );
        })}

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#000" strokeWidth="6" />

        {/* Divider lines for extra crispness */}
        {REWARDS.map((_, i) => {
          const angle = i * SEGMENT_ANGLE - 90;
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={`div-${i}`}
              x1={cx} y1={cy}
              x2={cx + r * Math.cos(rad)}
              y2={cy + r * Math.sin(rad)}
              stroke="#000" strokeWidth="3"
            />
          );
        })}
      </g>

      {/* Center hub */}
      <circle cx={cx} cy={cy} r={36} fill="#FFCD29" stroke="#000" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={18} fill="#fff" stroke="#000" strokeWidth="3" />
    </svg>
  );
}

export default function RewardWheel({ pin, winnerTeam, spinnerName, isSpinner, preSelectedRewardId, externalSpinTrigger, onRewardClaimed, playerId, isHost }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const rotationRef = React.useRef(0); // avoid stale closure
  const [wonReward, setWonReward] = useState(null);
  const [showSkillSelection, setShowSkillSelection] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const { getSocket } = useSocketStore();

  // When another client spins (externalSpinTrigger), trigger the spin visually
  useEffect(() => {
    if (externalSpinTrigger && !isSpinning && !wonReward) {
      doSpin();
    }
  }, [externalSpinTrigger]);

  const doSpin = () => {
    if (isSpinning || wonReward) return;
    setIsSpinning(true);

    // Pick winning index
    let winIndex;
    if (preSelectedRewardId) {
      winIndex = REWARDS.findIndex(r => r.id === preSelectedRewardId);
      if (winIndex === -1) winIndex = Math.floor(Math.random() * SEGMENT_COUNT);
    } else {
      winIndex = Math.floor(Math.random() * SEGMENT_COUNT);
    }

    // ── Correct landing math ──────────────────────────────────────────────────
    // The top of the wheel visually corresponds to -90 degrees (or 270) in the SVG.
    // The center of the winning segment in the unrotated SVG is:
    const centerAngle = (winIndex + 0.5) * SEGMENT_ANGLE - 90;
    
    // We want to rotate the SVG clockwise by `R` so that the center of the segment
    // reaches the top (270 degrees). So: (centerAngle + R) = 270
    // Therefore, R = 270 - centerAngle
    const landingAngle = (270 - centerAngle + 360 * 2) % 360;

    // How far do we still need to turn past the current remainder?
    const currentRemainder = ((rotationRef.current % 360) + 360) % 360;
    let delta = landingAngle - currentRemainder;
    if (delta <= 0) delta += 360; // always go forward

    const fullSpins = 360 * 8;
    const newRotation = rotationRef.current + fullSpins + delta;

    rotationRef.current = newRotation;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const reward = REWARDS[winIndex];
      setWonReward(reward);

      if (reward.id !== "NOTHING") {
        import("canvas-confetti").then((mod) => {
          const confetti = mod.default || mod;
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            zIndex: 100,
            colors: ['#FFCD29', '#ffffff', '#22c55e', '#ef4444']
          });
        });
      }

      if (isHost) {
        if (reward.id !== "SKILL_CHARGE") {
          const socket = getSocket();
          if (socket) {
            socket.emit("host:claim-minigame-reward", {
              pin,
              team: winnerTeam,
              rewardType: reward.id,
            });
          }
        }
      } else if (isSpinner && reward.id === "SKILL_CHARGE") {
        setShowSkillSelection(true);
      }
    }, 5500);
  };

  const handleClaimSkill = () => {
    if (!selectedSkillId) return;
    const socket = getSocket();
    if (socket) {
      socket.emit("player:claim-minigame-reward", {
        pin,
        playerId: playerId || socket.id,
        rewardType: "SKILL_CHARGE",
        detail: selectedSkillId,
      });
    }
    setShowSkillSelection(false);
  };

  const handleSpinClick = () => {
    if (!isSpinner || isSpinning || wonReward) return;
    // Tell server so all others see it spin too
    const socket = getSocket();
    if (socket) {
      socket.emit("player:spin-wheel", { pin, playerId: playerId || socket.id });
    }
    doSpin();
  };

  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex flex-col items-center justify-center bg-zk-blue">

      {/* Header */}
      <div className="z-10 mb-6 text-center px-8 flex flex-col items-center">
        <h2 className="gasoek-one-regular text-white drop-shadow-md uppercase tracking-wide flex items-center gap-3 justify-center" style={{ fontSize: "3rem", lineHeight: 1 }}>
          <Trophy size={40} strokeWidth={3} className="text-zk-yellow drop-shadow-sm" />
          Team {winnerTeam} Wins!
        </h2>
        <div className="h-12 mt-2 flex items-center justify-center">
          {wonReward && (
            <p className="text-white font-bold text-4xl drop-shadow-sm" style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>
              Reward: {wonReward.label}
            </p>
          )}
        </div>
      </div>

      {/* Wheel area */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Pointer arrow */}
        <div className="relative z-20 mb-[-18px]">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "22px solid transparent",
              borderRight: "22px solid transparent",
              borderTop: "42px solid #EF4444",
              filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.7))",
            }}
          />
        </div>

        {/* The wheel */}
        <motion.div
          className="w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full border-[10px] border-black cursor-pointer relative"
          animate={{ rotate: rotation }}
          transition={{ duration: 5.5, ease: [0.05, 0.95, 0.2, 1.0] }}
          onClick={handleSpinClick}
          style={{ userSelect: "none" }}
        >
          {/* Invisible overlay to block clicks if not spinner */}
          {!isSpinner && !isSpinning && <div className="absolute inset-0 z-50" />}
          <WheelSVG rotation={0} />
        </motion.div>

        {/* Spin prompt for spinner */}
        {isSpinner && !isSpinning && !wonReward && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 font-bold text-4xl text-white uppercase tracking-widest drop-shadow-md"
            style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
          >
            TAP THE WHEEL TO SPIN!
          </motion.div>
        )}
      </div>

      {/* Results and Controls */}
      {wonReward && (
        <>
          {/* Floating Reward Tag at Bottom Right */}
          <motion.div
            initial={{ x: 50, opacity: 0, rotate: 2 }} 
            animate={{ x: 0, opacity: 1, rotate: 2, y: [0, -8, 0] }} 
            transition={{ 
              x: { type: 'spring', stiffness: 200 },
              opacity: { duration: 0.5 },
              y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
            }}
            className="absolute bottom-6 right-6 z-20 px-8 py-4 rounded-3xl border-[5px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center"
            style={{ background: wonReward.color }}
          >
            <p className="gasoek-one-regular uppercase tracking-wider text-4xl" style={{ color: wonReward.textColor }}>
              {wonReward.label}
            </p>
            <p className="font-bold mt-1 text-3xl opacity-90" style={{ color: wonReward.textColor, fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}>
              {wonReward.sublabel}
            </p>
          </motion.div>

          {/* Centered Continue Button for Host */}
          {isHost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 z-20"
            >
              <button
                onClick={onRewardClaimed}
                className="px-10 py-3 bg-[#1e3a8a] text-white text-4xl font-bold rounded-2xl border-[4px] border-black shadow-[0_6px_0_0_#000] hover:-translate-y-1 active:translate-y-[6px] active:shadow-none transition-all tracking-widest drop-shadow-sm"
                style={{ fontFamily: 'var(--font-amatic-sc)' }}
              >
                Continue Game →
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Skill Selection Modal for Spinner */}
      {showSkillSelection && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zk-blue border-[4px] border-black shadow-[8px_8px_0_0_#000] rounded-3xl p-6 md:p-8 flex flex-col items-center w-full max-w-2xl"
          >
            <h3 className="gasoek-one-regular text-white text-3xl md:text-5xl uppercase mb-6 text-center" style={{ textShadow: "2px 2px 0 #000" }}>
              Choose a Skill to Charge!
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
              {SKILLS.map((skill) => {
                const Icon = skill.icon;
                const isSelected = selectedSkillId === skill.id;
                
                return (
                  <motion.div
                    key={skill.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSkillId(skill.id)}
                    className={`cursor-pointer rounded-2xl p-4 flex flex-col items-center text-center border-[4px] transition-all duration-200 ${
                      isSelected 
                        ? 'border-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                        : 'border-black bg-black/40 hover:bg-black/20 shadow-[4px_4px_0_0_#000]'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center border-[3px] border-black mb-3 shadow-[2px_2px_0_0_#000]" style={{ backgroundColor: skill.color }}>
                      <Icon size={32} className="text-white" />
                    </div>
                    <span className="font-bold text-white text-lg tracking-wider" style={{ fontFamily: 'var(--font-amatic-sc)' }}>
                      {skill.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={handleClaimSkill}
              disabled={!selectedSkillId}
              className={`px-10 py-3 text-white text-4xl font-bold rounded-2xl border-[4px] border-black transition-all tracking-widest ${
                selectedSkillId 
                  ? 'bg-[#22c55e] shadow-[0_6px_0_0_#000] hover:-translate-y-1 active:translate-y-[6px] active:shadow-none cursor-pointer' 
                  : 'bg-gray-500 opacity-50 cursor-not-allowed shadow-[0_6px_0_0_#000]'
              }`}
              style={{ fontFamily: 'var(--font-amatic-sc)' }}
            >
              Confirm & Claim
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
