/* Extension screens: All Test Runs ("View All (1,248)") and a finished Run Report. */
function AllRuns({ theme }) {
  return (
    <Screen theme={theme} active="Test Runs" crumbs={["Production - v2.4.1", "Test Runs"]} loader={() => API.getRuns()}>
      {(data) => <AllRunsBody theme={theme} runs={data} />}
    </Screen>
  );
}

function AllRunsBody({ theme, runs }) {
  const act = useAction();
  const [status, setStatus] = useState("All");
  const [project, setProject] = useState("All projects");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const bodyRef = useRef(null);
  useEffect(() => { if (bodyRef.current) window.Anim.staggerIn(bodyRef.current.children); }, [status, project, page]);

  const projects = ["All projects", ...new Set(runs.map(r => r.project))];
  const shown = runs.filter(r =>
    (status === "All" || r.status === status) && (project === "All projects" || r.project === project) &&
    (r.id + r.suite + r.branch + r.trigger).toLowerCase().includes(q.toLowerCase()));
  const open = (r) => go(r.status === "Running" ? pagePath(theme, "runner") : r.status === "Failed" ? pagePath(theme, "failures") : pagePath(theme, "report"));

  return (
    <>
      <PageHead
        title="Test Runs"
        badge={<Pill tone="info" dot live>1 running</Pill>}
        sub="Every suite execution across projects, branches and triggers."
        actions={<>
          <button className="btn" onClick={() => go(pagePath(theme, "runner"))}><Icon n="circle-play" s={14} /> Live runner</button>
          <button className="btn btn-primary" onClick={(e) => act(() => API.runTests({ suite: "regression" }), e)}><Icon n="play" s={13} /> Run suite</button>
        </>}
      />
      <div className="grid-4">
        <Kpi label="Runs (7 days)" value={1248} icon="list" sub="+11% vs last week" tone="ok" />
        <Kpi label="Pass rate" value={94.1} decimals={1} suffix="%" icon="circle-check" />
        <Kpi label="Median duration" value="3m 54s" icon="timer" sub="-18% after predictive selection" tone="ok" />
        <Kpi label="Failed runs" value={runs.filter(r => r.status === "Failed").length} icon="circle-alert" tone="bad" sub="Need triage" />
      </div>

      <section className="card a-up" style={{ overflow: "hidden" }}>
        <div className="row-between" style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)", flexWrap: "wrap", gap: 10 }}>
          <div className="tabs">
            {["All", "Running", "Passed", "Failed", "Healed", "Queued"].map(s => <button key={s} className={`tab ${status === s ? "active" : ""}`} onClick={() => { setStatus(s); setPage(1); }}>{s}</button>)}
          </div>
          <div className="row">
            <div className="input" style={{ width: 200, height: 32 }}><select value={project} onChange={e => setProject(e.target.value)}>{projects.map(p => <option key={p}>{p}</option>)}</select></div>
            <label className="input" style={{ width: 220, height: 32 }}><Icon n="search" s={13} /><input placeholder="Run ID, branch, trigger..." value={q} onChange={e => setQ(e.target.value)} /></label>
          </div>
        </div>
        <table className="table">
          <thead><tr><th>Run</th><th>Suite</th><th>Branch / trigger</th><th>Status</th><th>Result</th><th>Duration</th><th>Env</th><th>Started</th></tr></thead>
          <tbody ref={bodyRef}>
            {shown.map(r => (
              <tr key={r.id} className="row-hover" style={{ cursor: "pointer" }} onClick={() => open(r)}>
                <td className="mono small" style={{ color: "var(--link)" }}>{r.id}</td>
                <td><b style={{ fontWeight: 500 }}>{r.suite}</b><div className="xs muted">{r.project}</div></td>
                <td><span className="mono xs row" style={{ gap: 4 }}><Icon n="git-branch" s={11} />{r.branch}</span><div className="xs muted">{r.trigger}</div></td>
                <td><StatusPill status={r.status} /></td>
                <td style={{ width: 150 }}>
                  <div className="row" style={{ gap: 2, height: 6 }}>
                    <i style={{ flex: r.passed || 0.0001, background: "var(--c-pass)", height: "100%", borderRadius: 2 }} />
                    {r.failed > 0 && <i style={{ flex: r.failed, background: "var(--c-fail)", height: "100%", borderRadius: 2 }} />}
                    {r.total - r.passed - r.failed > 0 && <i style={{ flex: r.total - r.passed - r.failed, background: "var(--c-skip)", height: "100%", borderRadius: 2 }} />}
                  </div>
                  <div className="xs mono muted" style={{ marginTop: 3 }}>{r.passed}/{r.total}{r.failed ? ` · ${r.failed} failed` : ""}</div>
                </td>
                <td className="mono small">{r.duration}</td>
                <td><Pill tone="muted">{r.env}</Pill></td>
                <td className="small muted">{r.started}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row-between xs muted" style={{ padding: "10px 14px" }}>
          <span>Showing {shown.length} of 1,248 runs</span>
          <span className="row">
            <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span className="mono">Page {page} of 156</span>
            <button className="btn btn-sm" onClick={() => setPage(p => p + 1)}>Next</button>
          </span>
        </div>
      </section>
    </>
  );
}

function RunReport({ theme }) {
  return (
    <Screen theme={theme} active="Test Runs" crumbs={["Production - v2.4.1", "Run Report"]} loader={() => API.getRunReport("1247")}>
      {(d) => <RunReportBody theme={theme} d={d} />}
    </Screen>
  );
}

function RunReportBody({ theme, d }) {
  const act = useAction();
  const toast = useToast();
  const t = d.totals;
  const passPct = ((t.passed + t.healed) / t.total * 100).toFixed(1);
  return (
    <>
      <div className="row xs a-up" style={{ gap: 6, color: "var(--text-2)" }}>
        <button className="link xs" onClick={() => go(pagePath(theme, "all-runs"))}>Test Runs</button><Icon n="chevron-right" s={11} /><span className="mono">{d.id}</span>
      </div>
      <PageHead
        title={`${d.suite}`}
        badge={<Pill tone="ok"><Icon n="circle-check" s={11} /> Passed with healing</Pill>}
        sub={<span className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <span className="mono">{d.id}</span><span className="row" style={{ gap: 4 }}><Icon n="git-branch" s={13} />{d.branch} @ <span className="mono">{d.commit}</span></span>
          <span>{d.trigger}</span><span>{d.started}</span>
        </span>}
        actions={<>
          <button className="btn" onClick={() => { const url = location.href; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast("Report link copied"), () => toast(url)); }}><Icon n="share-2" s={14} /> Share</button>
          <button className="btn" onClick={(e) => act(() => API.rerunFailure("failed-only"), e)}><Icon n="rotate-cw" s={14} /> Re-run failed</button>
          <button className="btn btn-primary" onClick={(e) => act(() => API.runTests({ rerun: d.id }), e)}><Icon n="play" s={13} /> Run again</button>
        </>}
      />

      <div className="grid-2" style={{ gridTemplateColumns: "340px 1fr" }}>
        <section className="card card-pad a-up row" style={{ gap: 20 }}>
          <Donut parts={[["Passed", t.passed, "var(--c-pass)"], ["Healed", t.healed, "var(--c-heal)"], ["Failed", t.failed, "var(--c-fail)"]]} size={130} center={`${passPct}%`} />
          <div className="col" style={{ gap: 8 }}>
            {[["Passed", t.passed, "var(--c-pass)"], ["Healed", t.healed, "var(--c-heal)"], ["Failed", t.failed, "var(--c-fail)"], ["Skipped", t.skipped, "var(--c-skip)"]].map(([k, v, c]) => (
              <div key={k} className="row small" style={{ gap: 8 }}><i style={{ width: 10, height: 10, borderRadius: 2, background: c }} /><span style={{ width: 62 }}>{k}</span><b className="mono">{v}</b></div>
            ))}
          </div>
        </section>
        <div className="grid-4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <Kpi label="Total tests" value={t.total} icon="list-checks" />
          <Kpi label="Duration" value={d.duration} icon="timer" sub="-22s vs previous" tone="ok" />
          <Kpi label="Auto-healed" value={t.healed} icon="wand-sparkles" tone="ai" sub="Locators repaired" />
          <Kpi label="Failed" value={t.failed} icon="circle-alert" tone="bad" sub="Need review" />
          <div className="card card-pad a-up small" style={{ gridColumn: "1 / -1", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <span className="row" style={{ gap: 6 }}><Icon n="server" s={14} /> {d.env}</span>
            <span className="row" style={{ gap: 6 }}><Icon n="folder" s={14} /> {d.project}</span>
          </div>
        </div>
      </div>

      <div className="side-layout" style={{ gridTemplateColumns: "minmax(0, 1fr) 340px" }}>
        <div className="col" style={{ gap: 16 }}>
          <section className="card a-up" style={{ overflow: "hidden" }}>
            <div className="card-head"><div className="card-title"><Icon n="circle-alert" s={16} style={{ color: "var(--bad)" }} /> Failed tests ({d.failed.length})</div>
              <button className="link small" onClick={() => go(pagePath(theme, "failures"))}>Triage in Failures</button></div>
            {d.failed.map(([id, name, suite, err]) => (
              <div key={id} className="list-row" onClick={() => go(pagePath(theme, "failures"))}>
                <Icon n="x" s={15} style={{ color: "var(--bad)" }} />
                <div className="grow">
                  <div className="row" style={{ gap: 8 }}><span className="mono xs" style={{ color: "var(--link)" }}>{id}</span><b style={{ fontWeight: 500 }}>{name}</b></div>
                  <div className="xs mono" style={{ color: "var(--bad)", marginTop: 2 }}>{err}</div>
                </div>
                <span className="xs muted">{suite}</span>
              </div>
            ))}
          </section>
          <section className="card a-up" style={{ overflow: "hidden" }}>
            <div className="card-head"><div className="card-title"><Icon n="layers" s={16} /> Results by suite</div></div>
            <table className="table">
              <thead><tr><th>Suite</th><th>Tests</th><th>Failed</th><th>Pass rate</th><th>Duration</th></tr></thead>
              <tbody>
                {d.suites.map(([name, n, failed, dur]) => (
                  <tr key={name} className="row-hover">
                    <td style={{ fontWeight: 500 }}>{name}</td>
                    <td className="mono small">{n}</td>
                    <td className="mono small" style={{ color: failed ? "var(--bad)" : "var(--text-3)" }}>{failed}</td>
                    <td style={{ width: 160 }}><div className="row" style={{ gap: 8 }}><div className="hbar grow" style={{ background: "var(--surface-3)" }}><i className="a-fill" style={{ width: `${((n - failed) / n) * 100}%`, background: failed ? "var(--warn-c)" : "var(--c-pass)" }} /></div><span className="mono xs">{(((n - failed) / n) * 100).toFixed(0)}%</span></div></td>
                    <td className="mono small">{dur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="col" style={{ gap: 16 }}>
          <section className="card card-pad a-up">
            <div className="card-title" style={{ marginBottom: 12 }}><Icon n="cpu" s={16} /> Worker timeline</div>
            <div className="col" style={{ gap: 7 }}>
              {d.workers.map(([start, len], i) => (
                <div key={i} className="row xs" style={{ gap: 8 }}>
                  <span className="mono muted" style={{ width: 22 }}>w{i + 1}</span>
                  <div className="grow" style={{ position: "relative", height: 10, background: "var(--surface-3)", borderRadius: 3 }}>
                    <i className="a-fill" style={{ position: "absolute", left: `${start}%`, width: `${len}%`, top: 0, bottom: 0, background: "var(--link)", borderRadius: 3, opacity: 0.85 }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="row-between xs muted" style={{ marginTop: 8, paddingLeft: 30 }}><span>0:00</span><span>{d.duration}</span></div>
          </section>
          <section className="card card-pad a-up">
            <div className="card-title" style={{ marginBottom: 10 }}><Icon n="package" s={16} /> Artifacts</div>
            {d.artifacts.map(([label, file, size]) => (
              <div key={file} className="row-between small" style={{ padding: "8px 0", borderTop: "1px solid var(--border-soft)" }}>
                <span className="row" style={{ gap: 8 }}><Icon n="file" s={14} className="muted" /><span><div>{label}</div><div className="xs mono muted">{file} · {size}</div></span></span>
                <button className="icon-btn" aria-label={`Download ${file}`} onClick={() => toast(`${file} (${size}) is served by the artifact store once the backend is connected.`)}><Icon n="download" s={14} /></button>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
window.AllRuns = AllRuns;
window.RunReport = RunReport;
