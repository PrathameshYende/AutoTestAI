/* Extension screen: Login (the design has no auth screens). Dark AutoTestAI style. */
function Login() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const artRef = useRef(null);
  const formRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = window.gsap.context(() => {
      window.gsap.from(formRef.current.children, { y: 16, autoAlpha: 0, duration: 0.55, stagger: 0.06, ease: "power3.out" });
      window.gsap.from(".float-card", { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.2 });
      artRef.current.querySelectorAll(".float-card").forEach((el, i) => {
        window.gsap.to(el, { y: i % 2 ? 10 : -10, duration: 3 + i, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
      });
      window.gsap.to(".login-glow", { x: 60, y: 40, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
    return () => ctx.revert();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid work email.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    setBusy(true);
    API.login({ email, password, remember })
      .then(() => { toast("Signed in. Welcome back!"); go("/dark/dashboard"); })
      .catch(() => setErr("Sign-in failed. Try again."))
      .finally(() => setBusy(false));
  };

  return (
    <div className="t-dark login">
      <div className="login-art" ref={artRef}>
        <div className="glow login-glow" style={{ width: 420, height: 420, left: 80, top: 120, background: "rgba(128,131,255,.22)" }} />
        <div className="row" style={{ gap: 10, position: "relative" }}>
          <div className="sb-logo" style={{ background: "#272a30", border: "1px solid #464554" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" stroke="#c0c1ff" strokeWidth="1.6" /><path d="M8.5 15.5L12 7l3.5 8.5M9.8 12.6h4.4" stroke="#c0c1ff" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </div>
          <span className="sb-name">AutoTestAI</span><span className="sb-ver">PRO V2.4</span>
        </div>

        <div style={{ position: "relative", height: 360 }}>
          <div className="float-card" style={{ left: 20, top: 10, width: 250 }}>
            <div className="row-between"><span className="row" style={{ gap: 6, color: "#ffb4ab" }}><span className="dot" /> UI Regression</span><span className="xs faint">3m ago</span></div>
            <div style={{ marginTop: 6, color: "#c7c4d7" }}>Login button renamed to 'Sign In'. Fix ready.</div>
          </div>
          <div className="float-card" style={{ right: 10, top: 90, width: 220 }}>
            <div className="xs muted">Autonomous Test Coverage</div>
            <div style={{ fontSize: 26, fontWeight: 600, marginTop: 4 }}>84.6%</div>
            <div className="progress" style={{ marginTop: 8, height: 5 }}><i style={{ width: "84.6%", background: "#c0c1ff" }} /></div>
          </div>
          <div className="float-card" style={{ left: 60, top: 190, width: 290 }}>
            <div className="row" style={{ gap: 6, color: "#d0bcff", fontWeight: 500 }}><Icon n="wand-sparkles" s={13} /> Self-healed</div>
            <div className="mono xs" style={{ marginTop: 6, color: "#918fa0", textDecoration: "line-through" }}>button.save-btn</div>
            <div className="mono xs" style={{ color: "#c0c1ff" }}>[data-action="save-student"]</div>
          </div>
          <div className="float-card" style={{ right: 40, top: 280, width: 200 }}>
            <div className="row-between"><span>Regression v2.4.1</span><span className="badge b-blue" style={{ fontSize: 10 }}>Passed</span></div>
            <div className="xs muted" style={{ marginTop: 4 }}>142 / 0 · 3m 45s</div>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: 26, letterSpacing: "-0.6px", lineHeight: "32px", maxWidth: 420 }}>AI-powered testing, from recording to report.</h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: 420 }}>Record a workflow once. AutoTestAI writes the tests, runs them and heals them when your UI changes.</p>
        </div>
      </div>

      <div className="login-form">
        <form ref={formRef} onSubmit={submit} style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 16 }} noValidate>
          <div>
            <h1 style={{ fontSize: 26, letterSpacing: "-0.6px" }}>Sign in</h1>
            <p className="muted" style={{ marginTop: 6 }}>Welcome back. Use your work account.</p>
          </div>
          <div className="grid-2" style={{ gap: 8 }}>
            <button type="button" className="btn" style={{ justifyContent: "center" }} onClick={() => toast("SSO isn't configured in this demo.")}><Icon n="github" s={15} /> GitHub</button>
            <button type="button" className="btn" style={{ justifyContent: "center" }} onClick={() => toast("SSO isn't configured in this demo.")}><Icon n="key-round" s={15} /> SAML SSO</button>
          </div>
          <div className="row xs faint" style={{ gap: 10 }}><i style={{ flex: 1, height: 1, background: "#272a30" }} />or continue with email<i style={{ flex: 1, height: 1, background: "#272a30" }} /></div>
          <label className="field"><span>Work email</span>
            <div className="input" style={{ height: 40 }}><Icon n="mail" s={14} /><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" /></div>
          </label>
          <div className="field">
            <span className="row-between">Password <button type="button" className="link xs" onClick={() => toast("A reset link would be emailed to you.")}>Forgot password?</button></span>
            <div className="input" style={{ height: 40 }}>
              <Icon n="lock" s={14} />
              <input type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              <button type="button" className="icon-btn" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"}><Icon n={show ? "eye-off" : "eye"} s={14} /></button>
            </div>
          </div>
          <label className="row small" style={{ gap: 8, cursor: "pointer" }}><Check on={remember} onClick={() => setRemember(r => !r)} /> Keep me signed in for 30 days</label>
          {err && <div className="small" role="alert" style={{ color: "#ffb4ab", background: "rgba(147,0,10,.3)", padding: "8px 10px", borderRadius: 2 }}>{err}</div>}
          <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: "center" }} disabled={busy}>
            {busy ? <><Icon n="loader-circle" s={15} className="spin" /> Signing in…</> : <>Sign in <Icon n="arrow-right" s={15} /></>}
          </button>
          <p className="xs faint" style={{ textAlign: "center" }}>Demo build: any email and a 6+ character password will sign you in.</p>
        </form>
      </div>
    </div>
  );
}
window.Login = Login;
