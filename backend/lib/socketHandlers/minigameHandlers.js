const { isHostSocket, requirePlayerSocket } = require('../socketAuth');
const { getRandomHangmanWord } = require('../hangmanWords');
const Groq = require('groq-sdk');
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

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

async function fetchRelatedWordsForDrawIt(word, game) {
  if (!groq) return;
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Give me a comma-separated list of 15 single words that are semantically related, categories, or very close synonyms to the word "${word}". Only output the words separated by commas, nothing else, all lowercase.`
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.5,
    });
    const content = response.choices[0]?.message?.content || "";
    game.drawItRelatedWords = content.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0 && w !== word.toLowerCase());
  } catch (err) {
    console.error("Failed to fetch related words from Groq", err);
  }
}

module.exports = function registerMinigameHandlers(io, socket, games) {
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
      teams: game.teams,
      teamNames: game.teamNames || {}
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

    io.to(pin).emit('game:minigame-higher-lower-started', { teamNames: game.teamNames || {} });
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

  // ── DRAW IT MINIGAME ───────────────────────────────────────────────────────
  
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
    
    game.playerTeamMap = {};
    game.players.forEach(p => { game.playerTeamMap[p.id] = p.team; });

    const word = DRAW_IT_WORDS[Math.floor(Math.random() * DRAW_IT_WORDS.length)];
    game.drawItWord = word;
    game.drawItRelatedWords = [];
    
    // Fetch semantic relations asynchronously
    fetchRelatedWordsForDrawIt(word, game);

    io.to(pin).emit('game:minigame-draw-it-started', { word: null, teamNames: game.teamNames || {} });
    // Host gets the word
    socket.emit('game:draw-it-round-start', { word, roundsRemaining: game.drawItRoundsRemaining });
  });

  socket.on('host:draw-it-stroke', ({ pin, stroke }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_DRAW_IT') return;
    if (!isHostSocket(socket, game)) return;
    // Broadcast stroke to all players
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

      const prisma = require('../prisma');
      const hostUser = await prisma.users.findUnique({ where: { clerk_id: game.hostUserId } });
      const email = hostUser?.email;
      
      if (!email) {
        socket.emit('game:secret-word-email-failed', { message: 'No email found for your account.' });
        return;
      }

      const nodemailer = require('nodemailer');
      
      let transporter;
      if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      } else {
        // Mock email if we are stuck on Ethereal creation
        console.log('Sending mock email (configure SMTP to send real emails).');
        console.log('Secret word is:', game.drawItWord);
        socket.emit('game:secret-word-sent');
        return;
      }

      const info = await transporter.sendMail({
        from: '"Zinko Quiz" <noreply@zinko.com>',
        to: email,
        subject: 'Your Zinko Secret Word! 🤫',
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
            <h2>Shhh... here is your word to draw:</h2>
            <div style="font-size: 32px; font-weight: 900; color: #1d4ed8; background: #f3f4f6; padding: 20px; border-radius: 12px; display: inline-block;">
              ${game.drawItWord}
            </div>
            <p style="margin-top: 20px; color: #666;">Don't let anyone else see this!</p>
          </div>
        `
      });

      console.log('Secret word email sent: %s', info.messageId);
      socket.emit('game:secret-word-sent');
    } catch (err) {
      console.error('Failed to send secret word email:', err);
      socket.emit('game:secret-word-email-failed', { message: 'Internal server error.' });
    }
  });

  socket.on('player:draw-it-guess', ({ pin, playerId, guess }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'MINIGAME_DRAW_IT') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    const team = game.playerTeamMap ? game.playerTeamMap[playerId] : game.players.find(p => p.id === playerId)?.team;
    if (!team) return;

    // Wait 3 seconds before next round/reward queue to show winner
    if (game.drawItRoundEnding) return;

    const normalizedGuess = guess.trim().toLowerCase();
    const correctWord = (game.drawItWord || "").toLowerCase();

    if (normalizedGuess === correctWord) {
      game.drawItRoundEnding = true;
      game.drawItWinners.add(team);
      
      const playerNickname = game.players.find(p => p.id === playerId)?.nickname || 'Someone';

      io.to(pin).emit('game:draw-it-round-winner', { team, nickname: playerNickname, word: game.drawItWord });

      setTimeout(() => {
        if (!games.has(pin) || game.phase !== 'MINIGAME_DRAW_IT') return;
        game.drawItRoundEnding = false;
        game.drawItRoundsRemaining -= 1;

        if (game.drawItRoundsRemaining > 0) {
          // Start next round
          const newWord = DRAW_IT_WORDS[Math.floor(Math.random() * DRAW_IT_WORDS.length)];
          game.drawItWord = newWord;
          game.drawItRelatedWords = [];
          
          fetchRelatedWordsForDrawIt(newWord, game);
          
          io.to(pin).emit('game:draw-it-clear');
          
          // Players don't get the word, but they get the signal that round started
          io.to(pin).emit('game:draw-it-round-start-player'); 
          
          // Find host socket and send word
          // We can just emit to room with word=null, and host receives a special event
          io.to(pin).emit('game:minigame-draw-it-started', { word: null, teamNames: game.teamNames || {} });
          // But it's easier to just broadcast to the room, then the host listens to a different event
        } else {
          // Both rounds over. Process rewards
          game.rewardQueue = Array.from(game.drawItWinners);
          if (game.rewardQueue.length > 0) {
            const nextTeam = game.rewardQueue.shift();
            triggerMinigameReward(game, nextTeam, pin);
          } else {
            // Nobody won? (Not possible with current unlimited time logic, but just in case)
            io.to(pin).emit('game:reward-queue-empty');
          }
        }
      }, 4000); // 4 seconds delay to celebrate round win
    } else {
      let closenessScore = 0;
      
      // 1. Check spelling closeness (Levenshtein)
      const distance = getLevenshteinDistance(normalizedGuess, correctWord);
      if (distance === 1 && correctWord.length >= 4) {
        closenessScore = 90; // Typo (hot)
      } else if (distance === 2 && correctWord.length >= 6) {
        closenessScore = 75; // Close typo (warm)
      }
      
      // 2. Check semantic closeness if not already close by spelling
      if (closenessScore === 0 && game.drawItRelatedWords?.includes(normalizedGuess)) {
        closenessScore = 70; // Semantic relation (warm)
      }

      if (closenessScore > 0) {
        // Send feedback to the specific player only
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
