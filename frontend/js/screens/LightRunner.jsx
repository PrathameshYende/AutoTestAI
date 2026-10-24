/* Figma: "AutoTestAI - Live Test Runner" (1:5715) */
function LightRunner() {
  const { data, loading, error } = useApi(() => API.getQaRun("1248"));
  const ref = usePageAnim(!!data);
  const act = useAction();
  const toast = useToast();
  const [tab, setTab] = useState("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [paused, setPaused] = useState(false);
  const [typed, setTyped] = useState("");
  const pointerRef = useRef(null);
  const logRef = useRef(null);

  // Simulate the runner typing into the form.
  useEffect(() => {
    if (!data || paused) return;
    const target = "Doe";
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % (target.length + 4);
      setTyped(target.slice(0, Math.min(i, target.length)));
    }, 450);
    return () => clearInterval(id);
  }, [data, paused]);
  useEffect(() => { if (data) window.Anim.pointer(pointerRef.current, { x: 40, y: 22 }); }, [data]);
  useEffect(() => { if (logRef.current) window.Anim.staggerIn(logRef.current.children); }, [tab]);

  if (loading) return <LightShell active="Test Runs"><main className="page"><PageLoading /></main></LightShell>;
  if (error) return <LightShell active="Test Runs"><main className="page"><ErrorBox error={error} /></main></LightShell>;

  const k = data.counts;
  const seg = (n, color) => <i className="a-fill" style={{ flex: n, background: color, display: "block", height: "100%", borderRadius: 2 }} />;
  const logColor = { playwright: "#c9d6ea", navigate: "#93c5fd", action: "#86efac", assert: "#86efac" };
  const logs = tab === "errors" ? data.logs.filter((_, i) => i === 4) : tab === "network" ? data.logs.filter(l => l[1] === "navigate") : data.logs;

  return (
    <LightShell active="Test Runs">
      <main className="page" ref={ref}>
        <div className="page-inner" style={{ gap: 20 }}>
          <div className="a-up">
            <div className="row-between" style={{ flexWrap: "wrap" }}>
              <div className="row small" style={{ gap: 8 }}>
                <span className="muted">Test Runs</span><span className="crumb-sep" style={{ fontSize: 12 }}>/</span>
                <b style={{ fontWeight: 500 }}>Active Execution</b>
                <span className="badge b-blue" style={{ fontSize: 10 }}>PID: 90214</span>
              </div>
              <span className="badge b-gray" style={{ fontSize: 11 }}><span className="dot live" style={{ color: "#2563eb" }} /> Headless Cluster Node-04 (AWS us-east-1)</span>
            </div>
            <div className="row" style={{ gap: 14, marginTop: 14, flexWrap: "wrap" }}>
              <h1 className="l-title" style={{ fontSize: 28 }}>Test Run #1248: Full Regression Suite</h1>
              <span className="badge b-blue" style={{ fontWeight: 600 }}><span className="dot live" /> {paused ? "PAUSED" : "RUNNING"}</span>
              <span style={{ fontSize: 14, color: "#434655" }}>{k.passed + k.failed} / {k.total} tests completed ({Math.round(((k.passed + k.failed) / k.total) * 100)}%)</span>
            </div>
            <div className="row" style={{ marginTop: 16, gap: 8 }}>
              <button className="btn" onClick={() => setPaused(p => !p)}><Icon n={paused ? "play" : "pause"} s={14} /> {paused ? "Resume Suite" : "Pause Suite"}</button>
              <button className="btn" onClick={() => toast("Artifacts are bundled when the run finishes.")}><Icon n="download" s={14} /> Download Artifacts</button>
              <button className="btn" style={{ color: "#ba1a1a" }} onClick={(e) => act(() => API.stopRun(), e).then(() => setPaused(true))}><Icon n="circle-stop" s={14} /> Stop Execution</button>
            </div>
          </div>

          {/* Execution track */}
          <section className="card a-up" style={{ padding: 16 }}>
            <div className="row-between xs">
              <span className="row" style={{ gap: 10 }}>
                <b style={{ fontSize: 13 }}>Execution Track</b>
                <span style={{ color: "#006b2c", fontWeight: 600 }}>{k.passed} Passed</span>·
                <span style={{ color: "#ba1a1a", fontWeight: 600 }}>{k.failed} Failed</span>·
                <span style={{ color: "#2563eb", fontWeight: 600 }}>{k.running} Running</span>·
                <span className="muted">{k.queued} Queued</span>
              </span>
              <b>{(((k.passed + k.failed) / k.total) * 100).toFixed(1)}% overall</b>
            </div>
            <div className="row" style={{ gap: 3, height: 8, marginTop: 10 }}>
              {seg(k.passed, "#0f6b2f")}{seg(k.failed, "#ba1a1a")}{seg(k.running, "#2563eb")}{seg(k.queued, "#dce3f0")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginTop: 16 }}>
              {[["Passed", k.passed, `/ ${k.total}`, "#006b2c", "dot"], ["Failed", k.failed, "triage req.", "#ba1a1a", "dot"], ["Running", k.running, "workers", "#2563eb", "dot"], ["Queued", k.queued, "pending", "#737686", "dot"], ["Elapsed Time", data.elapsed, "s", "#0b1c30", "timer"], ["Est. Remaining", data.remaining, "~", "#0b1c30", "hourglass"]].map(([label, v, sub, col, ic]) => (
                <div key={label} className="a-up" style={{ padding: 12, background: "#f8f9ff", border: "1px solid rgba(195,198,215,.4)", borderRadius: 4 }}>
                  <div className="row-between xs upper" style={{ fontWeight: 600, letterSpacing: ".06em", color: "#0b1c30" }}>{label}{ic === "dot" ? <span className="dot" style={{ color: col }} /> : <Icon n={ic} s={13} />}</div>
                  <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 22, fontWeight: 600, color: col }}>{typeof v === "number" ? <Counter value={v} /> : v}</span>
                    <span className="xs" style={{ color: label === "Failed" ? "#ba1a1a" : "#434655" }}>{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 392px", gap: 24 }} className="split-2">
            {/* Browser viewport */}
            <section className="card a-up" style={{ overflow: "hidden", background: "#eff4ff" }}>
              <div className="row" style={{ padding: "8px 12px", gap: 10, background: "#dce9ff" }}>
                <span className="traffic"><i style={{ background: "#c3c6d7" }} /><i style={{ background: "#c3c6d7" }} /><i style={{ background: "#c3c6d7" }} /></span>
                <Icon n="arrow-left" s={13} /><Icon n="arrow-right" s={13} /><Icon n="rotate-cw" s={12} />
                <span className="row xs mono grow" style={{ gap: 6, background: "#fff", padding: "5px 10px", borderRadius: 4 }}><Icon n="lock" s={11} /> https://app.studentportal.demo/students/add</span>
                <span className="xs row" style={{ gap: 4, background: "#fff", padding: "3px 8px", borderRadius: 4 }}><span className="dot" style={{ color: "#006b2c" }} /> 1920x1080 @ 60fps</span>
              </div>
              <div style={{ padding: "40px 24px 20px", position: "relative" }}>
                <div className="card a-pop" style={{ maxWidth: 510, margin: "0 auto", padding: 24 }}>
                  <div className="row-between" style={{ alignItems: "flex-start" }}>
                    <div><b style={{ fontSize: 16, fontWeight: 600 }}>Enroll New Student</b><div className="small muted" style={{ fontSize: 13 }}>Academic Year 2025-2026 Registration</div></div>
                    <span className="badge b-gray" style={{ fontSize: 10, flexShrink: 0 }}>Form ID: STU-NEW</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginTop: 24 }}>
                    <div><div className="xs" style={{ fontWeight: 500 }}>First Name *</div><div style={{ padding: "10px 10px", fontSize: 13 }}>Jane</div></div>
                    <div><div className="xs" style={{ fontWeight: 500 }}>Last Name *</div><div style={{ padding: "10px 10px", fontSize: 13, borderLeft: "6px solid #2563eb" }}>{typed}<span className="dot live" style={{ width: 1, height: 14, borderRadius: 0, background: "#0b1c30", marginLeft: 1, verticalAlign: -2 }} /></div></div>
                    <div style={{ gridColumn: "1 / -1" }}><div className="xs" style={{ fontWeight: 500 }}>Email Address</div><div style={{ padding: "10px 10px", fontSize: 13 }}>jane.doe@university.edu</div></div>
                  </div>
                  <div className="row-between" style={{ marginTop: 18, position: "relative" }}>
                    <span className="xs row muted" style={{ gap: 4 }}><Icon n="check" s={11} /> Auto-validated payload</span>
                    <span className="row" aria-hidden="true" style={{ gap: 8, pointerEvents: "none" }}>
                      <button className="btn btn-sm" tabIndex={-1} style={{ background: "#eff4ff", border: 0 }}>Cancel</button>
                      <button className="btn btn-primary btn-sm" tabIndex={-1}>Save Student</button>
                    </span>
                    <span className="badge" style={{ position: "absolute", right: -40, top: -26, background: "#1e2a3b", color: "#fff", fontSize: 10 }}>click(button:has-text('Save'))</span>
                    <svg ref={pointerRef} className="cursor-pointer" viewBox="0 0 24 24" style={{ position: "absolute", right: 110, top: -8 }}>
                      <circle cx="12" cy="12" r="11" fill="rgba(37,99,235,.25)" />
                      <path d="M6 5l12 5-5 2-2 6z" fill="#2563eb" stroke="#fff" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
                <div className="row-between small" style={{ flexWrap: "wrap", maxWidth: 528, margin: "0 auto", marginTop: -2, padding: "8px 14px", background: "#1e2a3b", color: "#fff", borderRadius: 4 }}>
                  <span className="row" style={{ gap: 8 }}><span className="dot live" style={{ color: "#4ade80" }} /> Current Step: <span className="xs" style={{ color: "#93c5fd" }}>Clicking button 'Save Student'</span> <span className="badge" style={{ background: "#334155", color: "#c9d6ea", fontSize: 9 }}>[Step 7/8 in TC-042]</span></span>
                  <span className="xs" style={{ color: "#4ade80" }}>Latency: 28ms</span>
                </div>
              </div>
            </section>

            {/* Sequence */}
            <section className="card a-up">
              <div className="row-between" style={{ padding: "14px 16px", background: "#eff4ff", borderBottom: "1px solid rgba(195,198,215,.5)" }}>
                <span className="row l-panel-title" style={{ gap: 8 }}><Icon n="list-ordered" s={16} /> Execution Sequence</span>
                <span className="badge b-gray" style={{ fontSize: 10 }}>TC-042: Add Student</span>
              </div>
              <div style={{ padding: 8 }}>
                {data.sequence.map((s, i) => (
                  <div key={i} className={`l-step a-log ${s.state === "active" ? "active" : ""}`} style={{ borderBottom: "1px solid rgba(195,198,215,.3)", borderRadius: 0, padding: "10px 8px" }}>
                    <span className="l-check" style={s.state === "done" ? { background: "#e3f6e8", color: "#006b2c", width: 20, height: 20 } : s.state === "active" ? { border: "5px solid #2563eb", width: 20, height: 20 } : { background: "#eff4ff", width: 20, height: 20 }}>
                      {s.state === "done" && <Icon n="check" s={11} sw={2.5} />}
                      {s.state === "queued" && <i style={{ width: 4, height: 4, borderRadius: "50%", background: "#c3c6d7" }} />}
                    </span>
                    <div className="grow">
                      <div className="row-between"><b style={{ fontWeight: 500, color: s.state === "active" ? "#2563eb" : s.state === "queued" ? "#434655" : "#0b1c30" }}>{s.t}</b><span className="xs mono" style={{ color: s.state === "active" ? "#2563eb" : "#434655", fontWeight: s.state === "active" ? 600 : 400 }}>{s.time}</span></div>
                      <div className="xs" style={{ marginTop: 2, color: s.state === "active" ? "#2563eb" : s.green ? "#006b2c" : "#434655" }}>{s.state === "active" && <Icon n="refresh-cw" s={10} className="spin" style={{ marginRight: 4, verticalAlign: -1 }} />}{s.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Logs console */}
          <section className="l-console a-up">
            <div className="head" style={{ padding: "8px 14px" }}>
              <div className="tabs">
                {[["all", "All Logs", "square-terminal", 142], ["errors", "Errors", "circle-alert", 4], ["network", "Network Requests", "globe", 38], ["console", "Browser Console", "code", null]].map(([key, l, ic, n]) => (
                  <button key={key} className="tab" onClick={() => setTab(key)} style={{ color: tab === key ? "#fff" : "#c9d6ea", background: tab === key ? "#33455e" : "transparent" }}>
                    <Icon n={ic} s={13} /> {l} {n !== null && <span className="badge" style={{ background: key === "errors" ? "#ba1a1a" : "#3d5270", color: "#fff", fontSize: 9, padding: "0 4px" }}>{n}</span>}
                  </button>
                ))}
              </div>
              <span className="row xs" style={{ gap: 12 }}>
                <label className="row" style={{ gap: 6, cursor: "pointer" }}><Check on={autoScroll} onClick={() => setAutoScroll(a => !a)} /> Auto-scroll</label>
                <Icon n="wrap-text" s={14} /><Icon n="copy" s={14} />
              </span>
            </div>
            <div ref={logRef} style={{ padding: "10px 0" }}>
              {tab === "console" ? <div className="mono xs" style={{ padding: "6px 20px", color: "#8fa0b8" }}>No console messages captured.</div> :
                logs.map((l, i) => (
                  <div key={l[0]} className="mono a-log" style={{ display: "flex", gap: 12, padding: "5px 20px", fontSize: 11, background: i >= 6 && tab === "all" ? "#233247" : "transparent" }}>
                    <span style={{ color: "#8a9bb5", width: 10 }}>{data.logs.indexOf(l) + 1}</span>
                    <span style={{ color: "#8a9bb5" }}>[{l[0]}]</span>
                    <span style={{ color: logColor[l[1]] || "#c9d6ea" }}>[{l[1]}]</span>
                    <span style={{ color: "#dbe5f5" }}>{l[2]}{l[3] && <b style={{ color: "#4ade80" }}>{l[3]}</b>}{l[4]}</span>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </main>
    </LightShell>
  );
}
window.LightRunner = LightRunner;
