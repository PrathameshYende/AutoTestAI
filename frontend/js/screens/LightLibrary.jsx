/* Extension screens for the light theme: Test Cases and Automation Scripts.
   The dark theme has designed versions of both; these bring the same content
   into the light QA design language. */
function LightTestCases({ theme }) {
  return (
    <Screen theme={theme} active="Test Cases" crumbs={["Production - v2.4.1", "Test Cases"]} loader={() => API.getTestCases()}>
      {(data) => <LightTestCasesBody theme={theme} data={data} />}
    </Screen>
  );
}

function LightTestCasesBody({ theme, data }) {
  const act = useAction();
  const [cases, setCases] = useState(data.cases);
  const [tab, setTab] = useState("All");
  const [open, setOpen] = useState("TC-001");
  const [prompt, setPrompt] = useState("Add edge cases for leap year dates and special characters in names");
  const expRef = useRef(null);
  const bodyRef = useRef(null);
  useLayoutEffect(() => { if (open && expRef.current) window.Anim.expand(expRef.current); }, [open]);
  useEffect(() => { if (bodyRef.current) window.Anim.staggerIn(bodyRef.current.querySelectorAll("tr.tc-row")); }, [tab]);

  const shown = cases.filter(c => tab === "All" || c.type === tab);
  const toggle = (id) => setCases(l => l.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  const approveSel = () => setCases(l => l.map(c => c.checked ? { ...c, status: "Approved" } : c));

  return (
    <>
      <PageHead
        eyebrow={<><span>SUITE: {data.suite}</span><Pill tone="ok" dot>Synced with HEAD</Pill></>}
        title="Test Cases"
        badge={<Pill tone="info">v2.4 Synthetic</Pill>}
        sub={'AI-generated scenarios for the learned "Student Registration Flow" workflow.'}
        actions={<>
          <button className="btn" onClick={approveSel}><Icon n="check-check" s={14} /> Approve selected ({cases.filter(c => c.checked).length})</button>
          <button className="btn btn-primary" onClick={() => go("/light/scripts")}>Generate scripts <Icon n="arrow-right" s={14} /></button>
        </>}
      />

      <div className="grid-4">
        {data.stats.map(s => (
          <div className="card kpi a-up" key={s.k}>
            <div className="k"><span>{s.k}</span><Pill tone={s.warn ? "bad" : "info"}>{s.badge}</Pill></div>
            <div className="v"><Counter value={s.v} decimals={s.decimals || 0} suffix={s.suffix || ""} />{s.of && <span className="small muted" style={{ fontWeight: 400 }}> / {s.of}</span>}</div>
            <div className="hbar"><i className="a-fill" style={{ width: `${s.fill}%`, background: s.warn ? "var(--c-fail)" : "var(--link)" }} /></div>
          </div>
        ))}
      </div>

      <section className="card row a-up" style={{ padding: 14, gap: 14 }}>
        <span style={{ width: 34, height: 34, borderRadius: 6, background: "var(--info-bg)", color: "var(--link)", display: "grid", placeItems: "center" }}><Icon n="wand-sparkles" s={17} /></span>
        <div style={{ minWidth: 240 }}><b>Prompt-assisted generation</b><div className="small muted">Describe the scenarios you want added.</div></div>
        <label className="input grow"><Icon n="bot" s={14} /><input value={prompt} onChange={e => setPrompt(e.target.value)} /></label>
        <button className="btn btn-primary" onClick={(e) => act(() => API.synthesizeCases(prompt), e)}><Icon n="sparkles" s={14} /> Generate</button>
      </section>

      <section className="card a-up" style={{ overflow: "hidden" }}>
        <div className="row-between" style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
          <div className="seg">
            {[["All", 18], ["Functional", 6], ["Negative", 4], ["Boundary", 3], ["Security", 3]].map(([t, n]) => <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)} style={{ fontSize: 12, padding: "4px 10px" }}>{t} ({n})</button>)}
          </div>
          <span className="xs muted">Sort: Risk priority ↓</span>
        </div>
        <table className="table">
          <thead><tr><th style={{ width: 28 }}></th><th>ID</th><th>Scenario</th><th>Type</th><th>Priority</th><th>Steps</th><th>Status</th><th></th></tr></thead>
          <tbody ref={bodyRef}>
            {shown.map(c => (
              <React.Fragment key={c.id}>
                <tr className="tc-row row-hover" style={{ cursor: "pointer" }} onClick={() => setOpen(open === c.id ? null : c.id)}>
                  <td onClick={e => e.stopPropagation()}><Check on={c.checked} onClick={() => toggle(c.id)} /></td>
                  <td className="mono small" style={{ color: "var(--link)", fontWeight: 600 }}>{c.id}</td>
                  <td><span className="row" style={{ gap: 6 }}><Icon n={open === c.id ? "chevron-down" : "chevron-right"} s={13} />{c.title}</span></td>
                  <td><Pill tone="muted">{c.type}</Pill></td>
                  <td><StatusPill status={c.priority} /></td>
                  <td className="small muted">{c.steps}</td>
                  <td>{c.status === "Approved" ? <Pill tone="ok"><Icon n="circle-check" s={11} /> Approved</Pill> : <Pill tone="warn">Needs review</Pill>}</td>
                  <td onClick={e => e.stopPropagation()}><button className="btn btn-sm" onClick={(e) => act(() => API.runTests({ test: c.id }), e)}>Run</button></td>
                </tr>
                {open === c.id && (
                  <tr><td colSpan={8} style={{ padding: 0 }}>
                    <div ref={expRef} style={{ overflow: "hidden" }}>
                      <div className="grid-2" style={{ gridTemplateColumns: "minmax(0, 1fr) 300px", padding: 16, background: "var(--inset)", gap: 16 }}>
                        <div>
                          <div className="row-between" style={{ marginBottom: 10 }}><b className="row" style={{ gap: 6 }}><Icon n="list-ordered" s={15} /> Execution sequence</b><span className="xs muted">Expected: {c.expected}</span></div>
                          <div className="col" style={{ gap: 6 }}>
                            {data.trace.map((s, i) => (
                              <div key={i} className="row small a-log" style={{ gap: 10, padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 4 }}>
                                <span className="l-check" style={{ width: 20, height: 20, background: "var(--info-bg)", color: "var(--link)", fontSize: 10 }}>{i + 1}</span>
                                <span className="grow" style={{ overflowWrap: "anywhere" }}>{s.t} <span className="mono xs" style={{ color: "var(--link)" }}>{s.code}</span>{s.rest}</span>
                                {s.tag && <Pill tone="info">{s.tag}</Pill>}
                                <span className="mono xs muted">{s.ms}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="col" style={{ gap: 10 }}>
                          <div className="card card-pad">
                            <div className="row-between"><b className="small">AI reasoning</b><Pill tone="ok">99.1%</Pill></div>
                            <p className="xs muted" style={{ marginTop: 6, lineHeight: "17px" }}>Synthesized from recording timestamp 00:04–00:28; verified across 12 regression runs without DOM drift.</p>
                          </div>
                          <div className="card card-pad">
                            <b className="xs upper muted">DOM resiliency</b>
                            {data.matrix.map(([k, v]) => <div key={k} className="row-between xs mono" style={{ marginTop: 6 }}><span>{k}</span><span style={{ color: "var(--link)" }}>{v}</span></div>)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td></tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function LightScripts({ theme }) {
  return (
    <Screen theme={theme} active="Automation Scripts" crumbs={["Production - v2.4.1", "Automation Scripts"]} loader={() => API.getScript("TC-001")}>
      {(data) => <LightScriptsBody theme={theme} data={data} />}
    </Screen>
  );
}

const LIGHT_FILES = [
  ["tests/e2e/test_student_flow.py", "TC-001", "97%"],
  ["tests/e2e/test_login_negative.py", "TC-002", "99%"],
  ["tests/e2e/test_registration_boundary.py", "TC-003", "95%"],
  ["tests/security/test_search_injection.py", "TC-004", "98%"],
  ["page_objects/login.py", "POM", "—"]
];

function LightScriptsBody({ theme, data }) {
  const act = useAction();
  const toast = useToast();
  const [file, setFile] = useState(LIGHT_FILES[0][0]);
  const [fw, setFw] = useState("Playwright");
  const lines = SCRIPT_LINES; // shared with the dark Automation Scripts screen
  const codeRef = useRef(null);
  useEffect(() => { if (codeRef.current) window.Anim.staggerIn(codeRef.current.children); }, [file]);

  return (
    <>
      <PageHead
        title="Automation Scripts"
        badge={<Pill tone="ok" dot>Self-healing on</Pill>}
        sub="Generated Playwright code for every approved test case, with resilient locators and Page Objects."
        actions={<>
          <div className="seg">{["Playwright", "Selenium", "Cypress"].map(f => <button key={f} className={fw === f ? "active" : ""} onClick={() => setFw(f)}>{f}</button>)}</div>
          <button className="btn" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(lines.map(([, t]) => t.map(x => x[1]).join("")).join("\n")); toast("Script copied"); }}><Icon n="copy" s={14} /> Copy</button>
          <button className="btn btn-primary" onClick={(e) => act(() => API.runTests({ script: file, framework: fw }), e)}><Icon n="play" s={13} /> Run test</button>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr) 280px", gap: 16, alignItems: "start" }} className="split-2">
        <section className="card a-up" style={{ overflow: "hidden" }}>
          <div className="card-head"><b className="small row" style={{ gap: 6 }}><Icon n="folder-tree" s={15} /> Files</b><Pill tone="muted">{LIGHT_FILES.length}</Pill></div>
          {LIGHT_FILES.map(([f, tc, conf]) => (
            <div key={f} className={`list-row ${file === f ? "sel" : ""}`} onClick={() => setFile(f)} style={{ padding: "10px 12px" }}>
              <Icon n="file-code" s={15} style={{ color: "var(--link)" }} />
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="mono xs" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.split("/").pop()}</div>
                <div className="xs muted">{tc}</div>
              </div>
              <span className="mono xs" style={{ color: "var(--ok)" }}>{conf}</span>
            </div>
          ))}
        </section>

        <section className="l-console a-up" style={{ minWidth: 0 }}>
          <div className="head xs">
            <span className="row mono" style={{ gap: 6, color: "#dbe5f5" }}><Icon n="file-code" s={13} style={{ color: "#86efac" }} /> {file}</span>
            <span>Python · {fw} · UTF-8</span>
          </div>
          <div className="mono" ref={codeRef} style={{ fontSize: 11, lineHeight: "20px", padding: "10px 0 14px", overflowX: "auto" }}>
            {lines.map(([n, toks, hl]) => (
              <div key={n} style={{ display: "flex", padding: "0 14px", whiteSpace: "pre", background: hl ? "rgba(37,99,235,.22)" : "transparent", width: "max-content", minWidth: "100%" }}>
                <span style={{ color: "#8a9bb5", width: 30, flexShrink: 0 }}>{String(n).padStart(2, "0")}</span>
                <span>{toks.map(([k, t], i) => <span key={i} style={{ color: k === "k" ? "#93c5fd" : k === "s" ? "#86efac" : k === "c" ? "#9fb0c8" : k === "f" ? "#fcd34d" : "#dbe5f5" }}>{t}</span>)}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="col" style={{ gap: 12 }}>
          <section className="card card-pad a-up">
            <b className="row small" style={{ gap: 6 }}><Icon n="target" s={15} /> Locators</b>
            <div className="col" style={{ gap: 8, marginTop: 10 }}>
              {data.locators.map(l => (
                <div key={l.loc} className="inset" style={{ padding: 8 }}>
                  <div className="mono xs" style={{ color: "var(--link)", wordBreak: "break-all" }}>{l.loc}</div>
                  <div className="row-between xs muted" style={{ marginTop: 4 }}><span>{l.healed ? "AI healed" : l.note}</span><Pill tone={l.healed ? "ai" : "ok"}>{l.conf}</Pill></div>
                </div>
              ))}
            </div>
          </section>
          <section className="card card-pad a-up">
            <div className="row-between"><b className="small">Stability</b><span className="xs" style={{ color: "var(--ok)" }}>{data.stability.delta}</span></div>
            <div className="row-between" style={{ marginTop: 6, alignItems: "flex-end" }}>
              <span style={{ fontSize: 24, fontWeight: 500 }}><Counter value={data.stability.value} decimals={1} suffix="%" /></span>
              <Sparkline data={[92, 94, 93, 95, 96, 95, 97.8]} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
window.LightTestCases = LightTestCases;
window.LightScripts = LightScripts;
