/* App root: hash routes → screens. One route per Figma frame. */

const ROUTES = {
  // Authentication
  "/login": {
    screen: "Login",
    group: "auth",
    label: "Sign in"
  },

  "/register": {
    screen: "Register",
    group: "auth",
    label: "Create account"
  },

  // Dark theme
  "/dark/upload": {
    screen: "DarkUpload",
    group: "dark",
    label: "Upload Recording"
  },

  "/dark/dashboard": {
    screen: "DarkDashboard",
    group: "dark",
    label: "Dashboard"
  },

  "/dark/test-cases": {
    screen: "DarkTestCases",
    group: "dark",
    label: "Test Cases"
  },

  "/dark/workflow": {
    screen: "DarkWorkflow",
    group: "dark",
    label: "AI Workflow Builder"
  },

  "/dark/scripts": {
    screen: "DarkScripts",
    group: "dark",
    label: "Automation Scripts"
  },

  "/dark/runs": {
    screen: "DarkRuns",
    group: "dark",
    label: "Test Runs & Live Runner"
  },

  // Light theme
  "/light/dashboard": {
    screen: "LightDashboard",
    group: "light",
    label: "QA Dashboard"
  },

  "/light/create": {
    screen: "LightCreate",
    group: "light",
    label: "Create Test & Analysis"
  },

  "/light/failure": {
    screen: "LightFailure",
    group: "light",
    label: "Failure Analysis"
  },

  "/light/runner": {
    screen: "LightRunner",
    group: "light",
    label: "Live Test Runner"
  },

  "/light/workflow": {
    screen: "LightWorkflow",
    group: "light",
    label: "Workflow & Script"
  },

  "/light/test-cases": {
    screen: "LightTestCases",
    group: "light",
    label: "Test Cases"
  },

  "/light/scripts": {
    screen: "LightScripts",
    group: "light",
    label: "Automation Scripts"
  }
};


// Additional screens available in both themes
[
  ["projects", "Projects", "Projects"],
  ["failures", "Failures", "Failures"],
  ["bugs", "BugReports", "Bug Reports"],
  ["self-healing", "SelfHealing", "Self-Healing"],
  ["analytics", "Analytics", "Analytics"],
  ["settings", "Settings", "Settings"],
  ["help", "Help", "Help & Documentation"],
  ["all-runs", "AllRuns", "All Test Runs"],
  ["report", "RunReport", "Run Report"]
].forEach(([key, screen, label]) => {
  ROUTES[`/dark/${key}`] = {
    screen,
    group: "dark",
    label
  };

  ROUTES[`/light/${key}`] = {
    screen,
    group: "light",
    label
  };
});


// Dark / Light theme switcher
function DesignSwitcher({ route }) {
  const current = ROUTES[route]
    ? ROUTES[route].group
    : "dark";

  const ref = useRef(null);

  useLayoutEffect(() => {
    if (ref.current && window.gsap) {
      window.gsap.from(ref.current, {
        y: 40,
        autoAlpha: 0,
        duration: 0.6,
        delay: 0.6,
        ease: "power3.out"
      });
    }
  }, []);

  const opts = [
    ["dark", "Dark", "/dark/dashboard"],
    ["light", "Light", "/light/dashboard"]
  ];

  // Keep users on the equivalent page when changing themes.
  const ALIAS = {
    upload: {
      light: "create"
    },
    create: {
      dark: "upload"
    },
    runs: {
      light: "runner"
    },
    runner: {
      dark: "runs"
    },
    failure: {
      dark: "failures"
    }
  };

  const parts = route.split("/");
  const page = parts[2];

  const target = (group, fallback) => {
    const name =
      (ALIAS[page] && ALIAS[page][group]) || page;

    const destination = `/${group}/${name}`;

    return ROUTES[destination]
      ? destination
      : fallback;
  };

  // Do not show the theme switcher on authentication pages.
  if (current === "auth") {
    return null;
  }

  return (
    <div
      className="switcher"
      ref={ref}
      role="tablist"
      aria-label="Design theme"
    >
      {opts.map(([key, label, to]) => (
        <button
          key={key}
          className={current === key ? "active" : ""}
          onClick={() => go(target(key, to))}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}


// Main application
function App() {
  const route = useHashRoute();

  // Default to Login instead of the Dashboard.
  const def = ROUTES[route] || ROUTES["/login"];

  // Retrieve the screen component registered globally.
  const Screen = window[def.screen];

  useEffect(() => {
    document.title = `${def.label} — AutoTestAI`;
    window.scrollTo(0, 0);
  }, [route, def.label]);

  return (
    <ToastProvider>
      {Screen ? (
        <Screen
          key={route}
          theme={def.group}
        />
      ) : (
        <div
          style={{
            color: "#fff",
            background: "#101014",
            minHeight: "100vh",
            padding: 40,
            fontFamily: "Arial, sans-serif"
          }}
        >
          <h2>Screen not found</h2>

          <p>
            The screen <strong>{def.screen}</strong> is
            not loaded.
          </p>

          <p>
            Check that the corresponding component exists
            and is loaded by index.html.
          </p>

          <button
            type="button"
            onClick={() => go("/login")}
          >
            Back to Login
          </button>
        </div>
      )}

      {def.group !== "auth" && (
        <DesignSwitcher route={route} />
      )}
    </ToastProvider>
  );
}


// Render the application
ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />);