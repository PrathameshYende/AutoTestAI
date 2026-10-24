/* Mock responses for the extension screens (pages the Figma links to but doesn't draw). */
Object.assign(window.MOCK_DB, {
  "GET /projects": [
    { id: "smp", name: "Student Management Portal", repo: "acme/student-portal", branch: "main", framework: "Playwright", health: 96, passRate: 94.1, tests: 412, workflows: 14, lastRun: "12m ago", status: "Passing", env: ["Staging", "Production"], trend: [88, 90, 89, 92, 93, 92, 94], owners: ["PS", "AC", "MR"] },
    { id: "cloudstore", name: "CloudStore", repo: "acme/cloudstore-web", branch: "release/3.2", framework: "Playwright", health: 82, passRate: 87.4, tests: 298, workflows: 9, lastRun: "45m ago", status: "Failing", env: ["Staging"], trend: [91, 90, 86, 88, 84, 86, 87], owners: ["JK", "PS"] },
    { id: "core-auth", name: "Core Auth", repo: "acme/identity", branch: "main", framework: "Playwright", health: 99, passRate: 99.2, tests: 156, workflows: 4, lastRun: "Just now", status: "Running", env: ["Staging", "Production"], trend: [97, 98, 98, 99, 99, 98, 99], owners: ["AC"] },
    { id: "iam", name: "IAM Portal", repo: "acme/iam-admin", branch: "main", framework: "Selenium", health: 91, passRate: 92.8, tests: 204, workflows: 6, lastRun: "2h ago", status: "Healed", env: ["Production"], trend: [89, 90, 92, 91, 93, 92, 93], owners: ["MR", "JK"] },
    { id: "gradebook", name: "Student Gradebook", repo: "acme/gradebook-ui", branch: "feature/grades-v2", framework: "Playwright", health: 74, passRate: 81.0, tests: 96, workflows: 3, lastRun: "1h ago", status: "Failing", env: ["Staging"], trend: [85, 84, 80, 78, 82, 79, 81], owners: ["PS"] },
    { id: "billing", name: "Billing & Checkout", repo: "acme/billing", branch: "main", framework: "Cypress", health: 100, passRate: 100, tests: 142, workflows: 5, lastRun: "24m ago", status: "Passing", env: ["Staging", "Production"], trend: [98, 99, 100, 100, 99, 100, 100], owners: ["AC", "MR"] }
  ],
  "POST /projects": { ok: true, message: "Project created. Upload a recording to teach AutoTestAI its first workflow." },

  "GET /failures": [
    { id: "F-2041", test: "TC-001", title: "Login with valid credentials", suite: "Regression v2.4.1", run: "#TR-1246", cause: "UI Change", detail: "Login button label changed from 'Login' to 'Sign In'.", step: "Step 4 of 6", conf: 94, age: "12m ago", oldLoc: "page.get_by_role(\"button\", name=\"Login\")", newLoc: "page.get_by_role(\"button\", name=\"Sign In\")", fixable: true },
    { id: "F-2040", test: "TC-042", title: "Add Student modal saves record", suite: "Regression v2.4.1", run: "#TR-1248", cause: "UI Change", detail: "Save button class renamed: button.save-btn → [data-action=\"save-student\"].", step: "Step 8 of 9", conf: 91, age: "18m ago", oldLoc: "page.locator(\"button.save-btn\")", newLoc: "page.locator(\"[data-action='save-student']\")", fixable: true },
    { id: "F-2039", test: "TC-055", title: "File upload rejects files over 500MB", suite: "E2E Checkout & Billing", run: "#TR-1246", cause: "Real Bug", detail: "Server accepted a 612MB upload; expected HTTP 413.", step: "Step 3 of 5", conf: 97, age: "45m ago", fixable: false },
    { id: "F-2038", test: "TC-061", title: "Grade export produces valid CSV", suite: "Student Gradebook UI", run: "#TR-1246", cause: "Real Bug", detail: "Exported CSV columns out of order: 'Grade' appears before 'Student ID'.", step: "Step 5 of 5", conf: 88, age: "1h ago", fixable: false },
    { id: "F-2037", test: "TC-042", title: "OAuth token refresh keeps session", suite: "Core Auth", run: "#TR-1243", cause: "Flaky", detail: "Passed 7 of the last 10 runs. Timing-sensitive wait on token refresh.", step: "Step 2 of 4", conf: 72, age: "3h ago", fixable: false, resolved: "Quarantined" },
    { id: "F-2036", test: "TC-108", title: "Gradebook filter by semester", suite: "Student Gradebook UI", run: "#TR-1241", cause: "Environment", detail: "Staging database seed missing 'Fall 2025' term.", step: "Step 1 of 4", conf: 83, age: "5h ago", fixable: false, resolved: "Ignored" }
  ],
  "POST /failures/fix": { ok: true, message: "Healed locator committed. Re-run queued for the affected test." },
  "POST /failures/rerun": { ok: true, message: "Re-run dispatched to worker grid." },

  "GET /bugs": [
    { id: "BUG-318", title: "Upload accepts files over the 500MB limit", severity: "Critical", status: "Open", test: "TC-055", jira: "QA-1182", assignee: "JK", created: "45m ago", project: "CloudStore", env: "Staging · Chromium 126", steps: ["Open /billing/attachments", "Choose a 612MB PDF", "Click Upload", "Observe HTTP 200 instead of 413"], expected: "Upload rejected with 'File exceeds 500MB'.", actual: "File stored; quota exceeded silently." },
    { id: "BUG-317", title: "Grade export CSV has columns out of order", severity: "High", status: "In Progress", test: "TC-061", jira: "QA-1179", assignee: "PS", created: "1h ago", project: "Student Gradebook", env: "Staging · Chromium 126", steps: ["Open Gradebook", "Select course CS-201", "Click Export CSV", "Open file"], expected: "Columns: Student ID, Name, Grade.", actual: "Columns: Grade, Student ID, Name." },
    { id: "BUG-316", title: "Session lost after OAuth refresh on slow networks", severity: "Medium", status: "Open", test: "TC-042", jira: null, assignee: null, created: "3h ago", project: "Core Auth", env: "Staging · WebKit 17.4", steps: ["Log in", "Throttle network to Slow 3G", "Wait 15 minutes", "Navigate to /profile"], expected: "User stays signed in.", actual: "Redirected to /login." },
    { id: "BUG-311", title: "Enrollment wizard step 3 ignores required fields", severity: "High", status: "Resolved", test: "TC-003", jira: "QA-1160", assignee: "MR", created: "2d ago", project: "Student Management Portal", env: "Production · Chromium 126", steps: ["Start enrollment", "Leave First Name empty", "Click Next"], expected: "Inline validation error.", actual: "Proceeds to step 4." },
    { id: "BUG-305", title: "Search allows SQL wildcard injection", severity: "Critical", status: "Resolved", test: "TC-004", jira: "QA-1141", assignee: "AC", created: "4d ago", project: "Student Management Portal", env: "Staging · Chromium 125", steps: ["Type ' OR '1'='1 in search", "Submit"], expected: "Input sanitized.", actual: "All records returned." }
  ],
  "POST /bugs": { ok: true, message: "Bug report created." },
  "POST /bugs/jira": { ok: true, message: "Jira issue QA-1183 created and linked." },

  "GET /healing": {
    summary: { attempts: 124, healed: 98, review: 14, rejected: 12, rate: 79, hours: 46.5 },
    strategies: [["Semantic role (ARIA)", 46], ["Text alias match", 22], ["Data-testid fallback", 16], ["XPath ancestry", 9], ["Visual fingerprint (CV)", 5], ["Coordinates", 2]],
    events: [
      { id: "H-981", tc: "TC-001", project: "Student Portal", el: "Login Button", prev: "#login-btn", next: "get_by_role(\"button\", name=\"Sign In\")", strategy: "Semantic role", conf: 96, status: "Healed", when: "12m ago" },
      { id: "H-980", tc: "TC-042", project: "Student Portal", el: "Save Button", prev: "button.save-btn", next: "[data-action=\"save-student\"]", strategy: "Data-testid", conf: 94, status: "Healed", when: "18m ago" },
      { id: "H-979", tc: "TC-108", project: "Gradebook", el: "Semester Dropdown", prev: "select#term", next: "div[role=\"combobox\"][name=\"Term\"]", strategy: "Semantic role", conf: 84, status: "Pending", when: "1h ago" },
      { id: "H-978", tc: "TC-019", project: "Student Portal", el: "Search Input", prev: "input#search-box", next: "input[placeholder=\"Search by ID or name\"]", strategy: "Text alias", conf: 95, status: "Healed", when: "2h ago" },
      { id: "H-977", tc: "TC-231", project: "Student Portal", el: "Confirm Dialog", prev: ".modal-footer > .ok", next: "[data-testid=\"confirm-enroll\"]", strategy: "Data-testid", conf: 78, status: "Pending", when: "3h ago" },
      { id: "H-976", tc: "TC-077", project: "CloudStore", el: "Cart Badge", prev: "span.badge-count", next: "//header//span[contains(@class,'count')]", strategy: "XPath ancestry", conf: 69, status: "Rejected", when: "5h ago" },
      { id: "H-975", tc: "TC-090", project: "IAM Portal", el: "Role Toggle", prev: "#role-admin", next: "visual:hash(9f3a…)@(812,344)", strategy: "Visual (CV)", conf: 81, status: "Pending", when: "6h ago" }
    ]
  },
  "POST /healing/decision": { ok: true, message: "Decision saved. The locator map was updated." },

  "GET /analytics": {
    kpis: [["Pass rate", 94.1, 1, "%", "+2.4%", "ok"], ["Flakiness index", 1.2, 1, "%", "-0.3%", "ok"], ["Avg. run time", 3.4, 1, "m", "-18%", "ok"], ["Tests executed", 18420, 0, "", "+12%", "info"], ["Auto-healed", 98, 0, "", "+21", "ai"]],
    trend: {
      labels: ["W32", "W33", "W34", "W35", "W36", "W37", "W38", "W39", "W40", "W41", "W42", "W43"],
      pass: [86.2, 87.5, 88.1, 87.0, 89.4, 90.2, 91.0, 90.4, 92.3, 92.8, 93.6, 94.1],
      flaky: [3.4, 3.1, 3.3, 2.9, 2.6, 2.4, 2.1, 2.2, 1.8, 1.6, 1.5, 1.2]
    },
    volume: [{ id: "W38", p: 1320, f: 96, h: 40 }, { id: "W39", p: 1410, f: 88, h: 52 }, { id: "W40", p: 1490, f: 81, h: 58 }, { id: "W41", p: 1530, f: 74, h: 61 }, { id: "W42", p: 1610, f: 70, h: 66 }, { id: "W43", p: 1680, f: 74, h: 71 }],
    causes: [["UI change", 41, "var(--c-heal)"], ["Real bug", 27, "var(--c-fail)"], ["Flaky timing", 18, "var(--warn-c)"], ["Environment", 14, "var(--c-skip)"]],
    flaky: [["TC-042", "OAuth token refresh keeps session", 30, "Core Auth"], ["TC-118", "Calendar renders week view", 22, "Student Portal"], ["TC-077", "Cart badge updates count", 18, "CloudStore"], ["TC-203", "Notification toast dismisses", 12, "Student Portal"]],
    suites: [["Regression v2.4.1", 225], ["E2E Checkout & Billing", 318], ["Auth & MFA", 80], ["Enrollment Wizard", 190], ["Admin Permissions", 242]],
    coverage: [["Auth & SSO", 100], ["Student Enrollment", 92], ["Fee Payment", 88], ["Gradebook", 71], ["Reports", 54]]
  },

  "GET /runs": [
    { id: "#TR-1248", suite: "Full Regression Suite", project: "Student Management Portal", branch: "main", trigger: "GitHub Actions #4092", status: "Running", passed: 68, failed: 4, total: 82, duration: "2m 46s", started: "Just now", env: "Staging" },
    { id: "#TR-1247", suite: "Billing & Checkout", project: "Billing & Checkout", branch: "main", trigger: "Scheduled (hourly)", status: "Passed", passed: 142, failed: 0, total: 142, duration: "4m 38s", started: "24m ago", env: "Staging" },
    { id: "#TR-1246", suite: "Student Gradebook UI", project: "Student Gradebook", branch: "feature/grades-v2", trigger: "Pull request #318", status: "Failed", passed: 88, failed: 8, total: 96, duration: "3m 12s", started: "1h ago", env: "Staging" },
    { id: "#TR-1245", suite: "Course Registration", project: "Student Management Portal", branch: "main", trigger: "GitHub Actions #4088", status: "Healed", passed: 208, failed: 2, total: 210, duration: "6m 05s", started: "3h ago", env: "Staging" },
    { id: "#TR-1244", suite: "User Settings & MFA", project: "Core Auth", branch: "main", trigger: "Manual (Priya Sharma)", status: "Queued", passed: 0, failed: 0, total: 64, duration: "-", started: "4h ago", env: "Production" },
    { id: "#TR-1243", suite: "Auth & MFA Flow", project: "Core Auth", branch: "main", trigger: "Scheduled (nightly)", status: "Passed", passed: 62, failed: 0, total: 62, duration: "1m 58s", started: "8h ago", env: "Production" },
    { id: "#TR-1242", suite: "E2E Checkout & Billing", project: "CloudStore", branch: "release/3.2", trigger: "Pull request #771", status: "Failed", passed: 82, failed: 4, total: 86, duration: "5m 18s", started: "10h ago", env: "Staging" },
    { id: "#TR-1241", suite: "Admin Permissions Matrix", project: "IAM Portal", branch: "main", trigger: "Scheduled (nightly)", status: "Healed", passed: 96, failed: 0, total: 96, duration: "4m 02s", started: "14h ago", env: "Production" }
  ],

  "GET /runs/report": {
    id: "#TR-1247", suite: "Billing & Checkout", project: "Billing & Checkout", branch: "main", commit: "a91f3c2", trigger: "Scheduled (hourly)",
    started: "Today 13:58:04", duration: "4m 38s", env: "Staging · Chromium 126 · 8 workers",
    totals: { passed: 136, failed: 3, healed: 3, skipped: 0, total: 142 },
    suites: [["Cart & pricing", 34, 0, "58s"], ["Checkout flow", 41, 2, "1m 32s"], ["Payments (Stripe test mode)", 28, 1, "1m 04s"], ["Invoices & receipts", 22, 0, "41s"], ["Refunds", 17, 0, "23s"]],
    failed: [["TC-311", "Apply expired coupon shows error", "Checkout flow", "Assertion: toast text mismatch"], ["TC-318", "Guest checkout with saved address", "Checkout flow", "Timeout waiting for #address-autofill"], ["TC-402", "3-D Secure challenge completes", "Payments (Stripe test mode)", "iframe not attached within 5000ms"]],
    workers: [[0, 62], [4, 88], [2, 71], [6, 95], [1, 54], [3, 90], [0, 79], [5, 84]],
    artifacts: [["HTML report", "report.html", "1.2 MB"], ["Video recordings", "videos.zip", "84 MB"], ["Playwright traces", "traces.zip", "36 MB"], ["JUnit XML", "junit.xml", "48 KB"]]
  },

  "GET /notifications": [
    { id: 1, tone: "bad", icon: "circle-alert", title: "Run #TR-1246 failed", body: "8 tests failed in Student Gradebook UI.", time: "1h ago", to: "failures", unread: true },
    { id: 2, tone: "ai", icon: "wand-sparkles", title: "2 locators auto-healed", body: "Login and Save buttons repaired with 95% avg confidence.", time: "18m ago", to: "self-healing", unread: true },
    { id: 3, tone: "warn", icon: "triangle-alert", title: "3 repairs need review", body: "Confidence below the 85% auto-approve threshold.", time: "1h ago", to: "self-healing", unread: true },
    { id: 4, tone: "ok", icon: "circle-check", title: "Billing & Checkout passed", body: "142 / 142 tests in 4m 38s.", time: "24m ago", to: "report", unread: false },
    { id: 5, tone: "info", icon: "bug", title: "BUG-318 assigned to Jordan K.", body: "Upload accepts files over the 500MB limit.", time: "45m ago", to: "bugs", unread: false }
  ],

  "GET /settings": {
    workspace: "Enterprise Core", timezone: "UTC+05:30 (IST)", framework: "Playwright", language: "Python",
    ai: { threshold: 85, autoHeal: true, model: "Vision-CodeGen-v3", dedupe: true, predictive: true },
    integrations: [
      { id: "github", name: "GitHub", desc: "Trigger runs from pull requests and post status checks.", icon: "github", connected: true, meta: "acme · 6 repositories" },
      { id: "jira", name: "Jira", desc: "Create and link issues from failures.", icon: "ticket", connected: true, meta: "QA board" },
      { id: "slack", name: "Slack", desc: "Send run summaries and failure alerts to channels.", icon: "message-square", connected: false, meta: "" },
      { id: "testrail", name: "TestRail", desc: "Sync generated test cases and results.", icon: "list-checks", connected: false, meta: "" }
    ],
    environments: [
      { name: "Staging", url: "https://staging.studentportal.io", status: "Healthy", ping: "38ms", workers: 16 },
      { name: "Production", url: "https://app.studentportal.io", status: "Healthy", ping: "52ms", workers: 4 },
      { name: "QA-Sandbox", url: "https://qa.studentportal.io", status: "Degraded", ping: "410ms", workers: 2 }
    ],
    team: [
      { name: "Priya Sharma", email: "priya@acme.dev", role: "Admin", initials: "PS", color: "#5457d6" },
      { name: "Alex Chen", email: "alex@company.com", role: "Editor", initials: "AC", color: "#2563eb" },
      { name: "Maya Rivera", email: "maya@acme.dev", role: "Editor", initials: "MR", color: "#0f6b2f" },
      { name: "Jordan Kim", email: "jordan@acme.dev", role: "Viewer", initials: "JK", color: "#b45309" }
    ],
    notifications: { failures: true, healed: true, review: true, daily: false, slack: false }
  },
  "PUT /settings": { ok: true, message: "Settings saved." },
  "POST /team/invite": { ok: true, message: "Invitation sent." },

  "GET /help": {
    quickstart: [
      ["Record a workflow", "Capture a screen recording of a real user path.", "video"],
      ["Let AI learn it", "AutoTestAI detects UI controls and builds the workflow graph.", "brain-circuit"],
      ["Review test cases", "Approve the generated positive, negative and edge cases.", "list-checks"],
      ["Run & self-heal", "Execute on the grid; broken locators repair themselves.", "zap"]
    ],
    categories: [["Getting started", "rocket", 12], ["Recordings & ingestion", "video", 9], ["Workflows", "workflow", 14], ["Test cases", "list-checks", 11], ["Automation scripts", "code-xml", 16], ["Self-healing", "wand-sparkles", 8], ["CI/CD integrations", "git-branch", 10], ["Account & billing", "credit-card", 6]],
    articles: [
      { id: "a1", title: "How self-healing chooses a fallback locator", cat: "Self-healing", read: "4 min", body: ["When a locator fails, AutoTestAI ranks candidate selectors in tiers: semantic role, visible text, data-testid, XPath ancestry, visual fingerprint and finally coordinates.", "Each candidate gets a confidence score from DOM similarity and the recorded screenshot. Repairs above your auto-approve threshold (Settings → AI Engine) are applied immediately; the rest wait in Self-Healing for review."] },
      { id: "a2", title: "Connecting GitHub Actions to run tests on every PR", cat: "CI/CD integrations", read: "6 min", body: ["Install the AutoTestAI GitHub app from Settings → Integrations, then add the autotest/run action to your workflow file.", "Runs report back as a status check with a link to the run report."] },
      { id: "a3", title: "Recording tips for reliable workflow learning", cat: "Recordings & ingestion", read: "3 min", body: ["Record at 1080p or above, keep the cursor visible and pause briefly after each action so frames can be sampled cleanly.", "Avoid real customer data — use seeded fixture accounts."] },
      { id: "a4", title: "Exporting Playwright code with Page Object Models", cat: "Automation scripts", read: "5 min", body: ["Open any script and choose Export → .py or .ts. Page objects are generated per screen detected in the recording."] }
    ],
    shortcuts: [["⌘ K", "Open search"], ["⌘ N", "New test"], ["⌘ Enter", "Execute suite"], ["G then D", "Go to dashboard"], ["?", "Show shortcuts"]],
    changelog: [["v2.4", "Live runner telemetry, predictive test selection, 18% faster suites."], ["v2.3", "Visual fingerprint fallback tier for self-healing."], ["v2.2", "Selenium Grid export and TestRail sync."]]
  },

  "POST /auth/login": { ok: true, token: "demo-session-token", user: { name: "Priya Sharma", role: "Lead QA Architect" }, message: "Signed in." }
});
