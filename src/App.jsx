import { useState, useEffect } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --earth: #1C1208;
    --soil: #2D1F0A;
    --bark: #5C3D1E;
    --moss: #3D5C2E;
    --sage: #7A9E6A;
    --sun: #E8B84B;
    --gold: #C49A28;
    --cream: #F5EDD8;
    --sand: #EAD9B8;
    --sky: #6B9BB8;
    --mist: #C8DDE8;
    --white: #FDFAF4;
    --red: #C44B2B;
    --r: 'Instrument Serif', Georgia, serif;
    --s: 'DM Sans', system-ui, sans-serif;
  }

  body {
    font-family: var(--s);
    background: var(--earth);
    color: var(--cream);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* Layout */
  .app { display: flex; flex-direction: column; min-height: 100vh; }

  /* Nav */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: var(--earth);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px;
  }
  .nav-brand {
    font-family: var(--r);
    font-size: 1.5rem;
    color: var(--sun);
    letter-spacing: -0.02em;
    cursor: pointer;
  }
  .nav-brand span { color: var(--sage); font-style: italic; }
  .nav-links { display: flex; gap: 0.25rem; align-items: center; }
  .nav-btn {
    background: none; border: none; cursor: pointer;
    font-family: var(--s); font-size: 0.85rem; font-weight: 500;
    color: var(--sand); padding: 0.5rem 1rem; border-radius: 6px;
    transition: all 0.15s;
  }
  .nav-btn:hover, .nav-btn.active { background: rgba(255,255,255,0.08); color: var(--white); }
  .nav-cta {
    background: var(--sun); color: var(--earth);
    border: none; cursor: pointer; font-family: var(--s);
    font-size: 0.85rem; font-weight: 600;
    padding: 0.5rem 1.25rem; border-radius: 6px;
    transition: all 0.15s; margin-left: 0.5rem;
  }
  .nav-cta:hover { background: var(--gold); transform: translateY(-1px); }

  /* Hero */
  .hero {
    padding: 5rem 2rem 4rem;
    max-width: 1100px; margin: 0 auto; width: 100%;
    display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
  }
  .hero-eyebrow {
    font-family: var(--s); font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--sage); margin-bottom: 1.25rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .hero-eyebrow::before { content: ''; display: block; width: 24px; height: 1px; background: var(--sage); }
  .hero-title {
    font-family: var(--r);
    font-size: clamp(2.5rem, 5vw, 3.75rem);
    line-height: 1.1; letter-spacing: -0.02em;
    color: var(--white); margin-bottom: 1.5rem;
  }
  .hero-title em { color: var(--sun); font-style: italic; }
  .hero-sub {
    font-size: 1.05rem; line-height: 1.7; color: var(--sand);
    margin-bottom: 2.5rem; font-weight: 300;
  }
  .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
  .btn-primary {
    background: var(--sun); color: var(--earth);
    border: none; cursor: pointer; font-family: var(--s);
    font-size: 0.95rem; font-weight: 600;
    padding: 0.875rem 2rem; border-radius: 8px;
    transition: all 0.2s;
  }
  .btn-primary:hover { background: var(--gold); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,184,75,0.3); }
  .btn-secondary {
    background: transparent; color: var(--cream);
    border: 1px solid rgba(255,255,255,0.2); cursor: pointer; font-family: var(--s);
    font-size: 0.95rem; font-weight: 500;
    padding: 0.875rem 2rem; border-radius: 8px;
    transition: all 0.2s;
  }
  .btn-secondary:hover { border-color: var(--sun); color: var(--sun); }

  /* Stats bar */
  .stats-bar {
    background: var(--soil);
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 1.5rem 2rem;
  }
  .stats-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; gap: 3rem; flex-wrap: wrap;
  }
  .stat { display: flex; flex-direction: column; gap: 0.25rem; }
  .stat-num {
    font-family: var(--r); font-size: 1.75rem;
    color: var(--sun); letter-spacing: -0.02em;
  }
  .stat-label { font-size: 0.75rem; color: var(--sage); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }

  /* Main content */
  .main { flex: 1; max-width: 1100px; margin: 0 auto; width: 100%; padding: 3rem 2rem; }

  /* Section header */
  .section-header {
    display: flex; justify-content: space-between; align-items: flex-end;
    margin-bottom: 2rem; padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .section-title {
    font-family: var(--r); font-size: 1.75rem;
    color: var(--white); letter-spacing: -0.02em;
  }
  .section-sub { font-size: 0.85rem; color: var(--sage); margin-top: 0.25rem; }

  /* Filter pills */
  .filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem; }
  .pill {
    background: var(--soil); border: 1px solid rgba(255,255,255,0.1);
    color: var(--sand); font-family: var(--s); font-size: 0.8rem; font-weight: 500;
    padding: 0.4rem 1rem; border-radius: 100px; cursor: pointer;
    transition: all 0.15s;
  }
  .pill:hover { border-color: var(--sun); color: var(--sun); }
  .pill.active { background: var(--sun); border-color: var(--sun); color: var(--earth); font-weight: 600; }

  /* Project grid */
  .project-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  /* Project card */
  .project-card {
    background: var(--soil);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 1.5rem;
    cursor: pointer; transition: all 0.2s;
    display: flex; flex-direction: column; gap: 1rem;
  }
  .project-card:hover {
    border-color: rgba(232,184,75,0.4);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  }
  .card-category {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 0.3rem 0.75rem; border-radius: 100px;
    background: rgba(255,255,255,0.06); color: var(--sage);
  }
  .card-title {
    font-family: var(--r); font-size: 1.2rem; line-height: 1.3;
    color: var(--white); letter-spacing: -0.01em;
  }
  .card-desc { font-size: 0.875rem; line-height: 1.6; color: var(--sand); }
  .card-owner { font-size: 0.8rem; color: var(--sage); margin-top: auto; }
  .card-owner strong { color: var(--mist); }

  /* Progress bar */
  .progress-wrap { display: flex; flex-direction: column; gap: 0.5rem; }
  .progress-bar {
    height: 6px; background: rgba(255,255,255,0.1); border-radius: 100px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: linear-gradient(90deg, var(--moss), var(--sage));
    border-radius: 100px; transition: width 0.6s ease;
  }
  .progress-meta {
    display: flex; justify-content: space-between; align-items: center;
  }
  .progress-raised { font-size: 0.85rem; font-weight: 600; color: var(--sun); }
  .progress-goal { font-size: 0.75rem; color: var(--sand); }
  .qf-badge {
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.7rem; font-weight: 600; color: var(--sky);
    background: rgba(107,155,184,0.15); padding: 0.2rem 0.6rem; border-radius: 4px;
  }
  .contribs { font-size: 0.75rem; color: var(--sage); }

  /* Two-col layout for project detail */
  .two-col { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; }
  .panel {
    background: var(--soil); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 2rem;
  }
  .panel-title {
    font-family: var(--r); font-size: 1.1rem; color: var(--white);
    margin-bottom: 1.25rem; padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  /* Needs list */
  .need-item {
    display: flex; gap: 1rem; align-items: flex-start;
    padding: 0.875rem 0; border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .need-item:last-child { border-bottom: none; }
  .urgency-dot {
    width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0;
  }
  .urgency-critical { background: var(--red); box-shadow: 0 0 6px var(--red); }
  .urgency-high { background: var(--sun); }
  .urgency-normal { background: var(--sage); }
  .urgency-low { background: var(--bark); }
  .need-text { font-size: 0.875rem; color: var(--sand); line-height: 1.5; }
  .need-type { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--sage); margin-bottom: 0.25rem; }

  /* Resources list */
  .resource-item {
    padding: 1rem; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; margin-bottom: 0.75rem;
  }
  .resource-item:last-child { margin-bottom: 0; }
  .resource-title { font-size: 0.9rem; font-weight: 500; color: var(--white); margin-bottom: 0.35rem; }
  .resource-desc { font-size: 0.8rem; color: var(--sand); line-height: 1.5; }
  .resource-meta { display: flex; justify-content: space-between; margin-top: 0.5rem; }
  .resource-value { font-size: 0.8rem; color: var(--sun); font-weight: 600; }
  .resource-owner { font-size: 0.75rem; color: var(--sage); }

  /* Contribute form */
  .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
  .form-label { font-size: 0.8rem; font-weight: 600; color: var(--sand); letter-spacing: 0.03em; }
  .form-input {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    color: var(--white); font-family: var(--s); font-size: 0.9rem;
    padding: 0.75rem 1rem; border-radius: 8px; outline: none;
    transition: border-color 0.15s;
  }
  .form-input:focus { border-color: var(--sun); }
  .form-input::placeholder { color: rgba(255,255,255,0.25); }
  select.form-input { cursor: pointer; }
  textarea.form-input { resize: vertical; min-height: 80px; }

  /* QF explainer */
  .qf-explainer {
    background: rgba(107,155,184,0.1); border: 1px solid rgba(107,155,184,0.2);
    border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;
    font-size: 0.8rem; color: var(--mist); line-height: 1.6;
  }
  .qf-explainer strong { color: var(--sky); }

  /* Match card */
  .match-offer {
    background: rgba(61,92,46,0.2); border: 1px solid rgba(122,158,106,0.3);
    border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;
  }
  .match-amount { font-family: var(--r); font-size: 1.5rem; color: var(--sun); }
  .match-type { font-size: 0.75rem; color: var(--sage); text-transform: uppercase; letter-spacing: 0.1em; }
  .match-msg { font-size: 0.85rem; color: var(--sand); margin-top: 0.5rem; line-height: 1.5; }

  /* Back button */
  .back-btn {
    background: none; border: none; cursor: pointer;
    color: var(--sage); font-family: var(--s); font-size: 0.9rem;
    display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem;
    padding: 0; transition: color 0.15s;
  }
  .back-btn:hover { color: var(--sun); }

  /* Toast */
  .toast {
    position: fixed; bottom: 2rem; right: 2rem; z-index: 200;
    background: var(--moss); border: 1px solid var(--sage);
    color: var(--white); padding: 1rem 1.5rem; border-radius: 8px;
    font-size: 0.875rem; font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Hero right */
  .hero-visual {
    background: var(--soil); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;
  }
  .hero-visual-title { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sage); margin-bottom: 0.5rem; }
  .mini-card {
    background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.875rem;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .mini-card-title { font-size: 0.875rem; font-weight: 500; color: var(--white); margin-bottom: 0.5rem; }
  .mini-progress { height: 4px; background: rgba(255,255,255,0.1); border-radius: 100px; overflow: hidden; margin-bottom: 0.35rem; }
  .mini-progress-fill { height: 100%; background: linear-gradient(90deg, var(--moss), var(--sage)); border-radius: 100px; }
  .mini-meta { display: flex; justify-content: space-between; }
  .mini-raised { font-size: 0.75rem; color: var(--sun); font-weight: 600; }
  .mini-contributors { font-size: 0.75rem; color: var(--sage); }

  /* Modal overlay */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 150;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 2rem;
  }
  .modal {
    background: var(--soil); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px; padding: 2rem; width: 100%; max-width: 480px;
    max-height: 80vh; overflow-y: auto;
  }
  .modal-title { font-family: var(--r); font-size: 1.4rem; color: var(--white); margin-bottom: 1.5rem; }
  .modal-close {
    position: absolute; top: 1rem; right: 1rem;
    background: none; border: none; cursor: pointer; color: var(--sand);
    font-size: 1.25rem; line-height: 1;
  }

  /* Tags */
  .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .tag {
    font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 4px;
    background: rgba(255,255,255,0.06); color: var(--sand);
  }

  /* Page: Resources */
  .resource-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem;
  }
  .resource-card {
    background: var(--soil); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 1.5rem; transition: all 0.2s;
  }
  .resource-card:hover { border-color: rgba(122,158,106,0.4); transform: translateY(-2px); }
  .resource-type-badge {
    display: inline-block; font-size: 0.7rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    padding: 0.25rem 0.65rem; border-radius: 4px; margin-bottom: 0.75rem;
  }
  .type-funding { background: rgba(232,184,75,0.15); color: var(--sun); }
  .type-land { background: rgba(61,92,46,0.3); color: var(--sage); }
  .type-tools { background: rgba(107,155,184,0.15); color: var(--sky); }
  .type-expertise { background: rgba(92,61,30,0.4); color: #C8956A; }
  .type-space { background: rgba(196,75,43,0.15); color: #E88B72; }
  .type-technology { background: rgba(107,155,184,0.2); color: var(--mist); }

  /* Responsive */
  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 3rem 1.25rem 2rem; }
    .hero-visual { display: none; }
    .two-col { grid-template-columns: 1fr; }
    .nav { padding: 0 1.25rem; }
    .main { padding: 2rem 1.25rem; }
    .stats-inner { gap: 1.5rem; }
  }
`;

// ── Constants ──────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  energy: '⚡', land: '🌱', tools: '🔧', funding: '💰',
  housing: '🏠', power: '✊', food: '🌾'
};

const TYPE_COLORS = {
  funding: 'type-funding', land: 'type-land', tools: 'type-tools',
  expertise: 'type-expertise', space: 'type-space', technology: 'type-technology'
};

// ── Mock data (same as seed in schema) ────────────────────────────────────
const MOCK_PROJECTS = [
  {
    id: 'p1', owner_id: 'u1', title: 'Solar Roots Community Energy Hub',
    slug: 'solar-roots-energy-hub', category: 'energy', status: 'active',
    funding_goal: 85000, funding_raised: 34200, contributor_count: 47,
    qf_match_pool: 12400, location: 'Jamaica Plain, Boston',
    owner_name: 'Asia Grady', owner_org: 'Solar Roots Co-op',
    description: 'Building a community-owned solar installation and workforce training center in Jamaica Plain. This project will train 40 residents in solar installation, create cooperative ownership of energy assets, and reduce energy burden for 200 households.',
    tags: ['solar', 'cooperative', 'workforce', 'energy justice']
  },
  {
    id: 'p2', owner_id: 'u2', title: 'JP Community Land Trust Expansion',
    slug: 'jp-land-trust-expansion', category: 'land', status: 'active',
    funding_goal: 250000, funding_raised: 87500, contributor_count: 23,
    qf_match_pool: 31200, location: 'Jamaica Plain, Boston',
    owner_name: 'Rufus Faulk', owner_org: 'JP Community Land Trust',
    description: 'Acquiring and converting 3 vacant parcels in Jamaica Plain into permanently affordable cooperative housing. Community land trust model ensures these homes stay affordable for generations.',
    tags: ['housing', 'land trust', 'cooperative', 'affordability']
  },
  {
    id: 'p3', owner_id: 'u1', title: 'Front Porch Tech Commons',
    slug: 'front-porch-tech-commons', category: 'tools', status: 'active',
    funding_goal: 45000, funding_raised: 12800, contributor_count: 31,
    qf_match_pool: 8900, location: 'Boston, MA',
    owner_name: 'Asia Grady', owner_org: 'Solar Roots Co-op',
    description: 'A shared technology infrastructure cooperative for Boston-based community organizations — shared hosting, tools, and technical support owned by the orgs that use it.',
    tags: ['technology', 'cooperative', 'infrastructure', 'civic tech']
  }
];

const MOCK_NEEDS = {
  p1: [
    { id: 'n1', type: 'funding', description: 'Solar panel procurement — need $50K to reach bulk pricing threshold', urgency: 'high' },
    { id: 'n2', type: 'expertise', description: 'Licensed electrician to supervise installation training sessions', urgency: 'high' },
  ],
  p2: [
    { id: 'n3', type: 'funding', description: 'Down payment assistance for first parcel acquisition', urgency: 'critical' },
  ],
  p3: [
    { id: 'n4', type: 'tools', description: 'Server infrastructure and managed hosting setup', urgency: 'normal' },
  ]
};

const MOCK_RESOURCES = [
  {
    id: 'r1', type: 'funding', title: 'Impact Investment Pool Q2 2026',
    description: 'Patient capital available for cooperative infrastructure projects in Greater Boston. 0% interest, 7-year repayment.',
    quantity: '$25K–$150K per project', value: 150000,
    owner_name: 'Impact Capital Fund', owner_org: 'Impact Capital Fund', available: 1
  },
  {
    id: 'r2', type: 'expertise', title: 'Legal & Compliance Support',
    description: 'Pro bono cooperative law and compliance guidance for emerging co-ops.',
    quantity: 'Up to 40 hrs/project', value: null,
    owner_name: 'Impact Capital Fund', owner_org: 'Impact Capital Fund', available: 1
  },
  {
    id: 'r3', type: 'land', title: 'Vacant Lot — Roxbury (3,200 sqft)',
    description: 'City-owned vacant lot available for community land trust acquisition via Disposition process. Suitable for urban agriculture or cooperative housing.',
    quantity: '1 parcel', value: null,
    owner_name: 'BRA Community Office', owner_org: 'Boston Redevelopment Authority', available: 1
  }
];

const MOCK_STATS = {
  active_projects: 3, total_raised: 134500,
  total_contributors: 101, registered_users: 4,
  total_transactions: 101, available_resources: 3
};

// ── Utility ────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
const pct = (raised, goal) => Math.min(100, Math.round((raised / goal) * 100));

// ── Components ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onClick }) {
  const progress = pct(project.funding_raised, project.funding_goal);
  return (
    <div className="project-card" onClick={() => onClick(project)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="card-category">
          {CATEGORY_ICONS[project.category]} {project.category}
        </span>
        <span className="contribs">{project.contributor_count} contributors</span>
      </div>
      <div className="card-title">{project.title}</div>
      <div className="card-desc">{project.description.substring(0, 120)}…</div>
      <div className="progress-wrap">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-meta">
          <span className="progress-raised">{fmt(project.funding_raised)} raised</span>
          <span className="progress-goal">of {fmt(project.funding_goal)}</span>
        </div>
        {project.qf_match_pool > 0 && (
          <span className="qf-badge">⬡ {fmt(project.qf_match_pool)} QF match pool</span>
        )}
      </div>
      {project.tags && (
        <div className="tags">
          {project.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
      <div className="card-owner">
        <strong>{project.owner_org || project.owner_name}</strong> · {project.location}
      </div>
    </div>
  );
}

function ResourceCard({ resource }) {
  return (
    <div className="resource-card">
      <span className={`resource-type-badge ${TYPE_COLORS[resource.type]}`}>{resource.type}</span>
      <div style={{ fontFamily: 'var(--r)', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '0.5rem' }}>
        {resource.title}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--sand)', lineHeight: '1.6', marginBottom: '0.75rem' }}>
        {resource.description}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--sun)', fontWeight: 600 }}>
          {resource.quantity || (resource.value ? fmt(resource.value) : 'Available')}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--sage)' }}>
          {resource.owner_org || resource.owner_name}
        </span>
      </div>
    </div>
  );
}

function ContributePanel({ project, onContribute }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [role, setRole] = useState('investor');

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    onContribute({ amount: Number(amount), note, role });
    setAmount(''); setNote('');
  };

  const sqrtMatch = amount ? Math.pow(Math.sqrt(Number(amount)), 2) : 0;
  const estimatedMatch = amount ? Math.round(Number(amount) * 0.42) : 0;

  return (
    <div className="panel">
      <div className="panel-title">Contribute to this project</div>

      <div className="qf-explainer">
        <strong>Quadratic Funding active.</strong> Your contribution is amplified by the match pool —
        the more contributors, the more match unlocked. Even small contributions matter.
        {amount > 0 && <div style={{ marginTop: '0.5rem' }}>
          Estimated match unlock: <strong style={{ color: 'var(--sun)' }}>{fmt(estimatedMatch)}</strong>
        </div>}
      </div>

      <div className="form-group">
        <label className="form-label">I am a</label>
        <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
          <option value="investor">Capital Investor</option>
          <option value="organizer">Co-op Builder / Organizer</option>
          <option value="resident">Community Resident</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Contribution amount ($)</label>
        <input
          className="form-input" type="number" min="1"
          placeholder="e.g. 500" value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Note (optional)</label>
        <textarea
          className="form-input" placeholder="Why are you supporting this project?"
          value={note} onChange={e => setNote(e.target.value)}
        />
      </div>

      <button className="btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>
        Contribute {amount ? fmt(Number(amount)) : ''}
      </button>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="panel-title" style={{ marginBottom: '0.75rem' }}>Available matches</div>
        <div className="match-offer">
          <div className="match-type">QF Match Pool</div>
          <div className="match-amount">{fmt(project.qf_match_pool)}</div>
          <div className="match-msg">Quadratic match available from Impact Capital Fund and community investors. Unlocked proportionally by contributor count.</div>
        </div>
      </div>
    </div>
  );
}

// ── Pages ──────────────────────────────────────────────────────────────────
function HeroSection({ onExplore, onPost }) {
  return (
    <div className="hero">
      <div>
        <div className="hero-eyebrow">Community Capital Marketplace</div>
        <h1 className="hero-title">
          Where resources <em>flow toward</em> the people building free futures
        </h1>
        <p className="hero-sub">
          CommonGround is a cooperative marketplace that connects organizers, co-op builders,
          and residents with the funding, land, tools, and power they need —
          through a structure where investors and communities feed each other.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={onExplore}>Explore projects</button>
          <button className="btn-secondary" onClick={onPost}>Post a project</button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-visual-title">Active on CommonGround</div>
        {MOCK_PROJECTS.map(p => (
          <div className="mini-card" key={p.id}>
            <div className="mini-card-title">{p.title}</div>
            <div className="mini-progress">
              <div className="mini-progress-fill" style={{ width: `${pct(p.funding_raised, p.funding_goal)}%` }} />
            </div>
            <div className="mini-meta">
              <span className="mini-raised">{fmt(p.funding_raised)}</span>
              <span className="mini-contributors">{p.contributor_count} contributors</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsPage({ onSelect }) {
  const [filter, setFilter] = useState('all');
  const categories = ['all', 'energy', 'land', 'tools', 'housing', 'funding', 'power'];
  const filtered = filter === 'all' ? MOCK_PROJECTS : MOCK_PROJECTS.filter(p => p.category === filter);

  return (
    <div className="main">
      <div className="section-header">
        <div>
          <div className="section-title">Active Projects</div>
          <div className="section-sub">Community-led initiatives seeking resources, capital, and collaboration</div>
        </div>
      </div>
      <div className="filters">
        {categories.map(c => (
          <button key={c} className={`pill ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'all' ? 'All' : `${CATEGORY_ICONS[c]} ${c}`}
          </button>
        ))}
      </div>
      <div className="project-grid">
        {filtered.map(p => <ProjectCard key={p.id} project={p} onClick={onSelect} />)}
      </div>
    </div>
  );
}

function ProjectDetailPage({ project, onBack, onContribute }) {
  const needs = MOCK_NEEDS[project.id] || [];
  const progress = pct(project.funding_raised, project.funding_goal);

  return (
    <div className="main">
      <button className="back-btn" onClick={onBack}>← Back to projects</button>

      <div style={{ marginBottom: '2rem' }}>
        <span className="card-category" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
          {CATEGORY_ICONS[project.category]} {project.category}
        </span>
        <h1 style={{ fontFamily: 'var(--r)', fontSize: '2.25rem', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          {project.title}
        </h1>
        <div style={{ fontSize: '0.9rem', color: 'var(--sage)' }}>
          {project.owner_org || project.owner_name} · {project.location}
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="panel" style={{ marginBottom: '1.5rem' }}>
            <div className="panel-title">About this project</div>
            <p style={{ fontSize: '0.95rem', color: 'var(--sand)', lineHeight: '1.75' }}>{project.description}</p>
            <div className="tags" style={{ marginTop: '1rem' }}>
              {(project.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          <div className="panel" style={{ marginBottom: '1.5rem' }}>
            <div className="panel-title">Funding progress</div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'var(--r)', fontSize: '2rem', color: 'var(--sun)' }}>
                {fmt(project.funding_raised)}
                <span style={{ fontSize: '1rem', color: 'var(--sand)', fontFamily: 'var(--s)' }}> raised of {fmt(project.funding_goal)}</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--sage)', marginTop: '0.25rem' }}>
                {project.contributor_count} contributors · {progress}% funded
              </div>
            </div>
            <div className="progress-bar" style={{ height: '10px' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            {project.qf_match_pool > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <span className="qf-badge">⬡ {fmt(project.qf_match_pool)} available in QF match pool</span>
              </div>
            )}
          </div>

          {needs.length > 0 && (
            <div className="panel">
              <div className="panel-title">What this project needs</div>
              {needs.map(n => (
                <div key={n.id} className="need-item">
                  <div className={`urgency-dot urgency-${n.urgency}`} />
                  <div>
                    <div className="need-type">{n.type}</div>
                    <div className="need-text">{n.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ContributePanel project={project} onContribute={(data) => onContribute(project, data)} />
      </div>
    </div>
  );
}

function ResourcesPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const types = ['all', 'funding', 'land', 'tools', 'expertise', 'space', 'technology'];
  const filtered = typeFilter === 'all' ? MOCK_RESOURCES : MOCK_RESOURCES.filter(r => r.type === typeFilter);

  return (
    <div className="main">
      <div className="section-header">
        <div>
          <div className="section-title">Resource Pool</div>
          <div className="section-sub">Funding, land, tools, and expertise available to community projects</div>
        </div>
        <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}>
          + Offer a resource
        </button>
      </div>
      <div className="filters">
        {types.map(t => (
          <button key={t} className={`pill ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
            {t === 'all' ? 'All types' : t}
          </button>
        ))}
      </div>
      <div className="resource-grid">
        {filtered.map(r => <ResourceCard key={r.id} resource={r} />)}
      </div>
    </div>
  );
}

function PostProjectModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'energy', funding_goal: '', location: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Post a new project</h2>
        <div className="form-group">
          <label className="form-label">Project title</label>
          <input className="form-input" placeholder="What are you building?" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
            {['energy', 'land', 'tools', 'housing', 'funding', 'power', 'food'].map(c => (
              <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" placeholder="What does this project do, and why does it matter?" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Funding goal ($)</label>
          <input className="form-input" type="number" placeholder="e.g. 50000" value={form.funding_goal} onChange={e => set('funding_goal', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" placeholder="e.g. Jamaica Plain, Boston" value={form.location} onChange={e => set('location', e.target.value)} />
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={() => onSubmit(form)}>
          Submit project
        </button>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function CommonGround() {
  const [page, setPage] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [stats] = useState(MOCK_STATS);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleContribute = (project, data) => {
    showToast(`✓ Contribution of $${data.amount} submitted to ${project.title}`);
  };

  const handlePostSubmit = (form) => {
    setShowPostModal(false);
    showToast(`✓ "${form.title}" submitted for review`);
  };

  return (
    <>
      <style>{style}</style>
      <div className="app">

        {/* Nav */}
        <nav className="nav">
          <div className="nav-brand" onClick={() => setPage('home')}>
            Common<span>Ground</span>
          </div>
          <div className="nav-links">
            <button className={`nav-btn ${page === 'projects' ? 'active' : ''}`} onClick={() => setPage('projects')}>Projects</button>
            <button className={`nav-btn ${page === 'resources' ? 'active' : ''}`} onClick={() => setPage('resources')}>Resources</button>
            <button className="nav-cta" onClick={() => setShowPostModal(true)}>+ Post project</button>
          </div>
        </nav>

        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stats-inner">
            <div className="stat">
              <span className="stat-num">{stats.active_projects}</span>
              <span className="stat-label">Active Projects</span>
            </div>
            <div className="stat">
              <span className="stat-num">{fmt(stats.total_raised)}</span>
              <span className="stat-label">Total Raised</span>
            </div>
            <div className="stat">
              <span className="stat-num">{stats.total_contributors}</span>
              <span className="stat-label">Contributors</span>
            </div>
            <div className="stat">
              <span className="stat-num">{stats.available_resources}</span>
              <span className="stat-label">Resources Available</span>
            </div>
          </div>
        </div>

        {/* Pages */}
        {page === 'home' && (
          <HeroSection
            onExplore={() => setPage('projects')}
            onPost={() => setShowPostModal(true)}
          />
        )}
        {page === 'projects' && !selectedProject && (
          <ProjectsPage onSelect={(p) => { setSelectedProject(p); setPage('detail'); }} />
        )}
        {page === 'detail' && selectedProject && (
          <ProjectDetailPage
            project={selectedProject}
            onBack={() => { setSelectedProject(null); setPage('projects'); }}
            onContribute={handleContribute}
          />
        )}
        {page === 'resources' && <ResourcesPage />}

        {/* Post modal */}
        {showPostModal && (
          <PostProjectModal onClose={() => setShowPostModal(false)} onSubmit={handlePostSubmit} />
        )}

        {/* Toast */}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
