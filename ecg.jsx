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

// ─── Brand-styled SVG glyphs for source systems ───────────────────────────────
// Tasteful stylised marks (not literal trademarked assets) — Snowflake's
// snowflake, Salesforce's cloud, HubSpot's sprocket, etc. Used in the Sources
// catalog and the connector picker so the rows feel less monotone.
function BrandLogo({ system, size }) {
  size = size || 18;
  if (!system) return null;
  var s = String(system).toLowerCase();
  var common = { width: size, height: size, viewBox: "0 0 24 24", style: { flexShrink: 0, display: "block" } };

  if (s.indexOf("snowflake") >= 0) {
    return (
      <svg {...common}>
        <g stroke="#29B5E8" strokeWidth="2" strokeLinecap="round" fill="#29B5E8">
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
          <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
          <circle cx="12" cy="12" r="1.6" />
        </g>
      </svg>
    );
  }
  if (s.indexOf("salesforce") >= 0) {
    return (
      <svg {...common}>
        <g fill="#00A1E0">
          <ellipse cx="8.5" cy="13" rx="4.5" ry="3.6" />
          <ellipse cx="13" cy="10.5" rx="5.5" ry="4.4" />
          <ellipse cx="17" cy="14" rx="4" ry="3.2" />
          <ellipse cx="12" cy="15.5" rx="7.5" ry="3.2" />
        </g>
      </svg>
    );
  }
  if (s.indexOf("hubspot") >= 0) {
    return (
      <svg {...common}>
        <g stroke="#FF7A59" fill="#FF7A59">
          <circle cx="10.5" cy="14" r="4.2" fill="none" strokeWidth="2.2" />
          <circle cx="18.2" cy="6" r="2.2" />
          <line x1="13.4" y1="11.6" x2="16.4" y2="7.8" strokeWidth="2.2" />
          <circle cx="10.5" cy="14" r="1.4" />
        </g>
      </svg>
    );
  }
  if (s.indexOf("netsuite") >= 0) {
    return (
      <svg {...common}>
        <rect x="2" y="3" width="20" height="18" rx="3.5" fill="#125740" />
        <text x="12" y="16.6" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">N</text>
      </svg>
    );
  }
  if (s.indexOf("okta") >= 0) {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="#007DC1" strokeWidth="5" />
      </svg>
    );
  }
  if (s.indexOf("databricks") >= 0) {
    return (
      <svg {...common}>
        <g fill="#FF3621">
          <path d="M3 7.5 L12 4 L21 7.5 L12 11 Z" />
          <path d="M3 11.5 L12 15 L21 11.5 L12 8" opacity="0.55" />
          <path d="M3 15.5 L12 19 L21 15.5 L12 12" opacity="0.3" />
        </g>
      </svg>
    );
  }
  if (s.indexOf("stripe") >= 0) {
    return (
      <svg {...common}>
        <rect x="2" y="3" width="20" height="18" rx="4" fill="#635BFF" />
        <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif" fontStyle="italic">S</text>
      </svg>
    );
  }
  if (s.indexOf("postgres") >= 0) {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" fill="#336791" />
        <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">P</text>
      </svg>
    );
  }
  if (s.indexOf("jira") >= 0 || s.indexOf("confluence") >= 0) {
    return (
      <svg {...common}>
        <path d="M12 3 L21 12 L17 16 L12 11 L7 16 L3 12 Z" fill="#0052CC" />
      </svg>
    );
  }
  if (s.indexOf("zendesk") >= 0) {
    return (
      <svg {...common}>
        <path d="M3 5 L21 5 L3 21 Z" fill="#03363D" />
        <path d="M21 9 a8 8 0 0 1 -16 0" stroke="#03363D" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }
  if (s.indexOf("sharepoint") >= 0 || s.indexOf("outlook") >= 0) {
    return (
      <svg {...common}>
        <circle cx="9" cy="12" r="6.5" fill="#1F6DAD" />
        <text x="9" y="16.3" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">S</text>
      </svg>
    );
  }
  if (s.indexOf("google drive") >= 0 || s.indexOf("gdrive") >= 0) {
    return (
      <svg {...common}>
        <g>
          <path d="M8 4 L16 4 L21 13 L17 20 L7 20 L3 13 Z" fill="#FBBC04" />
          <path d="M3 13 L7 20 L12 12 Z" fill="#34A853" />
          <path d="M21 13 L17 20 L12 12 Z" fill="#1A73E8" />
        </g>
      </svg>
    );
  }
  if (s.indexOf("slack") >= 0) {
    return (
      <svg {...common}>
        <g>
          <rect x="4" y="10" width="6" height="3" rx="1.5" fill="#E01E5A" />
          <rect x="11" y="3" width="3" height="6" rx="1.5" fill="#36C5F0" />
          <rect x="14" y="11" width="6" height="3" rx="1.5" fill="#2EB67D" />
          <rect x="10" y="14" width="3" height="6" rx="1.5" fill="#ECB22E" />
        </g>
      </svg>
    );
  }
  if (s.indexOf("s3") >= 0 || s.indexOf("amazon") >= 0) {
    return (
      <svg {...common}>
        <path d="M5 6 L19 6 L21 10 L21 18 L3 18 L3 10 Z" fill="#FF9900" />
        <path d="M3 10 L21 10" stroke="#232F3E" strokeWidth="1.4" />
      </svg>
    );
  }
  if (s.indexOf("notion") >= 0) {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="900" fill="#000" fontFamily="Georgia, serif">N</text>
      </svg>
    );
  }

  // Fallback: monogram chip
  var letter = (String(system).charAt(0) || "?").toUpperCase();
  return (
    <svg {...common}>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="var(--ink-3)" />
      <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" fontFamily="JetBrains Mono, monospace">{letter}</text>
    </svg>
  );
}

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

const TABS = ["Graph", "Nodes", "Edges", "Sources", "Records", "Stewardship"];

function Header({ tab, onTab, onAddNode, onBackToLanding, graphName }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const MENU_ITEMS = [
    { icon: "＋", label: "Add node type",    action: onAddNode },
    { icon: "⊞", label: "Add edge type",     action: function(){ setMenuOpen(false); } },
    { sep: true },
    { icon: "↗", label: "Export schema",     action: function(){ setMenuOpen(false); } },
    { icon: "⊡", label: "Import / merge",    action: function(){ setMenuOpen(false); } },
    { sep: true },
    { icon: "⚙", label: "Graph settings",    action: function(){ setMenuOpen(false); } },
    { icon: "◷", label: "Version history",   action: function(){ setMenuOpen(false); } },
  ];

  return (
    <header className="hdr">
      <div className="hdr-left">
        <button className="hdr-back" title="Back to graphs" onClick={onBackToLanding}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="hdr-title">
          <div className="hdr-title-row">{graphName || (IS_PS_GRAPH ? "Product Specialist Graph" : "Enterprise Context Graph")}</div>
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
          <button key={t} className={"hdr-tab" + (t === tab ? " on" : "")} onClick={function(){ onTab(t); }}>
            {t}
          </button>
        ))}
      </nav>
      <div className="hdr-right" style={{ position:"relative", display:"flex", alignItems:"center", gap:8 }}>
        <button className="btn-dark" title="Publish draft changes to the live graph" style={{ padding:"8px 16px" }}>
          Publish
        </button>
        <button
          className="btn-icon"
          title="More actions"
          onClick={function(){ setMenuOpen(function(o){ return !o; }); }}
          style={{ width:36, height:36, borderRadius:9, border:"1px solid var(--line)", background: menuOpen ? "var(--chip)" : "var(--bg-canvas)", fontSize:18, color:"var(--ink-2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
        >⋯</button>

        {menuOpen && (
          <div
            style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:149 }}
            onClick={function(){ setMenuOpen(false); }}
          />
        )}
        {menuOpen && (
          <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:150, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 8px 28px rgba(0,0,0,0.12)", padding:"6px", minWidth:196, overflow:"hidden" }}>
            {MENU_ITEMS.map(function(item, i) {
              if (item.sep) return (
                <div key={i} style={{ height:1, background:"var(--line-2)", margin:"4px 0" }} />
              );
              return (
                <button key={i}
                  onClick={function(){ item.action(); setMenuOpen(false); }}
                  style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"8px 10px", borderRadius:6, border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"var(--ink-2)", textAlign:"left" }}
                  onMouseEnter={function(e){ e.currentTarget.style.background = "var(--bg-canvas)"; e.currentTarget.style.color = "var(--ink)"; }}
                  onMouseLeave={function(e){ e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-2)"; }}
                >
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:13, color:"var(--ink-3)", width:18, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
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

          <div className="nv-title">Edges</div>
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

  // Aggregate all sources across all nodes — only real source systems
  // (drop "Manual / Admin UI", "Computed by agent", "Self (system of record)" etc.)
  const allSources = useMemo(() => {
    const list = [];
    NODES.forEach(node => {
      const srcs = generateSources(node);
      srcs.forEach((s, i) => {
        var nameLower = (s.name || "").toLowerCase();
        // Filter out non-system sources
        if (nameLower.indexOf("manual") >= 0) return;
        if (nameLower.indexOf("admin ui") >= 0) return;
        if (nameLower.indexOf("computed by") >= 0) return;
        if (nameLower.indexOf("self (system") >= 0) return;
        const sys = nameLower.indexOf("salesforce") >= 0 ? "Salesforce" :
                    nameLower.indexOf("netsuite")   >= 0 ? "NetSuite"   :
                    nameLower.indexOf("snowflake")  >= 0 ? "Snowflake"  :
                    nameLower.indexOf("hubspot")    >= 0 ? "HubSpot"    :
                    nameLower.indexOf("okta")       >= 0 ? "Okta"       : "Other";
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

  const SYSTEMS = ["Salesforce", "NetSuite", "Snowflake", "HubSpot", "Okta", "Other"];
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

          <div className="nv-title">Sources</div>
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
              <div className="nv-cell" style={{ display:"flex", alignItems:"center", gap:8 }}>
                <BrandLogo system={s.system || s.name} size={18} />
                <span className="snap-n">{s.name}</span>
              </div>
              <div className="nv-cell">
                <span className="src-sys-tag" style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                  <BrandLogo system={s.system} size={14} />
                  {s.system}
                </span>
              </div>
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
  const [newRuleOpen, setNewRuleOpen] = useState(false);
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
            </div>
          </div>
          <div className="detail-title-right">
            <button className="btn-ghost" onClick={onCanvas}>View on canvas →</button>

            <button className="btn-dark" onClick={() => setEditOpen(true)}>Edit schema</button>
            <button className="btn-icon" title="More">⋯</button>
          </div>
        </div>

        <div className="detail-kpis">
          <div className="kpi">
            <div className="kpi-lbl">Instances</div>
            <div className="kpi-v">{node.instancesN ? node.instancesN.toLocaleString() : "—"}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Properties</div>
            <div className="kpi-v">{node.props}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Edge types</div>
            <div className="kpi-v">{outgoing.length + incoming.length}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Direct sources</div>
            <div className="kpi-v">{sources.length}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Active rules</div>
            <div className="kpi-v">{rules.quality.length + rules.match.length + rules.survivorship.length}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">PII fields</div>
            <div className="kpi-v" style={{ color: properties.filter(p=>p.pii).length > 0 ? "var(--coral)" : "var(--ink)" }}>{properties.filter(p=>p.pii).length}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Last ingest</div>
            <div className="kpi-v" style={{ fontSize: 22 }}>{node.fresh}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Drift / 24h</div>
            <div className="kpi-v" style={{ color: issues.filter(i=>i.sev==="warn").length ? "var(--gold)" : "var(--ink)" }}>{issues.filter(i=>i.sev==="warn").length}</div>
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
        {tab === "Rules"      && <RulesPane rules={rules} node={node} onViolationClick={setViolationRule} onMatchClick={setMatchRule} onSurvClick={setSurvConflict} onNewRule={() => setNewRuleOpen(true)} />}
        {tab === "Quality"    && <QualityPane node={node} properties={properties} />}
        {tab === "Access"     && <AccessPane node={node} properties={properties} />}
        {tab === "History"    && <HistoryPane node={node} />}
        {tab === "Sample"     && <SamplePane node={node} properties={properties} />}
      </div>

      {newRuleOpen && <NewRuleFlow node={node} onClose={() => setNewRuleOpen(false)} />}
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
            <div className="about-def">Acts as the canonical entity record for all downstream subscriptions, agreements, and account-health surfaces. Required by any agent that reasons about a customer organisation as a single object.</div>
            <div className="about-meta">
              <div><span className="meta-k">Owner team</span><span className="meta-v">{node.cat === "source" ? "data-platform" : node.type === "agent" ? "applied-ml" : "data-platform"}</span></div>
              <div><span className="meta-k">Stewards</span><span className="meta-v">morgan.lee, ramin.k, +2</span></div>
              <div><span className="meta-k">Domain</span><span className="meta-v">{node.cat === "core" ? "customer" : node.cat === "support" ? "service" : node.cat === "derived" ? "analytics" : "ingest"}</span></div>
              <div><span className="meta-k">Tags</span><div className="meta-tags">{["pii","core-entity","slo:30m","agent-input"].map(t=> <span key={t} className="meta-tag">{t}</span>)}</div></div>
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

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTY DETAIL VIEW — enterprise-grade per-property page
// ═══════════════════════════════════════════════════════════════════════════════

function PropertyDetailView({ node, property, properties, onBack }) {
  var [tab, setTab] = useState("Overview");
  var p = property;
  var c = colorForNode(node);
  var seed = node.id.charCodeAt(0) + p.name.length * 11;

  // Synthesised facts about this property
  var nulls = p.required ? 0 : Math.floor((100 - p.fill) / 100 * (node.instancesN || 1000));
  var violations = Math.max(0, 100 - p.conf);
  var distinctRatio = p.pk ? 100 : p.type === "bool" ? 0.0 : p.type.indexOf("enum") === 0 ? Math.min(100, 0.5 + (seed % 12)) : Math.min(100, 80 + (seed % 18));
  var distinct = Math.max(1, Math.floor((node.instancesN || 1000) * (distinctRatio / 100)));
  var since = "v" + (1 + (seed % 3)) + "." + ((seed * 7) % 10) + ".0";
  var addedBy = ["morgan.lee","ramin.k","data-platform","schema-bot"][seed % 4];

  var description = p.name === "account_id" ? "Primary identifier for an account. UUID v4, auto-generated at creation time. Stable for the lifetime of the record and used as the join key across all downstream systems."
                  : p.computed ? "Derived value. Recomputed automatically when any of its input fields change. Source: " + p.computed + "."
                  : p.pii      ? "Contains personal data. Encrypted at rest; raw values exposed only to roles holding " + (p.name.indexOf("email") >= 0 ? "comms_admin" : "acct_admin") + ". All access is audit-logged."
                  : "Stores the " + p.name.replace(/_/g, " ") + " value for each " + node.label + " record. Set at ingest time from upstream source systems and reconciled per the active survivorship rules.";

  var exampleValues = (function(){
    if (p.pk) return [(node.id.slice(0,3).toUpperCase() + "-" + (10000 + (seed * 13) % 89999)), (node.id.slice(0,3).toUpperCase() + "-" + (10000 + (seed * 17) % 89999)), (node.id.slice(0,3).toUpperCase() + "-" + (10000 + (seed * 19) % 89999))];
    if (p.name === "name" || p.name === "company_name") return ["Acme Corp", "Quantum Dynamics", "Cascade Analytics", "Horizon Tech", "Summit Partners"];
    if (p.name === "domain") return ["acme.com", "quantum.dy", "cascade.io", "horizon.tech", "summit.partners"];
    if (p.name === "email")  return ["taylor.j@acme.com", "morgan.k@horizon.tech", "jordan.s@cascade.io"];
    if (p.name === "industry") return ["SaaS", "Fintech", "Healthcare", "Manufacturing", "Logistics"];
    if (p.name === "tier")     return ["SMB", "MM", "ENT", "Strategic"];
    if (p.name === "region")   return ["NA-East", "NA-West", "EMEA", "APAC"];
    if (p.name === "status")   return ["active", "pending", "review"];
    if (p.type === "decimal" || p.type === "float") return ["1,240.50", "48,200.00", "127,840.75"];
    if (p.type === "bool")      return ["true", "false"];
    if (p.type === "timestamp") return ["2026-05-24T08:14:00Z", "2026-05-23T16:42:18Z"];
    if (p.type === "date")      return ["2026-05-24", "2025-12-01"];
    if (p.type.indexOf("enum") === 0) return ["alpha","beta","gamma","delta"];
    return [p.name + "-1240", p.name + "-9871", p.name + "-3344"];
  })();

  // Top values distribution (for enums, strings; bars for numerics)
  var topValuesDistribution = exampleValues.slice(0, 5).map(function(v, i){
    var pct = i === 0 ? (35 + (seed % 25)) : Math.max(2, 30 - i * 6 + (seed % 5));
    return { value: v, count: Math.floor((node.instancesN || 1000) * pct / 100), pct: pct };
  });

  // Rules touching this property
  var allRules = generateRules(node);
  var touchingRules = []
    .concat((allRules.quality || []).filter(function(r){ return (r.expr || "").indexOf(p.name) >= 0 || (r.label || "").indexOf(p.name) >= 0 || (r.id || "").indexOf(p.name) >= 0; }))
    .concat((allRules.match   || []).filter(function(r){ return r.signals && r.signals.some(function(s){ return s.field === p.name; }); }).map(function(r){ return Object.assign({}, r, { kind:"MATCH" }); }))
    .concat((allRules.survivorship || []).filter(function(r){ return r.property === p.name; }).map(function(r){ return Object.assign({}, r, { kind:"SURV" }); }));

  // Sources contributing to this property
  var sources = generateSources(node);
  var sourceShares = sources.slice(0, 4).map(function(s, i){
    var share = i === 0 ? (40 + (seed % 18)) : i === 1 ? (25 + (seed % 12)) : Math.max(5, 20 - i * 4);
    return { name: s.name, share: share, conf: (0.78 + ((seed + i * 7) % 21) / 100).toFixed(2) };
  });

  // Activity timeline for the property
  var activity = [
    { t:"now",     who:"runtime",   what:"evaluating on every write", color:"var(--green)" },
    { t:"32m ago", who:"runtime",   what: violations > 0 ? Math.round(violations * 0.4) + " new violations" : "0 violations in last hour", color: violations > 0 ? "var(--gold)" : "var(--green)" },
    { t:"2d ago",  who:"morgan.lee",what:"updated description",       color:"var(--blue)" },
    { t:"6d ago",  who:"schema-bot",what:"baseline distribution recomputed", color:"var(--ink-4)" },
    { t:since.indexOf("v") === 0 ? "added in " + since : "1mo ago", who:addedBy, what:"property created", color:"var(--purple)" }
  ];

  function NodeGlyph({ size }) {
    return (
      <svg width={size} height={size} viewBox={"-"+(size/2)+" -"+(size/2)+" "+size+" "+size} style={{ flexShrink:0 }}>
        {node.type === "agent" ? <polygon points={[0,1,2,3,4,5].map(function(i){ var a=(Math.PI/3)*i-Math.PI/2; var r=size/2-1; return (r*Math.cos(a)).toFixed(1)+","+(r*Math.sin(a)).toFixed(1); }).join(" ")} fill={c.fill} stroke={c.stroke} strokeWidth="1.3"/>
         : node.type === "source" ? <rect x={-(size/2-1)} y={-(size/2-1)} width={size-2} height={size-2} rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="1.3"/>
         : <circle r={size/2-1} fill={c.fill} stroke={c.stroke} strokeWidth="1.3"/>}
      </svg>
    );
  }

  var tabs = ["Overview", "Distribution", "Lineage", "Rules", "Activity"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* HEADER */}
      <div className="card">
        <div className="card-body" style={{ padding:"18px 22px 14px" }}>
          <div className="detail-crumb" style={{ marginBottom:10 }}>
            <button className="crumb-back" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              Properties
            </button>
            <span className="crumb-sep">/</span>
            <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>{p.name}</code>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
            <div style={{ display:"flex", gap:14, alignItems:"center" }}>
              <span style={{ width:38, height:38, borderRadius:9, background:"var(--chip)", color:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, fontFamily:"JetBrains Mono", flexShrink:0 }}>{p.type === "uuid" ? "ID" : p.type === "decimal" || p.type === "float" || p.type === "int" ? "#" : p.type === "bool" ? "✓" : p.type === "timestamp" || p.type === "date" ? "◷" : p.type.indexOf("enum") === 0 ? "≡" : p.type === "struct" ? "{}" : "T"}</span>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                  <code style={{ fontFamily:"JetBrains Mono", fontSize:22, fontWeight:600, color:"var(--ink)" }}>{p.name}</code>
                  {p.pk && <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"2px 7px", borderRadius:4, background:"var(--ink)", color:"var(--bg-canvas)", fontWeight:700, letterSpacing:"0.5px" }}>PK</span>}
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:11, padding:"3px 8px", borderRadius:4, background:"var(--chip)", color:"var(--ink-2)", letterSpacing:"0.3px" }}>{p.type}</span>
                  {p.required && <span className="snap-tag" style={{ fontSize:10, padding:"2px 7px" }}>REQ</span>}
                  {p.indexed  && <span className="snap-tag snap-idx" style={{ fontSize:10, padding:"2px 7px" }}>IDX</span>}
                  {p.pii      && <span className="snap-tag snap-pii" style={{ fontSize:10, padding:"2px 7px" }}>PII</span>}
                  {p.computed && <span className="snap-tag snap-comp" style={{ fontSize:10, padding:"2px 7px" }}>FX</span>}
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)" }}>· on</span>
                  <NodeGlyph size={14} />
                  <span style={{ fontSize:12, color:"var(--ink-2)" }}>{node.label}</span>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn-ghost">View as JSON</button>
              <button className="btn-ghost" style={{ color:"var(--coral)" }}>Deprecate…</button>
              <button className="btn-dark">Edit property</button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="detail-kpis" style={{ gridTemplateColumns:"repeat(6, 1fr)", marginTop:16, marginBottom:0 }}>
            <div className="kpi">
              <div className="kpi-lbl">Fill rate</div>
              <div className="kpi-v" style={{ color: metricColor(p.fill) }}>{p.fill + "%"}</div>
            </div>
            <div className="kpi">
              <div className="kpi-lbl">Conformance</div>
              <div className="kpi-v" style={{ color: metricColor(p.conf) }}>{p.conf + "%"}</div>
            </div>
            <div className="kpi">
              <div className="kpi-lbl">Null count</div>
              <div className="kpi-v" style={{ color: nulls > 0 ? "var(--gold)" : "var(--ink)" }}>{nulls.toLocaleString()}</div>
            </div>
            <div className="kpi">
              <div className="kpi-lbl">Distinct</div>
              <div className="kpi-v">{distinct.toLocaleString()}</div>
            </div>
            <div className="kpi">
              <div className="kpi-lbl">Violations · 24h</div>
              <div className="kpi-v" style={{ color: violations > 0 ? "var(--coral)" : "var(--ink)" }}>{violations}</div>
            </div>
            <div className="kpi">
              <div className="kpi-lbl">Rules attached</div>
              <div className="kpi-v">{touchingRules.length}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs" style={{ margin:0, padding:"0 22px", borderTop:"1px solid var(--line-2)" }}>
          {tabs.map(function(t) {
            return <button key={t} className={"detail-tab" + (tab === t ? " on" : "")} onClick={function(){ setTab(t); }}>{t}</button>;
          })}
        </div>
      </div>

      {/* TAB BODIES */}
      {tab === "Overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"minmax(0, 1.6fr) minmax(280px, 1fr)", gap:18 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div className="card">
              <div className="card-head">About this property</div>
              <div className="card-body" style={{ fontSize:13, color:"var(--ink-2)", lineHeight:1.6 }}>{description}</div>
            </div>

            <div className="card">
              <div className="card-head">Example values</div>
              <div className="card-body">
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {exampleValues.map(function(v, i){
                    return <code key={i} style={{ fontFamily:"JetBrains Mono", fontSize:12, padding:"5px 10px", background:"var(--chip)", color:"var(--ink-2)", borderRadius:5 }}>{String(v)}</code>;
                  })}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">Top values <span className="card-head-sub">distribution over {node.instancesN ? node.instancesN.toLocaleString() : "all"} records</span></div>
              <div>
                {topValuesDistribution.map(function(v, i, arr){
                  return (
                    <div key={i} style={{ display:"grid", gridTemplateColumns:"180px 1fr 80px 80px", gap:14, padding:"10px 18px", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none", alignItems:"center" }}>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink-2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{String(v.value)}</code>
                      <div className="nv-bar"><div className="nv-bar-fill" style={{ width: v.pct + "%", background:"var(--blue)" }} /></div>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)", textAlign:"right" }}>{v.count.toLocaleString()}</span>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)", textAlign:"right" }}>{v.pct + "%"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div className="card">
              <div className="card-head">Schema</div>
              <div className="card-body">
                <div style={{ display:"grid", gridTemplateColumns:"110px 1fr", gap:"7px 12px", fontSize:12 }}>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>TYPE</span>
                  <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink)" }}>{p.type}</code>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>REQUIRED</span>
                  <span style={{ color:"var(--ink)" }}>{p.required ? "yes" : "no"}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>INDEXED</span>
                  <span style={{ color:"var(--ink)" }}>{p.indexed ? "yes" : "no"}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>DEFAULT</span>
                  <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>{p.pk ? "auto()" : p.type === "bool" ? "false" : "null"}</code>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>PK</span>
                  <span style={{ color: p.pk ? "var(--green)" : "var(--ink-3)" }}>{p.pk ? "yes — primary key" : "no"}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">Governance</div>
              <div className="card-body">
                <div style={{ display:"grid", gridTemplateColumns:"110px 1fr", gap:"7px 12px", fontSize:12 }}>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>PII TIER</span>
                  <span style={{ color: p.pii ? "var(--coral)" : "var(--ink-3)", fontWeight: p.pii ? 600 : 400 }}>{p.pii ? "personal data" : "not PII"}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>MASKING</span>
                  <span style={{ color:"var(--ink-2)" }}>{p.pii ? "hashed for non-priv roles" : "none"}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>READ ROLES</span>
                  <span style={{ color:"var(--ink-2)", fontFamily:"JetBrains Mono", fontSize:11 }}>{p.pii ? "acct_admin, security" : "all"}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>RETENTION</span>
                  <span style={{ color:"var(--ink-2)" }}>{p.pii ? "7 years (regulatory)" : "inherit"}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>AUDIT</span>
                  <span style={{ color:"var(--ink-2)" }}>{p.pii ? "all reads logged" : "writes logged"}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">Lineage</div>
              <div className="card-body">
                <div style={{ display:"grid", gridTemplateColumns:"110px 1fr", gap:"7px 12px", fontSize:12 }}>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>SOURCE</span>
                  <span style={{ color:"var(--ink-2)" }}>{p.computed ? "computed — " + p.computed : p.source || "primary"}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>ADDED IN</span>
                  <span style={{ color:"var(--ink-2)", fontFamily:"JetBrains Mono", fontSize:11 }}>{since + " · " + addedBy}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>LAST MODIFIED</span>
                  <span style={{ color:"var(--ink-2)" }}>2d ago by morgan.lee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISTRIBUTION TAB */}
      {tab === "Distribution" && (
        <div className="card">
          <div className="card-head card-head-row">
            <span>Value distribution <span className="card-head-sub">{distinct.toLocaleString() + " distinct values across " + (node.instancesN || 1000).toLocaleString() + " records"}</span></span>
            <button className="btn-ghost" style={{ fontSize:11.5 }}>Refresh</button>
          </div>
          <div>
            {topValuesDistribution.concat([{ value: "… all others", count: Math.max(0, (node.instancesN || 1000) - topValuesDistribution.reduce(function(s,v){ return s+v.count; },0)), pct: Math.max(0, 100 - topValuesDistribution.reduce(function(s,v){ return s+v.pct; },0)) }]).filter(function(v){ return v.pct > 0; }).map(function(v, i, arr){
              return (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"220px 1fr 80px 60px", gap:14, padding:"10px 18px", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none", alignItems:"center" }}>
                  <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color: v.value === "… all others" ? "var(--ink-4)" : "var(--ink-2)", fontStyle: v.value === "… all others" ? "italic" : "normal", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{String(v.value)}</code>
                  <div className="nv-bar" style={{ height:8 }}><div className="nv-bar-fill" style={{ width: v.pct + "%", background: v.value === "… all others" ? "var(--ink-4)" : "var(--blue)" }} /></div>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink-2)", textAlign:"right" }}>{v.count.toLocaleString()}</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink-3)", textAlign:"right" }}>{v.pct.toFixed(1) + "%"}</span>
                </div>
              );
            })}
            {nulls > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"220px 1fr 80px 60px", gap:14, padding:"10px 18px", borderTop:"1px dashed var(--line-2)", background:"var(--gold-fill)", alignItems:"center" }}>
                <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--gold)", fontWeight:700 }}>NULL</code>
                <div className="nv-bar" style={{ height:8 }}><div className="nv-bar-fill" style={{ width: (100 - p.fill) + "%", background:"var(--gold)" }} /></div>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--gold)", textAlign:"right", fontWeight:700 }}>{nulls.toLocaleString()}</span>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--gold)", textAlign:"right", fontWeight:700 }}>{(100 - p.fill) + "%"}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LINEAGE TAB — sources contributing this property */}
      {tab === "Lineage" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div className="card">
            <div className="card-head">Source contributions <span className="card-head-sub">how each source system contributes values for {p.name}</span></div>
            <div>
              {sourceShares.map(function(s, i, arr){
                return (
                  <div key={i} style={{ padding:"14px 18px", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink-2)", fontWeight:600 }}>{s.name}</span>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{s.share + "% of values · avg conf " + s.conf}</span>
                    </div>
                    <div className="nv-bar" style={{ height:6, maxWidth:"100%" }}>
                      <div className="nv-bar-fill" style={{ width: s.share + "%", background:"var(--blue)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {p.computed && (
            <div className="card">
              <div className="card-head">Compute expression</div>
              <div className="card-body">
                <pre style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--purple)", margin:0, padding:"10px 12px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6, whiteSpace:"pre-wrap" }}>{p.name + " := " + p.computed}</pre>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:8 }}>Recomputed on every input change. Last full recompute 2h ago.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RULES TAB */}
      {tab === "Rules" && (
        <div className="card">
          <div className="card-head card-head-row">
            <span>Rules referencing {p.name} <span className="card-head-sub">{touchingRules.length + " rule" + (touchingRules.length !== 1 ? "s" : "")}</span></span>
            <button className="btn-dark">+ New rule on this property</button>
          </div>
          {touchingRules.length === 0 ? (
            <div style={{ padding:"40px 18px", textAlign:"center", color:"var(--ink-3)", fontSize:13 }}>No rules currently reference this property.</div>
          ) : (
            <div>
              {touchingRules.map(function(r, i, arr){
                var kc = r.kind === "VALIDATE" ? "var(--blue)" : r.kind === "COMPUTE" ? "var(--green)" : r.kind === "SLO" ? "var(--gold)" : r.kind === "ACCESS" ? "var(--ink-2)" : r.kind === "MATCH" ? "var(--purple)" : "var(--coral)";
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 90px", gap:14, padding:"13px 18px", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none", alignItems:"center" }}>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, fontWeight:700, color:kc, letterSpacing:"0.5px", padding:"2px 7px", borderRadius:4, background: kc + "1a", textAlign:"center" }}>{r.kind}</span>
                    <div>
                      <div style={{ fontSize:13, color:"var(--ink)", marginBottom:3 }}>{r.title || r.label || r.id}</div>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{r.expr || (r.signals ? r.signals.map(function(sg){ return sg.field + "×" + sg.weight; }).join(" + ") : "—")}</code>
                    </div>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{r.severity || (r.strategy || "")}</span>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)", textAlign:"right" }}>{r.last || "—"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ACTIVITY TAB */}
      {tab === "Activity" && (
        <div className="card">
          <div className="card-head">Recent activity</div>
          <div>
            {activity.map(function(a, i, arr){
              return (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"100px 12px 1fr", gap:14, padding:"12px 18px", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none", alignItems:"center" }}>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{a.t}</span>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:a.color, justifySelf:"center" }} />
                  <div style={{ fontSize:12.5, color:"var(--ink-2)" }}>
                    <span style={{ fontFamily:"JetBrains Mono", color:"var(--ink)", fontWeight:600 }}>{a.who}</span>
                    {" " + a.what}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PropertiesPane({ node, properties }) {
  const [propFlowOpen, setPropFlowOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ col: "name", dir: "asc" });
  const [selectedProp, setSelectedProp] = useState(null);
  const AddPropertyFlow = AddPropertyFlowModal;

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

  // If a property is selected, show the detail page instead of the list (after all hooks)
  if (selectedProp) {
    var pp = properties.find(function(p){ return p.name === selectedProp; });
    if (pp) return <PropertyDetailView node={node} property={pp} properties={properties} onBack={function(){ setSelectedProp(null); }} />;
  }

  return (
    <div className="props-pane">
      {/* Single card wrapping toolbar + table */}
      <div className="card">
        <div className="card-head card-head-row">
          <div style={{ display:"flex", gap:4 }}>
            {FILTERS.map(f => (
              <button key={f.id} className={"chip" + (filter === f.id ? " on" : "")} onClick={() => setFilter(f.id)}>
                {f.label} <span className="chip-n">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="card-head-actions">
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
            return (
              <div key={p.name} className="props-row" onClick={() => setSelectedProp(p.name)}>
                <div className="props-cell props-name-cell">
                  {p.pk && <span className="snap-tag snap-pk">PK</span>}
                  <span className="snap-n">{p.name}</span>
                </div>
                <div className="props-cell prop-type">{p.type}</div>
                <div className="props-cell prop-src">{p.computed ? <span className="prop-comp">fx · {p.computed}</span> : p.source}</div>
                <div className="props-cell props-num">
                  <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end" }}>
                    <div className="nv-bar" style={{ flex:"1 1 60px", maxWidth:80 }}><div className="nv-bar-fill" style={{ width: p.fill + "%", background: metricColor(p.fill) }} /></div>
                    <span className="nv-bar-v" style={{ color: metricColor(p.fill), minWidth:32 }}>{p.fill}%</span>
                  </div>
                </div>
                <div className="props-cell props-num">
                  <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end" }}>
                    <div className="nv-bar" style={{ flex:"1 1 60px", maxWidth:80 }}><div className="nv-bar-fill" style={{ width: p.conf + "%", background: metricColor(p.conf) }} /></div>
                    <span className="nv-bar-v" style={{ color: metricColor(p.conf), minWidth:32 }}>{p.conf}%</span>
                  </div>
                </div>
                <div className="props-cell props-flags-cell">
                  {p.required && <span className="snap-tag">req</span>}
                  {p.indexed  && <span className="snap-tag snap-idx">idx</span>}
                  {p.pii      && <span className="snap-tag snap-pii">PII</span>}
                  {p.computed && <span className="snap-tag snap-comp">fx</span>}
                </div>
                <div className="props-cell props-chevron">›</div>
              </div>
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
  const [dirFilter, setDirFilter] = useState("all");
  const AddEdgeFlow = AddEdgeFlowModal;
  const allRows = [...outgoing.map(e => ({ ...e, dir: "out" })), ...incoming.map(e => ({ ...e, dir: "in" }))];
  const rows = dirFilter === "all" ? allRows : allRows.filter(e => e.dir === dirFilter);
  const tabs = [
    { id: "all", label: "All",      count: allRows.length },
    { id: "out", label: "Outgoing", count: outgoing.length },
    { id: "in",  label: "Incoming", count: incoming.length },
  ];
  return (
    <div className="card">
      <div className="card-head card-head-row">
        <div style={{ display:"flex", gap:4 }}>
          {tabs.map(t => (
            <button key={t.id}
              className={"chip" + (dirFilter === t.id ? " on" : "")}
              onClick={() => setDirFilter(t.id)}>
              {t.label} <span className="chip-n">{t.count}</span>
            </button>
          ))}
        </div>
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

// ─── ADD PROPERTY FLOW ───────────────────────────────────────────────────────

function AddPropertyFlowModal({ node, onClose }) {
  const [step, setStep]           = useState(1);
  const [pName, setPName]         = useState("");
  const [pType, setPType]         = useState("string");
  const [pDesc, setPDesc]         = useState("");
  const [pRequired, setPRequired] = useState(false);
  const [pIndexed, setPIndexed]   = useState(false);
  const [pPII, setPPII]           = useState(false);
  const [pComputed, setPComputed] = useState(false);
  const [pDefault, setPDefault]   = useState("");
  const [pFormula, setPFormula]   = useState("");
  const [pSource, setPSource]     = useState("manual");

  const TYPES = ["string","decimal","float","bool","timestamp","date","enum(20)","uuid","struct","array"];
  const SOURCES = ["Salesforce CRM","HubSpot Marketing","NetSuite ERP","Manual / Admin","Computed","Okta Identity"];

  const inp = { border:"1px solid var(--line)", borderRadius:8, padding:"8px 10px", fontSize:12.5, fontFamily:"inherit", color:"var(--ink)", background:"var(--bg-canvas)", outline:"none", boxSizing:"border-box" };
  const sel = { border:"1px solid var(--line)", borderRadius:8, padding:"8px 10px", fontSize:12.5, fontFamily:"inherit", color:"var(--ink)", background:"var(--bg-canvas)", outline:"none", cursor:"pointer" };
  const lbl = { display:"block", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:7 };
  const fg  = { display:"flex", flexDirection:"column", gap:6 };

  const STEPS = [
    { n:1, label:"Basics",      sub: pName || "Name & type" },
    { n:2, label:"Constraints", sub: "Flags & source" },
    { n:3, label:"Review",      sub: "Confirm & save" },
  ];

  const canNext = (function(){
    if (step === 1) return pName.trim().length > 0 && !!pType;
    return true;
  }());

  const stepTitles = ["Define property", "Constraints & flags", "Review & save"];
  const stepDescs  = [
    "Give the property a name and choose its data type. The name must be unique within " + node.label + ".",
    "Set validation constraints, access flags, and the canonical source for this property's values.",
    "Review the property definition before adding it to the " + node.label + " schema.",
  ];

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.48)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={function(e){ if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width:"72vw", maxWidth:860, height:"80vh", background:"var(--bg-canvas)", borderRadius:14, border:"1px solid var(--line)", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 28px 72px rgba(0,0,0,0.36)" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"20px 28px 16px", borderBottom:"1px solid var(--line)", flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:9, letterSpacing:"0.7px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:7 }}>{node.label + " · add property"}</div>
            <h2 style={{ fontSize:17, fontWeight:600, color:"var(--ink)", margin:"0 0 5px" }}>{stepTitles[step-1]}</h2>
            <p style={{ fontSize:12.5, color:"var(--ink-3)", margin:0, lineHeight:1.55, maxWidth:480 }}>{stepDescs[step-1]}</p>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", border:"1px solid var(--line)", background:"none", cursor:"pointer", fontSize:15, color:"var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:20 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"flex", minHeight:0 }}>

          {/* Sidebar */}
          <div style={{ width:192, flexShrink:0, borderRight:"1px solid var(--line)", padding:"24px 14px", display:"flex", flexDirection:"column", gap:2 }}>
            {STEPS.map(function(s){
              const done = step > s.n, active = step === s.n;
              return (
                <button key={s.n} onClick={function(){ if (done) setStep(s.n); }}
                  style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px", borderRadius:7, border:"none", background:active?"var(--panel-2)":"transparent", cursor:done?"pointer":"default", textAlign:"left", width:"100%" }}>
                  <span style={{ width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, flexShrink:0, background:done?"var(--green)":active?"var(--ink)":"var(--line)", color:done||active?"#fff":"var(--ink-3)", marginTop:1 }}>
                    {done ? "✓" : s.n}
                  </span>
                  <div>
                    <div style={{ fontSize:12.5, fontWeight:active?600:400, color:active?"var(--ink)":done?"var(--ink-2)":"var(--ink-3)" }}>{s.label}</div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:2 }}>{s.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div style={{ flex:1, overflowY:"auto", padding:"32px 36px" }}>

            {/* Step 1 — Basics */}
            {step === 1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:520 }}>
                <div style={fg}>
                  <div style={lbl}>Property name</div>
                  <input value={pName} onChange={function(e){ setPName(e.target.value); }}
                    placeholder="e.g. arr_usd, churn_probability, domain"
                    style={{ ...inp, width:"100%" }} />
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>snake_case recommended. Must be unique within this node type.</div>
                </div>
                <div style={fg}>
                  <div style={lbl}>Data type</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {[
                      { type:"string",    label:"String",    desc:"UTF-8 text of arbitrary length." },
                      { type:"decimal",   label:"Decimal",   desc:"Exact numeric — use for monetary values (e.g. ARR, spend)." },
                      { type:"float",     label:"Float",     desc:"Floating-point numeric — use for scores and ratios." },
                      { type:"bool",      label:"Boolean",   desc:"True / false flag." },
                      { type:"timestamp", label:"Timestamp", desc:"Date and time with timezone (ISO 8601)." },
                      { type:"date",      label:"Date",      desc:"Calendar date without time." },
                      { type:"uuid",      label:"UUID",      desc:"Universally unique identifier — use for foreign keys." },
                      { type:"enum(20)",  label:"Enum",      desc:"Controlled vocabulary with up to 20 values." },
                      { type:"struct",    label:"Struct",    desc:"Nested JSON object for composite values." },
                    ].map(function(t){
                      const active = pType === t.type;
                      return (
                        <div key={t.type} onClick={function(){ setPType(t.type); }}
                          style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 14px", border:"2px solid "+(active?"var(--blue)":"var(--line)"), borderRadius:8, cursor:"pointer", background:active?"rgba(99,143,255,0.06)":"transparent" }}>
                          <code style={{ fontFamily:"JetBrains Mono", fontSize:10.5, fontWeight:700, color:active?"var(--blue)":"var(--ink-3)", minWidth:68 }}>{t.type}</code>
                          <div>
                            <span style={{ fontSize:13, fontWeight:active?500:400, color:"var(--ink)" }}>{t.label}</span>
                            <span style={{ fontSize:12, color:"var(--ink-3)", marginLeft:8 }}>{t.desc}</span>
                          </div>
                          {active && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--blue)", marginLeft:"auto" }}>SELECTED</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={fg}>
                  <div style={lbl}>Description <span style={{ textTransform:"none", letterSpacing:0, fontSize:10, color:"var(--ink-4)" }}>(optional)</span></div>
                  <textarea value={pDesc} onChange={function(e){ setPDesc(e.target.value); }}
                    placeholder="What this property represents and how it should be used..."
                    rows={3} style={{ ...inp, width:"100%", resize:"vertical", lineHeight:1.55, fontFamily:"inherit", fontSize:12.5 }} />
                </div>
              </div>
            )}

            {/* Step 2 — Constraints */}
            {step === 2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:28, maxWidth:520 }}>
                <div style={fg}>
                  <div style={lbl}>Source system</div>
                  <select value={pSource} onChange={function(e){ setPSource(e.target.value); }} style={{ ...sel, width:"100%" }}>
                    {SOURCES.map(function(s){ return <option key={s} value={s}>{s}</option>; })}
                  </select>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>Which upstream system is the canonical source of truth for this property.</div>
                </div>

                {pType !== "bool" && pType !== "struct" && (
                  <div style={fg}>
                    <div style={lbl}>Default value <span style={{ textTransform:"none", letterSpacing:0, fontSize:10, color:"var(--ink-4)" }}>(optional)</span></div>
                    <input value={pDefault} onChange={function(e){ setPDefault(e.target.value); }}
                      placeholder={pType === "decimal" || pType === "float" ? "e.g. 0" : pType === "timestamp" ? "e.g. NOW()" : "e.g. unknown"}
                      style={{ ...inp, width:"100%" }} />
                  </div>
                )}

                {pComputed && (
                  <div style={fg}>
                    <div style={lbl}>Formula / agent expression</div>
                    <textarea value={pFormula} onChange={function(e){ setPFormula(e.target.value); }}
                      placeholder="e.g. risk_score := agent:cust_health.score"
                      rows={2} style={{ ...inp, width:"100%", resize:"vertical", fontFamily:"JetBrains Mono", fontSize:12, lineHeight:1.55 }} />
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>Use := for assignment. Reference agents with agent:name.property.</div>
                  </div>
                )}

                <div style={fg}>
                  <div style={lbl}>Flags</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {[
                      { key:"required", val:pRequired, set:setPRequired, label:"Required",           desc:"Every node must have a non-null value for this property." },
                      { key:"indexed",  val:pIndexed,  set:setPIndexed,  label:"Indexed",            desc:"Create a B-tree index on this property to speed up lookups and filters." },
                      { key:"pii",      val:pPII,      set:setPPII,      label:"PII",                desc:"Mark as personally identifiable information. Access gates and audit logs will apply." },
                      { key:"computed", val:pComputed, set:setPComputed, label:"Computed property",  desc:"Value is derived from a formula or agent — not written by source systems directly." },
                    ].map(function(f){
                      return (
                        <div key={f.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", border:"1px solid var(--line)", borderRadius:8, background:"var(--panel-2)" }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)", marginBottom:3 }}>{f.label}</div>
                            <div style={{ fontSize:11.5, color:"var(--ink-3)", lineHeight:1.5 }}>{f.desc}</div>
                          </div>
                          <div onClick={function(){ f.set(!f.val); }}
                            style={{ width:40, height:22, borderRadius:11, background:f.val?"var(--ink)":"var(--line-2)", cursor:"pointer", position:"relative", flexShrink:0, marginLeft:16, transition:"background 150ms" }}>
                            <div style={{ position:"absolute", top:3, left:f.val?20:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 150ms" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:520 }}>
                <div style={{ border:"1px solid var(--line)", borderRadius:12, overflow:"hidden" }}>
                  <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--line-2)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:15, fontWeight:700, color:"var(--ink)" }}>{pName || "(unnamed)"}</code>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:11, padding:"3px 10px", borderRadius:5, background:"rgba(99,143,255,0.12)", color:"var(--blue)", fontWeight:600 }}>{pType}</span>
                      {pPII      && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"2px 7px", borderRadius:4, background:"var(--coral-fill)", color:"var(--coral)", fontWeight:700 }}>PII</span>}
                      {pRequired && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"2px 7px", borderRadius:4, background:"var(--chip)", color:"var(--ink-3)", fontWeight:700 }}>REQ</span>}
                      {pIndexed  && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"2px 7px", borderRadius:4, background:"var(--chip)", color:"var(--ink-3)", fontWeight:700 }}>IDX</span>}
                      {pComputed && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"2px 7px", borderRadius:4, background:"rgba(72,199,142,0.12)", color:"var(--green)", fontWeight:700 }}>FX</span>}
                    </div>
                    {pDesc && <div style={{ fontSize:13, color:"var(--ink-3)", lineHeight:1.6 }}>{pDesc}</div>}
                  </div>
                  <div style={{ display:"flex", gap:1, background:"var(--line-2)" }}>
                    {[
                      ["Node", node.label],
                      ["Source", pSource],
                      ["Default", pDefault || "—"],
                      ["Status", "Will be added"],
                    ].map(function(kv,i){
                      return (
                        <div key={i} style={{ flex:1, padding:"12px 16px", background:"var(--panel-2)" }}>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:9, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:3 }}>{kv[0]}</div>
                          <div style={{ fontSize:12.5, color:kv[0]==="Status"?"var(--green)":"var(--ink)", fontWeight:kv[0]==="Status"?500:400 }}>{kv[1]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {pComputed && pFormula && (
                  <div style={{ border:"1px solid var(--line-2)", borderRadius:10, overflow:"hidden" }}>
                    <div style={{ padding:"9px 14px", background:"var(--panel-2)", borderBottom:"1px dashed var(--line-2)" }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>Formula</span>
                    </div>
                    <div style={{ padding:"12px 14px" }}>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:13, color:"var(--ink)" }}>{pFormula}</code>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink:0, padding:"14px 28px", borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"flex-end", gap:8, background:"var(--panel-2)" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          {step > 1 && <button className="btn-ghost" onClick={function(){ setStep(function(s){ return s-1; }); }}>Back</button>}
          {step < 3
            ? <button className="btn-dark" disabled={!canNext} onClick={function(){ setStep(function(s){ return s+1; }); }} style={{ opacity:canNext?1:0.45 }}>Continue</button>
            : <button className="btn-dark" onClick={onClose}>Add property</button>
          }
        </div>

      </div>
    </div>
  );
}

// ─── ADD EDGE FLOW ────────────────────────────────────────────────────────────

function AddEdgeFlowModal({ fromNode, onClose }) {
  const [step, setStep]               = useState(1);
  const [eLabel, setELabel]           = useState("");
  const [eDesc, setEDesc]             = useState("");
  const [eTarget, setETarget]         = useState("");
  const [eCard, setECard]             = useState("1:N");
  const [eInverse, setEInverse]       = useState("");
  const [ePopKind, setEPopKind]       = useState(null);
  const [eBackfill, setEBackfill]     = useState(true);
  const [eProps, setEProps]           = useState([
    { name:"since", type:"timestamp", req:true, pii:false },
    { name:"confidence", type:"float", req:false, pii:false },
  ]);
  const [eOwner, setEOwner]           = useState("data-platform");
  const [eRisk, setERisk]             = useState("MEDIUM");
  const [eTags, setETags]             = useState("");
  const [eAccess, setEAccess]         = useState(["read_all"]);
  const [eTargetStage, setETargetStage] = useState("draft");
  const [eAccessInput, setEAccessInput] = useState("");

  const targetNodes = NODES.filter(function(n){ return n.id !== fromNode.id && n.type !== "source"; });
  const targetNode  = NODES.find(function(n){ return n.id === eTarget; });
  const fromC = colorForNode(fromNode);

  const STEP_META = [
    { n:1, label:"Basics",     sub:"Label, endpoints, cardinality" },
    { n:2, label:"Population", sub:"Where instances come from" },
    { n:3, label:"Properties", sub:"Optional edge attributes" },
    { n:4, label:"Governance", sub:"Owner, access, impact" },
    { n:5, label:"Review",     sub:"Cypher diff & publish" },
  ];

  const canContinue = (function(){
    if (step === 1) return eLabel.trim().length >= 3 && eTarget !== "";
    if (step === 2) return ePopKind !== null;
    return true;
  }());

  const inp = { border:"1px solid var(--line)", borderRadius:8, padding:"8px 11px", fontSize:13, fontFamily:"inherit", color:"var(--ink)", background:"var(--bg-canvas)", outline:"none", boxSizing:"border-box" };
  const lbl = { display:"block", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.8px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 };
  const fg  = { display:"flex", flexDirection:"column", gap:6 };
  const fieldRow = { display:"flex", flexDirection:"column", gap:6, marginBottom:22 };

  const popKinds = [
    { id:"direct",   color:"var(--blue)",   tag:"DIRECT",   title:"Direct from source", desc:"Edge instances loaded from a source-system table or stream — one row, one edge." },
    { id:"inferred", color:"var(--purple)", tag:"INFERRED", title:"Inferred by rule",   desc:"Materialised from a Cypher pattern on a schedule. No source row required." },
    { id:"agent",    color:"var(--green)",  tag:"AGENT",    title:"Agent-derived",       desc:"Edge emitted by an agent's reasoning step as a structured write event." },
    { id:"computed", color:"var(--gold)",   tag:"COMPUTED", title:"Property match",      desc:"Edge appears when a property on From equals a property on To. Cheapest path." },
  ];

  const labelValid   = eLabel.trim().length >= 3;
  const targetValid  = eTarget !== "";
  const cypherLabel  = eLabel || "EDGE";
  const fromLabelStr = fromNode.label;
  const toLabelStr   = targetNode ? targetNode.label : "?";

  const cypherText = "(:"+fromLabelStr+")\n  -[:"+cypherLabel+"]->\n  (:"+toLabelStr+")";

  function NodeGlyph16({ node }) {
    const c2 = colorForNode(node);
    return (
      <svg width="16" height="16" viewBox="-8 -8 16 16" style={{ flexShrink:0 }}>
        {node.type === "agent"
          ? <polygon points="0,-7 6,3.5 -6,3.5" fill={c2.fill} stroke={c2.stroke} strokeWidth="1.3" />
          : node.type === "source"
          ? <rect x="-6" y="-6" width="12" height="12" rx="1.5" fill={c2.fill} stroke={c2.stroke} strokeWidth="1.3" />
          : <circle r="6" fill={c2.fill} stroke={c2.stroke} strokeWidth="1.3" />}
      </svg>
    );
  }

  function Toggle({ on, onChange }) {
    return (
      <div onClick={onChange}
        style={{ width:40, height:22, borderRadius:11, background:on?"var(--ink)":"var(--line-2)", cursor:"pointer", position:"relative", flexShrink:0, transition:"background 150ms" }}>
        <div style={{ position:"absolute", top:3, left:on?20:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 150ms" }} />
      </div>
    );
  }

  function removeAccess(tag) {
    setEAccess(function(prev){ return prev.filter(function(a){ return a !== tag; }); });
  }

  function addProp() {
    setEProps(function(prev){ return prev.concat({ name:"new_prop", type:"string", req:false, pii:false }); });
  }

  function removeProp(idx) {
    setEProps(function(prev){ return prev.filter(function(_, i){ return i !== idx; }); });
  }

  function updateProp(idx, key, val) {
    setEProps(function(prev){ return prev.map(function(p, i){ return i === idx ? Object.assign({}, p, { [key]: val }) : p; }); });
  }

  const stepNames = ["Basics", "Population", "Properties", "Governance", "Review"];

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={function(e){ if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width:"92vw", maxWidth:1340, height:"94vh", background:"var(--bg-canvas)", borderRadius:12, border:"1px solid var(--line)", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>

        {/* ── HEADER BAR ── */}
        <div style={{ flexShrink:0, height:48, borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", background:"var(--panel)" }}>
          <div>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.7px", color:"var(--ink-3)", textTransform:"uppercase" }}>
              {"SCHEMA \xB7 EDGE TYPES \xB7 NEW"}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:1 }}>
              <NodeGlyph16 node={fromNode} />
              <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, fontWeight:500, color:"var(--ink)" }}>{fromNode.label}</span>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-4)", fontStyle:"italic" }}>{"→ " + (eLabel ? ":"+eLabel : "choose target")}</span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 9px", borderRadius:4, border:"1px solid var(--line)", background:"var(--chip)", color:"var(--ink-2)", letterSpacing:"0.5px" }}>
              {(eTarget ? toLabelStr : "TARGET") + " \xB7 DRAFT"}
            </span>
            <button onClick={onClose} style={{ width:28, height:28, borderRadius:"50%", border:"1px solid var(--line)", background:"none", cursor:"pointer", fontSize:15, color:"var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {"×"}
            </button>
          </div>
        </div>

        {/* ── BODY (sidebar + content + right panel) ── */}
        <div style={{ flex:1, display:"flex", minHeight:0 }}>

          {/* LEFT SIDEBAR */}
          <div style={{ width:260, flexShrink:0, borderRight:"1px solid var(--line)", display:"flex", flexDirection:"column", background:"var(--panel)", padding:"24px 16px 0" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {STEP_META.map(function(s){
                const done = step > s.n;
                const active = step === s.n;
                return (
                  <button key={s.n}
                    onClick={function(){ if (done) setStep(s.n); }}
                    style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 12px", borderRadius:8, border:"none", background:active?"var(--bg-canvas)":"transparent", cursor:done?"pointer":"default", textAlign:"left", width:"100%" }}>
                    <span style={{ width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:11, fontWeight:700, flexShrink:0, background:done?"var(--green)":active?"var(--ink)":"var(--line-2)", color:done||active?"#fff":"var(--ink-3)", marginTop:1 }}>
                      {done ? "✓" : s.n}
                    </span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:active?600:400, color:active?"var(--ink)":done?"var(--ink-2)":"var(--ink-3)" }}>{s.label}</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)", marginTop:2 }}>{s.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop:"auto", paddingBottom:24, borderTop:"1px solid var(--line-2)", paddingTop:16 }}>
              {[
                { key:"⌘↵", label:"Publish" },
                { key:"⌘S", label:"Draft" },
              ].map(function(item){
                return (
                  <div key={item.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 12px", borderRadius:6 }}>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:11, padding:"2px 7px", border:"1px solid var(--line)", borderRadius:4, background:"var(--bg-canvas)", color:"var(--ink-2)" }}>{item.key}</span>
                    <span style={{ fontSize:12.5, color:"var(--ink-3)" }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER CONTENT */}
          <div style={{ flex:1, overflowY:"auto", padding:"36px 40px" }}>

            {/* STEP 1 — Basics */}
            {step === 1 && (
              <div style={{ maxWidth:560 }}>
                <div style={{ marginBottom:28 }}>
                  <div style={{ fontFamily:"Instrument Serif, serif", fontSize:32, lineHeight:1.1, letterSpacing:"-0.3px", marginBottom:8 }}>
                    {"Name the edge and pick its endpoints"}
                  </div>
                  <div style={{ fontSize:13.5, color:"var(--ink-3)", lineHeight:1.6 }}>
                    {"Edge labels become part of the schema’s public contract. Use UPPER_SNAKE_CASE with a verb that reads naturally in both directions."}
                  </div>
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"LABEL "}<span style={{ color:"var(--coral)" }}>{"*"}</span></div>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontFamily:"JetBrains Mono", fontSize:13, color:"var(--ink-3)" }}>{":"}</span>
                    <input value={eLabel}
                      onChange={function(e){ setELabel(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g,"_")); }}
                      placeholder="WORKS_AT"
                      style={Object.assign({}, inp, { width:"100%", fontFamily:"JetBrains Mono", fontSize:13, paddingLeft:22 })} />
                  </div>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{"UPPER_SNAKE_CASE \xB7 3–32 chars"}</div>
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"DESCRIPTION "}<span style={{ color:"var(--ink-4)", textTransform:"none", letterSpacing:0, fontSize:9 }}>{"(OPTIONAL)"}</span></div>
                  <textarea value={eDesc} onChange={function(e){ setEDesc(e.target.value); }}
                    placeholder={"What does this edge represent? Read both directions out loud — does it work?"}
                    rows={3}
                    style={Object.assign({}, inp, { width:"100%", resize:"vertical", lineHeight:1.55, fontFamily:"inherit", fontSize:13 })} />
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"FROM"}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", border:"1px solid var(--line-2)", borderRadius:8, background:"var(--panel)", opacity:0.8 }}>
                    <NodeGlyph16 node={fromNode} />
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:12.5, color:"var(--ink)" }}>{fromNode.label}</span>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"2px 7px", borderRadius:4, background:"var(--chip)", color:"var(--ink-3)", marginLeft:4 }}>{"locked"}</span>
                  </div>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{"Locked to the current node."}</div>
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"TO "}<span style={{ color:"var(--coral)" }}>{"*"}</span></div>
                  <select value={eTarget} onChange={function(e){ setETarget(e.target.value); }}
                    style={Object.assign({}, inp, { width:"100%", cursor:"pointer" })}>
                    <option value="">{"— pick a target node —"}</option>
                    {targetNodes.map(function(n){
                      return <option key={n.id} value={n.id}>{n.label}</option>;
                    })}
                  </select>
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"CARDINALITY"}</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {["1:1","1:N","N:1","N:M"].map(function(c){
                      const selected = eCard === c;
                      return (
                        <button key={c}
                          onClick={function(){ setECard(c); }}
                          style={{ flex:1, padding:"10px 8px", border:"2px solid "+(selected?"var(--ink)":"var(--line)"), borderRadius:8, cursor:"pointer", textAlign:"center", background:selected?"var(--panel-2)":"transparent", fontFamily:"inherit" }}>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:13, fontWeight:700, color:selected?"var(--ink)":"var(--ink-3)" }}>{c}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"INVERSE LABEL "}<span style={{ color:"var(--ink-4)", textTransform:"none", letterSpacing:0, fontSize:9 }}>{"(OPTIONAL)"}</span></div>
                  <input value={eInverse} onChange={function(e){ setEInverse(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g,"_")); }}
                    placeholder={"EMPLOYED_BY (the reverse direction)"}
                    style={Object.assign({}, inp, { width:"100%", fontFamily:"JetBrains Mono", fontSize:13 })} />
                </div>
              </div>
            )}

            {/* STEP 2 — Population */}
            {step === 2 && (
              <div style={{ maxWidth:600 }}>
                <div style={{ marginBottom:28 }}>
                  <div style={{ fontFamily:"Instrument Serif, serif", fontSize:32, lineHeight:1.1, letterSpacing:"-0.3px", marginBottom:8 }}>{"How will edge instances be created?"}</div>
                  <div style={{ fontSize:13.5, color:"var(--ink-3)", lineHeight:1.6 }}>{"Every edge needs a system of record. This determines freshness SLO, lineage, and backfill behaviour."}</div>
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"POPULATION KIND "}<span style={{ color:"var(--coral)" }}>{"*"}</span></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {popKinds.map(function(pk){
                      const sel = ePopKind === pk.id;
                      return (
                        <div key={pk.id}
                          onClick={function(){ setEPopKind(pk.id); }}
                          style={{ padding:"16px 16px", border:"2px solid "+(sel?pk.color:"var(--line)"), borderRadius:10, cursor:"pointer", background:sel?pk.color+"10":"var(--panel)", display:"flex", flexDirection:"column", gap:8 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            <div style={{ fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, background:pk.color+"20", color:pk.color }}>{pk.tag}</div>
                            {sel && <span style={{ fontSize:12, color:pk.color }}>{"✓"}</span>}
                          </div>
                          <div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)" }}>{pk.title}</div>
                          <div style={{ fontSize:12.5, color:"var(--ink-3)", lineHeight:1.5 }}>{pk.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{"Select one to continue configuring."}</div>
                </div>

                <div style={{ border:"1px solid var(--line)", borderRadius:10, padding:"16px 18px", background:"var(--panel)", display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, background:"var(--ink)", color:"var(--panel)" }}>{"BACKFILL"}</span>
                      <span style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>{"Historical data will be replayed"}</span>
                    </div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)" }}>{"~12,400 traversals \xB7 ~3.2 min in staging"}</div>
                  </div>
                  <Toggle on={eBackfill} onChange={function(){ setEBackfill(function(v){ return !v; }); }} />
                </div>
              </div>
            )}

            {/* STEP 3 — Properties */}
            {step === 3 && (
              <div style={{ maxWidth:600 }}>
                <div style={{ marginBottom:28 }}>
                  <div style={{ fontFamily:"Instrument Serif, serif", fontSize:32, lineHeight:1.1, letterSpacing:"-0.3px", marginBottom:8 }}>{"Edge attributes"}</div>
                  <div style={{ fontSize:13.5, color:"var(--ink-3)", lineHeight:1.6 }}>{"Edges can carry their own properties — timestamps, weights, roles, provenance. Each field is stored at edge cardinality, so keep this minimal."}</div>
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"EDGE PROPERTIES"}</div>
                  <div style={{ border:"1px solid var(--line)", borderRadius:10, overflow:"hidden", background:"var(--panel)" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 60px 50px 32px", gap:0, padding:"8px 14px", background:"var(--panel-2)", borderBottom:"1px solid var(--line-2)", fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.6px", textTransform:"uppercase" }}>
                      <div>{"NAME"}</div><div>{"TYPE"}</div><div>{"REQ"}</div><div>{"PII"}</div><div></div>
                    </div>
                    {eProps.map(function(p, i){
                      return (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 60px 50px 32px", gap:0, padding:"10px 14px", borderBottom: i < eProps.length-1 ? "1px solid var(--line-2)" : "none", alignItems:"center" }}>
                          <input value={p.name} onChange={function(e){ updateProp(i,"name",e.target.value); }}
                            style={{ fontFamily:"JetBrains Mono", fontSize:12, border:"none", background:"transparent", outline:"none", color:"var(--ink)", padding:0 }} />
                          <select value={p.type} onChange={function(e){ updateProp(i,"type",e.target.value); }}
                            style={{ fontFamily:"JetBrains Mono", fontSize:11.5, border:"1px solid var(--line-2)", borderRadius:4, background:"var(--bg-canvas)", color:"var(--ink-2)", padding:"2px 6px", cursor:"pointer" }}>
                            {["string","timestamp","float","int","bool","uuid","enum"].map(function(t){ return <option key={t} value={t}>{t}</option>; })}
                          </select>
                          <div style={{ display:"flex", justifyContent:"center" }}>
                            <Toggle on={p.req} onChange={function(){ updateProp(i,"req",!p.req); }} />
                          </div>
                          <div style={{ display:"flex", justifyContent:"center" }}>
                            <Toggle on={p.pii} onChange={function(){ updateProp(i,"pii",!p.pii); }} />
                          </div>
                          <button onClick={function(){ removeProp(i); }}
                            style={{ border:"none", background:"none", cursor:"pointer", color:"var(--ink-3)", fontSize:14, padding:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            {"×"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={addProp} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:12.5, color:"var(--blue)", padding:"4px 0" }}>{"+ Add property"}</button>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{eProps.length + " defined \xB7 storage cost scales with edge count"}</div>
                </div>
              </div>
            )}

            {/* STEP 4 — Governance */}
            {step === 4 && (
              <div style={{ maxWidth:560 }}>
                <div style={{ marginBottom:28 }}>
                  <div style={{ fontFamily:"Instrument Serif, serif", fontSize:32, lineHeight:1.1, letterSpacing:"-0.3px", marginBottom:8 }}>{"Owner, access, and downstream effects"}</div>
                  <div style={{ fontSize:13.5, color:"var(--ink-3)", lineHeight:1.6 }}>{"New edges are governance events — they expand the surface every downstream agent and dashboard can traverse."}</div>
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"OWNER TEAM"}</div>
                  <select value={eOwner} onChange={function(e){ setEOwner(e.target.value); }}
                    style={Object.assign({}, inp, { width:"100%", cursor:"pointer" })}>
                    {["data-platform","engineering","analytics","product"].map(function(o){ return <option key={o} value={o}>{o}</option>; })}
                  </select>
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"CHANGE RISK"}</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {["LOW","MEDIUM","HIGH"].map(function(r){
                      const sel = eRisk === r;
                      const rColor = r === "HIGH" ? "var(--coral)" : r === "MEDIUM" ? "var(--gold)" : "var(--green)";
                      return (
                        <button key={r} onClick={function(){ setERisk(r); }}
                          style={{ flex:1, padding:"9px 8px", border:"2px solid "+(sel?rColor:"var(--line)"), borderRadius:8, cursor:"pointer", background:sel?rColor+"18":"transparent", fontFamily:"inherit" }}>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:11, fontWeight:700, color:sel?rColor:"var(--ink-3)" }}>{r}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{"1 reviewer from owner team \xB7 CI must pass."}</div>
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"TAGS"}</div>
                  <input value={eTags} onChange={function(e){ setETags(e.target.value); }}
                    placeholder={"add tags…"}
                    style={Object.assign({}, inp, { width:"100%" })} />
                </div>

                <div style={fieldRow}>
                  <div style={lbl}>{"ACCESS ROLES"}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, padding:"8px 10px", border:"1px solid var(--line)", borderRadius:8, background:"var(--bg-canvas)", minHeight:40, alignItems:"center" }}>
                    {eAccess.map(function(tag){
                      return (
                        <span key={tag} style={{ fontFamily:"JetBrains Mono", fontSize:11.5, padding:"3px 8px", borderRadius:4, background:"var(--chip)", color:"var(--ink-2)", display:"inline-flex", alignItems:"center", gap:5 }}>
                          {tag}
                          <button onClick={function(){ removeAccess(tag); }}
                            style={{ border:"none", background:"none", cursor:"pointer", color:"var(--ink-3)", fontSize:13, lineHeight:1, padding:0, marginTop:-1 }}>{"×"}</button>
                        </span>
                      );
                    })}
                    <input value={eAccessInput}
                      onChange={function(e){ setEAccessInput(e.target.value); }}
                      onKeyDown={function(e){ if ((e.key === "Enter" || e.key === ",") && eAccessInput.trim()) { setEAccess(function(prev){ return prev.concat(eAccessInput.trim()); }); setEAccessInput(""); e.preventDefault(); } }}
                      placeholder={"add…"}
                      style={{ border:"none", background:"transparent", outline:"none", fontSize:12.5, fontFamily:"JetBrains Mono", color:"var(--ink)", flex:1, minWidth:60, padding:0 }} />
                  </div>
                </div>

                <div style={{ border:"1px solid var(--line-2)", borderRadius:10, padding:"14px 16px", background:"var(--panel)" }}>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>
                    {"IMPACT PREVIEW \xB7 0 SURFACES AFFECTED"}
                  </div>
                  <div style={{ fontSize:12.5, color:"var(--ink-4)" }}>{"No downstream surfaces detected yet. Impact will be calculated on first publish."}</div>
                </div>
              </div>
            )}

            {/* STEP 5 — Review */}
            {step === 5 && (
              <div style={{ maxWidth:620 }}>
                <div style={{ marginBottom:28 }}>
                  <div style={{ fontFamily:"Instrument Serif, serif", fontSize:32, lineHeight:1.1, letterSpacing:"-0.3px", marginBottom:8 }}>{"Last look before this becomes part of the schema"}</div>
                </div>

                <div style={{ border:"1px solid var(--line)", borderRadius:12, overflow:"hidden", background:"var(--panel)", marginBottom:20 }}>
                  <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--line-2)", fontWeight:600, fontSize:13.5 }}>{"Summary"}</div>
                  <div style={{ display:"flex", flexDirection:"column" }}>
                    {[
                      ["LABEL",      eLabel || "(none)"],
                      ["ENDPOINTS",  fromNode.label + " → " + (targetNode ? targetNode.label : "?")],
                      ["CARDINALITY", eCard],
                      ["KIND",       ePopKind ? ePopKind.toUpperCase() : "(not set)"],
                      ["PROPERTIES", eProps.length + " defined"],
                      ["CADENCE",    "5 min"],
                      ["OWNER",      eOwner],
                      ["RISK",       eRisk],
                      ["ACCESS",     eAccess.join(", ") || "none"],
                      ["BACKFILL",   eBackfill ? "on \xB7 30 days" : "off"],
                      ["IMPACT",     "0 surface(s) downstream"],
                    ].map(function(row, i){
                      return (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"10px 18px", borderBottom: i < 10 ? "1px dashed var(--line-2)" : "none" }}>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", letterSpacing:"0.5px" }}>{row[0]}</span>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink)", fontWeight:500 }}>{row[1]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ border:"1px solid var(--line)", borderRadius:12, overflow:"hidden", background:"var(--panel)", marginBottom:20 }}>
                  <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--line-2)", fontWeight:600, fontSize:13.5 }}>{"Approvers"}</div>
                  <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:13, color:"var(--panel)", fontWeight:700 }}>{"M"}</div>
                    <div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:12.5, fontWeight:500, color:"var(--ink)" }}>{"morgan.lee"}</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)" }}>{"data-platform"}</div>
                    </div>
                    <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 8px", borderRadius:4, background:"var(--gold-fill)", color:"var(--gold)", fontWeight:700 }}>{"AWAITING"}</span>
                  </div>
                </div>

                <div style={{ marginBottom:6 }}>
                  <div style={lbl}>{"TARGET STAGE"}</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {["draft","staging","live"].map(function(s){
                      const sel = eTargetStage === s;
                      return (
                        <button key={s} onClick={function(){ setETargetStage(s); }}
                          style={{ flex:1, padding:"10px 8px", border:"2px solid "+(sel?"var(--ink)":"var(--line)"), borderRadius:8, cursor:"pointer", background:sel?"var(--panel-2)":"transparent", fontFamily:"inherit" }}>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:12, fontWeight:sel?700:400, color:sel?"var(--ink)":"var(--ink-3)" }}>{s}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PANEL */}
          <div style={{ width:260, flexShrink:0, borderLeft:"1px solid var(--line)", background:"var(--panel)", overflowY:"auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:20 }}>

            {/* Live Preview */}
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.8px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:10 }}>{"LIVE PREVIEW"}</div>
              <div style={{ display:"flex", justifyContent:"center", padding:"16px 0" }}>
                <svg width="228" height="80" viewBox="0 0 228 80">
                  <circle cx="36" cy="40" r="22" fill={fromC.fill} stroke={fromC.stroke} strokeWidth="1.8" />
                  <text x="36" y="69" textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"9px", fill:"var(--ink-3)" }}>{fromNode.label.slice(0,10)}</text>

                  <line x1="60" y1="40" x2="168" y2="40" stroke="var(--line)" strokeWidth="1.5" markerEnd="url(#arr)" />
                  <text x="114" y="32" textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"8.5px", fill:"var(--blue)", fontWeight:"700" }}>{eCard}</text>
                  <text x="114" y="52" textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"8px", fill:"var(--ink-3)" }}>{eLabel ? ":"+eLabel : ""}</text>

                  {targetNode ? (
                    <circle cx="192" cy="40" r="22" fill={colorForNode(targetNode).fill} stroke={colorForNode(targetNode).stroke} strokeWidth="1.8" />
                  ) : (
                    <circle cx="192" cy="40" r="22" fill="var(--line-2)" stroke="var(--line)" strokeWidth="1.8" strokeDasharray="3,2" />
                  )}
                  <text x="192" y="69" textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"9px", fill:"var(--ink-3)" }}>{targetNode ? targetNode.label.slice(0,10) : "?"}</text>
                  {!targetNode && <text x="192" y="44" textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"14px", fill:"var(--ink-3)" }}>{"?"}</text>}

                  <defs>
                    <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 Z" fill="var(--ink-3)" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Cypher Pattern */}
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.8px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>{"CYPHER PATTERN"}</div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:11, lineHeight:1.9, background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:7, padding:"10px 12px", color:"var(--ink-2)", whiteSpace:"pre" }}>{cypherText}</div>
            </div>

            {/* Validation */}
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.8px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>{"VALIDATION"}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {[
                  { ok:labelValid,  text:"Label is unique and well-formed" },
                  { ok:targetValid, text:"Target node selected" },
                  { ok:true,        text:"Access roles assigned" },
                  { ok:true,        text:"No conflict with existing edges" },
                ].map(function(v, i){
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:v.ok?"var(--green)":"var(--gold)", flexShrink:0, marginTop:3 }} />
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:v.ok?"var(--ink-2)":"var(--ink-3)", lineHeight:1.5 }}>{v.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Downstream Impact */}
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.8px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>{"DOWNSTREAM IMPACT"}</div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"Instrument Serif, serif", fontSize:44, color:"var(--ink)", lineHeight:1 }}>{"0"}</div>
                <div style={{ fontSize:12.5, color:"var(--ink-2)", marginTop:4 }}>{"surfaces will pick this up"}</div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:2 }}>{"on publish to draft"}</div>
              </div>
            </div>

          </div>
        </div>

        {/* ── FOOTER BAR ── */}
        <div style={{ flexShrink:0, height:52, borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", background:"var(--panel-2)" }}>
          <button className="btn-ghost"
            disabled={step === 1}
            onClick={function(){ setStep(function(s){ return s-1; }); }}
            style={{ opacity:step===1?0.35:1 }}>
            {"← Back"}
          </button>
          <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", letterSpacing:"0.3px" }}>
            {"Step " + step + " of 5 \xB7 " + stepNames[step-1]}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-ghost" onClick={onClose}>{"Save draft"}</button>
            {step < 5
              ? <button className="btn-dark"
                  disabled={!canContinue}
                  onClick={function(){ setStep(function(s){ return s+1; }); }}
                  style={{ opacity:canContinue?1:0.45 }}>
                  {"Continue →"}
                </button>
              : <button className="btn-dark" onClick={onClose}>{"Publish to draft ↵"}</button>
            }
          </div>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINK SOURCE FLOW — comprehensive connector setup with paradigm-aware extraction
//
// Key insight: connectors fall into 4 paradigms:
//   1. STRUCTURED  — DBs / SaaS APIs. Pick objects/tables, map columns to props.
//   2. DOCUMENTS   — SharePoint / S3 / Drive. Pick folder, write an extraction
//                    prompt that an LLM uses to pull structured data from files.
//   3. EVENT       — Kafka / Kinesis / Webhook. Pick a topic, map event schema.
//   4. MANUAL      — CSV upload / admin UI. One-time or steward-curated.
// ═══════════════════════════════════════════════════════════════════════════════

var SOURCE_CONNECTORS = [
  // ─── SaaS CRM/ERP ─────
  { id:"salesforce", name:"Salesforce",     category:"saas",      paradigm:"structured", auth:"oauth",   color:"#1798c1", letter:"S", brief:"CRM · 200+ objects",         popular:true },
  { id:"hubspot",    name:"HubSpot",        category:"saas",      paradigm:"structured", auth:"oauth",   color:"#ff7a59", letter:"H", brief:"CRM · contacts, companies",  popular:true },
  { id:"netsuite",   name:"NetSuite",       category:"saas",      paradigm:"structured", auth:"oauth",   color:"#b8923a", letter:"N", brief:"ERP · finance, ops",         popular:true },
  { id:"stripe",     name:"Stripe",         category:"saas",      paradigm:"structured", auth:"apikey",  color:"#635bff", letter:"S", brief:"Billing · charges, invoices", popular:true },
  { id:"zendesk",    name:"Zendesk",        category:"saas",      paradigm:"structured", auth:"oauth",   color:"#03363d", letter:"Z", brief:"Support · tickets", popular:true },
  { id:"jira",       name:"Jira",           category:"saas",      paradigm:"structured", auth:"oauth",   color:"#0052cc", letter:"J", brief:"Projects · issues, epics", popular:true },
  { id:"servicenow", name:"ServiceNow",     category:"saas",      paradigm:"structured", auth:"oauth",   color:"#293e40", letter:"S", brief:"ITSM · tickets, CMDB" },
  { id:"workday",    name:"Workday",        category:"saas",      paradigm:"structured", auth:"oauth",   color:"#0875e1", letter:"W", brief:"HR · employees, comp" },
  { id:"intercom",   name:"Intercom",       category:"saas",      paradigm:"structured", auth:"oauth",   color:"#1f8ded", letter:"I", brief:"Conversations" },
  { id:"okta",       name:"Okta",           category:"saas",      paradigm:"structured", auth:"oauth",   color:"#007dc1", letter:"O", brief:"Identity · users, groups" },

  // ─── Warehouse / Database ─────
  { id:"snowflake",  name:"Snowflake",      category:"warehouse", paradigm:"structured", auth:"connstr", color:"#29b5e8", letter:"❄", brief:"Warehouse · tables, views",  popular:true },
  { id:"databricks", name:"Databricks",     category:"warehouse", paradigm:"structured", auth:"connstr", color:"#ff3621", letter:"D", brief:"Lakehouse · Delta tables",   popular:true },
  { id:"bigquery",   name:"BigQuery",       category:"warehouse", paradigm:"structured", auth:"oauth",   color:"#4285f4", letter:"B", brief:"Warehouse · datasets", popular:true },
  { id:"redshift",   name:"Redshift",       category:"warehouse", paradigm:"structured", auth:"connstr", color:"#cb0606", letter:"R", brief:"Warehouse · tables" },
  { id:"postgres",   name:"PostgreSQL",     category:"warehouse", paradigm:"structured", auth:"connstr", color:"#336791", letter:"P", brief:"Relational DB", popular:true },
  { id:"mysql",      name:"MySQL",          category:"warehouse", paradigm:"structured", auth:"connstr", color:"#4479a1", letter:"M", brief:"Relational DB" },
  { id:"mongodb",    name:"MongoDB",        category:"warehouse", paradigm:"structured", auth:"connstr", color:"#47a248", letter:"M", brief:"Document DB · collections" },

  // ─── Document stores (LLM extraction) ─────
  { id:"sharepoint", name:"SharePoint",     category:"docs",      paradigm:"documents",  auth:"oauth",   color:"#1f6dad", letter:"S", brief:"Folders · contracts, policies", popular:true },
  { id:"gdrive",     name:"Google Drive",   category:"docs",      paradigm:"documents",  auth:"oauth",   color:"#4285f4", letter:"G", brief:"Folders · docs, PDFs", popular:true },
  { id:"onedrive",   name:"OneDrive",       category:"docs",      paradigm:"documents",  auth:"oauth",   color:"#0078d4", letter:"O", brief:"Folders · docs, PDFs" },
  { id:"dropbox",    name:"Dropbox",        category:"docs",      paradigm:"documents",  auth:"oauth",   color:"#0061ff", letter:"D", brief:"Folders · files" },
  { id:"box",        name:"Box",            category:"docs",      paradigm:"documents",  auth:"oauth",   color:"#0061d5", letter:"B", brief:"Folders · files" },
  { id:"confluence", name:"Confluence",     category:"docs",      paradigm:"documents",  auth:"oauth",   color:"#0052cc", letter:"C", brief:"Wiki · spaces, pages", popular:true },
  { id:"notion",     name:"Notion",         category:"docs",      paradigm:"documents",  auth:"oauth",   color:"#000000", letter:"N", brief:"Workspace · pages" },
  { id:"s3",         name:"Amazon S3",      category:"docs",      paradigm:"documents",  auth:"keys",    color:"#ff9900", letter:"S", brief:"Buckets · objects, PDFs", popular:true },
  { id:"gcs",        name:"GCS",            category:"docs",      paradigm:"documents",  auth:"keys",    color:"#669df6", letter:"G", brief:"Buckets · objects" },
  { id:"azure-blob", name:"Azure Blob",     category:"docs",      paradigm:"documents",  auth:"keys",    color:"#0078d4", letter:"A", brief:"Containers · blobs" },

  // ─── Communication ─────
  { id:"slack",      name:"Slack",          category:"comm",      paradigm:"documents",  auth:"oauth",   color:"#4a154b", letter:"S", brief:"Channels · messages", popular:true },
  { id:"gmail",      name:"Gmail",          category:"comm",      paradigm:"documents",  auth:"oauth",   color:"#ea4335", letter:"G", brief:"Inbox · emails" },
  { id:"outlook",    name:"Outlook",        category:"comm",      paradigm:"documents",  auth:"oauth",   color:"#0078d4", letter:"O", brief:"Inbox · emails" },

  // ─── Streaming ─────
  { id:"kafka",      name:"Kafka",          category:"stream",    paradigm:"event",      auth:"connstr", color:"#231f20", letter:"K", brief:"Topics · events" },
  { id:"kinesis",    name:"Kinesis",        category:"stream",    paradigm:"event",      auth:"keys",    color:"#ff9900", letter:"K", brief:"Streams" },
  { id:"webhook",    name:"Webhook",        category:"stream",    paradigm:"event",      auth:"keys",    color:"#6a6c5c", letter:"W", brief:"HTTP POST endpoint" },

  // ─── Manual ─────
  { id:"csv",        name:"CSV upload",     category:"manual",    paradigm:"manual",     auth:"none",    color:"#a09e88", letter:"C", brief:"One-time file upload" },
  { id:"admin",      name:"Admin UI",       category:"manual",    paradigm:"manual",     auth:"none",    color:"#a09e88", letter:"A", brief:"Steward edits" }
];

var CONNECTOR_CATEGORIES = [
  { id:"all",       label:"All",        n: SOURCE_CONNECTORS.length },
  { id:"popular",   label:"Popular",    n: SOURCE_CONNECTORS.filter(function(c){ return c.popular; }).length },
  { id:"saas",      label:"SaaS",       n: SOURCE_CONNECTORS.filter(function(c){ return c.category === "saas"; }).length },
  { id:"warehouse", label:"Warehouse",  n: SOURCE_CONNECTORS.filter(function(c){ return c.category === "warehouse"; }).length },
  { id:"docs",      label:"Documents",  n: SOURCE_CONNECTORS.filter(function(c){ return c.category === "docs"; }).length },
  { id:"comm",      label:"Comms",      n: SOURCE_CONNECTORS.filter(function(c){ return c.category === "comm"; }).length },
  { id:"stream",    label:"Streaming",  n: SOURCE_CONNECTORS.filter(function(c){ return c.category === "stream"; }).length },
  { id:"manual",    label:"Manual",     n: SOURCE_CONNECTORS.filter(function(c){ return c.category === "manual"; }).length }
];

var SAMPLE_OBJECTS_BY_CONNECTOR = {
  salesforce: ["Account","Contact","Opportunity","Lead","Case","Task","User","Campaign","CampaignMember","Product2","PricebookEntry","Quote","Order","OrderItem","Asset"],
  hubspot:    ["contacts","companies","deals","tickets","line_items","products","quotes","calls","meetings","emails"],
  netsuite:   ["Customer","Vendor","Invoice","Payment","Item","SalesOrder","Employee","Account","JournalEntry","Contact"],
  snowflake:  ["PROD_DW.ACCOUNTS","PROD_DW.ORDERS","PROD_DW.PRODUCTS","PROD_DW.USERS","PROD_DW.EVENTS","ANALYTICS.FCT_ARR_MONTHLY","ANALYTICS.DIM_CUSTOMER"],
  databricks: ["bronze.crm_accounts","bronze.crm_contacts","silver.accounts_clean","gold.dim_customer","gold.fct_subscription"],
  bigquery:   ["analytics.accounts","analytics.events","analytics.subscriptions","staging.raw_salesforce"],
  postgres:   ["public.accounts","public.users","public.subscriptions","public.invoices","public.audit_log"],
  stripe:     ["customers","charges","invoices","subscriptions","payment_intents","refunds","payouts"],
  zendesk:    ["tickets","users","organizations","groups","comments"],
  jira:       ["issues","projects","sprints","epics","worklogs","components"],
  mongodb:    ["app.users","app.sessions","app.events"],
  okta:       ["users","groups","applications","factors"]
};

var SAMPLE_FOLDERS_BY_CONNECTOR = {
  sharepoint: ["/sites/Legal/Contracts/2024", "/sites/Legal/Contracts/2025", "/sites/Sales/Orders/", "/sites/Procurement/Vendor Agreements/"],
  gdrive:     ["My Drive/Contracts/", "Shared drives/Legal/", "Shared drives/Sales Ops/Deals/"],
  onedrive:   ["Contracts/", "Customer Agreements/", "MSAs/"],
  s3:         ["s3://legal-archive/contracts/", "s3://docs/2024/", "s3://policies/"],
  confluence: ["LEGAL space", "SALES space", "POLICY space"],
  notion:     ["Legal/", "Customer Agreements/", "Vendor Onboarding/"],
  slack:      ["#sales-deals", "#customer-success", "#legal-review"]
};

var DEFAULT_EXTRACTION_PROMPT = "Extract structured data from this document. For each document, return the following fields. If a field is not present or cannot be determined with high confidence, return null. Be precise — do not infer.";
var DEFAULT_EXTRACTION_FIELDS = [
  { name:"parties",         type:"string[]", desc:"Names of all parties to the agreement" },
  { name:"effective_date",  type:"date",     desc:"Date the agreement becomes effective" },
  { name:"termination_date",type:"date",     desc:"Date the agreement ends (null if open-ended)" },
  { name:"total_value_usd", type:"decimal",  desc:"Total contract value in USD" },
  { name:"auto_renews",     type:"bool",     desc:"True if the contract auto-renews" }
];

function LinkSourceFlow({ node, onClose }) {
  var [step, setStep]            = useState(1);
  var [connector, setConnector]  = useState(null);
  var [catFilter, setCatFilter]  = useState("popular");
  var [connSearch, setConnSearch] = useState("");
  var [authUser, setAuthUser]    = useState("");
  var [authPass, setAuthPass]    = useState("");
  var [authHost, setAuthHost]    = useState("");
  var [authDb, setAuthDb]        = useState("");
  var [authKey, setAuthKey]      = useState("");
  var [authConnected, setAuthConnected] = useState(false);
  var [savedConnId, setSavedConnId] = useState(null);
  var [connectionMode, setConnectionMode] = useState("saved"); // "saved" | "new"

  // Mock saved connections per connector — represents what an enterprise already has
  var SAVED_CONNECTIONS_BY_CONNECTOR = {
    salesforce: [
      { id:"sfdc-prod",    label:"Production",  hint:"acme.my.salesforce.com",       owner:"data-platform", connected:"3 months ago", health:"healthy" },
      { id:"sfdc-sandbox", label:"Sandbox",     hint:"acme--sandbox.sandbox.my.sfdc",owner:"data-platform", connected:"6 days ago",   health:"healthy" },
      { id:"sfdc-eu",      label:"EU instance", hint:"acme-eu.my.salesforce.com",    owner:"customer-ops",  connected:"1 month ago", health:"degraded" }
    ],
    netsuite:   [{ id:"netsuite-prod", label:"Production", hint:"acme.netsuite.com",   owner:"finance-ops", connected:"2 weeks ago", health:"healthy" }],
    snowflake:  [
      { id:"snow-prod",      label:"PROD_DW",     hint:"acme-prod.snowflakecomputing.com / PROD_DW",  owner:"data-platform", connected:"5 months ago", health:"healthy" },
      { id:"snow-analytics", label:"ANALYTICS",   hint:"acme-prod.snowflakecomputing.com / ANALYTICS",owner:"analytics",     connected:"2 months ago", health:"healthy" }
    ],
    databricks: [{ id:"dbx-prod", label:"Production workspace", hint:"adb-acme-prod.azuredatabricks.net", owner:"data-platform", connected:"1 month ago", health:"healthy" }],
    hubspot:    [{ id:"hubspot-mkt", label:"Marketing hub", hint:"hub 8472913", owner:"customer-ops", connected:"3 weeks ago", health:"healthy" }],
    sharepoint: [
      { id:"sp-legal",  label:"Legal site",  hint:"acme.sharepoint.com/sites/Legal",  owner:"legal-ops", connected:"2 weeks ago", health:"healthy" },
      { id:"sp-sales",  label:"Sales site",  hint:"acme.sharepoint.com/sites/Sales",  owner:"customer-ops", connected:"1 month ago", health:"healthy" }
    ],
    s3:         [{ id:"s3-archive", label:"Legal archive bucket", hint:"s3://acme-legal-archive (us-east-1)", owner:"legal-ops", connected:"4 months ago", health:"healthy" }],
    postgres:   [{ id:"pg-app",     label:"App DB (read replica)", hint:"app-replica.acme.internal / app_prod", owner:"engineering", connected:"7 months ago", health:"healthy" }],
    stripe:     [{ id:"stripe-prod", label:"Production", hint:"acct_1Abc…", owner:"finance-ops", connected:"1 year ago", health:"healthy" }],
    confluence: [{ id:"conf-eng",   label:"Engineering space", hint:"acme.atlassian.net/wiki/spaces/ENG", owner:"engineering", connected:"2 months ago", health:"healthy" }],
    gdrive:     [{ id:"gdrive-shared", label:"Shared drives (Legal)", hint:"drives.google.com/drive/u/0/folders/0AB…", owner:"legal-ops", connected:"3 months ago", health:"healthy" }]
  };
  var savedConns = (connector && SAVED_CONNECTIONS_BY_CONNECTOR[connector]) || [];
  var [selectedObjects, setSelectedObjects] = useState([]);
  var [objectFilter, setObjectFilter]       = useState("");
  var [folderPath, setFolderPath]           = useState("");
  var [fileTypes, setFileTypes]             = useState(["pdf", "docx"]);
  var [recursive, setRecursive]             = useState(true);
  var [topicName, setTopicName]             = useState("");
  var [targetNodeId, setTargetNodeId]   = useState(node ? node.id : "account");
  var [columnMap, setColumnMap]         = useState({});
  var [columnTransform, setColumnTransform] = useState({}); // sourceCol → transform id
  var [extractionPrompt, setExtractionPrompt] = useState(DEFAULT_EXTRACTION_PROMPT);
  var [extractionFields, setExtractionFields] = useState(DEFAULT_EXTRACTION_FIELDS.slice());
  var [llmModel, setLlmModel]           = useState("claude-3.5-sonnet");
  var [confThreshold, setConfThreshold] = useState("0.80");
  var [syncStrategy, setSyncStrategy]   = useState("incremental");
  var [syncFrequency, setSyncFrequency] = useState("hourly");
  var [backfill, setBackfill]           = useState("90d");
  var [conflictHandling, setConflictHandling] = useState("merge");
  var [onError, setOnError]             = useState("retry");
  var [sloTarget, setSloTarget]         = useState("30m");
  var [classification, setClassification] = useState("internal"); // public / internal / confidential / restricted
  var [complianceTags, setComplianceTags] = useState(["SOC2"]);
  var [allowedRegions, setAllowedRegions] = useState(["us"]);
  var [approvers, setApprovers]         = useState([]);
  var [costCap, setCostCap]             = useState("100");
  var [activate, setActivate]           = useState(true);

  var connectorDef = connector ? SOURCE_CONNECTORS.find(function(c){ return c.id === connector; }) : null;
  var paradigm = connectorDef ? connectorDef.paradigm : null;
  var targetNode = NODES.find(function(n){ return n.id === targetNodeId; }) || node;
  var targetProps = targetNode ? generateProps(targetNode) : [];

  var filteredConnectors = SOURCE_CONNECTORS.filter(function(c) {
    if (catFilter === "popular" && !c.popular) return false;
    if (catFilter !== "all" && catFilter !== "popular" && c.category !== catFilter) return false;
    if (connSearch && (c.name + " " + c.brief).toLowerCase().indexOf(connSearch.toLowerCase()) < 0) return false;
    return true;
  });

  var sampleObjects = (connector && SAMPLE_OBJECTS_BY_CONNECTOR[connector]) || [];
  var sampleFolders = (connector && SAMPLE_FOLDERS_BY_CONNECTOR[connector]) || [];

  function canContinue() {
    if (step === 1) return !!connector;
    if (step === 2) {
      if (connectionMode === "saved" && savedConnId) return true;
      if (connectorDef.auth === "none") return true;
      if (connectorDef.auth === "oauth") return authConnected;
      if (connectorDef.auth === "apikey") return authKey.length > 0;
      if (connectorDef.auth === "connstr") return authHost && authDb && authUser;
      if (connectorDef.auth === "keys") return authKey.length > 0;
      return true;
    }
    if (step === 3) {
      if (paradigm === "structured") return selectedObjects.length > 0;
      if (paradigm === "documents")  return !!folderPath && fileTypes.length > 0;
      if (paradigm === "event")      return !!topicName;
      return true;
    }
    if (step === 4) {
      if (paradigm === "structured") return Object.keys(columnMap).length > 0;
      if (paradigm === "documents")  return extractionFields.length > 0 && extractionPrompt.length > 10;
      if (paradigm === "event")      return Object.keys(columnMap).length > 0;
      return true;
    }
    return true;
  }

  var inp = { border:"1px solid var(--line)", borderRadius:7, padding:"7px 10px", fontSize:13, fontFamily:"inherit", color:"var(--ink)", background:"var(--bg-canvas)", outline:"none", boxSizing:"border-box", width:"100%" };
  var lbl = { display:"block", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:6 };

  var stepNames = ["Connector", "Connect", "Source", "Map", "Sync", "Governance", "Review"];

  function ConnLogo(props) {
    var c = props.c; var size = props.size || 30;
    // If we have a brand-styled SVG for this connector, use it on a soft tinted square.
    // Otherwise fall back to the monogram letter chip.
    var brandKeys = ["snowflake","salesforce","hubspot","netsuite","okta","databricks","stripe","postgres","jira","confluence","zendesk","sharepoint","outlook","gdrive","slack","s3","notion"];
    var isBranded = brandKeys.some(function(k){ return c.id === k || c.id.indexOf(k) >= 0; });
    if (isBranded) {
      var inner = Math.round(size * 0.72);
      return (
        <span style={{ width:size, height:size, borderRadius:7, background: c.color + "14", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:"1px solid " + c.color + "26" }}>
          <BrandLogo system={c.id} size={inner} />
        </span>
      );
    }
    return (
      <span style={{ width:size, height:size, borderRadius:7, background: c.color + "22", color: c.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize: size * 0.5, fontWeight:700, fontFamily:"JetBrains Mono", flexShrink:0 }}>{c.letter}</span>
    );
  }

  function buildSourceSummary() {
    if (!connectorDef) return "// pick a connector";
    if (paradigm === "structured") {
      return connectorDef.name + " · " + selectedObjects.length + " object" + (selectedObjects.length !== 1 ? "s" : "")
        + "\n→ " + (targetNode ? targetNode.label : "?") + " node"
        + "\nsync: " + syncStrategy + " · " + syncFrequency;
    }
    if (paradigm === "documents") {
      return connectorDef.name + "\nfolder: " + (folderPath || "?")
        + "\nfile types: " + fileTypes.join(", ")
        + "\nextract → " + (targetNode ? targetNode.label : "?") + " (" + extractionFields.length + " fields)"
        + "\nmodel: " + llmModel + " · min conf " + confThreshold;
    }
    if (paradigm === "event") {
      return connectorDef.name + " · topic " + (topicName || "?") + "\nstream → " + (targetNode ? targetNode.label : "?");
    }
    return connectorDef.name + " · manual";
  }

  function addField() { setExtractionFields(function(arr){ return arr.concat([{ name:"new_field", type:"string", desc:"" }]); }); }
  function removeField(idx) { setExtractionFields(function(arr){ return arr.filter(function(_, i){ return i !== idx; }); }); }
  function updateField(idx, key, val) {
    setExtractionFields(function(arr){ return arr.map(function(f, i){
      if (i !== idx) return f;
      var n = {}; Object.keys(f).forEach(function(k){ n[k] = f[k]; });
      n[key] = val;
      return n;
    }); });
  }
  function toggleFileType(t) { setFileTypes(function(arr){ return arr.indexOf(t) >= 0 ? arr.filter(function(x){ return x !== t; }) : arr.concat([t]); }); }
  function toggleObject(name) { setSelectedObjects(function(arr){ return arr.indexOf(name) >= 0 ? arr.filter(function(x){ return x !== name; }) : arr.concat([name]); }); }

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.42)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={function(e){ if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width:"96vw", maxWidth:1480, height:"96vh", background:"var(--bg-canvas)", borderRadius:12, border:"1px solid var(--line)", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.32)" }}>

        {/* HEADER */}
        <div style={{ flexShrink:0, height:56, borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", background:"var(--panel)" }}>
          <div>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.7px", color:"var(--ink-3)", textTransform:"uppercase" }}>{(node ? node.label : "DATA") + " · LINK SOURCE"}</div>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginTop:3 }}>
              {connectorDef && <ConnLogo c={connectorDef} size={22} />}
              <span style={{ fontFamily:"Instrument Serif", fontSize:18, color:"var(--ink)" }}>{connectorDef ? connectorDef.name : "Choose a connector"}</span>
              {connectorDef && <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, padding:"2px 7px", borderRadius:4, background: paradigm === "structured" ? "var(--blue-fill)" : paradigm === "documents" ? "var(--purple-fill)" : paradigm === "event" ? "var(--green-fill)" : "var(--chip)", color: paradigm === "structured" ? "var(--blue)" : paradigm === "documents" ? "var(--purple)" : paradigm === "event" ? "var(--green)" : "var(--ink-3)", fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase" }}>{paradigm}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid var(--line)", background:"none", cursor:"pointer", fontSize:15, color:"var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ flex:1, display:"grid", gridTemplateColumns:"240px minmax(0, 1fr) 320px", minHeight:0 }}>

          {/* SIDEBAR */}
          <div style={{ background:"var(--panel-2)", borderRight:"1px solid var(--line)", padding:"20px 14px", display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
            {stepNames.map(function(name, i) {
              var n = i + 1;
              var isOn = step === n;
              var isDone = step > n;
              var sub = n === 1 ? (connectorDef ? connectorDef.name : "Pick source")
                      : n === 2 ? (authConnected || (connectorDef && connectorDef.auth === "none") ? "Connected" : "Auth")
                      : n === 3 ? (paradigm === "structured" ? selectedObjects.length + " object(s)" : paradigm === "documents" ? (folderPath ? "Folder set" : "Folder") : paradigm === "event" ? (topicName || "Topic") : "Manual")
                      : n === 4 ? (paradigm === "documents" ? extractionFields.length + " fields" : Object.keys(columnMap).length + " mapped")
                      : n === 5 ? syncStrategy + " · " + syncFrequency
                      : n === 6 ? classification + " · SLO " + sloTarget
                      : (activate ? "Activate" : "Draft");
              return (
                <button key={n} onClick={function(){ if (n < step || canContinue()) setStep(n); }}
                  style={{ display:"flex", gap:12, padding:"10px 12px", borderRadius:7, border: isOn ? "1px solid var(--line)" : "1px solid transparent", background: isOn ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                  <span style={{ width:22, height:22, borderRadius:"50%", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isDone ? "var(--green)" : isOn ? "var(--ink)" : "var(--bg-canvas)", color: isDone || isOn ? "var(--bg-canvas)" : "var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, flexShrink:0 }}>{isDone ? "✓" : n}</span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, color:"var(--ink)", fontWeight: isOn ? 500 : 400, lineHeight:1.2 }}>{name}</div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CENTER */}
          <div style={{ padding:"24px 32px 28px", overflowY:"auto" }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.8px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:5 }}>{"STEP " + step + " / 7"}</div>
              <div style={{ fontFamily:"Instrument Serif", fontSize:26, color:"var(--ink)", lineHeight:1.1, marginBottom:8 }}>{stepNames[step-1]}</div>
              <div style={{ fontSize:13, color:"var(--ink-3)", lineHeight:1.55, maxWidth:680 }}>
                {step === 1 && "Pick the system you want to bring data from. Each connector has its own extraction paradigm — structured tables, document folders with LLM extraction, event streams, or manual upload."}
                {step === 2 && connectorDef && "Authenticate with " + connectorDef.name + ". Credentials are stored encrypted and rotated automatically."}
                {step === 3 && paradigm === "structured" && "Pick which objects or tables to extract. Each will be mapped to a node type in the next step."}
                {step === 3 && paradigm === "documents" && "Pick the folder(s) to monitor and which file types should be processed. An LLM will extract structured data from each file using the prompt you define in the next step."}
                {step === 3 && paradigm === "event" && "Pick the topic or stream to subscribe to. Events will be transformed into graph records as they arrive."}
                {step === 3 && paradigm === "manual" && "No source location to configure — you'll upload or edit records directly."}
                {step === 4 && paradigm === "structured" && "Map source columns to the properties of the target node type. Unmapped columns will be ignored."}
                {step === 4 && paradigm === "documents" && "Define the extraction template — the prompt and the structured fields the LLM should populate from each document."}
                {step === 4 && paradigm === "event" && "Map fields of the incoming event payload to node properties."}
                {step === 4 && paradigm === "manual" && "Pick the target node type. Records will be added or edited through the steward UI."}
                {step === 5 && "Configure how often this source refreshes and how new vs existing records are reconciled."}
                {step === 6 && "Classify the data, set the freshness SLO, declare compliance scope, and configure who must approve activation."}
                {step === 7 && "Review the full source configuration. Activate immediately or save as a draft pending approval."}
              </div>
            </div>

            {step === 1 && (
              <div>
                {/* Search bar above categories — cleaner, more white-space */}
                <div style={{ position:"relative", marginBottom:16, maxWidth:400 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--ink-3)", pointerEvents:"none" }}>
                    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  <input value={connSearch} onChange={function(e){ setConnSearch(e.target.value); }} placeholder="Search connectors…" style={{ width:"100%", padding:"9px 12px 9px 34px", border:"1px solid var(--line)", borderRadius:8, fontFamily:"inherit", fontSize:13, background:"var(--panel)", color:"var(--ink)", outline:"none" }} />
                </div>

                {/* Category filter row */}
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:18 }}>
                  {CONNECTOR_CATEGORIES.map(function(c){
                    var isOn = catFilter === c.id;
                    return <button key={c.id} onClick={function(){ setCatFilter(c.id); }}
                      className={"chip" + (isOn ? " on" : "")}>
                      {c.label} <span className="chip-n">{c.n}</span>
                    </button>;
                  })}
                </div>

                {/* Sleek 4-column grid — logo-led, minimal text */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
                  {filteredConnectors.map(function(c){
                    var isOn = connector === c.id;
                    var pColor = c.paradigm === "structured" ? "var(--blue)" : c.paradigm === "documents" ? "var(--purple)" : c.paradigm === "event" ? "var(--green)" : "var(--ink-3)";
                    return (
                      <button key={c.id} onClick={function(){ setConnector(c.id); }}
                        title={c.brief}
                        style={{
                          position:"relative",
                          textAlign:"center",
                          padding:"18px 12px 14px",
                          border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"),
                          background: isOn ? "var(--bg-canvas)" : "var(--panel)",
                          borderRadius:10,
                          cursor:"pointer",
                          fontFamily:"inherit",
                          display:"flex",
                          flexDirection:"column",
                          alignItems:"center",
                          gap:8,
                          minHeight:108,
                          transition:"transform 80ms ease, box-shadow 80ms ease",
                          boxShadow: isOn ? "0 0 0 2px color-mix(in oklab, var(--ink) 10%, transparent)" : "none"
                        }}
                        onMouseEnter={function(e){ if (!isOn) e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.06)"; }}
                        onMouseLeave={function(e){ if (!isOn) e.currentTarget.style.boxShadow = "none"; }}>
                        {/* Top-left paradigm dot */}
                        <span style={{ position:"absolute", top:9, left:10, width:6, height:6, borderRadius:"50%", background:pColor }} title={c.paradigm} />
                        {/* Top-right selection check (only when selected) */}
                        {isOn && <span style={{ position:"absolute", top:7, right:9, fontFamily:"JetBrains Mono", color:"var(--ink)", fontWeight:700, fontSize:12 }}>✓</span>}
                        <ConnLogo c={c} size={36} />
                        <span style={{ fontSize:13, fontWeight:600, color:"var(--ink)", lineHeight:1.2 }}>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
                {filteredConnectors.length === 0 && (
                  <div style={{ padding:"40px 18px", textAlign:"center", color:"var(--ink-3)", fontSize:13 }}>No connectors match.</div>
                )}

                {/* Subtle paradigm legend */}
                <div style={{ display:"flex", gap:18, marginTop:18, paddingTop:14, borderTop:"1px dashed var(--line-2)", fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"var(--blue)" }} />Structured</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"var(--purple)" }} />Documents (LLM)</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)" }} />Event</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"var(--ink-3)" }} />Manual</span>
                </div>
              </div>
            )}

            {step === 2 && connectorDef && (
              <div style={{ maxWidth:640, display:"flex", flexDirection:"column", gap:18 }}>
                {/* Saved-connections picker — only if there are saved connections for this connector */}
                {savedConns.length > 0 && (
                  <div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                      <label style={lbl}>USE AN EXISTING CONNECTION</label>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{savedConns.length + " linked to your org"}</span>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {savedConns.map(function(s){
                        var isOn = connectionMode === "saved" && savedConnId === s.id;
                        var healthColor = s.health === "healthy" ? "var(--green)" : s.health === "degraded" ? "var(--gold)" : "var(--coral)";
                        return (
                          <button key={s.id}
                            onClick={function(){ setConnectionMode("saved"); setSavedConnId(s.id); setAuthConnected(true); }}
                            style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isOn ? "var(--bg-canvas)" : "var(--panel)", borderRadius:9, cursor:"pointer", fontFamily:"inherit", textAlign:"left", boxShadow: isOn ? "0 0 0 2px color-mix(in oklab, var(--ink) 8%, transparent)" : "none" }}>
                            <ConnLogo c={connectorDef} size={28} />
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                                <span style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>{s.label}</span>
                                <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontFamily:"JetBrains Mono", fontSize:9.5, color: healthColor, fontWeight:600 }}>
                                  <span style={{ width:6, height:6, borderRadius:"50%", background: healthColor }} />
                                  {s.health}
                                </span>
                              </div>
                              <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{s.hint}</div>
                              <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:3 }}>{"owned by " + s.owner + " · connected " + s.connected}</div>
                            </div>
                            {isOn && <span style={{ color:"var(--green)", fontFamily:"JetBrains Mono", fontWeight:700, fontSize:14 }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={function(){ setConnectionMode("new"); setSavedConnId(null); setAuthConnected(false); }}
                      style={{ marginTop:8, display:"flex", alignItems:"center", gap:8, padding:"10px 12px", border: "1px dashed " + (connectionMode === "new" ? "var(--ink)" : "var(--line)"), background: connectionMode === "new" ? "var(--bg-canvas)" : "transparent", borderRadius:9, cursor:"pointer", fontFamily:"inherit", fontSize:12.5, color: connectionMode === "new" ? "var(--ink)" : "var(--ink-3)", width:"100%", textAlign:"left" }}>
                      <span style={{ width:22, height:22, borderRadius:5, border:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"var(--ink-3)" }}>+</span>
                      <span>Add a new {connectorDef.name} connection</span>
                    </button>
                  </div>
                )}

                {/* Show the auth form only when adding a new connection (or no saved ones exist) */}
                {(connectionMode === "new" || savedConns.length === 0) && (
                  <div>
                    {savedConns.length > 0 && <label style={lbl}>NEW CONNECTION CREDENTIALS</label>}
                {connectorDef.auth === "oauth" && (
                  <div style={{ padding:24, border:"1px solid var(--line)", borderRadius:10, background:"var(--panel)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                      <ConnLogo c={connectorDef} size={40} />
                      <div>
                        <div style={{ fontSize:15, fontWeight:600, color:"var(--ink)" }}>{connectorDef.name}</div>
                        <div style={{ fontSize:12, color:"var(--ink-3)", marginTop:3 }}>Authenticate via OAuth 2.0</div>
                      </div>
                    </div>
                    <div style={{ fontSize:12.5, color:"var(--ink-3)", marginBottom:18, lineHeight:1.55 }}>You'll be redirected to {connectorDef.name} to sign in and grant access. Tokens are stored encrypted and refreshed automatically. Required scopes: read-only on the objects you select.</div>
                    {!authConnected ? (
                      <button onClick={function(){ setAuthConnected(true); }} className="btn-dark" style={{ width:"100%", padding:"10px", justifyContent:"center", fontSize:13 }}>Sign in with {connectorDef.name} →</button>
                    ) : (
                      <div style={{ padding:"10px 12px", background:"var(--green-fill)", border:"1px solid var(--green-soft)", borderRadius:7, fontSize:12.5, color:"var(--green)", display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontFamily:"JetBrains Mono", fontWeight:700 }}>✓</span>
                        <span>Connected as <code style={{ fontFamily:"JetBrains Mono" }}>data-platform@acme.com</code> · 8 scopes granted</span>
                        <button onClick={function(){ setAuthConnected(false); }} style={{ marginLeft:"auto", background:"none", border:"none", color:"var(--green)", cursor:"pointer", fontFamily:"JetBrains Mono", fontSize:11, textDecoration:"underline" }}>disconnect</button>
                      </div>
                    )}
                  </div>
                )}
                {connectorDef.auth === "apikey" && (
                  <div>
                    <label style={lbl}>API KEY</label>
                    <input value={authKey} onChange={function(e){ setAuthKey(e.target.value); }} placeholder={connectorDef.id === "stripe" ? "sk_live_…" : "API key from " + connectorDef.name} style={Object.assign({}, inp, { fontFamily:"JetBrains Mono" })} />
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)", marginTop:6 }}>Encrypted at rest with AES-256.</div>
                  </div>
                )}
                {connectorDef.auth === "connstr" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12 }}>
                      <div>
                        <label style={lbl}>HOST / ACCOUNT</label>
                        <input value={authHost} onChange={function(e){ setAuthHost(e.target.value); }} placeholder={connectorDef.id === "snowflake" ? "myorg-acme.snowflakecomputing.com" : "host or account identifier"} style={Object.assign({}, inp, { fontFamily:"JetBrains Mono" })} />
                      </div>
                      <div>
                        <label style={lbl}>DATABASE / WAREHOUSE</label>
                        <input value={authDb} onChange={function(e){ setAuthDb(e.target.value); }} placeholder="PROD_DW" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono" })} />
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div>
                        <label style={lbl}>USERNAME</label>
                        <input value={authUser} onChange={function(e){ setAuthUser(e.target.value); }} placeholder="svc_ecg_reader" style={inp} />
                      </div>
                      <div>
                        <label style={lbl}>PASSWORD</label>
                        <input value={authPass} onChange={function(e){ setAuthPass(e.target.value); }} type="password" placeholder="••••••••" style={inp} />
                      </div>
                    </div>
                    <button onClick={function(){ setAuthConnected(true); }} className="btn-ghost" style={{ alignSelf:"flex-start" }}>Test connection →</button>
                    {authConnected && (
                      <div style={{ padding:"8px 11px", background:"var(--green-fill)", border:"1px solid var(--green-soft)", borderRadius:7, fontSize:12, color:"var(--green)" }}>✓ Connection successful · responded in 142ms</div>
                    )}
                  </div>
                )}
                {connectorDef.auth === "keys" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div>
                      <label style={lbl}>ACCESS KEY ID</label>
                      <input value={authUser} onChange={function(e){ setAuthUser(e.target.value); }} placeholder="AKIA…" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono" })} />
                    </div>
                    <div>
                      <label style={lbl}>SECRET ACCESS KEY</label>
                      <input value={authKey} onChange={function(e){ setAuthKey(e.target.value); }} type="password" placeholder="••••••••" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono" })} />
                    </div>
                    <div>
                      <label style={lbl}>REGION</label>
                      <select value={authHost || "us-east-1"} onChange={function(e){ setAuthHost(e.target.value); }} style={inp}>
                        <option value="us-east-1">us-east-1</option><option value="us-west-2">us-west-2</option><option value="eu-west-1">eu-west-1</option><option value="ap-south-1">ap-south-1</option>
                      </select>
                    </div>
                  </div>
                )}
                {connectorDef.auth === "none" && (
                  <div style={{ padding:"16px 18px", background:"var(--panel-2)", border:"1px dashed var(--line)", borderRadius:8, fontSize:13, color:"var(--ink-3)" }}>No authentication required for this connector.</div>
                )}
                  </div>
                )}
              </div>
            )}

            {step === 3 && paradigm === "structured" && (
              <div style={{ maxWidth:780, display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <label style={lbl}>OBJECTS / TABLES</label>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{selectedObjects.length + " of " + sampleObjects.length + " selected"}</span>
                  </div>
                  <div style={{ position:"relative", marginBottom:8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--ink-3)", pointerEvents:"none" }}><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    <input value={objectFilter} onChange={function(e){ setObjectFilter(e.target.value); }} placeholder="Filter objects…" style={Object.assign({}, inp, { paddingLeft:30, fontFamily:"JetBrains Mono", fontSize:12.5 })} />
                  </div>
                  <div style={{ border:"1px solid var(--line)", borderRadius:8, maxHeight:340, overflowY:"auto" }}>
                    {sampleObjects.filter(function(o){ return !objectFilter || o.toLowerCase().indexOf(objectFilter.toLowerCase()) >= 0; }).map(function(o, i, arr) {
                      var isOn = selectedObjects.indexOf(o) >= 0;
                      return (
                        <div key={o} onClick={function(){ toggleObject(o); }}
                          style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none", cursor:"pointer", background: isOn ? "var(--bg-canvas)" : "transparent" }}>
                          <span style={{ width:16, height:16, borderRadius:4, border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isOn ? "var(--ink)" : "transparent", color:"var(--bg-canvas)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, flexShrink:0 }}>{isOn ? "✓" : ""}</span>
                          <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink)", flex:1 }}>{o}</code>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>~{(1000 + ((o.length * 137) % 50000)).toLocaleString() + " rows"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label style={lbl}>OPTIONAL WHERE FILTER (applies to all)</label>
                  <input placeholder="e.g. is_deleted = false AND created_at > '2024-01-01'" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono", fontSize:12 })} />
                </div>
              </div>
            )}

            {step === 3 && paradigm === "documents" && (
              <div style={{ maxWidth:780, display:"flex", flexDirection:"column", gap:18 }}>
                <div>
                  <label style={lbl}>FOLDER PATH</label>
                  <input value={folderPath} onChange={function(e){ setFolderPath(e.target.value); }} placeholder={connectorDef.id === "sharepoint" ? "/sites/Legal/Contracts/2025" : connectorDef.id === "s3" ? "s3://bucket-name/path/" : "Folder or path"} style={Object.assign({}, inp, { fontFamily:"JetBrains Mono", fontSize:12.5 })} />
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:6 }}>
                    Suggestions:
                    {sampleFolders.slice(0, 4).map(function(f){
                      return <button key={f} onClick={function(){ setFolderPath(f); }} style={{ marginLeft:6, background:"var(--chip)", border:"1px solid var(--line-2)", borderRadius:4, padding:"2px 7px", fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-2)", cursor:"pointer" }}>{f}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <label style={lbl}>FILE TYPES TO PROCESS</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {["pdf","docx","xlsx","pptx","txt","md","html","eml"].map(function(t){
                      var isOn = fileTypes.indexOf(t) >= 0;
                      return <button key={t} onClick={function(){ toggleFileType(t); }} style={{ padding:"6px 11px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:6, background: isOn ? "var(--ink)" : "var(--bg-canvas)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontFamily:"JetBrains Mono", fontSize:11, cursor:"pointer" }}>.{t}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <label style={lbl}>SCAN OPTIONS</label>
                  <label style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", border:"1px solid var(--line)", borderRadius:7, cursor:"pointer", background: recursive ? "var(--bg-canvas)" : "var(--panel)" }}>
                    <input type="checkbox" checked={recursive} onChange={function(e){ setRecursive(e.target.checked); }} style={{ accentColor:"var(--ink)" }} />
                    <span style={{ fontSize:13, color:"var(--ink)" }}>Recursively scan sub-folders</span>
                  </label>
                </div>
              </div>
            )}

            {step === 3 && paradigm === "event" && (
              <div style={{ maxWidth:640, display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={lbl}>TOPIC / STREAM NAME</label>
                  <input value={topicName} onChange={function(e){ setTopicName(e.target.value); }} placeholder="e.g. crm.account.updated" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono" })} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={lbl}>STARTING OFFSET</label>
                    <select style={inp}><option>latest</option><option>earliest</option><option>specific timestamp</option></select>
                  </div>
                  <div>
                    <label style={lbl}>CONSUMER GROUP</label>
                    <input placeholder="ecg-graph-consumer" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono" })} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && paradigm === "manual" && (
              <div style={{ maxWidth:640, padding:"16px 18px", background:"var(--panel-2)", border:"1px dashed var(--line)", borderRadius:8, fontSize:13, color:"var(--ink-3)" }}>
                Manual sources don't have a source location. Records are added or edited directly through the steward UI or by uploading a CSV file.
              </div>
            )}

            {step === 4 && (paradigm === "structured" || paradigm === "event") && (
              <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:780 }}>
                <div>
                  <label style={lbl}>TARGET NODE TYPE</label>
                  <select value={targetNodeId} onChange={function(e){ setTargetNodeId(e.target.value); }} style={inp}>
                    {NODES.filter(function(n){ return n.type !== "source"; }).map(function(n){ return <option key={n.id} value={n.id}>{n.label}</option>; })}
                  </select>
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <label style={lbl}>COLUMN → PROPERTY MAPPING</label>
                    <button onClick={function(){
                      var auto = {};
                      targetProps.forEach(function(p){
                        var src = (paradigm === "structured" ? ["Id","Name","Email","Domain","CreatedAt","UpdatedAt","Status","Amount","Tier","Region","Industry","OwnerId","BillingCountry","AnnualRevenue"] : ["id","name","email","domain","created_at","status","amount"])
                          .find(function(c){ return c.toLowerCase().replace(/_/g,"").indexOf(p.name.replace(/_/g,"")) >= 0 || p.name.replace(/_/g,"").indexOf(c.toLowerCase().replace(/_/g,"")) >= 0; });
                        if (src) auto[src] = p.name;
                      });
                      setColumnMap(auto);
                    }} className="btn-ghost" style={{ fontSize:11.5 }}>⚡ Auto-detect</button>
                  </div>
                  <div style={{ border:"1px solid var(--line)", borderRadius:8, overflow:"hidden" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 24px 0.9fr 24px 1fr", gap:6, background:"var(--panel-2)", borderBottom:"1px solid var(--line-2)", padding:"7px 12px", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>
                      <div>{paradigm === "structured" ? "Source column" : "Event field"}</div>
                      <div/>
                      <div>Transform <span style={{ textTransform:"none", color:"var(--ink-4)" }}>(optional)</span></div>
                      <div/>
                      <div>Target property</div>
                    </div>
                    {(paradigm === "structured" ? ["Id","Name","Email","Domain","Industry","Tier","Region","CreatedAt","AnnualRevenue","OwnerId","BillingCountry"] : ["id","name","email","status","timestamp","payload.amount","payload.currency","headers.source"]).map(function(srcCol, i, arr) {
                      var mapped = columnMap[srcCol];
                      var transform = columnTransform[srcCol] || "";
                      return (
                        <div key={srcCol} style={{ display:"grid", gridTemplateColumns:"1fr 24px 0.9fr 24px 1fr", gap:6, padding:"6px 12px", alignItems:"center", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none" }}>
                          <code style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink-2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{srcCol}</code>
                          <span style={{ textAlign:"center", color:"var(--ink-3)", fontFamily:"JetBrains Mono" }}>→</span>
                          <select value={transform} onChange={function(e){
                            var v = e.target.value;
                            setColumnTransform(function(m){ var n = Object.assign({}, m); if (v) n[srcCol] = v; else delete n[srcCol]; return n; });
                          }} style={Object.assign({}, inp, { padding:"5px 8px", fontSize:11.5, fontFamily:"JetBrains Mono", color: transform ? "var(--purple)" : "var(--ink-3)" })}>
                            <option value="">— none —</option>
                            <option value="lower">lower()</option>
                            <option value="upper">upper()</option>
                            <option value="trim">trim()</option>
                            <option value="normalize_domain">normalize_domain()</option>
                            <option value="normalize_phone">normalize_phone()</option>
                            <option value="normalize_email">normalize_email()</option>
                            <option value="to_iso_date">to_iso_date()</option>
                            <option value="to_decimal">to_decimal()</option>
                            <option value="parse_currency">parse_currency()</option>
                            <option value="bucket_arr">bucket_arr() → tier</option>
                            <option value="hash_sha256">hash_sha256() — PII safe</option>
                            <option value="regex_replace">regex_replace(…)</option>
                            <option value="custom">custom JS expression…</option>
                          </select>
                          <span style={{ textAlign:"center", color:"var(--ink-3)", fontFamily:"JetBrains Mono" }}>→</span>
                          <select value={mapped || ""} onChange={function(e){
                            var v = e.target.value;
                            setColumnMap(function(m){ var n = Object.assign({}, m); if (v) n[srcCol] = v; else delete n[srcCol]; return n; });
                          }} style={Object.assign({}, inp, { padding:"5px 8px", fontSize:12, fontFamily:"JetBrains Mono" })}>
                            <option value="">— skip —</option>
                            {targetProps.map(function(p){ return <option key={p.name} value={p.name}>{p.name + " (" + p.type + ")"}</option>; })}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && paradigm === "documents" && (
              <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:880 }}>
                <div>
                  <label style={lbl}>TARGET NODE TYPE</label>
                  <select value={targetNodeId} onChange={function(e){ setTargetNodeId(e.target.value); }} style={Object.assign({}, inp, { maxWidth:340 })}>
                    {NODES.filter(function(n){ return n.type !== "source"; }).map(function(n){ return <option key={n.id} value={n.id}>{n.label}</option>; })}
                  </select>
                </div>
                <div>
                  <label style={lbl}>EXTRACTION PROMPT</label>
                  <textarea value={extractionPrompt} onChange={function(e){ setExtractionPrompt(e.target.value); }} rows={4} style={Object.assign({}, inp, { fontFamily:"JetBrains Mono", fontSize:12, resize:"vertical", lineHeight:1.55 })} />
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:6 }}>The model will be given this instruction along with each document. Be explicit; ask it to return null when uncertain.</div>
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <label style={lbl}>FIELDS TO EXTRACT</label>
                    <button onClick={addField} className="btn-ghost" style={{ fontSize:11.5 }}>+ Add field</button>
                  </div>
                  <div style={{ border:"1px solid var(--line)", borderRadius:8, overflow:"hidden" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 2fr 32px", gap:0, background:"var(--panel-2)", borderBottom:"1px solid var(--line-2)", padding:"7px 12px", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>
                      <div>Name</div><div>Type</div><div>Description for the model</div><div/>
                    </div>
                    {extractionFields.map(function(f, i) {
                      return (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 100px 2fr 32px", gap:6, padding:"6px 12px", alignItems:"center", borderBottom: i < extractionFields.length-1 ? "1px solid var(--line-2)" : "none" }}>
                          <input value={f.name} onChange={function(e){ updateField(i, "name", e.target.value); }} style={Object.assign({}, inp, { padding:"5px 8px", fontSize:12, fontFamily:"JetBrains Mono" })} />
                          <select value={f.type} onChange={function(e){ updateField(i, "type", e.target.value); }} style={Object.assign({}, inp, { padding:"5px 8px", fontSize:12, fontFamily:"JetBrains Mono" })}>
                            <option value="string">string</option><option value="string[]">string[]</option><option value="decimal">decimal</option><option value="bool">bool</option><option value="date">date</option><option value="timestamp">timestamp</option><option value="enum">enum</option>
                          </select>
                          <input value={f.desc} onChange={function(e){ updateField(i, "desc", e.target.value); }} style={Object.assign({}, inp, { padding:"5px 8px", fontSize:12 })} />
                          <button onClick={function(){ removeField(i); }} disabled={extractionFields.length === 1} style={{ width:26, height:26, borderRadius:5, border:"1px solid var(--line)", background: extractionFields.length === 1 ? "transparent" : "var(--bg-canvas)", color:"var(--ink-3)", cursor: extractionFields.length === 1 ? "not-allowed" : "pointer", opacity: extractionFields.length === 1 ? 0.4 : 1 }}>×</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
                  <div>
                    <label style={lbl}>LLM MODEL</label>
                    <select value={llmModel} onChange={function(e){ setLlmModel(e.target.value); }} style={inp}>
                      <option value="claude-3.5-sonnet">Claude 3.5 Sonnet · best quality</option>
                      <option value="claude-3.5-haiku">Claude 3.5 Haiku · fast & cheap</option>
                      <option value="gpt-4o">GPT-4o · best quality</option>
                      <option value="gpt-4o-mini">GPT-4o mini · fast & cheap</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>MIN CONFIDENCE</label>
                    <input value={confThreshold} onChange={function(e){ setConfThreshold(e.target.value); }} style={Object.assign({}, inp, { fontFamily:"JetBrains Mono" })} />
                  </div>
                </div>
                <div style={{ padding:"12px 14px", border:"1px dashed var(--line)", borderRadius:8, background:"var(--panel-2)" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>TEST ON SAMPLE</span>
                    <button className="btn-ghost" style={{ fontSize:11.5 }}>Run on 3 sample docs →</button>
                  </div>
                  <div style={{ fontSize:11.5, color:"var(--ink-3)", lineHeight:1.5 }}>Pick 3 documents from the folder and preview the extraction output before committing. Estimated cost: <code style={{ fontFamily:"JetBrains Mono", color:"var(--ink-2)" }}>~$0.04 / 3 docs</code>.</div>
                </div>
              </div>
            )}

            {step === 4 && paradigm === "manual" && (
              <div style={{ maxWidth:640 }}>
                <label style={lbl}>TARGET NODE TYPE</label>
                <select value={targetNodeId} onChange={function(e){ setTargetNodeId(e.target.value); }} style={inp}>
                  {NODES.filter(function(n){ return n.type !== "source"; }).map(function(n){ return <option key={n.id} value={n.id}>{n.label}</option>; })}
                </select>
              </div>
            )}

            {step === 5 && (
              <div style={{ maxWidth:780, display:"flex", flexDirection:"column", gap:20 }}>
                <div>
                  <label style={lbl}>SYNC STRATEGY</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      { id:"full",        l:"Full refresh",    d:"Replace everything every sync. Simple, expensive." },
                      { id:"incremental", l:"Incremental",     d:"Only changed rows since last sync. Most efficient." },
                      { id:"append",      l:"Append-only",     d:"New rows only; never modify or delete." },
                      { id:"streaming",   l:"Streaming / CDC", d:"Real-time change-data-capture. Requires CDC source." }
                    ].map(function(o){
                      var isOn = syncStrategy === o.id;
                      var disabled = (paradigm === "documents" && o.id === "streaming") || (paradigm === "event" && o.id !== "streaming" && o.id !== "append");
                      return (
                        <button key={o.id} disabled={disabled} onClick={function(){ if (!disabled) setSyncStrategy(o.id); }}
                          style={{ textAlign:"left", padding:"10px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, fontFamily:"inherit" }}>
                          <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>{o.l}</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3 }}>{o.d}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div>
                    <label style={lbl}>FREQUENCY</label>
                    <select value={syncFrequency} onChange={function(e){ setSyncFrequency(e.target.value); }} disabled={syncStrategy === "streaming"} style={inp}>
                      <option value="realtime">Real-time (CDC)</option>
                      <option value="15m">Every 15 minutes</option>
                      <option value="hourly">Hourly</option>
                      <option value="6h">Every 6 hours</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="manual">Manual only</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>ON DUPLICATE / CONFLICT</label>
                    <select value={conflictHandling} onChange={function(e){ setConflictHandling(e.target.value); }} style={inp}>
                      <option value="overwrite">Overwrite — source wins</option>
                      <option value="merge">Merge — apply survivorship rules</option>
                      <option value="skip">Skip — keep existing</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>BACKFILL ON FIRST SYNC</label>
                  <select value={backfill} onChange={function(e){ setBackfill(e.target.value); }} style={Object.assign({}, inp, { maxWidth:360 })}>
                    <option value="none">No backfill — start from now</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last 1 year</option>
                    <option value="all">All historical data</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>ON ERROR</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      { id:"retry",      l:"Retry with backoff",    d:"Auto-retry transient failures with exponential backoff up to 5 attempts." },
                      { id:"quarantine", l:"Quarantine the row",    d:"Park failing rows in a quarantine table; let the rest of the batch continue." },
                      { id:"alert",      l:"Page on-call",          d:"Open an incident and notify the on-call rotation. Pipeline keeps running." },
                      { id:"stop",       l:"Stop the pipeline",     d:"Halt the entire pipeline on first error. Use for high-stakes critical sources." }
                    ].map(function(o){
                      var isOn = onError === o.id;
                      return (
                        <button key={o.id} onClick={function(){ setOnError(o.id); }}
                          style={{ textAlign:"left", padding:"11px 13px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:8, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit" }}>
                          <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)", marginBottom:4 }}>{o.l}</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", lineHeight:1.45 }}>{o.d}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div style={{ maxWidth:780, display:"flex", flexDirection:"column", gap:20 }}>
                <div>
                  <label style={lbl}>DATA CLASSIFICATION</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
                    {[
                      { id:"public",       l:"Public",       d:"No restrictions on access or storage", color:"var(--ink-3)" },
                      { id:"internal",     l:"Internal",     d:"Internal-only; standard access controls", color:"var(--blue)" },
                      { id:"confidential", l:"Confidential", d:"Limited access; encrypted in transit & at rest", color:"var(--gold)" },
                      { id:"restricted",   l:"Restricted",   d:"Strict access; needs DLP and audit trail", color:"var(--coral)" }
                    ].map(function(o){
                      var isOn = classification === o.id;
                      return (
                        <button key={o.id} onClick={function(){ setClassification(o.id); }}
                          style={{ textAlign:"left", padding:"11px 13px", border:"1px solid " + (isOn ? o.color : "var(--line)"), borderRadius:8, background: isOn ? o.color + "15" : "var(--panel)", cursor:"pointer", fontFamily:"inherit" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                            <span style={{ width:8, height:8, borderRadius:"50%", background:o.color }} />
                            <span style={{ fontSize:13, fontWeight: isOn ? 600 : 500, color: isOn ? o.color : "var(--ink)" }}>{o.l}</span>
                          </div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", lineHeight:1.45 }}>{o.d}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div>
                    <label style={lbl}>FRESHNESS SLO (p95 ≤)</label>
                    <select value={sloTarget} onChange={function(e){ setSloTarget(e.target.value); }} style={inp}>
                      <option value="5m">5 minutes</option><option value="15m">15 minutes</option><option value="30m">30 minutes</option><option value="1h">1 hour</option><option value="6h">6 hours</option><option value="24h">24 hours</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>ALLOWED PROCESSING REGIONS</label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {[{ id:"us", l:"US" },{ id:"eu", l:"EU" },{ id:"apac", l:"APAC" },{ id:"any", l:"Any" }].map(function(r){
                        var isOn = allowedRegions.indexOf(r.id) >= 0;
                        return <button key={r.id} onClick={function(){
                          setAllowedRegions(function(arr){ return isOn ? arr.filter(function(x){ return x !== r.id; }) : arr.concat([r.id]); });
                        }} style={{ padding:"7px 11px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:6, background: isOn ? "var(--ink)" : "var(--bg-canvas)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontFamily:"JetBrains Mono", fontSize:11, cursor:"pointer" }}>{r.l}</button>;
                      })}
                    </div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)", marginTop:6 }}>Where this source's data may be stored and processed.</div>
                  </div>
                </div>

                <div>
                  <label style={lbl}>COMPLIANCE TAGS</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {["SOC2","GDPR","HIPAA","ISO27001","CCPA","PCI-DSS"].map(function(t){
                      var isOn = complianceTags.indexOf(t) >= 0;
                      return <button key={t} onClick={function(){
                        setComplianceTags(function(arr){ return isOn ? arr.filter(function(x){ return x !== t; }) : arr.concat([t]); });
                      }} style={{ padding:"7px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:6, background: isOn ? "var(--ink)" : "var(--bg-canvas)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontFamily:"JetBrains Mono", fontSize:11, cursor:"pointer" }}>{t}</button>;
                    })}
                  </div>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)", marginTop:6 }}>Tag this source under the compliance frameworks it must satisfy.</div>
                </div>

                <div>
                  <label style={lbl}>REQUIRED APPROVERS BEFORE ACTIVATION</label>
                  <div style={{ display:"flex", flexDirection:"column", gap:5, border:"1px solid var(--line)", borderRadius:8, padding:"6px 8px", background:"var(--panel)" }}>
                    {[
                      { id:"data-platform-owner", l:"Data platform owner", required: true },
                      { id:"security",             l:"Security review",      required: classification === "confidential" || classification === "restricted" },
                      { id:"legal",                l:"Legal / privacy",      required: complianceTags.indexOf("GDPR") >= 0 || complianceTags.indexOf("HIPAA") >= 0 },
                      { id:"finance",              l:"Finance",              required: paradigm === "documents" && parseFloat(costCap) > 500 }
                    ].map(function(a, i, arr){
                      var isOn = approvers.indexOf(a.id) >= 0 || a.required;
                      return (
                        <label key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 8px", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none", cursor: a.required ? "default" : "pointer" }}>
                          <input type="checkbox" checked={isOn} disabled={a.required} onChange={function(e){
                            setApprovers(function(arr2){ if (e.target.checked) return arr2.indexOf(a.id) >= 0 ? arr2 : arr2.concat([a.id]); return arr2.filter(function(x){ return x !== a.id; }); });
                          }} style={{ accentColor:"var(--ink)" }} />
                          <span style={{ fontSize:12.5, color:"var(--ink)", flex:1 }}>{a.l}</span>
                          {a.required && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"1px 6px", borderRadius:3, background:"var(--coral-fill)", color:"var(--coral)", fontWeight:700 }}>AUTO-REQUIRED</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {paradigm === "documents" && (
                  <div>
                    <label style={lbl}>MONTHLY LLM COST CAP ($)</label>
                    <input value={costCap} onChange={function(e){ setCostCap(e.target.value); }} placeholder="100" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono", maxWidth:200 })} />
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:6 }}>Pause extraction when LLM spend exceeds this in a calendar month.</div>
                  </div>
                )}
              </div>
            )}

            {step === 7 && connectorDef && (
              <div style={{ maxWidth:760, display:"flex", flexDirection:"column", gap:18 }}>
                <div style={{ border:"1px solid var(--line)", borderRadius:10, padding:20, background:"var(--panel)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <ConnLogo c={connectorDef} size={36} />
                    <div>
                      <div style={{ fontSize:15, fontWeight:600, color:"var(--ink)" }}>{connectorDef.name} → {targetNode ? targetNode.label : "?"}</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3, letterSpacing:"0.4px", textTransform:"uppercase" }}>{paradigm + " · " + syncStrategy + " · " + syncFrequency}</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"160px 1fr", gap:"8px 14px", fontSize:12 }}>
                    <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>SOURCE</span>
                    <span style={{ color:"var(--ink)" }}>{paradigm === "structured" ? selectedObjects.length + " objects: " + selectedObjects.slice(0, 3).join(", ") + (selectedObjects.length > 3 ? "…" : "")
                                                       : paradigm === "documents" ? folderPath + " (" + fileTypes.join(", ") + ")"
                                                       : paradigm === "event" ? "topic " + topicName
                                                       : "manual"}</span>
                    <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>MAPPING</span>
                    <span style={{ color:"var(--ink)" }}>{paradigm === "documents" ? extractionFields.length + " extracted fields via " + llmModel : Object.keys(columnMap).length + " columns mapped"}</span>
                    <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>BACKFILL</span>
                    <span style={{ color:"var(--ink)" }}>{backfill === "none" ? "no backfill" : backfill}</span>
                    <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>CONFLICTS</span>
                    <span style={{ color:"var(--ink)" }}>{conflictHandling}</span>
                    <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>GOVERNANCE</span>
                    <span style={{ color:"var(--ink)" }}>{classification + " · SLO " + sloTarget + " · " + allowedRegions.join("/") + " · " + (complianceTags.length ? complianceTags.join(", ") : "no compliance tags")}</span>
                  </div>
                </div>
                <div>
                  <label style={lbl}>ON SAVE</label>
                  <div style={{ display:"flex", gap:6 }}>
                    {[{ id:true, l:"Activate immediately" },{ id:false, l:"Save as draft" }].map(function(o){
                      var isOn = activate === o.id;
                      return <button key={String(o.id)} onClick={function(){ setActivate(o.id); }} style={{ padding:"8px 14px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--ink)" : "var(--bg-canvas)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontSize:12.5, fontFamily:"inherit", cursor:"pointer" }}>{o.l}</button>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PREVIEW */}
          <div style={{ background:"var(--panel-2)", borderLeft:"1px solid var(--line)", padding:"20px 18px", overflowY:"auto", display:"flex", flexDirection:"column", gap:18 }}>
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>SOURCE SUMMARY</div>
              <pre style={{ fontFamily:"JetBrains Mono", fontSize:11, color: connectorDef ? connectorDef.color : "var(--ink-3)", margin:0, padding:"10px 12px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6, whiteSpace:"pre-wrap", lineHeight:1.55 }}>{buildSourceSummary()}</pre>
            </div>
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>ESTIMATED LOAD</div>
              <div style={{ padding:"12px 14px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6 }}>
                <div style={{ fontFamily:"Instrument Serif", fontSize:24, color:"var(--ink)", lineHeight:1 }}>
                  {paradigm === "structured" ? (selectedObjects.length * 12480).toLocaleString() + " rows"
                  : paradigm === "documents" ? "~2,400 docs"
                  : paradigm === "event" ? "~5K events/hr"
                  : "—"}
                </div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:5 }}>
                  {syncFrequency === "realtime" ? "streaming continuously" : "per " + syncFrequency + " refresh"}
                </div>
                {paradigm === "documents" && (
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-2)", marginTop:10, paddingTop:10, borderTop:"1px solid var(--line-2)" }}>
                    LLM cost: ~<b style={{ color:"var(--gold)" }}>${(extractionFields.length * 0.014).toFixed(2)}</b> / 1K docs<br/>
                    Cap: <code style={{ fontFamily:"JetBrains Mono", color:"var(--ink-2)" }}>${costCap}/mo</code>
                  </div>
                )}
              </div>
            </div>
            {paradigm === "documents" && step >= 4 && (
              <div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>EXTRACTION SCHEMA</div>
                <pre style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-2)", margin:0, padding:"10px 12px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6, whiteSpace:"pre-wrap", lineHeight:1.55 }}>{
                  "{\n" + extractionFields.map(function(f){ return "  \"" + f.name + "\": " + f.type; }).join(",\n") + "\n}"
                }</pre>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ flexShrink:0, padding:"14px 22px", borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--panel)" }}>
          <button className="btn-ghost" onClick={function(){ if (step > 1) setStep(function(s){ return s - 1; }); }} disabled={step === 1} style={{ opacity: step === 1 ? 0.4 : 1 }}>← Back</button>
          <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{"Step " + step + " of 7 · " + stepNames[step-1]}</span>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            {step < 7
              ? <button className="btn-dark" disabled={!canContinue()} onClick={function(){ setStep(function(s){ return s + 1; }); }} style={{ opacity: canContinue() ? 1 : 0.45 }}>Continue →</button>
              : <button className="btn-dark" onClick={onClose}>{activate ? "Activate source ↵" : "Save draft ↵"}</button>
            }
          </div>
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
      dur:  (1 + (ss+j)%4) + "m " + ((ss*j+3)%60) + "s",
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
      sloActual:    (1+(ss*3)%9) + "m " + ((ss*7)%60) + "s",
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


// ═══════════════════════════════════════════════════════════════════════════════
// NEW RULE FLOW — comprehensive modal builder
// 6 categories × 5 steps × 3-column layout
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 4 canonical MDM rule categories, each with sub-types ───
// Validation, Data Quality, Matching, Survivorship.
// Everything else (SLO, drift, compute, infer, access, identity-resolution flavours)
// is nested as a sub-type under the appropriate parent category.

var RULE_CATEGORIES = [
  {
    id: "validation",
    label: "Validation",
    code: "VAL",
    color: "var(--blue)",
    fill: "var(--blue-fill)",
    icon: "✓",
    title: "Validation rules",
    purpose: "Gate at write & read time",
    desc: "Constrain what values are accepted when a record is written. Also gates sensitive fields behind required roles at read time.",
    examples: ["arr_usd ≥ 0", "email matches /^.+@.+\\..+$/", "tier IN (SMB, MM, ENT)", "fields(pii) → role:acct_admin"],
    types: [
      { id: "required",   label: "Required field",   desc: "Field must not be null on any record",          formId: "validate", preset: { vOp: "is_not_null" } },
      { id: "format",     label: "Format / pattern", desc: "Value must match a regex or format",            formId: "validate", preset: { vOp: "regex" } },
      { id: "range",      label: "Numeric range",    desc: "Numeric or date value within bounds",           formId: "validate", preset: { vOp: "between" } },
      { id: "enum",       label: "Enum membership",  desc: "Value must be from an allowed set",             formId: "validate", preset: { vOp: "in" } },
      { id: "comparison", label: "Comparison",       desc: "Compare against a constant or another field",   formId: "validate", preset: { vOp: "eq" } },
      { id: "access",     label: "Access policy",    desc: "Gate sensitive fields behind required roles",   formId: "access" }
    ]
  },
  {
    id: "quality",
    label: "Data quality",
    code: "DQ",
    color: "var(--green)",
    fill: "var(--green-fill)",
    icon: "◷",
    title: "Data quality rules",
    purpose: "Monitor, enrich, alert",
    desc: "Monitor data-quality dimensions over time, detect drift, and materialise derived or inferred values.",
    examples: ["p95(ingest_lag) < 30m over 24h", "fill_rate(domain) > 95%", "tier := bucket(arr_usd)", "drift_score(industry) < 0.15"],
    types: [
      { id: "freshness",    label: "Freshness SLO",      desc: "p95 ingest lag below a target",          formId: "slo",     preset: { sloDim: "freshness" } },
      { id: "completeness", label: "Completeness SLO",   desc: "Non-null fill rate over a field",        formId: "slo",     preset: { sloDim: "completeness" } },
      { id: "validity",     label: "Validity SLO",       desc: "% records passing validation rules",     formId: "slo",     preset: { sloDim: "validity" } },
      { id: "uniqueness",   label: "Uniqueness SLO",     desc: "Distinct value ratio for a field",       formId: "slo",     preset: { sloDim: "uniqueness" } },
      { id: "drift",        label: "Drift detection",    desc: "Distribution shift vs baseline",         formId: "slo",     preset: { sloDim: "drift" } },
      { id: "compute",      label: "Computed property",  desc: "Derive a property from formula or agent",formId: "compute", preset: { cMode: "property" } },
      { id: "infer",        label: "Inferred edge",      desc: "Materialise an edge from a Cypher pattern", formId: "compute", preset: { cMode: "edge" } }
    ]
  },
  {
    id: "matching",
    label: "Matching",
    code: "MAT",
    color: "var(--purple)",
    fill: "var(--purple-fill)",
    icon: "≈",
    title: "Matching rules",
    purpose: "Resolve identity across sources",
    desc: "Recognise when two records refer to the same real-world entity. Identity resolution and deduplication.",
    examples: ["tax_id exact → auto-merge", "domain + fuzzy(name)×0.4 → review", "common_neighbor(:HAS_SUBSCRIPTION) → score"],
    types: [
      { id: "deterministic", label: "Deterministic",        desc: "Exact key match (tax_id, domain, sso_id)",     formId: "match", preset: { signals: [{ strategy: "exact", weight: 1.0 }], mAuto: "1.00", mReview: "0.99" } },
      { id: "probabilistic", label: "Probabilistic",        desc: "Multi-signal weighted fuzzy scoring",          formId: "match" },
      { id: "topology",      label: "Common neighbour",     desc: "Match by shared graph topology",               formId: "match", preset: { signals: [{ strategy: "common_neighbor", weight: 1.0 }] } },
      { id: "embedding",     label: "Embedding similarity", desc: "Vector / semantic similarity on text fields",  formId: "match", preset: { signals: [{ strategy: "embedding", weight: 1.0 }] } }
    ]
  },
  {
    id: "survivorship",
    label: "Survivorship",
    code: "SUR",
    color: "var(--coral)",
    fill: "var(--coral-fill)",
    icon: "★",
    title: "Survivorship rules",
    purpose: "Pick the winning value",
    desc: "Decide which source's value wins for a property when multiple sources disagree. Builds the golden record.",
    examples: ["arr_usd ← NetSuite > Salesforce > HubSpot", "domain ← most_complete wins", "company_name ← most_recent"],
    types: [
      { id: "source_priority", label: "Source priority",     desc: "Pick from a ranked list of source systems", formId: "survive", preset: { sStrategy: "source_priority" } },
      { id: "recency",         label: "Most recent",         desc: "Newest updated_at wins",                    formId: "survive", preset: { sStrategy: "recency" } },
      { id: "completeness",    label: "Most complete",       desc: "Longest non-null value wins",               formId: "survive", preset: { sStrategy: "completeness" } },
      { id: "trust",           label: "Trust tier",          desc: "Sources classified by trust level",         formId: "survive", preset: { sStrategy: "source_trust" } },
      { id: "confidence",      label: "Confidence weighted", desc: "Blend values by per-value confidence",      formId: "survive", preset: { sStrategy: "confidence_weighted" } },
      { id: "manual",          label: "Manual override",     desc: "Steward edit always wins",                  formId: "survive", preset: { sStrategy: "manual_override" } }
    ]
  }
];

function NewRuleFlow({ node, onClose }) {
  var props = generateProps(node);
  var firstField = (props[0] && props[0].name) || "";

  var [step, setStep] = useState(1);
  var [cat, setCat] = useState(null);
  var [subType, setSubType] = useState(null);

  // VALIDATE state
  var [vField, setVField] = useState(firstField);
  var [vOp, setVOp] = useState("is_not_null");
  var [vVal, setVVal] = useState("");
  var [vVal2, setVVal2] = useState("");

  // MATCH state
  var [mSignals, setMSignals] = useState([{ field: firstField, strategy: "exact", weight: 1.0 }]);
  var [mAuto, setMAuto] = useState("0.92");
  var [mReview, setMReview] = useState("0.75");
  var [mAction, setMAction] = useState("queue");

  // SURVIVE state
  var [sProperty, setSProperty] = useState(firstField);
  var [sStrategy, setSStrategy] = useState("source_priority");
  var [sSources, setSSources] = useState(["NetSuite ERP", "Salesforce CRM", "HubSpot Marketing"]);
  var [sMinConf, setSMinConf] = useState("0.80");

  // COMPUTE state
  var [cMode, setCMode] = useState("property");
  var [cOutName, setCOutName] = useState("");
  var [cOutType, setCOutType] = useState("string");
  var [cExpr, setCExpr] = useState("");
  var [cRecompute, setCRecompute] = useState("on_change");
  var [cEdgeLabel, setCEdgeLabel] = useState("");
  var [cEdgeTarget, setCEdgeTarget] = useState("");

  // SLO state
  var [sloDim, setSloDim] = useState("freshness");
  var [sloField, setSloField] = useState(firstField);
  var [sloTarget, setSloTarget] = useState("30");
  var [sloUnit, setSloUnit] = useState("m");
  var [sloWindow, setSloWindow] = useState("24h");
  var [sloAlertChan, setSloAlertChan] = useState("#data-alerts");

  // ACCESS state
  var [accScope, setAccScope] = useState("pii");
  var [accSpecific, setAccSpecific] = useState((props.find(function(p){ return p.pii; }) || {}).name || firstField);
  var [accRoles, setAccRoles] = useState(["acct_admin"]);
  var [accRolesInput, setAccRolesInput] = useState("");
  var [accMasking, setAccMasking] = useState("redact");

  // Common
  var [title, setTitle] = useState("");
  var [description, setDescription] = useState("");
  var [scopeMode, setScopeMode] = useState("all");
  var [scopeFilter, setScopeFilter] = useState("");
  var [trigger, setTrigger] = useState("on_write");
  var [schedule, setSchedule] = useState("hourly");
  var [severity, setSeverity] = useState("ERROR");
  var [onViolation, setOnViolation] = useState(["log"]);
  var [notifyChan, setNotifyChan] = useState("");
  var [activate, setActivate] = useState(true);

  var catDef = RULE_CATEGORIES.find(function(c){ return c.id === cat; });
  var subTypeDef = catDef && subType ? catDef.types.find(function(t){ return t.id === subType; }) : null;
  // formId determines which form body to render (validate, slo, compute, match, survive, access)
  var formId = subTypeDef ? subTypeDef.formId : null;

  // When category changes, default sub-type to the first one in that category and apply its preset
  function pickCategory(newCatId) {
    var newCatDef = RULE_CATEGORIES.find(function(c){ return c.id === newCatId; });
    if (!newCatDef) return;
    setCat(newCatId);
    var firstType = newCatDef.types[0];
    setSubType(firstType.id);
    if (firstType.preset) applyPreset(firstType.preset);
  }
  // When sub-type changes within a category, just apply its preset
  function pickSubType(newSubTypeId) {
    setSubType(newSubTypeId);
    var t = catDef && catDef.types.find(function(x){ return x.id === newSubTypeId; });
    if (t && t.preset) applyPreset(t.preset);
  }
  function applyPreset(p) {
    if (p.vOp !== undefined) setVOp(p.vOp);
    if (p.sloDim !== undefined) setSloDim(p.sloDim);
    if (p.cMode !== undefined) setCMode(p.cMode);
    if (p.sStrategy !== undefined) setSStrategy(p.sStrategy);
    if (p.mAuto !== undefined) setMAuto(p.mAuto);
    if (p.mReview !== undefined) setMReview(p.mReview);
    if (p.signals) setMSignals(p.signals.map(function(s){ return { field: firstField, strategy: s.strategy, weight: s.weight }; }));
  }

  function opsForField(name) {
    var p = props.find(function(p){ return p.name === name; }) || {};
    var t = p.type || "string";
    if (t === "bool") return [{ id:"is_true", label:"is true" },{ id:"is_false", label:"is false" },{ id:"is_not_null", label:"is not null" }];
    if (t === "decimal" || t === "float") return [{ id:"is_not_null", label:"is not null" },{ id:"eq", label:"=" },{ id:"ne", label:"≠" },{ id:"gt", label:">" },{ id:"gte", label:"≥" },{ id:"lt", label:"<" },{ id:"lte", label:"≤" },{ id:"between", label:"between" }];
    if (t.indexOf("enum") === 0) return [{ id:"is_not_null", label:"is not null" },{ id:"in", label:"is one of" },{ id:"not_in", label:"is not one of" }];
    if (t === "timestamp" || t === "date") return [{ id:"is_not_null", label:"is not null" },{ id:"after", label:"is after" },{ id:"before", label:"is before" },{ id:"recent", label:"is within last" }];
    return [{ id:"is_not_null", label:"is not null" },{ id:"eq", label:"equals" },{ id:"ne", label:"not equals" },{ id:"contains", label:"contains" },{ id:"regex", label:"matches regex" },{ id:"starts", label:"starts with" },{ id:"ends", label:"ends with" }];
  }

  function buildExpression() {
    if (formId === "validate") {
      var v = vVal || "?";
      var quoted = isNaN(parseFloat(v)) ? "'" + v + "'" : v;
      var map = {
        is_not_null: vField + " IS NOT NULL", is_true: vField + " = TRUE", is_false: vField + " = FALSE",
        eq: vField + " = " + quoted, ne: vField + " != " + quoted,
        gt: vField + " > " + v, gte: vField + " >= " + v, lt: vField + " < " + v, lte: vField + " <= " + v,
        between: vField + " BETWEEN " + v + " AND " + (vVal2 || "?"),
        in: vField + " IN (" + v + ")", not_in: vField + " NOT IN (" + v + ")",
        contains: vField + " ILIKE '%" + v + "%'", regex: vField + " ~ /" + v + "/",
        starts: vField + " ILIKE '" + v + "%'", ends: vField + " ILIKE '%" + v + "'",
        after: vField + " > '" + v + "'", before: vField + " < '" + v + "'",
        recent: vField + " >= NOW() - INTERVAL '" + v + "'"
      };
      return map[vOp] || (vField + " " + vOp + " ?");
    }
    if (formId === "match") {
      var parts = mSignals.map(function(s){ return s.strategy + "(" + s.field + ")×" + s.weight; });
      return "score = " + parts.join(" + ") + "\n  auto_merge ≥ " + mAuto + "\n  review " + mReview + "–" + mAuto;
    }
    if (formId === "survive") {
      return sProperty + " ← " + sStrategy + (sStrategy === "source_priority" ? "(" + sSources.join(" > ") + ")" : "") + (sMinConf ? "\n  min_confidence = " + sMinConf : "");
    }
    if (formId === "compute") {
      if (cMode === "property") return (cOutName || "?") + " : " + cOutType + " := " + (cExpr || "?") + "\n  recompute " + cRecompute;
      return ":" + (cEdgeLabel || "?") + " → " + (cEdgeTarget || "?") + " WHEN " + (cExpr || "?");
    }
    if (formId === "slo") {
      var dim = sloDim === "freshness" ? "p95(ingest_lag) < " + sloTarget + sloUnit
        : sloDim === "completeness" ? "fill_rate(" + sloField + ") > " + sloTarget + "%"
        : sloDim === "validity" ? "pass_rate(" + sloField + ") > " + sloTarget + "%"
        : sloDim === "uniqueness" ? "distinct_ratio(" + sloField + ") > " + sloTarget + "%"
        : "drift_score(" + sloField + ") < " + sloTarget;
      return dim + " over " + sloWindow + " → alert " + sloAlertChan;
    }
    if (formId === "access") {
      var scope = accScope === "pii" ? "fields(pii=true)" : accScope === "all" ? "fields(*)" : accSpecific;
      return scope + " → require role:(" + accRoles.join(" OR ") + ")\n  on deny: " + accMasking;
    }
    return "—";
  }

  function canContinue() {
    if (step === 1) return !!cat;
    if (step === 2) {
      if (formId === "validate") return !!vField && !!vOp && (vOp === "is_not_null" || vOp === "is_true" || vOp === "is_false" || !!vVal);
      if (formId === "match")    return mSignals.length > 0 && mSignals.every(function(s){ return s.field && s.weight > 0; });
      if (formId === "survive")  return !!sProperty && !!sStrategy;
      if (formId === "compute")  return cMode === "property" ? (!!cOutName && !!cExpr) : (!!cEdgeLabel && !!cEdgeTarget);
      if (formId === "slo")      return !!sloTarget;
      if (formId === "access")   return accRoles.length > 0;
    }
    return true;
  }

  var inp = { border:"1px solid var(--line)", borderRadius:7, padding:"7px 10px", fontSize:13, fontFamily:"inherit", color:"var(--ink)", background:"var(--bg-canvas)", outline:"none", boxSizing:"border-box", width:"100%" };
  var lbl = { display:"block", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:6 };

  var stepNames = ["Category", "Configure", "Scope & trigger", "Behaviour", "Review"];
  var STEP_HINTS = {
    1: "What kind of rule are you creating? Each category addresses a distinct concern in the enterprise graph.",
    2: catDef ? "Configure the " + catDef.label.toLowerCase() + " logic. " + (
        formId === "validate" ? "Pick a field, an operator, and the value to enforce."
      : formId === "match"    ? "Add signal fields, pick a comparison strategy per field, and assign weights that sum to 1.0."
      : formId === "survive"  ? "Pick the property to govern and the arbitration strategy when sources disagree."
      : formId === "compute"  ? "Define the output, the expression, and when to recompute."
      : formId === "slo"      ? "Pick a data-quality dimension, the target, and the monitoring window."
      :                      "Pick the access scope, required roles, and the masking strategy on denial."
    ) : "",
    3: "Where does this rule apply and when does it run?",
    4: "Title, severity, and what happens when the rule fires.",
    5: "Review the full definition. Activate now or save as a draft pending approval."
  };

  function updateSignal(idx, key, val) {
    setMSignals(function(prev){
      return prev.map(function(s, i){
        if (i !== idx) return s;
        var n = {}; Object.keys(s).forEach(function(k){ n[k] = s[k]; });
        n[key] = val;
        return n;
      });
    });
  }
  function addSignal() { setMSignals(function(prev){ return prev.concat([{ field: firstField, strategy: "exact", weight: 0 }]); }); }
  function removeSignal(idx) { setMSignals(function(prev){ return prev.filter(function(_, i){ return i !== idx; }); }); }
  var weightSum = mSignals.reduce(function(s, x){ return s + (parseFloat(x.weight) || 0); }, 0);

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.42)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={function(e){ if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width:"94vw", maxWidth:1360, height:"94vh", background:"var(--bg-canvas)", borderRadius:12, border:"1px solid var(--line)", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.32)" }}>

        <div style={{ flexShrink:0, height:54, borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", background:"var(--panel)" }}>
          <div>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.7px", color:"var(--ink-3)", textTransform:"uppercase" }}>{node.label + " · NEW RULE"}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:2 }}>
              <span style={{ fontFamily:"Instrument Serif", fontSize:18, color:"var(--ink)" }}>{catDef ? (subTypeDef ? catDef.label + " · " + subTypeDef.label : catDef.title) : "Choose a category"}</span>
              {catDef && <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"2px 7px", borderRadius:4, background:catDef.fill, color:catDef.color, fontWeight:700, letterSpacing:"0.5px" }}>{catDef.code}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid var(--line)", background:"none", cursor:"pointer", fontSize:15, color:"var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ flex:1, display:"grid", gridTemplateColumns:"240px minmax(0, 1fr) 320px", minHeight:0 }}>

          {/* SIDEBAR */}
          <div style={{ background:"var(--panel-2)", borderRight:"1px solid var(--line)", padding:"20px 14px", display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
            {stepNames.map(function(name, i) {
              var n = i + 1; var isOn = step === n; var isDone = step > n;
              return (
                <button key={n} onClick={function(){ if (n < step || canContinue()) setStep(n); }}
                  style={{ display:"flex", gap:12, padding:"10px 12px", borderRadius:7, border: isOn ? "1px solid var(--line)" : "1px solid transparent", background: isOn ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                  <span style={{ width:22, height:22, borderRadius:"50%", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isDone ? "var(--green)" : isOn ? "var(--ink)" : "var(--bg-canvas)", color: isDone || isOn ? "var(--bg-canvas)" : "var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, flexShrink:0 }}>{isDone ? "✓" : n}</span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, color:"var(--ink)", fontWeight: isOn ? 500 : 400, lineHeight:1.2 }}>{name}</div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3, lineHeight:1.3 }}>
                      {n === 1 && (catDef ? catDef.label : "Pick category")}
                      {n === 2 && (subTypeDef ? subTypeDef.label : (catDef ? "Pick type" : "—"))}
                      {n === 3 && (scopeMode === "all" ? "All " + node.label : "Filtered")}
                      {n === 4 && (formId === "validate" || formId === "slo" || formId === "access" ? severity : (formId === "match" ? mAction : "—"))}
                      {n === 5 && (activate ? "Activate" : "Draft")}
                    </div>
                  </div>
                </button>
              );
            })}
            <div style={{ marginTop:"auto", padding:"12px 8px", borderTop:"1px dashed var(--line-2)" }}>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)", letterSpacing:"0.4px", textTransform:"uppercase", marginBottom:6 }}>SHORTCUTS</div>
              <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"5px 10px", fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", alignItems:"center" }}>
                <span style={{ padding:"1px 5px", borderRadius:3, background:"var(--bg-canvas)", border:"1px solid var(--line)" }}>⌘↵</span><span>Activate</span>
                <span style={{ padding:"1px 5px", borderRadius:3, background:"var(--bg-canvas)", border:"1px solid var(--line)" }}>⌘S</span><span>Save draft</span>
                <span style={{ padding:"1px 5px", borderRadius:3, background:"var(--bg-canvas)", border:"1px solid var(--line)" }}>esc</span><span>Cancel</span>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div style={{ padding:"24px 32px 28px", overflowY:"auto" }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.8px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:5 }}>{"STEP " + step + " / 5"}</div>
              <div style={{ fontFamily:"Instrument Serif", fontSize:26, color:"var(--ink)", lineHeight:1.1, marginBottom:8 }}>{stepNames[step-1]}</div>
              <div style={{ fontSize:13, color:"var(--ink-3)", lineHeight:1.55, maxWidth:640 }}>{STEP_HINTS[step]}</div>
            </div>

            {step === 1 && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, maxWidth:880 }}>
                {RULE_CATEGORIES.map(function(c) {
                  var isOn = cat === c.id;
                  return (
                    <button key={c.id} onClick={function(){ pickCategory(c.id); }}
                      style={{ textAlign:"left", padding:"18px 20px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isOn ? "var(--bg-canvas)" : "var(--panel)", borderRadius:10, cursor:"pointer", fontFamily:"inherit", transition:"border-color 80ms", display:"flex", flexDirection:"column", gap:12, boxShadow: isOn ? "0 0 0 2px color-mix(in oklab, var(--ink) 8%, transparent)" : "none" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <span style={{ width:34, height:34, borderRadius:8, background:c.fill, color:c.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700 }}>{c.icon}</span>
                          <div>
                            <div style={{ fontSize:15, fontWeight:600, color:"var(--ink)" }}>{c.title}</div>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
                              <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:c.color, letterSpacing:"0.6px", fontWeight:700 }}>{c.code}</span>
                              <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)", letterSpacing:"0.4px" }}>{"· " + c.purpose}</span>
                            </div>
                          </div>
                        </div>
                        {isOn && <span style={{ color:"var(--green)", fontFamily:"JetBrains Mono", fontWeight:700 }}>✓</span>}
                      </div>
                      <div style={{ fontSize:12.5, color:"var(--ink-3)", lineHeight:1.5 }}>{c.desc}</div>
                      <div style={{ borderTop:"1px dashed var(--line-2)", paddingTop:10 }}>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--ink-4)", letterSpacing:"0.6px", textTransform:"uppercase", marginBottom:6 }}>{c.types.length + " RULE TYPES"}</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          {c.types.map(function(t){
                            return <span key={t.id} style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"2px 7px", borderRadius:4, background:"var(--chip)", color:"var(--ink-2)" }}>{t.label}</span>;
                          })}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* SUB-TYPE PICKER — shown in Step 2 once a category is chosen */}
            {step === 2 && catDef && (
              <div style={{ marginBottom:24, padding:"14px 16px", border:"1px solid var(--line-2)", borderRadius:9, background:"var(--panel)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase" }}>RULE TYPE WITHIN {catDef.label.toUpperCase()}</div>
                    {subTypeDef && <div style={{ fontSize:11.5, color:"var(--ink-3)", marginTop:3 }}>{subTypeDef.desc}</div>}
                  </div>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:catDef.color, padding:"2px 7px", borderRadius:4, background:catDef.fill, fontWeight:700, letterSpacing:"0.5px" }}>{catDef.code}</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {catDef.types.map(function(t) {
                    var isOn = subType === t.id;
                    return (
                      <button key={t.id} onClick={function(){ pickSubType(t.id); }}
                        style={{ padding:"6px 11px", borderRadius:6, border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isOn ? "var(--ink)" : "var(--bg-canvas)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontFamily:"inherit", fontSize:11.5, cursor:"pointer", fontWeight: isOn ? 500 : 400 }}>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && formId === "validate" && (
              <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:620 }}>
                <div>
                  <label style={lbl}>FIELD</label>
                  <select value={vField} onChange={function(e){ setVField(e.target.value); setVVal(""); setVOp("is_not_null"); }} style={inp}>
                    {props.map(function(p){ return <option key={p.name} value={p.name}>{p.name + "  ·  " + p.type}</option>; })}
                  </select>
                </div>
                <div>
                  <label style={lbl}>OPERATOR</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {opsForField(vField).map(function(op){
                      var isOn = vOp === op.id;
                      return <button key={op.id} onClick={function(){ setVOp(op.id); }} style={{ padding:"6px 11px", borderRadius:6, border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isOn ? "var(--ink)" : "var(--bg-canvas)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontFamily:"JetBrains Mono", fontSize:11, cursor:"pointer" }}>{op.label}</button>;
                    })}
                  </div>
                </div>
                {vOp !== "is_not_null" && vOp !== "is_true" && vOp !== "is_false" && (
                  <div>
                    <label style={lbl}>{vOp === "in" || vOp === "not_in" ? "VALUES (comma-separated)" : vOp === "between" ? "RANGE" : "VALUE"}</label>
                    {vOp === "between" ? (
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <input value={vVal} onChange={function(e){ setVVal(e.target.value); }} placeholder="min" style={inp} />
                        <span style={{ fontFamily:"JetBrains Mono", color:"var(--ink-3)" }}>to</span>
                        <input value={vVal2} onChange={function(e){ setVVal2(e.target.value); }} placeholder="max" style={inp} />
                      </div>
                    ) : (
                      <input value={vVal} onChange={function(e){ setVVal(e.target.value); }} placeholder={vOp === "regex" ? "regex pattern" : vOp === "recent" ? "e.g. 30 days" : "value"} style={inp} />
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 2 && formId === "match" && (
              <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:760 }}>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <label style={lbl}>SIGNALS</label>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color: Math.abs(weightSum - 1) < 0.01 ? "var(--green)" : "var(--gold)" }}>{"Σ weights = " + weightSum.toFixed(2) + (Math.abs(weightSum - 1) < 0.01 ? " ✓" : " (should = 1.0)")}</span>
                  </div>
                  <div style={{ border:"1px solid var(--line)", borderRadius:8, overflow:"hidden" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1.2fr 90px 32px", gap:0, background:"var(--panel-2)", borderBottom:"1px solid var(--line-2)", padding:"7px 10px", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>
                      <div>Field</div><div>Strategy</div><div style={{ textAlign:"right" }}>Weight</div><div />
                    </div>
                    {mSignals.map(function(sig, i) {
                      return (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"1.4fr 1.2fr 90px 32px", gap:6, padding:"7px 10px", alignItems:"center", borderBottom: i < mSignals.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                          <select value={sig.field} onChange={function(e){ updateSignal(i, "field", e.target.value); }} style={Object.assign({}, inp, { padding:"5px 8px", fontSize:12 })}>
                            {props.map(function(p){ return <option key={p.name} value={p.name}>{p.name}</option>; })}
                          </select>
                          <select value={sig.strategy} onChange={function(e){ updateSignal(i, "strategy", e.target.value); }} style={Object.assign({}, inp, { padding:"5px 8px", fontSize:12 })}>
                            <option value="exact">exact</option><option value="fuzzy_name">fuzzy_name</option><option value="fuzzy_token">fuzzy_token</option><option value="normalized_domain">normalized_domain</option><option value="normalized_phone">normalized_phone</option><option value="embedding">embedding</option><option value="common_neighbor">common_neighbor</option>
                          </select>
                          <input type="number" min="0" max="1" step="0.05" value={sig.weight} onChange={function(e){ updateSignal(i, "weight", parseFloat(e.target.value) || 0); }} style={Object.assign({}, inp, { padding:"5px 8px", fontSize:12, textAlign:"right" })} />
                          <button onClick={function(){ removeSignal(i); }} disabled={mSignals.length === 1} style={{ width:26, height:26, borderRadius:5, border:"1px solid var(--line)", background: mSignals.length === 1 ? "transparent" : "var(--bg-canvas)", color:"var(--ink-3)", cursor: mSignals.length === 1 ? "not-allowed" : "pointer", opacity: mSignals.length === 1 ? 0.4 : 1 }}>×</button>
                        </div>
                      );
                    })}
                    <button onClick={addSignal} style={{ width:"100%", padding:"8px 10px", border:"none", borderTop:"1px dashed var(--line-2)", background:"var(--panel-2)", fontFamily:"inherit", fontSize:12, color:"var(--ink-2)", cursor:"pointer", textAlign:"left" }}>+ add signal</button>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div>
                    <label style={lbl}>AUTO-MERGE ≥</label>
                    <input type="number" min="0" max="1" step="0.01" value={mAuto} onChange={function(e){ setMAuto(e.target.value); }} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>REVIEW BAND ≥</label>
                    <input type="number" min="0" max="1" step="0.01" value={mReview} onChange={function(e){ setMReview(e.target.value); }} style={inp} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>ON AUTO-MATCH</label>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {[{ id:"merge", l:"Auto-merge into canonical" },{ id:"link", l:"Link with :IS_SAME_AS" },{ id:"queue", l:"Always queue for review" }].map(function(o){
                      var isOn = mAction === o.id;
                      return <button key={o.id} onClick={function(){ setMAction(o.id); }} style={{ padding:"8px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--bg-canvas)" : "var(--panel)", fontSize:12, color:"var(--ink)", cursor:"pointer", fontFamily:"inherit" }}>{o.l}</button>;
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && formId === "survive" && (
              <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:640 }}>
                <div>
                  <label style={lbl}>PROPERTY THIS RULE GOVERNS</label>
                  <select value={sProperty} onChange={function(e){ setSProperty(e.target.value); }} style={inp}>
                    {props.map(function(p){ return <option key={p.name} value={p.name}>{p.name + "  ·  " + p.type}</option>; })}
                  </select>
                </div>
                <div>
                  <label style={lbl}>STRATEGY</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[{ id:"source_priority", l:"Source priority", d:"Pick from a ranked list" },{ id:"recency", l:"Most recent", d:"Newest updated_at wins" },{ id:"completeness", l:"Most complete", d:"Longest non-null value wins" },{ id:"source_trust", l:"Trust tier", d:"By source trust level" },{ id:"confidence_weighted", l:"Confidence weighted", d:"Blend by per-value confidence" },{ id:"manual_override", l:"Manual override", d:"Steward edit always wins" }].map(function(o){
                      var isOn = sStrategy === o.id;
                      return (
                        <button key={o.id} onClick={function(){ setSStrategy(o.id); }} style={{ textAlign:"left", padding:"10px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit" }}>
                          <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>{o.l}</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3 }}>{o.d}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {sStrategy === "source_priority" && (
                  <div>
                    <label style={lbl}>SOURCE RANKING (highest first)</label>
                    <div style={{ border:"1px solid var(--line)", borderRadius:8, overflow:"hidden" }}>
                      {sSources.map(function(src, i){
                        return (
                          <div key={i} style={{ display:"flex", alignItems:"center", padding:"8px 12px", borderBottom: i < sSources.length-1 ? "1px solid var(--line-2)" : "none", background: i === 0 ? "var(--panel-2)" : "var(--panel)" }}>
                            <span style={{ width:22, height:22, borderRadius:"50%", background: i === 0 ? "var(--ink)" : "var(--chip)", color: i === 0 ? "var(--bg-canvas)" : "var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, marginRight:10 }}>{i + 1}</span>
                            <span style={{ fontSize:13, color:"var(--ink)", flex:1 }}>{src}</span>
                            <button onClick={function(){ if (i > 0) setSSources(function(arr){ var n = arr.slice(); var t = n[i]; n[i] = n[i-1]; n[i-1] = t; return n; }); }} disabled={i === 0} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink-3)", padding:"2px 6px", opacity: i === 0 ? 0.3 : 1 }}>▲</button>
                            <button onClick={function(){ if (i < sSources.length-1) setSSources(function(arr){ var n = arr.slice(); var t = n[i]; n[i] = n[i+1]; n[i+1] = t; return n; }); }} disabled={i === sSources.length-1} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink-3)", padding:"2px 6px", opacity: i === sSources.length-1 ? 0.3 : 1 }}>▼</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <label style={lbl}>MIN CONFIDENCE (0–1)</label>
                  <input value={sMinConf} onChange={function(e){ setSMinConf(e.target.value); }} style={inp} />
                </div>
              </div>
            )}

            {step === 2 && formId === "compute" && (
              <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
                <div>
                  <label style={lbl}>OUTPUT</label>
                  <div style={{ display:"flex", gap:6 }}>
                    {[{ id:"property", l:"Property" },{ id:"edge", l:"Inferred edge" }].map(function(o){
                      var isOn = cMode === o.id;
                      return <button key={o.id} onClick={function(){ setCMode(o.id); }} style={{ padding:"7px 14px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--ink)" : "var(--bg-canvas)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontSize:12.5, fontFamily:"inherit", cursor:"pointer" }}>{o.l}</button>;
                    })}
                  </div>
                </div>
                {cMode === "property" ? (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
                      <div>
                        <label style={lbl}>NEW PROPERTY NAME</label>
                        <input value={cOutName} onChange={function(e){ setCOutName(e.target.value); }} placeholder="e.g. risk_score" style={inp} />
                      </div>
                      <div>
                        <label style={lbl}>TYPE</label>
                        <select value={cOutType} onChange={function(e){ setCOutType(e.target.value); }} style={inp}>
                          <option value="string">string</option><option value="decimal">decimal</option><option value="float">float</option><option value="bool">bool</option><option value="timestamp">timestamp</option><option value="enum">enum</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>EXPRESSION OR FORMULA</label>
                      <textarea value={cExpr} onChange={function(e){ setCExpr(e.target.value); }} rows={3} placeholder="e.g. bucket(arr_usd, [10000,100000,1000000], ['SMB','MM','ENT'])" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono", fontSize:12, resize:"vertical", lineHeight:1.5 })} />
                    </div>
                    <div>
                      <label style={lbl}>RECOMPUTE TRIGGER</label>
                      <div style={{ display:"flex", gap:6 }}>
                        {[{ id:"on_change", l:"On input change" },{ id:"scheduled", l:"Scheduled" },{ id:"manual", l:"Manual only" }].map(function(o){
                          var isOn = cRecompute === o.id;
                          return <button key={o.id} onClick={function(){ setCRecompute(o.id); }} style={{ padding:"7px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--bg-canvas)" : "var(--panel)", color:"var(--ink)", fontSize:12, fontFamily:"inherit", cursor:"pointer" }}>{o.l}</button>;
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <div>
                        <label style={lbl}>EDGE LABEL</label>
                        <input value={cEdgeLabel} onChange={function(e){ setCEdgeLabel(e.target.value.toUpperCase().replace(/[^A-Z_]/g, "")); }} placeholder="e.g. PREVIOUSLY_AT" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono" })} />
                      </div>
                      <div>
                        <label style={lbl}>TARGET NODE TYPE</label>
                        <select value={cEdgeTarget} onChange={function(e){ setCEdgeTarget(e.target.value); }} style={inp}>
                          <option value="">— pick target —</option>
                          {NODES.filter(function(n){ return n.type !== "source"; }).map(function(n){ return <option key={n.id} value={n.id}>{n.label}</option>; })}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>CYPHER PATTERN</label>
                      <textarea value={cExpr} onChange={function(e){ setCExpr(e.target.value); }} rows={3} placeholder="e.g. MATCH (a:Account)-[:EMPLOYED]->(p:Person) WHERE …" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono", fontSize:12, resize:"vertical", lineHeight:1.5 })} />
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 2 && formId === "slo" && (
              <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:640 }}>
                <div>
                  <label style={lbl}>DIMENSION</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[{ id:"freshness", l:"Freshness", d:"p95 ingest lag below target" },{ id:"completeness", l:"Completeness", d:"Non-null fill rate" },{ id:"validity", l:"Validity", d:"% records passing VALIDATE rules" },{ id:"uniqueness", l:"Uniqueness", d:"Distinct value ratio" },{ id:"drift", l:"Drift", d:"Distribution shift vs baseline" }].map(function(o){
                      var isOn = sloDim === o.id;
                      return (
                        <button key={o.id} onClick={function(){ setSloDim(o.id); }} style={{ textAlign:"left", padding:"10px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit" }}>
                          <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>{o.l}</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3 }}>{o.d}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {sloDim !== "freshness" && (
                  <div>
                    <label style={lbl}>FIELD</label>
                    <select value={sloField} onChange={function(e){ setSloField(e.target.value); }} style={inp}>
                      {props.map(function(p){ return <option key={p.name} value={p.name}>{p.name}</option>; })}
                    </select>
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns: sloDim === "freshness" ? "2fr 1fr 1fr" : "2fr 1fr", gap:14 }}>
                  <div>
                    <label style={lbl}>{sloDim === "freshness" ? "TARGET (≤)" : "TARGET (≥)"}</label>
                    <input value={sloTarget} onChange={function(e){ setSloTarget(e.target.value); }} style={inp} />
                  </div>
                  {sloDim === "freshness" && (
                    <div>
                      <label style={lbl}>UNIT</label>
                      <select value={sloUnit} onChange={function(e){ setSloUnit(e.target.value); }} style={inp}>
                        <option value="s">s</option><option value="m">m</option><option value="h">h</option><option value="d">d</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label style={lbl}>WINDOW</label>
                    <select value={sloWindow} onChange={function(e){ setSloWindow(e.target.value); }} style={inp}>
                      <option value="1h">1h</option><option value="24h">24h</option><option value="7d">7d</option><option value="30d">30d</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>ALERT CHANNEL ON BREACH</label>
                  <input value={sloAlertChan} onChange={function(e){ setSloAlertChan(e.target.value); }} placeholder="#data-alerts or oncall@" style={inp} />
                </div>
              </div>
            )}

            {step === 2 && formId === "access" && (
              <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:640 }}>
                <div>
                  <label style={lbl}>SCOPE</label>
                  <div style={{ display:"flex", gap:6 }}>
                    {[{ id:"pii", l:"All PII fields" },{ id:"specific", l:"Specific field" },{ id:"all", l:"All fields" }].map(function(o){
                      var isOn = accScope === o.id;
                      return <button key={o.id} onClick={function(){ setAccScope(o.id); }} style={{ padding:"7px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--ink)" : "var(--bg-canvas)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontSize:12, fontFamily:"inherit", cursor:"pointer" }}>{o.l}</button>;
                    })}
                  </div>
                </div>
                {accScope === "specific" && (
                  <div>
                    <label style={lbl}>FIELD</label>
                    <select value={accSpecific} onChange={function(e){ setAccSpecific(e.target.value); }} style={inp}>
                      {props.map(function(p){ return <option key={p.name} value={p.name}>{p.name + (p.pii ? "  ·  PII" : "")}</option>; })}
                    </select>
                  </div>
                )}
                <div>
                  <label style={lbl}>REQUIRED ROLES (any of)</label>
                  <div style={{ border:"1px solid var(--line)", borderRadius:8, padding:"6px 8px", display:"flex", flexWrap:"wrap", gap:5, alignItems:"center", background:"var(--bg-canvas)" }}>
                    {accRoles.map(function(r, i) {
                      return (
                        <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 5px 3px 8px", borderRadius:5, background:"var(--chip)", fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>
                          role:{r}
                          <button onClick={function(){ setAccRoles(function(arr){ return arr.filter(function(_, j){ return j !== i; }); }); }} style={{ border:"none", background:"none", cursor:"pointer", color:"var(--ink-3)", fontSize:13, padding:0, lineHeight:1 }}>×</button>
                        </span>
                      );
                    })}
                    <input value={accRolesInput} onChange={function(e){ setAccRolesInput(e.target.value); }}
                      onKeyDown={function(e){ if ((e.key === "Enter" || e.key === ",") && accRolesInput.trim()) { e.preventDefault(); setAccRoles(function(arr){ return arr.concat([accRolesInput.trim()]); }); setAccRolesInput(""); } }}
                      placeholder="add role + Enter" style={{ border:"none", outline:"none", fontSize:12, fontFamily:"JetBrains Mono", background:"transparent", color:"var(--ink)", minWidth:120, flex:1 }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>MASKING ON DENIAL</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[{ id:"redact", l:"Redact entirely", d:"Return null / [REDACTED]" },{ id:"hash", l:"Hash one-way", d:"Stable hash for joins, no PII" },{ id:"partial", l:"Partial mask", d:"e.g. j***@a***.com" },{ id:"deny", l:"Deny request entirely", d:"Return 403, log denial" }].map(function(o){
                      var isOn = accMasking === o.id;
                      return (
                        <button key={o.id} onClick={function(){ setAccMasking(o.id); }} style={{ textAlign:"left", padding:"10px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit" }}>
                          <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>{o.l}</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3 }}>{o.d}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:680 }}>
                <div>
                  <label style={lbl}>APPLIES TO</label>
                  <div style={{ display:"flex", gap:6 }}>
                    {[{ id:"all", l:"All " + node.label + " records" },{ id:"filtered", l:"Filtered subset" }].map(function(o){
                      var isOn = scopeMode === o.id;
                      return <button key={o.id} onClick={function(){ setScopeMode(o.id); }} style={{ padding:"8px 14px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--ink)" : "var(--bg-canvas)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontSize:12.5, fontFamily:"inherit", cursor:"pointer" }}>{o.l}</button>;
                    })}
                  </div>
                </div>
                {scopeMode === "filtered" && (
                  <div>
                    <label style={lbl}>FILTER (WHERE clause)</label>
                    <input value={scopeFilter} onChange={function(e){ setScopeFilter(e.target.value); }} placeholder="e.g. tier IN ('ENT', 'Strategic')" style={Object.assign({}, inp, { fontFamily:"JetBrains Mono", fontSize:12 })} />
                  </div>
                )}
                <div>
                  <label style={lbl}>WHEN TO RUN</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {[{ id:"on_write", l:"On write", d:"Evaluate at insert / update time" },{ id:"on_read", l:"On read", d:"Evaluate when a query touches it" },{ id:"scheduled", l:"Scheduled", d:"Run on a cron schedule" }].map(function(o){
                      var isOn = trigger === o.id;
                      var disabled = (formId === "match" || formId === "slo") && o.id === "on_read";
                      return (
                        <button key={o.id} disabled={disabled} onClick={function(){ if (!disabled) setTrigger(o.id); }}
                          style={{ textAlign:"left", padding:"10px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, fontFamily:"inherit" }}>
                          <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>{o.l}</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3 }}>{o.d}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {trigger === "scheduled" && (
                  <div>
                    <label style={lbl}>CADENCE</label>
                    <select value={schedule} onChange={function(e){ setSchedule(e.target.value); }} style={inp}>
                      <option value="every_15m">Every 15 minutes</option><option value="hourly">Hourly</option><option value="every_6h">Every 6 hours</option><option value="daily">Daily</option><option value="weekly">Weekly</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:680 }}>
                <div>
                  <label style={lbl}>RULE TITLE</label>
                  <input value={title} onChange={function(e){ setTitle(e.target.value); }} placeholder={"e.g. " + (formId === "validate" ? "ARR is non-negative" : formId === "match" ? "Domain-based company match" : formId === "survive" ? "ARR: ERP wins" : formId === "compute" ? "Tier from ARR bands" : formId === "slo" ? "Freshness under 30m" : "PII gated on acct_admin")} style={inp} />
                </div>
                <div>
                  <label style={lbl}>DESCRIPTION (OPTIONAL)</label>
                  <textarea value={description} onChange={function(e){ setDescription(e.target.value); }} rows={2} placeholder="One-line summary visible in audit logs" style={Object.assign({}, inp, { resize:"vertical", lineHeight:1.5 })} />
                </div>
                {(formId === "validate" || formId === "slo" || formId === "access") && (
                  <div>
                    <label style={lbl}>SEVERITY</label>
                    <div style={{ display:"flex", gap:6 }}>
                      {["ERROR","WARN","INFO"].map(function(s){
                        var isOn = severity === s;
                        var col = s === "ERROR" ? "var(--coral)" : s === "WARN" ? "var(--gold)" : "var(--ink-3)";
                        return <button key={s} onClick={function(){ setSeverity(s); }} style={{ padding:"7px 14px", border:"1px solid " + (isOn ? col : "var(--line)"), borderRadius:7, background: isOn ? col + "1a" : "var(--bg-canvas)", color: isOn ? col : "var(--ink-2)", fontSize:12, fontFamily:"JetBrains Mono", fontWeight: isOn ? 700 : 400, letterSpacing:"0.4px", cursor:"pointer" }}>{s}</button>;
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <label style={lbl}>{formId === "match" ? "WHEN A MATCH IS FOUND" : formId === "compute" ? "WHEN COMPUTE FAILS" : formId === "survive" ? "WHEN SOURCES CONFLICT" : "ON VIOLATION (multi-select)"}</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      { id:"block", l:"Block the write", applies:["validate"] },
                      { id:"quarantine", l:"Route to quarantine", applies:["validate","compute"] },
                      { id:"log", l:"Log only", applies:["validate","compute","survive","access","slo"] },
                      { id:"notify", l:"Send notification", applies:["validate","compute","survive","access","slo","match"] },
                      { id:"steward", l:"Defer to data steward", applies:["survive","match","compute"] },
                      { id:"auto_fix", l:"Auto-fix with default", applies:["validate","compute"] }
                    ].filter(function(o){ return o.applies.indexOf(cat) >= 0; }).map(function(o){
                      var isOn = onViolation.indexOf(o.id) >= 0;
                      return (
                        <button key={o.id} onClick={function(){ setOnViolation(function(arr){ return isOn ? arr.filter(function(x){ return x !== o.id; }) : arr.concat([o.id]); }); }}
                          style={{ textAlign:"left", padding:"9px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ width:16, height:16, borderRadius:4, border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isOn ? "var(--ink)" : "transparent", color:"var(--bg-canvas)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, flexShrink:0 }}>{isOn ? "✓" : ""}</span>
                          <span style={{ fontSize:13, color:"var(--ink)" }}>{o.l}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {onViolation.indexOf("notify") >= 0 && (
                  <div>
                    <label style={lbl}>NOTIFICATION CHANNEL</label>
                    <input value={notifyChan} onChange={function(e){ setNotifyChan(e.target.value); }} placeholder="#schema-alerts or owner@team" style={inp} />
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:760 }}>
                <div style={{ border:"1px solid var(--line)", borderRadius:10, padding:20, background:"var(--panel)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    {catDef && <span style={{ width:32, height:32, borderRadius:7, background:catDef.fill, color:catDef.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700 }}>{catDef.icon}</span>}
                    <div>
                      <div style={{ fontSize:15, fontWeight:600, color:"var(--ink)" }}>{title || (catDef ? catDef.title : "Untitled rule")}</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3, letterSpacing:"0.4px" }}>{catDef ? catDef.code + " · " + node.label.toUpperCase() : ""}</div>
                    </div>
                  </div>
                  {description && <div style={{ fontSize:12.5, color:"var(--ink-3)", marginBottom:14, lineHeight:1.55 }}>{description}</div>}
                  <div style={{ display:"grid", gridTemplateColumns:"160px 1fr", gap:"8px 14px", fontSize:12 }}>
                    <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>EXPRESSION</span>
                    <pre style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)", margin:0, padding:"7px 10px", background:"var(--bg-canvas)", borderRadius:5, border:"1px solid var(--line-2)", whiteSpace:"pre-wrap" }}>{buildExpression()}</pre>
                    <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>SCOPE</span>
                    <span style={{ color:"var(--ink)" }}>{scopeMode === "all" ? "All " + node.label + " records" : "Filtered: " + scopeFilter}</span>
                    <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>TRIGGER</span>
                    <span style={{ color:"var(--ink)" }}>{trigger === "on_write" ? "On write" : trigger === "on_read" ? "On read" : "Scheduled (" + schedule + ")"}</span>
                    {(formId === "validate" || formId === "slo" || formId === "access") && (
                      <>
                        <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>SEVERITY</span>
                        <span style={{ color: severity === "ERROR" ? "var(--coral)" : severity === "WARN" ? "var(--gold)" : "var(--ink-2)", fontFamily:"JetBrains Mono", fontWeight:700, fontSize:11 }}>{severity}</span>
                      </>
                    )}
                    <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.4px" }}>ACTIONS</span>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{onViolation.map(function(a){ return <span key={a} style={{ fontFamily:"JetBrains Mono", fontSize:10.5, padding:"2px 7px", borderRadius:4, background:"var(--chip)", color:"var(--ink-2)" }}>{a}</span>; })}</div>
                  </div>
                </div>
                <div style={{ border:"1px solid var(--line-2)", borderRadius:10, padding:16, background:"var(--panel-2)" }}>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:10 }}>APPROVERS</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {[{ who:"data-platform owner", status:"required", sev:"var(--coral)" },{ who:"security@", status: formId === "access" ? "required" : "advisory", sev: formId === "access" ? "var(--coral)" : "var(--ink-3)" },{ who:"node steward (you)", status:"auto-approved", sev:"var(--green)" }].map(function(a, i){
                      return <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"5px 0", borderBottom: i < 2 ? "1px dashed var(--line-2)" : "none" }}>
                        <span style={{ color:"var(--ink-2)" }}>{a.who}</span>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:a.sev, fontWeight:600 }}>{a.status}</span>
                      </div>;
                    })}
                  </div>
                </div>
                <div>
                  <label style={lbl}>ON SAVE</label>
                  <div style={{ display:"flex", gap:6 }}>
                    {[{ id:true, l:"Activate immediately" },{ id:false, l:"Save as draft" }].map(function(o){
                      var isOn = activate === o.id;
                      return <button key={String(o.id)} onClick={function(){ setActivate(o.id); }} style={{ padding:"8px 14px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--ink)" : "var(--bg-canvas)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontSize:12.5, fontFamily:"inherit", cursor:"pointer" }}>{o.l}</button>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PREVIEW */}
          <div style={{ background:"var(--panel-2)", borderLeft:"1px solid var(--line)", padding:"20px 18px", overflowY:"auto", display:"flex", flexDirection:"column", gap:18 }}>
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>RULE DSL</div>
              <pre style={{ fontFamily:"JetBrains Mono", fontSize:11, color: catDef ? catDef.color : "var(--ink-3)", margin:0, padding:"10px 12px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6, whiteSpace:"pre-wrap", lineHeight:1.55 }}>{catDef ? buildExpression() : "// pick a rule category to begin"}</pre>
            </div>
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>VALIDATION</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, fontFamily:"JetBrains Mono", fontSize:11 }}>
                {[{ ok: !!cat, l: "Category chosen" },{ ok: step >= 2 ? canContinue() : true, l: "Configuration valid" },{ ok: step >= 4 ? !!title : true, l: "Title set" },{ ok: onViolation.length > 0, l: "At least one action" }].map(function(v, i){
                  return <div key={i} style={{ display:"flex", alignItems:"center", gap:8, color: v.ok ? "var(--green)" : "var(--ink-4)" }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background: v.ok ? "var(--green)" : "var(--line)" }} />
                    <span style={{ color:"var(--ink-2)" }}>{v.l}</span>
                    {v.ok && <span style={{ marginLeft:"auto", fontWeight:700, color:"var(--green)" }}>✓</span>}
                  </div>;
                })}
              </div>
            </div>
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>ESTIMATED IMPACT</div>
              <div style={{ padding:"12px 14px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6 }}>
                <div style={{ fontFamily:"Instrument Serif", fontSize:26, color:"var(--ink)", lineHeight:1 }}>{(node.instancesN || 0).toLocaleString()}</div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:4 }}>{node.label + " records evaluated"}</div>
                {formId === "validate" && vField && <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--gold)", marginTop:8 }}>~{Math.round((node.instancesN || 0) * 0.014).toLocaleString()} likely violations</div>}
                {formId === "match" && <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--gold)", marginTop:8 }}>~{Math.round((node.instancesN || 0) * 0.003).toLocaleString()} review candidates</div>}
                {formId === "slo" && <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--green)", marginTop:8 }}>currently within target</div>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ flexShrink:0, padding:"14px 22px", borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--panel)" }}>
          <button className="btn-ghost" onClick={function(){ if (step > 1) setStep(function(s){ return s - 1; }); }} disabled={step === 1} style={{ opacity: step === 1 ? 0.4 : 1 }}>← Back</button>
          <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{"Step " + step + " of 5 · " + stepNames[step-1]}</span>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            {step < 5
              ? <button className="btn-dark" disabled={!canContinue()} onClick={function(){ setStep(function(s){ return s + 1; }); }} style={{ opacity: canContinue() ? 1 : 0.45 }}>Continue →</button>
              : <button className="btn-dark" onClick={onClose}>{activate ? "Publish rule ↵" : "Save draft ↵"}</button>
            }
          </div>
        </div>

      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// RULES PANE — unified table with filter chips, inline expand, search
// ═══════════════════════════════════════════════════════════════════════════════

function RulesPane({ rules, node, onViolationClick, onMatchClick, onSurvClick, onNewRule }) {
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);

  const qRules = (rules.quality || []).map(function(r){ return Object.assign({}, r, { _bucket:"quality" }); });
  const mRules = (rules.match || []).map(function(r){ return Object.assign({}, r, { _bucket:"match", kind:"MATCH" }); });
  const sRules = (rules.survivorship || []).map(function(r){ return Object.assign({}, r, { _bucket:"surv", kind:"SURV" }); });
  const allRules = qRules.concat(mRules).concat(sRules);

  function meta(kind) {
    var k = (kind || "").toUpperCase();
    if (k === "VALIDATE") return { code:"VAL", color:"var(--blue)",   fill:"var(--blue-fill)",   icon:"✓",  long:"Validate" };
    if (k === "COMPUTE")  return { code:"CMP", color:"var(--green)",  fill:"var(--green-fill)",  icon:"ƒ",  long:"Compute" };
    if (k === "ACCESS")   return { code:"ACC", color:"var(--ink-2)",  fill:"var(--chip)",        icon:"⊕",  long:"Access" };
    if (k === "SLO")      return { code:"SLO", color:"var(--gold)",   fill:"var(--gold-fill)",   icon:"◷",  long:"SLO" };
    if (k === "INFER")    return { code:"CMP", color:"var(--green)",  fill:"var(--green-fill)",  icon:"ƒ",  long:"Compute" };
    if (k === "MATCH")    return { code:"MTC", color:"var(--purple)", fill:"var(--purple-fill)", icon:"≈",  long:"Match" };
    if (k === "SURV")     return { code:"SUR", color:"var(--coral)",  fill:"var(--coral-fill)",  icon:"★",  long:"Survive" };
    return { code:"---", color:"var(--ink-3)", fill:"var(--chip)", icon:"?", long:"Rule" };
  }

  function sevStyle(s) {
    return s === "ERROR" ? { bg:"var(--coral-fill)", color:"var(--coral)" }
         : s === "WARN"  ? { bg:"var(--gold-fill)",  color:"var(--gold)"  }
         :                 { bg:"var(--chip)",       color:"var(--ink-3)" };
  }

  const FILTERS = [
    { id:"all", label:"All",      count: allRules.length },
    { id:"VAL", label:"Validate", count: qRules.filter(function(r){ return r.kind === "VALIDATE"; }).length },
    { id:"MTC", label:"Match",    count: mRules.length },
    { id:"SUR", label:"Survive",  count: sRules.length },
    { id:"CMP", label:"Compute",  count: qRules.filter(function(r){ return r.kind === "COMPUTE" || r.kind === "INFER"; }).length },
    { id:"SLO", label:"SLO",      count: qRules.filter(function(r){ return r.kind === "SLO"; }).length },
    { id:"ACC", label:"Access",   count: qRules.filter(function(r){ return r.kind === "ACCESS"; }).length }
  ];

  var visible = allRules.filter(function(r){
    if (filter !== "all" && meta(r.kind).code !== filter) return false;
    if (search) {
      var hay = ((r.title || "") + " " + (r.id || "") + " " + (r.expr || r.label || "") + " " + (r.property || "")).toLowerCase();
      if (hay.indexOf(search.toLowerCase()) < 0) return false;
    }
    return true;
  });

  var attentionCount = qRules.filter(function(r){ return (r.violations||0) > 0; }).length
                     + mRules.filter(function(r){ return (r.candidates||0) > 0; }).length
                     + sRules.filter(function(r){ return (r.conflicts||0) > 0; }).length;
  var activeCount = allRules.filter(function(r){ return r.on !== false; }).length;

  function metricFor(r) {
    if (r._bucket === "quality") {
      if (r.violations !== undefined) return { v: r.violations, label: "violations", color: r.violations > 0 ? "var(--coral)" : "var(--ink-3)", click: r.violations > 0 ? function(){ onViolationClick(r); } : null };
      return { v: r.last || "—", label: "", color: "var(--ink-3)", click: null };
    }
    if (r._bucket === "match") return { v: r.candidates || 0, label: "candidates", color: (r.candidates||0) > 0 ? "var(--gold)" : "var(--ink-3)", click: (r.candidates||0) > 0 ? function(){ onMatchClick(r); } : null };
    if (r._bucket === "surv")  return { v: r.conflicts || 0, label: "conflicts",  color: (r.conflicts||0) > 0  ? "var(--coral)" : "var(--green)", click: (r.conflicts||0) > 0  ? function(){ onSurvClick(r); } : null };
    return { v: "—", label: "", color: "var(--ink-3)", click: null };
  }

  return (
    <div className="card">
      <div className="card-head card-head-row" style={{ flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {FILTERS.map(function(f){
            var isOn = filter === f.id;
            return (
              <button key={f.id} onClick={function(){ setFilter(f.id); }} className={"chip" + (isOn ? " on" : "")}>
                {f.label} <span className="chip-n">{f.count}</span>
              </button>
            );
          })}
        </div>
        <div className="card-head-actions" style={{ alignItems:"center" }}>
          <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginRight:6 }}>
            {activeCount + "/" + allRules.length + " active"}
            {attentionCount > 0 && <span style={{ color:"var(--gold)", marginLeft:8 }}>{"· " + attentionCount + " need attention"}</span>}
          </span>
          <div style={{ position:"relative" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--ink-3)", pointerEvents:"none" }}>
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input className="sample-search" value={search} onChange={function(e){ setSearch(e.target.value); }} placeholder="Search rules…" style={{ paddingLeft:30, width:200 }} />
          </div>
          <button className="btn-dark" onClick={onNewRule}>+ New rule</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"86px 1fr 240px 130px 76px 42px 14px", gap:14, padding:"10px 18px", borderBottom:"1px solid var(--line-2)", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", alignItems:"center" }}>
        <div>Kind</div><div>Title / expression</div><div>Status</div><div style={{ textAlign:"right" }}>Last activity</div><div style={{ textAlign:"center" }}>Sev</div><div style={{ textAlign:"center" }}>On</div><div></div>
      </div>

      {visible.length === 0 && (
        <div style={{ padding:"40px 18px", textAlign:"center", color:"var(--ink-3)", fontSize:13 }}>
          No rules match {search ? <b>"{search}"</b> : <b>{FILTERS.find(function(f){ return f.id === filter; }).label.toLowerCase()}</b>}.
        </div>
      )}
      {visible.map(function(r, i) {
        var m = meta(r.kind);
        var s = sevStyle(r.severity || "INFO");
        var metric = metricFor(r);
        var isOpen = expanded === (r._bucket + "_" + r.id);
        return (
          <div key={r._bucket + "_" + r.id} style={{ borderBottom: i < visible.length-1 ? "1px solid var(--line-2)" : "none" }}>
            <div onClick={function(){ setExpanded(isOpen ? null : (r._bucket + "_" + r.id)); }}
              style={{ display:"grid", gridTemplateColumns:"86px 1fr 240px 130px 76px 42px 14px", gap:14, padding:"13px 18px", alignItems:"center", cursor:"pointer" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:22, height:22, borderRadius:5, background:m.fill, color:m.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>{m.icon}</span>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, fontWeight:700, color:m.color, letterSpacing:"0.5px" }}>{m.code}</span>
              </div>

              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, color:"var(--ink)", fontWeight:500, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.title || r.label || r.id}</div>
                <code style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {r.expr || (r._bucket === "match" ? "score = " + r.signals.map(function(sg){ return sg.field + "×" + sg.weight; }).join(" + ") : "")
                          || (r._bucket === "surv"  ? r.property + " ← " + (r.strategy || "—") : "")
                          || r.id}
                </code>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                {r._bucket === "quality" && r.compliance !== undefined && (
                  <>
                    <div className="nv-bar" style={{ flex:1, maxWidth:90 }}>
                      <div className="nv-bar-fill" style={{ width: r.compliance + "%", background: r.compliance >= 99 ? "var(--green)" : r.compliance >= 90 ? "var(--gold)" : "var(--coral)" }} />
                    </div>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)", fontWeight:600 }}>{r.compliance + "%"}</span>
                  </>
                )}
                {r._bucket === "match" && (
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{"auto ≥ " + r.threshold_auto + " · review " + r.threshold_review}</span>
                )}
                {r._bucket === "surv" && (
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, padding:"2px 7px", borderRadius:4, fontWeight:600, background:m.fill, color:m.color }}>{r.strategy}</span>
                )}
              </div>

              <div style={{ textAlign:"right", cursor: metric.click ? "pointer" : "default" }}
                onClick={metric.click ? function(e){ e.stopPropagation(); metric.click(); } : undefined}>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:12, fontWeight:600, color: metric.color, textDecoration: metric.click ? "underline" : "none" }}>
                  {typeof metric.v === "number" ? metric.v.toLocaleString() : metric.v}{metric.label && <span style={{ fontWeight:400, color:"var(--ink-3)", marginLeft:4 }}>{metric.label}</span>}
                </div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)", marginTop:2 }}>{r.last || "—"}</div>
              </div>

              <div style={{ textAlign:"center" }}>
                {r._bucket === "quality" && r.severity && <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, padding:"2px 6px", borderRadius:3, background:s.bg, color:s.color, fontWeight:700, letterSpacing:"0.4px" }}>{r.severity}</span>}
              </div>

              <div style={{ display:"flex", justifyContent:"center" }} onClick={function(e){ e.stopPropagation(); }}>
                <label className="switch"><input type="checkbox" defaultChecked={r.on !== false} /><span className="switch-track" /></label>
              </div>

              <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)" }}>{isOpen ? "▴" : "▾"}</span>
            </div>

            {isOpen && (
              <div style={{ padding:"14px 18px 18px 18px", background:"var(--panel-2)", borderTop:"1px dashed var(--line-2)" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                  <div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>EXPRESSION</div>
                    <pre style={{ fontFamily:"JetBrains Mono", fontSize:11, color: m.color, margin:0, padding:"10px 12px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6, whiteSpace:"pre-wrap" }}>
                      {r.expr
                        || (r._bucket === "match" ? "score =\n  " + r.signals.map(function(sg){ return sg.strategy + "(" + sg.field + ") × " + sg.weight; }).join("\n  ") + "\nauto_merge ≥ " + r.threshold_auto + "\nreview band " + r.threshold_review + "–" + r.threshold_auto : "")
                        || (r._bucket === "surv"  ? r.property + " ←\n  strategy: " + (r.strategy || "—") + (r.sources && r.sources.length ? "\n  ranking: " + r.sources.join(" > ") : "") : "")
                        || "—"}
                    </pre>
                    <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"110px 1fr", gap:"6px 12px", fontSize:11.5 }}>
                      <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>ID</span>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>{r.id}</code>
                      <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>NODE</span>
                      <span style={{ color:"var(--ink-2)" }}>{node.label}</span>
                      <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>CATEGORY</span>
                      <span style={{ color:m.color, fontFamily:"JetBrains Mono", fontWeight:600 }}>{m.long.toUpperCase()}</span>
                      {r._bucket === "quality" && r.evaluated !== undefined && (
                        <>
                          <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>EVALUATED</span>
                          <span style={{ color:"var(--ink-2)", fontFamily:"JetBrains Mono" }}>{(r.evaluated || 0).toLocaleString() + " over 24h"}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>RECENT ACTIVITY</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                      {[
                        { t:"now",     who:"runtime",  what:"evaluating on every write", dot:"var(--green)" },
                        { t:"2m ago",  who:"runtime",  what: r._bucket === "quality" ? ((r.violations||0) > 0 ? r.violations + " violations triggered" : "no violations") : r._bucket === "match" ? ((r.candidates||0) > 0 ? r.candidates + " new candidates queued" : "0 new candidates") : ((r.conflicts||0) > 0 ? r.conflicts + " conflicts queued" : "0 new conflicts"), dot: metric.color },
                        { t:"4h ago",  who:"morgan.k", what:"reviewed config", dot:"var(--blue)" },
                        { t:"2d ago",  who:"schema-bot",what:"baseline set from sample of 10,000", dot:"var(--ink-4)" }
                      ].map(function(a, j){
                        return <div key={j} style={{ display:"grid", gridTemplateColumns:"56px 12px 1fr auto", gap:8, fontSize:11, padding:"4px 0", borderBottom: j < 3 ? "1px dashed var(--line-2)" : "none", alignItems:"center" }}>
                          <span style={{ fontFamily:"JetBrains Mono", color:"var(--ink-4)" }}>{a.t}</span>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:a.dot, justifySelf:"center" }} />
                          <span style={{ color:"var(--ink-2)" }}>{a.what}</span>
                          <span style={{ fontFamily:"JetBrains Mono", color:"var(--ink-3)" }}>{a.who}</span>
                        </div>;
                      })}
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:14, justifyContent:"flex-end" }}>
                      {metric.click && <button className="btn-ghost" onClick={metric.click} style={{ fontSize:11.5 }}>{r._bucket === "quality" ? "Investigate →" : r._bucket === "match" ? "Review candidates →" : "Resolve conflicts →"}</button>}
                      <button className="btn-ghost" style={{ fontSize:11.5 }}>View history</button>
                      <button className="btn-ghost" style={{ fontSize:11.5 }}>Edit rule</button>
                      <button className="btn-ghost" style={{ fontSize:11.5, color:"var(--coral)" }}>Disable…</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
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

// ─── RECORDS VIEW ─────────────────────────────────────────────────────────────

function generateValueForProp(p, seed) {
  var v = Math.abs(seed * (p.name.charCodeAt(0) + 1));
  if (p.pk) return p.name.replace(/_id$/, "").toUpperCase().slice(0,3) + "-" + (10000 + v % 89999);
  if (p.name === "name" || p.name === "label" || p.name === "title" || p.name === "company_name") {
    var names = ["Acme Corp","Cascade Analytics","Meridian Labs","Horizon Tech","Summit Partners","Apex Global","Quantum Dynamics","Vertex Solutions","Pinnacle Systems","Beacon Industries","Cipher Group","Delphi Networks","Echo Innovations","Forge Systems","Glacier Tech"];
    return names[v % names.length];
  }
  if (p.name === "domain") return ["acme.com","cascade.io","meridian.co","horizon.tech","summit.partners","apex.global","quantum.dy","vertex.dev","pinnacle.systems","beacon.io"][v % 10];
  if (p.name === "email")  return ["taylor.j","morgan.k","jordan.s","alex.r","casey.m"][v % 5] + "@" + (["acme.com","horizon.tech","summit.io","vertex.dev"][v % 4]);
  if (p.name === "industry") return ["SaaS","Fintech","Healthcare","Manufacturing","Retail","Logistics","EdTech"][v % 7];
  if (p.name === "region")   return ["NA-East","NA-West","EMEA","APAC","LATAM"][v % 5];
  if (p.name === "tier")     return ["SMB","MM","ENT","Strategic"][v % 4];
  if (p.name === "status" || p.name === "state") return ["active","pending","review","closed"][v % 4];
  if (p.name === "priority") return ["P0","P1","P2","P3"][v % 4];
  if (p.name === "owner_id" || p.name.endsWith("_id")) return "EMP-" + (1000 + v % 8999);
  if (p.type === "decimal" || p.type === "float") return ((v % 99000) + 1000).toFixed(2);
  if (p.type === "bool")      return v % 3 !== 0 ? "true" : "false";
  if (p.type === "timestamp") return "2026-" + String(1 + v%12).padStart(2,"0") + "-" + String(1 + v%28).padStart(2,"0") + "T" + String(v%24).padStart(2,"0") + ":" + String(v%60).padStart(2,"0") + ":00Z";
  if (p.type === "date")      return "2026-" + String(1 + v%12).padStart(2,"0") + "-" + String(1 + v%28).padStart(2,"0");
  if (p.type === "uuid")      return "uuid-" + ((v * 7) % 999999).toString(16);
  if (p.type === "enum")      return ["alpha","beta","gamma","delta"][v % 4];
  return p.name.replace(/_/g, "-") + "-" + ((v * 3) % 9999);
}

function generateRecords(node) {
  var seed = node.id.charCodeAt(0) * 7 + node.id.length * 13;
  var props = generateProps(node);
  var records = [];
  for (var i = 0; i < 12; i++) {
    var s = seed + i * 31;
    var rec = { id: node.id + "-" + (100000 + (s * 1597) % 899999), nodeType: node.label, nodeId: node.id, status: ["active","active","active","active","review","flagged"][s%6] };
    props.forEach(function(p) {
      rec[p.name] = generateValueForProp(p, s);
    });
    rec._updatedAgo = ["2m ago", "14m ago", "1h ago", "4h ago", "1d ago", "3d ago"][s%6];
    rec._createdAgo = ["12d ago","34d ago","2mo ago","6mo ago","1y ago","2y ago"][s%6];
    rec._source = ["Salesforce CRM","NetSuite ERP","HubSpot Marketing","Manual / Admin"][s%4];
    rec._completeness = 78 + (s % 22);
    rec._confidence = 82 + (s % 17);
    records.push(rec);
  }
  return records;
}

function generateRelatedRecords(record, node) {
  var outgoing = EDGES.filter(function(e){ return e.s === node.id; });
  var incoming = EDGES.filter(function(e){ return e.t === node.id; });
  var allEdges = outgoing.concat(incoming);
  var baseSeed = record.id.length * 7 + record.id.charCodeAt(record.id.length - 1);

  return allEdges.slice(0, 6).map(function(e, idx) {
    var isOut = e.s === node.id;
    var otherId = isOut ? e.t : e.s;
    var otherNode = NODES.find(function(n){ return n.id === otherId; });
    if (!otherNode) return null;

    var count = ((baseSeed + idx * 3) % 3) + 1;
    var otherProps = generateProps(otherNode);
    var nameProp = otherProps.find(function(p){ return p.name === "name" || p.name === "label" || p.name === "title" || p.name === "company_name"; }) || otherProps[1] || otherProps[0];
    var related = [];
    for (var i = 0; i < count; i++) {
      var s = baseSeed + idx * 41 + i * 17;
      related.push({
        id: otherNode.id + "-" + (100000 + Math.abs(s * 1597) % 899999),
        label: otherNode.label,
        nodeId: otherNode.id,
        keyName: nameProp ? nameProp.name : "id",
        keyValue: nameProp ? generateValueForProp(nameProp, s) : "—",
        edgeLabel: e.label,
        kind: e.kind,
        direction: isOut ? "out" : "in",
        since: "2026-" + String(1 + Math.abs(s)%12).padStart(2,"0") + "-" + String(1 + Math.abs(s)%28).padStart(2,"0"),
        confidence: (0.78 + (Math.abs(s) % 21) / 100).toFixed(2)
      });
    }
    return { edge: e, otherNode: otherNode, isOut: isOut, count: count, related: related };
  }).filter(function(x){ return x !== null; });
}

function buildRecordFromId(targetId, targetNode) {
  // Try to find existing record in deterministic generated set
  var existing = generateRecords(targetNode).find(function(r){ return r.id === targetId; });
  if (existing) return existing;

  // Otherwise synthesise one with the given ID so the detail view is stable on navigation
  var seed = targetId.length * 13 + targetId.charCodeAt(targetId.length - 1) * 7;
  var rec = {
    id: targetId,
    nodeType: targetNode.label,
    nodeId: targetNode.id,
    status: ["active","active","active","review","flagged"][Math.abs(seed) % 5],
    _updatedAgo: ["2m ago","14m ago","1h ago","4h ago","1d ago","3d ago"][Math.abs(seed) % 6],
    _createdAgo: ["12d ago","34d ago","2mo ago","6mo ago","1y ago","2y ago"][Math.abs(seed) % 6],
    _source: ["Salesforce CRM","NetSuite ERP","HubSpot Marketing","Manual / Admin"][Math.abs(seed) % 4],
    _completeness: 78 + (Math.abs(seed) % 22),
    _confidence: 82 + (Math.abs(seed) % 17)
  };
  generateProps(targetNode).forEach(function(p, i) {
    rec[p.name] = generateValueForProp(p, seed + i * 11);
  });
  return rec;
}

function RecordDetailView({ record, node, onBack, onNavigate }) {
  var [tab, setTab] = React.useState("Overview");
  var [expandedProp, setExpandedProp] = React.useState(null);
  var [twoHop, setTwoHop] = React.useState(true);
  var [hoverNode, setHoverNode] = React.useState(null);
  var props = generateProps(node);
  var c = colorForNode(node);
  var tabs = ["Overview", "Graph", "Provenance", "Activity"];
  var related = generateRelatedRecords(record, node);
  var totalRelated = related.reduce(function(s, r){ return s + r.count; }, 0);

  function navigateTo(recordId, nodeId) {
    if (!onNavigate) return;
    var targetNode = NODES.find(function(n){ return n.id === nodeId; });
    if (!targetNode) return;
    var targetRecord = buildRecordFromId(recordId, targetNode);
    setTab("Overview");
    setHoverNode(null);
    setExpandedProp(null);
    onNavigate(targetRecord, targetNode);
  }

  // Build 2-hop neighbors: for each 1-hop related node, walk one more edge
  function buildSecondHop(parentRec, parentNodeObj, parentSeed) {
    var outE = EDGES.filter(function(e){ return e.s === parentNodeObj.id; }).slice(0, 2);
    var inE  = EDGES.filter(function(e){ return e.t === parentNodeObj.id; }).slice(0, 1);
    var childEdges = outE.concat(inE);
    var children = [];
    childEdges.slice(0, 2).forEach(function(e, ci) {
      var isOut = e.s === parentNodeObj.id;
      var grandId = isOut ? e.t : e.s;
      var grand = NODES.find(function(n){ return n.id === grandId; });
      if (!grand || grand.id === node.id) return; // skip self-loop back to root
      var seed = parentSeed + ci * 41 + 17;
      var gp = generateProps(grand);
      var nameProp = gp.find(function(p){ return p.name === "name" || p.name === "title" || p.name === "company_name"; }) || gp[1] || gp[0];
      children.push({
        id: grand.id + "-" + (100000 + Math.abs(seed * 1597) % 899999),
        label: grand.label,
        nodeId: grand.id,
        keyName: nameProp ? nameProp.name : "id",
        keyValue: nameProp ? generateValueForProp(nameProp, seed) : "—",
        edgeLabel: e.label,
        kind: e.kind,
        isOut: isOut
      });
    });
    return children;
  }

  // Build provenance for every property
  var provenance = props.map(function(p, i) {
    var s = node.id.charCodeAt(0) * 7 + i * 17 + record.id.length * 3;
    var conf = parseFloat((0.70 + (Math.abs(s) % 28) / 100).toFixed(2));
    var sources = ["Salesforce CRM","NetSuite ERP","HubSpot Marketing","Manual / Admin","Snowflake Warehouse"];
    var src = p.computed ? "computed" : sources[Math.abs(s) % 4];
    var ages = ["2m", "18m", "1h", "4h", "12h", "1d", "3d"];
    var hasConflict = !p.computed && !p.pk && (Math.abs(s) % 7 === 0);
    return {
      prop: p,
      value: record[p.name] != null ? record[p.name] : generateValueForProp(p, s),
      source: src,
      conf: conf,
      age: ages[Math.abs(s)%7],
      rule: p.computed ? "Computed via rule" : p.required ? "NOT NULL constraint" : p.pii ? "PII access gate" : null,
      conflict: hasConflict ? {
        loser: sources[(Math.abs(s) + 1) % 4],
        loserValue: generateValueForProp(p, s + 1000),
        resolution: "source_priority strategy"
      } : null
    };
  });

  // Activity timeline
  var activity = [
    { when: "2m ago",  who: "Salesforce CRM",   action: "updated", what: "name, owner_id", kind: "sync" },
    { when: "1h ago",  who: "agent:enrich_v3",  action: "computed", what: "tier, risk_score", kind: "agent" },
    { when: "4h ago",  who: "HubSpot Marketing",action: "merged",  what: "industry, region",   kind: "merge" },
    { when: "1d ago",  who: "morgan.lee",       action: "edited",  what: "billing_address (manual override)", kind: "manual" },
    { when: "3d ago",  who: "schema-bot",       action: "validated", what: "all 18 properties · 0 violations", kind: "validate" },
    { when: "12d ago", who: "Salesforce CRM",   action: "created", what: "initial record",     kind: "create" }
  ];

  function statusPill(status) {
    var bg = status === "active" ? "rgba(111,139,95,0.16)" : status === "review" ? "var(--gold-fill)" : "var(--coral-fill)";
    var col = status === "active" ? "var(--green)" : status === "review" ? "var(--gold)" : "var(--coral)";
    return <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 8px", borderRadius:4, background:bg, color:col, fontWeight:700, letterSpacing:"0.5px" }}>{status.toUpperCase()}</span>;
  }

  function NodeGlyph({ n, size }) {
    var col = colorForNode(n);
    var r = size/2 - 1;
    return (
      <svg width={size} height={size} viewBox={"-"+(size/2)+" -"+(size/2)+" "+size+" "+size} style={{ flexShrink:0 }}>
        {n.type === "agent" ? <polygon points={[0,1,2,3,4,5].map(function(i){ var a=(Math.PI/3)*i-Math.PI/2; return (r*Math.cos(a)).toFixed(1)+","+(r*Math.sin(a)).toFixed(1); }).join(" ")} fill={col.fill} stroke={col.stroke} strokeWidth="1.3"/>
         : n.type === "source" ? <rect x={-r} y={-r} width={2*r} height={2*r} rx="2" fill={col.fill} stroke={col.stroke} strokeWidth="1.3"/>
         : <circle r={r} fill={col.fill} stroke={col.stroke} strokeWidth="1.3"/>}
      </svg>
    );
  }

  // Group properties by source bucket for the overview
  var grouped = {};
  provenance.forEach(function(pv) {
    var key = pv.source;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(pv);
  });

  return (
    <div className="detail-view" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="detail-head" style={{ flexShrink:0 }}>
        <div className="detail-crumb">
          <button className="crumb-back" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Records
          </button>
          <span className="crumb-sep">/</span>
          <span className="crumb-cur">{node.label}</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-cur" style={{ fontFamily:"JetBrains Mono", fontSize:10 }}>{record.id}</span>
        </div>
        <div className="detail-title-row">
          <div className="detail-title-left">
            <NodeGlyph n={node} size={36} />
            <div>
              <div className="detail-title-name" style={{ fontFamily:"JetBrains Mono", fontSize:20 }}>{record.id}</div>
              <div style={{ display:"flex", gap:10, alignItems:"center", marginTop:5 }}>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 8px", borderRadius:4, background:"var(--chip)", color:"var(--ink-3)", letterSpacing:"0.5px" }}>{node.label.toUpperCase()}</span>
                {statusPill(record.status)}
                <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)" }}>{"created " + record._createdAgo + " · updated " + record._updatedAgo}</span>
              </div>
            </div>
          </div>
          <div className="detail-title-right">
            <button className="btn-ghost">Open in source ↗</button>
            <button className="btn-ghost">Copy ID</button>
            <button className="btn-dark">Edit record</button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="detail-kpis" style={{ gridTemplateColumns:"repeat(6, 1fr)" }}>
          <div className="kpi">
            <div className="kpi-lbl">Properties</div>
            <div className="kpi-v">{props.length}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Completeness</div>
            <div className="kpi-v" style={{ color: record._completeness >= 90 ? "var(--green)" : "var(--gold)" }}>{record._completeness + "%"}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Confidence</div>
            <div className="kpi-v" style={{ color: record._confidence >= 90 ? "var(--green)" : "var(--gold)" }}>{record._confidence + "%"}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Sources</div>
            <div className="kpi-v">{Object.keys(grouped).length}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Related</div>
            <div className="kpi-v">{totalRelated}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Conflicts</div>
            <div className="kpi-v" style={{ color: provenance.filter(function(p){ return p.conflict; }).length ? "var(--gold)" : "var(--ink)" }}>{provenance.filter(function(p){ return p.conflict; }).length}</div>
          </div>
        </div>

        <div className="detail-tabs">
          {tabs.map(function(t) {
            var n = t === "Overview" ? props.length
                  : t === "Graph"    ? totalRelated
                  : t === "Provenance" ? provenance.filter(function(x){ return x.conflict; }).length || null
                  : t === "Activity" ? activity.length
                  : null;
            return (
              <button key={t} className={"detail-tab" + (tab === t ? " on" : "")} onClick={function(){ setTab(t); }}>
                {t}{n != null && <span className="detail-tab-n">{n}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="detail-body">
        {tab === "Overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"minmax(0, 1.6fr) minmax(280px, 1fr)", gap:18 }}>
            {/* LEFT — property values */}
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div className="card">
                <div className="card-head card-head-row">
                  <span>Property values <span className="card-head-sub">{props.length} fields · {record._source} system of record</span></span>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className="btn-ghost" style={{ fontSize:11.5 }}>Show nulls</button>
                    <button className="btn-ghost" style={{ fontSize:11.5 }}>Export JSON</button>
                  </div>
                </div>
                <div>
                  {provenance.map(function(pv, i) {
                    var p = pv.prop;
                    var isOpen = expandedProp === p.name;
                    var confColor = pv.conf >= 0.9 ? "var(--green)" : pv.conf >= 0.75 ? "var(--gold)" : "var(--coral)";
                    return (
                      <div key={p.name} style={{ borderBottom: i < provenance.length-1 ? "1px solid var(--line-2)" : "none" }}>
                        <div onClick={function(){ setExpandedProp(isOpen ? null : p.name); }}
                          style={{ display:"grid", gridTemplateColumns:"180px 1fr auto auto auto", alignItems:"center", gap:14, padding:"11px 18px", cursor:"pointer" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:0 }}>
                            {p.pk && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"1px 4px", borderRadius:3, background:"var(--ink)", color:"var(--bg-canvas)", fontWeight:700 }}>PK</span>}
                            <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink)", fontWeight: p.pk ? 600 : 400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</code>
                          </div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:12.5, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{String(pv.value)}</div>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>{p.type}</span>
                          <div style={{ display:"flex", gap:3 }}>
                            {p.pii && <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, padding:"1px 5px", borderRadius:3, background:"var(--coral-fill)", color:"var(--coral)", fontWeight:700 }}>PII</span>}
                            {p.required && <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, padding:"1px 5px", borderRadius:3, background:"var(--chip)", color:"var(--ink-3)", fontWeight:700 }}>REQ</span>}
                            {p.computed && <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, padding:"1px 5px", borderRadius:3, background:"var(--purple-fill)", color:"var(--purple)", fontWeight:700 }}>FX</span>}
                            {pv.conflict && <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, padding:"1px 5px", borderRadius:3, background:"var(--gold-fill)", color:"var(--gold)", fontWeight:700 }}>⚠</span>}
                          </div>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)", width:14, textAlign:"center" }}>{isOpen ? "▴" : "▾"}</span>
                        </div>
                        {isOpen && (
                          <div style={{ padding:"4px 18px 16px 198px", background:"var(--panel-2)", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 24px", fontSize:11.5 }}>
                            <div><span style={{ color:"var(--ink-4)", fontFamily:"JetBrains Mono", fontSize:10 }}>SOURCE</span> <span style={{ marginLeft:8, fontFamily:"JetBrains Mono", color:"var(--ink-2)" }}>{pv.source}</span></div>
                            <div><span style={{ color:"var(--ink-4)", fontFamily:"JetBrains Mono", fontSize:10 }}>WRITTEN</span> <span style={{ marginLeft:8, fontFamily:"JetBrains Mono", color:"var(--ink-2)" }}>{pv.age + " ago"}</span></div>
                            <div><span style={{ color:"var(--ink-4)", fontFamily:"JetBrains Mono", fontSize:10 }}>CONFIDENCE</span> <span style={{ marginLeft:8, fontFamily:"JetBrains Mono", color:confColor, fontWeight:600 }}>{pv.conf}</span></div>
                            <div><span style={{ color:"var(--ink-4)", fontFamily:"JetBrains Mono", fontSize:10 }}>RULE</span> <span style={{ marginLeft:8, fontFamily:"JetBrains Mono", color:"var(--ink-2)" }}>{pv.rule || "—"}</span></div>
                            {pv.conflict && (
                              <div style={{ gridColumn:"1 / -1", marginTop:6, padding:"8px 10px", background:"var(--gold-fill)", borderRadius:6, fontSize:11, color:"var(--ink-2)", lineHeight:1.5 }}>
                                ⚠ <b>Conflict resolved.</b> {pv.conflict.loser} asserted <code style={{ fontFamily:"JetBrains Mono", background:"rgba(255,255,255,0.5)", padding:"1px 5px", borderRadius:3 }}>{String(pv.conflict.loserValue)}</code>. Winner chosen via <b>{pv.conflict.resolution}</b>.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT — related records summary + sources */}
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div className="card">
                <div className="card-head">Related records <span className="card-head-sub">{totalRelated} across {related.length} edge types</span></div>
                <div>
                  {related.map(function(r, i) {
                    return (
                      <div key={i} style={{ padding:"11px 18px", borderBottom: i < related.length-1 ? "1px solid var(--line-2)" : "none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)" }}>{r.isOut ? "→" : "←"}</span>
                          <code style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink-2)", fontWeight:500 }}>:{r.edge.label}</code>
                          <NodeGlyph n={r.otherNode} size={14} />
                          <span style={{ fontSize:12, color:"var(--ink)" }}>{r.otherNode.label}</span>
                          <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)" }}>{r.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <div className="card-head">Source contributions</div>
                <div>
                  {Object.keys(grouped).map(function(src, i, arr) {
                    var fields = grouped[src];
                    var pct = Math.round(fields.length / provenance.length * 100);
                    var avgConf = (fields.reduce(function(s,f){ return s + f.conf; }, 0) / fields.length).toFixed(2);
                    return (
                      <div key={src} style={{ padding:"12px 18px", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink-2)", fontWeight:600 }}>{src}</span>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)" }}>{fields.length + " fields · conf " + avgConf}</span>
                        </div>
                        <div className="nv-bar" style={{ maxWidth:"100%" }}>
                          <div className="nv-bar-fill" style={{ width: pct + "%", background: src === "computed" ? "var(--purple)" : "var(--blue)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "Graph" && (
          <div style={{ display:"grid", gridTemplateColumns:"minmax(0, 2fr) minmax(300px, 1fr)", gap:18 }}>
            <div className="card" style={{ padding:0, overflow:"hidden" }}>
              <div className="card-head card-head-row">
                <span>Relationship graph <span className="card-head-sub">center = this record · {twoHop ? "showing 2-hop neighbourhood" : "showing direct neighbours"}</span></span>
                <div style={{ display:"flex", gap:6 }}>
                  <button className="btn-ghost" style={{ fontSize:11.5 }} onClick={function(){ setTwoHop(function(v){ return !v; }); }}>{twoHop ? "Collapse to 1-hop" : "Expand 2-hop"}</button>
                  <button className="btn-ghost" style={{ fontSize:11.5 }}>Reset</button>
                </div>
              </div>
              <div style={{ background:"var(--bg-canvas)", padding:"20px" }}>
                {(function() {
                  var W = twoHop ? 980 : 720;
                  var H = twoHop ? 620 : 460;
                  var cx = W/2, cy = H/2;
                  var r1 = twoHop ? 160 : 170;
                  var r2 = 290;

                  // 1-hop nodes
                  var flat = [];
                  related.forEach(function(r, ri) {
                    r.related.forEach(function(rr) {
                      flat.push({ rr: rr, parentIdx: ri, isOut: r.isOut });
                    });
                  });
                  var nFlat = flat.length || 1;
                  flat.forEach(function(f, i) {
                    var a = (i / nFlat) * Math.PI * 2 - Math.PI / 2;
                    f.x = cx + Math.cos(a) * r1;
                    f.y = cy + Math.sin(a) * r1;
                    f.angle = a;
                  });

                  // 2-hop nodes (children of each 1-hop)
                  var hops = [];
                  if (twoHop) {
                    flat.forEach(function(f, i) {
                      var parentNodeObj = NODES.find(function(n){ return n.id === f.rr.nodeId; });
                      if (!parentNodeObj) return;
                      var pSeed = f.rr.id.length * 31 + i * 13;
                      var kids = buildSecondHop(f.rr, parentNodeObj, pSeed);
                      var k = kids.length;
                      var arcSpan = Math.PI / 7;
                      kids.forEach(function(kid, ki) {
                        var offset = k > 1 ? ((ki - (k-1)/2) / (k-1)) * arcSpan : 0;
                        var ang = f.angle + offset;
                        hops.push({
                          rr: kid,
                          parent: f,
                          x: cx + Math.cos(ang) * r2,
                          y: cy + Math.sin(ang) * r2
                        });
                      });
                    });
                  }

                  return (
                    <svg width="100%" height={H} viewBox={"0 0 "+W+" "+H} style={{ display:"block" }}>
                      <defs>
                        <marker id="rec-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-3)"/></marker>
                        <marker id="rec-arrow-2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-4)"/></marker>
                      </defs>

                      {/* 2-hop edges (drawn first, behind) */}
                      {hops.map(function(h, i) {
                        var px = h.parent.x, py = h.parent.y;
                        var dx = h.x - px, dy = h.y - py;
                        var len = Math.sqrt(dx*dx + dy*dy);
                        var ux = dx/len, uy = dy/len;
                        var sx = px + ux * 16, sy = py + uy * 16;
                        var tx = h.x - ux * 13, ty = h.y - uy * 13;
                        var midX = (sx + tx) / 2, midY = (sy + ty) / 2;
                        return (
                          <g key={"h-e"+i}>
                            <line x1={sx} y1={sy} x2={tx} y2={ty} stroke="var(--ink-4)" strokeWidth="0.9" opacity="0.45" strokeDasharray={h.rr.kind === "inferred" ? "3,2" : "none"} markerEnd="url(#rec-arrow-2)" />
                            <g transform={"translate("+midX+" "+midY+")"} style={{ pointerEvents:"none" }}>
                              <rect x="-32" y="-7" width="64" height="13" rx="2.5" fill="var(--panel)" stroke="var(--line-2)" />
                              <text textAnchor="middle" y="2.5" style={{ fontFamily:"JetBrains Mono", fontSize:"8px", fill:"var(--ink-3)" }}>{":"+h.rr.edgeLabel}</text>
                            </g>
                          </g>
                        );
                      })}

                      {/* 1-hop edges */}
                      {flat.map(function(f, i) {
                        var midX = (cx + f.x) / 2, midY = (cy + f.y) / 2;
                        var dx = f.x - cx, dy = f.y - cy;
                        var len = Math.sqrt(dx*dx + dy*dy);
                        var ux = dx/len, uy = dy/len;
                        var sx = cx + ux * 28, sy = cy + uy * 28;
                        var tx = f.x - ux * 18, ty = f.y - uy * 18;
                        return (
                          <g key={"e"+i}>
                            <line x1={sx} y1={sy} x2={tx} y2={ty} stroke="var(--ink-3)" strokeWidth="1.3" opacity="0.6" strokeDasharray={f.rr.kind === "inferred" ? "4,3" : "none"} markerEnd="url(#rec-arrow)" />
                            <g transform={"translate("+midX+" "+midY+")"} style={{ pointerEvents:"none" }}>
                              <rect x="-44" y="-9" width="88" height="18" rx="3" fill="var(--panel)" stroke="var(--line-2)" />
                              <text textAnchor="middle" y="3.5" style={{ fontFamily:"JetBrains Mono", fontSize:"9.5px", fill:"var(--ink-2)" }}>{":"+f.rr.edgeLabel}</text>
                            </g>
                          </g>
                        );
                      })}

                      {/* 2-hop nodes */}
                      {hops.map(function(h, i) {
                        var nodeObj = NODES.find(function(n){ return n.id === h.rr.nodeId; });
                        var col = colorForNode(nodeObj);
                        var isHover = hoverNode === h.rr.id;
                        return (
                          <g key={"h-n"+i} opacity={isHover ? 1 : 0.92} style={{ cursor:"pointer" }}
                            onClick={function(){ navigateTo(h.rr.id, h.rr.nodeId); }}
                            onMouseEnter={function(){ setHoverNode(h.rr.id); }}
                            onMouseLeave={function(){ setHoverNode(null); }}>
                            <circle cx={h.x} cy={h.y} r={isHover ? 15 : 13} fill={col.fill} stroke={isHover ? "var(--ink)" : col.stroke} strokeWidth={isHover ? 2 : 1.2} />
                            <text x={h.x} y={h.y - 19} textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"7.5px", fontWeight:600, fill: isHover ? "var(--ink)" : "var(--ink-2)", pointerEvents:"none" }}>{h.rr.id}</text>
                            <text x={h.x} y={h.y + 23} textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"7.5px", fill:"var(--ink-4)", pointerEvents:"none" }}>{String(h.rr.keyValue).slice(0, 18)}</text>
                          </g>
                        );
                      })}

                      {/* Center node (not clickable — already here) */}
                      <g>
                        <circle cx={cx} cy={cy} r="28" fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
                        <text x={cx} y={cy - 38} textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"10.5px", fontWeight:600, fill:"var(--ink)" }}>{record.id}</text>
                        <text x={cx} y={cy + 48} textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"9.5px", fill:"var(--ink-3)" }}>{record[Object.keys(record).find(function(k){ return k === "name" || k === "company_name" || k === "title"; })] || node.label}</text>
                      </g>

                      {/* 1-hop nodes — clickable, drawn last so they sit on top */}
                      {flat.map(function(f, i) {
                        var otherCol = colorForNode(NODES.find(function(n){ return n.id === f.rr.nodeId; }));
                        var isHover = hoverNode === f.rr.id;
                        return (
                          <g key={"n"+i} style={{ cursor:"pointer" }}
                            onClick={function(){ navigateTo(f.rr.id, f.rr.nodeId); }}
                            onMouseEnter={function(){ setHoverNode(f.rr.id); }}
                            onMouseLeave={function(){ setHoverNode(null); }}>
                            <circle cx={f.x} cy={f.y} r={isHover ? 21 : 18} fill={otherCol.fill} stroke={isHover ? "var(--ink)" : otherCol.stroke} strokeWidth={isHover ? 2.4 : 1.6} />
                            <text x={f.x} y={f.y - 24} textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"9px", fontWeight:600, fill:"var(--ink)", pointerEvents:"none" }}>{f.rr.id}</text>
                            <text x={f.x} y={f.y + 30} textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"8.5px", fill:"var(--ink-3)", pointerEvents:"none" }}>{f.rr.keyName + ": " + String(f.rr.keyValue).slice(0, 20)}</text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            </div>

            {/* RIGHT — connection list */}
            <div className="card">
              <div className="card-head">Connections <span className="card-head-sub">{totalRelated} edges · values & timing</span></div>
              <div style={{ maxHeight:560, overflowY:"auto" }}>
                {related.map(function(r, i) {
                  return (
                    <div key={i} style={{ padding:"10px 16px", borderBottom: i < related.length-1 ? "1px solid var(--line-2)" : "none" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <code style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{r.isOut ? "→" : "←"}</code>
                        <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)", fontWeight:600 }}>:{r.edge.label}</code>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"1px 5px", borderRadius:3, background: r.edge.kind === "inferred" ? "var(--gold-fill)" : r.edge.kind === "agent" ? "var(--purple-fill)" : "var(--chip)", color: r.edge.kind === "inferred" ? "var(--gold)" : r.edge.kind === "agent" ? "var(--purple)" : "var(--ink-3)", textTransform:"uppercase", letterSpacing:"0.4px", fontWeight:700 }}>{r.edge.kind}</span>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        {r.related.map(function(rr, j) {
                          return (
                            <div key={j}
                              onClick={function(){ navigateTo(rr.id, rr.nodeId); }}
                              style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 6px", fontSize:11.5, cursor:"pointer", borderRadius:5, transition:"background 80ms" }}
                              onMouseEnter={function(e){ e.currentTarget.style.background = "var(--bg-canvas)"; }}
                              onMouseLeave={function(e){ e.currentTarget.style.background = "transparent"; }}>
                              <NodeGlyph n={r.otherNode} size={12} />
                              <code style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--blue)", flexShrink:0 }}>{rr.id}</code>
                              <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0 }}>{rr.keyValue}</span>
                              <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-4)", flexShrink:0 }}>{rr.since}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "Provenance" && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div className="card">
              <div className="card-head">How each value was built <span className="card-head-sub">source · timestamp · confidence · rule applied</span></div>
              <div>
                {provenance.map(function(pv, i) {
                  var confColor = pv.conf >= 0.9 ? "var(--green)" : pv.conf >= 0.75 ? "var(--gold)" : "var(--coral)";
                  return (
                    <div key={pv.prop.name} style={{ padding:"14px 18px", borderBottom: i < provenance.length-1 ? "1px solid var(--line-2)" : "none" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"180px 1fr 130px 90px 80px", gap:14, alignItems:"center" }}>
                        <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink)", fontWeight: pv.prop.pk ? 600 : 400 }}>{pv.prop.name}</code>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink-2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{String(pv.value)}</div>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color: pv.source === "computed" ? "var(--purple)" : "var(--ink-2)" }}>{pv.source}</span>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{pv.age + " ago"}</span>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:11, fontWeight:700, color:confColor, textAlign:"right" }}>{pv.conf}</span>
                      </div>
                      {(pv.rule || pv.conflict) && (
                        <div style={{ marginTop:8, marginLeft:194, display:"flex", flexDirection:"column", gap:6 }}>
                          {pv.rule && (
                            <div style={{ fontSize:11, color:"var(--ink-3)", fontFamily:"JetBrains Mono" }}>↳ rule: <span style={{ color:"var(--ink-2)" }}>{pv.rule}</span></div>
                          )}
                          {pv.conflict && (
                            <div style={{ padding:"7px 10px", background:"var(--gold-fill)", borderRadius:5, fontSize:11, color:"var(--ink-2)" }}>
                              <span style={{ fontFamily:"JetBrains Mono", fontWeight:700, color:"var(--gold)" }}>⚠ CONFLICT</span> · {pv.conflict.loser} sent <code style={{ fontFamily:"JetBrains Mono", background:"rgba(255,255,255,0.5)", padding:"1px 5px", borderRadius:3 }}>{String(pv.conflict.loserValue)}</code> · resolved by <b>{pv.conflict.resolution}</b>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "Activity" && (
          <div className="card">
            <div className="card-head">Change history <span className="card-head-sub">last 30 days</span></div>
            <div>
              {activity.map(function(a, i) {
                var dotColor = a.kind === "create" ? "var(--green)" : a.kind === "sync" ? "var(--blue)" : a.kind === "agent" ? "var(--purple)" : a.kind === "manual" ? "var(--coral)" : a.kind === "merge" ? "var(--gold)" : "var(--ink-3)";
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"100px 12px 1fr", gap:14, alignItems:"center", padding:"12px 18px", borderBottom: i < activity.length-1 ? "1px solid var(--line-2)" : "none" }}>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{a.when}</span>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:dotColor, justifySelf:"center" }} />
                    <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink-2)", fontWeight:600 }}>{a.who}</span>
                      <span style={{ fontSize:12, color:"var(--ink-3)" }}>{a.action}</span>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink)" }}>{a.what}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecordsView() {
  var entityNodes = NODES.filter(function(n){ return n.type !== "source"; });
  var [nodeFilter, setNodeFilter] = React.useState(entityNodes[0] ? entityNodes[0].id : "account");
  var [dropOpen, setDropOpen] = React.useState(false);
  var [search, setSearch] = React.useState("");
  var [selectedRecord, setSelectedRecord] = React.useState(null);
  var [selectedNode, setSelectedNode] = React.useState(null);

  var selectedNodeObj = NODES.find(function(n){ return n.id === nodeFilter; }) || entityNodes[0];
  var c = colorForNode(selectedNodeObj);

  // Generate records ONLY for the selected node type
  var records = generateRecords(selectedNodeObj);
  var filteredRecords = search
    ? records.filter(function(r){
        return JSON.stringify(r).toLowerCase().indexOf(search.toLowerCase()) >= 0;
      })
    : records;

  if (selectedRecord && selectedNode) {
    return <RecordDetailView
      record={selectedRecord}
      node={selectedNode}
      onBack={function(){ setSelectedRecord(null); setSelectedNode(null); }}
      onNavigate={function(rec, n){ setSelectedRecord(rec); setSelectedNode(n); if (n.id !== nodeFilter) setNodeFilter(n.id); }}
    />;
  }

  // Build dynamic columns from the selected node type's properties
  var props = generateProps(selectedNodeObj);
  // Pick the most useful columns: PK + up to 4 high-value props (required/indexed first)
  var pkProp = props.find(function(p){ return p.pk; }) || props[0];
  var displayProps = props.filter(function(p){ return p !== pkProp; })
    .sort(function(a, b){
      var aw = (a.required ? 4 : 0) + (a.indexed ? 2 : 0) + (a.pii ? -1 : 0);
      var bw = (b.required ? 4 : 0) + (b.indexed ? 2 : 0) + (b.pii ? -1 : 0);
      return bw - aw;
    })
    .slice(0, 4);
  var columns = [pkProp].concat(displayProps);

  // 1.4fr for PK, 1fr for each value column, then fixed-width source/updated/status
  var gridCols = "1.4fr " + displayProps.map(function(){ return "1.2fr"; }).join(" ") + " 1.2fr 100px 90px";

  function NodeGlyph({ n, size }) {
    var col = colorForNode(n);
    var r = size/2 - 1;
    return (
      <svg width={size} height={size} viewBox={"-"+(size/2)+" -"+(size/2)+" "+size+" "+size} style={{ flexShrink:0 }}>
        {n.type === "agent" ? <polygon points={[0,1,2,3,4,5].map(function(i){ var a=(Math.PI/3)*i-Math.PI/2; return (r*Math.cos(a)).toFixed(1)+","+(r*Math.sin(a)).toFixed(1); }).join(" ")} fill={col.fill} stroke={col.stroke} strokeWidth="1.3"/>
         : n.type === "source" ? <rect x={-r} y={-r} width={2*r} height={2*r} rx="2" fill={col.fill} stroke={col.stroke} strokeWidth="1.3"/>
         : <circle r={r} fill={col.fill} stroke={col.stroke} strokeWidth="1.3"/>}
      </svg>
    );
  }

  return (
    <div className="nodes-view">
      <div className="nv-head">
        <div className="nv-head-left">

          <div className="nv-title">Records</div>
        </div>
        <div className="nv-head-right">
          <button className="btn-ghost">Export CSV</button>
          <button className="btn-dark">+ Add record</button>
        </div>
      </div>

      {/* Toolbar: dropdown selector + search + meta */}
      <div className="nv-chips-row" style={{ alignItems:"center", gap:16, justifyContent:"flex-start" }}>
        {/* Node type dropdown */}
        <div style={{ position:"relative" }}>
          <button
            onClick={function(){ setDropOpen(function(o){ return !o; }); }}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", border:"1px solid var(--line)", borderRadius:8, background: dropOpen ? "var(--chip)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"var(--ink)", minWidth:240 }}
          >
            <NodeGlyph n={selectedNodeObj} size={16} />
            <span style={{ fontWeight:500 }}>{selectedNodeObj.label}</span>
            <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginLeft:4 }}>{records.length + " records"}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ marginLeft:"auto", transition:"transform 120ms", transform: dropOpen ? "rotate(180deg)" : "none" }}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {dropOpen && (
            <>
              <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:99 }} onClick={function(){ setDropOpen(false); }} />
              <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:100, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 8px 28px rgba(0,0,0,0.14)", padding:6, minWidth:280, maxHeight:420, overflowY:"auto" }}>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.7px", color:"var(--ink-4)", textTransform:"uppercase", padding:"8px 10px 6px" }}>SELECT NODE TYPE</div>
                {entityNodes.map(function(n) {
                  var count = 12; // generateRecords returns 12 per node
                  var isOn = nodeFilter === n.id;
                  return (
                    <button key={n.id}
                      onClick={function(){ setNodeFilter(n.id); setDropOpen(false); setSearch(""); }}
                      style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"8px 10px", borderRadius:6, border:"none", background: isOn ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"var(--ink)", textAlign:"left" }}
                      onMouseEnter={function(e){ if (!isOn) e.currentTarget.style.background = "var(--bg-canvas)"; }}
                      onMouseLeave={function(e){ if (!isOn) e.currentTarget.style.background = "transparent"; }}
                    >
                      <NodeGlyph n={n} size={14} />
                      <span style={{ fontWeight: isOn ? 600 : 400, flex:1 }}>{n.label}</span>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{count}</span>
                      {isOn && <span style={{ fontFamily:"JetBrains Mono", color:"var(--ink)", fontSize:11, marginLeft:4 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Search */}
        <div style={{ position:"relative", flex:"0 0 280px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--ink-3)", pointerEvents:"none" }}>
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={function(e){ setSearch(e.target.value); }}
            placeholder={"Search " + selectedNodeObj.label.toLowerCase() + " records…"}
            style={{ width:"100%", padding:"8px 10px 8px 30px", border:"1px solid var(--line)", borderRadius:8, fontFamily:"inherit", fontSize:12.5, color:"var(--ink)", background:"var(--panel)", outline:"none" }}
          />
        </div>

        <div style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>
          {filteredRecords.length + (search ? " of " + records.length : "") + " records · " + props.length + " properties"}
        </div>
      </div>

      {/* Dynamic-column table */}
      <div className="nv-table">
        <div style={{ display:"grid", gridTemplateColumns:gridCols, gap:12, padding:"10px 18px", background:"var(--panel-2)", borderBottom:"1px solid var(--line)", fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"0.6px", textTransform:"uppercase", alignItems:"center" }}>
          {columns.map(function(p) {
            return (
              <div key={p.name} style={{ display:"flex", alignItems:"center", gap:5, overflow:"hidden" }}>
                {p.pk && <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, padding:"1px 4px", borderRadius:3, background:"var(--ink)", color:"var(--bg-canvas)", fontWeight:700, letterSpacing:0 }}>PK</span>}
                {p.pii && <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, padding:"1px 4px", borderRadius:3, background:"var(--coral-fill)", color:"var(--coral)", fontWeight:700, letterSpacing:0 }}>PII</span>}
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</span>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, color:"var(--ink-4)", textTransform:"none", letterSpacing:0 }}>{p.type}</span>
              </div>
            );
          })}
          <div>Source</div>
          <div>Updated</div>
          <div>Status</div>
        </div>
        {filteredRecords.map(function(r, i) {
          var statusColor = r.status === "active" ? "var(--green)" : r.status === "review" ? "var(--gold)" : "var(--coral)";
          return (
            <div key={r.id}
              onClick={function(){ setSelectedRecord(r); setSelectedNode(selectedNodeObj); }}
              style={{ display:"grid", gridTemplateColumns:gridCols, gap:12, padding:"12px 18px", borderBottom: i < filteredRecords.length-1 ? "1px solid var(--line-2)" : "none", cursor:"pointer", alignItems:"center", transition:"background 80ms" }}
              onMouseEnter={function(e){ e.currentTarget.style.background = "var(--panel-2)"; }}
              onMouseLeave={function(e){ e.currentTarget.style.background = "transparent"; }}>
              {columns.map(function(p, ci) {
                var val = r[p.name];
                var displayVal = val == null ? "—" : String(val);
                var color = ci === 0 ? "var(--blue)" : "var(--ink-2)";
                return (
                  <div key={p.name} style={{ fontFamily:"JetBrains Mono", fontSize: ci === 0 ? 11.5 : 11, color: color, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayVal}</div>
                );
              })}
              <div style={{ fontSize:11.5, color:"var(--ink-3)" }}>{r._source}</div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)" }}>{r._updatedAgo}</div>
              <div><span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"2px 7px", borderRadius:4, background:statusColor+"22", color:statusColor, fontWeight:700, textTransform:"uppercase", display:"inline-block" }}>{r.status}</span></div>
            </div>
          );
        })}
        {filteredRecords.length === 0 && (
          <div style={{ padding:"40px 18px", textAlign:"center", color:"var(--ink-3)", fontSize:13 }}>
            No {selectedNodeObj.label.toLowerCase()} records match <b>{search}</b>.
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEWARDSHIP — org-level inbox of all data quality tasks needing human action
// ═══════════════════════════════════════════════════════════════════════════════

var STEWARDS = [
  { id:"morgan.lee", initials:"ML", color:"var(--blue)",   team:"data-platform" },
  { id:"ramin.k",    initials:"RK", color:"var(--purple)", team:"data-platform" },
  { id:"jordan.s",   initials:"JS", color:"var(--green)",  team:"customer-ops"  },
  { id:"alex.r",     initials:"AR", color:"var(--gold)",   team:"customer-ops"  },
  { id:"casey.m",    initials:"CM", color:"var(--coral)",  team:"finance-ops"   },
  { id:"taylor.j",   initials:"TJ", color:"var(--ink-2)",  team:"finance-ops"   }
];

function kindMeta(k) {
  if (k === "VAL") return { color:"var(--blue)",   fill:"var(--blue-fill)",   icon:"✓", long:"Validation" };
  if (k === "DQ")  return { color:"var(--green)",  fill:"var(--green-fill)",  icon:"◷", long:"Data quality" };
  if (k === "MAT") return { color:"var(--purple)", fill:"var(--purple-fill)", icon:"≈", long:"Matching" };
  if (k === "SUR") return { color:"var(--coral)",  fill:"var(--coral-fill)",  icon:"★", long:"Survivorship" };
  if (k === "ACC") return { color:"var(--ink-2)",  fill:"var(--chip)",        icon:"⊕", long:"Access" };
  return { color:"var(--ink-3)", fill:"var(--chip)", icon:"?", long:"Other" };
}

function sevMeta(s) {
  if (s === "critical") return { color:"var(--coral)", fill:"var(--coral-fill)", label:"CRITICAL" };
  if (s === "high")     return { color:"var(--gold)",  fill:"var(--gold-fill)",  label:"HIGH" };
  if (s === "medium")   return { color:"var(--blue)",  fill:"var(--blue-fill)",  label:"MEDIUM" };
  if (s === "low")      return { color:"var(--ink-3)", fill:"var(--chip)",       label:"LOW" };
  return { color:"var(--ink-3)", fill:"var(--chip)", label:"INFO" };
}

function statusMeta(s) {
  if (s === "new")         return { color:"var(--coral)", label:"New",         dot:true };
  if (s === "in_progress") return { color:"var(--gold)",  label:"In progress", dot:true };
  if (s === "waiting")     return { color:"var(--ink-3)", label:"Waiting",     dot:true };
  if (s === "resolved")    return { color:"var(--green)", label:"Resolved",    dot:true };
  if (s === "dismissed")   return { color:"var(--ink-4)", label:"Dismissed",   dot:true };
  return { color:"var(--ink-3)", label:s, dot:true };
}

// Build a fake-but-stable record ID + bad-value combo for a given seed
function pickAffectedRecord(node, seed, fieldHint) {
  var n = Math.abs(seed);
  var recId = node.id + "-" + (100000 + (n * 1597) % 899999);
  var props = generateProps(node);
  var targetProp = fieldHint && props.find(function(p){ return p.name === fieldHint; });
  if (!targetProp) {
    // Bias toward required / indexed / first-non-pk
    var candidates = props.filter(function(p){ return !p.pk && (p.required || p.indexed); });
    targetProp = (candidates[n % Math.max(candidates.length, 1)]) || props[1] || props[0];
  }
  return { recId: recId, prop: targetProp };
}

// Pretend-bad-value samples by failure kind
function badValueFor(prop, seed) {
  var n = Math.abs(seed);
  if (prop.type === "decimal" || prop.type === "float") {
    var samples = [-(1000 + n % 9000), null, 0, -1];
    var v = samples[n % samples.length];
    return v === null ? null : v.toString();
  }
  if (prop.type === "bool") return null;
  if (prop.type === "timestamp" || prop.type === "date") return n % 2 ? null : "1970-01-01";
  if (prop.type.indexOf("enum") === 0) return ["UNKNOWN_TIER","AdTech","Climate-Tech","Web3","BioPharma"][n % 5];
  if (prop.name === "domain") return ["acme..com", "no_dot_at_all", "", "@invalid", ".badstart.com"][n % 5];
  if (prop.name === "email") return ["jane@", "no-at-sign.com", "", "@noone", "missing@.com"][n % 5];
  return n % 2 ? null : "";
}

function failureReason(prop, badValue, ruleExpr) {
  if (badValue === null || badValue === "") return "value is null";
  if (prop.type === "decimal" || prop.type === "float") {
    var num = parseFloat(badValue);
    if (num < 0) return "value " + badValue + " < 0";
    return "value " + badValue + " fails " + (ruleExpr || "constraint");
  }
  if (prop.name === "domain")   return "'" + badValue + "' does not match /^[a-z0-9-.]+$/";
  if (prop.name === "email")    return "'" + badValue + "' is not a valid email";
  if (prop.type.indexOf("enum") === 0) return "'" + badValue + "' not in allowed enum";
  return "'" + badValue + "' fails rule";
}

function generateStewardshipTasks() {
  var tasks = [];
  var idSeed = 10000;
  var entityNodes = NODES.filter(function(n){ return n.type !== "source"; });

  function pickStatus(seed, severity) {
    var pool = severity === "critical" ? ["new","new","new","in_progress"]
             : severity === "high"     ? ["new","new","in_progress","waiting"]
             : severity === "medium"   ? ["new","in_progress","in_progress","waiting"]
             :                           ["new","in_progress","waiting","resolved"];
    return pool[Math.abs(seed) % pool.length];
  }
  function pickSla(seed, severity, overdue) {
    if (overdue) return "-" + ((Math.abs(seed) % 12) + 1) + "h";
    var hours = severity === "critical" ? 4 : severity === "high" ? 24 : severity === "medium" ? 72 : 168;
    return ((hours - (Math.abs(seed) % hours))) + "h";
  }
  function pickAge(seed) {
    return ["5m ago","18m ago","42m ago","1h ago","3h ago","6h ago","12h ago","1d ago","2d ago","3d ago"][Math.abs(seed) % 10];
  }
  function pickAssignee(seed) { return STEWARDS[Math.abs(seed) % STEWARDS.length].id; }

  entityNodes.forEach(function(node, ni) {
    var rules = generateRules(node);
    var nseed = node.id.charCodeAt(0) * 31 + ni * 7;

    // ─── Each violation = one task per record ───
    (rules.quality || []).forEach(function(r, ri) {
      if ((r.violations || 0) <= 0) return;
      var perTask = Math.min(r.violations, r.kind === "VALIDATE" ? 4 : 2); // cap noise per rule
      for (var i = 0; i < perTask; i++) {
        var seed = nseed + ri * 17 + i * 41;
        var kind = r.kind === "VALIDATE" ? "VAL"
                 : r.kind === "ACCESS"   ? "ACC"
                 : r.kind === "SLO"      ? "DQ"
                 : r.kind === "COMPUTE"  ? "DQ"
                 : r.kind === "INFER"    ? "DQ" : "VAL";
        var sev = i === 0 && r.violations > 50 ? "critical" : (Math.abs(seed) % 6 === 0) ? "high" : (Math.abs(seed) % 3 === 0) ? "medium" : "low";
        var overdue = Math.abs(seed) % 11 === 0;
        var status = pickStatus(seed, sev);
        var hint = r.expr && r.expr.split(/\s+/)[0]; // field name from start of expression
        var hit = pickAffectedRecord(node, seed, hint);
        var badV = badValueFor(hit.prop, seed);
        var reason = failureReason(hit.prop, badV, r.expr);
        var title;
        if (kind === "ACC") {
          title = "Denied " + hit.prop.name + " read on " + hit.recId;
        } else if (kind === "DQ" && r.kind === "COMPUTE") {
          title = "Compute failed: " + (r.title || r.id) + " on " + hit.recId;
        } else if (kind === "DQ" && (r.kind === "SLO" || r.kind === "INFER")) {
          continue; // SLO/INFER are pipeline-level — handled by the "hot" tasks below
        } else {
          title = node.label + " " + hit.recId + " — " + reason;
        }
        tasks.push({
          id: "TASK-" + (idSeed++),
          kind: kind,
          ruleKind: r.kind,
          severity: sev,
          title: title,
          summary: kind === "ACC"
            ? "Access policy \"" + (r.title || r.id) + "\" denied a read of " + hit.prop.name + " on " + hit.recId + ". The requester does not hold one of the required roles. Steward must decide whether to grant the role, confirm denial, or escalate to security."
            : "Record " + hit.recId + " failed validation rule \"" + (r.title || r.id) + "\" because " + reason + ". The current value violates the constraint " + (r.expr || r.label || "") + ". Decide: fix the value at source, override manually, or update the rule.",
          recordId: hit.recId,
          recordValue: badV,
          fieldName: hit.prop.name,
          fieldType: hit.prop.type,
          nodeId: node.id,
          nodeLabel: node.label,
          ruleId: r.id,
          ruleTitle: r.title || r.id,
          ruleExpr: r.expr || r.label || "—",
          status: status,
          assignee: pickAssignee(seed),
          createdAgo: pickAge(seed),
          slaRemaining: pickSla(seed, sev, overdue),
          overdue: overdue
        });
      }
    });

    // ─── Match candidates → one task per pair ───
    (rules.match || []).forEach(function(r, ri) {
      if ((r.candidates || 0) <= 0) return;
      var perTask = Math.min(r.candidates, 3);
      for (var i = 0; i < perTask; i++) {
        var seed = nseed + ri * 23 + i * 29 + 100;
        var sev = r.candidates > 5 ? "high" : r.candidates > 2 ? "medium" : "low";
        var status = pickStatus(seed, sev);
        var hit1 = pickAffectedRecord(node, seed);
        var hit2 = pickAffectedRecord(node, seed + 777);
        // Pretend score in the review band
        var score = (parseFloat(r.threshold_review) + ((Math.abs(seed) % 17) * (parseFloat(r.threshold_auto) - parseFloat(r.threshold_review)) / 17)).toFixed(2);
        tasks.push({
          id: "TASK-" + (idSeed++),
          kind: "MAT", ruleKind: "MATCH",
          severity: sev,
          title: "Possible duplicate: " + hit1.recId + " ≈ " + hit2.recId + "  ·  score " + score,
          summary: "Matching rule \"" + r.title + "\" identified this pair of " + node.label + " records as likely the same real-world entity (score " + score + ", review band " + r.threshold_review + "–" + r.threshold_auto + "). A steward must decide: merge into a canonical record, link with :IS_SAME_AS, or reject as not-a-match.",
          recordId: hit1.recId,
          recordIdB: hit2.recId,
          matchScore: parseFloat(score),
          nodeId: node.id, nodeLabel: node.label,
          ruleId: r.id, ruleTitle: r.title,
          ruleExpr: r.signals.map(function(s){ return s.strategy + "(" + s.field + ")×" + s.weight; }).join(" + "),
          status: status,
          assignee: pickAssignee(seed),
          createdAgo: pickAge(seed),
          slaRemaining: pickSla(seed, sev, false),
          overdue: false
        });
      }
    });

    // ─── Survivorship conflicts → one task per record ───
    (rules.survivorship || []).forEach(function(r, ri) {
      if ((r.conflicts || 0) <= 0) return;
      var perTask = Math.min(r.conflicts, 2);
      for (var i = 0; i < perTask; i++) {
        var seed = nseed + ri * 29 + i * 37 + 200;
        var sev = r.conflicts > 2 ? "high" : "medium";
        var status = pickStatus(seed, sev);
        var hit = pickAffectedRecord(node, seed, r.property);
        // Pretend three sources disagreeing
        var sources = (r.sources && r.sources.length ? r.sources : ["NetSuite ERP","Salesforce CRM","HubSpot Marketing"]).slice(0, 3);
        var values = sources.map(function(s, j){ return generateValueForProp(hit.prop, seed + j * 17); });
        tasks.push({
          id: "TASK-" + (idSeed++),
          kind: "SUR", ruleKind: "SURV",
          severity: sev,
          title: r.property + " conflict on " + node.label + " " + hit.recId,
          summary: "On record " + hit.recId + ", " + sources.length + " sources are asserting different values for " + node.label + "." + r.property + ". Strategy \"" + (r.strategy || "—") + "\" could not auto-resolve because the variance exceeds the configured threshold. Steward must pick the winning value or set a manual override.",
          recordId: hit.recId,
          fieldName: r.property,
          conflictSources: sources,
          conflictValues: values,
          nodeId: node.id, nodeLabel: node.label,
          ruleId: r.id, ruleTitle: r.title,
          ruleExpr: r.property + " ← " + (r.strategy || "—") + (r.sources && r.sources.length ? " (" + r.sources.join(" > ") + ")" : ""),
          status: status,
          assignee: pickAssignee(seed),
          createdAgo: pickAge(seed),
          slaRemaining: pickSla(seed, sev, false),
          overdue: Math.abs(seed) % 13 === 0
        });
      }
    });
  });

  // ─── Genuinely pipeline-level tasks (SLO / drift / bulk denials) ───
  var pipelineTasks = [
    { kind:"DQ",  sev:"critical", title:"Freshness SLO breached: Account pipeline p95 = 42m (target 30m)",
      summary:"The Salesforce CRM → Account pipeline has been running 12 minutes behind its 30-minute freshness target for 47 minutes. Likely cause is the upstream dbt model failure at 08:42 UTC.",
      nodeLabel:"Account", scope:"Account ingest pipeline" },
    { kind:"DQ",  sev:"high",     title:"Drift detected on Account.industry — 4 unseen enum values",
      summary:"4 records arrived from HubSpot Marketing with industry values not in the configured enum (AdTech, Climate-Tech, Web3, BioPharma). Either widen the enum or route to quarantine.",
      nodeLabel:"Account", scope:"Account.industry, last 24h" },
    { kind:"ACC", sev:"critical", title:"Bulk denial: svc-bi-reporter attempted tax_id read on 320 Accounts",
      summary:"Service account svc-bi-reporter (role: bi_read) attempted to read tax_id on 320 Account records in the past hour. All requests were denied per access policy. Review whether the role should be granted or the requests should be flagged as anomalous.",
      nodeLabel:"Account", scope:"320 records, svc-bi-reporter" }
  ];
  pipelineTasks.forEach(function(p, i){
    var seed = i * 137 + 500;
    tasks.push({
      id: "TASK-" + (idSeed++),
      kind: p.kind,
      ruleKind: p.kind === "DQ" ? "SLO" : "ACCESS",
      severity: p.sev,
      title: p.title,
      summary: p.summary,
      recordId: null,
      scope: p.scope,
      nodeId: p.nodeLabel.toLowerCase(),
      nodeLabel: p.nodeLabel,
      ruleId: "pipeline-" + i,
      ruleTitle: p.title.split(":")[0],
      ruleExpr: "—",
      status: i === 0 ? "new" : "in_progress",
      assignee: STEWARDS[i % STEWARDS.length].id,
      createdAgo: ["5m ago","42m ago","1h ago"][i % 3],
      slaRemaining: i === 0 ? "-2h" : "8h",
      overdue: i === 0
    });
  });

  return tasks;
}

function StewardshipView() {
  var [tasks] = useState(function(){ return generateStewardshipTasks(); });
  var [selectedId, setSelectedId] = useState(null);
  var [statusFilter, setStatusFilter] = useState("open");
  var [kindFilter, setKindFilter] = useState("all");
  var [assigneeFilter, setAssigneeFilter] = useState("all");
  var [sevFilter, setSevFilter] = useState("all");
  var [search, setSearch] = useState("");
  var [assigneeDropOpen, setAssigneeDropOpen] = useState(false);
  var [statusDropOpen, setStatusDropOpen] = useState(false);
  var [kindDropOpen, setKindDropOpen] = useState(false);

  // ME — pretend morgan.lee is the logged-in user
  var ME = "morgan.lee";

  var selectedTask = tasks.find(function(t){ return t.id === selectedId; });
  if (selectedTask) {
    return <StewardshipTaskDetail task={selectedTask} onBack={function(){ setSelectedId(null); }} />;
  }

  function matchesStatus(t) {
    if (statusFilter === "all") return true;
    if (statusFilter === "open") return t.status === "new" || t.status === "in_progress" || t.status === "waiting";
    if (statusFilter === "mine") return t.assignee === ME && (t.status === "new" || t.status === "in_progress");
    if (statusFilter === "overdue") return t.overdue;
    return t.status === statusFilter;
  }

  var visible = tasks.filter(function(t) {
    if (!matchesStatus(t)) return false;
    if (kindFilter !== "all" && t.kind !== kindFilter) return false;
    if (assigneeFilter !== "all" && t.assignee !== assigneeFilter) return false;
    if (sevFilter !== "all" && t.severity !== sevFilter) return false;
    if (search) {
      var hay = (t.id + " " + t.title + " " + t.nodeLabel + " " + t.assignee).toLowerCase();
      if (hay.indexOf(search.toLowerCase()) < 0) return false;
    }
    return true;
  });

  // KPIs
  var openCount = tasks.filter(function(t){ return t.status === "new" || t.status === "in_progress" || t.status === "waiting"; }).length;
  var criticalCount = tasks.filter(function(t){ return t.severity === "critical" && t.status !== "resolved" && t.status !== "dismissed"; }).length;
  var overdueCount = tasks.filter(function(t){ return t.overdue && t.status !== "resolved" && t.status !== "dismissed"; }).length;
  var myCount = tasks.filter(function(t){ return t.assignee === ME && (t.status === "new" || t.status === "in_progress"); }).length;
  var newToday = tasks.filter(function(t){ return /m ago|h ago/.test(t.createdAgo) && t.status === "new"; }).length;
  var resolvedWeek = 47; // synthetic but realistic

  var STATUS_FILTERS = [
    { id:"open", label:"Open",     count: openCount },
    { id:"mine", label:"My queue", count: myCount },
    { id:"overdue", label:"Overdue", count: overdueCount },
    { id:"new", label:"New",       count: tasks.filter(function(t){ return t.status === "new"; }).length },
    { id:"in_progress", label:"In progress", count: tasks.filter(function(t){ return t.status === "in_progress"; }).length },
    { id:"waiting", label:"Waiting", count: tasks.filter(function(t){ return t.status === "waiting"; }).length },
    { id:"resolved", label:"Resolved", count: tasks.filter(function(t){ return t.status === "resolved"; }).length },
    { id:"all",  label:"All",      count: tasks.length }
  ];

  var KIND_FILTERS = [
    { id:"all", label:"All kinds",    count: tasks.length },
    { id:"VAL", label:"Validation",   count: tasks.filter(function(t){ return t.kind === "VAL"; }).length },
    { id:"DQ",  label:"Data quality", count: tasks.filter(function(t){ return t.kind === "DQ"; }).length },
    { id:"MAT", label:"Matching",     count: tasks.filter(function(t){ return t.kind === "MAT"; }).length },
    { id:"SUR", label:"Survivorship", count: tasks.filter(function(t){ return t.kind === "SUR"; }).length },
    { id:"ACC", label:"Access",       count: tasks.filter(function(t){ return t.kind === "ACC"; }).length }
  ];

  function AssigneeChip({ id, size }) {
    if (id === ME) {
      var me = STEWARDS.find(function(s){ return s.id === ME; });
      return <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
        <span style={{ width:size||20, height:size||20, borderRadius:"50%", background:me ? me.color : "var(--ink-3)", color:"#fff", fontFamily:"JetBrains Mono", fontSize:(size||20)*0.45, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{me ? me.initials : "?"}</span>
        <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>me</span>
      </span>;
    }
    var s = STEWARDS.find(function(x){ return x.id === id; });
    if (!s) return <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{id}</span>;
    return <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
      <span style={{ width:size||20, height:size||20, borderRadius:"50%", background:s.color, color:"#fff", fontFamily:"JetBrains Mono", fontSize:(size||20)*0.45, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{s.initials}</span>
      <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>{s.id}</span>
    </span>;
  }

  return (
    <div className="nodes-view">
      {/* HEADER */}
      <div className="nv-head">
        <div className="nv-head-left">

          <div className="nv-title">Open tasks</div>
        </div>
        <div className="nv-head-right">
          <button className="btn-ghost">Export</button>
          <button className="btn-dark">+ Create task</button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:1, background:"var(--line-2)", margin:"0 40px 18px", borderRadius:10, overflow:"hidden", border:"1px solid var(--line-2)" }}>
        {[
          { lbl:"Open",            v: openCount,      color:"var(--ink)" },
          { lbl:"Critical",        v: criticalCount,  color: criticalCount > 0 ? "var(--coral)" : "var(--ink)" },
          { lbl:"Overdue",         v: overdueCount,   color: overdueCount > 0 ? "var(--coral)" : "var(--ink)" },
          { lbl:"My queue",        v: myCount,        color:"var(--blue)" },
          { lbl:"New today",       v: newToday,       color:"var(--ink)" },
          { lbl:"Resolved · 7d",   v: resolvedWeek,   color:"var(--green)" }
        ].map(function(k, i){
          return <div key={i} style={{ background:"var(--panel-2)", padding:"12px 14px" }}>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase" }}>{k.lbl}</div>
            <div style={{ fontFamily:"Instrument Serif", fontSize:26, lineHeight:1, color:k.color, marginTop:5 }}>{typeof k.v === "number" ? k.v.toLocaleString() : k.v}</div>
          </div>;
        })}
      </div>

      {/* TOOLBAR — two primary dropdowns + supporting filters */}
      <div style={{ padding:"0 40px 14px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        {/* STATUS dropdown */}
        {(function(){
          var cur = STATUS_FILTERS.find(function(f){ return f.id === statusFilter; }) || STATUS_FILTERS[0];
          return (
            <div style={{ position:"relative" }}>
              <button onClick={function(){ setStatusDropOpen(function(o){ return !o; }); setKindDropOpen(false); setAssigneeDropOpen(false); }}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", border:"1px solid var(--line)", borderRadius:8, background: statusDropOpen ? "var(--chip)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"var(--ink)", minWidth:220 }}>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase" }}>STATUS</span>
                <span style={{ fontWeight:500 }}>{cur.label}</span>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginLeft:"auto" }}>{cur.count}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ transition:"transform 120ms", transform: statusDropOpen ? "rotate(180deg)" : "none" }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {statusDropOpen && (
                <>
                  <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:99 }} onClick={function(){ setStatusDropOpen(false); }} />
                  <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:100, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:9, boxShadow:"0 8px 28px rgba(0,0,0,0.14)", padding:6, minWidth:260 }}>
                    {STATUS_FILTERS.map(function(f){
                      var isOn = statusFilter === f.id;
                      return (
                        <button key={f.id} onClick={function(){ setStatusFilter(f.id); setStatusDropOpen(false); }}
                          style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 10px", borderRadius:5, border:"none", background: isOn ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", fontSize:12.5, color:"var(--ink)", textAlign:"left", fontWeight: isOn ? 600 : 400 }}
                          onMouseEnter={function(e){ if (!isOn) e.currentTarget.style.background = "var(--bg-canvas)"; }}
                          onMouseLeave={function(e){ if (!isOn) e.currentTarget.style.background = "transparent"; }}>
                          <span>{f.label}</span>
                          <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{f.count}</span>
                          {isOn && <span style={{ fontFamily:"JetBrains Mono", color:"var(--ink)", fontSize:11 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* KIND dropdown */}
        {(function(){
          var cur = KIND_FILTERS.find(function(f){ return f.id === kindFilter; }) || KIND_FILTERS[0];
          var curMeta = cur.id !== "all" ? kindMeta(cur.id) : null;
          return (
            <div style={{ position:"relative" }}>
              <button onClick={function(){ setKindDropOpen(function(o){ return !o; }); setStatusDropOpen(false); setAssigneeDropOpen(false); }}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", border:"1px solid var(--line)", borderRadius:8, background: kindDropOpen ? "var(--chip)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"var(--ink)", minWidth:220 }}>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase" }}>KIND</span>
                {curMeta && <span style={{ width:18, height:18, borderRadius:4, background:curMeta.fill, color:curMeta.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{curMeta.icon}</span>}
                <span style={{ fontWeight:500 }}>{cur.label}</span>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginLeft:"auto" }}>{cur.count}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ transition:"transform 120ms", transform: kindDropOpen ? "rotate(180deg)" : "none" }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {kindDropOpen && (
                <>
                  <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:99 }} onClick={function(){ setKindDropOpen(false); }} />
                  <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:100, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:9, boxShadow:"0 8px 28px rgba(0,0,0,0.14)", padding:6, minWidth:260 }}>
                    {KIND_FILTERS.map(function(f){
                      var isOn = kindFilter === f.id;
                      var m = f.id !== "all" ? kindMeta(f.id) : null;
                      return (
                        <button key={f.id} onClick={function(){ setKindFilter(f.id); setKindDropOpen(false); }}
                          style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 10px", borderRadius:5, border:"none", background: isOn ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", fontSize:12.5, color:"var(--ink)", textAlign:"left", fontWeight: isOn ? 600 : 400 }}
                          onMouseEnter={function(e){ if (!isOn) e.currentTarget.style.background = "var(--bg-canvas)"; }}
                          onMouseLeave={function(e){ if (!isOn) e.currentTarget.style.background = "transparent"; }}>
                          {m ? <span style={{ width:18, height:18, borderRadius:4, background:m.fill, color:m.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{m.icon}</span> : <span style={{ width:18, flexShrink:0 }} />}
                          <span>{f.label}</span>
                          <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{f.count}</span>
                          {isOn && <span style={{ fontFamily:"JetBrains Mono", color:"var(--ink)", fontSize:11 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* Supporting filters on the right */}
        <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
          <select value={sevFilter} onChange={function(e){ setSevFilter(e.target.value); }} style={{ border:"1px solid var(--line)", borderRadius:7, padding:"6px 10px", fontFamily:"inherit", fontSize:12, background:"var(--panel)", color:"var(--ink)", cursor:"pointer" }}>
            <option value="all">All severities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <div style={{ position:"relative" }}>
            <button onClick={function(){ setAssigneeDropOpen(function(o){ return !o; }); setStatusDropOpen(false); setKindDropOpen(false); }}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", border:"1px solid var(--line)", borderRadius:7, background:"var(--panel)", cursor:"pointer", fontFamily:"inherit", fontSize:12, color:"var(--ink)" }}>
              {assigneeFilter === "all" ? "All assignees" : <AssigneeChip id={assigneeFilter} size={16} />}
              <span style={{ color:"var(--ink-3)", marginLeft:2 }}>▾</span>
            </button>
            {assigneeDropOpen && (
              <>
                <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:99 }} onClick={function(){ setAssigneeDropOpen(false); }} />
                <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:100, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:9, boxShadow:"0 8px 28px rgba(0,0,0,0.14)", padding:6, minWidth:220 }}>
                  <button onClick={function(){ setAssigneeFilter("all"); setAssigneeDropOpen(false); }} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 8px", borderRadius:5, border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", fontSize:12.5, color:"var(--ink)", textAlign:"left" }}>All assignees <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>{tasks.length}</span></button>
                  <div style={{ height:1, background:"var(--line-2)", margin:"4px 0" }} />
                  {STEWARDS.map(function(s){
                    var n = tasks.filter(function(t){ return t.assignee === s.id; }).length;
                    return <button key={s.id} onClick={function(){ setAssigneeFilter(s.id); setAssigneeDropOpen(false); }} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 8px", borderRadius:5, border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", fontSize:12.5, color:"var(--ink)", textAlign:"left" }}>
                      <span style={{ width:18, height:18, borderRadius:"50%", background:s.color, color:"#fff", fontFamily:"JetBrains Mono", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{s.initials}</span>
                      <span>{s.id}</span>
                      <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>{n}</span>
                    </button>;
                  })}
                </div>
              </>
            )}
          </div>
          <div style={{ position:"relative" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--ink-3)", pointerEvents:"none" }}>
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={function(e){ setSearch(e.target.value); }} placeholder="Search tasks…" style={{ padding:"6px 10px 6px 30px", border:"1px solid var(--line)", borderRadius:7, fontFamily:"inherit", fontSize:12, background:"var(--panel)", color:"var(--ink)", outline:"none", width:200 }} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="nv-table">
        <div style={{ display:"grid", gridTemplateColumns:"86px 64px 70px 1fr 150px 130px 80px 100px", gap:12, padding:"10px 18px", background:"var(--panel-2)", borderBottom:"1px solid var(--line)", fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"0.6px", textTransform:"uppercase", alignItems:"center" }}>
          <div>Task</div><div>Kind</div><div>Sev</div><div>What needs decision</div><div>Record</div><div>Assignee</div><div style={{ textAlign:"right" }}>SLA</div><div>Status</div>
        </div>
        {visible.length === 0 && (
          <div style={{ padding:"50px 18px", textAlign:"center", color:"var(--ink-3)", fontSize:13 }}>
            No tasks match the current filters.
          </div>
        )}
        {visible.map(function(t, i) {
          var km = kindMeta(t.kind);
          var sm = sevMeta(t.severity);
          var stm = statusMeta(t.status);
          return (
            <div key={t.id}
              onClick={function(){ setSelectedId(t.id); }}
              style={{ display:"grid", gridTemplateColumns:"86px 64px 70px 1fr 150px 130px 80px 100px", gap:12, padding:"13px 18px", borderBottom: i < visible.length-1 ? "1px solid var(--line-2)" : "none", cursor:"pointer", alignItems:"center", transition:"background 80ms" }}
              onMouseEnter={function(e){ e.currentTarget.style.background = "var(--panel-2)"; }}
              onMouseLeave={function(e){ e.currentTarget.style.background = "transparent"; }}>
              <code style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--blue)" }}>{t.id}</code>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:18, height:18, borderRadius:4, background:km.fill, color:km.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{km.icon}</span>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, fontWeight:700, color:km.color, letterSpacing:"0.5px" }}>{t.kind}</span>
              </div>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"2px 6px", borderRadius:3, background:sm.fill, color:sm.color, fontWeight:700, letterSpacing:"0.4px", display:"inline-block", textAlign:"center" }}>{sm.label}</span>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12.5, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:2 }}>{t.nodeLabel + " · " + t.createdAgo}</div>
              </div>
              <code style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color: t.recordId ? "var(--blue)" : "var(--ink-4)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.recordId || (t.scope ? "—" : "pipeline")}</code>
              <AssigneeChip id={t.assignee} size={18} />
              <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color: t.overdue ? "var(--coral)" : "var(--ink-3)", textAlign:"right", fontWeight: t.overdue ? 600 : 400 }}>{t.slaRemaining}</span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontFamily:"JetBrains Mono", fontSize:11, color:stm.color, fontWeight:500 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:stm.color }} />
                {stm.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StewardshipTaskDetail({ task, onBack }) {
  var [commentInput, setCommentInput] = useState("");
  var [comments, setComments] = useState([
    { who:"morgan.lee", when:"2h ago", text:"Pulled the raw rows from quarantine — looks like a HubSpot import issue, not a real data problem. Suggesting we widen the enum." },
    { who:"ramin.k",    when:"45m ago", text:"+1, I'll loop in the HubSpot integration team to confirm before we change the schema." }
  ]);
  var km = kindMeta(task.kind);
  var sm = sevMeta(task.severity);
  var stm = statusMeta(task.status);
  var node = NODES.find(function(n){ return n.id === task.nodeId; });
  var assigneeDef = STEWARDS.find(function(s){ return s.id === task.assignee; });

  // For non-pipeline tasks, fetch the actual record so we can show its context
  var recordCtx = null;
  if (task.recordId && node) {
    recordCtx = buildRecordFromId(task.recordId, node);
  }
  var recordCtxB = null;
  if (task.recordIdB && node) {
    recordCtxB = buildRecordFromId(task.recordIdB, node);
  }
  var recordProps = node ? generateProps(node) : [];

  // Suggested actions per kind
  var SUGGESTIONS = {
    VAL: [
      { lbl:"Fix at source",         desc:"Open the upstream system and correct the bad values" },
      { lbl:"Quarantine & continue", desc:"Hold the bad rows; let valid rows flow through" },
      { lbl:"Update the rule",       desc:"Widen the constraint if the data is actually valid" },
      { lbl:"Bulk override",         desc:"Apply a default value to all affected records" }
    ],
    DQ: [
      { lbl:"Investigate pipeline",  desc:"Check the source ingestion job for delays or failures" },
      { lbl:"Raise the SLO",         desc:"Adjust the target if the new latency is acceptable" },
      { lbl:"Escalate to oncall",    desc:"Page the data platform team" }
    ],
    MAT: [
      { lbl:"Merge into canonical",  desc:"Combine the records into a single golden record" },
      { lbl:"Link with :IS_SAME_AS", desc:"Keep both records, add an identity edge" },
      { lbl:"Reject — not a match",  desc:"Mark as distinct and exclude from future matches" }
    ],
    SUR: [
      { lbl:"Accept winner",         desc:"Confirm the strategy's chosen value" },
      { lbl:"Manual override",       desc:"Set the value yourself; bypass the strategy" },
      { lbl:"Update source priority", desc:"Re-rank sources for this property" }
    ],
    ACC: [
      { lbl:"Grant role",            desc:"Approve the role assignment for the requester" },
      { lbl:"Deny & log",            desc:"Confirm denial; surface to security review" },
      { lbl:"Escalate to security",  desc:"Refer to security@ for investigation" }
    ]
  };
  var suggestions = SUGGESTIONS[task.kind] || [];

  function postComment() {
    if (!commentInput.trim()) return;
    setComments(function(arr){ return arr.concat([{ who: "me", when: "just now", text: commentInput.trim() }]); });
    setCommentInput("");
  }

  return (
    <div className="detail-view" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="detail-head" style={{ flexShrink:0 }}>
        <div className="detail-crumb">
          <button className="crumb-back" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Stewardship
          </button>
          <span className="crumb-sep">/</span>
          <span className="crumb-cur" style={{ fontFamily:"JetBrains Mono", fontSize:10 }}>{task.id}</span>
        </div>
        <div className="detail-title-row">
          <div className="detail-title-left">
            <span style={{ width:38, height:38, borderRadius:9, background:km.fill, color:km.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:700, flexShrink:0 }}>{km.icon}</span>
            <div style={{ minWidth:0 }}>
              <div className="detail-title-name" style={{ fontSize:20, fontFamily:"Geist, system-ui", lineHeight:1.3 }}>{task.title}</div>
              <div style={{ display:"flex", gap:10, alignItems:"center", marginTop:5, flexWrap:"wrap" }}>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 8px", borderRadius:4, background:km.fill, color:km.color, fontWeight:700, letterSpacing:"0.5px" }}>{km.long.toUpperCase()}</span>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 8px", borderRadius:4, background:sm.fill, color:sm.color, fontWeight:700, letterSpacing:"0.5px" }}>{sm.label}</span>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontFamily:"JetBrains Mono", fontSize:10.5, color:stm.color, fontWeight:500 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:stm.color }} />{stm.label}
                </span>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)" }}>{"Opened " + task.createdAgo}</span>
                {task.overdue && <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--coral)", fontWeight:600 }}>{"SLA " + task.slaRemaining + " overdue"}</span>}
              </div>
            </div>
          </div>
          <div className="detail-title-right">
            <button className="btn-ghost">Reassign</button>
            <button className="btn-ghost" style={{ color:"var(--ink-3)" }}>Dismiss</button>
            <button className="btn-dark">Resolve task</button>
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div style={{ display:"grid", gridTemplateColumns:"minmax(0, 1.7fr) minmax(280px, 1fr)", gap:18 }}>
          {/* LEFT */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div className="card">
              <div className="card-head">What happened</div>
              <div className="card-body" style={{ fontSize:13, color:"var(--ink-2)", lineHeight:1.6 }}>{task.summary}</div>
            </div>

            <div className="card">
              <div className="card-head card-head-row">
                <span>Triggering rule <span className="card-head-sub">{task.ruleId}</span></span>
                <button className="btn-ghost" style={{ fontSize:11.5 }}>Open rule →</button>
              </div>
              <div className="card-body">
                <div style={{ marginBottom:10, fontSize:13, color:"var(--ink)" }}>{task.ruleTitle}</div>
                <pre style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:km.color, margin:0, padding:"10px 12px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6, whiteSpace:"pre-wrap" }}>{task.ruleExpr}</pre>
              </div>
            </div>

            {/* RECORD CONTEXT — for record-level tasks (VAL / ACC / SUR / MAT) */}
            {recordCtx && task.kind !== "MAT" && (
              <div className="card">
                <div className="card-head card-head-row">
                  <span>The record <span className="card-head-sub"><code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--blue)" }}>{task.recordId}</code> · {task.nodeLabel}</span></span>
                  <button className="btn-ghost" style={{ fontSize:11.5 }}>Open record →</button>
                </div>
                {/* The failing field gets its own callout */}
                {task.fieldName && (
                  <div style={{ padding:"14px 18px", background: task.kind === "VAL" ? "var(--coral-fill)" : task.kind === "SUR" ? "var(--gold-fill)" : task.kind === "ACC" ? "var(--chip)" : "var(--panel-2)", borderBottom:"1px solid var(--line-2)" }}>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color: task.kind === "VAL" ? "var(--coral)" : task.kind === "SUR" ? "var(--gold)" : "var(--ink-3)", textTransform:"uppercase", marginBottom:6 }}>
                      {task.kind === "VAL" ? "FAILING FIELD" : task.kind === "SUR" ? "FIELD IN CONFLICT" : task.kind === "ACC" ? "DENIED FIELD" : "FIELD"}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"160px 1fr", gap:"6px 14px", alignItems:"baseline" }}>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:13, fontWeight:600, color:"var(--ink)" }}>{task.fieldName}</code>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{task.fieldType || ""}</span>
                      {task.kind === "VAL" && (
                        <>
                          <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>CURRENT VALUE</span>
                          <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--coral)", fontWeight:600 }}>{task.recordValue == null ? "null" : "'" + task.recordValue + "'"}</code>
                          <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>EXPECTED</span>
                          <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink-2)" }}>{task.ruleExpr}</code>
                        </>
                      )}
                      {task.kind === "SUR" && task.conflictSources && (
                        <>
                          <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10, alignSelf:"start" }}>SOURCES DISAGREE</span>
                          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                            {task.conflictSources.map(function(src, i){
                              var isWinner = i === 0;
                              return <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 8px", borderRadius:5, background: isWinner ? "var(--green-fill)" : "transparent", border: isWinner ? "1px solid var(--green-soft)" : "1px solid var(--line-2)" }}>
                                <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)", flex:"0 0 140px" }}>{src}</span>
                                <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color: isWinner ? "var(--green)" : "var(--ink)", fontWeight: isWinner ? 600 : 400 }}>{String(task.conflictValues[i])}</code>
                                {isWinner && <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:9, color:"var(--green)", fontWeight:700 }}>STRATEGY PICK</span>}
                              </div>;
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {/* Other context properties on the same record */}
                <div style={{ padding:"4px 0" }}>
                  <div style={{ padding:"8px 18px", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>OTHER PROPERTIES ON THIS RECORD</div>
                  {recordProps.filter(function(p){ return p.name !== task.fieldName; }).slice(0, 6).map(function(p, i, arr) {
                    return <div key={p.name} style={{ display:"grid", gridTemplateColumns:"160px 1fr 80px", gap:14, padding:"7px 18px", borderTop:"1px solid var(--line-2)", alignItems:"center" }}>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>{p.name}</code>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink)" }}>{String(recordCtx[p.name])}</code>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", textAlign:"right" }}>{p.type}</span>
                    </div>;
                  })}
                </div>
              </div>
            )}

            {/* MAT TASKS — pair of records to compare */}
            {recordCtx && recordCtxB && task.kind === "MAT" && (
              <div className="card">
                <div className="card-head">Candidate pair <span className="card-head-sub">match score {task.matchScore}</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid var(--line-2)" }}>
                  {[{rec:recordCtx, lbl:"RECORD A"},{rec:recordCtxB, lbl:"RECORD B"}].map(function(side, si){
                    return <div key={si} style={{ padding:"14px 18px", borderRight: si === 0 ? "1px solid var(--line-2)" : "none" }}>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>{side.lbl}</div>
                      <code style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--blue)", fontWeight:600, display:"block", marginBottom:8 }}>{side.rec.id}</code>
                      <div style={{ display:"grid", gridTemplateColumns:"100px 1fr", gap:"4px 10px", fontFamily:"JetBrains Mono", fontSize:11 }}>
                        {recordProps.slice(0, 5).map(function(p){
                          return <React.Fragment key={p.name}>
                            <span style={{ color:"var(--ink-3)" }}>{p.name}</span>
                            <span style={{ color:"var(--ink)" }}>{String(side.rec[p.name]).slice(0, 30)}</span>
                          </React.Fragment>;
                        })}
                      </div>
                    </div>;
                  })}
                </div>
              </div>
            )}

            {/* PIPELINE TASKS — no record */}
            {!task.recordId && task.scope && (
              <div className="card">
                <div className="card-head">Scope</div>
                <div className="card-body" style={{ fontFamily:"JetBrains Mono", fontSize:12, color:"var(--ink-2)" }}>{task.scope}</div>
              </div>
            )}

            <div className="card">
              <div className="card-head">Discussion <span className="card-head-sub">{comments.length} comments</span></div>
              <div>
                {comments.map(function(c, i) {
                  var who = STEWARDS.find(function(s){ return s.id === c.who; });
                  return <div key={i} style={{ display:"flex", gap:10, padding:"12px 18px", borderBottom: i < comments.length-1 ? "1px solid var(--line-2)" : "none" }}>
                    <span style={{ width:28, height:28, borderRadius:"50%", background: who ? who.color : "var(--ink-3)", color:"#fff", fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{who ? who.initials : c.who.slice(0,2).toUpperCase()}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:3 }}>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink)", fontWeight:600 }}>{c.who}</span>
                        <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{c.when}</span>
                      </div>
                      <div style={{ fontSize:12.5, color:"var(--ink-2)", lineHeight:1.55 }}>{c.text}</div>
                    </div>
                  </div>;
                })}
                <div style={{ padding:"12px 18px", display:"flex", gap:8 }}>
                  <input value={commentInput} onChange={function(e){ setCommentInput(e.target.value); }}
                    onKeyDown={function(e){ if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                    placeholder="Add a comment… (⌘↵ to post)"
                    style={{ flex:1, padding:"8px 12px", border:"1px solid var(--line)", borderRadius:7, fontFamily:"inherit", fontSize:13, background:"var(--bg-canvas)", color:"var(--ink)", outline:"none" }} />
                  <button className="btn-dark" onClick={postComment} disabled={!commentInput.trim()} style={{ opacity: commentInput.trim() ? 1 : 0.4 }}>Post</button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {/* Take Action — compact card above Assignment */}
            <div className="card" style={{ border:"1px solid " + km.color, background: km.fill, overflow:"hidden" }}>
              <div className="card-head" style={{ borderBottom:"1px solid " + km.color + "40", background:"transparent" }}>
                <span style={{ color:km.color, fontWeight:700, letterSpacing:"0.4px", fontFamily:"JetBrains Mono", fontSize:11, textTransform:"uppercase" }}>Take action</span>
                <span className="card-head-sub" style={{ color:"var(--ink-2)" }}>{suggestions.length + " options"}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column" }}>
                {suggestions.map(function(s, i, arr) {
                  var isPrimary = i === 0;
                  return (
                    <button key={i}
                      style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", border:"none", borderBottom: i < arr.length-1 ? "1px solid " + km.color + "26" : "none", background: isPrimary ? km.color : "transparent", color: isPrimary ? "#fff" : "var(--ink)", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"background 80ms" }}
                      onMouseEnter={function(e){ if (!isPrimary) e.currentTarget.style.background = "var(--bg-canvas)"; }}
                      onMouseLeave={function(e){ if (!isPrimary) e.currentTarget.style.background = "transparent"; }}>
                      <span style={{ width:22, height:22, borderRadius:"50%", background: isPrimary ? "rgba(255,255,255,0.22)" : km.fill, color: isPrimary ? "#fff" : km.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0, marginTop:1 }}>→</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:13, fontWeight:600, color: isPrimary ? "#fff" : "var(--ink)" }}>{s.lbl}</span>
                          {isPrimary && <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, letterSpacing:"0.5px", color:"rgba(255,255,255,0.85)", fontWeight:700, padding:"1px 5px", borderRadius:3, background:"rgba(255,255,255,0.18)" }}>RECOMMENDED</span>}
                        </div>
                        <div style={{ fontSize:11, color: isPrimary ? "rgba(255,255,255,0.85)" : "var(--ink-3)", lineHeight:1.45, marginTop:3 }}>{s.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-head">Assignment</div>
              <div className="card-body" style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:6 }}>ASSIGNEE</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ width:34, height:34, borderRadius:"50%", background: assigneeDef ? assigneeDef.color : "var(--ink-3)", color:"#fff", fontFamily:"JetBrains Mono", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{assigneeDef ? assigneeDef.initials : "?"}</span>
                    <div>
                      <div style={{ fontSize:13.5, color:"var(--ink)" }}>{task.assignee}</div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>{assigneeDef ? assigneeDef.team : ""}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"100px 1fr", gap:"7px 12px", fontSize:12, paddingTop:10, borderTop:"1px solid var(--line-2)" }}>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>STATUS</span>
                  <span style={{ color:stm.color, fontFamily:"JetBrains Mono", fontWeight:600 }}>{stm.label}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>SEVERITY</span>
                  <span style={{ color:sm.color, fontFamily:"JetBrains Mono", fontWeight:700 }}>{sm.label}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>OPENED</span>
                  <span style={{ color:"var(--ink-2)" }}>{task.createdAgo}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>SLA REMAINING</span>
                  <span style={{ color: task.overdue ? "var(--coral)" : "var(--ink-2)", fontFamily:"JetBrains Mono", fontWeight:600 }}>{task.slaRemaining}{task.overdue && " (overdue)"}</span>
                  <span style={{ color:"var(--ink-3)", fontFamily:"JetBrains Mono", fontSize:10 }}>SCOPE</span>
                  <span style={{ color:"var(--ink-2)" }}>{task.recordId ? (task.nodeLabel + " · " + task.recordId) : task.scope ? task.scope : task.nodeLabel}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">Activity</div>
              <div>
                {[
                  { t:"just now", who:"system", what:"SLA timer ticking", color:"var(--ink-4)" },
                  { t:"2h ago",   who:"morgan.lee", what:"added a comment", color:"var(--blue)" },
                  { t:"5h ago",   who:"system", what:"assigned to " + task.assignee, color:"var(--ink-4)" },
                  { t:task.createdAgo, who:"runtime", what:"detected by " + (task.ruleTitle || task.ruleId), color:km.color }
                ].map(function(a, i) {
                  return <div key={i} style={{ display:"grid", gridTemplateColumns:"68px 10px 1fr", gap:8, padding:"10px 16px", borderBottom: i < 3 ? "1px solid var(--line-2)" : "none", alignItems:"center" }}>
                    <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{a.t}</span>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:a.color, justifySelf:"center" }} />
                    <div style={{ fontSize:11.5, color:"var(--ink-2)" }}>
                      <span style={{ fontFamily:"JetBrains Mono", color:"var(--ink)", fontWeight:600 }}>{a.who}</span>{" " + a.what}
                    </div>
                  </div>;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NodesView({ onSelect, onSwitchToCanvas, onAddNode }) {
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

          <div className="nv-title">Node catalog</div>
        </div>
        <div className="nv-head-right">
          <button className="btn-ghost">Bulk export</button>
          <button className="btn-ghost" onClick={onSwitchToCanvas}>Switch to canvas →</button>
          <button className="btn-dark" onClick={onAddNode}>+ New node type</button>
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

// ═══════════════════════════════════════════════════════════════════════════════
// ADD NODE FLOW — comprehensive new-node-type creation modal
//
// 6 steps:
//   1. Basics    — name, category, description, shape
//   2. Properties — manual / upload spreadsheet / parse sample doc / template
//   3. Identity  — primary key + natural keys + dedup strategy
//   4. Relations — pre-declare expected edges to other node types
//   5. Governance — classification, compliance, owner, retention
//   6. Review    — summary + activate or save as draft
// ═══════════════════════════════════════════════════════════════════════════════

var NODE_CATEGORIES_CONFIG = [
  { id:"core",    label:"Core entity",    color:"var(--blue)",   fill:"var(--blue-fill)",   desc:"A first-class business object that other entities relate to (Account, Customer, Product)." },
  { id:"support", label:"Support",        color:"var(--green)",  fill:"var(--green-fill)",  desc:"Operational records that support the core (Ticket, Interaction, Task, Note)." },
  { id:"derived", label:"Derived",        color:"var(--purple)", fill:"var(--purple-fill)", desc:"Computed or analytical entities (Account Health, Forecast, Risk Score)." },
  { id:"agent",   label:"Agent",          color:"var(--gold)",   fill:"var(--gold-fill)",   desc:"AI agent that emits records or judgments (Customer Health agent, Churn Forecaster)." },
  { id:"source",  label:"Source",         color:"var(--coral)",  fill:"var(--coral-fill)",  desc:"A system of record exposed as a node (Salesforce CRM, Snowflake DW)." }
];

// Pre-built property templates by node archetype
var NODE_TEMPLATES = [
  {
    id:"contract",     name:"Contract",     icon:"CT", brief:"Legal agreement between parties",
    category:"core",
    properties:[
      { name:"contract_id",      type:"uuid",      required:true,  indexed:true,  pii:false, pk:true },
      { name:"title",            type:"string",    required:true,  indexed:true,  pii:false },
      { name:"parties",          type:"string[]",  required:true,  indexed:false, pii:false },
      { name:"effective_date",   type:"date",      required:true,  indexed:true,  pii:false },
      { name:"termination_date", type:"date",      required:false, indexed:true,  pii:false },
      { name:"total_value_usd",  type:"decimal",   required:false, indexed:false, pii:false },
      { name:"renewal_clause",   type:"bool",      required:false, indexed:false, pii:false },
      { name:"jurisdiction",     type:"string",    required:false, indexed:false, pii:false },
      { name:"status",           type:"enum",      required:true,  indexed:true,  pii:false }
    ]
  },
  {
    id:"customer",     name:"Customer",     icon:"CU", brief:"End user or buyer record",
    category:"core",
    properties:[
      { name:"customer_id",  type:"uuid",   required:true,  indexed:true,  pii:false, pk:true },
      { name:"first_name",   type:"string", required:true,  indexed:true,  pii:true },
      { name:"last_name",    type:"string", required:true,  indexed:true,  pii:true },
      { name:"email",        type:"string", required:true,  indexed:true,  pii:true },
      { name:"phone",        type:"string", required:false, indexed:false, pii:true },
      { name:"created_at",   type:"timestamp", required:true, indexed:true, pii:false },
      { name:"lifetime_value", type:"decimal", required:false, indexed:false, pii:false }
    ]
  },
  {
    id:"ticket",       name:"Ticket",       icon:"TK", brief:"Support request or work item",
    category:"support",
    properties:[
      { name:"ticket_id",  type:"uuid",      required:true,  indexed:true,  pii:false, pk:true },
      { name:"subject",    type:"string",    required:true,  indexed:false, pii:false },
      { name:"description",type:"string",    required:false, indexed:false, pii:false },
      { name:"priority",   type:"enum",      required:true,  indexed:true,  pii:false },
      { name:"status",     type:"enum",      required:true,  indexed:true,  pii:false },
      { name:"created_at", type:"timestamp", required:true,  indexed:true,  pii:false },
      { name:"resolved_at",type:"timestamp", required:false, indexed:false, pii:false },
      { name:"assignee_id",type:"string",    required:false, indexed:true,  pii:false }
    ]
  },
  {
    id:"invoice",      name:"Invoice",      icon:"IN", brief:"Billing document",
    category:"core",
    properties:[
      { name:"invoice_id",  type:"uuid",      required:true,  indexed:true,  pii:false, pk:true },
      { name:"invoice_number", type:"string", required:true,  indexed:true,  pii:false },
      { name:"amount_usd",  type:"decimal",   required:true,  indexed:false, pii:false },
      { name:"currency",    type:"enum",      required:true,  indexed:false, pii:false },
      { name:"issued_at",   type:"date",      required:true,  indexed:true,  pii:false },
      { name:"due_date",    type:"date",      required:true,  indexed:true,  pii:false },
      { name:"paid_at",     type:"timestamp", required:false, indexed:false, pii:false },
      { name:"status",      type:"enum",      required:true,  indexed:true,  pii:false }
    ]
  },
  {
    id:"product",      name:"Product",      icon:"PR", brief:"Sellable item or SKU",
    category:"core",
    properties:[
      { name:"product_id", type:"uuid",    required:true,  indexed:true,  pii:false, pk:true },
      { name:"sku",        type:"string",  required:true,  indexed:true,  pii:false },
      { name:"name",       type:"string",  required:true,  indexed:true,  pii:false },
      { name:"category",   type:"enum",    required:true,  indexed:true,  pii:false },
      { name:"price_usd",  type:"decimal", required:true,  indexed:false, pii:false },
      { name:"in_stock",   type:"bool",    required:true,  indexed:false, pii:false }
    ]
  },
  {
    id:"employee",     name:"Employee",     icon:"EM", brief:"Workforce member",
    category:"core",
    properties:[
      { name:"employee_id",   type:"uuid",      required:true,  indexed:true,  pii:false, pk:true },
      { name:"first_name",    type:"string",    required:true,  indexed:true,  pii:true },
      { name:"last_name",     type:"string",    required:true,  indexed:true,  pii:true },
      { name:"email",         type:"string",    required:true,  indexed:true,  pii:true },
      { name:"manager_id",    type:"string",    required:false, indexed:true,  pii:false },
      { name:"department",    type:"enum",      required:true,  indexed:true,  pii:false },
      { name:"hire_date",     type:"date",      required:true,  indexed:true,  pii:false }
    ]
  },
  {
    id:"opportunity",  name:"Opportunity",  icon:"OP", brief:"Sales pipeline deal",
    category:"core",
    properties:[
      { name:"opportunity_id", type:"uuid",      required:true,  indexed:true,  pii:false, pk:true },
      { name:"name",           type:"string",    required:true,  indexed:true,  pii:false },
      { name:"stage",          type:"enum",      required:true,  indexed:true,  pii:false },
      { name:"amount_usd",     type:"decimal",   required:false, indexed:false, pii:false },
      { name:"close_date",     type:"date",      required:false, indexed:true,  pii:false },
      { name:"probability",    type:"decimal",   required:false, indexed:false, pii:false },
      { name:"owner_id",       type:"string",    required:true,  indexed:true,  pii:false }
    ]
  },
  {
    id:"interaction",  name:"Interaction",  icon:"IX", brief:"Customer touchpoint event",
    category:"support",
    properties:[
      { name:"interaction_id", type:"uuid",      required:true,  indexed:true,  pii:false, pk:true },
      { name:"channel",        type:"enum",      required:true,  indexed:true,  pii:false },
      { name:"occurred_at",    type:"timestamp", required:true,  indexed:true,  pii:false },
      { name:"duration_sec",   type:"decimal",   required:false, indexed:false, pii:false },
      { name:"summary",        type:"string",    required:false, indexed:false, pii:false },
      { name:"sentiment",      type:"enum",      required:false, indexed:false, pii:false }
    ]
  }
];

function AddNodeFlow({ onClose }) {
  var [step, setStep] = useState(1);

  // Step 1
  var [name, setName] = useState("");
  var [category, setCategory] = useState("core");
  var [description, setDescription] = useState("");
  var [shape, setShape] = useState("entity"); // entity / agent / source

  // Step 2 - properties + creation mode
  var [propMode, setPropMode] = useState("template"); // manual / spreadsheet / sample / template
  var [properties, setProperties] = useState([]);
  var [selectedTemplate, setSelectedTemplate] = useState(null);
  var [uploadedFileName, setUploadedFileName] = useState("");
  var [parseStatus, setParseStatus] = useState("idle"); // idle / parsing / done
  var [parseModel, setParseModel] = useState("claude-3.5-sonnet");

  // Step 3 - identity
  var [pkField, setPkField] = useState("");
  var [naturalKeys, setNaturalKeys] = useState([]);
  var [dedupStrategy, setDedupStrategy] = useState("on_natural_key"); // none / on_pk / on_natural_key / probabilistic

  // Step 4 - relations
  var [relations, setRelations] = useState([]);

  // Step 5 - governance
  var CURRENT_USER = { id:"morgan.lee", label:"Morgan Lee", initials:"ML", team:"data-platform" };
  var [owner, setOwner] = useState(CURRENT_USER.id); // defaults to current user
  var [retentionPolicy, setRetentionPolicy] = useState("7y");
  var [complianceTags, setComplianceTags] = useState(["SOC2"]);
  var [tagsDropOpen, setTagsDropOpen] = useState(false);

  // Permissions — read / write / admin, each with users + groups
  var [permsRead, setPermsRead]   = useState([{ kind:"group", id:"everyone", label:"Everyone in org" }]);
  var [permsWrite, setPermsWrite] = useState([{ kind:"group", id:"data-platform", label:"data-platform team" }]);
  var [permsAdmin, setPermsAdmin] = useState([{ kind:"user",  id:CURRENT_USER.id, label:CURRENT_USER.label + " (you)" }]);
  var [permPickerOpen, setPermPickerOpen] = useState(null); // "read" | "write" | "admin" | null

  var DIRECTORY = [
    { kind:"group", id:"everyone",        label:"Everyone in org" },
    { kind:"group", id:"data-platform",   label:"data-platform team" },
    { kind:"group", id:"customer-ops",    label:"customer-ops team" },
    { kind:"group", id:"finance-ops",     label:"finance-ops team" },
    { kind:"group", id:"legal-ops",       label:"legal-ops team" },
    { kind:"group", id:"engineering",     label:"engineering team" },
    { kind:"group", id:"security",        label:"security team" },
    { kind:"group", id:"data-stewards",   label:"data-stewards group" },
    { kind:"user",  id:"morgan.lee",      label:"Morgan Lee" },
    { kind:"user",  id:"ramin.k",         label:"Ramin K" },
    { kind:"user",  id:"jordan.s",        label:"Jordan S" },
    { kind:"user",  id:"alex.r",          label:"Alex R" },
    { kind:"user",  id:"casey.m",         label:"Casey M" },
    { kind:"user",  id:"taylor.j",        label:"Taylor J" }
  ];

  // Step 6
  var [activate, setActivate] = useState(true);

  var catDef = NODE_CATEGORIES_CONFIG.find(function(c){ return c.id === category; });
  var nameOk = name.trim().length >= 2 && /^[A-Z]/.test(name.trim());

  function canContinue() {
    if (step === 1) return nameOk;
    if (step === 2) return properties.length >= 1;
    if (step === 3) return !!pkField;
    return true;
  }

  function addManualProp() {
    setProperties(function(arr){ return arr.concat([{ name:"new_field", type:"string", required:false, indexed:false, pii:false }]); });
  }
  function removeProp(idx) {
    setProperties(function(arr){
      var p = arr[idx];
      if (p && pkField === p.name) setPkField("");
      return arr.filter(function(_, i){ return i !== idx; });
    });
  }
  function updateProp(idx, key, val) {
    setProperties(function(arr){ return arr.map(function(p, i){
      if (i !== idx) return p;
      var n = {}; Object.keys(p).forEach(function(k){ n[k] = p[k]; });
      n[key] = val;
      if (key === "pk" && val === true) { setPkField(p.name); }
      return n;
    }); });
  }

  function applyTemplate(tplId) {
    var t = NODE_TEMPLATES.find(function(x){ return x.id === tplId; });
    if (!t) return;
    setSelectedTemplate(tplId);
    setProperties(t.properties.map(function(p){ return Object.assign({}, p); }));
    if (!name) setName(t.name);
    var pk = t.properties.find(function(p){ return p.pk; });
    if (pk) setPkField(pk.name);
  }

  function simulateUpload() {
    setUploadedFileName("customers_2025.xlsx");
    setProperties([
      { name:"id",            type:"uuid",      required:true,  indexed:true,  pii:false, pk:true,  detectedFrom:"col A" },
      { name:"name",          type:"string",    required:true,  indexed:true,  pii:true,  detectedFrom:"col B" },
      { name:"email",         type:"string",    required:true,  indexed:true,  pii:true,  detectedFrom:"col C" },
      { name:"signup_date",   type:"date",      required:true,  indexed:true,  pii:false, detectedFrom:"col D" },
      { name:"plan",          type:"enum",      required:true,  indexed:true,  pii:false, detectedFrom:"col E" },
      { name:"mrr_usd",       type:"decimal",   required:false, indexed:false, pii:false, detectedFrom:"col F" },
      { name:"last_login",    type:"timestamp", required:false, indexed:false, pii:false, detectedFrom:"col G" }
    ]);
    setPkField("id");
  }

  function simulateParse() {
    setUploadedFileName("acme_msa_sample.pdf");
    setParseStatus("parsing");
    setTimeout(function(){
      setProperties([
        { name:"contract_id",     type:"uuid",     required:true,  indexed:true,  pii:false, pk:true,  inferred:true, confidence:0.99 },
        { name:"counterparty",    type:"string",   required:true,  indexed:true,  pii:false, inferred:true, confidence:0.96 },
        { name:"effective_date",  type:"date",     required:true,  indexed:true,  pii:false, inferred:true, confidence:0.94 },
        { name:"term_months",     type:"decimal",  required:true,  indexed:false, pii:false, inferred:true, confidence:0.91 },
        { name:"total_value_usd", type:"decimal",  required:true,  indexed:false, pii:false, inferred:true, confidence:0.97 },
        { name:"auto_renews",     type:"bool",     required:false, indexed:false, pii:false, inferred:true, confidence:0.88 },
        { name:"governing_law",   type:"string",   required:false, indexed:false, pii:false, inferred:true, confidence:0.83 },
        { name:"signed_by",       type:"string[]", required:true,  indexed:false, pii:true,  inferred:true, confidence:0.86 }
      ]);
      setPkField("contract_id");
      setParseStatus("done");
    }, 600);
  }

  function addRelation() {
    var defaultTarget = NODES.filter(function(n){ return n.type !== "source"; })[0];
    setRelations(function(arr){ return arr.concat([{ label:"RELATES_TO", target: defaultTarget ? defaultTarget.id : "", cardinality:"1:N", kind:"direct" }]); });
  }
  function updateRelation(idx, key, val) {
    setRelations(function(arr){ return arr.map(function(r, i){
      if (i !== idx) return r;
      var n = {}; Object.keys(r).forEach(function(k){ n[k] = r[k]; });
      n[key] = val;
      return n;
    }); });
  }
  function removeRelation(idx) {
    setRelations(function(arr){ return arr.filter(function(_, i){ return i !== idx; }); });
  }

  var inp = { border:"1px solid var(--line)", borderRadius:7, padding:"8px 11px", fontSize:13, fontFamily:"inherit", color:"var(--ink)", background:"var(--panel)", outline:"none", boxSizing:"border-box", width:"100%", boxShadow:"inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 0 rgba(40,40,20,0.02)" };
  var lbl = { display:"block", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:6 };

  var stepNames = ["Basics", "Properties", "Identity", "Relationships", "Governance", "Review"];

  function NodePreview({ size }) {
    size = size || 36;
    var r = size/2 - 2;
    return (
      <svg width={size} height={size} viewBox={"-"+(size/2)+" -"+(size/2)+" "+size+" "+size}>
        {shape === "agent" ? <polygon points={[0,1,2,3,4,5].map(function(i){ var a=(Math.PI/3)*i-Math.PI/2; return (r*Math.cos(a)).toFixed(1)+","+(r*Math.sin(a)).toFixed(1); }).join(" ")} fill={catDef.fill} stroke={catDef.color} strokeWidth="1.6"/>
         : shape === "source" ? <rect x={-r} y={-r} width={2*r} height={2*r} rx="2.5" fill={catDef.fill} stroke={catDef.color} strokeWidth="1.6"/>
         : <circle r={r} fill={catDef.fill} stroke={catDef.color} strokeWidth="1.6"/>}
      </svg>
    );
  }

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.42)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={function(e){ if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width:"96vw", maxWidth:1480, height:"96vh", background:"var(--bg-canvas)", borderRadius:12, border:"1px solid var(--line)", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.32)" }}>

        {/* HEADER */}
        <div style={{ flexShrink:0, height:56, borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", background:"var(--panel)" }}>
          <div>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.7px", color:"var(--ink-3)", textTransform:"uppercase" }}>SCHEMA · NEW NODE TYPE</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:3 }}>
              <NodePreview size={22} />
              <span style={{ fontFamily:"Instrument Serif", fontSize:18, color:"var(--ink)" }}>{name || "Untitled node"}</span>
              {catDef && <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, padding:"2px 7px", borderRadius:4, background:catDef.fill, color:catDef.color, fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase" }}>{catDef.label}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid var(--line)", background:"none", cursor:"pointer", fontSize:15, color:"var(--ink-3)" }}>✕</button>
        </div>

        <div style={{ flex:1, display:"grid", gridTemplateColumns:"240px minmax(0, 1fr) 320px", minHeight:0 }}>

          {/* SIDEBAR */}
          <div style={{ background:"var(--panel-2)", borderRight:"1px solid var(--line)", padding:"20px 14px", display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
            {stepNames.map(function(nm, i) {
              var n = i + 1;
              var isOn = step === n;
              var isDone = step > n;
              var sub = n === 1 ? (name || "Name & category")
                      : n === 2 ? (properties.length + " " + (properties.length === 1 ? "field" : "fields") + (propMode !== "manual" ? " · " + propMode : ""))
                      : n === 3 ? (pkField ? "PK: " + pkField : "no PK")
                      : n === 4 ? (relations.length + " edges declared")
                      : n === 5 ? (owner + " · " + retentionPolicy)
                      : (activate ? "Activate" : "Draft");
              return (
                <button key={n} onClick={function(){ if (n < step || canContinue()) setStep(n); }}
                  style={{ display:"flex", gap:12, padding:"10px 12px", borderRadius:7, border: isOn ? "1px solid var(--line)" : "1px solid transparent", background: isOn ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                  <span style={{ width:22, height:22, borderRadius:"50%", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isDone ? "var(--green)" : isOn ? "var(--ink)" : "var(--bg-canvas)", color: isDone || isOn ? "var(--bg-canvas)" : "var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, flexShrink:0 }}>{isDone ? "✓" : n}</span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, color:"var(--ink)", fontWeight: isOn ? 500 : 400, lineHeight:1.2 }}>{nm}</div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CENTER */}
          <div style={{ padding:"24px 32px 28px", overflowY:"auto" }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.8px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:5 }}>{"STEP " + step + " / 6"}</div>
              <div style={{ fontFamily:"Instrument Serif", fontSize:26, color:"var(--ink)", lineHeight:1.1, marginBottom:8 }}>{stepNames[step-1]}</div>
              <div style={{ fontSize:13, color:"var(--ink-3)", lineHeight:1.55, maxWidth:680 }}>
                {step === 1 && "Name the node type and pick its category. Use a singular capitalised noun (e.g. Account, Contract, Ticket)."}
                {step === 2 && "Define the properties this node carries. You can enter them by hand, upload a spreadsheet to auto-detect columns, parse a sample document, or start from a template."}
                {step === 3 && "Pick the primary key and any natural keys. These drive matching, dedup, and joins across sources."}
                {step === 4 && "Pre-declare expected edges to other node types. Optional — you can add edges later from the canvas."}
                {step === 5 && "Classify the data, set retention, declare compliance scope, and pick an owner."}
                {step === 6 && "Review the full schema. Activate immediately or save as a draft pending approval."}
              </div>
            </div>

            {/* ── STEP 1: Basics ── */}
            {step === 1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:720 }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
                  <div>
                    <label style={lbl}>NAME</label>
                    <input value={name} onChange={function(e){ setName(e.target.value); }} placeholder="e.g. Contract" style={Object.assign({}, inp, { fontSize:16, fontFamily:"Instrument Serif" })} />
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color: name && !nameOk ? "var(--coral)" : "var(--ink-4)", marginTop:6 }}>
                      {name && !nameOk ? "Must start with a capital letter and be ≥ 2 chars" : "Singular noun. Will appear in :Cypher patterns and the catalog."}
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>SHAPE</label>
                    <div style={{ display:"flex", gap:6 }}>
                      {[{ id:"entity", l:"●" },{ id:"agent", l:"⬣" },{ id:"source", l:"■" }].map(function(o){
                        var isOn = shape === o.id;
                        return <button key={o.id} onClick={function(){ setShape(o.id); }}
                          style={{ flex:1, padding:"10px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor:"pointer", fontFamily:"JetBrains Mono", fontSize:18, color:"var(--ink-2)" }}>{o.l}</button>;
                      })}
                    </div>
                  </div>
                </div>
                <div>
                  <label style={lbl}>CATEGORY</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {NODE_CATEGORIES_CONFIG.map(function(o){
                      var isOn = category === o.id;
                      return (
                        <button key={o.id} onClick={function(){ setCategory(o.id); if (o.id === "agent") setShape("agent"); else if (o.id === "source") setShape("source"); else setShape("entity"); }}
                          style={{ textAlign:"left", padding:"11px 14px", border:"1px solid " + (isOn ? o.color : "var(--line)"), borderRadius:8, background: isOn ? o.fill : "var(--panel)", cursor:"pointer", fontFamily:"inherit" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                            <span style={{ width:8, height:8, borderRadius:"50%", background:o.color }} />
                            <span style={{ fontSize:13.5, fontWeight: isOn ? 600 : 500, color:"var(--ink)" }}>{o.label}</span>
                          </div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", lineHeight:1.45 }}>{o.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label style={lbl}>DESCRIPTION (OPTIONAL)</label>
                  <textarea value={description} onChange={function(e){ setDescription(e.target.value); }} rows={3} placeholder="What does this node represent? When is a new instance created?" style={Object.assign({}, inp, { resize:"vertical", lineHeight:1.55 })} />
                </div>
              </div>
            )}

            {/* ── STEP 2: Properties ── */}
            {step === 2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:960 }}>
                {/* Mode selector — clean monogram cards, no emojis */}
                <div>
                  <label style={lbl}>HOW DO YOU WANT TO DEFINE PROPERTIES?</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
                    {[
                      { id:"template",    l:"From template",    d:"Pre-built schema",          mono:"T" },
                      { id:"sample",      l:"Parse a doc",      d:"LLM infers from sample",    mono:"D" },
                      { id:"spreadsheet", l:"From spreadsheet", d:"Detect from CSV/Excel",     mono:"S" },
                      { id:"manual",      l:"Define manually",  d:"Type fields by hand",       mono:"M" }
                    ].map(function(o){
                      var isOn = propMode === o.id;
                      return (
                        <button key={o.id} onClick={function(){ setPropMode(o.id); if (o.id === "manual" && properties.length === 0) { setProperties([]); } }}
                          style={{ textAlign:"left", padding:"14px 14px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:10, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit", boxShadow: isOn ? "0 0 0 2px color-mix(in oklab, var(--ink) 8%, transparent)" : "none", display:"flex", alignItems:"center", gap:11 }}>
                          <span style={{ width:30, height:30, borderRadius:7, background: isOn ? "var(--ink)" : "var(--chip)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontFamily:"JetBrains Mono", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{o.mono}</span>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)", lineHeight:1.2 }}>{o.l}</div>
                            <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3 }}>{o.d}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TEMPLATE MODE — clean dropdown selector */}
                {propMode === "template" && (
                  <div style={{ padding:"16px 18px", border:"1px solid var(--line)", borderRadius:10, background:"var(--panel)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <label style={Object.assign({}, lbl, { marginBottom:0, flexShrink:0 })}>TEMPLATE</label>
                      <select value={selectedTemplate || ""} onChange={function(e){ if (e.target.value) applyTemplate(e.target.value); }}
                        style={Object.assign({}, inp, { maxWidth:420, fontSize:13.5 })}>
                        <option value="">— pick a template —</option>
                        {NODE_TEMPLATES.map(function(t){
                          return <option key={t.id} value={t.id}>{t.name + " · " + t.brief + " (" + t.properties.length + " fields)"}</option>;
                        })}
                      </select>
                      {selectedTemplate && (
                        <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--green)", display:"flex", alignItems:"center", gap:5 }}>
                          <span style={{ fontWeight:700 }}>✓</span>
                          {NODE_TEMPLATES.find(function(t){ return t.id === selectedTemplate; }).properties.length + " fields applied"}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* SAMPLE PARSE MODE */}
                {propMode === "sample" && (
                  <div>
                    <label style={lbl}>UPLOAD A SAMPLE DOCUMENT</label>
                    {!uploadedFileName ? (
                      <div onClick={simulateParse}
                        style={{ border:"2px dashed var(--line)", borderRadius:10, padding:"36px 20px", textAlign:"center", cursor:"pointer", background:"var(--panel)" }}>
                        <div style={{ width:42, height:42, borderRadius:10, background:"var(--chip)", color:"var(--ink-2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:18, fontWeight:700, margin:"0 auto 10px" }}>D</div>
                        <div style={{ fontSize:14, color:"var(--ink)", fontWeight:500, marginBottom:5 }}>Drop a sample document or click to upload</div>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)", lineHeight:1.6 }}>PDF, DOCX, TXT · max 10MB · we'll use an LLM to infer the schema</div>
                      </div>
                    ) : parseStatus === "parsing" ? (
                      <div style={{ padding:"24px", border:"1px solid var(--line)", borderRadius:10, background:"var(--panel)", textAlign:"center" }}>
                        <div style={{ fontSize:14, color:"var(--ink)" }}>Parsing <code style={{ fontFamily:"JetBrains Mono" }}>{uploadedFileName}</code> with {parseModel}…</div>
                      </div>
                    ) : (
                      <div style={{ padding:"14px 16px", border:"1px solid var(--green-soft)", borderRadius:10, background:"var(--green-fill)", display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:20 }}>✓</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, color:"var(--ink)", fontWeight:500 }}>Parsed <code style={{ fontFamily:"JetBrains Mono", fontSize:11 }}>{uploadedFileName}</code></div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--green)", marginTop:3 }}>{properties.length + " fields inferred · review and edit below"}</div>
                        </div>
                        <button onClick={function(){ setUploadedFileName(""); setParseStatus("idle"); setProperties([]); }} style={{ background:"none", border:"none", color:"var(--green)", cursor:"pointer", fontFamily:"JetBrains Mono", fontSize:11, textDecoration:"underline" }}>upload another</button>
                      </div>
                    )}
                    {!uploadedFileName && (
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
                        <label style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>MODEL</label>
                        <select value={parseModel} onChange={function(e){ setParseModel(e.target.value); }} style={Object.assign({}, inp, { maxWidth:260, padding:"5px 8px", fontSize:12 })}>
                          <option value="claude-3.5-sonnet">Claude 3.5 Sonnet · best quality</option>
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* SPREADSHEET MODE */}
                {propMode === "spreadsheet" && (
                  <div>
                    <label style={lbl}>UPLOAD A SPREADSHEET</label>
                    {!uploadedFileName ? (
                      <div onClick={simulateUpload}
                        style={{ border:"2px dashed var(--line)", borderRadius:10, padding:"36px 20px", textAlign:"center", cursor:"pointer", background:"var(--panel)" }}>
                        <div style={{ width:42, height:42, borderRadius:10, background:"var(--chip)", color:"var(--ink-2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:18, fontWeight:700, margin:"0 auto 10px" }}>S</div>
                        <div style={{ fontSize:14, color:"var(--ink)", fontWeight:500, marginBottom:5 }}>Drop a CSV or Excel file</div>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)", lineHeight:1.6 }}>We'll read the header row and a sample of values to auto-detect types</div>
                      </div>
                    ) : (
                      <div style={{ padding:"14px 16px", border:"1px solid var(--green-soft)", borderRadius:10, background:"var(--green-fill)", display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:20 }}>✓</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, color:"var(--ink)", fontWeight:500 }}>Read <code style={{ fontFamily:"JetBrains Mono", fontSize:11 }}>{uploadedFileName}</code></div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--green)", marginTop:3 }}>{properties.length + " columns detected · types inferred from sample"}</div>
                        </div>
                        <button onClick={function(){ setUploadedFileName(""); setProperties([]); }} style={{ background:"none", border:"none", color:"var(--green)", cursor:"pointer", fontFamily:"JetBrains Mono", fontSize:11, textDecoration:"underline" }}>upload another</button>
                      </div>
                    )}
                  </div>
                )}

                {/* SHARED PROPERTIES TABLE — prominent card, stands out from background */}
                {(properties.length > 0 || propMode === "manual") && (
                  <div className="card" style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 1px 0 var(--line-2), 0 4px 14px rgba(40,40,20,0.04)", overflow:"hidden" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid var(--line-2)", background:"var(--panel-2)" }}>
                      <div>
                        <div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)" }}>{propMode === "manual" ? "Properties" : "Review & edit fields"}</div>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:3 }}>{properties.length + " " + (properties.length === 1 ? "field" : "fields") + (pkField ? " · PK: " + pkField : " · no PK yet")}</div>
                      </div>
                      <button onClick={addManualProp} className="btn-ghost" style={{ fontSize:12 }}>+ Add field</button>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1.4fr 110px 1.2fr 40px 40px 40px 40px 32px", gap:8, padding:"9px 18px", background:"var(--panel-2)", borderBottom:"1px solid var(--line-2)", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>
                      <div>Name</div><div>Type</div><div>Description</div><div title="Primary key" style={{ textAlign:"center" }}>PK</div><div title="Required" style={{ textAlign:"center" }}>REQ</div><div title="Indexed" style={{ textAlign:"center" }}>IDX</div><div title="PII" style={{ textAlign:"center" }}>PII</div><div/>
                    </div>
                    {properties.length === 0 && (
                      <div style={{ padding:"50px 18px", textAlign:"center", color:"var(--ink-3)", fontSize:13 }}>
                        No fields yet. Click <b>+ Add field</b> to start.
                      </div>
                    )}
                    {properties.map(function(p, i, arr) {
                      var isPk = p.name === pkField;
                      return (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"1.4fr 110px 1.2fr 40px 40px 40px 40px 32px", gap:8, padding:"8px 18px", alignItems:"center", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none", background: i % 2 === 1 ? "transparent" : "var(--bg-canvas)" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <input value={p.name} onChange={function(e){ updateProp(i, "name", e.target.value); }} style={Object.assign({}, inp, { padding:"6px 9px", fontSize:12, fontFamily:"JetBrains Mono" })} />
                            {p.confidence && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color: p.confidence >= 0.9 ? "var(--green)" : "var(--gold)", flexShrink:0, fontWeight:700 }} title={"LLM confidence " + p.confidence}>{Math.round(p.confidence * 100) + "%"}</span>}
                            {p.detectedFrom && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, color:"var(--ink-4)", flexShrink:0 }} title={p.detectedFrom}>↩</span>}
                          </div>
                          <select value={p.type} onChange={function(e){ updateProp(i, "type", e.target.value); }} style={Object.assign({}, inp, { padding:"6px 8px", fontSize:11.5, fontFamily:"JetBrains Mono" })}>
                            <option value="string">string</option><option value="string[]">string[]</option><option value="uuid">uuid</option><option value="decimal">decimal</option><option value="float">float</option><option value="bool">bool</option><option value="timestamp">timestamp</option><option value="date">date</option><option value="enum">enum</option><option value="struct">struct</option>
                          </select>
                          <input value={p.description || ""} onChange={function(e){ updateProp(i, "description", e.target.value); }} placeholder="optional" style={Object.assign({}, inp, { padding:"6px 9px", fontSize:12 })} />
                          <input type="checkbox" checked={isPk} onChange={function(e){ if (e.target.checked) setPkField(p.name); else if (isPk) setPkField(""); }} style={{ accentColor:"var(--ink)", justifySelf:"center", width:16, height:16 }} />
                          <input type="checkbox" checked={p.required || false} onChange={function(e){ updateProp(i, "required", e.target.checked); }} style={{ accentColor:"var(--ink)", justifySelf:"center", width:16, height:16 }} />
                          <input type="checkbox" checked={p.indexed || false} onChange={function(e){ updateProp(i, "indexed", e.target.checked); }} style={{ accentColor:"var(--blue)", justifySelf:"center", width:16, height:16 }} />
                          <input type="checkbox" checked={p.pii || false} onChange={function(e){ updateProp(i, "pii", e.target.checked); }} style={{ accentColor:"var(--coral)", justifySelf:"center", width:16, height:16 }} />
                          <button onClick={function(){ removeProp(i); }} style={{ width:24, height:24, borderRadius:5, border:"1px solid var(--line)", background:"var(--panel-2)", color:"var(--ink-3)", cursor:"pointer", justifySelf:"center" }}>×</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Identity ── */}
            {step === 3 && (
              <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:720 }}>
                <div>
                  <label style={lbl}>PRIMARY KEY</label>
                  <select value={pkField} onChange={function(e){ setPkField(e.target.value); }} style={inp}>
                    <option value="">— pick a field —</option>
                    {properties.map(function(p){ return <option key={p.name} value={p.name}>{p.name + "  ·  " + p.type}</option>; })}
                  </select>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:6 }}>Stable, immutable, unique. Typically a uuid or system-generated id.</div>
                </div>
                <div>
                  <label style={lbl}>NATURAL KEYS (USED FOR MATCHING ACROSS SOURCES)</label>
                  <div style={{ border:"1px solid var(--line)", borderRadius:8, padding:"6px 10px" }}>
                    {properties.length === 0 && <div style={{ padding:8, fontSize:12, color:"var(--ink-3)" }}>No fields yet.</div>}
                    {properties.map(function(p, i, arr){
                      var isOn = naturalKeys.indexOf(p.name) >= 0;
                      var isPk = p.name === pkField;
                      return (
                        <label key={p.name} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 4px", cursor: isPk ? "default" : "pointer", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none", opacity: isPk ? 0.5 : 1 }}>
                          <input type="checkbox" checked={isOn || isPk} disabled={isPk} onChange={function(e){
                            setNaturalKeys(function(arr2){
                              if (e.target.checked) return arr2.indexOf(p.name) >= 0 ? arr2 : arr2.concat([p.name]);
                              return arr2.filter(function(x){ return x !== p.name; });
                            });
                          }} style={{ accentColor:"var(--ink)" }} />
                          <code style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink)", flex:1 }}>{p.name}</code>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)" }}>{p.type}</span>
                          {isPk && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"1px 5px", borderRadius:3, background:"var(--ink)", color:"var(--bg-canvas)", fontWeight:700 }}>PK</span>}
                        </label>
                      );
                    })}
                  </div>
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:6 }}>e.g. email + domain for Customer; tax_id for Account. The PK is automatically included.</div>
                </div>
                <div>
                  <label style={lbl}>DEDUPLICATION STRATEGY</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      { id:"none",            l:"No dedup",                d:"Treat every incoming record as new." },
                      { id:"on_pk",           l:"Exact on PK",             d:"Match only when the primary key is identical." },
                      { id:"on_natural_key",  l:"Exact on natural key",    d:"Match when any natural key matches exactly." },
                      { id:"probabilistic",   l:"Probabilistic fuzzy",     d:"Use a Matching rule (fuzzy / embedding / etc.) to find dups." }
                    ].map(function(o){
                      var isOn = dedupStrategy === o.id;
                      return (
                        <button key={o.id} onClick={function(){ setDedupStrategy(o.id); }}
                          style={{ textAlign:"left", padding:"10px 12px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit" }}>
                          <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>{o.l}</div>
                          <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3 }}>{o.d}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Relationships ── */}
            {step === 4 && (
              <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:820 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <label style={lbl}>EXPECTED EDGES</label>
                    <button onClick={addRelation} className="btn-ghost" style={{ fontSize:11.5 }}>+ Add edge</button>
                  </div>
                  {relations.length === 0 ? (
                    <div style={{ padding:"30px 18px", textAlign:"center", color:"var(--ink-3)", fontSize:13, border:"1px dashed var(--line)", borderRadius:8 }}>
                      No edges declared yet. <button onClick={addRelation} style={{ background:"none", border:"none", color:"var(--ink)", cursor:"pointer", textDecoration:"underline", fontFamily:"inherit", fontSize:13 }}>Add one</button> — or skip; you can wire edges later from the canvas.
                    </div>
                  ) : (
                    <div style={{ border:"1px solid var(--line)", borderRadius:8, overflow:"hidden" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1.2fr 80px 100px 32px", gap:6, background:"var(--panel-2)", borderBottom:"1px solid var(--line-2)", padding:"7px 12px", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>
                        <div>Edge label</div><div>Target node</div><div>Card.</div><div>Kind</div><div/>
                      </div>
                      {relations.map(function(r, i, arr){
                        return (
                          <div key={i} style={{ display:"grid", gridTemplateColumns:"1.2fr 1.2fr 80px 100px 32px", gap:6, padding:"6px 12px", alignItems:"center", borderBottom: i < arr.length-1 ? "1px solid var(--line-2)" : "none" }}>
                            <input value={r.label} onChange={function(e){ updateRelation(i, "label", e.target.value.toUpperCase().replace(/[^A-Z_]/g, "")); }} placeholder="HAS_X" style={Object.assign({}, inp, { padding:"4px 7px", fontSize:11.5, fontFamily:"JetBrains Mono" })} />
                            <select value={r.target} onChange={function(e){ updateRelation(i, "target", e.target.value); }} style={Object.assign({}, inp, { padding:"4px 7px", fontSize:11.5 })}>
                              {NODES.filter(function(n){ return n.type !== "source"; }).map(function(n){ return <option key={n.id} value={n.id}>{n.label}</option>; })}
                            </select>
                            <select value={r.cardinality} onChange={function(e){ updateRelation(i, "cardinality", e.target.value); }} style={Object.assign({}, inp, { padding:"4px 7px", fontSize:11.5, fontFamily:"JetBrains Mono" })}>
                              <option value="1:1">1:1</option><option value="1:N">1:N</option><option value="N:1">N:1</option><option value="N:N">N:N</option>
                            </select>
                            <select value={r.kind} onChange={function(e){ updateRelation(i, "kind", e.target.value); }} style={Object.assign({}, inp, { padding:"4px 7px", fontSize:11.5 })}>
                              <option value="direct">direct</option><option value="inferred">inferred</option><option value="agent">agent</option>
                            </select>
                            <button onClick={function(){ removeRelation(i); }} style={{ width:24, height:24, borderRadius:5, border:"1px solid var(--line)", background:"var(--bg-canvas)", color:"var(--ink-3)", cursor:"pointer" }}>×</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 5: Governance ── */}
            {step === 5 && (function(){
              function PermRow({ k, label, list, setList, tone, desc }) {
                var isOpen = permPickerOpen === k;
                function toggle(entry){
                  setList(function(arr){
                    var exists = arr.find(function(x){ return x.kind === entry.kind && x.id === entry.id; });
                    if (exists) return arr.filter(function(x){ return !(x.kind === entry.kind && x.id === entry.id); });
                    return arr.concat([entry]);
                  });
                }
                return (
                  <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--line-2)" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, padding:"2px 7px", borderRadius:4, background:tone.bg, color:tone.fg, fontWeight:700, letterSpacing:"0.5px" }}>{k.toUpperCase()}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>{label}</span>
                        </div>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:4 }}>{desc}</div>
                      </div>
                      <div style={{ position:"relative" }}>
                        <button onClick={function(){ setPermPickerOpen(isOpen ? null : k); }} className="btn-ghost" style={{ fontSize:11.5 }}>+ Add user or group</button>
                        {isOpen && (
                          <>
                            <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:99 }} onClick={function(){ setPermPickerOpen(null); }} />
                            <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:100, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:9, boxShadow:"0 8px 28px rgba(0,0,0,0.14)", padding:6, minWidth:260, maxHeight:320, overflowY:"auto" }}>
                              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-4)", textTransform:"uppercase", padding:"6px 10px" }}>GROUPS</div>
                              {DIRECTORY.filter(function(d){ return d.kind === "group"; }).map(function(d){
                                var selected = list.find(function(x){ return x.kind === d.kind && x.id === d.id; });
                                return (
                                  <button key={"g_" + d.id} onClick={function(){ toggle(d); }}
                                    style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"6px 10px", borderRadius:5, border:"none", background: selected ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", fontSize:12, color:"var(--ink)", textAlign:"left" }}>
                                    <span style={{ width:18, height:18, borderRadius:4, background:"var(--chip)", color:"var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, flexShrink:0 }}>G</span>
                                    <span style={{ flex:1 }}>{d.label}</span>
                                    {selected && <span style={{ color:"var(--green)", fontWeight:700 }}>✓</span>}
                                  </button>
                                );
                              })}
                              <div style={{ height:1, background:"var(--line-2)", margin:"4px 0" }} />
                              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.5px", color:"var(--ink-4)", textTransform:"uppercase", padding:"6px 10px" }}>USERS</div>
                              {DIRECTORY.filter(function(d){ return d.kind === "user"; }).map(function(d){
                                var selected = list.find(function(x){ return x.kind === d.kind && x.id === d.id; });
                                return (
                                  <button key={"u_" + d.id} onClick={function(){ toggle(d); }}
                                    style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"6px 10px", borderRadius:5, border:"none", background: selected ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", fontSize:12, color:"var(--ink)", textAlign:"left" }}>
                                    <span style={{ width:18, height:18, borderRadius:"50%", background:"var(--ink-2)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:9, fontWeight:700, flexShrink:0 }}>{d.label.split(" ").map(function(s){ return s[0]; }).join("").slice(0,2)}</span>
                                    <span style={{ flex:1 }}>{d.label}</span>
                                    {selected && <span style={{ color:"var(--green)", fontWeight:700 }}>✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {list.length === 0 && <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-4)", fontStyle:"italic" }}>nobody — locked down</span>}
                      {list.map(function(e, i){
                        return (
                          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 6px 4px 8px", borderRadius:6, background:"var(--chip)", border:"1px solid var(--line-2)", fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink)" }}>
                            <span style={{ width:14, height:14, borderRadius: e.kind === "user" ? "50%" : 3, background: e.kind === "user" ? "var(--ink-2)" : "var(--ink-3)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:8, fontWeight:700, flexShrink:0 }}>{e.kind === "user" ? e.label.split(" ").map(function(s){ return s[0]; }).join("").slice(0,2) : "G"}</span>
                            {e.label}
                            <button onClick={function(){ setList(function(arr){ return arr.filter(function(x){ return !(x.kind === e.kind && x.id === e.id); }); }); }} style={{ background:"none", border:"none", color:"var(--ink-3)", cursor:"pointer", padding:0, fontSize:14, lineHeight:1 }}>×</button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:820 }}>
                  {/* OWNER + RETENTION row */}
                  <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:14 }}>
                    <div>
                      <label style={lbl}>OWNER</label>
                      <select value={owner} onChange={function(e){ setOwner(e.target.value); }} style={inp}>
                        <option value={CURRENT_USER.id}>{CURRENT_USER.label + " (you · " + CURRENT_USER.team + ")"}</option>
                        {DIRECTORY.filter(function(d){ return d.kind === "user" && d.id !== CURRENT_USER.id; }).map(function(d){ return <option key={d.id} value={d.id}>{d.label}</option>; })}
                      </select>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", marginTop:6 }}>The owner is the single point of accountability for this node type.</div>
                    </div>
                    <div>
                      <label style={lbl}>RETENTION POLICY</label>
                      <select value={retentionPolicy} onChange={function(e){ setRetentionPolicy(e.target.value); }} style={inp}>
                        <option value="forever">Keep forever</option>
                        <option value="7y">7 years</option>
                        <option value="3y">3 years</option>
                        <option value="1y">1 year</option>
                        <option value="90d">90 days</option>
                      </select>
                    </div>
                  </div>

                  {/* TAGS dropdown */}
                  <div style={{ position:"relative" }}>
                    <label style={lbl}>COMPLIANCE TAGS</label>
                    <button onClick={function(){ setTagsDropOpen(function(o){ return !o; }); }}
                      style={Object.assign({}, inp, { display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", textAlign:"left", padding:"7px 11px" })}>
                      <span style={{ display:"flex", flexWrap:"wrap", gap:5, flex:1 }}>
                        {complianceTags.length === 0 && <span style={{ color:"var(--ink-4)" }}>None</span>}
                        {complianceTags.map(function(t){
                          return <span key={t} style={{ fontFamily:"JetBrains Mono", fontSize:11, padding:"2px 7px", borderRadius:4, background:"var(--chip)", color:"var(--ink-2)" }}>{t}</span>;
                        })}
                      </span>
                      <span style={{ color:"var(--ink-3)", marginLeft:6 }}>{tagsDropOpen ? "▴" : "▾"}</span>
                    </button>
                    {tagsDropOpen && (
                      <>
                        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:99 }} onClick={function(){ setTagsDropOpen(false); }} />
                        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:100, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:9, boxShadow:"0 8px 28px rgba(0,0,0,0.14)", padding:6 }}>
                          {["SOC2","GDPR","HIPAA","ISO27001","CCPA","PCI-DSS"].map(function(t){
                            var isOn = complianceTags.indexOf(t) >= 0;
                            return <button key={t} onClick={function(){
                              setComplianceTags(function(arr){ return isOn ? arr.filter(function(x){ return x !== t; }) : arr.concat([t]); });
                            }} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 10px", borderRadius:5, border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", fontSize:12.5, color:"var(--ink)", textAlign:"left" }}>
                              <span style={{ width:14, height:14, borderRadius:3, border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isOn ? "var(--ink)" : "transparent", color:"var(--bg-canvas)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>{isOn ? "✓" : ""}</span>
                              <code style={{ fontFamily:"JetBrains Mono", fontSize:12 }}>{t}</code>
                            </button>;
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* PERMISSIONS */}
                  <div>
                    <label style={lbl}>WHO CAN ACCESS THIS NODE?</label>
                    <div className="card" style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 1px 0 var(--line-2), 0 4px 14px rgba(40,40,20,0.04)", overflow:"hidden" }}>
                      <PermRow k="read"  label="Read"  list={permsRead}  setList={setPermsRead}  tone={{ bg:"var(--blue-fill)",   fg:"var(--blue)"   }} desc="Can query records and view the schema." />
                      <PermRow k="write" label="Write" list={permsWrite} setList={setPermsWrite} tone={{ bg:"var(--green-fill)",  fg:"var(--green)"  }} desc="Can create, update, or delete records of this type." />
                      <PermRow k="admin" label="Admin" list={permsAdmin} setList={setPermsAdmin} tone={{ bg:"var(--coral-fill)",  fg:"var(--coral)"  }} desc="Can edit the schema, add rules, and manage permissions." />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── STEP 6: Review — comprehensive, dashed summary rows like enterprise tools ── */}
            {step === 6 && (
              <div style={{ display:"flex", flexDirection:"column", gap:22, maxWidth:880 }}>
                {/* Headline — bigger, more confident */}
                <div>
                  <div style={{ fontFamily:"Instrument Serif", fontSize:30, color:"var(--ink)", lineHeight:1.1, marginBottom:8 }}>Last look before this node type lands in the schema</div>
                  <div style={{ fontSize:13, color:"var(--ink-3)", lineHeight:1.55, maxWidth:600 }}>
                    Once published it appears in the Node catalog with a full audit trail. You can roll back from History within the 30-day change window.
                  </div>
                </div>

                {/* SUMMARY CARD — dashed-row table */}
                <div className="card" style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 1px 0 var(--line-2), 0 4px 14px rgba(40,40,20,0.04)", overflow:"hidden" }}>
                  <div className="card-head card-head-row" style={{ background:"var(--panel-2)" }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>Summary</span>
                    <span className="card-head-sub">{(catDef.label || "—") + " · " + properties.length + " fields"}</span>
                  </div>
                  <div style={{ padding:"4px 0" }}>
                    {[
                      { k:"LABEL",       v: <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, padding:"3px 8px", background:"var(--chip)", borderRadius:5, color:"var(--ink)" }}>{":" + (name || "Untitled")}</span> },
                      { k:"KIND",        v: shape === "agent" ? "Agent" : shape === "source" ? "Source" : "Entity" },
                      { k:"CATEGORY",    v: catDef.label.toLowerCase() },
                      { k:"DESCRIPTION", v: description || <span style={{ color:"var(--ink-4)" }}>—</span> },
                      { k:"PRIMARY KEY", v: pkField ? <span><code style={{ fontFamily:"JetBrains Mono", color:"var(--ink)" }}>{pkField}</code> <span style={{ color:"var(--ink-4)", fontFamily:"JetBrains Mono", fontSize:10.5 }}>: {(properties.find(function(p){ return p.name === pkField; }) || {}).type || "uuid"}</span></span> : <span style={{ color:"var(--coral)" }}>not set</span> },
                      { k:"NATURAL KEYS", v: naturalKeys.length ? naturalKeys.map(function(n){ return <code key={n} style={{ fontFamily:"JetBrains Mono", fontSize:11, padding:"2px 7px", background:"var(--chip)", borderRadius:4, color:"var(--ink-2)", marginRight:5 }}>{n}</code>; }) : <span style={{ color:"var(--ink-4)" }}>none</span> },
                      { k:"PROPERTIES",  v: properties.length + " total · " + properties.filter(function(p){ return p.required; }).length + " required · " + properties.filter(function(p){ return p.indexed; }).length + " indexed · " + properties.filter(function(p){ return p.pii; }).length + " PII" },
                      { k:"DEDUP",       v: dedupStrategy.replace(/_/g," ") },
                      { k:"RELATIONSHIPS", v: relations.length === 0 ? <span style={{ color:"var(--ink-4)" }}>none declared</span> : relations.length + " edge" + (relations.length !== 1 ? "s" : "") + " · " + relations.map(function(r){ return ":" + r.label; }).slice(0, 3).join(", ") + (relations.length > 3 ? "…" : "") },
                      { k:"OWNER",       v: owner },
                      { k:"FRESHNESS SLO", v: "—" },
                      { k:"RETENTION",   v: retentionPolicy === "forever" ? "Keep forever" : retentionPolicy },
                      { k:"COMPLIANCE",  v: complianceTags.length ? complianceTags.map(function(t){ return <span key={t} style={{ fontFamily:"JetBrains Mono", fontSize:10.5, padding:"2px 6px", background:"var(--chip)", borderRadius:4, color:"var(--ink-2)", marginRight:4 }}>{t}</span>; }) : <span style={{ color:"var(--ink-4)" }}>—</span> }
                    ].map(function(row, i, arr){
                      return (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"160px 1fr", gap:16, padding:"10px 22px", borderBottom: i < arr.length-1 ? "1px dashed var(--line-2)" : "none", alignItems:"baseline" }}>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>{row.k}</span>
                          <span style={{ fontSize:13, color:"var(--ink)", textAlign:"right" }}>{row.v}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ACCESS CARD — show full RBAC visually */}
                <div className="card" style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 1px 0 var(--line-2), 0 4px 14px rgba(40,40,20,0.04)", overflow:"hidden" }}>
                  <div className="card-head card-head-row" style={{ background:"var(--panel-2)" }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>Access</span>
                    <span className="card-head-sub">{"read " + permsRead.length + " · write " + permsWrite.length + " · admin " + permsAdmin.length}</span>
                  </div>
                  <div>
                    {[
                      { k:"READ",  list: permsRead,  tone:{ bg:"var(--blue-fill)",  fg:"var(--blue)"  } },
                      { k:"WRITE", list: permsWrite, tone:{ bg:"var(--green-fill)", fg:"var(--green)" } },
                      { k:"ADMIN", list: permsAdmin, tone:{ bg:"var(--coral-fill)", fg:"var(--coral)" } }
                    ].map(function(row, i, arr){
                      return (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"100px 1fr", gap:16, padding:"12px 22px", borderBottom: i < arr.length-1 ? "1px dashed var(--line-2)" : "none", alignItems:"center" }}>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"2px 7px", borderRadius:4, background:row.tone.bg, color:row.tone.fg, fontWeight:700, letterSpacing:"0.5px", justifySelf:"start" }}>{row.k}</span>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:5, justifyContent:"flex-end" }}>
                            {row.list.length === 0 ? <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-4)", fontStyle:"italic" }}>nobody</span> : row.list.map(function(e, j){
                              return (
                                <span key={j} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 7px", borderRadius:5, background:"var(--chip)", border:"1px solid var(--line-2)", fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>
                                  <span style={{ width:12, height:12, borderRadius: e.kind === "user" ? "50%" : 3, background: e.kind === "user" ? "var(--ink-2)" : "var(--ink-3)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:7.5, fontWeight:700, flexShrink:0 }}>{e.kind === "user" ? e.label.split(" ").map(function(s){ return s[0]; }).join("").slice(0,2) : "G"}</span>
                                  {e.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* INITIAL PROPERTIES CARD — full list */}
                {properties.length > 0 && (
                  <div className="card" style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 1px 0 var(--line-2), 0 4px 14px rgba(40,40,20,0.04)", overflow:"hidden" }}>
                    <div className="card-head card-head-row" style={{ background:"var(--panel-2)" }}>
                      <span style={{ fontSize:14, fontWeight:600 }}>Initial properties</span>
                      <span className="card-head-sub">{properties.length + " total"}</span>
                    </div>
                    <div>
                      {properties.map(function(p, i, arr) {
                        return (
                          <div key={p.name} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12, padding:"9px 22px", borderBottom: i < arr.length-1 ? "1px dashed var(--line-2)" : "none", alignItems:"center" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                              {p.name === pkField && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"1px 5px", borderRadius:3, background:"var(--ink)", color:"var(--bg-canvas)", fontWeight:700 }}>PK</span>}
                              {p.required && p.name !== pkField && <span className="snap-tag" style={{ fontSize:9, padding:"1px 5px" }}>REQ</span>}
                              {p.indexed && <span className="snap-tag snap-idx" style={{ fontSize:9, padding:"1px 5px" }}>IDX</span>}
                              {p.pii && <span className="snap-tag snap-pii" style={{ fontSize:9, padding:"1px 5px" }}>PII</span>}
                              <code style={{ fontFamily:"JetBrains Mono", fontSize:12.5, color:"var(--ink)" }}>{p.name}</code>
                            </div>
                            <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{p.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ON SAVE selector */}
                <div>
                  <label style={lbl}>ON SAVE</label>
                  <div style={{ display:"flex", gap:6 }}>
                    {[{ id:true, l:"Activate immediately" },{ id:false, l:"Save as draft" }].map(function(o){
                      var isOn = activate === o.id;
                      return <button key={String(o.id)} onClick={function(){ setActivate(o.id); }} style={{ padding:"9px 16px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:7, background: isOn ? "var(--ink)" : "var(--panel)", color: isOn ? "var(--bg-canvas)" : "var(--ink-2)", fontSize:13, fontFamily:"inherit", cursor:"pointer", fontWeight: isOn ? 500 : 400 }}>{o.l}</button>;
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PREVIEW */}
          <div style={{ background:"var(--panel-2)", borderLeft:"1px solid var(--line)", padding:"20px 18px", overflowY:"auto", display:"flex", flexDirection:"column", gap:18 }}>
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>NODE PREVIEW</div>
              <div style={{ padding:"16px 14px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <NodePreview size={52} />
                <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)" }}>{name || "Untitled"}</div>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, padding:"2px 7px", borderRadius:4, background:catDef.fill, color:catDef.color, fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase" }}>{catDef.label}</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>CYPHER</div>
              <pre style={{ fontFamily:"JetBrains Mono", fontSize:11, color:catDef.color, margin:0, padding:"10px 12px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6, whiteSpace:"pre-wrap", lineHeight:1.55 }}>
                {"CREATE NODE TYPE :" + (name.replace(/\s/g,"") || "?") + "\n  KIND " + (shape === "agent" ? "AGENT" : shape === "source" ? "SOURCE" : "ENTITY") + "\n  PRIMARY KEY (" + (pkField || "?") + ")" + (naturalKeys.length ? "\n  NATURAL KEY (" + naturalKeys.join(", ") + ")" : "")}
              </pre>
            </div>
            <div>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>VALIDATION</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, fontFamily:"JetBrains Mono", fontSize:11 }}>
                {[
                  { ok: nameOk, l:"Name valid" },
                  { ok: properties.length > 0, l:"At least one field" },
                  { ok: !!pkField, l:"Primary key picked" },
                  { ok: permsAdmin.length > 0 || step < 5, l:"Admin assigned" }
                ].map(function(v, i){
                  return <div key={i} style={{ display:"flex", alignItems:"center", gap:8, color: v.ok ? "var(--green)" : "var(--ink-4)" }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background: v.ok ? "var(--green)" : "var(--line)" }} />
                    <span style={{ color:"var(--ink-2)" }}>{v.l}</span>
                    {v.ok && <span style={{ marginLeft:"auto", fontWeight:700, color:"var(--green)" }}>✓</span>}
                  </div>;
                })}
              </div>
            </div>
            {properties.length > 0 && (
              <div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:8 }}>SCHEMA SNAPSHOT</div>
                <div style={{ padding:"10px 12px", background:"var(--bg-canvas)", border:"1px solid var(--line-2)", borderRadius:6, maxHeight:280, overflowY:"auto" }}>
                  {properties.map(function(p, i){
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 0", fontFamily:"JetBrains Mono", fontSize:10.5 }}>
                        {p.name === pkField && <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, padding:"0 4px", borderRadius:3, background:"var(--ink)", color:"var(--bg-canvas)", fontWeight:700 }}>PK</span>}
                        <code style={{ color:"var(--ink-2)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</code>
                        <span style={{ color:"var(--ink-3)" }}>{p.type}</span>
                        {p.pii && <span style={{ color:"var(--coral)", fontWeight:700, fontSize:8.5 }}>PII</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ flexShrink:0, padding:"14px 22px", borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--panel)" }}>
          <button className="btn-ghost" onClick={function(){ if (step > 1) setStep(function(s){ return s - 1; }); }} disabled={step === 1} style={{ opacity: step === 1 ? 0.4 : 1 }}>← Back</button>
          <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{"Step " + step + " of 6 · " + stepNames[step-1]}</span>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            {step < 6
              ? <button className="btn-dark" disabled={!canContinue()} onClick={function(){ setStep(function(s){ return s + 1; }); }} style={{ opacity: canContinue() ? 1 : 0.45 }}>Continue →</button>
              : <button className="btn-dark" onClick={onClose}>{activate ? "Create node type ↵" : "Save draft ↵"}</button>
            }
          </div>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT GRAPHS LANDING — workspace-style picker of every graph in the org
// ═══════════════════════════════════════════════════════════════════════════════

var CONTEXT_GRAPHS = [
  { id:"ecg",        cat:"GLOBAL",      color:"var(--blue)",   name:"Enterprise Context Graph",     desc:"The unified context layer connecting every entity, system, and decision across the organization.", nodes:28431, edges:183202, agents:41, health:96, synced:"2 min ago", owner:"data-platform" },
  { id:"customer",   cat:"CUSTOMER",    color:"var(--gold)",   name:"Customer 360 Graph",           desc:"Identity-resolved customer entities unifying CRM, support, billing and product.",                  nodes:9482,  edges:41200,  agents:7,  health:93, synced:"4 min ago", owner:"customer-ops" },
  { id:"sales",      cat:"REVENUE",     color:"var(--gold)",   name:"Sales Graph",                  desc:"Pipeline, opportunities, accounts and the early signals — across CRM, billing and product — that the agents reason on to close revenue.", nodes:6204,  edges:21380,  agents:9,  health:92, synced:"5 min ago", owner:"revenue-ops" },
  { id:"support",    cat:"SUPPORT",     color:"var(--gold)",   name:"Support Graph",                desc:"Tickets, incidents, escalations and resolution paths across every support channel.",               nodes:11402, edges:33840,  agents:6,  health:91, synced:"3 min ago", owner:"customer-ops" },
  { id:"finance",    cat:"FINANCE",     color:"var(--green)",  name:"Finance Graph",                desc:"Ledger entities, controls, policies and audit lineage spanning systems of record.",                nodes:4218,  edges:14502,  agents:5,  health:98, synced:"12 min ago", owner:"finance-ops" },
  { id:"product",    cat:"PRODUCT",     color:"var(--purple)", name:"Product Specialist Graph",     desc:"PS delivery entities — work orders, projects, milestones, and the TOC systems powering PS execution.", nodes:3127, edges:8742, agents:8, health:89, synced:"1 min ago", owner:"product-eng" },
  { id:"security",   cat:"SECURITY",    color:"var(--coral)",  name:"Security Posture Graph",       desc:"Identities, devices, secrets and access trails wired into compliance frameworks.",                 nodes:2104,  edges:6820,   agents:3,  health:95, synced:"8 min ago", owner:"security" },
  { id:"workforce",  cat:"PEOPLE",      color:"var(--blue)",   name:"Workforce Graph",              desc:"Employees, roles, teams and tenure — the organizational substrate every other graph leans on.",   nodes:1840,  edges:4920,   agents:2,  health:99, synced:"22 min ago", owner:"people-ops" },
  { id:"risk",       cat:"RISK",        color:"var(--coral)",  name:"Compliance & Risk Graph",      desc:"Policies, controls, risks and audit evidence linked back to the records they govern.",            nodes:912,   edges:3104,   agents:4,  health:94, synced:"6 min ago", owner:"legal-ops" },
  { id:"partner",    cat:"PARTNER",     color:"var(--purple)", name:"Partner Ecosystem Graph",      desc:"Channel partners, integrations, co-sells and the joint accounts they touch.",                     nodes:647,   edges:2678,   agents:1,  health:88, synced:"34 min ago", owner:"partnerships" }
];

// Deterministic mini-graph generator for the card thumbnails
function generateMiniGraph(seed, count) {
  count = count || 11;
  var s = (seed || 1) | 0;
  function nxt(){ s = (s * 1664525 + 1013904223) | 0; return Math.abs(s); }
  var nodes = [];
  for (var i = 0; i < count; i++) {
    nodes.push({ x: 8 + (nxt() % 84), y: 12 + (nxt() % 76), r: 4 + (nxt() % 9) });
  }
  var edges = [];
  for (var j = 0; j < count; j++) {
    var n = 1 + (nxt() % 2);
    for (var k = 0; k < n; k++) {
      var t = nxt() % count;
      if (t !== j) edges.push([j, t]);
    }
  }
  return { nodes: nodes, edges: edges };
}

function GraphMiniViz({ seed, color, size }) {
  var w = size || 100, h = (size || 100) * 0.62;
  var g = generateMiniGraph(seed);
  var gradId = "gradMini_" + seed;
  return (
    <svg width="100%" height="100%" viewBox={"0 0 100 62"} preserveAspectRatio="xMidYMid meet" style={{ display:"block" }}>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="100" height="62" fill={"url(#" + gradId + ")"} />
      <g stroke={color} strokeOpacity="0.35" strokeWidth="0.4">
        {g.edges.slice(0, 18).map(function(e, i){
          var a = g.nodes[e[0]], b = g.nodes[e[1]];
          return <line key={i} x1={a.x*0.95} y1={a.y*0.7} x2={b.x*0.95} y2={b.y*0.7} />;
        })}
      </g>
      <g fill={color}>
        {g.nodes.map(function(n, i){
          return <circle key={i} cx={n.x*0.95} cy={n.y*0.7} r={n.r*0.42} opacity={0.65 + (i%3)*0.12} />;
        })}
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEW GRAPH FLOW — context-aware graph creation (industry → starting point → …)
// ═══════════════════════════════════════════════════════════════════════════════

var GRAPH_INDUSTRIES = [
  { id:"any",           code:"ANY",  label:"Any / cross-industry",        desc:"Horizontal use case — works across sectors",  accent:"var(--ink-3)" },
  { id:"saas",          code:"SaaS", label:"SaaS / B2B Software",         desc:"Subscriptions, accounts, product telemetry",  accent:"var(--blue)" },
  { id:"fintech",       code:"FIN",  label:"Financial Services",          desc:"Customers, accounts, transactions, risk",     accent:"var(--coral)" },
  { id:"healthcare",    code:"HC",   label:"Healthcare / Life Sciences",  desc:"Patients, providers, claims, encounters",     accent:"var(--purple)" },
  { id:"retail",        code:"RTL",  label:"Retail / eCommerce",          desc:"Customers, orders, products, fulfilment",     accent:"var(--gold)" },
  { id:"manufacturing", code:"MFG",  label:"Manufacturing",               desc:"Supply chain, inventory, BOMs, suppliers",    accent:"var(--green)" },
  { id:"logistics",     code:"LOG",  label:"Logistics & Supply",          desc:"Shipments, routes, warehouses, carriers",     accent:"var(--blue)" },
  { id:"media",         code:"MED",  label:"Media & Entertainment",       desc:"Content, audiences, subscriptions, rights",   accent:"var(--purple)" },
  { id:"professional",  code:"PRO",  label:"Professional Services",       desc:"Clients, engagements, billable hours",        accent:"var(--coral)" },
  { id:"public",        code:"PUB",  label:"Public Sector / Education",   desc:"Citizens, programs, grants, casework",        accent:"var(--gold)" }
];

var GRAPH_FUNCTIONS = [
  { id:"enterprise",    code:"ENT", label:"Entire organisation",      desc:"Cross-functional, enterprise-wide context graph",         enterprise:true, accent:"var(--ink)" },
  { id:"revenue",       code:"REV", label:"Sales & Revenue",          desc:"Pipeline, accounts, opportunities, forecasting",          accent:"var(--green)" },
  { id:"customer",      code:"CS",  label:"Customer Success",         desc:"Health, retention, renewals, escalations",                accent:"var(--coral)" },
  { id:"support",       code:"SUP", label:"Customer Support",         desc:"Tickets, escalations, resolution, CSAT",                  accent:"var(--coral)" },
  { id:"marketing",     code:"MKT", label:"Marketing",                desc:"Campaigns, attribution, audiences, content",              accent:"var(--purple)" },
  { id:"product-mgmt",  code:"PM",  label:"Product Management",       desc:"Roadmap, releases, experiments, adoption",                accent:"var(--blue)" },
  { id:"engineering",   code:"ENG", label:"Engineering",              desc:"Services, incidents, deploys, on-call",                   accent:"var(--blue)" },
  { id:"operations",    code:"OPS", label:"Operations",               desc:"Workflows, capacity, throughput, SLAs",                   accent:"var(--gold)" },
  { id:"supply-chain",  code:"SCM", label:"Supply Chain & Procurement", desc:"Suppliers, POs, inventory, logistics",                  accent:"var(--gold)" },
  { id:"finance",       code:"FIN", label:"Finance",                  desc:"GL, journal, invoicing, payments, controls",              accent:"var(--green)" },
  { id:"people",        code:"HR",  label:"People / HR",              desc:"Employees, roles, teams, comp, tenure",                   accent:"var(--purple)" },
  { id:"legal",         code:"LGL", label:"Legal & Compliance",       desc:"Contracts, obligations, policies, audits",                accent:"var(--ink-2)" },
  { id:"risk",          code:"RSK", label:"Risk & Trust",             desc:"Fraud, KYC, controls, holds, signals",                    accent:"var(--coral)" },
  { id:"it-security",   code:"SEC", label:"IT & Security",            desc:"Identity, access, devices, endpoints, SOC",               accent:"var(--ink-2)" },
  { id:"data-platform", code:"DP",  label:"Data Platform",            desc:"Models, lineage, contracts, observability",               accent:"var(--blue)" },
  { id:"analytics",     code:"BI",  label:"Analytics & BI",           desc:"Dashboards, metrics, semantic layer",                     accent:"var(--blue)" },
  { id:"biz-ops",       code:"BIZ", label:"Strategy & BizOps",        desc:"OKRs, planning, cross-team programs",                     accent:"var(--ink)" },
  { id:"partner",       code:"PRT", label:"Partner & Channel",        desc:"Resellers, alliances, co-sell, ISVs",                     accent:"var(--gold)" },
  { id:"facilities",    code:"FAC", label:"Workplace & Facilities",   desc:"Offices, badges, capacity, real estate",                  accent:"var(--gold)" },
  { id:"comms",         code:"PR",  label:"Communications & PR",      desc:"Stories, audiences, mentions, channels",                  accent:"var(--purple)" }
];

// Per-entity metadata: short description + a few representative properties.
// Used by Step 2 / Step 3 preview cards to make blueprints feel concrete.
var ENTITY_META = {
  "Account":         { desc:"A buying organisation or company.",               props:["account_id","name","industry","arr","tier"] },
  "Contact":         { desc:"A person at an account.",                         props:["contact_id","email","role","account_id"] },
  "Opportunity":     { desc:"A potential deal in the pipeline.",               props:["opportunity_id","stage","amount","close_date","owner"] },
  "Subscription":    { desc:"An active product subscription.",                 props:["subscription_id","plan","mrr","status","renews_on"] },
  "Invoice":         { desc:"A billing document issued to a customer.",        props:["invoice_id","amount","status","issued_on","due_on"] },
  "Usage Event":     { desc:"A product usage signal from an account.",         props:["event_id","feature","timestamp","account_id"] },
  "Ticket":          { desc:"A support or customer-service case.",             props:["ticket_id","subject","priority","status","opened_at"] },
  "Customer":        { desc:"A person or org you serve.",                      props:["customer_id","name","status","ltv","segment"] },
  "Interaction":     { desc:"Any touchpoint with a customer.",                 props:["interaction_id","channel","sentiment","timestamp"] },
  "Health Score":    { desc:"Composite indicator of account health.",          props:["score","trend","computed_at","drivers"] },
  "Renewal":         { desc:"An upcoming or completed contract renewal.",      props:["renewal_id","arr","stage","decision_by"] },
  "Transaction":     { desc:"A money-movement event.",                         props:["txn_id","amount","currency","direction","posted_at"] },
  "Risk Signal":     { desc:"A flagged anomaly or risk indicator.",            props:["signal_id","type","severity","detected_at"] },
  "Hold":            { desc:"A regulatory or fraud hold on an account.",       props:["hold_id","reason","placed_on","cleared_on"] },
  "Compliance Case": { desc:"An open regulatory or compliance investigation.", props:["case_id","regulator","status","opened_on"] },
  "Patient":         { desc:"An individual receiving care.",                   props:["patient_id","dob","mrn","primary_provider"] },
  "Provider":        { desc:"A clinician, practice or facility.",              props:["provider_id","npi","specialty","facility"] },
  "Encounter":       { desc:"A clinical visit or interaction.",                props:["encounter_id","type","date","provider_id"] },
  "Diagnosis":       { desc:"A coded clinical condition.",                     props:["diagnosis_id","icd10","date","severity"] },
  "Claim":           { desc:"A healthcare insurance claim.",                   props:["claim_id","amount","status","filed_on"] },
  "Outcome":         { desc:"A measured clinical or operational result.",      props:["outcome_id","measure","value","date"] },
  "Order":           { desc:"A customer purchase transaction.",                props:["order_id","total","status","placed_at","channel"] },
  "Product":         { desc:"A sellable SKU or service.",                      props:["sku","name","category","price","status"] },
  "Shipment":        { desc:"A fulfilment shipment.",                          props:["shipment_id","carrier","tracking","status","shipped_at"] },
  "Return":          { desc:"A returned order or item.",                       props:["return_id","reason","amount","status"] },
  "Inventory":       { desc:"On-hand stock at a location.",                    props:["sku","location","on_hand","reserved"] },
  "Supplier":        { desc:"A vendor of materials or services.",              props:["supplier_id","name","tier","status"] },
  "Purchase Order":  { desc:"A procurement contract.",                         props:["po_id","amount","supplier_id","status"] },
  "Item":            { desc:"A material or part SKU.",                         props:["item_id","name","uom","cost"] },
  "BOM":             { desc:"A bill of materials for an assembly.",            props:["bom_id","parent_item","components","revision"] },
  "Plant":           { desc:"A manufacturing facility.",                       props:["plant_id","name","region","capacity"] },
  "GL Account":      { desc:"A general-ledger account.",                       props:["gl_code","name","type","currency"] },
  "Journal Entry":   { desc:"A double-entry ledger posting.",                  props:["je_id","date","debit","credit","memo"] },
  "Payment":         { desc:"A payment instrument settlement.",                props:["payment_id","amount","method","received_at"] },
  "Control":         { desc:"A compliance or audit control.",                  props:["control_id","name","framework","owner"] },
  "Policy":          { desc:"A governance or risk policy.",                    props:["policy_id","name","version","effective"] },
  "Employee":        { desc:"A person on the payroll.",                        props:["employee_id","name","email","title","manager_id"] },
  "Role":            { desc:"A defined job role.",                             props:["role_id","title","level","department"] },
  "Team":            { desc:"An organisational unit.",                         props:["team_id","name","function","leader_id"] },
  "Manager Chain":   { desc:"Cached reporting hierarchy.",                     props:["employee_id","chain","depth"] },
  "Compensation":    { desc:"Pay and equity data.",                            props:["base","bonus","equity","effective"] },
  "Store":           { desc:"A physical retail location.",                     props:["store_id","name","format","region"] },
  "Loyalty Account": { desc:"A customer loyalty membership.",                  props:["loyalty_id","tier","points","since"] },
  "Promotion":       { desc:"A marketing offer or campaign.",                  props:["promo_id","name","discount","valid_until"] },
  "Contract":        { desc:"A binding commercial agreement.",                 props:["contract_id","arr","start","end","status"] },
  "Asset":           { desc:"A managed company asset.",                        props:["asset_id","type","assignee","status"] },
  "Location":        { desc:"A physical or logical place.",                    props:["location_id","name","region","type"] },
  "Device":          { desc:"An issued endpoint or laptop.",                   props:["device_id","model","serial","assignee"] },
  "Access Grant":    { desc:"A system or resource permission.",                props:["grant_id","resource","level","granted_on"] },
  "Tenure":          { desc:"Cached service-length facts.",                    props:["employee_id","years","start_date"] }
};
function entityMeta(name){ return ENTITY_META[name] || { desc:"Custom entity — you can describe it once the graph is live.", props:[] }; }

// Curated starting points — each suggests entities and edges for an industry+function combo
var GRAPH_STARTING_POINTS = [
  // ── Enterprise-wide / cross-functional ─────────────────────────────────
  { id:"enterprise-core", industry:["any","saas","fintech","retail","manufacturing","professional","media","public","logistics","healthcare"], fn:["enterprise","data-platform"],
    name:"Enterprise Context Graph", more:14,
    desc:"The cross-functional layer every team queries: Customer, Employee, Product, Account, Finance and Asset all in one model.",
    entities:["Customer","Account","Employee","Team","Product","Invoice","Contract","Asset","Location"],
    edges:[["Customer","HAS","Account"],["Account","HOLDS","Contract"],["Contract","BILLED_AS","Invoice"],["Employee","MEMBER_OF","Team"],["Employee","OWNS","Account"],["Product","SOLD_AT","Location"],["Account","USES","Product"],["Asset","ASSIGNED_TO","Employee"]],
    accent:"var(--ink)" },
  { id:"retail-enterprise", industry:["retail"], fn:["enterprise"],
    name:"Retail Enterprise Graph", more:12,
    desc:"Stores, staff, customers, orders, products, inventory, loyalty and promotions — the operating model of a retail org connected end-to-end.",
    entities:["Store","Employee","Customer","Order","Product","Inventory","Loyalty Account","Promotion","Shipment"],
    edges:[["Customer","SHOPS_AT","Store"],["Employee","WORKS_AT","Store"],["Customer","PLACED","Order"],["Order","CONTAINS","Product"],["Product","STOCKED_IN","Inventory"],["Inventory","HELD_AT","Store"],["Customer","ENROLLED_IN","Loyalty Account"],["Order","APPLIES","Promotion"],["Order","SHIPPED_AS","Shipment"]],
    accent:"var(--gold)" },
  { id:"employee-360", industry:["any","saas","fintech","retail","manufacturing","professional","media","public","logistics","healthcare"], fn:["enterprise","people"],
    name:"Employee 360 Graph", more:9,
    desc:"The full workforce view — employees, roles, teams, manager chains, compensation, issued devices, system access and tenure facts.",
    entities:["Employee","Role","Team","Manager Chain","Compensation","Device","Access Grant","Tenure"],
    edges:[["Employee","HOLDS","Role"],["Employee","MEMBER_OF","Team"],["Employee","REPORTS_TO","Manager Chain"],["Employee","PAID_VIA","Compensation"],["Employee","USES","Device"],["Employee","GRANTED","Access Grant"],["Employee","HAS","Tenure"]],
    accent:"var(--blue)" },

  // ── Function-focused ───────────────────────────────────────────────────
  { id:"saas-revenue",   industry:["saas"],          fn:["revenue","customer"],    name:"Customer Revenue Graph", more:8, desc:"Account-led B2B: pipeline → subscription → expansion. Joins the sales motion to product telemetry.",
    entities:["Account","Contact","Opportunity","Subscription","Invoice","Usage Event","Ticket"],
    edges:[["Account","HAS_CONTACT","Contact"],["Account","HAS_OPPORTUNITY","Opportunity"],["Account","SUBSCRIBES_TO","Subscription"],["Subscription","BILLED_AS","Invoice"],["Account","EMITS","Usage Event"],["Account","OPENED","Ticket"]],
    accent:"var(--blue)" },
  { id:"saas-success",   industry:["saas"],          fn:["customer","operations"], name:"Customer Health Graph",  more:6, desc:"Brings health scores, tickets, NPS and usage trends into one canonical Customer entity.",
    entities:["Account","Customer","Ticket","Interaction","Health Score","Renewal"],
    edges:[["Account","HAS_CUSTOMER","Customer"],["Customer","OPENED","Ticket"],["Customer","HAD","Interaction"],["Customer","SCORED_AS","Health Score"],["Account","RENEWS_AS","Renewal"]],
    accent:"var(--green)" },
  { id:"fintech-risk",   industry:["fintech"],       fn:["risk","operations"],     name:"Customer Risk Graph",    more:10, desc:"Customer → Account → Transaction with KYC, fraud signals and regulatory holds.",
    entities:["Customer","Account","Transaction","Risk Signal","Hold","Compliance Case"],
    edges:[["Customer","HOLDS","Account"],["Account","RECORDS","Transaction"],["Transaction","RAISES","Risk Signal"],["Account","SUBJECT_TO","Hold"],["Risk Signal","ESCALATES_TO","Compliance Case"]],
    accent:"var(--coral)" },
  { id:"healthcare-ops", industry:["healthcare"],    fn:["operations","customer"], name:"Patient Journey Graph",  more:11, desc:"Patient encounters joined with providers, claims, diagnoses and outcomes.",
    entities:["Patient","Provider","Encounter","Diagnosis","Claim","Outcome"],
    edges:[["Patient","SAW","Provider"],["Patient","HAD","Encounter"],["Encounter","RESULTED_IN","Diagnosis"],["Encounter","BILLED_VIA","Claim"],["Diagnosis","TRACKED_AS","Outcome"]],
    accent:"var(--purple)" },
  { id:"retail-commerce",industry:["retail"],        fn:["revenue","operations"],  name:"Order Fulfilment Graph", more:7, desc:"Customer → Order → Product → Shipment → Return, with inventory and pricing linked in.",
    entities:["Customer","Order","Product","Shipment","Return","Inventory"],
    edges:[["Customer","PLACED","Order"],["Order","CONTAINS","Product"],["Order","SHIPPED_AS","Shipment"],["Order","RETURNED_AS","Return"],["Product","STOCKED_IN","Inventory"]],
    accent:"var(--gold)" },
  { id:"manufacturing",  industry:["manufacturing"], fn:["operations"],            name:"Supply Production Graph", more:9, desc:"Suppliers, purchase orders, bills of material and inventory across plants.",
    entities:["Supplier","Purchase Order","Item","BOM","Plant","Inventory"],
    edges:[["Supplier","FULFILS","Purchase Order"],["Purchase Order","CONTAINS","Item"],["Item","COMPONENT_OF","BOM"],["BOM","ASSEMBLED_AT","Plant"],["Plant","HOLDS","Inventory"]],
    accent:"var(--green)" },
  { id:"finance-ledger", industry:["saas","fintech","retail","professional"], fn:["finance"], name:"Finance Ledger Graph", more:8,
    desc:"GL accounts, journal entries, invoices and the policies & controls auditing them.",
    entities:["GL Account","Journal Entry","Invoice","Payment","Control","Policy"],
    edges:[["Journal Entry","POSTS_TO","GL Account"],["Invoice","SETTLED_BY","Payment"],["GL Account","GOVERNED_BY","Control"],["Control","ENFORCES","Policy"]],
    accent:"var(--green)" },
  { id:"people-graph",   industry:["saas","fintech","healthcare","retail","manufacturing","logistics","media","professional","public"], fn:["people"], name:"People Workforce Graph", more:6,
    desc:"Employees, roles, teams, managers and tenure — the org substrate every other graph leans on.",
    entities:["Employee","Role","Team","Manager Chain","Compensation"],
    edges:[["Employee","HOLDS","Role"],["Employee","MEMBER_OF","Team"],["Employee","REPORTS_TO","Manager Chain"],["Employee","PAID_VIA","Compensation"]],
    accent:"var(--blue)" }
];

// Tiny stroke-based glyphs for each function in the dropdown.
// 16×16 viewBox, currentColor strokes — rendered white on the coloured tile.
function FunctionIcon({ id, size }) {
  var s = size || 16;
  var p = { width:s, height:s, viewBox:"0 0 16 16", fill:"none", stroke:"currentColor", strokeWidth:"1.4", strokeLinecap:"round", strokeLinejoin:"round" };
  switch (id) {
    case "enterprise":
      return <svg {...p}><rect x="2" y="2" width="5" height="5" rx="0.5"/><rect x="9" y="2" width="5" height="5" rx="0.5"/><rect x="2" y="9" width="5" height="5" rx="0.5"/><rect x="9" y="9" width="5" height="5" rx="0.5"/></svg>;
    case "revenue":
      return <svg {...p}><polyline points="2,12 6,8 9,10 14,4"/><polyline points="10,4 14,4 14,8"/></svg>;
    case "customer":
      return <svg {...p}><path d="M8 13.5 S2.5 10.5 2.5 6.5 a3 3 0 0 1 5.5 -1.5 a3 3 0 0 1 5.5 1.5 c0 4 -5.5 7 -5.5 7 z"/></svg>;
    case "support":
      return <svg {...p}><path d="M3 11 v-2 a5 5 0 0 1 10 0 v2"/><rect x="2" y="10" width="3" height="4" rx="0.7"/><rect x="11" y="10" width="3" height="4" rx="0.7"/><path d="M13 14 v0.5 a1.5 1.5 0 0 1 -1.5 1.5 H9"/></svg>;
    case "marketing":
      return <svg {...p}><path d="M3 6 v4 l8 3 v-10 z"/><path d="M3 6 H1.5 v4 H3"/><path d="M11 5 v6"/></svg>;
    case "product-mgmt":
      return <svg {...p}><path d="M8 2 a4 4 0 0 0 -2.5 7.2 V11 h5 V9.2 A4 4 0 0 0 8 2 z"/><line x1="6" y1="13" x2="10" y2="13"/><line x1="6.5" y1="15" x2="9.5" y2="15"/></svg>;
    case "engineering":
      return <svg {...p}><polyline points="5,4 1.5,8 5,12"/><polyline points="11,4 14.5,8 11,12"/><line x1="9.5" y1="3" x2="6.5" y2="13"/></svg>;
    case "operations":
      return <svg {...p}><circle cx="8" cy="8" r="2.5"/><path d="M8 1 v2 M8 13 v2 M1 8 h2 M13 8 h2 M3.2 3.2 l1.4 1.4 M11.4 11.4 l1.4 1.4 M3.2 12.8 l1.4 -1.4 M11.4 4.6 l1.4 -1.4"/></svg>;
    case "supply-chain":
      return <svg {...p}><rect x="1.5" y="6" width="7" height="6" rx="0.5"/><path d="M8.5 7.5 H12 l2.5 2.5 V12 H8.5 z"/><circle cx="4.5" cy="13" r="1"/><circle cx="11.5" cy="13" r="1"/></svg>;
    case "finance":
      return <svg {...p}><path d="M11 4.5 a3 3 0 0 0 -3 -1.5 c-1.7 0 -3 1 -3 2.5 s1.3 2 3 2.5 s3 1 3 2.5 s-1.3 2.5 -3 2.5 a3 3 0 0 1 -3 -1.5"/><line x1="8" y1="1.5" x2="8" y2="14.5"/></svg>;
    case "people":
      return <svg {...p}><circle cx="5.5" cy="5.5" r="2"/><circle cx="11" cy="6.5" r="1.6"/><path d="M2 13 v-1.5 a2.5 2.5 0 0 1 2.5 -2.5 H6.5 a2.5 2.5 0 0 1 2.5 2.5 V13"/><path d="M9.5 13 v-1 a2 2 0 0 1 2 -2 H11.5 a2 2 0 0 1 2 2 V13"/></svg>;
    case "legal":
      return <svg {...p}><line x1="8" y1="2" x2="8" y2="14"/><path d="M4 4 H12 M3 9 L5 4 L7 9 z M9 9 L11 4 L13 9 z"/><line x1="5.5" y1="14" x2="10.5" y2="14"/></svg>;
    case "risk":
      return <svg {...p}><path d="M8 1.5 L13.5 4 V8 c0 3 -2.5 5.5 -5.5 6.5 c-3 -1 -5.5 -3.5 -5.5 -6.5 V4 z"/><line x1="8" y1="6" x2="8" y2="9"/><circle cx="8" cy="11" r="0.4" fill="currentColor"/></svg>;
    case "it-security":
      return <svg {...p}><rect x="3" y="7" width="10" height="7" rx="1"/><path d="M5 7 V4.5 a3 3 0 0 1 6 0 V7"/><circle cx="8" cy="10.5" r="0.8"/></svg>;
    case "data-platform":
      return <svg {...p}><ellipse cx="8" cy="3.5" rx="5" ry="1.6"/><path d="M3 3.5 V7 a5 1.6 0 0 0 10 0 V3.5"/><path d="M3 7 V10.5 a5 1.6 0 0 0 10 0 V7"/><path d="M3 10.5 V13 a5 1.6 0 0 0 10 0 V10.5"/></svg>;
    case "analytics":
      return <svg {...p}><line x1="2" y1="13.5" x2="14" y2="13.5"/><rect x="3" y="8" width="2" height="5"/><rect x="7" y="5" width="2" height="8"/><rect x="11" y="9.5" width="2" height="3.5"/></svg>;
    case "biz-ops":
      return <svg {...p}><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="0.6" fill="currentColor"/></svg>;
    case "partner":
      return <svg {...p}><path d="M3 7 L5.5 4.5 L8 7 L5.5 9.5 z"/><path d="M8 7 L10.5 4.5 L13 7 L10.5 9.5 z"/><path d="M5.5 9.5 V12 M10.5 9.5 V12"/></svg>;
    case "facilities":
      return <svg {...p}><rect x="3" y="5" width="10" height="9"/><line x1="3" y1="5" x2="8" y2="2" /><line x1="13" y1="5" x2="8" y2="2"/><rect x="6.5" y="9" width="3" height="5"/></svg>;
    case "comms":
      return <svg {...p}><path d="M2.5 4 H13.5 v6 H9 L6 13 V10 H2.5 z"/></svg>;
    default:
      return <svg {...p}><circle cx="8" cy="8" r="6"/></svg>;
  }
}

function NewGraphFlow({ onClose, onCreate }) {
  var [step, setStep]        = useState(1);
  var [industry, setIndustry] = useState(null);
  var [func, setFunc]         = useState(null);
  var [startId, setStartId]   = useState(null);
  var [included, setIncluded] = useState({}); // entity name → boolean
  var [customEntities, setCustomEntities] = useState([]); // [{ name, desc, props:[] }]
  var [addingEntity, setAddingEntity]     = useState(false);
  var [newEntityName, setNewEntityName]   = useState("");
  var [newEntityDesc, setNewEntityDesc]   = useState("");
  var [graphName, setGraphName]       = useState("");
  var [graphDesc, setGraphDesc]       = useState("");
  var [environment, setEnvironment]   = useState("production");
  var [owner, setOwner]               = useState("morgan.lee");
  var [permsRead,  setPermsRead]      = useState([{ kind:"group", id:"everyone",       label:"Everyone in org" }]);
  var [permsWrite, setPermsWrite]     = useState([{ kind:"group", id:"data-platform",  label:"data-platform team" }]);
  var [permsAdmin, setPermsAdmin]     = useState([{ kind:"user",  id:"morgan.lee",     label:"Morgan Lee (you)" }]);

  var stepNames = ["Context", "Starting point", "Customise", "Identity & access", "Review"];

  // Filter + rank suggestions by current industry + function. Both axes match → higher relevance.
  var suggestions = GRAPH_STARTING_POINTS.map(function(sp){
    var indMatch  = industry ? sp.industry.indexOf(industry) >= 0 : false;
    var funcMatch = func     ? sp.fn.indexOf(func)           >= 0 : false;
    var indOk     = !industry || indMatch || sp.industry.indexOf("any") >= 0;
    var funcOk    = !func     || funcMatch;
    var include   = (!industry && !func) || indOk || funcOk;
    var score     = (indMatch ? 2 : 0) + (funcMatch ? 2 : 0) + (sp.industry.indexOf("any") >= 0 ? 0.5 : 0);
    return include ? Object.assign({}, sp, { _score: score, _exactInd: indMatch, _exactFn: funcMatch }) : null;
  }).filter(Boolean).sort(function(a, b){ return b._score - a._score; });

  var picked = startId === "__blank" ? null : GRAPH_STARTING_POINTS.find(function(s){ return s.id === startId; });
  var includedFromBlueprint = picked ? picked.entities.filter(function(e){ return included[e] !== false; }) : [];
  var entitiesToInclude     = includedFromBlueprint.concat(customEntities.map(function(c){ return c.name; }));

  function canContinue() {
    if (step === 1) return !!industry || !!func;
    if (step === 2) return !!startId;
    if (step === 3) return entitiesToInclude.length > 0 || startId === "__blank";
    if (step === 4) return graphName.trim().length >= 2;
    return true;
  }

  function pickStart(id) {
    setStartId(id);
    setCustomEntities([]);
    var sp = GRAPH_STARTING_POINTS.find(function(s){ return s.id === id; });
    if (sp) {
      var inc = {};
      sp.entities.forEach(function(e){ inc[e] = true; });
      setIncluded(inc);
      if (!graphName) setGraphName(sp.name);
      if (!graphDesc) setGraphDesc(sp.desc);
    } else if (id === "__blank") {
      setIncluded({});
      if (!graphName) setGraphName("");
      if (!graphDesc) setGraphDesc("");
    }
  }

  function commitNewEntity() {
    var nm = newEntityName.trim();
    if (!nm) return;
    setCustomEntities(function(arr){ return arr.concat([{ name: nm, desc: newEntityDesc.trim() || "Custom entity added during setup.", props:[] }]); });
    setNewEntityName(""); setNewEntityDesc(""); setAddingEntity(false);
  }

  var inp = { border:"1px solid var(--line)", borderRadius:7, padding:"8px 11px", fontSize:13, fontFamily:"inherit", color:"var(--ink)", background:"var(--panel)", outline:"none", boxSizing:"border-box", width:"100%", boxShadow:"inset 0 1px 0 rgba(255,255,255,0.6)" };
  var lbl = { display:"block", fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:6 };

  // Mini SVG preview of the picked starting point's entities + edges
  function StartingPointPreview({ sp }) {
    if (!sp) {
      return (
        <div style={{ padding:"40px 12px", textAlign:"center", color:"var(--ink-3)", fontSize:11.5, fontStyle:"italic" }}>Blank canvas — nothing pre-defined</div>
      );
    }
    var W = 280, H = 180;
    var cx = W/2, cy = H/2;
    var n = sp.entities.length;
    var positioned = sp.entities.map(function(name, i){
      var a = (i / n) * Math.PI * 2 - Math.PI / 2;
      var r = Math.min(W, H) * 0.34;
      return { name: name, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    });
    var byName = {}; positioned.forEach(function(p){ byName[p.name] = p; });
    return (
      <svg width="100%" height={H} viewBox={"0 0 " + W + " " + H} preserveAspectRatio="xMidYMid meet">
        <g stroke={sp.accent} strokeOpacity="0.45" strokeWidth="0.8">
          {sp.edges.map(function(e, i){
            var a = byName[e[0]], b = byName[e[2]];
            if (!a || !b) return null;
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </g>
        <g>
          {positioned.map(function(p, i){
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="14" fill={sp.accent} fillOpacity="0.18" stroke={sp.accent} strokeWidth="1.2" />
                <text x={p.x} y={p.y + 26} textAnchor="middle" style={{ fontFamily:"JetBrains Mono", fontSize:"8.5px", fill:"var(--ink-2)" }}>{p.name.length > 14 ? p.name.slice(0, 12) + "…" : p.name}</text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  }

  var DIRECTORY = [
    { kind:"group", id:"everyone",        label:"Everyone in org" },
    { kind:"group", id:"data-platform",   label:"data-platform team" },
    { kind:"group", id:"customer-ops",    label:"customer-ops team" },
    { kind:"group", id:"finance-ops",     label:"finance-ops team" },
    { kind:"group", id:"engineering",     label:"engineering team" },
    { kind:"group", id:"security",        label:"security team" },
    { kind:"user",  id:"morgan.lee",      label:"Morgan Lee" },
    { kind:"user",  id:"ramin.k",         label:"Ramin K" },
    { kind:"user",  id:"jordan.s",        label:"Jordan S" }
  ];

  function RichDropdown({ value, onChange, options, placeholder, kind }) {
    var [open, setOpen] = useState(false);
    var sel = options.find(function(o){ return o.id === value; });
    function tileBg(o){ return o.accent || (o.enterprise ? "var(--ink)" : "var(--ink-3)"); }
    function tileContent(o, sz){
      if (kind === "function") return <FunctionIcon id={o.id} size={Math.round(sz * 0.55)} />;
      return <span style={{ fontFamily:"JetBrains Mono", fontSize: sz <= 28 ? 10 : 11, fontWeight:700, letterSpacing:"0.5px" }}>{o.code}</span>;
    }
    return (
      <div style={{ position:"relative" }}>
        <button onClick={function(){ setOpen(function(o){ return !o; }); }}
          style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"12px 14px", border:"1px solid " + (sel ? "var(--ink-2)" : "var(--line)"), borderRadius:9, background: sel ? "var(--bg-canvas)" : "var(--panel)", cursor:"pointer", fontFamily:"inherit", textAlign:"left", boxShadow: sel ? "0 0 0 2px color-mix(in oklab, var(--ink) 7%, transparent)" : "inset 0 1px 0 rgba(255,255,255,0.6)" }}>
          {sel ? (
            <>
              <span style={{ width:34, height:34, borderRadius:7, background:tileBg(sel), color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{tileContent(sel, 34)}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)" }}>{sel.label}</div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{sel.desc}</div>
              </div>
              {sel.enterprise && <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"2px 6px", borderRadius:4, background:"var(--ink)", color:"var(--bg-canvas)", fontWeight:700, letterSpacing:"0.5px" }}>ENTERPRISE</span>}
              <span style={{ color:"var(--ink-3)", fontSize:11, fontFamily:"JetBrains Mono" }}>▾</span>
            </>
          ) : (
            <>
              <span style={{ width:34, height:34, borderRadius:7, background:"var(--chip)", border:"1px dashed var(--line)", color:"var(--ink-4)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:14, flexShrink:0 }}>+</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, color:"var(--ink-3)" }}>{placeholder}</div>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)", marginTop:2 }}>Click to choose</div>
              </div>
              <span style={{ color:"var(--ink-3)", fontSize:11, fontFamily:"JetBrains Mono" }}>▾</span>
            </>
          )}
        </button>
        {open && (
          <>
            <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:99 }} onClick={function(){ setOpen(false); }} />
            <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:100, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 14px 38px rgba(0,0,0,0.18)", padding:6, maxHeight:380, overflowY:"auto" }}>
              {options.map(function(o, i){
                var isSel = value === o.id;
                return (
                  <button key={o.id} onClick={function(){ onChange(o.id); setOpen(false); }}
                    style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"9px 12px", borderRadius:7, border:"none", background: isSel ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left", marginBottom: i < options.length-1 ? 2 : 0 }}
                    onMouseEnter={function(e){ if (!isSel) e.currentTarget.style.background = "var(--panel-2)"; }}
                    onMouseLeave={function(e){ if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{ width:30, height:30, borderRadius:6, background:tileBg(o), color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{tileContent(o, 30)}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>{o.label}</span>
                        {o.enterprise && <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, padding:"1px 5px", borderRadius:3, background:"var(--ink)", color:"var(--bg-canvas)", fontWeight:700, letterSpacing:"0.5px" }}>ENTERPRISE</span>}
                      </div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:2, lineHeight:1.4 }}>{o.desc}</div>
                    </div>
                    {isSel && <span style={{ color:"var(--green)", fontWeight:700, fontSize:13 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  function PermRow({ k, label, list, setList, tone, desc }) {
    var [open, setOpen] = useState(false);
    function toggle(entry){
      setList(function(arr){
        var exists = arr.find(function(x){ return x.kind === entry.kind && x.id === entry.id; });
        if (exists) return arr.filter(function(x){ return !(x.kind === entry.kind && x.id === entry.id); });
        return arr.concat([entry]);
      });
    }
    return (
      <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--line-2)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, padding:"2px 7px", borderRadius:4, background:tone.bg, color:tone.fg, fontWeight:700, letterSpacing:"0.5px" }}>{k.toUpperCase()}</span>
              <span style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>{label}</span>
            </div>
            <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3 }}>{desc}</div>
          </div>
          <div style={{ position:"relative" }}>
            <button onClick={function(){ setOpen(function(o){ return !o; }); }} className="btn-ghost" style={{ fontSize:11.5 }}>+ Add</button>
            {open && (
              <>
                <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:99 }} onClick={function(){ setOpen(false); }} />
                <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:100, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:9, boxShadow:"0 8px 28px rgba(0,0,0,0.14)", padding:5, minWidth:240, maxHeight:280, overflowY:"auto" }}>
                  {DIRECTORY.map(function(d){
                    var selected = list.find(function(x){ return x.kind === d.kind && x.id === d.id; });
                    return (
                      <button key={d.kind + "_" + d.id} onClick={function(){ toggle(d); }}
                        style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"6px 8px", borderRadius:5, border:"none", background: selected ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", fontSize:12, color:"var(--ink)", textAlign:"left" }}>
                        <span style={{ width:16, height:16, borderRadius: d.kind === "user" ? "50%" : 3, background: d.kind === "user" ? "var(--ink-2)" : "var(--ink-3)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:8, fontWeight:700, flexShrink:0 }}>{d.kind === "user" ? d.label.split(" ").map(function(s){ return s[0]; }).join("").slice(0,2) : "G"}</span>
                        <span style={{ flex:1 }}>{d.label}</span>
                        {selected && <span style={{ color:"var(--green)", fontWeight:700 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
          {list.length === 0 && <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-4)", fontStyle:"italic" }}>nobody</span>}
          {list.map(function(e, i){
            return (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 5px 3px 7px", borderRadius:5, background:"var(--chip)", border:"1px solid var(--line-2)", fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-2)" }}>
                <span style={{ width:12, height:12, borderRadius: e.kind === "user" ? "50%" : 3, background: e.kind === "user" ? "var(--ink-2)" : "var(--ink-3)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:7.5, fontWeight:700 }}>{e.kind === "user" ? e.label.split(" ").map(function(s){ return s[0]; }).join("").slice(0,2) : "G"}</span>
                {e.label}
                <button onClick={function(){ setList(function(arr){ return arr.filter(function(x){ return !(x.kind === e.kind && x.id === e.id); }); }); }} style={{ background:"none", border:"none", color:"var(--ink-3)", cursor:"pointer", padding:0, fontSize:12, lineHeight:1 }}>×</button>
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.42)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={function(e){ if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width:"96vw", maxWidth:1480, height:"96vh", background:"var(--bg-canvas)", borderRadius:12, border:"1px solid var(--line)", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.32)" }}>

        {/* HEADER */}
        <div style={{ flexShrink:0, height:56, borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", background:"var(--panel)" }}>
          <div>
            <div style={{ fontFamily:"Instrument Serif", fontSize:20, color:"var(--ink)" }}>{graphName || "Untitled graph"}</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid var(--line)", background:"none", cursor:"pointer", fontSize:15, color:"var(--ink-3)" }}>✕</button>
        </div>

        <div style={{ flex:1, display:"grid", gridTemplateColumns:"240px minmax(0, 1fr)", minHeight:0 }}>

          {/* SIDEBAR */}
          <div style={{ background:"var(--panel-2)", borderRight:"1px solid var(--line)", padding:"20px 14px", display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
            {stepNames.map(function(nm, i){
              var n = i + 1;
              var isOn = step === n;
              var isDone = step > n;
              var indLabel  = (GRAPH_INDUSTRIES.find(function(x){ return x.id === industry; }) || {}).label;
              var funcLabel = (GRAPH_FUNCTIONS.find(function(x){ return x.id === func; }) || {}).label;
              var sub = n === 1 ? (industry || func ? [indLabel, funcLabel].filter(Boolean).join(" · ") : "Industry & function")
                      : n === 2 ? (startId === "__blank" ? "Blank canvas" : picked ? picked.name : "Pick a starting point")
                      : n === 3 ? (entitiesToInclude.length === 0 ? "Add entities" : entitiesToInclude.length + " entities" + (customEntities.length ? " (" + customEntities.length + " custom)" : ""))
                      : n === 4 ? (graphName || "Name + access")
                      : "Activate";
              return (
                <button key={n} onClick={function(){ if (n < step || canContinue()) setStep(n); }}
                  style={{ display:"flex", gap:12, padding:"10px 12px", borderRadius:7, border: isOn ? "1px solid var(--line)" : "1px solid transparent", background: isOn ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                  <span style={{ width:22, height:22, borderRadius:"50%", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), background: isDone ? "var(--green)" : isOn ? "var(--ink)" : "var(--bg-canvas)", color: isDone || isOn ? "var(--bg-canvas)" : "var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:10, fontWeight:700, flexShrink:0 }}>{isDone ? "✓" : n}</span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, color:"var(--ink)", fontWeight: isOn ? 500 : 400, lineHeight:1.2 }}>{nm}</div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", marginTop:3, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CENTER */}
          <div style={{ padding:"24px 32px 28px", overflowY:"auto" }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.8px", color:"var(--ink-3)", textTransform:"uppercase", marginBottom:5 }}>{"STEP " + step + " / 5"}</div>
              <div style={{ fontFamily:"Instrument Serif", fontSize:28, color:"var(--ink)", lineHeight:1.1, marginBottom:8 }}>{stepNames[step-1]}</div>
              <div style={{ fontSize:13, color:"var(--ink-3)", lineHeight:1.55, maxWidth:680 }}>
                {step === 1 && "Tell us a bit about what you're modelling. We'll use this to suggest a smart starting point — or you can skip and start from scratch."}
                {step === 2 && "Pick a starting point. Each one wires up a sensible default set of entities and edges you can edit. Or start with a blank canvas."}
                {step === 3 && "Trim the suggested entities to just what you need. You can rename them later from the catalog."}
                {step === 4 && "Name the graph, pick the environment, and decide who can read, write, and administer it."}
                {step === 5 && "Last look. Activating drops the graph into the workspace landing page."}
              </div>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:760 }}>
                <div>
                  <label style={lbl}>INDUSTRY OR SECTOR</label>
                  <RichDropdown
                    value={industry}
                    onChange={function(v){ setIndustry(v); }}
                    options={GRAPH_INDUSTRIES}
                    placeholder="Pick an industry"
                    kind="industry"
                  />
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:8, lineHeight:1.5 }}>The sector you're modelling for. Use "Any / cross-industry" for horizontal use cases.</div>
                </div>

                <div>
                  <label style={lbl}>TEAM OR FUNCTION USING IT</label>
                  <RichDropdown
                    value={func}
                    onChange={function(v){ setFunc(v); }}
                    options={GRAPH_FUNCTIONS}
                    placeholder="Pick a function"
                    kind="function"
                  />
                  <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:8, lineHeight:1.5 }}>Who'll own and query this graph. Choose <b>Entire organisation</b> to spin up an enterprise-wide context graph that crosses team boundaries.</div>
                </div>

              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:10, maxWidth:920 }}>
                {/* Blank canvas — compact row */}
                {(function(){
                  var isOn = startId === "__blank";
                  return (
                    <div onClick={function(){ pickStart("__blank"); }}
                      style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:10, background: isOn ? "var(--bg-canvas)" : "var(--panel)", cursor:"pointer", boxShadow: isOn ? "0 0 0 2px color-mix(in oklab, var(--ink) 7%, transparent)" : "none" }}>
                      <span style={{ width:42, height:42, borderRadius:8, background:"var(--chip)", border:"1px dashed var(--line)", color:"var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:18, fontWeight:300, flexShrink:0 }}>∅</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)" }}>Blank canvas</div>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:3 }}>Start with no entities. Add everything yourself in the catalog.</div>
                      </div>
                      {isOn && <span style={{ color:"var(--green)", fontWeight:700, fontSize:14 }}>✓</span>}
                    </div>
                  );
                })()}

                {suggestions.length === 0 && (
                  <div style={{ padding:"24px 20px", border:"1px dashed var(--line)", borderRadius:10, background:"var(--panel-2)", color:"var(--ink-3)", fontSize:12.5, lineHeight:1.55 }}>
                    No curated starting points for this combination yet — pick "Blank canvas" above and build from scratch.
                  </div>
                )}

                {suggestions.map(function(sp){
                  var isOn = startId === sp.id;
                  var matchTag = sp._exactInd && sp._exactFn ? "PERFECT MATCH" : sp._exactInd ? "INDUSTRY MATCH" : sp._exactFn ? "FUNCTION MATCH" : "GENERIC";
                  var matchColor = sp._exactInd && sp._exactFn ? "var(--green)" : (sp._exactInd || sp._exactFn) ? "var(--blue)" : "var(--ink-4)";
                  var moreCount = sp.more || Math.max(3, Math.round(sp.entities.length * 0.8));
                  return (
                    <div key={sp.id} onClick={function(){ pickStart(sp.id); }}
                      style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"14px 16px", border:"1px solid " + (isOn ? "var(--ink)" : "var(--line)"), borderRadius:10, background: isOn ? "var(--bg-canvas)" : "var(--panel)", boxShadow: isOn ? "0 0 0 2px color-mix(in oklab, var(--ink) 7%, transparent)" : "none", cursor:"pointer" }}>
                      <span style={{ width:42, height:42, borderRadius:8, background:sp.accent, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:11, fontWeight:700, letterSpacing:"0.5px", flexShrink:0 }}>{sp.name.split(" ").map(function(w){ return w[0]; }).join("").slice(0,3).toUpperCase()}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <span style={{ fontSize:14, fontWeight:600, color:"var(--ink)" }}>{sp.name}</span>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:9, padding:"1.5px 6px", borderRadius:3, background:"transparent", color:matchColor, border:"1px solid " + matchColor, fontWeight:700, letterSpacing:"0.5px" }}>{matchTag}</span>
                        </div>
                        <div style={{ fontSize:12.5, color:"var(--ink-3)", lineHeight:1.5, marginTop:5, maxWidth:620 }}>{sp.desc}</div>

                        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:10, alignItems:"center" }}>
                          {sp.entities.map(function(e){
                            return <span key={e} style={{ fontFamily:"JetBrains Mono", fontSize:10.5, padding:"3px 8px", borderRadius:4, background:"var(--chip)", border:"1px solid var(--line-2)", color:"var(--ink-2)" }}>{e}</span>;
                          })}
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, padding:"3px 8px", borderRadius:4, background:"transparent", border:"1px dashed var(--line)", color:"var(--ink-3)", fontWeight:600 }}>+{moreCount}</span>
                        </div>

                        <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:10, fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.3px" }}>
                          <span>{(sp.entities.length + moreCount) + " entities"}</span>
                          <span>·</span>
                          <span>{(sp.edges.length + Math.round(moreCount * 1.2)) + " edges"}</span>
                        </div>
                      </div>
                      {isOn && <span style={{ color:"var(--green)", fontWeight:700, fontSize:14 }}>✓</span>}
                    </div>
                  );
                })}

                <div style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)", marginTop:8, lineHeight:1.5, padding:"10px 14px", background:"var(--panel-2)", border:"1px dashed var(--line-2)", borderRadius:7 }}>
                  Need more entities than the blueprint provides? You'll be able to add custom ones in the next step.
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:920 }}>
                {/* Summary strip */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"var(--panel-2)", border:"1px solid var(--line-2)", borderRadius:8 }}>
                  <div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"0.6px", textTransform:"uppercase" }}>Working from</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)", marginTop:3 }}>{picked ? picked.name : "Blank canvas"}</div>
                  </div>
                  <div style={{ display:"flex", gap:24, fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>
                    <div><span style={{ color:"var(--ink-3)" }}>FROM BLUEPRINT</span> &nbsp;<b>{includedFromBlueprint.length}</b>{picked ? " / " + picked.entities.length : ""}</div>
                    <div><span style={{ color:"var(--ink-3)" }}>CUSTOM ADDED</span> &nbsp;<b>{customEntities.length}</b></div>
                    <div><span style={{ color:"var(--ink-3)" }}>TOTAL</span> &nbsp;<b style={{ color:"var(--ink)" }}>{entitiesToInclude.length}</b></div>
                  </div>
                </div>

                {/* Blueprint entities — one card per row, properties only */}
                {picked && (
                  <div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"0.6px", textTransform:"uppercase", marginBottom:8 }}>Entities from "{picked.name}"</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {picked.entities.map(function(e){
                        var on = included[e] !== false;
                        var m = entityMeta(e);
                        return (
                          <div key={e}
                            style={{ border:"1px solid " + (on ? "var(--line)" : "var(--line-2)"), borderRadius:9, background: on ? "var(--panel)" : "var(--panel-2)", padding:"14px 18px", opacity: on ? 1 : 0.55, display:"grid", gridTemplateColumns:"minmax(220px, 280px) 1fr auto", gap:20, alignItems:"center" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                              <span style={{ width:30, height:30, borderRadius:6, background:picked.accent, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:11, fontWeight:700, flexShrink:0 }}>{e.split(" ").map(function(w){ return w[0]; }).join("").slice(0,2).toUpperCase()}</span>
                              <div style={{ minWidth:0 }}>
                                <div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)" }}>{e}</div>
                                <div style={{ fontSize:11.5, color:"var(--ink-3)", lineHeight:1.4, marginTop:3 }}>{m.desc}</div>
                              </div>
                            </div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:4, alignItems:"center" }}>
                              {m.props.length > 0 ? (
                                <>
                                  {m.props.map(function(p){
                                    return <span key={p} style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 7px", borderRadius:4, background:"var(--chip)", color:"var(--ink-2)" }}>{p}</span>;
                                  })}
                                  <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"3px 7px", borderRadius:4, background:"transparent", border:"1px dashed var(--line)", color:"var(--ink-3)", fontWeight:600 }}>+{4 + (e.length % 7)}</span>
                                </>
                              ) : <span style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", fontStyle:"italic" }}>add properties after create</span>}
                            </div>
                            <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)", letterSpacing:"0.3px" }}>
                              <input type="checkbox" checked={on} onChange={function(){ setIncluded(function(o){ var n = Object.assign({}, o); n[e] = !on; return n; }); }} style={{ accentColor:"var(--ink)", width:14, height:14 }} />
                              <span>{on ? "INCLUDED" : "EXCLUDED"}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom entities — one card per row */}
                {customEntities.length > 0 && (
                  <div>
                    <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"0.6px", textTransform:"uppercase", marginBottom:8 }}>Custom entities you've added</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {customEntities.map(function(c, i){
                        return (
                          <div key={i} style={{ border:"1px solid var(--line)", borderRadius:9, background:"var(--panel)", padding:"14px 18px", display:"grid", gridTemplateColumns:"minmax(220px, 280px) 1fr auto", gap:20, alignItems:"center" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                              <span style={{ width:30, height:30, borderRadius:6, background:"var(--ink-2)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:11, fontWeight:700, flexShrink:0 }}>{c.name.split(" ").map(function(w){ return w[0]; }).join("").slice(0,2).toUpperCase()}</span>
                              <div style={{ minWidth:0 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  <span style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)" }}>{c.name}</span>
                                  <span style={{ fontFamily:"JetBrains Mono", fontSize:8.5, padding:"1px 5px", borderRadius:3, background:"var(--ink)", color:"var(--bg-canvas)", fontWeight:700, letterSpacing:"0.5px" }}>CUSTOM</span>
                                </div>
                                <div style={{ fontSize:11.5, color:"var(--ink-3)", lineHeight:1.4, marginTop:3 }}>{c.desc}</div>
                              </div>
                            </div>
                            <div style={{ fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-4)", fontStyle:"italic" }}>add properties after create</div>
                            <button onClick={function(){ setCustomEntities(function(arr){ return arr.filter(function(_, idx){ return idx !== i; }); }); }}
                              style={{ background:"none", border:"none", color:"var(--ink-3)", cursor:"pointer", fontSize:16, padding:"0 6px" }}>×</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add custom entity */}
                <div style={{ border: addingEntity ? "1px solid var(--ink)" : "1px dashed var(--line)", borderRadius:9, background: addingEntity ? "var(--panel)" : "transparent", padding: addingEntity ? "14px 16px" : "0" }}>
                  {!addingEntity ? (
                    <button onClick={function(){ setAddingEntity(true); }}
                      style={{ width:"100%", padding:"14px 16px", background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"inherit", fontSize:13, color:"var(--ink-2)", fontWeight:500 }}>
                      <span style={{ width:20, height:20, borderRadius:5, background:"var(--ink)", color:"var(--bg-canvas)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, lineHeight:1, fontWeight:300 }}>+</span>
                      Add a custom entity to this graph
                    </button>
                  ) : (
                    <div>
                      <div style={{ fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"0.6px", textTransform:"uppercase", marginBottom:10 }}>Add custom entity</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:10 }}>
                        <input value={newEntityName} onChange={function(e){ setNewEntityName(e.target.value); }} placeholder="Entity name (e.g. Booking)" style={inp} autoFocus />
                        <input value={newEntityDesc} onChange={function(e){ setNewEntityDesc(e.target.value); }} placeholder="Short description — what it represents" style={inp} />
                      </div>
                      <div style={{ display:"flex", gap:8, marginTop:10, justifyContent:"flex-end" }}>
                        <button onClick={function(){ setAddingEntity(false); setNewEntityName(""); setNewEntityDesc(""); }} className="btn-ghost">Cancel</button>
                        <button onClick={commitNewEntity} className="btn-dark" disabled={!newEntityName.trim()} style={{ opacity: newEntityName.trim() ? 1 : 0.45 }}>Add entity</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div style={{ display:"flex", flexDirection:"column", gap:22, maxWidth:780 }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
                  <div>
                    <label style={lbl}>GRAPH NAME</label>
                    <input value={graphName} onChange={function(e){ setGraphName(e.target.value); }} placeholder="e.g. Customer 360 Graph" style={Object.assign({}, inp, { fontSize:15 })} />
                  </div>
                  <div>
                    <label style={lbl}>ENVIRONMENT</label>
                    <select value={environment} onChange={function(e){ setEnvironment(e.target.value); }} style={inp}>
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                      <option value="sandbox">Sandbox</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>DESCRIPTION</label>
                  <textarea value={graphDesc} onChange={function(e){ setGraphDesc(e.target.value); }} rows={2} placeholder="A one-line summary that will appear on the graph card" style={Object.assign({}, inp, { resize:"vertical", lineHeight:1.55 })} />
                </div>
                <div>
                  <label style={lbl}>OWNER</label>
                  <select value={owner} onChange={function(e){ setOwner(e.target.value); }} style={Object.assign({}, inp, { maxWidth:360 })}>
                    <option value="morgan.lee">Morgan Lee (you · data-platform)</option>
                    <option value="ramin.k">Ramin K · data-platform</option>
                    <option value="jordan.s">Jordan S · customer-ops</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>WHO CAN ACCESS THIS GRAPH?</label>
                  <div className="card" style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 1px 0 var(--line-2), 0 4px 14px rgba(40,40,20,0.04)", overflow:"hidden" }}>
                    <PermRow k="read"  label="Read"  list={permsRead}  setList={setPermsRead}  tone={{ bg:"var(--blue-fill)",  fg:"var(--blue)"  }} desc="Can browse this graph and run queries against it." />
                    <PermRow k="write" label="Write" list={permsWrite} setList={setPermsWrite} tone={{ bg:"var(--green-fill)", fg:"var(--green)" }} desc="Can add/edit records and modify schemas." />
                    <PermRow k="admin" label="Admin" list={permsAdmin} setList={setPermsAdmin} tone={{ bg:"var(--coral-fill)", fg:"var(--coral)" }} desc="Can manage rules, sources, and access policies." />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5 — comprehensive */}
            {step === 5 && (
              <div style={{ display:"flex", flexDirection:"column", gap:22, maxWidth:880 }}>
                <div>
                  <div style={{ fontFamily:"Instrument Serif", fontSize:30, color:"var(--ink)", lineHeight:1.1, marginBottom:8 }}>Spin up "{graphName || "your graph"}"?</div>
                  <div style={{ fontSize:13, color:"var(--ink-3)", lineHeight:1.55, maxWidth:600 }}>Once activated it appears in the Context Graphs landing. You can rename, reshape, or delete it any time.</div>
                </div>

                <div className="card" style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 1px 0 var(--line-2), 0 4px 14px rgba(40,40,20,0.04)", overflow:"hidden" }}>
                  <div className="card-head card-head-row" style={{ background:"var(--panel-2)" }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>Summary</span>
                    <span className="card-head-sub">{(picked ? picked.entities.length : 0) + " entities · " + (picked ? picked.edges.length : 0) + " edges"}</span>
                  </div>
                  <div>
                    {[
                      { k:"NAME",         v: graphName || <span style={{ color:"var(--coral)" }}>not set</span> },
                      { k:"DESCRIPTION",  v: graphDesc || <span style={{ color:"var(--ink-4)" }}>—</span> },
                      { k:"ENVIRONMENT",  v: environment },
                      { k:"CONTEXT",      v: industry || func ? ((GRAPH_INDUSTRIES.find(function(x){ return x.id === industry; }) || {}).label || "—") + (func ? " · " + (GRAPH_FUNCTIONS.find(function(x){ return x.id === func; }) || {}).label : "") : "Built from scratch" },
                      { k:"STARTING POINT", v: picked ? picked.name : "Blank canvas" },
                      { k:"ENTITIES",     v: entitiesToInclude.length ? entitiesToInclude.map(function(e){ return <span key={e} style={{ fontFamily:"JetBrains Mono", fontSize:11, padding:"2px 7px", borderRadius:4, background:"var(--chip)", color:"var(--ink-2)", marginRight:4 }}>{e}</span>; }) : <span style={{ color:"var(--ink-4)" }}>none</span> },
                      { k:"OWNER",        v: owner }
                    ].map(function(row, i, arr){
                      return (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"170px 1fr", gap:14, padding:"10px 22px", borderBottom: i < arr.length-1 ? "1px dashed var(--line-2)" : "none", alignItems:"baseline" }}>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10, letterSpacing:"0.5px", color:"var(--ink-3)", textTransform:"uppercase" }}>{row.k}</span>
                          <span style={{ fontSize:13, color:"var(--ink)", textAlign:"right" }}>{row.v}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card" style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"0 1px 0 var(--line-2), 0 4px 14px rgba(40,40,20,0.04)", overflow:"hidden" }}>
                  <div className="card-head card-head-row" style={{ background:"var(--panel-2)" }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>Access</span>
                    <span className="card-head-sub">{"read " + permsRead.length + " · write " + permsWrite.length + " · admin " + permsAdmin.length}</span>
                  </div>
                  <div>
                    {[{ k:"READ", list:permsRead, tone:{ bg:"var(--blue-fill)", fg:"var(--blue)" } },{ k:"WRITE", list:permsWrite, tone:{ bg:"var(--green-fill)", fg:"var(--green)" } },{ k:"ADMIN", list:permsAdmin, tone:{ bg:"var(--coral-fill)", fg:"var(--coral)" } }].map(function(row, i, arr){
                      return (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"100px 1fr", gap:14, padding:"12px 22px", borderBottom: i < arr.length-1 ? "1px dashed var(--line-2)" : "none", alignItems:"center" }}>
                          <span style={{ fontFamily:"JetBrains Mono", fontSize:10, padding:"2px 7px", borderRadius:4, background:row.tone.bg, color:row.tone.fg, fontWeight:700, letterSpacing:"0.5px", justifySelf:"start" }}>{row.k}</span>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:5, justifyContent:"flex-end" }}>
                            {row.list.length === 0 ? <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-4)", fontStyle:"italic" }}>nobody</span> : row.list.map(function(e, j){
                              return (
                                <span key={j} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 7px", borderRadius:5, background:"var(--chip)", border:"1px solid var(--line-2)", fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-2)" }}>
                                  <span style={{ width:12, height:12, borderRadius: e.kind === "user" ? "50%" : 3, background: e.kind === "user" ? "var(--ink-2)" : "var(--ink-3)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"JetBrains Mono", fontSize:7.5, fontWeight:700, flexShrink:0 }}>{e.kind === "user" ? e.label.split(" ").map(function(s){ return s[0]; }).join("").slice(0,2) : "G"}</span>
                                  {e.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* FOOTER */}
        <div style={{ flexShrink:0, padding:"14px 22px", borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--panel)" }}>
          <button className="btn-ghost" onClick={function(){ if (step > 1) setStep(function(s){ return s - 1; }); }} disabled={step === 1} style={{ opacity: step === 1 ? 0.4 : 1 }}>← Back</button>
          <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)" }}>{"Step " + step + " of 5 · " + stepNames[step-1]}</span>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            {step < 5
              ? <button className="btn-dark" disabled={!canContinue()} onClick={function(){ setStep(function(s){ return s + 1; }); }} style={{ opacity: canContinue() ? 1 : 0.45 }}>Continue →</button>
              : <button className="btn-dark" disabled={!canContinue()} onClick={function(){ if (onCreate) onCreate({ name: graphName }); onClose(); }} style={{ opacity: canContinue() ? 1 : 0.45 }}>Create graph ↵</button>
            }
          </div>
        </div>

      </div>
    </div>
  );
}

function GraphLandingView({ onOpenGraph }) {
  var [newGraphOpen, setNewGraphOpen] = useState(false);
  var [view, setView]     = useState("grid"); // grid | list
  var [search, setSearch] = useState("");
  var [sort, setSort]     = useState("active");
  var [sortOpen, setSortOpen] = useState(false);

  var SORT_OPTIONS = [
    { id:"active",    label:"Most active" },
    { id:"nodes",     label:"Most nodes" },
    { id:"recent",    label:"Recently synced" },
    { id:"alpha",     label:"Alphabetical" }
  ];

  var filtered = CONTEXT_GRAPHS.filter(function(g){
    if (!search) return true;
    var q = search.toLowerCase();
    return (g.name + " " + g.desc + " " + g.cat).toLowerCase().indexOf(q) >= 0;
  });

  filtered = filtered.slice().sort(function(a, b){
    if (sort === "nodes")  return b.nodes - a.nodes;
    if (sort === "recent") return parseInt(a.synced) - parseInt(b.synced);
    if (sort === "alpha")  return a.name.localeCompare(b.name);
    return b.agents - a.agents; // active
  });

  var totals = CONTEXT_GRAPHS.reduce(function(acc, g){
    acc.nodes += g.nodes; acc.edges += g.edges; acc.agents += g.agents; acc.health += g.health;
    return acc;
  }, { nodes:0, edges:0, agents:0, health:0 });
  var avgHealth = Math.round(totals.health / CONTEXT_GRAPHS.length);

  function healthColor(h){ return h >= 95 ? "var(--green)" : h >= 90 ? "var(--blue)" : h >= 80 ? "var(--gold)" : "var(--coral)"; }

  return (
    <div style={{ flex:1, overflowY:"auto", background:"var(--bg-canvas)", display:"flex", flexDirection:"column" }}>
      {/* HEADER BAR — like a workspace picker */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, padding:"22px 32px 14px", background:"var(--bg)", borderBottom:"1px solid var(--line-2)" }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:14 }}>
          <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, letterSpacing:"1.6px", color:"var(--ink-3)", padding:"3px 8px", border:"1px solid var(--line)", borderRadius:5, background:"var(--panel-2)" }}>ECG</span>
          <span style={{ fontFamily:"Instrument Serif", fontSize:30, color:"var(--ink)", lineHeight:1, letterSpacing:"-0.3px" }}>Context Graphs</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--ink-3)", pointerEvents:"none" }}>
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={function(e){ setSearch(e.target.value); }} placeholder="Search graphs…" style={{ padding:"7px 12px 7px 32px", border:"1px solid var(--line)", borderRadius:8, fontFamily:"inherit", fontSize:12.5, background:"var(--panel)", color:"var(--ink)", outline:"none", width:260 }} />
          </div>
          {/* View toggle */}
          <div style={{ display:"flex", border:"1px solid var(--line)", borderRadius:8, background:"var(--panel)", padding:2 }}>
            <button onClick={function(){ setView("grid"); }} title="Grid view" style={{ width:30, height:26, border:"none", borderRadius:6, background: view === "grid" ? "var(--bg-canvas)" : "transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color: view === "grid" ? "var(--ink)" : "var(--ink-3)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/></svg>
            </button>
            <button onClick={function(){ setView("list"); }} title="List view" style={{ width:30, height:26, border:"none", borderRadius:6, background: view === "list" ? "var(--bg-canvas)" : "transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color: view === "list" ? "var(--ink)" : "var(--ink-3)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
          <button className="btn-ghost" style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Filter
          </button>
          {/* Sort dropdown */}
          <div style={{ position:"relative" }}>
            <button onClick={function(){ setSortOpen(function(o){ return !o; }); }} className="btn-ghost" style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:"var(--ink-3)" }}>Sort:</span>
              <span>{(SORT_OPTIONS.find(function(o){ return o.id === sort; }) || {}).label}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ transform: sortOpen ? "rotate(180deg)" : "none" }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {sortOpen && (
              <>
                <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:99 }} onClick={function(){ setSortOpen(false); }} />
                <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:100, background:"var(--panel)", border:"1px solid var(--line)", borderRadius:9, boxShadow:"0 8px 28px rgba(0,0,0,0.14)", padding:6, minWidth:180 }}>
                  {SORT_OPTIONS.map(function(o){
                    var isOn = sort === o.id;
                    return <button key={o.id} onClick={function(){ setSort(o.id); setSortOpen(false); }}
                      style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 10px", borderRadius:5, border:"none", background: isOn ? "var(--bg-canvas)" : "transparent", cursor:"pointer", fontFamily:"inherit", fontSize:12.5, color:"var(--ink)", textAlign:"left" }}>
                      <span style={{ flex:1 }}>{o.label}</span>
                      {isOn && <span style={{ color:"var(--green)", fontWeight:700 }}>✓</span>}
                    </button>;
                  })}
                </div>
              </>
            )}
          </div>
          <button className="btn-dark" style={{ padding:"7px 14px" }} onClick={function(){ setNewGraphOpen(true); }}>+ New graph</button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 32px 14px", borderBottom:"1px solid var(--line-2)" }}>
        <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:"var(--ink-3)", letterSpacing:"0.3px" }}>{filtered.length + " of " + CONTEXT_GRAPHS.length + " context graphs"}</span>
        <div style={{ display:"flex", alignItems:"baseline", gap:32 }}>
          {[
            { lbl:"TOTAL NODES",   v: totals.nodes.toLocaleString(),  color:"var(--ink)" },
            { lbl:"TOTAL EDGES",   v: totals.edges.toLocaleString(),  color:"var(--ink)" },
            { lbl:"ACTIVE AGENTS", v: totals.agents.toLocaleString(), color:"var(--ink)" },
            { lbl:"AVG HEALTH",    v: avgHealth + "%",                color: healthColor(avgHealth) }
          ].map(function(k, i){
            return <div key={i} style={{ display:"flex", flexDirection:"column", gap:3, paddingLeft: i > 0 ? 28 : 0, borderLeft: i > 0 ? "1px solid var(--line-2)" : "none" }}>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase" }}>{k.lbl}</span>
              <span style={{ fontFamily:"Instrument Serif", fontSize:22, lineHeight:1, color:k.color }}>{k.v}</span>
            </div>;
          })}
        </div>
      </div>

      {/* GRID */}
      {view === "grid" ? (
        <div style={{ padding:"24px 32px 40px", display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(360px, 1fr))", gap:20 }}>
          {filtered.map(function(g, idx){
            var hColor = healthColor(g.health);
            return (
              <div key={g.id}
                onClick={function(){ onOpenGraph(g.id); }}
                style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease" }}
                onMouseEnter={function(e){ e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(40,40,20,0.08)"; e.currentTarget.style.borderColor = "var(--ink-3)"; }}
                onMouseLeave={function(e){ e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--line)"; }}>
                {/* Mini viz */}
                <div style={{ position:"relative", height:200, background: g.color + "0d" }}>
                  <span style={{ position:"absolute", top:12, left:14, zIndex:2, fontFamily:"JetBrains Mono", fontSize:9.5, letterSpacing:"1.1px", color:"var(--ink-3)", padding:"3px 8px", background:"var(--panel)", border:"1px solid var(--line-2)", borderRadius:4 }}>{g.cat}</span>
                  <span style={{ position:"absolute", top:12, right:14, zIndex:2, fontFamily:"JetBrains Mono", fontSize:11, color: hColor, display:"flex", alignItems:"center", gap:5, fontWeight:600 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background: hColor }} />{g.health + "%"}
                  </span>
                  <div style={{ position:"absolute", inset:0, padding:"36px 14px 14px" }}>
                    <GraphMiniViz seed={g.id.charCodeAt(0) * 977 + g.id.length * 31} color={g.color} />
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding:"18px 22px 18px" }}>
                  <div style={{ fontFamily:"Instrument Serif", fontSize:22, color:"var(--ink)", lineHeight:1.15, marginBottom:8 }}>{g.name}</div>
                  <div style={{ fontSize:12.5, color:"var(--ink-3)", lineHeight:1.55, marginBottom:14, minHeight:36, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{g.desc}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, paddingTop:12, borderTop:"1px dashed var(--line-2)" }}>
                    {[{ k:"NODES", v: g.nodes.toLocaleString() },{ k:"EDGES", v: g.edges.toLocaleString() },{ k:"AGENTS", v: g.agents.toString() }].map(function(it, i){
                      return <div key={i}>
                        <div style={{ fontFamily:"JetBrains Mono", fontSize:9, letterSpacing:"0.6px", color:"var(--ink-3)", textTransform:"uppercase" }}>{it.k}</div>
                        <div style={{ fontFamily:"Instrument Serif", fontSize:17, color:"var(--ink)", marginTop:2, lineHeight:1 }}>{it.v}</div>
                      </div>;
                    })}
                  </div>
                  <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:6, fontFamily:"JetBrains Mono", fontSize:10, color:"var(--ink-3)" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)" }} />
                    <span>Synced {g.synced}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // LIST VIEW
        <div style={{ padding:"20px 32px 40px" }}>
          <div className="nv-table" style={{ margin:0 }}>
            <div style={{ display:"grid", gridTemplateColumns:"2.2fr 110px 110px 120px 90px 80px 130px", gap:14, padding:"10px 22px", background:"var(--panel-2)", borderBottom:"1px solid var(--line)", fontFamily:"JetBrains Mono", fontSize:9.5, color:"var(--ink-3)", letterSpacing:"0.6px", textTransform:"uppercase", alignItems:"center" }}>
              <div>Graph</div><div style={{ textAlign:"right" }}>Nodes</div><div style={{ textAlign:"right" }}>Edges</div><div style={{ textAlign:"right" }}>Agents</div><div style={{ textAlign:"right" }}>Health</div><div>Synced</div><div>Owner</div>
            </div>
            {filtered.map(function(g, i){
              var hColor = healthColor(g.health);
              return (
                <div key={g.id} onClick={function(){ onOpenGraph(g.id); }}
                  style={{ display:"grid", gridTemplateColumns:"2.2fr 110px 110px 120px 90px 80px 130px", gap:14, padding:"13px 22px", borderBottom: i < filtered.length-1 ? "1px solid var(--line-2)" : "none", cursor:"pointer", alignItems:"center", transition:"background 80ms" }}
                  onMouseEnter={function(e){ e.currentTarget.style.background = "var(--panel-2)"; }}
                  onMouseLeave={function(e){ e.currentTarget.style.background = "transparent"; }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:9, height:9, borderRadius:"50%", background:g.color }} />
                      <span style={{ fontSize:13.5, fontWeight:500, color:"var(--ink)" }}>{g.name}</span>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:9, letterSpacing:"0.6px", color:"var(--ink-3)", padding:"1px 6px", background:"var(--chip)", borderRadius:3 }}>{g.cat}</span>
                    </div>
                    <div style={{ fontSize:11.5, color:"var(--ink-3)", marginTop:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.desc}</div>
                  </div>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink-2)", textAlign:"right" }}>{g.nodes.toLocaleString()}</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink-2)", textAlign:"right" }}>{g.edges.toLocaleString()}</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color:"var(--ink-2)", textAlign:"right" }}>{g.agents}</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:11.5, color: hColor, textAlign:"right", fontWeight:600 }}>{g.health + "%"}</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{g.synced}</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:10.5, color:"var(--ink-3)" }}>{g.owner}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {newGraphOpen && <NewGraphFlow onClose={function(){ setNewGraphOpen(false); }} onCreate={function(g){ setNewGraphOpen(false); if (g && g.id) onOpenGraph(g.id); }} />}
    </div>
  );
}

function App() {
  // null = show landing; "ecg" or other graph id = inside that graph
  const [currentGraphId, setCurrentGraphId] = useState(null);
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

  // Landing screen: pre-graph workspace picker
  if (!currentGraphId) {
    return (
      <div className="app">
        <GraphLandingView onOpenGraph={function(id){ setCurrentGraphId(id); setTab("Graph"); setDetailId(null); }} />
      </div>
    );
  }

  var currentGraph = CONTEXT_GRAPHS.find(function(g){ return g.id === currentGraphId; });
  var graphName = currentGraph ? currentGraph.name : (IS_PS_GRAPH ? "Product Specialist Graph" : "Enterprise Context Graph");

  return (
    <div className="app">
      <Header tab={tab} onTab={(t) => { setTab(t); setDetailId(null); }} onAddNode={() => setAddNodeOpen(true)} onBackToLanding={() => setCurrentGraphId(null)} graphName={graphName} />
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
          onAddNode={() => setAddNodeOpen(true)}
        />
      ) : tab === "Edges" ? (
        <GlobalEdgesView />
      ) : tab === "Sources" ? (
        <GlobalSourcesView />
      ) : tab === "Records" ? (
        <RecordsView />
      ) : tab === "Stewardship" ? (
        <StewardshipView />
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
      {addNodeOpen && <AddNodeFlow onClose={() => setAddNodeOpen(false)} />}
    </div>
  );
}

Object.assign(window, { NODES, EDGES, ListGlyph, colorForNode, CAT_META, metricColor });

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
