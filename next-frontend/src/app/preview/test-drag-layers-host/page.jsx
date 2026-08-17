"use client";
import React, { useState, useEffect } from 'react';
import DragLayersPhase from '@/components/HostGame/DragLayersPhase';

export default function TestDragLayersHostPage() {
  const [timeLeft, setTimeLeft] = useState(30);
  const totalTime = 30;
  const [answered, setAnswered] = useState(0);

  const mockQuestion = {
    questionText: "Arrange the planets from closest to the sun to furthest",
    round: 1,
    match: 1,
    layerCount: 4,
    answers: [
      { id: '1', text: 'Mercury', color: 'bg-zk-coral', layerIndex: 0 },
      { id: '2', text: 'Venus', color: 'bg-zk-yellow', layerIndex: 1 },
      { id: '3', text: 'Earth', color: 'bg-zk-blue', layerIndex: 2 },
      { id: '4', text: 'Mars', color: 'bg-zk-purple', layerIndex: 3 }
    ]
  };

  useEffect(() => {
    // Simulate countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Simulate players answering
    const answering = setInterval(() => {
      setAnswered((prev) => (prev < 12 ? prev + 1 : 12));
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(answering);
    };
  }, []);

  return (
    <div 
      className="w-full h-screen font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("https://hyfqsjidyxufsatveaih.supabase.co/storage/v1/object/public/scenery/city.jpg")' }}
    >
      <div className="absolute inset-0 bg-black/40 z-0" />
      <DragLayersPhase 
        question={mockQuestion} 
        timeLeft={timeLeft} 
        totalTime={totalTime} 
        answered={answered} 
        total={12} 
      />
    </div>
  );
}
