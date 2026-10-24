/* Figma: "AutoTestAI - QA Dashboard" (1:4089) */
function LightDashboard() {
  const { data, loading, error } = useApi(() => API.getQaDashboard());
  const ref = usePageAnim(!!data);
  const [range, setRange] = useState("7d");
  const chartRef = useRef(null);

  useEffect(() => { if (data) window.Anim.refreshBars(chartRef.current); }, [range]);

  if (loading) return <LightShell active="Dashboard"><main className="page"><PageLoading /></main></LightShell>;
  if (error) return <LightShell active="Dashboard"><main className="page"><ErrorBox error={error} /></main></LightShell>;

  const chart = data.chart[range];
  const max = 260;
  const statusPill = (s) => {
    const m = {
      Running: ["b-blue", <span className="dot live" />],
      Passed: ["b-pass", <Icon n="check" s={11} />],
      Failed: ["b-fail", <Icon n="x" s={11} />],
      Queued: ["b-gray", <Icon n="circle" s={10} />]
    }[s];
    return <span className={`badge ${m[0]}`}>{m[1]} {s}</span>;
  };

  return (
    <LightShell active="Dashboard">
      <main className="page" ref={ref}>
        <div className="page-inner" style={{ gap: 20 }}>
          <div className="row-between a-up" style={{ paddingBottom: 18, borderBottom: "1px solid rgba(195,198,215,.4)" }}>
            <div>
              <h1 className="l-title row" style={{ gap: 10 }}>Good afternoon, QA Team <span className="badge b-pass" style={{ fontSize: 10 }}><span className="dot live" /> Runner Cluster Healthy</span></h1>
              <p className="l-sub" style={{ marginTop: 6 }}>Monitor your automated testing activity and application health across distributed worker pools.</p>
            </div>
            <div className="row">
              <button className="btn" onClick={() => go("/light/create")}><Icon n="file-up" s={14} /> Upload Recording</button>
              <button className="btn btn-primary" onClick={() => go("/light/create")}><Icon n="plus" s={14} /> New Test</button>
            </div>
          </div>

          <section className="l-stats">
            {data.stats.map(s => (
              <div className="card l-stat a-up" key={s.k}>
                <div className="row-between" style={{ fontSize: 12, color: "#0b1c30", fontWeight: 500 }}>
                  <span>{s.k}</span>
                  {s.badge ? <span className="badge b-fail" style={{ fontSize: 9, fontWeight: 600 }}>{s.badge}</span> :
                    s.icon === "dot-green" ? <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #006b2c", display: "grid", placeItems: "center" }}><i style={{ width: 5, height: 5, borderRadius: "50%", background: "#006b2c" }} /></span> :
                    <Icon n={s.icon} s={15} style={{ color: s.tone === "link" ? "#2563eb" : "#434655" }} />}
                </div>
                <div className="v"><Counter value={s.v} decimals={s.decimals || 0} suffix={s.suffix || ""} /></div>
                <div className="xs row" style={{ gap: 4, color: s.tone === "fail" ? "#ba1a1a" : s.tone === "up" || s.tone === "upgreen" ? "#006b2c" : s.tone === "link" ? "#2563eb" : "#434655" }}>
                  {(s.tone === "up" || s.tone === "upgreen") && <Icon n={s.tone === "up" ? "arrow-up" : "trending-up"} s={11} />}{s.sub}
                </div>
              </div>
            ))}
          </section>

          <div className="l-grid">
            <div className="col" style={{ gap: 20 }}>
              {/* Chart */}
              <section className="card a-up" style={{ padding: 16 }}>
                <div className="row-between">
                  <div className="row" style={{ gap: 10 }}><span className="l-panel-title">Test Execution</span><span className="badge b-blue" style={{ fontSize: 10 }}>Total runs: 1,842</span></div>
                  <div className="row" style={{ gap: 14 }}>
                    {[["Passed", "#0f6b2f"], ["Failed", "#ba1a1a"], ["Skipped", "#c3c6d7"]].map(([l, col]) => (
                      <span key={l} className="row xs" style={{ gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />{l}</span>
                    ))}
                    <div className="seg">{["24h", "7d", "14d", "30d"].map(r => <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>{r}</button>)}</div>
                  </div>
                </div>
                <div ref={chartRef} style={{ position: "relative", marginTop: 20, paddingLeft: 40 }}>
                  {[250, 175, 100, 0].map((v) => (
                    <div key={v} style={{ position: "absolute", left: 0, right: 0, bottom: 26 + (v / max) * 170, borderTop: v ? "1px dashed rgba(195,198,215,.6)" : "1px solid rgba(195,198,215,.8)" }}>
                      <span style={{ position: "absolute", left: 0, top: -10, fontSize: 13, color: "#434655" }}>{v}</span>
                    </div>
                  ))}
                  <div className="bars" style={{ height: 196, gap: 20, alignItems: "flex-end" }}>
                    {chart.map(d => (
                      <div className="bar-col" key={d.d}>
                        <div className="bar-stack a-bar" style={{ height: `${((d.p + d.f + d.s) / max) * 170}px`, flex: "none", maxWidth: 34, borderRadius: "3px 3px 0 0" }} title={`Passed ${d.p} · Failed ${d.f} · Skipped ${d.s}`}>
                          <i style={{ flex: d.p, background: "#0f6b2f" }} /><i style={{ flex: d.f, background: "#ba1a1a" }} /><i style={{ flex: d.s, background: "#c3c6d7" }} />
                        </div>
                        <span style={{ fontSize: 14, color: d.d === "Today" ? "#0b1c30" : "#434655", fontWeight: d.d === "Today" ? 700 : 400 }}>{d.d}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="row-between xs" style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(195,198,215,.4)", color: "#434655" }}>
                  <span>Peak concurrency: 18 parallel Playwright headless instances</span><span>Avg test execution: 3.4m</span>
                </div>
              </section>

              {/* Runs table */}
              <section className="card a-up" style={{ overflow: "hidden" }}>
                <div className="row-between" style={{ padding: 14 }}>
                  <div className="row" style={{ gap: 10 }}><span className="l-panel-title">Recent Test Runs</span><span className="badge b-blue" style={{ fontSize: 10 }}>Live telemetry</span></div>
                  <a href="#/light/all-runs" className="row" style={{ color: "#2563eb", gap: 2, fontWeight: 500 }}>View All (1,248) <Icon n="chevron-right" s={14} /></a>
                </div>
                <table className="table">
                  <thead><tr><th>Test Run</th><th>Project</th><th>Status</th><th style={{ textAlign: "right" }}>Tests</th><th style={{ textAlign: "right" }}>Passed</th><th style={{ textAlign: "right" }}>Failed</th><th>Duration</th><th style={{ textAlign: "right" }}>Time</th></tr></thead>
                  <tbody>
                    {data.runs.map(r => (
                      <tr key={r.id} className="row-hover" style={{ background: r.status === "Failed" ? "#fff8f7" : undefined, cursor: "pointer" }} onClick={() => go(r.status === "Failed" ? "/light/failure" : r.status === "Running" ? "/light/runner" : "/light/report")}>
                        <td className="mono small" style={{ color: "#2563eb", whiteSpace: "nowrap" }}>{r.id}</td>
                        <td style={{ fontWeight: 500 }}>{r.project}</td>
                        <td>{statusPill(r.status)}</td>
                        <td style={{ textAlign: "right" }} className="mono small">{r.tests}</td>
                        <td style={{ textAlign: "right", color: "#006b2c" }} className="mono small">{r.passed}</td>
                        <td style={{ textAlign: "right", color: typeof r.failed === "string" && r.failed.includes("healed") ? "#2563eb" : r.failed ? "#ba1a1a" : "#434655", fontWeight: r.failed && r.failed !== "-" ? 600 : 400 }} className="mono small">{r.failed}</td>
                        <td className="mono small">{r.duration}</td>
                        <td style={{ textAlign: "right" }} className="small muted">{r.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="row-between xs" style={{ padding: "10px 14px", color: "#434655" }}>
                  <span>Showing 5 of 1,248 runs</span><span className="row" style={{ gap: 8 }}>Previous • Next</span>
                </div>
              </section>
            </div>

            <div className="col" style={{ gap: 20 }}>
              <section className="card a-up" style={{ padding: 16 }}>
                <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
                  <Icon n="snowflake" s={18} style={{ color: "#2563eb", marginTop: 2 }} />
                  <div><div className="l-panel-title">Automation Insights</div><div className="small muted" style={{ fontSize: 12 }}>AI-detected patterns &amp; self-healing actions</div></div>
                </div>
                {data.insights.map((ins, i) => (
                  <div key={i} className="a-up" style={{ paddingTop: 14, marginTop: 14, borderTop: "1px solid rgba(195,198,215,.4)" }}>
                    <div className="row-between" style={{ alignItems: "flex-start" }}>
                      <span className="row small" style={{ gap: 6, alignItems: "flex-start", fontWeight: 500, color: ins.tone === "fail" ? "#ba1a1a" : ins.tone === "pass" ? "#006b2c" : "#2563eb" }}>
                        {ins.icon ? <Icon n={ins.icon} s={13} style={{ marginTop: 2 }} /> : <span className="dot" style={{ marginTop: 5 }} />} {ins.title}
                      </span>
                      <span className="xs muted" style={{ whiteSpace: "nowrap" }}>{ins.time}</span>
                    </div>
                    <p className="small" style={{ marginTop: 4, color: "#434655", lineHeight: "18px" }}>
                      {ins.body.map((b, j) => b.startsWith("'") ? <span key={j} className="mono" style={{ background: "#eff4ff", padding: "0 4px", fontSize: 11 }}>{b}</span> : <span key={j}>{b}</span>)}
                    </p>
                    {ins.link && <a href={ins.link === "View Healing Log" ? "#/light/self-healing" : "#/light/failure"} className="row small" style={{ color: "#2563eb", marginTop: 8, gap: 2 }}>{ins.link} <Icon n="arrow-right" s={12} /></a>}
                  </div>
                ))}
              </section>

              <section className="card a-up" style={{ padding: 16 }}>
                <div className="row-between"><span className="l-panel-title">Workflow Health</span><span className="xs muted">4 of 8 Critical</span></div>
                <div className="col" style={{ gap: 12, marginTop: 16 }}>
                  {data.health.map(([name, v, warn]) => (
                    <div key={name}>
                      <div className="row-between small" style={{ fontWeight: 500 }}>
                        <span className="row" style={{ gap: 6 }}>{name} {warn && <span className="badge b-fail" style={{ fontSize: 9 }}>Needs review</span>}</span>
                        <b className="xs mono" style={{ color: warn ? "#ba1a1a" : "#006b2c" }}>{v}%</b>
                      </div>
                      <div className="hbar" style={{ marginTop: 6 }}><i className="a-fill" style={{ width: `${v}%`, background: warn ? "#ba1a1a" : "#0f6b2f" }} /></div>
                    </div>
                  ))}
                </div>
                <div className="row-between xs" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(195,198,215,.4)" }}>
                  <span className="muted">SLO target: 95.0%</span><a href="#/light/settings" style={{ color: "#2563eb", fontSize: 12 }}>Manage Thresholds</a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </LightShell>
  );
}
window.LightDashboard = LightDashboard;
