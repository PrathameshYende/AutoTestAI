/* Figma: "AI Workflow Builder — AutoTestAI" (1:1929) */
function DarkWorkflow() {
  const { data, loading, error } = useApi(() => API.getWorkflow("WF-014"));
  const ref = usePageAnim(!!data);
  const [sel, setSel] = useState("04");
  const [zoom, setZoom] = useState(100);
  const toast = useToast();
  const act = useAction();
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) window.Anim.staggerIn(panelRef.current.querySelectorAll(".sel-anim"));
  }, [sel]);

  if (loading) return <DarkShell active="Workflows"><main className="page"><PageLoading /></main></DarkShell>;
  if (error) return <DarkShell active="Workflows"><main className="page"><ErrorBox error={error} /></main></DarkShell>;

  const node = data.nodes.find(n => n.n === sel) || data.nodes[3];
  const tagStyle = (tone) => tone === "purple"
    ? { background: "#571bc1", color: "#e9ddff" }
    : { background: "#4d8eff", color: "#00285d" };

  return (
    <DarkShell active="Workflows">
      <main className="page" ref={ref}>
        <div className="page-inner">
          <div className="row-between a-up" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="row" style={{ gap: 6, fontSize: 13 }}>
                <span className="muted">Student Management Portal</span><Icon n="chevron-right" s={12} className="muted" />
                <span className="muted">Workflows</span><Icon n="chevron-right" s={12} className="muted" />
                <b style={{ fontSize: 15 }}>{data.title}</b>
              </div>
              <span className="badge b-solid" style={{ marginTop: 10, fontSize: 10, letterSpacing: ".06em" }}>
                <span className="dot live" /> AI LEARNED • 98% CONFIDENCE • READY TO COMPILE
              </span>
            </div>
            <div className="col" style={{ gap: 8, alignItems: "flex-end" }}>
              <div className="row">
                <div className="row card" style={{ padding: "4px 8px", gap: 10, background: "#272a30" }}>
                  <button className="icon-btn" aria-label="Zoom out" onClick={() => setZoom(z => Math.max(50, z - 10))}><Icon n="minus" s={14} /></button>
                  <span className="xs mono" style={{ width: 34, textAlign: "center" }}>{zoom}%</span>
                  <button className="icon-btn" aria-label="Zoom in" onClick={() => setZoom(z => Math.min(150, z + 10))}><Icon n="plus" s={14} /></button>
                  <Icon n="maximize" s={14} /><Icon n="grid-3x3" s={14} />
                </div>
                <button className="btn" onClick={(e) => act(() => API.analyzeRecording({ workflow: "WF-014" }), e)}><Icon n="wand-sparkles" s={14} /> Re-analyze</button>
              </div>
              <div className="row">
                <button className="btn" onClick={() => downloadFile("WF-014.json", JSON.stringify(data, null, 2), "application/json")}><Icon n="download" s={14} /> Export JSON</button>
                <button className="btn btn-primary" onClick={() => go("/dark/test-cases")}><Icon n="zap" s={14} /> Generate Test Cases <Icon n="arrow-right" s={14} /></button>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 316px", gap: 12, alignItems: "start" }} className="split-2">
            {/* Canvas */}
            <section className="wf-canvas a-fade" style={{ minHeight: 840 }}>
              <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", transition: "transform .3s" }}>
                {data.nodes.map((n, i) => (
                  <div key={n.n}>
                    {i > 0 && <div className="wf-link a-fade" />}
                    <div className={`wf-node a-up ${sel === n.n ? "sel" : ""}`} onClick={() => setSel(n.n)}>
                      {sel === n.n && (
                        <>
                          <span style={{ position: "absolute", left: -9, top: "50%", marginTop: -8, width: 16, height: 16, borderRadius: "50%", background: "#c0c1ff", color: "#1000a9", display: "grid", placeItems: "center" }}><Icon n="play" s={8} /></span>
                          <span className="row" style={{ position: "absolute", right: 8, top: -12, gap: 10, padding: "4px 8px", background: "#1d2026", border: "1px solid #464554" }}>
                            <Icon n="pencil" s={12} /><Icon n="circle-plus" s={12} /><Icon n="trash-2" s={12} />
                          </span>
                        </>
                      )}
                      <div className="row-between">
                        <div className="row" style={{ gap: 8 }}>
                          <span className="wf-tag" style={tagStyle(n.tone)}>{n.kind === "CLICK ACTION" && <Icon n="mouse-pointer-click" s={10} style={{ marginRight: 4, verticalAlign: -1 }} />}{n.n} • {n.kind}</span>
                          <b style={{ fontSize: 15, fontWeight: 500, color: sel === n.n ? "#c0c1ff" : "#e1e2eb" }}>{n.title}</b>
                        </div>
                        <span className="badge" style={{ background: "#0b0e14", color: "#e1e2eb", fontSize: 10 }}><span className="dot" style={{ color: "#c0c1ff" }} /> {n.conf} conf</span>
                      </div>
                      <div className="row" style={{ gap: 4, marginTop: 8 }}>
                        {n.url ? (
                          <div className="wf-field row-between" style={{ display: "flex" }}>
                            <span className="row" style={{ gap: 8 }}><Icon n="globe" s={13} /><b>{n.url}</b></span><span className="xs">{n.ms}</span>
                          </div>
                        ) : n.fields.map(([k, v]) => (
                          <div className="wf-field" key={k}>{k} <b>{v}</b></div>
                        ))}
                        {n.terminal && <span className="xs" style={{ color: "#a8c3ff", whiteSpace: "nowrap", marginLeft: 6 }}>Terminal Step</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ position: "absolute", left: 16, bottom: 16, width: 160, padding: 8, background: "#191c22" }}>
                <div className="row-between xs muted"><span>CANVAS MAP</span><Icon n="grid-3x3" s={11} /></div>
                <div style={{ marginTop: 6, background: "#272a30", padding: 10, display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                  {[48, 64, 58, 70, 60, 50].map((w, i) => <i key={i} style={{ width: w, height: 3, background: i === 3 ? "#c0c1ff" : "#464554", display: "block" }} />)}
                </div>
              </div>
            </section>

            {/* Telemetry panel */}
            <aside className="card card-pad a-up" ref={panelRef} style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 840 }}>
              <div className="row-between">
                <div className="card-title"><Icon n="radar" s={16} /> AI Vision &amp; Telemetry</div>
                <span className="badge b-solid" style={{ fontSize: 10 }}>LIVE PARSER</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {data.telemetry.map(([k, v]) => (
                  <div key={k} style={{ background: "#272a30", padding: "8px 8px 10px" }}>
                    <div className="xs muted">{k}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{typeof v === "number" ? <Counter value={v} /> : v}</div>
                  </div>
                ))}
              </div>
              <div className="row-between xs"><span className="upper muted">Selected Step Target</span><span>Node {node.n} • {node.kind === "CLICK ACTION" ? "Click Button" : node.title}</span></div>
              <div className="sel-anim" style={{ height: 120, background: "#0b0e14", position: "relative", overflow: "hidden", border: "1px solid #272a30" }}>
                <div style={{ position: "absolute", left: 30, right: 30, top: 24, bottom: 24, background: "rgba(39,42,48,.8)", border: "1px solid #464554" }} />
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", padding: "8px 30px", borderRadius: 20, background: "linear-gradient(180deg,#9f6bd8,#7a45b8)", border: "2px solid #d0bcff", color: "#fff", fontSize: 16, fontWeight: 500, boxShadow: "0 0 30px rgba(208,188,255,.4)" }}>
                  {node.kind === "CLICK ACTION" ? "Log In" : node.title.split(" ").slice(0, 2).join(" ")}
                </div>
                <span className="badge" style={{ position: "absolute", right: 34, top: 28, background: "#c0c1ff", color: "#1000a9", fontSize: 10 }}>#btn:login</span>
                <span className="xs" style={{ position: "absolute", left: 12, bottom: 6, background: "#0b0e14", padding: "2px 4px" }}>Snapshot #rec_398a</span>
              </div>
              <div className="col sel-anim" style={{ gap: 6 }}>
                <div className="row-between xs"><span>Primary Playwright Locator</span><span style={{ color: "#a8c3ff" }}>Resilient (99.8%)</span></div>
                <div className="mono small" style={{ background: "#0b0e14", padding: "10px", border: "1px solid #272a30" }}>page.get_by_role("button", name="Login")</div>
              </div>
              <div className="col sel-anim" style={{ gap: 4 }}>
                <span className="xs muted">Self-Healing Fallbacks</span>
                {data.fallbacks.map(([l, t]) => (
                  <div key={l} className="row-between mono small" style={{ background: "#272a30", padding: "9px 8px" }}><span>{l}</span><span className="xs muted">{t}</span></div>
                ))}
              </div>
              <div className="col sel-anim" style={{ gap: 4 }}>
                <span className="xs muted">DOM Attributes &amp; Semantics</span>
                <div style={{ background: "#0b0e14", padding: 8, border: "1px solid #272a30" }}>
                  {data.attrs.map(([k, v]) => <div key={k} className="row-between xs" style={{ padding: "3px 0" }}><span className="muted">{k}</span><span>{v}</span></div>)}
                </div>
              </div>
              <div style={{ marginTop: "auto" }} className="col">
                <button className="btn btn-lg" style={{ justifyContent: "center", marginBottom: 6 }} onClick={() => toast(`Assertion added to step ${node.n}: element is visible.`)}><Icon n="circle-check-big" s={15} /> Add Manual Assertion</button>
                <button className="btn btn-lg btn-primary" style={{ justifyContent: "center" }} onClick={() => go("/dark/test-cases")}><Icon n="play" s={14} /> Generate Test Cases Now</button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </DarkShell>
  );
}
window.DarkWorkflow = DarkWorkflow;
