module.exports = function registerMinigameHandlers(io, socket, games) {
  // ── host:start-minigame ───────────────────────────────────────────────────
  socket.on('host:start-minigame', ({ pin }) => {
    const game = games.get(pin);
    if (!game || game.hostSocketId !== socket.id) return;
    
    game.phase = 'MINIGAME_RACING'; // keeping same phase name to minimize frontend routing changes, but acts as vault cracking
    
    const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
    const generateVaultCode = () => {
      const shuffled = [...colors].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };

    const assignButtons = (teamPlayers) => {
      const assignments = {};
      if (teamPlayers.length === 0) return assignments;
      if (teamPlayers.length === 1) {
         assignments[teamPlayers[0].id] = [...colors]; 
         return assignments;
      }
      teamPlayers.forEach(p => {
         const shuffled = [...colors].sort(() => 0.5 - Math.random());
         assignments[p.id] = shuffled.slice(0, 2);
      });
      const allAssigned = new Set(Object.values(assignments).flat());
      colors.forEach((c) => {
         if (!allAssigned.has(c)) {
           const randomPlayer = teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
           if (!assignments[randomPlayer.id].includes(c)) {
              assignments[randomPlayer.id].push(c);
           }
         }
      });
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
    
    const team = game.playerTeamMap[playerId];
    if (team && game.heldColors[team]) {
      game.heldColors[team].add(color);
      checkVault(game, team, pin);
    }
  });

  socket.on('player:release-button', ({ pin, playerId, color }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_RACING') return;
    
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
    
    if (game.minigameSpinnerId === playerId || game.minigameSpinnerId === null) {
      io.to(pin).emit('game:wheel-spinning');
    }
  });

  // ── host:claim-minigame-reward ────────────────────────────────────────────
  socket.on('host:claim-minigame-reward', ({ pin, team, rewardType }) => {
     const game = games.get(pin);
     if (!game || game.hostSocketId !== socket.id) return;
     
     if (rewardType === 'SKILL_CHARGE') {
       // Give a random skill charge ONLY to a skill the team actually possesses
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
};
