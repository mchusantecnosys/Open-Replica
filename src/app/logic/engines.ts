import { SkillDefinition, VerifierScriptSpec } from '../models/replica.models';
import { SKILLS_CATALOG, VERIFIER_SCRIPTS } from './export-bundle';

export function filterSkills(
  skills: SkillDefinition[],
  phase: 'all' | 'recon-design' | 'build-verify' | 'improve-ship',
  query: string
): SkillDefinition[] {
  const q = (query || '').trim().toLowerCase();
  return skills.filter((s) => {
    const matchesPhase = phase === 'all' || s.phase === phase;
    if (!matchesPhase) return false;
    if (!q) return true;
    return (
      s.id.toLowerCase().includes(q) ||
      s.slash.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.writesArtifact.toLowerCase().includes(q) ||
      (s.verifierScript && s.verifierScript.toLowerCase().includes(q))
    );
  });
}

export function getSkillById(skillId: string): SkillDefinition {
  return SKILLS_CATALOG.find((s) => s.id === skillId) || SKILLS_CATALOG[0];
}

export function getVerifierById(verifierId: string): VerifierScriptSpec {
  return VERIFIER_SCRIPTS.find((v) => v.id === verifierId) || VERIFIER_SCRIPTS[0];
}
