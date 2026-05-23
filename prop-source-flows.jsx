// prop-source-flows.jsx — Enterprise Property & Source wizards
// Design: one field per line · dropdowns for >3 options · no scattered grids

const { useState, useRef, useEffect, useMemo } = React;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SOURCE_SYSTEMS = [
  { id: "salesforce", name: "Salesforce CRM",     tag: "CRM",       status: "healthy",  icon: "S", color: "#1798c1" },
  { id: "netsuite",   name: "NetSuite ERP",         tag: "ERP",       status: "healthy",  icon: "N", color: "#b8923a" },
  { id: "okta",       name: "Okta Identity",        tag: "IdP",       status: "healthy",  icon: "O", color: "#007dc1" },
  { id: "snowflake",  name: "Snowflake Warehouse",  tag: "Warehouse", status: "healthy",  icon: "❄", color: "#29b5e8" },
  { id: "hubspot",    name: "HubSpot Marketing",    tag: "Marketing", status: "degraded", icon: "H", color: "#ff7a59" },
  { id: "zendesk",    name: "Zendesk Support",      tag: "Support",   status: "healthy",  icon: "Z", color: "#03363d" },
  { id: "stripe",     name: "Stripe Billing",       tag: "Billing",   status: "healthy",  icon: "$", color: "#6772e5" },
  { id: "kafka",      name: "Kafka event stream",   tag: "Stream",    status: "healthy",  icon: "K", color: "#6f8b5f" },
  { id: "custom",     name: "Custom connector",     tag: "Custom",    status: null,       icon: "+", color: "#a09e88" },
];

const DATA_TYPES = [
  { id: "string",    label: "string",    group: "Primitive", desc: "UTF-8 text, variable length" },
  { id: "int",       label: "int",       group: "Primitive", desc: "64-bit signed integer" },
  { id: "float",     label: "float",     group: "Primitive", desc: "64-bit IEEE 754 double" },
  { id: "decimal",   label: "decimal",   group: "Primitive", desc: "Arbitrary precision — safe for money" },
  { id: "bool",      label: "bool",      group: "Primitive", desc: "true / false" },
  { id: "timestamp", label: "timestamp", group: "Temporal",  desc: "UTC nanosecond epoch" },
  { id: "date",      label: "date",      group: "Temporal",  desc: "Calendar date, no time component" },
  { id: "uuid",      label: "uuid",      group: "Identity",  desc: "RFC 4122 UUID v4" },
  { id: "json",      label: "json",      group: "Complex",   desc: "Schemaless JSON document" },
  { id: "enum",      label: "enum(…)",   group: "Complex",   desc: "Closed value set — define members next" },
  { id: "array",     label: "array<T>",  group: "Complex",   desc: "Ordered list of a single type" },
  { id: "struct",    label: "struct",    group: "Complex",   desc: "Typed key-value nested object" },
  { id: "fk",        label: "fk(Node)", group: "Relation",  desc: "Foreign key reference to another node type" },
];

const PII_TIERS = [
  { id: "none",         label: "None",         color: "var(--ink-3)",  desc: "No personal data" },
  { id: "pseudonymous", label: "Pseudonymous", color: "#b8923a",       desc: "Indirect identifier; reversible with key" },
  { id: "personal",     label: "Personal",     color: "#b8923a",       desc: "Directly identifies a natural person" },
  { id: "sensitive",    label: "Sensitive",    color: "var(--coral)",  desc: "Health, finance, religion — GDPR Art. 9" },
  { id: "restricted",   label: "Restricted",   color: "#b14a3c",       desc: "Highest risk — encrypted at rest, access logged" },
];

const MASKING_RULES = [
  { id: "none",      label: "No masking",         desc: "Value returned in full" },
  { id: "partial",   label: "Partial (last 4)",   desc: "e.g. ****4242" },
  { id: "hash",      label: "Deterministic hash", desc: "SHA-256 — consistent across joins" },
  { id: "redact",    label: "Full redaction",      desc: "[REDACTED] for non-privileged roles" },
  { id: "tokenise",  label: "Tokenise (vault)",   desc: "Vault token; only privileged roles get raw value" },
];

const RETENTION_OPTS = [
  { id: "inherit",  label: "Inherit from node type" },
  { id: "30d",      label: "30 days" },
  { id: "90d",      label: "90 days" },
  { id: "1y",       label: "1 year" },
  { id: "7y",       label: "7 years (regulatory)" },
  { id: "forever",  label: "No expiry" },
];

const ROLES = ["acct_admin","fin_ops","cs_platform","governance","data_platform","applied_ml","read_all"];
const GOV_TAGS = ["pii","billing","sensitive","analytics","slo:24h","experimental","deprecated-candidate","audit-required"];

const VALIDATION_PRESETS = [
  { id: "none",    label: "None" },
  { id: "email",   label: "Email address",   pattern: "^[^@]+@[^@]+\\.[^@]+$" },
  { id: "url",     label: "URL (http/https)", pattern: "^https?://.+" },
  { id: "uuid",    label: "UUID v4",          pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}…" },
  { id: "isodate", label: "ISO 8601 date" },
  { id: "phone",   label: "E.164 phone",      pattern: "^\\+[1-9]\\d{6,14}$" },
  { id: "slug",    label: "URL slug",          pattern: "^[a-z0-9]+(-[a-z0-9]+)*$" },
];

const SOURCE_COLS_MOCK = {
  salesforce: [
    { col: "Id",                  type: "string",    sample: "0015g00000AbCdE" },
    { col: "Name",                type: "string",    sample: "Acme Corp" },
    { col: "Industry",            type: "string",    sample: "Technology" },
    { col: "AnnualRevenue",       type: "decimal",   sample: "24500000.00" },
    { col: "BillingCountry",      type: "string",    sample: "US" },
    { col: "OwnerId",             type: "string",    sample: "0055g00000XyZaB" },
    { col: "CreatedDate",         type: "timestamp", sample: "2024-01-12T09:14:00Z" },
    { col: "LastModifiedDate",    type: "timestamp", sample: "2026-04-02T14:22:11Z" },
    { col: "IsDeleted",           type: "bool",      sample: "false" },
    { col: "CustomerPriority__c", type: "string",    sample: "High" },
    { col: "ContractEndDate__c",  type: "date",      sample: "2027-06-30" },
  ],
  netsuite: [
    { col: "internal_id",   type: "int",       sample: "10284" },
    { col: "company_name",  type: "string",    sample: "Acme Corp" },
    { col: "subsidiary",    type: "string",    sample: "US Entity" },
    { col: "currency",      type: "string",    sample: "USD" },
    { col: "balance",       type: "decimal",   sample: "12400.00" },
    { col: "date_created",  type: "timestamp", sample: "2024-01-15T00:00:00Z" },
  ],
  snowflake: [
    { col: "account_key",  type: "uuid",      sample: "7f3b4a…" },
    { col: "domain",       type: "string",    sample: "acme.com" },
    { col: "dau_30d",      type: "int",       sample: "1240" },
    { col: "arr_usd",      type: "decimal",   sample: "48200.00" },
    { col: "churn_score",  type: "float",     sample: "0.14" },
    { col: "last_login_at",type: "timestamp", sample: "2026-05-21T11:04:22Z" },
  ],
};

function getSourceCols(id) {
  return SOURCE_COLS_MOCK[id] || [
    { col: "id",         type: "string",    sample: "abc123" },
    { col: "name",       type: "string",    sample: "Example" },
    { col: "created_at", type: "timestamp", sample: "2026-01-01T00:00:00Z" },
    { col: "updated_at", type: "timestamp", sample: "2026-05-01T00:00:00Z" },
  ];
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function useOutsideClick(ref, open, onClose) {
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
}

// Single full-width form row
function FormRow({ label, required, optional, children, hint, last }) {
  return (
    <div className={"wfr" + (last ? " wfr-last" : "")}>
      <div className="wfr-label">
        {label}
        {required && <span className="wfr-req">REQUIRED</span>}
        {optional && <span className="wfr-opt">OPTIONAL</span>}
      </div>
      <div className="wfr-body">{children}</div>
      {hint && <div className="wfr-hint">{hint}</div>}
    </div>
  );
}

// Grouped dropdown (types, PII, masking, etc.)
function CustomSelect({ value, onChange, options, placeholder = "—", renderTrigger, renderOption, grouped, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, open, () => setOpen(false));

  const allOptions = grouped ? options.flatMap(g => g.items) : options;
  const sel = allOptions.find(o => (o.id || o) === value);

  return (
    <div className={"csel" + (className ? " " + className : "")} ref={ref}>
      <button className={"csel-trigger" + (open ? " open" : "")} onClick={() => setOpen(o => !o)}>
        <span className="csel-val">
          {sel ? (renderTrigger ? renderTrigger(sel) : sel.label || sel.name || sel) : <span className="csel-ph">{placeholder}</span>}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={"csel-chevron" + (open ? " up" : "")}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="csel-menu">
          {grouped ? options.map(g => (
            <div key={g.label}>
              <div className="csel-group">{g.label}</div>
              {g.items.map(o => (
                <button key={o.id} className={"csel-opt" + (value === o.id ? " on" : "")} onClick={() => { onChange(o.id); setOpen(false); }}>
                  {renderOption ? renderOption(o) : <><span className="csel-opt-label">{o.label}</span>{o.desc && <span className="csel-opt-sub">{o.desc}</span>}</>}
                  {value === o.id && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="csel-tick"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
              ))}
            </div>
          )) : options.map(o => {
            const id = o.id || o;
            const label = o.label || o.name || o;
            return (
              <button key={id} className={"csel-opt" + (value === id ? " on" : "")} onClick={() => { onChange(id); setOpen(false); }}>
                {renderOption ? renderOption(o) : <><span className="csel-opt-label">{label}</span>{o.desc && <span className="csel-opt-sub">{o.desc}</span>}</>}
                {value === id && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="csel-tick"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Grouped type select
function TypeSelect({ value, onChange }) {
  const GROUPS = [
    { label: "Primitive", items: DATA_TYPES.filter(t => t.group === "Primitive") },
    { label: "Temporal",  items: DATA_TYPES.filter(t => t.group === "Temporal") },
    { label: "Identity",  items: DATA_TYPES.filter(t => t.group === "Identity") },
    { label: "Complex",   items: DATA_TYPES.filter(t => t.group === "Complex") },
    { label: "Relation",  items: DATA_TYPES.filter(t => t.group === "Relation") },
  ];
  const sel = DATA_TYPES.find(t => t.id === value);
  return (
    <CustomSelect
      value={value} onChange={onChange}
      options={GROUPS} grouped
      placeholder="pick a type"
      renderTrigger={t => <><code className="csel-code">{t.label}</code><span className="csel-val-sub">{t.desc}</span></>}
      renderOption={t => <><code className="csel-code">{t.label}</code><span className="csel-opt-sub">{t.desc}</span></>}
    />
  );
}

// Source system select with icon + health
function SysSelect({ value, onChange }) {
  const sel = SOURCE_SYSTEMS.find(s => s.id === value);
  return (
    <CustomSelect
      value={value} onChange={onChange}
      options={SOURCE_SYSTEMS} placeholder="— choose connector —"
      renderTrigger={s => (
        <span className="csel-sys-val">
          <span className="csel-sys-icon" style={{ background: s.color + "1a", color: s.color }}>{s.icon}</span>
          <span>{s.name}</span>
          <span className={"csel-sys-dot " + (s.status || "custom")} />
        </span>
      )}
      renderOption={s => (
        <span className="csel-sys-val" style={{ width: "100%" }}>
          <span className="csel-sys-icon" style={{ background: s.color + "1a", color: s.color }}>{s.icon}</span>
          <span className="csel-opt-label">{s.name}</span>
          <span className="csel-opt-sub csel-sys-tag">{s.tag}</span>
          <span className={"csel-sys-dot " + (s.status || "custom")} />
        </span>
      )}
    />
  );
}

// Column select (discovered columns)
function ColSelect({ cols, value, onChange, placeholder = "— pick column —" }) {
  const sel = cols.find(c => c.col === value);
  return (
    <CustomSelect
      value={value} onChange={onChange}
      options={cols.map(c => ({ id: c.col, label: c.col, type: c.type, sample: c.sample }))}
      placeholder={placeholder}
      renderTrigger={c => <><code className="csel-code">{c.label}</code><span className="csel-val-sub">{c.id !== value ? "" : (cols.find(x=>x.col===value)?.type || "")}</span></>}
      renderOption={c => (
        <span style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
          <code className="csel-code" style={{ minWidth: 130 }}>{c.label}</code>
          <span className="csel-opt-sub" style={{ minWidth: 70 }}>{c.type}</span>
          <span className="csel-opt-sub" style={{ marginLeft: "auto", opacity: 0.6 }}>{c.sample}</span>
        </span>
      )}
    />
  );
}

// PII select with color swatch
function PIISelect({ value, onChange }) {
  const sel = PII_TIERS.find(t => t.id === value);
  return (
    <CustomSelect
      value={value} onChange={onChange}
      options={PII_TIERS}
      placeholder="— classify —"
      renderTrigger={t => (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
          <span style={{ color: t.color, fontWeight: 500 }}>{t.label}</span>
          <span className="csel-val-sub">{t.desc}</span>
        </span>
      )}
      renderOption={t => (
        <span style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
          <span className="csel-opt-label" style={{ color: t.color }}>{t.label}</span>
          <span className="csel-opt-sub">{t.desc}</span>
        </span>
      )}
    />
  );
}

// Compact radio list — for source kind, load strategy, error policy (4 options)
function RadioList({ options, value, onChange }) {
  return (
    <div className="wrl">
      {options.map(o => (
        <button key={o.id} className={"wrl-item" + (value === o.id ? " on" : "")} onClick={() => onChange(o.id)}>
          <span className={"wrl-radio" + (value === o.id ? " on" : "")} />
          <div className="wrl-body">
            <span className="wrl-label">{o.label}</span>
            {o.tag && <span className={"wrl-tag wrl-tag-" + o.id}>{o.tag}</span>}
            {o.desc && <span className="wrl-desc">{o.desc}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

// Segmented control — 2-3 options only
function Seg({ options, value, onChange, risk }) {
  return (
    <div className="seg">
      {options.map(o => {
        const id = typeof o === "string" ? o : o.id;
        const label = typeof o === "string" ? o : o.label;
        const riskClass = risk && value === id ? " risk-" + id.toLowerCase() : "";
        return (
          <button key={id} className={"seg-opt" + (value === id ? " on" + riskClass : "")} onClick={() => onChange(id)}>{label}</button>
        );
      })}
    </div>
  );
}

// Multi-token select (roles, tags)
function MultiToken({ options, value, onChange, placeholder = "add…" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, open, () => setOpen(false));
  const available = options.filter(o => !value.includes(o));

  return (
    <div className="wmt" ref={ref}>
      <div className={"wmt-field" + (open ? " open" : "")} onClick={() => setOpen(o => !o)}>
        {value.map(v => (
          <span key={v} className="wmt-token">
            {v}
            <button className="wmt-x" onClick={e => { e.stopPropagation(); onChange(value.filter(x => x !== v)); }}>×</button>
          </span>
        ))}
        <span className="wmt-ph">{value.length === 0 ? placeholder : "add…"}</span>
      </div>
      {open && available.length > 0 && (
        <div className="wmt-menu">
          {available.map(o => (
            <button key={o} className="wmt-opt" onClick={() => onChange([...value, o])}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline flag checkboxes
function FlagsRow({ flags, values, onChange }) {
  return (
    <div className="wflag-row">
      {flags.map(f => (
        <label key={f.key} className={"wflag" + (values[f.key] ? " on" : "")}>
          <input type="checkbox" checked={values[f.key]} onChange={e => onChange({ ...values, [f.key]: e.target.checked })} />
          <span>{f.label}</span>
        </label>
      ))}
    </div>
  );
}

// Enum token editor
function EnumEditor({ values, onChange }) {
  const [input, setInput] = useState("");
  const add = () => { const v = input.trim(); if (v && !values.includes(v)) { onChange([...values, v]); setInput(""); } };
  return (
    <div className="wenum">
      <div className="wenum-tokens">
        {values.map((v, i) => (
          <span key={i} className="wmt-token">{v}<button className="wmt-x" onClick={() => onChange(values.filter((_, j) => j !== i))}>×</button></span>
        ))}
        <input className="wenum-input" placeholder="type value, press Enter" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
      </div>
    </div>
  );
}

// Slider row
function SliderRow({ value, onChange, min = 0, max = 100, step = 1, fmt }) {
  return (
    <div className="wslider">
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} className="wslider-input" />
      <span className="wslider-val">{fmt ? fmt(value) : value}</span>
    </div>
  );
}

// Backfill banner
function BackfillBanner({ backfill, onChange, estimate }) {
  return (
    <div className={"wbf" + (backfill ? " on" : "")}>
      <div className="wbf-left">
        <span className="wbf-tag">BACKFILL</span>
        <div>
          <div className="wbf-title">{backfill ? "Historical data will be replayed" : "Backfill disabled"}</div>
          {estimate && <div className="wbf-sub">{estimate}</div>}
        </div>
      </div>
      <label className="switch"><input type="checkbox" checked={backfill} onChange={e => onChange(e.target.checked)} /><span className="switch-track" /></label>
    </div>
  );
}

// ─── FLOW SHELL (shared wrapper) ──────────────────────────────────────────────

function WizardShell({ eyebrow, titleFrom, titleTo, titleLabel, titleType, stage, steps, step, setStep, onClose, rightPane, children, canNext, onNext, onPublish }) {
  return (
    <div className="flow-overlay" onClick={onClose}>
      <div className="flow-shell" onClick={e => e.stopPropagation()}>
        <div className="flow-head">
          <div className="flow-head-left">
            <div className="flow-eyebrow">{eyebrow}</div>
            <div className="flow-title">
              {titleFrom}
              {titleLabel && <><span className="flow-title-arrow">·</span><span className="flow-title-label">{titleLabel}</span></>}
              {titleType && <span className="flow-title-type">{titleType}</span>}
              {titleTo && <><span className="flow-title-arrow">→</span>{titleTo}</>}
            </div>
          </div>
          <div className="flow-head-right">
            <span className="flow-stage-pill">target · <b>{stage}</b></span>
            <button className="flow-close" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
        <div className="flow-body">
          <aside className="flow-steps">
            {steps.map((s, i) => (
              <button key={i} className={"flow-step" + (i === step ? " on" : "") + (i < step ? " done" : "")} onClick={() => setStep(i)}>
                <span className="flow-step-n">{i < step ? "✓" : i + 1}</span>
                <div className="flow-step-text">
                  <div className="flow-step-label">{s.label}</div>
                  <div className="flow-step-hint">{s.hint}</div>
                </div>
              </button>
            ))}
            <div className="flow-steps-foot">
              <div className="flow-keymap">
                <span className="kbd">⌘↵</span><span>Publish</span>
                <span className="kbd">⌘S</span><span>Draft</span>
              </div>
            </div>
          </aside>
          <main className="flow-main">{children}</main>
          {rightPane && <aside className="flow-preview">{rightPane}</aside>}
        </div>
        <div className="flow-foot">
          <div className="flow-foot-left">
            <button className="btn-ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</button>
            <span className="flow-foot-help">Step {step + 1} of {steps.length} · <b>{steps[step].label}</b></span>
          </div>
          <div className="flow-foot-right">
            <button className="btn-ghost">Save draft</button>
            {step < steps.length - 1
              ? <button className="btn-dark" onClick={onNext} disabled={!canNext}>Continue →</button>
              : <button className="btn-dark" onClick={onPublish}>Publish to {stage} ↵</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// Step wrapper
function StepWrap({ eyebrow, title, desc, children }) {
  return (
    <div className="wstep">
      <div className="wstep-head">
        <div className="step-eyebrow">{eyebrow}</div>
        <div className="wstep-title">{title}</div>
        {desc && <div className="wstep-desc">{desc}</div>}
      </div>
      <div className="wstep-body">{children}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  ADD PROPERTY WIZARD
// ════════════════════════════════════════════════════════════════════════════

const PROP_STEPS = [
  { label: "Basics",     hint: "Name, type, flags" },
  { label: "Source",     hint: "Where the value comes from" },
  { label: "Validation", hint: "Rules and format" },
  { label: "Governance", hint: "PII, access, retention" },
  { label: "Review",     hint: "Migration diff & publish" },
];

const SOURCE_KIND_OPTS = [
  { id: "direct",   label: "Direct source column",  tag: "DIRECT",   desc: "Value loaded from a source-system column or stream." },
  { id: "computed", label: "Computed expression",   tag: "COMPUTED", desc: "Derived from a formula over other properties at write time." },
  { id: "agent",    label: "Agent-written",          tag: "AGENT",    desc: "An agent emits this value as an output of its reasoning." },
  { id: "constant", label: "Constant / seed",        tag: "CONSTANT", desc: "Set once at creation and never overwritten by a sync." },
];

function AddPropertyFlow({ node, onClose }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState({
    name: "", description: "", type: "string", enumValues: [],
    arrayItemType: "string", fkNode: "",
    defaultValue: "", exampleValue: "",
    required: false, indexed: false, unique: false, nullable: true,
    sourceKind: "direct", sourceSystem: "salesforce", sourceTable: "",
    sourceCol: "", coercion: "auto", expression: "", agentId: "",
    agentField: "", agentConfidence: 80, constantValue: "", constantBehaviour: "on_create",
    validationPreset: "none", customRegex: "", minVal: "", maxVal: "",
    nullPolicy: "allow", validationMode: "log",
    piiTier: "none", maskingRule: "none", retention: "inherit",
    accessRoles: ["read_all"], tags: [], changeRisk: "LOW",
    stage: "draft", backfill: true,
  });

  const set = patch => setP(v => ({ ...v, ...patch }));
  const nameCleaned = p.name.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/^_+|_+$/g, "");
  const nameValid = nameCleaned.length >= 2;
  const canNext = step === 0 ? (nameValid && !!p.type) : true;
  const agents = (window.NODES || []).filter(n => n.type === "agent");
  const srcCols = getSourceCols(p.sourceSystem);

  const flags = { required: p.required, indexed: p.indexed, unique: p.unique, nullable: p.nullable };

  const titleFrom = (
    <span className="flow-title-from">
      {node && window.ListGlyph && <window.ListGlyph node={node} size={18} />}
      {node?.label}
    </span>
  );

  return (
    <WizardShell
      eyebrow={`SCHEMA · ${node?.label?.toUpperCase()} · ADD PROPERTY`}
      titleFrom={titleFrom}
      titleLabel={nameCleaned ? "." + nameCleaned : null}
      titleType={p.type && nameCleaned ? p.type : null}
      stage={p.stage}
      steps={PROP_STEPS} step={step} setStep={setStep}
      canNext={canNext}
      onNext={() => setStep(s => s + 1)}
      onPublish={onClose}
      onClose={onClose}
      rightPane={<PropPreview p={p} node={node} nameCleaned={nameCleaned} />}
    >
      {step === 0 && <PropBasics p={p} set={set} nameCleaned={nameCleaned} nameValid={nameValid} flags={flags} agents={agents} />}
      {step === 1 && <PropSource p={p} set={set} node={node} agents={agents} srcCols={srcCols} />}
      {step === 2 && <PropValidation p={p} set={set} />}
      {step === 3 && <PropGovernance p={p} set={set} />}
      {step === 4 && <PropReview p={p} set={set} node={node} nameCleaned={nameCleaned} onClose={onClose} />}
    </WizardShell>
  );
}

// ── Step 1: Basics ────────────────────────────────────────────────────────────

function PropBasics({ p, set, nameCleaned, nameValid, flags }) {
  const [nameTouched, setNameTouched] = useState(false);
  const nodeOpts = (window.NODES || []).filter(n => n.type === "entity");

  return (
    <StepWrap eyebrow="STEP 1 · BASICS" title="Name and type this property" desc="Property names become part of the schema's public API — once published, agents and queries will reference this name.">
      <FormRow label="Property name" required hint={nameCleaned && nameValid ? `✓  .${nameCleaned} is available` : "lowercase_snake_case · letters, digits, underscores"}>
        <div className="wfr-prefix-input">
          <span className="wfr-prefix">.</span>
          <input
            className={"winput winput-mono winput-xl" + (nameTouched && !nameValid ? " winput-err" : "")}
            placeholder="annual_revenue_usd"
            value={p.name}
            onChange={e => { set({ name: e.target.value }); setNameTouched(true); }}
            autoFocus
          />
        </div>
      </FormRow>

      <FormRow label="Data type" required hint={DATA_TYPES.find(t => t.id === p.type)?.desc}>
        <TypeSelect value={p.type} onChange={v => set({ type: v })} />
      </FormRow>

      {p.type === "enum" && (
        <FormRow label="Enum values" hint="Press Enter to add. Unknown values policy is set in Validation.">
          <EnumEditor values={p.enumValues} onChange={v => set({ enumValues: v })} />
        </FormRow>
      )}

      {p.type === "array" && (
        <FormRow label="Array item type">
          <CustomSelect value={p.arrayItemType} onChange={v => set({ arrayItemType: v })}
            options={DATA_TYPES.filter(t => !["array","struct","fk"].includes(t.id)).map(t => ({ id: t.id, label: t.label, desc: t.desc }))} />
        </FormRow>
      )}

      {p.type === "fk" && (
        <FormRow label="References node type">
          <CustomSelect value={p.fkNode} onChange={v => set({ fkNode: v })}
            placeholder="— pick node type —"
            options={(window.NODES || []).filter(n => n.type === "entity").map(n => ({ id: n.id, label: n.label }))} />
        </FormRow>
      )}

      <FormRow label="Description" optional>
        <textarea className="winput winput-textarea" rows="2" placeholder="What does this property represent? What business concept does it encode?" value={p.description} onChange={e => set({ description: e.target.value })} />
      </FormRow>

      <FormRow label="Default value" optional>
        <input className="winput winput-mono" placeholder={p.type === "bool" ? "false" : p.type === "int" ? "0" : "null"} value={p.defaultValue} onChange={e => set({ defaultValue: e.target.value })} />
      </FormRow>

      <FormRow label="Example value" optional hint="Shown in documentation and tooltips.">
        <input className="winput winput-mono" placeholder="acme.com" value={p.exampleValue} onChange={e => set({ exampleValue: e.target.value })} />
      </FormRow>

      <FormRow label="Flags" last hint="Required: write fails if absent · Indexed: B-tree lookup · Unique: enforces uniqueness · Nullable: allows null">
        <FlagsRow
          flags={[
            { key: "required", label: "Required" },
            { key: "indexed",  label: "Indexed" },
            { key: "unique",   label: "Unique" },
            { key: "nullable", label: "Nullable" },
          ]}
          values={flags}
          onChange={v => set(v)}
        />
      </FormRow>
    </StepWrap>
  );
}

// ── Step 2: Source ────────────────────────────────────────────────────────────

function PropSource({ p, set, node, agents, srcCols }) {
  return (
    <StepWrap eyebrow="STEP 2 · SOURCE" title="Where does the value come from?" desc="Every property needs a system of record. Lineage and freshness SLOs are derived from this choice.">
      <FormRow label="Source kind" required>
        <RadioList value={p.sourceKind} onChange={v => set({ sourceKind: v })} options={SOURCE_KIND_OPTS} />
      </FormRow>

      {p.sourceKind === "direct" && <>
        <FormRow label="Source system" required>
          <SysSelect value={p.sourceSystem} onChange={v => set({ sourceSystem: v, sourceCol: "" })} />
        </FormRow>
        <FormRow label="Source table / topic">
          <input className="winput winput-mono" placeholder="accounts" value={p.sourceTable} onChange={e => set({ sourceTable: e.target.value })} />
        </FormRow>
        <FormRow label="Source column" required hint={srcCols.length + " columns discovered from " + p.sourceSystem}>
          <ColSelect cols={srcCols} value={p.sourceCol} onChange={v => set({ sourceCol: v })} />
        </FormRow>
        <FormRow label="Type coercion">
          <Seg options={["auto","strict","custom"]} value={p.coercion} onChange={v => set({ coercion: v })} />
        </FormRow>
        <FormRow label="Update cadence" last>
          <Seg options={["streaming","5min","hourly","daily"]} value={p.schedule || "5min"} onChange={v => set({ schedule: v })} />
        </FormRow>
      </>}

      {p.sourceKind === "computed" && <>
        <FormRow label="Expression" hint="Reference other properties by name. Supports CASE, COALESCE, arithmetic, string functions.">
          <textarea className="winput winput-mono winput-code" rows="7" placeholder={"CASE\n  WHEN arr_usd >= 100000 THEN 'ENT'\n  WHEN arr_usd >= 10000  THEN 'MM'\n  ELSE 'SMB'\nEND"} value={p.expression} onChange={e => set({ expression: e.target.value })} />
        </FormRow>
        <FormRow label="Re-evaluate on">
          <Seg options={["any_change","schedule","manual"]} value={p.reeval || "any_change"} onChange={v => set({ reeval: v })} />
        </FormRow>
        <FormRow label="Fallback if expression fails" last>
          <CustomSelect value={p.fallback || "null"} onChange={v => set({ fallback: v })} options={[
            { id: "null",    label: "null",          desc: "Store null silently" },
            { id: "default", label: "Use default",   desc: "Fall back to the defined default value" },
            { id: "error",   label: "Surface error", desc: "Write fails; shows in quality dashboard" },
          ]} />
        </FormRow>
      </>}

      {p.sourceKind === "agent" && <>
        <FormRow label="Authoring agent">
          <CustomSelect value={p.agentId} onChange={v => set({ agentId: v })} placeholder="— pick agent —"
            options={agents.map(a => ({ id: a.id, label: a.label, desc: a.desc }))} />
        </FormRow>
        <FormRow label="Output field name" hint="The key in the agent's output JSON that maps to this property.">
          <input className="winput winput-mono" placeholder="score_value" value={p.agentField} onChange={e => set({ agentField: e.target.value })} />
        </FormRow>
        <FormRow label={`Confidence threshold · ${p.agentConfidence}%`} hint="Values below threshold are stored as null with a :proposed annotation." last>
          <SliderRow value={p.agentConfidence} onChange={v => set({ agentConfidence: v })} fmt={v => "≥ " + (v/100).toFixed(2)} />
        </FormRow>
      </>}

      {p.sourceKind === "constant" && <>
        <FormRow label="Constant value">
          <input className="winput winput-mono" placeholder="e.g. true, 0, SMB" value={p.constantValue} onChange={e => set({ constantValue: e.target.value })} />
        </FormRow>
        <FormRow label="Set behaviour" last>
          <CustomSelect value={p.constantBehaviour} onChange={v => set({ constantBehaviour: v })} options={[
            { id: "on_create", label: "On create only", desc: "Set once at first write, never overwritten" },
            { id: "always",    label: "Always",          desc: "Overwrite on every sync" },
            { id: "if_null",   label: "If null only",    desc: "Only sets when the current value is null" },
          ]} />
        </FormRow>
      </>}

      <BackfillBanner backfill={p.backfill} onChange={v => set({ backfill: v })} estimate="~12,400 rows · ~3.2 min in staging" />
    </StepWrap>
  );
}

// ── Step 3: Validation ────────────────────────────────────────────────────────

function PropValidation({ p, set }) {
  const isNumeric = ["int","float","decimal"].includes(p.type);
  const isString  = ["string","uuid"].includes(p.type);

  return (
    <StepWrap eyebrow="STEP 3 · VALIDATION" title="Define validation rules" desc="Rules run at write time. Violations appear in the Quality dashboard and daily drift reports.">
      {isString && (
        <FormRow label="Format preset">
          <CustomSelect value={p.validationPreset} onChange={v => set({ validationPreset: v })}
            options={VALIDATION_PRESETS.map(vp => ({ id: vp.id, label: vp.label, desc: vp.pattern ? vp.pattern.slice(0,40) + "…" : "" }))} />
        </FormRow>
      )}

      {isString && (
        <FormRow label="Custom regex" optional hint="Applied after format preset. Failed rows are flagged, not rejected, unless mode is strict.">
          <div className="wfr-prefix-input">
            <span className="wfr-prefix">/</span>
            <input className="winput winput-mono" style={{ borderRadius: 0, borderLeft: 0, borderRight: 0 }} placeholder="^[A-Z]{2,3}-\d{4}$" value={p.customRegex} onChange={e => set({ customRegex: e.target.value })} />
            <span className="wfr-prefix wfr-suffix">/i</span>
          </div>
        </FormRow>
      )}

      {isNumeric && (
        <FormRow label="Value range" hint="Both bounds are inclusive. Leave blank for no constraint.">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input className="winput winput-mono" placeholder="min" style={{ width: 120 }} value={p.minVal} onChange={e => set({ minVal: e.target.value })} />
            <span style={{ color: "var(--ink-3)", fontFamily: "JetBrains Mono", fontSize: 13 }}>to</span>
            <input className="winput winput-mono" placeholder="max" style={{ width: 120 }} value={p.maxVal} onChange={e => set({ maxVal: e.target.value })} />
          </div>
        </FormRow>
      )}

      {p.type === "enum" && (
        <FormRow label="On unknown enum value">
          <CustomSelect value={p.enumUnknown || "reject"} onChange={v => set({ enumUnknown: v })} options={[
            { id: "reject",     label: "Reject",     desc: "Write fails for any unlisted value" },
            { id: "null",       label: "Null",        desc: "Store null; behavior is preserved" },
            { id: "quarantine", label: "Quarantine",  desc: "Proposed state pending enum expansion review" },
            { id: "allow_new",  label: "Allow new",  desc: "Enum auto-expands; triggers drift notification" },
          ]} />
        </FormRow>
      )}

      <FormRow label="Null policy">
        <Seg options={["allow","warn","reject"]} value={p.nullPolicy} onChange={v => set({ nullPolicy: v })} />
      </FormRow>

      <FormRow label="Validation mode" hint={
        p.validationMode === "log" ? "Violations surface in reporting but don't block writes." :
        p.validationMode === "warn" ? "Violations create warning events consumers can filter on." :
        "Any violation causes the entire write to fail."
      } last>
        <Seg options={["log","warn","strict"]} value={p.validationMode} onChange={v => set({ validationMode: v })} />
      </FormRow>
    </StepWrap>
  );
}

// ── Step 4: Governance ────────────────────────────────────────────────────────

function PropGovernance({ p, set }) {
  return (
    <StepWrap eyebrow="STEP 4 · GOVERNANCE" title="PII classification, access, and retention" desc="These settings follow this property across every system that reads it. Retrofitting PII classification is expensive — get it right now.">
      <FormRow label="PII classification" required hint={PII_TIERS.find(t => t.id === p.piiTier)?.desc}>
        <PIISelect value={p.piiTier} onChange={v => set({ piiTier: v })} />
      </FormRow>

      <FormRow label="Masking rule" hint={MASKING_RULES.find(m => m.id === p.maskingRule)?.desc}>
        <CustomSelect value={p.maskingRule} onChange={v => set({ maskingRule: v })}
          options={MASKING_RULES} />
      </FormRow>

      <FormRow label="Retention policy">
        <CustomSelect value={p.retention} onChange={v => set({ retention: v })}
          options={RETENTION_OPTS} />
      </FormRow>

      <FormRow label="Access roles" hint="Who can read this property value.">
        <MultiToken options={ROLES} value={p.accessRoles} onChange={v => set({ accessRoles: v })} placeholder="add roles…" />
      </FormRow>

      <FormRow label="Tags">
        <MultiToken options={GOV_TAGS} value={p.tags} onChange={v => set({ tags: v })} placeholder="add tags…" />
      </FormRow>

      <FormRow label="Change risk" hint={
        p.changeRisk === "LOW" ? "Self-approval. Lands on next deploy." :
        p.changeRisk === "MEDIUM" ? "1 reviewer from owner team required." :
        "2 reviewers (owner + governance) + staging soak ≥ 24 h."
      } last>
        <Seg risk options={[{id:"LOW",label:"LOW"},{id:"MEDIUM",label:"MEDIUM"},{id:"HIGH",label:"HIGH"}]} value={p.changeRisk} onChange={v => set({ changeRisk: v })} />
      </FormRow>
    </StepWrap>
  );
}

// ── Step 5: Review ────────────────────────────────────────────────────────────

function PropReview({ p, set, node, nameCleaned, onClose }) {
  const piiTier = ({ none:"None", pseudonymous:"Pseudonymous", personal:"Personal", sensitive:"Sensitive", restricted:"Restricted" })[p.piiTier];
  const approvers = p.changeRisk === "HIGH"
    ? [{ who: "morgan.lee", team: "data-platform" }, { who: "ramin.k", team: "governance" }]
    : p.changeRisk === "MEDIUM" ? [{ who: "morgan.lee", team: "data-platform" }] : [];

  const cypher = `ALTER NODE TYPE :${node?.label?.replace(/\s/g,"") || "Node"}
  ADD PROPERTY ${nameCleaned || "new_property"} ${p.type.toUpperCase()}${p.required ? " NOT NULL" : ""}${p.defaultValue ? ` DEFAULT ${p.defaultValue}` : ""};
${p.indexed ? `CREATE INDEX ON :${node?.label?.replace(/\s/g,"")}(${nameCleaned});` : ""}
${p.piiTier !== "none" ? `TAG PROPERTY :${node?.label?.replace(/\s/g,"")}(${nameCleaned}) AS PII TIER ${p.piiTier.toUpperCase()};` : ""}
${p.maskingRule !== "none" ? `SET MASKING ON :${node?.label?.replace(/\s/g,"")}(${nameCleaned}) = "${p.maskingRule}";` : ""}
GRANT READ ON :${node?.label?.replace(/\s/g,"")}(${nameCleaned}) TO ROLES (${p.accessRoles.join(", ")});
${p.retention !== "inherit" ? `SET RETENTION ON :${node?.label?.replace(/\s/g,"")}(${nameCleaned}) = "${p.retention}";` : ""}
${p.backfill ? `BACKFILL :${node?.label?.replace(/\s/g,"")}(${nameCleaned}) FROM SOURCE "${p.sourceSystem}" COLUMN "${p.sourceCol || "?"}";` : ""}`;

  return (
    <StepWrap eyebrow="STEP 5 · REVIEW & PUBLISH" title="Last look before this lands in the schema" desc="Once published the property appears in the next schema version with a full audit trail.">
      <div className="review-col">
        <section className="card">
          <div className="card-head">Summary</div>
          <ul className="rev-list">
            {[
              ["Name",      <code>.{nameCleaned || "?"}</code>],
              ["Type",      p.type],
              ["Flags",     [p.required && "required", p.indexed && "indexed", p.unique && "unique"].filter(Boolean).join(" · ") || "—"],
              ["Source",    p.sourceKind + (p.sourceCol ? " · " + p.sourceCol : "")],
              ["PII tier",  piiTier],
              ["Masking",   MASKING_RULES.find(m => m.id === p.maskingRule)?.label],
              ["Retention", p.retention],
              ["Access",    p.accessRoles.join(", ") || "—"],
              ["Risk",      <span className={"nv-change nv-change-" + p.changeRisk.toLowerCase()}>{p.changeRisk}</span>],
              ["Backfill",  p.backfill ? "on" : "off"],
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
            <Seg options={["draft","staging","live"]} value={p.stage} onChange={v => set({ stage: v })} />
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)", fontFamily: "JetBrains Mono" }}>
              {p.stage === "draft" ? "Working branch — no consumers see it yet." :
               p.stage === "staging" ? "Runs in staging graph — safe for agent test runs." :
               "Production — all consumers gain this property now."}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head card-head-row">
            <div>Migration <span className="card-head-sub">cypher diff</span></div>
            <div className="card-head-actions"><button className="btn-ghost">Copy</button></div>
          </div>
          <pre className="cypher-block">{cypher}</pre>
        </section>
      </div>
    </StepWrap>
  );
}

// ── Prop Preview ──────────────────────────────────────────────────────────────

function PropPreview({ p, node, nameCleaned }) {
  const piiTier = PII_TIERS.find(t => t.id === p.piiTier);
  return (
    <div className="preview-stack">
      <div className="preview-block">
        <div className="preview-head">Property preview</div>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <code style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>.{nameCleaned || "property_name"}</code>
            <span className="ppc-type">{p.type}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {p.required && <span className="snap-tag">req</span>}
            {p.indexed   && <span className="snap-tag snap-idx">idx</span>}
            {p.unique    && <span className="snap-tag snap-idx">unique</span>}
            {p.piiTier !== "none" && <span className="snap-tag snap-pii">PII · {p.piiTier}</span>}
            {p.sourceKind === "computed" && <span className="snap-tag snap-comp">fx</span>}
            {p.sourceKind === "agent"    && <span className="snap-tag snap-comp">agent</span>}
          </div>
          {p.description && <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4 }}>{p.description}</div>}
          {p.exampleValue && <div style={{ marginTop: 6, fontFamily: "JetBrains Mono", fontSize: 11, color: "var(--ink-3)" }}>e.g. <code style={{ background: "var(--chip)", padding: "1px 5px", borderRadius: 3, color: "var(--ink)" }}>{p.exampleValue}</code></div>}
        </div>
      </div>
      <div className="preview-block">
        <div className="preview-head">Validation</div>
        <ul className="preview-checks">
          {[
            [nameCleaned.length >= 2, "Name is valid"],
            [!!p.type, "Type selected"],
            [!!p.piiTier, "PII tier set"],
            [p.accessRoles.length > 0, "Access roles assigned"],
          ].map(([ok, label], i) => (
            <li key={i} className={"check " + (ok ? "check-ok" : "check-pend")}><span className="check-dot" /> {label}</li>
          ))}
          {p.piiTier !== "none" && <li className="check check-info"><span className="check-dot" /> PII — change risk auto-elevated</li>}
        </ul>
      </div>
      <div className="preview-block">
        <div className="preview-head">Schema snippet</div>
        <pre className="preview-code">{`(:${node?.label?.replace(/\s/g,"") || "Node"} {
  ${nameCleaned || "property_name"}: ${p.type}${p.required ? " // required" : ""}${p.piiTier !== "none" ? "\n  // PII: " + p.piiTier : ""}
})`}</pre>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  LINK SOURCE WIZARD
// ════════════════════════════════════════════════════════════════════════════

const SRC_STEPS = [
  { label: "Source system", hint: "Pick connector from catalog" },
  { label: "Connection",    hint: "Object, PK, load strategy"  },
  { label: "Column mapping",hint: "Map source → node props"    },
  { label: "Schedule & SLO",hint: "Cadence, freshness, alerts" },
  { label: "Review",        hint: "Config & publish"          },
];

const LOAD_STRATEGIES = [
  { id: "incremental", label: "Incremental", tag: "INCR",     desc: "Read rows where updated_at > last watermark. Fast; requires a reliable timestamp." },
  { id: "cdc",         label: "CDC",          tag: "CDC",      desc: "Capture database change events. Near-zero lag; requires Debezium/connector support." },
  { id: "full",        label: "Full load",    tag: "FULL",     desc: "Replace the entire object on every run. Safe but expensive; for small reference tables." },
];

const ERROR_POLICIES = [
  { id: "alert",       label: "Alert + continue",   desc: "Notify and continue processing remaining rows." },
  { id: "quarantine",  label: "Quarantine row",     desc: "Move failing rows to quarantine table for manual review." },
  { id: "rollback",    label: "Rollback batch",     desc: "Roll back entire batch on any error. Safest, slowest." },
  { id: "dead_letter", label: "Dead-letter queue",  desc: "Route errors to DLQ; on-call paged after threshold." },
];

function LinkSourceFlow({ node, existingSources, onClose }) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState({
    system: "", customName: "", table: "", query: "", inputMode: "table",
    pkCol: "", joinCol: "", incrementalCol: "updated_at",
    loadStrategy: "incremental", mapping: {}, unmappedPolicy: "ignore",
    cadence: "5min", freshnessSLO: "30m", batchWindow: "15m",
    retryCount: 3, retryDelay: "5m", onError: "alert",
    alertChannel: "#schema-alerts", owner: "data-platform",
    stage: "staging", backfill: true, backfillWindow: "30d", tags: [],
  });

  const set = patch => setS(v => ({ ...v, ...patch }));
  const sel = SOURCE_SYSTEMS.find(x => x.id === s.system);
  const srcCols = s.system ? getSourceCols(s.system) : [];
  const nodeProps = (window.PROPS_BY_NODE?.[node?.id] || []).map(p => ({ id: p.name, label: p.name, type: p.type }));
  const mappedCount = Object.values(s.mapping).filter(Boolean).length;
  const canNext = step === 0 ? !!s.system : step === 1 ? !!(s.table || s.query) : true;

  const titleFrom = sel ? (
    <span className="flow-title-from">
      <span className="csel-sys-icon" style={{ background: sel.color + "1a", color: sel.color, borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>{sel.icon}</span>
      {sel.name}
    </span>
  ) : <span className="flow-title-empty">choose source</span>;

  const titleTo = (
    <span className="flow-title-to">
      {node && window.ListGlyph && <window.ListGlyph node={node} size={18} />}
      {node?.label}
    </span>
  );

  return (
    <WizardShell
      eyebrow={`SCHEMA · ${node?.label?.toUpperCase()} · LINK SOURCE`}
      titleFrom={titleFrom} titleTo={titleTo}
      stage={s.stage}
      steps={SRC_STEPS} step={step} setStep={setStep}
      canNext={canNext}
      onNext={() => setStep(x => x + 1)}
      onPublish={onClose}
      onClose={onClose}
      rightPane={<SrcPreview s={s} sel={sel} node={node} srcCols={srcCols} nodeProps={nodeProps} mappedCount={mappedCount} />}
    >
      {step === 0 && <SrcSystem s={s} set={set} />}
      {step === 1 && <SrcConnection s={s} set={set} sel={sel} srcCols={srcCols} />}
      {step === 2 && <SrcMapping s={s} set={set} srcCols={srcCols} nodeProps={nodeProps} node={node} sel={sel} />}
      {step === 3 && <SrcSchedule s={s} set={set} />}
      {step === 4 && <SrcReview s={s} set={set} node={node} sel={sel} srcCols={srcCols} mappedCount={mappedCount} onClose={onClose} />}
    </WizardShell>
  );
}

// ── Src Step 1: System ────────────────────────────────────────────────────────

function SrcSystem({ s, set }) {
  const sel = SOURCE_SYSTEMS.find(x => x.id === s.system);
  return (
    <StepWrap eyebrow="STEP 1 · SOURCE SYSTEM" title="Pick a source connector" desc="Select the system that owns this data. Health indicators reflect the connector's current status in this environment.">
      <FormRow label="Source system" required hint={sel?.status === "degraded" ? "⚠ This connector is currently degraded. Schema discovery may be incomplete." : sel ? `Connected · ${sel.tag} · ${sel.status}` : ""}>
        <SysSelect value={s.system} onChange={v => set({ system: v })} />
      </FormRow>

      {sel && (
        <FormRow label="Connector details" last>
          <div className="wconn-details">
            {[
              ["Connector version", "2.4.1"],
              ["Auth",              "OAuth2 + service account"],
              ["Last schema sync",  "4 min ago"],
              ["Available objects", "142"],
              ["Status",            sel.status],
            ].map(([k, v]) => (
              <div key={k} className="wconn-row">
                <span className="wconn-k">{k}</span>
                <span className="wconn-v" style={k === "Status" ? { color: sel.status === "healthy" ? "var(--green)" : "var(--gold)" } : {}}>{v}</span>
              </div>
            ))}
          </div>
        </FormRow>
      )}

      {s.system === "custom" && (
        <>
          <FormRow label="Connector name">
            <input className="winput" placeholder="My connector" value={s.customName} onChange={e => set({ customName: e.target.value })} />
          </FormRow>
          <FormRow label="Connector type" last>
            <CustomSelect value={s.customType || "REST API"} onChange={v => set({ customType: v })} options={
              ["REST API","GraphQL","JDBC","gRPC","Webhook","File (S3/GCS)","SFTP","Custom script"].map(t => ({ id: t, label: t }))
            } />
          </FormRow>
        </>
      )}
    </StepWrap>
  );
}

// ── Src Step 2: Connection ────────────────────────────────────────────────────

function SrcConnection({ s, set, sel, srcCols }) {
  return (
    <StepWrap eyebrow="STEP 2 · CONNECTION" title="Configure object and join key" desc="Tell the pipeline which object to read and how to match rows to node instances.">
      <FormRow label="Input mode">
        <Seg options={["table","query","topic"]} value={s.inputMode} onChange={v => set({ inputMode: v })} />
      </FormRow>

      {s.inputMode === "table" && (
        <FormRow label="Source table / object" required hint={s.table && srcCols.length ? `${srcCols.length} columns discovered` : ""}>
          <input className="winput winput-mono" placeholder={sel?.id === "salesforce" ? "Account" : "accounts"} value={s.table} onChange={e => set({ table: e.target.value })} />
        </FormRow>
      )}

      {s.inputMode === "query" && (
        <FormRow label="Custom SQL" required>
          <textarea className="winput winput-mono winput-code" rows="6" placeholder={"SELECT id, name, industry, arr_usd, updated_at\nFROM accounts\nWHERE is_deleted = false"} value={s.query} onChange={e => set({ query: e.target.value })} />
        </FormRow>
      )}

      {s.inputMode === "topic" && (
        <FormRow label="Topic / stream name" required>
          <input className="winput winput-mono" placeholder="events.accounts.upserted" value={s.table} onChange={e => set({ table: e.target.value })} />
        </FormRow>
      )}

      <FormRow label="Primary key column" hint="Used for deduplication — must be unique and stable.">
        <ColSelect cols={srcCols} value={s.pkCol} onChange={v => set({ pkCol: v })} placeholder="— pick PK column —" />
      </FormRow>

      <FormRow label="Join key → node property" hint="The column that matches an existing node instance's identifier.">
        <ColSelect cols={srcCols} value={s.joinCol} onChange={v => set({ joinCol: v })} placeholder="— pick join column —" />
      </FormRow>

      <FormRow label="Load strategy">
        <RadioList options={LOAD_STRATEGIES} value={s.loadStrategy} onChange={v => set({ loadStrategy: v })} />
      </FormRow>

      {s.loadStrategy === "incremental" && (
        <FormRow label="Watermark column" hint="Must be an indexed timestamp the source updates on every row change." last>
          <ColSelect cols={srcCols.filter(c => c.type === "timestamp" || c.col.includes("at") || c.col.includes("date"))} value={s.incrementalCol} onChange={v => set({ incrementalCol: v })} />
        </FormRow>
      )}
    </StepWrap>
  );
}

// ── Src Step 3: Column Mapping ────────────────────────────────────────────────

function SrcMapping({ s, set, srcCols, nodeProps, node, sel }) {
  const updateMap = (col, propId) => set({ mapping: { ...s.mapping, [col]: propId } });
  const mappedCount = Object.values(s.mapping).filter(Boolean).length;

  return (
    <StepWrap eyebrow="STEP 3 · COLUMN MAPPING" title="Map source columns to node properties" desc="Unmapped source columns are dropped. Unmapped node properties retain their current value.">
      <FormRow label={`Coverage · ${mappedCount} / ${srcCols.length} columns mapped`} hint="Coercion is applied automatically when types differ. Override per column if needed.">
        <div style={{ height: 4, background: "var(--line-2)", borderRadius: 2, overflow: "hidden", marginBottom: 2 }}>
          <div style={{ height: "100%", width: (srcCols.length > 0 ? mappedCount/srcCols.length*100 : 0) + "%", background: mappedCount > 0 ? "var(--green)" : "var(--line)", transition: "width 200ms" }} />
        </div>
      </FormRow>

      <FormRow label="Column mapping" last>
        <div className="wmap-table">
          <div className="wmap-head">
            <div>Source column <span className="map-src-tag">{sel?.name?.split(" ")[0] || "source"}</span></div>
            <div></div>
            <div>Node property <span className="map-src-tag">:{node?.label}</span></div>
            <div>Coercion</div>
          </div>
          {srcCols.map(col => {
            const mapped = s.mapping[col.col];
            const targetProp = nodeProps.find(p => p.id === mapped);
            const mismatch = mapped && targetProp && targetProp.type !== col.type;
            return (
              <div key={col.col} className={"wmap-row" + (mapped ? " mapped" : "")}>
                <div className="wmap-src">
                  <code className="wmap-col">{col.col}</code>
                  <span className="wmap-type">{col.type}</span>
                  <span className="wmap-sample">{col.sample}</span>
                </div>
                <div className="wmap-arrow">{mapped ? <span style={{ color: "var(--green)" }}>→</span> : <span style={{ color: "var(--line)" }}>—</span>}</div>
                <select className={"input input-select input-sm" + (mapped ? " map-select-on" : "")} value={mapped || ""} onChange={e => updateMap(col.col, e.target.value)}>
                  <option value="">ignore</option>
                  {nodeProps.map(p => <option key={p.id} value={p.id}>{p.id} ({p.type})</option>)}
                  <option value="__new__">+ New property…</option>
                </select>
                <div style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: mismatch ? "var(--gold)" : "var(--green)" }}>
                  {mapped ? (mismatch ? "cast" : "✓ match") : ""}
                </div>
              </div>
            );
          })}
        </div>
      </FormRow>
    </StepWrap>
  );
}

// ── Src Step 4: Schedule ──────────────────────────────────────────────────────

function SrcSchedule({ s, set }) {
  const CADENCE_OPTS = [
    { id: "streaming", label: "Streaming",    desc: "< 2s latency · requires CDC or stream source" },
    { id: "1min",      label: "Every minute", desc: "High-frequency — use sparingly" },
    { id: "5min",      label: "Every 5 min",  desc: "Recommended default for operational sources" },
    { id: "15min",     label: "Every 15 min", desc: "Moderate-frequency sources" },
    { id: "hourly",    label: "Hourly",       desc: "Low-frequency operational data" },
    { id: "daily",     label: "Daily (nightly batch)", desc: "For slow-changing reference data" },
  ];
  const SLO_OPTS = ["5m","15m","30m","1h","4h","24h"].map(v => ({ id: v, label: v }));
  const WINDOW_OPTS = ["off","5m","15m","30m","1h"].map(v => ({ id: v, label: v }));
  const RETRY_OPTS = [1,2,3,5,10].map(v => ({ id: v, label: String(v) }));
  const DELAY_OPTS = ["30s","1m","5m","15m","1h"].map(v => ({ id: v, label: v }));
  const BACKFILL_OPTS = ["7d","14d","30d","90d","1y","all_time"].map(v => ({ id: v, label: v }));
  const TEAM_OPTS = ["data-platform","fin-ops","cs-platform","governance","applied-ml"].map(t => ({ id: t, label: t }));

  return (
    <StepWrap eyebrow="STEP 4 · SCHEDULE & SLO" title="Freshness, cadence, and error behaviour" desc="The SLO becomes a contractual commitment visible to all downstream consumers. Set it conservatively — you can tighten later.">
      <FormRow label="Sync cadence">
        <CustomSelect value={s.cadence} onChange={v => set({ cadence: v })} options={CADENCE_OPTS} />
      </FormRow>

      <FormRow label="Freshness SLO" hint="Max acceptable data age before an alert fires and the error budget burns.">
        <Seg options={SLO_OPTS} value={s.freshnessSLO} onChange={v => set({ freshnessSLO: v })} />
      </FormRow>

      <FormRow label="Stale read window">
        <Seg options={WINDOW_OPTS} value={s.batchWindow} onChange={v => set({ batchWindow: v })} />
      </FormRow>

      <FormRow label="Retry attempts">
        <Seg options={RETRY_OPTS} value={s.retryCount} onChange={v => set({ retryCount: v })} />
      </FormRow>

      <FormRow label="Retry delay">
        <Seg options={DELAY_OPTS} value={s.retryDelay} onChange={v => set({ retryDelay: v })} />
      </FormRow>

      <FormRow label="On error">
        <RadioList options={ERROR_POLICIES} value={s.onError} onChange={v => set({ onError: v })} />
      </FormRow>

      <FormRow label="Alert channel">
        <input className="winput winput-mono" placeholder="#schema-alerts" value={s.alertChannel} onChange={e => set({ alertChannel: e.target.value })} />
      </FormRow>

      <FormRow label="Owner team">
        <CustomSelect value={s.owner} onChange={v => set({ owner: v })} options={TEAM_OPTS} />
      </FormRow>

      <FormRow label="Backfill window" hint={s.backfill ? "~8,200 rows · ~1.4 min runtime in staging" : "Disabled — only new data will be synced."} last>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CustomSelect value={s.backfillWindow} onChange={v => set({ backfillWindow: v })} options={BACKFILL_OPTS} />
          <label className="switch"><input type="checkbox" checked={s.backfill} onChange={e => set({ backfill: e.target.checked })} /><span className="switch-track" /></label>
        </div>
      </FormRow>
    </StepWrap>
  );
}

// ── Src Step 5: Review ────────────────────────────────────────────────────────

function SrcReview({ s, set, node, sel, srcCols, mappedCount, onClose }) {
  const yaml = `name: ${node?.id || "node"}_from_${s.system || "source"}
source:
  connector: ${s.system || "?"}
  object: ${s.table || "(custom query)"}
  load_strategy: ${s.loadStrategy}${s.loadStrategy === "incremental" ? "\n  watermark_column: " + s.incrementalCol : ""}
  primary_key: ${s.pkCol || "id"}
target:
  node_type: ${node?.label?.replace(/\s/g,"") || "Node"}
  join_on: ${s.joinCol || "id"}
mapping:
${Object.entries(s.mapping).filter(([,v])=>v).map(([k,v]) => `  ${k}: ${v}`).join("\n") || "  # (no mappings defined)"}
  unmapped_columns: ${s.unmappedPolicy}
schedule:
  cadence: ${s.cadence}
  freshness_slo: ${s.freshnessSLO}
  retry: { count: ${s.retryCount}, delay: ${s.retryDelay} }
  on_error: ${s.onError}
  alert_channel: ${s.alertChannel}
${s.backfill ? `backfill:\n  window: ${s.backfillWindow}` : "# backfill: disabled"}
owner: ${s.owner}`;

  return (
    <StepWrap eyebrow="STEP 5 · REVIEW & PUBLISH" title="Review pipeline configuration" desc="Once published this pipeline appears in the Sources tab and begins syncing on the configured schedule.">
      <div className="review-grid">
        <section className="card review-summary">
          <div className="card-head">Summary</div>
          <ul className="rev-list">
            {[
              ["Source",    sel?.name || s.customName],
              ["Object",    <code>{s.table || "(query)"}</code>],
              ["Strategy",  s.loadStrategy + (s.loadStrategy === "incremental" ? " · " + s.incrementalCol : "")],
              ["Columns",   mappedCount + " mapped · " + (srcCols.length - mappedCount) + " ignored"],
              ["Cadence",   s.cadence],
              ["SLO",       s.freshnessSLO],
              ["On error",  s.onError],
              ["Backfill",  s.backfill ? "on · " + s.backfillWindow : "off"],
              ["Owner",     s.owner],
            ].map(([k, v], i) => <li key={i}><span className="rev-k">{k}</span><span className="rev-v">{v}</span></li>)}
          </ul>
        </section>

        <section className="card review-target">
          <div className="card-head">Target stage</div>
          <div className="card-body" style={{ padding: "14px 18px" }}>
            <Seg options={["draft","staging","live"]} value={s.stage} onChange={v => set({ stage: v })} />
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)", fontFamily: "JetBrains Mono" }}>
              {s.stage === "draft" ? "Config stored — pipeline not started." :
               s.stage === "staging" ? "Runs against staging graph + staging source." :
               "Production source + production graph."}
            </div>
          </div>
        </section>

        <section className="card review-cypher" style={{ gridColumn: "1/-1" }}>
          <div className="card-head card-head-row">
            <div>Pipeline config <span className="card-head-sub">YAML</span></div>
            <div className="card-head-actions"><button className="btn-ghost">Copy</button></div>
          </div>
          <pre className="cypher-block">{yaml}</pre>
        </section>
      </div>
    </StepWrap>
  );
}

// ── Src Preview ───────────────────────────────────────────────────────────────

function SrcPreview({ s, sel, node, srcCols, nodeProps, mappedCount }) {
  const nc = node ? (window.colorForNode?.(node) || { fill: "var(--blue-fill)", stroke: "var(--blue)" }) : { fill: "var(--chip)", stroke: "var(--line)" };
  return (
    <div className="preview-stack">
      <div className="preview-block">
        <div className="preview-head">Pipeline diagram</div>
        <svg viewBox="0 0 280 120" style={{ width: "100%", height: 120, display: "block", background: "var(--bg-canvas)" }}>
          {sel ? (
            <g>
              <rect x="8" y="40" width="86" height="40" rx="6" fill={sel.color + "15"} stroke={sel.color} strokeWidth="1.2" />
              <text x="51" y="57" textAnchor="middle" fontFamily="Geist, system-ui" fontSize="11" fill="var(--ink)" fontWeight="600">{sel.icon} {sel.name.split(" ")[0]}</text>
              <text x="51" y="72" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ink-3)">{s.table || "—"}</text>
            </g>
          ) : (
            <rect x="8" y="40" width="86" height="40" rx="6" fill="var(--chip)" stroke="var(--line)" strokeWidth="1.2" strokeDasharray="4 3" />
          )}
          <path d="M 94 60 L 112 60" stroke="var(--ink-3)" strokeWidth="1.2" markerEnd="url(#sp-arr)" />
          <rect x="112" y="47" width="56" height="26" rx="5" fill="var(--panel-2)" stroke="var(--line)" strokeWidth="1" />
          <text x="140" y="61" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ink-2)">{mappedCount} col · {s.cadence}</text>
          <path d="M 168 60 L 186 60" stroke="var(--ink-3)" strokeWidth="1.2" markerEnd="url(#sp-arr)" />
          <circle cx="212" cy="60" r="24" fill={nc.fill} stroke={nc.stroke} strokeWidth="1.4" />
          <text x="212" y="64" textAnchor="middle" fontFamily="Geist, system-ui" fontSize="10" fill="var(--ink)" fontWeight="500">{node?.label?.slice(0,7) || "?"}</text>
          {s.freshnessSLO && <g transform="translate(140,96)"><rect x="-22" y="-9" width="44" height="16" rx="4" fill="var(--green-fill)" stroke="var(--green)" strokeWidth="0.8" /><text textAnchor="middle" y="2.5" fontFamily="JetBrains Mono" fontSize="9" fill="var(--green)">SLO {s.freshnessSLO}</text></g>}
          <defs><marker id="sp-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" /></marker></defs>
        </svg>
      </div>
      <div className="preview-block">
        <div className="preview-head">Validation</div>
        <ul className="preview-checks">
          {[
            [!!s.system, "Source system selected"],
            [!!(s.table || s.query), "Object configured"],
            [!!s.pkCol, "Primary key set"],
            [mappedCount > 0, "At least 1 column mapped"],
            [!!s.freshnessSLO, "Freshness SLO defined"],
          ].map(([ok, label], i) => (
            <li key={i} className={"check " + (ok ? "check-ok" : "check-pend")}><span className="check-dot" /> {label}</li>
          ))}
        </ul>
      </div>
      <div className="preview-block">
        <div className="preview-head">Coverage</div>
        <div className="preview-impact">
          <span className="big-n" style={{ fontSize: 32 }}>{mappedCount}</span>
          <div className="big-n-text">of {srcCols.length} columns mapped<br /><span className="big-n-sub">{srcCols.length - mappedCount} will be ignored</span></div>
        </div>
        <div style={{ padding: "0 14px 12px" }}>
          <div style={{ height: 5, background: "var(--line-2)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: (srcCols.length > 0 ? mappedCount/srcCols.length*100 : 0) + "%", background: "var(--green)", transition: "width 200ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
Object.assign(window, {
  AddPropertyFlow, LinkSourceFlow,
  // Shared primitives for edge-flow.jsx
  FormRow, StepWrap, WizardShell,
  CustomSelect, TypeSelect, SysSelect, ColSelect, PIISelect,
  RadioList, Seg, MultiToken, FlagsRow, SliderRow, EnumEditor, BackfillBanner,
  SOURCE_SYSTEMS, DATA_TYPES, PII_TIERS, MASKING_RULES, RETENTION_OPTS, ROLES, GOV_TAGS,
});
