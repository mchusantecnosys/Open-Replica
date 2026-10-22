export type SkillPhase = 'recon-design' | 'build-verify' | 'improve-ship';
export type AgentTarget = 'both' | 'opencode' | 'antigravity';
export type InstallScope = 'global' | 'local';
export type InstallMethod = 'prompt' | 'curl' | 'clone' | 'bundle';

export interface SkillDefinition {
  id: string;
  step: number;
  stepFormatted: string;
  slash: string;
  name: string;
  phase: SkillPhase;
  phaseLabel: string;
  readsArtifacts: string[];
  writesArtifact: string;
  verifierScript: string | null;
  summary: string;
  whenToUse: string;
  inputsExpected: string[];
  executionProtocol: string[];
  cleanRoomRules: string[];
  acceptanceGate: string;
  skillMarkdown: string;
}

export interface VerifierScriptSpec {
  id: string;
  filename: string;
  skillId: string;
  slashCommand: string;
  repoPath: string;
  title: string;
  purpose: string;
  cliUsage: string;
  exitZeroCondition: string;
  exitOneCondition: string;
  sampleOutputJson: string;
  code: string;
}

export interface ArtifactSpecItem {
  id: string;
  path: string;
  producedBy: string;
  consumedBy: string;
  format: 'markdown' | 'csv' | 'json';
  purpose: string;
  templateContent: string;
}

export interface InstallConfig {
  agent: AgentTarget;
  scope: InstallScope;
  customLocalDir: string;
  baseUrl: string;
}

export interface GeneratedInstallCommands {
  agentPrompt: string;
  curlOneLiner: string;
  gitCloneCommands: string;
  targetPaths: string[];
  verificationCommand: string;
}
