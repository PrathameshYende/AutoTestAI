/* Figma: "AutoTestAI - Failure Analysis & Self-Healing" (1:5146) */
function LightFailure() {
  const { data, loading, error } = useApi(() => API.getFailure("TC-001"));
  const ref = usePageAnim(!!data);
  const act = useAction();
  const toast = useToast();
  const [logPage, setLogPage] = useState(1);
  const [applied, setApplied] = useState(false);
  const deltaRef = useRef(null);

  // Visual-delta box blinks to draw the eye, like the red dashed highlight in the design.
  useEffect(() => {
    if (!data || !deltaRef.current) return;
    const tw = window.gsap.to(deltaRef.current, { opacity: 0.35, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    return () => tw.kill();
  }, [data]);

  if (loading) return <LightShell active="Failures"><main className="page"><PageLoading /></main></LightShell>;
  if (error) return <LightShell active="Failures"><main className="page"><ErrorBox error={error} /></main></LightShell>;

  const applyFix = (e) => act(() => API.applyFix("TC-001"), e).then(() => setApplied(true));

  const LoginMock = ({ label, actual }) => (
    <div className="l-mock-login" style={{ position: "relative" }}>
      <div className="row-between"><b style={{ fontWeight: 500, fontSize: 15 }}>Student Portal Login</b><Icon n="lock" s={14} className="muted" /></div>
      <div className="l-field">alex.chen@university.edu</div>
      <div className="l-field" style={{ letterSpacing: 2 }}>••••••••••</div>
      <div style={{ position: "relative", marginTop: 14 }}>
        <div style={{ height: 28, background: "#2563eb", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, borderRadius: 2 }}>{label}</div>
        {actual && (
          <>
            <div ref={deltaRef} style={{ position: "absolute", inset: -4, border: "2px dashed #ba1a1a", pointerEvents: "none" }} />
            <span className="badge" style={{ position: "absolute", right: -8, top: -14, background: "#ba1a1a", color: "#fff", fontSize: 9, padding: "0 4px" }}>Label Changed: 'Sign In'</span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <LightShell active="Failures">
      <main className="page" ref={ref}>
        <div className="page-inner" style={{ gap: 20 }}>
          {/* Header */}
          <div className="a-up">
            <div className="row xs" style={{ gap: 8, color: "#434655" }}>
              <span>Test Runs</span><span className="crumb-sep" style={{ fontSize: 12 }}>/</span>
              <span className="mono">#TR-1246</span><span className="crumb-sep" style={{ fontSize: 12 }}>/</span>
              <span style={{ color: "#0b1c30", fontWeight: 500 }}>Failure Analysis</span>
            </div>
            <div className="row-between" style={{ alignItems: "flex-start", marginTop: 8 }}>
              <h1 className="l-title" style={{ fontSize: 26, maxWidth: 560, lineHeight: "32px" }}>Failure Analysis: TC-001 (Login with valid credentials)</h1>
              <div className="row" style={{ gap: 10 }}>
                <span className={`badge ${applied ? "b-pass" : "b-fail"}`} style={{ fontWeight: 600 }}><Icon n={applied ? "check" : "x"} s={11} /> {applied ? "FIXED" : "FAILED"}</span>
                <span className="xs" style={{ padding: "6px 8px", background: "#eff4ff", border: "1px solid rgba(195,198,215,.5)", borderRadius: 4, color: "#434655", maxWidth: 150 }}>Runtime: 14.82s • Worker: w-04-node</span>
              </div>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn btn-primary btn-sm" onClick={applyFix}><Icon n="wand-sparkles" s={13} /> Apply Suggested Fix</button>
              <button className="btn btn-sm" onClick={() => go("/light/runner")}><Icon n="rotate-cw" s={13} /> Re-run Test</button>
              <button className="btn btn-sm" onClick={() => toast("Failure ignored for this run. It will reappear if it fails again.")}><Icon n="eye-off" s={13} /> Ignore</button>
              <button className="btn btn-sm" onClick={() => downloadFile("TC-001-bug-report.md", "# TC-001 Login with valid credentials\n\n**Root cause:** Login button label changed from \"Login\" to \"Sign In\" (Step 4 of 6).\n\n**Run:** #TR-1246 · worker w-04-node · 14.82s\n\n**Suggested fix:**\n```diff\n- await page.get_by_role(\"button\", name=\"Login\").click()\n+ await page.get_by_role(\"button\", name=\"Sign In\").click()\n```\n", "text/markdown")}><Icon n="share" s={13} /> Export Bug Report</button>
            </div>
          </div>

          {/* Root cause */}
          <section className="card row-between a-up" style={{ padding: 16, borderLeft: "4px solid #ba1a1a", gap: 20 }}>
            <div className="row" style={{ gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 4, background: "#ffdad6", color: "#ba1a1a", display: "grid", placeItems: "center" }}><Icon n="search-x" s={16} /></div>
              <div>
                <div className="row" style={{ gap: 10, fontSize: 15, fontWeight: 600 }}>Primary Root Cause: UI element changed — Button label mismatch <span className="badge b-blue" style={{ fontSize: 10 }}>Step 4 of 6</span></div>
                <p className="small" style={{ fontSize: 13, color: "#434655", marginTop: 4, lineHeight: "19px" }}>
                  Test failed at Step 4 because the Login button label changed from <span className="badge b-gray">"Login"</span> to <span className="badge b-gray">"Sign In"</span>. The underlying DOM tree coordinates, target container (<span className="mono" style={{ fontSize: 10 }}>#auth-form</span>), and form post payload action remain intact.
                </p>
              </div>
            </div>
            <div className="row a-pop" style={{ gap: 10, padding: "10px 14px", border: "1px solid rgba(195,198,215,.6)", borderRadius: 6, flexShrink: 0 }}>
              <svg width="38" height="38" viewBox="0 0 38 38">
                <circle cx="19" cy="19" r="16" stroke="#e5eeff" strokeWidth="3" fill="none" />
                <circle cx="19" cy="19" r="16" stroke="#006b2c" strokeWidth="3" fill="none" strokeDasharray="100.5" strokeDashoffset="6" transform="rotate(-90 19 19)" strokeLinecap="round" />
                <text x="19" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0b1c30">94%</text>
              </svg>
              <div><div className="xs upper" style={{ color: "#434655", fontWeight: 600 }}>AI Confidence</div><div className="small" style={{ color: "#006b2c", fontWeight: 500 }}>Deterministic Match</div></div>
            </div>
          </section>

          {/* Visual inspector */}
          <div className="row-between a-up">
            <div className="row" style={{ gap: 10 }}><span className="l-panel-title">Visual Regression &amp; Locator Inspector</span><span className="badge b-blue" style={{ fontSize: 10 }}>Viewport: 1440x900</span></div>
            <span className="row small" style={{ gap: 6, color: "#434655" }}><span className="dot" style={{ color: "#ba1a1a" }} /> Red highlight indicates visual delta box</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="split-2">
            {[false, true].map(actual => (
              <section key={String(actual)} className="card l-inspect a-up">
                <div className="row-between" style={{ padding: "10px 12px", background: "#eff4ff", borderBottom: "1px solid rgba(195,198,215,.5)" }}>
                  <span className="row small" style={{ gap: 6, fontWeight: 600 }}>
                    <Icon n={actual ? "circle-alert" : "history"} s={14} style={{ color: actual ? "#ba1a1a" : "#434655" }} />
                    {actual ? "ACTUAL STATE (RUN #TR-1246)" : "EXPECTED STATE (BASELINE)"}
                  </span>
                  <span className="xs" style={{ color: actual ? "#ba1a1a" : "#434655" }}>{actual ? "Today 14:22:04 • Step Timeout" : "Baseline Recording • 2 days ago (build #892)"}</span>
                </div>
                <div style={{ padding: "18px 12px", position: "relative", background: "#f8f9ff" }}>
                  <LoginMock label={actual ? "Sign In" : "Login"} actual={actual} />
                  <span className="xs" style={{ position: "absolute", left: 12, bottom: 6, padding: "2px 6px", border: "1px solid", borderColor: actual ? "rgba(186,26,26,.4)" : "rgba(195,198,215,.8)", background: actual ? "#ffdad6" : "#fff", color: actual ? "#ba1a1a" : "#434655" }}>
                    {actual ? "Locator failure: Element matching \"Login\" not found (Timeout: 5000ms)" : "Target: DOM index #auth-btn"}
                  </span>
                </div>
                <div style={{ padding: 12 }}>
                  <div className="row-between"><span className="label" style={{ fontWeight: 500 }}>{actual ? "Observed Real Locator" : "Active Locator"}</span><span className="xs" style={{ color: actual ? "#ba1a1a" : "#006b2c" }}>{actual ? "Element Renamed" : "Exact Match"}</span></div>
                  <div className="mono small" style={{ marginTop: 8, padding: "9px 8px", background: actual ? "#fff1ef" : "#eff4ff", border: `1px solid ${actual ? "rgba(186,26,26,.3)" : "rgba(195,198,215,.5)"}`, fontSize: 11 }}>
                    page.get_by_role("button", name="{actual ? "Sign In" : "Login"}")
                  </div>
                  <div className="row-between" style={{ marginTop: 14 }}><span className="label" style={{ fontWeight: 500 }}>{actual ? "Observed DOM Snapshot" : "DOM Snapshot"}</span><span className="xs muted">Line 142</span></div>
                  <div className="mono small" style={{ marginTop: 8, padding: "8px", background: "#eff4ff", textAlign: "center", fontSize: 11, color: "#434655" }}>{actual ? "Sign In" : "Login"}</div>
                </div>
              </section>
            ))}
          </div>

          {/* Suggested repair */}
          <section className="card a-up" style={{ overflow: "hidden" }}>
            <div className="row-between" style={{ padding: "12px 16px", background: "#eff4ff", borderBottom: "1px solid rgba(195,198,215,.5)" }}>
              <span className="row" style={{ gap: 8 }}><Icon n="scan-search" s={16} style={{ color: "#2563eb" }} /><span className="l-panel-title">Suggested Self-Healing Repair</span><span className="badge b-pass" style={{ fontSize: 10, fontWeight: 600 }}>Auto-Repair Ready</span></span>
              <span className="row small" style={{ gap: 8 }}>Target File: <span className="mono xs" style={{ padding: "3px 8px", background: "#fff", border: "1px solid rgba(195,198,215,.6)" }}>tests/e2e/auth/student_login.spec.ts:38</span></span>
            </div>
            <div style={{ padding: 16 }}>
              <div className="l-console">
                <div className="head xs"><span>Playwright / Python Test Script Diff</span><span>unified view • -1 / +1 lines</span></div>
                <div style={{ padding: "8px 0" }}>
                  <div className="diff-row a-log"><span>37</span><span>await page.fill('#password', process.env.TEST_USER_PW);</span></div>
                  <div className="diff-row del a-log"><span>- 38</span><span>- await page.get_by_role("button", name="Login").click()</span></div>
                  <div className="diff-row add a-log"><span>+ 38</span><span>+ await page.get_by_role("button", name="Sign In").click()</span></div>
                  <div className="diff-row a-log"><span>39</span><span>await expect(page.locator('#dashboard-greeting')).toBeVisible();</span></div>
                </div>
              </div>
              <div style={{ marginTop: 14, padding: 14, background: "#f8f9ff", border: "1px solid rgba(195,198,215,.5)", borderRadius: 4 }}>
                <div className="row" style={{ gap: 8, alignItems: "flex-start", fontWeight: 600 }}><Icon n="lightbulb" s={15} style={{ color: "#2563eb", marginTop: 2 }} /> Healing Strategy: Semantic role repair with text alias fallback. 96% match probability based on ancestral DOM hierarchy &amp; unchanged CSS selectors.</div>
                <div className="xs muted" style={{ marginTop: 8 }}>Heuristic Model: QA-BERT-v4</div>
              </div>
              <div className="row-between" style={{ marginTop: 14 }}>
                <div className="row">
                  <button className="btn btn-primary" onClick={applyFix} disabled={applied}><Icon n="circle-check" s={14} /> {applied ? "Fix Applied" : "Apply Fix to Test Suite"}</button>
                  <button className="btn" onClick={(e) => applyFix(e).then(() => go("/light/runner"))}><Icon n="play" s={13} /> Apply &amp; Run Again</button>
                </div>
                <button className="btn" style={{ color: "#ba1a1a" }} onClick={(e) => act(() => API.createBug({ test: "TC-001" }), e).then(() => go("/light/bugs"))}><Icon n="bug" s={14} /> Mark as Real Bug &amp; Create Jira Issue</button>
              </div>
            </div>
          </section>

          {/* Healing log */}
          <div className="row-between a-up" style={{ alignItems: "flex-end" }}>
            <div>
              <div className="row" style={{ gap: 10 }}><span className="l-title" style={{ fontSize: 18 }}>Self-Healing Activity Log</span><span className="badge b-gray" style={{ fontSize: 10 }}>Project: Student Management Portal</span></div>
              <p className="l-sub" style={{ marginTop: 4 }}>Review automated repairs caused by application UI changes across test runs.</p>
            </div>
            <div className="row card xs" style={{ padding: "8px 14px", gap: 0 }}>
              {[["Attempts:", data.summary.attempts], ["Repaired:", data.summary.repaired], ["Needs Review:", data.summary.review], ["Success Rate:", data.summary.rate]].map(([k, v], i) => (
                <span key={k} style={{ padding: "0 14px", borderLeft: i ? "1px solid rgba(195,198,215,.6)" : 0 }}>{k} <b style={{ color: i === 2 ? "#ba1a1a" : i === 3 ? "#2563eb" : "#0b1c30" }}>{v}</b></span>
              ))}
            </div>
          </div>
          <section className="card a-up" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead><tr><th>Test Case</th><th>Element</th><th>Previous Locator</th><th>New Locator (Candidate)</th><th>Confidence</th><th>Status</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
              <tbody>
                {data.healing.map(h => (
                  <tr key={h.tc} className="row-hover">
                    <td><span className="row" style={{ gap: 8 }}><span className="xs mono muted">{h.tc}</span><span style={{ fontWeight: 500 }}>{h.name}</span></span></td>
                    <td className="small">{h.el}</td>
                    <td><span className="mono xs" style={{ padding: "2px 6px", background: "#eff4ff", border: "1px solid rgba(195,198,215,.5)" }}>{h.prev}</span></td>
                    <td><span className="mono xs" style={{ padding: "2px 6px", background: "#eff4ff", color: "#2563eb", border: "1px solid rgba(37,99,235,.2)" }}>{h.next}</span></td>
                    <td className="mono small" style={{ color: h.status === "Healed" ? "#006b2c" : "#434655", fontWeight: h.status === "Healed" ? 600 : 400 }}>{h.conf}</td>
                    <td>{h.status === "Healed" ? <span className="badge b-pass"><Icon n="circle-check" s={11} /> Healed</span> : <span className="badge b-gray" style={{ border: "1px solid rgba(195,198,215,.8)" }}><Icon n="triangle-alert" s={11} /> Review Required</span>}</td>
                    <td style={{ textAlign: "right" }}><a href="#/light/self-healing" style={{ color: "#2563eb", fontWeight: 500 }}>{h.status === "Healed" ? "Details" : "Review"}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="row-between xs" style={{ padding: "10px 14px", color: "#434655" }}>
              <span>Showing 5 of 24 recorded healing attempts</span>
              <span className="row"><button className="btn btn-sm" disabled={logPage === 1} style={{ opacity: logPage === 1 ? .6 : 1 }} onClick={() => setLogPage(p => p - 1)}>Previous</button><span className="mono">{logPage} / 5</span><button className="btn btn-sm" disabled={logPage === 5} onClick={() => setLogPage(p => p + 1)}>Next</button></span>
            </div>
          </section>
        </div>
      </main>
    </LightShell>
  );
}
window.LightFailure = LightFailure;
