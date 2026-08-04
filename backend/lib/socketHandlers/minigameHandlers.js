const { isHostSocket, requirePlayerSocket } = require('../socketAuth');
const { getRandomHangmanWord } = require('../hangmanWords');module.exports = function registerMinigameHandlers(io, socket, games) {
  // ── Helper functions ──────────────────────────────────────────────────────
  const triggerMinigameReward = (game, team, pin) => {
    game.phase = 'MINIGAME_REWARD';
    
    const winningPlayers = game.players.filter(p => p.team === team);
    let spinnerId = null;
    let spinnerName = "Host";
    if (winningPlayers.length > 0) {
      const chosen = winningPlayers[Math.floor(Math.random() * winningPlayers.length)];
      spinnerId = chosen.id;
      spinnerName = chosen.nickname;
    }
    
    game.minigameSpinnerId = spinnerId;
    const rewardsList = ['SKILL_CHARGE', 'BONUS_POINTS_20', 'NOTHING'];
    game.preSelectedRewardId = rewardsList[Math.floor(Math.random() * rewardsList.length)];

    io.to(pin).emit('game:minigame-finished', { 
      winnerTeam: team, 
      spinnerId, 
      spinnerName,
      preSelectedRewardId: game.preSelectedRewardId
    });
  };

  // ── host:start-minigame ───────────────────────────────────────────────────
  socket.on('host:start-minigame', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    game.phase = 'MINIGAME_RACING';
    
    const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
    const generateVaultCode = () => {
      const shuffled = [...colors].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };

    const assignButtons = (teamPlayers) => {
      const assignments = {};
      const numPlayers = teamPlayers.length;
      if (numPlayers === 0) return assignments;
      
      const shuffled = [...colors].sort(() => 0.5 - Math.random());
      const numColorsPerPlayer = Math.max(1, Math.ceil(4 / numPlayers));
      
      // Dynamically distribute colors cyclically to guarantee all 4 colors are covered
      for (let i = 0; i < numPlayers; i++) {
        const playerColors = [];
        for (let c = 0; c < numColorsPerPlayer; c++) {
          playerColors.push(shuffled[(i * numColorsPerPlayer + c) % 4]);
        }
        assignments[teamPlayers[i].id] = playerColors;
      }
      return assignments;
    };

    game.vaultsToWin = 3;
    game.teamVaults = {};
    game.heldColors = {};
    game.playerButtons = {};

    game.teams.forEach(team => {
      game.teamVaults[team] = { required: generateVaultCode(), cracked: 0 };
      game.heldColors[team] = new Set();
      const teamPlayers = game.players.filter(p => p.team === team);
      Object.assign(game.playerButtons, assignButtons(teamPlayers));
    });

    game.playerTeamMap = {};
    game.players.forEach(p => { game.playerTeamMap[p.id] = p.team; });

    io.to(pin).emit('game:minigame-started', { 
      vaultsToWin: game.vaultsToWin,
      teamVaults: game.teamVaults,
      playerButtons: game.playerButtons
    });
  });

  // ── player:hold-button / player:release-button ────────────────────────────
  const requestProgressUpdate = (game, pin) => {
    if (game.progressUpdatePending) return;
    game.progressUpdatePending = true;
    setTimeout(() => {
      game.progressUpdatePending = false;
      io.to(pin).emit('game:minigame-progress', {
         teamVaults: game.teamVaults,
         heldColors: Object.fromEntries(
           game.teams.map(t => [t, Array.from(game.heldColors[t] || [])])
         )
      });
    }, 100); // Throttle to 10 fps
  };

  const checkVault = (game, team, pin) => {
    const vault = game.teamVaults[team];
    const held = game.heldColors[team];
    
    const isCracked = vault.required.every(color => held.has(color));
    
    if (isCracked) {
      vault.cracked += 1;
      game.heldColors[team].clear(); 
      
      if (vault.cracked >= game.vaultsToWin) {
        triggerMinigameReward(game, team, pin);
      } else {
        const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
        const shuffled = [...colors].sort(() => 0.5 - Math.random());
        vault.required = shuffled.slice(0, 3);
        
        io.to(pin).emit('game:minigame-vault-cracked', {
          team,
          teamVaults: game.teamVaults
        });
      }
    } else {
      requestProgressUpdate(game, pin);
    }
  };

  socket.on('player:hold-button', ({ pin, playerId, color }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_RACING') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap[playerId];
    if (team && game.heldColors[team]) {
      game.heldColors[team].add(color);
      checkVault(game, team, pin);
    }
  });

  socket.on('player:release-button', ({ pin, playerId, color }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_RACING') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap[playerId];
    if (team && game.heldColors[team]) {
      game.heldColors[team].delete(color);
      requestProgressUpdate(game, pin);
    }
  });

  // ── player:spin-wheel ─────────────────────────────────────────────────────
  socket.on('player:spin-wheel', ({ pin, playerId }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_REWARD') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    if (game.minigameSpinnerId === playerId || game.minigameSpinnerId === null) {
      io.to(pin).emit('game:wheel-spinning');
    }
  });

  // ── host:claim-minigame-reward ────────────────────────────────────────────
  socket.on('host:claim-minigame-reward', ({ pin, team, rewardType }) => {
     const game = games.get(pin);
     if (!isHostSocket(socket, game)) return;
     
     if (rewardType === 'SKILL_CHARGE') {
       const teamSkillsObj = game.teamSkills[team] || {};
       const activeSkillIds = Object.keys(teamSkillsObj);
       
       let randomSkill;
       if (activeSkillIds.length > 0) {
         randomSkill = activeSkillIds[Math.floor(Math.random() * activeSkillIds.length)];
       } else {
         const skills = ['rabbit', 'fox', 'butterfly', 'frog'];
         randomSkill = skills[Math.floor(Math.random() * skills.length)];
       }
       
       if (!game.skillCharges[team]) {
         game.skillCharges[team] = { rabbit: 0, fox: 0, butterfly: 0, frog: 0 };
       }
       game.skillCharges[team][randomSkill] = (game.skillCharges[team][randomSkill] || 0) + 1;
       io.to(pin).emit('game:minigame-reward-claimed', { team, rewardType: 'SKILL_CHARGE', detail: randomSkill });
     } else if (rewardType === 'BONUS_POINTS_20') {
       game.activeMultiplier = { team, multiplier: 1.2, durationRounds: 1 };
       io.to(pin).emit('game:minigame-reward-claimed', { team, rewardType: 'BONUS_POINTS_20' });
     } else {
       io.to(pin).emit('game:minigame-reward-claimed', { team, rewardType: 'NOTHING' });
     }
  });

  // ── player:claim-minigame-reward ──────────────────────────────────────────
  socket.on('player:claim-minigame-reward', ({ pin, playerId, rewardType, detail }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_REWARD') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    if (game.minigameSpinnerId !== playerId) return;
    
    const team = game.playerTeamMap[playerId];
    if (!team) return;

    if (rewardType === 'SKILL_CHARGE' && detail) {
      if (!game.skillCharges[team]) {
        game.skillCharges[team] = { rabbit: 0, fox: 0, butterfly: 0, frog: 0 };
      }
      game.skillCharges[team][detail] = (game.skillCharges[team][detail] || 0) + 1;
      
      io.to(pin).emit('game:minigame-reward-claimed', { team, rewardType: 'SKILL_CHARGE', detail });
    }
  });

  // ── host:start-minigame-hangman-intro ────────────────────────────────────────
  socket.on('host:start-minigame-hangman-intro', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    game.phase = 'MINIGAME_HANGMAN_CATEGORY_PICK';
    io.to(pin).emit('game:minigame-hangman-category-pick');
  });

  // ── host:start-minigame-hangman ──────────────────────────────────────────────
  socket.on('host:start-minigame-hangman', ({ pin, category }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    game.phase = 'MINIGAME_HANGMAN';
    const secretObj = getRandomHangmanWord(category);
    game.hangmanSecret = secretObj.word;
    game.hangmanHint = secretObj.hint;
    game.hangmanCategory = category;
    
    // Calculate lives
    const baseLives = Math.max(5, secretObj.word.length + 2);
    
    game.hangmanState = {};
    game.teams.forEach(team => {
      game.hangmanState[team] = { lives: baseLives, guessedLetters: [], isEliminated: false };
    });
    
    game.playerTeamMap = {};
    game.players.forEach(p => { game.playerTeamMap[p.id] = p.team; });

    io.to(pin).emit('game:minigame-hangman-started', { 
      word: secretObj.word,
      wordLength: secretObj.word.length,
      hint: secretObj.hint,
      category: category,
      state: game.hangmanState,
      teams: game.teams
    });
  });

  // ── player:hangman-guess ───────────────────────────────────────────────────
  socket.on('player:hangman-guess', ({ pin, playerId, letter }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_HANGMAN') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap ? game.playerTeamMap[playerId] : game.players.find(p => p.id === playerId)?.team;
    if (!team) return;

    const teamState = game.hangmanState[team];
    if (teamState.isEliminated) return;

    const upperLetter = letter.toUpperCase();
    if (teamState.guessedLetters.includes(upperLetter)) return;

    teamState.guessedLetters.push(upperLetter);
    const secretWord = game.hangmanSecret;

    let isCorrect = secretWord.includes(upperLetter);
    if (!isCorrect) {
      teamState.lives -= 1;
      if (teamState.lives <= 0) {
        teamState.isEliminated = true;
      }
    }

    const secretLetters = new Set(secretWord.split(''));
    let hasWon = true;
    for (const char of secretLetters) {
      if (!teamState.guessedLetters.includes(char)) {
        hasWon = false;
        break;
      }
    }

    if (hasWon) {
      triggerMinigameReward(game, team, pin);
    } else {
      const allEliminated = game.teams.every(t => game.hangmanState[t]?.isEliminated);
      if (allEliminated) {
        io.to(pin).emit('game:hangman-progress', {
          team,
          lives: teamState.lives,
          guessedLetters: teamState.guessedLetters,
          isEliminated: teamState.isEliminated
        });

        // After a delay to let players see they lost, finish the minigame with no winner
        setTimeout(() => {
          if (games.has(pin) && game.phase === 'MINIGAME_HANGMAN') {
            game.phase = 'MINIGAME_FINISHED_NO_WINNER'; // Keep state clean
            io.to(pin).emit('game:minigame-finished', { 
              winnerTeam: null, 
              spinnerId: null, 
              spinnerName: "No one",
              preSelectedRewardId: 'NOTHING'
            });
          }
        }, 3000);
      } else {
        io.to(pin).emit('game:hangman-progress', {
          team,
          lives: teamState.lives,
          guessedLetters: teamState.guessedLetters,
          isEliminated: teamState.isEliminated
        });
      }
    }
  });

  // ── host:start-minigame-higher-lower ─────────────────────────────────────────
  socket.on('host:start-minigame-higher-lower', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    game.phase = 'MINIGAME_HIGHER_LOWER_PICK';
    game.secretCodes = {};
    game.teams.forEach(team => {
      game.secretCodes[team] = null;
    });
    
    game.playerTeamMap = {};
    game.players.forEach(p => { game.playerTeamMap[p.id] = p.team; });

    io.to(pin).emit('game:minigame-higher-lower-started', {});
  });

  // ── player:higher-lower-set-secret ─────────────────────────────────────────
  socket.on('player:higher-lower-set-secret', ({ pin, playerId, secret }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_HIGHER_LOWER_PICK') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap ? game.playerTeamMap[playerId] : game.players.find(p => p.id === playerId)?.team;
    if (!team) return;

    const numericSecret = parseInt(secret, 10);
    if (isNaN(numericSecret) || numericSecret < 1 || numericSecret > 99) return;

    if (game.secretCodes[team] === null) {
      game.secretCodes[team] = numericSecret;
      io.to(pin).emit('game:higher-lower-locked-in', { team });

      const allLockedIn = game.teams.every(t => game.secretCodes[t] !== null);
      if (allLockedIn) {
        game.phase = 'MINIGAME_HIGHER_LOWER_COUNTDOWN';
        io.to(pin).emit('game:minigame-higher-lower-countdown-started', {});

        setTimeout(() => {
          if (games.has(pin) && game.phase === 'MINIGAME_HIGHER_LOWER_COUNTDOWN') {
            game.phase = 'MINIGAME_HIGHER_LOWER_GUESS';
            game.currentTurn = game.teams[Math.floor(Math.random() * game.teams.length)];
            io.to(pin).emit('game:minigame-higher-lower-guessing-started', { startingTeam: game.currentTurn });
          }
        }, 3000);
      }
    }
  });

  // ── player:higher-lower-guess ──────────────────────────────────────────────
  socket.on('player:higher-lower-guess', ({ pin, playerId, guess }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_HIGHER_LOWER_GUESS') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap ? game.playerTeamMap[playerId] : game.players.find(p => p.id === playerId)?.team;
    if (!team) return;

    const numericGuess = parseInt(guess, 10);
    if (isNaN(numericGuess)) return;

    if (game.currentTurn !== team) return;

    const currentIndex = game.teams.indexOf(team);
    const nextIndex = (currentIndex + 1) % game.teams.length;
    const enemyTeam = game.teams[nextIndex];
    const enemySecret = game.secretCodes[enemyTeam];

    if (numericGuess === enemySecret) {
      triggerMinigameReward(game, team, pin);
    } else {
      game.currentTurn = enemyTeam;
      const status = numericGuess > enemySecret ? 'LOWER' : 'HIGHER';
      io.to(pin).emit('game:higher-lower-feedback', { team, guess: numericGuess, status, playerId, nextTurn: game.currentTurn });
    }
  });
};
