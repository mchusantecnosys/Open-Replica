# replica-skill — 11 Agent Skills for OpenCode & Google Antigravity IDE/CLI

**Reverse-engineer any application → Rebuild it clean-room → Test E2E → Fix what users hate → Ship clean.**

`replica-skill` is an open-source collection of **11 universal AI agent skills** (`SKILL.md`) and **5 zero-dependency Python 3.8+ verification scripts** designed for **OpenCode** (`.opencode/skills/`) and **Google Antigravity IDE / CLI** (`.agents/skills/`).

Inspired by [`Jakeschincariol/replica-skill`](https://github.com/Jakeschincariol/replica-skill), it requires **no API keys, no signups, and no `pip install`**.

---

## Quick Installation

### Option 1: One-Line Installer (`curl`)

```bash
# Install globally for both OpenCode (~/.config/opencode/skills) & Google Antigravity (~/.gemini/config/skills)
curl -fsSL http://localhost:3000/bundle.sh | bash -s -- --global --agent both

# Or install locally into your current project workspace (./.opencode/skills & ./.agents/skills)
curl -fsSL http://localhost:3000/bundle.sh | bash -s -- --local . --agent both
```

### Option 2: Clone & Run `./install.sh`

```bash
# Global installation for both agents
./install.sh --global --agent both

# Local installation in a specific project directory
./install.sh --local ./my-project --agent both

# Install only for OpenCode or only for Google Antigravity
./install.sh --global --agent opencode
./install.sh --global --agent antigravity
```

### Option 3: Paste Directly into OpenCode or Google Antigravity

Paste the following instruction into your agent chat:
```text
Install the 11 replica-skill agent skills by running: ./install.sh --local . --agent both
```

---

## The 11 Skills Pipeline

All 11 skills communicate through structured files in the `./replica/` directory of your target project:

| Stage | Slash Command | Writes Artifact | Deterministic Verifier | Summary |
| :---: | :--- | :--- | :--- | :--- |
| **01** | `/replica-recon` | `replica/recon.md` + `features.csv` | — | Maps public screens (`S01..SNN`), user flows, data model, complexity sizing, and forbidden brand tokens. |
| **02** | `/replica-architect` | `replica/architecture.md` | — | Plans SQL schema with mandatory Row-Level Security (RLS), server validation schemas, and UTC timestamps. |
| **03** | `/replica-design` | `replica/design-system.md` | — | Preserves UX ergonomics while replacing 100% of competitor brand colors, typography, and micro-copy. |
| **04** | `/replica-build` | App UI + `replica/features.csv` | — | Rebuilds screens `S01..SNN` with empty, loading, error, and populated states; updates `features.csv`. |
| **05** | `/replica-backend` | `replica/security-checklist.md` | — | Implements backend persistence, schema validation, idempotency, and verifies User A / User B isolation. |
| **06** | `/replica-test` | `replica/bugs.md` + `clone-screens/` | — | Runs headless browser E2E flows, captures clone screenshots, and logs/fixes `S1`/`S2`/`S3` defects. |
| **07** | `/replica-diff` | `replica/diff-report.md` | `parity.py` + `imgdiff.py` | Computes weighted feature parity % and 4x4 Sobel edge-map structural similarity. |
| **08** | `/replica-entrepreneur` | `replica/reviews.csv` + `entrepreneur.md` | `reviews.py` | Validates real 1–3★ user complaints with URLs (`>=3` quotes across `>=2` sources) and ships product upgrades. |
| **09** | `/replica-brand` | `replica/brand.md` | — | Creates an original brand name, domain check, trademark checklist, and custom SVG assets. |
| **10** | `/replica-launch` | `replica/store-listing.json` | `listing.py` | Generates iOS App Store & Google Play metadata and lints character budgets and banned claims. |
| **11** | `/replica-deploy` | `replica/deploy-manifest.md` | `sweep.py` + `parity.py` | Scans the entire repository and blocks deployment if any competitor brand name, domain, or hex color remains. |

---

## The 5 Zero-Dependency Python Verifiers

Located inside `.agents/skills/*/scripts/` (and mirrored in `.opencode/skills/*/scripts/`):

1. **`parity.py`** (`.agents/skills/replica-diff/scripts/parity.py`)
   ```bash
   python3 .agents/skills/replica-diff/scripts/parity.py replica/features.csv --bugs replica/bugs.md --entrepreneur
   ```
2. **`imgdiff.py`** (`.agents/skills/replica-diff/scripts/imgdiff.py`)
   ```bash
   python3 .agents/skills/replica-diff/scripts/imgdiff.py replica/screens/S01.png replica/clone-screens/S01.png --json
   ```
3. **`reviews.py`** (`.agents/skills/replica-entrepreneur/scripts/reviews.py`)
   ```bash
   python3 .agents/skills/replica-entrepreneur/scripts/reviews.py replica/reviews.csv
   ```
4. **`listing.py`** (`.agents/skills/replica-launch/scripts/listing.py`)
   ```bash
   python3 .agents/skills/replica-launch/scripts/listing.py replica/store-listing.json --forbid "IncumbentName,incumbent.com"
   ```
5. **`sweep.py`** (`.agents/skills/replica-deploy/scripts/sweep.py`)
   ```bash
   python3 .agents/skills/replica-deploy/scripts/sweep.py --root . --forbid "IncumbentName,incumbent.com,#006BFF"
   ```

---

## Repository Directory Layout

```text
├── install.sh                                           # Dual installer for OpenCode & Google Antigravity
├── .agents/skills/                                      # Google Antigravity IDE/CLI skill definitions
│   ├── replica-recon/SKILL.md
│   ├── replica-architect/SKILL.md
│   ├── replica-design/SKILL.md
│   ├── replica-build/SKILL.md
│   ├── replica-backend/SKILL.md
│   ├── replica-test/SKILL.md
│   ├── replica-diff/
│   │   ├── SKILL.md
│   │   └── scripts/{parity.py,imgdiff.py}
│   ├── replica-entrepreneur/
│   │   ├── SKILL.md
│   │   └── scripts/reviews.py
│   ├── replica-brand/SKILL.md
│   ├── replica-launch/
│   │   ├── SKILL.md
│   │   └── scripts/listing.py
│   └── replica-deploy/
│       ├── SKILL.md
│       └── scripts/sweep.py
└── .opencode/skills/                                    # OpenCode CLI/TUI skill definitions (mirror)
```
