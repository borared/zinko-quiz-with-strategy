"use client";
import React from 'react';
import PlayHeader from './PlayHeader';
import QuestionPrompt from './QuestionPrompt';
import AnswerGrid from './AnswerGrid';
import DragLayersPlay from './DragLayersPlay';
import LineMatchingPlay from './LineMatchingPlay';
import { isDragLayersQuestion, isLineMatchingQuestion } from '@/lib/questionTypes';
import ResultOverlay from './ResultOverlay';
import RabbitRush from './Skills/RabbitRush';
import ButterflyEffect from './Skills/ButterflyEffect';
import VaultBreakerPlayer from './VaultBreakerPlayer';
import HigherLowerPlayer from './HigherLowerPlayer';
import RewardWheel from '../HostGame/RewardWheel';
import { usePlayerGameState } from '@/hooks/usePlayerGameState';
import { useGameBackground } from '@/hooks/useGameBackground';
import { battleBackgroundStyle } from '@/lib/lobbyScenery';

export default function PlayerControllerUI() {
  const gameState = usePlayerGameState();
  const background = useGameBackground(gameState.pin);

  const {
    playerId,
    nickname,
    playerSkill,
    team,
    pin,
    
    question,
    selectedId,
    phase,
    resultData,
    timeLeft,
    questionTimeLimit,
    
    minigameData,
    higherLowerData,
    minigameSpinner,
    isWheelSpinning,
    
    skillChargesLeft,
    isSkillLockedOut,
    skillLockoutMsg,
    removedAnswers,
    foxSmokescreen,
    rabbitRush,
    butterflyActive,
    
    handleAnswer,
    handleSubmitLayerOrder,
    handleSubmitMatches,
    handleUseSkill,
    handleHigherLowerGuess,
    handleHigherLowerSetSecret,
    handleHoldButton,
    handleReleaseButton
  } = gameState;

  // ── RESULT overlay ──
  if (phase === 'RESULT' && resultData) {
    return <ResultOverlay resultData={resultData} />;
  }

  // ── MINIGAME ──
  if (phase === 'MINIGAME_RACING') {
    const assignedColors = minigameData.playerButtons[playerId] || [];
    return (
      <VaultBreakerPlayer 
        assignedColors={assignedColors}
        onHold={handleHoldButton}
        onRelease={handleReleaseButton}
      />
    );
  }

  if (phase === 'MINIGAME_HIGHER_LOWER') {
    return (
      <HigherLowerPlayer 
        onGuess={handleHigherLowerGuess}
        onSetSecret={handleHigherLowerSetSecret}
        statusObj={higherLowerData.status}
        subPhase={higherLowerData.subPhase}
        currentTurn={higherLowerData.currentTurn}
        team={team}
        background={background}
      />
    );
  }

  if (phase === 'MINIGAME_REWARD') {
    const isMe = minigameSpinner.id === playerId;
    
    return (
      <RewardWheel 
        pin={pin}
        winnerTeam={minigameData.winner}
        spinnerName={minigameSpinner.name}
        isSpinner={isMe}
        preSelectedRewardId={minigameSpinner.preSelectedRewardId}
        externalSpinTrigger={isWheelSpinning}
        onRewardClaimed={() => {}} // Host handles server transition
        playerId={playerId}
        isHost={false}
      />
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col overflow-hidden relative transition-colors duration-300"
      style={battleBackgroundStyle(background)}
    >
      <RabbitRush isActive={rabbitRush} />
      <ButterflyEffect isActive={butterflyActive} />

      {/* Warm overlay matching host screen */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none z-0" />
      
      {/* ── Content wrapper to sit above overlay ── */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 h-full">
        <PlayHeader 
          nickname={nickname}
          question={question}
          timeLeft={timeLeft}
          totalTime={questionTimeLimit}
        />

        <QuestionPrompt
          phase={phase}
          question={question}
          selectedId={selectedId}
          playerSkill={playerSkill}
          isSkillLockedOut={isSkillLockedOut}
          skillLockoutMsg={skillLockoutMsg}
          skillChargesLeft={skillChargesLeft}
          foxSmokescreen={foxSmokescreen}
          handleUseSkill={handleUseSkill}
        >
          {isDragLayersQuestion(question?.questionType) && (
            <DragLayersPlay
              question={question}
              phase={phase}
              selectedId={selectedId}
              foxSmokescreen={foxSmokescreen}
              onSubmitOrder={handleSubmitLayerOrder}
              inPanel
            />
          )}
          {isLineMatchingQuestion(question?.questionType) && (
            <LineMatchingPlay
              question={question}
              phase={phase}
              selectedId={selectedId}
              foxSmokescreen={foxSmokescreen}
              onSubmitMatches={handleSubmitMatches}
              inPanel
            />
          )}
        </QuestionPrompt>

        {!isDragLayersQuestion(question?.questionType) && !isLineMatchingQuestion(question?.questionType) && (
          <AnswerGrid
            question={question}
            phase={phase}
            selectedId={selectedId}
            removedAnswers={removedAnswers}
            foxSmokescreen={foxSmokescreen}
            handleAnswer={(answerId) => handleAnswer(answerId, removedAnswers)}
          />
        )}
      </div>
    </div>
  );
}
