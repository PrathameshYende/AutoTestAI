/* Mock API responses. Keys are "METHOD path" and mirror the endpoints in js/api.js.
   Replace with a real backend by setting APP_CONFIG.USE_MOCK = false. */
window.MOCK_DB = {
  /* ---------------- Dark: Dashboard ---------------- */
  "GET /dashboard": {
    coverage: { value: 84.6, delta: "+6.2% this sprint" },
    stats: [
      { key: "Total Tests", value: 1248, sub: "+48 this week", icon: "database", tone: "up" },
      { key: "Passed", value: 1174, sub: "94.1% pass", icon: "dot-blue", tone: "pass" },
      { key: "Failed", value: 74, sub: "4 blocking bugs", icon: "dot-red", tone: "fail" },
      { key: "Pass Rate", value: 94.1, decimals: 1, suffix: "%", kind: "rate", pass: 94.1, fail: 5.9 },
      { key: "Workflows", value: 32, sub: "Sync with main branch", icon: "workflow" },
      { key: "Self-Healed", value: 18, sub: "Saved ~14.5 hrs", icon: "zap" }
    ],
    execution: {
      "24H": [
        { id: "#4080", p: 78, f: 6, h: 0 }, { id: "#4081", p: 88, f: 0, h: 4 }, { id: "#4082", p: 70, f: 8, h: 0 },
        { id: "#4083", p: 90, f: 0, h: 3 }, { id: "#4084", p: 72, f: 6, h: 7 }, { id: "#4085", p: 98, f: 0, h: 0 },
        { id: "#4086", p: 56, f: 12, h: 0 }, { id: "#4087", p: 88, f: 0, h: 6 }, { id: "#4088", p: 94, f: 4, h: 0 },
        { id: "#4089", p: 84, f: 0, h: 8 }, { id: "#4090", p: 98, f: 0, h: 0 }, { id: "#4091", p: 92, f: 0, h: 5 },
        { id: "#4092", p: 86, f: 7, h: 0 }, { id: "Live", p: 90, f: 0, h: 10 }
      ],
      "7D": [
        { id: "Mon", p: 80, f: 6, h: 4 }, { id: "Tue", p: 86, f: 3, h: 2 }, { id: "Wed", p: 74, f: 10, h: 5 },
        { id: "Thu", p: 92, f: 2, h: 3 }, { id: "Fri", p: 88, f: 5, h: 6 }, { id: "Sat", p: 60, f: 2, h: 1 }, { id: "Sun", p: 64, f: 1, h: 2 }
      ],
      "30D": [
        { id: "W1", p: 82, f: 8, h: 6 }, { id: "W2", p: 88, f: 5, h: 4 }, { id: "W3", p: 91, f: 4, h: 3 }, { id: "W4", p: 94, f: 3, h: 2 }
      ],
      "90D": [
        { id: "Jul", p: 78, f: 12, h: 8 }, { id: "Aug", p: 86, f: 7, h: 6 }, { id: "Sep", p: 93, f: 4, h: 3 }
      ]
    },
    insights: [
      { type: "UI Regression", icon: "alert-circle", tone: "fail", time: "3m ago", text: "3 tests failed because of UI changes: Login button selector renamed to 'Sign In'.", action: "Review Fix", primary: true },
      { type: "Self-Healed", icon: "wand-2", tone: "heal", time: "25m ago", text: "2 locators automatically repaired: Selector #submit-btn updated.", code: "#submit-btn", meta: "98% confidence", action: "View Diff" },
      { type: "Optimization", icon: "trending-up", tone: "pass", time: "1h ago", text: "Regression suite completed 18% faster via predictive test selection." },
      { type: "Deduplication", icon: "copy", tone: "muted", time: "3h ago", text: "TC-084 overlaps 92% with TC-019 (Password Reset Flow)." }
    ],
    pipeline: [
      ["CV & OCR Model", "YOLO-v9 + Tesseract-Edge"], ["Vision Confidence", "92% Threshold"],
      ["Auto-Heal Strategy", "Predictive Fallback"], ["Last Model Sync", "6 mins ago"]
    ],
    shards: { used: 14, total: 16 },
    runs: [
      { name: "Regression Suite v2.4.1", id: "suite-reg-8812", project: "Student Portal", status: "Passed", duration: "3m 45s", pf: "142 / 0", started: "12m ago", icon: "check-circle-2" },
      { name: "E2E Checkout & Billing", id: "checkout-e2e-fail-04", project: "CloudStore", status: "Failed", duration: "5m 18s", pf: "82 / 4", started: "45m ago", icon: "alert-circle" },
      { name: "Authentication & MFA Flow", id: "auth-mfa-live", project: "Core Auth", status: "Running", duration: "1m 20s", pf: "28 / 34", started: "Just now", icon: "refresh-cw" },
      { name: "Enrollment Wizard v3", id: "portal-enroll-q", project: "Student Portal", status: "Queued", duration: "--", pf: "0 / 58", started: "1h ago", icon: "hourglass" },
      { name: "Admin Permissions Matrix", id: "iam-sec-healed", project: "IAM Portal", status: "Healed", duration: "4m 02s", pf: "96 (2 healed)", started: "2h ago", icon: "zap" }
    ]
  },

  /* ---------------- Dark: Upload Recording ---------------- */
  "GET /recordings/current": {
    stages: [
      { n: "01", name: "Recording", sub: "Completed", state: "done" },
      { n: "02", name: "Frame Extraction", sub: "1,840 Frames", state: "done" },
      { n: "03", name: "UI Detection", sub: "In Progress (42 nodes)", state: "active" },
      { n: "04", name: "OCR Text", sub: "Queued", state: "queued", icon: "hourglass" },
      { n: "05", name: "Semantic Graph", sub: "Queued", state: "queued", icon: "brain-circuit" },
      { n: "06", name: "Test Specs", sub: "Queued", state: "queued", icon: "check-square" },
      { n: "07", name: "Script Synthesizer", sub: "Queued", state: "queued", icon: "terminal-square" }
    ],
    video: { file: "student_registration_flow_v2.mp4", size: "48.2 MB", codec: "H.264 / AAC High-Res", bitrate: "14.2 Mbps", time: "02:45.18", res: "1080p 60fps" },
    synthesis: [
      { title: "Detect UI controls & components", sub: "Computer vision bounding boxes on buttons, modals, dropdowns", icon: "scan-line", on: true },
      { title: "Extract dynamic text with OCR", sub: "Label parsing, inline hints, input value assertions", icon: "scan-text", on: true },
      { title: "Generate automated test cases", sub: "Synthesizes happy paths, negative assertions, edge boundaries", icon: "git-branch", on: true },
      { title: "Generate production automation script", sub: "Clean Page Object Model (POM) Playwright TypeScript functions", icon: "code-2", on: true },
      { title: "Enable autonomous self-healing", sub: "Persists 5-tier fallback locators (XPath, ARIA, CV, Coordinates)", icon: "bandage", on: true, smart: true }
    ]
  },
  "POST /recordings/analyze": { ok: true, message: "Analysis started — workflow WF-014 queued (6 tests)." },

  /* ---------------- Dark: Test Cases ---------------- */
  "GET /test-cases": {
    suite: "STU-REG-2024",
    stats: [
      { k: "Total Scenarios", v: 18, badge: "100% Tree", fill: 100 },
      { k: "Approved Coverage", v: 14, of: 18, badge: "77.7% Done", fill: 77.7 },
      { k: "Review Queue", v: 4, badge: "Needs Triage", fill: 22, warn: true },
      { k: "Auto-Coverage Score", v: 96.4, decimals: 1, suffix: "%", badge: "Optimal", fill: 96.4 }
    ],
    cases: [
      { id: "TC-001", title: "Login with valid credentials and navigate to Student Dashboard", type: "Functional", priority: "High", steps: 8, expected: "User reaches dashboard with welcome banner", status: "Approved", checked: true },
      { id: "TC-002", title: "Login with invalid password and verify lockout warning", type: "Negative", priority: "High", steps: 5, expected: "Display 'Invalid credentials' toast", status: "Approved", checked: true },
      { id: "TC-003", title: "Submit student registration with empty required fields", type: "Boundary", priority: "Medium", steps: 7, expected: "Inline validation errors on First Name", status: "Needs Review", checked: false },
      { id: "TC-004", title: "SQL injection attempt in search bar (' OR '1'='1)", type: "Security", priority: "Critical", steps: 4, expected: "Input sanitized, no DB leak", status: "Approved", checked: true },
      { id: "TC-005", title: "Add student with maximum 255-character string in name", type: "Boundary", priority: "Low", steps: 6, expected: "Data truncated or validated", status: "Approved", checked: true }
    ],
    trace: [
      { t: "Navigate to route", code: "/login", tag: "Verify HTTP 200", ms: "120ms" },
      { t: "Fill input", code: "#username", rest: " with sarah.jenkins@test.edu", note: "Auto-filled", ms: "45ms" },
      { t: "Fill secret input", code: "#password", rest: " with masked variable $TEST_SECRET", note: "Vault Encrypted", ms: "35ms" },
      { t: "Click submission control", code: "button[type=\"submit\"]", tag: "Expect redirect /dashboard", ms: "340ms" },
      { t: "Assert target element", code: ".student-table", rest: " is attached & visible", tag: "Timeout 2000ms", ms: "210ms" }
    ],
    matrix: [["#username", "data-testid priority"], ["#password", "name match"], [".student-table", "visual-anchor"]]
  },
  "POST /test-cases/synthesize": { ok: true, message: "3 new edge cases synthesized and added to the suite." },

  /* ---------------- Dark: Workflow Builder ---------------- */
  "GET /workflows/WF-014": {
    title: "WF-014: Student Registration Flow",
    telemetry: [["UI Elements", 42], ["Text / OCR", 67], ["Actions Found", 19], ["Flow Confidence", "96%"]],
    nodes: [
      { n: "01", kind: "TRIGGER", title: "Navigate & Initial Page Load", conf: "100%", url: "https://staging.studentportal.io/login", ms: "240ms", tone: "blue" },
      { n: "02", kind: "INPUT", title: "Fill Username Field", conf: "99%", fields: [["Target:", "#username-field"], ["Value:", "sarah.jenkins@test.edu"]], tone: "blue" },
      { n: "03", kind: "INPUT", title: "Enter Secure Password", conf: "99%", fields: [["Target:", "#password-field"], ["Value:", "••••••••••••"]], tone: "blue" },
      { n: "04", kind: "CLICK ACTION", title: "Submit Login Form", conf: "98%", fields: [["Elem:", "button[type='submit']"], ["Text:", "\"Login\""], ["Box:", "[x:480, y:320]"]], tone: "purple" },
      { n: "05", kind: "TRANSITION", title: "Dashboard Rendered & Verified", conf: "97%", fields: [["Selector:", ".welcome-banner"], ["OCR Match:", "\"Welcome back, Sarah\""]], tone: "blue" },
      { n: "06", kind: "NAVIGATE", title: "Click Menu Item", conf: "96%", fields: [["Target:", "nav a[href='/students']"], ["Label:", "\"Student Management\""]], tone: "purple" },
      { n: "07", kind: "ACTION", title: "Open \"Add Student\" Modal", conf: "98%", fields: [["Button ID:", "#add-student-btn"], ["Prompt:", "\"+ Add Student\""]], tone: "purple" },
      { n: "08", kind: "SUBMIT", title: "Fill Record & Click \"Save Record\"", conf: "96%", fields: [["Target:", "#save-btn (dispatch HTTP POST)"]], terminal: true, tone: "purple" }
    ],
    fallbacks: [["button.btn-primary.submit", "CSS"], ["//button[contains(text(),'Login')]", "XPath"]],
    attrs: [["type:", "\"submit\""], ["data-testid:", "\"login-submit\""], ["aria-label:", "\"Submit login form\""], ["Coordinates:", "x: 480, y: 320, w: 124, h: 40"]]
  },

  /* ---------------- Dark: Automation Scripts ---------------- */
  "GET /scripts/TC-001": {
    locators: [
      { loc: "page.get_by_label(\"Username\")", note: "Direct accessible DOM match", conf: "99%", target: "#input-user" },
      { loc: "page.get_by_label(\"Password\")", note: "Direct accessible DOM match", conf: "99%", target: "#input-pwd" },
      { loc: "page.get_by_role(\"button\", name=\"Login\")", note: "AI Healed from legacy", legacy: "#login", conf: "96%", target: "ARIA Tree", healed: true },
      { loc: "page.locator(\"button.add-student\")", note: "Class-scoped token match", conf: "94%", target: "POM Target" }
    ],
    stability: { value: 97.8, delta: "+4.2%" }
  },
  "POST /runs": { ok: true, message: "Test run #1249 dispatched to Local Daemon." },

  /* ---------------- Dark: Live runner ---------------- */
  "GET /runs/live": {
    runId: "#RC-2410-098",
    title: "Regression Test Suite — Release Candidate 2.4.1",
    worker: "Worker Grid: #04 (US-East)",
    completed: 80, total: 82,
    stats: { passed: 68, failed: 4, running: 2, skipped: 8, clock: "04m 18s", eta: "00m 42s" },
    trace: [
      ["00:01", "Open studentportal application", "420ms"], ["00:03", "Enter username in #auth-input", "110ms"],
      ["00:04", "Enter secret password", "95ms"], ["00:05", "Click \"Login to Dashboard\"", "680ms"],
      ["00:07", "Assert dashboard header presence", "310ms"], ["00:10", "Trigger modal open action", "240ms"],
      ["00:14", "Fill enrollment details formData", "410ms"]
    ],
    logs: [
      { t: "14:22:01.002", lvl: "INFO", msg: "Headless Chromium Context initialized. Viewport=[1920, 1080], User-Agent=\"AutoTest-Grid/2.4\"." },
      { t: "14:22:04.118", lvl: "INFO", msg: "Session credentials dispatched from encrypted vault `TEST_VAULT_PROD`." },
      { t: "14:22:07.450", lvl: "INFO", msg: "Element 'get_by_role(\"button\", name=\"Login\")' clicked. Navigation state reached 'domcontentloaded'." },
      { t: "14:22:10.820", lvl: "INFO", msg: "Form rendered with 14 input fields. Synthetic user interactions beginning..." },
      { t: "14:22:15.304", lvl: "WARN", msg: "Locator 'button.save-btn' timed out after 3000ms. Element is obscured or selector changed in release v2.4.1." },
      { t: "14:22:16.022", lvl: "AI_HEAL", msg: "Visual & DOM Embedding model activated. Matched fallback locator 'button[data-action=\"save-student\"]' (Confidence score: 94.2%)." },
      { t: "14:22:17.100", lvl: "RESUME", msg: "Retrying assertion with healed element descriptor... Dispatched synthetic PointerDown event." }
    ],
    triage: ["TC-042: OAuth Token Expiry", "TC-055: File Upload Boundary", "TC-061: Grade Export CSV"]
  },
  "POST /runs/live/pause": { ok: true, message: "Suite paused. 2 workers draining." },
  "POST /runs/live/stop": { ok: true, message: "Execution stopped." },
  "POST /jira/tickets": { ok: true, message: "3 Jira tickets created in QA board." },

  /* ---------------- Light: QA Dashboard ---------------- */
  "GET /qa/dashboard": {
    stats: [
      { k: "Total Tests", v: 1248, sub: "+48 this week", icon: "list-checks", tone: "up" },
      { k: "Passed", v: 1174, sub: "94.1% pass rate", icon: "dot-green" },
      { k: "Failed", v: 74, sub: "12 require attention", badge: "12 CRITICAL", tone: "fail" },
      { k: "Pass Rate", v: 94.1, decimals: 1, suffix: "%", sub: "+2.4% vs last sprint", icon: "percent", tone: "upgreen" },
      { k: "Self-Healed", v: 18, sub: "Auto-repaired locators", icon: "wand-2", tone: "link" },
      { k: "Active Workflows", v: 32, sub: "Covering 8 modules", icon: "workflow" }
    ],
    chart: {
      "24h": [{ d: "00h", p: 200, f: 18, s: 6 }, { d: "06h", p: 150, f: 10, s: 4 }, { d: "12h", p: 210, f: 14, s: 8 }, { d: "18h", p: 190, f: 12, s: 6 }, { d: "Now", p: 220, f: 16, s: 8 }],
      "7d": [{ d: "Oct 18", p: 220, f: 18, s: 6 }, { d: "Oct 19", p: 205, f: 16, s: 8 }, { d: "Oct 20", p: 190, f: 14, s: 6 }, { d: "Oct 21", p: 232, f: 14, s: 6 }, { d: "Oct 22", p: 225, f: 14, s: 6 }, { d: "Oct 23", p: 170, f: 10, s: 6 }, { d: "Today", p: 235, f: 12, s: 8 }],
      "14d": [{ d: "Wk 41", p: 210, f: 20, s: 8 }, { d: "Wk 42", p: 230, f: 14, s: 6 }],
      "30d": [{ d: "Sep", p: 205, f: 22, s: 10 }, { d: "Oct", p: 228, f: 14, s: 6 }]
    },
    runs: [
      { id: "#TR-1248", project: "Student Portal Auth", status: "Running", tests: 82, passed: 68, failed: 4, duration: "2m 14s", time: "Just now" },
      { id: "#TR-1247", project: "Billing & Checkout", status: "Passed", tests: 142, passed: 142, failed: 0, duration: "4m 38s", time: "24m ago" },
      { id: "#TR-1246", project: "Student Gradebook UI", status: "Failed", tests: 96, passed: 88, failed: 8, duration: "3m 12s", time: "1h ago" },
      { id: "#TR-1245", project: "Course Registration", status: "Passed", tests: 210, passed: 208, failed: "2 (healed)", duration: "6m 05s", time: "3h ago" },
      { id: "#TR-1244", project: "User Settings & MFA", status: "Queued", tests: 64, passed: "-", failed: "-", duration: "-", time: "4h ago" }
    ],
    insights: [
      { tone: "fail", title: "3 tests failed because of UI changes", time: "12m ago", body: ["Button label ", "'Login'", " changed to ", "'Sign In'", " in Student Auth flow."], link: "Review Fixes" },
      { tone: "link", icon: "wand-2", title: "2 locators were automatically repaired", time: "1h ago", body: ["Dynamic CSS selector self-healed using Playwright semantic role locators."], link: "View Healing Log" },
      { tone: "pass", icon: "gauge", title: "Regression execution time improved by 18%", time: "3h ago", body: ["Parallel headless worker optimization reduced suite run by 1m 20s."] },
      { tone: "fail", icon: "alert-triangle", title: "1 workflow requires review", time: "5h ago", body: ["Multi-step modal dismissed unexpectedly during 'Add Student'."], link: "Inspect Node" }
    ],
    health: [["Auth & SSO", 100], ["Student Enrollment", 98], ["Fee Payment Gateway", 96], ["Grade Submission", 88, true]]
  },

  /* ---------------- Light: Create Test ---------------- */
  "GET /qa/create": {
    file: { name: "recording_student_login_and_create.mp4", size: "14.2 MB", res: "1080p 60fps", codec: "H.264 / AAC", dur: "01:42" },
    progress: 94,
    stages: [
      { t: "Recording uploaded", s: "14.2 MB verified · Checksum matched", state: "done" },
      { t: "Frames extracted", s: "184 keyframes sampled at 2.0fps interval", state: "done" },
      { t: "Detecting UI elements", s: "28 interactable DOM elements identified", state: "active", pct: 94 },
      { t: "Understanding workflow", s: "Queued · Awaiting element dependency graph", state: "queued" },
      { t: "Generating test cases", s: "Queued · ~6 test scenarios estimated", state: "queued" },
      { t: "Generating automation script", s: "Queued · Playwright Python POM", state: "queued" }
    ],
    heuristics: [
      ["Detect UI elements", "Locates buttons, inputs, tables, and dropdowns with YOLO-v9 computer vision"],
      ["Extract text with OCR", "Extracts precise visual labels, placeholder values, aria-attributes, and toast feedback"],
      ["Generate test cases", "Produces structured positive paths, boundary conditions, and standard negative suites"],
      ["Generate automation script", "Outputs idiomatic Python Playwright pytest code with Page Object Model abstractions"],
      ["Enable self-healing locators", "Binds multi-strategy selector graphs (text, XPath, visual fingerprint) to resist layout drift"]
    ],
    stdout: [
      { c: "", t: "[INFO] 00:14.240 frame_idx=82: Detected input[type=\"text\"] (confidence=0.99)" },
      { c: "", t: "[INFO] 00:16.890 frame_idx=95: Keystroke sequence recorded -> 'admin@portal.edu'" },
      { c: "", t: "[INFO] 00:18.510 frame_idx=104: Click action detected on button#login-btn" },
      { c: "ok", t: "[OCR] Extracted 14 text tokens: [\"Student Management\", \"Add New\", \"Sign In\", \"Password\"]" },
      { c: "", t: "[INFO] 00:22.100 frame_idx=140: Navigation event -> /dashboard/students (HTTP 200)" }
    ]
  },
  "POST /qa/analyze": { ok: true, message: "Recording queued for analysis — 6 tests will be generated." },

  /* ---------------- Light: Failure Analysis ---------------- */
  "GET /qa/failures/TC-001": {
    healing: [
      { tc: "TC-001", name: "Login Test", el: "Login Button", prev: "#login-btn (\"Login\")", next: "get_by_role(\"button\", name=\"Sign In\")", conf: "96%", status: "Healed" },
      { tc: "TC-042", name: "Add Student Modal", el: "Save Button", prev: "button.btn-save", next: "button:has-text(\"Submit Student\")", conf: "91%", status: "Healed" },
      { tc: "TC-108", name: "Gradebook Filter", el: "Semester Dropdown", prev: "select#term", next: "div[role=\"combobox\"][name=\"Term\"]", conf: "84%", status: "Review Required" },
      { tc: "TC-019", name: "Student Search", el: "Search Input", prev: "input#search-box", next: "input[placeholder=\"Search by ID or name\"]", conf: "95%", status: "Healed" },
      { tc: "TC-231", name: "Course Enrollment", el: "Confirm Dialog", prev: ".modal-footer > .ok", next: "[data-testid=\"confirm-enroll\"]", conf: "78%", status: "Review Required" }
    ],
    summary: { attempts: 24, repaired: 18, review: 6, rate: "75%" }
  },
  "POST /qa/failures/TC-001/apply-fix": { ok: true, message: "Fix applied to tests/e2e/auth/student_login.spec.ts:38" },

  /* ---------------- Light: Live Runner ---------------- */
  "GET /qa/runs/1248": {
    counts: { passed: 68, failed: 4, running: 2, queued: 8, total: 82 },
    elapsed: "02:46", remaining: "00:22",
    sequence: [
      { t: "Open application", s: "200 OK · 340ms load", time: "00:01.2", state: "done", green: true },
      { t: "Enter username \"admin_qa\"", s: "locator.fill(\"input#username\")", time: "00:03.1", state: "done" },
      { t: "Enter password \"••••••••\"", s: "locator.fill(\"input#password\")", time: "00:04.2", state: "done" },
      { t: "Click Login", s: "Transition to /dashboard (redirect: 410ms)", time: "00:05.8", state: "done" },
      { t: "Verify Dashboard metrics loaded", s: "expect(metrics_grid).to_be_visible()", time: "00:08.4", state: "done", green: true },
      { t: "Navigate to /students/list", s: "page.goto('/students/list')", time: "00:12.1", state: "done" },
      { t: "Fill Student Form (\"Jane Doe\")", s: "Dispatched input payload & evaluating validation triggers", time: "00:15.6", state: "active" },
      { t: "Click \"Save Student\"", s: "locator.click(\"button#btn_submit\")", time: "queued", state: "queued" }
    ],
    logs: [
      ["14:32:01.102", "playwright", "browser.new_context: viewport={'width': 1920, 'height': 1080} user_agent='Mozilla/5.0 AutoTest/2.4'"],
      ["14:32:02.441", "navigate", "GET https://app.studentportal.demo/login -> ", "200 OK", " (312ms)"],
      ["14:32:04.810", "action", "locator.fill(\"input#username\") -> value set"],
      ["14:32:06.120", "action", "locator.click(\"button:has-text('Login')\") -> trigger navigation event"],
      ["14:32:08.550", "assert", "expect(page).to_have_url(\"/dashboard\") -> ", "PASSED"],
      ["14:32:12.019", "navigate", "page.goto(\"https://app.studentportal.demo/students/add\") -> ", "200 OK", " (180ms)"],
      ["14:32:15.201", "action", "locator.fill(\"input#first_name\") -> typing \"Jane\""],
      ["14:32:15.840", "action", "locator.fill(\"input#last_name\") -> typing \"Doe\""]
    ]
  },

  /* ---------------- Light: Workflow & Script ---------------- */
  "GET /qa/workflows/WF-104": {
    groups: [
      { title: "NODE 1: USER AUTHENTICATION", steps: [
        { n: "01", t: "Open Application", meta: "https://app.studentportal.demo/login", arrow: true, conf: "99%" },
        { n: "02", t: "Enter Username", sel: "input[name=\"username\"]", val: "\"testuser\"", conf: "99%" },
        { n: "03", t: "Enter Password", sel: "input[name=\"password\"]", val: "••••••••", conf: "98%" },
        { n: "04", t: "Click Login", sel: "button \"Login\"", conf: "98%", focus: true }
      ] },
      { title: "NODE 2: NAVIGATION & ROUTING", steps: [
        { n: "05", t: "Verify Dashboard URL", check: "\"/dashboard\"", conf: "100%" },
        { n: "06", t: "Click \"Student Management\" link", sel: "a[href=\"/students\"]", conf: "97%" }
      ] },
      { title: "NODE 3: STUDENT CREATION ACTION", steps: [
        { n: "07", t: "Click \"Add Student\" button", sel: "button#btn-create", conf: "99%" },
        { n: "08", t: "Fill Student Form & Click \"Save\"", sel: "form#student-registration", conf: "96%" }
      ] }
    ],
    tests: [
      { id: "TC-001", name: "Login with valid credentials", type: "Functional", pr: "High", steps: 5 },
      { id: "TC-002", name: "Login with invalid password", type: "Negative", pr: "High", steps: 4 },
      { id: "TC-003", name: "Empty login fields validation", type: "Boundary", pr: "Medium", steps: 3 },
      { id: "TC-004", name: "SQL injection in username field", type: "Security", pr: "Critical", steps: 4 }
    ]
  }
};
