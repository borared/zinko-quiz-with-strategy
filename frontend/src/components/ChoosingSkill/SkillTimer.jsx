import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSocket } from "../../context/SocketContext";

const SkillTimer = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const { getSocket, isConnected } = useSocket();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected) return;

    const onTick = (data) => setTimeLeft(data.timeLeft);
    socket.on("game:skill-timer-tick", onTick);

    return () => socket.off("game:skill-timer-tick", onTick);
  }, [getSocket, isConnected]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.45, type: "spring", stiffness: 300, damping: 20 }}
      className="absolute bottom-2 left-0 w-full flex flex-col items-center justify-center z-20"
    >
      <div className="bg-white border-4 border-[#1a1a1a] rounded-2xl px-6 py-2 flex items-center justify-center mb-3 shadow-[4px_4px_0px_#1a1a1a]">
        <svg
          className="w-6 h-6 text-[#5D3FD3] mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-[#5D3FD3] font-black text-2xl tracking-widest">
          {formatTime(timeLeft)}
        </span>
      </div>
      <span
        className="font-black text-white uppercase tracking-widest text-sm"
        style={{ WebkitTextStroke: "1px #1a1a1a" }}
      >
        Waiting for other players...
      </span>
    </motion.div>
  );
};

export default SkillTimer;
