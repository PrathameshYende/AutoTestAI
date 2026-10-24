/* Extension screen: Settings (sidebar footer link, not drawn in the Figma). */
function Settings({ theme }) {
  return (
    <Screen theme={theme} active="Settings" crumbs={["Workspace", "Settings"]} loader={() => API.getSettings()}>
      {(data) => <SettingsBody theme={theme} initial={data} />}
    </Screen>
  );
}

const SETTINGS_TABS = [
  ["general", "General", "settings"], ["ai", "AI Engine", "brain-circuit"], ["integrations", "Integrations", "plug"],
  ["environments", "Environments", "server"], ["team", "Team", "users"], ["notifications", "Notifications", "bell"]
];

function Row({ title, desc, children }) {
  return (
    <div className="setting-row">
      <div><div style={{ fontWeight: 500 }}>{title}</div>{desc && <div className="small muted" style={{ marginTop: 2, maxWidth: 460 }}>{desc}</div>}</div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function SettingsBody({ theme, initial }) {
  const act = useAction();
  const [tab, setTab] = useState("general");
  const [s, setS] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [invite, setInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Editor" });
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    if (panelRef.current) window.gsap.fromTo(panelRef.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, [tab]);

  const set = (patch) => { setS(v => ({ ...v, ...patch })); setDirty(true); };
  const setAi = (patch) => set({ ai: { ...s.ai, ...patch } });
  const setNotif = (patch) => set({ notifications: { ...s.notifications, ...patch } });
  const save = (e) => act(() => API.saveSettings(s), e).then(() => setDirty(false));

  return (
    <>
      <PageHead
        title="Settings"
        sub="Workspace preferences, AI engine behaviour, integrations, environments and team access."
        actions={<>
          {dirty && <span className="xs" style={{ color: "var(--warn-c)" }}>Unsaved changes</span>}
          <button className="btn" disabled={!dirty} onClick={() => { setS(initial); setDirty(false); }}>Discard</button>
          <button className="btn btn-primary" disabled={!dirty} onClick={save}><Icon n="save" s={14} /> Save changes</button>
        </>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }} className="split-2">
        <nav className="card settings-nav a-up" style={{ padding: 8 }}>
          {SETTINGS_TABS.map(([k, label, ic]) => (
            <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}><Icon n={ic} s={15} /> {label}</button>
          ))}
        </nav>

        <section className="card a-up" ref={panelRef} style={{ padding: "8px 20px 12px" }}>
          {tab === "general" && (
            <>
              <h3 style={{ fontSize: 16, padding: "12px 0 4px" }}>General</h3>
              <Row title="Workspace name" desc="Shown in the sidebar and on shared reports.">
                <div className="input" style={{ width: 260 }}><input value={s.workspace} onChange={e => set({ workspace: e.target.value })} /></div>
              </Row>
              <Row title="Time zone" desc="Used for schedules and report timestamps.">
                <div className="input" style={{ width: 260 }}><select value={s.timezone} onChange={e => set({ timezone: e.target.value })}>
                  {["UTC", "UTC+05:30 (IST)", "UTC-05:00 (EST)", "UTC+01:00 (CET)"].map(z => <option key={z}>{z}</option>)}
                </select></div>
              </Row>
              <Row title="Default framework" desc="Generated scripts use this framework unless a project overrides it.">
                <div className="seg">{["Playwright", "Selenium", "Cypress"].map(f => <button key={f} className={s.framework === f ? "active" : ""} onClick={() => set({ framework: f })}>{f}</button>)}</div>
              </Row>
              <Row title="Script language">
                <div className="seg">{["Python", "TypeScript", "Java"].map(l => <button key={l} className={s.language === l ? "active" : ""} onClick={() => set({ language: l })}>{l}</button>)}</div>
              </Row>
            </>
          )}

          {tab === "ai" && (
            <>
              <h3 style={{ fontSize: 16, padding: "12px 0 4px" }}>AI Engine</h3>
              <Row title="Self-healing" desc="Repair broken locators automatically during runs.">
                <Switch on={s.ai.autoHeal} onChange={v => setAi({ autoHeal: v })} label="Self-healing" />
              </Row>
              <Row title="Auto-approve threshold" desc="Repairs at or above this confidence are applied without review.">
                <div className="row" style={{ gap: 10, width: 260 }}>
                  <input type="range" className="range" min="60" max="99" value={s.ai.threshold} onChange={e => setAi({ threshold: +e.target.value })} aria-label="Threshold" />
                  <b className="mono" style={{ width: 40 }}>{s.ai.threshold}%</b>
                </div>
              </Row>
              <Row title="Vision model" desc="Model used to detect UI elements in recordings.">
                <div className="input" style={{ width: 260 }}><select value={s.ai.model} onChange={e => setAi({ model: e.target.value })}>
                  {["Vision-CodeGen-v3", "CV-Vision-v4.2b", "YOLO-v9 + Tesseract-Edge"].map(m => <option key={m}>{m}</option>)}
                </select></div>
              </Row>
              <Row title="Test deduplication" desc="Flag generated tests that overlap more than 90% with existing ones.">
                <Switch on={s.ai.dedupe} onChange={v => setAi({ dedupe: v })} label="Deduplication" />
              </Row>
              <Row title="Predictive test selection" desc="Run the tests most likely to be affected by a change first.">
                <Switch on={s.ai.predictive} onChange={v => setAi({ predictive: v })} label="Predictive selection" />
              </Row>
            </>
          )}

          {tab === "integrations" && (
            <>
              <h3 style={{ fontSize: 16, padding: "12px 0 12px" }}>Integrations</h3>
              <div className="grid-2" style={{ gap: 12, paddingBottom: 8 }}>
                {s.integrations.map((it, i) => (
                  <div key={it.id} className="inset" style={{ padding: 14 }}>
                    <div className="row-between">
                      <span className="row" style={{ gap: 10 }}>
                        <span style={{ width: 32, height: 32, borderRadius: "var(--radius)", background: "var(--surface-3)", display: "grid", placeItems: "center" }}><Icon n={it.icon} s={16} /></span>
                        <b>{it.name}</b>
                      </span>
                      {it.connected ? <Pill tone="ok" dot>Connected</Pill> : <Pill tone="muted">Not connected</Pill>}
                    </div>
                    <p className="small muted" style={{ marginTop: 10, minHeight: 36 }}>{it.desc}</p>
                    <div className="row-between" style={{ marginTop: 10 }}>
                      <span className="xs muted">{it.meta}</span>
                      <button className={`btn btn-sm ${it.connected ? "" : "btn-primary"}`} onClick={() => set({ integrations: s.integrations.map((x, j) => j === i ? { ...x, connected: !x.connected, meta: x.connected ? "" : "Just connected" } : x) })}>
                        {it.connected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "environments" && (
            <>
              <div className="row-between" style={{ padding: "12px 0" }}><h3 style={{ fontSize: 16 }}>Environments</h3><button className="btn btn-sm"><Icon n="plus" s={13} /> Add environment</button></div>
              <table className="table" style={{ marginBottom: 8 }}>
                <thead><tr><th>Name</th><th>Base URL</th><th>Status</th><th>Latency</th><th>Workers</th></tr></thead>
                <tbody>
                  {s.environments.map(env => (
                    <tr key={env.name} className="row-hover">
                      <td style={{ fontWeight: 500 }}>{env.name}</td>
                      <td className="mono xs">{env.url}</td>
                      <td><StatusPill status={env.status} /></td>
                      <td className="mono small" style={{ color: env.status === "Degraded" ? "var(--warn-c)" : undefined }}>{env.ping}</td>
                      <td className="mono small">{env.workers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {tab === "team" && (
            <>
              <div className="row-between" style={{ padding: "12px 0" }}><h3 style={{ fontSize: 16 }}>Team <span className="muted small">({s.team.length})</span></h3><button className="btn btn-sm btn-primary" onClick={() => setInvite(true)}><Icon n="user-plus" s={13} /> Invite</button></div>
              {s.team.map((m, i) => (
                <div key={m.email} className="setting-row">
                  <span className="row" style={{ gap: 10 }}>
                    <Avatar initials={m.initials} color={m.color} />
                    <span><div style={{ fontWeight: 500 }}>{m.name}</div><div className="xs muted">{m.email}</div></span>
                  </span>
                  <div className="input" style={{ width: 140, height: 32 }}>
                    <select value={m.role} onChange={e => set({ team: s.team.map((x, j) => j === i ? { ...x, role: e.target.value } : x) })}>
                      {["Admin", "Editor", "Viewer"].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "notifications" && (
            <>
              <h3 style={{ fontSize: 16, padding: "12px 0 4px" }}>Notifications</h3>
              <Row title="Run failures" desc="Email me when a run I own fails."><Switch on={s.notifications.failures} onChange={v => setNotif({ failures: v })} label="Run failures" /></Row>
              <Row title="Auto-healed locators" desc="Summary of repairs applied automatically."><Switch on={s.notifications.healed} onChange={v => setNotif({ healed: v })} label="Healed" /></Row>
              <Row title="Repairs needing review" desc="When a repair falls below the auto-approve threshold."><Switch on={s.notifications.review} onChange={v => setNotif({ review: v })} label="Review" /></Row>
              <Row title="Daily digest" desc="One email each morning with yesterday's results."><Switch on={s.notifications.daily} onChange={v => setNotif({ daily: v })} label="Daily digest" /></Row>
              <Row title="Slack alerts" desc={s.integrations.find(x => x.id === "slack").connected ? "Post alerts to #qa-alerts." : "Connect Slack in Integrations first."}>
                <Switch on={s.notifications.slack} onChange={v => setNotif({ slack: v })} label="Slack alerts" />
              </Row>
            </>
          )}
        </section>
      </div>

      <Modal open={invite} onClose={() => setInvite(false)} title="Invite teammate" width={460}
        footer={<><button className="btn" onClick={() => setInvite(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={!/^\S+@\S+\.\S+$/.test(inviteForm.email)} onClick={(e) => act(() => API.inviteMember(inviteForm), e).then(() => {
            const name = inviteForm.email.split("@")[0];
            setS(v => ({ ...v, team: [...v.team, { name, email: inviteForm.email, role: inviteForm.role, initials: name.slice(0, 2).toUpperCase(), color: "#737686" }] }));
            setInvite(false); setInviteForm({ email: "", role: "Editor" });
          })}>Send invite</button></>}>
        <div className="modal-body col" style={{ gap: 14 }}>
          <label className="field"><span>Email</span><div className="input"><input autoFocus type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="name@company.com" /></div></label>
          <div className="field"><span>Role</span>
            <div className="seg" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
              {["Admin", "Editor", "Viewer"].map(r => <button key={r} className={inviteForm.role === r ? "active" : ""} onClick={() => setInviteForm({ ...inviteForm, role: r })} style={{ padding: 6 }}>{r}</button>)}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
window.Settings = Settings;
