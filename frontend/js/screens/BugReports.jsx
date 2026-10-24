/* Extension screen: Bug Reports (sidebar badge 2, not drawn in the Figma). */
function BugReports({ theme }) {
  return (
    <Screen theme={theme} active="Bug Reports" crumbs={["Production - v2.4.1", "Bug Reports"]} loader={() => API.getBugs()}>
      {(data) => <BugsBody theme={theme} initial={data} />}
    </Screen>
  );
}

function BugsBody({ theme, initial }) {
  const act = useAction();
  const [bugs, setBugs] = useState(initial);
  const [status, setStatus] = useState("All");
  const [view, setView] = useState("table");
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: "", severity: "High", test: "" });
  const bodyRef = useRef(null);

  useEffect(() => { if (bodyRef.current) window.Anim.staggerIn(bodyRef.current.children); }, [status, view]);

  const shown = bugs.filter(b => status === "All" || b.status === status);
  const open = bugs.find(b => b.id === openId);
  const update = (id, patch) => setBugs(l => l.map(b => b.id === id ? { ...b, ...patch } : b));
  const sevOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  const submit = (e) => {
    if (!draft.title.trim()) return;
    act(() => API.createBug(draft), e).then(() => {
      const id = `BUG-${319 + bugs.length - 5}`;
      setBugs(l => [{ id, title: draft.title, severity: draft.severity, status: "Open", test: draft.test || "—", jira: null, assignee: null, created: "Just now", project: "Student Management Portal", env: "Staging", steps: [], expected: "", actual: "" }, ...l]);
      setCreating(false);
      setDraft({ title: "", severity: "High", test: "" });
    });
  };

  const BugCard = ({ b }) => (
    <div className="card a-up" style={{ padding: 12, cursor: "pointer", background: "var(--surface)" }} onClick={() => setOpenId(b.id)}>
      <div className="row-between"><span className="mono xs" style={{ color: "var(--link)" }}>{b.id}</span><StatusPill status={b.severity} /></div>
      <div style={{ fontWeight: 500, marginTop: 8, lineHeight: "18px" }}>{b.title}</div>
      <div className="row-between xs muted" style={{ marginTop: 10 }}>
        <span>{b.project}</span>
        {b.assignee ? <Avatar initials={b.assignee} color={PEOPLE[b.assignee]} /> : <span>Unassigned</span>}
      </div>
    </div>
  );

  return (
    <>
      <PageHead
        title="Bug Reports"
        badge={<Pill tone="bad">{bugs.filter(b => b.status !== "Resolved").length} unresolved</Pill>}
        sub="Real defects confirmed by AI triage, with reproduction steps and evidence captured from the failing run."
        actions={<>
          <div className="seg">
            <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}><Icon n="table" s={12} style={{ verticalAlign: -2 }} /> Table</button>
            <button className={view === "board" ? "active" : ""} onClick={() => setView("board")}><Icon n="columns-3" s={12} style={{ verticalAlign: -2 }} /> Board</button>
          </div>
          <button className="btn btn-primary" onClick={() => setCreating(true)}><Icon n="plus" s={14} /> New bug</button>
        </>}
      />

      <div className="grid-4">
        <Kpi label="Open" value={bugs.filter(b => b.status === "Open").length} icon="circle-dot" tone="bad" sub="Awaiting triage" />
        <Kpi label="In progress" value={bugs.filter(b => b.status === "In Progress").length} icon="loader" sub="Assigned to engineering" />
        <Kpi label="Resolved (7d)" value={bugs.filter(b => b.status === "Resolved").length} icon="circle-check" tone="ok" sub="Verified by re-run" />
        <Kpi label="Linked to Jira" value={bugs.filter(b => b.jira).length} icon="ticket" sub={`${bugs.filter(b => !b.jira).length} not synced`} />
      </div>

      {view === "table" ? (
        <section className="card a-up" style={{ overflow: "hidden" }}>
          <div className="row-between" style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
            <div className="tabs">
              {["All", "Open", "In Progress", "Resolved"].map(s => <button key={s} className={`tab ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>{s}</button>)}
            </div>
            <span className="xs muted">Sorted by severity</span>
          </div>
          <table className="table">
            <thead><tr><th>ID</th><th>Title</th><th>Severity</th><th>Status</th><th>Source test</th><th>Jira</th><th>Assignee</th><th>Created</th></tr></thead>
            <tbody ref={bodyRef}>
              {[...shown].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]).map(b => (
                <tr key={b.id} className="row-hover" style={{ cursor: "pointer" }} onClick={() => setOpenId(b.id)}>
                  <td className="mono small" style={{ color: "var(--link)" }}>{b.id}</td>
                  <td style={{ fontWeight: 500 }}>{b.title}<div className="xs muted">{b.project}</div></td>
                  <td><StatusPill status={b.severity} /></td>
                  <td><StatusPill status={b.status} /></td>
                  <td className="mono small">{b.test}</td>
                  <td>{b.jira ? <span className="mono small row" style={{ gap: 4, color: "var(--link)" }}><Icon n="ticket" s={12} />{b.jira}</span> : <span className="xs faint">—</span>}</td>
                  <td>{b.assignee ? <Avatar initials={b.assignee} color={PEOPLE[b.assignee]} /> : <span className="xs faint">Unassigned</span>}</td>
                  <td className="small muted">{b.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <div className="grid-3" ref={bodyRef}>
          {["Open", "In Progress", "Resolved"].map(col => (
            <section key={col} className="card a-up" style={{ padding: 10, background: "var(--surface-2)" }}>
              <div className="row-between" style={{ padding: "4px 4px 10px" }}><b>{col}</b><Pill tone="muted">{bugs.filter(b => b.status === col).length}</Pill></div>
              <div className="col" style={{ gap: 8 }}>{bugs.filter(b => b.status === col).map(b => <BugCard key={b.id} b={b} />)}</div>
            </section>
          ))}
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpenId(null)} title={open ? `${open.id} · ${open.title}` : ""} width={720}
        footer={open && <>
          {open.status !== "Resolved" && <button className="btn" onClick={() => update(open.id, { status: open.status === "Open" ? "In Progress" : "Resolved" })}>
            Move to {open.status === "Open" ? "In Progress" : "Resolved"}</button>}
          <button className="btn btn-primary" disabled={!!open.jira} onClick={(e) => act(() => API.pushBugToJira(open.id), e).then(() => update(open.id, { jira: "QA-1183" }))}>
            <Icon n="ticket" s={14} /> {open.jira ? `Linked ${open.jira}` : "Create in Jira"}</button>
        </>}>
        {open && (
          <div className="modal-body col" style={{ gap: 16 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <StatusPill status={open.severity} /><StatusPill status={open.status} />
              <Pill tone="muted">{open.project}</Pill><Pill tone="info">Source {open.test}</Pill>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="inset" style={{ padding: 12 }}><div className="xs upper muted">Expected</div><div className="small" style={{ marginTop: 4 }}>{open.expected || "—"}</div></div>
              <div className="inset" style={{ padding: 12, borderLeft: "3px solid var(--bad)" }}><div className="xs upper muted">Actual</div><div className="small" style={{ marginTop: 4 }}>{open.actual || "—"}</div></div>
            </div>
            <div>
              <div className="xs upper muted" style={{ marginBottom: 6 }}>Steps to reproduce</div>
              <ol className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: "22px" }}>{open.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="inset" style={{ height: 130, display: "grid", placeItems: "center", color: "var(--text-3)" }}>
                <span className="col" style={{ alignItems: "center", gap: 6 }}><Icon n="image" s={22} /><span className="xs">Failure screenshot</span></span>
              </div>
              <div className="col small" style={{ gap: 8 }}>
                <div className="row-between"><span className="muted">Environment</span><span>{open.env}</span></div>
                <div className="row-between"><span className="muted">Created</span><span>{open.created}</span></div>
                <div className="row-between"><span className="muted">Assignee</span><span>{open.assignee || "Unassigned"}</span></div>
                <div className="row-between"><span className="muted">Evidence</span><span className="row" style={{ gap: 8 }}><span className="link">video</span><span className="link">trace</span><span className="link">HAR</span></span></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={creating} onClose={() => setCreating(false)} title="New bug report" width={520}
        footer={<><button className="btn" onClick={() => setCreating(false)}>Cancel</button><button className="btn btn-primary" disabled={!draft.title.trim()} onClick={submit}>Create bug</button></>}>
        <div className="modal-body col" style={{ gap: 14 }}>
          <label className="field"><span>Title</span><div className="input"><input autoFocus value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="What went wrong?" /></div></label>
          <label className="field"><span>Source test (optional)</span><div className="input"><input className="mono" value={draft.test} onChange={e => setDraft({ ...draft, test: e.target.value })} placeholder="TC-000" /></div></label>
          <div className="field"><span>Severity</span>
            <div className="seg" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
              {["Critical", "High", "Medium", "Low"].map(s => <button key={s} className={draft.severity === s ? "active" : ""} onClick={() => setDraft({ ...draft, severity: s })} style={{ fontSize: 12, padding: 6 }}>{s}</button>)}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
window.BugReports = BugReports;
