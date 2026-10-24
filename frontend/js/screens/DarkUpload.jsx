/* Recording upload flow connected to the real FastAPI backend. */
function DarkUpload() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [file, setFile] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState(null);
  const [processResult, setProcessResult] = useState(null);
  const [generated, setGenerated] = useState(null);

  useEffect(() => {
    API.getProjects()
      .then((items) => {
        const rows = Array.isArray(items) ? items : [];
        setProjects(rows);
        if (rows.length) setProjectId(String(rows[0].id));
      })
      .catch((err) => setError(err.message || "Could not load projects."))
      .finally(() => setLoadingProjects(false));
  }, []);

  async function upload() {
    if (!projectId) return setError("Create a project before uploading a recording.");
    if (!file) return setError("Choose a video file first.");
    setBusy(true);
    setError("");
    setProcessResult(null);
    setGenerated(null);
    try {
      const result = await API.uploadVideo(projectId, file);
      setUploaded(result);
      try { localStorage.setItem("autotest_last_video_id", String(result.video_id)); } catch (_) {}
      toast("Recording uploaded.");
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function process() {
    if (!uploaded) return;
    setBusy(true);
    setError("");
    try {
      const result = await API.processVideo(uploaded.video_id);
      setProcessResult(result);
      toast("Video processing completed.");
    } catch (err) {
      setError(err.message || "Video processing failed.");
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    if (!uploaded) return;
    setBusy(true);
    setError("");
    try {
      const result = await API.generateTestCases(uploaded.video_id);
      setGenerated(result);
      try { localStorage.setItem("autotest_last_video_id", String(uploaded.video_id)); } catch (_) {}
      toast("Test-case generation finished.");
    } catch (err) {
      setError(err.message || "Could not generate test cases.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DarkShell active="Recordings">
      <main className="page">
        <div className="page-inner">
          <PageHead
            eyebrow={<><span>WORKSPACE</span><Icon n="chevron-right" s={11} /><span>Recording ingestion</span></>}
            title="Upload a recording"
            sub="Upload an MP4, WebM, or MOV recording, extract frames, and generate draft test cases using the backend analysis pipeline."
            badge={<Pill tone="info">Real backend</Pill>}
          />

          <section className="card card-pad col" style={{ gap: 18, maxWidth: 900 }}>
            <div className="field">
              <span>Project</span>
              <div className="input">
                <Icon n="folder" s={14} />
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={loadingProjects || busy} style={{ width: "100%" }}>
                  {!projects.length && <option value="">No projects available</option>}
                  {projects.map((p) => <option key={p.id} value={String(p.id)}>{p.name} (ID {p.id})</option>)}
                </select>
              </div>
              {!loadingProjects && !projects.length && (
                <div className="small muted" style={{ marginTop: 6 }}>
                  Create a project first from <button className="btn btn-sm" onClick={() => go("/dark/projects")}>Projects</button>.
                </div>
              )}
            </div>

            <div
              className="card card-pad col"
              style={{ alignItems: "center", justifyContent: "center", gap: 12, borderStyle: "dashed", minHeight: 190, textAlign: "center" }}
            >
              <Icon n="file-video" s={34} />
              <div style={{ fontWeight: 600 }}>{file ? file.name : "Select a screen recording"}</div>
              <div className="small muted">MP4, WebM, or MOV · use a short recording for the first test</div>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                onChange={(e) => { setFile(e.target.files && e.target.files[0] || null); setUploaded(null); setProcessResult(null); setGenerated(null); setError(""); }}
              />
              <button className="btn btn-primary" onClick={upload} disabled={busy || loadingProjects || !file || !projectId}>
                <Icon n="upload" s={14} /> {busy ? "Working..." : "Upload recording"}
              </button>
            </div>

            {error && <div className="card card-pad small" role="alert" style={{ color: "var(--c-fail)" }}>{error}</div>}

            {uploaded && (
              <div className="card card-pad col" style={{ gap: 12 }}>
                <div className="row-between">
                  <div>
                    <div className="card-title">Upload complete</div>
                    <div className="small muted">{uploaded.filename} · Video ID {uploaded.video_id}</div>
                  </div>
                  <Pill tone="ok">Uploaded</Pill>
                </div>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={process} disabled={busy}>
                    <Icon n="scan" s={14} /> Extract frames
                  </button>
                  <button className="btn" onClick={generate} disabled={busy || !processResult}>
                    <Icon n="sparkles" s={14} /> Generate test cases
                  </button>
                  <button className="btn" onClick={() => go("/dark/test-cases")}>
                    <Icon n="list-checks" s={14} /> View test cases
                  </button>
                </div>
                {processResult && (
                  <div className="small muted">
                    Processing complete: {processResult.frames_extracted} frames extracted.
                  </div>
                )}
                {generated && (
                  <div className="small muted">
                    Generated {generated.test_cases_generated} test cases. Review them before treating them as verified tests.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </DarkShell>
  );
}
window.DarkUpload = DarkUpload;
