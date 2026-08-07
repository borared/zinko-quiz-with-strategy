"use client";

import React, { useEffect, useState } from 'react';
import PlayHeader from '@/components/Play/PlayHeader';
import QuestionPrompt from '@/components/Play/QuestionPrompt';
import DragLayersPlay from '@/components/Play/DragLayersPlay';
import { QUESTION_TYPES } from '@/lib/questionTypes';
import { shuffleArray } from '@/lib/dragLayersUtils';
import { battleBackgroundStyle } from '@/lib/lobbyScenery';

const LAYER_COLORS = [
  'bg-[#5D3FD3]',
  'bg-[#FF6B4A]',
  'bg-[#FFCD29]',
  'bg-[#2ea84a]',
  'bg-[#3B68FF]',
  'bg-[#2D3436]',
  'bg-[#E74C3C]',
  'bg-[#9B59B6]',
  'bg-[#1ABC9C]',
  'bg-[#F39C12]',
];

// Thirteen steps, each label at least 15 characters
const ORDER_STEPS = [
  'Gather project requirements from stakeholders',
  'Design system architecture and data models',
  'Set up version control and CI pipelines',
  'Implement core features and unit test coverage',
  'Run integration tests on staging environment',
  'Perform security review and vulnerability scan',
  'Deploy release candidate to production cluster',
  'Monitor application logs and error dashboards',
  'Collect user feedback and analytics metrics',
  'Plan next sprint improvements and bug fixes',
  'Conduct post-release retrospective meetings',
  'Update user documentation and internal wikis',
  'Refactor legacy code for future scalability',
].map((text, index) => ({
  id: String(index + 1),
  text,
  layerIndex: index,
  color: LAYER_COLORS[index % LAYER_COLORS.length],
}));

const CORRECT_ORDER = ORDER_STEPS.map((step) => step.id);
const LABEL_BY_ID = Object.fromEntries(ORDER_STEPS.map((step) => [step.id, step.text]));

function buildMockQuestion(answers) {
  return {
    index: 0,
    round: 1,
    match: 1,
    total: 13,
    questionText: 'Put these thirteen software delivery steps in the correct order.',
    questionType: QUESTION_TYPES.DRAG_LAYERS,
    layerCount: ORDER_STEPS.length,
    answers,
    timeSeconds: 60,
  };
}

export default function TestDragLayersPlayerPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [mockQuestion, setMockQuestion] = useState(() => buildMockQuestion(ORDER_STEPS));
  const timeLeft = 60;

  useEffect(() => {
    setMockQuestion(buildMockQuestion(shuffleArray(ORDER_STEPS)));
  }, []);

  const handleSubmitOrder = (order) => {
    setSelectedId('preview-submitted');
    setSubmittedOrder(order);
    console.log('Submitted order:', order);
  };

  const handleReset = () => {
    setSelectedId(null);
    setSubmittedOrder(null);
    setMockQuestion(buildMockQuestion(shuffleArray(ORDER_STEPS)));
  };

  const isCorrect = submittedOrder?.every((id, index) => id === CORRECT_ORDER[index]);

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-hidden relative"
      style={battleBackgroundStyle('/background_battle/city.jpg')}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col flex-1 min-h-0 h-full">
        <PlayHeader
          nickname="Preview Player"
          question={mockQuestion}
          timeLeft={timeLeft}
        />

        <QuestionPrompt
          phase={selectedId ? 'ANSWERED' : 'PLAYING'}
          question={mockQuestion}
          selectedId={selectedId}
          playerSkill="fox"
          isSkillLockedOut={false}
          skillLockoutMsg=""
          skillChargesLeft={1}
          foxSmokescreen={false}
          handleUseSkill={() => {}}
        >
          <DragLayersPlay
            key={mockQuestion.answers.map((answer) => answer.id).join('-')}
            question={mockQuestion}
            phase={selectedId ? 'ANSWERED' : 'PLAYING'}
            selectedId={selectedId}
            foxSmokescreen={false}
            onSubmitOrder={handleSubmitOrder}
            inPanel
          />
        </QuestionPrompt>

        {submittedOrder && (
          <div className="mx-4 mb-6 rounded-xl border-[3px] border-zk-border bg-zk-panel-bg/95 p-4 text-center shadow-[4px_4px_0_0_#000]">
            <p className="font-black uppercase tracking-widest text-sm mb-2">
              {isCorrect ? 'Correct order!' : 'Submitted — check the console for step IDs'}
            </p>
            <ol className="text-left text-zk-text/70 text-sm font-bold mb-3 space-y-1 max-w-lg mx-auto">
              {submittedOrder.map((id, index) => (
                <li key={id}>
                  {index + 1}. {LABEL_BY_ID[id]}
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2 rounded-lg border-[3px] border-zk-border bg-zk-bg font-black uppercase text-sm shadow-[3px_3px_0_0_#000] active:translate-y-0.5"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}