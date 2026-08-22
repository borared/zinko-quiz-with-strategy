const { isHostSocket, requirePlayerSocket } = require('../socketAuth');
const { getRandomFiveGridWord } = require('../fivegridWords');
const Groq = require('groq-sdk');
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const prisma = require('../prisma');

function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function getLevenshteinSimilarity(a, b) {
  const distance = getLevenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  return Math.round(((maxLen - distance) / maxLen) * 100);
}



module.exports = function registerMinigameHandlers(io, socket, games) {
  // ── Helper functions ──────────────────────────────────────────────────────
  const triggerMinigameReward = (game, team, pin) => {
    if (game.fivegridTimer) {
      clearInterval(game.fivegridTimer);
      game.fivegridTimer = null;
    }
    game.phase = 'MINIGAME_REWARD';
    
    const winningPlayers = game.players.filter(p => p.team === team);
    let spinnerId = null;
    let spinnerName = "Host";
    
    const leaderId = game.teamLeaders?.[team];
    const leader = winningPlayers.find(p => p.id === leaderId);

    if (leader) {
      spinnerId = leader.id;
      spinnerName = leader.nickname;
    } else if (winningPlayers.length > 0) {
      const chosen = winningPlayers[0];
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

    const assignButtons = (teamId, teamPlayers) => {
      const assignments = {};
      if (teamPlayers.length === 0) return assignments;
      
      const leaderId = game.teamLeaders?.[teamId];
      const leader = teamPlayers.find(p => p.id === leaderId) || teamPlayers[0];

      assignments[leader.id] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

      teamPlayers.forEach(p => {
        if (p.id !== leader.id) {
          assignments[p.id] = [];
        }
      });
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
      Object.assign(game.playerButtons, assignButtons(team, teamPlayers));
    });

    game.playerTeamMap = {};
    game.players.forEach(p => { game.playerTeamMap[p.id] = p.team; });

    io.to(pin).emit('game:minigame-started', { 
      vaultsToWin: game.vaultsToWin,
      teamVaults: game.teamVaults,
      playerButtons: game.playerButtons,
      teamNames: game.teamNames || {}
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
    const leaderId = game.teamLeaders?.[team];
    if (leaderId !== playerId) return; // Only leader can hold

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
    const leaderId = game.teamLeaders?.[team];
    if (leaderId !== playerId) return; // Only leader can release

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

  // ── host:start-minigame-fivegrid-intro ────────────────────────────────────────
  socket.on('host:start-minigame-fivegrid-intro', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    game.phase = 'MINIGAME_FIVEGRID_CATEGORY_PICK';
    io.to(pin).emit('game:minigame-fivegrid-category-pick');
  });

  // ── host:start-minigame-fivegrid ──────────────────────────────────────────────
  socket.on('host:start-minigame-fivegrid', ({ pin, category }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    game.phase = 'MINIGAME_FIVEGRID';
    const secretObj = getRandomFiveGridWord(category);
    game.fivegridSecret = secretObj.word.toUpperCase();
    game.fivegridHint = secretObj.hint;
    game.fivegridCategory = category;
    
    const baseLives = 5;
    
    game.fivegridState = {};
    game.teams.forEach(team => {
      game.fivegridState[team] = { lives: baseLives, guesses: [], isEliminated: false };
    });
    
    game.playerTeamMap = {};
    game.players.forEach(p => { game.playerTeamMap[p.id] = p.team; });

    io.to(pin).emit('game:minigame-fivegrid-started', { 
      wordLength: game.fivegridSecret.length,
      hint: game.fivegridHint,
      category: category,
      state: game.fivegridState,
      teams: game.teams,
      teamNames: game.teamNames || {},
      timeLeft: 90
    });

    // Start 90s timer for Wordle game
    clearInterval(game.fivegridTimer);
    game.fivegridTimeLeft = 90;
    game.fivegridTimer = setInterval(() => {
      const g = games.get(pin);
      if (!g || g.phase !== 'MINIGAME_FIVEGRID') {
        clearInterval(game.fivegridTimer);
        return;
      }
      g.fivegridTimeLeft--;
      io.to(pin).emit('game:timer-tick', { timeLeft: g.fivegridTimeLeft });

      if (g.fivegridTimeLeft <= 0) {
        clearInterval(g.fivegridTimer);
        g.phase = 'MINIGAME_FINISHED_NO_WINNER';
        io.to(pin).emit('game:minigame-finished', { 
          winnerTeam: null, 
          spinnerId: null, 
          spinnerName: "No one",
          preSelectedRewardId: 'NOTHING'
        });
      }
    }, 1000);
  });

  // ── player:fivegrid-guess ───────────────────────────────────────────────────
  socket.on('player:fivegrid-guess', async ({ pin, playerId, guess }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_FIVEGRID') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap ? game.playerTeamMap[playerId] : game.players.find(p => p.id === playerId)?.team;
    if (!team) return;

    const leaderId = game.teamLeaders?.[team];
    if (leaderId !== playerId) return; // Only leader can guess

    const teamState = game.fivegridState[team];
    if (teamState.isEliminated || teamState.lives <= 0) return;

    const upperGuess = guess.trim().toUpperCase();
    const secretWord = game.fivegridSecret;

    if (upperGuess.length !== secretWord.length) return;

    if (upperGuess !== secretWord) {
      const isValid = await prisma.fivegrid_words.findUnique({
        where: { word: upperGuess }
      });
      if (!isValid) {
        socket.emit('game:fivegrid-invalid-guess', { message: 'Not in word list' });
        return;
      }
    }

    const result = Array(secretWord.length).fill('absent');
    const secretLetterCount = {};

    for (let i = 0; i < secretWord.length; i++) {
      if (upperGuess[i] === secretWord[i]) {
        result[i] = 'correct';
      } else {
        secretLetterCount[secretWord[i]] = (secretLetterCount[secretWord[i]] || 0) + 1;
      }
    }

    for (let i = 0; i < secretWord.length; i++) {
      if (result[i] === 'correct') continue;
      const char = upperGuess[i];
      if (secretLetterCount[char] > 0) {
        result[i] = 'present';
        secretLetterCount[char]--;
      }
    }

    teamState.guesses.push({ word: upperGuess, result });
    teamState.lives -= 1;

    const hasWon = upperGuess === secretWord;

    if (hasWon) {
      triggerMinigameReward(game, team, pin);
    } else {
      if (teamState.lives <= 0) {
        teamState.isEliminated = true;
      }

      const allEliminated = game.teams.every(t => game.fivegridState[t]?.isEliminated);
      if (allEliminated) {
        io.to(pin).emit('game:fivegrid-progress', {
          team,
          lives: teamState.lives,
          guesses: teamState.guesses,
          isEliminated: teamState.isEliminated
        });

        setTimeout(() => {
          if (games.has(pin) && game.phase === 'MINIGAME_FIVEGRID') {
            game.phase = 'MINIGAME_FINISHED_NO_WINNER';
            io.to(pin).emit('game:minigame-finished', { 
              winnerTeam: null, 
              spinnerId: null, 
              spinnerName: "No one",
              preSelectedRewardId: 'NOTHING'
            });
          }
        }, 3000);
      } else {
        io.to(pin).emit('game:fivegrid-progress', {
          team,
          lives: teamState.lives,
          guesses: teamState.guesses,
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

    io.to(pin).emit('game:minigame-higher-lower-started', { teamNames: game.teamNames || {} });
  });

  // ── player:higher-lower-set-secret ─────────────────────────────────────────
  socket.on('player:higher-lower-set-secret', ({ pin, playerId, secret }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_HIGHER_LOWER_PICK') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap ? game.playerTeamMap[playerId] : game.players.find(p => p.id === playerId)?.team;
    if (!team) return;

    const leaderId = game.teamLeaders?.[team];
    if (leaderId !== playerId) return; // Only leader can set secret

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

    const leaderId = game.teamLeaders?.[team];
    if (leaderId !== playerId) return; // Only leader can guess

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

  // ── GUESS THE IMPOSTER MINIGAME ────────────────────────────────────────────

  socket.on('host:start-minigame-imposter', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    game.phase = 'MINIGAME_IMPOSTER';
    
    game.playerTeamMap = {};
    game.players.forEach(p => { game.playerTeamMap[p.id] = p.team; });

    const teams = game.teams;
    if (teams.length < 2) return; // Needs at least 2 teams
    const imposterTeam = teams[Math.floor(Math.random() * teams.length)];
    game.imposterTeam = imposterTeam;

    const secretObj = getRandomFiveGridWord('all');
    game.imposterSecret = secretObj.word.toUpperCase();
    
    game.imposterRound = 1;
    game.imposterTurnIndex = 0;
    game.imposterClues = { 1: {}, 2: {}, 3: {} }; // Stores clues per round
    game.imposterVotes = {}; // team -> votedForTeam

    io.to(pin).emit('game:minigame-imposter-started', {
      round: game.imposterRound,
      teams: game.teams,
      teamNames: game.teamNames || {},
      currentTeamTurn: game.teams[0]
    });
  });

  socket.on('player:imposter-request-role', ({ pin, playerId }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_IMPOSTER') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap ? game.playerTeamMap[playerId] : game.players.find(p => p.id === playerId)?.team;
    if (!team) return;

    const isImposter = team === game.imposterTeam;
    const secret = isImposter ? null : game.imposterSecret;
    
    socket.emit('game:imposter-role', { isImposter, secret });
  });

  socket.on('player:imposter-submit-clue', ({ pin, playerId, clue }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_IMPOSTER') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap ? game.playerTeamMap[playerId] : game.players.find(p => p.id === playerId)?.team;
    if (!team) return;

    const leaderId = game.teamLeaders?.[team];
    if (leaderId !== playerId) return; // Only leader can submit

    // Verify it is this team's turn
    const activeTeam = game.teams[game.imposterTurnIndex || 0];
    if (team !== activeTeam) return;

    const round = game.imposterRound;
    if (round > 3) return; // Clue phase over

    if (game.imposterClues[round][team]) return; // Already submitted
    
    game.imposterClues[round][team] = clue.trim().substring(0, 30);
    
    // Broadcast to host that a team submitted
    io.to(pin).emit('game:imposter-clue-received', { team, round, clue: game.imposterClues[round][team] });
    
    // Advance turn index
    game.imposterTurnIndex = (game.imposterTurnIndex || 0) + 1;
    
    if (game.imposterTurnIndex < game.teams.length) {
      // It's the next team's turn in the same round
      io.to(pin).emit('game:imposter-turn-changed', {
        round: game.imposterRound,
        currentTeamTurn: game.teams[game.imposterTurnIndex]
      });
    } else {
      // All teams have submitted a clue for this round
      game.imposterTurnIndex = 0;
      if (round < 3) {
        game.imposterRound += 1;
        io.to(pin).emit('game:imposter-next-round', { 
          round: game.imposterRound,
          currentTeamTurn: game.teams[0]
        });
      } else {
        game.phase = 'MINIGAME_IMPOSTER_VOTING';
        io.to(pin).emit('game:imposter-voting-phase');
      }
    }
  });

  socket.on('player:imposter-sabotage-vote', ({ pin, playerId, voteTeam }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_IMPOSTER_VOTING') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap ? game.playerTeamMap[playerId] : game.players.find(p => p.id === playerId)?.team;
    if (!team) return;

    const leaderId = game.teamLeaders?.[team];
    if (leaderId !== playerId) return;

    // Imposter can now vote to blend in!

    if (game.imposterVotes[team]) return; // Already voted

    game.imposterVotes[team] = voteTeam;
    io.to(pin).emit('game:imposter-vote-received', { team });

    const allyTeams = game.teams.filter(t => t !== game.imposterTeam);
    const allVoted = game.teams.every(t => game.imposterVotes[t]);
    
    if (allVoted) {
      game.phase = 'MINIGAME_IMPOSTER_REVEAL';
      
      const correctTeams = allyTeams.filter(t => game.imposterVotes[t] === game.imposterTeam);
      
      io.to(pin).emit('game:imposter-reveal', { 
        imposterTeam: game.imposterTeam,
        secret: game.imposterSecret,
        votes: game.imposterVotes,
        correctTeams
      });

      // Process rewards
      game.rewardQueue = Array.from(correctTeams);
      
      setTimeout(() => {
        if (game.rewardQueue.length > 0) {
          const nextTeam = game.rewardQueue.shift();
          triggerMinigameReward(game, nextTeam, pin);
        } else {
          io.to(pin).emit('game:reward-queue-empty');
        }
      }, 5000); // Wait 5s for the host to show the reveal
    }
  });

  // ── DRAW IT MINIGAME ──────────────────────────────────────────────────────
  
  const DRAW_IT_WORDS = [
    'dog', 'cat', 'car', 'tree', 'house', 'sun', 'moon', 'star', 'fish', 'bird',
    'apple', 'shoe', 'hat', 'chair', 'table', 'phone', 'book', 'key', 'door', 'window'
  ];

  socket.on('host:start-minigame-draw-it', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    game.phase = 'MINIGAME_DRAW_IT';
    game.drawItRoundsRemaining = 2;
    game.drawItWinners = new Set();
    game.drawItWinnerTeam = null;
    game.drawItWinnerNickname = null;
    
    game.playerTeamMap = {};
    game.players.forEach(p => { game.playerTeamMap[p.id] = p.team; });

    const word = DRAW_IT_WORDS[Math.floor(Math.random() * DRAW_IT_WORDS.length)];
    game.drawItWord = word;
    game.drawItRelatedWords = [];
    
    // In original code there was fetchRelatedWordsForDrawIt(word, game), but we'll mock it if it's missing or skip
    // We'll skip semantic relations for now to avoid undefined function errors
    // fetchRelatedWordsForDrawIt(word, game);

    io.to(pin).emit('game:minigame-draw-it-started', { 
      word: null, 
      wordLength: game.drawItWord ? game.drawItWord.length : 0, 
      teamNames: game.teamNames || {} 
    });
    // Host gets the word
    socket.emit('game:draw-it-round-start', { word, roundsRemaining: game.drawItRoundsRemaining });
  });

  socket.on('host:draw-it-stroke', ({ pin, stroke }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_DRAW_IT') return;
    if (!isHostSocket(socket, game)) return;
    socket.broadcast.to(pin).emit('game:draw-it-stroke', { stroke });
  });

  socket.on('host:draw-it-clear', ({ pin }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_DRAW_IT') return;
    if (!isHostSocket(socket, game)) return;
    socket.broadcast.to(pin).emit('game:draw-it-clear');
  });

  socket.on('host:send-secret-word', async ({ pin }) => {
    try {
      const game = games.get(pin);
      if (!game) {
        socket.emit('game:secret-word-email-failed', { message: 'Game not found.' });
        return;
      }
      if (game.phase !== 'MINIGAME_DRAW_IT') {
        socket.emit('game:secret-word-email-failed', { message: 'Not in Draw It phase.' });
        return;
      }
      if (!isHostSocket(socket, game)) {
        socket.emit('game:secret-word-email-failed', { message: 'Unauthorized.' });
        return;
      }
      if (!game.drawItWord) {
        socket.emit('game:secret-word-email-failed', { message: 'Secret word is not ready yet.' });
        return;
      }
      
      let email = process.env.HOST_EMAIL;
      if (!email && game.hostUserId) {
        const hostUser = await prisma.users.findUnique({
          where: { clerk_id: game.hostUserId }
        });
        email = hostUser?.email;
      }
      
      if (!email) {
        socket.emit('game:secret-word-email-failed', {
          message: 'No email found for your account. Update your profile email, or use Reveal Word.',
          word: game.drawItWord,
        });
        return;
      }

      const { sendSecretWordEmail } = require('../emailService');
      const info = await sendSecretWordEmail({ to: email, word: game.drawItWord });

      socket.emit('game:secret-word-sent', { email, mocked: info.mocked });
    } catch (err) {
      console.error('Failed to send secret word email:', err);
      const game = games.get(pin);
      socket.emit('game:secret-word-email-failed', {
        message: err?.message || 'Failed to send secret word email.',
        word: game?.drawItWord || null,
      });
    }
  });

  socket.on('player:draw-it-guess', async ({ pin, playerId, guess }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_DRAW_IT') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap ? game.playerTeamMap[playerId] : game.players.find(p => p.id === playerId)?.team;
    if (!team) return;

    const leaderId = game.teamLeaders?.[team];
    if (leaderId !== playerId) return; // Only leader can guess

    if (game.drawItRoundEnding) return;

    const normalizedGuess = guess.trim().toLowerCase();
    const correctWord = (game.drawItWord || "").toLowerCase();

    if (normalizedGuess === correctWord) {
      game.drawItRoundEnding = true;
      game.drawItWinners.add(team);
      
      const playerNickname = game.players.find(p => p.id === playerId)?.nickname || 'Someone';
      game.drawItWinnerTeam = team;
      game.drawItWinnerNickname = playerNickname;
      
      io.to(pin).emit('game:draw-it-round-winner', { team, nickname: playerNickname, word: game.drawItWord });

      setTimeout(() => {
        if (!games.has(pin) || game.phase !== 'MINIGAME_DRAW_IT') return;
        game.drawItRoundEnding = false;
        game.drawItWinnerTeam = null;
        game.drawItWinnerNickname = null;
        game.drawItRoundsRemaining -= 1;

        if (game.drawItRoundsRemaining > 0) {
          // Start next round
          const newWord = DRAW_IT_WORDS[Math.floor(Math.random() * DRAW_IT_WORDS.length)];
          game.drawItWord = newWord;
          game.drawItRelatedWords = [];
          
          io.to(pin).emit('game:draw-it-clear');
          io.to(pin).emit('game:draw-it-round-start-player'); 
          io.to(pin).emit('game:minigame-draw-it-started', { 
            word: null, 
            wordLength: game.drawItWord ? game.drawItWord.length : 0, 
            teamNames: game.teamNames || {} 
          });

          if (game.hostSocketId) {
            io.to(game.hostSocketId).emit('game:draw-it-round-start', { 
              word: newWord, 
              roundsRemaining: game.drawItRoundsRemaining 
            });
          }
        } else {
          // Both rounds over. Process rewards
          game.rewardQueue = Array.from(game.drawItWinners);
          if (game.rewardQueue.length > 0) {
            const nextTeam = game.rewardQueue.shift();
            triggerMinigameReward(game, nextTeam, pin);
          } else {
            io.to(pin).emit('game:reward-queue-empty');
          }
        }
      }, 4000); // 4 seconds delay to celebrate round win
    } else {
      let closenessScore = 0;
      if (groq) {
        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: 'user',
                content: `Rate the semantic similarity between the user's guess and the correct secret word. 
Secret word: "${correctWord}"
User guess: "${normalizedGuess}"

Respond with ONLY a single JSON object in the exact format: {"score": <number between 0 and 99>}.
Example:
Correct: "cat", Guess: "animal" -> {"score": 80}
Correct: "car", Guess: "vehicle" -> {"score": 85}
Correct: "dog", Guess: "cat" -> {"score": 50}
Correct: "apple", Guess: "banana" -> {"score": 60}
Do not include any other text, markdown formatting or explanation.`
              }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
          });

          const responseContent = chatCompletion.choices[0]?.message?.content;
          const cleanJson = responseContent.replace(/```json|```/g, '').trim();
          const result = JSON.parse(cleanJson);
          if (typeof result.score === 'number') {
            closenessScore = Math.min(Math.max(result.score, 0), 99);
          }
        } catch (err) {
          console.error('⚠️ Semantic similarity API failed, using fallback:', err.message);
          closenessScore = getLevenshteinSimilarity(normalizedGuess, correctWord);
        }
      } else {
        closenessScore = getLevenshteinSimilarity(normalizedGuess, correctWord);
      }

      if (closenessScore > 0) {
        socket.emit('game:draw-it-guess-feedback', { score: closenessScore, guess: normalizedGuess });
      }
    }
  });

  socket.on('host:process-reward-queue', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    
    if (game.rewardQueue && game.rewardQueue.length > 0) {
      const nextTeam = game.rewardQueue.shift();
      triggerMinigameReward(game, nextTeam, pin);
    } else {
      io.to(pin).emit('game:reward-queue-empty');
    }
  });
};
