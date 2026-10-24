/* Extension screen: Failures inbox. The dark sidebar's "Failures" (badge 4) had no page.
   Light theme keeps the designed Failure Analysis screen; this inbox links to it. */
function Failures({ theme }) {
  return (
    <Screen theme={theme} active="Failures" crumbs={["Production - v2.4.1", "Failures"]} loader={() => API.getFailures()}>
      {(data) => <FailuresBody theme={theme} initial={data} />}
    </Screen>
  );
}

function FailuresBody({ theme, initial }) {
  const act = useAction();
  const [list, setList] = useState(initial);
  const [sel, setSel] = useState(initial[0].id);
  const [cause, setCause] = useState("All");
  const detailRef = useRef(null);

  useLayoutEffect(() => {
    if (detailRef.current) window.gsap.fromTo(detailRef.current.children, { autoAlpha: 0, x: 12 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" });
  }, [sel]);

  const counts = list.reduce((m, f) => ({ ...m, [f.cause]: (m[f.cause] || 0) + 1 }), {});
  const shown = list.filter(f => cause === "All" || f.cause === cause);
  const f = list.find(x => x.id === sel) || shown[0];
  const resolve = (id, label) => setList(l => l.map(x => x.id === id ? { ...x, resolved: label } : x));

  return (
    <>
      <PageHead
        eyebrow={<><span>TEST RUNS</span><Icon n="chevron-right" s={11} /><span>LAST 24 HOURS</span></>}
        title="Failures"
        badge={<Pill tone="solid">{list.filter(x => !x.resolved).length} open</Pill>}
        sub="AI triage sorts every failure into UI changes it can heal, real bugs to report, flaky tests and environment issues."
        actions={<>
          <button className="btn" onClick={(e) => act(() => API.rerunFailure("all"), e)}><Icon n="rotate-cw" s={14} /> Re-run all failed</button>
          <button className="btn btn-primary" onClick={(e) => act(() => API.fixFailure("all-ui"), e).then(() => setList(l => l.map(x => x.fixable ? { ...x, resolved: "Healed" } : x)))}>
            <Icon n="wand-sparkles" s={14} /> Heal all UI changes ({counts["UI Change"] || 0})
          </button>
        </>}
      />

      <div className="grid-4">
        <Kpi label="UI changes" value={counts["UI Change"] || 0} icon="wand-sparkles" tone="ai" sub="Auto-healable" />
        <Kpi label="Real bugs" value={counts["Real Bug"] || 0} icon="bug" tone="bad" sub="Report to Jira" />
        <Kpi label="Flaky" value={counts["Flaky"] || 0} icon="shuffle" tone="warn-c" sub="Quarantine candidates" />
        <Kpi label="Environment" value={counts["Environment"] || 0} icon="server" sub="Infra / data issues" />
      </div>

      <div className="side-layout" style={{ gridTemplateColumns: "minmax(0, 1fr) 420px" }}>
        <section className="card a-up" style={{ overflow: "hidden" }}>
          <div className="row-between" style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
            <div className="tabs">
              {["All", "UI Change", "Real Bug", "Flaky", "Environment"].map(c => (
                <button key={c} className={`tab ${cause === c ? "active" : ""}`} onClick={() => setCause(c)}>
                  {c} <span className="badge b-gray">{c === "All" ? list.length : counts[c] || 0}</span>
                </button>
              ))}
            </div>
          </div>
          {shown.map(x => (
            <div key={x.id} className={`list-row ${x.id === f.id ? "sel" : ""}`} onClick={() => setSel(x.id)} style={{ opacity: x.resolved ? 0.55 : 1 }}>
              <Icon n={x.cause === "Real Bug" ? "bug" : x.cause === "UI Change" ? "wand-sparkles" : x.cause === "Flaky" ? "shuffle" : "server"} s={16}
                style={{ color: x.cause === "Real Bug" ? "var(--bad)" : x.cause === "UI Change" ? "var(--ai)" : x.cause === "Flaky" ? "var(--warn-c)" : "var(--text-2)" }} />
              <div className="grow">
                <div className="row" style={{ gap: 8, flexWrap: "nowrap", minWidth: 0 }}>
                  <span className="mono xs" style={{ color: "var(--link)", flexShrink: 0 }}>{x.test}</span>
                  <b style={{ fontWeight: 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.title}</b>
                </div>
                <div className="xs muted" style={{ marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.detail}</div>
              </div>
              {x.resolved ? <Pill tone="ok"><Icon n="check" s={10} /> {x.resolved}</Pill> : <StatusPill status={x.cause} />}
              <span className="xs faint" style={{ width: 56, textAlign: "right" }}>{x.age}</span>
            </div>
          ))}
        </section>

        <aside className="card card-pad a-up" ref={detailRef} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="row-between">
            <span className="mono xs muted">{f.id} · {f.run}</span>
            <StatusPill status={f.cause} />
          </div>
          <div>
            <h3 style={{ fontSize: 17 }}>{f.test}: {f.title}</h3>
            <div className="small muted" style={{ marginTop: 4 }}>{f.suite} · failed at {f.step}</div>
          </div>
          <div className="inset" style={{ padding: 12, borderLeft: `3px solid ${f.cause === "Real Bug" ? "var(--bad)" : "var(--ai)"}` }}>
            <div className="xs upper muted" style={{ marginBottom: 4 }}>Root cause</div>
            <div className="small" style={{ lineHeight: "19px" }}>{f.detail}</div>
          </div>
          <div>
            <div className="row-between xs"><span className="muted">AI confidence</span><b className="mono">{f.conf}%</b></div>
            <Progress value={f.conf} color={f.conf >= 85 ? "var(--c-pass)" : "var(--warn-c)"} height={5} style={{ marginTop: 6 }} />
          </div>
          {f.fixable ? (
            <>
              <DiffBlock file={`tests/e2e/${f.test.toLowerCase()}.py`} before={`${f.oldLoc}.click()`} after={`${f.newLoc}.click()`} />
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-primary" disabled={!!f.resolved} onClick={(e) => act(() => API.fixFailure(f.id), e).then(() => resolve(f.id, "Healed"))}><Icon n="wand-sparkles" s={14} /> {f.resolved ? "Healed" : "Apply fix"}</button>
                <button className="btn" onClick={(e) => act(() => API.rerunFailure(f.id), e)}><Icon n="rotate-cw" s={13} /> Re-run</button>
                {theme === "light" && <button className="btn btn-ghost" onClick={() => go("/light/failure")}>Full analysis <Icon n="arrow-right" s={13} /></button>}
              </div>
            </>
          ) : f.cause === "Real Bug" ? (
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-primary" disabled={!!f.resolved} onClick={(e) => act(() => API.createBug({ failure: f.id }), e).then(() => resolve(f.id, "Reported"))}><Icon n="bug" s={14} /> {f.resolved ? "Reported" : "Create bug report"}</button>
              <button className="btn" onClick={() => go(pagePath(theme, "bugs"))}>Open Bug Reports</button>
            </div>
          ) : (
            <div className="row" style={{ gap: 8 }}>
              <button className="btn" onClick={(e) => act(() => API.rerunFailure(f.id), e)}><Icon n="rotate-cw" s={13} /> Re-run</button>
              <button className="btn" disabled={!!f.resolved} onClick={() => resolve(f.id, f.cause === "Flaky" ? "Quarantined" : "Ignored")}>
                <Icon n={f.cause === "Flaky" ? "shield-off" : "eye-off"} s={13} /> {f.cause === "Flaky" ? "Quarantine test" : "Ignore"}
              </button>
            </div>
          )}
          <div className="xs muted row" style={{ gap: 12, paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
            <span className="row" style={{ gap: 4 }}><Icon n="video" s={12} /> Video</span>
            <span className="row" style={{ gap: 4 }}><Icon n="file-search" s={12} /> Trace</span>
            <span className="row" style={{ gap: 4 }}><Icon n="image" s={12} /> Screenshot</span>
            <span style={{ marginLeft: "auto" }}>{f.age}</span>
          </div>
        </aside>
      </div>
    </>
  );
}
window.Failures = Failures;
