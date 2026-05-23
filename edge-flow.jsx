// edge-flow.jsx — Add Edge Type wizard (redesigned)
// Primitives are exported by prop-source-flows.jsx which loads first

const { useState, useMemo } = React;

// Globals from ecg.jsx
const { NODES, EDGES, ListGlyph, colorForNode } = window;

// Primitives from prop-source-flows.jsx
const {
  FormRow, StepWrap, WizardShell,
  CustomSelect, SysSelect,
  RadioList, Seg, MultiToken, FlagsRow, BackfillBanner,
  MASKING_RULES, RETENTION_OPTS, ROLES, GOV_TAGS,
} = window;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const POPULATION_KINDS = [
  { id: "direct",   label: "Direct from source",  tag: "DIRECT",   desc: "Edge instances loaded from a source-system table or stream — one row, one edge." },
  { id: "inferred", label: "Inferred by rule",     tag: "INFERRED", desc: "Materialised from a Cypher pattern on a schedule. No source row required." },
  { id: "agent",    label: "Agent-derived",         tag: "AGENT",    desc: "Edge emitted by an agent's reasoning step as a structured write event." },
  { id: "computed", label: "Property match",        tag: "COMPUTED", desc: "Edge appears when a property on From equals a property on To. Cheapest path." },
];

const TEAM_OPTS = ["data-platform","fin-ops","cs-platform","governance","applied-ml"].map(t => ({ id: t, label: t }));

const AGENT_NODES = NODES.filter(n => n.type === "agent");

const CARDINALITY_OPTS = ["1:1","1:N","N:1","N:M"].map(v => ({ id: v, label: v }));

// impact list for a given edge
function getImpact(fromNode, toNode) {
  if (!toNode) return [];
  return [
    { kind: "agent",     name: "Revenue Forecaster",    why: "gains traversal " + fromNode.label + " → " + toNode.label },
    { kind: "agent",     name: "Customer Health",        why: "new neighbourhood for " + fromNode.label },
    { kind: "dashboard", name: "CS — Account 360",       why: "new join across schema" },
    { kind: "pipeline",  name: "warehouse.edge_facts",   why: "+1 edge column" },
  ];
}

// ─── FLOW ─────────────────────────────────────────────────────────────────────

const EDGE_STEPS = [
  { label: "Basics",     hint: "Label, endpoints, cardinality" },
  { label: "Population", hint: "Where instances come from"     },
  { label: "Properties", hint: "Optional edge attributes"      },
  { label: "Governance", hint: "Owner, access, impact"         },
  { label: "Review",     hint: "Cypher diff & publish"        },
];

function AddEdgeFlow({ fromNode, onClose }) {
  const [step, setStep] = useState(0);
  const [e, setE] = useState({
    label: "", inverse: "", description: "",
    from: fromNode.id, to: "",
    cardinality: "1:N",
    required: false, bidirectional: false,
    kind: "",
    sourceSystem: "salesforce", sourceTable: "", fromCol: "id", toCol: "id", cadence: "5min",
    rule: "MATCH (a:Account)-[:HAS_SUBSCRIPTION]->(s:Subscription)\n      <-[:BILLS]-(i:Invoice)\nMERGE (a)-[r:NEW_EDGE]->(i)",
    agentId: AGENT_NODES[0]?.id || "", trigger: "on_observation", confidence: 80,
    fromProp: "id", toProp: "ref_id", matchFn: "exact",
    properties: [
      { name: "since",      type: "timestamp", required: true,  pii: false },
      { name: "confidence", type: "float",     required: false, pii: false },
    ],
    owner: "data-platform", tags: [], accessRoles: ["read_all"],
    risk: "MEDIUM",
    stage: "draft", backfill: true,
  });

  const set = patch => setE(v => ({ ...v, ...patch }));
  const labelClean = e.label.toUpperCase().replace(/[^A-Z0-9_]/g, "_").replace(/^_+|_+$/g, "");
  const labelValid = labelClean.length >= 3 && !EDGES.some(x => x.label === labelClean);
  const toNode = NODES.find(n => n.id === e.to);
  const impact = useMemo(() => getImpact(fromNode, toNode), [e.to]);
  const canNext = step === 0 ? (labelValid && !!e.to) : true;

  const fc = colorForNode(fromNode);
  const tc = toNode ? colorForNode(toNode) : { stroke: "var(--ink-4)", fill: "var(--line-2)" };

  const titleFrom = (
    <span className="flow-title-from">
      <ListGlyph node={fromNode} size={18} />{fromNode.label}
    </span>
  );
  const titleTo = toNode ? (
    <span className="flow-title-to"><ListGlyph node={toNode} size={18} />{toNode.label}</span>
  ) : <span className="flow-title-empty">choose target</span>;

  return (
    <WizardShell
      eyebrow="SCHEMA · EDGE TYPES · NEW"
      titleFrom={titleFrom}
      titleLabel={labelClean ? ":" + labelClean : null}
      titleTo={titleTo}
      stage={e.stage}
      steps={EDGE_STEPS} step={step} setStep={setStep}
      canNext={canNext}
      onNext={() => setStep(s => s + 1)}
      onPublish={onClose}
      onClose={onClose}
      rightPane={<EdgePreview e={e} fromNode={fromNode} toNode={toNode} labelClean={labelClean} impact={impact} fc={fc} tc={tc} />}
    >
      {step === 0 && <EdgeBasics e={e} set={set} labelClean={labelClean} labelValid={labelValid} fromNode={fromNode} />}
      {step === 1 && <EdgePopulation e={e} set={set} fromNode={fromNode} toNode={toNode} />}
      {step === 2 && <EdgeProperties e={e} set={set} />}
      {step === 3 && <EdgeGovernance e={e} set={set} impact={impact} />}
      {step === 4 && <EdgeReview e={e} set={set} fromNode={fromNode} toNode={toNode} labelClean={labelClean} impact={impact} onClose={onClose} />}
    </WizardShell>
  );
}

// ── Step 1: Basics ────────────────────────────────────────────────────────────

function EdgeBasics({ e, set, labelClean, labelValid, fromNode }) {
  const [touched, setTouched] = useState(false);
  const nodeGroups = [
    { label: "Core",    items: NODES.filter(n => n.cat === "core"    && n.id !== fromNode.id).map(n => ({ id: n.id, label: n.label })) },
    { label: "Support", items: NODES.filter(n => n.cat === "support" && n.id !== fromNode.id).map(n => ({ id: n.id, label: n.label })) },
    { label: "Derived", items: NODES.filter(n => n.cat === "derived" && n.id !== fromNode.id).map(n => ({ id: n.id, label: n.label })) },
    { label: "Source",  items: NODES.filter(n => n.cat === "source"  && n.id !== fromNode.id).map(n => ({ id: n.id, label: n.label })) },
  ].filter(g => g.items.length);

  return (
    <StepWrap eyebrow="STEP 1 · BASICS" title="Name the edge and pick its endpoints" desc="Edge labels become part of the schema's public contract. Use UPPER_SNAKE_CASE with a verb that reads naturally in both directions.">
      <FormRow label="Label" required hint={labelClean && labelValid ? "✓  :" + labelClean + " is available" : labelClean ? "Label taken or too short — use a different verb." : "UPPER_SNAKE_CASE · 3–32 chars"}>
        <div className="wfr-prefix-input">
          <span className="wfr-prefix">:</span>
          <input
            className={"winput winput-mono winput-xl" + (touched && !labelValid ? " winput-err" : "")}
            placeholder="WORKS_AT"
            value={e.label}
            onChange={x => { set({ label: x.target.value }); setTouched(true); }}
            autoFocus
          />
        </div>
      </FormRow>

      <FormRow label="Description" optional>
        <textarea className="winput winput-textarea" rows="2" placeholder="What does this edge represent? Read both directions out loud — does it work?" value={e.description} onChange={x => set({ description: x.target.value })} />
      </FormRow>

      <FormRow label="From" hint="Locked to the current node.">
        <div className="wendpoint-locked">
          <ListGlyph node={fromNode} size={18} />
          <span>{fromNode.label}</span>
          <span className="wendpoint-tag">locked</span>
        </div>
      </FormRow>

      <FormRow label="To" required>
        <CustomSelect
          value={e.to} onChange={v => set({ to: v })}
          options={nodeGroups} grouped
          placeholder="— pick a target node —"
          renderTrigger={n => <span style={{ display: "flex", alignItems: "center", gap: 8 }}>{n && NODES.find(x => x.id === n.id) && <ListGlyph node={NODES.find(x => x.id === n.id)} size={18} />}{n.label}</span>}
          renderOption={n => {
            const node = NODES.find(x => x.id === n.id);
            return <span style={{ display: "flex", alignItems: "center", gap: 8 }}>{node && <ListGlyph node={node} size={16} />}<span className="csel-opt-label">{n.label}</span></span>;
          }}
        />
      </FormRow>

      <FormRow label="Cardinality">
        <Seg options={CARDINALITY_OPTS} value={e.cardinality} onChange={v => set({ cardinality: v })} />
      </FormRow>

      <FormRow label="Inverse label" optional hint="Lets queries traverse the reverse direction by name without recomputing.">
        <div className="wfr-prefix-input">
          <span className="wfr-prefix">:</span>
          <input className="winput winput-mono" placeholder="HAS_EMPLOYEE" value={e.inverse} onChange={x => set({ inverse: x.target.value })} />
        </div>
      </FormRow>

      <FormRow label="Flags" last hint="Required: every From must have at least one outgoing edge · Symmetric: treat both directions as equivalent">
        <FlagsRow
          flags={[
            { key: "required",      label: "Required at From" },
            { key: "bidirectional", label: "Symmetric / undirected" },
          ]}
          values={{ required: e.required, bidirectional: e.bidirectional }}
          onChange={v => set(v)}
        />
      </FormRow>
    </StepWrap>
  );
}

// ── Step 2: Population ────────────────────────────────────────────────────────

function KindGrid({ options, value, onChange }) {
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

function EdgePopulation({ e, set, fromNode, toNode }) {
  return (
    <StepWrap eyebrow="STEP 2 · POPULATION" title="How will edge instances be created?" desc="Every edge needs a system of record. This determines freshness SLO, lineage, and backfill behaviour.">
      <FormRow label="Population kind" required hint={!e.kind ? "Select one to continue configuring." : ""}>
        <KindGrid options={POPULATION_KINDS} value={e.kind} onChange={v => set({ kind: v })} />
      </FormRow>

      {e.kind === "direct" && <>
        <FormRow label="Source system">
          <SysSelect value={e.sourceSystem} onChange={v => set({ sourceSystem: v })} />
        </FormRow>
        <FormRow label="Source table / topic">
          <input className="winput winput-mono" placeholder="account_employee_link" value={e.sourceTable} onChange={x => set({ sourceTable: x.target.value })} />
        </FormRow>
        <FormRow label="Column mapping" hint={`${fromNode.label}.id ↔ ${toNode?.label || "Target"}.id — override if keys differ.`}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <code style={{ fontFamily: "JetBrains Mono", fontSize: 12, padding: "6px 10px", background: "var(--chip)", borderRadius: 6 }}>{fromNode.label}.id</code>
            <span style={{ color: "var(--ink-3)", fontFamily: "JetBrains Mono" }}>=</span>
            <input className="winput winput-mono" style={{ width: 140 }} placeholder="account_id" defaultValue="account_id" />
            <span style={{ color: "var(--ink-3)", fontFamily: "JetBrains Mono" }}>↔</span>
            <code style={{ fontFamily: "JetBrains Mono", fontSize: 12, padding: "6px 10px", background: "var(--chip)", borderRadius: 6 }}>{toNode?.label || "Target"}.id</code>
            <span style={{ color: "var(--ink-3)", fontFamily: "JetBrains Mono" }}>=</span>
            <input className="winput winput-mono" style={{ width: 140 }} placeholder={toNode ? toNode.id + "_id" : "target_id"} defaultValue={toNode ? toNode.id + "_id" : ""} />
          </div>
        </FormRow>
        <FormRow label="Update cadence" last>
          <Seg options={["streaming","5min","hourly","daily"]} value={e.cadence} onChange={v => set({ cadence: v })} />
        </FormRow>
      </>}

      {e.kind === "inferred" && <>
        <FormRow label="Cypher pattern" hint="Runs on the configured cadence. MERGE creates the edge; MATCH without MERGE is read-only.">
          <textarea className="winput winput-mono winput-code" rows="8" value={e.rule} onChange={x => set({ rule: x.target.value })} />
        </FormRow>
        <FormRow label="Recompute cadence">
          <Seg options={["live","5min","hourly","daily","weekly"]} value={e.cadence} onChange={v => set({ cadence: v })} />
        </FormRow>
        <FormRow label="On stale match" last>
          <CustomSelect value={e.onStale || "reconcile"} onChange={v => set({ onStale: v })} options={[
            { id: "reconcile",  label: "Reconcile",  desc: "Drop edges that no longer match the pattern" },
            { id: "keep",       label: "Keep",        desc: "Append-only — never remove inferred edges" },
            { id: "quarantine", label: "Quarantine",  desc: "Route stale edges to review queue" },
          ]} />
        </FormRow>
      </>}

      {e.kind === "agent" && <>
        <FormRow label="Authoring agent">
          <CustomSelect value={e.agentId} onChange={v => set({ agentId: v })} placeholder="— pick agent —"
            options={AGENT_NODES.map(a => ({ id: a.id, label: a.label, desc: a.desc }))} />
        </FormRow>
        <FormRow label="Trigger">
          <CustomSelect value={e.trigger} onChange={v => set({ trigger: v })} options={[
            { id: "on_observation", label: "On new observation", desc: "Fires when agent receives relevant input" },
            { id: "scheduled",      label: "Scheduled",           desc: "Runs on the configured cadence" },
            { id: "on_demand",      label: "On demand (API)",     desc: "Triggered explicitly via API call" },
          ]} />
        </FormRow>
        <FormRow label={`Confidence threshold · ${e.confidence}%`} hint="Edges below threshold land in :proposed state for human review." last>
          <div className="wslider">
            <input type="range" min="0" max="100" value={e.confidence} onChange={x => set({ confidence: +x.target.value })} className="wslider-input" />
            <span className="wslider-val">≥ {(e.confidence / 100).toFixed(2)}</span>
          </div>
        </FormRow>
      </>}

      {e.kind === "computed" && <>
        <FormRow label={`${fromNode.label} property`}>
          <input className="winput winput-mono" placeholder="domain" value={e.fromProp} onChange={x => set({ fromProp: x.target.value })} />
        </FormRow>
        <FormRow label={`${toNode?.label || "Target"} property`}>
          <input className="winput winput-mono" placeholder="email_domain" value={e.toProp} onChange={x => set({ toProp: x.target.value })} />
        </FormRow>
        <FormRow label="Match function" last>
          <Seg options={["exact","case-insensitive","fuzzy","regex"]} value={e.matchFn} onChange={v => set({ matchFn: v })} />
        </FormRow>
      </>}

      <BackfillBanner backfill={e.backfill} onChange={v => set({ backfill: v })} estimate="~12,400 traversals · ~3.2 min in staging" />
    </StepWrap>
  );
}

// ── Step 3: Properties ────────────────────────────────────────────────────────

const TYPE_OPTS = ["string","int","float","bool","timestamp","date","json","enum"].map(t => ({ id: t, label: t }));

function EdgeProperties({ e, set }) {
  const addProp = () => set({ properties: [...e.properties, { name: "", type: "string", required: false, pii: false }] });
  const upd = (i, patch) => set({ properties: e.properties.map((p, ix) => ix === i ? { ...p, ...patch } : p) });
  const del = i => set({ properties: e.properties.filter((_, ix) => ix !== i) });

  return (
    <StepWrap eyebrow="STEP 3 · PROPERTIES" title="Edge attributes" desc="Edges can carry their own properties — timestamps, weights, roles, provenance. Each field is stored at edge cardinality, so keep this minimal.">
      <FormRow label="Edge properties" last hint={`${e.properties.filter(p=>p.name).length} defined · storage cost scales with edge count`}>
        <div className="wedge-prop-table">
          <div className="wedge-prop-head">
            <div>Name</div><div>Type</div><div>Required</div><div>PII</div><div></div>
          </div>
          {e.properties.map((p, i) => (
            <div key={i} className="wedge-prop-row">
              <input className="winput winput-mono" placeholder="property_name" value={p.name} onChange={x => upd(i, { name: x.target.value })} />
              <CustomSelect value={p.type} onChange={v => upd(i, { type: v })} options={TYPE_OPTS} />
              <label className="switch" style={{ margin: "0 auto" }}>
                <input type="checkbox" checked={p.required} onChange={x => upd(i, { required: x.target.checked })} />
                <span className="switch-track" />
              </label>
              <label className="switch" style={{ margin: "0 auto" }}>
                <input type="checkbox" checked={p.pii} onChange={x => upd(i, { pii: x.target.checked })} />
                <span className="switch-track" />
              </label>
              <button className="prop-edit-x" onClick={() => del(i)} title="Remove">×</button>
            </div>
          ))}
          <button className="prop-edit-add" onClick={addProp}>+ Add property</button>
        </div>
      </FormRow>
    </StepWrap>
  );
}

// ── Step 4: Governance ────────────────────────────────────────────────────────

function EdgeGovernance({ e, set, impact }) {
  return (
    <StepWrap eyebrow="STEP 4 · GOVERNANCE & IMPACT" title="Owner, access, and downstream effects" desc="New edges are governance events — they expand the surface every downstream agent and dashboard can traverse.">
      <FormRow label="Owner team">
        <CustomSelect value={e.owner} onChange={v => set({ owner: v })} options={TEAM_OPTS} />
      </FormRow>

      <FormRow label="Change risk" hint={
        e.risk === "LOW" ? "Self-approval. Lands on next deploy." :
        e.risk === "MEDIUM" ? "1 reviewer from owner team · CI must pass." :
        "2 reviewers (owner + governance) · staging soak ≥ 24 h."
      }>
        <Seg risk options={[{id:"LOW",label:"LOW"},{id:"MEDIUM",label:"MEDIUM"},{id:"HIGH",label:"HIGH"}]} value={e.risk} onChange={v => set({ risk: v })} />
      </FormRow>

      <FormRow label="Tags">
        <MultiToken options={GOV_TAGS} value={e.tags} onChange={v => set({ tags: v })} placeholder="add tags…" />
      </FormRow>

      <FormRow label="Access roles" hint="Who can traverse this edge type.">
        <MultiToken options={ROLES} value={e.accessRoles} onChange={v => set({ accessRoles: v })} placeholder="add roles…" />
      </FormRow>

      <FormRow label={`Impact preview · ${impact.length} surfaces affected`} last>
        <div className="wedge-impact">
          {impact.map((item, i) => (
            <div key={i} className="wedge-impact-row">
              <span className={"cons-kind cons-kind-" + item.kind}>{item.kind}</span>
              <div className="wedge-impact-text">
                <div className="wedge-impact-name">{item.name}</div>
                <div className="wedge-impact-why">{item.why}</div>
              </div>
              <span className="wedge-impact-status">notify on publish</span>
            </div>
          ))}
        </div>
      </FormRow>
    </StepWrap>
  );
}

// ── Step 5: Review ────────────────────────────────────────────────────────────

function EdgeReview({ e, set, fromNode, toNode, labelClean, impact, onClose }) {
  const approvers = e.risk === "HIGH"
    ? [{ who: "morgan.lee", team: e.owner }, { who: "ramin.k", team: "governance" }]
    : e.risk === "MEDIUM" ? [{ who: "morgan.lee", team: e.owner }] : [];

  const cypher = `// Migration · ${e.stage} · v3.3 (proposed)
CREATE RELATIONSHIP TYPE :${labelClean}
  FROM (:${fromNode.label.replace(/\s/g,"")})
  TO   (:${toNode ? toNode.label.replace(/\s/g,"") : "?"})
  CARDINALITY ${e.cardinality}
  ${e.required ? "REQUIRED" : "OPTIONAL"}
  ${e.bidirectional ? "SYMMETRIC" : "DIRECTED"};

${e.properties.filter(p=>p.name).map(p =>
  `ALTER RELATIONSHIP :${labelClean} ADD PROPERTY ${p.name} ${p.type.toUpperCase()}${p.required ? " NOT NULL" : ""}${p.pii ? " /* PII */" : ""};`
).join("\n") || "// (no edge properties)"}

${e.kind === "direct"   ? `BIND :${labelClean} FROM SOURCE "${e.sourceSystem}" TABLE "${e.sourceTable || "?"}" REFRESH ${e.cadence};` : ""}
${e.kind === "inferred" ? `INFER :${labelClean} AS\n${e.rule.split("\n").map(l => "  " + l).join("\n")}\nREFRESH ${e.cadence};` : ""}
${e.kind === "agent"    ? `BIND :${labelClean} FROM AGENT ${e.agentId} CONFIDENCE >= ${(e.confidence/100).toFixed(2)};` : ""}
${e.kind === "computed" ? `INFER :${labelClean} AS MATCH ${fromNode.label}.${e.fromProp} = ${toNode?.label || "?"}.${e.toProp};` : ""}

GRANT TRAVERSE ON :${labelClean} TO ROLES (${e.accessRoles.join(", ")});
${e.tags.length ? `TAG :${labelClean} WITH (${e.tags.join(", ")});` : ""}
SET OWNER OF :${labelClean} = "${e.owner}";
SET CHANGE_RISK = ${e.risk};
${e.backfill ? `BACKFILL :${labelClean} FOR INTERVAL '30 days';` : ""}`;

  return (
    <StepWrap eyebrow="STEP 5 · REVIEW & PUBLISH" title="Last look before this becomes part of the schema">
      <div className="review-col">
        <section className="card">
          <div className="card-head">Summary</div>
          <ul className="rev-list">
            {[
              ["Label",       <code>:{labelClean || "?"}</code>],
              ["Endpoints",   <><b>{fromNode.label}</b> {e.bidirectional ? "↔" : "→"} <b>{toNode?.label || "?"}</b></>],
              ["Cardinality", e.cardinality + (e.required ? " · required at From" : "")],
              ["Kind",        <span className={"edge-kind edge-kind-" + e.kind}>{e.kind}</span>],
              ["Properties",  e.properties.filter(p=>p.name).length + " fields"],
              ["Cadence",     e.cadence],
              ["Owner",       e.owner],
              ["Risk",        <span className={"nv-change nv-change-" + e.risk.toLowerCase()}>{e.risk}</span>],
              ["Access",      e.accessRoles.join(", ") || "—"],
              ["Backfill",    e.backfill ? "on · 30 days" : "off"],
              ["Impact",      impact.length + " surface(s) downstream"],
            ].map(([k, v], i) => <li key={i}><span className="rev-k">{k}</span><span className="rev-v">{v}</span></li>)}
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
            <Seg options={["draft","staging","live"]} value={e.stage} onChange={v => set({ stage: v })} />
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)", fontFamily: "JetBrains Mono" }}>
              {e.stage === "draft" ? "Working branch — no consumers see it yet." :
               e.stage === "staging" ? "Staging graph — safe for agent test runs." :
               "Production — all consumers gain this traversal now."}
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

function EdgePreview({ e, fromNode, toNode, labelClean, impact, fc, tc }) {
  return (
    <div className="preview-stack">
      <div className="preview-block">
        <div className="preview-head">Live preview</div>
        <svg viewBox="0 0 240 110" className="preview-graph">
          <defs>
            <marker id="edge-prev-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-2)" />
            </marker>
          </defs>
          <g transform="translate(40,55)">
            {fromNode.type === "agent" ? (
              <polygon points={[0,1,2,3,4,5].map(i=>{const a=(Math.PI/3)*i-Math.PI/2;const r=22;return`${(r*Math.cos(a)).toFixed(1)},${(r*Math.sin(a)).toFixed(1)}`}).join(" ")} fill={fc.fill} stroke={fc.stroke} strokeWidth="1.6" />
            ) : fromNode.type === "source" ? (
              <rect x="-20" y="-20" width="40" height="40" rx="3" fill={fc.fill} stroke={fc.stroke} strokeWidth="1.6" />
            ) : <circle r="22" fill={fc.fill} stroke={fc.stroke} strokeWidth="1.6" />}
            <text y="40" textAnchor="middle" fontSize="9.5" fontFamily="Geist, system-ui" fill="var(--ink)">{fromNode.label}</text>
          </g>

          <line x1="68" y1="55" x2="172" y2="55" stroke="var(--ink-2)" strokeWidth="1.6"
            strokeDasharray={e.kind === "inferred" || e.kind === "computed" ? "4 3" : "none"}
            markerEnd="url(#edge-prev-arrow)"
            markerStart={e.bidirectional ? "url(#edge-prev-arrow)" : "none"} />
          <rect x="100" y="44" width={Math.max(40,(labelClean.length||5)*6+12)} height="14" rx="3" fill="var(--panel)" stroke="var(--line)" strokeWidth="0.8" />
          <text x={100+Math.max(40,(labelClean.length||5)*6+12)/2} y="54.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--ink)">:{labelClean || "EDGE"}</text>
          <text x={100+Math.max(40,(labelClean.length||5)*6+12)/2} y="34" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="var(--ink-3)">{e.cardinality}</text>

          <g transform="translate(200,55)">
            {toNode ? (
              toNode.type === "agent" ? (
                <polygon points={[0,1,2,3,4,5].map(i=>{const a=(Math.PI/3)*i-Math.PI/2;const r=22;return`${(r*Math.cos(a)).toFixed(1)},${(r*Math.sin(a)).toFixed(1)}`}).join(" ")} fill={tc.fill} stroke={tc.stroke} strokeWidth="1.6" />
              ) : toNode.type === "source" ? (
                <rect x="-20" y="-20" width="40" height="40" rx="3" fill={tc.fill} stroke={tc.stroke} strokeWidth="1.6" />
              ) : <circle r="22" fill={tc.fill} stroke={tc.stroke} strokeWidth="1.6" />
            ) : <circle r="22" fill="var(--line-2)" stroke="var(--ink-4)" strokeWidth="1.4" strokeDasharray="3 3" />}
            <text y="40" textAnchor="middle" fontSize="9.5" fontFamily="Geist, system-ui" fill={toNode ? "var(--ink)" : "var(--ink-4)"}>{toNode?.label || "?"}</text>
          </g>
        </svg>
      </div>

      <div className="preview-block">
        <div className="preview-head">Cypher pattern</div>
        <pre className="preview-code">{`(:${fromNode.label.replace(/\s/g,"")})\n  -[:${labelClean || "EDGE"}]->\n  (:${toNode ? toNode.label.replace(/\s/g,"") : "?"})`}</pre>
      </div>

      <div className="preview-block">
        <div className="preview-head">Validation</div>
        <ul className="preview-checks">
          {[
            [labelClean.length >= 3, "Label is unique and well-formed"],
            [!!e.to, "Target node selected"],
            [e.accessRoles.length > 0, "Access roles assigned"],
            [true, "No conflict with existing edges"],
          ].map(([ok, label], i) => (
            <li key={i} className={"check " + (ok ? "check-ok" : "check-pend")}><span className="check-dot" />{label}</li>
          ))}
        </ul>
      </div>

      <div className="preview-block">
        <div className="preview-head">Downstream impact</div>
        <div className="preview-impact">
          <span className="big-n">{impact.length}</span>
          <div className="big-n-text">surfaces will pick this up<br /><span className="big-n-sub">on publish to {e.stage}</span></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AddEdgeFlow });
