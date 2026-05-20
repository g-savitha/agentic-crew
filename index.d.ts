export const PACKAGE_VERSION: string;
export const SCHEMA_VERSION: number;
export const MANIFEST_FILENAME: string;
export const THEMES: readonly string[];
export const IDE_TARGETS: readonly string[];
export const PRESET_KEYS: readonly string[];

export interface ScaffoldAnswers {
  projectName?: string;
  projectDescription?: string;
  githubRepo?: string;
  frontend?: string;
  backend?: string;
  domains?: string[];
  domain?: string;
  optionalRoles?: string[];
  customRoles?: CustomRoleInput[];
  outputDir?: string;
  theme?: 'phoenix' | 'professional';
  targets?: string | string[];
  preset?: string;
  presetExcludeFiles?: Set<string>;
  withSecurityCi?: boolean;
  withGitignore?: boolean;
}

export interface CustomRoleInput {
  name: string;
  description: string;
  file: string;
  character?: string;
  trait?: string;
  command?: string;
}

export interface ScaffoldOptions {
  dryRun?: boolean;
  force?: boolean;
  forceOverwrite?: boolean;
  backup?: boolean;
  isUpdate?: boolean;
  withSecurityCi?: boolean;
  prune?: boolean;
  quiet?: boolean;
}

export interface ScaffoldResult {
  commandDirs: string[];
  agentDir: string;
  allAgents: AgentDefinition[];
  outputDir: string;
  manifestPath: string;
  agentCount: number;
  skippedFiles?: string[];
  pruned?: string[];
  supplementaryWritten?: string[];
  theme?: string;
}

export interface AgentDefinition {
  file: string;
  role: string;
  character: string;
  command?: string;
  trait: string;
  why: string;
  seniorBrief?: string;
}

export interface DoctorResult {
  ok: boolean;
  issues: string[];
  warnings: string[];
  drift: string[];
  fixed: string[];
  manifest?: object;
  root?: string;
}

export interface UpdateResult {
  manifestPath: string;
  skippedFiles?: string[];
  pruned?: string[];
  overwriteDocs?: boolean;
  dryRun?: boolean;
  wouldPrune?: string[];
  wouldUpdate?: PlannedFileChange[];
  wouldPreserve?: PlannedFileChange[];
  agents?: number;
}

export interface PlannedFileChange {
  path: string;
  action: 'update' | 'preserve' | 'create';
  reason?: string;
}

export interface UninstallResult {
  removed: string[];
  keepState: boolean;
  dryRun: boolean;
  root: string;
}

export interface ThemePack {
  id: string;
  label: string;
  catalogCommand: string;
  useCharacterAliases: boolean;
  startCommand: string;
  catalogTitle: string;
}

export function scaffold(answers: ScaffoldAnswers, options?: ScaffoldOptions): Promise<ScaffoldResult>;
export function runDoctor(
  projectDir?: string,
  options?: { fix?: boolean; prune?: boolean; strict?: boolean; json?: boolean; quiet?: boolean }
): Promise<DoctorResult>;
export function runUpdate(
  projectDir?: string,
  options?: {
    force?: boolean;
    forceOverwrite?: boolean;
    backup?: boolean;
    dryRun?: boolean;
    json?: boolean;
  }
): Promise<UpdateResult>;
export function runUninstall(
  projectDir?: string,
  options?: { keepState?: boolean; dryRun?: boolean }
): Promise<UninstallResult>;
export function resolveAllAgents(answers: ScaffoldAnswers, theme?: 'phoenix' | 'professional'): AgentDefinition[];
export function migrateManifest(manifest: object): object;
export function loadProjectConfig(options?: {
  configPath?: string;
  startDir?: string;
}): Promise<{ config: object | null; configPath: string | null }>;
export function previewCommandFiles(
  answers: ScaffoldAnswers,
  options?: { isUpdate?: boolean }
): Promise<Array<{ rel: string; content: string }>>;
export function planUpdateChanges(
  root: string,
  answers: ScaffoldAnswers,
  manifest: object,
  options?: { forceOverwrite?: boolean }
): Promise<{ wouldUpdate: PlannedFileChange[]; wouldPreserve: PlannedFileChange[] }>;
export function runManifestMigrations(manifest: object): { manifest: object; applied: string[] };
export function appendGitignoreRecommendations(outputDir: string): Promise<{ appended: boolean; gitignorePath: string }>;
export function validateHeartbeatContent(content: string): { valid: boolean; reason?: string };
export function validateStatusContent(content: string): { valid: boolean; reason?: string };
export function validateCatalogContent(
  content: string,
  params: { agents: Array<{ file: string; command?: string | null }>; catalogCommand: string }
): string[];
export function resolveCatalogAgentGroups(
  answers: ScaffoldAnswers,
  theme?: 'phoenix' | 'professional'
): {
  defaultAgents: AgentDefinition[];
  conditionalAgents: AgentDefinition[];
  optionalAgents: AgentDefinition[];
};
export function documentationInboxFor(allAgents: AgentDefinition[]): string;
export function writeStarterRunbooks(options: object): Promise<string[]>;
export function getThemePack(themeId?: 'phoenix' | 'professional'): ThemePack;
export function applyThemePack(agent: AgentDefinition, themeId?: 'phoenix' | 'professional'): AgentDefinition;
export const THEME_PACKS: { phoenix: ThemePack; professional: ThemePack };
export const PHOENIX: ThemePack;
export function catalogCommandForTheme(theme?: 'phoenix' | 'professional'): string;
