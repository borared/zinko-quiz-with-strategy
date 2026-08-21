const { isHostSocket, requirePlayerSocket } = require('../socketAuth');

const VALID_SKILLS = new Set(['rabbit', 'fox', 'butterfly', 'frog']);

module.exports = function registerSkillHandlers(io, socket, games) {
  // ── host:skill-timer-sync ────────────────────────────────────────────────
  socket.on('host:skill-timer-sync', ({ pin, timeLeft }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    io.to(pin).emit('game:skill-timer-tick', { timeLeft });
  });
  // ── player:use-counter-blind ─────────────────────────────────────────────
  socket.on('player:use-counter-blind', ({ pin, playerId, team }) => {
    const game = games.get(pin);
    if (!game) return;
    const player = requirePlayerSocket(game, socket, playerId);
    if (!player) return;
    
    // Verify leader
    if (game.teamLeaders?.[team] !== playerId) return;
    // Verify charges
    if (!game.teamCounterBlindCharges || !game.teamCounterBlindCharges[team] || game.teamCounterBlindCharges[team] <= 0) return;
    
    // Consume charge
    game.teamCounterBlindCharges[team] -= 1;
    // Remove the blind effect in backend state so late joiners aren't blinded
    if (game.foxActive) game.foxActive[team] = false;
    
    io.to(pin).emit('game:counter-blind-success', { team });
  });

  // ── player:select-skill ──────────────────────────────────────────────────
  socket.on('player:select-skill', ({ pin, playerId, skillId, team, nickname, avatar }) => {
    const game = games.get(pin);
    if (!game) return;
    const player = requirePlayerSocket(game, socket, playerId);
    if (!player) return;
    if (!VALID_SKILLS.has(skillId)) return;
    team = player.team;
    if (!game.teamSkills[team]) game.teamSkills[team] = {};
    
    if (game.teamSkills[team][skillId] && game.teamSkills[team][skillId].playerId !== playerId) {
      socket.emit('error', { message: 'Skill already taken by a teammate' });
      return;
    }

    Object.keys(game.teamSkills[team]).forEach(sId => {
      if (game.teamSkills[team][sId].playerId === playerId) {
        delete game.teamSkills[team][sId];
      }
    });
    
    game.teamSkills[team][skillId] = { playerId, nickname, avatar };
    io.to(pin).emit('lobby:skills-update', { teamSkills: game.teamSkills });
  });

  // ── player:cancel-skill ──────────────────────────────────────────────────
  socket.on('player:cancel-skill', ({ pin, skillId, team, playerId }) => {
    const game = games.get(pin);
    if (!game) return;
    const player = requirePlayerSocket(game, socket, playerId);
    if (!player) return;
    team = player.team;
    if (game.teamSkills[team] && game.teamSkills[team][skillId] && game.teamSkills[team][skillId].playerId === playerId) {
      delete game.teamSkills[team][skillId];
      io.to(pin).emit('lobby:skills-update', { teamSkills: game.teamSkills });
    }
  });

  // ── lobby:request-skills ─────────────────────────────────────────────────
  socket.on('lobby:request-skills', ({ pin }) => {
    const game = games.get(pin);
    if (!game) return;
    socket.emit('lobby:skills-update', { teamSkills: game.teamSkills });
  });

  // ── player:use-skill ──────────────────────────────────────────────────────
  socket.on('player:use-skill', ({ pin, playerId, team, skillId, nickname }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'QUESTION') return;
    const player = requirePlayerSocket(game, socket, playerId);
    if (!player) return;
    if (!VALID_SKILLS.has(skillId)) return;
    team = player.team;
    
    // Check if team already used a skill this round
    if (game.activeSkillThisRound[team]) {
      socket.emit('error', { message: 'Your team already used a skill this round!' });
      return;
    }
    
    // Check charges
    if (game.skillCharges[team][skillId] <= 0) {
      socket.emit('error', { message: 'Out of charges!' });
      return;
    }

    // Check butterfly restriction
    if (skillId === 'butterfly') {
      const question = game.questions[game.currentQuestionIndex];
      const { resolveQuestionType, QUESTION_TYPES } = require('../questionTypes');
      if (resolveQuestionType(question) !== QUESTION_TYPES.MULTIPLE_CHOICE) {
        socket.emit('error', { message: 'Butterfly skill can only be used on Multiple Choice questions!' });
        return;
      }
    }
    
    // Activate skill
    game.skillCharges[team][skillId] -= 1;
    game.activeSkillThisRound[team] = { skillId, playerId, nickname };
    
    // Broadcast lockout to the team
    io.to(pin).emit(`game:skill-lockout`, { team, skillId, playerId, nickname });
    
    // Execute specific skill logic
    if (skillId === 'rabbit') {
      game.rabbitActive[team] = { startTime: Date.now(), timeLeftWhenActivated: game.timeLeft };
      io.to(pin).emit('game:rabbit-rush', { team });
    } 
    else if (skillId === 'fox') {
      game.foxActive[team] = true;
      const duration = Math.floor((game.currentTimeLimit || 20) * 0.3) * 1000;
      const enemyTeams = game.teams.filter(t => t !== team);
      enemyTeams.forEach(enemyTeam => {
        io.to(pin).emit('game:fox-attack', { targetTeam: enemyTeam, duration });
      });
    } 
    else if (skillId === 'butterfly') {
      const question = game.questions[game.currentQuestionIndex];
      const { resolveQuestionType, QUESTION_TYPES } = require('../questionTypes');
      if (resolveQuestionType(question) !== QUESTION_TYPES.MULTIPLE_CHOICE) {
        return;
      }

      const correctIds = question.answers
        .filter(a => a.isCorrect === true || a.checked === true || String(a.isCorrect) === 'true' || String(a.checked) === 'true')
        .map(a => a.id);
      
      const wrongAnswers = question.answers
        .filter(a => !correctIds.includes(a.id))
        .map(a => a.id);
      
      for (let i = wrongAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wrongAnswers[i], wrongAnswers[j]] = [wrongAnswers[j], wrongAnswers[i]];
      }
      
      const removedAnswers = wrongAnswers.slice(0, 2);
      io.to(pin).emit('game:butterfly-result', { team, removedAnswers });
    } 
    else if (skillId === 'frog') {
      game.frogActive[team] = { playerId };
    }
  });
};
