/* Shared kit for the extension screens. Everything here reads colors from
   theme tokens (var(--ok), var(--link)…) so one component works in the Dark
   and Light shells. */

/* Pages each theme can navigate to — used by routes, search and links. */
const PAGES = [
  { key: "dashboard", label: "Dashboard", icon: "layout-grid" },
  { key: "projects", label: "Projects", icon: "folder" },
  { key: "upload", label: "Upload Recording", icon: "video", dark: "/dark/upload", light: "/light/create" },
  { key: "workflow", label: "Workflows", icon: "git-fork" },
  { key: "test-cases", label: "Test Cases", icon: "list-checks" },
  { key: "scripts", label: "Automation Scripts", icon: "code-xml" },
  { key: "runner", label: "Live Test Runner", icon: "circle-play", dark: "/dark/runs", light: "/light/runner" },
  { key: "all-runs", label: "All Test Runs", icon: "list" },
  { key: "report", label: "Run Report #TR-1247", icon: "file-chart-column" },
  { key: "failures", label: "Failures", icon: "triangle-alert" },
  { key: "failure", label: "Failure Analysis TC-001", icon: "search-x", dark: "/dark/failures", light: "/light/failure" },
  { key: "bugs", label: "Bug Reports", icon: "bug" },
  { key: "self-healing", label: "Self-Healing", icon: "wand-sparkles" },
  { key: "analytics", label: "Analytics", icon: "chart-line" },
  { key: "settings", label: "Settings", icon: "settings" },
  { key: "help", label: "Help & Documentation", icon: "book-open" }
];
const pagePath = (theme, key) => {
  const t = theme === "light" ? "light" : "dark";
  const p = PAGES.find(x => x.key === key);
  return (p && p[t]) || `/${t}/${key}`;
};

/* Pick the right shell for the current theme. Light labels differ slightly. */
function ThemeShell({ theme, active, crumbs, children }) {
  if (theme === "light") {
    const lightActive = { "Help & Documentation": "Documentation & Help" }[active] || active;
    return <LightShell active={lightActive} crumbs={crumbs}>{children}</LightShell>;
  }
  return <DarkShell active={active}>{children}</DarkShell>;
}

/* Common page frame: loading / error / content with GSAP intro. */
function Screen({ theme, active, crumbs, loader, deps = [], children }) {
  const { data, loading, error } = useApi(loader, deps);
  const ref = usePageAnim(!!data);
  return (
    <ThemeShell theme={theme} active={active} crumbs={crumbs}>
      <main className="page" ref={ref}>
        {error ? <ErrorBox error={error} /> : !data ? <PageLoading /> : <div className="page-inner" style={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}>{children(data)}</div>}
      </main>
    </ThemeShell>
  );
}

function Pill({ tone = "muted", dot, live, children, style }) {
  return (
    <span className={`pill pill-${tone}`} style={style}>
      {dot && <span className={`dot ${live ? "live" : ""}`} />}{children}
    </span>
  );
}
const STATUS_TONE = {
  Passed: "ok", Passing: "ok", Healed: "ai", Running: "info", Queued: "muted", Failed: "solid", Failing: "bad",
  Open: "bad", "In Progress": "warn", Resolved: "ok", Pending: "warn", Rejected: "muted",
  Critical: "solid", High: "bad", Medium: "warn", Low: "muted", Healthy: "ok", Degraded: "warn",
  "UI Change": "ai", "Real Bug": "bad", Flaky: "warn", Environment: "muted"
};
function StatusPill({ status }) {
  return <Pill tone={STATUS_TONE[status] || "muted"} dot={["Running", "Open", "Pending"].includes(status)} live={status === "Running"}>{status}</Pill>;
}

function PageHead({ eyebrow, title, badge, sub, actions }) {
  return (
    <div className="row-between a-up" style={{ alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
      <div>
        {eyebrow && <div className="row xs mono muted" style={{ gap: 8, marginBottom: 8 }}>{eyebrow}</div>}
        <h1 className="page-title row" style={{ gap: 10 }}>{title}{badge}</h1>
        {sub && <p className="muted" style={{ marginTop: 6, fontSize: 14, maxWidth: 680 }}>{sub}</p>}
      </div>
      {actions && <div className="row" style={{ gap: 8 }}>{actions}</div>}
    </div>
  );
}

function Kpi({ label, value, decimals = 0, suffix = "", sub, tone, icon }) {
  return (
    <div className="card kpi a-up">
      <div className="k"><span>{label}</span>{icon && <Icon n={icon} s={14} style={{ color: tone ? `var(--${tone})` : undefined }} />}</div>
      <div className="v" style={{ color: tone === "bad" ? "var(--bad)" : undefined }}>
        {typeof value === "number" ? <Counter value={value} decimals={decimals} suffix={suffix} /> : value}
      </div>
      {sub && <div className="xs" style={{ color: tone ? `var(--${tone})` : "var(--text-2)" }}>{sub}</div>}
    </div>
  );
}

function Switch({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`switch ${on ? "on" : ""}`} onClick={() => onChange(!on)}>
      <i />
    </button>
  );
}

/* Modal with GSAP enter animation. Esc closes. */
function Modal({ open, onClose, title, width = 640, children, footer }) {
  const boxRef = useRef(null);
  useLayoutEffect(() => {
    if (!open || !boxRef.current) return;
    window.gsap.fromTo(boxRef.current, { y: 18, autoAlpha: 0, scale: 0.98 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out" });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" ref={boxRef} style={{ maxWidth: width }} role="dialog" aria-modal="true">
        {title && <div className="modal-head"><b style={{ fontSize: 15 }}>{title}</b><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon n="x" s={16} /></button></div>}
        {children}
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* Unified diff block (two-line locator change). */
function DiffBlock({ file, line = 38, before, after }) {
  return (
    <div className="l-console" style={{ borderRadius: "var(--radius)" }}>
      <div className="head xs"><span className="mono">{file}</span><span>-1 / +1</span></div>
      <div style={{ padding: "8px 0" }}>
        <div className="diff-row"><span>{line - 1}</span><span>await page.wait_for_load_state("networkidle")</span></div>
        <div className="diff-row del"><span>- {line}</span><span>- {before}</span></div>
        <div className="diff-row add"><span>+ {line}</span><span>+ {after}</span></div>
        <div className="diff-row"><span>{line + 1}</span><span>expect(page).to_have_url(re.compile("/dashboard"))</span></div>
      </div>
    </div>
  );
}

/* Small SVG charts --------------------------------------------------- */
function Sparkline({ data, w = 120, h = 32, color = "var(--link)" }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * (w - 4) + 2, h - 4 - ((v - min) / (max - min || 1)) * (h - 8)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path className="a-line" d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

function LineChart({ labels, series, height = 220, yMin, yMax, unit = "" }) {
  const W = 640, H = height, pad = { l: 40, r: 12, t: 12, b: 26 };
  const all = series.flatMap(s => s.data);
  const lo = yMin !== undefined ? yMin : Math.floor(Math.min(...all));
  const hi = yMax !== undefined ? yMax : Math.ceil(Math.max(...all));
  const x = (i) => pad.l + (i / (labels.length - 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - lo) / (hi - lo || 1)) * (H - pad.t - pad.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => lo + t * (hi - lo));
  const [hover, setHover] = useState(null);
  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible", display: "block" }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (labels.length - 1));
          setHover(Math.max(0, Math.min(labels.length - 1, i)));
        }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border-soft)" strokeDasharray={i ? "3 4" : ""} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--text-3)">{t.toFixed(t % 1 ? 1 : 0)}{unit}</text>
          </g>
        ))}
        {labels.map((l, i) => (i % 2 === 0 || i === labels.length - 1) && (
          <text key={l} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--text-3)">{l}</text>
        ))}
        {series.map(s => (
          <path key={s.name} className="a-line" fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"
            d={s.data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ")} vectorEffect="non-scaling-stroke" />
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--text-3)" strokeDasharray="2 3" />}
        {hover !== null && series.map(s => <circle key={s.name} cx={x(hover)} cy={y(s.data[hover])} r="3.5" fill={s.color} stroke="var(--surface)" strokeWidth="1.5" />)}
      </svg>
      {hover !== null && (
        <div className="card xs" style={{ position: "absolute", top: 0, left: `${(x(hover) / W) * 100}%`, transform: "translateX(-50%)", padding: "6px 8px", pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "var(--shadow)" }}>
          <b>{labels[hover]}</b>
          {series.map(s => <div key={s.name} className="row" style={{ gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.name}: {s.data[hover]}{unit}</div>)}
        </div>
      )}
    </div>
  );
}

function Donut({ parts, size = 150, stroke = 18, center }) {
  const total = parts.reduce((a, p) => a + p[1], 0);
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const segs = ref.current.querySelectorAll(".seg-arc");
    window.gsap.from(segs, { strokeDashoffset: (i, el) => parseFloat(el.getAttribute("stroke-dashoffset")) + parseFloat(el.getAttribute("data-len")), duration: 1, stagger: 0.12, ease: "power2.out", delay: 0.3 });
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
      {parts.map(([name, v, color]) => {
        const len = (v / total) * c;
        const el = (
          <circle key={name} className="seg-arc" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${Math.max(len - 2, 0)} ${c}`} strokeDashoffset={-acc} data-len={len} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <title>{name}: {v}%</title>
          </circle>
        );
        acc += len;
        return el;
      })}
      {center && <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="600" fill="var(--text)">{center}</text>}
    </svg>
  );
}

function HBar({ label, value, max = 100, color = "var(--link)", right }) {
  return (
    <div>
      <div className="row-between small" style={{ marginBottom: 5 }}><span>{label}</span><b className="mono xs">{right || value}</b></div>
      <div className="hbar" style={{ background: "var(--surface-3)" }}><i className="a-fill" style={{ width: `${(value / max) * 100}%`, background: color }} /></div>
    </div>
  );
}

function Avatar({ initials, color = "#8083ff" }) {
  return <span className="avatar-sm" style={{ background: color }}>{initials}</span>;
}
const PEOPLE = { PS: "#5457d6", AC: "#2563eb", MR: "#0f6b2f", JK: "#b45309" };

/* Notifications bell + popover --------------------------------------- */
function NotificationsButton({ theme }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const wrapRef = useRef(null);
  const popRef = useRef(null);
  useEffect(() => { API.getNotifications().then(setItems).catch(() => setItems([])); }, []);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  useLayoutEffect(() => {
    if (open && popRef.current) window.gsap.fromTo(popRef.current, { y: -8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.25, ease: "power2.out" });
  }, [open]);
  const unread = (items || []).filter(i => i.unread).length;
  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button className="icon-btn" aria-label="Notifications" onClick={() => setOpen(o => !o)}>
        <Icon n="bell" s={theme === "light" ? 17 : 16} />{unread > 0 && <span className="ping" />}
      </button>
      {open && (
        <div className="popover" ref={popRef}>
          <div className="row-between" style={{ padding: "12px 14px" }}>
            <b>Notifications {unread > 0 && <Pill tone="info">{unread} new</Pill>}</b>
            <button className="link small" onClick={() => setItems(list => list.map(i => ({ ...i, unread: false })))}>Mark all read</button>
          </div>
          {(items || []).map(n => (
            <div key={n.id} className={`notif ${n.unread ? "unread" : ""}`} onClick={() => { setOpen(false); go(pagePath(theme, n.to)); }}>
              <Icon n={n.icon} s={16} style={{ color: `var(--${n.tone === "bad" ? "bad" : n.tone === "warn" ? "warn-c" : n.tone})`, marginTop: 2 }} />
              <div className="grow">
                <div className="row-between"><b style={{ fontWeight: 500, fontSize: 13 }}>{n.title}</b><span className="xs faint">{n.time}</span></div>
                <div className="small muted" style={{ marginTop: 2 }}>{n.body}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-soft)", textAlign: "center" }}>
            <button className="link small" onClick={() => { setOpen(false); go(pagePath(theme, "settings")); }}>Notification settings</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ⌘K search: topbar trigger + command palette ------------------------ */
function SearchTrigger({ theme, placeholder }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <button type="button" className="tb-search" onClick={() => setOpen(true)} style={{ cursor: "text", textAlign: "left" }}>
        <span className="row" style={{ gap: 6 }}><Icon n="search" s={12} /><span>{placeholder}</span></span>
        <span className="kbd">⌘K</span>
      </button>
      <CommandPalette theme={theme} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const SEARCH_ENTITIES = [
  { label: "TC-001 · Login with valid credentials", icon: "list-checks", page: "test-cases", group: "Test cases" },
  { label: "TC-042 · Add Student modal saves record", icon: "list-checks", page: "test-cases", group: "Test cases" },
  { label: "TC-055 · File upload rejects >500MB", icon: "list-checks", page: "failures", group: "Test cases" },
  { label: "#TR-1248 · Full Regression Suite (running)", icon: "circle-play", page: "runner", group: "Runs" },
  { label: "#TR-1247 · Billing & Checkout (passed)", icon: "file-chart-column", page: "report", group: "Runs" },
  { label: "#TR-1246 · Student Gradebook UI (failed)", icon: "circle-alert", page: "failure", group: "Runs" },
  { label: "BUG-318 · Upload accepts files over 500MB", icon: "bug", page: "bugs", group: "Bugs" },
  { label: "WF-014 · Student Registration Flow", icon: "git-fork", page: "workflow", group: "Workflows" }
];

function CommandPalette({ theme, open, onClose }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setQ(""); setIdx(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);
  const term = q.toLowerCase();
  const results = [
    ...PAGES.filter(p => p.label.toLowerCase().includes(term)).map(p => ({ label: p.label, icon: p.icon, page: p.key, group: "Pages" })),
    ...SEARCH_ENTITIES.filter(e => term && e.label.toLowerCase().includes(term))
  ].slice(0, 12);
  const pick = (r) => { onClose(); go(pagePath(theme, r.page)); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[idx]) pick(results[idx]);
  };
  let lastGroup = null;
  return (
    <Modal open={open} onClose={onClose} width={600}>
      <div className="palette">
        <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setIdx(0); }} onKeyDown={onKey}
          placeholder="Search pages, test cases, runs, bugs…" aria-label="Search" />
        <div style={{ padding: "4px 0 10px", maxHeight: 380, overflow: "auto" }}>
          {results.length === 0 && <div className="small muted" style={{ padding: 18 }}>No results for "{q}".</div>}
          {results.map((r, i) => {
            const head = r.group !== lastGroup ? <div className="palette-group">{r.group}</div> : null;
            lastGroup = r.group;
            return (
              <React.Fragment key={r.label}>
                {head}
                <div className={`palette-item ${i === idx ? "active" : ""}`} onMouseEnter={() => setIdx(i)} onClick={() => pick(r)}>
                  <Icon n={r.icon} s={15} /> <span className="grow">{r.label}</span>{i === idx && <Icon n="corner-down-left" s={13} />}
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <div className="row xs faint" style={{ gap: 14, padding: "8px 18px", borderTop: "1px solid var(--border-soft)" }}>
          <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>
        </div>
      </div>
    </Modal>
  );
}

/* Save generated text (CSV, JSON, code) as a file in the browser. */
function downloadFile(name, text, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

Object.assign(window, {
  downloadFile, PAGES, pagePath, ThemeShell, Screen, Pill, StatusPill, STATUS_TONE, PageHead, Kpi, Switch, Modal, DiffBlock,
  Sparkline, LineChart, Donut, HBar, Avatar, PEOPLE, NotificationsButton, SearchTrigger, CommandPalette
});
