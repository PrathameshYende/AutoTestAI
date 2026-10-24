/* Shared UI: icons, shells (dark / light), hooks, small primitives. */
const { useState, useEffect, useLayoutEffect, useRef, useCallback, createContext, useContext } = React;

/* ---------- Icon (Lucide icon data rendered as React SVG) ---------- */
function toPascal(name) {
  return name.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
}
function Icon({ n, s = 16, sw = 1.75, className = "", style }) {
  const lib = window.lucide && window.lucide.icons;
  let node = lib && lib[toPascal(n)];
  if (!node) return <span style={{ width: s, height: s, display: "inline-block" }} />;
  // lucide UMD ships either ["svg", attrs, children] or just children
  const children = node[0] === "svg" ? node[2] : node;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" className={className} style={{ flexShrink: 0, ...style }} aria-hidden="true">
      {children.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

/* ---------- Router ---------- */
function useHashRoute() {
  const get = () => (window.location.hash || "#/dark/dashboard").slice(1);
  const [route, setRoute] = useState(get);
  useEffect(() => {
    const on = () => setRoute(get());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
const go = (path) => { window.location.hash = path; };

/* ---------- Data + animation hooks ---------- */
function useApi(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    let alive = true;
    setState(s => ({ ...s, loading: true }));
    loader()
      .then(data => alive && setState({ data, loading: false, error: null }))
      .catch(error => alive && setState({ data: null, loading: false, error }));
    return () => { alive = false; };
  }, deps);
  return state;
}

// Runs the GSAP page intro once data is on screen.
function usePageAnim(ready) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ready || !ref.current) return;
    return window.Anim.pageIntro(ref.current);
  }, [ready]);
  return ref;
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext(() => {});
function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2);
    setItems(list => [...list, { id, msg }]);
    setTimeout(() => setItems(list => list.filter(t => t.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {items.map(t => <ToastItem key={t.id} msg={t.msg} />)}
      </div>
    </ToastCtx.Provider>
  );
}
function ToastItem({ msg }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    window.gsap.from(ref.current, { x: 40, autoAlpha: 0, duration: 0.4, ease: "power3.out" });
  }, []);
  return <div ref={ref} className="toast">{msg}</div>;
}
const useToast = () => useContext(ToastCtx);

// Calls an API action, shows the result as a toast, animates the button.
function useAction() {
  const toast = useToast();
  return (fn, e) => {
    if (e && e.currentTarget) window.Anim.press(e.currentTarget);
    return fn().then(r => toast(r.message || "Done")).catch(err => toast("Request failed: " + err.message));
  };
}

/* ---------- Primitives ---------- */
function Counter({ value, decimals = 0, suffix = "", className = "" }) {
  return (
    // key: GSAP writes textContent directly, so remount when the value changes
    <span key={value} className={className} data-count={value} data-decimals={decimals} data-suffix={suffix}>
      {Number(value).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}
function Badge({ tone = "gray", children, className = "", style }) {
  return <span className={`badge b-${tone} ${className}`} style={style}>{children}</span>;
}
function Progress({ value, color, height, className = "", style }) {
  return (
    <div className={`progress ${className}`} style={{ height, ...style }}>
      <i className="a-fill" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}
function Check({ on, onClick, label = "Select" }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} aria-label={label} className={`check ${on ? "on" : ""}`} onClick={onClick}>
      {on && <Icon n="check" s={11} sw={3} />}
    </button>
  );
}
function Skeleton({ h = 120 }) {
  return <div className="skeleton" style={{ height: h }} />;
}
function PageLoading() {
  return (
    <div className="page-inner">
      <Skeleton h={140} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <Skeleton h={80} /><Skeleton h={80} /><Skeleton h={80} /><Skeleton h={80} />
      </div>
      <Skeleton h={320} />
    </div>
  );
}
function ErrorBox({ error }) {
  return <div className="card card-pad">Could not load data: {error && error.message}</div>;
}

/* ---------- Brand marks ---------- */
function DarkLogo() {
  return (
    <div className="sb-logo">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" stroke="#c0c1ff" strokeWidth="1.6" />
        <path d="M8.5 15.5L12 7l3.5 8.5M9.8 12.6h4.4" stroke="#c0c1ff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
function InitialsAvatar({ name, className = "avatar", bg = "linear-gradient(135deg,#8083ff,#d0bcff)" }) {
  const initials = name.split(" ").map(p => p[0]).join("").slice(0, 2);
  return (
    <div className={className} style={{ background: bg, display: "grid", placeItems: "center", color: "#1000a9", fontWeight: 600, fontSize: 12 }}>
      {initials}
    </div>
  );
}

/* ---------- Shell helpers ---------- */
// Small popover menu used by the topbar overflow buttons.
function AuthButtons() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      height: "36px",
      flexShrink: 0
    }}>
      <button
        type="button"
        className="btn"
        style={{ height: "36px", margin: 0, whiteSpace: "nowrap" }}
        onClick={() => go("/login")}
      >
        Login
      </button>

      <button
        type="button"
        className="btn btn-primary"
        style={{ height: "36px", margin: 0, whiteSpace: "nowrap" }}
        onClick={() => go("/register")}
      >
        Register
      </button>
    </div>
  );
}
function ShellMenu({ theme, icon, label }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const t = theme === "light" ? "light" : "dark";
  const items = [
    ["settings", "Settings", () => go(`/${t}/settings`)],
    ["book-open", "Help & shortcuts", () => go(`/${t}/help`)],
    ["chart-line", "Analytics", () => go(`/${t}/analytics`)],
    ["log-out", "Sign out", () => { API.logout(); go("/login"); }]
  ];
  return (
    <div ref={wrap} style={{ position: "relative" }}>
      <button className="icon-btn" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Icon n={icon} s={16} />
      </button>
      {open && (
        <div className="popover" role="menu" style={{ width: 200, padding: 6 }}>
          {items.map(([ic, text, fn]) => (
            <button key={text} role="menuitem" className="palette-item" style={{ width: "100%", background: "transparent", border: 0, color: "inherit", borderRadius: 4, padding: "8px 10px" }}
              onClick={() => { setOpen(false); fn(); }}>
              <Icon n={ic} s={14} /> {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Below 1024px the sidebar becomes an off-canvas drawer.
function useDrawer() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return [open, setOpen];
}
function MenuToggle({ onClick }) {
  return <button className="icon-btn tb-menu" aria-label="Open navigation" onClick={onClick}><Icon n="menu" s={18} /></button>;
}

/* ---------- Dark shell (sidebar + topbar) ---------- */
const DARK_NAV = [
  { label: "Dashboard", icon: "layout-grid", to: "/dark/dashboard" },
  { label: "Projects", icon: "folder", to: "/dark/projects" },
  { label: "Recordings", icon: "video", to: "/dark/upload" },
  { label: "Workflows", icon: "git-fork", to: "/dark/workflow" },
  { label: "Test Cases", icon: "check-square", to: "/dark/test-cases" },
  { label: "Automation Scripts", icon: "code-2", to: "/dark/scripts" },
  { label: "Test Runs", icon: "play-circle", to: "/dark/runs" },
  { label: "Failures", icon: "alert-triangle", count: 4, countTone: "red", to: "/dark/failures" },
  { label: "Bug Reports", icon: "bug", count: 2, countTone: "gray", to: "/dark/bugs" },
  { label: "Self-Healing", icon: "zap", count: "AI", countTone: "ai", to: "/dark/self-healing" },
  { label: "Analytics", icon: "bar-chart-2", to: "/dark/analytics" }
];

function NavLink({ item, active }) {
  const onClick = (e) => { e.preventDefault(); go(item.to); };
  return (
    <a href={`#${item.to}`} className={`sb-link ${active ? "active" : ""}`} onClick={onClick} aria-current={active ? "page" : undefined}>
      <Icon n={item.icon} s={15} />
      <span>{item.label}</span>
      {item.count !== undefined && <span className={`sb-count ${item.countTone}`}>{item.count}</span>}
    </a>
  );
}

function DarkShell({ active, children }) {
  const ref = useRef(null);
  const [drawer, setDrawer] = useDrawer();
  useLayoutEffect(() => window.Anim.shellIntro(ref.current), []);
  return (
    <div className="app t-dark" ref={ref}>
      {drawer && <div className="nav-scrim" onClick={() => setDrawer(false)} />}
      <aside className={`sidebar ${drawer ? "open" : ""}`} aria-label="Main navigation">
        <div>
          <div className="sb-brand">
            <div className="sb-brand-left"><DarkLogo /><span className="sb-name">AutoTestAI</span></div>
            <span className="sb-ver">PRO V2.4</span>
          </div>
          <button className="sb-new" onClick={() => go("/dark/upload")}>
            <span className="row" style={{ gap: 6 }}><Icon n="plus" s={14} sw={2.2} /> New Test</span>
            <kbd>⌘N</kbd>
          </button>
          <nav className="sb-nav">
            {DARK_NAV.map(item => <NavLink key={item.label} item={item} active={item.label === active} />)}
          </nav>
        </div>
        <div>
          <div className="sb-bottom">
            <NavLink item={{ label: "Settings", icon: "settings", to: "/dark/settings" }} active={active === "Settings"} />
            <NavLink item={{ label: "Help & Documentation", icon: "book-open", to: "/dark/help" }} active={active === "Help & Documentation"} />
          </div>
          <div className="sb-user">
            <div className="sb-user-left">
              <InitialsAvatar name="Priya Sharma" />
              <div className="col">
                <span className="sb-user-name">Priya Sharma</span>
                <span className="sb-user-role">Lead QA Architect</span>
              </div>
            </div>
            <button className="icon-btn" aria-label="Sign out" title="Sign out" onClick={() => { API.logout(); go("/login"); }}><Icon n="log-out" s={14} /></button>
          </div>
        </div>
      </aside>
      <div className="main-col">
        <header className="topbar">
          <div className="tb-left">
            <MenuToggle onClick={() => setDrawer(true)} />
            <button className="tb-project" onClick={() => go("/dark/projects")} aria-label="Switch project: Student Management Portal / main">
              <Icon n="terminal-square" s={13} /> <span className="tb-project-label">Student Management Portal / main</span> <Icon n="chevron-down" s={12} />
            </button>
            <SearchTrigger theme="dark" placeholder="Search test suites, assertions..." />
          </div>
          <div className="tb-right">
            <span className="tb-engine"><span className="dot live" style={{ color: "#e9ddff" }} /> AI Engine Online • 99.4% precision</span>
            <span className="tb-env">Production Staging</span>
            <NotificationsButton theme="dark" />
            <ShellMenu theme="dark" icon="server" label="Workspace menu" />
            <AuthButtons />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

/* ---------- Light shell ---------- */
const LIGHT_NAV = [
  { label: "Dashboard", icon: "layout-grid", to: "/light/dashboard" },
  { label: "Projects", icon: "folder-open", to: "/light/projects" },
  { label: "Recordings", icon: "video", to: "/light/create" },
  { label: "Workflows", icon: "workflow", to: "/light/workflow" },
  { label: "Test Cases", icon: "list-checks", to: "/light/test-cases" },
  { label: "Automation Scripts", icon: "terminal-square", to: "/light/scripts" },
  { label: "Test Runs", icon: "play-circle", to: "/light/runner" },
  { label: "Failures", icon: "alert-triangle", to: "/light/failure" },
  { label: "Bug Reports", icon: "bug", to: "/light/bugs" },
  { label: "Self-Healing", icon: "life-buoy", to: "/light/self-healing" },
  { label: "Analytics", icon: "activity", to: "/light/analytics" }
];

function LightShell({ active, crumbs = ["Production - v2.4.1", "Suite Diagnostics"], children }) {
  const ref = useRef(null);
  const [drawer, setDrawer] = useDrawer();
  useLayoutEffect(() => window.Anim.shellIntro(ref.current), []);
  return (
    <div className="app t-light" ref={ref}>
      {drawer && <div className="nav-scrim" onClick={() => setDrawer(false)} />}
      <aside className={`sidebar ${drawer ? "open" : ""}`} aria-label="Main navigation">
        <div className="col" style={{ gap: 8 }}>
          <div className="sb-brand">
            <div className="sb-brand-left">
              <img src="assets/logo-light.png" alt="AutoTestAI logo" width="32" height="32" style={{ borderRadius: 6 }} />
              <span className="sb-name" style={{ color: "#0b1c30" }}>AutoTestAI</span>
            </div>
            <span className="sb-ver">v2.4</span>
          </div>
          <nav className="sb-nav" style={{ padding: 0 }}>
            {LIGHT_NAV.map(item => <NavLink key={item.label} item={item} active={item.label === active} />)}
          </nav>
        </div>
        <div className="sb-bottom" style={{ padding: "5px 0 0" }}>
          <NavLink item={{ label: "Settings", icon: "settings", to: "/light/settings" }} active={active === "Settings"} />
          <NavLink item={{ label: "Documentation & Help", icon: "help-circle", to: "/light/help" }} active={active === "Documentation & Help"} />
          <div className="sb-user">
            <div className="sb-user-left">
              <div className="avatar"><img src="assets/avatar-alex.png" alt="Alex Chen" width="32" height="32" style={{ objectFit: "cover" }} /></div>
              <div className="col" style={{ minWidth: 0 }}>
                <span className="row" style={{ gap: 6 }}>
                  <span className="sb-user-name" style={{ color: "#0b1c30" }}>Alex Chen</span>
                  <span className="small" style={{ color: "#434655" }}>(Staff QA)</span>
                </span>
                <span className="small" style={{ color: "#434655", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }}>alex@company.com</span>
              </div>
            </div>
            <span className="acme">Acme <Icon n="chevrons-up-down" s={10} /></span>
          </div>
        </div>
      </aside>
      <div className="main-col">
        <header className="topbar">
          <div className="tb-left" style={{ gap: 12 }}>
            <MenuToggle onClick={() => setDrawer(true)} />
            <button className="tb-project" onClick={() => go("/light/projects")} aria-label="Switch project: Student Management Portal">
              <Icon n="layout-panel-top" s={13} /> <span className="tb-project-label">Student Management Portal</span> <Icon n="chevron-down" s={12} />
            </button>
            <span className="tb-crumbs row" style={{ gap: 12 }}>
              <span className="crumb-sep">/</span>
              <span className="crumb-chip">{crumbs[0]}</span>
              <span className="crumb-sep">/</span>
              <span style={{ fontSize: 12, color: "#434655" }}>{crumbs[1]}</span>
            </span>
          </div>
          <div className="tb-right" style={{ gap: 16 }}>
            <SearchTrigger theme="light" placeholder="Quick search..." />
            <NotificationsButton theme="light" />
            <button className="btn btn-primary tb-new" onClick={() => go("/light/create")}><Icon n="plus" s={14} /> <span>New Test</span></button>
            <ShellMenu theme="light" icon="ellipsis-vertical" label="More options" />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

/* ---------- Status pills ---------- */
function DarkStatus({ status }) {
  const map = {
    Passed: { tone: "pass", style: { background: "rgba(77,142,255,.2)", color: "#a8c3ff" } },
    Failed: { tone: "fail", style: { background: "#93000a", color: "#ffdad6" } },
    Running: { tone: "blue", style: { background: "rgba(77,142,255,.2)", color: "#a8c3ff" } },
    Queued: { tone: "gray", style: { background: "#32353c", color: "#c7c4d7" } },
    Healed: { tone: "accent", style: { background: "#571bc1", color: "#e9ddff" } },
    Approved: { tone: "gray", style: { background: "#32353c", color: "#e1e2eb" } },
    "Needs Review": { tone: "fail", style: { background: "#93000a", color: "#ffdad6" } }
  };
  const m = map[status] || map.Queued;
  return (
    <span className="badge" style={{ ...m.style, borderRadius: 2 }}>
      <span className={`dot ${status === "Running" ? "live" : ""}`} />{status}
    </span>
  );
}

/* ---------- Generic stacked bar chart ---------- */
function StackedBars({ data, series, height = 160, max, labelKey = "id" }) {
  const top = max || Math.max(...data.map(d => series.reduce((a, s) => a + d[s.key], 0)));
  return (
    <div className="bars" style={{ height }}>
      {data.map((d, i) => {
        const total = series.reduce((a, s) => a + d[s.key], 0);
        return (
          <div className="bar-col" key={d[labelKey] + i}>
            <div className="bar-stack a-bar" style={{ height: `${(total / top) * 100}%` }}
              title={series.map(s => `${s.label}: ${d[s.key]}`).join("  ·  ")}>
              {series.map(s => <i key={s.key} style={{ flex: d[s.key], background: s.color }} />)}
            </div>
            <span className="bar-lbl">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  Icon, useHashRoute, go, useApi, usePageAnim, ToastProvider, useToast, useAction,
  Counter, Badge, Progress, Check, Skeleton, PageLoading, ErrorBox, DarkShell, LightShell, ShellMenu,
  DarkStatus, StackedBars, InitialsAvatar
});
