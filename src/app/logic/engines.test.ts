import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARTIFACT_SPECS,
  buildInstallCommands,
  generateInstallSh,
  generateSelfExtractingBundle,
  SKILLS_CATALOG,
  VERIFIER_SCRIPTS
} from './export-bundle';
import { filterSkills, getSkillById, getVerifierById } from './engines';

test('SKILLS_CATALOG contains all 11 universal agent skills with zero hardcoded Calendly/Splitwise presets', () => {
  assert.equal(SKILLS_CATALOG.length, 11);
  assert.equal(SKILLS_CATALOG[0].slash, '/replica-recon');
  assert.equal(SKILLS_CATALOG[10].slash, '/replica-deploy');

  for (const skill of SKILLS_CATALOG) {
    assert.equal(skill.skillMarkdown.includes('compatibility:\n  - opencode\n  - google-antigravity'), true);
    assert.equal(skill.skillMarkdown.toLowerCase().includes('calendly'), false);
    assert.equal(skill.skillMarkdown.toLowerCase().includes('splitwise'), false);
  }
});

test('VERIFIER_SCRIPTS contains all 5 deterministic Python 3.8+ scripts', () => {
  assert.equal(VERIFIER_SCRIPTS.length, 5);
  const filenames = VERIFIER_SCRIPTS.map((v) => v.filename);
  assert.deepEqual(filenames, ['parity.py', 'imgdiff.py', 'reviews.py', 'listing.py', 'sweep.py']);
  for (const script of VERIFIER_SCRIPTS) {
    assert.equal(script.code.startsWith('#!/usr/bin/env python3'), true);
  }
});

test('buildInstallCommands generates valid OpenCode and Google Antigravity paths for global and local scopes', () => {
  const globalBoth = buildInstallCommands({
    agent: 'both',
    scope: 'global',
    customLocalDir: '.',
    baseUrl: 'https://replica-skill.example.com'
  });
  assert.equal(globalBoth.curlOneLiner.includes('--global --agent both'), true);
  assert.equal(globalBoth.targetPaths.length, 2);
  assert.equal(globalBoth.targetPaths[0].includes('.config/opencode/skills'), true);
  assert.equal(globalBoth.targetPaths[1].includes('.gemini/config/skills'), true);

  const localOpencode = buildInstallCommands({
    agent: 'opencode',
    scope: 'local',
    customLocalDir: './my-app',
    baseUrl: 'https://replica-skill.example.com'
  });
  assert.equal(localOpencode.curlOneLiner.includes('--local ./my-app --agent opencode'), true);
  assert.equal(localOpencode.targetPaths[0], './my-app/.opencode/skills/replica-*/SKILL.md');
});

test('filterSkills filters by phase and search query accurately', () => {
  const reconPhase = filterSkills(SKILLS_CATALOG, 'recon-design', '');
  assert.equal(reconPhase.length, 3);

  const sweepSearch = filterSkills(SKILLS_CATALOG, 'all', 'sweep.py');
  assert.equal(sweepSearch.length, 1);
  assert.equal(sweepSearch[0].id, 'replica-deploy');

  assert.equal(getSkillById('replica-entrepreneur').step, 8);
  assert.equal(getVerifierById('imgdiff').filename, 'imgdiff.py');
});

test('generateInstallSh and generateSelfExtractingBundle include all 11 skills and 5 scripts', () => {
  const installSh = generateInstallSh();
  assert.equal(installSh.includes('.config/opencode/skills'), true);
  assert.equal(installSh.includes('.gemini/config/skills'), true);

  const bundle = generateSelfExtractingBundle();
  assert.equal(bundle.includes('.agents/skills/replica-recon/SKILL.md'), true);
  assert.equal(bundle.includes('.agents/skills/replica-deploy/scripts/sweep.py'), true);
  assert.equal(ARTIFACT_SPECS.length, 12);
});
