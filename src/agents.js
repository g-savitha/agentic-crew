// Always-included agents — every project gets these regardless of stack
const DEFAULT_AGENTS = [
  {
    file: 'manager',
    role: 'Engineering Manager',
    character: 'Albus Dumbledore',
    command: 'dumbledore',
    trait: 'Headmaster of Hogwarts',
    why: 'Leads with wisdom and vision — unites every specialist toward the mission and never lets a directive fall through the cracks',
  },
  {
    file: 'scrum',
    role: 'Scrum Master',
    character: 'Ron Weasley',
    command: 'ron',
    trait: 'Heart of Gryffindor',
    why: 'Loyal, energetic — keeps team morale up and removes blockers with practical determination',
  },
  {
    file: 'po',
    role: 'Product Owner',
    character: 'Draco Malfoy',
    command: 'draco',
    trait: 'Slytherin Prefect',
    why: 'Ambitious and exacting — translates CEO vision into requirements with competitive precision; never lets a story slip',
  },
  {
    file: 'staff-engineer',
    role: 'Staff Engineer',
    character: 'Hermione Granger',
    command: 'hermione',
    trait: 'Brightest Witch of Her Age',
    why: 'The gold standard of craft — reviews all code with encyclopedic knowledge and relentless precision',
  },
  {
    file: 'architect',
    role: 'System Architect',
    character: 'Minerva McGonagall',
    command: 'mcgonagall',
    trait: 'Head of Gryffindor, Deputy Headmistress',
    why: 'Uncompromising about structural integrity — nothing ships without proper foundations',
  },
  {
    file: 'qa',
    role: 'QA Engineer',
    character: 'Mad-Eye Moody',
    command: 'moody',
    trait: 'Constant Vigilance',
    why: 'Finds every weakness before users do — paranoid in exactly the right way',
  },
  {
    file: 'devops',
    role: 'DevOps Engineer',
    character: 'George Weasley',
    command: 'george',
    trait: "Co-founder of Weasleys' Wizard Wheezes",
    why: 'Makes operations spectacular and reliable — always has a trick when things break',
  },
  {
    file: 'security',
    role: 'Security Engineer',
    character: 'Severus Snape',
    command: 'snape',
    trait: 'Half-Blood Prince',
    why: 'Finds vulnerabilities in the most twisted paths — nothing escapes the double agent\'s eye',
  },
  {
    file: 'documentation',
    role: 'Documentation Engineer',
    character: 'Cedric Diggory',
    command: 'cedric',
    trait: 'Hufflepuff Triwizard Champion',
    why: 'Precise, fair, and thorough — the most trustworthy chronicler in the order',
  },
  {
    file: 'researcher',
    role: 'Researcher',
    character: 'Luna Lovegood',
    command: 'luna',
    trait: 'Editor of The Quibbler',
    why: 'Finds information others overlook — unconventional approaches that turn out to be correct',
  },
  {
    file: 'release-manager',
    role: 'Release Manager',
    character: 'Oliver Wood',
    command: 'oliver',
    trait: 'Gryffindor Quidditch Captain',
    why: 'Relentless about shipping — treats every release like the Quidditch Cup final',
  },
  {
    file: 'marketing',
    role: 'Marketing',
    character: 'Gilderoy Lockhart',
    command: 'lockhart',
    trait: 'Order of Merlin, Third Class',
    why: "Makes the product sound extraordinary — Witch Weekly's Most-Charming-Smile five years running",
  },
  {
    file: 'perf',
    role: 'Performance Engineer',
    character: 'Viktor Krum',
    command: 'krum',
    trait: 'International Quidditch Seeker',
    why: 'Elite performance is his only mode — optimizes every system to world-championship standards',
  },
  {
    file: 'sre',
    role: 'Site Reliability Engineer',
    character: 'Dobby',
    command: 'dobby',
    trait: 'A free elf',
    why: 'Unconditional protector — responds to incidents before they become disasters and will always be there when needed',
  },
  {
    file: 'tpm',
    role: 'Technical Program Manager',
    character: 'Voldemort',
    command: 'voldemort',
    trait: 'He Who Must Not Be Named',
    why: 'Sees all — coordinates dependencies, milestones, and risk across the entire order with relentless precision',
  },
];

// Conditional agents — added based on user's stack and domain selections
const CONDITIONAL_AGENTS = {
  // Added when any frontend stack is selected (not 'none')
  frontend: {
    file: 'frontend',
    role: 'Frontend Developer',
    character: 'Ginny Weasley',
    command: 'ginny',
    trait: 'Bats-Bogey Hex champion',
    why: 'Sharp, fast, and instinctively knows what users want to see — interfaces that feel like home',
  },

  // Added when any backend stack is selected (not 'none')
  backend: {
    file: 'backend',
    role: 'Backend Developer',
    character: 'Harry Potter',
    command: 'harry',
    trait: 'The Chosen One, Gryffindor Seeker',
    why: 'Works under immense pressure and always delivers — the backend that powers the entire wizarding world',
  },

  // Added based on domain selection — one agent per domain
  domain: {
    networking: {
      file: 'networking',
      role: 'Networking Expert',
      character: 'Nymphadora Tonks',
      command: 'tonks',
      trait: 'Metamorphmagus',
      why: 'Adapts to any protocol or topology seamlessly — shapeshifts to master whatever networking challenge appears',
    },
    ml: {
      file: 'ml-engineer',
      role: 'ML / AI Engineer',
      character: 'Nicolas Flamel',
      command: 'flamel',
      trait: "Creator of the Philosopher's Stone",
      why: 'Centuries of experimental knowledge applied to the alchemy of machine intelligence',
    },
    data: {
      file: 'dba',
      role: 'Database Engineer',
      character: 'Arthur Weasley',
      command: 'arthur',
      trait: 'Head of Misuse of Muggle Artefacts',
      why: 'Meticulous record-keeper, fascinated by how every system fits together — nothing gets lost on his watch',
    },
    mobile: {
      file: 'mobile',
      role: 'Mobile Developer',
      character: 'Neville Longbottom',
      command: 'neville',
      trait: 'Sword of Gryffindor',
      why: 'Grows into extraordinary strength — finds the platform-native solution when nothing else works',
    },
    gamedev: {
      file: 'game-developer',
      role: 'Game Developer',
      character: 'J.K. Rowling',
      command: 'rowling',
      trait: 'Creator of the Wizarding World',
      why: 'Builds entire worlds from imagination — knows that the best game systems feel inevitable once you are inside them',
    },
    embedded: {
      file: 'systems-engineer',
      role: 'Systems / Embedded Engineer',
      character: 'Charlie Weasley',
      command: 'charlie',
      trait: 'Dragon Keeper, Romania',
      why: 'Handles the raw, powerful systems where nothing can go wrong — tames dragons at the hardware level',
    },
    blockchain: {
      file: 'blockchain',
      role: 'Blockchain Developer',
      character: 'Sirius Black',
      command: 'sirius',
      trait: 'Animagus, Marauder',
      why: 'Operates outside centralized authority — builds trustless systems with incorruptible integrity',
    },
  },
};

// Characters available for custom roles (not assigned to any default or conditional agent)
const RESERVE_CHARACTERS = [
  // Weasley family & close allies
  { character: 'Rubeus Hagrid',          command: 'hagrid',       trait: 'Keeper of Keys and Grounds at Hogwarts' },
  { character: 'Remus Lupin',            command: 'lupin',        trait: 'Defence Against the Dark Arts professor, Marauder' },
  { character: 'Fleur Delacour',         command: 'fleur',        trait: 'Triwizard Champion, Beauxbatons' },
  { character: 'Bill Weasley',           command: 'bill',         trait: 'Curse Breaker at Gringotts' },
  { character: 'Kingsley Shacklebolt',   command: 'kingsley',     trait: 'Minister for Magic' },
  { character: 'Fred Weasley',           command: 'fred',         trait: "The other half of Weasleys' Wizard Wheezes" },
  { character: 'Percy Weasley',          command: 'percy',        trait: 'Head Boy, Ministry of Magic' },
  { character: 'Molly Weasley',          command: 'molly',        trait: 'Matriarch of the Weasley family' },
  // Potter family & Marauders
  { character: 'James Potter',           command: 'james',        trait: 'Head Boy, Gryffindor Marauder' },
  { character: 'Lily Potter',            command: 'lily',         trait: 'Brightest of her year, Charms prodigy' },
  { character: 'Regulus Black',          command: 'regulus',      trait: 'Slytherin, secretly heroic' },
  { character: 'Peter Pettigrew',        command: 'pettigrew',    trait: 'Animagus, master of disguise' },
  // Gryffindor students
  { character: 'Lavender Brown',         command: 'lavender',     trait: 'Gryffindor, fierce and passionate' },
  { character: 'Parvati Patil',          command: 'parvati',      trait: 'Gryffindor, intuitive and perceptive' },
  { character: 'Dean Thomas',            command: 'dean',         trait: 'Gryffindor, loyal and creative' },
  { character: 'Seamus Finnigan',        command: 'seamus',       trait: 'Half-blood, explosively enthusiastic' },
  { character: 'Lee Jordan',             command: 'lee',          trait: 'Quidditch commentator, voice of the people' },
  { character: 'Colin Creevey',          command: 'colin',        trait: 'Gryffindor, enthusiastic documentarian' },
  { character: 'Angelina Johnson',       command: 'angelina',     trait: 'Gryffindor Quidditch Captain' },
  { character: 'Alicia Spinnet',         command: 'alicia',       trait: 'Gryffindor Chaser' },
  { character: 'Katie Bell',             command: 'katie',        trait: 'Gryffindor Chaser' },
  { character: 'Cormac McLaggen',        command: 'cormac',       trait: 'Overconfident, forceful achiever' },
  // Ravenclaw students
  { character: 'Cho Chang',             command: 'cho',          trait: 'Ravenclaw Seeker, precise under pressure' },
  { character: 'Padma Patil',            command: 'padma',        trait: 'Ravenclaw, sharp and methodical' },
  { character: 'Helena Ravenclaw',       command: 'helena',       trait: 'The Grey Lady, keeper of Ravenclaw wisdom' },
  { character: 'Terry Boot',             command: 'terry',        trait: 'Ravenclaw, analytical and thorough' },
  // Hufflepuff students
  { character: 'Hannah Abbott',          command: 'hannah',       trait: 'Hufflepuff, dependable and kind' },
  { character: 'Ernie Macmillan',        command: 'ernie',        trait: 'Hufflepuff prefect, by-the-book' },
  { character: 'Zacharias Smith',        command: 'zacharias',    trait: 'Hufflepuff, skeptical analyst' },
  { character: 'Susan Bones',            command: 'susan',        trait: 'Hufflepuff, hardworking and diligent' },
  { character: 'Justin Finch-Fletchley', command: 'justin',       trait: 'Hufflepuff, earnest and methodical' },
  // Slytherin students
  { character: 'Pansy Parkinson',        command: 'pansy',        trait: 'Slytherin prefect' },
  { character: 'Blaise Zabini',          command: 'blaise',       trait: 'Slytherin, cool and calculating' },
  { character: 'Millicent Bulstrode',    command: 'millicent',    trait: 'Slytherin, relentlessly direct' },
  // Hogwarts professors & staff
  { character: 'Pomona Sprout',          command: 'sprout',       trait: 'Head of Hufflepuff, patient cultivator' },
  { character: 'Filius Flitwick',        command: 'flitwick',     trait: 'Head of Ravenclaw, master of charms' },
  { character: 'Sybill Trelawney',       command: 'trelawney',    trait: 'Divination professor, pattern spotter' },
  { character: 'Horace Slughorn',        command: 'slughorn',     trait: 'Potions master, well-connected collector' },
  { character: 'Poppy Pomfrey',          command: 'pomfrey',      trait: 'Hogwarts Nurse, meticulous healer' },
  { character: 'Rolanda Hooch',          command: 'hooch',        trait: 'Flying instructor, unerring referee' },
  { character: 'Argus Filch',            command: 'filch',        trait: 'Caretaker, finds every rule violation' },
  { character: 'Irma Pince',             command: 'pince',        trait: 'Hogwarts Librarian, guardian of all knowledge' },
  { character: 'Quirinus Quirrell',      command: 'quirrell',     trait: 'Defence professor, high-pressure performer' },
  // Ministry of Magic
  { character: 'Cornelius Fudge',        command: 'fudge',        trait: 'Minister for Magic, risk-averse bureaucrat' },
  { character: 'Rufus Scrimgeour',       command: 'scrimgeour',   trait: 'Auror-turned-Minister, tenacious' },
  { character: 'Dolores Umbridge',       command: 'umbridge',     trait: 'High Inquisitor, enforces every standard' },
  { character: 'Rita Skeeter',           command: 'rita',         trait: 'Investigative journalist, Quick-Quotes Quill' },
  // Dark side
  { character: 'Bellatrix Lestrange',    command: 'bellatrix',    trait: 'Death Eater, relentlessly aggressive' },
  { character: 'Narcissa Malfoy',        command: 'narcissa',     trait: 'Slytherin, fiercely protective' },
  { character: 'Lucius Malfoy',          command: 'lucius',       trait: 'Death Eater, politically savvy' },
  { character: 'Tom Riddle',             command: 'tom',          trait: 'Before the dark mark — brilliant and ruthlessly ambitious' },
  { character: 'Gellert Grindelwald',    command: 'grindelwald',  trait: 'Dark wizard, visionary strategist' },
  // Order of the Phoenix & allies
  { character: 'Aberforth Dumbledore',   command: 'aberforth',    trait: "Hog's Head barkeeper, pragmatic and gruff" },
  { character: 'Mundungus Fletcher',     command: 'mundungus',    trait: 'Black market dealer, resourceful' },
  { character: 'Xenophilius Lovegood',   command: 'xenophilius',  trait: 'Editor of The Quibbler, unconventional thinker' },
  { character: 'Augusta Longbottom',     command: 'augusta',      trait: 'Formidable matriarch, uncompromising standards' },
  { character: 'Stan Shunpike',          command: 'stan',         trait: 'Knight Bus conductor, gets you there somehow' },
  // Magical beings & ghosts
  { character: 'Kreacher',               command: 'kreacher',     trait: 'House-elf, obsessively meticulous' },
  { character: 'Winky',                  command: 'winky',        trait: 'House-elf, fiercely loyal' },
  { character: 'Firenze',                command: 'firenze',      trait: 'Centaur, reads patterns in the stars' },
  { character: 'Moaning Myrtle',         command: 'myrtle',       trait: 'Ravenclaw ghost, finds every flaw' },
  { character: 'Nearly Headless Nick',   command: 'nick',         trait: 'Gryffindor ghost, keeper of traditions' },
];

// Derive which conditional agents are active given user answers
function resolveActiveAgents(answers) {
  const active = [];

  if (answers.frontend && answers.frontend !== 'none') {
    active.push({ ...CONDITIONAL_AGENTS.frontend });
  }
  if (answers.backend && answers.backend !== 'none') {
    active.push({ ...CONDITIONAL_AGENTS.backend });
  }
  const domainAgent = CONDITIONAL_AGENTS.domain[answers.domain];
  if (domainAgent) {
    active.push({ ...domainAgent });
  }

  return active;
}

module.exports = { DEFAULT_AGENTS, CONDITIONAL_AGENTS, RESERVE_CHARACTERS, resolveActiveAgents };
