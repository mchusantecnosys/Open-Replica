import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  ShieldCheck,
  Sparkles,
  FileCode,
  FolderOpen,
  Eye,
  Code2,
  Copy,
  Check,
  RefreshCw,
  Search,
  Rocket,
  Bug,
  GitCompare,
  Palette,
  Store,
  Lock,
  ChevronRight,
  Download,
  Cpu,
  ArrowRight,
  Sliders,
  ExternalLink,
  Zap
} from 'lucide-react';

// ============================================================================
// PRESETS & INITIAL PIPELINE STATE
// ============================================================================
const TARGET_PRESETS = {
  calendly: {
    id: 'calendly',
    originalName: 'Calendly',
    originalDomain: 'calendly.com',
    originalHex: '#006BFF',
    originalSecondaryHex: '#0B3558',
    cloneName: 'ChronosFlow',
    cloneDomain: 'chronosflow.io',
    cloneHex: '#10B981',
    cloneSecondaryHex: '#064E3B',
    category: 'Scheduling & Booking SaaS',
    sizing: '1-2 Weeks (CRUD + Calendar OAuth + Timezone Engine + Stripe)',
    painPointFixed: 'Multi-calendar conflict check & dark mode included in Free tier + 1-click ICS/CSV export without paywall'
  },
  splitwise: {
    id: 'splitwise',
    originalName: 'Splitwise',
    originalDomain: 'splitwise.com',
    originalHex: '#5BC5A7',
    originalSecondaryHex: '#FF652F',
    cloneName: 'FairShare',
    cloneDomain: 'fairshare.app',
    cloneHex: '#6366F1',
    cloneSecondaryHex: '#312E81',
    category: 'Group Expense Splitter',
    sizing: '1 Week (Ledger Graph + Debt Simplification Algorithm + Receipt OCR)',
    painPointFixed: 'Removed 3-expenses-per-day paywall limit, removed 10-second wait screen, added instant offline entry & free CSV export'
  }
};

const INITIAL_FEATURES = [
  { id: 'F-01', screen_id: 'S01', feature: 'Public booking page with timezone auto-detection', priority: 'must', clone: 'yes', notes: 'Clean-room Luxon/Intl implementation' },
  { id: 'F-02', screen_id: 'S01', feature: 'Available time-slot grid & conflict filtering', priority: 'must', clone: 'yes', notes: 'Queries UTC ranges with row-level lock' },
  { id: 'F-03', screen_id: 'S02', feature: 'Attendee booking form with Zod validation & confirmation email', priority: 'must', clone: 'yes', notes: 'Uses Resend transactional template' },
  { id: 'F-04', screen_id: 'S03', feature: 'Host dashboard with upcoming/past bookings filter', priority: 'must', clone: 'yes', notes: 'Includes RLS user isolation check' },
  { id: 'F-05', screen_id: 'S03', feature: 'Availability schedule rules & buffer time editor', priority: 'should', clone: 'yes', notes: 'Supports per-day overrides' },
  { id: 'F-06', screen_id: 'S04', feature: 'Stripe test-mode checkout for paid consultations', priority: 'should', clone: 'yes', notes: 'Webhook signature verified' },
  { id: 'F-07', screen_id: 'S04', feature: 'Custom routing forms for enterprise lead qualification', priority: 'could', clone: 'partial', notes: 'Basic branching implemented' },
  { id: 'F-08', screen_id: 'S05', feature: 'Salesforce native bi-directional enterprise sync', priority: 'could', clone: 'skip', notes: 'Skipped: Enterprise bloat out of MVP scope' }
];

const INITIAL_BUGS = [
  { id: 'BUG-01', severity: 'S1', screen: 'S02', description: 'Double-clicking "Confirm Booking" creates duplicate calendar events', status: 'fixed' },
  { id: 'BUG-02', severity: 'S2', screen: 'S03', description: 'User B could read User A availability rules via direct UUID query (RLS gap)', status: 'fixed' },
  { id: 'BUG-03', severity: 'S3', screen: 'S01', description: 'Timezone dropdown scrollbar clips on 390px mobile viewport', status: 'open' }
];

const INITIAL_REVIEWS = [
  {
    id: 1,
    source: 'g2.com',
    url: 'https://www.g2.com/products/target-app/reviews/review-101',
    rating: 2,
    theme: 'paywalled-core-features',
    quote: 'They locked multi-calendar conflict detection behind a pricey tier after years of it being standard.'
  },
  {
    id: 2,
    source: 'trustpilot.com',
    url: 'https://www.trustpilot.com/review/target-app.com/88219',
    rating: 1,
    theme: 'paywalled-core-features',
    quote: 'Cannot even connect two Google calendars to prevent double booking without upgrading every single seat.'
  },
  {
    id: 3,
    source: 'reddit.com',
    url: 'https://www.reddit.com/r/SaaS/comments/19x82a/frustrated_with_scheduling_paywalls',
    rating: 2,
    theme: 'paywalled-core-features',
    quote: 'All I want is basic conflict checking across personal and work calendars without paying $15/mo.'
  },
  {
    id: 4,
    source: 'capterra.com',
    url: 'https://www.capterra.com/p/148291/target-app/reviews/49102/',
    rating: 2,
    theme: 'timezone-ux-confusion',
    quote: 'Invitees constantly book the wrong hour because the timezone selector is tiny and hidden below the calendar.'
  },
  {
    id: 5,
    source: 'g2.com',
    url: 'https://www.g2.com/products/target-app/reviews/review-209',
    rating: 3,
    theme: 'timezone-ux-confusion',
    quote: 'My international clients miss meetings because the local time vs host time toggle is easy to miss.'
  },
  {
    id: 6,
    source: 'news.ycombinator.com',
    url: 'https://news.ycombinator.com/item?id=39102941',
    rating: 2,
    theme: 'timezone-ux-confusion',
    quote: 'Why doesn’t the booking widget show both my time and the host time side-by-side by default?'
  },
  {
    id: 7,
    source: 'reddit.com',
    url: '', // Intentionally missing URL to demonstrate reviews.py auto-drop!
    rating: 1,
    theme: 'unverified-rumor',
    quote: 'Someone said the app deletes old events randomly (No URL provided - will be dropped by reviews.py).'
  },
  {
    id: 8,
    source: 'g2.com',
    url: 'https://www.g2.com/products/target-app/reviews/review-551',
    rating: 2,
    theme: 'no-dark-mode',
    quote: 'Blinding white screen when embedding the widget on our dark-themed developer docs.'
  }
];

const PIPELINE_SKILLS = [
  {
    id: 'replica-recon',
    step: 1,
    slash: '/replica-recon',
    name: 'Reconnaissance',
    artifact: 'replica/recon.md + features.csv',
    script: null,
    summary: 'Reverse-engineers public screens (S01..S04), UX flows, data models & honest complexity sizing.'
  },
  {
    id: 'replica-architect',
    step: 2,
    slash: '/replica-architect',
    name: 'Architecture',
    artifact: 'replica/architecture.md',
    script: null,
    summary: 'Designs boring, proven stack (Next.js, Postgres RLS, Zod, Stripe Test Mode, Resend).'
  },
  {
    id: 'replica-design',
    step: 3,
    slash: '/replica-design',
    name: 'Clean-Room Design',
    artifact: 'replica/design-system.md',
    script: null,
    summary: 'Preserves UX ergonomics while replacing brand colors, typography, and micro-copy.'
  },
  {
    id: 'replica-build',
    step: 4,
    slash: '/replica-build',
    name: 'Frontend Build',
    artifact: 'src/screens/* + features.csv',
    script: null,
    summary: 'Implements responsive screens (1440x900 & 390x844) with empty, loading, error & populated states.'
  },
  {
    id: 'replica-backend',
    step: 5,
    slash: '/replica-backend',
    name: 'Secure Backend',
    artifact: 'replica/security-checklist.md',
    script: 'RLS Multi-User Check',
    summary: 'Builds DB migrations, Zod validation, rate-limits, webhook verification & .env.example.'
  },
  {
    id: 'replica-test',
    step: 6,
    slash: '/replica-test',
    name: 'E2E & Bug Hunt',
    artifact: 'replica/bugs.md + clone-screens/',
    script: 'Browser Subagent',
    summary: 'Clicks every flow in a headless browser, tests User B isolation, logs S1/S2/S3 defects.'
  },
  {
    id: 'replica-diff',
    step: 7,
    slash: '/replica-diff',
    name: 'Parity & Visual Diff',
    artifact: 'replica/diff-report.md',
    script: 'parity.py + imgdiff.py',
    summary: 'Computes weighted feature parity % and Sobel edge-map structural similarity across 4x4 grid.'
  },
  {
    id: 'replica-entrepreneur',
    step: 8,
    slash: '/replica-entrepreneur',
    name: 'Fix What Users Hate',
    artifact: 'replica/entrepreneur.md',
    script: 'reviews.py',
    summary: 'Validates real 1-3★ reviews with URLs, filters thin themes, and ships product improvements.'
  },
  {
    id: 'replica-brand',
    step: 9,
    slash: '/replica-brand',
    name: 'Original Brand',
    artifact: 'replica/brand.md',
    script: null,
    summary: 'Creates independent brand name, domain check, trademark checklist & custom SVG assets.'
  },
  {
    id: 'replica-launch',
    step: 10,
    slash: '/replica-launch',
    name: 'Store & Web Launch',
    artifact: 'replica/store-listing.json',
    script: 'listing.py',
    summary: 'Generates iOS App Store & Google Play copy, linting character budgets and banned claims.'
  },
  {
    id: 'replica-deploy',
    step: 11,
    slash: '/replica-deploy',
    name: 'Sanitize & Deploy',
    artifact: 'replica/deploy-manifest.md',
    script: 'sweep.py + parity.py',
    summary: 'Blocks deploy if any trace of original app name, domain, or hex color remains in code.'
  }
];

export default function App() {
  const [presetKey, setPresetKey] = useState('calendly');
  const preset = TARGET_PRESETS[presetKey];

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'engines' | 'preview' | 'artifacts' | 'export'
  const [activeEngine, setActiveEngine] = useState('parity'); // 'parity' | 'imgdiff' | 'reviews' | 'listing' | 'sweep'

  // Pipeline Execution State
  const [currentSkillIdx, setCurrentSkillIdx] = useState(6); // Default at /replica-diff so user sees rich state immediately
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    '[system] OpenCode v2 + Google Antigravity Agent Skills initialized.',
    '[system] Loaded 11 skills from .agents/skills/replica-*/SKILL.md',
    '[replica-recon] Captured S01..S04 at 1440x900 & 390x844. Logged 8 features in replica/features.csv.',
    '[replica-architect] Generated Postgres DDL with Row-Level Security + Zod API contracts.',
    '[replica-design] Created clean-room token system (Emerald #10B981 replacing #006BFF).',
    '[replica-build] Built S01..S04 responsive views. Updated replica/features.csv.',
    '[replica-backend] Verified User A / User B RLS isolation (0 unauthorized rows leaked).',
    '[replica-test] Fixed BUG-01 (S1) and BUG-02 (S2). 0 blocking defects remain.',
    '[replica-diff] Ready to run deterministic verification scripts: parity.py & imgdiff.py.'
  ]);

  // 1. State for parity.py
  const [features, setFeatures] = useState(INITIAL_FEATURES);
  const [bugs, setBugs] = useState(INITIAL_BUGS);

  // 2. State for imgdiff.py (Canvas edge-map comparator)
  const [simulateLayoutDrift, setSimulateLayoutDrift] = useState(false);
  const [simulateMissingSidebar, setSimulateMissingSidebar] = useState(false);
  const [showEdgeMap, setShowEdgeMap] = useState(false);
  const origCanvasRef = useRef(null);
  const cloneCanvasRef = useRef(null);
  const [imgDiffResult, setImgDiffResult] = useState(null);

  // 3. State for reviews.py
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [entrepreneurFixesApplied, setEntrepreneurFixesApplied] = useState(true);

  // 4. State for listing.py
  const [storeListing, setStoreListing] = useState({
    iosTitle: 'ChronosFlow: Smart Booking',
    iosSubtitle: 'Multi-Calendar Sync & Meet',
    iosKeywords: 'scheduling,calendar,booking,meetings,timezone,appointments,sync,availability',
    iosDescription: 'Schedule meetings effortlessly without back-and-forth emails. Includes free multi-calendar conflict detection, dual-timezone side-by-side preview, and instant CSV/ICS export.',
    androidTitle: 'ChronosFlow: Meeting Scheduler',
    androidShort: 'Fast scheduling with free multi-calendar conflict checks & dual timezone view.',
    androidFull: 'ChronosFlow eliminates scheduling friction with instant multi-calendar conflict detection, native dark mode, and transparent dual-timezone previews.'
  });

  // 5. State for sweep.py
  const [codeFiles, setCodeFiles] = useState([
    {
      file: 'src/components/BookingWidget.tsx',
      content: `export function BookingWidget({ hostId }: { hostId: string }) {\n  // Clean-room implementation using our new design tokens\n  return <div className="bg-emerald-600 text-white p-4 rounded-xl">Book Session</div>;\n}`
    },
    {
      file: 'src/lib/legacy-helper.ts',
      content: `// TODO: Remove leftover reference before deploy\nexport const LEGACY_EMBED_CLASS = "CalendlyInlineWidget";\nexport const OLD_BRAND_COLOR = "#006BFF";\nexport const DOCS_LINK = "https://calendly.com/help";`
    }
  ]);

  const [copiedId, setCopiedId] = useState(null);

  const copyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // ============================================================================
  // ENGINE 1: DETERMINISTIC PARITY.PY IMPLEMENTATION
  // ============================================================================
  const parityReport = useMemo(() => {
    const WEIGHTS = { must: 3.0, should: 2.0, could: 1.0 };
    const SCORES = { yes: 1.0, partial: 0.5, no: 0.0 };

    let totalWeight = 0;
    let earnedWeight = 0;
    const missingMusts = [];
    const partialMusts = [];
    const backlogGaps = [];
    const counts = { yes: 0, partial: 0, no: 0, skip: 0 };

    features.forEach((row) => {
      if (row.clone === 'skip') {
        counts.skip += 1;
        return;
      }
      const w = WEIGHTS[row.priority] || 1.0;
      const s = SCORES[row.clone] ?? 0.0;
      counts[row.clone] = (counts[row.clone] || 0) + 1;
      totalWeight += w;
      earnedWeight += w * s;

      if (row.priority === 'must') {
        if (row.clone === 'no') missingMusts.push(`${row.id}: ${row.feature}`);
        if (row.clone === 'partial') partialMusts.push(`${row.id}: ${row.feature}`);
      } else if (row.clone === 'no' || row.clone === 'partial') {
        backlogGaps.push(`${row.id} (${row.priority.toUpperCase()} - ${row.clone}): ${row.feature}`);
      }
    });

    const parityPct = totalWeight > 0 ? Number(((earnedWeight / totalWeight) * 100).toFixed(1)) : 0;
    const openS1S2 = bugs.filter((b) => (b.severity === 'S1' || b.severity === 'S2') && b.status === 'open').length;

    const shippable = missingMusts.length === 0 && partialMusts.length === 0 && parityPct >= 80.0 && openS1S2 === 0;
    let verdict = shippable ? 'SHIPPABLE' : 'NOT SHIPPABLE';
    if (shippable && entrepreneurFixesApplied) {
      verdict = 'BETTER THAN THE ORIGINAL';
    }

    return {
      verdict,
      shippable,
      parity_score_pct: parityPct,
      counts,
      open_s1_s2_bugs: openS1S2,
      blocking_must_haves_missing: missingMusts,
      blocking_must_haves_partial: partialMusts,
      backlog_gaps: backlogGaps,
      exit_code: shippable ? 0 : 1
    };
  }, [features, bugs, entrepreneurFixesApplied]);

  // ============================================================================
  // ENGINE 2: DETERMINISTIC IMGDIFF.PY (REAL PIXEL SOBEL EDGE-MAP ON HTML5 CANVAS)
  // ============================================================================
  useEffect(() => {
    const w = 360;
    const h = 240;
    const c1 = origCanvasRef.current;
    const c2 = cloneCanvasRef.current;
    if (!c1 || !c2) return;

    const ctx1 = c1.getContext('2d');
    const ctx2 = c2.getContext('2d');

    const drawMockScreen = (ctx, isClone) => {
      // Background
      ctx.fillStyle = isClone ? '#0F172A' : '#F8FAFC';
      ctx.fillRect(0, 0, w, h);

      // Top Header Bar
      ctx.fillStyle = isClone ? preset.cloneHex : preset.originalHex;
      ctx.fillRect(0, 0, w, 34);

      // Left Sidebar (Host Info & Timezone)
      if (!(isClone && simulateMissingSidebar)) {
        ctx.fillStyle = isClone ? '#1E293B' : '#E2E8F0';
        ctx.fillRect(14, 48, 100, 176);

        // Avatar circle
        ctx.fillStyle = isClone ? preset.cloneHex : preset.originalHex;
        ctx.beginPath();
        ctx.arc(42, 76, 14, 0, Math.PI * 2);
        ctx.fill();

        // Sidebar text bars
        ctx.fillStyle = isClone ? '#94A3B8' : '#475569';
        ctx.fillRect(26, 102, 76, 8);
        ctx.fillRect(26, 118, 60, 8);
        ctx.fillRect(26, 142, 72, 16);
      }

      // Main Calendar Grid Card
      const driftY = isClone && simulateLayoutDrift ? 28 : 0;
      ctx.fillStyle = isClone ? '#1E293B' : '#FFFFFF';
      ctx.fillRect(126, 48 + driftY, 220, 176 - driftY);
      ctx.strokeStyle = isClone ? '#334155' : '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.strokeRect(126, 48 + driftY, 220, 176 - driftY);

      // Calendar Slot Buttons (3 columns x 4 rows)
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 3; c++) {
          const bx = 140 + c * 66;
          const by = 68 + driftY + r * 36;
          if (by + 24 < h - 8) {
            ctx.fillStyle = r === 1 && c === 1 ? (isClone ? preset.cloneHex : preset.originalHex) : isClone ? '#334155' : '#F1F5F9';
            ctx.fillRect(bx, by, 56, 22);
          }
        }
      }
    };

    drawMockScreen(ctx1, false);
    drawMockScreen(ctx2, true);

    // Extract pixel luminance & compute Sobel-like edge map exactly like imgdiff.py
    const img1 = ctx1.getImageData(0, 0, w, h);
    const img2 = ctx2.getImageData(0, 0, w, h);

    const getLuminanceGrid = (imgData) => {
      const lum = Array.from({ length: h }, () => new Float32Array(w));
      const d = imgData.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          lum[y][x] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        }
      }
      return lum;
    };

    const computeEdges = (lum, threshold = 24.0) => {
      const edges = Array.from({ length: h }, () => new Uint8Array(w));
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const gx = Math.abs(lum[y][x + 1] - lum[y][x - 1]);
          const gy = Math.abs(lum[y + 1][x] - lum[y - 1][x]);
          edges[y][x] = gx + gy >= threshold ? 1 : 0;
        }
      }
      return edges;
    };

    const lum1 = getLuminanceGrid(img1);
    const lum2 = getLuminanceGrid(img2);
    const edges1 = computeEdges(lum1);
    const edges2 = computeEdges(lum2);

    // Optional: Render edge map visualization on canvas if toggled
    if (showEdgeMap) {
      const renderEdgeOverlay = (ctx, edges, tint) => {
        const out = ctx.createImageData(w, h);
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const isEdge = edges[y][x] === 1;
            out.data[idx] = isEdge ? tint[0] : 9;
            out.data[idx + 1] = isEdge ? tint[1] : 13;
            out.data[idx + 2] = isEdge ? tint[2] : 22;
            out.data[idx + 3] = 255;
          }
        }
        ctx.putImageData(out, 0, 0);
      };
      renderEdgeOverlay(ctx1, edges1, [56, 189, 248]);
      renderEdgeOverlay(ctx2, edges2, [16, 185, 129]);
    }

    // 4x4 Grid Structural Comparison
    const gridCols = 4;
    const gridRows = 4;
    const cellW = Math.floor(w / gridCols);
    const cellH = Math.floor(h / gridRows);
    const differingRegions = [];
    const regionScores = [];

    for (let gy = 0; gy < gridRows; gy++) {
      for (let gx = 0; gx < gridCols; gx++) {
        const x0 = gx * cellW;
        const y0 = gy * cellH;
        const x1 = x0 + cellW;
        const y1 = y0 + cellH;
        let e1Count = 0;
        let e2Count = 0;
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            e1Count += edges1[y][x];
            e2Count += edges2[y][x];
          }
        }
        const denom = Math.max(e1Count, e2Count, 1);
        const sim = 1.0 - Math.abs(e1Count - e2Count) / denom;
        regionScores.push(sim);

        if (sim < 0.7) {
          differingRegions.push({
            region: `R${gy + 1}C${gx + 1}`,
            bounds_px: `(${x0},${y0})-(${x1},${y1})`,
            structural_similarity: Number((sim * 100).toFixed(1))
          });
          // Highlight differing cell on clone canvas
          ctx2.strokeStyle = '#EF4444';
          ctx2.lineWidth = 2;
          ctx2.strokeRect(x0 + 1, y0 + 1, cellW - 2, cellH - 2);
        }
      }
    }

    const overall = Number(((regionScores.reduce((a, b) => a + b, 0) / regionScores.length) * 100).toFixed(1));
    setImgDiffResult({
      original: 'replica/screens/S01.png',
      clone: 'replica/clone-screens/S01.png',
      compared_viewport: `${w}x${h}`,
      structural_similarity_pct: overall,
      differing_regions: differingRegions
    });
  }, [preset, simulateLayoutDrift, simulateMissingSidebar, showEdgeMap, activeTab, activeEngine]);

  // ============================================================================
  // ENGINE 3: DETERMINISTIC REVIEWS.PY IMPLEMENTATION
  // ============================================================================
  const reviewsReport = useMemo(() => {
    let droppedNoUrl = 0;
    let validReviews = 0;
    const themesMap = {};

    reviews.forEach((r) => {
      const url = (r.url || '').trim();
      const quote = (r.quote || '').trim();
      const isValidUrl = url.startsWith('http://') || url.startsWith('https://');
      if (!isValidUrl || !quote) {
        droppedNoUrl += 1;
        return;
      }
      validReviews += 1;
      const t = (r.theme || 'uncategorized').trim().toLowerCase();
      if (!themesMap[t]) {
        themesMap[t] = { quotes: [], sources: new Set() };
      }
      themesMap[t].quotes.push({ quote, url, rating: r.rating });
      themesMap[t].sources.add(r.source || 'web');
    });

    const summary = {};
    Object.entries(themesMap).forEach(([theme, data]) => {
      const count = data.quotes.length;
      const srcCount = data.sources.size;
      const isThin = count < 3 || srcCount < 2;
      summary[theme] = {
        status: isThin ? 'THIN_EVIDENCE' : 'VERIFIED_OPPORTUNITY',
        review_count: count,
        unique_sources: Array.from(data.sources),
        evidence: data.quotes
      };
    });

    return {
      total_valid_reviews: validReviews,
      dropped_unlinked_reviews: droppedNoUrl,
      themes: summary
    };
  }, [reviews]);

  // ============================================================================
  // ENGINE 4: DETERMINISTIC LISTING.PY IMPLEMENTATION
  // ============================================================================
  const listingReport = useMemo(() => {
    const errors = [];
    const warnings = [];
    const BANNED = [
      { label: '#1', regex: /#1/i },
      { label: 'best', regex: /\bbest\b/i },
      { label: 'top', regex: /\btop\b/i },
      { label: 'free', regex: /\bfree\b/i }
    ];

    if (storeListing.iosTitle.length > 30) {
      errors.push(`iOS title exceeds 30 chars (${storeListing.iosTitle.length}/30).`);
    }
    if (storeListing.iosSubtitle.length > 30) {
      errors.push(`iOS subtitle exceeds 30 chars (${storeListing.iosSubtitle.length}/30).`);
    }
    if (storeListing.iosKeywords.length > 100) {
      errors.push(`iOS keywords exceed 100 chars (${storeListing.iosKeywords.length}/100).`);
    }
    if (storeListing.iosKeywords.includes(', ')) {
      warnings.push('iOS keywords contain spaces after commas; remove spaces to save character budget.');
    }
    const kwList = storeListing.iosKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    if (kwList.length !== new Set(kwList).size) {
      warnings.push('iOS keywords contain duplicate terms.');
    }

    if (storeListing.androidTitle.length > 30) {
      errors.push(`Google Play title exceeds 30 chars (${storeListing.androidTitle.length}/30).`);
    }
    if (storeListing.androidShort.length > 80) {
      errors.push(`Google Play short description exceeds 80 chars (${storeListing.androidShort.length}/80).`);
    }

    [
      ['iOS Title', storeListing.iosTitle],
      ['iOS Subtitle', storeListing.iosSubtitle],
      ['Android Title', storeListing.androidTitle]
    ].forEach(([field, val]) => {
      BANNED.forEach((b) => {
        if (b.regex.test(val)) {
          errors.push(`${field} contains banned store ranking/price claim matching '${b.label}'.`);
        }
      });
    });

    const blob = JSON.stringify(storeListing).toLowerCase();
    [preset.originalName, preset.originalDomain].forEach((term) => {
      if (term && blob.includes(term.toLowerCase())) {
        errors.push(`Store listing leaks forbidden competitor term: '${term}'.`);
      }
    });

    return {
      passed: errors.length === 0,
      exit_code: errors.length === 0 ? 0 : 1,
      errors,
      warnings
    };
  }, [storeListing, preset]);

  // ============================================================================
  // ENGINE 5: DETERMINISTIC SWEEP.PY IMPLEMENTATION
  // ============================================================================
  const sweepReport = useMemo(() => {
    const terms = [preset.originalName, preset.originalDomain, preset.originalHex];
    const violations = [];

    codeFiles.forEach((fileObj) => {
      const lines = fileObj.content.split('\n');
      lines.forEach((line, idx) => {
        const low = line.toLowerCase();
        terms.forEach((term) => {
          if (term && low.includes(term.toLowerCase())) {
            violations.push({
              file: fileObj.file,
              line: idx + 1,
              matched_term: term,
              snippet: line.trim()
            });
          }
        });
      });
    });

    const clean = violations.length === 0;
    return {
      status: clean ? 'CLEAN_READY_TO_DEPLOY' : 'BLOCKED_DIRTY_SWEEP',
      exit_code: clean ? 0 : 1,
      forbidden_terms_checked: terms,
      violation_count: violations.length,
      violations
    };
  }, [codeFiles, preset]);

  // Auto-sanitize helper for sweep.py demo
  const sanitizeCodebase = () => {
    setCodeFiles((prev) =>
      prev.map((f) => ({
        ...f,
        content: f.content
          .replace(new RegExp(preset.originalName, 'gi'), preset.cloneName)
          .replace(new RegExp(preset.originalDomain, 'gi'), preset.cloneDomain)
          .replace(new RegExp(preset.originalHex, 'gi'), preset.cloneHex)
      }))
    );
    setTerminalLogs((prev) => [
      ...prev,
      `[replica-deploy] Refactored all ${preset.originalName} identifiers and hex tokens to ${preset.cloneName}.`,
      `[sweep.py] 0 violations found. Exit code 0 (CLEAN_READY_TO_DEPLOY).`
    ]);
  };

  // Run next pipeline step or full auto-run
  const triggerSkillStep = (idx) => {
    setCurrentSkillIdx(idx);
    const skill = PIPELINE_SKILLS[idx];
    setTerminalLogs((prev) => [
      ...prev.slice(-14),
      `$ opencode run ${skill.slash} --target "${preset.originalName}"`,
      `[${skill.id}] Updated ${skill.artifact} ${skill.script ? `| Verified via ${skill.script}` : ''}`
    ]);
  };

  useEffect(() => {
    if (!isAutoRunning) return;
    const timer = setTimeout(() => {
      if (currentSkillIdx < PIPELINE_SKILLS.length - 1) {
        triggerSkillStep(currentSkillIdx + 1);
      } else {
        setIsAutoRunning(false);
      }
    }, 950);
    return () => clearTimeout(timer);
  }, [isAutoRunning, currentSkillIdx]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* TOP BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">replica-skill Workbench</h1>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  OpenCode + Antigravity
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  MIT License
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Reverse-engineer any app → Rebuild clean-room → Test E2E → Fix what users hate → Ship clean
              </p>
            </div>
          </div>

          {/* Target App Selector & Verdict Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="px-2 text-slate-400">Target Preset:</span>
              {Object.values(TARGET_PRESETS).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPresetKey(p.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    presetKey === p.id
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.originalName} → {p.cloneName}
                </button>
              ))}
            </div>

            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 ${
                parityReport.shippable && sweepReport.exit_code === 0
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              {parityReport.shippable && sweepReport.exit_code === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span>{parityReport.verdict}</span>
              <span className="text-slate-400">({parityReport.parity_score_pct}%)</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto border-t border-slate-800/60 bg-slate-900/40">
          {[
            { id: 'pipeline', label: '1. 11-Skill Pipeline Runner', icon: Layers },
            { id: 'engines', label: '2. Deterministic Python Engines (5)', icon: Sliders },
            { id: 'preview', label: '3. Live Clone vs. Original UI', icon: Eye },
            { id: 'artifacts', label: '4. replica/ State Explorer', icon: FolderOpen },
            { id: 'export', label: '5. Export SKILL.md & Repo', icon: Download }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                  active
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* ====================================================================
            TAB 1: 11-SKILL PIPELINE SIMULATOR
        ==================================================================== */}
        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: 11 Skills Timeline */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Slash Command State Machine
                    </h2>
                    <p className="text-xs text-slate-400">
                      Click any skill to inspect its execution or auto-run all 11 stages.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isAutoRunning && currentSkillIdx === PIPELINE_SKILLS.length - 1) {
                        setCurrentSkillIdx(0);
                      }
                      setIsAutoRunning(!isAutoRunning);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      isAutoRunning
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {isAutoRunning ? 'Pause Auto-Run' : 'Simulate Full Pipeline'}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                  {PIPELINE_SKILLS.map((skill, idx) => {
                    const isCompleted = idx < currentSkillIdx;
                    const isCurrent = idx === currentSkillIdx;
                    return (
                      <button
                        key={skill.id}
                        onClick={() => triggerSkillStep(idx)}
                        className={`w-full text-left p-2.5 rounded-lg border transition flex items-start gap-3 ${
                          isCurrent
                            ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                            : isCompleted
                            ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                            : 'bg-slate-950/20 border-slate-800/40 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 mt-0.5 ${
                            isCurrent
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isCompleted ? '✓' : skill.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-semibold text-emerald-300">
                              {skill.slash}
                            </span>
                            {skill.script && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                {skill.script}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 font-medium mt-0.5">{skill.name}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{skill.summary}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Active Skill Inspector + OpenCode TUI + Antigravity Artifacts */}
            <div className="lg:col-span-7 space-y-4">
              {/* Active Skill Detail Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        Stage {PIPELINE_SKILLS[currentSkillIdx].step} of 11
                      </span>
                      <h3 className="text-lg font-bold text-white font-mono">
                        {PIPELINE_SKILLS[currentSkillIdx].slash}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {PIPELINE_SKILLS[currentSkillIdx].summary}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Writes Artifact:</span>
                    <code className="text-xs text-amber-300 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                      {PIPELINE_SKILLS[currentSkillIdx].artifact}
                    </code>
                  </div>
                </div>

                {/* Live Gate Telemetry Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">parity.py Score</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {parityReport.parity_score_pct}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {parityReport.counts.yes} yes / {parityReport.counts.partial} partial / {parityReport.counts.skip} skip
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">imgdiff.py Layout</span>
                    <span className="text-lg font-bold font-mono text-sky-400">
                      {imgDiffResult ? `${imgDiffResult.structural_similarity_pct}%` : '100%'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Sobel Edge-Map (Color-Agnostic)
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">reviews.py Themes</span>
                    <span className="text-lg font-bold font-mono text-purple-400">
                      {
                        Object.values(reviewsReport.themes).filter(
                          (t) => t.status === 'VERIFIED_OPPORTUNITY'
                        ).length
                      }{' '}
                      Verified
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {reviewsReport.dropped_unlinked_reviews} unlinked dropped
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <span className="text-[11px] text-slate-400 block">sweep.py Gate</span>
                    <span
                      className={`text-lg font-bold font-mono ${
                        sweepReport.exit_code === 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {sweepReport.exit_code === 0 ? 'CLEAN (0)' : `${sweepReport.violation_count} LEAKS`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Exit code: {sweepReport.exit_code}
                    </span>
                  </div>
                </div>

                {/* Quick Jump to Deterministic Engine */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-300">
                    Want to break or test the deterministic Python verifiers with custom inputs?
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'parity', label: 'parity.py' },
                      { id: 'imgdiff', label: 'imgdiff.py' },
                      { id: 'reviews', label: 'reviews.py' },
                      { id: 'listing', label: 'listing.py' },
                      { id: 'sweep', label: 'sweep.py' }
                    ].map((eng) => (
                      <button
                        key={eng.id}
                        onClick={() => {
                          setActiveEngine(eng.id);
                          setActiveTab('engines');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-mono transition"
                      >
                        Test {eng.label} →
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* OpenCode TUI / Antigravity Terminal Console */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono text-slate-300">
                      OpenCode TUI & Google Antigravity Subagent Log
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    workspace: ./{preset.cloneName.toLowerCase()}
                  </span>
                </div>
                <div className="p-4 font-mono text-xs space-y-1.5 bg-slate-950/80 h-60 overflow-y-auto">
                  {terminalLogs.map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.startsWith('$')
                          ? 'text-emerald-400 font-semibold'
                          : line.includes('BLOCKED') || line.includes('ERROR')
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 2: DETERMINISTIC PYTHON ENGINES LAB (ALL 5 SCRIPTS LIVE)
        ==================================================================== */}
        {activeTab === 'engines' && (
          <div className="space-y-4">
            {/* Engine Selector Pills */}
            <div className="flex flex-wrap gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
              {[
                { id: 'parity', name: 'parity.py', desc: 'Feature Parity & Bug Gate', icon: CheckCircle2 },
                { id: 'imgdiff', name: 'imgdiff.py', desc: 'PNG Sobel Edge-Map Diff', icon: GitCompare },
                { id: 'reviews', name: 'reviews.py', desc: 'Zero-Hallucination Review Validator', icon: Search },
                { id: 'listing', name: 'listing.py', desc: 'App Store & Play Store Linter', icon: Store },
                { id: 'sweep', name: 'sweep.py', desc: 'Clean-Room Brand/Hex Sanitizer', icon: ShieldCheck }
              ].map((eng) => {
                const Icon = eng.icon;
                const active = activeEngine === eng.id;
                return (
                  <button
                    key={eng.id}
                    onClick={() => setActiveEngine(eng.id)}
                    className={`flex-1 min-w-[180px] p-2.5 rounded-lg border text-left transition flex items-center gap-2.5 ${
                      active
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-mono font-bold">{eng.name}</div>
                      <div className="text-[10px] text-slate-400">{eng.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 2.1 PARITY.PY INTERACTIVE SANDBOX */}
            {activeEngine === 'parity' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono">
                        Interactive Input: replica/features.csv & replica/bugs.md
                      </h3>
                      <p className="text-xs text-slate-400">
                        Change any <code className="text-emerald-300">must</code> feature to{' '}
                        <code className="text-rose-300">partial</code> or <code className="text-rose-300">no</code>, or
                        re-open an S1/S2 bug to see <code className="text-amber-300">parity.py</code> block release.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                          <th className="py-2 px-2">ID</th>
                          <th className="py-2 px-2">Feature</th>
                          <th className="py-2 px-2">Priority (Weight)</th>
                          <th className="py-2 px-2">Clone Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {features.map((f, i) => (
                          <tr key={f.id} className="hover:bg-slate-800/30">
                            <td className="py-2 px-2 font-mono text-slate-300">{f.id}</td>
                            <td className="py-2 px-2 text-slate-200">{f.feature}</td>
                            <td className="py-2 px-2">
                              <select
                                value={f.priority}
                                onChange={(e) => {
                                  const next = [...features];
                                  next[i] = { ...f, priority: e.target.value };
                                  setFeatures(next);
                                }}
                                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-xs"
                              >
                                <option value="must">must (3.0x)</option>
                                <option value="should">should (2.0x)</option>
                                <option value="could">could (1.0x)</option>
                              </select>
                            </td>
                            <td className="py-2 px-2">
                              <select
                                value={f.clone}
                                onChange={(e) => {
                                  const next = [...features];
                                  next[i] = { ...f, clone: e.target.value };
                                  setFeatures(next);
                                }}
                                className={`bg-slate-950 border rounded px-2 py-1 font-mono text-xs font-semibold ${
                                  f.clone === 'yes'
                                    ? 'border-emerald-500/50 text-emerald-400'
                                    : f.clone === 'partial'
                                    ? 'border-amber-500/50 text-amber-400'
                                    : f.clone === 'skip'
                                    ? 'border-slate-700 text-slate-400'
                                    : 'border-rose-500/50 text-rose-400'
                                }`}
                              >
                                <option value="yes">yes (100%)</option>
                                <option value="partial">partial (50%)</option>
                                <option value="no">no (0%)</option>
                                <option value="skip">skip (excluded)</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bugs Table */}
                  <div className="pt-3 border-t border-slate-800">
                    <h4 className="text-xs font-mono font-semibold text-slate-300 mb-2">
                      Active Bugs in replica/bugs.md (S1 & S2 Open Bugs Block Shippability)
                    </h4>
                    <div className="space-y-1.5">
                      {bugs.map((b, idx) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono px-1.5 py-0.5 rounded font-bold ${
                                b.severity === 'S1'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : b.severity === 'S2'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {b.severity}
                            </span>
                            <span className="text-slate-300">{b.description}</span>
                          </div>
                          <button
                            onClick={() => {
                              const next = [...bugs];
                              next[idx] = { ...b, status: b.status === 'open' ? 'fixed' : 'open' };
                              setBugs(next);
                            }}
                            className={`px-2.5 py-1 rounded font-mono text-xs font-semibold ${
                              b.status === 'fixed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {b.status.toUpperCase()}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Output JSON */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400">
                      $ python3 parity.py replica/features.csv --bugs replica/bugs.md
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        parityReport.exit_code === 0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      exit code: {parityReport.exit_code}
                    </span>
                  </div>
                  <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 overflow-x-auto">
                    {JSON.stringify(parityReport, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* 2.2 IMGDIFF.PY INTERACTIVE EDGE-MAP SANDBOX */}
            {activeEngine === 'imgdiff' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono">
                        imgdiff.py — Color-Agnostic Sobel Edge-Map Comparator
                      </h3>
                      <p className="text-xs text-slate-400">
                        Notice how changing the brand palette from <code className="text-sky-400">{preset.originalHex}</code> to{' '}
                        <code className="text-emerald-400">{preset.cloneHex}</code> keeps structural similarity near 100%, while layout drift triggers red region flags!
                      </p>
                    </div>
                  </div>

                  {/* Interactive Controls */}
                  <div className="flex flex-wrap gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setShowEdgeMap(!showEdgeMap)}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-semibold border transition ${
                        showEdgeMap
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      {showEdgeMap ? 'Viewing: Luminance Edge Maps' : 'Toggle Sobel Edge-Map View'}
                    </button>

                    <button
                      onClick={() => setSimulateLayoutDrift(!simulateLayoutDrift)}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-semibold border transition ${
                        simulateLayoutDrift
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      {simulateLayoutDrift ? '✗ Calendar Grid Drifted (+28px)' : 'Simulate Calendar Grid Drift'}
                    </button>

                    <button
                      onClick={() => setSimulateMissingSidebar(!simulateMissingSidebar)}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-semibold border transition ${
                        simulateMissingSidebar
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      {simulateMissingSidebar ? '✗ Left Sidebar Missing' : 'Simulate Missing Sidebar'}
                    </button>
                  </div>

                  {/* Dual Canvas Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center">
                      <div className="text-xs font-mono text-slate-400 mb-2">
                        replica/screens/S01.png ({preset.originalName})
                      </div>
                      <canvas
                        ref={origCanvasRef}
                        width={360}
                        height={240}
                        className="w-full rounded border border-slate-800 mx-auto"
                      />
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center">
                      <div className="text-xs font-mono text-emerald-400 mb-2">
                        replica/clone-screens/S01.png ({preset.cloneName})
                      </div>
                      <canvas
                        ref={cloneCanvasRef}
                        width={360}
                        height={240}
                        className="w-full rounded border border-slate-800 mx-auto"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400">
                      $ python3 imgdiff.py screens/S01.png clone-screens/S01.png --json
                    </span>
                  </div>
                  <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-sky-300 overflow-x-auto">
                    {JSON.stringify(imgDiffResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* 2.3 REVIEWS.PY INTERACTIVE SANDBOX */}
            {activeEngine === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-white font-mono">
                    reviews.py — Zero-Hallucination User Complaint Validator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Rows without a valid <code className="text-emerald-300">https://</code> URL are automatically dropped.
                    Themes with fewer than 3 reviews or fewer than 2 unique sources are flagged as{' '}
                    <code className="text-amber-300">THIN_EVIDENCE</code>.
                  </p>

                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {reviews.map((r, idx) => (
                      <div
                        key={r.id}
                        className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                          !r.url
                            ? 'bg-rose-950/20 border-rose-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-semibold text-purple-300">
                            Theme: {r.theme} ({r.rating}★ on {r.source})
                          </span>
                          <button
                            onClick={() => {
                              const next = [...reviews];
                              next[idx] = {
                                ...r,
                                url: r.url ? '' : `https://${r.source}/review/${r.id}`
                              };
                              setReviews(next);
                            }}
                            className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                              r.url
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {r.url ? '✓ Valid URL (Click to Break)' : '✗ Missing URL (Dropped)'}
                          </button>
                        </div>
                        <p className="text-slate-300 italic">"{r.quote}"</p>
                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          URL: {r.url || '<EMPTY — DROPPED BY REVIEWS.PY>'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                  <div className="text-xs font-mono text-slate-400 mb-2">
                    $ python3 reviews.py replica/reviews.csv
                  </div>
                  <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-purple-300 overflow-x-auto max-h-[460px]">
                    {JSON.stringify(reviewsReport, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* 2.4 LISTING.PY INTERACTIVE SANDBOX */}
            {activeEngine === 'listing' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono">
                        listing.py — App Store & Google Play Metadata Linter
                      </h3>
                      <p className="text-xs text-slate-400">
                        Try typing <code className="text-rose-300">#1</code>, <code className="text-rose-300">Best</code>,{' '}
                        <code className="text-rose-300">{preset.originalName}</code>, or exceeding 30 characters in the title.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setStoreListing((s) => ({
                          ...s,
                          iosTitle: `#1 Best ${preset.originalName} Alternative Ever Made`
                        }))
                      }
                      className="px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono"
                    >
                      Inject Store Violations
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-mono mb-1">
                        iOS Title ({storeListing.iosTitle.length}/30 chars)
                      </label>
                      <input
                        type="text"
                        value={storeListing.iosTitle}
                        onChange={(e) => setStoreListing({ ...storeListing, iosTitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-mono mb-1">
                        iOS Subtitle ({storeListing.iosSubtitle.length}/30 chars)
                      </label>
                      <input
                        type="text"
                        value={storeListing.iosSubtitle}
                        onChange={(e) => setStoreListing({ ...storeListing, iosSubtitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-mono mb-1">
                        iOS Keywords ({storeListing.iosKeywords.length}/100 chars — comma-separated, no spaces)
                      </label>
                      <input
                        type="text"
                        value={storeListing.iosKeywords}
                        onChange={(e) => setStoreListing({ ...storeListing, iosKeywords: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-mono mb-1">
                        Google Play Short Description ({storeListing.androidShort.length}/80 chars)
                      </label>
                      <input
                        type="text"
                        value={storeListing.androidShort}
                        onChange={(e) => setStoreListing({ ...storeListing, androidShort: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400">
                      $ python3 listing.py store-listing.json --forbid "{preset.originalName}"
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        listingReport.passed
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      exit code: {listingReport.exit_code}
                    </span>
                  </div>
                  <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-amber-300 overflow-x-auto">
                    {JSON.stringify(listingReport, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* 2.5 SWEEP.PY INTERACTIVE SANDBOX */}
            {activeEngine === 'sweep' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono">
                        sweep.py — Pre-Deploy Trademark, Domain & Hex Color Sanitizer
                      </h3>
                      <p className="text-xs text-slate-400">
                        Scans every source file for <code className="text-rose-300">{preset.originalName}</code>,{' '}
                        <code className="text-rose-300">{preset.originalDomain}</code>, and{' '}
                        <code className="text-rose-300">{preset.originalHex}</code> (even inside camelCase identifiers).
                      </p>
                    </div>
                    <button
                      onClick={sanitizeCodebase}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold shadow"
                    >
                      Auto-Sanitize All Files
                    </button>
                  </div>

                  {codeFiles.map((fileObj, idx) => (
                    <div key={fileObj.file} className="space-y-1">
                      <div className="text-xs font-mono text-slate-300">{fileObj.file}</div>
                      <textarea
                        rows={4}
                        value={fileObj.content}
                        onChange={(e) => {
                          const next = [...codeFiles];
                          next[idx] = { ...fileObj, content: e.target.value };
                          setCodeFiles(next);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200"
                      />
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400">
                      $ python3 sweep.py --root . --forbid "{preset.originalName},{preset.originalDomain},{preset.originalHex}"
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        sweepReport.exit_code === 0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      exit code: {sweepReport.exit_code}
                    </span>
                  </div>
                  <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-rose-300 overflow-x-auto">
                    {JSON.stringify(sweepReport, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB 3: LIVE CLONE VS ORIGINAL PREVIEW (WITH ENTREPRENEUR FIXES)
        ==================================================================== */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  Clean-Room Clone Comparison: {preset.originalName} (Target) vs. {preset.cloneName} (Your Rebuilt App)
                </h2>
                <p className="text-xs text-slate-400">
                  Same ergonomic booking flow, 100% distinct brand identity, plus built-in fixes for top 1-star user complaints.
                </p>
              </div>
              <button
                onClick={() => setEntrepreneurFixesApplied(!entrepreneurFixesApplied)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition ${
                  entrepreneurFixesApplied
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {entrepreneurFixesApplied
                  ? '✓ /replica-entrepreneur Fixes Active'
                  : 'Enable /replica-entrepreneur Fixes'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Target Incumbent Mockup */}
              <div className="bg-white text-slate-900 rounded-xl border border-slate-300 overflow-hidden shadow-xl">
                <div
                  className="px-4 py-3 text-white flex items-center justify-between"
                  style={{ backgroundColor: preset.originalHex }}
                >
                  <span className="font-bold text-sm">{preset.originalName} (Original Incumbent)</span>
                  <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded">
                    Blinding Light Only • Paywalled Sync
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-bold text-sm">30 Minute Product Discovery</h4>
                      <p className="text-xs text-slate-500">Hosted by Alex Rivera</p>
                    </div>
                    <span className="text-[11px] px-2 py-1 rounded bg-amber-100 text-amber-800 font-medium">
                      🔒 Upgrade ($15/seat) to check 2+ calendars
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:15 PM'].map((slot) => (
                      <div
                        key={slot}
                        className="border border-slate-300 rounded-lg py-2 text-center text-xs font-semibold hover:border-blue-600 cursor-pointer"
                      >
                        {slot}
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    Timezone: UTC-5 (Hidden tiny dropdown — #2 user complaint in reviews.csv)
                  </div>
                </div>
              </div>

              {/* Rebuilt Clean-Room Clone with Entrepreneur Fixes */}
              <div className="bg-slate-900 text-slate-100 rounded-xl border-2 border-emerald-500/50 overflow-hidden shadow-xl">
                <div
                  className="px-4 py-3 text-white flex items-center justify-between"
                  style={{ backgroundColor: preset.cloneHex }}
                >
                  <span className="font-bold text-sm">{preset.cloneName} (Clean-Room + User Fixes)</span>
                  <span className="text-[11px] bg-black/30 px-2 py-0.5 rounded font-mono">
                    0 Brand Leaks • RLS Verified
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-white">30-Min Architecture Sync</h4>
                      <p className="text-xs text-slate-400">Alex Rivera • Instant ICS/CSV Export</p>
                    </div>
                    {entrepreneurFixesApplied && (
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                        ✓ 3 Calendars Synced Free (Fix #1)
                      </span>
                    )}
                  </div>

                  {/* Entrepreneur Fix #2: Dual Timezone Banner */}
                  {entrepreneurFixesApplied && (
                    <div className="bg-slate-950 border border-emerald-500/30 rounded-lg p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Your Local Time: </span>
                        <strong className="text-emerald-300 font-mono">Guayaquil (UTC-5)</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Host Time: </span>
                        <strong className="text-sky-300 font-mono">San Francisco (UTC-7)</strong>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { my: '09:00 AM', host: '07:00 AM' },
                      { my: '10:30 AM', host: '08:30 AM' },
                      { my: '01:00 PM', host: '11:00 AM' },
                      { my: '02:30 PM', host: '12:30 PM' },
                      { my: '04:00 PM', host: '02:00 PM' },
                      { my: '05:15 PM', host: '03:15 PM' }
                    ].map((slot) => (
                      <button
                        key={slot.my}
                        className="bg-slate-950 hover:bg-emerald-600/20 border border-slate-700 hover:border-emerald-400 rounded-lg py-2 px-2 text-center transition"
                      >
                        <div className="text-xs font-bold text-white">{slot.my}</div>
                        {entrepreneurFixesApplied && (
                          <div className="text-[10px] text-slate-400 font-mono">{slot.host} Host</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 4: REPLICA/ ARTIFACTS EXPLORER
        ==================================================================== */}
        {activeTab === 'artifacts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-mono font-bold text-emerald-400 mb-2">replica/recon.md</h3>
              <pre className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto">
{`# Clean-Room Reconnaissance: ${preset.originalName}
- Target Domain: ${preset.originalDomain}
- Forbidden Brand Hex: ${preset.originalHex}, ${preset.originalSecondaryHex}
- Category: ${preset.category}
- Honest Sizing: ${preset.sizing}

## Screen Inventory
- S01: Public Booking Page (1440x900 & 390x844)
- S02: Attendee Confirmation & Timezone Lock
- S03: Host Availability & Multi-Calendar Sync
- S04: Stripe Test-Mode Consultation Checkout`}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-mono font-bold text-emerald-400 mb-2">replica/security-checklist.md</h3>
              <pre className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto">
{`# Mandatory Pre-Deploy Security Checklist (/replica-backend)
- [x] Zod server-side input validation on every POST/PUT route
- [x] Postgres Row-Level Security (RLS) verified with User B account (0 rows leaked)
- [x] Rate limiting enabled on /api/auth/* and /api/book/*
- [x] Stripe webhook signature verified via stripe.webhooks.constructEvent
- [x] All timestamps stored in UTC; rendered in user local timezone
- [x] Zero live credentials in repo; .env.example checked in`}
              </pre>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 5: EXPORT REPO & BOOTSTRAP GENERATOR
        ==================================================================== */}
        {activeTab === 'export' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white">
                  Install in Your Local OpenCode & Google Antigravity Environment
                </h2>
                <p className="text-xs text-slate-400">
                  Run these commands in your terminal after saving the files from the specification above.
                </p>
              </div>
              <button
                onClick={() =>
                  copyText(
                    'install-cmd',
                    'chmod +x install.sh && ./install.sh --global && ./install.sh --local .'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono flex items-center gap-1.5"
              >
                {copiedId === 'install-cmd' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedId === 'install-cmd' ? 'Copied Command!' : 'Copy Install Command'}
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
{`# 1. Install globally for both OpenCode (~/.config/opencode/skills) and Antigravity (~/.gemini/config/skills)
chmod +x install.sh
./install.sh --global

# 2. Or install directly into your current project workspace (.agents/skills/ & .opencode/skills/)
./install.sh --local .

# 3. Run the deterministic verification suite at any time:
python3 .agents/skills/replica-diff/scripts/parity.py replica/features.csv --bugs replica/bugs.md
python3 .agents/skills/replica-diff/scripts/imgdiff.py replica/screens/S01.png replica/clone-screens/S01.png --json
python3 .agents/skills/replica-entrepreneur/scripts/reviews.py replica/reviews.csv
python3 .agents/skills/replica-launch/scripts/listing.py replica/store-listing.json --forbid "${preset.originalName}"
python3 .agents/skills/replica-deploy/scripts/sweep.py --root . --forbid "${preset.originalName},${preset.originalDomain},${preset.originalHex}"`}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}