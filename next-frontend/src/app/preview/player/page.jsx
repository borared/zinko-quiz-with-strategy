"use client";
import React, { useState } from "react";
import PlayHeader from "@/components/Play/PlayHeader";
import QuestionPrompt from "@/components/Play/QuestionPrompt";
import AnswerGrid from "@/components/Play/AnswerGrid";
import RabbitRush from "@/components/Play/Skills/RabbitRush";
import ButterflyEffect from "@/components/Play/Skills/ButterflyEffect";

export default function PlayerPreviewPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [removedAnswers, setRemovedAnswers] = useState([]);

  // Mock data to match the screenshot perfectly
  const mockQuestion = {
    index: 0,
    round: 1,
    match: 3,
    total: 10,
    questionText: "Which planet is known as the 'Red Planet'?",
    answers: [
      { id: "A", text: "Earth", color: "RED" },
      { id: "B", text: "Mars", color: "BLUE" },
      { id: "C", text: "Jupiter", color: "YELLOW" },
      { id: "D", text: "Saturn", color: "GREEN" },
    ]
  };

  const handleUseSkill = () => {
    // Just mock removing two wrong answers to show the butterfly effect
    setRemovedAnswers(["A", "C"]);
  };

  const handleAnswer = (id) => {
    setSelectedId(id);
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col overflow-hidden relative transition-colors duration-300"
      style={{
        backgroundImage: `url('/background_battle/city.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#1e1e1e",
      }}
    >
      <RabbitRush isActive={false} />
      <ButterflyEffect isActive={false} />

      {/* Warm overlay matching host screen */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none z-0" />
      
      {/* ── Content wrapper to sit above overlay ── */}
      <div className="relative z-10 flex flex-col flex-1 h-full">
        <PlayHeader 
          nickname="thida"
          question={mockQuestion}
          timeLeft={15}
        />

        <QuestionPrompt 
          phase="PLAYING"
          question={mockQuestion}
          selectedId={selectedId}
          playerSkill="fox"
          isSkillLockedOut={false}
          skillLockoutMsg=""
          skillChargesLeft={2}
          foxSmokescreen={false}
          handleUseSkill={handleUseSkill}
        />

        <AnswerGrid 
          question={mockQuestion}
          phase="PLAYING"
          selectedId={selectedId}
          removedAnswers={removedAnswers}
          foxSmokescreen={false}
          handleAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}
