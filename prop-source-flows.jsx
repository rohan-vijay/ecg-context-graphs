// prop-source-flows.jsx — Enterprise Property & Source wizards
// Design: one field per line · dropdowns for >3 options · no scattered grids

const { useState, useRef, useEffect, useMemo } = React;

// ─── DATA ─────────────────────────────────────────────────────────────────────

// Connector catalog. `slug` is a Simple Icons slug used to render the real brand
// logo (https://cdn.simpleicons.org/<slug>/<hex>); `icon` is the text fallback.
// `kind` splits the catalog into structured systems vs unstructured sources.
const SOURCE_SYSTEMS = [
  // ── Structured systems (databases, warehouses, apps with records) ──
  { id: "salesforce", cat: "CRM & Marketing", domain: "salesforce.com",  name: "Salesforce",            tag: "CRM",          kind: "structured",   status: "healthy",  icon: "S",   slug: "salesforce",          color: "#00A1E0", desc: "Accounts, contacts, opportunities and custom objects." },
  { id: "hubspot", cat: "CRM & Marketing", domain: "hubspot.com",     name: "HubSpot",               tag: "Marketing",    kind: "structured",   status: "degraded", icon: "H",   slug: "hubspot",             color: "#FF7A59", desc: "Contacts, deals, companies and marketing events." },
  { id: "snowflake", cat: "Data Warehouse", domain: "snowflake.com",   name: "Snowflake",             tag: "Warehouse",    kind: "structured",   status: "healthy",  icon: "❄",  slug: "snowflake",           color: "#29B5E8", desc: "Cloud data-warehouse tables and views." },
  { id: "bigquery", cat: "Data Warehouse", domain: "cloud.google.com",    name: "Google BigQuery",       tag: "Warehouse",    kind: "structured",   status: "healthy",  icon: "BQ",  slug: "googlebigquery",      color: "#669DF6", desc: "Serverless warehouse datasets and tables." },
  { id: "databricks", cat: "Data Warehouse", domain: "databricks.com",  name: "Databricks",            tag: "Lakehouse",    kind: "structured",   status: "healthy",  icon: "DB",  slug: "databricks",          color: "#FF3621", desc: "Delta tables and Unity Catalog assets." },
  { id: "redshift", cat: "Data Warehouse", domain: "aws.amazon.com",    name: "Amazon Redshift",       tag: "Warehouse",    kind: "structured",   status: "healthy",  icon: "RS",  slug: "amazonredshift",      color: "#8C4FFF", desc: "Columnar warehouse schemas and tables." },
  { id: "postgres", cat: "Databases", domain: "postgresql.org",    name: "PostgreSQL",            tag: "Database",     kind: "structured",   status: "healthy",  icon: "PG",  slug: "postgresql",          color: "#4169E1", desc: "Relational tables, views and materialised views." },
  { id: "mysql", cat: "Databases", domain: "mysql.com",       name: "MySQL",                 tag: "Database",     kind: "structured",   status: "healthy",  icon: "My",  slug: "mysql",               color: "#4479A1", desc: "Relational tables from a MySQL instance." },
  { id: "sqlserver", cat: "Databases", domain: "microsoft.com",   name: "Microsoft SQL Server",  tag: "Database",     kind: "structured",   status: "healthy",  icon: "MS",  slug: "microsoftsqlserver",  color: "#CC2927", desc: "Tables, views and stored procedures." },
  { id: "oracle", cat: "Databases", domain: "oracle.com",      name: "Oracle Database",       tag: "Database",     kind: "structured",   status: "healthy",  icon: "Or",  slug: "oracle",              color: "#F80000", desc: "Enterprise relational schemas." },
  { id: "mongodb", cat: "Databases", domain: "mongodb.com",     name: "MongoDB",               tag: "NoSQL",        kind: "structured",   status: "healthy",  icon: "Mo",  slug: "mongodb",             color: "#47A248", desc: "Document collections and embedded records." },
  { id: "netsuite", cat: "ERP & Finance", domain: "netsuite.com",    name: "NetSuite ERP",          tag: "ERP",          kind: "structured",   status: "healthy",  icon: "N",   slug: "",                    color: "#1F7A3D", desc: "Invoices, agreements and financial records." },
  { id: "sap", cat: "ERP & Finance", domain: "sap.com",         name: "SAP",                   tag: "ERP",          kind: "structured",   status: "healthy",  icon: "SAP", slug: "sap",                 color: "#0FAAFF", desc: "ERP modules, materials and finance documents." },
  { id: "stripe", cat: "ERP & Finance", domain: "stripe.com",      name: "Stripe",                tag: "Billing",      kind: "structured",   status: "healthy",  icon: "$",   slug: "stripe",              color: "#635BFF", desc: "Customers, subscriptions, invoices and payouts." },
  { id: "shopify", cat: "ERP & Finance", domain: "shopify.com",     name: "Shopify",               tag: "Commerce",     kind: "structured",   status: "healthy",  icon: "Sh",  slug: "shopify",             color: "#7AB55C", desc: "Orders, products, customers and inventory." },
  { id: "airtable", cat: "Databases", domain: "airtable.com",    name: "Airtable",              tag: "Database",     kind: "structured",   status: "healthy",  icon: "At",  slug: "airtable",            color: "#18BFFF", desc: "Bases, tables and linked records." },
  { id: "googlesheets", cat: "Files & Storage", domain: "google.com",name: "Google Sheets",         tag: "Spreadsheet",  kind: "structured",   status: "healthy",  icon: "GS",  slug: "googlesheets",        color: "#34A853", desc: "Spreadsheet rows as structured records." },
  { id: "segment", cat: "Identity & Events", domain: "segment.com",     name: "Segment",               tag: "CDP",          kind: "structured",   status: "healthy",  icon: "Sg",  slug: "segment",             color: "#52BD94", desc: "Event streams and identity profiles." },
  { id: "okta", cat: "Identity & Events", domain: "okta.com",        name: "Okta",                  tag: "Identity",     kind: "structured",   status: "healthy",  icon: "O",   slug: "okta",                color: "#007DC1", desc: "Users, groups and identity mappings." },
  { id: "kafka", cat: "Identity & Events", domain: "apache.org",       name: "Apache Kafka",          tag: "Streaming",    kind: "structured",   status: "healthy",  icon: "K",   slug: "apachekafka",         color: "#231F20", desc: "Event topics consumed as a stream." },
  { id: "jira", cat: "Project & Support", domain: "atlassian.com",        name: "Jira",                  tag: "Issues",       kind: "structured",   status: "healthy",  icon: "Jr",  slug: "jira",                color: "#0052CC", desc: "Issues, sprints and project tracking." },
  { id: "zendesk", cat: "Project & Support", domain: "zendesk.com",     name: "Zendesk",               tag: "Support",      kind: "structured",   status: "healthy",  icon: "Z",   slug: "zendesk",             color: "#03363D", desc: "Tickets, macros and help-center articles." },
  { id: "asana", cat: "Project & Support", domain: "asana.com",       name: "Asana",                 tag: "Tasks",        kind: "structured",   status: "healthy",  icon: "As",  slug: "asana",               color: "#F06A6A", desc: "Projects, tasks and portfolios." },
  { id: "linear", cat: "Project & Support", domain: "linear.app",      name: "Linear",                tag: "Issues",       kind: "structured",   status: "healthy",  icon: "Ln",  slug: "linear",              color: "#5E6AD2", desc: "Issues, cycles and project updates." },
  // ── Unstructured sources (docs, files, messages, wikis) ──
  { id: "googledrive", cat: "Files & Storage", domain: "google.com", name: "Google Drive",          tag: "Files",        kind: "unstructured", status: "healthy",  icon: "GD",  slug: "googledrive",         color: "#1FA463", desc: "Docs, Sheets, Slides and stored files." },
  { id: "slack", cat: "Messaging & Email", domain: "slack.com",       name: "Slack",                 tag: "Messaging",    kind: "unstructured", status: "healthy",  icon: "Sl",  slug: "slack",               color: "#4A154B", desc: "Channels, threads and message history." },
  { id: "confluence", cat: "Docs & Wikis", domain: "atlassian.com",  name: "Confluence",            tag: "Wiki",         kind: "unstructured", status: "healthy",  icon: "Cf",  slug: "confluence",          color: "#172B4D", desc: "Spaces, pages and knowledge bases." },
  { id: "notion", cat: "Docs & Wikis", domain: "notion.so",      name: "Notion",                tag: "Wiki",         kind: "unstructured", status: "healthy",  icon: "No",  slug: "notion",              color: "#000000", desc: "Pages, wikis and databases." },
  { id: "sharepoint", cat: "Files & Storage", domain: "microsoft.com",  name: "SharePoint",            tag: "Files",        kind: "unstructured", status: "healthy",  icon: "SP",  slug: "microsoftsharepoint", color: "#0078D4", desc: "Document libraries and team sites." },
  { id: "onedrive", cat: "Files & Storage", domain: "microsoft.com",    name: "OneDrive",              tag: "Files",        kind: "unstructured", status: "healthy",  icon: "OD",  slug: "microsoftonedrive",   color: "#0078D4", desc: "Personal and shared cloud files." },
  { id: "dropbox", cat: "Files & Storage", domain: "dropbox.com",     name: "Dropbox",               tag: "Files",        kind: "unstructured", status: "healthy",  icon: "Dx",  slug: "dropbox",             color: "#0061FF", desc: "Synced files, folders and content." },
  { id: "box", cat: "Files & Storage", domain: "box.com",         name: "Box",                   tag: "Files",        kind: "unstructured", status: "healthy",  icon: "Bx",  slug: "box",                 color: "#0061D5", desc: "Enterprise content and shared files." },
  { id: "s3", cat: "Files & Storage", domain: "aws.amazon.com",          name: "Amazon S3",             tag: "Object store", kind: "unstructured", status: "healthy",  icon: "S3",  slug: "amazons3",            color: "#569A31", desc: "Objects and files in S3 buckets." },
  { id: "gcs", cat: "Files & Storage", domain: "cloud.google.com",         name: "Google Cloud Storage",  tag: "Object store", kind: "unstructured", status: "healthy",  icon: "GCS", slug: "googlecloud",         color: "#4285F4", desc: "Objects and files in GCS buckets." },
  { id: "gmail", cat: "Messaging & Email", domain: "google.com",       name: "Gmail",                 tag: "Email",        kind: "unstructured", status: "healthy",  icon: "GM",  slug: "gmail",               color: "#EA4335", desc: "Email threads, messages and attachments." },
  { id: "outlook", cat: "Messaging & Email", domain: "outlook.com",     name: "Outlook",               tag: "Email",        kind: "unstructured", status: "healthy",  icon: "Ol",  slug: "microsoftoutlook",    color: "#0078D4", desc: "Mailboxes, threads and calendar items." },
  { id: "github", cat: "Dev & Code", domain: "github.com",      name: "GitHub",                tag: "Code",         kind: "unstructured", status: "healthy",  icon: "GH",  slug: "github",              color: "#181717", desc: "Repos, pull requests, issues and READMEs." },
  { id: "gitlab", cat: "Dev & Code", domain: "gitlab.com",      name: "GitLab",                tag: "Code",         kind: "unstructured", status: "healthy",  icon: "GL",  slug: "gitlab",              color: "#FC6D26", desc: "Repositories, merge requests and CI." },
  { id: "intercom", cat: "Project & Support", domain: "intercom.com",    name: "Intercom",              tag: "Support",      kind: "unstructured", status: "healthy",  icon: "Ic",  slug: "intercom",            color: "#1F8DED", desc: "Conversations and help articles." },
  { id: "figma", cat: "Design", domain: "figma.com",       name: "Figma",                 tag: "Design",       kind: "unstructured", status: "healthy",  icon: "Fg",  slug: "figma",               color: "#F24E1E", desc: "Design files, frames and comments." },
  { id: "zoom", cat: "Messaging & Email", domain: "zoom.us",        name: "Zoom",                  tag: "Meetings",     kind: "unstructured", status: "healthy",  icon: "Zm",  slug: "zoom",                color: "#0B5CFF", desc: "Recordings and meeting transcripts." },
  { id: "custom", cat: "Custom",      name: "Custom connector",      tag: "Custom",       kind: "structured",   status: null,       icon: "+",   slug: "",                    color: "#A09E88", desc: "Bring your own REST, JDBC, gRPC or file source." },
];

// Connector category dropdown options for the picker (step 1).
const SRC_CATEGORIES = ["CRM & Marketing", "ERP & Finance", "Data Warehouse", "Databases", "Files & Storage", "Docs & Wikis", "Messaging & Email", "Dev & Code", "Project & Support", "Identity & Events", "Design"];

// Existing connections per source system (step 2). Falls back to a single default.
const CONNECTIONS_BY_SYS = {
  snowflake:  [
    { id: "sf-prod", name: "Production warehouse",  detail: "acme.us-east-1 · ANALYTICS_WH", auth: "Key-pair",        status: "healthy", lastUsed: "2h ago" },
    { id: "sf-stg",  name: "Staging warehouse",     detail: "acme.us-east-1 · STAGING_WH",   auth: "Key-pair",        status: "healthy", lastUsed: "3d ago" },
  ],
  salesforce: [
    { id: "sfdc-prod", name: "Production org",       detail: "acme.my.salesforce.com",                  auth: "OAuth2", status: "healthy", lastUsed: "1h ago" },
    { id: "sfdc-sbx",  name: "Sandbox",              detail: "acme--dev.sandbox.my.salesforce.com",     auth: "OAuth2", status: "degraded", lastUsed: "5d ago" },
  ],
  postgres:   [
    { id: "pg-rep",   name: "Primary read-replica",  detail: "db.acme.internal:5432 · prod",  auth: "Password",  status: "healthy", lastUsed: "12m ago" },
  ],
  hubspot:    [
    { id: "hs-mkt",   name: "Marketing hub",         detail: "portal 4821990",                auth: "OAuth2",    status: "degraded", lastUsed: "6h ago" },
  ],
};
function getConnections(sysId, sel) {
  if (CONNECTIONS_BY_SYS[sysId]) return CONNECTIONS_BY_SYS[sysId];
  if (!sel) return [];
  return [{ id: sysId + "-default", name: "Default connection", detail: sel.name + " · workspace", auth: "OAuth2", status: "healthy", lastUsed: "recently" }];
}

// Discoverable objects per source system (step 3). Falls back to generic tables.
const OBJECTS_BY_SYS = {
  salesforce: [
    { name: "Account",     type: "Object", rows: "2.8K", cols: 42 },
    { name: "Contact",     type: "Object", rows: "18K",  cols: 38 },
    { name: "Opportunity", type: "Object", rows: "6.2K", cols: 51 },
    { name: "Lead",        type: "Object", rows: "24K",  cols: 33 },
    { name: "Case",        type: "Object", rows: "142K", cols: 29 },
    { name: "Campaign",    type: "Object", rows: "320",  cols: 22 },
    { name: "Task",        type: "Object", rows: "410K", cols: 18 },
    { name: "User",        type: "Object", rows: "1.2K", cols: 44 },
    { name: "Product2",    type: "Object", rows: "180",  cols: 26 },
    { name: "Quote",       type: "Object", rows: "3.1K", cols: 35 },
  ],
  snowflake: [
    { name: "ANALYTICS.ACCOUNTS",         type: "Table", rows: "2.8K", cols: 18 },
    { name: "ANALYTICS.SUBSCRIPTIONS",    type: "Table", rows: "2.8K", cols: 11 },
    { name: "ANALYTICS.INVOICES",         type: "Table", rows: "12K",  cols: 13 },
    { name: "ANALYTICS.USAGE_EVENTS",     type: "Table", rows: "25M",  cols: 9  },
    { name: "ANALYTICS.ACCOUNT_HEALTH_V", type: "View",  rows: "2.8K", cols: 7  },
    { name: "RAW.SFDC_ACCOUNT",           type: "Table", rows: "2.8K", cols: 42 },
  ],
  postgres: [
    { name: "public.accounts",      type: "Table", rows: "2.8K", cols: 18 },
    { name: "public.users",         type: "Table", rows: "1.2K", cols: 14 },
    { name: "public.orders",        type: "Table", rows: "12K",  cols: 16 },
    { name: "public.order_items",   type: "Table", rows: "48K",  cols: 9  },
    { name: "billing.invoices",     type: "Table", rows: "12K",  cols: 13 },
  ],
  stripe: [
    { name: "customers",      type: "Object", rows: "2.8K", cols: 24 },
    { name: "subscriptions",  type: "Object", rows: "2.8K", cols: 31 },
    { name: "invoices",       type: "Object", rows: "12K",  cols: 28 },
    { name: "charges",        type: "Object", rows: "96K",  cols: 22 },
  ],
};
function getSourceObjects(sysId, sel) {
  if (OBJECTS_BY_SYS[sysId]) return OBJECTS_BY_SYS[sysId];
  return [
    { name: "accounts", type: "Table", rows: "2.8K", cols: 18 },
    { name: "contacts", type: "Table", rows: "18K",  cols: 14 },
    { name: "orders",   type: "Table", rows: "12K",  cols: 13 },
    { name: "events",   type: "Table", rows: "124K", cols: 9  },
    { name: "users",    type: "Table", rows: "1.2K", cols: 12 },
  ];
}

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

function WizardShell({ eyebrow, titleFrom, titleTo, titleLabel, titleType, stage, steps, step, setStep, onClose, rightPane, children, canNext, onNext, onPublish, hideKeymap, hideFootHelp, hideStage, overlay }) {
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
            {!hideStage && <span className="flow-stage-pill">target · <b>{stage}</b></span>}
            <button className="flow-close" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
        <div className="flow-body" style={!rightPane ? { gridTemplateColumns: "240px minmax(0, 1fr)" } : undefined}>
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
            {!hideKeymap && (
              <div className="flow-steps-foot">
                <div className="flow-keymap">
                  <span className="kbd">⌘↵</span><span>Publish</span>
                  <span className="kbd">⌘S</span><span>Draft</span>
                </div>
              </div>
            )}
          </aside>
          <main className="flow-main">{children}</main>
          {rightPane && <aside className="flow-preview">{rightPane}</aside>}
        </div>
        <div className="flow-foot">
          <div className="flow-foot-left">
            <button className="btn-ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</button>
            {!hideFootHelp && <span className="flow-foot-help">Step {step + 1} of {steps.length} · <b>{steps[step].label}</b></span>}
          </div>
          <div className="flow-foot-right">
            <button className="btn-ghost">Save draft</button>
            {step < steps.length - 1
              ? <button className="btn-dark" onClick={onNext} disabled={!canNext}>Continue →</button>
              : <button className="btn-dark" onClick={onPublish}>{hideStage ? "Publish ↵" : "Publish to " + stage + " ↵"}</button>
            }
          </div>
        </div>
        {overlay}
      </div>
    </div>
  );
}

// Step wrapper
function StepWrap({ eyebrow, title, desc, children, wide }) {
  return (
    <div className={"wstep" + (wide ? " wstep-wide" : "")}>
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
  { label: "Connection",    hint: "Pick or add a connection"   },
  { label: "Object",        hint: "Choose what to read"        },
  { label: "Column mapping",hint: "Map source → node props"    },
  { label: "Schedule & SLO",hint: "Load, cadence, freshness"   },
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
  const [mapOpenCol, setMapOpenCol] = useState("");
  const [s, setS] = useState({
    system: "", customName: "", connection: "", newConnName: "", newConnHost: "", newConnAuth: "OAuth2",
    table: "", query: "", inputMode: "table",
    pkCol: "", joinCol: "", incrementalCol: "updated_at",
    loadStrategy: "incremental", mapping: {}, transforms: {}, unmappedPolicy: "ignore",
    cadence: "5min", freshnessSLO: "30m", batchWindow: "15m",
    retryCount: 3, retryDelay: "5m", onError: "alert",
    alertChannel: "#schema-alerts", owner: "data-platform",
    stage: "staging", backfill: true, backfillWindow: "30d", tags: [],
  });

  const set = patch => setS(v => ({ ...v, ...patch }));
  const sel = SOURCE_SYSTEMS.find(x => x.id === s.system);
  const srcCols = s.system ? getSourceCols(s.system) : [];
  const rawNodeProps = node ? (window.generateProps ? window.generateProps(node) : (window.PROPS_BY_NODE?.[node.id] || [])) : [];
  const nodeProps = rawNodeProps.map(p => ({ id: p.name, label: p.name, type: p.type }));
  const mappedCount = Object.values(s.mapping).filter(Boolean).length;
  const canNext = step === 0 ? !!s.system : step === 1 ? !!s.connection : step === 2 ? !!(s.table || s.query) : true;

  // Sidebar hints reflect the live selections, not static copy.
  const conns = sel ? getConnections(sel.id, sel) : [];
  const connLabel = s.connection === "__new__" ? "New connection" : (conns.find(c => c.id === s.connection)?.name || "Pick or add a connection");
  const srcSteps = [
    { label: "Source system",  hint: sel ? sel.name : "Pick connector from catalog" },
    { label: "Connection",     hint: connLabel },
    { label: "Object",         hint: s.table || (s.query ? "Custom SQL" : "Choose what to read") },
    { label: "Column mapping", hint: mappedCount ? `${mappedCount} columns mapped` : "Map source → node props" },
    { label: "Schedule & SLO", hint: `${(LOAD_STRATEGIES.find(l => l.id === s.loadStrategy) || {}).label || "Load"} · ${s.cadence}` },
    { label: "Review",         hint: "Config & publish" },
  ];

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
      stage={s.stage} hideStage hideKeymap hideFootHelp
      steps={srcSteps} step={step} setStep={setStep}
      canNext={canNext}
      onNext={() => setStep(x => x + 1)}
      onPublish={onClose}
      onClose={onClose}
      rightPane={null}
      overlay={mapOpenCol ? (function(){
        const c = srcCols.find(x => x.col === mapOpenCol);
        return <SrcTransformDrawer col={mapOpenCol} type={c ? c.type : "string"} sel={sel} list={(s.transforms || {})[mapOpenCol] || []} onChange={arr => set({ transforms: Object.assign({}, s.transforms, (function(){ var o = {}; o[mapOpenCol] = arr; return o; })()) })} onClose={() => setMapOpenCol("")} />;
      })() : null}
    >
      {step === 0 && <SrcSystem s={s} set={set} />}
      {step === 1 && <SrcConnection s={s} set={set} sel={sel} />}
      {step === 2 && <SrcObject s={s} set={set} sel={sel} srcCols={srcCols} />}
      {step === 3 && <SrcMapping s={s} set={set} srcCols={srcCols} nodeProps={nodeProps} node={node} sel={sel} openCol={mapOpenCol} setOpenCol={setMapOpenCol} />}
      {step === 4 && <SrcSchedule s={s} set={set} srcCols={srcCols} />}
      {step === 5 && <SrcReview s={s} set={set} node={node} sel={sel} srcCols={srcCols} mappedCount={mappedCount} onClose={onClose} />}
    </WizardShell>
  );
}

// ── Src Step 1: System ────────────────────────────────────────────────────────

// Logo with a graceful fallback chain: Simple Icons brand mark → the brand's
// favicon (covers logos removed from Simple Icons, e.g. Salesforce, Slack,
// Microsoft & AWS products) → a coloured text glyph.
function SrcConnectorLogo({ c, size }) {
  size = size || 22;
  const box = size + 12;
  const simple = c.slug ? "https://cdn.simpleicons.org/" + c.slug + "/" + c.color.replace("#", "") : "";
  const favicon = c.domain ? "https://www.google.com/s2/favicons?sz=64&domain=" + c.domain : "";
  const [src, setSrc] = useState(simple || favicon);
  const [failed, setFailed] = useState(!simple && !favicon);
  const onErr = () => {
    if (src === simple && favicon) setSrc(favicon);
    else setFailed(true);
  };
  return (
    <span style={{ width: box, height: box, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff", border: "1px solid var(--line)", overflow: "hidden" }}>
      {!failed && src
        ? <img src={src} width={size} height={size} alt="" style={{ display: "block", objectFit: "contain" }} onError={onErr} />
        : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: c.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: size > 20 ? 12 : 10 }}>{c.icon}</span>}
    </span>
  );
}

function SrcSystem({ s, set }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const catOptions = [{ id: "all", label: "All categories" }].concat(SRC_CATEGORIES.map(c => ({ id: c, label: c })));
  const list = SOURCE_SYSTEMS.filter(c => c.id !== "custom").filter(c => {
    if (cat !== "all" && c.cat !== cat) return false;
    if (q && (c.name + " " + (c.desc || "")).toLowerCase().indexOf(q.toLowerCase()) < 0) return false;
    return true;
  });
  return (
    <StepWrap wide eyebrow="STEP 1 · SOURCE SYSTEM" title="Pick a source connector" desc="Search the catalog or filter by category, then choose the system that owns this data.">
      {/* search + category dropdown */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)", display: "flex" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          </span>
          <input className="winput" style={{ paddingLeft: 36 }} placeholder="Search connectors…" value={q} onChange={e => setQ(e.target.value)} autoFocus />
        </div>
        <div style={{ width: 230, flexShrink: 0 }}>
          <CustomSelect value={cat} onChange={setCat} options={catOptions} />
        </div>
      </div>

      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.5px", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 8 }}>{list.length} connectors</div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 11, overflow: "hidden", background: "var(--panel)" }}>
        {list.map((c, i) => {
          const on = s.system === c.id;
          return (
            <button key={c.id} onClick={() => set({ system: c.id })}
              style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", padding: "12px 14px", border: "none", borderTop: i ? "1px solid var(--line-2)" : "none", background: on ? "var(--bg-canvas)" : "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--panel-2)"; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
              <SrcConnectorLogo c={c} size={22} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{c.name}</span>
                  {c.status === "degraded" && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--gold)" }}>● degraded</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.desc}</div>
              </div>
              {on
                ? <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "var(--ink)", color: "var(--bg-canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>✓</span>
                : <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: "var(--ink-3)", padding: "5px 12px", borderRadius: 7, border: "1px solid var(--line)" }}>Select</span>}
            </button>
          );
        })}
        {list.length === 0 && <div style={{ padding: "32px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>No connectors match “{q}”.</div>}
      </div>
    </StepWrap>
  );
}

// ── Src Step 2: Connection ────────────────────────────────────────────────────

function SrcConnStatusDot({ status }) {
  const col = status === "healthy" ? "var(--green)" : status === "degraded" ? "var(--gold)" : "var(--ink-3)";
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: col, flexShrink: 0 }} />;
}

function SrcConnection({ s, set, sel }) {
  const conns = sel ? getConnections(sel.id, sel) : [];
  const addingNew = s.connection === "__new__";
  const hostLabel = sel?.id === "salesforce" ? "Instance URL"
    : sel?.cat === "Data Warehouse" || sel?.cat === "Databases" ? "Host / account"
    : sel?.cat === "Files & Storage" ? "Bucket / site"
    : "Endpoint";
  return (
    <StepWrap wide eyebrow="STEP 2 · CONNECTION" title={sel ? `Connect to ${sel.name}` : "Pick a connection"} desc="Pick one of your existing connections, or add a new one. A connection stores the host and credentials for this source.">
      {conns.length > 0 && (
        <>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.5px", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 8 }}>Your connections</div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 11, overflow: "hidden", background: "var(--panel)" }}>
            {conns.map((cn, i) => {
              const on = s.connection === cn.id;
              return (
                <button key={cn.id} onClick={() => set({ connection: cn.id })}
                  style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", padding: "13px 14px", border: "none", borderTop: i ? "1px solid var(--line-2)" : "none", background: on ? "var(--bg-canvas)" : "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--panel-2)"; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  {sel && <SrcConnectorLogo c={sel} size={20} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <SrcConnStatusDot status={cn.status} />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{cn.name}</span>
                      {cn.status === "degraded" && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--gold)" }}>degraded</span>}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--ink-3)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cn.detail}</div>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "var(--ink-4)", flexShrink: 0, textAlign: "right" }}>{cn.auth}<br />used {cn.lastUsed}</span>
                  {on
                    ? <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "var(--ink)", color: "var(--bg-canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>✓</span>
                    : <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: "var(--ink-3)", padding: "5px 12px", borderRadius: 7, border: "1px solid var(--line)" }}>Use</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      <button onClick={() => set({ connection: "__new__" })}
        style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "13px 14px", borderRadius: 10, border: "1px solid " + (addingNew ? "var(--ink)" : "var(--line)"), borderStyle: addingNew ? "solid" : "dashed", background: addingNew ? "var(--bg-canvas)" : "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "var(--ink)", boxShadow: addingNew ? "0 0 0 2px color-mix(in oklab, var(--ink) 12%, transparent)" : "none" }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--chip)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "var(--ink-2)", flexShrink: 0 }}>+</span>
        <span style={{ fontWeight: 600 }}>Add a new connection</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)" }}>{sel ? "to " + sel.name : ""}</span>
      </button>

      {addingNew && (
        <div style={{ marginTop: 14, padding: "16px", border: "1px solid var(--line)", borderRadius: 11, background: "var(--panel)", display: "grid", gap: 12 }}>
          <FormRow label="Connection name" required>
            <input className="winput" placeholder={sel ? sel.name + " — production" : "My connection"} value={s.newConnName} onChange={e => set({ newConnName: e.target.value })} autoFocus />
          </FormRow>
          <FormRow label={hostLabel} required>
            <input className="winput winput-mono" placeholder={sel?.id === "salesforce" ? "acme.my.salesforce.com" : sel?.cat === "Files & Storage" ? "s3://acme-bucket" : "host.acme.internal"} value={s.newConnHost} onChange={e => set({ newConnHost: e.target.value })} />
          </FormRow>
          <FormRow label="Authentication" last>
            <CustomSelect value={s.newConnAuth} onChange={v => set({ newConnAuth: v })} options={["OAuth2", "API key", "Key-pair", "Username / password", "Service account"].map(t => ({ id: t, label: t }))} />
          </FormRow>
          <div style={{ fontSize: 11.5, color: "var(--ink-4)", lineHeight: 1.5 }}>You'll be redirected to authorize. Credentials are stored encrypted and reused across pipelines.</div>
        </div>
      )}
    </StepWrap>
  );
}

// ── Src Step 3: Object ────────────────────────────────────────────────────────

function SrcObject({ s, set, sel, srcCols }) {
  const [q, setQ] = useState("");
  const objects = sel ? getSourceObjects(sel.id, sel) : [];
  const list = objects.filter(o => !q || o.name.toLowerCase().indexOf(q.toLowerCase()) >= 0);
  return (
    <StepWrap wide eyebrow="STEP 3 · OBJECT" title="Select the object to read" desc={`Search the objects available on ${sel ? sel.name : "the source"} and pick the one to fetch data from.`}>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)", display: "flex" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
        </span>
        <input className="winput" style={{ paddingLeft: 40, height: 44 }} placeholder="Search objects…" value={q} onChange={e => setQ(e.target.value)} autoFocus />
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.5px", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 8 }}>{list.length} objects</div>
      <div style={{ border: "1px solid var(--line)", borderRadius: 11, overflow: "hidden", background: "var(--panel)" }}>
        {list.map((o, i) => {
          const on = s.table === o.name;
          return (
            <button key={o.name} onClick={() => set({ table: o.name, query: "" })}
              style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "14px 16px", border: "none", borderTop: i ? "1px solid var(--line-2)" : "none", background: on ? "var(--bg-canvas)" : "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--panel-2)"; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
              {sel ? <SrcConnectorLogo c={sel} size={20} /> : <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--chip)", border: "1px solid var(--line)", flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{o.name}</code>
                <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 3 }}>{o.type} · {o.cols} columns</div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "var(--ink-3)", flexShrink: 0 }}>{o.rows} rows</span>
              {on
                ? <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "var(--ink)", color: "var(--bg-canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✓</span>
                : <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: "var(--ink-3)", padding: "6px 14px", borderRadius: 7, border: "1px solid var(--line)" }}>Select</span>}
            </button>
          );
        })}
        {list.length === 0 && <div style={{ padding: "32px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>No objects match “{q}”.</div>}
      </div>
    </StepWrap>
  );
}

// ── Src Step 4: Column Mapping ────────────────────────────────────────────────

// Transformation functions available per mapped field (matches the connector catalog).
const TRANSFORM_FUNCTIONS = [
  { id: "cast",       label: "Cast",                glyph: "⇲" },
  { id: "extract",    label: "Extract Text",        glyph: "</>" },
  { id: "flatten",    label: "Flatten JSON",        glyph: "{}" },
  { id: "hash",       label: "Hash",                glyph: "#" },
  { id: "mask",       label: "Mask",                glyph: "•••" },
  { id: "replace",    label: "Replace Value",       glyph: "⇄" },
  { id: "lower",      label: "To Lowercase",        glyph: "a" },
  { id: "upper",      label: "To Uppercase",        glyph: "A" },
  { id: "b64enc",     label: "Base64 Encode",       glyph: "64" },
  { id: "b64dec",     label: "Base64 Decode",       glyph: "64" },
  { id: "aes_enc",    label: "AES Encryption",      glyph: "🔒" },
  { id: "aes_dec",    label: "AES Decryption",      glyph: "🔓" },
  { id: "duplicate",  label: "Duplicate Field",     glyph: "⧉" },
  { id: "dl_s3",      label: "Download from S3",    glyph: "↓" },
  { id: "ul_s3",      label: "Upload to S3",        glyph: "↑" },
];
function tfLabel(id){ return (TRANSFORM_FUNCTIONS.find(f => f.id === id) || {}).label || ""; }

const MAP_TYPE_GLYPH = {
  string: { g: "T", c: "var(--blue)" }, "string[]": { g: "[T]", c: "var(--blue)" },
  int: { g: "#", c: "var(--gold)" }, float: { g: ".5", c: "var(--gold)" }, decimal: { g: "#", c: "var(--gold)" },
  bool: { g: "01", c: "var(--coral)" }, timestamp: { g: "TS", c: "var(--green)" }, date: { g: "DT", c: "var(--green)" },
  datetime: { g: "DT", c: "var(--green)" }, uuid: { g: "ID", c: "var(--purple)" }, json: { g: "{}", c: "var(--ink-3)" },
  enum: { g: "E", c: "var(--purple)" }, fk: { g: "FK", c: "var(--purple)" },
};
function MapTypeGlyph({ type, size }) {
  const m = MAP_TYPE_GLYPH[type] || { g: "T", c: "var(--ink-3)" };
  size = size || 26;
  return <span style={{ width: size, height: size, borderRadius: 6, border: "1px solid var(--line)", background: "var(--bg-canvas)", color: m.c, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>{m.g}</span>;
}
function MapBadge({ children, tone }) {
  return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.4px", padding: "1px 5px", borderRadius: 4, color: tone || "var(--ink-3)", border: "1px solid var(--line)", background: "var(--bg-canvas)" }}>{children}</span>;
}

// Per-field transformation chain editor — a focused right-side drawer.
// Add one or many functions, applied top to bottom, before the value is written.
function SrcTransformDrawer({ col, type, sel, list, onChange, onClose }) {
  const add = () => onChange(list.concat([{ fn: "" }]));
  const setFn = (i, fn) => onChange(list.map((t, j) => j === i ? { ...t, fn } : t));
  const remove = i => onChange(list.filter((_, j) => j !== i));
  const fnGlyph = id => (TRANSFORM_FUNCTIONS.find(f => f.id === id) || {}).glyph;
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 60, display: "flex", justifyContent: "flex-end", animation: "flow-fade-in 140ms ease-out" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 440, maxWidth: "80%", height: "100%", background: "var(--panel)", borderLeft: "1px solid var(--line)", boxShadow: "-24px 0 60px rgba(0,0,0,0.22)", display: "flex", flexDirection: "column" }}>
        {/* header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--line-2)", display: "flex", alignItems: "flex-start", gap: 12, flexShrink: 0 }}>
          <span style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-canvas)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)", flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 7h11M4 7l3-3M4 7l3 3M20 17H9M20 17l-3-3M20 17l-3 3" /></svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 21, color: "var(--ink)", lineHeight: 1.1 }}>Transformations</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--ink-3)", marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
              <MapTypeGlyph type={type} size={18} /> <code>{col}</code> {sel ? "· " + sel.name : ""}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid var(--line)", background: "none", cursor: "pointer", color: "var(--ink-3)", flexShrink: 0, fontSize: 13 }}>✕</button>
        </div>
        {/* body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.55, marginBottom: 16 }}>Functions run top to bottom on the source value before it's written to the destination field. Drag-free reorder by removing and re-adding.</div>
          {list.length === 0 && (
            <div style={{ border: "1px dashed var(--line)", borderRadius: 10, padding: "26px 18px", textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600 }}>No transformations</div>
              <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 4 }}>The raw value is written as-is. Add one to start a chain.</div>
            </div>
          )}
          {list.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--ink)", color: "var(--bg-canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                {i < list.length - 1 && <span style={{ width: 1, height: 14, background: "var(--line)", marginTop: 2 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <CustomSelect value={t.fn} onChange={v => setFn(i, v)} placeholder="Select a function"
                  options={TRANSFORM_FUNCTIONS.map(f => ({ id: f.id, label: f.label }))}
                  renderTrigger={o => <span style={{ display: "flex", alignItems: "center", gap: 9 }}><span style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--line)", background: "var(--bg-canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--ink-2)" }}>{fnGlyph(o.id)}</span>{o.label}</span>}
                  renderOption={o => <span style={{ display: "flex", alignItems: "center", gap: 9 }}><span style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--line)", background: "var(--bg-canvas)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--ink-2)" }}>{fnGlyph(o.id)}</span>{o.label}</span>} />
              </div>
              <button onClick={() => remove(i)} title="Remove" style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid var(--line)", background: "var(--bg-canvas)", cursor: "pointer", color: "var(--ink-3)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>
              </button>
            </div>
          ))}
          <button onClick={add} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", border: "1px dashed var(--line)", borderRadius: 9, background: "var(--bg-canvas)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "var(--ink-2)", marginTop: 2, width: "100%", justifyContent: "center" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "var(--ink-3)" }}>+</span> Add transformation
          </button>
        </div>
        {/* footer */}
        <div style={{ flexShrink: 0, padding: "14px 20px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--panel-2)" }}>
          <button onClick={() => onChange([])} disabled={!list.length} className="btn-ghost" style={{ opacity: list.length ? 1 : 0.4 }}>Clear all</button>
          <button onClick={onClose} className="btn-dark">Done</button>
        </div>
      </div>
    </div>
  );
}

function SrcMapping({ s, set, srcCols, nodeProps, node, sel, openCol, setOpenCol }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const transforms = s.transforms || {};
  const updateMap = (col, propId) => set({ mapping: { ...s.mapping, [col]: propId } });
  const setTransforms = (col, arr) => set({ transforms: { ...transforms, [col]: arr } });
  const mappedCount = Object.values(s.mapping).filter(Boolean).length;
  const rows = srcCols.filter(c => !q || c.col.toLowerCase().indexOf(q.toLowerCase()) >= 0);
  const GRID = "minmax(180px,1.3fr) minmax(190px,1.2fr) 34px minmax(190px,1.3fr)";

  return (
    <StepWrap wide eyebrow="STEP 4 · COLUMN MAPPING" title={`Map ${sel ? sel.name : "source"} fields to ${node?.label || "the node"}`} desc="Map each source field to a destination property and chain transformations in between. Unmapped fields are ignored.">
      {/* toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 3, padding: 3, borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg-canvas)" }}>
          {[["all", "All fields"], ["mapped", "Mapped"], ["unmapped", "Unmapped"]].map(t => {
            const on = tab === t[0];
            return <button key={t[0]} onClick={() => setTab(t[0])} style={{ padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: on ? 600 : 500, background: on ? "var(--ink)" : "transparent", color: on ? "var(--bg-canvas)" : "var(--ink-2)" }}>{t[1]}</button>;
          })}
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "var(--ink-3)" }}>{mappedCount} / {srcCols.length} mapped</span>
        <div style={{ position: "relative", marginLeft: "auto", width: 240 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)", display: "flex" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          </span>
          <input className="winput" style={{ paddingLeft: 34 }} placeholder="Search fields…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      {/* table */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 11, background: "var(--panel)" }}>
        <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, padding: "10px 16px", background: "var(--panel-2)", borderBottom: "1px solid var(--line)", borderRadius: "11px 11px 0 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--ink-3)" }}>
          <div>Source fields</div><div>Transformations</div><div></div><div>Destination fields</div>
        </div>
        {rows.filter(col => tab === "all" || (tab === "mapped" ? !!s.mapping[col.col] : !s.mapping[col.col])).map((col, i) => {
          const mapped = s.mapping[col.col];
          const tlist = transforms[col.col] || [];
          const isOpen = openCol === col.col;
          const isPK = col.col === s.pkCol;
          return (
            <div key={col.col} style={{ borderTop: i ? "1px solid var(--line-2)" : "none" }}>
              <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, padding: "12px 16px", alignItems: "center" }}>
                {/* source */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <MapTypeGlyph type={col.type} />
                  <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.col}</code>
                  {isPK && <MapBadge tone="var(--green)">PK</MapBadge>}
                </div>
                {/* transformations */}
                <button onClick={() => setOpenCol(col.col)}
                  style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid " + (isOpen ? "var(--ink)" : tlist.length ? "var(--line)" : "transparent"), borderStyle: tlist.length || isOpen ? "solid" : "dashed", background: isOpen ? "var(--bg-canvas)" : "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left", minHeight: 34 }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--panel-2)"; if (!tlist.length && !isOpen) e.currentTarget.style.borderColor = "var(--line)"; }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; if (!tlist.length && !isOpen) e.currentTarget.style.borderColor = "transparent"; }}>
                  {tlist.length === 0
                    ? <span style={{ fontSize: 12, color: "var(--ink-4)" }}>+ Add transformation</span>
                    : tlist.map((t, j) => <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, padding: "2px 7px", borderRadius: 5, background: "var(--chip)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>{t.fn ? tfLabel(t.fn) : "function…"}</span>)}
                  <span style={{ marginLeft: "auto", color: "var(--ink-3)", flexShrink: 0, display: "flex" }} title="Edit transformations">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                  </span>
                </button>
                {/* arrow */}
                <div style={{ textAlign: "center", color: mapped ? "var(--green)" : "var(--ink-4)", fontSize: 15 }}>→</div>
                {/* destination */}
                <CustomSelect value={mapped || ""} onChange={v => updateMap(col.col, v)} placeholder="Select field"
                  options={nodeProps.map(p => ({ id: p.id, label: p.id, type: p.type })).concat([{ id: "__new__", label: "+ New property…" }])}
                  renderTrigger={o => o.id && o.id !== "__new__" ? <span style={{ display: "flex", alignItems: "center", gap: 9 }}><MapTypeGlyph type={o.type} size={22} /><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "var(--ink)" }}>{o.label}</span>{o.id === "id" && <><MapBadge tone="var(--green)">PK</MapBadge><MapBadge>UK</MapBadge></>}</span> : <span style={{ color: o.id === "__new__" ? "var(--ink-2)" : "var(--ink-4)" }}>{o.label || "Select field"}</span>}
                  renderOption={o => o.id && o.id !== "__new__" ? <span style={{ display: "flex", alignItems: "center", gap: 9 }}><MapTypeGlyph type={o.type} size={20} />{o.label}</span> : <span style={{ color: o.id === "__new__" ? "var(--ink-2)" : "var(--ink-3)" }}>{o.label}</span>} />
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <div style={{ padding: "32px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>No fields match “{q}”.</div>}
      </div>
    </StepWrap>
  );
}

// ── Src Step 4: Schedule ──────────────────────────────────────────────────────

function SrcSchedule({ s, set, srcCols }) {
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
    <StepWrap wide eyebrow="STEP 5 · SCHEDULE & SLO" title="Load, cadence, freshness, and error behaviour" desc="How data is loaded and kept fresh. The SLO becomes a contractual commitment visible to all downstream consumers — set it conservatively.">
      <FormRow label="Load strategy">
        <RadioList options={LOAD_STRATEGIES} value={s.loadStrategy} onChange={v => set({ loadStrategy: v })} />
      </FormRow>

      {s.loadStrategy === "incremental" && (
        <FormRow label="Watermark column" hint="Must be an indexed timestamp the source updates on every row change.">
          <ColSelect cols={(srcCols || []).filter(c => c.type === "timestamp" || c.col.includes("at") || c.col.includes("date"))} value={s.incrementalCol} onChange={v => set({ incrementalCol: v })} />
        </FormRow>
      )}

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
    <StepWrap wide eyebrow="STEP 6 · REVIEW & PUBLISH" title="Review pipeline configuration" desc="Once published this pipeline appears in the Sources tab and begins syncing on the configured schedule.">
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
