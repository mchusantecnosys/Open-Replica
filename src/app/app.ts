import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  AgentTarget,
  ArtifactSpecItem,
  InstallMethod,
  InstallScope,
  SkillDefinition,
  SkillPhase,
  VerifierScriptSpec
} from './models/replica.models';
import {
  ARTIFACT_SPECS,
  buildInstallCommands,
  generateInstallSh,
  generateSelfExtractingBundle,
  SKILLS_CATALOG,
  VERIFIER_SCRIPTS
} from './logic/export-bundle';
import { filterSkills } from './logic/engines';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);

  // Base URL for live curl one-liner
  readonly baseUrl = signal<string>('https://replica-skill.dev');

  // Section 1: Interactive Installer State
  readonly selectedAgent = signal<AgentTarget>('both');
  readonly selectedScope = signal<InstallScope>('global');
  readonly customLocalDir = signal<string>('.');
  readonly selectedInstallMethod = signal<InstallMethod>('prompt');

  readonly installCommands = computed(() =>
    buildInstallCommands({
      agent: this.selectedAgent(),
      scope: this.selectedScope(),
      customLocalDir: this.customLocalDir(),
      baseUrl: this.baseUrl()
    })
  );

  // Section 2: 11 Skills Catalog & Reader State
  readonly allSkills: SkillDefinition[] = SKILLS_CATALOG;
  readonly skillPhaseFilter = signal<'all' | SkillPhase>('all');
  readonly skillSearchQuery = signal<string>('');
  readonly filteredSkills = computed(() =>
    filterSkills(this.allSkills, this.skillPhaseFilter(), this.skillSearchQuery())
  );
  readonly selectedSkillId = signal<string>('replica-recon');
  readonly selectedSkill = computed<SkillDefinition>(() => {
    const list = this.filteredSkills();
    const match = list.find((s) => s.id === this.selectedSkillId());
    if (match) return match;
    return list[0] || this.allSkills[0];
  });
  readonly skillViewMode = signal<'overview' | 'raw'>('overview');

  // Section 3: 5 Python Verifiers State
  readonly verifiers: VerifierScriptSpec[] = VERIFIER_SCRIPTS;
  readonly selectedVerifierId = signal<string>('parity');
  readonly selectedVerifier = computed<VerifierScriptSpec>(
    () =>
      this.verifiers.find((v) => v.id === this.selectedVerifierId()) ||
      this.verifiers[0]
  );

  // Section 4: replica/ Artifact Specification State
  readonly artifactSpecs: ArtifactSpecItem[] = ARTIFACT_SPECS;
  readonly selectedArtifactId = signal<string>('recon-md');
  readonly selectedArtifact = computed<ArtifactSpecItem>(
    () =>
      this.artifactSpecs.find((a) => a.id === this.selectedArtifactId()) ||
      this.artifactSpecs[0]
  );

  // Clipboard Feedback
  readonly copiedKey = signal<string | null>(null);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      this.baseUrl.set(window.location.origin);
    }
  }

  setAgent(agent: AgentTarget): void {
    this.selectedAgent.set(agent);
  }

  setScope(scope: InstallScope): void {
    this.selectedScope.set(scope);
  }

  setInstallMethod(method: InstallMethod): void {
    this.selectedInstallMethod.set(method);
  }

  onLocalDirInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.customLocalDir.set(val);
  }

  setPhaseFilter(phase: 'all' | SkillPhase): void {
    this.skillPhaseFilter.set(phase);
    const list = this.filteredSkills();
    if (list.length > 0 && !list.some((s) => s.id === this.selectedSkillId())) {
      this.selectedSkillId.set(list[0].id);
    }
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.skillSearchQuery.set(val);
    const list = this.filteredSkills();
    if (list.length > 0 && !list.some((s) => s.id === this.selectedSkillId())) {
      this.selectedSkillId.set(list[0].id);
    }
  }

  clearSearch(): void {
    this.skillSearchQuery.set('');
    this.skillPhaseFilter.set('all');
  }

  selectSkill(skillId: string): void {
    this.selectedSkillId.set(skillId);
  }

  setSkillViewMode(mode: 'overview' | 'raw'): void {
    this.skillViewMode.set(mode);
  }

  selectVerifier(verifierId: string): void {
    this.selectedVerifierId.set(verifierId);
  }

  selectArtifact(artifactId: string): void {
    this.selectedArtifactId.set(artifactId);
  }

  scrollToSection(sectionId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  copyText(key: string, text: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard?.writeText(text);
    this.copiedKey.set(key);
    setTimeout(() => {
      if (this.copiedKey() === key) {
        this.copiedKey.set(null);
      }
    }, 2000);
  }

  downloadTextFile(filename: string, content: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  downloadBundleSh(): void {
    this.downloadTextFile('replica-skill-bundle.sh', generateSelfExtractingBundle());
  }

  downloadInstallSh(): void {
    this.downloadTextFile('install.sh', generateInstallSh());
  }

  downloadSelectedSkill(): void {
    const skill = this.selectedSkill();
    this.downloadTextFile(`${skill.id}-SKILL.md`, skill.skillMarkdown);
  }

  downloadSelectedVerifier(): void {
    const v = this.selectedVerifier();
    this.downloadTextFile(v.filename, v.code);
  }

  downloadSelectedArtifactTemplate(): void {
    const art = this.selectedArtifact();
    const filename = art.path.split('/').pop() || 'artifact.md';
    this.downloadTextFile(filename, art.templateContent);
  }
}
