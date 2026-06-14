"use client";
import React from 'react';
import QuestionPhase from '@/components/HostGame/QuestionPhase';

export default function HostPreviewPage() {
  const mockQuestion = {
    round: 3,
    match: 1,
    questionText: "WHICH MUSICIAN IS OFTEN REFERRED TO AS THE 'KING OF ROCK AND ROLL'?",
    answers: [
      { id: 'A', text: "Elvis Presley" },
      { id: 'B', text: "Chuck Berry" },
      { id: 'C', text: "Little Richard" },
      { id: 'D', text: "Jerry Lee Lewis" }
    ]
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      <QuestionPhase 
        question={mockQuestion}
        timeLeft={18}
        totalTime={20}
        answered={0}
        total={"—"}
      />
    </div>
  );
}
