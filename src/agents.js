const { UTILITY_COMMANDS } = require('./constants');
const { normalizeDomains, assertNoCollision } = require('./utils');

/** @typedef {{ file: string, role: string, character: string, command?: string, trait: string, why: string, template?: string, domainKey?: string }} AgentDefinition */

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
    why: "Finds vulnerabilities in the most twisted paths — nothing escapes the double agent's eye",
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
    character: 'Percy Weasley',
    command: 'tpm',
    trait: 'Head Boy, Ministry of Magic',
    why: 'Coordinates dependencies, milestones, and risk across the entire organization with relentless precision',
  },
];

const CONDITIONAL_AGENTS = {
  frontend: {
    file: 'frontend',
    role: 'Frontend Developer',
    character: 'Ginny Weasley',
    command: 'ginny',
    trait: 'Bats-Bogey Hex champion',
    why: 'Sharp, fast, and instinctively knows what users want to see — interfaces that feel like home',
  },
  backend: {
    file: 'backend',
    role: 'Backend Developer',
    character: 'Harry Potter',
    command: 'harry',
    trait: 'The Chosen One, Gryffindor Seeker',
    why: 'Works under immense pressure and always delivers — the backend that powers the entire wizarding world',
  },
  domain: {
    networking: {
      file: 'networking',
      role: 'Networking Expert',
      character: 'Nymphadora Tonks',
      command: 'tonks',
      trait: 'Metamorphmagus',
      why: 'Adapts to any protocol or topology seamlessly — shapeshifts to master whatever networking challenge appears',
      domainKey: 'networking',
    },
    ml: {
      file: 'ml-engineer',
      role: 'ML / AI Engineer',
      character: 'Nicolas Flamel',
      command: 'flamel',
      trait: "Creator of the Philosopher's Stone",
      why: 'Centuries of experimental knowledge applied to the alchemy of machine intelligence',
      domainKey: 'ml',
    },
    data: {
      file: 'dba',
      role: 'Database Engineer',
      character: 'Arthur Weasley',
      command: 'arthur',
      trait: 'Head of Misuse of Muggle Artefacts',
      why: 'Meticulous record-keeper, fascinated by how every system fits together — nothing gets lost on his watch',
      domainKey: 'data',
    },
    mobile: {
      file: 'mobile',
      role: 'Mobile Developer',
      character: 'Neville Longbottom',
      command: 'neville',
      trait: 'Sword of Gryffindor',
      why: 'Grows into extraordinary strength — finds the platform-native solution when nothing else works',
      domainKey: 'mobile',
    },
    gamedev: {
      file: 'game-developer',
      role: 'Game Developer',
      character: 'Seamus Finnigan',
      command: 'seamus',
      trait: 'Half-blood, explosively enthusiastic',
      why: 'Builds entire worlds with energy and iteration — game systems that feel alive under pressure',
      domainKey: 'gamedev',
    },
    embedded: {
      file: 'systems-engineer',
      role: 'Systems / Embedded Engineer',
      character: 'Charlie Weasley',
      command: 'charlie',
      trait: 'Dragon Keeper, Romania',
      why: 'Handles the raw, powerful systems where nothing can go wrong — tames dragons at the hardware level',
      domainKey: 'embedded',
    },
    blockchain: {
      file: 'blockchain',
      role: 'Blockchain Developer',
      character: 'Sirius Black',
      command: 'sirius',
      trait: 'Animagus, Marauder',
      why: 'Operates outside centralized authority — builds trustless systems with incorruptible integrity',
      domainKey: 'blockchain',
    },
  },
};

/** Template used when domain is free-text (other) */
const CUSTOM_DOMAIN_AGENT = {
  file: 'domain-expert',
  role: 'Domain Expert',
  character: 'Filius Flitwick',
  command: 'flitwick',
  trait: 'Head of Ravenclaw, master of charms',
  why: 'Translates deep domain knowledge into clear guidance the whole team can act on',
  template: 'domain-expert',
  domainKey: 'custom',
};

const RESERVE_CHARACTERS = [
  { character: 'Rubeus Hagrid', command: 'hagrid', trait: 'Keeper of Keys and Grounds at Hogwarts' },
  { character: 'Remus Lupin', command: 'lupin', trait: 'Defence Against the Dark Arts professor, Marauder' },
  { character: 'Fleur Delacour', command: 'fleur', trait: 'Triwizard Champion, Beauxbatons' },
  { character: 'Bill Weasley', command: 'bill', trait: 'Curse Breaker at Gringotts' },
  { character: 'Kingsley Shacklebolt', command: 'kingsley', trait: 'Minister for Magic' },
  { character: 'Fred Weasley', command: 'fred', trait: "The other half of Weasleys' Wizard Wheezes" },
  { character: 'Molly Weasley', command: 'molly', trait: 'Matriarch of the Weasley family' },
  { character: 'James Potter', command: 'james', trait: 'Head Boy, Gryffindor Marauder' },
  { character: 'Lily Potter', command: 'lily', trait: 'Brightest of her year, Charms prodigy' },
  { character: 'Regulus Black', command: 'regulus', trait: 'Slytherin, secretly heroic' },
  { character: 'Peter Pettigrew', command: 'pettigrew', trait: 'Animagus, master of disguise' },
  { character: 'Lavender Brown', command: 'lavender', trait: 'Gryffindor, fierce and passionate' },
  { character: 'Parvati Patil', command: 'parvati', trait: 'Gryffindor, intuitive and perceptive' },
  { character: 'Dean Thomas', command: 'dean', trait: 'Gryffindor, loyal and creative' },
  { character: 'Lee Jordan', command: 'lee', trait: 'Quidditch commentator, voice of the people' },
  { character: 'Colin Creevey', command: 'colin', trait: 'Gryffindor, enthusiastic documentarian' },
  { character: 'Angelina Johnson', command: 'angelina', trait: 'Gryffindor Quidditch Captain' },
  { character: 'Alicia Spinnet', command: 'alicia', trait: 'Gryffindor Chaser' },
  { character: 'Katie Bell', command: 'katie', trait: 'Gryffindor Chaser' },
  { character: 'Cormac McLaggen', command: 'cormac', trait: 'Overconfident, forceful achiever' },
  { character: 'Cho Chang', command: 'cho', trait: 'Ravenclaw Seeker, precise under pressure' },
  { character: 'Padma Patil', command: 'padma', trait: 'Ravenclaw, sharp and methodical' },
  { character: 'Helena Ravenclaw', command: 'helena', trait: 'The Grey Lady, keeper of Ravenclaw wisdom' },
  { character: 'Terry Boot', command: 'terry', trait: 'Ravenclaw, analytical and thorough' },
  { character: 'Hannah Abbott', command: 'hannah', trait: 'Hufflepuff, dependable and kind' },
  { character: 'Ernie Macmillan', command: 'ernie', trait: 'Hufflepuff prefect, by-the-book' },
  { character: 'Zacharias Smith', command: 'zacharias', trait: 'Hufflepuff, skeptical analyst' },
  { character: 'Susan Bones', command: 'susan', trait: 'Hufflepuff, hardworking and diligent' },
  { character: 'Justin Finch-Fletchley', command: 'justin', trait: 'Hufflepuff, earnest and methodical' },
  { character: 'Pansy Parkinson', command: 'pansy', trait: 'Slytherin prefect' },
  { character: 'Blaise Zabini', command: 'blaise', trait: 'Slytherin, cool and calculating' },
  { character: 'Millicent Bulstrode', command: 'millicent', trait: 'Slytherin, relentlessly direct' },
  { character: 'Pomona Sprout', command: 'sprout', trait: 'Head of Hufflepuff, patient cultivator' },
  { character: 'Sybill Trelawney', command: 'trelawney', trait: 'Divination professor, pattern spotter' },
  { character: 'Horace Slughorn', command: 'slughorn', trait: 'Potions master, well-connected collector' },
  { character: 'Poppy Pomfrey', command: 'pomfrey', trait: 'Hogwarts Nurse, meticulous healer' },
  { character: 'Rolanda Hooch', command: 'hooch', trait: 'Flying instructor, unerring referee' },
  { character: 'Argus Filch', command: 'filch', trait: 'Caretaker, finds every rule violation' },
  { character: 'Irma Pince', command: 'pince', trait: 'Hogwarts Librarian, guardian of all knowledge' },
  { character: 'Quirinus Quirrell', command: 'quirrell', trait: 'Defence professor, high-pressure performer' },
  { character: 'Cornelius Fudge', command: 'fudge', trait: 'Minister for Magic, risk-averse bureaucrat' },
  { character: 'Rufus Scrimgeour', command: 'scrimgeour', trait: 'Auror-turned-Minister, tenacious' },
  { character: 'Dolores Umbridge', command: 'umbridge', trait: 'High Inquisitor, enforces every standard' },
  { character: 'Rita Skeeter', command: 'rita', trait: 'Investigative journalist, Quick-Quotes Quill' },
  { character: 'Narcissa Malfoy', command: 'narcissa', trait: 'Slytherin, fiercely protective' },
  { character: 'Lucius Malfoy', command: 'lucius', trait: 'Politically savvy strategist' },
  { character: 'Tom Riddle', command: 'tom', trait: 'Brilliant and ruthlessly ambitious' },
  { character: 'Aberforth Dumbledore', command: 'aberforth', trait: "Hog's Head barkeeper, pragmatic and gruff" },
  { character: 'Mundungus Fletcher', command: 'mundungus', trait: 'Black market dealer, resourceful' },
  { character: 'Xenophilius Lovegood', command: 'xenophilius', trait: 'Editor of The Quibbler, unconventional thinker' },
  { character: 'Augusta Longbottom', command: 'augusta', trait: 'Formidable matriarch, uncompromising standards' },
  { character: 'Stan Shunpike', command: 'stan', trait: 'Knight Bus conductor, gets you there somehow' },
  { character: 'Kreacher', command: 'kreacher', trait: 'House-elf, obsessively meticulous' },
  { character: 'Winky', command: 'winky', trait: 'House-elf, fiercely loyal' },
  { character: 'Firenze', command: 'firenze', trait: 'Centaur, reads patterns in the stars' },
  { character: 'Moaning Myrtle', command: 'myrtle', trait: 'Ravenclaw ghost, finds every flaw' },
  { character: 'Nearly Headless Nick', command: 'nick', trait: 'Gryffindor ghost, keeper of traditions' },
];

const KNOWN_DOMAIN_KEYS = new Set(Object.keys(CONDITIONAL_AGENTS.domain));

/**
 * @param {AgentDefinition} agent
 * @param {'phoenix' | 'professional'} theme
 * @returns {AgentDefinition}
 */
function applyTheme(agent, theme) {
  if (theme !== 'professional') return { ...agent };
  return {
    ...agent,
    character: agent.role,
    command: undefined,
    trait: '',
    why: `Owns ${agent.role} responsibilities for the team and reports to the CEO.`,
  };
}

/**
 * @param {object} answers
 * @returns {AgentDefinition[]}
 */
function resolveConditionalAgents(answers) {
  const active = [];
  const domains = normalizeDomains(answers.domains ?? answers.domain);

  if (answers.frontend && answers.frontend !== 'none') {
    active.push({ ...CONDITIONAL_AGENTS.frontend });
  }
  if (answers.backend && answers.backend !== 'none') {
    active.push({ ...CONDITIONAL_AGENTS.backend });
  }

  const seenFiles = new Set();
  for (const domain of domains) {
    if (KNOWN_DOMAIN_KEYS.has(domain)) {
      const domainAgent = CONDITIONAL_AGENTS.domain[domain];
      if (!seenFiles.has(domainAgent.file)) {
        active.push({ ...domainAgent });
        seenFiles.add(domainAgent.file);
      }
    } else if (domain && domain !== 'none') {
      if (!seenFiles.has(CUSTOM_DOMAIN_AGENT.file)) {
        active.push({
          ...CUSTOM_DOMAIN_AGENT,
          domainKey: 'custom',
          customDomainLabel: domain,
        });
        seenFiles.add(CUSTOM_DOMAIN_AGENT.file);
      }
    }
  }

  return active;
}

/** @deprecated Use resolveConditionalAgents */
function resolveActiveAgents(answers) {
  return resolveConditionalAgents(answers);
}

/**
 * @param {object} answers
 * @param {'phoenix' | 'professional'} [theme]
 * @returns {AgentDefinition[]}
 */
function resolveAllAgents(answers, theme = answers.theme || 'phoenix') {
  const conditional = resolveConditionalAgents(answers);
  const customRoles = (answers.customRoles || []).map((r) => ({
    file: r.file,
    role: r.name,
    character: r.character,
    command: theme === 'professional' ? undefined : r.command,
    trait: r.trait,
    why: r.description,
    template: 'custom-role',
  }));

  const core = [...DEFAULT_AGENTS, ...conditional].map((a) => applyTheme(a, theme));
  return [...core, ...customRoles];
}

/**
 * @param {AgentDefinition} agent
 * @returns {string}
 */
function templatePathForAgent(agent) {
  if (agent.template === 'custom-role') return 'commands/custom-role.md.hbs';
  if (agent.template === 'domain-expert' || agent.domainKey === 'custom') {
    return 'commands/domain-expert.md.hbs';
  }
  const file = agent.file;
  return `commands/${file}.md.hbs`;
}

/**
 * @returns {Set<string>}
 */
function buildReservedSlugs() {
  const reserved = new Set([...UTILITY_COMMANDS]);
  for (const agent of DEFAULT_AGENTS) {
    reserved.add(agent.file);
    if (agent.command) reserved.add(agent.command);
  }
  for (const agent of Object.values(CONDITIONAL_AGENTS)) {
    if (agent.file) {
      reserved.add(agent.file);
      if (agent.command) reserved.add(agent.command);
    } else {
      for (const domainAgent of Object.values(agent)) {
        reserved.add(domainAgent.file);
        if (domainAgent.command) reserved.add(domainAgent.command);
      }
    }
  }
  reserved.add(CUSTOM_DOMAIN_AGENT.file);
  if (CUSTOM_DOMAIN_AGENT.command) reserved.add(CUSTOM_DOMAIN_AGENT.command);
  return reserved;
}

/**
 * @param {object[]} customRoles
 */
function validateCustomRoles(customRoles) {
  const reserved = buildReservedSlugs();
  for (const role of customRoles) {
    assertNoCollision(reserved, role.file, role.command, `Custom role "${role.name}"`);
  }
}

module.exports = {
  DEFAULT_AGENTS,
  CONDITIONAL_AGENTS,
  CUSTOM_DOMAIN_AGENT,
  RESERVE_CHARACTERS,
  KNOWN_DOMAIN_KEYS,
  applyTheme,
  resolveConditionalAgents,
  resolveActiveAgents,
  resolveAllAgents,
  templatePathForAgent,
  buildReservedSlugs,
  validateCustomRoles,
};
