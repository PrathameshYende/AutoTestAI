/* Test cases for the last uploaded/processed video, loaded from FastAPI. */
function DarkTestCases() {
  const [videoId, setVideoId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualId, setManualId] = useState("");

  useEffect(() => {
    let saved = "";
    try { saved = localStorage.getItem("autotest_last_video_id") || ""; } catch (_) {}
    setVideoId(saved);
    if (saved) loadCases(saved);
  }, []);

  async function loadCases(id) {
    if (!String(id || "").trim()) {
      setError("Enter a video ID or upload a recording first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await API.getVideoTestCases(String(id).trim());
      setData(result);
      setVideoId(String(id).trim());
      try { localStorage.setItem("autotest_last_video_id", String(id).trim()); } catch (_) {}
    } catch (err) {
      setData(null);
      setError(err.message || "Could not load test cases.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DarkShell active="Test Cases">
      <main className="page">
        <div className="page-inner">
          <PageHead
            eyebrow={<><span>ANALYSIS</span><Icon n="chevron-right" s={11} /><span>Generated cases</span></>}
            title="Generated test cases"
            sub="Cases are saved by the backend and associated with a video. AI-generated cases are drafts and need human review."
            badge={<Pill tone="info">Backend data</Pill>}
            actions={<button className="btn" onClick={() => go("/dark/upload")}><Icon n="upload" s={14} /> Upload recording</button>}
          />

          <section className="card card-pad" style={{ marginBottom: 16 }}>
            <form className="row" style={{ gap: 8, flexWrap: "wrap" }} onSubmit={(e) => { e.preventDefault(); loadCases(manualId || videoId); }}>
              <label className="field" style={{ flex: "1 1 240px" }}>
                <span>Video ID</span>
                <div className="input"><Icon n="video" s={14} /><input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder={videoId || "Enter a video ID"} /></div>
              </label>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ alignSelf: "flex-end" }}>
                <Icon n="refresh-cw" s={14} /> {loading ? "Loading..." : "Load cases"}
              </button>
            </form>
          </section>

          {error && <div className="card card-pad small" role="alert" style={{ color: "var(--c-fail)", marginBottom: 16 }}>{error}</div>}

          {data && (
            <>
              <div className="grid-3" style={{ marginBottom: 16 }}>
                <Kpi label="Video ID" value={data.video_id} icon="video" sub="Source recording" />
                <Kpi label="Saved cases" value={data.test_cases_count} icon="list-checks" sub="Persisted in database" />
                <Kpi label="Review status" value="Draft" icon="clipboard-check" sub="Review before use" />
              </div>

              <section className="card" style={{ overflow: "hidden" }}>
                <div className="card-head">
                  <div className="card-title">Test cases <span className="badge b-gray">{(data.test_cases || []).length}</span></div>
                </div>
                {(data.test_cases || []).length === 0 ? (
                  <div className="card-pad muted">No saved cases for this video yet. Upload a recording, extract frames, then generate test cases.</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="table">
                      <thead>
                        <tr><th>ID</th><th>Title</th><th>Action</th><th>Confidence</th><th>Status</th><th>Expected result</th></tr>
                      </thead>
                      <tbody>
                        {data.test_cases.map((c) => (
                          <React.Fragment key={c.id}>
                            <tr>
                              <td className="mono small">{c.test_case_id || c.id}</td>
                              <td style={{ minWidth: 200 }}>
                                <div style={{ fontWeight: 500 }}>{c.title}</div>
                                {c.description && <div className="xs muted" style={{ marginTop: 4 }}>{c.description}</div>}
                              </td>
                              <td><Pill tone="muted">{c.action_type || "unknown"}</Pill></td>
                              <td>{c.confidence || "low"}</td>
                              <td><Pill tone={c.status === "approved" ? "ok" : "muted"}>{c.status || "draft"}</Pill></td>
                              <td style={{ minWidth: 220 }}>{c.expected_result || "—"}</td>
                            </tr>
                            <tr>
                              <td colSpan={6} style={{ paddingTop: 0 }}>
                                <div className="small muted">
                                  <b>Preconditions:</b> {Array.isArray(c.preconditions) ? c.preconditions.join("; ") || "None specified" : String(c.preconditions || "None specified")}
                                  <br />
                                  <b>Steps:</b> {Array.isArray(c.steps) ? c.steps.map((s, i) => typeof s === "string" ? `${i + 1}. ${s}` : `${i + 1}. ${JSON.stringify(s)}`).join("  ") || "None specified" : String(c.steps || "None specified")}
                                  {c.source_frame && <><br /><b>Source frame:</b> {c.source_frame}</>}
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {!data && !error && !loading && (
            <div className="card card-pad muted">Upload and process a recording first, then generate cases to see the saved results here.</div>
          )}
        </div>
      </main>
    </DarkShell>
  );
}
window.DarkTestCases = DarkTestCases;
