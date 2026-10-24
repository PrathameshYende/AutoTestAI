/* Figma: "AutoTestAI - Create Test & Analysis" (1:4680) */
function LightCreate() {
  const { data, loading, error } = useApi(() => API.getQaCreate());
  const ref = usePageAnim(!!data);
  const act = useAction();
  const toast = useToast();
  const [runner, setRunner] = useState("Playwright");
  const [checks, setChecks] = useState([true, true, true, true, true]);
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [pct, setPct] = useState(94);
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  // Detection progress creeps toward 100% while on screen.
  useEffect(() => {
    if (!data) return;
    const id = setInterval(() => setPct(p => (p < 99 ? p + 1 : p)), 2500);
    return () => clearInterval(id);
  }, [data]);
  // Vision bounding box pulses on the live canvas.
  useEffect(() => {
    if (!data || !boxRef.current) return;
    const tw = window.gsap.to(boxRef.current, { boxShadow: "0 0 0 6px rgba(37,99,235,.25)", duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut" });
    return () => tw.kill();
  }, [data]);

  if (loading) return <LightShell active="Recordings"><main className="page"><PageLoading /></main></LightShell>;
  if (error) return <LightShell active="Recordings"><main className="page"><ErrorBox error={error} /></main></LightShell>;

  const f = file ? { name: file.name, size: `${(file.size / 1048576).toFixed(1)} MB`, res: "pending", codec: file.type || "video", dur: "--:--" } : data.file;
  const activeCount = checks.filter(Boolean).length;

  return (
    <LightShell active="Recordings">
      <main className="page" ref={ref}>
        <div className="page-inner" style={{ gap: 20 }}>
          <div className="a-up">
            <div className="row-between">
              <div className="row" style={{ gap: 10 }}>
                <a href="#/light/dashboard" className="row" style={{ gap: 6, color: "#434655" }}><Icon n="arrow-left" s={14} /> Back to Tests</a>
                <span className="crumb-sep">/</span>
                <span className="badge b-blue" style={{ fontSize: 10 }}>JOB #AR-8902</span>
              </div>
              <span className="badge b-gray" style={{ fontSize: 11 }}><span className="dot" style={{ color: "#006b2c" }} /> Cluster ID: worker-node-04a (US-East)</span>
            </div>
            <h1 className="l-title" style={{ marginTop: 16, fontSize: 28 }}>Create New Test</h1>
            <p className="l-sub" style={{ marginTop: 6 }}>Upload a recording and let AutoTestAI understand the application workflow, detect UI elements, and generate Playwright test cases.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 388px", gap: 24, alignItems: "start" }} className="split-2">
            <div className="col" style={{ gap: 24 }}>
              {/* Ingestion */}
              <section className="card a-up" style={{ padding: 20 }}>
                <div className="row-between">
                  <span className="label">Artifact Ingestion</span>
                  <span className="xs muted">Chunked S3 Multi-part Enabled</span>
                </div>
                <div
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); e.dataTransfer.files[0] && setFile(e.dataTransfer.files[0]); }}
                  style={{ marginTop: 16, padding: "24px 16px", background: drag ? "#e5eeff" : "#f8f9ff", border: `1px dashed ${drag ? "#2563eb" : "transparent"}`, borderRadius: 6, textAlign: "center", transition: "all .2s" }}
                >
                  <div className="a-pop" style={{ width: 48, height: 48, margin: "0 auto", borderRadius: 8, background: "#dce9ff", color: "#2563eb", display: "grid", placeItems: "center" }}><Icon n="upload" s={22} /></div>
                  <p style={{ marginTop: 16, fontSize: 14 }}>Drop your screen recording here or <a href="#" onClick={e => { e.preventDefault(); inputRef.current.click(); }} style={{ color: "#2563eb" }}>browse files</a></p>
                  <p className="xs muted" style={{ marginTop: 4 }}>Supported formats: MP4 · MOV · WebM (Max 500MB)</p>
                  <input ref={inputRef} type="file" accept="video/*" hidden onChange={e => e.target.files[0] && setFile(e.target.files[0])} />
                </div>
                <div className="row a-up" style={{ marginTop: 16, padding: 14, background: "#eff4ff", borderRadius: 6, gap: 12 }}>
                  <div style={{ width: 54, height: 38, borderRadius: 4, background: "#1e2a3b", color: "#fff", display: "grid", placeItems: "center", position: "relative" }}>
                    <Icon n="circle-play" s={18} />
                    <span style={{ position: "absolute", right: 2, bottom: 0, fontSize: 8 }}>{f.dur}</span>
                  </div>
                  <div className="grow">
                    <div className="row" style={{ gap: 8, flexWrap: "nowrap", minWidth: 0 }}><b style={{ fontWeight: 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.name}>{f.name}</b><span className="badge b-pass" style={{ fontSize: 9, flexShrink: 0 }}><span className="dot" /> Verified</span></div>
                    <div className="xs muted" style={{ marginTop: 2 }}>{f.size} &nbsp;•&nbsp; {f.res} &nbsp;•&nbsp; {f.codec}</div>
                  </div>
                  <button className="btn" onClick={() => inputRef.current.click()}>Replace</button>
                  <button className="icon-btn" aria-label="Remove recording" onClick={() => setFile(null)}><Icon n="trash-2" s={16} /></button>
                </div>
              </section>

              {/* Execution context */}
              <section className="card a-up" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16 }}>Execution Context</h3>
                <p className="small muted" style={{ fontSize: 13, marginTop: 4 }}>Define target project namespace, endpoint URL, and driver runner preferences.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 16px", marginTop: 20 }}>
                  <div className="col" style={{ gap: 8 }}>
                    <span className="label">Target Project</span>
                    <div className="input" style={{ justifyContent: "space-between" }}><select defaultValue="smp" style={{ fontSize: 14 }}><option value="smp">Student Management Portal</option><option>Billing &amp; Checkout</option></select></div>
                  </div>
                  <div className="col" style={{ gap: 8 }}>
                    <span className="label">Application Base URL</span>
                    <div className="input" style={{ background: "#fff", border: "1px solid rgba(195,198,215,.7)", justifyContent: "space-between" }}>
                      <input className="mono" defaultValue="https://app.studentportal.demo/login" style={{ fontSize: 11 }} />
                      <Icon n="circle-check" s={15} style={{ color: "#006b2c" }} />
                    </div>
                  </div>
                  <div className="col" style={{ gap: 8 }}>
                    <span className="label">Emulation Engine</span>
                    <div className="input"><select style={{ fontSize: 14 }}><option>Chromium (Headless · 1920×1080)</option><option>Firefox (Headless)</option><option>WebKit</option></select></div>
                  </div>
                  <div className="col" style={{ gap: 8 }}>
                    <span className="label">Target Runner Framework</span>
                    <div className="seg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: 36 }}>
                      {["Playwright", "Selenium"].map(r => (
                        <button key={r} className={runner === r ? "active" : ""} onClick={() => setRunner(r)} style={{ fontSize: 13, color: runner === r ? "#2563eb" : "#0b1c30", fontWeight: runner === r ? 600 : 400 }}>
                          {runner === r && <span className="dot" style={{ marginRight: 6, verticalAlign: 2 }} />}{r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="row-between" style={{ marginTop: 28 }}>
                  <span className="label">Neural Processing &amp; Heuristics</span>
                  <span className="xs" style={{ color: "#2563eb" }}>All {activeCount} models active</span>
                </div>
                <div className="col" style={{ gap: 8, marginTop: 12 }}>
                  {data.heuristics.map(([t, s], i) => (
                    <label key={t} className="row a-left" style={{ gap: 14, padding: "12px 10px", background: "#f8f9ff", border: "1px solid rgba(195,198,215,.35)", borderRadius: 4, alignItems: "flex-start", cursor: "pointer" }}>
                      <span style={{ marginTop: 2 }}><Check on={checks[i]} onClick={() => setChecks(c => c.map((v, j) => j === i ? !v : v))} /></span>
                      <span><b style={{ fontWeight: 500 }}>{t}</b><br /><span className="muted" style={{ fontSize: 13 }}>{s}</span></span>
                    </label>
                  ))}
                </div>
                <div className="row-between" style={{ marginTop: 24 }}>
                  <button className="btn btn-ghost" style={{ border: 0 }} onClick={() => toast("Draft saved.")}>Save Draft</button>
                  <button className="btn btn-primary btn-lg" onClick={(e) => act(() => API.analyzeQa({ runner, models: checks }), e).then(() => setTimeout(() => go("/light/workflow"), 900))}>
                    Analyze Recording &amp; Generate Tests <Icon n="arrow-right" s={15} />
                  </button>
                </div>
              </section>
            </div>

            <div className="col" style={{ gap: 20 }}>
              {/* Progress */}
              <section className="card a-up" style={{ padding: 20 }}>
                <div className="row-between">
                  <span className="xs mono" style={{ color: "#2563eb", letterSpacing: ".06em" }}>STAGE 3 OF 6 IN PROGRESS</span>
                  <span className="badge b-blue" style={{ fontWeight: 600 }}><span className="dot live" /> {pct}%</span>
                </div>
                <h3 style={{ fontSize: 17, marginTop: 8, lineHeight: "22px" }}>Analyzing<br />Recording</h3>
                <p className="xs muted mono" style={{ marginTop: 6 }}>recording_student_login_and_cre</p>
                <div className="hbar" style={{ marginTop: 16 }}><i className="a-fill" style={{ width: `${Math.round(pct * 0.5)}%`, background: "#2563eb", transition: "width .6s" }} /></div>
                <div className="col" style={{ gap: 4, marginTop: 18 }}>
                  {data.stages.map((s, i) => (
                    <div key={s.t} className={`l-step a-up ${s.state === "active" ? "active" : ""}`}>
                      <span className="l-check" style={s.state === "done" ? { background: "#e3f6e8", color: "#006b2c" } : s.state === "active" ? { background: "#2563eb", color: "#fff" } : { background: "#eff4ff", color: "#737686", fontSize: 10 }}>
                        {s.state === "done" ? <Icon n="check" s={13} sw={2.5} /> : s.state === "active" ? <Icon n="loader-circle" s={14} className="spin" /> : i + 1}
                      </span>
                      <div className="grow">
                        <div className="row-between">
                          <span className="row" style={{ gap: 8, fontWeight: 500, color: s.state === "queued" ? "#434655" : "#0b1c30" }}>{s.t}
                            {s.state === "done" && <span className="xs mono" style={{ color: "#006b2c" }}>COMPLETED</span>}</span>
                          {s.state === "active" && <span className="xs mono" style={{ color: "#2563eb" }}>{pct}%</span>}
                        </div>
                        <div className="xs muted" style={{ marginTop: 2 }}>{s.s}</div>
                        {s.state === "active" && <div className="hbar" style={{ marginTop: 8, height: 3 }}><i style={{ width: `${pct}%`, background: "#2563eb", transition: "width .6s" }} /></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Live vision canvas */}
              <section className="card a-up" style={{ padding: 16 }}>
                <div className="row-between">
                  <span className="row" style={{ gap: 8 }}><span className="label">Live Vision Canvas</span><span className="badge b-pass" style={{ fontSize: 10 }}>FRAME #104</span></span>
                  <span className="xs muted">1920x1080 @ 00:18.51s</span>
                </div>
                <div style={{ marginTop: 12, background: "#1e2a3b", borderRadius: 4, padding: 12, position: "relative", height: 190 }}>
                  <div className="row-between"><span className="row" style={{ gap: 6 }}><i style={{ width: 9, height: 9, borderRadius: "50%", background: "#8fa0b8" }} /><i style={{ width: 110, height: 6, background: "#5d6b80", display: "block" }} /></span><span className="row" style={{ gap: 6 }}><i style={{ width: 46, height: 6, background: "#5d6b80", display: "block" }} /><i style={{ width: 46, height: 6, background: "#5d6b80", display: "block" }} /></span></div>
                  <div style={{ position: "absolute", left: 82, right: 82, top: 40 }}>
                    <span className="badge" style={{ position: "absolute", right: 0, top: -14, background: "#2563eb", color: "#fff", fontSize: 8, padding: "0 4px" }}>input: 99%</span>
                    <div style={{ height: 26, background: "#3f4d63", border: "1px solid #8fa0b8", fontSize: 10, color: "#e6edf7", padding: "6px 8px" }} className="mono">admin@portal.edu</div>
                    <div style={{ height: 26, background: "#5d6b80", marginTop: 8, padding: "4px 8px", color: "#fff", fontSize: 10 }}>••••••••••••</div>
                    <span className="badge" style={{ position: "absolute", left: 0, top: 64, background: "#2563eb", color: "#fff", fontSize: 8, padding: "0 4px", zIndex: 2 }}><span className="dot" /> button#login-btn: 98%</span>
                    <div ref={boxRef} style={{ height: 30, background: "#0b3fb8", border: "2px solid #2563eb", marginTop: 10, color: "#fff", display: "grid", placeItems: "center", fontSize: 12 }}>Sign In to Portal</div>
                    <span className="xs mono" style={{ position: "absolute", right: 0, bottom: -16, color: "#c9d6ea", fontSize: 9 }}>click(x=960, y=540)</span>
                  </div>
                  <div className="row-between" style={{ position: "absolute", left: 12, right: 12, bottom: 10, fontSize: 10, color: "#8fa0b8" }}>
                    <span>OCR: 14 matches</span><span>Bounding Box IoU: 0.94</span><span>Inference: 18ms</span>
                  </div>
                </div>
              </section>

              {/* stdout */}
              <section className="l-console a-up">
                <div className="row-between" style={{ padding: "14px 16px 6px" }}>
                  <span className="row xs" style={{ gap: 8, fontWeight: 600, color: "#fff" }}><span className="dot live" style={{ color: "#4ade80" }} /> worker-04a :: stdout</span>
                  <span className="xs" style={{ color: "#8fa0b8" }}>Python v3.11 · CUDA 12.2</span>
                </div>
                <div className="col" style={{ gap: 8, padding: "8px 16px 16px", fontSize: 11, lineHeight: "17px" }}>
                  {data.stdout.map((l, i) => <div key={i} className="a-log mono" style={{ color: l.c === "ok" ? "#4ade80" : "#c9d6ea" }}>{l.t}</div>)}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </LightShell>
  );
}
window.LightCreate = LightCreate;
