import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Trophy, Users, Home, Crown } from "lucide-react";

// ── Answer color config matching the Figma ──────────────────────────────────
const ANSWER_COLORS = [
  { bg: "#5D3FD3", label: "A", text: "white" },   // Purple
  { bg: "#FFCD29", label: "B", text: "#1a1a1a" },  // Yellow
  { bg: "#E74C3C", label: "C", text: "white" },    // Red
  { bg: "#27AE60", label: "D", text: "white" },     // Green
];

const MEDAL = ["🥇", "🥈", "🥉"];

// ── Countdown Ring (SVG) ────────────────────────────────────────────────────
function CountdownRing({ timeLeft, total }) {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const dashOffset = circ * (1 - progress);
  const color =
    timeLeft <= 5 ? "#FF4B4B" : timeLeft <= 10 ? "#F39C12" : "#FFCD29";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112">
        <circle
          cx="56" cy="56" r={radius}
          strokeWidth="7" stroke="rgba(0,0,0,0.15)" fill="none"
        />
        <circle
          cx="56" cy="56" r={radius}
          strokeWidth="7" stroke={color} fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <motion.span
        key={timeLeft}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="text-4xl font-black z-10"
        style={{ color }}
      >
        {timeLeft}
      </motion.span>
    </div>
  );
}

// ── Answer Bar Chart (Result phase) ─────────────────────────────────────────
function AnswerBarChart({ stats, revealed }) {
  if (!stats || stats.length === 0) return null;
  const maxCount = Math.max(1, ...stats.map((s) => s.count));

  return (
    <div className="flex items-end justify-center gap-6 h-40">
      {stats.map((s, i) => {
        const color = ANSWER_COLORS[i] || ANSWER_COLORS[0];
        const pct = (s.count / maxCount) * 100;
        return (
          <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
            <AnimatePresence>
              {revealed && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-black"
                  style={{ color: s.isCorrect ? "#27AE60" : "#E74C3C" }}
                >
                  {s.count}
                </motion.span>
              )}
            </AnimatePresence>
            <div className="w-full bg-black/10 rounded-t-xl overflow-hidden h-32 flex items-end relative">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                className="w-full rounded-t-xl relative"
                style={{
                  backgroundColor: color.bg,
                  boxShadow: s.isCorrect && revealed ? "0 0 20px rgba(39,174,96,0.6)" : "none",
                  border: s.isCorrect && revealed ? "3px solid #27AE60" : "none",
                }}
              >
                {s.isCorrect && revealed && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl">✅</div>
                )}
              </motion.div>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center border-[3px] border-black font-black text-lg"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {color.label}
            </div>
            <p className="text-black/60 text-xs text-center truncate w-full px-1 font-bold">
              {s.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HostGame — Main Component
// ═════════════════════════════════════════════════════════════════════════════
export default function HostGame() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getSocket, isConnected } = useSocket();

  const TOTAL_TIME = 20;

  const [phase, setPhase] = useState("SKILL_PICK");
  const [question, setQuestion] = useState(location.state?.question || null);
  const [skillTimeLeft, setSkillTimeLeft] = useState(20);

  // Re-register as host if socket reconnects
  useEffect(() => {
    if (isConnected) {
      const socket = getSocket();
      socket?.emit("host:reconnect", { pin });
    }
  }, [isConnected, pin, getSocket]);

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState([]);
  const [correctId, setCorrectId] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isFinalLeaderboard, setIsFinalLeaderboard] = useState(false);

  // ── Skill pick countdown ────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "SKILL_PICK") {
      const interval = setInterval(() => {
        setSkillTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "SKILL_PICK") {
      const socket = getSocket();
      if (!socket) return;
      socket.emit("host:skill-timer-sync", { pin, timeLeft: skillTimeLeft });

      if (skillTimeLeft <= 0) {
        socket.emit("game:start", { pin });
      }
    }
  }, [skillTimeLeft, phase, pin, getSocket]);

  // ── Error listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onError = (err) => {
      alert(`Server Error: ${err.message}`);
    };
    socket.on("error", onError);

    return () => {
      socket.off("error", onError);
    };
  }, [getSocket]);

  // ── Socket listeners ────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onQuestion = (data) => {
      setQuestion(data);
      setPhase("QUESTION");
      setTimeLeft(data.timeSeconds || TOTAL_TIME);
      setAnswered(0);
      setTotal(0);
      setStats([]);
      setCorrectId(null);
    };

    const onTimerTick = ({ timeLeft: t }) => setTimeLeft(t);

    const onAnswerProgress = ({ answered: a, total: t }) => {
      setAnswered(a);
      setTotal(t);
    };

    const onRevealResults = ({
      correctAnswerId,
      stats: s,
      leaderboard: lb,
    }) => {
      setCorrectId(correctAnswerId);
      setStats(s);
      setLeaderboard(lb);
      setPhase("RESULT");
    };

    const onLeaderboard = ({ leaderboard: lb, isIntermediate }) => {
      setLeaderboard(lb);
      setIsFinalLeaderboard(!isIntermediate);
      setPhase("LEADERBOARD");
    };

    const onFinished = ({ leaderboard: lb }) => {
      setLeaderboard(lb);
      setIsFinalLeaderboard(true);
      setPhase("LEADERBOARD");
    };

    socket.on("game:question", onQuestion);
    socket.on("game:timer-tick", onTimerTick);
    socket.on("host:answer-progress", onAnswerProgress);
    socket.on("game:reveal-results", onRevealResults);
    socket.on("game:leaderboard", onLeaderboard);
    socket.on("game:finished", onFinished);

    return () => {
      socket.off("game:question", onQuestion);
      socket.off("game:timer-tick", onTimerTick);
      socket.off("host:answer-progress", onAnswerProgress);
      socket.off("game:reveal-results", onRevealResults);
      socket.off("game:leaderboard", onLeaderboard);
      socket.off("game:finished", onFinished);
    };
  }, [getSocket]);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleShowLeaderboard = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    getSocket().emit("host:show-leaderboard", { pin });
  }, [pin, getSocket, isTransitioning]);

  const handleNextQuestion = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    getSocket().emit("game:next-question", { pin });
  }, [pin, getSocket, isTransitioning]);

  const handleEndGame = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    getSocket().emit("host:end-game", { pin });
    navigate("/dashboard");
  }, [navigate, pin, getSocket, isTransitioning]);

  // Reset transitioning state when phase actually changes
  useEffect(() => {
    setIsTransitioning(false);
  }, [phase]);

  // ── Auto-advance timers ─────────────────────────────────────────────────
  useEffect(() => {
    let timeout;
    if (phase === "RESULT") {
      timeout = setTimeout(() => {
        handleShowLeaderboard();
      }, 7000); // 7 seconds on results screen
    } else if (phase === "LEADERBOARD" && !isFinalLeaderboard) {
      timeout = setTimeout(() => {
        handleNextQuestion();
      }, 7000); // 7 seconds on leaderboard screen
    }
    return () => clearTimeout(timeout);
  }, [phase, isFinalLeaderboard, handleShowLeaderboard, handleNextQuestion]);

  // ── Loading state ───────────────────────────────────────────────────────
  if (!question && phase !== "SKILL_PICK") {
    return (
      <div className="min-h-screen bg-zk-yellow flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-[5px] border-zk-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black uppercase tracking-widest text-zk-black/50">
            Loading game...
          </p>
        </div>
      </div>
    );
  }

  // ── Team score helpers ──────────────────────────────────────────────────
  const teamA = leaderboard.filter((p) => p.team === "A");
  const teamB = leaderboard.filter((p) => p.team === "B");
  const teamAScore = teamA.reduce((sum, p) => sum + (p.score || 0), 0);
  const teamBScore = teamB.reduce((sum, p) => sum + (p.score || 0), 0);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative font-sans">

      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════════════════════════════════════
            SKILL PICK PHASE
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "SKILL_PICK" && (
          <motion.div
            key="skill_pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-zk-yellow flex flex-col items-center justify-center relative"
          >
            {/* Floating decorations */}
            <motion.div
              animate={{ y: [-12, 12, -12], rotate: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[8%] w-16 h-16 bg-[#5D3FD3] border-[4px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl"
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[15%] right-[10%] w-20 h-20 bg-[#3B68FF] border-[4px] border-zk-black shadow-[4px_4px_0_#000] rounded-full"
            />
            <motion.div
              animate={{ y: [-8, 8, -8], rotate: 45 }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] right-[15%] w-12 h-12 bg-[#E74C3C] border-[4px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl"
            />

            <motion.h1
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-[5rem] md:text-[8rem] font-black uppercase text-white tracking-wide permanent-marker-regular leading-none text-center z-10"
              style={{
                WebkitTextStroke: "5px #000",
                textShadow: "8px 8px 0 #000",
              }}
            >
              Skill Time
            </motion.h1>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-white border-[4px] border-zk-black shadow-[6px_6px_0_#000] rounded-xl px-12 py-6 flex flex-col items-center z-10"
            >
              <span className="text-zk-black/60 font-black uppercase tracking-widest text-sm mb-1">
                Pick your skill
              </span>
              <span
                className="text-6xl font-black text-[#5D3FD3]"
                style={{ WebkitTextStroke: "2px #000" }}
              >
                {skillTimeLeft}s
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            QUESTION PHASE — Figma style
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "QUESTION" && (
          <motion.div
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col relative"
            style={{
              backgroundImage: `url('/background_battle/city.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#C4962C",
            }}
          >
            {/* Warm overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

            <div className="relative z-10 flex flex-col flex-1 p-6 lg:p-8">

              {/* Top bar: Question counter | Timer | Answered */}
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl px-5 py-2">
                  <span className="text-zk-black/50 text-xs font-black uppercase tracking-widest">
                    Question
                  </span>
                  <p className="text-zk-black font-black text-xl">
                    {question.index + 1}{" "}
                    <span className="text-zk-black/30">/ {question.total}</span>
                  </p>
                </div>

                <CountdownRing timeLeft={timeLeft} total={TOTAL_TIME} />

                <div className="bg-white border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl px-5 py-2 text-right">
                  <span className="text-zk-black/50 text-xs font-black uppercase tracking-widest">
                    Answered
                  </span>
                  <p className="text-zk-black font-black text-xl">
                    <motion.span key={answered}>{answered}</motion.span>
                    <span className="text-zk-black/30"> / {total || "—"}</span>
                  </p>
                </div>
              </div>

              {/* Question Card (white card from Figma) */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white border-[4px] border-zk-black shadow-[8px_8px_0_#000] rounded-2xl overflow-hidden mb-6 flex-1 flex flex-col items-center justify-center"
              >
                {/* Image area (dark header) */}
                {question.imageUrl && (
                  <div className="w-full bg-[#2C3E50] flex items-center justify-center p-4 border-b-[3px] border-zk-black">
                    <img
                      src={question.imageUrl}
                      alt="Question"
                      className="max-h-48 rounded-xl object-cover"
                    />
                  </div>
                )}

                {/* Question text */}
                <div className="flex-1 flex items-center justify-center p-8">
                  <p className="text-2xl lg:text-4xl xl:text-5xl font-black text-zk-black text-center leading-tight uppercase">
                    {question.questionText}
                  </p>
                </div>
              </motion.div>

              {/* Answer tiles (2x2 Figma pill style) */}
              <div className="grid grid-cols-2 gap-4">
                {question.answers?.map((answer, i) => {
                  const color = ANSWER_COLORS[i] || ANSWER_COLORS[0];
                  return (
                    <motion.div
                      key={answer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.07 }}
                      className="flex items-center gap-4 rounded-2xl px-5 py-4 border-[3px] border-zk-black shadow-[4px_4px_0_#000]"
                      style={{ backgroundColor: color.bg }}
                    >
                      {/* Letter badge */}
                      <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center border-[2px] border-black/20 flex-shrink-0">
                        <span className="font-black text-lg" style={{ color: color.text }}>
                          {color.label}
                        </span>
                      </div>

                      {/* Answer text */}
                      <span
                        className="font-black text-lg lg:text-xl flex-1"
                        style={{ color: color.text }}
                      >
                        {answer.text}
                      </span>

                      {/* Radio circle */}
                      <div
                        className="w-8 h-8 rounded-full border-[3px] flex-shrink-0"
                        style={{ borderColor: color.text === "white" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)" }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            RESULT PHASE
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "RESULT" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col bg-zk-yellow relative"
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%), repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%)",
                backgroundSize: "30px 30px",
                backgroundPosition: "0 0, 15px 15px",
              }}
            />

            <div className="relative z-10 flex flex-col flex-1 p-8">
              <h2 className="text-center text-5xl font-black mb-2 text-zk-black uppercase permanent-marker-regular">
                Results
              </h2>
              <p className="text-center text-zk-black/40 mb-8 uppercase tracking-widest text-sm font-bold">
                Answer breakdown
              </p>

              {/* Bar chart */}
              <div className="bg-white border-[4px] border-zk-black shadow-[8px_8px_0_#000] rounded-2xl p-8 mb-6">
                <AnswerBarChart stats={stats} revealed={true} />
              </div>

              {/* Mini leaderboard */}
              <div className="bg-white border-[4px] border-zk-black shadow-[6px_6px_0_#000] rounded-2xl p-6 mb-6">
                <p className="text-zk-black/50 uppercase tracking-widest text-xs mb-4 font-black">
                  Top Players
                </p>
                <div className="flex gap-4">
                  {leaderboard.slice(0, 5).map((p, i) => (
                    <div
                      key={p.id}
                      className="flex-1 bg-zk-yellow/30 border-[2px] border-zk-black rounded-xl p-3 text-center"
                    >
                      <div className="text-xl mb-1">
                        {MEDAL[i] || `#${i + 1}`}
                      </div>
                      <p className="text-zk-black font-bold text-sm truncate">
                        {p.nickname}
                      </p>
                      <p className="text-[#5D3FD3] font-black text-sm">
                        {p.score.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleShowLeaderboard}
                  className="flex-1 py-4 bg-white border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl text-zk-black font-black text-lg uppercase tracking-widest hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_#000] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Trophy size={20} /> Leaderboard
                </button>
                <button
                  id="next-question-btn"
                  onClick={handleNextQuestion}
                  className="flex-1 py-4 bg-[#5D3FD3] border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl text-white font-black text-lg uppercase tracking-widest hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_#000] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  Next Question <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            LEADERBOARD PHASE — Figma Blue/Yellow Split
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "LEADERBOARD" && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col relative overflow-hidden"
          >
            {/* Blue top half */}
            <div className="absolute inset-x-0 top-0 h-[55%] bg-[#3B68FF]" />
            {/* Yellow bottom half */}
            <div className="absolute inset-x-0 bottom-0 h-[45%] bg-zk-yellow" />

            {/* Floating decorations */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 left-8 w-8 h-8 bg-zk-yellow rounded-full border-[3px] border-zk-black z-20"
            />
            <motion.div
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-12 right-10 w-10 h-10 bg-[#5D3FD3] rounded-full border-[3px] border-zk-black z-20"
            />

            <div className="relative z-10 flex flex-col flex-1 items-center px-6 pt-6 pb-8">
              {/* Title */}
              <motion.h2
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl md:text-6xl font-black text-white uppercase permanent-marker-regular mb-6 text-center"
                style={{
                  WebkitTextStroke: "3px #000",
                  textShadow: "4px 4px 0 #000",
                }}
              >
                {isFinalLeaderboard ? "Final Podium" : "Leaderboard"}
              </motion.h2>

              {/* Team panels container */}
              <div className="flex flex-1 w-full max-w-6xl gap-4 items-start relative">

                {/* Team A */}
                <motion.div
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="flex-1 flex flex-col items-center"
                >
                  {/* Crown for winning team */}
                  {teamAScore >= teamBScore && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="text-5xl mb-2"
                    >
                      👑
                    </motion.div>
                  )}

                  <div className="bg-[#27AE60] text-white font-black text-sm uppercase tracking-widest px-5 py-1.5 rounded-full border-[3px] border-zk-black shadow-[3px_3px_0_#000] mb-4">
                    Team A
                  </div>

                  {/* Player list */}
                  <div className="w-full space-y-2">
                    {teamA.map((player, i) => (
                      <motion.div
                        key={player.id}
                        initial={{ x: -40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 200 }}
                        className="bg-white border-[3px] border-zk-black shadow-[3px_3px_0_#000] rounded-xl px-4 py-3 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-[#5D3FD3] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-black">
                            {player.nickname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-black text-zk-black flex-1 uppercase text-sm truncate">
                          {player.nickname}
                        </span>
                        <span className="font-black text-[#5D3FD3] text-lg">
                          {player.score?.toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Team total */}
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="text-5xl md:text-6xl font-black mt-4 gasoek-one-regular"
                    style={{
                      color: "#1a1a1a",
                      WebkitTextStroke: "2px #000",
                    }}
                  >
                    {teamAScore.toLocaleString()}
                  </motion.p>
                </motion.div>

                {/* VS Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: [-6, 6, -6] }}
                  transition={{
                    scale: { delay: 0.3, type: "spring" },
                    rotate: { delay: 0.5, duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="self-center bg-zk-black border-[4px] border-[#FFCD29] w-16 h-16 flex items-center justify-center rounded-xl shadow-[4px_4px_0_rgba(0,0,0,0.3)] flex-shrink-0 z-20"
                >
                  <span className="font-black text-[#FFCD29] text-2xl">VS</span>
                </motion.div>

                {/* Team B */}
                <motion.div
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="flex-1 flex flex-col items-center"
                >
                  {/* Crown for winning team */}
                  {teamBScore > teamAScore && (
                    <motion.div
                      initial={{ scale: 0, rotate: 20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="text-5xl mb-2"
                    >
                      👑
                    </motion.div>
                  )}

                  <div className="bg-[#E74C3C] text-white font-black text-sm uppercase tracking-widest px-5 py-1.5 rounded-full border-[3px] border-zk-black shadow-[3px_3px_0_#000] mb-4">
                    Team B
                  </div>

                  {/* Player list */}
                  <div className="w-full space-y-2">
                    {teamB.map((player, i) => (
                      <motion.div
                        key={player.id}
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 200 }}
                        className="bg-white border-[3px] border-zk-black shadow-[3px_3px_0_#000] rounded-xl px-4 py-3 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-[#5D3FD3] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-black">
                            {player.nickname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-black text-zk-black flex-1 uppercase text-sm truncate">
                          {player.nickname}
                        </span>
                        <span className="font-black text-[#E74C3C] text-lg">
                          {player.score?.toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Team total */}
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="text-5xl md:text-6xl font-black mt-4 gasoek-one-regular"
                    style={{
                      color: "#1a1a1a",
                      WebkitTextStroke: "2px #000",
                    }}
                  >
                    {teamBScore.toLocaleString()}
                  </motion.p>
                </motion.div>
              </div>

              {/* Bottom buttons */}
              <div className="flex gap-4 mt-6 relative z-20">
                {!isFinalLeaderboard ? (
                  <button
                    id="next-after-leaderboard-btn"
                    onClick={handleNextQuestion}
                    className="bg-[#3B68FF] text-white border-[4px] border-zk-black shadow-[6px_6px_0_#000] rounded-xl px-12 py-4 font-black text-xl uppercase tracking-widest hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0_#000] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all flex items-center gap-3"
                  >
                    Next Question <ChevronRight size={22} />
                  </button>
                ) : (
                  <button
                    id="end-game-btn"
                    onClick={handleEndGame}
                    className="bg-[#3B68FF] text-white border-[4px] border-zk-black shadow-[6px_6px_0_#000] rounded-xl px-12 py-4 font-black text-xl uppercase tracking-widest hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0_#000] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all flex items-center gap-3"
                  >
                    <Home size={22} /> Home
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
