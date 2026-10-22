import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import {
  ARTIFACT_SPECS,
  generateInstallSh,
  generateSelfExtractingBundle,
  SKILLS_CATALOG,
  VERIFIER_SCRIPTS,
} from './app/logic/export-bundle';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Direct raw endpoints so users and AI agents (OpenCode / Google Antigravity)
 * can install the 11 skills via `curl -fsSL <URL>/bundle.sh | bash` or inspect raw SKILL.md files.
 */
app.get('/install.sh', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="install.sh"');
  res.send(generateInstallSh());
});

app.get('/bundle.sh', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="replica-skill-bundle.sh"');
  res.send(generateSelfExtractingBundle());
});

app.get('/skills/:skillId/SKILL.md', (req, res) => {
  const skill = SKILLS_CATALOG.find((s) => s.id === req.params['skillId']);
  if (!skill) {
    res.status(404).type('text/plain').send('Skill not found');
    return;
  }
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.send(skill.skillMarkdown);
});

app.get('/scripts/:filename', (req, res) => {
  const rawName = req.params['filename'].replace(/\.py$/, '');
  const script = VERIFIER_SCRIPTS.find(
    (v) => v.id === rawName || v.filename === req.params['filename']
  );
  if (!script) {
    res.status(404).type('text/plain').send('Script not found');
    return;
  }
  res.setHeader('Content-Type', 'text/x-python; charset=utf-8');
  res.send(script.code);
});

app.get('/api/manifest', (_req, res) => {
  res.json({
    name: 'replica-skill',
    version: '2.0.0',
    license: 'MIT',
    compatibility: ['opencode', 'google-antigravity'],
    skills_count: SKILLS_CATALOG.length,
    verifiers_count: VERIFIER_SCRIPTS.length,
    artifacts_count: ARTIFACT_SPECS.length,
    skills: SKILLS_CATALOG.map((s) => ({
      id: s.id,
      step: s.step,
      slash: s.slash,
      name: s.name,
      writesArtifact: s.writesArtifact,
      verifierScript: s.verifierScript,
      rawUrl: `/skills/${s.id}/SKILL.md`,
    })),
    verifiers: VERIFIER_SCRIPTS.map((v) => ({
      id: v.id,
      filename: v.filename,
      repoPath: v.repoPath,
      rawUrl: `/scripts/${v.filename}`,
    })),
  });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
