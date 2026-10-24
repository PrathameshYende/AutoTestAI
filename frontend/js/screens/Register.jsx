/* AutoTestAI Registration Screen */

function Register() {
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const formRef = useRef(null);

  useLayoutEffect(() => {
    if (!window.gsap || !formRef.current) return;

    const ctx = window.gsap.context(() => {
      window.gsap.from(formRef.current.children, {
        y: 16,
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out"
      });
    }, formRef);

    return () => ctx.revert();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErr("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErr("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErr("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    if (!window.API || typeof window.API.register !== "function") {
      setErr(
        "Registration API is not configured yet. Please check js/api.js."
      );
      return;
    }

    setBusy(true);

    try {
      await window.API.register({
        name: cleanName,
        email: cleanEmail,
        password
      });

      toast("Account created successfully!");

      // Navigate to login after successful registration.
      go("/login");
    } catch (error) {
      const responseData = error?.response?.data;
      const detail = responseData?.detail;

      let message = "Registration failed. Please try again.";

      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail
          .map((item) => item.msg)
          .filter(Boolean)
          .join(", ") || message;
      }

      setErr(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="t-dark login"
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#101014",
        color: "#f5f4fa"
      }}
    >
      {/* Left side: Branding */}
      <div
        className="login-art"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px",
          minWidth: 0
        }}
      >
        <div
          className="row"
          style={{ gap: 10, marginBottom: 48 }}
        >
          <div
            className="sb-logo"
            style={{
              background: "#272a30",
              border: "1px solid #464554"
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 2l8.66 5v10L12 22l-8.66-5V7z"
                stroke="#c0c1ff"
                strokeWidth="1.6"
              />
              <path
                d="M8.5 15.5L12 7l3.5 8.5M9.8 12.6h4.4"
                stroke="#c0c1ff"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <span className="sb-name">AutoTestAI</span>
          <span className="sb-ver">PRO V2.4</span>
        </div>

        <div
          className="glow"
          style={{
            width: 260,
            height: 260,
            background: "rgba(128,131,255,.18)",
            position: "absolute",
            pointerEvents: "none"
          }}
        />

        <h1
          style={{
            fontSize: 34,
            lineHeight: 1.25,
            letterSpacing: "-0.8px",
            maxWidth: 500,
            position: "relative"
          }}
        >
          Start testing smarter with AutoTestAI.
        </h1>

        <p
          className="muted"
          style={{
            marginTop: 16,
            maxWidth: 440,
            lineHeight: 1.8,
            position: "relative"
          }}
        >
          Create your account to manage projects, generate test
          cases, analyze failures, and explore AI-powered test
          automation.
        </p>

        <div
          style={{
            marginTop: 36,
            padding: 20,
            maxWidth: 420,
            border: "1px solid #303039",
            borderRadius: 12,
            background: "rgba(255,255,255,.025)",
            position: "relative"
          }}
        >
          <div
            style={{
              color: "#c0c1ff",
              fontWeight: 600,
              marginBottom: 10
            }}
          >
            Your testing workspace
          </div>

          <div className="small muted">
            Create projects, upload recordings, and turn user
            interactions into test cases.
          </div>
        </div>
      </div>

      {/* Right side: Registration form */}
      <div
        className="login-form"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          minWidth: 0
        }}
      >
        <form
          ref={formRef}
          onSubmit={submit}
          noValidate
          style={{
            width: "100%",
            maxWidth: 380,
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 26,
                letterSpacing: "-0.6px"
              }}
            >
              Create your account
            </h1>

            <p className="muted" style={{ marginTop: 6 }}>
              Get started with AutoTestAI.
            </p>
          </div>

          {/* Full name */}
          <label className="field">
            <span>Full name</span>

            <div className="input" style={{ height: 42 }}>
              <Icon n="user-round" s={14} />

              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          </label>

          {/* Email */}
          <label className="field">
            <span>Email address</span>

            <div className="input" style={{ height: 42 }}>
              <Icon n="mail" s={14} />

              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
          </label>

          {/* Password */}
          <label className="field">
            <span>Password</span>

            <div className="input" style={{ height: 42 }}>
              <Icon n="lock" s={14} />

              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />

              <button
                type="button"
                className="icon-btn"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Icon
                  n={showPassword ? "eye-off" : "eye"}
                  s={14}
                />
              </button>
            </div>
          </label>

          {/* Confirm password */}
          <label className="field">
            <span>Confirm password</span>

            <div className="input" style={{ height: 42 }}>
              <Icon n="shield-check" s={14} />

              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Re-enter your password"
                required
              />
            </div>
          </label>

          {/* Error message */}
          {err && (
            <div
              className="small"
              role="alert"
              style={{
                color: "#ffb4ab",
                background: "rgba(147,0,10,.3)",
                padding: "10px",
                borderRadius: 4,
                lineHeight: 1.5
              }}
            >
              {err}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ justifyContent: "center" }}
            disabled={busy}
          >
            {busy ? "Creating account…" : "Create account"}
          </button>

          {/* Login link */}
          <p
            className="small muted"
            style={{ textAlign: "center" }}
          >
            Already have an account?{" "}
            <button
              type="button"
              className="link"
              onClick={() => go("/login")}
              style={{
                border: 0,
                background: "transparent",
                cursor: "pointer"
              }}
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

window.Register = Register;