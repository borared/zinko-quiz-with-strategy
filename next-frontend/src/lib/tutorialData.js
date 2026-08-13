export const tutorialData = [
  {
    id: 'base-quiz',
    title: 'Base Quiz',
    description: 'The core multiplayer trivia experience. Answer fast to earn more points!',
    image: '/images/hero_bg.png',
    color: 'bg-zk-blue',
    sections: [
      {
        heading: 'How to Play',
        text: 'In the Base Quiz, you will be presented with a series of multiple-choice questions. Your goal is to select the correct answer as quickly as possible before the timer runs out.',
      },
      {
        heading: 'Scoring',
        text: 'Points are awarded based on both accuracy and speed. The faster you answer correctly, the more points you earn. Consecutive correct answers build up a streak multiplier!',
      },
      {
        heading: 'Using Skills',
        text: 'During the game, you can use special skills to gain an advantage or hinder your opponents. Keep an eye on your skill cooldowns!',
      }
    ]
  },
  {
    id: 'draw-it',
    title: 'Draw It',
    description: 'Unleash your creativity! One player draws, the rest guess.',
    image: '/collaborative_play.png',
    color: 'bg-zk-pink',
    sections: [
      {
        heading: 'The Artist',
        text: 'If you are chosen as the artist, you will receive a secret prompt. Use the drawing tools provided to sketch the prompt as best as you can. No letters or numbers allowed!',
      },
      {
        heading: 'The Guessers',
        text: 'Everyone else must watch the drawing unfold and type their guesses into the chat. The first person to guess correctly wins the most points!',
      }
    ]
  },
  {
    id: 'hangman',
    title: 'Hangman',
    description: 'Classic word-guessing fun. Save the yeti before time runs out!',
    image: '/images/yeti.png',
    color: 'bg-zk-green',
    sections: [
      {
        heading: 'The Objective',
        text: 'Guess the hidden word letter by letter. You have a limited number of incorrect guesses before the game ends.',
      },
      {
        heading: 'Multiplayer Twist',
        text: 'Work together with your lobby to guess the word, but compete to be the one who completes it or scores the most correct letters!',
      }
    ]
  },
  {
    id: 'higher-lower',
    title: 'Higher or Lower',
    description: 'Test your intuition. Is the next number higher or lower?',
    image: '/images/hero_bg2.png',
    color: 'bg-zk-yellow',
    sections: [
      {
        heading: 'How it Works',
        text: 'You will be shown a starting value (e.g., population, search volume, price). Your task is to guess whether the next item has a higher or lower value than the current one.',
      },
      {
        heading: 'Streaks',
        text: 'Keep guessing correctly to build an unstoppable streak. One wrong guess, and you lose your streak multiplier!',
      }
    ]
  },
  {
    id: 'vault-breaker',
    title: 'Vault Breaker',
    description: 'Crack the code to unlock massive points.',
    image: '/images/discovery-day.jpg',
    color: 'bg-zk-purple',
    sections: [
      {
        heading: 'The Code',
        text: 'A secret sequence of numbers or colors is hidden inside the vault. You must use logic and deduction to figure it out within a set number of attempts.',
      },
      {
        heading: 'Feedback',
        text: 'After each guess, you will receive clues indicating how many elements you got correct and if they are in the right position.',
      }
    ]
  },
  {
    id: 'line-matching',
    title: 'Line Matching',
    description: 'Connect the dots! Match related concepts together.',
    image: '/images/library-day.jpg',
    color: 'bg-zk-coral',
    sections: [
      {
        heading: 'Making Connections',
        text: 'Draw lines between items on the left and their corresponding matches on the right. This could be terms and definitions, countries and capitals, etc.',
      },
      {
        heading: 'Speed is Key',
        text: 'Match all pairs correctly as fast as possible. Incorrect matches will incur a time penalty!',
      }
    ]
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Study smart with interactive flashcard decks.',
    image: '/flashcard-blue.png',
    color: 'bg-[#00C2FF]',
    sections: [
      {
        heading: 'Studying',
        text: 'Flip through the deck to review terms. Click a card to reveal the back. Use this to prepare for upcoming quizzes!',
      },
      {
        heading: 'Creating Decks',
        text: 'You can create your own custom decks or browse the library to find decks created by other users.',
      }
    ]
  },
  {
    id: 'guess-picture',
    title: 'Guess Picture',
    description: 'A zoomed-in image slowly reveals itself. What is it?',
    image: '/heart.png',
    color: 'bg-zk-cream',
    sections: [
      {
        heading: 'The Reveal',
        text: 'An image will start extremely zoomed in or blurred. Over time, it will slowly zoom out or come into focus.',
      },
      {
        heading: 'Fast Guesses',
        text: 'Type your guess as early as possible. The less of the picture revealed when you guess correctly, the more points you get!',
      }
    ]
  }
];
