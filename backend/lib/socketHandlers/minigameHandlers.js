const { isHostSocket, requirePlayerSocket } = require('../socketAuth');

module.exports = function registerMinigameHandlers(io, socket, games) {
  // ── host:start-minigame ───────────────────────────────────────────────────
  socket.on('host:start-minigame', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    game.phase = 'MINIGAME_RACING'; // keeping same phase name to minimize frontend routing changes, but acts as vault cracking
    
    const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
    const generateVaultCode = () => {
      const shuffled = [...colors].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };

    const assignButtons = (teamPlayers) => {
      const assignments = {};
      const numPlayers = teamPlayers.length;
      if (numPlayers === 0) return assignments;
      
      if (numPlayers === 1) {
        // 1 player: gets all 4 colors
        assignments[teamPlayers[0].id] = [...colors];
      } else if (numPlayers === 2) {
        // 2 players: 2 colors each (all 4 colors distributed)
        const shuffled = [...colors].sort(() => 0.5 - Math.random());
        assignments[teamPlayers[0].id] = [shuffled[0], shuffled[1]];
        assignments[teamPlayers[1].id] = [shuffled[2], shuffled[3]];
      } else if (numPlayers === 3) {
        // 3 players: 2 colors each
        // First 2 players cover all 4 colors
        const shuffled = [...colors].sort(() => 0.5 - Math.random());
        assignments[teamPlayers[0].id] = [shuffled[0], shuffled[1]];
        assignments[teamPlayers[1].id] = [shuffled[2], shuffled[3]];
        // 3rd player gets 2 random colors
        const shuffled2 = [...colors].sort(() => 0.5 - Math.random());
        assignments[teamPlayers[2].id] = [shuffled2[0], shuffled2[1]];
      } else {
        // 4+ players: 1 color each
        const shuffled = [...colors].sort(() => 0.5 - Math.random());
        for (let i = 0; i < numPlayers; i++) {
          assignments[teamPlayers[i].id] = [shuffled[i % 4]];
        }
      }
      return assignments;
    };

    const teamAPlayers = game.players.filter(p => p.team === 'A');
    const teamBPlayers = game.players.filter(p => p.team === 'B');

    game.vaultsToWin = 3;
    game.teamVaults = {
      A: { required: generateVaultCode(), cracked: 0 },
      B: { required: generateVaultCode(), cracked: 0 }
    };
    
    game.playerButtons = {
      ...assignButtons(teamAPlayers),
      ...assignButtons(teamBPlayers)
    };

    game.heldColors = {
      A: new Set(),
      B: new Set()
    };

    // To map playerId -> team quickly in hold events
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
         heldColors: {
           A: Array.from(game.heldColors.A),
           B: Array.from(game.heldColors.B)
         }
      });
    }, 100); // Throttle to 10 fps
  };

  const checkVault = (game, team, pin) => {
    const vault = game.teamVaults[team];
    const held = game.heldColors[team];
    
    // Check if all required colors are currently held
    const isCracked = vault.required.every(color => held.has(color));
    
    if (isCracked) {
      vault.cracked += 1;
      game.heldColors[team].clear(); // Reset held colors to prevent instant double-crack
      
      if (vault.cracked >= game.vaultsToWin) {
        game.phase = 'MINIGAME_REWARD';
        
        // Pick random player from winning team
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
      } else {
        // Generate new code for next vault
        const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
        const shuffled = [...colors].sort(() => 0.5 - Math.random());
        vault.required = shuffled.slice(0, 3);
        
        io.to(pin).emit('game:minigame-vault-cracked', {
          team,
          teamVaults: game.teamVaults
        });
      }
    } else {
      // Broadcast progress (Throttled)
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
       // Only used as a fallback if needed
       const teamSkillsObj = game.teamSkills[team] || {};
       const activeSkillIds = Object.keys(teamSkillsObj);
       
       let randomSkill;
       if (activeSkillIds.length > 0) {
         randomSkill = activeSkillIds[Math.floor(Math.random() * activeSkillIds.length)];
       } else {
         const skills = ['rabbit', 'fox', 'butterfly', 'frog'];
         randomSkill = skills[Math.floor(Math.random() * skills.length)];
       }
       
       game.skillCharges[team][randomSkill] += 1;
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

    // Only the spinner is allowed to claim the reward
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

  // ── host:start-minigame-higher-lower ─────────────────────────────────────────
  socket.on('host:start-minigame-higher-lower', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    game.phase = 'MINIGAME_HIGHER_LOWER_PICK';
    game.secretCodes = { A: null, B: null };
    
    // To map playerId -> team quickly in guess events
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

      if (game.secretCodes.A !== null && game.secretCodes.B !== null) {
        game.phase = 'MINIGAME_HIGHER_LOWER_COUNTDOWN';
        io.to(pin).emit('game:minigame-higher-lower-countdown-started', {});

        setTimeout(() => {
          // If the game is still active
          if (games.has(pin) && game.phase === 'MINIGAME_HIGHER_LOWER_COUNTDOWN') {
            game.phase = 'MINIGAME_HIGHER_LOWER_GUESS';
            game.currentTurn = Math.random() < 0.5 ? 'A' : 'B';
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

    const enemyTeam = team === 'A' ? 'B' : 'A';
    const enemySecret = game.secretCodes[enemyTeam];

    if (numericGuess === enemySecret) {
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
    } else {
      game.currentTurn = enemyTeam;
      const status = numericGuess > enemySecret ? 'LOWER' : 'HIGHER';
      io.to(pin).emit('game:higher-lower-feedback', { team, guess: numericGuess, status, playerId, nextTurn: game.currentTurn });
    }
  });
};
