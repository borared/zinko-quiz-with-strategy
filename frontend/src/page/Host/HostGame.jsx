import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Trophy, Users } from "lucide-react";

const ANSWER_COLORS = [
  {
    bg: "bg-[#E74C3C]",
    border: "border-[#C0392B]",
    glow: "rgba(231,76,60,0.4)",
    label: "▲",
  },
  {
    bg: "bg-[#3B68FF]",
    border: "border-[#2850CC]",
    glow: "rgba(59,104,255,0.4)",
    label: "◆",
  },
  {
    bg: "bg-[#F39C12]",
    border: "border-[#D68910]",
    glow: "rgba(243,156,18,0.4)",
    label: "●",
  },
  {
    bg: "bg-[#27AE60]",
    border: "border-[#1E8449]",
    glow: "rgba(39,174,96,0.4)",
    label: "■",
  },
];

const MEDAL = ["🥇", "🥈", "🥉"];

// Circular countdown timer
function CountdownRing({ timeLeft, total }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const dashOffset = circ * (1 - progress);
  const color =
    timeLeft <= 5 ? "#FF4B4B" : timeLeft <= 10 ? "#F39C12" : "#FFCD29";

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle
          cx="72"
          cy="72"
          r={radius}
          strokeWidth="8"
          stroke="rgba(255,255,255,0.1)"
          fill="none"
        />
        <circle
          cx="72"
          cy="72"
          r={radius}
          strokeWidth="8"
          stroke={color}
          fill="none"
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
        className="text-5xl font-black z-10"
        style={{ color }}
      >
        {timeLeft}
      </motion.span>
    </div>
  );
}

// Animated bar chart for answer breakdown
function AnswerBarChart({ stats, revealed }) {
  const maxCount = Math.max(...stats.map((s) => s.count), 1);
  return (
    <div className="flex gap-3 items-end h-40">
      {stats.map((s, i) => {
        const pct = revealed ? (s.count / maxCount) * 100 : 0;
        const color = ANSWER_COLORS[i];
        return (
          <div key={s.id} className="flex-1 flex flex-col items-center gap-2">
            <AnimatePresence>
              {revealed && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white font-black text-lg"
                >
                  {s.count}
                </motion.span>
              )}
            </AnimatePresence>
            <div className="w-full bg-white/10 rounded-t-xl overflow-hidden h-32 flex items-end relative">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                className={`w-full ${color.bg} rounded-t-xl relative ${s.isCorrect && revealed ? "ring-4 ring-white" : ""}`}
              >
                {s.isCorrect && revealed && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl">
                    ✅
                  </div>
                )}
              </motion.div>
            </div>
            <span
              className={`text-2xl font-black ${color.bg.replace("bg-", "text-").replace("[", "[#").replace("]", "]")}`}
            >
              {color.label}
            </span>
            <p className="text-white/60 text-xs text-center truncate w-full px-1">
              {s.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function HostGame() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getSocket } = useSocket();

  const TOTAL_TIME = 20;

  const [phase, setPhase] = useState("SKILL_PICK"); // SKILL_PICK | QUESTION | RESULT | LEADERBOARD
  const [question, setQuestion] = useState(location.state?.question || null);
  const [skillTimeLeft, setSkillTimeLeft] = useState(60);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState([]);
  const [correctId, setCorrectId] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isFinalLeaderboard, setIsFinalLeaderboard] = useState(false);

  useEffect(() => {
    if (phase === "SKILL_PICK") {
      const interval = setInterval(() => {
        setSkillTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            getSocket().emit("game:start", { pin });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, pin, getSocket]);

  useEffect(() => {
    const socket = getSocket();

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

  const handleShowLeaderboard = useCallback(() => {
    getSocket().emit("host:show-leaderboard", { pin });
  }, [pin, getSocket]);

  const handleNextQuestion = useCallback(() => {
    getSocket().emit("game:next-question", { pin });
  }, [pin, getSocket]);

  const handleEndGame = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  if (!question && phase !== "SKILL_PICK") {
    return (
      <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-[#FFCD29] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black uppercase tracking-widest text-white/50">
            Loading game...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white flex flex-col overflow-hidden relative">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── SKILL_PICK PHASE ── */}
      <AnimatePresence mode="wait">
        {phase === "SKILL_PICK" && (
          <motion.div
            key="skill_pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col flex-1 items-center justify-center p-8"
          >
            <h1
              className="text-[6rem] md:text-[8rem] font-black uppercase text-white tracking-widest zinko-font leading-none text-center"
              style={{
                WebkitTextStroke: "6px #000000",
                textShadow: "8px 8px 0 #000000",
              }}
            >
              Skill Time
            </h1>
            <div className="absolute bottom-16 flex flex-col items-center">
              <span className="text-white/50 font-bold uppercase tracking-widest mb-2">Time to Pick</span>
              <span className="text-6xl font-black text-[#FFCD29]" style={{ WebkitTextStroke: "2px #000000" }}>
                {skillTimeLeft}s
              </span>
            </div>
          </motion.div>
        )}

      {/* ── QUESTION PHASE ── */}
        {phase === "QUESTION" && (
          <motion.div
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col flex-1 p-8"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="bg-white/10 rounded-2xl px-6 py-3">
                <span className="text-white/50 text-sm font-bold uppercase tracking-widest">
                  Question
                </span>
                <p className="text-white font-black text-xl">
                  {question.index + 1}{" "}
                  <span className="text-white/30">/ {question.total}</span>
                </p>
              </div>

              <CountdownRing timeLeft={timeLeft} total={TOTAL_TIME} />

              <div className="bg-white/10 rounded-2xl px-6 py-3 text-right">
                <span className="text-white/50 text-sm font-bold uppercase tracking-widest">
                  Answered
                </span>
                <p className="text-white font-black text-xl">
                  <motion.span key={answered}>{answered}</motion.span>
                  <span className="text-white/30"> / {total || "—"}</span>
                </p>
              </div>
            </div>

            {/* Question card */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 text-center flex-1 flex flex-col items-center justify-center"
            >
              {question.imageUrl && (
                <img
                  src={question.imageUrl}
                  alt="Question"
                  className="max-h-48 rounded-2xl object-cover mb-6"
                />
              )}
              <p className="text-3xl xl:text-5xl font-black text-white leading-tight max-w-4xl">
                {question.questionText}
              </p>
            </motion.div>

            {/* Answer tiles */}
            <div className="grid grid-cols-2 gap-4">
              {question.answers?.map((answer, i) => {
                const color = ANSWER_COLORS[i] || ANSWER_COLORS[0];
                return (
                  <motion.div
                    key={answer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className={`${color.bg} border-b-4 ${color.border} rounded-2xl px-6 py-5 flex items-center gap-4`}
                  >
                    <span className="text-3xl font-black opacity-70">
                      {color.label}
                    </span>
                    <span className="text-white font-black text-xl">
                      {answer.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === "RESULT" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col flex-1 p-8"
          >
            <h2 className="text-center text-4xl font-black mb-2">Results</h2>
            <p className="text-center text-white/50 mb-8 uppercase tracking-widest text-sm">
              Answer breakdown
            </p>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
              <AnswerBarChart stats={stats} revealed={true} />
            </div>

            {/* Mini leaderboard */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">
              <p className="text-white/50 uppercase tracking-widest text-xs mb-4 font-bold">
                Top Players
              </p>
              <div className="flex gap-4">
                {leaderboard.slice(0, 5).map((p, i) => (
                  <div
                    key={p.id}
                    className="flex-1 bg-white/5 rounded-2xl p-3 text-center"
                  >
                    <div className="text-xl mb-1">
                      {MEDAL[i] || `#${i + 1}`}
                    </div>
                    <p className="text-white font-bold text-sm truncate">
                      {p.nickname}
                    </p>
                    <p className="text-[#FFCD29] font-black text-sm">
                      {p.score.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleShowLeaderboard}
                className="flex-1 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-black text-lg uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Trophy size={20} /> Leaderboard
              </button>
              <button
                id="next-question-btn"
                onClick={handleNextQuestion}
                className="flex-1 py-4 rounded-2xl bg-[#FFCD29] border-b-4 border-[#D4A800] text-[#0D0D1A] font-black text-lg uppercase tracking-widest hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                Next Question <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── LEADERBOARD PHASE ── */}
        {phase === "LEADERBOARD" && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col flex-1 items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
            <h2 className="text-5xl font-black mb-2">
              {isFinalLeaderboard ? "Final Podium" : "Leaderboard"}
            </h2>
            <p className="text-white/50 uppercase tracking-widest text-sm mb-10">
              {isFinalLeaderboard ? "Game Over!" : "Intermediate Standings"}
            </p>

            <div className="w-full max-w-2xl space-y-3">
              {leaderboard.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    delay: i * 0.08,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl border ${
                    i === 0
                      ? "bg-[#FFCD29]/20 border-[#FFCD29]/50"
                      : i === 1
                        ? "bg-white/10 border-white/20"
                        : i === 2
                          ? "bg-[#CD7F32]/20 border-[#CD7F32]/30"
                          : "bg-white/5 border-white/10"
                  }`}
                >
                  <span className="text-3xl w-10 text-center">
                    {MEDAL[i] || `#${i + 1}`}
                  </span>
                  <div className="flex-1">
                    <p className="font-black text-xl">{player.nickname}</p>
                    <p className="text-white/50 text-sm">Team {player.team}</p>
                  </div>
                  <span className="font-black text-2xl text-[#FFCD29]">
                    {player.score?.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-4 mt-10">
              {!isFinalLeaderboard ? (
                <button
                  id="next-after-leaderboard-btn"
                  onClick={handleNextQuestion}
                  className="px-12 py-4 rounded-2xl bg-[#FFCD29] border-b-4 border-[#D4A800] text-[#0D0D1A] font-black text-xl uppercase tracking-widest hover:brightness-105 transition-all flex items-center gap-2"
                >
                  Next Question <ChevronRight size={22} />
                </button>
              ) : (
                <button
                  id="end-game-btn"
                  onClick={handleEndGame}
                  className="px-12 py-4 rounded-2xl bg-[#FFCD29] border-b-4 border-[#D4A800] text-[#0D0D1A] font-black text-xl uppercase tracking-widest hover:brightness-105 transition-all"
                >
                  End Game & Return to Dashboard
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
