const { useState, useRef, useEffect, useMemo, useCallback } = React;

// ---------- DATA ------------------------------------------------------------

const NODES = [
  // ENTITIES (circle, blue)
  { id: "account",      label: "Account",       type: "entity", state: "core",     cat: "core",    x: 0,    y: 60,   size: 34, instances: "2.8K", instancesN: 2840,  props: 18, edges: 12, fill: 94, conf: 97, fresh: "24m", pii: 4, change: "HIGH",   desc: "Customer or prospect organization" },
  { id: "person",       label: "Person",        type: "entity", state: "core",     cat: "core",    x: -240, y: -10,  size: 30, instances: "18K",  instancesN: 18420, props: 14, edges: 8,  fill: 81, conf: 92, fresh: "1.2h", pii: 4, change: "MEDIUM", desc: "Individual contact across the customer lifecycle" },
  { id: "subscription", label: "Subscription",  type: "entity", state: "core",     cat: "core",    x: 60,   y: 270,  size: 28, instances: "2.8K", instancesN: 2840,  props: 11, edges: 6,  fill: 99, conf: 99, fresh: "12m", pii: 0, change: "LOW",    desc: "Recurring product license tied to an account" },
  { id: "agreement",    label: "Agreement",     type: "entity", state: "core",     cat: "core",    x: 320,  y: 230,  size: 28, instances: "3.1K", instancesN: 3120,  props: 16, edges: 5,  fill: 96, conf: 98, fresh: "18m", pii: 1, change: "LOW",    desc: "Signed contract governing one or more subscriptions" },
  { id: "interaction",  label: "Interaction",   type: "entity", state: "core",     cat: "support", x: -290, y: 220,  size: 26, instances: "124K", instancesN: 124000,props: 9,  edges: 4,  fill: 78, conf: 84, fresh: "24m", pii: 0, change: "HIGH",   desc: "Logged touchpoint between a Person and an Account" },
  { id: "invoice",      label: "Invoice",       type: "entity", state: "core",     cat: "core",    x: 380,  y: -130, size: 26, instances: "12K",  instancesN: 12040, props: 13, edges: 4,  fill: 92, conf: 95, fresh: "36m", pii: 0, change: "MEDIUM", desc: "Billing record drawn from a subscription cycle" },
  { id: "employee",     label: "Employee",      type: "entity", state: "core",     cat: "core",    x: -460, y: 110,  size: 24, instances: "1.2K", instancesN: 1240,  props: 12, edges: 3,  fill: 88, conf: 94, fresh: "4h",  pii: 2, change: "LOW",    desc: "Internal staff member" },

  // STATE-COLORED ENTITIES
  { id: "ticket",       label: "Ticket",        type: "entity", state: "incident", cat: "support", x: -150, y: 360,  size: 28, instances: "142K", instancesN: 142000,props: 10, edges: 5,  fill: 91, conf: 96, fresh: "18m", pii: 1, change: "MEDIUM", desc: "Support case raised by a Person against an Account" },
  { id: "incident",     label: "Incident",      type: "entity", state: "incident", cat: "support", x: 80,   y: 460,  size: 26, instances: "412",  instancesN: 412,   props: 14, edges: 4,  fill: 88, conf: 91, fresh: "6m",  pii: 0, change: "HIGH",   desc: "Operational outage affecting subscriptions" },

  { id: "signal",       label: "Signal",        type: "entity", state: "signal",   cat: "derived", x: 240,  y: -240, size: 24, instances: "25K",  instancesN: 25400, props: 7,  edges: 3,  fill: 88, conf: 95, fresh: "6m",  pii: 0, change: "HIGH",   desc: "Derived behavioural event from product telemetry" },
  { id: "risk",         label: "Risk",          type: "entity", state: "risk",     cat: "derived", x: 440,  y: -200, size: 24, instances: "184",  instancesN: 184,   props: 11, edges: 4,  fill: 94, conf: 99, fresh: "6m",  pii: 0, change: "MEDIUM", desc: "Open exposure attached to an account or contract" },

  // AGENTS (hexagon, purple)
  { id: "rev_fore",     label: "Revenue Forecaster",   type: "agent", state: "core", cat: "derived", x: 540,  y: 40,   size: 30, instances: "—", instancesN: 0, props: 9, edges: 5, fill: 86, conf: 92, fresh: "15m", pii: 0, change: "MEDIUM", desc: "Agent: predicts ARR roll-forward from subscription + signal data" },
  { id: "comp_aud",     label: "Compliance Auditor",   type: "agent", state: "core", cat: "derived", x: 600,  y: 280,  size: 28, instances: "—", instancesN: 0, props: 7, edges: 4, fill: 92, conf: 96, fresh: "1h",  pii: 0, change: "LOW",    desc: "Agent: scans agreements and tickets for policy breaches" },
  { id: "cust_health",  label: "Customer Health",      type: "agent", state: "core", cat: "derived", x: -340, y: -180, size: 28, instances: "—", instancesN: 0, props: 8, edges: 5, fill: 89, conf: 94, fresh: "30m", pii: 0, change: "MEDIUM", desc: "Agent: blends interaction + signal data into a health score" },
  { id: "insight_syn",  label: "Insight Synthesizer",  type: "agent", state: "core", cat: "derived", x: 220,  y: 380,  size: 26, instances: "—", instancesN: 0, props: 6, edges: 4, fill: 76, conf: 88, fresh: "6h",  pii: 0, change: "LOW",    desc: "Agent: weekly narrative summaries across accounts" },

  // DATA SOURCES (square, green)
  { id: "netsuite",     label: "NetSuite ERP",         type: "source", state: "core", cat: "source", x: 470,  y: -340, size: 26, instances: "—", instancesN: 0, props: 22, edges: 3, fill: 99, conf: 100, fresh: "5m",  pii: 1, change: "LOW",    desc: "System of record for invoices and agreements" },
  { id: "okta",         label: "Okta Identity",        type: "source", state: "core", cat: "source", x: -560, y: -100, size: 24, instances: "—", instancesN: 0, props: 14, edges: 2, fill: 100, conf: 100, fresh: "2m", pii: 6, change: "LOW",    desc: "Identity provider mapping Person → Employee" },
  { id: "snowflake",    label: "Snowflake Warehouse",  type: "source", state: "core", cat: "source", x: -120, y: 540,  size: 28, instances: "—", instancesN: 0, props: 36, edges: 5, fill: 96, conf: 98, fresh: "12h", pii: 0, change: "MEDIUM", desc: "Warehouse landing zone for product telemetry" },
];

const EDGES = [
  // direct edges
  { s: "person",       t: "account",      label: "WORKS_AT",        kind: "direct" },
  { s: "person",       t: "account",      label: "PREVIOUSLY_AT",   kind: "inferred", curve: -36 },
  { s: "account",      t: "subscription", label: "HAS_SUBSCRIPTION", kind: "direct" },
  { s: "account",      t: "agreement",    label: "GOVERNED_BY",     kind: "direct" },
  { s: "subscription", t: "invoice",      label: "BILLS",           kind: "direct" },
  { s: "agreement",    t: "invoice",      label: "ITEMIZES",        kind: "inferred" },
  { s: "person",       t: "interaction",  label: "INVOLVED_IN",     kind: "direct" },
  { s: "interaction",  t: "account",      label: "TOUCHES",         kind: "inferred", curve: 28 },
  { s: "person",       t: "ticket",       label: "RAISES",          kind: "direct" },
  { s: "ticket",       t: "account",      label: "AGAINST",         kind: "direct" },
  { s: "incident",     t: "subscription", label: "INCIDENT_AFFECTS", kind: "direct" },
  { s: "incident",     t: "ticket",       label: "ROLLS_UP",        kind: "inferred" },
  { s: "signal",       t: "account",      label: "OBSERVED_ON",     kind: "direct" },
  { s: "risk",         t: "agreement",    label: "EXPOSES",         kind: "direct" },
  { s: "risk",         t: "account",      label: "ATTACHED_TO",     kind: "inferred", curve: -22 },

  // agent edges
  { s: "rev_fore",     t: "subscription", label: "READS",           kind: "agent" },
  { s: "rev_fore",     t: "signal",       label: "READS",           kind: "agent" },
  { s: "cust_health",  t: "interaction",  label: "READS",           kind: "agent" },
  { s: "cust_health",  t: "person",       label: "SCORES",          kind: "agent" },
  { s: "comp_aud",     t: "agreement",    label: "AUDITS",          kind: "agent" },
  { s: "comp_aud",     t: "ticket",       label: "AUDITS",          kind: "agent" },
  { s: "insight_syn",  t: "incident",     label: "SUMMARIZES",      kind: "agent" },
  { s: "insight_syn",  t: "account",      label: "WRITES_TO",       kind: "agent" },

  // source edges
  { s: "netsuite",     t: "invoice",      label: "SOURCES",         kind: "source" },
  { s: "netsuite",     t: "agreement",    label: "SOURCES",         kind: "source" },
  { s: "okta",         t: "person",       label: "SOURCES",         kind: "source" },
  { s: "okta",         t: "employee",     label: "SOURCES",         kind: "source" },
  { s: "snowflake",    t: "signal",       label: "SOURCES",         kind: "source" },
  { s: "snowflake",    t: "interaction",  label: "SOURCES",         kind: "source" },
];

const SIDEBAR_NODES = [...NODES].sort((a, b) => a.label.localeCompare(b.label));

// ---------- HELPERS ---------------------------------------------------------

const TYPE_META = {
  entity: { tag: "ENTITY",      legend: "Entities" },
  agent:  { tag: "AGENT",       legend: "Agents" },
  source: { tag: "DATA SOURCE", legend: "Data Sources" },
};

const STATE_COLORS = {
  core:     { stroke: "var(--blue)",   fill: "var(--blue-fill)",   soft: "var(--blue-soft)"   },
  signal:   { stroke: "var(--gold)",   fill: "var(--gold-fill)",   soft: "var(--gold-soft)"   },
  risk:     { stroke: "var(--gold)",   fill: "var(--gold-fill)",   soft: "var(--gold-soft)"   },
  incident: { stroke: "var(--coral)",  fill: "var(--coral-fill)",  soft: "var(--coral-soft)"  },
};

function colorForNode(n) {
  if (n.type === "agent")  return { stroke: "var(--purple)", fill: "var(--purple-fill)", soft: "var(--purple-soft)" };
  if (n.type === "source") return { stroke: "var(--green)",  fill: "var(--green-fill)",  soft: "var(--green-soft)"  };
  return STATE_COLORS[n.state] || STATE_COLORS.core;
}

// ---------- ICONS (small inline SVG glyphs inside list items) ---------------

function ListGlyph({ node, size = 18 }) {
  const c = colorForNode(node);
  // inner glyph based on node state/type (matches canvas)
  let inner = null;
  if (node.state === "signal") {
    inner = <polygon points="0,-3.6 3.6,0 0,3.6 -3.6,0" fill={c.stroke} />;
  } else if (node.state === "risk") {
    inner = <polygon points="0,-3.4 3.2,2.6 -3.2,2.6" fill="none" stroke={c.stroke} strokeWidth="1.1" />;
  } else if (node.state === "incident") {
    inner = <g><line x1="0" y1="-2.4" x2="0" y2="1.2" stroke={c.stroke} strokeWidth="1.3" strokeLinecap="round" /><circle cx="0" cy="2.6" r="0.7" fill={c.stroke} /></g>;
  } else if (node.id === "account") {
    inner = <polygon points="0,-3.2 3.2,0 0,3.2 -3.2,0" fill="none" stroke={c.stroke} strokeWidth="1.1" />;
  } else if (node.id === "person" || node.id === "employee") {
    inner = <circle r="3" fill="none" stroke={c.stroke} strokeWidth="1" />;
  } else if (node.id === "subscription") {
    inner = <rect x="-3.6" y="-1" width="7.2" height="2" rx="1" fill="none" stroke={c.stroke} strokeWidth="1" />;
  } else if (node.id === "agreement" || node.id === "invoice") {
    inner = <rect x="-3" y="-3.6" width="6" height="7.2" rx="0.6" fill="none" stroke={c.stroke} strokeWidth="1" />;
  } else if (node.id === "interaction") {
    inner = <g><path d="M -4 0 q 1.5 -2.4 3 0 t 3 0" fill="none" stroke={c.stroke} strokeWidth="1.1" /><path d="M 3 -1.5 L 4.5 0 L 3 1.5" fill="none" stroke={c.stroke} strokeWidth="1.1" strokeLinejoin="round" /></g>;
  } else if (node.id === "ticket") {
    inner = <g><circle r="3.4" fill="none" stroke={c.stroke} strokeWidth="1" /><path d="M 0 -3.4 A 3.4 3.4 0 0 1 0 3.4 Z" fill={c.stroke} /></g>;
  } else if (node.type === "agent") {
    inner = <polygon points="0,-3.4 2.4,0 0,3.4 -2.4,0" fill="none" stroke={c.stroke} strokeWidth="1" />;
  } else if (node.type === "source") {
    inner = <g><rect x="-3" y="-3" width="3" height="3" fill="none" stroke={c.stroke} strokeWidth="0.9" /><rect x="0" y="-3" width="3" height="3" fill="none" stroke={c.stroke} strokeWidth="0.9" /><rect x="-3" y="0" width="3" height="3" fill="none" stroke={c.stroke} strokeWidth="0.9" /><rect x="0" y="0" width="3" height="3" fill="none" stroke={c.stroke} strokeWidth="0.9" /></g>;
  } else {
    inner = <circle r="1.6" fill={c.stroke} />;
  }

  // outer shape — match canvas (circle/hex/square)
  let outer;
  if (node.type === "agent") {
    outer = <polygon points="-9.5,0 -4.75,-8.2 4.75,-8.2 9.5,0 4.75,8.2 -4.75,8.2" fill={c.fill} stroke={c.stroke} strokeWidth="1.3" />;
  } else if (node.type === "source") {
    outer = <rect x="-8.5" y="-8.5" width="17" height="17" rx="1.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.3" />;
  } else {
    outer = <circle r="9" fill={c.fill} stroke={c.stroke} strokeWidth="1.3" />;
  }

  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" style={{ flexShrink: 0 }}>
      {outer}
      {inner}
    </svg>
  );
}

// node body shape used in the canvas
function NodeShape({ node, selected, highlighted, dimmed, hover }) {
  const c = colorForNode(node);
  const r = node.size;
  const stroke = c.stroke;
  const strokeW = selected ? 2.2 : highlighted ? 1.8 : 1.3;
  const opacity = dimmed ? 0.28 : 1;
  const shadow = selected ? "drop-shadow(0 0 0.5px rgba(0,0,0,.25))" : "none";

  const common = { fill: c.fill, stroke, strokeWidth: strokeW, style: { filter: shadow, transition: "stroke-width 120ms" }, opacity };

  let inner = null;
  if (node.state === "signal") {
    inner = <polygon points="0,-7 7,0 0,7 -7,0" fill={c.stroke} opacity="0.85" />;
  } else if (node.state === "risk") {
    inner = <polygon points="0,-7 6.5,5 -6.5,5" fill="none" stroke={c.stroke} strokeWidth="1.4" />;
  } else if (node.state === "incident") {
    inner = (
      <g>
        <line x1="0" y1="-5" x2="0" y2="2" stroke={c.stroke} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="0" cy="5" r="1" fill={c.stroke} />
      </g>
    );
  } else if (node.type === "entity") {
    inner = <circle r={r * 0.18} fill="none" stroke={c.stroke} strokeWidth="1" opacity="0.55" />;
  } else if (node.type === "agent") {
    inner = <path d="M -4 0 L 0 -5 L 4 0 L 0 5 Z" fill="none" stroke={c.stroke} strokeWidth="1.1" opacity="0.75" />;
  } else if (node.type === "source") {
    inner = <rect x="-4" y="-4" width="8" height="8" fill="none" stroke={c.stroke} strokeWidth="1" opacity="0.7" />;
  }

  let shape;
  if (node.type === "agent") {
    // hexagon
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
    }
    shape = <polygon points={pts.join(" ")} {...common} />;
  } else if (node.type === "source") {
    shape = <rect x={-r} y={-r} width={r * 2} height={r * 2} rx="3" {...common} />;
  } else {
    shape = <circle r={r} {...common} />;
  }

  return (
    <g opacity={opacity}>
      {(selected || highlighted) && (
        node.type === "agent" ? (
          <polygon
            points={[0,1,2,3,4,5].map(i => {
              const a = (Math.PI / 3) * i - Math.PI / 2;
              const rr = r + 7;
              return `${(rr * Math.cos(a)).toFixed(2)},${(rr * Math.sin(a)).toFixed(2)}`;
            }).join(" ")}
            fill="none" stroke={c.stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.55"
          />
        ) : node.type === "source" ? (
          <rect x={-r - 7} y={-r - 7} width={(r + 7) * 2} height={(r + 7) * 2} rx="5" fill="none" stroke={c.stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
        ) : (
          <circle r={r + 7} fill="none" stroke={c.stroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
        )
      )}
      {shape}
      {inner}
    </g>
  );
}

// ---------- HEADER ----------------------------------------------------------

const TABS = ["Graph", "Nodes", "Edges", "Sources"];

function Header({ tab, onTab, onAddNode }) {
  return (
    <header className="hdr">
      <div className="hdr-left">
        <button className="hdr-back" title="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="hdr-title">
          <div className="hdr-title-row">Enterprise Context Graph</div>
          <div className="hdr-sub">
            <span className="dot-live" />
            <span className="sub-strong">LIVE</span>
            <span className="sub-muted">v2.14.0</span>
            <span className="sub-sep">·</span>
            <span className="sub-muted">branch </span><span className="sub-mono">main</span>
            <span className="sub-sep">·</span>
            <span className="sub-muted">4 drafts</span>
          </div>
        </div>
      </div>
      <nav className="hdr-tabs">
        {TABS.map(t => (
          <button key={t} className={"hdr-tab" + (t === tab ? " on" : "")} onClick={() => onTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      <div className="hdr-right">
        <button className="btn-dark" title="Add node" onClick={onAddNode}><span className="plus">+</span> Add node</button>
      </div>
    </header>
  );
}

// ---------- SIDEBAR ---------------------------------------------------------

function Sidebar({ open, onToggle, filter, setFilter, query, setQuery, selected, onSelect, hover, setHover, savedView, setSavedView }) {
  const filtered = useMemo(() => {
    return SIDEBAR_NODES.filter(n => {
      if (filter !== "all" && n.type !== filter) return false;
      if (query && !n.label.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [filter, query]);

  const counts = useMemo(() => ({
    all: SIDEBAR_NODES.length,
    entity: SIDEBAR_NODES.filter(n => n.type === "entity").length,
    agent:  SIDEBAR_NODES.filter(n => n.type === "agent").length,
    source: SIDEBAR_NODES.filter(n => n.type === "source").length,
  }), []);

  return (
    <aside className={"sb" + (open ? "" : " closed")}>
      {!open && (
        <button className="sb-reopen" onClick={onToggle} title="Open sidebar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
      <div className="sb-search">
        <span className="sb-search-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </span>
        <input
          placeholder="Search nodes…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <span className="sb-search-key">⌘F</span>
        <button className="sb-collapse" onClick={onToggle} title="Collapse sidebar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      <div className="sb-chips">
        <button className={"chip" + (filter === "all" ? " on" : "")} onClick={() => setFilter("all")}>All <span className="chip-n">{counts.all}</span></button>
        <button className={"chip" + (filter === "entity" ? " on" : "")} onClick={() => setFilter("entity")}>Entities <span className="chip-n">{counts.entity}</span></button>
        <button className={"chip" + (filter === "agent" ? " on" : "")} onClick={() => setFilter("agent")}>Agents <span className="chip-n">{counts.agent}</span></button>
        <button className={"chip" + (filter === "source" ? " on" : "")} onClick={() => setFilter("source")}>Sources <span className="chip-n">{counts.source}</span></button>
      </div>

      <div className="sb-section-head">
        <span>{filtered.length} NODES</span>
        <span className="sb-section-sort">A–Z</span>
      </div>

      <div className="sb-list">
        {filtered.map(n => (
          <button
            key={n.id}
            className={"sb-item" + (selected === n.id ? " on" : "") + (hover === n.id ? " hover" : "")}
            onClick={() => onSelect(n.id)}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
          >
            <ListGlyph node={n} />
            <div className="sb-item-text">
              <div className="sb-item-label">{n.label}</div>
              <div className="sb-item-sub">{TYPE_META[n.type].tag}</div>
            </div>
            <svg className="sb-item-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="sb-empty">No nodes match.</div>
        )}
      </div>

    </aside>
  );
}

// ---------- INSPECTOR (right panel) ----------------------------------------

function Inspector({ node, onClose }) {
  const [tab, setTab] = useState("Overview");
  if (!node) return null;
  const c = colorForNode(node);
  const incoming = EDGES.filter(e => e.t === node.id);
  const outgoing = EDGES.filter(e => e.s === node.id);
  const properties = generateProps(node);
  const sources = generateSources(node);

  // synthesized quality numbers based on node id so they're stable
  const seed = node.id.charCodeAt(0) + node.id.length;
  const complete = 88 + (seed % 11);
  const fresh = 75 + ((seed * 3) % 22);
  const valid = 91 + (seed % 8);

  const reqProps = properties.filter(p => p.required).length;
  const compProps = properties.filter(p => p.computed).length;
  const idxProps = properties.filter(p => p.indexed).length;
  const piiProps = properties.filter(p => p.pii).length;

  const TABS = ["Overview", `Props · ${properties.length}`, `Edges · ${outgoing.length}`, "Sources", "Rules"];

  return (
    <aside className="inspector">
      <div className="inspector-head">
        <div className="ih-icon">
          <svg width="44" height="44" viewBox="-22 -22 44 44">
            {node.type === "agent" ? (
              <polygon points={[0,1,2,3,4,5].map(i=>{const a=(Math.PI/3)*i-Math.PI/2;const r=14;return `${(r*Math.cos(a)).toFixed(2)},${(r*Math.sin(a)).toFixed(2)}`}).join(" ")} fill={c.fill} stroke={c.stroke} strokeWidth="1.6" />
            ) : node.type === "source" ? (
              <rect x="-13" y="-13" width="26" height="26" rx="3" fill={c.fill} stroke={c.stroke} strokeWidth="1.6" />
            ) : (
              <circle r="13" fill={c.fill} stroke={c.stroke} strokeWidth="1.6" />
            )}
          </svg>
        </div>
        <div className="ih-text">
          <div className="ih-row">
            <div className="ih-title">{node.label}</div>
            <div className="ih-tag">{TYPE_META[node.type].tag}</div>
          </div>
          <div className="ih-desc">{node.desc}</div>
        </div>
        <button className="ih-close" onClick={onClose} title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div className="ih-stats">
        <div><div className="ih-stat-label">Instances</div><div className="ih-stat-v">{node.instances}</div></div>
        <div><div className="ih-stat-label">Properties</div><div className="ih-stat-v">{properties.length}</div></div>
        <div><div className="ih-stat-label">Edge types</div><div className="ih-stat-v">{outgoing.length}</div></div>
      </div>

      <div className="ih-tabs">
        {TABS.map(t => {
          const name = t.split(" · ")[0];
          return <button key={name} className={"ih-tab" + (tab === name ? " on" : "")} onClick={() => setTab(name)}>{t}</button>;
        })}
      </div>

      <div className="ih-body">
        {tab === "Overview" && (
          <>
            <div className="ih-block">
              <div className="ih-block-head">At a glance</div>
              <div className="ih-grid">
                <div className="ih-card"><div className="ih-card-lbl">Required</div><div className="ih-card-v"><b>{reqProps}</b><span>/ {properties.length}</span></div></div>
                <div className="ih-card"><div className="ih-card-lbl">Computed</div><div className="ih-card-v" style={{color:"var(--green)"}}><b>{compProps}</b><span>/ {properties.length}</span></div></div>
                <div className="ih-card"><div className="ih-card-lbl">Indexed</div><div className="ih-card-v"><b>{idxProps}</b><span>/ {properties.length}</span></div></div>
                <div className="ih-card"><div className="ih-card-lbl">PII fields</div><div className="ih-card-v" style={{color: piiProps > 0 ? "var(--coral)" : "inherit"}}><b>{piiProps}</b><span>/ {properties.length}</span></div></div>
              </div>
            </div>

            <div className="ih-block">
              <div className="ih-block-head">Data quality <span className="ih-block-sub">Last 24h</span></div>
              <div className="ih-meters">
                <Meter label="Completeness" v={complete} tail={`${100-complete}% missing`} tone="ok" />
                <Meter label="Freshness"    v={fresh}    tail={`p95 = ${Math.round(60-fresh/2)}m ${(seed*7)%60}s`} tone="warn" />
                <Meter label="Validity"     v={valid}    tail={`${(seed*3)%14} violations`} tone="ok" />
                <Meter label="Identity match" v={91-(seed%6)} tail={`${(seed*5)%50} in queue`} tone="warn" />
              </div>
            </div>

            <div className="ih-block">
              <div className="ih-block-head">Lineage <span className="ih-block-sub">Where this node comes from</span></div>
              <div className="ih-rows">
                <div className="ih-row2"><span>Direct sources</span><b>{Math.max(1, Math.round(incoming.length/2))}</b></div>
                <div className="ih-row2"><span>Inferred edges</span><b>{incoming.filter(e=>e.kind==='inferred').length} in · {outgoing.filter(e=>e.kind==='inferred').length} out</b></div>
                <div className="ih-row2"><span>Computed properties</span><b>{compProps}</b></div>
              </div>
            </div>

            <div className="ih-block">
              <div className="ih-block-head">Top edges</div>
              <div className="ih-edges">
                {[...outgoing, ...incoming].slice(0, 6).map((e, i) => {
                  const other = NODES.find(n => n.id === (e.s === node.id ? e.t : e.s));
                  if (!other) return null;
                  const direction = e.s === node.id ? "→" : "←";
                  return (
                    <div key={i} className={"ih-edge ih-edge-" + e.kind}>
                      <span className="ih-edge-lbl">:{e.label}</span>
                      <span className="ih-edge-dir">{direction}</span>
                      <span className="ih-edge-other"><ListGlyph node={other} size={14} /> {other.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === "Props" && (
          <div className="ih-block">
            <div className="ih-prop-list">
              {properties.map((p, i) => (
                <div key={i} className="ih-prop-row">
                  <div className="ih-prop-name">
                    {p.pk && <span className="snap-tag snap-pk">PK</span>}
                    <span className="snap-n">{p.name}</span>
                  </div>
                  <div className="ih-prop-type">{p.type}</div>
                  <div className="ih-prop-flags">
                    {p.required && <span className="snap-tag">req</span>}
                    {p.indexed && <span className="snap-tag snap-idx">idx</span>}
                    {p.pii && <span className="snap-tag snap-pii">PII</span>}
                    {p.computed && <span className="snap-tag snap-comp">fx</span>}
                  </div>
                  <div className="ih-prop-bar">
                    <div className="meter-bar" style={{ width: 60, height: 5 }}><div className="meter-fill" style={{ width: p.fill + "%", background: metricColor(p.fill) }} /></div>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 10.5, color: metricColor(p.fill), fontWeight: 500 }}>{p.fill}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Edges" && (
          <div className="ih-block">
            <div className="ih-edge-detail-list">
              {outgoing.map((e, i) => {
                const target = NODES.find(n => n.id === e.t);
                if (!target) return null;
                const card = (seed + i * 11) % 100 < 70 ? "1:N" : "N:N";
                const inst = ((seed + i * 17) % 800) + 50;
                return (
                  <div key={i} className="ih-edge-detail">
                    <div className="ih-edge-det-label">:{e.label || "RELATED"}</div>
                    <div className="ih-edge-det-arrow">→</div>
                    <ListGlyph node={target} size={18} />
                    <div className="ih-edge-det-target">{target.label}</div>
                    <div className="ih-edge-det-card">{card}</div>
                    <div className="ih-edge-det-inst">{inst.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "Sources" && (
          <div className="ih-block">
            <div className="ih-src-list">
              {sources.map((s, i) => (
                <div key={i} className="ih-src-row">
                  <div className="ih-src-name">{s.name}</div>
                  <span className="snap-tag">{s.type}</span>
                  <div className="ih-src-freq">{s.freq}</div>
                  <span className={"src-status src-status-" + s.status}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Rules" && (
          <div className="ih-block">
            <div className="ih-rule-list">
              {["VALIDATE email format", "COMPUTE health_score", "SLO freshness ≤ 30m", "ACCESS mask PII for viewer"].map((rule, i) => (
                <div key={i} className="ih-rule-row">
                  <div className="ih-rule-kind">{rule.split(" ")[0]}</div>
                  <div className="ih-rule-desc">{rule.split(" ").slice(1).join(" ")}</div>
                  <span className={"rule-result-dot " + (i < 3 ? "ok" : "warn")} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function Meter({ label, v, tail, tone }) {
  const color = tone === "warn" ? "var(--gold)" : "var(--green)";
  return (
    <div className="meter">
      <div className="meter-top"><span>{label}</span><span className="meter-tail">{tail}</span><b>{v}%</b></div>
      <div className="meter-bar"><div className="meter-fill" style={{ width: v + "%", background: color }} /></div>
    </div>
  );
}

// ---------- CANVAS (graph) --------------------------------------------------

function Canvas({ nodes, setNodes, selected, setSelected, hover, setHover, filter, query, savedView, viewport, setViewport, sidebarOpen }) {
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null); // {kind:'node'|'pan', id?, startX, startY, origX, origY}
  const [size, setSize] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    const update = () => {
      if (svgRef.current) {
        const r = svgRef.current.getBoundingClientRect();
        setSize({ w: r.width, h: r.height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (svgRef.current) ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, [sidebarOpen]);

  // filter / dim logic
  const queryHit = (n) => !query || n.label.toLowerCase().includes(query.toLowerCase());
  const filterHit = (n) => filter === "all" || n.type === filter;
  const visible = useMemo(() => new Set(nodes.filter(n => filterHit(n) && queryHit(n)).map(n => n.id)), [nodes, filter, query]);

  // saved-view dim sets
  const savedViewSet = useMemo(() => {
    if (savedView === "Sales flow")    return new Set(["account","person","subscription","agreement","invoice","rev_fore","netsuite"]);
    if (savedView === "Health inputs") return new Set(["account","interaction","signal","cust_health","ticket","incident","snowflake"]);
    if (savedView === "PII surfaces")  return new Set(["person","employee","okta","account"]);
    return null;
  }, [savedView]);

  const isVisible = (id) => visible.has(id) && (!savedViewSet || savedViewSet.has(id));

  // viewport transform
  const { zoom, panX, panY } = viewport;
  const cx = size.w / 2;
  const cy = size.h / 2;
  const toScreen = (x, y) => [cx + panX + x * zoom, cy + panY + y * zoom];
  const toWorld = (sx, sy) => [(sx - cx - panX) / zoom, (sy - cy - panY) / zoom];

  // edge highlighting based on hover/selected
  const highlightId = hover || selected;
  const edgeIsLit = (e) => highlightId && (e.s === highlightId || e.t === highlightId);
  const nodeIsLit = (id) => {
    if (!highlightId) return false;
    if (id === highlightId) return true;
    return EDGES.some(e => (e.s === highlightId && e.t === id) || (e.t === highlightId && e.s === id));
  };
  const nodeIsDim = (id) => {
    if (!highlightId) return false;
    return !nodeIsLit(id);
  };

  // pointer handlers
  const onPointerDown = (e, nodeId) => {
    const pt = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - pt.left;
    const sy = e.clientY - pt.top;
    if (nodeId) {
      const n = nodes.find(n => n.id === nodeId);
      setDrag({ kind: "node", id: nodeId, startX: sx, startY: sy, origX: n.x, origY: n.y, moved: false });
      e.target.setPointerCapture?.(e.pointerId);
    } else {
      setDrag({ kind: "pan", startX: sx, startY: sy, origPanX: panX, origPanY: panY });
    }
  };
  const onPointerMove = (e) => {
    if (!drag) return;
    const pt = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - pt.left;
    const sy = e.clientY - pt.top;
    if (drag.kind === "node") {
      const dx = (sx - drag.startX) / zoom;
      const dy = (sy - drag.startY) / zoom;
      if (Math.abs(dx) + Math.abs(dy) > 1) drag.moved = true;
      setNodes(ns => ns.map(n => n.id === drag.id ? { ...n, x: drag.origX + dx, y: drag.origY + dy } : n));
    } else if (drag.kind === "pan") {
      setViewport(v => ({ ...v, panX: drag.origPanX + (sx - drag.startX), panY: drag.origPanY + (sy - drag.startY) }));
    }
  };
  const onPointerUp = (e, nodeId) => {
    if (drag?.kind === "node" && !drag.moved && nodeId) {
      setSelected(nodeId);
    } else if (drag?.kind === "pan") {
      const dx = Math.abs(e.clientX - svgRef.current.getBoundingClientRect().left - drag.startX);
      const dy = Math.abs(e.clientY - svgRef.current.getBoundingClientRect().top - drag.startY);
      if (dx + dy < 3) setSelected(null);
    }
    setDrag(null);
  };

  const onWheel = (e) => {
    e.preventDefault();
    const pt = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - pt.left;
    const sy = e.clientY - pt.top;
    const [wx, wy] = toWorld(sx, sy);
    const factor = Math.exp(-e.deltaY * 0.0015);
    const newZoom = Math.min(2.4, Math.max(0.35, zoom * factor));
    // keep cursor world position fixed
    const newPanX = sx - cx - wx * newZoom;
    const newPanY = sy - cy - wy * newZoom;
    setViewport({ zoom: newZoom, panX: newPanX, panY: newPanY });
  };

  // edge geometry
  function edgePath(e) {
    const s = nodes.find(n => n.id === e.s);
    const t = nodes.find(n => n.id === e.t);
    if (!s || !t) return null;
    const [sx, sy] = [s.x, s.y];
    const [tx, ty] = [t.x, t.y];
    if (e.curve) {
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;
      const dx = tx - sx;
      const dy = ty - sy;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nxn = -dy / len;
      const nyn = dx / len;
      const c1x = mx + nxn * e.curve;
      const c1y = my + nyn * e.curve;
      return `M ${sx} ${sy} Q ${c1x} ${c1y} ${tx} ${ty}`;
    }
    return `M ${sx} ${sy} L ${tx} ${ty}`;
  }

  // edge label position (midpoint along path)
  function edgeMid(e) {
    const s = nodes.find(n => n.id === e.s);
    const t = nodes.find(n => n.id === e.t);
    if (!s || !t) return [0, 0];
    if (e.curve) {
      const mx = (s.x + t.x) / 2;
      const my = (s.y + t.y) / 2;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      return [mx - dy / len * (e.curve / 2), my + dx / len * (e.curve / 2)];
    }
    return [(s.x + t.x) / 2, (s.y + t.y) / 2];
  }

  // arrow markers per edge kind
  const markers = {
    direct:   { color: "var(--ink-2)" },
    inferred: { color: "var(--ink-3)" },
    agent:    { color: "var(--purple)" },
    source:   { color: "var(--green)" },
  };

  return (
    <div className="canvas-wrap">
      <svg
        ref={svgRef}
        className="canvas"
        onPointerMove={onPointerMove}
        onPointerUp={e => onPointerUp(e)}
        onPointerDown={e => onPointerDown(e)}
        onWheel={onWheel}
        style={{ cursor: drag?.kind === "pan" ? "grabbing" : "grab" }}
      >
        <defs>
          <pattern id="dotgrid" x="0" y="0" width={24 * zoom} height={24 * zoom} patternUnits="userSpaceOnUse" patternTransform={`translate(${(panX + cx) % (24 * zoom)},${(panY + cy) % (24 * zoom)})`}>
            <circle cx={12 * zoom} cy={12 * zoom} r="0.7" fill="#c8c0a8" opacity="0.55" />
          </pattern>
          {Object.entries(markers).map(([k, m]) => (
            <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={m.color} />
            </marker>
          ))}
        </defs>

        <rect x="0" y="0" width={size.w} height={size.h} fill="url(#dotgrid)" />

        <g transform={`translate(${cx + panX} ${cy + panY}) scale(${zoom})`}>
          {/* edges */}
          {EDGES.map((e, i) => {
            const visEdge = isVisible(e.s) && isVisible(e.t);
            const lit = edgeIsLit(e);
            const dim = highlightId && !lit;
            const path = edgePath(e);
            if (!path) return null;
            const baseColor = markers[e.kind].color;
            return (
              <g key={i} opacity={visEdge ? (dim ? 0.18 : 1) : 0.08}>
                <path
                  d={path}
                  fill="none"
                  stroke={baseColor}
                  strokeWidth={(lit ? 1.6 : 0.9) / zoom * Math.max(zoom, 0.6)}
                  strokeDasharray={e.kind === "inferred" ? `${6/Math.max(zoom,0.6)} ${4/Math.max(zoom,0.6)}` : "none"}
                  markerEnd={`url(#arrow-${e.kind})`}
                  opacity={lit ? 1 : 0.7}
                />
              </g>
            );
          })}

          {/* edge labels — only render at decent zoom or when lit */}
          {EDGES.map((e, i) => {
            const visEdge = isVisible(e.s) && isVisible(e.t);
            if (!visEdge) return null;
            const lit = edgeIsLit(e);
            if (zoom < 0.85 && !lit) return null;
            const [mx, my] = edgeMid(e);
            return (
              <g key={"l" + i} transform={`translate(${mx} ${my})`} style={{ pointerEvents: "none" }}>
                <rect x={-e.label.length * 3.2 - 5} y="-9" width={e.label.length * 6.4 + 10} height="14" rx="3" fill="var(--bg-canvas)" opacity={lit ? 0.95 : 0.78} />
                <text textAnchor="middle" y="1.5" fontSize="9" fill={lit ? "var(--ink)" : "var(--ink-3)"} fontFamily="JetBrains Mono, monospace" fontWeight={lit ? 600 : 400} letterSpacing="0.3">
                  :{e.label}
                </text>
              </g>
            );
          })}

          {/* nodes */}
          {nodes.map(n => {
            const vis = isVisible(n.id);
            const lit = nodeIsLit(n.id);
            const dim = !vis || nodeIsDim(n.id);
            const isSel = selected === n.id;
            const isHov = hover === n.id;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x} ${n.y})`}
                style={{ cursor: drag?.kind === "node" && drag.id === n.id ? "grabbing" : "pointer" }}
                onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, n.id); }}
                onPointerUp={(e) => { e.stopPropagation(); onPointerUp(e, n.id); }}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                opacity={vis ? 1 : 0.22}
              >
                <NodeShape node={n} selected={isSel} highlighted={lit || isHov} dimmed={dim} />
                <text
                  textAnchor="middle"
                  y={n.size + 16}
                  fontSize={Math.max(11, 12 - (1 - zoom) * 2)}
                  fill={dim ? "var(--ink-4)" : "var(--ink)"}
                  fontFamily="Geist, system-ui"
                  fontWeight="500"
                  style={{ pointerEvents: "none" }}
                >
                  {n.label}
                </text>
                <text
                  textAnchor="middle"
                  y={n.size + 28}
                  fontSize="8.5"
                  letterSpacing="0.6"
                  fill="var(--ink-3)"
                  fontFamily="JetBrains Mono, monospace"
                  style={{ pointerEvents: "none" }}
                >
                  {TYPE_META[n.type].tag}
                </text>
                {n.instances !== "—" && (
                  <text
                    textAnchor="middle"
                    y={-n.size - 8}
                    fontSize="9.5"
                    fill="var(--ink-3)"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="500"
                    style={{ pointerEvents: "none" }}
                  >
                    {n.instances}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// ---------- ZOOM CONTROLS + MINIMAP ----------------------------------------

function ZoomControls({ viewport, setViewport, nodes, size }) {
  const setZoom = (factor) => setViewport(v => ({ ...v, zoom: Math.min(2.4, Math.max(0.35, v.zoom * factor)) }));
  const fit = () => setViewport({ zoom: 0.85, panX: 0, panY: 0 });
  return (
    <div className="zoomctl">
      <button onClick={() => setZoom(1.2)} title="Zoom in">+</button>
      <div className="zoomctl-v">{Math.round(viewport.zoom * 100)}%</div>
      <button onClick={() => setZoom(1 / 1.2)} title="Zoom out">−</button>
      <button onClick={fit} title="Fit"><span className="zoomctl-fit">FIT</span></button>
    </div>
  );
}

function Minimap({ nodes, viewport, size }) {
  // compute bounding box
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs) - 60, maxX = Math.max(...xs) + 60;
  const minY = Math.min(...ys) - 60, maxY = Math.max(...ys) + 60;
  const W = 132, H = 86;
  const sx = W / (maxX - minX);
  const sy = H / (maxY - minY);
  const s = Math.min(sx, sy);
  const ox = (W - (maxX - minX) * s) / 2;
  const oy = (H - (maxY - minY) * s) / 2;

  // visible viewport rectangle in world coords
  const vw = size.w / viewport.zoom;
  const vh = size.h / viewport.zoom;
  const vx0 = -viewport.panX / viewport.zoom - vw / 2;
  const vy0 = -viewport.panY / viewport.zoom - vh / 2;

  const mapX = (x) => ox + (x - minX) * s;
  const mapY = (y) => oy + (y - minY) * s;

  return (
    <div className="minimap">
      <svg width={W} height={H}>
        <rect x="0" y="0" width={W} height={H} fill="var(--bg-canvas)" />
        {EDGES.map((e, i) => {
          const a = nodes.find(n => n.id === e.s);
          const b = nodes.find(n => n.id === e.t);
          if (!a || !b) return null;
          return <line key={i} x1={mapX(a.x)} y1={mapY(a.y)} x2={mapX(b.x)} y2={mapY(b.y)} stroke="var(--line)" strokeWidth="0.5" />;
        })}
        {nodes.map(n => {
          const c = colorForNode(n);
          return <circle key={n.id} cx={mapX(n.x)} cy={mapY(n.y)} r="2" fill={c.stroke} />;
        })}
        <rect
          x={Math.max(0, mapX(vx0))}
          y={Math.max(0, mapY(vy0))}
          width={Math.min(W, vw * s)}
          height={Math.min(H, vh * s)}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.2"
        />
      </svg>
      <div className="minimap-foot">Viewport · 1:{Math.max(1, Math.round(1 / viewport.zoom * 6)) / 10 + 1}</div>
    </div>
  );
}

// ---------- BOTTOM LEGEND ---------------------------------------------------

function Legend({ filter, setFilter }) {
  return (
    <div className="legend">
      <button className={"legend-pill" + (filter === "entity" || filter === "all" ? "" : " off")} onClick={() => setFilter(filter === "entity" ? "all" : "entity")}>
        <svg width="14" height="14" viewBox="-12 -12 24 24"><circle r="8.5" fill="var(--blue-fill)" stroke="var(--blue)" strokeWidth="1.4" /></svg>
        Entities
      </button>
      <button className={"legend-pill" + (filter === "agent" || filter === "all" ? "" : " off")} onClick={() => setFilter(filter === "agent" ? "all" : "agent")}>
        <svg width="14" height="14" viewBox="-12 -12 24 24"><polygon points="-8,0 -4,-7 4,-7 8,0 4,7 -4,7" fill="var(--purple-fill)" stroke="var(--purple)" strokeWidth="1.4" /></svg>
        Agents
      </button>
      <button className={"legend-pill" + (filter === "source" || filter === "all" ? "" : " off")} onClick={() => setFilter(filter === "source" ? "all" : "source")}>
        <svg width="14" height="14" viewBox="-12 -12 24 24"><rect x="-8" y="-8" width="16" height="16" rx="1.5" fill="var(--green-fill)" stroke="var(--green)" strokeWidth="1.4" /></svg>
        Data Sources
      </button>
      <div className="legend-sep" />
      <div className="legend-kind">
        <span className="legend-line legend-line-direct" />
        Direct edge
      </div>
      <div className="legend-kind">
        <span className="legend-line legend-line-inferred" />
        Inferred edge
      </div>
    </div>
  );
}

// ---------- DETAIL VIEW DATA ------------------------------------------------

const PROPS_BY_NODE = {
  account: [
    { name: "account_id",         type: "uuid",      required: true,  indexed: true,  pii: false, pk: true,  fill: 100, conf: 100, source: "Salesforce",   computed: null },
    { name: "name",               type: "string",    required: true,  indexed: true,  pii: false, fill: 100, conf: 99, source: "Salesforce" },
    { name: "domain",             type: "string",    required: true,  indexed: true,  pii: false, fill: 96,  conf: 98, source: "Salesforce" },
    { name: "industry",           type: "enum(28)",  required: false, indexed: false, pii: false, fill: 88,  conf: 94, source: "Salesforce" },
    { name: "tier",               type: "enum",      required: true,  indexed: true,  pii: false, fill: 99,  conf: 100, source: "—", computed: "from arr (rule:tier_buckets)" },
    { name: "region",             type: "enum(6)",   required: true,  indexed: false, pii: false, fill: 97,  conf: 98, source: "Salesforce" },
    { name: "arr_usd",            type: "decimal",   required: false, indexed: false, pii: false, fill: 94,  conf: 99, source: "NetSuite ERP" },
    { name: "csm_id",             type: "fk Employee", required: false, indexed: true, pii: false, fill: 81, conf: 95, source: "Salesforce" },
    { name: "parent_account_id",  type: "fk self",   required: false, indexed: false, pii: false, fill: 31,  conf: 100, source: "Salesforce" },
    { name: "primary_contact_email", type: "string", required: false, indexed: true,  pii: true,  fill: 92,  conf: 96, source: "Salesforce" },
    { name: "billing_address",    type: "struct",    required: false, indexed: false, pii: true,  fill: 87,  conf: 91, source: "NetSuite ERP" },
    { name: "tax_id",             type: "string",    required: false, indexed: false, pii: true,  fill: 64,  conf: 94, source: "NetSuite ERP" },
    { name: "fiscal_year_end",    type: "date",      required: false, indexed: false, pii: false, fill: 78,  conf: 99, source: "NetSuite ERP" },
    { name: "is_lighthouse",      type: "bool",      required: false, indexed: false, pii: false, fill: 100, conf: 100, source: "manual" },
    { name: "risk_score",         type: "float",     required: false, indexed: true,  pii: false, fill: 100, conf: 100, source: "—", computed: "agent: cust_health" },
    { name: "churn_probability",  type: "float",     required: false, indexed: false, pii: false, fill: 100, conf: 100, source: "—", computed: "agent: rev_fore" },
    { name: "tags",               type: "string[]",  required: false, indexed: false, pii: false, fill: 73,  conf: 100, source: "manual" },
    { name: "created_at",         type: "timestamp", required: true,  indexed: true,  pii: false, fill: 100, conf: 100, source: "Salesforce" },
  ],
};

function generateProps(node) {
  if (PROPS_BY_NODE[node.id]) return PROPS_BY_NODE[node.id];
  const out = [];
  const seed = node.id.charCodeAt(0) + node.id.length;
  out.push({ name: node.id + "_id", type: "uuid", required: true, indexed: true, pii: false, pk: true, fill: 100, conf: 100, source: "primary" });
  out.push({ name: "name", type: "string", required: true, indexed: true, pii: false, fill: 99 - (seed%4), conf: 98 - (seed%5), source: "primary" });
  out.push({ name: "created_at", type: "timestamp", required: true, indexed: true, pii: false, fill: 100, conf: 100, source: "primary" });
  const extras = ["status","owner_id","type","priority","metadata","amount","external_ref","resolved_at"];
  for (let i = 0; i < Math.min(node.props - 3, extras.length); i++) {
    const e = extras[i];
    out.push({ name: e, type: i%3===0?"enum":i%3===1?"string":"timestamp", required: i<2, indexed: i%2===0, pii: e.includes("owner")||e.includes("ref"), fill: 70+((seed*i)%30), conf: 80+((seed+i)%19), source: "primary" });
  }
  return out;
}

const SOURCES_BY_NODE = {
  account: [
    { name: "Salesforce CRM",    type: "Primary",   freq: "Streaming",    last: "12s ago",  status: "healthy",  rows: "2,840",  errors: 0 },
    { name: "NetSuite ERP",      type: "Financial", freq: "Hourly",       last: "18m ago",  status: "healthy",  rows: "2,684",  errors: 0 },
    { name: "HubSpot Marketing", type: "Enrichment",freq: "Daily 02:00",  last: "6h ago",   status: "degraded", rows: "1,902",  errors: 14 },
    { name: "Manual / Admin UI", type: "Override",  freq: "On change",    last: "2d ago",   status: "healthy",  rows: "42",     errors: 0 },
  ],
};

function generateSources(node) {
  if (SOURCES_BY_NODE[node.id]) return SOURCES_BY_NODE[node.id];
  if (node.type === "agent")  return [{ name: "Computed by agent", type: "Agent", freq: "Triggered", last: "live", status: "healthy", rows: "—", errors: 0 }];
  if (node.type === "source") return [{ name: "Self (system of record)", type: "Source", freq: "Streaming", last: "live", status: "healthy", rows: "—", errors: 0 }];
  return [
    { name: "Snowflake Warehouse", type: "Primary", freq: "Streaming", last: "1m ago", status: "healthy", rows: node.instances, errors: 0 },
    { name: "Manual / Admin UI",   type: "Override",freq: "On change", last: "1d ago", status: "healthy", rows: "—",         errors: 0 },
  ];
}

const RULES_BY_NODE = {
  account: [
    { kind: "VALIDATE", id: "arr_nonneg",         label: "arr_usd ≥ 0",                          on: true,  last: "0 fails / 24h" },
    { kind: "COMPUTE",  id: "tier_buckets",       label: "tier := arr_usd → {SMB,MM,ENT}",       on: true,  last: "2,840 evaluated" },
    { kind: "COMPUTE",  id: "risk_score",         label: "risk_score from cust_health agent",   on: true,  last: "2,712 written" },
    { kind: "VALIDATE", id: "domain_format",      label: "domain matches /^[a-z0-9-.]+$/",      on: true,  last: "12 violations" },
    { kind: "ACCESS",   id: "pii_role",           label: "PII fields gated on role:acct_admin", on: true,  last: "audit logged" },
    { kind: "SLO",      id: "freshness_30m",      label: "freshness p95 < 30m",                  on: true,  last: "OK (p95 = 4m 12s)" },
    { kind: "INFER",    id: "previously_at",      label: "Person :PREVIOUSLY_AT Account",        on: true,  last: "18 inferred today" },
  ],
};

function generateRules(node) {
  if (RULES_BY_NODE[node.id]) return RULES_BY_NODE[node.id];
  return [
    { kind: "VALIDATE", id: node.id+"_id_unique", label: node.id+"_id is unique",       on: true, last: "0 fails / 24h" },
    { kind: "SLO",      id: "freshness",          label: "freshness p95 < " + node.fresh, on: true, last: node.fresh },
    { kind: "VALIDATE", id: "required_fields",    label: "required fields present",     on: true, last: (100-node.fill) + "% missing" },
  ];
}

const CONSUMERS_BY_NODE = {
  account: [
    { kind: "agent",     name: "Revenue Forecaster",    by: "fin-ops",         freq: "hourly" },
    { kind: "agent",     name: "Customer Health",       by: "cs-platform",     freq: "live"   },
    { kind: "agent",     name: "Compliance Auditor",    by: "governance",      freq: "daily"  },
    { kind: "agent",     name: "Insight Synthesizer",   by: "growth",          freq: "weekly" },
    { kind: "dashboard", name: "Exec — ARR roll-forward", by: "fin-ops",       freq: "live"   },
    { kind: "dashboard", name: "CS — Account health 360",by: "cs-platform",   freq: "live"   },
    { kind: "pipeline",  name: "warehouse.account_dim", by: "data-platform",  freq: "5min"   },
    { kind: "pipeline",  name: "billing.invoice_batch", by: "billing",        freq: "hourly" },
  ],
};

function generateConsumers(node) {
  if (CONSUMERS_BY_NODE[node.id]) return CONSUMERS_BY_NODE[node.id];
  return [
    { kind: "agent",     name: "Insight Synthesizer", by: "growth",        freq: "weekly" },
    { kind: "dashboard", name: "Schema health overview", by: "data-platform", freq: "live" },
    { kind: "pipeline",  name: "warehouse." + node.id + "_dim", by: "data-platform", freq: "5min" },
  ];
}

const ACTIVITY_BY_NODE = {
  account: [
    { when: "2h ago",   actor: "morgan.lee",      what: "added property",  detail: "churn_probability (float, computed)",  kind: "schema" },
    { when: "yesterday",actor: "schema-bot",      what: "drift detected",  detail: "industry: 4 new values seen upstream",  kind: "drift" },
    { when: "yesterday",actor: "ramin.k",         what: "approved PR #214",detail: "Rename region.code → region (breaking)",kind: "schema" },
    { when: "2d ago",   actor: "sla-monitor",     what: "SLO restored",    detail: "freshness back under 30m budget",       kind: "ops" },
    { when: "3d ago",   actor: "morgan.lee",      what: "added rule",      detail: "PII gating on billing_address, tax_id", kind: "policy" },
    { when: "5d ago",   actor: "data-platform",   what: "source linked",   detail: "HubSpot Marketing → Account",           kind: "lineage" },
  ],
};
function generateActivity(node) {
  if (ACTIVITY_BY_NODE[node.id]) return ACTIVITY_BY_NODE[node.id];
  return [
    { when: "1h ago", actor: "schema-bot", what: "fill rate dipped", detail: "completeness now " + node.fill + "%", kind: "ops" },
    { when: "2d ago", actor: "morgan.lee", what: "added property",   detail: node.id + "_meta (struct)", kind: "schema" },
    { when: "1w ago", actor: "data-platform", what: "source synced", detail: "first ingest of " + node.label, kind: "lineage" },
  ];
}

const ISSUES_BY_NODE = {
  account: [
    { sev: "warn", title: "Industry enum drift",    body: "4 unseen values in last 24h. Either widen enum or route to staging.", who: "schema-bot" },
    { sev: "warn", title: "parent_account_id sparse", body: "31% fill across 2.8K rows — confirm cardinality model is correct.", who: "morgan.lee" },
    { sev: "info", title: "Pending PR #218",         body: "Computed property forecast_arr awaiting review (rev_fore agent)",   who: "ramin.k" },
  ],
};
function generateIssues(node) {
  if (ISSUES_BY_NODE[node.id]) return ISSUES_BY_NODE[node.id];
  if (node.fill < 90) return [{ sev: "warn", title: "Fill rate below target", body: "Completeness at " + node.fill + "% — target ≥ 92%.", who: "schema-bot" }];
  return [{ sev: "info", title: "No open issues", body: "All quality gates passing in the last 24h.", who: "schema-bot" }];
}

// build 30d sparkline data (deterministic per node)
function sparklineData(node) {
  const seed = node.id.charCodeAt(0) + node.id.length * 7;
  const pts = [];
  const base = node.instancesN || 1000;
  for (let i = 0; i < 30; i++) {
    const r = Math.sin((seed + i) * 0.7) * 0.06 + Math.cos((seed * 2 + i) * 0.3) * 0.04;
    pts.push(base * (0.88 + 0.12 * (i / 29)) * (1 + r));
  }
  return pts;
}

function Sparkline({ data, width = 100, height = 28, color = "var(--ink-2)" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const path = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return (i === 0 ? "M " : "L ") + x.toFixed(1) + " " + y.toFixed(1);
  }).join(" ");
  const areaPath = path + ` L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={areaPath} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ---------- NODE DETAIL VIEW ------------------------------------------------

const CAT_META = {
  core:    { label: "CORE",    color: "var(--ink-2)" },
  support: { label: "SUPPORT", color: "var(--coral)" },
  derived: { label: "DERIVED", color: "var(--gold)" },
  source:  { label: "SOURCE",  color: "var(--green)" },
};

function metricColor(v) {
  if (v >= 92) return "var(--green)";
  if (v >= 80) return "var(--gold)";
  return "var(--coral)";
}

// ─── GLOBAL PROPERTIES VIEW ──────────────────────────────────────────────────

function GlobalPropertiesView() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ col: "name", dir: "asc" });

  // Aggregate all properties across all node types
  const allProps = useMemo(() => {
    const map = new Map();
    NODES.forEach(node => {
      const props = generateProps(node);
      props.forEach(p => {
        const key = p.name + ":" + p.type;
        if (!map.has(key)) {
          map.set(key, {
            name: p.name,
            type: p.type,
            nodes: [],
            required: 0,
            indexed: 0,
            pii: 0,
            computed: 0,
            avgFill: 0,
            avgConf: 0,
          });
        }
        const agg = map.get(key);
        agg.nodes.push({ id: node.id, label: node.label, cat: node.cat });
        if (p.required) agg.required++;
        if (p.indexed) agg.indexed++;
        if (p.pii) agg.pii++;
        if (p.computed) agg.computed++;
        agg.avgFill += p.fill;
        agg.avgConf += p.conf;
      });
    });
    return Array.from(map.values()).map(p => ({
      ...p,
      usage: p.nodes.length,
      avgFill: Math.round(p.avgFill / p.nodes.length),
      avgConf: Math.round(p.avgConf / p.nodes.length),
    }));
  }, []);

  const FILTERS = [
    { id: "all",      label: "All properties",     count: allProps.length },
    { id: "shared",   label: "Shared (>1 node)",   count: allProps.filter(p => p.usage > 1).length },
    { id: "unique",   label: "Unique (1 node)",    count: allProps.filter(p => p.usage === 1).length },
    { id: "required", label: "Required somewhere", count: allProps.filter(p => p.required > 0).length },
    { id: "pii",      label: "PII",                count: allProps.filter(p => p.pii > 0).length },
  ];

  const filtered = useMemo(() => {
    let rows = [...allProps];
    if (filter === "shared")   rows = rows.filter(p => p.usage > 1);
    if (filter === "unique")   rows = rows.filter(p => p.usage === 1);
    if (filter === "required") rows = rows.filter(p => p.required > 0);
    if (filter === "pii")      rows = rows.filter(p => p.pii > 0);
    if (search) rows = rows.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase()));
    rows.sort((a, b) => {
      let va = a[sort.col] ?? "", vb = b[sort.col] ?? "";
      if (typeof va === "number") return sort.dir === "asc" ? va - vb : vb - va;
      return sort.dir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return rows;
  }, [allProps, filter, search, sort]);

  const onSort = col => setSort(s => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));
  const sortIcon = col => sort.col === col ? (sort.dir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="nodes-view">
      <div className="nv-head">
        <div className="nv-head-left">
          <div className="nv-eyebrow">SCHEMA · PROPERTIES</div>
          <div className="nv-title">Property catalog</div>
        </div>
        <div className="nv-head-right">
          <button className="btn-ghost">Bulk export</button>
          <button className="btn-dark">+ New property</button>
        </div>
      </div>

      <div className="nv-chips-row">
        <div className="nv-chips">
          {FILTERS.map(f => (
            <button key={f.id} className={"chip" + (filter === f.id ? " on" : "")} onClick={() => setFilter(f.id)}>
              {f.label} <span className="chip-n">{f.count}</span>
            </button>
          ))}
        </div>
        <div className="nv-meta">{filtered.length} of {allProps.length} properties</div>
      </div>

      <div className="nv-table gprops-nv-table">
        <div className="nv-row gprops-nv-row nv-head-row">
          <button className="nv-th" onClick={() => onSort("name")}>Name{sortIcon("name")}</button>
          <button className="nv-th" onClick={() => onSort("type")}>Type{sortIcon("type")}</button>
          <button className="nv-th nv-th-num" onClick={() => onSort("usage")}>Usage{sortIcon("usage")}</button>
          <div className="nv-th">Used by</div>
          <button className="nv-th nv-th-bar" onClick={() => onSort("avgFill")}>Avg fill{sortIcon("avgFill")}</button>
          <button className="nv-th nv-th-bar" onClick={() => onSort("avgConf")}>Avg conf{sortIcon("avgConf")}</button>
          <div className="nv-th">Flags</div>
        </div>

        <div className="nv-body">
          {filtered.map((p, i) => (
            <div key={i} className="nv-row gprops-nv-row">
              <div className="nv-cell"><span className="snap-n">{p.name}</span></div>
              <div className="nv-cell prop-type">{p.type}</div>
              <div className="nv-cell nv-num">
                <span className={"usage-badge usage-" + (p.usage > 5 ? "high" : p.usage > 2 ? "mid" : "low")}>{p.usage}</span>
              </div>
              <div className="nv-cell gprops-nodes-cell">
                {p.nodes.slice(0, 4).map(n => <span key={n.id} className="gnode-tag-sm" title={n.label}>{n.label}</span>)}
                {p.nodes.length > 4 && <span className="gnode-tag-sm gnode-tag-more">+{p.nodes.length - 4}</span>}
              </div>
              <div className="nv-cell nv-th-bar">
                <div className="nv-bar"><div className="nv-bar-fill" style={{ width: p.avgFill + "%", background: metricColor(p.avgFill) }} /></div>
                <span className="nv-bar-v" style={{ color: metricColor(p.avgFill) }}>{p.avgFill}%</span>
              </div>
              <div className="nv-cell nv-th-bar">
                <div className="nv-bar"><div className="nv-bar-fill" style={{ width: p.avgConf + "%", background: metricColor(p.avgConf) }} /></div>
                <span className="nv-bar-v" style={{ color: metricColor(p.avgConf) }}>{p.avgConf}%</span>
              </div>
              <div className="nv-cell gprops-flags-cell">
                {p.required > 0 && <span className="snap-tag" title={`Required on ${p.required} node type(s)`}>req</span>}
                {p.indexed > 0  && <span className="snap-tag snap-idx" title={`Indexed on ${p.indexed} node type(s)`}>idx</span>}
                {p.pii > 0      && <span className="snap-tag snap-pii" title={`PII on ${p.pii} node type(s)`}>PII</span>}
                {p.computed > 0 && <span className="snap-tag snap-comp" title={`Computed on ${p.computed} node type(s)`}>fx</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
          No properties match <b>{filter !== "all" ? filter : search}</b>.
        </div>
      )}
    </div>
  );
}

// ─── GLOBAL EDGES VIEW ───────────────────────────────────────────────────────

function GlobalEdgesView() {
  const [kindFilter, setKindFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ col: "label", dir: "asc" });

  const allEdges = useMemo(() => {
    return EDGES.map((e, i) => {
      const from = NODES.find(n => n.id === e.s);
      const to = NODES.find(n => n.id === e.t);
      const seed = e.label.length + i;
      return {
        uid: e.s + ":" + e.t + ":" + e.label,
        label: e.label,
        from, to,
        kind: e.kind,
        cardinality: ["1:1","1:N","N:1","N:M"][seed % 4],
        instances: ((seed * 1287) % 142000) + 100,
        directional: !e.bidirectional,
      };
    });
  }, []);

  const KINDS = ["all", "direct", "inferred", "agent", "source"];
  const kindCounts = KINDS.reduce((acc, k) => { acc[k] = k === "all" ? allEdges.length : allEdges.filter(e => e.kind === k).length; return acc; }, {});

  const filtered = useMemo(() => {
    let rows = [...allEdges];
    if (kindFilter !== "all") rows = rows.filter(e => e.kind === kindFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(e => e.label.toLowerCase().includes(q) || e.from?.label.toLowerCase().includes(q) || e.to?.label.toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      let va = a[sort.col] ?? "", vb = b[sort.col] ?? "";
      if (sort.col === "from" || sort.col === "to") { va = a[sort.col]?.label || ""; vb = b[sort.col]?.label || ""; }
      if (typeof va === "number") return sort.dir === "asc" ? va - vb : vb - va;
      return sort.dir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return rows;
  }, [allEdges, kindFilter, search, sort]);

  const onSort = col => setSort(s => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));
  const sortIcon = col => sort.col === col ? (sort.dir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="nodes-view">
      <div className="nv-head">
        <div className="nv-head-left">
          <div className="nv-eyebrow">SCHEMA · EDGES</div>
          <div className="nv-title">Edge catalog</div>
        </div>
        <div className="nv-head-right">
          <button className="btn-ghost">Bulk export</button>
          <button className="btn-dark">+ New edge type</button>
        </div>
      </div>

      <div className="nv-chips-row">
        <div className="nv-chips">
          {KINDS.filter(k => kindCounts[k] > 0 || k === "all").map(k => (
            <button key={k} className={"chip" + (kindFilter === k ? " on" : "")} onClick={() => setKindFilter(k)}>
              {k === "all" ? "All" : k} <span className="chip-n">{kindCounts[k]}</span>
            </button>
          ))}
        </div>
        <div className="nv-meta">{filtered.length} of {allEdges.length} edge types</div>
      </div>

      <div className="nv-table gedge-nv-table">
        <div className="nv-row gedge-nv-row nv-head-row">
          <button className="nv-th" onClick={() => onSort("label")}>Edge label{sortIcon("label")}</button>
          <button className="nv-th" onClick={() => onSort("from")}>From{sortIcon("from")}</button>
          <div className="nv-th">→</div>
          <button className="nv-th" onClick={() => onSort("to")}>To{sortIcon("to")}</button>
          <button className="nv-th" onClick={() => onSort("kind")}>Kind{sortIcon("kind")}</button>
          <button className="nv-th" onClick={() => onSort("cardinality")}>Cardinality{sortIcon("cardinality")}</button>
          <button className="nv-th nv-th-num" onClick={() => onSort("instances")}>Instances{sortIcon("instances")}</button>
        </div>
        <div className="nv-body">
          {filtered.map(e => (
            <div key={e.uid} className="nv-row gedge-nv-row">
              <div className="nv-cell"><span className="edge-lbl">:{e.label}</span></div>
              <div className="nv-cell gedge-endpoint">{e.from && <ListGlyph node={e.from} size={16} />}<span>{e.from?.label}</span></div>
              <div className="nv-cell gedge-arrow">{e.directional ? "→" : "↔"}</div>
              <div className="nv-cell gedge-endpoint">{e.to && <ListGlyph node={e.to} size={16} />}<span>{e.to?.label}</span></div>
              <div className="nv-cell"><span className={"edge-kind edge-kind-" + e.kind}>{e.kind}</span></div>
              <div className="nv-cell"><span className="snap-tag">{e.cardinality}</span></div>
              <div className="nv-cell nv-num">{e.instances.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
          No edges match <b>{kindFilter !== "all" ? kindFilter : search}</b>.
        </div>
      )}
    </div>
  );
}

// ─── GLOBAL SOURCES VIEW ──────────────────────────────────────────────────────

function GlobalSourcesView() {
  const [sysFilter, setSysFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ col: "name", dir: "asc" });

  // Aggregate all sources across all nodes
  const allSources = useMemo(() => {
    const list = [];
    NODES.forEach(node => {
      const srcs = generateSources(node);
      srcs.forEach((s, i) => {
        const sys = s.name.toLowerCase().includes("salesforce") ? "Salesforce" :
                    s.name.toLowerCase().includes("netsuite")   ? "NetSuite"   :
                    s.name.toLowerCase().includes("snowflake")  ? "Snowflake"  :
                    s.name.toLowerCase().includes("hubspot")    ? "HubSpot"    : "Other";
        list.push({
          ...s,
          uid: node.id + ":" + i,
          nodeId: node.id,
          nodeLabel: node.label,
          nodeCat: node.cat,
          system: sys,
          rowsN: parseInt(s.rows?.replace(/[^0-9]/g, "") || 0),
        });
      });
    });
    return list;
  }, []);

  const healthy = allSources.filter(s => s.status === "healthy").length;
  const totalRows = allSources.reduce((sum, s) => sum + s.rowsN, 0);
  const totalErrors = allSources.reduce((sum, s) => sum + (s.errors || 0), 0);

  const SYSTEMS = ["Salesforce", "NetSuite", "Snowflake", "HubSpot", "Other"];
  const sysCounts = SYSTEMS.reduce((acc, sys) => {
    acc[sys] = allSources.filter(s => s.system === sys).length;
    return acc;
  }, {});

  const filtered = useMemo(() => {
    let rows = [...allSources];
    if (sysFilter !== "all") rows = rows.filter(s => s.system === sysFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(s => s.name.toLowerCase().includes(q) || s.nodeLabel.toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      let va = a[sort.col] ?? "", vb = b[sort.col] ?? "";
      if (typeof va === "number") return sort.dir === "asc" ? va - vb : vb - va;
      return sort.dir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return rows;
  }, [allSources, sysFilter, search, sort]);

  const onSort = col => setSort(s => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));
  const sortIcon = col => sort.col === col ? (sort.dir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="nodes-view">
      <div className="nv-head">
        <div className="nv-head-left">
          <div className="nv-eyebrow">SCHEMA · SOURCES</div>
          <div className="nv-title">Source catalog</div>
        </div>
        <div className="nv-head-right">
          <button className="btn-ghost">Bulk export</button>
          <button className="btn-dark">+ Link source</button>
        </div>
      </div>

      <div className="nv-chips-row">
        <div className="nv-chips">
          <button className={"chip" + (sysFilter === "all" ? " on" : "")} onClick={() => setSysFilter("all")}>All <span className="chip-n">{allSources.length}</span></button>
          {SYSTEMS.filter(s => sysCounts[s] > 0).map(sys => (
            <button key={sys} className={"chip" + (sysFilter === sys ? " on" : "")} onClick={() => setSysFilter(sys)}>{sys} <span className="chip-n">{sysCounts[sys]}</span></button>
          ))}
        </div>
        <div className="nv-meta">{filtered.length} of {allSources.length} pipelines · {healthy} healthy · {totalErrors} errors</div>
      </div>

      <div className="nv-table gsrc-nv-table">
        <div className="nv-row gsrc-nv-row nv-head-row">
          <button className="nv-th" onClick={() => onSort("name")}>Pipeline{sortIcon("name")}</button>
          <button className="nv-th" onClick={() => onSort("system")}>System{sortIcon("system")}</button>
          <button className="nv-th" onClick={() => onSort("nodeLabel")}>Node{sortIcon("nodeLabel")}</button>
          <button className="nv-th" onClick={() => onSort("type")}>Role{sortIcon("type")}</button>
          <button className="nv-th" onClick={() => onSort("freq")}>Frequency{sortIcon("freq")}</button>
          <button className="nv-th" onClick={() => onSort("last")}>Last sync{sortIcon("last")}</button>
          <button className="nv-th nv-th-num" onClick={() => onSort("rowsN")}>Rows{sortIcon("rowsN")}</button>
          <button className="nv-th nv-th-num" onClick={() => onSort("errors")}>Errors{sortIcon("errors")}</button>
          <button className="nv-th" onClick={() => onSort("status")}>Status{sortIcon("status")}</button>
        </div>

        <div className="nv-body">
          {filtered.map(s => (
            <div key={s.uid} className="nv-row gsrc-nv-row">
              <div className="nv-cell"><span className="snap-n">{s.name}</span></div>
              <div className="nv-cell"><span className="src-sys-tag">{s.system}</span></div>
              <div className="nv-cell"><span className="gnode-tag-sm">{s.nodeLabel}</span></div>
              <div className="nv-cell"><span className="snap-tag">{s.type}</span></div>
              <div className="nv-cell src-freq">{s.freq}</div>
              <div className="nv-cell src-freq">{s.last}</div>
              <div className="nv-cell nv-num">{s.rows}</div>
              <div className="nv-cell nv-num" style={{ color: s.errors > 0 ? "var(--coral)" : "var(--ink-3)" }}>{s.errors}</div>
              <div className="nv-cell"><span className={"src-status src-status-" + s.status}>{s.status}</span></div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
          No pipelines match <b>{sysFilter !== "all" ? sysFilter : search}</b>.
        </div>
      )}
    </div>
  );
}

// ---------- NODE DETAIL VIEW ------------------------------------------------

const DETAIL_TABS = ["Overview", "Properties", "Edges", "Sources", "Rules", "Quality", "Access", "History", "Sample"];

function NodeDetailView({ nodeId, onBack, onCanvas }) {
  const node = NODES.find(n => n.id === nodeId);
  const [tab, setTab] = useState("Overview");
  if (!node) return null;

  const c = colorForNode(node);
  const properties = generateProps(node);
  const sources    = generateSources(node);
  const rules      = generateRules(node);
  const consumers  = generateConsumers(node);
  const activity   = generateActivity(node);
  const issues     = generateIssues(node);
  const outgoing   = EDGES.filter(e => e.s === node.id);
  const incoming   = EDGES.filter(e => e.t === node.id);

  const big = (
    <svg width="44" height="44" viewBox="-22 -22 44 44">
      {node.type === "agent" ? (
        <polygon points={[0,1,2,3,4,5].map(i=>{const a=(Math.PI/3)*i-Math.PI/2;const r=16;return `${(r*Math.cos(a)).toFixed(2)},${(r*Math.sin(a)).toFixed(2)}`}).join(" ")} fill={c.fill} stroke={c.stroke} strokeWidth="1.6" />
      ) : node.type === "source" ? (
        <rect x="-15" y="-15" width="30" height="30" rx="3" fill={c.fill} stroke={c.stroke} strokeWidth="1.6" />
      ) : (
        <circle r="15" fill={c.fill} stroke={c.stroke} strokeWidth="1.6" />
      )}
    </svg>
  );

  return (
    <div className="detail-view">
      <div className="detail-head">
        <div className="detail-crumb">
          <button className="crumb-back" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Node catalog
          </button>
          <span className="crumb-sep">/</span>
          <span className="crumb-here">{node.label}</span>
          <span className="crumb-tail">
            <span className="dot-live" /> LIVE
            <span className="crumb-dot">·</span> v3.2
            <span className="crumb-dot">·</span> branch <b>main</b>
            <span className="crumb-dot">·</span> <span className="crumb-warn">4 drafts</span>
          </span>
        </div>

        <div className="detail-title-row">
          <div className="detail-title-left">
            {big}
            <div>
              <div className="detail-title-name">
                {node.label}
                <span className="nv-cat-tag" style={{ color: CAT_META[node.cat].color, marginLeft: 12 }}>{CAT_META[node.cat].label}</span>
              </div>
              <div className="detail-title-desc">{node.desc}</div>
              <div className="detail-meta-row">
                <span>Owner <b>{node.cat === "source" ? "data-platform" : node.type === "agent" ? "applied-ml" : "data-platform"}</b></span>
                <span className="detail-meta-sep">·</span>
                <span>Domain <b>{node.cat === "core" ? "customer" : node.cat === "support" ? "service" : node.cat === "derived" ? "analytics" : "ingest"}</b></span>
                <span className="detail-meta-sep">·</span>
                <span>Last edited <b>2h ago by morgan.lee</b></span>
                <span className="detail-meta-sep">·</span>
                <span>Schema rank <b>#3 of 18</b></span>
              </div>
            </div>
          </div>
          <div className="detail-title-right">
            <button className="btn-ghost" onClick={onCanvas}>View on canvas →</button>
            <button className="btn-ghost">Export</button>
            <button className="btn-ghost">Pin</button>
            <button className="btn-dark">Edit schema</button>
            <button className="btn-icon" title="More">⋯</button>
          </div>
        </div>

        <div className="detail-kpis">
          <div className="kpi">
            <div className="kpi-lbl">Instances</div>
            <div className="kpi-v">{node.instancesN ? node.instancesN.toLocaleString() : "—"}</div>
            <div className="kpi-tail">
              <Sparkline data={sparklineData(node)} width={88} height={20} color={c.stroke} />
              <span className="kpi-delta">+{(2 + (node.id.length % 5)).toFixed(1)}% / 30d</span>
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Properties</div>
            <div className="kpi-v">{node.props}</div>
            <div className="kpi-tail">{properties.filter(p=>p.required).length} required · {properties.filter(p=>p.computed).length} computed</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Edge types</div>
            <div className="kpi-v">{outgoing.length + incoming.length}</div>
            <div className="kpi-tail">{outgoing.length} out · {incoming.length} in</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Direct sources</div>
            <div className="kpi-v">{sources.length}</div>
            <div className="kpi-tail">{sources.filter(s=>s.status==="healthy").length} healthy · {sources.filter(s=>s.status!=="healthy").length} degraded</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Active rules</div>
            <div className="kpi-v">{rules.length}</div>
            <div className="kpi-tail">{rules.filter(r=>r.kind==="VALIDATE").length} validate · {rules.filter(r=>r.kind==="COMPUTE").length} compute</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">PII fields</div>
            <div className="kpi-v" style={{ color: properties.filter(p=>p.pii).length > 0 ? "var(--coral)" : "var(--ink)" }}>{properties.filter(p=>p.pii).length}</div>
            <div className="kpi-tail">role-gated · audit logged</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Last ingest</div>
            <div className="kpi-v" style={{ fontSize: 22 }}>{node.fresh}</div>
            <div className="kpi-tail">p95 within SLO</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Drift / 24h</div>
            <div className="kpi-v" style={{ color: issues.filter(i=>i.sev==="warn").length ? "var(--gold)" : "var(--ink)" }}>{issues.filter(i=>i.sev==="warn").length}</div>
            <div className="kpi-tail">{issues.filter(i=>i.sev==="warn").length ? "open" : "all clear"}</div>
          </div>
        </div>

        <div className="detail-tabs">
          {DETAIL_TABS.map(t => {
            const count = t === "Properties" ? node.props
                       : t === "Edges"      ? outgoing.length + incoming.length
                       : t === "Sources"    ? sources.length
                       : t === "Rules"      ? rules.length
                       : t === "Quality"    ? properties.filter(p=>p.fill<92||p.conf<92).length || null
                       : t === "Access"     ? properties.filter(p=>p.pii).length || null
                       : null;
            return (
              <button key={t} className={"detail-tab" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>
                {t}{count != null && <span className="detail-tab-n">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="detail-body">
        {tab === "Overview"   && <OverviewPane node={node} properties={properties} sources={sources} rules={rules} consumers={consumers} activity={activity} issues={issues} outgoing={outgoing} incoming={incoming} />}
        {tab === "Properties" && <PropertiesPane node={node} properties={properties} />}
        {tab === "Edges"      && <EdgesPane node={node} outgoing={outgoing} incoming={incoming} />}
        {tab === "Sources"    && <SourcesPane sources={sources} node={node} />}
        {tab === "Rules"      && <RulesPane rules={rules} node={node} />}
        {tab === "Quality"    && <QualityPane node={node} properties={properties} />}
        {tab === "Access"     && <AccessPane node={node} properties={properties} />}
        {tab === "History"    && <HistoryPane node={node} />}
        {tab === "Sample"     && <SamplePane node={node} properties={properties} />}
      </div>
    </div>
  );
}

function OverviewPane({ node, properties, sources, rules, consumers, activity, issues, outgoing, incoming }) {
  return (
    <div className="ov-grid">
      <div className="ov-col ov-col-main">
        <section className="card">
          <div className="card-head">About</div>
          <div className="card-body">
            <div className="about-def">{node.desc}. Acts as the canonical anchor for downstream subscription, agreement, and account-health surfaces; required for any agent that needs to reason about a customer organisation as a single object.</div>
            <div className="about-meta">
              <div><span className="meta-k">Owner team</span><span className="meta-v">{node.cat === "source" ? "data-platform" : node.type === "agent" ? "applied-ml" : "data-platform"}</span></div>
              <div><span className="meta-k">Stewards</span><span className="meta-v">morgan.lee, ramin.k, +2</span></div>
              <div><span className="meta-k">Domain</span><span className="meta-v">{node.cat === "core" ? "customer" : node.cat === "support" ? "service" : node.cat === "derived" ? "analytics" : "ingest"}</span></div>
              <div><span className="meta-k">Tags</span><div className="meta-tags">{["pii","core-entity","slo:30m","agent-input"].map(t=> <span key={t} className="meta-tag">{t}</span>)}</div></div>
              <div><span className="meta-k">Runbook</span><span className="meta-v meta-link">go/account-runbook ↗</span></div>
              <div><span className="meta-k">Slack</span><span className="meta-v meta-link">#schema-account ↗</span></div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">Lineage <span className="card-head-sub">Where this data comes from and where it goes</span></div>
          <div className="card-body">
            <LineageDiagram node={node} sources={sources} consumers={consumers} />
          </div>
        </section>

        <section className="card">
          <div className="card-head">Top edges <span className="card-head-sub">{outgoing.length + incoming.length} total · sorted by traversal volume</span></div>
          <div className="edge-table">
            <div className="edge-row edge-head">
              <div>Edge</div><div>From</div><div>To</div><div className="edge-num">Cardinality</div><div className="edge-num">Traversals / hr</div><div>Kind</div>
            </div>
            {[...outgoing, ...incoming].slice(0, 6).map((e, i) => {
              const from = NODES.find(n => n.id === e.s);
              const to   = NODES.find(n => n.id === e.t);
              if (!from || !to) return null;
              const card = ["1:1","1:N","N:1","N:M"][(e.label.length) % 4];
              const trav = (12 + (e.label.length * 187) % 9000).toLocaleString();
              return (
                <div key={i} className="edge-row">
                  <div className="edge-lbl">:{e.label}</div>
                  <div className="edge-end"><ListGlyph node={from} size={14} /> {from.label}</div>
                  <div className="edge-end"><ListGlyph node={to} size={14} /> {to.label}</div>
                  <div className="edge-num">{card}</div>
                  <div className="edge-num">{trav}</div>
                  <div><span className={"edge-kind edge-kind-" + e.kind}>{e.kind}</span></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card">
          <div className="card-head">Data quality <span className="card-head-sub">Rolling 24h · across all instances</span></div>
          <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, rowGap: 16 }}>
            <Meter label="Completeness"   v={node.fill}        tail={(100-node.fill) + "% missing"} tone={node.fill>=92?"ok":"warn"} />
            <Meter label="Conformance"    v={node.conf}        tail={"schema match"} tone={node.conf>=92?"ok":"warn"} />
            <Meter label="Freshness SLO"  v={88}               tail={"p95 = 4m 12s"} tone="warn" />
            <Meter label="Identity match" v={91-(node.id.length%6)} tail={"47 in queue"}    tone="warn" />
          </div>
        </section>

        <section className="card">
          <div className="card-head">Recent activity</div>
          <div className="card-body">
            <ul className="activity">
              {activity.map((a, i) => (
                <li key={i} className={"act act-" + a.kind}>
                  <span className="act-dot" />
                  <span className="act-when">{a.when}</span>
                  <span className="act-actor">{a.actor}</span>
                  <span className="act-what">{a.what}</span>
                  <span className="act-detail">{a.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="ov-col ov-col-side">
        <section className="card">
          <div className="card-head">Schema snapshot <span className="card-head-sub">{properties.length} props</span></div>
          <ul className="snap-list">
            {properties.slice(0, 8).map((p, i) => (
              <li key={i} className="snap-row">
                <div className="snap-name">
                  {p.pk && <span className="snap-tag snap-pk" title="Primary key">PK</span>}
                  {p.computed && <span className="snap-tag snap-comp" title="Computed">fx</span>}
                  {p.indexed && <span className="snap-tag snap-idx" title="Indexed">idx</span>}
                  {p.pii && <span className="snap-tag snap-pii" title="PII">PII</span>}
                  <span className="snap-n">{p.name}</span>
                </div>
                <div className="snap-type">{p.type}</div>
              </li>
            ))}
          </ul>
          <button className="snap-more">View all {properties.length} properties →</button>
        </section>

        <section className="card">
          <div className="card-head">SLO compliance <span className="card-head-sub">last 7d</span></div>
          <div className="card-body">
            <div className="slo-row"><span>Freshness ≤ 30m</span><span className="slo-v slo-ok">99.2%</span></div>
            <div className="slo-row"><span>Completeness ≥ 92%</span><span className="slo-v slo-ok">100%</span></div>
            <div className="slo-row"><span>Validity ≥ 99%</span><span className="slo-v slo-warn">97.8%</span></div>
            <div className="slo-row"><span>Schema diff ≤ 1/day</span><span className="slo-v slo-ok">0.1</span></div>
            <div className="slo-foot">Error budget · <b>3.4d remaining</b> in 30d window</div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">Consumers <span className="card-head-sub">downstream</span></div>
          <ul className="cons-list">
            {consumers.map((c, i) => (
              <li key={i} className="cons-row">
                <span className={"cons-kind cons-kind-" + c.kind}>{c.kind}</span>
                <div className="cons-text">
                  <div className="cons-name">{c.name}</div>
                  <div className="cons-by">{c.by} · {c.freq}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card-head">Open issues</div>
          <ul className="issue-list">
            {issues.map((iss, i) => (
              <li key={i} className={"issue issue-" + iss.sev}>
                <div className="issue-head">
                  <span className={"issue-dot issue-dot-" + iss.sev} />
                  <span className="issue-title">{iss.title}</span>
                </div>
                <div className="issue-body">{iss.body}</div>
                <div className="issue-foot">flagged by {iss.who}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function LineageDiagram({ node, sources, consumers }) {
  const c = colorForNode(node);
  return (
    <svg viewBox="0 0 720 200" className="lineage" preserveAspectRatio="xMidYMid meet">
      <text x="0"   y="14" className="lin-lane">SOURCES</text>
      <text x="220" y="14" className="lin-lane">TRANSFORMS</text>
      <text x="430" y="14" className="lin-lane">THIS NODE</text>
      <text x="555" y="14" className="lin-lane">CONSUMERS</text>

      {sources.slice(0, 4).map((s, i) => {
        const y = 50 + i * 32;
        return (
          <g key={i}>
            <rect x="0" y={y - 11} width="190" height="22" rx="3" fill="var(--green-fill)" stroke="var(--green)" strokeWidth="1" />
            <text x="8" y={y + 4} className="lin-text">{s.name}</text>
            <text x="182" y={y + 4} textAnchor="end" className="lin-text-sub">{s.freq.split(" ")[0]}</text>
            <path d={`M 190 ${y} C 215 ${y}, 225 ${y}, 250 110`} fill="none" stroke="var(--ink-3)" strokeWidth="1" opacity="0.5" />
          </g>
        );
      })}

      <rect x="250" y="80" width="140" height="60" rx="6" fill="var(--panel-2)" stroke="var(--line)" strokeWidth="1" />
      <text x="260" y="100" className="lin-text" fontWeight="600">Identity match</text>
      <text x="260" y="115" className="lin-text-sub">+ dedupe · enrich</text>
      <text x="260" y="130" className="lin-text-sub">3 stages · 12 cols</text>
      <path d="M 390 110 L 420 110" stroke="var(--ink-3)" strokeWidth="1.2" markerEnd="url(#lin-arrow)" />

      <g transform="translate(465, 110)">
        {node.type === "agent" ? (
          <polygon points={[0,1,2,3,4,5].map(i=>{const a=(Math.PI/3)*i-Math.PI/2;const r=22;return `${(r*Math.cos(a)).toFixed(2)},${(r*Math.sin(a)).toFixed(2)}`}).join(" ")} fill={c.fill} stroke={c.stroke} strokeWidth="1.6" />
        ) : node.type === "source" ? (
          <rect x="-20" y="-20" width="40" height="40" rx="3" fill={c.fill} stroke={c.stroke} strokeWidth="1.6" />
        ) : (
          <circle r="22" fill={c.fill} stroke={c.stroke} strokeWidth="1.6" />
        )}
        <text y="42" textAnchor="middle" className="lin-text" fontWeight="600">{node.label}</text>
      </g>

      {consumers.slice(0, 4).map((cn, i) => {
        const y = 50 + i * 32;
        const kindColor = cn.kind === "agent" ? "var(--purple)" : cn.kind === "dashboard" ? "var(--blue)" : "var(--green)";
        const kindFill  = cn.kind === "agent" ? "var(--purple-fill)" : cn.kind === "dashboard" ? "var(--blue-fill)" : "var(--green-fill)";
        return (
          <g key={i}>
            <path d={`M 492 110 C 520 110, 530 ${y}, 545 ${y}`} fill="none" stroke="var(--ink-3)" strokeWidth="1" opacity="0.5" />
            <rect x="545" y={y - 11} width="175" height="22" rx="3" fill={kindFill} stroke={kindColor} strokeWidth="1" />
            <text x="553" y={y + 4} className="lin-text">{cn.name}</text>
            <text x="712" y={y + 4} textAnchor="end" className="lin-text-sub">{cn.freq}</text>
          </g>
        );
      })}

      <defs>
        <marker id="lin-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" />
        </marker>
      </defs>
    </svg>
  );
}

function PropertiesPane({ node, properties }) {
  const [propFlowOpen, setPropFlowOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ col: "name", dir: "asc" });
  const [expanded, setExpanded] = useState(null);
  const AddPropertyFlow = window.AddPropertyFlow;

  const FILTERS = [
    { id: "all",      label: "All",       count: properties.length },
    { id: "required", label: "Required",  count: properties.filter(p=>p.required).length },
    { id: "indexed",  label: "Indexed",   count: properties.filter(p=>p.indexed).length },
    { id: "pii",      label: "PII",       count: properties.filter(p=>p.pii).length },
    { id: "computed", label: "Computed",  count: properties.filter(p=>p.computed).length },
  ];

  const filtered = useMemo(() => {
    let rows = [...properties];
    if (filter === "required") rows = rows.filter(p => p.required);
    if (filter === "indexed")  rows = rows.filter(p => p.indexed);
    if (filter === "pii")      rows = rows.filter(p => p.pii);
    if (filter === "computed") rows = rows.filter(p => p.computed);
    if (search) rows = rows.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.type||"").toLowerCase().includes(search.toLowerCase()));
    rows.sort((a, b) => {
      let va = a[sort.col] ?? "", vb = b[sort.col] ?? "";
      if (typeof va === "number") return sort.dir === "asc" ? va - vb : vb - va;
      return sort.dir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return rows;
  }, [properties, filter, search, sort]);

  const onSort = col => setSort(s => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));
  const sortIcon = col => sort.col === col ? (sort.dir === "asc" ? " ↑" : " ↓") : "";

  // Extra detail per property (synthesized)
  const seed = node.id.charCodeAt(0) + node.id.length;
  function propDetail(p, i) {
    const s = seed + i * 11;
    return {
      description: p.name === "account_id" ? "Primary identifier — UUID v4, auto-generated at creation time." :
                   p.computed ? "Derived value. Recomputed on every change to its inputs." :
                   p.pii ? "Contains personal data. Masked for most roles; raw only for acct_admin." :
                   `Stores the ${p.name.replace(/_/g, " ")} value for this node instance.`,
      defaultVal:  p.type === "bool" ? "false" : p.type === "int" ? "0" : p.pk ? "auto()" : "null",
      example:     p.name === "name" ? "Acme Corp" : p.name === "domain" ? "acme.com" : p.type === "timestamp" ? "2026-01-12T09:14:00Z" : p.type === "decimal" ? "48200.00" : p.type === "bool" ? "true" : `val-${(s*17)%999}`,
      retention:   p.pii ? "7 years (regulatory)" : "inherit",
      since:       `v${1 + (s%3)}.${(s*7)%10}.0`,
      addedBy:     ["morgan.lee","ramin.k","data-platform","schema-bot"][s%4],
      nulls:       p.required ? 0 : Math.floor((100 - p.fill) / 100 * (node.instancesN || 100)),
      validRule:   p.name.includes("email") ? "email format" : p.name.includes("id") ? "uuid v4" : p.type === "decimal" ? "≥ 0" : "none",
    };
  }

  return (
    <div className="props-pane">
      {/* Toolbar */}
      <div className="props-toolbar">
        <div className="props-chips">
          {FILTERS.map(f => (
            <button key={f.id} className={"chip" + (filter === f.id ? " on" : "")} onClick={() => setFilter(f.id)}>
              {f.label} <span className="chip-n">{f.count}</span>
            </button>
          ))}
        </div>
        <div className="props-toolbar-right">
          <div style={{ position: "relative" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--ink-3)",pointerEvents:"none" }}>
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input className="sample-search" placeholder="Search properties…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-ghost">Diff vs prev</button>
          <button className="btn-dark" onClick={() => setPropFlowOpen(true)}>+ Add property</button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="props-table">
          <div className="props-head">
            <button className="props-th" onClick={() => onSort("name")}>Name{sortIcon("name")}</button>
            <button className="props-th" onClick={() => onSort("type")}>Type{sortIcon("type")}</button>
            <div className="props-th">Source</div>
            <button className="props-th props-num" onClick={() => onSort("fill")}>Fill{sortIcon("fill")}</button>
            <button className="props-th props-num" onClick={() => onSort("conf")}>Conformance{sortIcon("conf")}</button>
            <div className="props-th">Flags</div>
            <div className="props-th props-th-action"></div>
          </div>

          {filtered.map((p, i) => {
            const detail = propDetail(p, i);
            const isOpen = expanded === p.name;
            return (
              <React.Fragment key={p.name}>
                <div className={"props-row" + (isOpen ? " open" : "")} onClick={() => setExpanded(isOpen ? null : p.name)}>
                  <div className="props-cell props-name-cell">
                    {p.pk && <span className="snap-tag snap-pk">PK</span>}
                    <span className="snap-n">{p.name}</span>
                  </div>
                  <div className="props-cell prop-type">{p.type}</div>
                  <div className="props-cell prop-src">{p.computed ? <span className="prop-comp">fx · {p.computed}</span> : p.source}</div>
                  <div className="props-cell props-num">
                    <div className="nv-bar"><div className="nv-bar-fill" style={{ width: p.fill + "%", background: metricColor(p.fill) }} /></div>
                    <span className="nv-bar-v" style={{ color: metricColor(p.fill) }}>{p.fill}%</span>
                  </div>
                  <div className="props-cell props-num">
                    <div className="nv-bar"><div className="nv-bar-fill" style={{ width: p.conf + "%", background: metricColor(p.conf) }} /></div>
                    <span className="nv-bar-v" style={{ color: metricColor(p.conf) }}>{p.conf}%</span>
                  </div>
                  <div className="props-cell props-flags-cell">
                    {p.required && <span className="snap-tag">req</span>}
                    {p.indexed  && <span className="snap-tag snap-idx">idx</span>}
                    {p.pii      && <span className="snap-tag snap-pii">PII</span>}
                    {p.computed && <span className="snap-tag snap-comp">fx</span>}
                  </div>
                  <div className="props-cell props-chevron">{isOpen ? "▲" : "▼"}</div>
                </div>

                {isOpen && (
                  <div className="props-expand">
                    <div className="props-expand-grid">
                      <div className="props-expand-col">
                        <div className="pe-block">
                          <div className="pe-head">Description</div>
                          <div className="pe-val pe-desc">{detail.description}</div>
                        </div>
                        <div className="pe-block">
                          <div className="pe-head">Lineage</div>
                          <div className="pe-meta">
                            <div><span className="pe-k">Source system</span><span className="pe-v">{p.source || "—"}</span></div>
                            <div><span className="pe-k">Added in</span><span className="pe-v">{detail.since} by {detail.addedBy}</span></div>
                            {p.computed && <div><span className="pe-k">Computed from</span><span className="pe-v pe-code">{p.computed}</span></div>}
                          </div>
                        </div>
                      </div>
                      <div className="props-expand-col">
                        <div className="pe-block">
                          <div className="pe-head">Values</div>
                          <div className="pe-meta">
                            <div><span className="pe-k">Default</span><span className="pe-v pe-code">{detail.defaultVal}</span></div>
                            <div><span className="pe-k">Example</span><span className="pe-v pe-code">{detail.example}</span></div>
                            <div><span className="pe-k">Null count</span><span className="pe-v" style={{ color: detail.nulls > 0 ? "var(--gold)" : "var(--ink-3)" }}>{detail.nulls.toLocaleString()} rows</span></div>
                          </div>
                        </div>
                        <div className="pe-block">
                          <div className="pe-head">Governance</div>
                          <div className="pe-meta">
                            <div><span className="pe-k">PII tier</span><span className="pe-v" style={{ color: p.pii ? "var(--coral)" : "var(--ink-3)" }}>{p.pii ? "personal" : "none"}</span></div>
                            <div><span className="pe-k">Retention</span><span className="pe-v">{detail.retention}</span></div>
                            <div><span className="pe-k">Validation</span><span className="pe-v">{detail.validRule}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pe-actions">
                      <button className="btn-ghost">Edit property</button>
                      <button className="btn-ghost">View validation history</button>
                      <button className="btn-ghost" style={{ color: "var(--coral)" }}>Deprecate…</button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            No properties match <b>{filter !== "all" ? filter : search}</b>.
          </div>
        )}
      </div>

      {propFlowOpen && AddPropertyFlow && <AddPropertyFlow node={node} onClose={() => setPropFlowOpen(false)} />}
    </div>
  );
}

function EdgesPane({ node, outgoing, incoming }) {
  const [flowOpen, setFlowOpen] = useState(false);
  const AddEdgeFlow = window.AddEdgeFlow;
  const rows = [...outgoing.map(e => ({ ...e, dir: "out" })), ...incoming.map(e => ({ ...e, dir: "in" }))];
  return (
    <div className="card">
      <div className="card-head card-head-row">
        <div>Edges <span className="card-head-sub">{outgoing.length} outgoing · {incoming.length} incoming</span></div>
        <div className="card-head-actions">
          <button className="btn-dark" onClick={() => setFlowOpen(true)}>+ Add edge type</button>
        </div>
      </div>
      <div className="edge-table edge-table-full">
        <div className="edge-row edge-head">
          <div>Edge</div><div>From</div><div>To</div><div className="edge-num">Cardinality</div><div className="edge-num">Instances</div><div>Kind</div><div>Direction</div>
        </div>
        {rows.map((e, i) => {
          const from = NODES.find(n => n.id === e.s);
          const to   = NODES.find(n => n.id === e.t);
          if (!from || !to) return null;
          const card = ["1:1","1:N","N:1","N:M"][(e.label.length) % 4];
          const inst = ((e.label.length * 1287) % 142000).toLocaleString();
          return (
            <div key={i} className="edge-row">
              <div className="edge-lbl">:{e.label}</div>
              <div className="edge-end"><ListGlyph node={from} size={14} /> {from.label}</div>
              <div className="edge-end"><ListGlyph node={to} size={14} /> {to.label}</div>
              <div className="edge-num">{card}</div>
              <div className="edge-num">{inst}</div>
              <div><span className={"edge-kind edge-kind-" + e.kind}>{e.kind}</span></div>
              <div><span className="snap-tag">{e.dir}</span></div>
            </div>
          );
        })}
      </div>
      {flowOpen && AddEdgeFlow && <AddEdgeFlow fromNode={node} onClose={() => setFlowOpen(false)} />}
    </div>
  );
}

function SourcesPane({ sources, node }) {
  const [srcFlowOpen, setSrcFlowOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const LinkSourceFlow = window.LinkSourceFlow;

  const seed = node.id.charCodeAt(0) + node.id.length;

  // Extended source data
  const srcExt = useMemo(() => sources.map((s, i) => {
    const ss = seed + i * 7;
    const runs = Array.from({ length: 5 }, (_, j) => ({
      when: ["2m ago","12m ago","22m ago","32m ago","42m ago"][j],
      dur:  `${1 + (ss+j)%4}m ${(ss*j+3)%60}s`,
      rows: (parseInt(s.rows?.replace(/[^0-9]/g,"")) || 1000) - j * Math.floor((ss*j)%200),
      ok:   j < 4 || s.status === "healthy",
    }));
    return {
      ...s,
      connector: s.name.toLowerCase().includes("salesforce") ? "salesforce" :
                 s.name.toLowerCase().includes("netsuite")   ? "netsuite"   :
                 s.name.toLowerCase().includes("snowflake")  ? "snowflake"  :
                 s.name.toLowerCase().includes("hubspot")    ? "hubspot"    : "custom",
      icon:   s.name.toLowerCase().includes("salesforce") ? { bg:"#1798c122", color:"#1798c1", ch:"S" } :
              s.name.toLowerCase().includes("netsuite")   ? { bg:"#b8923a22", color:"#b8923a", ch:"N" } :
              s.name.toLowerCase().includes("snowflake")  ? { bg:"#29b5e822", color:"#29b5e8", ch:"❄" } :
              s.name.toLowerCase().includes("hubspot")    ? { bg:"#ff7a5922", color:"#ff7a59", ch:"H" } :
                                                             { bg:"#a09e8822", color:"#a09e88", ch:"+" },
      mappedCols:   3 + (ss % 8),
      totalCols:    8 + (ss % 6),
      strategy:     ["incremental","cdc","full"][ss % 3],
      sloTarget:    "30m",
      sloActual:    `${1+(ss*3)%9}m ${(ss*7)%60}s`,
      sloOk:        s.status === "healthy",
      pkCol:        s.name.toLowerCase().includes("salesforce") ? "Id" : "id",
      joinCol:      node.id + "_id",
      runs,
    };
  }), [sources, seed]);

  const healthy = srcExt.filter(s => s.status === "healthy").length;

  return (
    <div className="sources-pane">
      {/* Summary KPIs */}
      <div className="src-kpis">
        <div className="src-kpi">
          <div className="src-kpi-k">PIPELINES</div>
          <div className="src-kpi-v">{sources.length}</div>
        </div>
        <div className="src-kpi">
          <div className="src-kpi-k">HEALTHY</div>
          <div className="src-kpi-v" style={{ color: "var(--green)" }}>{healthy}</div>
        </div>
        <div className="src-kpi">
          <div className="src-kpi-k">DEGRADED</div>
          <div className="src-kpi-v" style={{ color: sources.length - healthy > 0 ? "var(--gold)" : "var(--ink-3)" }}>{sources.length - healthy}</div>
        </div>
        <div className="src-kpi">
          <div className="src-kpi-k">LAST INGEST</div>
          <div className="src-kpi-v" style={{ fontSize: 18 }}>{node.fresh}</div>
        </div>
        <div className="src-kpi">
          <div className="src-kpi-k">TOTAL ROWS</div>
          <div className="src-kpi-v">{(node.instancesN || 0).toLocaleString()}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <button className="btn-dark" onClick={() => setSrcFlowOpen(true)}>+ Link source</button>
        </div>
      </div>

      {/* Source cards */}
      {srcExt.map((s, i) => (
        <div key={i} className={"src-card" + (expanded === i ? " open" : "")}>
          {/* Card header */}
          <div className="src-card-head" onClick={() => setExpanded(expanded === i ? null : i)}>
            <div className="src-card-left">
              <span className="src-icon" style={{ background: s.icon.bg, color: s.icon.color }}>{s.icon.ch}</span>
              <div>
                <div className="src-card-name">{s.name}</div>
                <div className="src-card-meta">
                  <span className="snap-tag">{s.type}</span>
                  <span className="src-meta-sep">·</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-3)" }}>{s.strategy}</span>
                  <span className="src-meta-sep">·</span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-3)" }}>{s.freq}</span>
                </div>
              </div>
            </div>
            <div className="src-card-stats">
              <div className="src-cs"><div className="src-cs-k">ROWS</div><div className="src-cs-v">{s.rows}</div></div>
              <div className="src-cs"><div className="src-cs-k">ERRORS</div><div className="src-cs-v" style={{ color: s.errors > 0 ? "var(--coral)" : "var(--ink-3)" }}>{s.errors}</div></div>
              <div className="src-cs"><div className="src-cs-k">LAST SYNC</div><div className="src-cs-v">{s.last}</div></div>
              <div className="src-cs"><div className="src-cs-k">COLUMNS</div><div className="src-cs-v">{s.mappedCols}/{s.totalCols}</div></div>
            </div>
            <div className="src-card-right">
              <span className={"src-status src-status-" + s.status}>{s.status}</span>
              <span className="src-chevron">{expanded === i ? "▲" : "▼"}</span>
            </div>
          </div>

          {/* Expanded detail */}
          {expanded === i && (
            <div className="src-card-detail">
              <div className="src-detail-grid">
                {/* Left: config */}
                <div className="src-detail-col">
                  <div className="pe-block">
                    <div className="pe-head">Pipeline configuration</div>
                    <div className="pe-meta">
                      <div><span className="pe-k">Load strategy</span><span className="pe-v">{s.strategy}</span></div>
                      <div><span className="pe-k">Primary key</span><span className="pe-v pe-code">{s.pkCol}</span></div>
                      <div><span className="pe-k">Join key</span><span className="pe-v pe-code">{s.joinCol}</span></div>
                      <div><span className="pe-k">Cadence</span><span className="pe-v">{s.freq}</span></div>
                      <div><span className="pe-k">On error</span><span className="pe-v">alert + continue</span></div>
                      <div><span className="pe-k">Alert channel</span><span className="pe-v pe-code">#schema-alerts</span></div>
                    </div>
                  </div>

                  <div className="pe-block">
                    <div className="pe-head">SLO compliance</div>
                    <div className="pe-meta">
                      <div><span className="pe-k">Freshness target</span><span className="pe-v">≤ {s.sloTarget}</span></div>
                      <div><span className="pe-k">p95 actual</span><span className="pe-v" style={{ color: s.sloOk ? "var(--green)" : "var(--gold)" }}>{s.sloActual}</span></div>
                      <div><span className="pe-k">7-day uptime</span><span className="pe-v" style={{ color: "var(--green)" }}>{s.sloOk ? "99.8%" : "97.2%"}</span></div>
                      <div><span className="pe-k">Error budget</span><span className="pe-v">{s.sloOk ? "3.2d remaining" : "0.6d remaining"}</span></div>
                    </div>
                  </div>
                </div>

                {/* Right: column coverage + run history */}
                <div className="src-detail-col">
                  <div className="pe-block">
                    <div className="pe-head">Column coverage · {s.mappedCols}/{s.totalCols} mapped</div>
                    <div style={{ marginBottom: 10 }}>
                      <div className="nv-bar" style={{ height: 6, maxWidth: "100%" }}>
                        <div className="nv-bar-fill" style={{ width: (s.mappedCols/s.totalCols*100) + "%", background: "var(--green)" }} />
                      </div>
                    </div>
                    <div className="col-coverage-list">
                      {[node.id+"_id","name","domain","industry","arr_usd","tier","region","csm_id"].slice(0, s.mappedCols).map((col, ci) => (
                        <div key={ci} className="col-cov-row">
                          <span className="col-cov-dot ok" />
                          <code className="col-cov-name">{col}</code>
                          <span className="col-cov-arrow">←</span>
                          <code className="col-cov-src">{["Id","Name","Website","Industry","AnnualRevenue","CustomerPriority__c","BillingCountry","OwnerId"][ci]}</code>
                        </div>
                      ))}
                      {s.totalCols - s.mappedCols > 0 && (
                        <div className="col-cov-ignored">+{s.totalCols - s.mappedCols} columns ignored</div>
                      )}
                    </div>
                  </div>

                  <div className="pe-block">
                    <div className="pe-head">Last 5 sync runs</div>
                    <div className="run-history">
                      {s.runs.map((r, ri) => (
                        <div key={ri} className="run-row">
                          <span className={"run-dot " + (r.ok ? "ok" : "fail")} />
                          <span className="run-when">{r.when}</span>
                          <span className="run-rows">{r.rows?.toLocaleString()} rows</span>
                          <span className="run-dur">{r.dur}</span>
                          <span className={"run-status " + (r.ok ? "ok" : "fail")}>{r.ok ? "success" : "failed"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="src-detail-actions">
                <button className="btn-ghost">Run now</button>
                <button className="btn-ghost">View full log</button>
                <button className="btn-ghost">Edit pipeline</button>
                <button className="btn-ghost" style={{ marginLeft: "auto", color: "var(--coral)" }}>Decommission…</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {srcFlowOpen && LinkSourceFlow && <LinkSourceFlow node={node} existingSources={sources} onClose={() => setSrcFlowOpen(false)} />}
    </div>
  );
}

function RulesPane({ rules, node }) {
  const [filter, setFilter] = useState("all");
  const LinkSourceFlow = window.LinkSourceFlow;
  const KINDS = ["all","VALIDATE","COMPUTE","SLO","ACCESS","INFER"];
  const filtered = filter === "all" ? rules : rules.filter(r => r.kind === filter);
  const counts = KINDS.reduce((acc, k) => { acc[k] = k === "all" ? rules.length : rules.filter(r=>r.kind===k).length; return acc; }, {});

  return (
    <div className="card">
      <div className="card-head card-head-row">
        <div className="rule-filter-chips">
          {KINDS.map(k => counts[k] > 0 || k === "all" ? (
            <button key={k} className={"chip" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>
              {k} <span className="chip-n">{counts[k]}</span>
            </button>
          ) : null)}
        </div>
        <div className="card-head-actions"><button className="btn-dark">+ New rule</button></div>
      </div>
      <div className="rule-list">
        {filtered.map((r, i) => (
          <div key={i} className="rule-row">
            <span className={"rule-kind rule-kind-" + r.kind.toLowerCase()}>{r.kind}</span>
            <div className="rule-text">
              <div className="rule-id">{r.id}</div>
              <div className="rule-lbl">{r.label}</div>
            </div>
            <div className="rule-result">
              <span className={"rule-result-dot " + (r.last.includes("fail") || r.last.includes("violation") ? "warn" : "ok")} />
              <span className="rule-last">{r.last}</span>
            </div>
            <button className="rule-run" title="Run now">▶</button>
            <label className="switch"><input type="checkbox" defaultChecked={r.on} /><span className="switch-track" /></label>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── QUALITY TAB ─────────────────────────────────────────────────────────────

function QualityPane({ node, properties }) {
  const seed = node.id.charCodeAt(0) + node.id.length;

  // 30-day sparkline data per dimension
  function spark(base, variance, seed2) {
    return Array.from({ length: 30 }, (_, i) => {
      const r = Math.sin((seed2 + i) * 0.7) * variance + Math.cos((seed2 * 2 + i) * 0.3) * (variance * 0.5);
      return Math.max(0, Math.min(100, base + r));
    });
  }

  const dims = [
    { id: "completeness", label: "Completeness",    value: node.fill, target: 92, data: spark(node.fill, 3, seed),     unit: "%" },
    { id: "conformance",  label: "Conformance",     value: node.conf, target: 95, data: spark(node.conf, 2, seed+7),   unit: "%" },
    { id: "freshness",    label: "Freshness (p95)", value: 88,        target: 85, data: spark(88, 6, seed+13),          unit: "%" },
    { id: "uniqueness",   label: "Uniqueness",       value: 100 - (seed % 3), target: 99, data: spark(99, 1, seed+21), unit: "%" },
    { id: "validity",     label: "Validity",         value: 91 + (seed%7), target: 95, data: spark(92, 4, seed+17),    unit: "%" },
    { id: "identity",     label: "Identity match",  value: 91 - (seed%6), target: 90, data: spark(89, 5, seed+29),     unit: "%" },
  ];

  const [selDim, setSelDim] = useState("completeness");
  const dim = dims.find(d => d.id === selDim);

  function MiniSparkline({ data, color, w=120, h=32 }) {
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const area = pts + ` ${w},${h} 0,${h}`;
    return (
      <svg width={w} height={h} style={{ display: "block" }}>
        <polygon points={area} fill={color} opacity="0.12" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  }

  function BigSparkline({ data, color, w=640, h=80 }) {
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const area = pts + ` ${w},${h} 0,${h}`;
    const target = h - ((dim.target - min) / range) * (h - 8) - 4;
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <polygon points={area} fill={color} opacity="0.1" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <line x1="0" y1={target} x2={w} y2={target} stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <text x="4" y={target - 4} fontSize="9" fill={color} fontFamily="JetBrains Mono, monospace">target {dim.target}%</text>
      </svg>
    );
  }

  const tc = (v, t) => v >= t ? "var(--green)" : v >= t - 5 ? "var(--gold)" : "var(--coral)";

  return (
    <div className="quality-pane">
      {/* KPI cards */}
      <div className="quality-kpis">
        {dims.map(d => (
          <button key={d.id} className={"qkpi" + (selDim === d.id ? " on" : "")} onClick={() => setSelDim(d.id)}>
            <div className="qkpi-top">
              <span className="qkpi-label">{d.label}</span>
              <span className="qkpi-v" style={{ color: tc(d.value, d.target) }}>{d.value}%</span>
            </div>
            <MiniSparkline data={d.data} color={tc(d.value, d.target)} />
            <div className="qkpi-target">target {d.target}%</div>
          </button>
        ))}
      </div>

      {/* Selected dimension detail */}
      <div className="card quality-detail">
        <div className="card-head card-head-row">
          <div>{dim.label} <span className="card-head-sub">30-day trend · rolling 24h window</span></div>
          <div className="card-head-actions">
            <select className="input input-select input-sm" defaultValue="30d" style={{ width: 90 }}>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
            </select>
          </div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <BigSparkline data={dim.data} color={tc(dim.value, dim.target)} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: "JetBrains Mono", fontSize: 10.5, color: "var(--ink-3)" }}>
            <span>30 days ago</span><span>today</span>
          </div>
        </div>
      </div>

      {/* Per-property breakdown */}
      <div className="card">
        <div className="card-head card-head-row">
          <div>Per-property breakdown <span className="card-head-sub">for {dim.label.toLowerCase()}</span></div>
          <div className="card-head-actions">
            <button className="btn-ghost">Export CSV</button>
          </div>
        </div>
        <div className="qprop-table">
          <div className="qprop-head">
            <div>Property</div><div>Type</div><div className="qprop-num">Fill %</div><div className="qprop-num">Conformance %</div><div className="qprop-num">Nulls</div><div className="qprop-num">Violations</div><div>Status</div>
          </div>
          {properties.map((p, i) => {
            const pseed = (seed + i * 7) % 17;
            const fill = Math.min(100, p.fill + (i % 3 === 0 ? -8 : i % 5 === 0 ? -15 : 0));
            const conf = Math.min(100, p.conf + (i % 4 === 0 ? -6 : 0));
            const nulls = Math.floor((100 - fill) / 100 * (node.instancesN || 100));
            const viols = i % 7 === 0 ? Math.floor(pseed * 4) : 0;
            const ok = fill >= 90 && conf >= 92 && viols === 0;
            return (
              <div key={i} className="qprop-row">
                <div className="qprop-name"><span className="snap-n">{p.name}</span>{p.pii && <span className="snap-tag snap-pii">PII</span>}</div>
                <div className="prop-type">{p.type}</div>
                <div className="qprop-num">
                  <div className="nv-bar"><div className="nv-bar-fill" style={{ width: fill + "%", background: metricColor(fill) }} /></div>
                  <span className="nv-bar-v" style={{ color: metricColor(fill) }}>{fill}%</span>
                </div>
                <div className="qprop-num">
                  <div className="nv-bar"><div className="nv-bar-fill" style={{ width: conf + "%", background: metricColor(conf) }} /></div>
                  <span className="nv-bar-v" style={{ color: metricColor(conf) }}>{conf}%</span>
                </div>
                <div className="qprop-num" style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: nulls > 0 ? "var(--gold)" : "var(--ink-3)" }}>{nulls.toLocaleString()}</div>
                <div className="qprop-num" style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: viols > 0 ? "var(--coral)" : "var(--ink-3)" }}>{viols}</div>
                <div><span className={"qstatus qstatus-" + (ok ? "ok" : viols > 0 ? "fail" : "warn")}>{ok ? "passing" : viols > 0 ? "failing" : "warning"}</span></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ACCESS TAB ──────────────────────────────────────────────────────────────

function AccessPane({ node, properties }) {
  const ROLE_DEFS = [
    { id: "read_all",      label: "read_all",      members: 342, read: true,  write: false, pii: false, admin: false },
    { id: "acct_admin",    label: "acct_admin",    members: 12,  read: true,  write: true,  pii: true,  admin: false },
    { id: "data_platform", label: "data_platform", members: 8,   read: true,  write: true,  pii: true,  admin: true  },
    { id: "governance",    label: "governance",    members: 4,   read: true,  write: false, pii: true,  admin: true  },
    { id: "fin_ops",       label: "fin_ops",       members: 24,  read: true,  write: false, pii: false, admin: false },
    { id: "cs_platform",   label: "cs_platform",   members: 31,  read: true,  write: false, pii: false, admin: false },
  ];

  const piiProps = properties.filter(p => p.pii);
  const MASKING = { read_all: "redact", acct_admin: "partial", data_platform: "none", governance: "none", fin_ops: "redact", cs_platform: "redact" };

  const seed = node.id.charCodeAt(0) + node.id.length;
  const AUDIT = [
    { when: "2m ago",   who: "svc-revenue-forecaster", action: "READ",  props: "account_id, tier, arr_usd",  result: "200 · 2,840 rows" },
    { when: "4m ago",   who: "morgan.lee@co",           action: "READ",  props: "all",                         result: "200 · 1 row" },
    { when: "11m ago",  who: "svc-cust-health",         action: "READ",  props: "account_id, risk_score",      result: "200 · 2,712 rows" },
    { when: "18m ago",  who: "ramin.k@co",              action: "WRITE", props: "tier (computed)",             result: "200 · 2,840 written" },
    { when: "42m ago",  who: "svc-insight-syn",         action: "READ",  props: "account_id, name, domain",   result: "200 · 142 rows" },
    { when: "1h ago",   who: "svc-compliance-aud",      action: "READ",  props: "all",                         result: "200 · 2,840 rows" },
    { when: "2h ago",   who: "admin-pipeline",          action: "WRITE", props: "arr_usd, fiscal_year_end",   result: "200 · 2,684 written" },
    { when: "3h ago",   who: "morgan.lee@co",           action: "SCHEMA","props": "added churn_probability",  result: "201 · schema updated" },
  ];

  return (
    <div className="access-pane">
      {/* Role access matrix */}
      <div className="card">
        <div className="card-head card-head-row">
          <div>Role access matrix <span className="card-head-sub">{ROLE_DEFS.length} roles · {ROLE_DEFS.reduce((s,r)=>s+r.members,0)} members</span></div>
          <div className="card-head-actions"><button className="btn-dark">+ Grant role</button></div>
        </div>
        <div className="access-table">
          <div className="access-head">
            <div>Role</div><div className="acc-num">Members</div><div className="acc-flag">Read</div><div className="acc-flag">Write</div><div className="acc-flag">PII</div><div className="acc-flag">Admin</div><div>PII masking</div>
          </div>
          {ROLE_DEFS.map((r, i) => (
            <div key={i} className="access-row">
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "var(--ink)" }}>{r.label}</div>
              <div className="acc-num" style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "var(--ink-3)" }}>{r.members}</div>
              <div className="acc-flag"><span className={"acc-tick " + (r.read ? "on" : "")}>{r.read ? "✓" : "—"}</span></div>
              <div className="acc-flag"><span className={"acc-tick " + (r.write ? "on" : "")}>{r.write ? "✓" : "—"}</span></div>
              <div className="acc-flag"><span className={"acc-tick " + (r.pii ? "on" : "")}>{r.pii ? "✓" : "—"}</span></div>
              <div className="acc-flag"><span className={"acc-tick " + (r.admin ? "on" : "")}>{r.admin ? "✓" : "—"}</span></div>
              <div><span className="acc-mask">{MASKING[r.id] || "redact"}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* PII field masking */}
      {piiProps.length > 0 && (
        <div className="card">
          <div className="card-head">PII field masking <span className="card-head-sub">{piiProps.length} PII fields · GDPR-classified</span></div>
          <div className="pii-matrix">
            <div className="pii-matrix-head">
              <div>Field</div>
              {ROLE_DEFS.map(r => <div key={r.id} className="pii-cell">{r.label}</div>)}
            </div>
            {piiProps.map((p, i) => (
              <div key={i} className="pii-matrix-row">
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 12 }}>{p.name}</div>
                {ROLE_DEFS.map(r => (
                  <div key={r.id} className="pii-cell">
                    <span className={"pii-mask pii-mask-" + (r.pii ? "none" : MASKING[r.id] || "redact")}>
                      {r.pii ? "raw" : MASKING[r.id] || "redact"}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit log */}
      <div className="card">
        <div className="card-head card-head-row">
          <div>Access audit log <span className="card-head-sub">last 24h · {AUDIT.length} events shown</span></div>
          <div className="card-head-actions">
            <button className="btn-ghost">Export</button>
            <button className="btn-ghost">Full audit trail →</button>
          </div>
        </div>
        <div className="audit-table">
          <div className="audit-head">
            <div>When</div><div>Principal</div><div>Action</div><div>Properties</div><div>Result</div>
          </div>
          {AUDIT.map((a, i) => (
            <div key={i} className="audit-row">
              <div className="audit-when">{a.when}</div>
              <div className="audit-who">{a.who}</div>
              <div><span className={"audit-action audit-action-" + a.action.toLowerCase()}>{a.action}</span></div>
              <div className="audit-props">{a.props}</div>
              <div className="audit-result">{a.result}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY TAB ─────────────────────────────────────────────────────────────

function HistoryPane({ node }) {
  const [expanded, setExpanded] = useState(null);

  const HISTORY = [
    { version: "v3.2", when: "2h ago",   author: "morgan.lee",   kind: "property_add",    summary: "Added churn_probability (float, computed from rev_fore)", breaking: false,
      diff: `+ churn_probability: float  // computed: agent:rev_fore\n+ CREATE INDEX ON :${node.label.replace(/\s/g,"")}(churn_probability);` },
    { version: "v3.1", when: "yesterday",author: "schema-bot",   kind: "rule_add",         summary: "Added drift detection rule for industry enum", breaking: false,
      diff: `+ RULE industry_enum_drift\n+   VALIDATE industry IN ENUM(28)\n+   ON UNKNOWN: quarantine\n+   NOTIFY: #schema-alerts` },
    { version: "v3.0", when: "2d ago",   author: "ramin.k",      kind: "property_rename",  summary: "Renamed region.code → region (breaking)", breaking: true,
      diff: `- region_code: string\n+ region: enum(6)  // was: string\n! BREAKING — 3 downstream queries affected` },
    { version: "v2.9", when: "5d ago",   author: "data-platform",kind: "source_link",      summary: "Linked HubSpot Marketing as enrichment source", breaking: false,
      diff: `+ SOURCE hubspot_marketing\n+   TYPE: enrichment\n+   CADENCE: daily\n+   COLUMNS: industry, company_size → account` },
    { version: "v2.8", when: "1w ago",   author: "morgan.lee",   kind: "rule_add",         summary: "Added PII access gate on billing_address, tax_id", breaking: false,
      diff: `+ RULE pii_access_gate\n+   ACCESS ROLES (acct_admin, data_platform)\n+   ON: billing_address, tax_id\n+   MASKING: redact for all others` },
    { version: "v2.7", when: "2w ago",   author: "data-platform",kind: "property_add",     summary: "Added risk_score (float, computed from cust_health agent)", breaking: false,
      diff: `+ risk_score: float  // computed: agent:cust_health\n+ CREATE INDEX ON :${node.label.replace(/\s/g,"")}(risk_score);` },
    { version: "v2.6", when: "3w ago",   author: "ramin.k",      kind: "slo_change",       summary: "Freshness SLO tightened from 1h → 30m", breaking: false,
      diff: `- SET FRESHNESS_SLO = "1h";\n+ SET FRESHNESS_SLO = "30m";` },
    { version: "v2.0", when: "3mo ago",  author: "data-platform",kind: "initial",           summary: "Node type created", breaking: false,
      diff: `+ CREATE NODE TYPE :${node.label.replace(/\s/g,"")}\n+   KIND ENTITY\n+   PRIMARY KEY (account_id: UUID AUTO);` },
  ];

  const kindColor = { property_add: "var(--blue)", property_rename: "var(--coral)", rule_add: "var(--purple)", source_link: "var(--green)", slo_change: "var(--gold)", initial: "var(--ink-3)" };
  const kindLabel = { property_add: "PROP", property_rename: "RENAME", rule_add: "RULE", source_link: "SOURCE", slo_change: "SLO", initial: "INIT" };

  return (
    <div className="history-pane">
      <div className="card">
        <div className="card-head card-head-row">
          <div>Schema history <span className="card-head-sub">v1.0 → v3.2 · {HISTORY.length} changes · main branch</span></div>
          <div className="card-head-actions">
            <button className="btn-ghost">Compare branches</button>
            <button className="btn-ghost">Export changelog</button>
          </div>
        </div>
        <div className="history-list">
          {HISTORY.map((h, i) => (
            <div key={i} className={"history-item" + (h.breaking ? " breaking" : "")}>
              <div className="hist-ver-col">
                <code className="hist-ver">{h.version}</code>
                {i < HISTORY.length - 1 && <div className="hist-line" />}
              </div>
              <div className="hist-body">
                <div className="hist-head" onClick={() => setExpanded(expanded === i ? null : i)}>
                  <span className="hist-dot" style={{ background: kindColor[h.kind] || "var(--ink-3)" }} />
                  <span className="hist-kind" style={{ color: kindColor[h.kind] }}>{kindLabel[h.kind]}</span>
                  <span className="hist-summary">{h.summary}</span>
                  {h.breaking && <span className="hist-breaking">BREAKING</span>}
                  <span className="hist-meta">{h.when} · {h.author}</span>
                  <span className="hist-chevron">{expanded === i ? "▲" : "▼"}</span>
                </div>
                {expanded === i && (
                  <div className="hist-diff">
                    <pre className="hist-diff-pre">{h.diff}</pre>
                    {h.breaking && (
                      <div className="hist-rollback-warn">
                        ⚠ Breaking change — rolling back requires re-deploying downstream consumers.
                      </div>
                    )}
                    <div className="hist-actions">
                      <button className="btn-ghost">View full diff</button>
                      <button className="btn-ghost">Rollback to {h.version}</button>
                      <button className="btn-ghost">Copy migration</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SAMPLE TAB ──────────────────────────────────────────────────────────────

function SamplePane({ node, properties }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  // Generate deterministic sample rows
  const seed = node.id.charCodeAt(0) + node.id.length;
  function fakeVal(prop, rowIdx) {
    const s = seed + rowIdx * 13 + prop.name.charCodeAt(0);
    if (prop.name === "account_id" || prop.name.endsWith("_id")) return `${node.id.slice(0,3).toUpperCase()}-${(1000 + (s * 7) % 9000).toString()}`;
    if (prop.name === "name") {
      const names = ["Acme Corp","Pinnacle Systems","Vertex Solutions","Quantum Dynamics","Apex Global","Summit Partners","Horizon Tech","Meridian Labs","Cascade Analytics","Orion Ventures"];
      return names[(s * 3) % names.length];
    }
    if (prop.name === "domain") {
      const domains = ["acme.com","pinnacle.io","vertexsol.com","quantumd.ai","apexglobal.co","summitpartners.com","horizontech.io","meridianlabs.com","cascadeanalytics.io","orionventures.com"];
      return domains[(s * 3) % domains.length];
    }
    if (prop.type === "bool")      return (s % 3 === 0) ? "true" : "false";
    if (prop.type === "timestamp") return `2026-${String(1 + (s%12)).padStart(2,"0")}-${String(1+(s*7)%28).padStart(2,"0")}T${String((s*3)%24).padStart(2,"0")}:${String((s*7)%60).padStart(2,"0")}:00Z`;
    if (prop.type === "date")      return `2026-${String(1+(s%12)).padStart(2,"0")}-${String(1+(s*7)%28).padStart(2,"0")}`;
    if (prop.type === "decimal" || prop.type === "float") return ((s * 137) % 100000 / 100).toFixed(2);
    if (prop.type === "int")       return String((s * 41) % 10000);
    if (prop.type === "enum")      return ["SMB","MM","ENT","Strategic"][(s * 3) % 4];
    if (prop.name === "region")    return ["NA","EMEA","APAC","LATAM"][(s * 5) % 4];
    if (prop.pii)                  return "[ redacted ]";
    return `val-${String((s * 17) % 999).padStart(3,"0")}`;
  }

  // Show top 6 props (skip computed/long struct)
  const visibleProps = [
    { name: node.id + "_id", type: "uuid", pk: true, pii: false },
    ...properties.slice(0, 6).filter(p => p.type !== "struct" && p.type !== "json"),
  ].slice(0, 7);

  const totalRows = Math.min(node.instancesN || 100, 50);
  const rows = Array.from({ length: totalRows }, (_, i) => i);
  const filtered = rows.filter(r => {
    if (!search) return true;
    return visibleProps.some(p => String(fakeVal(p, r)).toLowerCase().includes(search.toLowerCase()));
  });
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="sample-pane">
      <div className="card">
        <div className="card-head card-head-row">
          <div>
            Sample instances <span className="card-head-sub">{filtered.length} of {(node.instancesN || totalRows).toLocaleString()} · read-only snapshot</span>
          </div>
          <div className="card-head-actions">
            <div className="sample-search-wrap">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--ink-3)" }}>
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input className="sample-search" placeholder="Filter rows…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
            </div>
            <button className="btn-ghost">Download CSV</button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="sample-table">
            <thead>
              <tr>
                <th className="sample-th">#</th>
                {visibleProps.map((p, i) => (
                  <th key={i} className="sample-th">
                    <div className="sample-th-inner">
                      {p.pk && <span className="snap-tag snap-pk" style={{ marginRight: 4 }}>PK</span>}
                      {p.name}
                      <span className="sample-type">{p.type}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((rowIdx) => (
                <tr key={rowIdx} className="sample-tr">
                  <td className="sample-td sample-row-n">{page * PAGE_SIZE + pageRows.indexOf(rowIdx) + 1}</td>
                  {visibleProps.map((p, ci) => {
                    const val = fakeVal(p, rowIdx);
                    return (
                      <td key={ci} className={"sample-td" + (p.pii ? " sample-pii" : "")}>
                        <code className="sample-val">{val}</code>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sample-foot">
          <div className="sample-foot-info">
            <span>Showing rows {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <span style={{ color: "var(--ink-4)" }}>· PII fields are masked · snapshot from 2 min ago</span>
          </div>
          <div className="sample-pages">
            <button className="btn-ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Prev</button>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "var(--ink-3)" }}>{page + 1} / {totalPages}</span>
            <button className="btn-ghost" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NodesView({ onSelect, onSwitchToCanvas }) {
  const [catFilter, setCatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("instances");
  const [sortDir, setSortDir] = useState("desc");

  const counts = useMemo(() => ({
    all: NODES.length,
    core: NODES.filter(n => n.cat === "core").length,
    support: NODES.filter(n => n.cat === "support").length,
    derived: NODES.filter(n => n.cat === "derived").length,
    source: NODES.filter(n => n.cat === "source").length,
  }), []);

  const rows = useMemo(() => {
    const filtered = NODES.filter(n => catFilter === "all" || n.cat === catFilter);
    const sorters = {
      label: (a, b) => a.label.localeCompare(b.label),
      category: (a, b) => a.cat.localeCompare(b.cat),
      instances: (a, b) => a.instancesN - b.instancesN,
      props: (a, b) => a.props - b.props,
      edges: (a, b) => a.edges - b.edges,
      fill: (a, b) => a.fill - b.fill,
      conf: (a, b) => a.conf - b.conf,
      pii: (a, b) => a.pii - b.pii,
    };
    const sorted = [...filtered].sort(sorters[sortBy] || sorters.instances);
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [catFilter, sortBy, sortDir]);

  const totalInstances = NODES.reduce((s, n) => s + n.instancesN, 0);

  const onSort = (k) => {
    if (sortBy === k) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(k); setSortDir("desc"); }
  };

  const sortIcon = (k) => sortBy === k ? (sortDir === "desc" ? " ↓" : " ↑") : "";

  return (
    <div className="nodes-view">
      <div className="nv-head">
        <div className="nv-head-left">
          <div className="nv-eyebrow">SCHEMA · NODE TYPES</div>
          <div className="nv-title">Node catalog</div>
        </div>
        <div className="nv-head-right">
          <button className="btn-ghost">Bulk export</button>
          <button className="btn-ghost" onClick={onSwitchToCanvas}>Switch to canvas →</button>
          <button className="btn-dark">+ New node type</button>
        </div>
      </div>

      <div className="nv-chips-row">
        <div className="nv-chips">
          <button className={"chip" + (catFilter === "all" ? " on" : "")} onClick={() => setCatFilter("all")}>All <span className="chip-n">{counts.all}</span></button>
          <button className={"chip" + (catFilter === "core" ? " on" : "")} onClick={() => setCatFilter("core")}>core <span className="chip-n">{counts.core}</span></button>
          <button className={"chip" + (catFilter === "support" ? " on" : "")} onClick={() => setCatFilter("support")}>support <span className="chip-n">{counts.support}</span></button>
          <button className={"chip" + (catFilter === "derived" ? " on" : "")} onClick={() => setCatFilter("derived")}>derived <span className="chip-n">{counts.derived}</span></button>
          <button className={"chip" + (catFilter === "source" ? " on" : "")} onClick={() => setCatFilter("source")}>source <span className="chip-n">{counts.source}</span></button>
        </div>
        <div className="nv-meta">{rows.length} of {NODES.length} types · {totalInstances.toLocaleString()} instances</div>
      </div>

      <div className="nv-table">
        <div className="nv-row nv-head-row">
          <button className="nv-th nv-th-name"     onClick={() => onSort("label")}>Node type{sortIcon("label")}</button>
          <button className="nv-th nv-th-cat"      onClick={() => onSort("category")}>Category{sortIcon("category")}</button>
          <button className="nv-th nv-th-num"      onClick={() => onSort("instances")}>Instances{sortIcon("instances")}</button>
          <button className="nv-th nv-th-num"      onClick={() => onSort("props")}>Props{sortIcon("props")}</button>
          <button className="nv-th nv-th-num"      onClick={() => onSort("edges")}>Edges{sortIcon("edges")}</button>
          <button className="nv-th nv-th-bar"      onClick={() => onSort("fill")}>Fill rate{sortIcon("fill")}</button>
          <button className="nv-th nv-th-bar"      onClick={() => onSort("conf")}>Conformance{sortIcon("conf")}</button>
          <div    className="nv-th nv-th-freshness">Freshness</div>
          <button className="nv-th nv-th-pii"      onClick={() => onSort("pii")}>PII{sortIcon("pii")}</button>
          <div    className="nv-th nv-th-change">Change</div>
        </div>

        <div className="nv-body">
          {rows.map(n => (
            <button key={n.id} className="nv-row" onClick={() => onSelect(n.id)}>
              <div className="nv-cell nv-th-name">
                <ListGlyph node={n} size={20} />
                <span className="nv-name">{n.label}</span>
              </div>
              <div className="nv-cell nv-th-cat">
                <span className="nv-cat-tag" style={{ color: CAT_META[n.cat].color }}>{CAT_META[n.cat].label}</span>
              </div>
              <div className="nv-cell nv-th-num nv-num">{n.instancesN ? n.instancesN.toLocaleString() : "—"}</div>
              <div className="nv-cell nv-th-num nv-num">{n.props}</div>
              <div className="nv-cell nv-th-num nv-num">{n.edges}</div>
              <div className="nv-cell nv-th-bar">
                <div className="nv-bar"><div className="nv-bar-fill" style={{ width: n.fill + "%", background: metricColor(n.fill) }} /></div>
                <span className="nv-bar-v" style={{ color: metricColor(n.fill) }}>{n.fill}%</span>
              </div>
              <div className="nv-cell nv-th-bar">
                <div className="nv-bar"><div className="nv-bar-fill" style={{ width: n.conf + "%", background: metricColor(n.conf) }} /></div>
                <span className="nv-bar-v" style={{ color: metricColor(n.conf) }}>{n.conf}%</span>
              </div>
              <div className="nv-cell nv-th-freshness nv-num">{n.fresh}</div>
              <div className="nv-cell nv-th-pii nv-num" style={{ color: n.pii > 0 ? "var(--coral)" : "var(--ink-3)" }}>{n.pii}</div>
              <div className="nv-cell nv-th-change">
                <span className={"nv-change nv-change-" + n.change.toLowerCase()}>{n.change}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- ROOT ------------------------------------------------------------

function App() {
  const [tab, setTab] = useState("Graph");
  const [detailId, setDetailId] = useState(null);
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("account");
  const [hover, setHover] = useState(null);
  const [savedView, setSavedView] = useState("Full schema");
  const [viewport, setViewport] = useState({ zoom: 0.95, panX: 0, panY: 0 });
  const [nodes, setNodes] = useState(NODES);
  const canvasSize = useRef({ w: 1000, h: 700 });

  const selectedNode = nodes.find(n => n.id === selected);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
      if ((e.metaKey || e.ctrlKey) && e.key === "f") { e.preventDefault(); document.querySelector(".sb-search input")?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app">
      <Header tab={tab} onTab={(t) => { setTab(t); setDetailId(null); }} onAddNode={() => setAddNodeOpen(true)} />
      {detailId ? (
        <NodeDetailView
          nodeId={detailId}
          onBack={() => setDetailId(null)}
          onCanvas={() => { setSelected(detailId); setTab("Graph"); setDetailId(null); }}
        />
      ) : tab === "Nodes" ? (
        <NodesView
          onSelect={(id) => { setDetailId(id); }}
          onSwitchToCanvas={() => setTab("Graph")}
        />
      ) : tab === "Edges" ? (
        <GlobalEdgesView />
      ) : tab === "Sources" ? (
        <GlobalSourcesView />
      ) : tab !== "Graph" ? (
        <div className="placeholder-view">
          <div className="ph-eyebrow">SCHEMA · {tab.toUpperCase()}</div>
          <div className="ph-title">{tab}</div>
          <div className="ph-desc">This view is under construction. Switch to <button className="ph-link" onClick={() => setTab("Graph")}>Graph</button> or <button className="ph-link" onClick={() => setTab("Nodes")}>Nodes</button>.</div>
        </div>
      ) : (
      <div className="body">
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
          filter={filter} setFilter={setFilter}
          query={query} setQuery={setQuery}
          selected={selected} onSelect={(id) => { setSelected(id); }}
          hover={hover} setHover={setHover}
          savedView={savedView} setSavedView={setSavedView}
        />
        <main className="main">
          <div className="canvas-toolbar">
            <div className="ctb-left">
              <span className="ctb-chip">SELECTION</span>
              <span className="ctb-val">{selectedNode ? selectedNode.label : "—"}</span>
              <span className="ctb-tag">{selectedNode ? TYPE_META[selectedNode.type].tag.toLowerCase() : "none"}</span>
              <span className="ctb-sep">|</span>
              <span className="ctb-chip">LAYOUT</span>
              <span className="ctb-val">force</span>
              <span className="ctb-sep">|</span>
              <span className="ctb-chip">VIEW</span>
              <span className="ctb-val">{savedView}</span>
            </div>
            <div className="ctb-right">
              <label className="ctb-toggle"><input type="checkbox" defaultChecked /> <span>Inferred</span></label>
              <label className="ctb-toggle"><input type="checkbox" defaultChecked /> <span>Edge labels</span></label>
              <label className="ctb-toggle"><input type="checkbox" defaultChecked /> <span>Counts</span></label>
            </div>
          </div>
          <Canvas
            nodes={nodes} setNodes={setNodes}
            selected={selected} setSelected={setSelected}
            hover={hover} setHover={setHover}
            filter={filter} query={query} savedView={savedView}
            viewport={viewport} setViewport={setViewport}
            sidebarOpen={sidebarOpen}
          />
          <Legend filter={filter} setFilter={setFilter} />
          <div className="bottomright">
            <Minimap nodes={nodes} viewport={viewport} size={{ w: 1100, h: 700 }} />
            <ZoomControls viewport={viewport} setViewport={setViewport} nodes={nodes} size={{ w: 1100, h: 700 }} />
          </div>
        </main>
        {selectedNode && <Inspector node={selectedNode} onClose={() => setSelected(null)} />}
      </div>
      )}
      {addNodeOpen && window.AddNodeFlow && <window.AddNodeFlow onClose={() => setAddNodeOpen(false)} />}
    </div>
  );
}

Object.assign(window, { NODES, EDGES, ListGlyph, colorForNode, CAT_META, metricColor });

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
