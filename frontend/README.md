# AutoTestAI — frontend

Code replica of the Figma file **AUTOTEST-DESIGN** (12 frames; the Glacier variant was dropped), built with
HTML5, CSS3, JavaScript, React 18, Axios / Fetch and GSAP.

## Run it

No build step. Browsers block in-browser JSX on `file://`, so serve the folder:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open http://localhost:5173. Any static server works, for example `npx serve` if Node is installed.

## Screens (hash routes)

| Figma frame | Route |
|---|---|
| Upload Recording | `#/dark/upload` |
| Dashboard | `#/dark/dashboard` |
| Test Cases | `#/dark/test-cases` |
| AI Workflow Builder | `#/dark/workflow` |
| Automation Scripts | `#/dark/scripts` |
| Test Runs & Live Runner | `#/dark/runs` |
| QA Dashboard | `#/light/dashboard` |
| Create Test & Analysis | `#/light/create` |
| Failure Analysis & Self-Healing | `#/light/failure` |
| Live Test Runner | `#/light/runner` |
| Workflow & Automation Script | `#/light/workflow` |

The pill at the bottom of the page switches between the Dark and Light designs.
On pages that exist in both themes it keeps you on the same page.

### Extension screens (not drawn in the Figma)

These pages are linked from the design but were never drawn. They're built in
the same visual language and work in both the Dark and Light shells
(`#/dark/<page>` and `#/light/<page>`):

| Page | Route suffix | File |
|---|---|---|
| Projects | `projects` | `js/screens/Projects.jsx` |
| Failures inbox | `failures` | `js/screens/Failures.jsx` |
| Bug Reports (table + board) | `bugs` | `js/screens/BugReports.jsx` |
| Self-Healing (full history) | `self-healing` | `js/screens/SelfHealing.jsx` |
| Analytics | `analytics` | `js/screens/Analytics.jsx` |
| Settings | `settings` | `js/screens/Settings.jsx` |
| Help & Documentation | `help` | `js/screens/Help.jsx` |
| All Test Runs | `all-runs` | `js/screens/AllRuns.jsx` |
| Run Report (#TR-1247) | `report` | `js/screens/AllRuns.jsx` |

There are also light-theme versions of the dark-only screens (`#/light/test-cases`
and `#/light/scripts`, in `js/screens/LightLibrary.jsx`), a sign-in page (`#/login`),
a notifications popover (the bell) and ⌘K / Ctrl+K search. Shared building blocks live
in `js/kit.jsx`, and their mock data is in `js/mockDataExtra.js`.

## Structure

```
index.html            CDN libraries + script order
css/styles.css        design tokens for the 3 themes + component styles
js/mockData.js        mock responses, keyed "METHOD /path"
js/api.js             Axios client (+ mock adapter) and Fetch helper; all endpoints
js/animations.js      GSAP helpers (page intro, counters, bars, fills, pointer, drift)
js/components.jsx     Icon, shells (sidebar/topbar), hooks, primitives
js/screens/*.jsx      one file per Figma frame
js/app.jsx            hash router
```

## Connecting a backend

In `index.html`, set `APP_CONFIG.API_BASE_URL` to your API and set `USE_MOCK: false`.
The endpoints the UI calls are listed in `js/api.js`, and their expected response
shapes are in `js/mockData.js`. Dark screens use Axios; light screens use the Fetch API.

## GSAP animations

Elements opt in through CSS classes: `a-up`, `a-fade`, `a-left`, `a-pop`,
`a-bar`, `a-fill`, `a-line`, `a-log`, and `data-count` for number counters.
`usePageAnim()` runs the intro once data loads. Animations are turned off when
the OS "reduce motion" setting is on.

## Production

Babel compiles the JSX in the browser, which is fine for demos but slow for production.
For production, move `js/components.jsx` and `js/screens/*` into a Vite React project
(`npm create vite@latest`) and swap the globals for ES imports.
