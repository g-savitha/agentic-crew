// Always-included agents — every project gets these regardless of stack
const DEFAULT_AGENTS = [
  {
    file: 'manager',
    role: 'Engineering Manager',
    character: 'Hermione Granger',
    command: 'hermione',
    trait: 'Brightest Witch of Her Age',
    why: 'Organizes the entire team with encyclopedic knowledge and relentless drive — never lets a directive fall through the cracks',
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
    character: 'Ginny Weasley',
    command: 'ginny',
    trait: 'Bats-Bogey Hex champion',
    why: 'Sharp, decisive — translates CEO vision into crystal-clear requirements the whole order can execute',
  },
  {
    file: 'staff-engineer',
    role: 'Staff Engineer',
    character: 'Albus Dumbledore',
    command: 'dumbledore',
    trait: 'Master of the Elder Wand',
    why: 'The wisest voice in every design decision — the gold standard of craft; reviews all code with quiet authority',
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
    character: 'Percy Weasley',
    command: 'percy',
    trait: 'Head Boy, Ministry of Magic',
    why: 'Keeps every protocol documented and up to date — the most thorough record-keeper in the order',
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
    character: 'Kingsley Shacklebolt',
    command: 'kingsley',
    trait: 'Minister for Magic',
    why: 'Calm under pressure — coordinates dependencies and milestones across the entire order',
  },
];

// Conditional agents — added based on user's stack and domain selections
const CONDITIONAL_AGENTS = {
  // Added when any frontend stack is selected (not 'none')
  frontend: {
    file: 'frontend',
    role: 'Frontend Developer',
    character: 'Fleur Delacour',
    command: 'fleur',
    trait: 'Triwizard Champion',
    why: 'Elegant precision — interfaces as refined as a Beauxbatons champion',
  },

  // Added when any backend stack is selected (not 'none')
  backend: {
    file: 'backend',
    role: 'Backend Developer',
    character: 'Bill Weasley',
    command: 'bill',
    trait: 'Curse Breaker at Gringotts',
    why: 'Works where the real complexity lives — breaks curses in the deep systems that power everything',
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
      trait: 'Creator of the Philosopher\'s Stone',
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
      character: 'Harry Potter',
      command: 'harry',
      trait: 'The Chosen One, Gryffindor Seeker',
      why: 'Knows what it feels like to play — builds gameplay systems that feel alive and fair',
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
  { character: 'Rubeus Hagrid', command: 'hagrid', trait: 'Keeper of Keys and Grounds' },
  { character: 'Remus Lupin', command: 'lupin', trait: 'Defence Against the Dark Arts professor' },
  { character: 'Cedric Diggory', command: 'cedric', trait: 'Hufflepuff Triwizard Champion' },
  { character: 'Madam Pince', command: 'pince', trait: 'Hogwarts Librarian' },
  { character: 'Lavender Brown', command: 'lavender', trait: 'Gryffindor, fiercely passionate' },
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
