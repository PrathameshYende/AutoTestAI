/* Figma: "Automation Scripts — AutoTestAI" (1:2485) */
const SCRIPT_LINES = [
  [1, [["k", "import"], ["", " pytest"]]],
  [2, [["k", "from"], ["", " playwright.sync_api "], ["k", "import"], ["", " Page, expect"]]],
  [3, []],
  [4, [["c", "# @ai-generated: AutoTestAI v2.4 (Model: Vision-CodeGen-v3)"]]],
  [5, [["c", "# @confidence: 0.97 | self_healing: True"]]],
  [6, [["k", "def "], ["f", "test_student_registration_workflow"], ["", "(page: Page):"]]],
  [7, [["c", "    # Step 1: Navigate to application"]]],
  [8, [["", "    page.goto("], ["s", "\"https://staging.studentportal.io/login\""], ["", ")"]]],
  [9, [["", "    expect(page).to_have_title("], ["s", "\"Student Portal - Login\""], ["", ")"]]],
  [10, []],
  [11, [["c", "    # Step 2: Authenticate with test credentials"]]],
  [12, [["", "    page.get_by_label("], ["s", "\"Username\""], ["", ").fill("], ["s", "\"sarah.jenkins@test.edu\""], ["", ")"]]],
  [13, [["", "    page.get_by_label("], ["s", "\"Password\""], ["", ").fill(pytest.TEST_PASSWORD)"]]],
  [14, [["", "    page.get_by_role("], ["s", "\"button\""], ["", ", name="], ["s", "\"Login\""], ["", ").click()"]], "hl", "insight"],
  [15, []],
  [16, [["c", "    # Step 3: Verify dashboard transition"]]],
  [17, [["", "    expect(page.get_by_role("], ["s", "\"heading\""], ["", ", name="], ["s", "\"Dashboard\""], ["", ")).to_be_visible(timeout=5000)"]]],
  [18, []],
  [19, [["c", "    # Step 4: Open Student Management module"]]],
  [20, [["", "    page.get_by_role("], ["s", "\"link\""], ["", ", name="], ["s", "\"Student Management\""], ["", ").click()"]]],
  [21, [["", "    page.get_by_role("], ["s", "\"button\""], ["", ", name="], ["s", "\"+ Add Student\""], ["", ").click()"]]],
  [22, []],
  [23, [["c", "    # Step 5: Fill new student record"]]],
  [24, [["", "    modal = page.locator("], ["s", "\"[role='dialog']\""], ["", ")"]]],
  [25, [["", "    modal.get_by_label("], ["s", "\"First Name\""], ["", ").fill("], ["s", "\"Alex\""], ["", ")"]]],
  [26, [["", "    modal.get_by_label("], ["s", "\"Last Name\""], ["", ").fill("], ["s", "\"Rivera\""], ["", ")"]]],
  [27, [["", "    modal.get_by_label("], ["s", "\"Enrollment ID\""], ["", ").fill("], ["s", "\"STU-2025-089\""], ["", ")"]]],
  [28, [["", "    modal.get_by_role("], ["s", "\"button\""], ["", ", name="], ["s", "\"Save Record\""], ["", ").click()"]], "hl2", "guard"],
  [29, []],
  [30, [["c", "    # Step 6: Assert student presence in list"]]],
  [31, [["", "    expect(page.locator("], ["s", "\"table.students\""], ["", ")).to_contain_text("], ["s", "\"Alex Rivera\""], ["", ")"]]]
];

function DarkScripts() {
  const { data, loading, error } = useApi(() => API.getScript("TC-001"));
  const ref = usePageAnim(!!data);
  const act = useAction();
  const toast = useToast();
  const [fw, setFw] = useState("Playwright");
  const [file, setFile] = useState("test");
  const [target, setTarget] = useState("local");
  const [showDiff, setShowDiff] = useState(false);

  if (loading) return <DarkShell active="Automation Scripts"><main className="page"><PageLoading /></main></DarkShell>;
  if (error) return <DarkShell active="Automation Scripts"><main className="page"><ErrorBox error={error} /></main></DarkShell>;

  const copy = () => {
    const text = SCRIPT_LINES.map(([, toks]) => toks.map(t => t[1]).join("")).join("\n");
    navigator.clipboard && navigator.clipboard.writeText(text).then(() => toast("Script copied to clipboard"), () => toast("Clipboard not available"));
  };

  return (
    <DarkShell active="Automation Scripts">
      <main className="page" ref={ref}>
        <div className="page-inner">
          {/* Toolbar */}
          <section className="card a-up" style={{ padding: "12px 12px", background: "#191c22" }}>
            <div className="row" style={{ gap: 14, flexWrap: "wrap" }}>
              <span className="row" style={{ gap: 6 }}>
                <Icon n="square-terminal" s={14} /> <span className="muted">Automation Scripts</span> / <span className="muted">Student Portal</span> /
                <b className="mono" style={{ fontSize: 12 }}>test_student_registration.py</b><span className="dot" style={{ color: "#c0c1ff" }} />
              </span>
              <div className="seg">
                {["Playwright", "Selenium", "Cypress"].map(f => (
                  <button key={f} className={fw === f ? "active" : ""} onClick={() => setFw(f)} style={fw === f ? { background: "#571bc1", color: "#e9ddff" } : null}>
                    {f === "Playwright" && <Icon n="zap" s={10} style={{ marginRight: 3, verticalAlign: -1 }} />}{f}
                  </button>
                ))}
              </div>
              <span className="btn btn-sm mono" style={{ fontSize: 11 }}>Python 3.12 (pytest-playwright) <Icon n="chevrons-up-down" s={11} /></span>
            </div>
            <div className="row" style={{ gap: 6, marginTop: 10 }}>
              <span className="xs row" style={{ gap: 5, color: "#a8c3ff", marginRight: 12 }}><span className="dot" /> 97% Locator Confidence <span className="dot" style={{ marginLeft: 6 }} /> Self-Healing On</span>
              <button className="btn btn-sm btn-ghost" onClick={copy}><Icon n="copy" s={13} /> Copy Code</button>
              <button className="btn btn-sm btn-ghost" onClick={() => downloadFile("test_student_registration.py", SCRIPT_LINES.map(([, toks]) => toks.map(t => t[1]).join("")).join("\n"), "text/x-python")}><Icon n="download" s={13} /> .py</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowDiff(true)}><Icon n="file-diff" s={13} /> Diff</button>
              <button className="btn btn-primary" onClick={(e) => act(() => API.runTests({ script: "TC-001", framework: fw }), e)}><Icon n="play" s={13} /> Run Test Now</button>
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "316px 1fr", gap: 12, alignItems: "start" }} className="split-2">
            {/* Left column */}
            <div className="col" style={{ gap: 12 }}>
              <section className="card card-pad a-up">
                <div className="row-between">
                  <span className="badge" style={{ background: "#4d8eff", color: "#00285d", fontWeight: 600, letterSpacing: ".06em" }}>ACTIVE TEST CASE</span>
                  <span className="xs muted">v2.4 Engine</span>
                </div>
                <h3 style={{ fontSize: 16, marginTop: 10 }}>TC-001: Login and Register New Student</h3>
                <p className="muted small" style={{ fontSize: 13, marginTop: 6, lineHeight: "18px" }}>End-to-end user path verifying role access authentication, modal form mutation, and DOM table presence.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, marginTop: 12, padding: 8, background: "#0b0e14", border: "1px solid #272a30" }}>
                  {[["Framework", "Playwright"], ["Assertions", "4 Auto-Wait"], ["Resilience", "Tier-1 SLA"]].map(([k, v], i) => (
                    <div key={k}><div className="xs muted">{k}</div><div className="small" style={{ color: i === 1 ? "#a8c3ff" : i === 2 ? "#c0c1ff" : "#e1e2eb", fontWeight: i === 2 ? 600 : 400 }}>{v}</div></div>
                  ))}
                </div>
              </section>

              <section className="card card-pad a-up">
                <div className="row-between" style={{ marginBottom: 12 }}>
                  <div className="card-title" style={{ fontSize: 14 }}><Icon n="target" s={15} /> Target UI Locators</div>
                  <span className="badge b-gray">4 Synced</span>
                </div>
                <div className="col" style={{ gap: 4 }}>
                  {data.locators.map(l => (
                    <div key={l.loc} className="a-left" style={{ padding: "8px 8px", background: l.healed ? "#0b0e14" : "#191c22", border: "1px solid rgba(70,69,84,.45)" }}>
                      <div className="row-between">
                        <span className="mono" style={{ fontSize: 11, color: l.healed ? "#e1e2eb" : "#c0c1ff" }}>{l.loc}</span>
                        <span className="badge" style={l.healed ? { background: "#571bc1", color: "#e9ddff", fontSize: 10 } : { background: "#272a30", color: "#a8c3ff", fontSize: 10 }}>
                          {l.healed ? <Icon n="wand-sparkles" s={10} /> : <span className="dot" />} {l.conf}
                        </span>
                      </div>
                      <div className="row-between xs muted" style={{ marginTop: 5 }}>
                        <span className="row" style={{ gap: 4 }}>
                          <Icon n={l.healed ? "zap" : "circle-check"} s={11} /> {l.note} {l.legacy && <s style={{ color: "#ffb4ab" }}>{l.legacy}</s>}
                        </span>
                        <span className="mono">{l.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, padding: 10, background: "#272a30" }}>
                  <div className="xs row" style={{ gap: 5, fontWeight: 600 }}><Icon n="lightbulb" s={12} /> AI Script Architect Notes</div>
                  <p className="small" style={{ marginTop: 6, lineHeight: "19px", color: "#c7c4d7" }}>
                    Constructed with standard Playwright Page Object Model conventions. Injected auto-waiting expectation handlers (<span className="mono" style={{ color: "#c0c1ff", fontSize: 11 }}>timeout=5000</span>) to suppress timing drift across multi-tier test pipelines.
                  </p>
                </div>
                <div className="row-between" style={{ marginTop: 10, padding: 10, background: "#0b0e14", border: "1px solid #272a30" }}>
                  <div>
                    <div className="xs muted">Stability Aggregate</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#c0c1ff" }}><Counter value={data.stability.value} decimals={1} suffix="%" /></div>
                  </div>
                  <svg width="130" height="34" viewBox="0 0 130 34">
                    <path className="a-line" d="M2 22 C 20 10, 35 8, 50 16 S 80 30, 95 20 S 110 2, 128 8" fill="none" stroke="#c0c1ff" strokeWidth="2" />
                    <circle cx="128" cy="8" r="3" fill="#c0c1ff" />
                  </svg>
                  <span className="xs">{data.stability.delta}</span>
                </div>
              </section>
            </div>

            {/* Editor */}
            <section className="card editor a-up" style={{ overflow: "hidden" }}>
              <div className="row-between" style={{ background: "#191c22", borderBottom: "1px solid #272a30", paddingRight: 12, flexWrap: "nowrap" }}>
                <div className="row" style={{ gap: 0, minWidth: 0, overflowX: "auto" }}>
                  <button className="tab" onClick={() => setFile("test")} style={{ padding: "12px 16px", borderRadius: 0, background: file === "test" ? "#0b0e14" : "transparent", color: file === "test" ? "#e1e2eb" : undefined, borderTop: file === "test" ? "2px solid #c0c1ff" : "2px solid transparent" }}>
                    <Icon n="code" s={13} /> <span className="mono small">tests/e2e/test_student_flow.py</span> <span className="dot" style={{ color: "#e1e2eb" }} /> <Icon n="x" s={12} />
                  </button>
                  <button className="tab" onClick={() => setFile("pom")} style={{ padding: "12px 16px", borderRadius: 0, background: file === "pom" ? "#0b0e14" : "transparent" }}>
                    <Icon n="braces" s={13} /> <span className="mono small">page_objects/login.py</span>
                  </button>
                </div>
                <span className="xs row muted editor-meta" style={{ gap: 12, flexShrink: 0, paddingLeft: 12 }}>Lines: 42 <span>UTF-8</span> <span className="row" style={{ gap: 4 }}><span className="dot" style={{ color: "#c0c1ff" }} /> Python (Black)</span> <Icon n="maximize-2" s={13} /></span>
              </div>
              <div className="code" style={{ padding: "12px 0" }}>
                {file === "pom" ? (
                  <div style={{ padding: "0 12px" }}>
                    {["class LoginPage:", "    def __init__(self, page):", "        self.page = page", "        self.username = page.get_by_label(\"Username\")", "        self.password = page.get_by_label(\"Password\")", "        self.submit = page.get_by_role(\"button\", name=\"Login\")", "", "    def login(self, user, pwd):", "        self.username.fill(user)", "        self.password.fill(pwd)", "        self.submit.click()"].map((l, i) => (
                      <div key={i} className="a-log"><span className="ln">{i + 1}</span>{l}</div>
                    ))}
                  </div>
                ) : SCRIPT_LINES.map(([n, toks, hl, note]) => (
                  <React.Fragment key={n}>
                    <div className={`code-line a-log ${hl || ""}`}>
                      <span className="ln">{n}</span>
                      <span style={{ whiteSpace: "pre" }}>{toks.map(([k, t], i) => <span key={i} className={k ? `tok-${k}` : ""}>{t}</span>)}</span>
                    </div>
                    {note === "insight" && (
                      <div className="ai-note a-up" style={{ background: "#571bc1", color: "#e9ddff" }}>
                        <div className="row xs" style={{ gap: 6, fontWeight: 600, letterSpacing: ".04em" }}><Icon n="lightbulb" s={14} /> AI INSIGHT • ACCESSIBILITY RESOLUTION</div>
                        <p style={{ marginTop: 4, fontFamily: "Inter", lineHeight: "18px" }}>
                          Used <span className="mono" style={{ background: "#0b0e14", padding: "0 4px", fontSize: 11 }}>get_by_role("button", name="Login")</span> rather than fragile selector <s className="mono" style={{ background: "#93000a", padding: "0 4px", fontSize: 11 }}>#login-btn</s>. This guarantees accessibility compliance and withstands front-end markup refactoring.
                        </p>
                      </div>
                    )}
                    {note === "guard" && (
                      <div className="ai-note a-up" style={{ background: "#272a30", border: "1px solid #464554" }}>
                        <div className="row xs" style={{ gap: 6, fontWeight: 600, letterSpacing: ".04em", color: "#a8c3ff" }}><Icon n="shield" s={14} /> SELF-HEALING GUARD ACTIVE</div>
                        <p style={{ marginTop: 4, fontFamily: "Inter", lineHeight: "18px" }}>
                          Registered 3 redundant fallback locators for the Save button ( <span className="mono" style={{ background: "#0b0e14", padding: "0 4px", fontSize: 11 }}>[data-action="save"]</span> , <span className="mono" style={{ background: "#0b0e14", padding: "0 4px", fontSize: 11 }}>button:has-text("Save")</span> ). If DOM tree alters during test execution, the engine recovers automatically without failure.
                        </p>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </section>
          </div>

          {/* Runner preview */}
          <section className="card row-between a-up" style={{ padding: 14 }}>
            <div className="row" style={{ gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 4, background: "#c0c1ff", color: "#1000a9", display: "grid", placeItems: "center" }}><Icon n="square-terminal" s={20} /></div>
              <div>
                <div className="row" style={{ fontWeight: 500, fontSize: 16 }}>Test Runner Runtime Preview <span className="badge b-blue" style={{ fontSize: 10 }}>Ready</span></div>
                <div className="small muted" style={{ fontSize: 12 }}>Ready to dispatch locally or spin up on AutoTestAI Cloud Grid (Chrome Headless v122).</div>
              </div>
            </div>
            <div className="col" style={{ gap: 8, alignItems: "flex-end" }}>
              <div className="seg">
                <button className={target === "local" ? "active" : ""} onClick={() => setTarget("local")}><Icon n="laptop" s={11} style={{ verticalAlign: -2 }} /> Local Daemon</button>
                <button className={target === "aws" ? "active" : ""} onClick={() => setTarget("aws")}><Icon n="cloud" s={11} style={{ verticalAlign: -2 }} /> AWS Grid (32 nodes)</button>
              </div>
              <button className="btn btn-primary" onClick={(e) => act(() => API.runTests({ script: "TC-001", target }), e).then(() => setTimeout(() => go("/dark/runs"), 900))}>
                <Icon n="circle-play" s={14} /> Execute Suite (⌘Enter)
              </button>
            </div>
          </section>
        </div>
        <Modal open={showDiff} onClose={() => setShowDiff(false)} title="Changes since last generation" width={680}
          footer={<button className="btn" onClick={() => setShowDiff(false)}>Close</button>}>
          <div className="modal-body col" style={{ gap: 12 }}>
            <p className="small muted">The AI replaced a fragile id selector with an accessible role locator on line 14.</p>
            <DiffBlock file="tests/e2e/test_student_flow.py" line={14} before={'page.locator("#login-btn").click()'} after={'page.get_by_role("button", name="Login").click()'} />
          </div>
        </Modal>
      </main>
    </DarkShell>
  );
}
window.DarkScripts = DarkScripts;
