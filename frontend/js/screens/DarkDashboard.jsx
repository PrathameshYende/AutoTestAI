/* Figma: "Dashboard — AutoTestAI" (1:581) */
function DarkDashboard() {
  const { data, loading, error } = useApi(() => API.getDashboard());
  const ref = usePageAnim(!!data);
  const [range, setRange] = useState("24H");
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const chartRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => { if (data) window.Anim.refreshBars(chartRef.current); }, [range]);
  useEffect(() => { if (data && glowRef.current) window.Anim.drift(glowRef.current.querySelectorAll(".glow")); }, [data]);

  if (loading) return <DarkShell active="Dashboard"><main className="page"><PageLoading /></main></DarkShell>;
  if (error) return <DarkShell active="Dashboard"><main className="page"><ErrorBox error={error} /></main></DarkShell>;

  const series = [
    { key: "p", label: "Passed", color: "#4d8eff" },
    { key: "f", label: "Failed", color: "#ffb4ab" },
    { key: "h", label: "Healed", color: "#d0bcff" }
  ];
  const runs = data.runs.filter(r =>
    (status === "All Statuses" || r.status === status) &&
    (r.name + r.project).toLowerCase().includes(filter.toLowerCase()));

  return (
    <DarkShell active="Dashboard">
      <main className="page" ref={ref}>
        <div className="page-inner">
          {/* Hero */}
          <section className="card hero a-up" ref={glowRef}>
            <div className="glow" style={{ width: 300, height: 300, right: 120, top: -120, background: "rgba(128,131,255,.18)" }} />
            <div style={{ position: "relative" }}>
              <div className="row" style={{ gap: 8 }}>
                <span className="eyebrow">AUTONOMOUS CI ENGINE</span>
                <span className="small muted">• Active Workspace: Enterprise Core</span>
              </div>
              <h1>AI-powered testing, from recording to report.</h1>
              <p>Let AutoTestAI learn your application, generate tests, execute them, and automatically diagnose failures in real-time.</p>
              <div className="row" style={{ gap: 8, marginTop: 18 }}>
                <button className="btn btn-primary btn-lg" onClick={() => go("/dark/upload")}><Icon n="plus-circle" s={16} /> Create New Test</button>
                <button className="btn btn-lg" onClick={() => go("/dark/upload")}><Icon n="video" s={16} /> Upload Recording</button>
              </div>
            </div>
            <div className="coverage a-pop">
              <div className="small muted row" style={{ justifyContent: "flex-end", gap: 6 }}><Icon n="sparkles" s={13} /> Coverage Metric</div>
              <div className="big"><Counter value={data.coverage.value} decimals={1} suffix="%" /></div>
              <div className="small muted">Autonomous Test Coverage</div>
              <span className="badge b-gray" style={{ marginTop: 8 }}><Icon n="trending-up" s={11} /> {data.coverage.delta}</span>
            </div>
          </section>

          {/* Stats */}
          <section className="stats6">
            {data.stats.map(s => (
              <div className="card stat a-up" key={s.key}>
                <div className="k">
                  {s.key}
                  {s.kind === "rate" ? <span className="mono" style={{ letterSpacing: 0 }}>{s.value}%</span> :
                    s.icon === "dot-blue" ? <span className="dot" style={{ color: "#4d8eff", boxShadow: "0 0 8px #4d8eff" }} /> :
                    s.icon === "dot-red" ? <span className="dot" style={{ color: "#ffb4ab", boxShadow: "0 0 8px #ffb4ab" }} /> :
                    <Icon n={s.icon === "database" ? "server" : s.icon} s={14} />}
                </div>
                {s.kind === "rate" ? (
                  <>
                    <Progress value={s.pass} color="linear-gradient(90deg,#c0c1ff,#e1e2eb)" height={6} style={{ marginTop: 6 }} />
                    <div className="row-between xs mono" style={{ marginTop: 4 }}>
                      <span style={{ color: "#a8c3ff" }}>Pass {s.pass}%</span><span style={{ color: "#ffb4ab" }}>Fail {s.fail}%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="v"><Counter value={s.value} /></div>
                    <div className="xs">
                      {s.tone === "pass" ? <span className="badge b-blue" style={{ fontSize: 10 }}>{s.sub}</span> :
                        s.tone === "fail" ? <span className="badge" style={{ background: "#93000a", color: "#ffdad6", fontSize: 10 }}>{s.sub}</span> :
                        <span className="muted row" style={{ gap: 4 }}>
                          {s.tone === "up" && <Icon n="trending-up" s={11} />}
                          {s.key === "Workflows" && <span className="dot" style={{ color: "#4d8eff" }} />}
                          {s.key === "Self-Healed" && <Icon n="timer" s={11} />}
                          <span style={{ color: s.tone === "up" ? "#a8c3ff" : undefined }}>{s.sub}</span>
                        </span>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </section>

          <div className="dash-grid">
            <div className="col" style={{ gap: 12 }}>
              {/* Execution chart */}
              <section className="card a-up">
                <div className="card-head">
                  <div className="card-title">Execution Dynamics <span className="badge b-gray">14 Runs Window</span></div>
                  <div className="row" style={{ gap: 14 }}>
                    {series.concat([{ key: "fl", label: "Flaky", color: "#32353c" }]).map(s => (
                      <span key={s.key} className="row small" style={{ gap: 5 }}><i style={{ width: 9, height: 9, background: s.color, borderRadius: 1 }} />{s.label}</span>
                    ))}
                    <div className="seg">
                      {["24H", "7D", "30D", "90D"].map(r => <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>{r}</button>)}
                    </div>
                  </div>
                </div>
                <div ref={chartRef} style={{ padding: "8px 8px 12px", background: "#0b0e14", margin: "0 0 0", borderTop: "1px solid #272a30" }}>
                  <StackedBars data={data.execution[range]} series={series} height={170} max={110} />
                </div>
                <div className="row-between small muted" style={{ padding: "8px 12px", borderTop: "1px solid #272a30" }}>
                  <span className="row" style={{ gap: 14 }}>
                    <span className="row" style={{ gap: 5 }}><Icon n="clock" s={12} /> Avg Execution: 4m 12s</span>
                    <span>•</span>
                    <span className="row" style={{ gap: 5 }}><Icon n="sparkle" s={12} /> Flakiness Index: 1.2%</span>
                  </span>
                  <span className="row" style={{ gap: 5 }}><Icon n="git-commit" s={12} /> Trigger: GitHub Actions #4092</span>
                </div>
              </section>

              {/* Recent runs */}
              <section className="card a-up">
                <div className="card-head">
                  <div className="card-title">Recent Test Runs <span className="badge b-gray">5 Active Logs</span></div>
                  <div className="row">
                    <label className="input" style={{ height: 30, width: 140, background: "#0b0e14" }}>
                      <Icon n="search" s={12} /><input placeholder="Filter suites..." value={filter} onChange={e => setFilter(e.target.value)} style={{ fontSize: 12 }} />
                    </label>
                    <select className="btn btn-sm" value={status} onChange={e => setStatus(e.target.value)} style={{ height: 30 }}>
                      {["All Statuses", "Passed", "Failed", "Running", "Queued", "Healed"].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <select className="btn btn-sm" style={{ height: 30 }}><option>Staging</option><option>Production</option></select>
                  </div>
                </div>
                <table className="table">
                  <thead><tr><th>Test Suite / Run</th><th>Project</th><th>Status</th><th>Duration</th><th>Pass/Fail</th><th>Started</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
                  <tbody>
                    {runs.map(r => (
                      <tr key={r.id} className="row-hover" style={{ cursor: "pointer", ...(r.status === "Failed" ? { background: "rgba(147,0,10,.12)" } : {}) }} onClick={() => go(r.status === "Running" ? "/dark/runs" : r.status === "Failed" ? "/dark/failures" : "/dark/report")}>
                        <td>
                          <div className="row" style={{ alignItems: "flex-start" }}>
                            <Icon n={r.icon} s={14} style={{ marginTop: 2, color: r.status === "Failed" ? "#ffb4ab" : r.status === "Healed" ? "#d0bcff" : "#c7c4d7" }} />
                            <div className="col">
                              <span style={{ fontWeight: 500 }}>{r.name}</span>
                              <span className="xs mono" style={{ color: r.status === "Failed" ? "#ffb4ab" : r.status === "Healed" ? "#d0bcff" : "#918fa0" }}>{r.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="muted">{r.project}</td>
                        <td><DarkStatus status={r.status} /></td>
                        <td className="mono small">{r.duration}</td>
                        <td className="mono small">{r.status === "Failed" ? <>82 / <b style={{ color: "#ffb4ab" }}>4</b></> : r.pf}</td>
                        <td className="mono small muted">{r.started}</td>
                        <td style={{ textAlign: "right" }}>
                          <span className="row" style={{ justifyContent: "flex-end", gap: 10, color: "#c7c4d7" }}>
                            {r.status === "Running" ? <><Icon n="square" s={13} /><Icon n="terminal-square" s={14} /></> :
                              r.status === "Queued" ? <Icon n="x" s={14} /> :
                              <><Icon n="rotate-ccw" s={13} /><Icon n="align-left" s={14} /><Icon n="chevron-right" s={14} /></>}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>

            <div className="col" style={{ gap: 12 }}>
              {/* AI insights */}
              <section className="card a-up" style={{ background: "linear-gradient(160deg,#272a3a 0%,#191c22 40%)" }}>
                <div className="card-head" style={{ borderBottom: "1px solid rgba(70,69,84,.5)" }}>
                  <div className="card-title"><Icon n="bot" s={16} /> AI Insights</div>
                  <span className="badge b-solid">4 New</span>
                </div>
                {data.insights.map((ins, i) => (
                  <div className="insight a-up" key={i} style={i === 0 ? { background: "rgba(87,27,193,.12)" } : null}>
                    <div className="row-between">
                      <span className="row small" style={{ gap: 5, color: ins.tone === "fail" ? "#ffb4ab" : ins.tone === "heal" ? "#e1e2eb" : ins.tone === "pass" ? "#c0c1ff" : "#e1e2eb", fontWeight: 500 }}>
                        {ins.tone === "fail" ? <span className="dot" /> : <Icon n={ins.icon} s={12} />} {ins.type}
                      </span>
                      <span className="xs faint mono">{ins.time}</span>
                    </div>
                    <p className="small" style={{ marginTop: 4, lineHeight: "17px" }}>
                      {ins.code ? <>2 locators automatically repaired: Selector <span className="badge b-gray" style={{ padding: "0 4px" }}>{ins.code}</span> updated.</> : ins.text}
                    </p>
                    {(ins.action || ins.meta) && (
                      <div className="row-between" style={{ marginTop: 8 }}>
                        <span className="xs" style={{ color: "#a8c3ff" }}>{ins.meta}</span>
                        <button className={`btn btn-sm ${ins.primary ? "btn-primary" : ""}`} style={{ height: 24, fontSize: 11 }} onClick={() => go(ins.primary ? "/dark/failures" : "/dark/self-healing")}>{ins.action}</button>
                      </div>
                    )}
                  </div>
                ))}
              </section>

              {/* Pipeline core */}
              <section className="card a-up">
                <div className="card-head">
                  <div className="card-title"><Icon n="cpu" s={16} /> AI Pipeline Core</div>
                  <span className="small row" style={{ gap: 5, color: "#c0c1ff" }}><span className="dot live" /> Active</span>
                </div>
                <div style={{ padding: "0 12px 12px" }}>
                  {data.pipeline.map(([k, v]) => (
                    <div key={k} className="row-between xs" style={{ padding: "7px 0", borderTop: "1px solid rgba(70,69,84,.4)" }}>
                      <span className="muted">{k}</span><span>{v}</span>
                    </div>
                  ))}
                  <div className="row-between xs" style={{ marginTop: 8 }}>
                    <span className="muted">Worker Shard Capacity</span><span>{data.shards.used}/{data.shards.total} Active</span>
                  </div>
                  <Progress value={(data.shards.used / data.shards.total) * 100} color="#c0c1ff" height={5} style={{ marginTop: 6 }} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </DarkShell>
  );
}
window.DarkDashboard = DarkDashboard;
