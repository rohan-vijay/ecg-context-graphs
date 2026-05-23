// node-flow.jsx — Add Node Type wizard
// Primitives from prop-source-flows.jsx (loaded first)

const { useState, useMemo } = React;
const {
  FormRow, StepWrap, WizardShell,
  CustomSelect, SysSelect,
  RadioList, Seg, MultiToken, FlagsRow, BackfillBanner,
  ROLES, GOV_TAGS, DATA_TYPES,
} = window;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const NODE_KINDS = [
  { id: "entity",  label: "Entity",       icon: "○", color: "var(--blue)",   fill: "var(--blue-fill)",   desc: "A domain object — Account, Person, Contract. The nouns of your graph." },
  { id: "agent",   label: "Agent",        icon: "⬡", color: "var(--purple)", fill: "var(--purple-fill)", desc: "An AI reasoning unit that reads the graph and writes back observations or decisions." },
  { id: "source",  label: "Data Source",  icon: "□", color: "var(--green)",  fill: "var(--green-fill)",  desc: "A system of record or pipeline — Salesforce, Snowflake, Kafka. Populates other node types." },
];

const CATEGORIES = [
  { id: "core",    label: "Core",    desc: "Canonical objects every agent and dashboard depends on" },
  { id: "support", label: "Support", desc: "Operational records — tickets, incidents, cases" },
  { id: "derived", label: "Derived", desc: "Computed or inferred objects — scores, signals, risks" },
  { id: "source",  label: "Source",  desc: "Systems of record that feed other node types" },
];

const STATES = [
  { id: "core",     label: "Core",     dot: "var(--blue)",   desc: "Standard entity — no special visual treatment" },
  { id: "signal",   label: "Signal",   dot: "var(--gold)",   desc: "Behavioural event or derived metric — gold diamond glyph" },
  { id: "risk",     label: "Risk",     dot: "var(--gold)",   desc: "Open exposure or vulnerability — gold triangle glyph" },
  { id: "incident", label: "Incident", dot: "var(--coral)",  desc: "Active operational issue — coral exclamation glyph" },
];

const PK_TYPES = [
  { id: "uuid",   label: "uuid",   desc: "RFC 4122 v4 — auto-generated, globally unique" },
  { id: "int",    label: "int",    desc: "Auto-increment integer — for high-frequency write tables" },
  { id: "string", label: "string", desc: "Natural key — e.g. email, slug, external_id" },
];

const POP_KINDS = [
  { id: "source",  label: "Direct from source", tag: "DIRECT",  desc: "Instances loaded from a source-system table or stream." },
  { id: "agent",   label: "Agent-derived",       tag: "AGENT",   desc: "Instances created by an agent's write step." },
  { id: "manual",  label: "Manual / API",        tag: "MANUAL",  desc: "Instances written via the graph API — migration, seed, or on-demand." },
  { id: "computed",label: "Computed from graph", tag: "COMPUTED",desc: "Instances materialised by a Cypher query over existing nodes." },
];

const DOMAIN_OPTS = [
  { id: "customer",     label: "Customer" },
  { id: "revenue",      label: "Revenue" },
  { id: "finance",      label: "Finance" },
  { id: "product",      label: "Product" },
  { id: "support",      label: "Support" },
  { id: "people",       label: "People" },
  { id: "governance",   label: "Governance" },
  { id: "infrastructure",label: "Infrastructure" },
];

const TEAM_OPTS = ["data-platform","fin-ops","cs-platform","governance","applied-ml","billing","growth"].map(t => ({ id: t, label: t }));
const SLO_OPTS  = ["1m","5m","15m","30m","1h","4h","24h","7d"].map(v => ({ id: v, label: v }));

function toPascal(s) {
  return s.replace(/[^a-zA-Z0-9\s]/g, "").split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
}

// ─── FLOW ─────────────────────────────────────────────────────────────────────

const NODE_STEPS = [
  { label: "Identity",   hint: "Label, kind, category"       },
  { label: "Schema",     hint: "PK, state, seed properties"  },
  { label: "Population", hint: "Where instances come from"   },
  { label: "Governance", hint: "Owner, SLO, access, tags"    },
  { label: "Review",     hint: "Migration diff & publish"    },
];

function AddNodeFlow({ onClose }) {
  const [step, setStep] = useState(0);
  const [n, setN] = useState({
    rawLabel: "", description: "", kind: "", category: "core",
    state: "core", pkName: "id", pkType: "uuid", pkAutoGen: true,
    properties: [
      { name: "name",       type: "string",    required: true,  indexed: true,  pii: false },
      { name: "created_at", type: "timestamp", required: true,  indexed: false, pii: false },
      { name: "updated_at", type: "timestamp", required: false, indexed: false, pii: false },
    ],
    popKind: "",
    popSource: "salesforce", popTable: "", popPK: "", popCadence: "5min",
    popAgentId: "", popQuery: "",
    owner: "data-platform", domain: "customer",
    freshnessSLO: "30m", accessRoles: ["read_all"], tags: [],
    changeRisk: "MEDIUM", runbook: "", slack: "",
    stage: "draft", backfill: false,
  });

  const set = patch => setN(v => ({ ...v, ...patch }));
  const label = toPascal(n.rawLabel);
  const labelValid = label.length >= 2 && !(window.NODES || []).some(x => x.label.replace(/\s/g,"") === label);
  const canNext = step === 0 ? (labelValid && !!n.kind) : true;

  const kindMeta = NODE_KINDS.find(k => k.id === n.kind);

  const titleFrom = (
    <span className="flow-title-from">
      {kindMeta ? (
        <svg width="18" height="18" viewBox="-12 -12 24 24">
          {n.kind === "agent"  ? <polygon points="-9,0 -4.5,-7.8 4.5,-7.8 9,0 4.5,7.8 -4.5,7.8" fill={kindMeta.fill} stroke={kindMeta.color} strokeWidth="1.4" /> :
           n.kind === "source" ? <rect x="-8" y="-8" width="16" height="16" rx="1.5" fill={kindMeta.fill} stroke={kindMeta.color} strokeWidth="1.4" /> :
                                 <circle r="8.5" fill={kindMeta.fill} stroke={kindMeta.color} strokeWidth="1.4" />}
        </svg>
      ) : null}
      {label || "New node type"}
    </span>
  );

  return (
    <WizardShell
      eyebrow="SCHEMA · NODE TYPES · NEW"
      titleFrom={titleFrom}
      titleLabel={label && n.kind ? ":" + label : null}
      stage={n.stage}
      steps={NODE_STEPS} step={step} setStep={setStep}
      canNext={canNext}
      onNext={() => setStep(s => s + 1)}
      onPublish={onClose}
      onClose={onClose}
      rightPane={<NodePreview n={n} label={label} kindMeta={kindMeta} labelValid={labelValid} />}
    >
      {step === 0 && <NodeIdentity n={n} set={set} label={label} labelValid={labelValid} />}
      {step === 1 && <NodeSchema n={n} set={set} label={label} />}
      {step === 2 && <NodePopulation n={n} set={set} />}
      {step === 3 && <NodeGovernance n={n} set={set} />}
      {step === 4 && <NodeReview n={n} set={set} label={label} kindMeta={kindMeta} onClose={onClose} />}
    </WizardShell>
  );
}

// ── Step 1: Identity ──────────────────────────────────────────────────────────

function NodeIdentity({ n, set, label, labelValid }) {
  const [touched, setTouched] = useState(false);
  const existingLabels = (window.NODES || []).map(x => x.label.replace(/\s/g,""));

  return (
    <StepWrap eyebrow="STEP 1 · IDENTITY" title="Name this node type" desc="Node labels become the canonical names in every query, agent prompt, and dashboard filter. Choose a singular noun in PascalCase. Once published, renaming is a breaking change.">
      <FormRow label="Label" required hint={
        touched && label.length < 2 ? "Too short — minimum 2 characters." :
        touched && !labelValid ? `"${label}" already exists in this schema.` :
        label && labelValid ? `✓  :${label} is available` :
        "PascalCase singular noun · e.g. VendorContract, HealthSignal"
      }>
        <div className="wfr-prefix-input">
          <span className="wfr-prefix">:</span>
          <input
            className={"winput winput-xl winput-mono" + (touched && !labelValid ? " winput-err" : "")}
            placeholder="VendorContract"
            value={n.rawLabel}
            onChange={e => { set({ rawLabel: e.target.value }); setTouched(true); }}
            autoFocus
          />
        </div>
      </FormRow>

      <FormRow label="Description" optional>
        <textarea className="winput winput-textarea" rows="2"
          placeholder="What real-world concept does this node represent? Who creates and owns instances of it?"
          value={n.description}
          onChange={e => set({ description: e.target.value })}
        />
      </FormRow>

      <FormRow label="Node kind" required hint={!n.kind ? "Select one — this determines the shape and available population modes." : ""}>
        <div className="nkind-grid">
          {NODE_KINDS.map(k => (
            <button
              key={k.id}
              className={"nkind-card" + (n.kind === k.id ? " on" : "")}
              style={n.kind === k.id ? { borderColor: k.color, background: k.fill } : {}}
              onClick={() => set({ kind: k.id, category: k.id === "source" ? "source" : k.id === "agent" ? "derived" : n.category })}
            >
              <div className="nkind-card-head">
                <svg width="28" height="28" viewBox="-14 -14 28 28">
                  {k.id === "agent"  ? <polygon points="-11,0 -5.5,-9.5 5.5,-9.5 11,0 5.5,9.5 -5.5,9.5" fill={k.fill} stroke={k.color} strokeWidth="1.5" /> :
                   k.id === "source" ? <rect x="-10" y="-10" width="20" height="20" rx="2" fill={k.fill} stroke={k.color} strokeWidth="1.5" /> :
                                       <circle r="10.5" fill={k.fill} stroke={k.color} strokeWidth="1.5" />}
                </svg>
                {n.kind === k.id && <span className="kind-cell-check">✓</span>}
              </div>
              <div className="nkind-label">{k.label}</div>
              <div className="nkind-desc">{k.desc}</div>
            </button>
          ))}
        </div>
      </FormRow>

      <FormRow label="Category">
        <CustomSelect
          value={n.category}
          onChange={v => set({ category: v })}
          options={CATEGORIES}
        />
      </FormRow>

      <FormRow label="Domain" last>
        <CustomSelect
          value={n.domain}
          onChange={v => set({ domain: v })}
          options={DOMAIN_OPTS}
        />
      </FormRow>
    </StepWrap>
  );
}

// ── Step 2: Schema ────────────────────────────────────────────────────────────

function NodeSchema({ n, set, label }) {
  const addProp = () => set({ properties: [...n.properties, { name: "", type: "string", required: false, indexed: false, pii: false }] });
  const upd = (i, patch) => set({ properties: n.properties.map((p, ix) => ix === i ? { ...p, ...patch } : p) });
  const del = i => set({ properties: n.properties.filter((_, ix) => ix !== i) });

  const TYPE_OPTS = ["string","int","float","decimal","bool","timestamp","date","uuid","json","enum"].map(t => ({ id: t, label: t }));

  return (
    <StepWrap eyebrow="STEP 2 · SCHEMA" title="Define primary key and seed properties" desc="Every node type needs at minimum a primary key. Add the properties you know now — you can always add more later, but removing a published property is a breaking change.">
      {n.kind === "entity" && (
        <FormRow label="Visual state" hint={STATES.find(s => s.id === n.state)?.desc}>
          <div className="state-pick">
            {STATES.map(s => (
              <button key={s.id} className={"state-btn" + (n.state === s.id ? " on" : "")} onClick={() => set({ state: s.id })}>
                <span className="state-dot" style={{ background: s.dot }} />
                {s.label}
              </button>
            ))}
          </div>
        </FormRow>
      )}

      <FormRow label="Primary key name">
        <input className="winput winput-mono" value={n.pkName} onChange={e => set({ pkName: e.target.value })} placeholder="id" />
      </FormRow>

      <FormRow label="Primary key type">
        <CustomSelect
          value={n.pkType}
          onChange={v => set({ pkType: v })}
          options={PK_TYPES}
        />
      </FormRow>

      <FormRow label="Flags" hint="Auto-generate: the graph layer generates PK values at write time — recommended for uuid and int.">
        <FlagsRow
          flags={[{ key: "pkAutoGen", label: "Auto-generate PK" }]}
          values={{ pkAutoGen: n.pkAutoGen }}
          onChange={v => set(v)}
        />
      </FormRow>

      <FormRow label="Seed properties" last hint="These are created along with the node type. Name and created_at are always included. Add the fields you need immediately.">
        <div className="wprop-seed-table">
          <div className="wprop-seed-head">
            <div>Name</div><div>Type</div><div>Required</div><div>Indexed</div><div>PII</div><div></div>
          </div>
          {/* PK row (locked) */}
          <div className="wprop-seed-row wprop-seed-pk">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="snap-tag snap-pk">PK</span>
              <code style={{ fontFamily: "JetBrains Mono", fontSize: 12 }}>{n.pkName || "id"}</code>
            </div>
            <code style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "var(--ink-2)" }}>{n.pkType}</code>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--green)" }}>✓</span>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--green)" }}>✓</span>
            <span style={{ color: "var(--ink-4)", fontFamily: "JetBrains Mono", fontSize: 11 }}>—</span>
            <span />
          </div>
          {n.properties.map((p, i) => (
            <div key={i} className="wprop-seed-row">
              <input className="winput winput-mono" placeholder="property_name" value={p.name} onChange={e => upd(i, { name: e.target.value })} />
              <CustomSelect value={p.type} onChange={v => upd(i, { type: v })} options={TYPE_OPTS} />
              <label className="switch" style={{ margin: "0 auto" }}>
                <input type="checkbox" checked={p.required} onChange={e => upd(i, { required: e.target.checked })} />
                <span className="switch-track" />
              </label>
              <label className="switch" style={{ margin: "0 auto" }}>
                <input type="checkbox" checked={p.indexed} onChange={e => upd(i, { indexed: e.target.checked })} />
                <span className="switch-track" />
              </label>
              <label className="switch" style={{ margin: "0 auto" }}>
                <input type="checkbox" checked={p.pii} onChange={e => upd(i, { pii: e.target.checked })} />
                <span className="switch-track" />
              </label>
              <button className="prop-edit-x" onClick={() => del(i)}>×</button>
            </div>
          ))}
          <button className="prop-edit-add" onClick={addProp}>+ Add property</button>
        </div>
      </FormRow>
    </StepWrap>
  );
}

// ── Step 3: Population ────────────────────────────────────────────────────────

function NodeKindGrid({ options, value, onChange }) {
  return (
    <div className="kind-grid-2x2">
      {options.map(o => (
        <button
          key={o.id}
          className={"kind-cell" + (value === o.id ? " on" : "")}
          onClick={() => onChange(value === o.id ? "" : o.id)}
        >
          <div className="kind-cell-head">
            <span className={"wrl-tag wrl-tag-" + o.id}>{o.tag}</span>
            {value === o.id && <span className="kind-cell-check">✓</span>}
          </div>
          <div className="kind-cell-label">{o.label}</div>
          <div className="kind-cell-desc">{o.desc}</div>
        </button>
      ))}
    </div>
  );
}

function NodePopulation({ n, set }) {
  const agents = (window.NODES || []).filter(x => x.type === "agent");

  return (
    <StepWrap eyebrow="STEP 3 · POPULATION" title="How will instances be created?" desc="Select the primary mechanism. You can link additional sources later from the Sources tab.">
      <FormRow label="Population kind" required hint={!n.popKind ? "Select one to configure it." : ""}>
        <NodeKindGrid options={POP_KINDS} value={n.popKind} onChange={v => set({ popKind: v })} />
      </FormRow>

      {n.popKind === "source" && <>
        <FormRow label="Source system">
          <SysSelect value={n.popSource} onChange={v => set({ popSource: v })} />
        </FormRow>
        <FormRow label="Source table / object" hint="The schema will be discovered automatically once the connector is linked.">
          <input className="winput winput-mono" placeholder="accounts" value={n.popTable} onChange={e => set({ popTable: e.target.value })} />
        </FormRow>
        <FormRow label="Primary key column" hint="Must match the PK property defined in Step 2.">
          <input className="winput winput-mono" placeholder="Id" value={n.popPK} onChange={e => set({ popPK: e.target.value })} />
        </FormRow>
        <FormRow label="Sync cadence" last>
          <Seg options={["streaming","5min","hourly","daily"]} value={n.popCadence} onChange={v => set({ popCadence: v })} />
        </FormRow>
      </>}

      {n.popKind === "agent" && <>
        <FormRow label="Authoring agent">
          <CustomSelect
            value={n.popAgentId} onChange={v => set({ popAgentId: v })}
            placeholder="— pick agent —"
            options={agents.map(a => ({ id: a.id, label: a.label, desc: a.desc }))}
          />
        </FormRow>
        <FormRow label="Trigger">
          <CustomSelect value={n.popTrigger || "on_observation"} onChange={v => set({ popTrigger: v })} options={[
            { id: "on_observation", label: "On new observation",   desc: "Agent fires when it receives relevant graph events" },
            { id: "scheduled",      label: "Scheduled",             desc: "Runs on a fixed cadence regardless of input" },
            { id: "on_demand",      label: "On demand (API)",       desc: "Triggered explicitly via the graph write API" },
          ]} />
        </FormRow>
        <FormRow label="Cadence" last>
          <Seg options={["live","5min","hourly","daily","weekly"]} value={n.popCadence} onChange={v => set({ popCadence: v })} />
        </FormRow>
      </>}

      {n.popKind === "manual" && <>
        <FormRow label="API endpoint" hint="The graph write API will expose a POST endpoint for this node type automatically." last>
          <input className="winput winput-mono" readOnly value="/graph/v1/nodes/new-type" style={{ color: "var(--ink-3)", background: "var(--bg-canvas)" }} />
        </FormRow>
      </>}

      {n.popKind === "computed" && <>
        <FormRow label="Materialisation query" hint="MERGE is required — MATCH-only queries won't create instances.">
          <textarea className="winput winput-mono winput-code" rows="7"
            value={n.popQuery}
            onChange={e => set({ popQuery: e.target.value })}
            placeholder={"// Example: derive a HealthSignal from Account + Interaction\nMATCH (a:Account)\nWITH a, count{ (a)<-[:TOUCHES]-() } AS interactions\nMERGE (s:HealthSignal { id: a.account_id })\nSET s.account_id = a.account_id,\n    s.interaction_count = interactions"}
          />
        </FormRow>
        <FormRow label="Recompute cadence" last>
          <Seg options={["5min","hourly","daily","weekly"]} value={n.popCadence} onChange={v => set({ popCadence: v })} />
        </FormRow>
      </>}

      {n.popKind && (
        <BackfillBanner
          backfill={n.backfill}
          onChange={v => set({ backfill: v })}
          estimate="Historical instances will be seeded on first sync · ~30 days window"
        />
      )}
    </StepWrap>
  );
}

// ── Step 4: Governance ────────────────────────────────────────────────────────

function NodeGovernance({ n, set }) {
  return (
    <StepWrap eyebrow="STEP 4 · GOVERNANCE" title="Owner, access, and observability" desc="These settings define who is responsible for this node type and what SLOs downstream systems can expect from it.">
      <FormRow label="Owner team">
        <CustomSelect value={n.owner} onChange={v => set({ owner: v })} options={TEAM_OPTS} />
      </FormRow>

      <FormRow label="Freshness SLO" hint="The maximum acceptable age of any instance before an alert fires. Visible to all downstream consumers.">
        <CustomSelect value={n.freshnessSLO} onChange={v => set({ freshnessSLO: v })} options={SLO_OPTS} />
      </FormRow>

      <FormRow label="Access roles" hint="Who can read instances of this node type.">
        <MultiToken options={ROLES} value={n.accessRoles} onChange={v => set({ accessRoles: v })} placeholder="add roles…" />
      </FormRow>

      <FormRow label="Tags">
        <MultiToken options={GOV_TAGS} value={n.tags} onChange={v => set({ tags: v })} placeholder="add tags…" />
      </FormRow>

      <FormRow label="Runbook URL" optional>
        <input className="winput winput-mono" placeholder="go/my-node-runbook" value={n.runbook} onChange={e => set({ runbook: e.target.value })} />
      </FormRow>

      <FormRow label="Slack channel" optional>
        <input className="winput winput-mono" placeholder="#schema-my-node" value={n.slack} onChange={e => set({ slack: e.target.value })} />
      </FormRow>

      <FormRow label="Change risk" hint={
        n.changeRisk === "LOW" ? "Self-approval. Lands on next deploy." :
        n.changeRisk === "MEDIUM" ? "1 reviewer from owner team · CI must pass." :
        "2 reviewers (owner + governance) · staging soak ≥ 24 h."
      } last>
        <Seg risk options={[{id:"LOW",label:"LOW"},{id:"MEDIUM",label:"MEDIUM"},{id:"HIGH",label:"HIGH"}]} value={n.changeRisk} onChange={v => set({ changeRisk: v })} />
      </FormRow>
    </StepWrap>
  );
}

// ── Step 5: Review ────────────────────────────────────────────────────────────

function NodeReview({ n, set, label, kindMeta, onClose }) {
  const approvers = n.changeRisk === "HIGH"
    ? [{ who: "morgan.lee", team: n.owner }, { who: "ramin.k", team: "governance" }]
    : n.changeRisk === "MEDIUM" ? [{ who: "morgan.lee", team: n.owner }] : [];

  const allProps = [
    { name: n.pkName || "id", type: n.pkType, required: true, indexed: true, pii: false, pk: true },
    ...n.properties.filter(p => p.name),
  ];

  const cypher = `// Migration · ${n.stage} · v3.3 (proposed)
CREATE NODE TYPE :${label || "NewNode"}
  KIND ${(n.kind || "entity").toUpperCase()}
  CATEGORY ${n.category.toUpperCase()}
  ${n.kind === "entity" ? `STATE ${n.state.toUpperCase()}` : ""}
  PRIMARY KEY (${n.pkName || "id"}: ${n.pkType.toUpperCase()}${n.pkAutoGen ? " AUTO" : ""});

// Seed properties
${allProps.filter(p => !p.pk).map(p =>
  `ALTER NODE TYPE :${label} ADD PROPERTY ${p.name} ${p.type.toUpperCase()}${p.required ? " NOT NULL" : ""}${p.indexed ? " INDEXED" : ""}${p.pii ? " /* PII */" : ""};`
).join("\n")}

// Governance
GRANT READ ON :${label} TO ROLES (${n.accessRoles.join(", ")});
${n.tags.length ? `TAG :${label} WITH (${n.tags.join(", ")});` : ""}
SET OWNER OF :${label} = "${n.owner}";
SET DOMAIN OF :${label} = "${n.domain}";
SET FRESHNESS_SLO OF :${label} = "${n.freshnessSLO}";
SET CHANGE_RISK = ${n.changeRisk};
${n.runbook ? `SET RUNBOOK OF :${label} = "${n.runbook}";` : ""}

// Population
${n.popKind === "source"   ? `BIND :${label} FROM SOURCE "${n.popSource}" TABLE "${n.popTable || "?"}" PK "${n.popPK || "id"}" REFRESH ${n.popCadence};` : ""}
${n.popKind === "agent"    ? `BIND :${label} FROM AGENT ${n.popAgentId || "?"} TRIGGER ${n.popTrigger || "on_observation"};` : ""}
${n.popKind === "computed" ? `INFER :${label} AS\n${(n.popQuery || "").split("\n").map(l => "  " + l).join("\n")}\nREFRESH ${n.popCadence};` : ""}
${n.popKind === "manual"   ? `// Instances created via POST /graph/v1/nodes/${label}` : ""}
${n.backfill ? `BACKFILL :${label} FOR INTERVAL '30 days';` : ""}`;

  return (
    <StepWrap eyebrow="STEP 5 · REVIEW & PUBLISH" title="Last look before this node type lands in the schema" desc="Once published it appears in the Node catalog with a full audit trail. You can roll back from History within the 30-day change window.">
      <div className="review-col">

        <section className="card">
          <div className="card-head">Summary</div>
          <ul className="rev-list">
            {[
              ["Label",       <code>:{label || "?"}</code>],
              ["Kind",        n.kind || "—"],
              ["Category",    n.category],
              ["Domain",      n.domain],
              ["State",       n.kind === "entity" ? n.state : "—"],
              ["Primary key", `${n.pkName || "id"} : ${n.pkType}${n.pkAutoGen ? " (auto)" : ""}`],
              ["Properties",  allProps.length + " total"],
              ["Population",  n.popKind || "—"],
              ["Freshness SLO", n.freshnessSLO],
              ["Owner",       n.owner],
              ["Access",      n.accessRoles.join(", ") || "—"],
              ["Risk",        <span className={"nv-change nv-change-" + n.changeRisk.toLowerCase()}>{n.changeRisk}</span>],
              ["Backfill",    n.backfill ? "on · 30 days" : "off"],
            ].map(([k, v], i) => <li key={i}><span className="rev-k">{k}</span><span className="rev-v">{v}</span></li>)}
          </ul>
        </section>

        <section className="card">
          <div className="card-head">Initial properties <span className="card-head-sub">{allProps.length} total</span></div>
          <ul className="snap-list">
            {allProps.map((p, i) => (
              <li key={i} className="snap-row">
                <div className="snap-name">
                  {p.pk && <span className="snap-tag snap-pk">PK</span>}
                  {p.required && !p.pk && <span className="snap-tag">req</span>}
                  {p.indexed  && !p.pk && <span className="snap-tag snap-idx">idx</span>}
                  {p.pii      && <span className="snap-tag snap-pii">PII</span>}
                  <span className="snap-n">{p.name}</span>
                </div>
                <div className="snap-type">{p.type}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card-head">Approvers</div>
          {approvers.length === 0
            ? <div className="card-body" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Low risk · self-approve.</div>
            : <ul className="approver-list">{approvers.map((a, i) => (
              <li key={i} className="approver-row">
                <span className="appr-avatar">{a.who[0].toUpperCase()}</span>
                <div><div className="appr-who">{a.who}</div><div className="appr-team">{a.team}</div></div>
                <span className="appr-status">awaiting</span>
              </li>
            ))}</ul>
          }
        </section>

        <section className="card">
          <div className="card-head">Target stage</div>
          <div className="card-body" style={{ padding: "14px 18px" }}>
            <Seg options={["draft","staging","live"]} value={n.stage} onChange={v => set({ stage: v })} />
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)", fontFamily: "JetBrains Mono" }}>
              {n.stage === "draft"   ? "Working branch — no consumers see it yet." :
               n.stage === "staging" ? "Staging graph — safe for agent test runs." :
               "Production — node type is immediately queryable."}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head card-head-row">
            <div>Migration <span className="card-head-sub">cypher diff</span></div>
            <div className="card-head-actions"><button className="btn-ghost">Copy</button><button className="btn-ghost">Open in editor</button></div>
          </div>
          <pre className="cypher-block">{cypher}</pre>
        </section>

      </div>
    </StepWrap>
  );
}

// ── Preview pane ──────────────────────────────────────────────────────────────

function NodePreview({ n, label, kindMeta, labelValid }) {
  const allProps = [
    { name: n.pkName || "id", type: n.pkType, pk: true },
    ...n.properties.filter(p => p.name),
  ];

  return (
    <div className="preview-stack">
      <div className="preview-block">
        <div className="preview-head">Node preview</div>
        <svg viewBox="-80 -80 160 160" style={{ width: "100%", height: 160, display: "block", background: "var(--bg-canvas)" }}>
          {kindMeta ? (
            <>
              {n.kind === "agent"  && <polygon points={[0,1,2,3,4,5].map(i=>{const a=(Math.PI/3)*i-Math.PI/2,r=38;return`${(r*Math.cos(a)).toFixed(1)},${(r*Math.sin(a)).toFixed(1)}`}).join(" ")} fill={kindMeta.fill} stroke={kindMeta.color} strokeWidth="2" />}
              {n.kind === "source" && <rect x="-36" y="-36" width="72" height="72" rx="4" fill={kindMeta.fill} stroke={kindMeta.color} strokeWidth="2" />}
              {n.kind === "entity" && <circle r="38" fill={kindMeta.fill} stroke={kindMeta.color} strokeWidth="2" />}
              {/* state glyph */}
              {n.state === "signal"   && <polygon points="0,-14 12,6 -12,6" fill="none" stroke={kindMeta.color} strokeWidth="1.5" />}
              {n.state === "risk"     && <polygon points="0,-12 10,6 -10,6" fill="none" stroke={kindMeta.color} strokeWidth="1.5" />}
              {n.state === "incident" && <><line x1="0" y1="-10" x2="0" y2="4" stroke={kindMeta.color} strokeWidth="2" strokeLinecap="round" /><circle cx="0" cy="9" r="2" fill={kindMeta.color} /></>}
              <text y="60" textAnchor="middle" fontFamily="Instrument Serif, serif" fontSize="18" fill="var(--ink)">{label || "NewNode"}</text>
              <text y="74" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--ink-3)" letterSpacing="0.6">{(kindMeta.label || "").toUpperCase()}</text>
            </>
          ) : (
            <>
              <circle r="38" fill="var(--chip)" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="4 3" />
              <text y="4" textAnchor="middle" fontFamily="Geist, system-ui" fontSize="11" fill="var(--ink-4)">pick a kind</text>
            </>
          )}
        </svg>
      </div>

      <div className="preview-block">
        <div className="preview-head">Validation</div>
        <ul className="preview-checks">
          {[
            [labelValid && label.length >= 2, "Label is valid and unique"],
            [!!n.kind, "Node kind selected"],
            [n.accessRoles.length > 0, "Access roles assigned"],
            [!!n.popKind, "Population mode set"],
          ].map(([ok, lbl], i) => (
            <li key={i} className={"check " + (ok ? "check-ok" : "check-pend")}><span className="check-dot" /> {lbl}</li>
          ))}
        </ul>
      </div>

      <div className="preview-block">
        <div className="preview-head">Property snapshot</div>
        <div style={{ padding: "8px 14px 12px" }}>
          {allProps.slice(0,6).map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px dashed var(--line-2)", fontSize: 12 }}>
              <span style={{ fontFamily: "JetBrains Mono", color: p.pk ? "var(--ink)" : "var(--ink-2)" }}>
                {p.pk && <span className="snap-tag snap-pk" style={{ marginRight: 5 }}>PK</span>}
                {p.name}
              </span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-3)" }}>{p.type}</span>
            </div>
          ))}
          {allProps.length > 6 && <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "JetBrains Mono", paddingTop: 6 }}>+{allProps.length - 6} more</div>}
        </div>
      </div>
    </div>
  );
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
Object.assign(window, { AddNodeFlow });
