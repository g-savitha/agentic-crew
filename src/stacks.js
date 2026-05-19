const FRONTEND_STACKS = [
  { value: 'none', label: 'None / Not applicable' },
  { value: 'react', label: 'React', hint: 'Vite / CRA / React Router' },
  { value: 'nextjs', label: 'Next.js', hint: 'App Router, Server Components' },
  { value: 'vue', label: 'Vue / Nuxt', hint: 'Vue 3 / Nuxt 3' },
  { value: 'svelte', label: 'Svelte / SvelteKit' },
  { value: 'angular', label: 'Angular' },
  { value: 'other', label: 'Other (specify)' },
];

const BACKEND_STACKS = [
  { value: 'none', label: 'None / Not applicable' },
  { value: 'go', label: 'Go', hint: 'cobra, chi, gin, echo' },
  { value: 'python', label: 'Python', hint: 'FastAPI / Django / Flask' },
  { value: 'nodejs', label: 'Node.js', hint: 'Express / Fastify / NestJS' },
  { value: 'rust', label: 'Rust', hint: 'Actix / Axum / Rocket' },
  { value: 'java', label: 'Java / Spring', hint: 'Spring Boot / Quarkus' },
  { value: 'ruby', label: 'Ruby on Rails' },
  { value: 'dotnet', label: '.NET / C#' },
  { value: 'other', label: 'Other (specify)' },
];

const DOMAINS = [
  { value: 'networking', label: 'Networking / Protocols', hint: 'TCP, UDP, QUIC, WebSockets, gRPC' },
  { value: 'ml', label: 'Machine Learning / AI', hint: 'PyTorch, TensorFlow, LLMs, embeddings' },
  { value: 'data', label: 'Databases / Data Engineering', hint: 'SQL, NoSQL, streaming, ETL' },
  { value: 'mobile', label: 'Mobile', hint: 'iOS (Swift/SwiftUI), Android (Kotlin), React Native' },
  { value: 'gamedev', label: 'Game Development', hint: 'Unity, Unreal, custom engine' },
  { value: 'embedded', label: 'Embedded / Systems', hint: 'C/C++, RTOS, bare metal' },
  { value: 'blockchain', label: 'Blockchain / Web3', hint: 'Solidity, EVM, smart contracts' },
  { value: 'other', label: 'Other (specify)' },
];

const STACK_DESCRIPTIONS = {
  frontend: {
    none: null,
    react: 'React (TypeScript, Vite or CRA, React Router)',
    nextjs: 'Next.js (TypeScript, App Router, Server Components, Tailwind)',
    vue: 'Vue 3 / Nuxt 3 (Composition API, TypeScript)',
    svelte: 'SvelteKit (TypeScript)',
    angular: 'Angular (TypeScript)',
  },
  backend: {
    none: null,
    go: 'Go',
    python: 'Python',
    nodejs: 'Node.js',
    rust: 'Rust',
    java: 'Java / Spring Boot',
    ruby: 'Ruby on Rails',
    dotnet: '.NET / C#',
  },
  domain: {
    none: null,
    networking: 'Networking & Protocols',
    ml: 'Machine Learning / AI',
    data: 'Databases & Data Engineering',
    mobile: 'Mobile Development',
    gamedev: 'Game Development',
    embedded: 'Embedded & Systems Programming',
    blockchain: 'Blockchain & Web3',
  },
};

const { normalizeDomains } = require('./utils');
const { KNOWN_DOMAIN_KEYS } = require('./agents');

/**
 * @param {object} answers
 */
function resolveStack(answers) {
  const feKey = answers.frontend;
  const beKey = answers.backend;
  const fe = STACK_DESCRIPTIONS.frontend[feKey] || (feKey && feKey !== 'none' ? feKey : null);
  const be = STACK_DESCRIPTIONS.backend[beKey] || (beKey && beKey !== 'none' ? beKey : null);

  const domainKeys = normalizeDomains(answers.domains ?? answers.domain);
  const domainLabels = domainKeys.map((key) => {
    if (STACK_DESCRIPTIONS.domain[key]) return STACK_DESCRIPTIONS.domain[key];
    if (KNOWN_DOMAIN_KEYS.has(key)) return STACK_DESCRIPTIONS.domain[key];
    return key;
  });

  const domainExpertise =
    domainLabels.length > 0 ? domainLabels.join('; ') : null;

  return {
    frontendStack: fe,
    backendStack: be,
    domainExpertise,
    domainKeys,
    hasFrontend: !!fe,
    hasBackend: !!be,
    hasDomain: domainLabels.length > 0,
  };
}

module.exports = {
  FRONTEND_STACKS,
  BACKEND_STACKS,
  DOMAINS,
  STACK_DESCRIPTIONS,
  resolveStack,
};
