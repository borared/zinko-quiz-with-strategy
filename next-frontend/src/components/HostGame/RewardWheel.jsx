"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

const REWARDS = [
  { id: "DOUBLE_POINTS", label: "x2 Points!", sublabel: "Next Round", color: "#FFCD29", textColor: "#000000" },
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
      <defs>
        <filter id="wheel-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="rgba(0,0,0,0.6)" />
        </filter>
      </defs>

      <g transform={`rotate(${rotation}, ${cx}, ${cy})`} filter="url(#wheel-shadow)">
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
                <tspan x={tx} dy="24" fontSize="14" fontWeight="700" opacity="0.85">{reward.sublabel}</tspan>
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

export default function RewardWheel({ pin, winnerTeam, spinnerName, isSpinner, preSelectedRewardId, externalSpinTrigger, onRewardClaimed, playerId }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const rotationRef = React.useRef(0); // avoid stale closure
  const [wonReward, setWonReward] = useState(null);
  const { getSocket } = useSocket();

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

      if (isSpinner) {
        const socket = getSocket();
        if (socket) {
          socket.emit("host:claim-minigame-reward", {
            pin,
            team: winnerTeam,
            rewardType: reward.id,
          });
        }
      }
    }, 5500);
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
    <div className="absolute inset-0 z-50 overflow-hidden flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)" }}>

      {/* Spinning sunburst */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] opacity-15 pointer-events-none"
        style={{ backgroundImage: "repeating-conic-gradient(from 0deg, transparent 0deg 10deg, white 10deg 20deg)", animation: "spin 60s linear infinite" }}
      />

      {/* Header */}
      <div className="z-10 mb-6 text-center px-8 py-4 rounded-3xl border-[5px] border-black shadow-[0_8px_0_0_#000]" style={{ background: "#FFCD29" }}>
        <h2 className="gasoek-one-regular text-black uppercase tracking-wide flex items-center gap-3 justify-center" style={{ fontSize: "2.5rem", lineHeight: 1 }}>
          <Trophy size={40} strokeWidth={3} className="text-black" />
          Team {winnerTeam} Wins!
        </h2>
        <p className="font-zk-bold text-black/80 text-lg mt-1">
          {wonReward
            ? `Reward: ${wonReward.label}`
            : isSpinning
            ? "Spinning..."
            : isSpinner
            ? "Tap the wheel to spin!"
            : `Waiting for ${spinnerName} to spin...`}
        </p>
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
          className="w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full border-[10px] border-black shadow-[0_16px_48px_rgba(0,0,0,0.6)] cursor-pointer relative"
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
            className="mt-6 px-8 py-3 rounded-2xl border-[4px] border-black shadow-[0_6px_0_0_#000] font-zk-bold text-xl text-black uppercase tracking-widest"
            style={{ background: "#FFCD29" }}
          >
            👆 TAP THE WHEEL TO SPIN!
          </motion.div>
        )}
      </div>

      {/* Result banner */}
      {wonReward && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="z-20 mt-6 px-10 py-5 rounded-3xl border-[5px] border-black shadow-[0_10px_0_0_#000] text-center"
          style={{ background: wonReward.color }}
        >
          <p className="gasoek-one-regular uppercase tracking-wider text-4xl" style={{ color: wonReward.textColor }}>
            {wonReward.label}
          </p>
          <p className="font-zk-bold mt-1 text-lg opacity-90" style={{ color: wonReward.textColor }}>
            {wonReward.sublabel}
          </p>
          {!isSpinner && !externalSpinTrigger /* host logic trick */ && (
            <button
              onClick={onRewardClaimed}
              className="mt-4 px-8 py-3 bg-[#1e3a8a] text-white font-zk-bold text-xl rounded-xl border-[4px] border-black shadow-[0_5px_0_0_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Continue Game →
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
