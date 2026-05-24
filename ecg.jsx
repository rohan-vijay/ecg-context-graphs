const { useState, useRef, useEffect, useMemo, useCallback } = React;

// ---------- DATA ------------------------------------------------------------

const _ENT_NODES = [
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

const _ENT_EDGES = [
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

// ─── PRODUCT SPECIALIST GRAPH ───────────────────────────────────────────────

const PS_NODES = [
  // ENTITIES
  { id: "dealer",       label: "Dealer",       type: "entity", state: "core",   cat: "core",    x: -220, y: 0,    size: 32, instances: "840",  instancesN: 840,   props: 16, edges: 8,  fill: 92, conf: 96, fresh: "30m", pii: 2, change: "LOW",    desc: "Dealership organization — the customer being onboarded or supported by the PS team" },
  { id: "project",      label: "Project",      type: "entity", state: "core",   cat: "core",    x: 0,    y: 0,    size: 34, instances: "1.2K", instancesN: 1200,  props: 22, edges: 14, fill: 88, conf: 94, fresh: "15m", pii: 0, change: "MEDIUM", desc: "PS delivery project tracking the full engagement lifecycle from SOW through go-live" },
  { id: "workorder",    label: "Work Order",   type: "entity", state: "core",   cat: "core",    x: 200,  y: -80,  size: 30, instances: "8.4K", instancesN: 8400,  props: 18, edges: 10, fill: 91, conf: 95, fresh: "10m", pii: 0, change: "HIGH",   desc: "Atomic unit of PS delivery — a scoped configuration or implementation task" },
  { id: "pem",          label: "PEM",          type: "entity", state: "core",   cat: "core",    x: -80,  y: -200, size: 26, instances: "126",  instancesN: 126,   props: 12, edges: 6,  fill: 86, conf: 92, fresh: "1h",  pii: 3, change: "LOW",    desc: "Project Engagement Manager — PS lead accountable for delivery outcomes" },
  { id: "bsa",          label: "BSA",          type: "entity", state: "core",   cat: "core",    x: 120,  y: -200, size: 26, instances: "84",   instancesN: 84,    props: 11, edges: 5,  fill: 84, conf: 90, fresh: "1h",  pii: 3, change: "LOW",    desc: "Business Solutions Architect — technical design lead for the engagement" },
  { id: "champion",     label: "Champion",     type: "entity", state: "core",   cat: "core",    x: -380, y: -100, size: 24, instances: "920",  instancesN: 920,   props: 10, edges: 4,  fill: 78, conf: 88, fresh: "2h",  pii: 2, change: "LOW",    desc: "Customer champion and internal advocate at the dealership" },
  { id: "resource",     label: "Resource",     type: "entity", state: "core",   cat: "core",    x: 300,  y: -200, size: 24, instances: "340",  instancesN: 340,   props: 14, edges: 5,  fill: 82, conf: 91, fresh: "4h",  pii: 2, change: "LOW",    desc: "PS team member assigned to one or more work orders" },
  { id: "milestone",    label: "Milestone",    type: "entity", state: "signal", cat: "core",    x: 60,   y: -340, size: 24, instances: "4.8K", instancesN: 4800,  props: 9,  edges: 5,  fill: 94, conf: 97, fresh: "30m", pii: 0, change: "MEDIUM", desc: "Delivery milestone gating phase completion and go-live readiness" },
  { id: "sow",          label: "SOW",          type: "entity", state: "core",   cat: "core",    x: -200, y: 180,  size: 26, instances: "1.2K", instancesN: 1200,  props: 15, edges: 5,  fill: 96, conf: 99, fresh: "1d",  pii: 0, change: "LOW",    desc: "Statement of Work — commercial contract scoping the engagement" },
  { id: "sdd",          label: "SDD",          type: "entity", state: "core",   cat: "derived", x: 200,  y: 160,  size: 24, instances: "980",  instancesN: 980,   props: 13, edges: 4,  fill: 85, conf: 93, fresh: "1d",  pii: 0, change: "MEDIUM", desc: "Solution Design Document — technical blueprint authored by the BSA" },
  { id: "raid",         label: "RAID",         type: "entity", state: "risk",   cat: "derived", x: 360,  y: 0,    size: 24, instances: "3.2K", instancesN: 3200,  props: 16, edges: 5,  fill: 80, conf: 87, fresh: "1h",  pii: 0, change: "HIGH",   desc: "Risks, Assumptions, Issues and Dependencies log for the project" },
  { id: "signal",       label: "Signal",       type: "entity", state: "signal", cat: "derived", x: 440,  y: -160, size: 24, instances: "28K",  instancesN: 28000, props: 8,  edges: 5,  fill: 88, conf: 94, fresh: "6m",  pii: 0, change: "HIGH",   desc: "Health and quality signal derived from delivery activity and TOC platform data" },

  // DATA SOURCES
  { id: "salesforce",   label: "Salesforce",   type: "source", state: "core",   cat: "source",  x: -480, y: -260, size: 26, instances: "—", instancesN: 0, props: 28, edges: 4, fill: 98, conf: 99, fresh: "5m",  pii: 4, change: "LOW",    desc: "CRM — dealer accounts, PS contacts, opportunities, and cases" },
  { id: "apc",          label: "APC 2.0",      type: "source", state: "core",   cat: "source",  x: -60,  y: -440, size: 24, instances: "—", instancesN: 0, props: 22, edges: 2, fill: 96, conf: 98, fresh: "10m", pii: 0, change: "LOW",    desc: "PS project management platform — projects and work order lifecycle" },
  { id: "arc",          label: "ARC Platform", type: "source", state: "core",   cat: "source",  x: 560,  y: 80,   size: 24, instances: "—", instancesN: 0, props: 18, edges: 2, fill: 94, conf: 97, fresh: "15m", pii: 0, change: "LOW",    desc: "Tekion delivery platform — milestone tracking and RAID logs" },
  { id: "toc_im",       label: "TOC: IM",      type: "source", state: "core",   cat: "source",  x: 520,  y: -280, size: 22, instances: "—", instancesN: 0, props: 14, edges: 1, fill: 92, conf: 96, fresh: "2m",  pii: 0, change: "MEDIUM", desc: "TOC Incident Management — incidents feeding delivery health signals" },
  { id: "toc_st",       label: "TOC: Tickets", type: "source", state: "core",   cat: "source",  x: 520,  y: -100, size: 22, instances: "—", instancesN: 0, props: 16, edges: 2, fill: 90, conf: 95, fresh: "5m",  pii: 0, change: "MEDIUM", desc: "TOC Service Tickets — open issues and blockers tied to work orders" },
  { id: "toc_forms",    label: "TOC: Forms",   type: "source", state: "core",   cat: "source",  x: -260, y: 360,  size: 22, instances: "—", instancesN: 0, props: 12, edges: 1, fill: 88, conf: 94, fresh: "30m", pii: 0, change: "LOW",    desc: "TOC Forms — structured configuration capture for work order completion" },
  { id: "toc_support",  label: "TOC: Support", type: "source", state: "core",   cat: "source",  x: -480, y: 200,  size: 22, instances: "—", instancesN: 0, props: 10, edges: 1, fill: 86, conf: 93, fresh: "15m", pii: 0, change: "LOW",    desc: "TOC Support Portal — dealer-submitted requests and engagement feedback" },
  { id: "toc_prism",    label: "TOC: PRISM",   type: "source", state: "core",   cat: "source",  x: 380,  y: 280,  size: 22, instances: "—", instancesN: 0, props: 20, edges: 1, fill: 92, conf: 96, fresh: "1h",  pii: 0, change: "LOW",    desc: "TOC PRISM — project readiness and implementation scoring" },
  { id: "toc_acctmgmt", label: "TOC: Acct Mgmt", type: "source", state: "core", cat: "source", x: -560, y: 80,   size: 22, instances: "—", instancesN: 0, props: 14, edges: 1, fill: 88, conf: 94, fresh: "1h",  pii: 2, change: "LOW",    desc: "TOC Account Management (LUS) — dealer onboarding and account status" },
  { id: "skilljar",     label: "Skilljar",     type: "source", state: "core",   cat: "source",  x: 200,  y: 380,  size: 22, instances: "—", instancesN: 0, props: 12, edges: 2, fill: 94, conf: 97, fresh: "1d",  pii: 1, change: "LOW",    desc: "Training platform — resource certifications and dealer training completion" },
  { id: "chronicleai",  label: "ChronicleAI",  type: "source", state: "core",   cat: "source",  x: 580,  y: -200, size: 22, instances: "—", instancesN: 0, props: 16, edges: 1, fill: 90, conf: 95, fresh: "30m", pii: 0, change: "MEDIUM", desc: "AI-native platform providing behavioral signals and delivery quality insights" },
];

const PS_EDGES = [
  // Entity relationships
  { s: "dealer",       t: "project",   label: "HAS_PROJECT",   kind: "direct" },
  { s: "project",      t: "workorder", label: "INCLUDES",      kind: "direct" },
  { s: "project",      t: "sow",       label: "GOVERNED_BY",   kind: "direct" },
  { s: "project",      t: "sdd",       label: "DOCUMENTED_IN", kind: "direct" },
  { s: "project",      t: "raid",      label: "TRACKED_IN",    kind: "direct" },
  { s: "project",      t: "milestone", label: "HAS_MILESTONE", kind: "direct" },
  { s: "pem",          t: "project",   label: "MANAGES",       kind: "direct" },
  { s: "bsa",          t: "project",   label: "DESIGNS",       kind: "direct" },
  { s: "workorder",    t: "resource",  label: "ASSIGNED_TO",   kind: "direct" },
  { s: "workorder",    t: "milestone", label: "DELIVERS",      kind: "direct" },
  { s: "champion",     t: "dealer",    label: "REPRESENTS",    kind: "direct" },
  { s: "signal",       t: "workorder", label: "OBSERVED_ON",   kind: "direct" },
  { s: "signal",       t: "project",   label: "MEASURED_FOR",  kind: "inferred" },
  { s: "sow",          t: "sdd",       label: "INFORMS",       kind: "inferred" },
  { s: "pem",          t: "workorder", label: "OWNS",          kind: "inferred", curve: -40 },
  // Source → entity
  { s: "salesforce",   t: "dealer",    label: "SOURCES", kind: "source" },
  { s: "salesforce",   t: "pem",       label: "SOURCES", kind: "source" },
  { s: "salesforce",   t: "sow",       label: "SOURCES", kind: "source" },
  { s: "salesforce",   t: "champion",  label: "SOURCES", kind: "source" },
  { s: "apc",          t: "project",   label: "SOURCES", kind: "source" },
  { s: "apc",          t: "workorder", label: "SOURCES", kind: "source" },
  { s: "arc",          t: "milestone", label: "SOURCES", kind: "source" },
  { s: "arc",          t: "raid",      label: "SOURCES", kind: "source" },
  { s: "toc_im",       t: "signal",    label: "SOURCES", kind: "source" },
  { s: "toc_st",       t: "signal",    label: "SOURCES", kind: "source" },
  { s: "toc_st",       t: "workorder", label: "SOURCES", kind: "source" },
  { s: "toc_forms",    t: "workorder", label: "SOURCES", kind: "source" },
  { s: "toc_support",  t: "dealer",    label: "SOURCES", kind: "source" },
  { s: "toc_prism",    t: "workorder", label: "SOURCES", kind: "source" },
  { s: "toc_acctmgmt", t: "dealer",    label: "SOURCES", kind: "source" },
  { s: "skilljar",     t: "resource",  label: "SOURCES", kind: "source" },
  { s: "skilljar",     t: "pem",       label: "SOURCES", kind: "source" },
  { s: "chronicleai",  t: "signal",    label: "SOURCES", kind: "source" },
];

const IS_PS_GRAPH = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("graph") === "ps";
const NODES = IS_PS_GRAPH ? PS_NODES : _ENT_NODES;
const EDGES = IS_PS_GRAPH ? PS_EDGES : _ENT_EDGES;

const SIDEBAR_NODES = [...NODES].filter(n => n.type !== "agent").sort((a, b) => a.label.localeCompare(b.label));

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
          <div className="hdr-title-row">{IS_PS_GRAPH ? "Product Specialist Graph" : "Enterprise Context Graph"}</div>
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

function Inspector({ node, onClose, onOpenDetail }) {
  const [tab, setTab] = useState("Overview");
  if (!node) return null;
  const c = colorForNode(node);
  const incoming = EDGES.filter(e => e.t === node.id);
  const outgoing = EDGES.filter(e => e.s === node.id);
  const properties = generateProps(node);
  const sources = generateSources(node);
  const rules = generateRules(node);

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

      {onOpenDetail && (
        <div style={{ display: "flex", gap: 8, padding: "8px 14px 0", borderBottom: "1px solid var(--line-2)" }}>
          <button onClick={onOpenDetail} style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: "1px solid var(--line)", background: "transparent", color: "var(--ink-2)", fontSize: 12, fontFamily: "Geist, system-ui", cursor: "pointer", textAlign: "center" }}>
            View full details →
          </button>
          <button onClick={onOpenDetail} style={{ padding: "7px 12px", borderRadius: 6, border: "none", background: "var(--ink)", color: "#fff", fontSize: 12, fontFamily: "Geist, system-ui", cursor: "pointer", fontWeight: 500 }}>
            Edit schema
          </button>
        </div>
      )}

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
            <div className="ih-block-head">Properties <span className="ih-block-sub">{properties.length} total · {piiProps} PII</span></div>
            <div>
              {properties.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < properties.length - 1 ? "1px dashed var(--line-2)" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                      {p.pk  && <span className="snap-tag snap-pk">PK</span>}
                      {p.pii && <span className="snap-tag snap-pii">PII</span>}
                      <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: p.pk ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="snap-type">{p.type}</span>
                      {p.required && <span className="snap-tag">REQ</span>}
                      {p.indexed  && <span className="snap-tag snap-idx">IDX</span>}
                      {p.computed && <span className="snap-tag snap-comp">FX</span>}
                    </div>
                  </div>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: metricColor(p.fill), fontWeight: 600, flexShrink: 0 }}>{p.fill}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Edges" && (
          <>
            {outgoing.length > 0 && (
              <div className="ih-block">
                <div className="ih-block-head">Outgoing <span className="ih-block-sub">{outgoing.length} edge types</span></div>
                <div className="ih-edges">
                  {outgoing.map((e, i) => {
                    const target = NODES.find(n => n.id === e.t);
                    if (!target) return null;
                    const card = (seed + i * 11) % 100 < 70 ? "1:N" : "N:N";
                    const inst = ((seed + i * 17) % 800) + 50;
                    return (
                      <div key={i} className={"ih-edge ih-edge-" + e.kind}>
                        <span className="ih-edge-lbl">:{e.label}</span>
                        <span className="ih-edge-dir">→</span>
                        <span className="ih-edge-other"><ListGlyph node={target} size={14} />{target.label}</span>
                        <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", fontFamily: "JetBrains Mono", fontSize: 10.5, color: "var(--ink-3)" }}>
                          <span>{card}</span><span>{inst.toLocaleString()}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {incoming.length > 0 && (
              <div className="ih-block">
                <div className="ih-block-head">Incoming <span className="ih-block-sub">{incoming.length} edge types</span></div>
                <div className="ih-edges">
                  {incoming.map((e, i) => {
                    const src = NODES.find(n => n.id === e.s);
                    if (!src) return null;
                    const card = (seed + i * 13) % 100 < 70 ? "N:1" : "N:N";
                    const inst = ((seed + i * 19) % 600) + 30;
                    return (
                      <div key={i} className={"ih-edge ih-edge-" + e.kind}>
                        <span className="ih-edge-lbl">:{e.label}</span>
                        <span className="ih-edge-dir">←</span>
                        <span className="ih-edge-other"><ListGlyph node={src} size={14} />{src.label}</span>
                        <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", fontFamily: "JetBrains Mono", fontSize: 10.5, color: "var(--ink-3)" }}>
                          <span>{card}</span><span>{inst.toLocaleString()}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "Sources" && (
          <div className="ih-block">
            <div className="ih-block-head">Data sources <span className="ih-block-sub">{sources.length} connected</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sources.map((s, i) => (
                <div key={i} style={{ border: "1px solid var(--line-2)", borderRadius: 8, padding: "12px 14px", background: "var(--panel-2)", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{s.name}</div>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>{s.freq}</div>
                    </div>
                    <span className={"src-status src-status-" + s.status} style={{ flexShrink: 0 }}>{s.status}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="snap-tag">{s.type.toUpperCase()}</span>
                    {s.rows !== "—" && <span style={{ fontFamily: "JetBrains Mono", fontSize: 10.5, color: "var(--ink-3)" }}>{s.rows} rows</span>}
                    {s.errors > 0 && <span style={{ fontFamily: "JetBrains Mono", fontSize: 10.5, color: "var(--coral)", marginLeft: "auto" }}>{s.errors} errors</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Rules" && (
          <div className="ih-block">
            <div className="ih-block-head">Rules <span className="ih-block-sub">{rules.quality.length} quality · {rules.match.length} match · {rules.survivorship.length} surv</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {rules.quality.map((r, i) => (
                <div key={i} style={{ border: "1px solid var(--line-2)", borderRadius: 8, padding: "10px", background: "var(--panel-2)", display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className={"rule-kind rule-kind-" + r.kind.toLowerCase()} style={{ alignSelf: "flex-start" }}>{r.kind}</span>
                  <span style={{ fontSize: 12, color: "var(--ink)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{r.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: "auto" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.on ? "var(--green)" : "var(--coral)", flexShrink: 0 }} />
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 9.5, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.last}</span>
                  </div>
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
    if (IS_PS_GRAPH) return null;
    if (savedView === "Sales flow")    return new Set(["account","person","subscription","agreement","invoice","netsuite"]);
    if (savedView === "Health inputs") return new Set(["account","interaction","signal","ticket","incident","snowflake"]);
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
              <g key={i} opacity={lit ? 1 : (highlightId ? (visEdge ? 0.12 : 0.04) : (visEdge ? 0.7 : 0.06))}>
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
            const lit = edgeIsLit(e);
            if (!visEdge && !lit) return null;
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
            const dim = !lit && (!vis || nodeIsDim(n.id));
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
                opacity={lit ? 1 : (highlightId ? (vis ? 0.18 : 0.06) : (vis ? 1 : 0.22))}
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
  account: {
    quality: [
      { kind: "VALIDATE", id: "arr_nonneg",    title: "ARR is non-negative",                  expr: "arr_usd >= 0",                                label: "arr_usd ≥ 0",                          severity: "ERROR", violations: 0,  compliance: 100, on: true, last: "0 fails / 24h" },
      { kind: "VALIDATE", id: "domain_format", title: "Domain format is valid",                expr: 'domain ~ /^[a-z0-9-.]+$/',                   label: "domain matches /^[a-z0-9-.]+$/",      severity: "WARN",  violations: 12, compliance: 99,  on: true, last: "12 violations" },
      { kind: "COMPUTE",  id: "tier_buckets",  title: "Tier derived from ARR bands",           expr: "tier := arr_usd → {SMB, MM, ENT}",           label: "tier := arr_usd → {SMB,MM,ENT}",       severity: "ERROR", violations: 0,  compliance: 100, on: true, last: "2,840 evaluated" },
      { kind: "COMPUTE",  id: "risk_score",    title: "Risk score from Customer Health agent", expr: "risk_score := agent:cust_health.score",      label: "risk_score from cust_health agent",   severity: "WARN",  violations: 0,  compliance: 100, on: true, last: "2,712 written" },
      { kind: "ACCESS",   id: "pii_role",      title: "PII fields require acct_admin role",   expr: "fields(pii=true) → require role:acct_admin", label: "PII fields gated on role:acct_admin", severity: "ERROR", violations: 0,  compliance: 100, on: true, last: "audit logged" },
      { kind: "SLO",      id: "freshness_30m", title: "Freshness p95 under 30 minutes",        expr: "p95(ingest_lag) < 30m",                      label: "freshness p95 < 30m",                  severity: "WARN",  violations: 0,  compliance: 100, on: true, last: "OK (p95 = 4m 12s)" },
      { kind: "INFER",    id: "previously_at", title: "Infer past employer relationships",     expr: "Person :PREVIOUSLY_AT Account",              label: "Person :PREVIOUSLY_AT Account",        severity: "INFO",  violations: 0,  compliance: 100, on: true, last: "18 inferred today" },
    ],
    match: [
      { id: "domain_match",   title: "Domain-based company match",   signals: [{field:"domain",strategy:"normalized_domain",weight:0.50},{field:"company_name",strategy:"fuzzy_name",weight:0.35},{field:"billing_city",strategy:"exact",weight:0.15}], threshold_auto:0.92, threshold_review:0.75, candidates:7,  auto_resolved:24, on:true, last:"7 pending review" },
      { id: "tax_id_match",   title: "Tax ID exact match",           signals: [{field:"tax_id",strategy:"exact",weight:1.0}],                                                                                                                              threshold_auto:1.00, threshold_review:0.95, candidates:2,  auto_resolved:8,  on:true, last:"2 pending review" },
      { id: "topology_match", title: "Shared subscription topology", signals: [{field:"HAS_SUBSCRIPTION",strategy:"common_neighbor",weight:0.60},{field:"company_name",strategy:"fuzzy_name",weight:0.40}],                                               threshold_auto:0.88, threshold_review:0.70, candidates:3,  auto_resolved:2,  on:true, last:"3 pending review" },
    ],
    survivorship: [
      { id: "srv_arr",     title: "ARR: ERP wins over CRM",              property:"arr_usd",         strategy:"source_priority",  sources:["NetSuite ERP","Salesforce CRM","HubSpot Marketing"],  conflicts:0, evaluated:2840, on:true, last:"0 conflicts" },
      { id: "srv_domain",  title: "Domain: most complete value wins",    property:"domain",           strategy:"completeness",     sources:["Salesforce CRM","HubSpot Marketing","Manual / Admin"], conflicts:3, evaluated:2840, on:true, last:"3 conflicts" },
      { id: "srv_name",    title: "Company name: recency with CRM bias", property:"company_name",     strategy:"recency_weighted", sources:["Salesforce CRM","HubSpot Marketing","NetSuite ERP"],   conflicts:0, evaluated:2840, on:true, last:"0 conflicts" },
      { id: "srv_billing", title: "Billing address: trust tier",         property:"billing_address",  strategy:"source_trust",     sources:["NetSuite ERP","Salesforce CRM","Manual / Admin"],       conflicts:1, evaluated:2840, on:true, last:"1 conflict" },
    ],
  },
};

function generateRules(node) {
  if (RULES_BY_NODE[node.id]) return RULES_BY_NODE[node.id];
  const missing = 100 - node.fill;
  return {
    quality: [
      { kind: "VALIDATE", id: node.id+"_id_unique", title: node.label+" ID is unique",     expr: node.id+"_id IS UNIQUE",               label: node.id+"_id is unique",      severity: "ERROR", violations: 0,      compliance: 100,      on: true, last: "0 fails / 24h" },
      { kind: "SLO",      id: "freshness",          title: "Freshness SLO",                expr: "p95(ingest_lag) < "+node.fresh,        label: "freshness p95 < "+node.fresh, severity: "WARN",  violations: 0,      compliance: 100,      on: true, last: node.fresh },
      { kind: "VALIDATE", id: "required_fields",    title: "Required fields are present",  expr: "required_fields IS NOT NULL",         label: "required fields present",    severity: "ERROR", violations: missing, compliance: node.fill, on: true, last: missing+"% missing" },
    ],
    match: [
      { id: node.id+"_name_match", title: node.label+" name match", signals: [{field:"name",strategy:"fuzzy_name",weight:1.0}], threshold_auto:0.95, threshold_review:0.80, candidates:0, auto_resolved:0, on:false, last:"not configured" },
    ],
    survivorship: [
      { id: "srv_"+node.id+"_name", title: "Name: most recent source wins", property:"name", strategy:"recency", sources:[], conflicts:0, evaluated:node.instancesN, on:true, last:"0 conflicts" },
    ],
  };
}

// ─── MATCH CANDIDATE SAMPLE DATA ─────────────────────────────────────────────

const MATCH_CANDIDATES = {
  domain_match: [
    { id:"cand_001", score:0.88,
      nodeA:{ id:"acc_11293", name:"Premier Automotive Group",  domain:"premierauto.com",    tier:"ENT", arr:"$2.1M",  city:"Detroit, MI",   source:"Salesforce CRM" },
      nodeB:{ id:"acc_98421", name:"Premier Auto Group Inc.",   domain:"PREMIERAUTO.COM",    tier:"ENT", arr:"$2.1M",  city:"Detroit, MI",   source:"HubSpot Marketing" },
      signals:[ {field:"domain",match:1.00,contribution:0.50,note:"Exact after normalization"}, {field:"company_name",match:0.87,contribution:0.30,note:"Fuzzy score: 87%"}, {field:"billing_city",match:1.00,contribution:0.15,note:"Exact match"} ], status:"pending" },
    { id:"cand_002", score:0.81,
      nodeA:{ id:"acc_22091", name:"Auto World East",           domain:"autoworldeast.com",  tier:"MM",  arr:"$840K",  city:"Columbus, OH",  source:"Salesforce CRM" },
      nodeB:{ id:"acc_31044", name:"Auto World (East) LLC",    domain:"autoworld-east.co",  tier:"MM",  arr:"$840K",  city:"Columbus, OH",  source:"Manual / Admin" },
      signals:[ {field:"domain",match:0.72,contribution:0.36,note:"Hyphen variant: 72%"}, {field:"company_name",match:0.91,contribution:0.32,note:"Fuzzy score: 91%"}, {field:"billing_city",match:1.00,contribution:0.15,note:"Exact match"} ], status:"pending" },
    { id:"cand_003", score:0.79,
      nodeA:{ id:"acc_48134", name:"Peak Auto",                domain:"peakauto.com",        tier:"SMB", arr:"$120K",  city:"Denver, CO",    source:"Salesforce CRM" },
      nodeB:{ id:"acc_55290", name:"Peak Automotive",          domain:"peakautomotive.net",  tier:"SMB", arr:"$118K",  city:"Denver, CO",    source:"HubSpot Marketing" },
      signals:[ {field:"domain",match:0.62,contribution:0.31,note:"Different TLD: 62%"}, {field:"company_name",match:0.90,contribution:0.31,note:"Fuzzy score: 90%"}, {field:"billing_city",match:1.00,contribution:0.15,note:"Exact match"} ], status:"pending" },
  ],
  tax_id_match: [
    { id:"cand_t001", score:0.97,
      nodeA:{ id:"acc_61847", name:"Summit Auto & RV",          domain:"summitautorv.com",   tier:"ENT", arr:"$3.2M",  city:"Phoenix, AZ",   source:"NetSuite ERP" },
      nodeB:{ id:"acc_77290", name:"Summit Auto and RV",        domain:"summitauto-rv.com",  tier:"ENT", arr:"$3.2M",  city:"Phoenix, AZ",   source:"Salesforce CRM" },
      signals:[ {field:"tax_id",match:1.00,contribution:0.97,note:"Exact match: 47-1234567"} ], status:"pending" },
    { id:"cand_t002", score:0.95,
      nodeA:{ id:"acc_29183", name:"Bright Horizons Motors",    domain:"bhm.co",             tier:"MM",  arr:"$520K",  city:"Austin, TX",    source:"NetSuite ERP" },
      nodeB:{ id:"acc_38770", name:"BHM Automotive Group",      domain:"bhmauto.com",        tier:"MM",  arr:"$520K",  city:"Austin, TX",    source:"HubSpot Marketing" },
      signals:[ {field:"tax_id",match:1.00,contribution:0.95,note:"Exact match: 74-8821903"} ], status:"pending" },
  ],
  topology_match: [
    { id:"cand_tp001", score:0.83,
      nodeA:{ id:"acc_41209", name:"Green Leaf Auto",           domain:"greenleafauto.com",  tier:"MM",  arr:"$480K",  city:"Portland, OR",  source:"Salesforce CRM" },
      nodeB:{ id:"acc_84100", name:"Green Leaf Automotive",     domain:"greenleaf-auto.com", tier:"MM",  arr:"$480K",  city:"Portland, OR",  source:"HubSpot Marketing" },
      signals:[ {field:"HAS_SUBSCRIPTION",match:1.00,contribution:0.60,note:"3 shared subscription IDs"}, {field:"company_name",match:0.86,contribution:0.34,note:"Fuzzy score: 86%"} ], status:"pending" },
    { id:"cand_tp002", score:0.76,
      nodeA:{ id:"acc_72103", name:"Riverside Motors",          domain:"riverside-motors.com",tier:"SMB",arr:"$210K",  city:"Sacramento, CA",source:"Salesforce CRM" },
      nodeB:{ id:"acc_18840", name:"Riverside Motor Group",     domain:"riversidemg.com",    tier:"SMB", arr:"$210K",  city:"Sacramento, CA",source:"HubSpot Marketing" },
      signals:[ {field:"HAS_SUBSCRIPTION",match:1.00,contribution:0.60,note:"2 shared subscription IDs"}, {field:"company_name",match:0.78,contribution:0.31,note:"Fuzzy score: 78%"} ], status:"pending" },
    { id:"cand_tp003", score:0.72,
      nodeA:{ id:"acc_84921", name:"ACME Auto Partners",        domain:"acmeauto.com",       tier:"SMB", arr:"$95K",   city:"Phoenix, AZ",   source:"Salesforce CRM" },
      nodeB:{ id:"acc_21009", name:"ACME Automotive",           domain:"acme-auto.co",       tier:"SMB", arr:"$95K",   city:"Phoenix, AZ",   source:"NetSuite ERP" },
      signals:[ {field:"HAS_SUBSCRIPTION",match:0.67,contribution:0.40,note:"1 shared subscription ID"}, {field:"company_name",match:0.82,contribution:0.33,note:"Fuzzy score: 82%"} ], status:"pending" },
  ],
};

// ─── SURVIVORSHIP CONFLICT SAMPLE DATA ───────────────────────────────────────

const SURV_CONFLICTS = {
  srv_domain: [
    { id:"acc_84921", property:"domain",
      values:[ {source:"HubSpot Marketing",value:"ACME Corp",       confidence:0.55, updated:"2026-05-21", tier:3}, {source:"Salesforce CRM",value:"acmecorp.com",     confidence:0.95, updated:"2026-05-20", tier:2} ],
      current_winner:"HubSpot Marketing", suggestion:"Salesforce CRM",    reason:"Higher confidence + valid domain format" },
    { id:"acc_72103", property:"domain",
      values:[ {source:"HubSpot Marketing",value:"Riverside Motors#2",confidence:0.40, updated:"2026-05-20", tier:3}, {source:"Salesforce CRM",value:"riverside-motors.com",confidence:0.98, updated:"2026-05-19", tier:2} ],
      current_winner:"HubSpot Marketing", suggestion:"Salesforce CRM",    reason:"HubSpot value fails domain_format rule" },
    { id:"acc_41209", property:"domain",
      values:[ {source:"Manual / Admin",value:"green-leaf.co",      confidence:1.00, updated:"2026-05-16", tier:1}, {source:"Salesforce CRM",value:"greenleafauto.com", confidence:0.92, updated:"2026-05-15", tier:2}, {source:"HubSpot Marketing",value:"Green Leaf & Co",confidence:0.50, updated:"2026-05-14", tier:3} ],
      current_winner:"Salesforce CRM",    suggestion:"Manual / Admin",     reason:"Manual entry is tier-1 authority" },
  ],
  srv_billing: [
    { id:"acc_72103", property:"billing_address",
      values:[ {source:"NetSuite ERP",value:"123 Main St, Chicago IL 60601",   confidence:1.00, updated:"2026-05-19", tier:1}, {source:"Salesforce CRM",value:"123 Main Street, Chicago IL 60601",confidence:0.90, updated:"2026-05-21", tier:2} ],
      current_winner:"Salesforce CRM",    suggestion:"NetSuite ERP",            reason:"ERP is tier-1 authority for billing data" },
  ],
};

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

// ---------- EDIT SCHEMA VIEW (full-page) ------------------------------------

const PROP_TYPES = ["uuid","string","int","decimal","float","bool","date","timestamp","enum","enum(n)","struct","fk","string[]"];

function EditSchemaView({ node, properties: initProps, onClose }) {
  const [section, setSection] = useState("Identity");
  const [label, setLabel]     = useState(node.label);
  const [desc, setDesc]       = useState(node.desc);
  const [owner, setOwner]     = useState("data-platform");
  const [domain, setDomain]   = useState(node.cat === "core" ? "customer" : node.cat === "support" ? "service" : node.cat === "derived" ? "analytics" : "ingest");
  const [cat, setCat]         = useState(node.cat);
  const [nodeState, setNodeState] = useState(node.state);
  const [tags, setTags]       = useState(["pii","core-entity","slo:30m","agent-input"]);
  const [tagInput, setTagInput] = useState("");
  const [stewards, setStewards] = useState("morgan.lee, ramin.k");
  const [runbook, setRunbook]   = useState("go/account-runbook");
  const [slackChan, setSlackChan] = useState("#schema-account");
  const [props, setProps]     = useState(initProps.map((p, i) => ({ ...p, _id: i })));
  const [published, setPublished] = useState(false);
  const [saved, setSaved]     = useState(false);
  const nextId = useRef(initProps.length);

  const addProp = () => setProps(ps => [...ps, { _id: nextId.current++, name: "", type: "string", required: false, indexed: false, pii: false, pk: false, fill: 0, conf: 0, source: "manual" }]);
  const updProp = (id, key, val) => setProps(ps => ps.map(p => p._id === id ? { ...p, [key]: val } : p));
  const delProp = (id) => setProps(ps => ps.filter(p => p._id !== id));

  const piiProps  = props.filter(p => p.pii);
  const c = colorForNode(node);
  const fldStyle  = { padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 7, fontSize: 13, fontFamily: "Geist, system-ui", background: "var(--bg-canvas)", color: "var(--ink)", width: "100%", boxSizing: "border-box" };
  const lblStyle  = { fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 6, display: "block" };

  const SECTIONS = [
    { id: "Identity",   label: "Identity",        sub: "Label, kind & description" },
    { id: "Properties", label: "Properties",      sub: `${props.length} fields · ${props.filter(p=>p.required).length} required` },
    { id: "Access",     label: "Access",          sub: `${piiProps.length} PII fields · 4 roles` },
    { id: "Governance", label: "Governance",      sub: "Tags, domain, stewards" },
    { id: "Review",     label: "Review & Publish",sub: published ? "Published ✓" : "Ready to publish" },
  ];

  return (
    <div className="detail-view" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ── header ── */}
      <div className="detail-head" style={{ flexShrink: 0 }}>
        <div className="detail-crumb">
          <button className="crumb-back" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            {node.label}
          </button>
          <span className="crumb-sep">/</span>
          <span className="crumb-here">Edit schema</span>
          <span className="crumb-tail">
            <span className="dot-live" /> LIVE
            <span className="crumb-dot">·</span> v3.2
            <span className="crumb-dot">·</span> branch <b>main</b>
            <span className="crumb-dot">·</span> <span className="crumb-warn">draft in progress</span>
          </span>
        </div>
        <div className="detail-title-row">
          <div className="detail-title-left">
            <svg width="44" height="44" viewBox="-22 -22 44 44">
              {node.type === "source" ? <rect x="-15" y="-15" width="30" height="30" rx="3" fill={c.fill} stroke={c.stroke} strokeWidth="1.6" /> : <circle r="15" fill={c.fill} stroke={c.stroke} strokeWidth="1.6" />}
            </svg>
            <div>
              <div className="detail-title-name">Edit schema <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>— {node.label}</span></div>
              <div className="detail-title-desc">Draft changes · requires schema owner review before publish · auto-saved every 30s</div>
            </div>
          </div>
          <div className="detail-title-right">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-ghost" onClick={() => setSaved(true)} style={{ color: saved ? "var(--green)" : undefined }}>
              {saved ? "Saved ✓" : "Save draft"}
            </button>
            <button className="btn-dark" onClick={() => { setPublished(true); setTimeout(onClose, 1000); }}
              style={{ background: published ? "var(--green)" : undefined, minWidth: 100 }}>
              {published ? "Published ✓" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* ── body: left nav | content | right preview ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left nav */}
        <div style={{ width: 236, borderRight: "1px solid var(--line)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 2, background: "var(--panel)", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "var(--ink-3)", textTransform: "uppercase", padding: "0 10px", marginBottom: 10 }}>Sections</div>
          {SECTIONS.map((s, i) => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "none", background: section === s.id ? "var(--panel-2)" : "transparent", borderLeft: `3px solid ${section === s.id ? "var(--ink)" : "transparent"}`, cursor: "pointer", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: section === s.id ? "var(--ink)" : "var(--line-2)", color: section === s.id ? "#fff" : "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: section === s.id ? 600 : 400, color: section === s.id ? "var(--ink)" : "var(--ink-2)" }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 28, marginTop: 2 }}>{s.sub}</div>
            </button>
          ))}
          <div style={{ marginTop: "auto", padding: 14, background: "var(--panel-2)", borderRadius: 8, border: "1px solid var(--line-2)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>Validation</div>
            {[
              { label: "Label is valid & unique", ok: label.length > 0 },
              { label: "Node kind set", ok: true },
              { label: "Access roles assigned", ok: true },
              { label: "Stewards defined", ok: stewards.length > 0 },
            ].map(v => (
              <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, fontSize: 11, color: v.ok ? "var(--ink-2)" : "var(--coral)" }}>
                <span style={{ color: v.ok ? "var(--green)" : "var(--coral)", fontSize: 14, lineHeight: 1 }}>{v.ok ? "●" : "○"}</span>
                {v.label}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px" }}>

          {/* IDENTITY */}
          {section === "Identity" && (
            <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Identity</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>The label and description become the canonical name in every query, agent prompt, and dashboard filter. Choose a singular noun in PascalCase. Renaming after publishing is a breaking change.</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label><span style={lblStyle}>Label <span style={{ color: "var(--coral)" }}>REQUIRED</span></span>
                  <input value={label} onChange={e => setLabel(e.target.value)} style={fldStyle} placeholder="e.g. VendorContract" />
                  <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>PascalCase singular noun</div>
                </label>
                <label><span style={lblStyle}>Owner team</span>
                  <select value={owner} onChange={e => setOwner(e.target.value)} style={fldStyle}>
                    {["data-platform","applied-ml","cs-platform","fin-ops","growth","governance","billing"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </label>
              </div>
              <label><span style={lblStyle}>Description</span>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} style={{ ...fldStyle, resize: "vertical" }} placeholder="What real-world concept does this node represent?" />
              </label>
              <div>
                <span style={lblStyle}>Node kind <span style={{ color: "var(--coral)" }}>REQUIRED</span></span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 6 }}>
                  {[
                    { kind: "entity", title: "Entity", sub: "A domain object — Account, Person, Contract. The nouns of your graph." },
                    { kind: "source", title: "Data Source", sub: "A system of record or pipeline — Salesforce, Kafka. Populates entities." },
                  ].map(k => {
                    const kc = colorForNode({ type: k.kind, state: "core" });
                    return (
                      <div key={k.kind} style={{ padding: 16, border: `2px solid ${node.type === k.kind ? "var(--ink)" : "var(--line)"}`, borderRadius: 10, background: node.type === k.kind ? "var(--panel-2)" : "var(--bg-canvas)", opacity: node.type === k.kind ? 1 : 0.55 }}>
                        <svg width="24" height="24" viewBox="-12 -12 24 24" style={{ marginBottom: 8, display: "block" }}>
                          {k.kind === "source" ? <rect x="-9" y="-9" width="18" height="18" rx="2" fill={kc.fill} stroke={kc.stroke} strokeWidth="1.4" /> : <circle r="9" fill={kc.fill} stroke={kc.stroke} strokeWidth="1.4" />}
                        </svg>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{k.title}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{k.sub}</div>
                        {node.type === k.kind && <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.8px" }}>CURRENT</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label><span style={lblStyle}>Category</span>
                  <select value={cat} onChange={e => setCat(e.target.value)} style={fldStyle}>
                    {["core","support","derived","source"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </label>
                <label><span style={lblStyle}>State</span>
                  <select value={nodeState} onChange={e => setNodeState(e.target.value)} style={fldStyle}>
                    {["core","signal","risk","incident"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* PROPERTIES */}
          {section === "Properties" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Properties</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Each property maps to a column in the entity's canonical table. Required fields must be non-null. Indexed fields are optimised for filtering.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {[["all", `All ${props.length}`],["required","Required"],["indexed","Indexed"],["pii","PII"],["computed","Computed"]].map(([f, lbl]) => (
                  <button key={f} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "transparent", color: "var(--ink-2)", fontSize: 12, cursor: "pointer" }}>{lbl}</button>
                ))}
                <button onClick={addProp} style={{ marginLeft: "auto", padding: "7px 16px", borderRadius: 6, border: "none", background: "var(--ink)", color: "#fff", fontSize: 12, fontFamily: "Geist, system-ui", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg> Add property
                </button>
              </div>
              <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "var(--panel-2)", borderBottom: "1px solid var(--line)" }}>
                      {["#","Name","Type","Req","Idx","PII","PK","Source","Fill",""].map((h, i) => (
                        <th key={i} style={{ padding: "9px 8px", textAlign: "left", fontWeight: 700, fontSize: 10, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--ink-3)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {props.map((p, idx) => (
                      <tr key={p._id} style={{ borderBottom: "1px solid var(--line-2)", background: idx % 2 ? "var(--panel-2)" : "transparent" }}>
                        <td style={{ padding: "6px 8px", color: "var(--ink-4)", fontSize: 11, width: 24 }}>{idx + 1}</td>
                        <td style={{ padding: "6px 6px" }}>
                          <input value={p.name} onChange={e => updProp(p._id, "name", e.target.value)}
                            style={{ width: 148, padding: "4px 7px", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, fontFamily: "JetBrains Mono", background: "var(--bg-canvas)", color: "var(--ink)" }} />
                        </td>
                        <td style={{ padding: "6px 6px" }}>
                          <select value={p.type} onChange={e => updProp(p._id, "type", e.target.value)}
                            style={{ padding: "4px 6px", border: "1px solid var(--line)", borderRadius: 5, fontSize: 11, fontFamily: "JetBrains Mono", background: "var(--bg-canvas)", color: "var(--ink)" }}>
                            {PROP_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </td>
                        {["required","indexed","pii","pk"].map(flag => (
                          <td key={flag} style={{ padding: "6px 6px", textAlign: "center" }}>
                            <input type="checkbox" checked={!!p[flag]} onChange={e => updProp(p._id, flag, e.target.checked)}
                              style={{ cursor: "pointer", width: 14, height: 14, accentColor: flag === "pii" ? "var(--coral)" : "var(--ink)" }} />
                          </td>
                        ))}
                        <td style={{ padding: "6px 6px" }}>
                          <input value={p.source || ""} onChange={e => updProp(p._id, "source", e.target.value)}
                            style={{ width: 100, padding: "4px 6px", border: "1px solid var(--line)", borderRadius: 5, fontSize: 11, fontFamily: "JetBrains Mono", background: "var(--bg-canvas)", color: "var(--ink-2)" }} />
                        </td>
                        <td style={{ padding: "6px 6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 40, height: 3, background: "var(--line-2)", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: (p.fill || 0) + "%", height: "100%", background: (p.fill || 0) < 80 ? "var(--gold)" : "var(--green)" }} />
                            </div>
                            <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{p.fill || 0}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "6px 6px" }}>
                          <button onClick={() => delProp(p._id)} title="Remove"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", fontSize: 14, padding: "0 4px", lineHeight: 1 }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "10px 16px", background: "var(--panel-2)", borderRadius: 8, border: "1px solid var(--line-2)", fontSize: 12, display: "flex", gap: 20, flexWrap: "wrap", color: "var(--ink-2)" }}>
                <span><b style={{ color: "var(--ink)" }}>{props.length}</b> total</span>
                <span><b style={{ color: "var(--ink)" }}>{props.filter(p => p.required).length}</b> required</span>
                <span><b style={{ color: "var(--ink)" }}>{props.filter(p => p.indexed).length}</b> indexed</span>
                <span><b style={{ color: piiProps.length ? "var(--coral)" : "var(--ink)" }}>{piiProps.length}</b> PII</span>
                <span><b>{props.filter(p => p.pk).length}</b> primary key</span>
                <span><b>{props.filter(p => p.computed).length}</b> computed</span>
              </div>
            </div>
          )}

          {/* ACCESS */}
          {section === "Access" && (
            <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Access controls</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Define who can read and write this entity's data. PII fields require a specific role and are audit-logged on every access.</div>
              </div>
              <section className="card">
                <div className="card-head" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  PII fields
                  <span style={{ padding: "2px 8px", background: piiProps.length ? "#fff2ef" : "var(--panel-2)", border: "1px solid " + (piiProps.length ? "var(--coral)" : "var(--line)"), borderRadius: 4, fontSize: 11, color: piiProps.length ? "var(--coral)" : "var(--ink-3)" }}>{piiProps.length} flagged</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-3)" }}>Flag PII in Properties</span>
                </div>
                <div className="card-body">
                  {piiProps.length === 0
                    ? <div style={{ color: "var(--ink-3)", fontSize: 13 }}>No PII-flagged properties.</div>
                    : piiProps.map(p => (
                      <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--line-2)", fontSize: 12 }}>
                        <span style={{ fontFamily: "JetBrains Mono", color: "var(--coral)", minWidth: 160 }}>{p.name}</span>
                        <span style={{ color: "var(--ink-3)", fontSize: 11 }}>{p.type}</span>
                        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                          <span style={{ padding: "2px 8px", background: "#fff2ef", border: "1px solid var(--coral)", borderRadius: 4, fontSize: 10, color: "var(--coral)" }}>PII</span>
                          <span style={{ padding: "2px 8px", background: "var(--panel-2)", border: "1px solid var(--line-2)", borderRadius: 4, fontSize: 10, color: "var(--ink-3)" }}>audit-logged</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </section>
              <section className="card">
                <div className="card-head">Role-based access</div>
                <div className="card-body">
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: "var(--panel-2)" }}>
                      {["Role","Access level","Scope",""].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {[
                        { role: "role:acct_admin",   access: "Read + Write", scope: "All fields" },
                        { role: "role:cs_rep",        access: "Read only",    scope: "Non-PII fields" },
                        { role: "role:analyst",       access: "Read only",    scope: "Aggregated only" },
                        { role: "role:data_platform", access: "Read + Write", scope: "All fields" },
                      ].map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--line-2)" }}>
                          <td style={{ padding: "9px 10px", fontFamily: "JetBrains Mono", fontSize: 11 }}>{r.role}</td>
                          <td style={{ padding: "9px 10px" }}>
                            <select defaultValue={r.access} style={{ padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, background: "var(--bg-canvas)", color: "var(--ink)" }}>
                              {["Read + Write","Read only","No access"].map(a => <option key={a}>{a}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: "9px 10px", color: "var(--ink-2)" }}>{r.scope}</td>
                          <td style={{ padding: "9px 10px" }}>
                            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", fontSize: 14 }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button style={{ marginTop: 12, padding: "8px 14px", border: "1px dashed var(--line)", borderRadius: 6, background: "transparent", color: "var(--ink-2)", fontSize: 12, cursor: "pointer" }}>+ Add role</button>
                </div>
              </section>
              <section className="card">
                <div className="card-head">Retention & deletion</div>
                <div className="card-body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <label><span style={lblStyle}>Retention period</span>
                      <select defaultValue="7 years" style={fldStyle}>
                        {["90 days","1 year","3 years","7 years","Indefinite"].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </label>
                    <label><span style={lblStyle}>Deletion strategy</span>
                      <select defaultValue="Soft delete" style={fldStyle}>
                        {["Soft delete","Hard delete","Anonymise"].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* GOVERNANCE */}
          {section === "Governance" && (
            <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Governance</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Ownership, domain assignment, and discoverability metadata. Tags are used to filter entities in the catalog and in agent context assembly.</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label><span style={lblStyle}>Domain</span>
                  <select value={domain} onChange={e => setDomain(e.target.value)} style={fldStyle}>
                    {["customer","service","analytics","ingest","finance","identity"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </label>
                <label><span style={lblStyle}>Category</span>
                  <select value={cat} onChange={e => setCat(e.target.value)} style={fldStyle}>
                    {["core","support","derived","source"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </label>
              </div>
              <label><span style={lblStyle}>Stewards</span>
                <input value={stewards} onChange={e => setStewards(e.target.value)} style={fldStyle} placeholder="e.g. morgan.lee, ramin.k" />
                <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>Comma-separated aliases. Stewards receive review requests on publish.</div>
              </label>
              <div>
                <span style={lblStyle}>Tags</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 7, background: "var(--bg-canvas)", minHeight: 46 }}>
                  {tags.map(t => (
                    <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "var(--panel-2)", border: "1px solid var(--line-2)", borderRadius: 4, fontSize: 11, fontFamily: "JetBrains Mono" }}>
                      {t}
                      <button onClick={() => setTags(ts => ts.filter(x => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", padding: 0, fontSize: 13, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) { e.preventDefault(); setTags(ts => [...ts, tagInput.trim()]); setTagInput(""); } }}
                    placeholder="Add tag…" style={{ border: "none", outline: "none", fontSize: 11, fontFamily: "JetBrains Mono", background: "transparent", color: "var(--ink)", minWidth: 80 }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>Press Enter or comma to add</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label><span style={lblStyle}>Runbook</span>
                  <input value={runbook} onChange={e => setRunbook(e.target.value)} style={fldStyle} />
                </label>
                <label><span style={lblStyle}>Slack channel</span>
                  <input value={slackChan} onChange={e => setSlackChan(e.target.value)} style={fldStyle} />
                </label>
              </div>
            </div>
          )}

          {/* REVIEW */}
          {section === "Review" && (
            <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Review & publish</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Review your changes before publishing. Publishing creates a new schema version and triggers downstream re-validation.</div>
              </div>
              <section className="card">
                <div className="card-head">Change summary <span className="card-head-sub">v3.2 → v3.3 draft</span></div>
                <div className="card-body">
                  {[
                    { field: "label",       old: node.label,           nw: label,       changed: label !== node.label },
                    { field: "description", old: node.desc.slice(0,36)+"…", nw: desc.slice(0,36)+"…", changed: desc !== node.desc },
                    { field: "domain",      old: "customer",           nw: domain,      changed: domain !== "customer" },
                    { field: "category",    old: node.cat,             nw: cat,         changed: cat !== node.cat },
                    { field: "state",       old: node.state,           nw: nodeState,   changed: nodeState !== node.state },
                    { field: "properties",  old: `${initProps.length} fields`, nw: `${props.length} fields`, changed: props.length !== initProps.length },
                  ].map(ch => (
                    <div key={ch.field} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--line-2)", fontSize: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 90, fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-3)", flexShrink: 0 }}>{ch.field}</div>
                      {ch.changed ? (
                        <>
                          <div style={{ flex: 1, color: "var(--coral)", textDecoration: "line-through" }}>{ch.old}</div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M5 12h14m-7-7l7 7-7 7" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinecap="round"/></svg>
                          <div style={{ flex: 1, color: "var(--green)" }}>{ch.nw}</div>
                        </>
                      ) : (
                        <div style={{ flex: 1, color: "var(--ink-3)" }}>unchanged</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
              <section className="card">
                <div className="card-head">Downstream impact</div>
                <div className="card-body">
                  {[
                    { name: "Revenue Forecaster agent",  kind: "agent",     impact: "none" },
                    { name: "CS — Account health 360",   kind: "dashboard", impact: "none" },
                    { name: "warehouse.account_dim",     kind: "pipeline",  impact: props.length !== initProps.length ? "schema drift" : "none" },
                  ].map(d => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--line-2)", fontSize: 12 }}>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-3)", minWidth: 76 }}>{d.kind}</span>
                      <span style={{ flex: 1, color: "var(--ink-2)" }}>{d.name}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: d.impact === "none" ? "#e8f5e9" : "#fff2ef", color: d.impact === "none" ? "var(--green)" : "var(--coral)", border: "1px solid " + (d.impact === "none" ? "var(--green)" : "var(--coral)") }}>
                        {d.impact === "none" ? "NO IMPACT" : d.impact.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <div style={{ padding: 28, background: published ? "#e8f5e9" : "var(--panel-2)", borderRadius: 12, border: "1px solid " + (published ? "var(--green)" : "var(--line)"), textAlign: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: published ? "var(--green)" : "var(--ink)" }}>
                  {published ? "Schema published" : "Ready to publish"}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 20 }}>
                  {published ? "v3.3 is live — downstream consumers will re-validate within 60s." : "Creates v3.3 and notifies 2 stewards for review."}
                </div>
                {!published && (
                  <button onClick={() => { setPublished(true); setTimeout(onClose, 1200); }}
                    style={{ padding: "12px 40px", borderRadius: 8, border: "none", background: "var(--ink)", color: "#fff", fontSize: 14, fontFamily: "Geist, system-ui", cursor: "pointer", fontWeight: 600 }}>
                    Publish v3.3
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: live schema snapshot */}
        <div style={{ width: 260, borderLeft: "1px solid var(--line)", padding: 20, background: "var(--panel)", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 12 }}>Schema snapshot</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{label || node.label}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 14 }}>{props.length} props · {props.filter(p => p.required).length} required · {piiProps.length} PII</div>
          {props.slice(0, 14).map(p => (
            <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 0", borderBottom: "1px solid var(--line-2)", fontSize: 11 }}>
              <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                {p.pk && <span style={{ fontSize: 8, fontWeight: 700, color: "var(--ink-3)", background: "var(--panel-2)", border: "1px solid var(--line-2)", borderRadius: 3, padding: "0 3px" }}>PK</span>}
                {p.pii && <span style={{ fontSize: 8, fontWeight: 700, color: "var(--coral)", background: "#fff2ef", border: "1px solid var(--coral)", borderRadius: 3, padding: "0 3px" }}>PII</span>}
                {p.indexed && !p.pk && <span style={{ fontSize: 8, fontWeight: 700, color: "var(--ink-3)", background: "var(--panel-2)", border: "1px solid var(--line-2)", borderRadius: 3, padding: "0 3px" }}>IDX</span>}
              </div>
              <span style={{ flex: 1, fontFamily: "JetBrains Mono", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ink-2)" }}>{p.name || <span style={{ color: "var(--ink-4)" }}>unnamed</span>}</span>
              <span style={{ color: "var(--ink-3)", fontSize: 10, flexShrink: 0 }}>{p.type}</span>
            </div>
          ))}
          {props.length > 14 && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>+{props.length - 14} more</div>}
        </div>
      </div>
    </div>
  );
}

// ---------- NODE DETAIL VIEW ------------------------------------------------

const DETAIL_TABS = ["Overview", "Properties", "Edges", "Sources", "Rules", "Quality", "Access", "History", "Sample"];

function NodeDetailView({ nodeId, onBack, onCanvas }) {
  const node = NODES.find(n => n.id === nodeId);
  const [tab, setTab] = useState("Overview");
  const [editOpen, setEditOpen] = useState(false);
  const [violationRule, setViolationRule] = useState(null);
  const [matchRule, setMatchRule] = useState(null);
  const [survConflict, setSurvConflict] = useState(null);
  const [srcLinkOpen, setSrcLinkOpen] = useState(false);
  if (!node) return null;
  if (editOpen) return <EditSchemaView node={node} properties={generateProps(node)} onClose={() => setEditOpen(false)} />;
  if (violationRule) return <ViolationDetailView rule={violationRule} node={node} onClose={() => setViolationRule(null)} />;
  if (matchRule) return <MatchReviewView rule={matchRule} node={node} onClose={() => setMatchRule(null)} />;
  if (survConflict) return <SurvivorshipConflictView rule={survConflict} node={node} onClose={() => setSurvConflict(null)} />;
  if (srcLinkOpen) return <LinkSourceFlow node={node} onClose={() => setSrcLinkOpen(false)} />;

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
            <button className="btn-dark" onClick={() => setEditOpen(true)}>Edit schema</button>
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
            <div className="kpi-v">{rules.quality.length + rules.match.length + rules.survivorship.length}</div>
            <div className="kpi-tail">{rules.quality.length} quality · {rules.match.length} match · {rules.survivorship.length} surv</div>
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
                       : t === "Rules"      ? rules.quality.length + rules.match.length + rules.survivorship.length
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
        {tab === "Sources"    && <SourcesPane sources={sources} node={node} onLinkSource={() => setSrcLinkOpen(true)} />}
        {tab === "Rules"      && <RulesPane rules={rules} node={node} onViolationClick={setViolationRule} onMatchClick={setMatchRule} onSurvClick={setSurvConflict} />}
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

// ─── LINK SOURCE FLOW ────────────────────────────────────────────────────────

function LinkSourceFlow({ node, onClose }) {
  const [step, setStep]             = useState(1);
  const [paradigm, setParadigm]     = useState(null);   // "structured" | "unstructured"
  const [connector, setConnector]   = useState(null);
  const [approach, setApproach]     = useState(null);   // "table"|"sql"|"template"|"prompt"
  const [selectedTable, setSelectedTable] = useState("");
  const [sqlQuery, setSqlQuery]     = useState("SELECT\n  id,\n  name,\n  arr_usd,\n  domain,\n  industry\nFROM accounts\nWHERE is_active = true");
  const [template, setTemplate]     = useState(null);
  const [promptText, setPromptText] = useState("");
  const [docPath, setDocPath]       = useState("");
  const [schedule, setSchedule]     = useState("hourly");
  const [saved, setSaved]           = useState(false);

  const STRUCTURED = [
    { id:"snowflake",  name:"Snowflake",   ch:"❄",  color:"#29b5e8", desc:"Data warehouse"    },
    { id:"databricks", name:"Databricks",  ch:"◈",  color:"#ff3621", desc:"Lakehouse"          },
    { id:"bigquery",   name:"BigQuery",    ch:"B",  color:"#4285f4", desc:"Google analytics DW"},
    { id:"postgres",   name:"PostgreSQL",  ch:"pg", color:"#336791", desc:"Relational DB"      },
    { id:"salesforce", name:"Salesforce",  ch:"S",  color:"#1798c1", desc:"CRM"                },
    { id:"hubspot",    name:"HubSpot",     ch:"H",  color:"#ff7a59", desc:"Marketing CRM"      },
    { id:"netsuite",   name:"NetSuite",    ch:"N",  color:"#b8923a", desc:"ERP"                },
    { id:"mysql",      name:"MySQL",       ch:"M",  color:"#00758f", desc:"Relational DB"      },
  ];
  const UNSTRUCTURED = [
    { id:"sharepoint", name:"SharePoint",  ch:"SP", color:"#038387", desc:"Microsoft docs"     },
    { id:"gdrive",     name:"Google Drive",ch:"G",  color:"#4285f4", desc:"Google Workspace"   },
    { id:"confluence", name:"Confluence",  ch:"C",  color:"#172b4d", desc:"Atlassian wiki"     },
    { id:"notion",     name:"Notion",      ch:"N",  color:"#555",    desc:"Connected workspace"},
    { id:"onedrive",   name:"OneDrive",    ch:"O",  color:"#0078d4", desc:"Microsoft personal" },
    { id:"s3",         name:"S3 / Files",  ch:"S3", color:"#ff9900", desc:"Object storage"     },
  ];
  const DOC_TEMPLATES = [
    { id:"contract",   icon:"📋", name:"Sales Contract",        fields:["party_name","contract_value","start_date","end_date","payment_terms","renewal_clause","jurisdiction","signed_date"]},
    { id:"sow",        icon:"📄", name:"Statement of Work",      fields:["project_name","scope_summary","deliverables","timeline","budget","acceptance_criteria","milestones","change_order_policy"]},
    { id:"employment", icon:"👤", name:"Employment Letter",      fields:["employee_name","title","start_date","base_salary","department","manager_name","equity_grant","probation_period"]},
    { id:"nda",        icon:"🔒", name:"NDA / Confidentiality",  fields:["disclosing_party","receiving_party","effective_date","expiry_date","scope","exclusions","governing_law"]},
    { id:"invoice",    icon:"🧾", name:"Invoice / Purchase Order",fields:["vendor_name","invoice_number","total_amount","due_date","line_items","payment_method","po_number"]},
    { id:"custom",     icon:"✏️", name:"Custom template",        fields:[]},
  ];
  const FAKE_TABLES = {
    snowflake:  ["ACCOUNTS","OPPORTUNITIES","CONTACTS","PRODUCTS","TRANSACTIONS","EVENTS"],
    databricks: ["bronze.accounts","silver.accounts_clean","gold.account_metrics","ml.churn_scores"],
    bigquery:   ["crm.accounts","analytics.account_kpis","marketing.touchpoints"],
    postgres:   ["public.accounts","public.contacts","public.deals","public.activities"],
    salesforce: ["Account","Opportunity","Contact","Lead","Case","Task"],
    hubspot:    ["companies","contacts","deals","engagements","owners"],
    netsuite:   ["CUSTOMER","TRANSACTION","ITEM","EMPLOYEE","VENDOR"],
    mysql:      ["accounts","users","orders","products","events"],
  };
  const FAKE_COLS = {
    ACCOUNTS:["Id","Name","Website","Industry","AnnualRevenue","CustomerPriority__c","BillingCountry","OwnerId","CreatedDate","LastModifiedDate"],
    Account: ["Id","Name","Website","Industry","AnnualRevenue","OwnerId","BillingCity","Type","CreatedDate"],
    _fallback: ["id","name","domain","industry","arr_usd","region","owner_id","created_at","updated_at","status"],
  };

  const tableKey = selectedTable.split(".").pop().toUpperCase();
  const sourceCols = FAKE_COLS[tableKey] || FAKE_COLS[selectedTable] || FAKE_COLS._fallback;

  const sqlOutputCols = useMemo(() => {
    const m = sqlQuery.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
    if (!m) return [];
    return m[1].split(",").map(s => s.trim().split(/\s+as\s+/i).pop().trim().replace(/[^a-z0-9_]/gi,"")).filter(Boolean);
  }, [sqlQuery]);

  const previewFields = useMemo(() => {
    if (approach === "table" && selectedTable) {
      return sourceCols.slice(0,6).map((col, i) => ({
        name: col.toLowerCase().replace(/[^a-z0-9]/g,"_"),
        type: i === 0 ? "uuid" : i <= 2 ? "string" : i === 3 ? "decimal" : "string",
        kind: "mapped", sourceCol: col, via: `${selectedTable}.${col}`,
      }));
    }
    if (approach === "sql" && sqlOutputCols.length) {
      return sqlOutputCols.map((col, i) => ({
        name: col, type: i === 0 ? "uuid" : i === 2 ? "decimal" : "string",
        kind: "computed", sourceCol: col, via: "sql:query",
      }));
    }
    if (approach === "template" && template && template !== "custom") {
      const t = DOC_TEMPLATES.find(d => d.id === template);
      return (t?.fields || []).map(f => ({ name: f, type: "string", kind: "extracted", sourceCol: f, via: `template:${template}` }));
    }
    if (approach === "prompt" && promptText) {
      return [
        { name: "extracted_value",   type: "string",  kind: "extracted", sourceCol: "—", via: "llm:prompt" },
        { name: "extracted_date",    type: "date",    kind: "extracted", sourceCol: "—", via: "llm:prompt" },
        { name: "extracted_party",   type: "string",  kind: "extracted", sourceCol: "—", via: "llm:prompt" },
        { name: "confidence_score",  type: "float",   kind: "extracted", sourceCol: "—", via: "llm:prompt" },
      ];
    }
    return [];
  }, [approach, selectedTable, sourceCols, sqlOutputCols, template, promptText]);

  const STEPS = [
    { n:1, label:"Source type",   sub: paradigm ? (paradigm==="structured"?"Structured data":"Unstructured docs") : "Choose paradigm" },
    { n:2, label:"Connector",     sub: connector ? connector.name : "Pick integration" },
    { n:3, label:"Extraction",    sub: approach ? {table:"Table mapping",sql:"SQL computed",template:"Doc template",prompt:"Custom prompt"}[approach] : "How to extract" },
    { n:4, label:"Field mapping", sub: previewFields.length ? `${previewFields.length} fields` : "Map to properties" },
    { n:5, label:"Review",        sub: saved ? "Saved ✓" : "Schedule & confirm" },
  ];

  const canNext =
    (step===1 && !!paradigm) ||
    (step===2 && !!connector) ||
    (step===3 && (approach==="table" ? !!selectedTable : approach==="sql" ? !!sqlQuery.trim() : approach==="template" ? !!template : approach==="prompt" ? !!promptText.trim() : false)) ||
    (step===4 && previewFields.length > 0) ||
    step===5;

  const fldStyle = { padding:"8px 10px", border:"1px solid var(--line)", borderRadius:6, fontSize:12, fontFamily:"Geist, system-ui", background:"var(--bg-canvas)", color:"var(--ink)", width:"100%", boxSizing:"border-box" };
  const kindColor = k => k==="computed" ? "var(--blue)" : k==="extracted" ? "var(--purple,#9b6fdf)" : "var(--green)";
  const kindBg    = k => k==="computed" ? "rgba(99,143,255,0.12)" : k==="extracted" ? "rgba(155,111,223,0.12)" : "rgba(72,199,142,0.12)";

  return (
    <div className="detail-view" style={{ display:"flex", flexDirection:"column", height:"100%" }}>

      {/* Header */}
      <div className="detail-head" style={{ flexShrink:0 }}>
        <div className="detail-crumb">
          <button className="crumb-back" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            {node.label}
          </button>
          <span className="crumb-sep">/</span>
          <span className="crumb-cur">Sources</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-cur">Link new source</span>
        </div>
        <div className="detail-title-row">
          <div className="detail-title-left">
            <h1 className="detail-title-name">Link a source</h1>
            <div className="detail-title-desc">Connect structured data or extract fields from unstructured documents</div>
          </div>
          <div className="detail-title-right" style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            {step > 1 && <button className="btn-ghost" onClick={() => setStep(s=>s-1)}>← Back</button>}
            {step < 5
              ? <button className="btn-dark" disabled={!canNext} onClick={() => setStep(s=>s+1)} style={{ opacity: canNext?1:0.45 }}>Continue →</button>
              : <button className="btn-dark" style={{ background: saved?"var(--green)":"var(--ink)", border:"none" }}
                  onClick={() => { setSaved(true); setTimeout(onClose, 900); }}>
                  {saved ? "✓ Saved" : "Save source"}
                </button>
            }
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", minHeight:0 }}>

        {/* Left nav */}
        <div style={{ width:220, flexShrink:0, borderRight:"1px solid var(--line)", padding:"24px 14px", display:"flex", flexDirection:"column", gap:4 }}>
          {STEPS.map(s => {
            const done = step > s.n, active = step === s.n;
            return (
              <button key={s.n} onClick={() => done && setStep(s.n)}
                style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 10px", borderRadius:7, border:"none", background: active?"var(--panel-2)":"transparent", cursor: done?"pointer":"default", textAlign:"left" }}>
                <span style={{ width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, flexShrink:0, background: done?"var(--green)":active?"var(--ink)":"var(--line)", color: done||active?"#fff":"var(--ink-3)", marginTop:1 }}>
                  {done ? "✓" : s.n}
                </span>
                <div>
                  <div style={{ fontSize:12, fontWeight: active?600:400, color: active?"var(--ink)":done?"var(--ink-2)":"var(--ink-3)" }}>{s.label}</div>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:1 }}>{s.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex:1, overflowY:"auto", padding:"28px 32px" }}>

          {/* ── STEP 1: Paradigm ── */}
          {step===1 && (
            <div>
              <div style={{ fontFamily:"Instrument Serif", fontSize:22, marginBottom:8 }}>What kind of data are you connecting?</div>
              <p style={{ color:"var(--ink-3)", fontSize:13, marginBottom:28, lineHeight:1.6 }}>
                Choose how this source produces properties for <strong>{node.label}</strong>.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:680 }}>
                {[
                  { id:"structured", icon:"🗄️", title:"Structured data", color:"var(--blue)",
                    desc:"Connect to a database, warehouse, or CRM. Map columns directly to properties, or write SQL to produce computed fields.",
                    examples:["Snowflake table → mapped fields","SQL query → computed property","Salesforce object → field sync","Databricks lakehouse → derived metrics"] },
                  { id:"unstructured", icon:"📄", title:"Unstructured documents", color:"var(--purple,#9b6fdf)",
                    desc:"Point to a document folder. An LLM extracts and converts document content into structured properties using templates or a custom prompt.",
                    examples:["Sales contracts → contract_value, end_date","SOWs → scope, budget, milestones","Employment letters → salary, title","Any doc → custom schema via prompt"] },
                ].map(p => (
                  <button key={p.id} onClick={() => setParadigm(p.id)}
                    style={{ padding:"24px", border:`2px solid ${paradigm===p.id ? p.color : "var(--line)"}`, borderRadius:12, background: paradigm===p.id ? p.color+"12" : "var(--panel-2)", cursor:"pointer", textAlign:"left", transition:"all 140ms" }}>
                    <div style={{ fontSize:28, marginBottom:10 }}>{p.icon}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:"var(--ink)", marginBottom:6 }}>{p.title}</div>
                    <p style={{ fontSize:12.5, color:"var(--ink-3)", lineHeight:1.55, marginBottom:14, marginTop:0 }}>{p.desc}</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {p.examples.map((ex,i) => (
                        <div key={i} style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)", display:"flex", alignItems:"center", gap:5 }}>
                          <span style={{ color: p.color }}>›</span> {ex}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Connector ── */}
          {step===2 && (
            <div>
              <div style={{ fontFamily:"Instrument Serif", fontSize:22, marginBottom:8 }}>
                {paradigm==="structured" ? "Choose a data connector" : "Choose a document store"}
              </div>
              <p style={{ color:"var(--ink-3)", fontSize:13, marginBottom:24, lineHeight:1.6 }}>
                {paradigm==="structured"
                  ? "Select the system where your data lives. Each connector handles auth, schema discovery, and incremental sync."
                  : "Select where your documents are stored. We'll index new files automatically on the configured schedule."}
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10, maxWidth:640 }}>
                {(paradigm==="structured" ? STRUCTURED : UNSTRUCTURED).map(c => (
                  <button key={c.id} onClick={() => setConnector(c)}
                    style={{ padding:"16px 12px", border:`2px solid ${connector?.id===c.id ? c.color : "var(--line)"}`, borderRadius:10, background: connector?.id===c.id ? c.color+"14" : "var(--panel-2)", cursor:"pointer", textAlign:"center", transition:"all 120ms" }}>
                    <div style={{ width:36, height:36, borderRadius:8, background: c.color+"22", color: c.color, fontFamily:"JetBrains Mono", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>{c.ch}</div>
                    <div style={{ fontSize:12.5, fontWeight:600, color:"var(--ink)", marginBottom:3 }}>{c.name}</div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{c.desc}</div>
                  </button>
                ))}
              </div>
              {connector && (
                <div style={{ marginTop:24, padding:"16px 18px", background:"var(--panel-2)", border:"1px solid var(--line)", borderRadius:10, maxWidth:480 }}>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginBottom:10, letterSpacing:"0.5px" }}>CONNECTION</div>
                  {(() => {
                    const connFields = paradigm==="structured"
                      ? [["Host / Account", connector.id==="snowflake"?"xy12345.snowflakecomputing.com":connector.id==="salesforce"?"yourorg.salesforce.com":"db.internal.company.com"],
                         ["Database / Schema", "PROD / PUBLIC"],
                         ["Auth method", "OAuth 2.0"],
                         ["Status", "Connected ✓"]]
                      : [["Root folder", docPath || "/shared/contracts"],
                         ["File types", "PDF, DOCX, TXT"],
                         ["Recurse subfolders", "Yes"],
                         ["Status", "Connected ✓"]];
                    return (
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                        {connFields.map(([k,v],i) => (
                          <div key={i}>
                            <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginBottom:3 }}>{k}</div>
                            <div style={{ fontSize:12.5, color: v.includes("✓")?"var(--green)":"var(--ink)", fontFamily: k==="Host / Account"||k==="Root folder"?"JetBrains Mono":"inherit", fontWeight: v.includes("✓")?600:400 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {paradigm==="unstructured" && (
                    <div style={{ marginTop:12 }}>
                      <label style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", display:"block", marginBottom:5 }}>FOLDER PATH</label>
                      <input value={docPath} onChange={e=>setDocPath(e.target.value)} placeholder="/shared/contracts/2026" style={fldStyle} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Extraction approach ── */}
          {step===3 && (
            <div>
              <div style={{ fontFamily:"Instrument Serif", fontSize:22, marginBottom:8 }}>How should we extract data?</div>
              <p style={{ color:"var(--ink-3)", fontSize:13, marginBottom:24, lineHeight:1.6 }}>
                {paradigm==="structured"
                  ? "Map columns from an existing table, or write a SQL query to produce computed fields."
                  : "Use a predefined document template with a known schema, or write a custom LLM prompt to define what to extract."}
              </p>

              {paradigm==="structured" && (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, maxWidth:580, marginBottom:24 }}>
                    {[
                      { id:"table", title:"Map a table", icon:"📊",
                        desc:"Browse the source schema, pick a table, and map its columns to properties on this node. Best for direct field sync." },
                      { id:"sql", title:"Write a SQL query", icon:"⌨️",
                        desc:"Run any SELECT and use the output columns as computed properties. Good for aggregations, joins, and derived fields." },
                    ].map(a => (
                      <button key={a.id} onClick={() => setApproach(a.id)}
                        style={{ padding:"20px", border:`2px solid ${approach===a.id?"var(--blue)":"var(--line)"}`, borderRadius:10, background: approach===a.id?"rgba(99,143,255,0.08)":"var(--panel-2)", cursor:"pointer", textAlign:"left", transition:"all 120ms" }}>
                        <div style={{ fontSize:24, marginBottom:8 }}>{a.icon}</div>
                        <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)", marginBottom:5 }}>{a.title}</div>
                        <div style={{ fontSize:12, color:"var(--ink-3)", lineHeight:1.5 }}>{a.desc}</div>
                      </button>
                    ))}
                  </div>

                  {approach==="table" && (
                    <div style={{ maxWidth:560 }}>
                      <label style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.5px", display:"block", marginBottom:8 }}>SELECT TABLE</label>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:16 }}>
                        {(FAKE_TABLES[connector?.id] || FAKE_TABLES.default || []).map(t => (
                          <button key={t} onClick={() => setSelectedTable(t)}
                            style={{ padding:"8px 10px", border:`1px solid ${selectedTable===t?"var(--blue)":"var(--line)"}`, borderRadius:6, background: selectedTable===t?"rgba(99,143,255,0.1)":"transparent", cursor:"pointer", fontFamily:"JetBrains Mono", fontSize:11, color: selectedTable===t?"var(--blue)":"var(--ink-3)", textAlign:"left", transition:"all 100ms" }}>
                            {t}
                          </button>
                        ))}
                      </div>
                      {selectedTable && (
                        <div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginBottom:8 }}>COLUMNS IN {selectedTable}</div>
                          <div style={{ border:"1px solid var(--line-2)", borderRadius:8, overflow:"hidden" }}>
                            {sourceCols.map((col, i) => (
                              <div key={col} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", borderBottom: i<sourceCols.length-1?"1px solid var(--line-2)":"none", background: i%2===0?"transparent":"var(--panel-2)" }}>
                                <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--blue)", flex:1 }}>{col}</span>
                                <span style={{ fontSize:11, color:"var(--ink-4)" }}>→</span>
                                <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--green)", flex:1 }}>{col.toLowerCase().replace(/[^a-z0-9]/g,"_")}</span>
                                <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--ink-4)", background:"var(--panel-2)", border:"1px solid var(--line-2)", padding:"1px 6px", borderRadius:3 }}>{i===0?"uuid":i<=2?"string":i===3?"decimal":"string"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {approach==="sql" && (
                    <div style={{ maxWidth:600 }}>
                      <label style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.5px", display:"block", marginBottom:8 }}>SQL QUERY — each SELECT column becomes a computed property</label>
                      <textarea value={sqlQuery} onChange={e=>setSqlQuery(e.target.value)} rows={9}
                        style={{ ...fldStyle, fontFamily:"JetBrains Mono", fontSize:12.5, lineHeight:1.6, resize:"vertical" }} />
                      {sqlOutputCols.length > 0 && (
                        <div style={{ marginTop:12, padding:"10px 14px", background:"var(--panel-2)", borderRadius:8, border:"1px solid var(--line-2)" }}>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginBottom:6 }}>OUTPUT COLUMNS DETECTED</div>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {sqlOutputCols.map(c => (
                              <span key={c} style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--blue)", background:"rgba(99,143,255,0.1)", padding:"2px 8px", borderRadius:4 }}>{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {paradigm==="unstructured" && (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, maxWidth:580, marginBottom:24 }}>
                    {[
                      { id:"template", title:"Use a document template", icon:"📋",
                        desc:"Pick a pre-built template (Contract, SOW, NDA…). The schema is predefined — the LLM extracts matching fields from each document." },
                      { id:"prompt", title:"Write a custom prompt", icon:"✨",
                        desc:"Describe what to extract and define the output schema manually. Best for novel document types or bespoke extraction logic." },
                    ].map(a => (
                      <button key={a.id} onClick={() => setApproach(a.id)}
                        style={{ padding:"20px", border:`2px solid ${approach===a.id?"var(--purple,#9b6fdf)":"var(--line)"}`, borderRadius:10, background: approach===a.id?"rgba(155,111,223,0.08)":"var(--panel-2)", cursor:"pointer", textAlign:"left", transition:"all 120ms" }}>
                        <div style={{ fontSize:24, marginBottom:8 }}>{a.icon}</div>
                        <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)", marginBottom:5 }}>{a.title}</div>
                        <div style={{ fontSize:12, color:"var(--ink-3)", lineHeight:1.5 }}>{a.desc}</div>
                      </button>
                    ))}
                  </div>

                  {approach==="template" && (
                    <div style={{ maxWidth:600 }}>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.5px", marginBottom:10 }}>DOCUMENT TEMPLATE</div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, marginBottom:20 }}>
                        {DOC_TEMPLATES.map(t => (
                          <button key={t.id} onClick={() => setTemplate(t.id)}
                            style={{ padding:"14px", border:`2px solid ${template===t.id?"var(--purple,#9b6fdf)":"var(--line)"}`, borderRadius:10, background: template===t.id?"rgba(155,111,223,0.08)":"var(--panel-2)", cursor:"pointer", textAlign:"left", transition:"all 120ms" }}>
                            <div style={{ fontSize:20, marginBottom:6 }}>{t.icon}</div>
                            <div style={{ fontSize:12.5, fontWeight:600, color:"var(--ink)", marginBottom:4 }}>{t.name}</div>
                            <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)" }}>{t.fields.length ? t.fields.length+" fields" : "Define your own"}</div>
                          </button>
                        ))}
                      </div>
                      {template && template !== "custom" && (
                        <div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginBottom:8 }}>FIELDS EXTRACTED BY THIS TEMPLATE</div>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {DOC_TEMPLATES.find(d=>d.id===template)?.fields.map(f => (
                              <span key={f} style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--purple,#9b6fdf)", background:"rgba(155,111,223,0.1)", padding:"3px 9px", borderRadius:5 }}>{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {template === "custom" && (
                        <div>
                          <label style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", display:"block", marginBottom:6 }}>DEFINE FIELDS (comma-separated)</label>
                          <input placeholder="field_one, field_two, field_three" style={fldStyle} />
                        </div>
                      )}
                    </div>
                  )}

                  {approach==="prompt" && (
                    <div style={{ maxWidth:600 }}>
                      <label style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.5px", display:"block", marginBottom:8 }}>EXTRACTION PROMPT</label>
                      <textarea value={promptText} onChange={e=>setPromptText(e.target.value)} rows={6} placeholder={"Extract the following from each document:\n- The counterparty company name\n- Total contract value in USD\n- Start and end dates\n- Any renewal or auto-renewal clauses"}
                        style={{ ...fldStyle, lineHeight:1.6, resize:"vertical" }} />
                      <div style={{ marginTop:16 }}>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginBottom:8 }}>OUTPUT SCHEMA — define the properties this prompt will populate</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 80px", gap:6, marginBottom:6 }}>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)" }}>Field name</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)" }}>Description</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)" }}>Type</div>
                        </div>
                        {[
                          ["extracted_value","Monetary value or key number","decimal"],
                          ["extracted_date","Primary date from document","date"],
                          ["extracted_party","Counterparty or entity name","string"],
                          ["confidence_score","LLM confidence 0–1","float"],
                        ].map(([name,desc,type],i) => (
                          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 80px", gap:6, marginBottom:6 }}>
                            <input defaultValue={name} style={{ ...fldStyle, fontFamily:"JetBrains Mono", fontSize:11 }} />
                            <input defaultValue={desc} style={{ ...fldStyle, fontSize:11 }} />
                            <select defaultValue={type} style={fldStyle}>
                              {["string","decimal","float","date","bool","int"].map(t=><option key={t}>{t}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Field mapping ── */}
          {step===4 && (
            <div>
              <div style={{ fontFamily:"Instrument Serif", fontSize:22, marginBottom:8 }}>Map fields to properties</div>
              <p style={{ color:"var(--ink-3)", fontSize:13, marginBottom:24, lineHeight:1.6 }}>
                {approach==="table" && "Each source column maps to a property on this node. Rename or retype as needed."}
                {approach==="sql"   && "Each SELECT column becomes a computed property. Set the target name and type."}
                {(approach==="template"||approach==="prompt") && "Each extracted field maps to a property. The LLM populates these on every document sync."}
              </p>

              <div style={{ border:"1px solid var(--line-2)", borderRadius:10, overflow:"hidden", maxWidth:700 }}>
                <div style={{ display:"grid", gridTemplateColumns: approach==="table"?"1.2fr 0.6fr 1fr 80px 90px":"1.2fr 1fr 80px 90px", padding:"9px 16px", background:"var(--panel-2)", borderBottom:"1px solid var(--line)", fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.5px", textTransform:"uppercase" }}>
                  {approach==="table" && <div>Source column</div>}
                  <div>{approach==="sql"?"SQL output":approach==="table"?"↓":"Extracted field"}</div>
                  <div>Property name</div>
                  <div>Type</div>
                  <div>Kind</div>
                </div>
                {previewFields.map((f, i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns: approach==="table"?"1.2fr 0.6fr 1fr 80px 90px":"1.2fr 1fr 80px 90px", padding:"10px 16px", borderBottom: i<previewFields.length-1?"1px solid var(--line-2)":"none", alignItems:"center", gap:8 }}>
                    {approach==="table" && <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{f.sourceCol}</code>}
                    {approach==="table" && <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-4)" }}>→</span>}
                    <input defaultValue={f.name} style={{ ...fldStyle, fontFamily:"JetBrains Mono", fontSize:11, padding:"5px 8px" }} />
                    <select defaultValue={f.type} style={{ ...fldStyle, fontSize:11, padding:"5px 8px" }}>
                      {["string","uuid","int","decimal","float","bool","date","timestamp"].map(t=><option key={t}>{t}</option>)}
                    </select>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10, fontWeight:600, color:kindColor(f.kind), background:kindBg(f.kind), padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap", textAlign:"center" }}>{f.kind}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop:16, padding:"12px 16px", background:"var(--panel-2)", borderRadius:8, border:"1px solid var(--line-2)", maxWidth:700, display:"flex", gap:20 }}>
                <div>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", marginBottom:4 }}>PROPERTY LINEAGE</div>
                  <div style={{ fontSize:12, color:"var(--ink-2)", lineHeight:1.5 }}>
                    Each property will carry a <code style={{ fontFamily:"JetBrains Mono", fontSize:11 }}>source</code> tag pointing back to <strong>{connector?.name}</strong> and a <code style={{ fontFamily:"JetBrains Mono", fontSize:11 }}>kind</code> of <span style={{ color:kindColor(approach==="table"?"mapped":approach==="sql"?"computed":"extracted"), fontWeight:600 }}>{approach==="table"?"mapped":approach==="sql"?"computed":"extracted"}</span>.
                    You can filter and audit by kind in the Properties tab.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Review & schedule ── */}
          {step===5 && (
            <div>
              <div style={{ fontFamily:"Instrument Serif", fontSize:22, marginBottom:8 }}>Review &amp; schedule</div>
              <p style={{ color:"var(--ink-3)", fontSize:13, marginBottom:24, lineHeight:1.6 }}>Confirm what will be created and set the sync cadence.</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:680, marginBottom:24 }}>
                {[
                  ["Node", node.label],
                  ["Connector", connector?.name || "—"],
                  ["Paradigm", paradigm==="structured"?"Structured data":"Unstructured documents"],
                  ["Extraction", {table:"Table mapping",sql:"SQL computed",template:"Doc template ("+DOC_TEMPLATES.find(d=>d.id===template)?.name+")",prompt:"Custom LLM prompt"}[approach] || "—"],
                  ["Properties to add", String(previewFields.length)],
                  ["Property kind", approach==="table"?"mapped":approach==="sql"?"computed":"extracted"],
                ].map(([k,v]) => (
                  <div key={k} style={{ padding:"12px 16px", background:"var(--panel-2)", borderRadius:8, border:"1px solid var(--line-2)" }}>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginBottom:4 }}>{k.toUpperCase()}</div>
                    <div style={{ fontSize:13.5, color:"var(--ink)", fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ maxWidth:480, marginBottom:24 }}>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.5px", marginBottom:12, textTransform:"uppercase" }}>Sync schedule</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[
                    { id:"realtime", label:"Real-time", sub:"CDC / streaming" },
                    { id:"15m",      label:"Every 15m",  sub:"Near real-time" },
                    { id:"hourly",   label:"Hourly",     sub:"Recommended"    },
                    { id:"daily",    label:"Daily",      sub:"Low frequency"  },
                    { id:"manual",   label:"Manual",     sub:"On-demand only" },
                  ].map(s => (
                    <button key={s.id} onClick={() => setSchedule(s.id)}
                      style={{ padding:"10px 14px", border:`2px solid ${schedule===s.id?"var(--ink)":"var(--line)"}`, borderRadius:8, background: schedule===s.id?"var(--ink)":"transparent", cursor:"pointer", textAlign:"left", transition:"all 120ms" }}>
                      <div style={{ fontSize:12.5, fontWeight:600, color: schedule===s.id?"#fff":"var(--ink)", marginBottom:2 }}>{s.label}</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color: schedule===s.id?"rgba(255,255,255,0.6)":"var(--ink-4)" }}>{s.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {paradigm==="unstructured" && (
                <div style={{ padding:"14px 16px", background:"var(--gold-fill)", border:"1px solid var(--gold)", borderRadius:8, maxWidth:540, marginBottom:16 }}>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--gold)", marginBottom:6, textTransform:"uppercase" }}>LLM extraction note</div>
                  <p style={{ fontSize:12.5, color:"var(--ink-2)", margin:0, lineHeight:1.55 }}>
                    Each document will be processed by an LLM on the configured schedule. Extraction quality depends on document consistency. Low-confidence extractions ({'<'}0.7) are flagged for steward review before populating properties.
                  </p>
                </div>
              )}

              {saved && (
                <div style={{ padding:"14px 16px", background:"rgba(72,199,142,0.12)", border:"1px solid var(--green)", borderRadius:8, maxWidth:480, fontFamily:"JetBrains Mono", fontSize:12, color:"var(--green)", fontWeight:600 }}>
                  ✓ Source saved — pipeline will run on next scheduled window
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right preview panel */}
        <div style={{ width:232, flexShrink:0, borderLeft:"1px solid var(--line)", padding:"20px 14px", overflowY:"auto" }}>
          <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:12 }}>Properties to create</div>
          {previewFields.length === 0 ? (
            <div style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-4)", lineHeight:1.6 }}>
              Complete the extraction step to preview the properties this source will add to <strong>{node.label}</strong>.
            </div>
          ) : (
            <>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginBottom:10 }}>
                {previewFields.length} new · via {connector?.name}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {previewFields.map((f,i) => (
                  <div key={i} style={{ padding:"8px 10px", background:"var(--panel-2)", borderRadius:7, border:"1px solid var(--line-2)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink)", fontWeight:500, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</span>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--ink-4)", flexShrink:0 }}>{f.type}</span>
                    </div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"1px 5px", borderRadius:3, color:kindColor(f.kind), background:kindBg(f.kind) }}>{f.kind}</span>
                      {f.sourceCol !== "—" && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--ink-4)", padding:"1px 5px" }}>← {f.sourceCol}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, padding:"10px", background:"var(--panel-2)", borderRadius:7, border:"1px solid var(--line-2)" }}>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", marginBottom:6 }}>LINEAGE TAGS</div>
                {[
                  { k:"source", v: connector?.id || "—" },
                  { k:"kind",   v: approach==="table"?"mapped":approach==="sql"?"computed":"extracted" },
                  { k:"via",    v: approach==="table"?selectedTable||"table":approach==="sql"?"sql:query":approach==="template"?`template:${template}`:"llm:prompt" },
                ].map(({k,v}) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)" }}>{k}</span>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-2)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SourcesPane({ sources, node, onLinkSource }) {
  const [expanded, setExpanded] = useState(null);

  const seed = node.id.charCodeAt(0) + node.id.length;

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
          <button className="btn-dark" onClick={onLinkSource}>+ Link source</button>
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

    </div>
  );
}

function NewRuleModal({ node, onClose }) {
  const props = generateProps(node);
  const firstField = props[0]?.name || "";

  // ── Global ──
  const [step, setStep]       = useState(1);
  const [category, setCategory] = useState(null); // "quality" | "match" | "survivorship"

  // ── Quality state ──
  const [qKind, setQKind]     = useState("VALIDATE");
  const [qTitle, setQTitle]   = useState("");
  const [qSev, setQSev]       = useState("ERROR");
  const [qManual, setQManual] = useState(false);
  const [qRawExpr, setQRawExpr] = useState("");
  const [vField, setVField]   = useState(firstField);
  const [vOp, setVOp]         = useState("is not null");
  const [vVal, setVVal]       = useState("");
  const [vVal2, setVVal2]     = useState("");
  const [sloDim, setSloDim]   = useState("freshness");
  const [sloField, setSloField] = useState(firstField);
  const [sloN, setSloN]       = useState("30");
  const [sloU, setSloU]       = useState("m");
  const [accScope, setAccScope] = useState("pii");
  const [accField, setAccField] = useState(props.find(p => p.pii)?.name || firstField);
  const [accRole, setAccRole]  = useState("");

  // ── Match state ──
  const [mTitle, setMTitle]   = useState("");
  const [mSignals, setMSignals] = useState([{ field: firstField, strategy: "exact", weight: 1.0 }]);
  const [mThreshAuto, setMThreshAuto]     = useState("0.92");
  const [mThreshReview, setMThreshReview] = useState("0.75");

  // ── Survivorship state ──
  const [sTitle, setSTitle]   = useState("");
  const [sProp, setSProp]     = useState(firstField);
  const [sStrategy, setSStrategy] = useState("source_priority");
  const [sSources, setSSources] = useState(["Salesforce CRM", "HubSpot Marketing", "NetSuite ERP"]);
  const [sMinConf, setSMinConf] = useState("0.80");

  // ── Helpers ──
  function opsFor(name) {
    const t = (props.find(p => p.name === name) || {}).type || "string";
    if (t === "bool")                    return ["is true", "is false", "is not null"];
    if (t === "decimal" || t === "float") return ["is not null", "=", "≠", ">", "≥", "<", "≤", "between"];
    if (t.startsWith("enum"))            return ["is not null", "is one of", "is not one of"];
    if (t === "timestamp" || t === "date") return ["is not null", "is after", "is before", "is recent within"];
    if (t === "struct")                  return ["is not null"];
    return ["is not null", "equals", "not equals", "contains", "matches regex", "starts with", "ends with"];
  }

  function buildQExpr() {
    if (qManual) return qRawExpr;
    if (qKind === "VALIDATE") {
      const f = vField, v = vVal || "?";
      if (vOp === "is not null")      return f + " IS NOT NULL";
      if (vOp === "is true")          return f + " = TRUE";
      if (vOp === "is false")         return f + " = FALSE";
      if (vOp === "=")                return f + " = " + v;
      if (vOp === "≠")                return f + " != " + v;
      if (vOp === ">")                return f + " > " + v;
      if (vOp === "≥")                return f + " >= " + v;
      if (vOp === "<")                return f + " < " + v;
      if (vOp === "≤")                return f + " <= " + v;
      if (vOp === "between")          return f + " BETWEEN " + v + " AND " + (vVal2 || "?");
      if (vOp === "is one of")        return f + " IN (" + v + ")";
      if (vOp === "is not one of")    return f + " NOT IN (" + v + ")";
      if (vOp === "equals")           return f + " = '" + v + "'";
      if (vOp === "not equals")       return f + " != '" + v + "'";
      if (vOp === "contains")         return f + " ILIKE '%" + v + "%'";
      if (vOp === "matches regex")    return f + " ~ /" + v + "/";
      if (vOp === "starts with")      return f + " ILIKE '" + v + "%'";
      if (vOp === "ends with")        return f + " ILIKE '%" + v + "'";
      if (vOp === "is after")         return f + " > '" + v + "'";
      if (vOp === "is before")        return f + " < '" + v + "'";
      if (vOp === "is recent within") return f + " >= NOW() - INTERVAL '" + v + "'";
    }
    if (qKind === "SLO") {
      if (sloDim === "freshness")    return "p95(ingest_lag) < " + sloN + sloU;
      if (sloDim === "completeness") return "fill_rate(" + sloField + ") > " + sloN + "%";
      if (sloDim === "uniqueness")   return "count_distinct(" + sloField + ") / count(*) > " + (sloN / 100);
    }
    if (qKind === "ACCESS") {
      const scope = accScope === "pii" ? "fields(pii=true)" : accScope === "all" ? "fields(*)" : accField;
      return scope + " → require role:" + (accRole || "?");
    }
    return qRawExpr;
  }

  const qExpr   = buildQExpr();
  const qOps    = opsFor(vField);
  const sevStyle = s => s === "ERROR" ? { bg:"var(--coral-fill)", c:"var(--coral)" }
                      : s === "WARN"  ? { bg:"var(--gold-fill)",  c:"var(--gold)"  }
                      :                 { bg:"var(--chip)",        c:"var(--ink-3)" };
  const strLabel = s => ({ source_priority:"Source priority", completeness:"Most complete", recency:"Most recent", recency_weighted:"Recency weighted", source_trust:"Trust tier", confidence:"Confidence", manual:"Manual override" }[s] || s);
  const strColor = s => ({ source_priority:"var(--blue)", completeness:"var(--purple)", recency:"var(--green)", recency_weighted:"var(--green)", source_trust:"var(--coral)", confidence:"var(--gold)", manual:"var(--ink-2)" }[s] || "var(--ink-3)");

  const sel = { border:"1px solid var(--line)", borderRadius:8, padding:"8px 10px", fontSize:12.5, fontFamily:"inherit", color:"var(--ink)", background:"var(--bg-canvas)", outline:"none", cursor:"pointer" };
  const inp = { border:"1px solid var(--line)", borderRadius:8, padding:"8px 10px", fontSize:12.5, fontFamily:"inherit", color:"var(--ink)", background:"var(--bg-canvas)", outline:"none", boxSizing:"border-box" };
  const lbl = { display:"block", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:7 };

  // Step labels per path
  const STEP_LABELS = {
    quality:      ["Category", "Rule kind", "Expression", "Review"],
    match:        ["Category", "Signals",   "Thresholds", "Review"],
    survivorship: ["Category", "Property",  "Strategy",   "Review"],
  };
  const stepLabels = STEP_LABELS[category] || ["Category", "Configure", "Configure", "Review"];
  const totalSteps = 4;

  // Per-step "can advance" gate
  const canNext = (function() {
    if (step === 1) return !!category;
    if (step === 2) {
      if (category === "quality")      return !!qKind;
      if (category === "match")        return mSignals.length > 0 && mSignals.every(s => s.field && s.weight > 0);
      if (category === "survivorship") return !!sProp && !!sStrategy;
    }
    if (step === 3) {
      if (category === "quality")      return !!qTitle;
      if (category === "match")        return !!mTitle && parseFloat(mThreshAuto) > 0 && parseFloat(mThreshReview) > 0;
      if (category === "survivorship") return !!sTitle;
    }
    return true;
  }());

  return (
    <div className="flow-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flow-shell" style={{ maxWidth:700, maxHeight:720, display:"flex", flexDirection:"column" }}>

        {/* ── Header ── */}
        <div className="flow-head" style={{ flexShrink:0 }}>
          <div>
            <div className="flow-eyebrow">NEW RULE · {node.label.toUpperCase()}</div>
            <div style={{ fontSize:17, fontWeight:600, color:"var(--ink)", marginTop:3 }}>
              {stepLabels[step - 1]}
            </div>
          </div>
          <div className="flow-head-right">
            <span className="flow-stage-pill">Step <b>{step}</b> / {totalSteps}</span>
            <button className="flow-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ── Step progress bar ── */}
        <div style={{ display:"flex", borderBottom:"1px solid var(--line-2)", flexShrink:0 }}>
          {stepLabels.map((s, i) => {
            const done    = i + 1 < step;
            const current = i + 1 === step;
            return (
              <div key={i} style={{ flex:1, padding:"8px 12px", background: done ? "rgba(72,199,142,0.05)" : current ? "var(--panel-2)" : "transparent", borderRight: i < stepLabels.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"JetBrains Mono", fontSize:9.5, color: done ? "var(--green)" : current ? "var(--ink)" : "var(--ink-4)" }}>
                  <span style={{ width:16, height:16, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, background: done ? "var(--green)" : current ? "var(--ink)" : "var(--line-2)", color: done || current ? "#fff" : "var(--ink-4)" }}>
                    {done ? "✓" : i + 1}
                  </span>
                  {s}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div className="flow-main" style={{ flex:1, overflowY:"auto" }}>

          {/* ════════ Step 1: Choose category ════════ */}
          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { id:"quality",      label:"Data Quality", color:"var(--coral)",  desc:"Validate field values, set SLOs, compute derived properties, and gate access to PII. Rules run on every ingest and produce per-record violation logs." },
                { id:"match",        label:"Match",        color:"var(--blue)",   desc:"Define which signals determine when two nodes represent the same entity. Set per-field strategies, weights, and confidence thresholds for auto-merge vs. human review." },
                { id:"survivorship", label:"Survivorship", color:"var(--purple)", desc:"When multiple sources assert different values for the same property, define which one wins — by source authority, recency, completeness, or extraction confidence." },
              ].map(c => (
                <div key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{ padding:"16px 18px", border:"2px solid " + (category === c.id ? c.color : "var(--line)"), borderRadius:10, cursor:"pointer", background: category === c.id ? c.color + "08" : "transparent", transition:"all 120ms" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, background: c.color + "18", color: c.color }}>{c.label.toUpperCase()}</span>
                    {category === c.id && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:c.color, marginLeft:"auto" }}>SELECTED ✓</span>}
                  </div>
                  <p style={{ fontSize:12.5, color:"var(--ink-2)", lineHeight:1.55, margin:0 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* ════════ Step 2 — Quality: Rule kind ════════ */}
          {step === 2 && category === "quality" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <div style={lbl}>Rule kind</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { id:"VALIDATE", desc:"Assert a field value meets a condition — non-null, range, format, or enum membership" },
                    { id:"COMPUTE",  desc:"Derive a new property value from an expression or agent output" },
                    { id:"SLO",      desc:"Enforce freshness, completeness, or uniqueness service-level objectives" },
                    { id:"ACCESS",   desc:"Gate access to fields based on roles — enforced on every read" },
                    { id:"INFER",    desc:"Infer new graph edges from co-occurring property patterns" },
                  ].map(k => (
                    <div key={k.id}
                      onClick={() => { setQKind(k.id); setQManual(false); }}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", border:"2px solid " + (qKind === k.id ? "var(--ink)" : "var(--line)"), borderRadius:8, cursor:"pointer", background: qKind === k.id ? "var(--panel-2)" : "transparent" }}>
                      <span className={"rule-kind rule-kind-" + k.id.toLowerCase()} style={{ flexShrink:0, minWidth:64, textAlign:"center" }}>{k.id}</span>
                      <span style={{ fontSize:12.5, color:"var(--ink-2)" }}>{k.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ ...lbl, marginBottom:8 }}>
                  Shortcuts <span style={{ fontFamily:"inherit", fontSize:11, letterSpacing:0, textTransform:"none", color:"var(--ink-3)", marginLeft:6 }}>— click to pre-fill</span>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {[
                    { label:"Required field", fn: () => { setQKind("VALIDATE"); setVOp("is not null"); setQSev("ERROR"); setQManual(false); } },
                    { label:"Non-negative",   fn: () => { setQKind("VALIDATE"); const f = props.find(p => p.type==="decimal"||p.type==="float")?.name||vField; setVField(f); setVOp("≥"); setVVal("0"); setQSev("ERROR"); setQManual(false); } },
                    { label:"Format check",   fn: () => { setQKind("VALIDATE"); setVOp("matches regex"); setVVal(""); setQSev("WARN"); setQManual(false); } },
                    { label:"Freshness SLO",  fn: () => { setQKind("SLO"); setSloDim("freshness"); setSloN("30"); setSloU("m"); setQSev("WARN"); setQManual(false); } },
                    { label:"PII gate",       fn: () => { setQKind("ACCESS"); setAccScope("pii"); setQSev("ERROR"); setQManual(false); } },
                  ].map(s => (
                    <button key={s.label} onClick={s.fn}
                      style={{ fontSize:12, padding:"5px 12px", border:"1px solid var(--line)", borderRadius:99, background:"var(--bg-canvas)", cursor:"pointer", color:"var(--ink-2)", fontFamily:"inherit" }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ Step 3 — Quality: Expression + title + severity ════════ */}
          {step === 3 && category === "quality" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <div style={lbl}>Rule title</div>
                <input value={qTitle} onChange={e => setQTitle(e.target.value)}
                  placeholder="e.g. ARR must be non-negative"
                  style={{ ...inp, width:"100%" }} />
              </div>

              {qKind === "VALIDATE" && !qManual && (
                <div>
                  <div style={lbl}>Condition</div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    <select value={vField} onChange={e => { setVField(e.target.value); const ops=opsFor(e.target.value); if (!ops.includes(vOp)) setVOp(ops[0]); }} style={sel}>
                      {props.map(p => <option key={p.name} value={p.name}>{p.name} · {p.type}</option>)}
                    </select>
                    <select value={vOp} onChange={e => setVOp(e.target.value)} style={sel}>
                      {qOps.map(op => <option key={op} value={op}>{op}</option>)}
                    </select>
                    {!["is not null","is true","is false"].includes(vOp) && (
                      <input value={vVal} onChange={e => setVVal(e.target.value)}
                        placeholder={vOp==="is one of"?"val1, val2":vOp==="matches regex"?"^[a-z]+$":"value"}
                        style={{ ...inp, width:148 }} />
                    )}
                    {vOp === "between" && (
                      <>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>and</span>
                        <input value={vVal2} onChange={e => setVVal2(e.target.value)} placeholder="value" style={{ ...inp, width:100 }} />
                      </>
                    )}
                  </div>
                </div>
              )}

              {qKind === "SLO" && !qManual && (
                <div>
                  <div style={lbl}>SLO target</div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    <select value={sloDim} onChange={e => setSloDim(e.target.value)} style={sel}>
                      <option value="freshness">Freshness — p95 ingest lag</option>
                      <option value="completeness">Completeness — fill rate</option>
                      <option value="uniqueness">Uniqueness ratio</option>
                    </select>
                    {sloDim !== "freshness" && (
                      <select value={sloField} onChange={e => setSloField(e.target.value)} style={sel}>
                        {props.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                    )}
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink-3)" }}>
                      {sloDim === "freshness" ? "< " : "> "}
                    </span>
                    <input value={sloN} onChange={e => setSloN(e.target.value)} placeholder="30" style={{ ...inp, width: 60 }} />
                    <select value={sloU} onChange={e => setSloU(e.target.value)} style={sel}>
                      {sloDim === "freshness"
                        ? <><option value="m">min</option><option value="h">hr</option><option value="d">day</option></>
                        : <option value="%">%</option>}
                    </select>
                  </div>
                </div>
              )}

              {/* Builder — ACCESS */}
              {qKind === "ACCESS" && !qManual && (
                <div>
                  <div style={lbl}>Access rule</div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    <select value={accScope} onChange={e => setAccScope(e.target.value)} style={sel}>
                      <option value="pii">All PII fields</option>
                      <option value="all">All fields</option>
                      <option value="specific">Specific field</option>
                    </select>
                    {accScope === "specific" && (
                      <select value={accField} onChange={e => setAccField(e.target.value)} style={sel}>
                        {props.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                    )}
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{"-> require role:"}</span>
                    <input value={accRole} onChange={e => setAccRole(e.target.value)} placeholder="e.g. acct_admin" style={{ ...inp, width:148 }} />
                  </div>
                </div>
              )}

              {/* COMPUTE / INFER — direct expression */}
              {(qKind === "COMPUTE" || qKind === "INFER") && (
                <div>
                  <div style={lbl}>{qKind === "COMPUTE" ? "Formula" : "Relationship pattern"}</div>
                  <textarea value={qRawExpr} onChange={e => setQRawExpr(e.target.value)}
                    placeholder={qKind === "COMPUTE" ? "risk_score := agent:cust_health.score" : "Person :PREVIOUSLY_AT Account"}
                    rows={2}
                    style={{ ...inp, width:"100%", fontFamily:"JetBrains Mono", fontSize:12, resize:"vertical", lineHeight:1.6 }} />
                </div>
              )}

              {/* Expression preview + manual toggle */}
              {(qKind === "VALIDATE" || qKind === "SLO" || qKind === "ACCESS") && (
                <div style={{ border:"1px solid var(--line-2)", borderRadius:8, background:"var(--panel-2)", overflow:"hidden" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", borderBottom:"1px dashed var(--line-2)" }}>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>Generated expression</span>
                    <button onClick={() => { setQManual(!qManual); if (!qManual) setQRawExpr(qExpr); }}
                      style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--blue)", background:"none", border:"none", cursor:"pointer", padding:0 }}>
                      {qManual ? "<- Use builder" : "Edit manually ->"}
                    </button>
                  </div>
                  <div style={{ padding:"10px 12px" }}>
                    {qManual
                      ? <textarea value={qRawExpr} onChange={e => setQRawExpr(e.target.value)} rows={2}
                          style={{ width:"100%", border:"none", background:"transparent", fontFamily:"JetBrains Mono", fontSize:12.5, color:"var(--ink)", outline:"none", resize:"none", boxSizing:"border-box", lineHeight:1.6 }} />
                      : <code style={{ fontFamily:"JetBrains Mono", fontSize:12.5, color: qExpr.includes("?") ? "var(--ink-3)" : "var(--ink)" }}>
                          {qExpr || "fill in the condition above"}
                        </code>
                    }
                  </div>
                </div>
              )}

              {/* Severity */}
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={lbl}>Severity</div>
                <div style={{ display:"flex", gap:7 }}>
                  {["ERROR","WARN","INFO"].map(s => {
                    const { bg, c } = sevStyle(s);
                    return (
                      <button key={s} onClick={() => setQSev(s)}
                        style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"5px 13px", borderRadius:5, border: qSev === s ? "2px solid "+c : "2px solid transparent", background:bg, color:c, cursor:"pointer", fontWeight:600, letterSpacing:"0.4px" }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════════ Step 2 — Match: Signal configuration ════════ */}
          {step === 2 && category === "match" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <div style={lbl}>Matching signals</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {mSignals.map((sig, i) => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <select value={sig.field}
                        onChange={e => { const ns=[...mSignals]; ns[i]={...ns[i],field:e.target.value}; setMSignals(ns); }}
                        style={{ ...sel, flex:1 }}>
                        {props.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                      <select value={sig.strategy}
                        onChange={e => { const ns=[...mSignals]; ns[i]={...ns[i],strategy:e.target.value}; setMSignals(ns); }}
                        style={sel}>
                        <option value="exact">Exact</option>
                        <option value="normalized_domain">Normalized domain</option>
                        <option value="fuzzy_name">Fuzzy name</option>
                        <option value="common_neighbor">Common neighbor</option>
                        <option value="phonetic">Phonetic</option>
                      </select>
                      <input type="number" value={sig.weight} min="0" max="1" step="0.05"
                        onChange={e => { const ns=[...mSignals]; ns[i]={...ns[i],weight:parseFloat(e.target.value)||0}; setMSignals(ns); }}
                        style={{ ...inp, width:64 }} placeholder="0.5" />
                      {mSignals.length > 1 && (
                        <button onClick={() => setMSignals(mSignals.filter((_,j) => j !== i))}
                          style={{ flexShrink:0, width:26, height:26, borderRadius:5, border:"1px solid var(--line)", background:"none", color:"var(--ink-3)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>x</button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={() => setMSignals([...mSignals, { field:firstField, strategy:"exact", weight:0.5 }])}
                  style={{ marginTop:8, fontFamily:"JetBrains Mono", fontSize:10, color:"var(--blue)", background:"none", border:"1px dashed var(--line)", borderRadius:6, padding:"6px 12px", cursor:"pointer" }}>
                  + Add signal
                </button>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ ...lbl, marginBottom:0 }}>Weight sum:</div>
                {(() => {
                  const total = mSignals.reduce((s,x) => s + (x.weight||0), 0);
                  const ok = Math.abs(total - 1) < 0.01;
                  return <span style={{ fontFamily:"JetBrains Mono", fontSize:12, fontWeight:600, color: ok ? "var(--green)" : "var(--coral)" }}>{total.toFixed(2)}{ok ? " (good)" : " — must equal 1.0"}</span>;
                })()}
              </div>
            </div>
          )}

          {/* ════════ Step 3 — Match: Title + thresholds ════════ */}
          {step === 3 && category === "match" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <div style={lbl}>Rule title</div>
                <input value={mTitle} onChange={e => setMTitle(e.target.value)}
                  placeholder="e.g. Domain-based company match"
                  style={{ ...inp, width:"100%" }} />
              </div>
              <div style={{ display:"flex", gap:16 }}>
                <div style={{ flex:1 }}>
                  <div style={lbl}>Auto-merge threshold</div>
                  <input value={mThreshAuto} onChange={e => setMThreshAuto(e.target.value)}
                    placeholder="0.92" style={{ ...inp, width:"100%" }} />
                  <div style={{ fontSize:11, color:"var(--ink-3)", marginTop:4 }}>Pairs above this score are merged automatically</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={lbl}>Review threshold</div>
                  <input value={mThreshReview} onChange={e => setMThreshReview(e.target.value)}
                    placeholder="0.75" style={{ ...inp, width:"100%" }} />
                  <div style={{ fontSize:11, color:"var(--ink-3)", marginTop:4 }}>Pairs above this score go to human review queue</div>
                </div>
              </div>
              {(() => {
                const auto   = Math.min(Math.max(parseFloat(mThreshAuto)   || 0.92, 0), 1);
                const review = Math.min(Math.max(parseFloat(mThreshReview) || 0.75, 0), 1);
                const rPct   = Math.min(review, auto) * 100;
                const aPct   = auto * 100;
                return (
                  <div>
                    <div style={lbl}>Score band preview</div>
                    <div style={{ position:"relative", height:36, borderRadius:8, overflow:"hidden", border:"1px solid var(--line-2)" }}>
                      <div style={{ position:"absolute", left:0, width:rPct+"%", height:"100%", background:"var(--coral-fill)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--coral)", fontWeight:600 }}>NO MATCH</span>
                      </div>
                      <div style={{ position:"absolute", left:rPct+"%", width:(aPct-rPct)+"%", height:"100%", background:"var(--gold-fill)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--gold)", fontWeight:600 }}>REVIEW</span>
                      </div>
                      <div style={{ position:"absolute", left:aPct+"%", right:0, height:"100%", background:"rgba(72,199,142,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--green)", fontWeight:600 }}>AUTO-MERGE</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontFamily:"JetBrains Mono", fontSize:9, color:"var(--ink-4)" }}>
                      <span>0.0</span>
                      <span>{mThreshReview}</span>
                      <span>{mThreshAuto}</span>
                      <span>1.0</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ════════ Step 2 — Survivorship: Property + strategy ════════ */}
          {step === 2 && category === "survivorship" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <div style={lbl}>Target property</div>
                <select value={sProp} onChange={e => setSProp(e.target.value)} style={{ ...sel, width:"100%" }}>
                  {props.map(p => <option key={p.name} value={p.name}>{p.name + " · " + p.type}</option>)}
                </select>
              </div>
              <div>
                <div style={lbl}>Survivorship strategy</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { id:"source_priority",  label:"Source priority",   color:"var(--blue)",   desc:"A ranked list of sources — first non-null value from the highest-ranked source wins." },
                    { id:"recency",          label:"Most recent",        color:"var(--green)",  desc:"The value with the latest updated_at timestamp across all sources wins." },
                    { id:"recency_weighted", label:"Recency weighted",   color:"var(--green)",  desc:"Recency score multiplied by a per-source trust factor — highest composite wins." },
                    { id:"completeness",     label:"Most complete",      color:"var(--purple)", desc:"The value with the highest field-fill-rate across sibling properties wins." },
                    { id:"source_trust",     label:"Trust tier",         color:"var(--coral)",  desc:"Sources are grouped into tiers; the highest tier with a non-null value wins." },
                    { id:"confidence",       label:"Confidence score",   color:"var(--gold)",   desc:"Extraction confidence (e.g. from NLP or an agent) is stored per-assertion; highest wins." },
                  ].map(s => (
                    <div key={s.id} onClick={() => setSStrategy(s.id)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", border:"2px solid "+(sStrategy===s.id?s.color:"var(--line)"), borderRadius:8, cursor:"pointer", background:sStrategy===s.id?s.color+"08":"transparent" }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, background:s.color+"18", color:s.color, flexShrink:0, minWidth:114, textAlign:"center" }}>{s.label.toUpperCase()}</span>
                      <span style={{ fontSize:12.5, color:"var(--ink-2)" }}>{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ Step 3 — Survivorship: Title + source order ════════ */}
          {step === 3 && category === "survivorship" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <div style={lbl}>Rule title</div>
                <input value={sTitle} onChange={e => setSTitle(e.target.value)}
                  placeholder={"e.g. " + sProp + ": " + strLabel(sStrategy).toLowerCase() + " wins"}
                  style={{ ...inp, width:"100%" }} />
              </div>
              {(sStrategy === "source_priority" || sStrategy === "source_trust" || sStrategy === "recency_weighted") && (
                <div>
                  <div style={lbl}>Source order <span style={{ fontFamily:"inherit", fontSize:11, letterSpacing:0, textTransform:"none", color:"var(--ink-3)", marginLeft:6 }}>use arrows to reorder</span></div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {sSources.map((src, i) => (
                      <div key={src} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", border:"1px solid var(--line)", borderRadius:8, background:"var(--panel-2)" }}>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, width:18, color:"var(--ink-3)", flexShrink:0 }}>{"#"+(i+1)}</span>
                        <span style={{ flex:1, fontSize:13 }}>{src}</span>
                        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                          <button disabled={i===0}
                            onClick={() => { const s=[...sSources]; const tmp=s[i-1]; s[i-1]=s[i]; s[i]=tmp; setSSources(s); }}
                            style={{ background:"none", border:"none", cursor:i===0?"default":"pointer", color:i===0?"var(--ink-4)":"var(--ink-2)", fontSize:10, padding:"1px 4px", lineHeight:1 }}>up</button>
                          <button disabled={i===sSources.length-1}
                            onClick={() => { const s=[...sSources]; const tmp=s[i+1]; s[i+1]=s[i]; s[i]=tmp; setSSources(s); }}
                            style={{ background:"none", border:"none", cursor:i===sSources.length-1?"default":"pointer", color:i===sSources.length-1?"var(--ink-4)":"var(--ink-2)", fontSize:10, padding:"1px 4px", lineHeight:1 }}>dn</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {sStrategy === "confidence" && (
                <div>
                  <div style={lbl}>Minimum confidence threshold</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <input value={sMinConf} onChange={e => setSMinConf(e.target.value)}
                      placeholder="0.80" style={{ ...inp, width:80 }} />
                    <span style={{ fontSize:12.5, color:"var(--ink-3)" }}>Values below this threshold are treated as missing</span>
                  </div>
                </div>
              )}
              <div style={{ padding:"12px 14px", borderRadius:8, background:strColor(sStrategy)+"0d", border:"1px solid "+strColor(sStrategy)+"40" }}>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, fontWeight:700, color:strColor(sStrategy), letterSpacing:"0.5px", marginBottom:5 }}>{"STRATEGY: "+strLabel(sStrategy).toUpperCase()}</div>
                <div style={{ fontSize:12.5, color:"var(--ink-2)", lineHeight:1.55 }}>
                  {sStrategy === "source_priority"  && ("Each ingest cycle, sources are evaluated in the order you specified. The first source with a non-null assertion for '" + sProp + "' sets the canonical value.")}
                  {sStrategy === "recency"           && ("Across all sources, the assertion with the latest updated_at timestamp for '" + sProp + "' becomes the canonical value.")}
                  {sStrategy === "recency_weighted"  && ("Each source's recency score is multiplied by its trust weight. The assertion with the highest composite score for '" + sProp + "' wins.")}
                  {sStrategy === "completeness"      && ("The source whose assertion for '" + sProp + "' is accompanied by the highest fill-rate across related properties on the same node wins.")}
                  {sStrategy === "source_trust"      && ("Sources are grouped into trust tiers based on their reliability SLA. The highest-tier source with a non-null value for '" + sProp + "' wins.")}
                  {sStrategy === "confidence"        && ("Each source assertion includes an extraction confidence score (0-1). The assertion with the highest confidence above " + sMinConf + " for '" + sProp + "' wins.")}
                </div>
              </div>
            </div>
          )}

          {/* ════════ Step 4 — Review ════════ */}
          {step === 4 && category === "quality" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase" }}>Rule preview</div>
              <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden" }}>
                <div style={{ display:"flex", alignItems:"center", gap:16, padding:"15px 18px", borderBottom:"1px solid var(--line-2)" }}>
                  <span className={"rule-kind rule-kind-" + qKind.toLowerCase()} style={{ flexShrink:0, minWidth:68, textAlign:"center" }}>{qKind}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13.5, fontWeight:500, color:"var(--ink)", marginBottom:4 }}>{qTitle || "(untitled)"}</div>
                    <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{qExpr || "(no expression)"}</code>
                  </div>
                  {(() => { const { bg, c } = sevStyle(qSev); return (
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 8px", borderRadius:4, background:bg, color:c, fontWeight:600, letterSpacing:"0.4px", flexShrink:0 }}>{qSev}</span>
                  ); })()}
                </div>
                <div style={{ display:"flex", gap:1, background:"var(--line-2)" }}>
                  {[["Node",node.label],["Runs on","Every ingest"],["Status","Will be enabled"]].map(([k,v],i) => (
                    <div key={i} style={{ flex:1, padding:"11px 16px", background:"var(--panel-2)" }}>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:9, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:3 }}>{k}</div>
                      <div style={{ fontSize:12.5, color: k==="Status"?"var(--green)":"var(--ink)", fontWeight: k==="Status"?500:400 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && category === "match" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase" }}>Rule preview</div>
              <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden" }}>
                <div style={{ padding:"15px 18px", borderBottom:"1px solid var(--line-2)" }}>
                  <div style={{ fontSize:13.5, fontWeight:500, color:"var(--ink)", marginBottom:8 }}>{mTitle || "(untitled)"}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {mSignals.map((sig,i) => (
                      <span key={i} style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 8px", borderRadius:4, background:"var(--chip)", color:"var(--ink-2)" }}>
                        {sig.field + " · " + sig.strategy + " · " + sig.weight}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", gap:1, background:"var(--line-2)" }}>
                  {[["Node",node.label],["Auto-merge",mThreshAuto],["Review at",mThreshReview]].map(([k,v],i) => (
                    <div key={i} style={{ flex:1, padding:"11px 16px", background:"var(--panel-2)" }}>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:9, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:3 }}>{k}</div>
                      <div style={{ fontSize:12.5, color:"var(--ink)" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && category === "survivorship" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase" }}>Rule preview</div>
              <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden" }}>
                <div style={{ padding:"15px 18px", borderBottom:"1px solid var(--line-2)" }}>
                  <div style={{ fontSize:13.5, fontWeight:500, color:"var(--ink)", marginBottom:6 }}>{sTitle || "(untitled)"}</div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"2px 8px", borderRadius:4, background:strColor(sStrategy)+"18", color:strColor(sStrategy), fontWeight:700 }}>{strLabel(sStrategy).toUpperCase()}</span>
                    <span style={{ fontSize:12.5, color:"var(--ink-3)" }}>{"property: " + sProp}</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:1, background:"var(--line-2)" }}>
                  {[["Node",node.label],["Property",sProp],["Status","Will be enabled"]].map(([k,v],i) => (
                    <div key={i} style={{ flex:1, padding:"11px 16px", background:"var(--panel-2)" }}>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:9, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:3 }}>{k}</div>
                      <div style={{ fontSize:12.5, color: k==="Status"?"var(--green)":"var(--ink)", fontWeight: k==="Status"?500:400 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Footer navigation ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 24px", borderTop:"1px solid var(--line-2)", flexShrink:0, background:"var(--panel-2)" }}>
          <button
            onClick={() => { if (step > 1) setStep(function(s){ return s-1; }); else onClose(); }}
            className="btn-ghost">
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < totalSteps
            ? <button
                disabled={!canNext}
                onClick={() => setStep(function(s){ return s+1; })}
                className="btn-dark"
                style={{ opacity: canNext ? 1 : 0.45 }}>
                Continue
              </button>
            : <button onClick={onClose} className="btn-dark">
                Save rule
              </button>
          }
        </div>

      </div>
    </div>
  );
}

function RulesPane({ rules, node, onViolationClick, onMatchClick, onSurvClick }) {
  const [cat, setCat]         = useState("quality");
  const [qFilter, setQFilter] = useState("all");
  const [showNewRule, setShowNewRule] = useState(false);

  const qRules = rules.quality || [];
  const mRules = rules.match || [];
  const sRules = rules.survivorship || [];

  const QKINDS = ["all","VALIDATE","COMPUTE","SLO","ACCESS","INFER"];
  const qFiltered = qFilter === "all" ? qRules : qRules.filter(r => r.kind === qFilter);
  const qCounts = QKINDS.reduce((acc, k) => { acc[k] = k === "all" ? qRules.length : qRules.filter(r => r.kind === k).length; return acc; }, {});

  const totalViolations   = qRules.reduce((sum, r) => sum + (r.violations || 0), 0);
  const avgCompliance     = qRules.length ? Math.round(qRules.reduce((sum, r) => sum + (r.compliance ?? 100), 0) / qRules.length) : 100;
  const pendingCandidates = mRules.reduce((sum, r) => sum + (r.candidates || 0), 0);
  const autoResolved      = mRules.reduce((sum, r) => sum + (r.auto_resolved || 0), 0);
  const openConflicts     = sRules.reduce((sum, r) => sum + (r.conflicts || 0), 0);

  const sevStyle = s => s === "ERROR"
    ? { bg: "var(--coral-fill)", color: "var(--coral)" }
    : s === "WARN"
    ? { bg: "var(--gold-fill)",  color: "var(--gold)"  }
    : { bg: "var(--chip)",       color: "var(--ink-3)" };

  const strategyLabel = s => ({ source_priority:"Source priority", completeness:"Most complete", recency:"Most recent", recency_weighted:"Recency weighted", source_trust:"Trust tier", confidence:"Confidence", manual:"Manual override" }[s] || s);
  const strategyColor = s => ({ source_priority:"var(--blue)", completeness:"var(--purple)", recency:"var(--green)", recency_weighted:"var(--green)", source_trust:"var(--coral)", confidence:"var(--gold)", manual:"var(--ink-2)" }[s] || "var(--ink-3)");

  const catTabs = [
    { id:"quality",      label:"Quality",      count:qRules.length,      accent: totalViolations > 0 ? "var(--coral)" : undefined },
    { id:"match",        label:"Match",        count:mRules.length,      accent: pendingCandidates > 0 ? "var(--gold)" : undefined },
    { id:"survivorship", label:"Survivorship", count:sRules.length,      accent: openConflicts > 0 ? "var(--coral)" : undefined },
  ];

  const qStats = [
    ["Total violations", totalViolations, totalViolations > 0 ? "var(--coral)" : "var(--green)"],
    ["Avg compliance",   avgCompliance + "%", "var(--ink)"],
    ["Active rules",     qRules.filter(r => r.on).length, "var(--ink)"],
  ];
  const mStats = [
    ["Pending candidates", pendingCandidates, pendingCandidates > 0 ? "var(--gold)" : "var(--green)"],
    ["Auto-resolved / 30d", autoResolved, "var(--ink)"],
    ["Active rules",        mRules.filter(r => r.on).length, "var(--ink)"],
  ];
  const sStats = [
    ["Open conflicts",     openConflicts,                     openConflicts > 0 ? "var(--coral)" : "var(--green)"],
    ["Properties covered", sRules.filter(r => r.on).length,  "var(--ink)"],
    ["Active rules",       sRules.filter(r => r.on).length,  "var(--ink)"],
  ];
  const activeStats = cat === "quality" ? qStats : cat === "match" ? mStats : sStats;

  return (
    <>
      <div className="card">

        {/* ── Category header ── */}
        <div className="card-head card-head-row">
          <div style={{ display:"flex", gap:4 }}>
            {catTabs.map(ct => (
              <button key={ct.id}
                className={"chip" + (cat === ct.id ? " on" : "")}
                onClick={() => setCat(ct.id)}
                style={cat !== ct.id && ct.accent ? {} : {}}>
                {ct.label}
                <span className="chip-n" style={ct.accent && cat !== ct.id ? { color: ct.accent } : {}}>{ct.count}</span>
              </button>
            ))}
          </div>
          <div className="card-head-actions">
            <button className="btn-dark" onClick={() => setShowNewRule(true)}>+ New rule</button>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div style={{ display:"flex", gap:1, background:"var(--line-2)", borderBottom:"1px solid var(--line-2)" }}>
          {activeStats.map(([label, val, color]) => (
            <div key={label} style={{ flex:1, padding:"12px 18px", background:"var(--panel-2)" }}>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:4 }}>{label}</div>
              <div style={{ fontFamily:"Instrument Serif", fontSize:24, color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* ── Quality tab ── */}
        {cat === "quality" && (
          <>
            <div style={{ padding:"10px 18px", borderBottom:"1px solid var(--line-2)", display:"flex", gap:4, flexWrap:"wrap" }}>
              {QKINDS.map(k => (qCounts[k] > 0 || k === "all") ? (
                <button key={k} className={"chip" + (qFilter === k ? " on" : "")} onClick={() => setQFilter(k)}>
                  {k} <span className="chip-n">{qCounts[k]}</span>
                </button>
              ) : null)}
            </div>
            <div>
              {qFiltered.map((r, i) => {
                const { bg, color } = sevStyle(r.severity || "INFO");
                const hasViol = (r.violations || 0) > 0;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:16, padding:"15px 18px", borderBottom: i < qFiltered.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                    <span className={"rule-kind rule-kind-" + r.kind.toLowerCase()} style={{ flexShrink:0, minWidth:68, textAlign:"center" }}>{r.kind}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13.5, fontWeight:500, color:"var(--ink)", marginBottom:4 }}>{r.title || r.label}</div>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.expr || r.id}</code>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:18, flexShrink:0 }}>
                      <div style={{ textAlign:"right", minWidth:100, cursor: hasViol ? "pointer" : "default" }}
                        onClick={() => hasViol && onViolationClick(r)}
                        title={hasViol ? "Click to investigate violations" : undefined}>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:12, fontWeight:600, color: hasViol ? "var(--coral)" : "var(--ink-3)", textDecoration: hasViol ? "underline" : "none" }}>
                          {r.violations !== undefined ? r.violations + " violations" : r.last}
                        </div>
                        {r.compliance !== undefined && (
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:2 }}>{r.compliance}%</div>
                        )}
                      </div>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 8px", borderRadius:4, background:bg, color, fontWeight:600, letterSpacing:"0.4px", flexShrink:0 }}>{r.severity || "INFO"}</span>
                      <label className="switch" style={{ flexShrink:0 }}>
                        <input type="checkbox" defaultChecked={r.on} />
                        <span className="switch-track" />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Match tab ── */}
        {cat === "match" && (
          <div>
            {mRules.map((r, i) => (
              <div key={i} style={{ padding:"18px 18px", borderBottom: i < mRules.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                  <span style={{ flexShrink:0, fontFamily:"JetBrains Mono", fontSize:9.5, fontWeight:700, letterSpacing:"0.5px", padding:"3px 8px", borderRadius:4, background:"rgba(99,143,255,0.14)", color:"var(--blue)", marginTop:2 }}>MATCH</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13.5, fontWeight:500, color:"var(--ink)", marginBottom:7 }}>{r.title}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:7 }}>
                      {r.signals.map((sig, j) => (
                        <span key={j} style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"2px 8px", borderRadius:4, background:"var(--panel-2)", border:"1px solid var(--line)", color:"var(--ink-2)" }}>
                          {sig.field} <span style={{ color:"var(--blue)", fontWeight:700 }}>×{sig.weight}</span>
                        </span>
                      ))}
                    </div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)" }}>
                      Auto ≥{r.threshold_auto} · Review {r.threshold_review}–{r.threshold_auto}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0, marginTop:2 }}>
                    {r.candidates > 0 ? (
                      <button onClick={() => onMatchClick(r)}
                        style={{ fontFamily:"JetBrains Mono", fontSize:11, fontWeight:600, color:"var(--gold)", background:"var(--gold-fill)", border:"1px solid var(--gold)", padding:"5px 11px", borderRadius:6, cursor:"pointer" }}>
                        {r.candidates} candidates →
                      </button>
                    ) : (
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>0 candidates</span>
                    )}
                    <div style={{ textAlign:"right", minWidth:76 }}>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{r.auto_resolved} auto</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)" }}>resolved / 30d</div>
                    </div>
                    <label className="switch" style={{ flexShrink:0 }}>
                      <input type="checkbox" defaultChecked={r.on} />
                      <span className="switch-track" />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Survivorship tab ── */}
        {cat === "survivorship" && (
          <div>
            {sRules.map((r, i) => {
              const sc = strategyColor(r.strategy);
              const sl = strategyLabel(r.strategy);
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 18px", borderBottom: i < sRules.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                  <span style={{ flexShrink:0, minWidth:68, textAlign:"center", fontFamily:"JetBrains Mono", fontSize:9.5, fontWeight:700, letterSpacing:"0.5px", padding:"3px 8px", borderRadius:4, background:"rgba(144,98,255,0.12)", color:"var(--purple)" }}>SURV</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <span style={{ fontSize:13.5, fontWeight:500, color:"var(--ink)" }}>{r.title}</span>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{r.property}</code>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"2px 7px", borderRadius:4, fontWeight:600, background:sc+"1a", color:sc }}>{sl}</span>
                    </div>
                    {r.sources && r.sources.length > 0 && (
                      <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
                        {r.sources.map((s, j) => (
                          <React.Fragment key={j}>
                            <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", background:"var(--panel-2)", border:"1px solid var(--line-2)", padding:"1px 6px", borderRadius:3 }}>{s}</span>
                            {j < r.sources.length - 1 && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--ink-4)" }}>›</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
                    {r.conflicts > 0 ? (
                      <button onClick={() => onSurvClick(r)}
                        style={{ fontFamily:"JetBrains Mono", fontSize:11, fontWeight:600, color:"var(--coral)", background:"var(--coral-fill)", border:"1px solid var(--coral)", padding:"5px 11px", borderRadius:6, cursor:"pointer" }}>
                        {r.conflicts} conflict{r.conflicts !== 1 ? "s" : ""} →
                      </button>
                    ) : (
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--green)" }}>✓ No conflicts</span>
                    )}
                    <div style={{ textAlign:"right", minWidth:80 }}>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{(r.evaluated || 0).toLocaleString()}</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)" }}>evaluated</div>
                    </div>
                    <label className="switch" style={{ flexShrink:0 }}>
                      <input type="checkbox" defaultChecked={r.on} />
                      <span className="switch-track" />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {showNewRule && <NewRuleModal node={node} onClose={() => setShowNewRule(false)} />}
    </>
  );
}

// ─── MATCH REVIEW VIEW ───────────────────────────────────────────────────────

function MatchReviewView({ rule, node, onClose }) {
  const [selected, setSelected] = useState(new Set());
  const [candStates, setCandStates] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  const baseCandidates = MATCH_CANDIDATES[rule.id] || [];
  const extra = Math.max(0, (rule.candidates || 0) - baseCandidates.length);
  const allCandidates = baseCandidates.concat(
    Array.from({ length: extra }, (_, i) => ({
      id: "cand_auto_" + i,
      score: parseFloat((0.76 + i * 0.02).toFixed(2)),
      nodeA: { id: node.id + "_" + (100 + i * 13), name: node.label + " Group " + (i + 1), source: "Salesforce CRM" },
      nodeB: { id: node.id + "_" + (200 + i * 17), name: node.label + " " + (i + 1) + " Inc.", source: "HubSpot Marketing" },
      signals: rule.signals.map(s => ({ field: s.field, match: 0.78 + i * 0.03, contribution: parseFloat((s.weight * (0.78 + i * 0.03)).toFixed(2)), note: "Signal match" })),
      status: "pending",
    }))
  );

  const getState = id => (candStates[id] || {}).action || "pending";
  const setState = (id, action) => setCandStates(s => ({ ...s, [id]: { action } }));

  const resolved = allCandidates.filter(c => getState(c.id) !== "pending").length;
  const allSel   = allCandidates.length > 0 && allCandidates.every(c => selected.has(c.id));

  const ACTIONS = [
    { id: "merged",   label: "Merge",          color: "var(--blue)",  desc: "Create canonical node" },
    { id: "linked",   label: "Link IS_SAME_AS", color: "var(--green)", desc: "Keep both, add identity edge" },
    { id: "rejected", label: "Reject",          color: "var(--coral)", desc: "Keep separate, reviewed" },
    { id: "deferred", label: "Defer",           color: "var(--ink-3)", desc: "Review later" },
  ];
  const AM = {
    pending:  { label: "Pending",    color: "var(--gold)",  bg: "var(--gold-fill)" },
    merged:   { label: "Merged",     color: "var(--blue)",  bg: "rgba(99,143,255,0.12)" },
    linked:   { label: "IS_SAME_AS", color: "var(--green)", bg: "rgba(72,199,142,0.12)" },
    rejected: { label: "Rejected",   color: "var(--coral)", bg: "var(--coral-fill)" },
    deferred: { label: "Deferred",   color: "var(--ink-3)", bg: "var(--panel-2)" },
  };

  const toggleSelect = id => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <div className="detail-view" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="detail-head" style={{ flexShrink:0 }}>
        <div className="detail-crumb">
          <button className="crumb-back" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            {node.label}
          </button>
          <span className="crumb-sep">/</span><span className="crumb-cur">Rules</span>
          <span className="crumb-sep">/</span><span className="crumb-cur">Match</span>
          <span className="crumb-sep">/</span><span className="crumb-cur">{rule.title}</span>
        </div>
        <div className="detail-title-row">
          <div className="detail-title-left">
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--blue)", background:"rgba(99,143,255,0.14)", padding:"2px 7px", borderRadius:4, fontWeight:600 }}>MATCH RULE</span>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>auto ≥{rule.threshold_auto} · review {rule.threshold_review}–{rule.threshold_auto}</span>
            </div>
            <h1 className="detail-title-name">{rule.title}</h1>
            <p className="detail-title-desc">Review candidate pairs — decide to merge into a canonical node, link with an IS_SAME_AS edge, reject, or defer.</p>
          </div>
          <div className="detail-title-right" style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"Instrument Serif", fontSize:32, color:"var(--gold)", lineHeight:1 }}>{allCandidates.length}</div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>candidates</div>
            </div>
            <div style={{ width:1, height:36, background:"var(--line)", margin:"0 4px" }} />
            <button className="btn-ghost" onClick={onClose}>← Back to rules</button>
          </div>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", minHeight:0 }}>

        {/* Sidebar */}
        <div style={{ width:256, flexShrink:0, borderRight:"1px solid var(--line)", overflowY:"auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:22 }}>
          <div>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:10 }}>Review progress</div>
            <div style={{ fontFamily:"Instrument Serif", fontSize:28, color: resolved === allCandidates.length ? "var(--green)" : "var(--gold)", lineHeight:1, marginBottom:8 }}>{resolved} / {allCandidates.length}</div>
            <div style={{ height:5, background:"var(--line)", borderRadius:3, overflow:"hidden", marginBottom:14 }}>
              <div style={{ height:"100%", width: allCandidates.length ? (resolved / allCandidates.length * 100) + "%" : "0%", background: resolved === allCandidates.length ? "var(--green)" : "var(--gold)", borderRadius:3, transition:"width 400ms" }} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[["Merged","merged","var(--blue)"],["IS_SAME_AS","linked","var(--green)"],["Rejected","rejected","var(--coral)"],["Deferred","deferred","var(--ink-3)"]].map(([lbl, key, col]) => {
                const cnt = allCandidates.filter(c => getState(c.id) === key).length;
                return (
                  <div key={key} style={{ padding:"8px 10px", background:"var(--panel-2)", borderRadius:7, border:"1px solid var(--line-2)" }}>
                    <div style={{ fontFamily:"Instrument Serif", fontSize:22, color:col, lineHeight:1 }}>{cnt}</div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--ink-3)", marginTop:3 }}>{lbl}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:10 }}>Match signals</div>
            {rule.signals.map((sig, i) => (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>{sig.field}</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--blue)", fontWeight:700 }}>×{sig.weight}</span>
                </div>
                <div style={{ height:4, background:"var(--line-2)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:(sig.weight * 100) + "%", background:"var(--blue)", transition:"width 600ms" }} />
                </div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)", marginTop:3 }}>{sig.strategy}</div>
              </div>
            ))}
          </div>

          <div style={{ background:"rgba(99,143,255,0.07)", border:"1px solid rgba(99,143,255,0.3)", borderRadius:8, padding:"12px 12px" }}>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--blue)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>Steward guidance</div>
            <p style={{ fontSize:12, color:"var(--ink-2)", lineHeight:1.55, margin:0 }}>Merge when records are definitely the same entity. Use IS_SAME_AS to preserve both representations. Reject if signals are coincidental. Defer if you need more context.</p>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          {/* Toolbar */}
          <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <input type="checkbox" checked={allSel} onChange={() => {
              const next = new Set(selected);
              if (allSel) allCandidates.forEach(c => next.delete(c.id));
              else allCandidates.forEach(c => next.add(c.id));
              setSelected(next);
            }} style={{ cursor:"pointer" }} />
            {selected.size > 0 ? (
              <>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink)", fontWeight:600 }}>{selected.size} selected</span>
                {ACTIONS.slice(0, 3).map(a => (
                  <button key={a.id}
                    onClick={() => { selected.forEach(id => setState(id, a.id)); setSelected(new Set()); }}
                    style={{ padding:"5px 11px", border:"1px solid var(--line)", borderRadius:6, background:"transparent", color:a.color, fontSize:12, fontFamily:"Geist, system-ui", cursor:"pointer", fontWeight:500 }}>
                    {a.label}
                  </button>
                ))}
                <button onClick={() => setSelected(new Set())}
                  style={{ marginLeft:"auto", padding:"5px 10px", border:"none", background:"transparent", color:"var(--ink-3)", fontSize:12, cursor:"pointer", fontFamily:"Geist, system-ui" }}>
                  Clear
                </button>
              </>
            ) : (
              <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>
                {allCandidates.length} candidate pair{allCandidates.length !== 1 ? "s" : ""} · review band {rule.threshold_review}–{rule.threshold_auto}
              </span>
            )}
          </div>

          {/* Table */}
          <div style={{ flex:1, overflowY:"auto" }}>
            <div style={{ display:"grid", gridTemplateColumns:"36px 1fr 1fr 88px 110px 110px", padding:"8px 16px", background:"var(--panel-2)", borderBottom:"1px solid var(--line)", fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.5px", textTransform:"uppercase", position:"sticky", top:0, zIndex:2 }}>
              <div /><div>Node A</div><div>Node B</div><div>Score</div><div>Source</div><div>Status</div>
            </div>

            {allCandidates.map(c => {
              const state = getState(c.id);
              const am = AM[state] || AM.pending;
              const isExp = expandedId === c.id;
              const isSel = selected.has(c.id);
              const scoreColor = c.score >= 0.90 ? "var(--coral)" : c.score >= 0.80 ? "var(--gold)" : "var(--blue)";
              return (
                <div key={c.id} style={{ borderBottom:"1px solid var(--line-2)" }}>
                  <div onClick={() => setExpandedId(isExp ? null : c.id)}
                    style={{ display:"grid", gridTemplateColumns:"36px 1fr 1fr 88px 110px 110px", padding:"12px 16px", alignItems:"center", cursor:"pointer", background: isExp ? "var(--panel-2)" : isSel ? "rgba(99,143,255,0.04)" : "transparent", transition:"background 100ms" }}>
                    <div onClick={e => { e.stopPropagation(); toggleSelect(c.id); }} style={{ display:"flex", alignItems:"center" }}>
                      <input type="checkbox" checked={isSel} readOnly style={{ cursor:"pointer" }} />
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.nodeA.name}</div>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{c.nodeA.id}</code>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.nodeB.name}</div>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{c.nodeB.id}</code>
                    </div>
                    <div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:14, fontWeight:700, color:scoreColor }}>{c.score.toFixed(2)}</div>
                      <div style={{ height:3, background:"var(--line-2)", borderRadius:2, marginTop:3, overflow:"hidden", width:50 }}>
                        <div style={{ height:"100%", width:(c.score * 100) + "%", background:scoreColor, borderRadius:2 }} />
                      </div>
                    </div>
                    <span style={{ fontSize:11, color:"var(--ink-3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.nodeA.source}</span>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10, fontWeight:600, color:am.color, background:am.bg, padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap" }}>{am.label}</span>
                  </div>

                  {isExp && (
                    <div style={{ padding:"12px 16px 14px 52px", background:"var(--panel-2)", borderTop:"1px solid var(--line-2)" }}>
                      <div style={{ marginBottom:12 }}>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:8 }}>Signal breakdown</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          {(c.signals || []).map((sig, j) => (
                            <div key={j} style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)", minWidth:160 }}>{sig.field}</span>
                              <div style={{ flex:1, height:4, background:"var(--line-2)", borderRadius:2, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:(sig.match * 100) + "%", background: sig.match >= 0.9 ? "var(--green)" : sig.match >= 0.7 ? "var(--gold)" : "var(--coral)", borderRadius:2 }} />
                              </div>
                              <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)", minWidth:36, textAlign:"right" }}>{Math.round(sig.match * 100)}%</span>
                              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--blue)", minWidth:56 }}>+{sig.contribution.toFixed(2)}</span>
                              <span style={{ fontSize:11, color:"var(--ink-4)" }}>{sig.note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)", marginRight:4 }}>Action:</span>
                        {ACTIONS.map(a => {
                          const active = state === a.id;
                          return (
                            <button key={a.id}
                              onClick={() => setState(c.id, active ? "pending" : a.id)}
                              title={a.desc}
                              style={{ padding:"6px 13px", border:"1px solid " + (active ? a.color : "var(--line)"), borderRadius:6, background: active ? a.color + "18" : "transparent", color: active ? a.color : "var(--ink-3)", fontSize:12, fontFamily:"Geist, system-ui", cursor:"pointer", fontWeight: active ? 600 : 400, transition:"all 120ms" }}>
                              {active ? "✓ " : ""}{a.label}
                            </button>
                          );
                        })}
                        <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>Score: {c.score.toFixed(3)}</span>
                          <button className="btn-ghost" style={{ fontSize:11, padding:"4px 10px" }}>View nodes →</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding:"10px 16px", borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
            <div style={{ flex:1, height:5, background:"var(--line)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width: allCandidates.length ? (resolved / allCandidates.length * 100) + "%" : "0%", background:"var(--green)", borderRadius:3, transition:"width 400ms" }} />
            </div>
            <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", flexShrink:0 }}>{resolved} / {allCandidates.length} reviewed</span>
            {resolved === allCandidates.length && allCandidates.length > 0 && (
              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--green)", fontWeight:600 }}>✓ All candidates reviewed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SURVIVORSHIP CONFLICT VIEW ───────────────────────────────────────────────

function SurvivorshipConflictView({ rule, node, onClose }) {
  const [conflictStates, setConflictStates] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [ruleActionDone, setRuleActionDone] = useState(null);

  const baseCf = SURV_CONFLICTS[rule.id] || [];
  const extra  = Math.max(0, (rule.conflicts || 0) - baseCf.length);
  const allConflicts = baseCf.concat(
    Array.from({ length: extra }, (_, i) => ({
      id: node.id + "_surv_" + i,
      property: rule.property,
      values: [
        { source: rule.sources[0] || "Source A", value: "Value from " + (rule.sources[0] || "Source A"), confidence: 0.9, updated: "2026-05-21", tier: 1 },
        { source: rule.sources[1] || "Source B", value: "Value from " + (rule.sources[1] || "Source B"), confidence: 0.7, updated: "2026-05-20", tier: 2 },
      ],
      current_winner: rule.sources[1] || "Source B",
      suggestion:     rule.sources[0] || "Source A",
      reason: "Higher trust tier",
    }))
  );

  const getState  = id => conflictStates[id] || "pending";
  const setCState = (id, action) => setConflictStates(s => ({ ...s, [id]: action }));
  const resolved  = allConflicts.filter(c => getState(c.id) !== "pending").length;

  const STRATEGY_LABELS = { source_priority:"Source priority", completeness:"Most complete", recency:"Most recent", recency_weighted:"Recency weighted", source_trust:"Trust tier", confidence:"Confidence score", manual:"Manual override" };
  const STRATEGY_COLORS = { source_priority:"var(--blue)", completeness:"var(--purple)", recency:"var(--green)", recency_weighted:"var(--green)", source_trust:"var(--coral)", confidence:"var(--gold)", manual:"var(--ink-2)" };

  const sc = STRATEGY_COLORS[rule.strategy] || "var(--ink-3)";
  const sl = STRATEGY_LABELS[rule.strategy] || rule.strategy;

  const SBADGE = {
    pending:    { label:"Pending",     color:"var(--gold)",  bg:"var(--gold-fill)" },
    accepted:   { label:"Accepted",    color:"var(--green)", bg:"rgba(72,199,142,0.12)" },
    overridden: { label:"Overridden",  color:"var(--blue)",  bg:"rgba(99,143,255,0.12)" },
    suppressed: { label:"Suppressed",  color:"var(--ink-3)", bg:"var(--panel-2)" },
  };

  return (
    <div className="detail-view" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="detail-head" style={{ flexShrink:0 }}>
        <div className="detail-crumb">
          <button className="crumb-back" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            {node.label}
          </button>
          <span className="crumb-sep">/</span><span className="crumb-cur">Rules</span>
          <span className="crumb-sep">/</span><span className="crumb-cur">Survivorship</span>
          <span className="crumb-sep">/</span><span className="crumb-cur">{rule.title}</span>
        </div>
        <div className="detail-title-row">
          <div className="detail-title-left">
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--purple)", background:"rgba(144,98,255,0.12)", padding:"2px 7px", borderRadius:4, fontWeight:600 }}>SURVIVORSHIP</span>
              <code style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>{rule.property}</code>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"2px 7px", borderRadius:4, fontWeight:600, background:sc+"1a", color:sc }}>{sl}</span>
            </div>
            <h1 className="detail-title-name">{rule.title}</h1>
            <p className="detail-title-desc">Multiple sources assert conflicting values for this property. Accept the suggested winner, pick a specific source, or enter a manual override.</p>
          </div>
          <div className="detail-title-right" style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"Instrument Serif", fontSize:32, color:"var(--coral)", lineHeight:1 }}>{allConflicts.length}</div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>conflicts</div>
            </div>
            <div style={{ width:1, height:36, background:"var(--line)", margin:"0 4px" }} />
            <button className="btn-ghost" onClick={onClose}>← Back to rules</button>
          </div>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", minHeight:0 }}>

        {/* Sidebar */}
        <div style={{ width:256, flexShrink:0, borderRight:"1px solid var(--line)", overflowY:"auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:22 }}>
          <div>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:10 }}>Resolution progress</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:8 }}>
              <span style={{ fontFamily:"Instrument Serif", fontSize:28, color: resolved === allConflicts.length ? "var(--green)" : "var(--coral)", lineHeight:1 }}>{resolved}</span>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>of {allConflicts.length} resolved</span>
            </div>
            <div style={{ height:5, background:"var(--line)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width: allConflicts.length ? (resolved / allConflicts.length * 100) + "%" : "0%", background: resolved === allConflicts.length ? "var(--green)" : "var(--coral)", borderRadius:3, transition:"width 400ms" }} />
            </div>
          </div>

          {rule.sources && rule.sources.length > 0 && (
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:8 }}>Source authority order</div>
              {rule.sources.map((s, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:"var(--panel-2)", borderRadius:6, marginBottom:5, border:"1px solid var(--line-2)" }}>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", minWidth:16, textAlign:"center" }}>#{i + 1}</span>
                  <span style={{ fontSize:12, color:"var(--ink)", flex:1 }}>{s}</span>
                  {i === 0 && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--green)", background:"rgba(72,199,142,0.12)", padding:"1px 5px", borderRadius:3 }}>authority</span>}
                </div>
              ))}
            </div>
          )}

          <div>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:8 }}>Rule actions</div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {[
                { id:"edit",     label:"Edit source priority",   desc:"Re-order authority tiers" },
                { id:"strategy", label:"Change strategy",        desc:"Switch survivorship algorithm" },
                { id:"suppress", label:"Suppress all conflicts", desc:"Accept current values, close" },
              ].map(a => (
                <button key={a.id} className="btn-ghost"
                  onClick={() => setRuleActionDone(ruleActionDone === a.id ? null : a.id)}
                  style={{ width:"100%", padding:"8px 10px", textAlign:"left", flexDirection:"column", alignItems:"flex-start", gap:1 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:"var(--ink)" }}>{a.label}</div>
                  <div style={{ fontSize:11, color:"var(--ink-3)" }}>{a.desc}</div>
                  {ruleActionDone === a.id && <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--green)", marginTop:2 }}>✓ Action taken</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr 1fr 120px", padding:"8px 16px", background:"var(--panel-2)", borderBottom:"1px solid var(--line)", fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.5px", textTransform:"uppercase", flexShrink:0 }}>
            <div>Record</div><div>Current winner</div><div>Competing value</div><div>Suggestion</div><div>Status</div>
          </div>

          <div style={{ flex:1, overflowY:"auto" }}>
            {allConflicts.length === 0 && (
              <div style={{ padding:"32px 16px", textAlign:"center", fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink-3)" }}>No conflicts to resolve.</div>
            )}
            {allConflicts.map(c => {
              const state  = getState(c.id);
              const badge  = SBADGE[state] || SBADGE.pending;
              const isExp  = expandedId === c.id;
              const curVal = c.values.find(v => v.source === c.current_winner);
              return (
                <div key={c.id} style={{ borderBottom:"1px solid var(--line-2)" }}>
                  <div onClick={() => setExpandedId(isExp ? null : c.id)}
                    style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr 1fr 120px", padding:"12px 16px", alignItems:"center", cursor:"pointer", background: isExp ? "var(--panel-2)" : "transparent", transition:"background 100ms" }}>
                    <code style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--blue)" }}>{c.id}</code>
                    <div>
                      <div style={{ fontSize:12, color:"var(--coral)", fontWeight:500, fontFamily:"JetBrains Mono", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>"{curVal ? curVal.value : "—"}"</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.current_winner}</div>
                    </div>
                    <div>
                      {c.values.filter(v => v.source !== c.current_winner).slice(0, 1).map((v, j) => (
                        <div key={j}>
                          <div style={{ fontSize:12, color:"var(--ink-2)", fontWeight:500, fontFamily:"JetBrains Mono", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>"{v.value}"</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.source}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      {c.suggestion !== c.current_winner ? (
                        <div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--green)", fontWeight:600, marginBottom:2 }}>→ {c.suggestion}</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{c.reason}</div>
                        </div>
                      ) : (
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>Current is optimal</span>
                      )}
                    </div>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10, fontWeight:600, color:badge.color, background:badge.bg, padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap" }}>{badge.label}</span>
                  </div>

                  {isExp && (
                    <div style={{ padding:"12px 16px 14px 16px", background:"var(--panel-2)", borderTop:"1px solid var(--line-2)" }}>
                      <div style={{ marginBottom:12 }}>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:8 }}>All asserted values</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          {c.values.map((v, j) => (
                            <div key={j} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 12px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6 }}>
                              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", minWidth:16 }}>#{v.tier}</span>
                              <span style={{ fontSize:12, color:"var(--ink-3)", minWidth:140 }}>{v.source}</span>
                              <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color: v.source === c.suggestion ? "var(--green)" : "var(--ink)", fontWeight: v.source === c.suggestion ? 600 : 400, flex:1 }}>"{v.value}"</code>
                              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>conf: {Math.round(v.confidence * 100)}%</span>
                              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{v.updated}</span>
                              {v.source === c.current_winner && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--coral)", background:"var(--coral-fill)", padding:"1px 5px", borderRadius:3 }}>current</span>}
                              {v.source === c.suggestion && v.source !== c.current_winner && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--green)", background:"rgba(72,199,142,0.12)", padding:"1px 5px", borderRadius:3 }}>suggested</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)", marginRight:4 }}>Resolve:</span>
                        {[
                          { action:"accepted",    label:"Accept suggestion", color:"var(--green)" },
                          { action:"overridden",  label:"Manual override",   color:"var(--blue)" },
                          { action:"suppressed",  label:"Suppress conflict", color:"var(--ink-2)" },
                        ].map(a => {
                          const active = state === a.action;
                          return (
                            <button key={a.action}
                              onClick={() => setCState(c.id, active ? "pending" : a.action)}
                              style={{ padding:"6px 13px", border:"1px solid " + (active ? a.color : "var(--line)"), borderRadius:6, background: active ? a.color + "18" : "transparent", color: active ? a.color : "var(--ink-3)", fontSize:12, fontFamily:"Geist, system-ui", cursor:"pointer", fontWeight: active ? 600 : 400, transition:"all 120ms" }}>
                              {active ? "✓ " : ""}{a.label}
                            </button>
                          );
                        })}
                        <div style={{ marginLeft:"auto" }}>
                          <button className="btn-ghost" style={{ fontSize:11, padding:"4px 10px" }}>View record →</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding:"10px 16px", borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
            <div style={{ flex:1, height:5, background:"var(--line)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width: allConflicts.length ? (resolved / allConflicts.length * 100) + "%" : "0%", background:"var(--green)", borderRadius:3, transition:"width 400ms" }} />
            </div>
            <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", flexShrink:0 }}>{resolved} / {allConflicts.length} resolved</span>
            {resolved === allConflicts.length && allConflicts.length > 0 && (
              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--green)", fontWeight:600 }}>✓ All conflicts resolved</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VIOLATION DETAIL VIEW ────────────────────────────────────────────────────

function ViolationDetailView({ rule, node, onClose }) {
  const [selected, setSelected] = useState(new Set());
  const [recordStates, setRecordStates] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [filterSrc, setFilterSrc] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [ruleActionDone, setRuleActionDone] = useState(null);

  const DOMAIN_RECORDS = [
    { id: "acc_84921", field: "domain", value: "ACME Corp",          created: "2026-05-21", source: "HubSpot Marketing" },
    { id: "acc_72103", field: "domain", value: "Riverside Motors#2", created: "2026-05-20", source: "HubSpot Marketing" },
    { id: "acc_61847", field: "domain", value: "Summit Auto & RV",   created: "2026-05-19", source: "Manual / Admin UI" },
    { id: "acc_55290", field: "domain", value: "Valley Ford!",       created: "2026-05-18", source: "HubSpot Marketing" },
    { id: "acc_48134", field: "domain", value: "Peak Auto>>",        created: "2026-05-17", source: "HubSpot Marketing" },
    { id: "acc_41209", field: "domain", value: "Green Leaf & Co",    created: "2026-05-16", source: "HubSpot Marketing" },
    { id: "acc_38770", field: "domain", value: "Fast Track LLC!",    created: "2026-05-15", source: "HubSpot Marketing" },
    { id: "acc_31044", field: "domain", value: "City Motors #4",     created: "2026-05-14", source: "Manual / Admin UI" },
    { id: "acc_29183", field: "domain", value: "Bright Horizons*",   created: "2026-05-13", source: "HubSpot Marketing" },
    { id: "acc_22091", field: "domain", value: "Auto World (East)",  created: "2026-05-12", source: "HubSpot Marketing" },
    { id: "acc_18847", field: "domain", value: "NextGen & Partners", created: "2026-05-11", source: "HubSpot Marketing" },
    { id: "acc_11293", field: "domain", value: "Premier Auto!",      created: "2026-05-10", source: "Manual / Admin UI" },
  ];

  const allRecords = rule.id === "domain_format" ? DOMAIN_RECORDS :
    Array.from({ length: Math.max(rule.violations || 3, 1) }, (_, i) => ({
      id: node.id + "_" + (10000 + i * 37 + node.id.charCodeAt(0)),
      field: (rule.expr || "field").match(/\b(\w+)\b/)?.[1] || "field",
      value: "(invalid value)",
      created: "2026-05-" + String(22 - i).padStart(2, "0"),
      source: i % 3 === 0 ? "Manual / Admin UI" : "Primary source",
    }));

  const getStatus = id => recordStates[id]?.status || "pending";
  const setRecordStatus = (id, status) =>
    setRecordStates(s => ({ ...s, [id]: { ...(s[id] || {}), status } }));

  const sourceBreakdown = rule.id === "domain_format"
    ? [{ name: "HubSpot Marketing", pct: 83, status: "degraded" }, { name: "Manual / Admin UI", pct: 17, status: "healthy" }]
    : [{ name: "Primary source", pct: 100, status: "degraded" }];

  const rootCause = rule.id === "domain_format"
    ? "10 of 12 violations originate from the HubSpot Marketing integration — company domain values arrive without URL-format validation, causing failures against the /^[a-z0-9-.]+$/ pattern. The integration team was notified on 2026-05-19 but no fix has been deployed."
    : `${rule.violations} records fail this rule. Check the source pipeline for data quality issues — the most recent batch shows elevated error rates.`;

  const totalEval = rule.violations > 0 && rule.compliance < 100
    ? Math.round(rule.violations / Math.max(0.001, (100 - rule.compliance) / 100))
    : 2840;

  const allSources = [...new Set(allRecords.map(r => r.source))];
  const filtered = allRecords.filter(r => {
    if (filterSrc !== "all" && r.source !== filterSrc) return false;
    const st = getStatus(r.id);
    if (filterStatus !== "all" && st !== filterStatus) return false;
    return true;
  });

  const statusCounts = allRecords.reduce((acc, r) => {
    const st = getStatus(r.id);
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});
  const pendingCount = statusCounts.pending ?? allRecords.length;
  const resolved = allRecords.length - pendingCount;

  const allFilteredSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allFilteredSelected) filtered.forEach(r => next.delete(r.id));
    else filtered.forEach(r => next.add(r.id));
    setSelected(next);
  };
  const toggleRow = id => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const applyBulk = action => {
    selected.forEach(id => setRecordStatus(id, action));
    setSelected(new Set());
  };

  const STATUS_MAP = {
    pending:     { label: "Pending",     color: "var(--gold)",  bg: "var(--gold-fill)" },
    quarantined: { label: "Quarantined", color: "var(--coral)", bg: "var(--coral-fill)" },
    suppressed:  { label: "Suppressed",  color: "var(--ink-3)", bg: "var(--panel-2)" },
    fixed:       { label: "Fixed",       color: "var(--green)", bg: "rgba(72,199,142,0.12)" },
    assigned:    { label: "Assigned",    color: "var(--blue)",  bg: "rgba(99,143,255,0.12)" },
  };
  const StatusBadge = ({ id }) => {
    const m = STATUS_MAP[getStatus(id)] || STATUS_MAP.pending;
    return <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 600, color: m.color, background: m.bg, padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>{m.label}</span>;
  };

  const fldStyle = { padding: "6px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12, fontFamily: "Geist, system-ui", background: "var(--bg-canvas)", color: "var(--ink)" };
  const allPending = allRecords.every(r => getStatus(r.id) === "pending");

  return (
    <div className="detail-view" style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header */}
      <div className="detail-head" style={{ flexShrink: 0 }}>
        <div className="detail-crumb">
          <button className="crumb-back" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            {node.label}
          </button>
          <span className="crumb-sep">/</span>
          <span className="crumb-cur">Rules</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-cur">{rule.title}</span>
        </div>
        <div className="detail-title-row">
          <div className="detail-title-left">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--coral)", background: "var(--coral-fill)", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>{rule.kind}</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)" }}>severity: {rule.severity}</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-4)" }}>·</span>
              <code style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-3)" }}>{rule.expr}</code>
            </div>
            <h1 className="detail-title-name">{rule.title}</h1>
          </div>
          <div className="detail-title-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "Instrument Serif", fontSize: 32, color: "var(--coral)", lineHeight: 1 }}>{rule.violations}</div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)" }}>violations</div>
            </div>
            <div style={{ width: 1, height: 36, background: "var(--line)", margin: "0 4px" }} />
            <button className="btn-ghost" onClick={onClose}>← Back to rules</button>
            {allPending && (
              <button className="btn-dark" style={{ background: "var(--coral)", border: "1px solid var(--coral)" }}
                onClick={() => allRecords.forEach(r => setRecordStatus(r.id, "quarantined"))}>
                Quarantine all {rule.violations}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

        {/* Left sidebar */}
        <div style={{ width: 256, flexShrink: 0, borderRight: "1px solid var(--line)", overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 22 }}>

          {/* Compliance */}
          <div>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 9.5, color: "var(--ink-3)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>Compliance</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: "Instrument Serif", fontSize: 30, color: rule.compliance >= 99 ? "var(--green)" : "var(--gold)", lineHeight: 1 }}>{rule.compliance}%</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)" }}>{rule.violations} of {totalEval.toLocaleString()}</span>
            </div>
            <div style={{ height: 5, background: "var(--line)", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ height: "100%", width: rule.compliance + "%", background: rule.compliance >= 99 ? "var(--green)" : rule.compliance >= 90 ? "var(--gold)" : "var(--coral)", borderRadius: 3 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { label: "Pending",     count: pendingCount,                    color: "var(--gold)",  key: "pending" },
                { label: "Resolved",    count: resolved,                        color: "var(--green)", key: "resolved" },
                { label: "Quarantined", count: statusCounts.quarantined || 0,   color: "var(--coral)", key: "quarantined" },
                { label: "Assigned",    count: statusCounts.assigned || 0,      color: "var(--blue)",  key: "assigned" },
              ].map(s => (
                <div key={s.label}
                  onClick={() => setFilterStatus(filterStatus === s.key ? "all" : s.key)}
                  style={{ padding: "8px 10px", background: filterStatus === s.key ? "var(--panel-2)" : "var(--panel-2)", borderRadius: 7, border: `1px solid ${filterStatus === s.key ? s.color : "var(--line-2)"}`, cursor: "pointer", transition: "border-color 120ms" }}>
                  <div style={{ fontFamily: "Instrument Serif", fontSize: 22, color: s.color, lineHeight: 1 }}>{s.count}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "var(--ink-3)", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Source attribution */}
          <div>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 9.5, color: "var(--ink-3)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>Source attribution</div>
            {sourceBreakdown.map((s, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.status === "degraded" ? "var(--coral)" : "var(--green)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                  {s.status === "degraded" && <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "var(--coral)", background: "var(--coral-fill)", padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>degraded</span>}
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)", flexShrink: 0 }}>{s.pct}%</span>
                </div>
                <div style={{ height: 4, background: "var(--line-2)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: s.pct + "%", background: s.status === "degraded" ? "var(--coral)" : "var(--green)", transition: "width 600ms" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Root cause */}
          <div style={{ background: "var(--gold-fill)", border: "1px solid var(--gold)", borderRadius: 8, padding: "12px 12px" }}>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "var(--gold)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>Root cause</div>
            <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>{rootCause}</p>
          </div>

          {/* Rule actions */}
          <div>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 9.5, color: "var(--ink-3)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>Rule actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { id: "issue",     label: "Create remediation issue",  desc: "File a ticket and assign to data owner" },
                { id: "notify",    label: "Notify source team",         desc: "Alert the HubSpot integration team" },
                { id: "edit-rule", label: "Adjust rule expression",    desc: "Modify the threshold or regex pattern" },
                { id: "suppress",  label: "Suppress this rule class",  desc: "Snooze with reason and expiry date" },
              ].map(a => (
                <button key={a.id} className="btn-ghost"
                  onClick={() => setRuleActionDone(ruleActionDone === a.id ? null : a.id)}
                  style={{ width: "100%", padding: "8px 10px", textAlign: "left", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{a.desc}</div>
                  {ruleActionDone === a.id && <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--green)", marginTop: 2 }}>✓ Action taken</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
            {selected.size > 0 ? (
              <>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink)", fontWeight: 600 }}>{selected.size} selected</span>
                {[
                  { id: "quarantined", label: "Quarantine", col: "var(--coral)" },
                  { id: "suppressed",  label: "Suppress",   col: "var(--ink-2)" },
                  { id: "assigned",    label: "Assign",     col: "var(--blue)" },
                  { id: "fixed",       label: "Mark fixed", col: "var(--green)" },
                ].map(a => (
                  <button key={a.id} onClick={() => applyBulk(a.id)}
                    style={{ padding: "5px 11px", border: "1px solid var(--line)", borderRadius: 6, background: "transparent", color: a.col, fontSize: 12, fontFamily: "Geist, system-ui", cursor: "pointer", fontWeight: 500 }}>
                    {a.label}
                  </button>
                ))}
                <button onClick={() => setSelected(new Set())}
                  style={{ marginLeft: "auto", padding: "5px 10px", border: "none", background: "transparent", color: "var(--ink-3)", fontSize: 12, cursor: "pointer", fontFamily: "Geist, system-ui" }}>
                  Clear
                </button>
              </>
            ) : (
              <>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-3)" }}>
                  {filtered.length} record{filtered.length !== 1 ? "s" : ""}{filterStatus !== "all" || filterSrc !== "all" ? " · filtered" : ""}
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={filterSrc} onChange={e => setFilterSrc(e.target.value)} style={fldStyle}>
                    <option value="all">All sources</option>
                    {allSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={fldStyle}>
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="quarantined">Quarantined</option>
                    <option value="suppressed">Suppressed</option>
                    <option value="fixed">Fixed</option>
                    <option value="assigned">Assigned</option>
                  </select>
                  <button className="btn-ghost" style={{ fontSize: 11, padding: "5px 10px" }}>Export CSV ↓</button>
                </div>
              </>
            )}
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "36px 1.3fr 0.75fr 1.6fr 1.4fr 0.9fr 115px", padding: "8px 16px", background: "var(--panel-2)", borderBottom: "1px solid var(--line)", fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.5px", textTransform: "uppercase", position: "sticky", top: 0, zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} style={{ cursor: "pointer" }} />
              </div>
              <div>Record ID</div><div>Field</div><div>Failing value</div><div>Source</div><div>Detected</div><div>Status</div>
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center", fontFamily: "JetBrains Mono", fontSize: 12, color: "var(--ink-3)" }}>
                No records match the current filters.
              </div>
            )}

            {filtered.map((r) => {
              const status = getStatus(r.id);
              const isExpanded = expandedId === r.id;
              const isSelected = selected.has(r.id);
              return (
                <div key={r.id} style={{ borderBottom: "1px solid var(--line-2)" }}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    style={{ display: "grid", gridTemplateColumns: "36px 1.3fr 0.75fr 1.6fr 1.4fr 0.9fr 115px", padding: "11px 16px", alignItems: "center", cursor: "pointer", background: isExpanded ? "var(--panel-2)" : isSelected ? "rgba(99,143,255,0.04)" : "transparent", transition: "background 100ms" }}
                  >
                    <div onClick={e => { e.stopPropagation(); toggleRow(r.id); }} style={{ display: "flex", alignItems: "center" }}>
                      <input type="checkbox" checked={isSelected} readOnly style={{ cursor: "pointer" }} />
                    </div>
                    <code style={{ fontFamily: "JetBrains Mono", fontSize: 11.5, color: "var(--blue)" }}>{r.id}</code>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-3)" }}>{r.field}</span>
                    <span style={{ fontSize: 12.5, color: "var(--coral)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "JetBrains Mono" }}>"{r.value}"</span>
                    <span style={{ fontSize: 12, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.source}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-4)" }}>{r.created}</span>
                    <StatusBadge id={r.id} />
                  </div>

                  {isExpanded && (
                    <div style={{ padding: "10px 16px 12px 52px", background: "var(--panel-2)", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", borderTop: "1px solid var(--line-2)" }}>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: 10.5, color: "var(--ink-4)", marginRight: 4 }}>Action:</span>
                      {[
                        { action: "quarantined", label: "Quarantine",   color: "var(--coral)" },
                        { action: "suppressed",  label: "Suppress",     color: "var(--ink-2)" },
                        { action: "fixed",       label: "Mark fixed",   color: "var(--green)" },
                        { action: "assigned",    label: "Assign to me", color: "var(--blue)"  },
                      ].map(a => {
                        const active = status === a.action;
                        return (
                          <button key={a.action}
                            onClick={() => setRecordStatus(r.id, active ? "pending" : a.action)}
                            style={{ padding: "6px 13px", border: `1px solid ${active ? a.color : "var(--line)"}`, borderRadius: 6, background: active ? a.color + "18" : "transparent", color: active ? a.color : "var(--ink-3)", fontSize: 12, fontFamily: "Geist, system-ui", cursor: "pointer", fontWeight: active ? 600 : 400, transition: "all 120ms" }}>
                            {active ? "✓ " : ""}{a.label}
                          </button>
                        );
                      })}
                      <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-4)" }}>Detected {r.created} · via {r.source}</span>
                        <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }}>View record →</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress footer */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <div style={{ flex: 1, height: 5, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: (resolved / allRecords.length * 100) + "%", background: "var(--green)", borderRadius: 3, transition: "width 400ms" }} />
            </div>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 10.5, color: "var(--ink-3)", flexShrink: 0 }}>
              {resolved} / {allRecords.length} resolved
            </span>
            {resolved === allRecords.length && (
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--green)", fontWeight: 600 }}>✓ All violations resolved</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QUALITY TAB ─────────────────────────────────────────────────────────────

function QualityPane({ node, properties }) {
  const seed = node.id.charCodeAt(0) + node.id.length;

  function spark(base, variance, s2) {
    return Array.from({ length: 30 }, (_, i) => {
      const r = Math.sin((s2 + i) * 0.7) * variance + Math.cos((s2 * 2 + i) * 0.3) * (variance * 0.5);
      return Math.max(0, Math.min(100, base + r));
    });
  }

  const dims = [
    { id: "completeness", label: "Completeness",    value: node.fill,       target: 92, data: spark(node.fill, 3, seed)     },
    { id: "conformance",  label: "Conformance",     value: node.conf,       target: 95, data: spark(node.conf, 2, seed+7)   },
    { id: "freshness",    label: "Freshness (p95)", value: 88,              target: 85, data: spark(88, 6, seed+13)          },
    { id: "uniqueness",   label: "Uniqueness",      value: 100-(seed%3),    target: 99, data: spark(99, 1, seed+21)          },
    { id: "validity",     label: "Validity",        value: 91+(seed%7),     target: 95, data: spark(92, 4, seed+17)          },
    { id: "identity",     label: "Identity match",  value: 91-(seed%6),     target: 90, data: spark(89, 5, seed+29)          },
  ];

  const [selDim, setSelDim] = useState("completeness");
  const [expandedProp, setExpandedProp] = useState(null);
  const [actionFired, setActionFired] = useState({});

  const dim = dims.find(d => d.id === selDim);
  const tc = (v, t) => v >= t ? "var(--green)" : v >= t - 5 ? "var(--gold)" : "var(--coral)";
  const tone = tc(dim.value, dim.target);
  const isAbove = dim.value >= dim.target;
  const gap = Math.max(0, dim.target - dim.value);
  const affected = Math.round((100 - dim.value) / 100 * (node.instancesN || 1000));
  const affectedStr = affected > 1000 ? (affected / 1000).toFixed(1) + "K" : affected.toLocaleString();

  const nullFields = properties.filter((_, i) => i % 3 === 0 || i % 5 === 0).slice(0, 2).map(p => p.name);

  const DIM_META = {
    completeness: {
      sources: [
        { name: "HubSpot Marketing", pct: 68, status: "degraded" },
        { name: "Manual / Admin UI", pct: 24, status: "healthy"  },
        { name: "Salesforce CRM",    pct: 8,  status: "healthy"  },
      ],
      rootCause: `${nullFields.join(", ") || "Several fields"} show elevated null rates. The HubSpot Marketing integration is sending incomplete records — 14 ingestion errors in the last 24h are the primary driver. Most nulls appear on records created after the 2026-05-20 connector update.`,
      actions: [
        { id: "backfill", label: "Trigger backfill",    desc: "Reprocess affected records from the primary source",       tone: "dark"  },
        { id: "alert",    label: "Alert source team",   desc: "Notify HubSpot integration owners of the null rate spike", tone: "ghost" },
        { id: "rule",     label: "Add not-null rule",   desc: "Create a VALIDATE rule for null-critical fields",          tone: "ghost" },
        { id: "export",   label: "Export null records", desc: "Download records with null values for manual review",      tone: "ghost" },
        { id: "monitor",  label: "Set SLO alert",       desc: "Alert if completeness drops below 90%",                   tone: "ghost" },
      ],
    },
    conformance: {
      sources: [
        { name: "NetSuite ERP",        pct: 52, status: "degraded" },
        { name: "Snowflake Warehouse", pct: 34, status: "healthy"  },
        { name: "Other",               pct: 14, status: "healthy"  },
      ],
      rootCause: "Non-conforming values originate from schema drift in the NetSuite ERP feed — arr_usd is arriving as a float string (e.g., \"1234.56\") instead of a numeric type, causing 4% of records to fail conformance checks. The issue started after the NetSuite v8.2 upgrade on 2026-05-18.",
      actions: [
        { id: "schema",    label: "Update field schema",   desc: "Modify field type to accept float strings natively",    tone: "dark"  },
        { id: "quarantine",label: "Quarantine records",    desc: "Flag non-conforming records from downstream consumption",tone: "ghost" },
        { id: "notify",    label: "Notify source team",   desc: "Alert NetSuite integration team of the type drift",     tone: "ghost" },
        { id: "export",    label: "Export non-conforming",desc: "Download failing records for manual review",            tone: "ghost" },
      ],
    },
    freshness: {
      sources: [
        { name: "Snowflake Warehouse", pct: 80, status: "degraded" },
        { name: "Salesforce CRM",      pct: 20, status: "healthy"  },
      ],
      rootCause: `Snowflake Warehouse pipeline lag detected. Last successful incremental sync: 2h 14m ago vs. 30m SLO. An upstream dbt model failure at 08:42 UTC on 2026-05-23 caused a cascade delay on signal and interaction tables. Current p95 latency: ${node.fresh}.`,
      actions: [
        { id: "pipeline", label: "Check pipeline logs",   desc: "View dbt run logs and source connector status",         tone: "dark"  },
        { id: "sync",     label: "Trigger sync",          desc: "Force an immediate incremental sync from source",       tone: "ghost" },
        { id: "slo",      label: "Adjust SLO target",     desc: "Update the freshness target threshold for this entity", tone: "ghost" },
        { id: "oncall",   label: "Page oncall",           desc: "Alert the data platform oncall engineer",               tone: "ghost" },
      ],
    },
    uniqueness: {
      sources: [
        { name: "Salesforce CRM",    pct: 60, status: "degraded" },
        { name: "Manual / Admin UI", pct: 40, status: "degraded" },
      ],
      rootCause: `${Math.max(1, Math.ceil(affected / 2))} duplicate ${node.label} entries detected — created by concurrent writes from Salesforce and Manual/Admin UI during the 2026-05-20 maintenance window. The conflict resolution policy is not yet enforced for this entity.`,
      actions: [
        { id: "dedup",   label: "Find duplicates",      desc: "View all duplicate record pairs for review",              tone: "dark"  },
        { id: "merge",   label: "Auto-merge low-risk",  desc: "Automatically merge confirmed duplicate pairs",          tone: "ghost" },
        { id: "alert",   label: "Set uniqueness alert", desc: "Alert if uniqueness drops below 99.5%",                  tone: "ghost" },
        { id: "export",  label: "Export duplicate pairs",desc: "Download all duplicates for manual resolution",         tone: "ghost" },
      ],
    },
    validity: {
      sources: [
        { name: "Snowflake Warehouse", pct: 70, status: "degraded" },
        { name: "Manual / Admin UI",   pct: 30, status: "healthy"  },
      ],
      rootCause: `Validity failures are concentrated in computed fields — ${(seed%3)+2} risk_score values outside the [0,100] range originating from a cold-start edge case in the scoring model. Records with no historical activity receive a sentinel value of 101 which fails validation.`,
      actions: [
        { id: "investigate", label: "Investigate failing records", desc: "View all records that fail validation rules",  tone: "dark"  },
        { id: "fix",         label: "Fix at source",              desc: "Navigate to the scoring model configuration",  tone: "ghost" },
        { id: "quarantine",  label: "Quarantine invalids",        desc: "Block invalid records from downstream use",    tone: "ghost" },
        { id: "export",      label: "Export invalid records",     desc: "Download failing records for review",          tone: "ghost" },
      ],
    },
    identity: {
      sources: [
        { name: "Okta Identity",     pct: 55, status: "degraded" },
        { name: "HubSpot Marketing", pct: 45, status: "degraded" },
      ],
      rootCause: "68% of identity match failures are caused by missing email_domain — Person records from HubSpot lack a normalized email field, preventing linkage to the Employee graph. The remaining 32% are name format variations (e.g., \"J. Smith\" vs \"John Smith\") that the fuzzy matcher cannot resolve.",
      actions: [
        { id: "resolve",  label: "Run entity resolution", desc: "Trigger the identity stitching pipeline",              tone: "dark"  },
        { id: "review",   label: "Review candidates",     desc: "See unmatched records with suggested links",           tone: "ghost" },
        { id: "alert",    label: "Set match alert",       desc: "Alert if identity match drops below 88%",              tone: "ghost" },
        { id: "export",   label: "Export unmatched",      desc: "Download unmatched entity pairs",                      tone: "ghost" },
      ],
    },
  };

  const meta = DIM_META[selDim] || DIM_META.completeness;

  function MiniSparkline({ data, color, w = 120, h = 32 }) {
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

  function TrendChart({ data, color, target, w = 640, h = 90 }) {
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const area = pts + ` ${w},${h} 0,${h}`;
    const tgtY = h - ((target - min) / range) * (h - 8) - 4;
    const dips = data.map((v, i) => v < target ? i : null).filter(i => i !== null);
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <polygon points={area} fill={color} opacity="0.09" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {tgtY > 0 && tgtY < h && (
          <>
            <line x1="0" y1={tgtY} x2={w} y2={tgtY} stroke={color} strokeWidth="0.9" strokeDasharray="4 4" opacity="0.55" />
            <text x="5" y={Math.max(10, tgtY - 4)} fontSize="9" fill={color} fontFamily="JetBrains Mono, monospace" opacity="0.8">target {target}%</text>
          </>
        )}
        {dips.slice(0, 4).map(i => {
          const ptPairs = pts.split(" ")[i]?.split(",");
          if (!ptPairs) return null;
          return <circle key={i} cx={parseFloat(ptPairs[0])} cy={parseFloat(ptPairs[1])} r="3.5" fill="var(--coral)" opacity="0.75" />;
        })}
      </svg>
    );
  }

  const propData = properties.map((p, i) => {
    const pseed = (seed + i * 7) % 17;
    const fill = Math.min(100, p.fill + (i % 3 === 0 ? -8 : i % 5 === 0 ? -15 : 0));
    const conf = Math.min(100, p.conf + (i % 4 === 0 ? -6 : 0));
    const nulls = Math.floor((100 - fill) / 100 * (node.instancesN || 100));
    const viols = i % 7 === 0 ? Math.floor(pseed * 4) : 0;
    const ok = fill >= 90 && conf >= 92 && viols === 0;
    return { ...p, fill, conf, nulls, viols, ok };
  });

  const fireAction = (dimId, actionId) => setActionFired(prev => ({ ...prev, [dimId + "_" + actionId]: true }));
  const isFired = (dimId, actionId) => !!actionFired[dimId + "_" + actionId];

  return (
    <div className="quality-pane">
      {/* ── KPI cards ── */}
      <div className="quality-kpis">
        {dims.map(d => {
          const c = tc(d.value, d.target);
          const g = Math.max(0, d.target - d.value);
          return (
            <button key={d.id} className={"qkpi" + (selDim === d.id ? " on" : "")} onClick={() => setSelDim(d.id)}>
              <div className="qkpi-top">
                <span className="qkpi-label">{d.label}</span>
                <span className="qkpi-v" style={{ color: c }}>{d.value}%</span>
              </div>
              <MiniSparkline data={d.data} color={c} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="qkpi-target">target {d.target}%</span>
                {g > 0
                  ? <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--coral)", fontWeight: 600 }}>−{g.toFixed(1)}%</span>
                  : <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--green)" }}>✓ above</span>
                }
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Drill-down detail panel ── */}
      <div className="card quality-detail">
        {/* Impact summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--line-2)", borderBottom: "1px solid var(--line-2)" }}>
          {[
            { label: "Current",   val: dim.value + "%",                                                          color: tone },
            { label: "Target",    val: dim.target + "%",                                                          color: "var(--ink)" },
            { label: "Gap",       val: isAbove ? "— above target" : "−" + gap.toFixed(1) + "% below target",    color: isAbove ? "var(--green)" : "var(--coral)" },
            { label: "Affected",  val: isAbove ? "0 records" : affectedStr + " records",                         color: "var(--ink)" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ padding: "12px 18px", background: "var(--panel-2)" }}>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 9.5, letterSpacing: "0.6px", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "Instrument Serif", fontSize: 21, color, lineHeight: 1 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <div style={{ padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0 10px" }}>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>{dim.label} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--ink-3)" }}>· 30-day trend · rolling 24h window</span></span>
            <select className="input input-select input-sm" defaultValue="30d" style={{ width: 90 }}>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
            </select>
          </div>
          <TrendChart data={dim.data} color={tone} target={dim.target} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)", paddingBottom: 14 }}>
            <span>30 days ago</span>
            <span style={{ color: "var(--coral)" }}>● below-target anomaly</span>
            <span>today</span>
          </div>
        </div>

        {/* Source attribution */}
        <div style={{ padding: "14px 20px 18px", borderTop: "1px solid var(--line-2)" }}>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12 }}>Source attribution</div>
          {meta.sources.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: s.status === "degraded" ? "var(--coral)" : "var(--green)" }} />
              <span style={{ fontSize: 13, color: "var(--ink)", minWidth: 170 }}>{s.name}</span>
              {s.status === "degraded" && <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--coral)", background: "var(--coral-fill)", padding: "1px 6px", borderRadius: 3, flexShrink: 0 }}>degraded</span>}
              <div style={{ flex: 1, height: 5, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: s.pct + "%", background: s.status === "degraded" ? "var(--coral)" : "var(--green)", transition: "width 600ms" }} />
              </div>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-3)", minWidth: 34, textAlign: "right" }}>{s.pct}%</span>
            </div>
          ))}
        </div>

        {/* Root cause + actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--line-2)" }}>
          <div style={{ padding: "18px 20px", borderRight: "1px solid var(--line-2)" }}>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 10 }}>Root cause</div>
            <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65, margin: 0 }}>{meta.rootCause}</p>
          </div>
          <div style={{ padding: "18px 20px" }}>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 10 }}>Recommended actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {meta.actions.map(a => (
                <button
                  key={a.id}
                  className={isFired(selDim, a.id) ? "btn-ghost" : a.tone === "dark" ? "btn-dark" : "btn-ghost"}
                  onClick={() => fireAction(selDim, a.id)}
                  style={{ justifyContent: "flex-start", gap: 8, padding: "8px 12px", fontSize: 12.5, textAlign: "left" }}
                  title={a.desc}
                >
                  <span style={{ flex: 1 }}>{a.label}</span>
                  {isFired(selDim, a.id) && <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--green)", fontWeight: 600 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Per-property breakdown ── */}
      <div className="card">
        <div className="card-head card-head-row">
          <div>Per-property breakdown <span className="card-head-sub">for {dim.label.toLowerCase()} · click row to drill into failing records</span></div>
          <div className="card-head-actions">
            <button className="btn-ghost" style={{ fontSize: 12 }}>Export CSV ↓</button>
          </div>
        </div>
        <div className="qprop-table">
          <div className="qprop-head">
            <div>Property</div><div>Type</div><div className="qprop-num">Fill %</div><div className="qprop-num">Conformance %</div><div className="qprop-num">Nulls</div><div className="qprop-num">Violations</div><div>Status</div>
          </div>
          {propData.map((p, i) => (
            <React.Fragment key={i}>
              <div
                className="qprop-row"
                style={{ cursor: (p.nulls > 0 || p.viols > 0) ? "pointer" : "default", background: expandedProp === i ? "var(--panel-2)" : "" }}
                onClick={() => setExpandedProp(expandedProp === i ? null : (p.nulls > 0 || p.viols > 0) ? i : null)}
              >
                <div className="qprop-name">
                  <span className="snap-n">{p.name}</span>
                  {p.pii && <span className="snap-tag snap-pii">PII</span>}
                  {(p.nulls > 0 || p.viols > 0) && <span style={{ marginLeft: 4, fontSize: 9, color: "var(--ink-4)" }}>{expandedProp === i ? "▲" : "▼"}</span>}
                </div>
                <div className="prop-type">{p.type}</div>
                <div className="qprop-num">
                  <div className="nv-bar"><div className="nv-bar-fill" style={{ width: p.fill + "%", background: metricColor(p.fill) }} /></div>
                  <span className="nv-bar-v" style={{ color: metricColor(p.fill) }}>{p.fill}%</span>
                </div>
                <div className="qprop-num">
                  <div className="nv-bar"><div className="nv-bar-fill" style={{ width: p.conf + "%", background: metricColor(p.conf) }} /></div>
                  <span className="nv-bar-v" style={{ color: metricColor(p.conf) }}>{p.conf}%</span>
                </div>
                <div className="qprop-num" style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: p.nulls > 0 ? "var(--gold)" : "var(--ink-3)" }}>{p.nulls.toLocaleString()}</div>
                <div className="qprop-num" style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: p.viols > 0 ? "var(--coral)" : "var(--ink-3)" }}>{p.viols}</div>
                <div><span className={"qstatus qstatus-" + (p.ok ? "ok" : p.viols > 0 ? "fail" : "warn")}>{p.ok ? "passing" : p.viols > 0 ? "failing" : "warning"}</span></div>
              </div>
              {expandedProp === i && (
                <div style={{ background: "var(--panel-2)", borderBottom: "1px solid var(--line-2)", padding: "14px 18px" }}>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.5px", marginBottom: 10 }}>
                    {p.nulls > 0 ? `${p.nulls.toLocaleString()} records with null ${p.name}` : `${p.viols} records failing validation on ${p.name}`} — sample
                  </div>
                  <div style={{ border: "1px solid var(--line)", borderRadius: 7, overflow: "hidden", background: "var(--panel)", marginBottom: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", padding: "7px 12px", background: "var(--bg-canvas)", borderBottom: "1px solid var(--line)", fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                      <div>Record ID</div><div>Value</div><div>Source</div>
                    </div>
                    {Array.from({ length: Math.min(3, p.nulls || p.viols || 1) }, (_, ri) => (
                      <div key={ri} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", padding: "9px 12px", borderBottom: ri < 2 ? "1px solid var(--line-2)" : "none", alignItems: "center" }}>
                        <code style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--blue)" }}>{node.id}_{(10000 + ri * 1337 + i * 73).toString(36).toUpperCase()}</code>
                        <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: p.viols > 0 ? "var(--coral)" : "var(--gold)" }}>{p.viols > 0 ? "(invalid)" : "null"}</span>
                        <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{ri === 0 ? "HubSpot Marketing" : ri === 1 ? "Salesforce CRM" : "Manual / Admin UI"}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-ghost" style={{ fontSize: 11.5, padding: "5px 10px" }}>Export {p.nulls || p.viols} records ↓</button>
                    <button className="btn-ghost" style={{ fontSize: 11.5, padding: "5px 10px" }}>Trigger backfill</button>
                    <button className="btn-ghost" style={{ fontSize: 11.5, padding: "5px 10px" }}>Create issue ↗</button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
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
  const [nodes, setNodes] = useState(NODES.filter(n => n.type !== "agent"));
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
        {selectedNode && <Inspector node={selectedNode} onClose={() => setSelected(null)} onOpenDetail={() => { setDetailId(selectedNode.id); setTab("Nodes"); }} />}
      </div>
      )}
      {addNodeOpen && window.AddNodeFlow && <window.AddNodeFlow onClose={() => setAddNodeOpen(false)} />}
    </div>
  );
}

Object.assign(window, { NODES, EDGES, ListGlyph, colorForNode, CAT_META, metricColor });

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
