const CATEGORIES = {
  "Tech & Science": [
    { word: "COMPUTER", hint: "An electronic device for storing and processing data" },
    { word: "GRAVITY", hint: "The force that attracts a body toward the center of the earth" },
    { word: "ASTRONOMY", hint: "The branch of science that deals with celestial objects" },
    { word: "CHEMISTRY", hint: "The branch of science that deals with the identification of the substances of which matter is composed" },
    { word: "SOFTWARE", hint: "The programs and other operating information used by a computer" },
    { word: "ALGORITHM", hint: "A process or set of rules to be followed in calculations" },
    { word: "HARDWARE", hint: "The physical components of a computer" },
    { word: "INTERNET", hint: "A global computer network providing a variety of information and communication facilities" },
    { word: "SATELLITE", hint: "An artificial body placed in orbit around the earth" },
    { word: "MOLECULE", hint: "A group of atoms bonded together" },
    { word: "VELOCITY", hint: "The speed of something in a given direction" },
    { word: "ECOLOGY", hint: "The branch of biology that deals with the relations of organisms to one another" },
    { word: "GENETICS", hint: "The study of heredity and the variation of inherited characteristics" },
    { word: "PHYSICS", hint: "The branch of science concerned with the nature and properties of matter and energy" },
    { word: "ROBOTICS", hint: "The branch of technology that deals with the design, construction, operation, and application of robots" }
  ],
  "Geography & History": [
    { word: "PYRAMID", hint: "A monumental structure with a square or triangular base and sloping sides" },
    { word: "CONTINENT", hint: "Any of the world's main continuous expanses of land" },
    { word: "OCEAN", hint: "A very large expanse of sea" },
    { word: "MOUNTAIN", hint: "A large natural elevation of the earth's surface" },
    { word: "GLACIER", hint: "A slowly moving mass or river of ice" },
    { word: "PHARAOH", hint: "A ruler in ancient Egypt" },
    { word: "REVOLUTION", hint: "A forcible overthrow of a government or social order" },
    { word: "EMPIRE", hint: "An extensive group of states or countries under a single supreme authority" },
    { word: "CIVILIZATION", hint: "The stage of human social and cultural development and organization that is considered most advanced" },
    { word: "GEOGRAPHY", hint: "The study of the physical features of the earth and its atmosphere" }
  ],
  "Arts & Culture": [
    { word: "SYMPHONY", hint: "An elaborate musical composition for full orchestra" },
    { word: "SCULPTURE", hint: "The art of making two- or three-dimensional representative or abstract forms" },
    { word: "LITERATURE", hint: "Written works, especially those considered of superior or lasting artistic merit" },
    { word: "ORCHESTRA", hint: "A group of instrumentalists, especially one combining string, woodwind, brass, and percussion sections" },
    { word: "PAINTING", hint: "The action or skill of using paint, either in a picture or as decoration" },
    { word: "THEATER", hint: "A building or outdoor area in which plays and other dramatic performances are given" },
    { word: "MUSEUM", hint: "A building in which objects of historical, scientific, artistic, or cultural interest are stored and exhibited" },
    { word: "POETRY", hint: "Literary work in which special intensity is given to the expression of feelings and ideas by the use of distinctive style and rhythm" },
    { word: "FESTIVAL", hint: "A day or period of celebration, typically a religious commemoration, or an organized series of concerts, plays, or movies" },
    { word: "MYTHOLOGY", hint: "A collection of myths, especially one belonging to a particular religious or cultural tradition" }
  ],
  "General & Fun": [
    { word: "ADVENTURE", hint: "An unusual and exciting, typically hazardous, experience or activity" },
    { word: "MYSTERY", hint: "Something that is difficult or impossible to understand or explain" },
    { word: "CHALLENGE", hint: "A call to take part in a contest or competition, especially a duel" },
    { word: "VICTORY", hint: "An act of defeating an enemy or opponent in a battle, game, or other competition" },
    { word: "CHAMPION", hint: "A person who has defeated or surpassed all rivals in a competition" },
    { word: "STRATEGY", hint: "A plan of action or policy designed to achieve a major or overall aim" },
    { word: "PUZZLE", hint: "A game, toy, or problem designed to test ingenuity or knowledge" },
    { word: "JOURNEY", hint: "An act of traveling from one place to another" },
    { word: "TREASURE", hint: "A quantity of precious metals, gems, or other valuable objects" },
    { word: "FANTASTIC", hint: "Extraordinarily good or attractive" },
    { word: "WONDERFUL", hint: "Inspiring delight, pleasure, or admiration; extremely good; marvelous" },
    { word: "DISCOVERY", hint: "The action or process of discovering or being discovered" },
    { word: "KNOWLEDGE", hint: "Facts, information, and skills acquired by a person through experience or education" },
    { word: "BRILLIANT", hint: "Exceptionally clever or talented" },
    { word: "EXCELLENCE", hint: "The quality of being outstanding or extremely good" }
  ]
};

function getRandomHangmanWord(categoryName) {
  const categoryWords = CATEGORIES[categoryName] || CATEGORIES["General & Fun"];
  const index = Math.floor(Math.random() * categoryWords.length);
  return categoryWords[index];
}

module.exports = {
  CATEGORIES,
  getRandomHangmanWord
};
