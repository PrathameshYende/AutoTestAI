/* Figma: "Test Runs & Live Runner — AutoTestAI" (1:3073) */
function DarkRuns() {
  const { data, loading, error } = useApi(() => API.getLiveRun());
  const [done, setDone] = useState(null);
  const ref = usePageAnim(!!data && done !== null);
  const act = useAction();
  const toast = useToast();
  const [tab, setTab] = useState("terminal");
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const pointerRef = useRef(null);
  const termRef = useRef(null);

  useEffect(() => { if (data) setDone(data.completed); }, [data]);
  const finished = data && done !== null && done >= data.total;
  const halted = paused || stopped || finished;

  // Live feel: one more test completes every few seconds until the suite finishes.
  useEffect(() => {
    if (!data || halted) return;
    const id = setInterval(() => setDone(d => Math.min(d + 1, data.total)), 4000);
    return () => clearInterval(id);
  }, [data, halted]);
  useEffect(() => { if (data) window.Anim.pointer(pointerRef.current, { x: -120, y: -40 }); }, [data]);
  useEffect(() => { if (termRef.current) window.Anim.staggerIn(termRef.current.children); }, [tab]);

  const body = () => {
    if (error) return <ErrorBox error={error} />;
    if (loading || done === null) return <PageLoading />;

    // Newly completed tests count as passed; running workers drain as the suite ends.
    const extra = done - data.completed;
    const passed = data.stats.passed + extra;
    const running = finished || stopped ? 0 : data.stats.running;
    const pct = ((done / data.total) * 100).toFixed(1);
    const passPct = ((passed / data.total) * 100).toFixed(1);
    const statusLabel = stopped ? "STOPPED" : finished ? "SUITE COMPLETE" : paused ? "PIPELINE PAUSED" : "LIVE PIPELINE ACTIVE";

    const stat = (label, value, sub, icon, color, subColor) => (
      <div className="card a-up" style={{ padding: "12px 14px", background: "#191c22", borderRadius: 2 }}>
        <div className="row-between small"><span>{label}</span>{icon}</div>
        <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: label === "Duration Clock" ? 16 : 24, fontWeight: 600, color }}>{typeof value === "number" ? <Counter value={value} /> : value}</span>
          <span className="xs" style={{ color: subColor || "var(--text-2)", textTransform: label === "Failed" ? "uppercase" : "none", letterSpacing: label === "Failed" ? ".06em" : 0 }}>{sub}</span>
        </div>
      </div>
    );

    return (
      <div className="page-inner">
        {/* Hero */}
        <section className="a-up" style={{ padding: "4px 0 0", background: "linear-gradient(120deg,transparent,rgba(128,131,255,.06))" }}>
          <div className="row xs mono" style={{ gap: 10 }}>
            <span className="badge" style={{ background: stopped ? "#93000a" : "#272a30", color: stopped ? "#ffdad6" : "#c7c4d7", border: "1px solid #464554", borderRadius: 2, fontSize: 10 }}>
              <span className={`dot ${halted ? "" : "live"}`} /> {statusLabel}
            </span>
            <span className="muted">RUN_ID: {data.runId}</span>
          </div>
          <h1 className="row" style={{ fontSize: 20, marginTop: 8, gap: 10 }}>
            <Icon n="rocket" s={20} style={{ color: "#c0c1ff" }} /> {data.title}
            <span className="badge b-gray" style={{ fontSize: 10, borderRadius: 2 }}>{data.worker}</span>
          </h1>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn" onClick={() => toast("Artifacts are bundled when the run finishes.")}><Icon n="download" s={14} /> Artifacts (.zip)</button>
            <button className="btn" disabled={stopped || finished} onClick={(e) => { setPaused(p => !p); act(() => API.pauseRun(), e); }}>
              <Icon n={paused ? "play" : "pause"} s={14} /> {paused ? "Resume Suite" : "Pause Suite"}
            </button>
            <button className="btn btn-danger" disabled={stopped || finished} onClick={(e) => act(() => API.stopRun(), e).then(() => setStopped(true))}>
              <Icon n="square" s={12} /> {stopped ? "Stopped" : "Stop Execution"}
            </button>
          </div>

          <div style={{ marginTop: 14, padding: "8px 10px", background: "#0b0e14", border: "1px solid #272a30", borderRadius: 2 }}>
            <div className="row-between xs">
              <span className="row" style={{ gap: 5 }}><span className={`dot ${halted ? "" : "live"}`} style={{ color: "#c0c1ff" }} /> Execution Telemetry Stream</span>
              <b className="mono">{done} / {data.total} tests completed ({pct}%)</b>
            </div>
            <div className="progress" style={{ height: 6, marginTop: 6, background: "#32353c" }}>
              <i className="a-fill" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#c0c1ff,#e1e2eb)", transition: "width .8s ease" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginTop: 12 }}>
            {stat("Passed", passed, `${passPct}%`, <Icon n="circle-check" s={16} />, "#c0c1ff")}
            {stat("Failed", data.stats.failed, "Critical", <span className="dot" style={{ color: "#ffb4ab" }} />, "#ffb4ab", "#ffb4ab")}
            {stat("Running", running, "Parallel nodes", <Icon n="refresh-cw" s={15} className={halted ? "" : "spin"} style={{ color: "#c0c1ff" }} />, "#c0c1ff")}
            {stat("Skipped", data.stats.skipped, "Tags ignored", <Icon n="skip-forward" s={14} />, "var(--text)")}
            {stat("Duration Clock", <LiveClock start={258} paused={halted} />, finished ? "Done" : `ETA: ${data.stats.eta}`, <Icon n="timer" s={16} />, "var(--text)")}
          </div>
        </section>

        {/* Browser + trace */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 390px", gap: 12 }} className="split-2">
          <section className="card a-up" style={{ borderRadius: 4, overflow: "hidden" }}>
            <div className="browser-bar">
              <div className="traffic"><i style={{ background: "#c98b84" }} /><i style={{ background: "#585a66" }} /><i style={{ background: "#4d8eff" }} /></div>
              <span className="row xs mono grow" style={{ gap: 5, background: "#272a30", padding: "4px 8px", borderRadius: 2, maxWidth: 260, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", display: "block" }} title="https://staging.studentportal.io/students/add">
                <Icon n="lock" s={11} /> https://staging.studentportal.io/students/add
              </span>
              <span className="badge b-gray" style={{ marginLeft: "auto", fontSize: 10, borderRadius: 2 }}>1920x1080 Headless Chromium</span>
              <Icon n="maximize-2" s={14} />
            </div>
            <div style={{ padding: 12, position: "relative" }}>
              <div style={{ background: "#191c22", border: "1px solid #272a30", borderRadius: 2, padding: 14, minHeight: 300, position: "relative" }}>
                <span className="badge a-pop" style={{ position: "absolute", right: 10, top: -10, background: "#93000a", color: "#ffdad6", borderRadius: 99, fontWeight: 600, fontSize: 10 }}>
                  <span className={`dot ${halted ? "" : "live"}`} /> {halted ? "RECORDING ENDED" : "LIVE RECORDING • 30 FPS • Worker 1"}
                </span>
                <div className="row-between">
                  <h3 className="row" style={{ fontSize: 16, gap: 8 }}><Icon n="graduation-cap" s={18} /> Student Information System</h3>
                  <span className="row" style={{ gap: 8 }}><i style={{ width: 60, height: 14, background: "#272a30", display: "block", borderRadius: 3 }} /><i style={{ width: 24, height: 14, background: "#c0c1ff", display: "block", borderRadius: 3 }} /></span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                  {[["Full Legal Name", "Marcus Alexander Sterling"], ["Student Identification ID", "SIS-2024-9981"], ["Cohort Department", "Computer Science & Engineering"], ["Term Status", "✓ Full-Time Matriculated"]].map(([k, v], i) => (
                    <div key={k} className="col" style={{ gap: 6 }}>
                      <span className="xs muted">{k}</span>
                      <div style={{ padding: 8, background: "#0b0e14", border: "1px solid #272a30", fontSize: 13, color: i === 3 ? "#a8c3ff" : "var(--text)" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="row" aria-hidden="true" style={{ position: "absolute", right: 14, bottom: 14, gap: 8, pointerEvents: "none" }}>
                  <button className="btn" tabIndex={-1}>Cancel</button>
                  <button className="btn btn-primary" tabIndex={-1} style={{ boxShadow: "0 0 0 2px rgba(192,193,255,.35)" }}>Save Record</button>
                  <span className="badge" style={{ position: "absolute", right: -6, top: -26, background: "#571bc1", color: "#e9ddff", fontSize: 10, whiteSpace: "nowrap" }}>target: [data-action="save-student"]</span>
                  <svg ref={pointerRef} className="cursor-pointer" viewBox="0 0 24 24" style={{ right: -4, top: 4, position: "absolute" }} aria-hidden="true">
                    <path d="M4 3l16 7-7 2-2 7z" fill="#e1e2eb" stroke="#0b0e14" strokeWidth="1.2" />
                  </svg>
                </div>
              </div>
              <div className="row-between xs muted" style={{ marginTop: 10 }}>
                <span className="row" style={{ gap: 5 }}><span className="dot" style={{ color: "#a8c3ff" }} /> VNC Streaming: Latency 14ms</span>
                <span>Chromium V124.0.6367.60 Core</span>
              </div>
            </div>
          </section>

          <section className="card a-up" style={{ borderRadius: 4 }}>
            <div className="card-head" style={{ borderBottom: "1px solid rgba(70,69,84,.5)" }}>
              <div className="card-title"><Icon n="network" s={16} /> Active Execution Trace</div>
              <span className="badge" style={{ background: "#c0c1ff", color: "#1000a9", borderRadius: 2, fontSize: 10 }}>Step 8 of 9</span>
            </div>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(70,69,84,.5)" }}>
              <div className="row-between xs"><b className="mono" style={{ color: "#c0c1ff" }}>TC-076</b><span>Self-Healing Armed</span></div>
              <h3 style={{ fontSize: 16, marginTop: 6 }}>Verify Student Enrollment Validation</h3>
              <p className="small muted" style={{ marginTop: 4 }}>Flow: SIS Portal &gt; Authentication &gt; Student Directory &gt; Form Validation</p>
            </div>
            <div style={{ padding: "6px 0" }}>
              {data.trace.map(([t, label, ms]) => (
                <div className="trace-row a-log" key={t}>
                  <span className="xs mono faint">{t}</span>
                  <Icon n="check" s={14} style={{ color: "#c7c4d7" }} />
                  <span>{label}</span>
                  <span className="xs mono" style={{ color: "#c7c4d7" }}>{ms}</span>
                </div>
              ))}
              <div className="a-pop" style={{ margin: "4px 8px", padding: "6px 4px", background: "rgba(147,0,10,.35)", border: "1px solid #93000a" }}>
                <div className="trace-row" style={{ padding: "2px 4px" }}>
                  <span className="xs mono" style={{ color: "#ffb4ab" }}>00:18</span>
                  <Icon n="triangle-alert" s={14} style={{ color: "#ffb4ab" }} />
                  <b style={{ fontWeight: 500 }}>Click 'Save Record' button</b>
                  <span className="badge" style={{ background: "#93000a", color: "#ffdad6", fontSize: 10, borderRadius: 2 }}>TIMEOUT (3000ms)</span>
                </div>
                <div className="xs mono" style={{ margin: 4, padding: "4px 6px", background: "#0b0e14", color: "#ffdad6" }}>Failed: selector "button.save-btn" not visible in current DOM.</div>
              </div>
              <div className="trace-row" style={{ opacity: .55 }}>
                <span className="xs mono">00:22</span><Icon n="clock" s={14} /><span>Assert newly added student in directory</span><span className="xs">Queued</span>
              </div>
            </div>
          </section>
        </div>

        {/* Terminal */}
        <section className="card a-up" style={{ borderRadius: 4, overflow: "hidden" }}>
          <div className="row-between" style={{ padding: "8px 12px", borderBottom: "1px solid rgba(70,69,84,.5)" }}>
            <div className="tabs">
              {[["terminal", "Terminal Output (Live)", "square-terminal"], ["failed", `Failed Suites (${data.stats.failed})`, "circle-alert"], ["video", "Full Video Session", "video"], ["network", "Network Waterfall", "chart-no-axes-column"]].map(([k, l, ic]) => (
                <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
                  <Icon n={ic} s={14} /> {l}
                </button>
              ))}
            </div>
            <span className="row" style={{ gap: 10 }}>
              <span className="badge" style={{ background: "rgba(87,27,193,.3)", color: "#d0bcff", borderRadius: 2, fontSize: 10 }}><span className="dot live" /> AI Agent: Self-Healing Active</span>
              <Icon n="list-filter" s={14} />
            </span>
          </div>
          <div className="term" ref={termRef} style={{ minHeight: 210 }}>
            {tab === "terminal" && data.logs.map((l, i) => {
              if (l.lvl === "WARN") return <div key={i} className="term-line warn a-log">[{l.t}] <b>WARN</b>: {l.msg}</div>;
              if (l.lvl === "AI_HEAL") return (
                <div key={i} className="term-line heal a-log">
                  <span>[{l.t}] <b style={{ color: "#c0c1ff" }}>AI_HEAL</b>: {l.msg}</span>
                  <span className="badge" style={{ background: "#571bc1", color: "#e9ddff", fontSize: 10, alignSelf: "center" }}>HOT-PATCHED</span>
                </div>
              );
              if (l.lvl === "RESUME") return <div key={i} className="term-line a-log row" style={{ gap: 6 }}><Icon n="refresh-cw" s={12} /> [{l.t}] <b>RESUME</b> : {l.msg}</div>;
              return <div key={i} className="term-line a-log">[{l.t}] <span style={{ color: "#c0c1ff" }}>{l.lvl}</span>: {l.msg}</div>;
            })}
            {tab === "failed" && ["TC-042: OAuth Token Expiry — 401 after refresh", "TC-055: File Upload Boundary — 500MB limit not enforced", "TC-061: Grade Export CSV — column order mismatch", "TC-076: Verify Student Enrollment — selector timeout (healing)"].map(t => (
              <div key={t} className="term-line" style={{ color: "#ffb4ab" }}>✗ {t}</div>
            ))}
            {tab === "video" && <div className="muted">Session recording (04m 18s) will be available when the run completes.</div>}
            {tab === "network" && [["GET /login", 312, 200], ["POST /api/auth", 186, 200], ["GET /dashboard", 240, 200], ["GET /api/students", 410, 200], ["POST /api/students", 3000, "timeout"]].map(([u, ms, st]) => (
              <div key={u} className="row" style={{ gap: 10 }}>
                <span style={{ width: 160 }}>{u}</span>
                <span style={{ height: 8, width: Math.min(ms / 8, 380), background: st === 200 ? "#c0c1ff" : "#ffb4ab", display: "inline-block", borderRadius: 2 }} />
                <span className="faint">{ms}ms · {st}</span>
              </div>
            ))}
          </div>
          <div className="row-between" style={{ padding: "10px 12px", borderTop: "1px solid rgba(70,69,84,.5)", gap: 12, flexWrap: "wrap" }}>
            <span className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <Icon n="bug" s={14} style={{ color: "#ffb68b" }} /> <span>Quick Inspect Triage:</span>
              {data.triage.map(t => <span key={t} className="badge" style={{ background: "#93000a", color: "#ffdad6", borderRadius: 2 }}>{t}</span>)}
            </span>
            <button className="btn btn-primary" onClick={(e) => act(() => API.createJira(data.triage), e)}>Generate Jira Tickets <Icon n="arrow-right" s={14} /></button>
          </div>
        </section>
      </div>
    );
  };

  return (
    <DarkShell active="Test Runs">
      <main className="page" ref={ref}>{body()}</main>
    </DarkShell>
  );
}

/* Ticking mm:ss clock for the live run */
function LiveClock({ start, paused }) {
  const [s, setS] = useState(start);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setS(v => v + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return <span className="mono">{mm}m {ss}s</span>;
}

window.DarkRuns = DarkRuns;
