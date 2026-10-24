/*
 * AutoTestAI API client.
 * Implemented routes below match backend/app/api/v1.
 * Legacy design-only screens may call routes not implemented by this backend.
 */
(function () {
  "use strict";

  var cfg = window.APP_CONFIG || {};
  var baseURL = (cfg.API_BASE_URL || "http://localhost:8000/api")
    .replace(/\/+$/, "");
  var apiV1 = baseURL + "/v1";

  function token() {
    try { return localStorage.getItem("autotest_token"); }
    catch (_) { return null; }
  }

  function headers(extra) {
    var h = Object.assign({}, extra || {});
    var t = token();
    if (t) h.Authorization = "Bearer " + t;
    return h;
  }

  async function request(url, options) {
    options = options || {};
    var response = await fetch(url, {
      method: options.method || "GET",
      headers: headers(options.headers),
      body: options.body,
      redirect: "follow"
    });
    var text = await response.text();
    var data = {};
    try { data = text ? JSON.parse(text) : {}; }
    catch (_) { data = { detail: text }; }
    if (!response.ok) {
      var err = new Error(
        (data && (data.detail || data.message)) ||
        ("Request failed with HTTP " + response.status)
      );
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function jsonRequest(path, method, body) {
    var options = { method: method || "GET" };
    if (body !== undefined) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }
    return request(apiV1 + path, options);
  }

  async function login(credentials) {
    var form = new URLSearchParams();
    form.append("username", credentials.email);
    form.append("password", credentials.password);
    var result = await request(apiV1 + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString()
    });
    if (!result.access_token) throw new Error("Login response did not contain an access token.");
    try { localStorage.setItem("autotest_token", result.access_token); } catch (_) {}
    return result;
  }

  async function register(user) {
    return jsonRequest("/auth/register", "POST", {
      name: user.name,
      email: user.email,
      password: user.password
    });
  }

  async function uploadVideo(projectId, file) {
    var form = new FormData();
    form.append("file", file);
    return request(apiV1 + "/videos/" + encodeURIComponent(projectId), {
      method: "POST",
      body: form
    });
  }

  async function getProjectVideos(projectId) {
    return jsonRequest("/videos/project/" + encodeURIComponent(projectId));
  }

  async function processVideo(videoId) {
    return jsonRequest("/videos/" + encodeURIComponent(videoId) + "/process", "POST");
  }

  async function generateTestCases(videoId) {
    return jsonRequest("/analysis/test-cases/" + encodeURIComponent(videoId), "POST");
  }

  async function getVideoTestCases(videoId) {
    return jsonRequest("/analysis/test-cases/" + encodeURIComponent(videoId));
  }

  var client = window.axios ? window.axios.create({
    baseURL: apiV1,
    timeout: 30000
  }) : null;

  if (client) {
    client.interceptors.request.use(function (config) {
      var t = token();
      if (t) {
        config.headers = config.headers || {};
        config.headers.Authorization = "Bearer " + t;
      }
      return config;
    });
  }

  // These legacy methods are kept so the existing design screens still load.
  // Their routes are not present in the current FastAPI backend.
  function legacy(path, method, body) {
    return jsonRequest(path, method || "GET", body);
  }

  window.API = {
    client: client,
    fetch: function (path, options) {
      options = options || {};
      var method = options.method || "GET";
      var body = options.body;
      return jsonRequest(path, method, body);
    },
    login: login,
    register: register,

    getProjects: function () { return jsonRequest("/projects/"); },
    createProject: function (project) {
      return jsonRequest("/projects/", "POST", {
        name: project.name,
        description: project.description || ""
      });
    },
    getProject: function (id) { return jsonRequest("/projects/" + encodeURIComponent(id)); },
    updateProject: function (id, project) {
      return jsonRequest("/projects/" + encodeURIComponent(id), "PUT", project);
    },
    deleteProject: function (id) {
      return jsonRequest("/projects/" + encodeURIComponent(id), "DELETE");
    },

    uploadVideo: uploadVideo,
    getProjectVideos: getProjectVideos,
    processVideo: processVideo,
    getVideoTestCases: getVideoTestCases,
    generateTestCases: generateTestCases,
    getOcr: function (id) { return jsonRequest("/analysis/ocr/" + encodeURIComponent(id)); },
    getFrames: function (id) { return jsonRequest("/analysis/frames/" + encodeURIComponent(id)); },
    getChanges: function (id) { return jsonRequest("/analysis/changes/" + encodeURIComponent(id)); },
    getVideoStreamUrl: function (id) {
      return apiV1 + "/videos/" + encodeURIComponent(id) + "/stream";
    },

    // UI prototype endpoints; backend implementation is not present yet.
   getDashboard: function () {
    return jsonRequest("/dashboard");
},
    getRecording: function () { return legacy("/recordings/current"); },
    analyzeRecording: function (payload) { return legacy("/recordings/analyze", "POST", payload); },
    getTestCases: function () { return legacy("/test-cases"); },
    synthesizeCases: function (prompt) { return legacy("/test-cases/synthesize", "POST", { prompt: prompt }); },
    getWorkflow: function (id) { return legacy("/workflows/" + encodeURIComponent(id)); },
    getScript: function (id) { return legacy("/scripts/" + encodeURIComponent(id)); },
    runTests: function (payload) { return legacy("/runs", "POST", payload); },
    getLiveRun: function () { return legacy("/runs/live"); },
    pauseRun: function () { return legacy("/runs/live/pause", "POST", {}); },
    stopRun: function () { return legacy("/runs/live/stop", "POST", {}); },
    createJira: function (ids) { return legacy("/jira/tickets", "POST", { ids: ids }); },
    getQaDashboard: function () { return legacy("/qa/dashboard"); },
    getQaCreate: function () { return legacy("/qa/create"); },
    analyzeQa: function (payload) { return legacy("/qa/analyze", "POST", payload); },
    getFailure: function (id) { return legacy("/qa/failures/" + encodeURIComponent(id)); },
    applyFix: function (id) { return legacy("/qa/failures/" + encodeURIComponent(id) + "/apply-fix", "POST"); },
    getQaRun: function (id) { return legacy("/qa/runs/" + encodeURIComponent(id)); },
    getQaWorkflow: function (id) { return legacy("/qa/workflows/" + encodeURIComponent(id)); },
    getFailures: function () { return legacy("/failures"); },
    fixFailure: function (id) { return legacy("/failures/fix", "POST", { id: id }); },
    rerunFailure: function (id) { return legacy("/failures/rerun", "POST", { id: id }); },
    getBugs: function () { return legacy("/bugs"); },
    createBug: function (bug) { return legacy("/bugs", "POST", bug); },
    pushBugToJira: function (id) { return legacy("/bugs/jira", "POST", { id: id }); },
    getHealing: function () { return legacy("/healing"); },
    decideHealing: function (id, approve) { return legacy("/healing/decision", "POST", { id: id, approve: approve }); },
    getAnalytics: function (range) { return legacy("/analytics?range=" + encodeURIComponent(range || "12w")); },
    getRuns: function () { return legacy("/runs"); },
    getRunReport: function (id) { return legacy("/runs/report?id=" + encodeURIComponent(id || "")); },
    getNotifications: function () { return legacy("/notifications"); },
    getSettings: function () { return legacy("/settings"); },
    saveSettings: function (settings) { return legacy("/settings", "PUT", settings); },
    inviteMember: function (member) { return legacy("/team/invite", "POST", member); },
    getHelp: function () { return legacy("/help"); }
  };

  console.info("[AutoTestAI] API ready. Backend:", apiV1);
})();
