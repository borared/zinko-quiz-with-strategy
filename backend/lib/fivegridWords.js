const CATEGORIES = {
  "Tech & Science": [
    { word: "ROBOT", hint: "A machine capable of carrying out complex actions automatically" },
    { word: "CYBER", hint: "Relating to computers, information technology, and virtual reality" },
    { word: "VIRUS", hint: "A piece of code that copies itself and has a detrimental effect" },
    { word: "SOLAR", hint: "Relating to or determined by the sun or its energy" },
    { word: "RADAR", hint: "A system for detecting objects using radio waves" },
    { word: "LASER", hint: "A device generating an intense beam of single-color light" },
    { word: "LOGIC", hint: "Reasoning conducted according to strict principles of validity" },
    { word: "ORBIT", hint: "The curved path of a celestial object around another body" },
    { word: "PIXEL", hint: "A minute area of illumination on a display screen" },
    { word: "MOUSE", hint: "A hand-held pointing device that detects motion" },
    { word: "POWER", hint: "Physical strength or energy exerted or brought to bear" },
    { word: "CLONE", hint: "An organism or cell produced asexually from one ancestor" }
  ],
  "Geography & History": [
    { word: "EARTH", hint: "The planet on which we live; the world" },
    { word: "OCEAN", hint: "A very large expanse of sea" },
    { word: "RIVER", hint: "A large natural stream of water flowing in a channel" },
    { word: "INDIA", hint: "A country in South Asia, known for its diverse culture" },
    { word: "CHINA", hint: "A country in East Asia, famous for its Great Wall" },
    { word: "EGYPT", hint: "An ancient country in northeast Africa, famous for pyramids" },
    { word: "MAYAN", hint: "An ancient Mesoamerican civilization famous for its script" },
    { word: "OASIS", hint: "A fertile spot in a desert where water is found" },
    { word: "GLOBE", hint: "A spherical representation of the earth" },
    { word: "RUINS", hint: "The remains of a building that has suffered much damage" },
    { word: "STONE", hint: "Hard solid matter of which rock is made, used as tools" },
    { word: "TOWER", hint: "A tall, narrow building, freestanding or part of a structure" }
  ],
  "Arts & Culture": [
    { word: "MUSIC", hint: "Vocal or instrumental sounds producing beauty of form" },
    { word: "PAINT", hint: "A colored substance spread over a surface as a coating" },
    { word: "STAGE", hint: "A raised floor or platform in a theater for performing" },
    { word: "DANCE", hint: "Move rhythmically to music, following a sequence of steps" },
    { word: "ACTOR", hint: "A person whose profession is acting on stage or screen" },
    { word: "GENRE", hint: "A category of artistic, musical, or literary composition" },
    { word: "PROSE", hint: "Written language in its ordinary form, without structure" },
    { word: "CHORD", hint: "A group of notes sounded together, as a basis of harmony" },
    { word: "LYRIC", hint: "Expressing the writer's emotions in an imaginative way" },
    { word: "NOVEL", hint: "A fictitious prose narrative of book length" },
    { word: "OPERA", hint: "A dramatic work set to music for singers and orchestra" },
    { word: "FLUTE", hint: "A wind instrument made from a tube with finger holes" }
  ],
  "General & Fun": [
    { word: "HAPPY", hint: "Feeling or showing pleasure or contentment" },
    { word: "SMART", hint: "Having or showing a quick-witted intelligence" },
    { word: "PARTY", hint: "A social gathering involving eating, drinking, and fun" },
    { word: "JOKER", hint: "A person who plays jokes, or a card featuring a jester" },
    { word: "CRAZY", hint: "Extremely enthusiastic, foolish, or wild" },
    { word: "LUCKY", hint: "Having, bringing, or resulting from good luck" },
    { word: "GAMES", hint: "Activities that one engages in for amusement or fun" },
    { word: "SWEET", hint: "Having the pleasant taste characteristic of sugar" },
    { word: "FUNNY", hint: "Causing laughter or amusement; humorous" },
    { word: "MAGIC", hint: "The power of influencing events using mysterious forces" },
    { word: "DREAM", hint: "A series of thoughts/images in a mind during sleep" },
    { word: "LAUGH", hint: "Make sounds and movements expressing lively amusement" }
  ]
};

function getRandomFiveGridWord(categoryName) {
  const categoryWords = CATEGORIES[categoryName] || CATEGORIES["General & Fun"];
  const index = Math.floor(Math.random() * categoryWords.length);
  return categoryWords[index];
}

module.exports = {
  CATEGORIES,
  getRandomFiveGridWord
};
