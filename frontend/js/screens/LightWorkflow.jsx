/* Figma: "AutoTestAI - Workflow & Automation Script" (1:6296) */
const LIGHT_SCRIPT = [
  ["k", "import", " pytest"],
  ["k", "from", " playwright.sync_api ", "import", " Page, expect"],
  [],
  ["def", "test_student_login_and_create", "(page: Page):"],
  ["c", "  # 1. Navigate to portal"],
  ["call", "    page.goto(", "\"https://app.studentportal.demo/login\"", ")"],
  [],
  ["c", "  # 2. Authenticate"],
  ["call", "    page.get_by_label(", "\"Username\"", ").fill(", "\"admin_qa\"", ")"],
  ["call", "    page.get_by_label(", "\"Password\"", ").fill(", "\"SecurePass123\"", ")"],
  ["call", "    page.get_by_role(", "\"button\"", ", name=", "\"Login\"", ").click()"],
  [],
  ["c", "  # 3. Assert dashboard"],
  ["call", "  expect(page).to_have_url(", "\"https://app.studentportal.demo/dashboard\"", ")"],
  [],
  ["c", "  # 4. Navigate to student management"],
  ["call", "    page.get_by_role(", "\"link\"", ", name=", "\"Student Management\"", ").click()"],
  ["call", "    page.get_by_role(", "\"button\"", ", name=", "\"Add Student\"", ").click()"],
  [],
  ["c", "  # 5. Fill student details"],
  ["call", "    page.get_by_label(", "\"First Name\"", ").fill(", "\"Jane\"", ")"],
  ["call", "    page.get_by_label(", "\"Last Name\"", ").fill(", "\"Doe\"", ")"],
  ["call", "    page.get_by_role(", "\"button\"", ", name=", "\"Save\"", ").click()"],
  [],
  ["c", "  # 6. Verify toast notification"],
  ["call", "  expect(page.get_by_text(", "\"Student successfully added\"", ")).to_be_visible()"]
];

function renderLightLine(line) {
  if (!line.length) return null;
  const [kind, ...rest] = line;
  if (kind === "c") return <span style={{ color: "#9fb0c8" }}>{rest[0]}</span>;
  if (kind === "k") return rest.map((t, i) => <span key={i} style={{ color: i % 2 === 0 ? "#93c5fd" : "#dbe5f5" }}>{t}</span>);
  if (kind === "def") return <><span style={{ color: "#93c5fd" }}>def </span><b style={{ color: "#86efac", fontWeight: 600 }}>{rest[0]}</b><span>{rest[1]}</span></>;
  return rest.map((t, i) => <span key={i} style={{ color: t.startsWith("\"") ? "#86efac" : "#dbe5f5" }}>{t}</span>);
}

function LightWorkflow() {
  const { data, loading, error } = useApi(() => API.getQaWorkflow("WF-104"));
  const [steps, setSteps] = useState(null);
  const ref = usePageAnim(!!steps);
  const act = useAction();
  const toast = useToast();
  const [focus, setFocus] = useState("04");
  const [type, setType] = useState("All");
  const [lang, setLang] = useState(0);
  const LANGS = [["Playwright", "(Python)"], ["Playwright", "(TypeScript)"], ["Selenium", "(Java)"]];
  const inspectRef = useRef(null);

  useEffect(() => { if (data) setSteps(data.groups); }, [data]);
  useLayoutEffect(() => { if (inspectRef.current) window.Anim.expand(inspectRef.current); }, [focus]);

  if (loading || !steps) return <LightShell active="Workflows" crumbs={["Production - v2.4.1", "Suite Diagnostics"]}><main className="page"><PageLoading /></main></LightShell>;
  if (error) return <LightShell active="Workflows"><main className="page"><ErrorBox error={error} /></main></LightShell>;

  const tests = data.tests.filter(t => type === "All" || t.type === type);
  const focused = steps.flatMap(g => g.steps).find(s => s.n === focus);
  const deleteStep = () => {
    setSteps(gs => gs.map(g => ({ ...g, steps: g.steps.filter(s => s.n !== focus) })));
    toast(`Step ${focus} removed from workflow`);
    setFocus(null);
  };
  const prStyle = { High: ["#ffdad6", "#ba1a1a"], Medium: ["#e5eeff", "#434655"], Critical: ["#ba1a1a", "#fff"] };

  return (
    <LightShell active="Workflows">
      <main className="page" ref={ref} style={{ paddingTop: 8 }}>
        <div className="page-inner" style={{ gap: 20 }}>
          <div className="row-between a-up" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="row xs" style={{ gap: 6, color: "#434655" }}>Workflows <span className="crumb-sep" style={{ fontSize: 11 }}>/</span> Student Portal <span className="crumb-sep" style={{ fontSize: 11 }}>/</span> <span className="badge b-gray" style={{ fontSize: 10 }}>WF-104</span></div>
              <div className="row" style={{ gap: 40, marginTop: 4, alignItems: "flex-start" }}>
                <h1 className="l-title" style={{ fontSize: 20, lineHeight: "28px", maxWidth: 300 }}>Learned Workflow: Student Registration &amp; Login</h1>
                <span className="badge b-pass" style={{ fontSize: 10, marginTop: 6 }}><span className="dot" /> Synced</span>
              </div>
            </div>
            <div className="row">
              <button className="btn btn-lg" style={{ height: 44 }} onClick={() => setLang(l => (l + 1) % LANGS.length)} aria-label={`Output language: ${LANGS[lang].join(" ")}. Click to change.`}><Icon n="code" s={15} /> <span style={{ lineHeight: "15px", textAlign: "left" }}>{LANGS[lang][0]}<br />{LANGS[lang][1]}</span> <Icon n="chevron-down" s={12} /></button>
              <button className="btn btn-lg" style={{ height: 44 }} onClick={() => downloadFile("test_student_registration.py", LIGHT_SCRIPT.map(l => l.slice(1).join("")).join("\n"), "text/x-python")}><Icon n="square-terminal" s={15} /> <span style={{ lineHeight: "15px" }}>Export<br />Code</span></button>
              <button className="btn btn-lg" style={{ height: 44 }} onClick={(e) => act(() => API.runTests({ workflow: "WF-104" }), e)}><Icon n="play" s={13} /> <span style={{ lineHeight: "15px" }}>Run<br />Workflow</span></button>
              <button className="btn btn-primary btn-lg" style={{ height: 44 }} onClick={() => go("/light/test-cases")}><Icon n="sparkles" s={15} /> <span style={{ lineHeight: "15px" }}>Generate Test<br />Cases</span></button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 398px", gap: 16, alignItems: "start" }} className="split-2">
            <div className="col" style={{ gap: 16 }}>
              {/* Learned steps */}
              <section className="card a-up" style={{ padding: 16 }}>
                <div className="row-between">
                  <span className="row l-panel-title" style={{ gap: 8 }}><Icon n="workflow" s={17} style={{ color: "#2563eb" }} /> Learned Workflow Steps</span>
                  <span className="row" style={{ gap: 6 }}><span className="badge b-gray" style={{ fontSize: 10 }}>8 steps detected from recording</span><span className="badge b-pass" style={{ fontSize: 10 }}>98.4% avg conf</span></span>
                </div>
                {steps.map(g => (
                  <div key={g.title} style={{ marginTop: 16, position: "relative", paddingLeft: 18 }}>
                    <span style={{ position: "absolute", left: 2, top: 6, bottom: 0, width: 2, background: "#e5eeff" }} />
                    <span style={{ position: "absolute", left: -1, top: 4, width: 8, height: 8, borderRadius: "50%", background: g.title.startsWith("NODE 1") ? "#2563eb" : "#434655" }} />
                    <div className="label" style={{ fontWeight: 600, letterSpacing: ".08em" }}>{g.title}</div>
                    <div className="col" style={{ gap: 8, marginTop: 10 }}>
                      {g.steps.map(s => (
                        <React.Fragment key={s.n}>
                          <div className="row a-left" onClick={() => setFocus(focus === s.n ? null : s.n)}
                            style={{ gap: 10, rowGap: 6, flexWrap: "wrap", padding: "9px 10px", borderRadius: 4, cursor: "pointer", background: focus === s.n ? "#dce9ff" : "#f8f9ff", border: `1px solid ${focus === s.n ? "rgba(37,99,235,.35)" : "rgba(195,198,215,.35)"}`, transition: "background .2s" }}>
                            {focus === s.n ? <span className="row" style={{ gap: 6 }}><span className="dot" style={{ color: "#2563eb" }} /><span className="badge" style={{ background: "#2563eb", color: "#fff", fontSize: 9, padding: "0 4px" }}>{s.n}</span></span>
                              : <span className="badge b-gray" style={{ fontSize: 10 }}>{s.n}</span>}
                            <b style={{ fontWeight: focus === s.n ? 600 : 500, fontSize: 14, color: focus === s.n ? "#1d4ed8" : "#0b1c30" }}>{s.t}</b>
                            {s.arrow && <Icon n="arrow-right" s={13} className="muted" />}
                            {s.meta && <span className="mono xs" style={{ color: "#2563eb" }}>{s.meta}</span>}
                            {s.sel && <span className="mono xs" style={{ padding: "1px 6px", background: "#eff4ff", border: "1px solid rgba(195,198,215,.6)", color: "#434655" }}>{s.sel}</span>}
                            {s.val && <span className="xs muted">→ <span className="mono" style={{ color: "#0b1c30" }}>{s.val}</span></span>}
                            {s.check && <span className="xs muted row" style={{ gap: 4 }}><Icon n="check" s={11} /> <span className="mono">{s.check}</span></span>}
                            <span style={{ marginLeft: "auto" }} className="row">
                              {focus === s.n && <span className="small" style={{ color: "#1d4ed8", marginRight: 8 }}>Focused Inspector</span>}
                              <span className="badge" style={focus === s.n ? { background: "#2563eb", color: "#fff", fontSize: 10 } : { background: "#e3f6e8", color: "#006b2c", fontSize: 10 }}>{s.conf}</span>
                            </span>
                          </div>
                          {focus === s.n && (
                            <div ref={inspectRef} style={{ overflow: "hidden" }}>
                              <div style={{ padding: 14, background: "#eff4ff", border: "1px solid rgba(195,198,215,.5)", borderRadius: 6 }}>
                                <div className="row-between">
                                  <span className="row" style={{ gap: 6, fontWeight: 600 }}><Icon n="target" s={15} style={{ color: "#2563eb" }} /> Step {s.n} Diagnostics &amp; Locators</span>
                                  <span className="badge b-pass" style={{ fontSize: 10 }}>Confidence: {s.conf}</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 12 }}>
                                  {[["Target Element", s.t.includes("Login") ? "Login Button" : s.t], ["Tag Type", ""], ["Action Type", "click() · Single"], ["Detected Text", "\"Login\""]].map(([k, v]) => (
                                    <div key={k} style={{ background: "#fff", padding: "10px 10px", border: "1px solid rgba(195,198,215,.5)", minHeight: 56 }}>
                                      <div className="xs" style={{ color: "#434655" }}>{k}</div>
                                      <b className="xs" style={{ display: "block", marginTop: 4 }}>{v}</b>
                                    </div>
                                  ))}
                                </div>
                                <div className="label" style={{ marginTop: 14, fontSize: 10 }}>Ranked Fallback Locators</div>
                                <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                                  <span className="mono xs" style={{ padding: "3px 8px", background: "#fff", border: "1px solid rgba(195,198,215,.6)" }}><span className="dot" style={{ color: "#006b2c", marginRight: 4 }} />page.get_by_role("button", name="Login")</span>
                                  <span className="mono xs" style={{ padding: "3px 8px", background: "#fff", border: "1px solid rgba(195,198,215,.6)", color: "#434655" }}>#login-btn</span>
                                  <span className="mono xs" style={{ padding: "3px 8px", background: "#fff", border: "1px solid rgba(195,198,215,.6)", color: "#434655" }}>button.btn-primary</span>
                                </div>
                                <div className="row" style={{ justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                                  <button className="btn btn-sm btn-ghost" style={{ color: "#ba1a1a", border: 0 }} onClick={deleteStep}><Icon n="trash-2" s={13} /> Delete Step</button>
                                  <button className="btn btn-sm" onClick={() => toast(`Step ${s.n} opened for editing.`)}><Icon n="pencil" s={13} /> Edit Step</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              {/* Generated tests */}
              <section className="card a-up" style={{ padding: 16 }}>
                <div className="row-between">
                  <span className="row" style={{ gap: 10 }}>
                    <Icon n="clipboard-check" s={18} style={{ color: "#006b2c" }} />
                    <span className="l-panel-title" style={{ fontSize: 17 }}>Generated Test Cases</span>
                    <span className="badge b-gray" style={{ fontSize: 10 }}>{data.tests.length} Ready</span>
                  </span>
                  <div className="seg">
                    {[["All", 4], ["Functional", 1], ["Negative", 1], ["Boundary", 1], ["Security", null]].map(([t, n]) => (
                      <button key={t} className={type === t ? "active" : ""} onClick={() => setType(t)} style={{ fontSize: 12, padding: "4px 10px" }}>{t}{n !== null && ` (${n})`}</button>
                    ))}
                  </div>
                </div>
                <table className="table" style={{ marginTop: 14 }}>
                  <thead><tr><th>ID</th><th>Test Case</th><th>Type</th><th>Priority</th><th>Steps</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {tests.map(t => (
                      <tr key={t.id} className="row-hover">
                        <td className="mono small" style={{ color: "#2563eb", fontWeight: 600 }}>{t.id}</td>
                        <td style={{ fontSize: 14 }}>{t.name}</td>
                        <td><span className="badge b-gray" style={{ fontSize: 10 }}>{t.type}</span></td>
                        <td><span className="badge" style={{ background: prStyle[t.pr][0], color: prStyle[t.pr][1], fontSize: 10 }}>{t.pr}</span></td>
                        <td className="small muted">{t.steps}</td>
                        <td><span className="badge b-pass" style={{ fontSize: 10 }}><Icon n="circle-check" s={11} /> Ready</span></td>
                        <td><button className="btn btn-sm" onClick={(e) => act(() => API.runTests({ test: t.id }), e)}>Run</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>

            <div className="col" style={{ gap: 12 }}>
              {/* Script panel */}
              <section className="l-dark-panel a-up" style={{ overflow: "hidden", background: "#1e2a3b" }}>
                <div className="row-between" style={{ padding: "16px 0 14px 16px", gap: 8 }}>
                  <span className="row" style={{ gap: 8 }}>
                    <span className="row mono xs" style={{ gap: 6, background: "#2a3a52", padding: "6px 10px", color: "#dbe5f5" }}><Icon n="file-code" s={13} style={{ color: "#86efac" }} /> test_student_registration.py</span>
                    <span className="xs" style={{ background: "#2a3a52", padding: "4px 6px", color: "#c9d6ea", lineHeight: "14px" }}>Python ·<br />Playwright</span>
                    <span className="xs" style={{ background: "#33455e", padding: "4px 6px", color: "#c9d6ea", lineHeight: "14px" }}>AI<br />Generated<br />· 97%<br />Conf</span>
                  </span>
                  <span className="row" style={{ gap: 10 }}>
                    <button className="icon-btn" aria-label="Copy script" style={{ color: "#dbe5f5" }} onClick={() => { navigator.clipboard && navigator.clipboard.writeText(LIGHT_SCRIPT.map(l => l.slice(1).join("")).join("\n")); toast("Script copied"); }}><Icon n="copy" s={14} /></button>
                    <button className="icon-btn" aria-label="Download script" style={{ color: "#dbe5f5" }} onClick={() => downloadFile("test_student_registration.py", LIGHT_SCRIPT.map(l => l.slice(1).join("")).join("\n"), "text/x-python")}><Icon n="download" s={14} /></button>
                    <button className="btn btn-primary btn-sm" style={{ borderRadius: "4px 0 0 4px", height: 32 }} onClick={(e) => act(() => API.runTests({ workflow: "WF-104" }), e)}><Icon n="play" s={11} /> Run Test</button>
                  </span>
                </div>
                <div className="mono" style={{ fontSize: 11, lineHeight: "20px", padding: "10px 0 16px", overflowX: "auto" }}>
                  {LIGHT_SCRIPT.map((line, i) => (
                    <div key={i} className="a-log" style={{ display: "flex", padding: "0 16px", whiteSpace: "pre" }}>
                      <span style={{ color: "#8a9bb5", width: 30, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                      <span>{renderLightLine(line)}</span>
                    </div>
                  ))}
                </div>
                <div className="row xs" style={{ gap: 14, padding: "10px 16px", background: "#18222f", color: "#8fa0b8" }}>
                  <span className="row" style={{ gap: 5 }}><span className="dot" style={{ color: "#4ade80" }} /> Lint: Passed</span>·
                  <span>pytest-playwright</span>·<span>Playwright v1.42</span><span style={{ marginLeft: "auto" }}>UTF-8 &nbsp; LF</span>
                </div>
              </section>

              <section className="card a-up" style={{ padding: 14 }}>
                <div className="row-between">
                  <span className="row" style={{ gap: 6, fontWeight: 600 }}><Icon n="circle-check" s={15} style={{ color: "#006b2c" }} /> AI Self-Healing Strategy Active</span>
                  <span className="badge b-blue" style={{ fontSize: 10 }}>Smart Selector</span>
                </div>
                <p style={{ marginTop: 8, fontSize: 13, color: "#434655", lineHeight: "20px" }}>
                  If dynamic DOM updates alter the Login button locator, <span className="mono xs" style={{ background: "#eff4ff", padding: "1px 4px", color: "#0b1c30" }}>page.get_by_role("button", name="Login")</span> semantic locator without breaking the pipeline.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </LightShell>
  );
}
window.LightWorkflow = LightWorkflow;
