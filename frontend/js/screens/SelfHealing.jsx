/* Extension screen: Self-Healing (full history; the design only shows a 5-row log). */
function SelfHealing({ theme }) {
  return (
    <Screen theme={theme} active="Self-Healing" crumbs={["Production - v2.4.1", "Self-Healing"]} loader={() => API.getHealing()}>
      {(data) => <HealingBody theme={theme} data={data} />}
    </Screen>
  );
}

function HealingBody({ theme, data }) {
  const act = useAction();
  const [events, setEvents] = useState(data.events);
  const [status, setStatus] = useState("All");
  const [threshold, setThreshold] = useState(85);
  const [autoApprove, setAutoApprove] = useState(true);
  const [review, setReview] = useState(null);
  const bodyRef = useRef(null);

  useEffect(() => { if (bodyRef.current) window.Anim.staggerIn(bodyRef.current.children); }, [status]);

  const shown = events.filter(e => status === "All" || e.status === status);
  const pending = events.filter(e => e.status === "Pending").length;
  const ev = events.find(e => e.id === review);
  const decide = (id, approve, e) =>
    act(() => API.decideHealing(id, approve), e).then(() => {
      setEvents(l => l.map(x => x.id === id ? { ...x, status: approve ? "Healed" : "Rejected" } : x));
      setReview(null);
    });
  const wouldAuto = events.filter(e => e.status === "Pending" && e.conf >= threshold).length;
  const maxStrategy = Math.max(...data.strategies.map(s => s[1]));

  return (
    <>
      <PageHead
        title="Self-Healing"
        badge={<Pill tone="ai" dot live>Engine active</Pill>}
        sub="Every broken locator AutoTestAI repaired, which fallback strategy it used, and the repairs waiting for your approval."
        actions={<>
          <button className="btn" onClick={() => go(pagePath(theme, "help"))}><Icon n="book-open" s={14} /> How it works</button>
          <button className="btn btn-primary" disabled={!pending} onClick={(e) => act(() => API.decideHealing("all-pending", true), e).then(() => setEvents(l => l.map(x => x.status === "Pending" ? { ...x, status: "Healed" } : x)))}>
            <Icon n="check-check" s={14} /> Approve all pending ({pending})
          </button>
        </>}
      />

      <div className="grid-5">
        <Kpi label="Attempts (30d)" value={data.summary.attempts} icon="activity" />
        <Kpi label="Auto-healed" value={events.filter(e => e.status === "Healed").length + data.summary.healed - 3} icon="wand-sparkles" tone="ai" />
        <Kpi label="Pending review" value={pending} icon="clock" tone="warn-c" />
        <Kpi label="Success rate" value={data.summary.rate} suffix="%" icon="target" tone="ok" />
        <Kpi label="Hours saved" value={data.summary.hours} decimals={1} icon="timer" sub="vs. manual locator fixes" />
      </div>

      <div className="side-layout">
        <section className="card a-up" style={{ overflow: "hidden" }}>
          <div className="row-between" style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
            <div className="tabs">
              {["All", "Healed", "Pending", "Rejected"].map(s => (
                <button key={s} className={`tab ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>
                  {s} <span className="badge b-gray">{s === "All" ? events.length : events.filter(e => e.status === s).length}</span>
                </button>
              ))}
            </div>
          </div>
          <table className="table">
            <thead><tr><th>Test</th><th>Element</th><th>Previous → New locator</th><th>Strategy</th><th>Confidence</th><th>Status</th><th></th></tr></thead>
            <tbody ref={bodyRef}>
              {shown.map(e => (
                <tr key={e.id} className="row-hover">
                  <td><span className="mono small" style={{ color: "var(--link)" }}>{e.tc}</span><div className="xs muted">{e.project}</div></td>
                  <td className="small">{e.el}</td>
                  <td style={{ maxWidth: 260 }}>
                    <div className="mono xs" style={{ textDecoration: "line-through", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.prev}</div>
                    <div className="mono xs" style={{ color: "var(--link)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.next}</div>
                  </td>
                  <td className="small">{e.strategy}</td>
                  <td style={{ width: 110 }}>
                    <div className="row" style={{ gap: 6 }}>
                      <div className="hbar grow" style={{ background: "var(--surface-3)", height: 5 }}><i style={{ width: `${e.conf}%`, background: e.conf >= threshold ? "var(--c-pass)" : "var(--warn-c)" }} /></div>
                      <span className="mono xs">{e.conf}%</span>
                    </div>
                  </td>
                  <td><StatusPill status={e.status} /></td>
                  <td style={{ textAlign: "right" }}><button className="link small" onClick={() => setReview(e.id)}>{e.status === "Pending" ? "Review" : "Details"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="col" style={{ gap: 16 }}>
          <section className="card card-pad a-up">
            <div className="card-title" style={{ marginBottom: 14 }}><Icon n="layers" s={16} /> Fallback strategy mix</div>
            <div className="col" style={{ gap: 12 }}>
              {data.strategies.map(([name, v], i) => <HBar key={name} label={name} value={v} max={maxStrategy} right={`${v}%`} color={i === 0 ? "var(--link)" : "var(--c-heal)"} />)}
            </div>
          </section>
          <section className="card card-pad a-up">
            <div className="row-between" style={{ marginBottom: 6 }}>
              <div className="card-title"><Icon n="sliders-horizontal" s={16} /> Auto-approve</div>
              <Switch on={autoApprove} onChange={setAutoApprove} label="Auto-approve repairs" />
            </div>
            <p className="small muted" style={{ lineHeight: "18px" }}>Repairs at or above this confidence are applied without review.</p>
            <div className="row" style={{ gap: 12, marginTop: 14, opacity: autoApprove ? 1 : 0.5 }}>
              <input type="range" className="range" min="60" max="99" value={threshold} disabled={!autoApprove} onChange={e => setThreshold(+e.target.value)} aria-label="Confidence threshold" />
              <b className="mono" style={{ width: 44, textAlign: "right" }}>{threshold}%</b>
            </div>
            <div className="xs" style={{ marginTop: 8, color: "var(--text-2)" }}>
              {autoApprove ? <>{wouldAuto} of {pending} pending repairs would be approved at this threshold.</> : "All repairs will wait for manual review."}
            </div>
          </section>
        </div>
      </div>

      <Modal open={!!ev} onClose={() => setReview(null)} title={ev ? `${ev.id} · ${ev.el} (${ev.tc})` : ""} width={680}
        footer={ev && (ev.status === "Pending" ? <>
          <button className="btn" onClick={(e) => decide(ev.id, false, e)}><Icon n="x" s={14} /> Reject</button>
          <button className="btn btn-primary" onClick={(e) => decide(ev.id, true, e)}><Icon n="check" s={14} /> Approve repair</button>
        </> : <button className="btn" onClick={() => setReview(null)}>Close</button>)}>
        {ev && (
          <div className="modal-body col" style={{ gap: 14 }}>
            <div className="row" style={{ gap: 8 }}><StatusPill status={ev.status} /><Pill tone="ai">{ev.strategy}</Pill><Pill tone="muted">{ev.project}</Pill><span className="xs muted" style={{ marginLeft: "auto" }}>{ev.when}</span></div>
            <DiffBlock file={`tests/e2e/${ev.tc.toLowerCase()}.py`} before={`page.locator('${ev.prev}').click()`} after={`page.locator('${ev.next}').click()`} />
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="inset" style={{ padding: 12 }}>
                <div className="xs upper muted">Confidence</div>
                <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{ev.conf}%</div>
                <Progress value={ev.conf} color={ev.conf >= threshold ? "var(--c-pass)" : "var(--warn-c)"} height={5} style={{ marginTop: 6 }} />
                <div className="xs muted" style={{ marginTop: 6 }}>{ev.conf >= threshold ? "Above" : "Below"} the {threshold}% auto-approve threshold</div>
              </div>
              <div className="inset small" style={{ padding: 12, lineHeight: "19px" }}>
                <div className="xs upper muted" style={{ marginBottom: 4 }}>Why this match</div>
                Same DOM ancestry and bounding box as the recorded element; visible text and ARIA role agree with the original step.
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
window.SelfHealing = SelfHealing;
