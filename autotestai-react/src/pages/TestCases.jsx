import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, FileVideo, RefreshCw, Sparkles, PlayCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { projectsApi, videosApi, testCasesApi, analysisApi, errorMessage } from '../lib/api.js';
import { Button, EmptyState, ErrorBanner, LoadingBlock, PageHeading } from '../components/Ui.jsx';

function readableDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}
function listValue(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
}

export default function TestCases() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [videos, setVideos] = useState([]);
  const [videoId, setVideoId] = useState('');
  const [cases, setCases] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingCases, setLoadingCases] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [expanded, setExpanded] = useState({});
  const [meta, setMeta] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({ ocr: null, frames: null, changes: null });
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  async function loadProjects() {
    setLoadingProjects(true); setError('');
    try {
      const rows = await projectsApi.list();
      setProjects(rows);
      if (rows.length) setProjectId((old) => old || String(rows[0].id ?? rows[0].project_id ?? ''));
    } catch (e) { setError(errorMessage(e)); }
    finally { setLoadingProjects(false); }
  }
  async function loadVideos(id) {
    if (!id) { setVideos([]); setVideoId(''); setCases([]); return; }
    setLoadingVideos(true); setError(''); setNotice(''); setVideos([]); setVideoId(''); setCases([]); setMeta(null);
    try {
      const rows = await videosApi.listForProject(id);
      setVideos(rows);
      if (rows.length) setVideoId(String(rows[0].id ?? rows[0].video_id ?? ''));
      else setNotice('No videos are uploaded to this project yet. Upload a video first, then return here.');
    } catch (e) { setError(errorMessage(e)); }
    finally { setLoadingVideos(false); }
  }
  async function loadCases(id) {
    if (!id) { setCases([]); setMeta(null); return; }
    setLoadingCases(true); setError(''); setNotice('');
    try {
      const data = await testCasesApi.list(id);
      setCases(Array.isArray(data?.test_cases) ? data.test_cases : (Array.isArray(data) ? data : []));
      setMeta(data);
    } catch (e) {
      if (e?.response?.status === 404) {
        setCases([]);
        setNotice('No saved test cases were found for this video yet. You can generate them after processing the video.');
      } else setError(errorMessage(e));
    } finally { setLoadingCases(false); }
  }
  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { loadVideos(projectId); }, [projectId]);
  useEffect(() => { loadCases(videoId); }, [videoId]);

  const selectedVideo = useMemo(() => videos.find(v => String(v.id ?? v.video_id) === String(videoId)), [videos, videoId]);
  async function processVideo() {
    if (!videoId) return;
    setProcessing(true); setError(''); setNotice('');
    try {
      const result = await videosApi.process(videoId);
      setNotice(`Video processed successfully. ${result.frames_extracted ?? 'Frames'} frames extracted. You can now generate test cases.`);
    } catch (e) { setError(errorMessage(e)); }
    finally { setProcessing(false); }
  }
  async function generate() {
    if (!videoId) return;
    setGenerating(true); setError(''); setNotice('');
    try {
      const result = await testCasesApi.generate(videoId);
      const newCases = Array.isArray(result?.test_cases) ? result.test_cases : [];
      setCases(newCases); setMeta(result);
      setNotice(`Generation finished: ${result.test_cases_generated ?? newCases.length} test case(s) saved.`);
      setExpanded({});
    } catch (e) { setError(errorMessage(e)); }
    finally { setGenerating(false); }
  }
  async function loadAnalysis() {
    if (!videoId) return;
    setLoadingAnalysis(true); setError('');
    const entries = await Promise.allSettled([analysisApi.ocr(videoId), analysisApi.frames(videoId), analysisApi.changes(videoId)]);
    const keys = ['ocr', 'frames', 'changes'];
    const next = { ocr: null, frames: null, changes: null };
    const failures = [];
    entries.forEach((entry, i) => {
      if (entry.status === 'fulfilled') next[keys[i]] = entry.value;
      else failures.push(`${keys[i]}: ${errorMessage(entry.reason)}`);
    });
    setAnalysisResults(next);
    if (failures.length) setError(`Some analysis requests failed. ${failures.join(' | ')}`);
    else setNotice('Analysis results loaded from the backend.');
    setLoadingAnalysis(false);
  }
  async function refresh() { if (videoId) { await loadCases(videoId); } else if (projectId) await loadVideos(projectId); else await loadProjects(); }

  return <>
    <PageHeading eyebrow="QUALITY CENTER" title="Test cases & results" description="Load saved test cases from your videos, generate new cases, and inspect their steps and expected results." action={<Button variant="secondary" onClick={refresh} disabled={loadingCases || loadingVideos || loadingProjects}><RefreshCw size={15}/> Refresh</Button>} />
    {error && <ErrorBanner>{error}</ErrorBanner>}
    {notice && <div className="notice-card test-notice"><CheckCircle2 size={18}/><div>{notice}</div></div>}
    <section className="panel test-source-panel">
      <div className="panel-heading"><div><h2>Choose a source video</h2><p>Test cases are stored against a video in your project.</p></div><span className="panel-heading-icon"><FileVideo size={17}/></span></div>
      {loadingProjects ? <LoadingBlock label="Loading projects..."/> : projects.length === 0 ? <EmptyState title="No projects found" description="Create a project first, then upload a screen recording to it."/> : <div className="test-source-grid">
        <label className="test-field"><span>Project</span><select className="form-input" value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="">Select a project</option>{projects.map((p,i)=>{const id=p.id ?? p.project_id;return <option key={id ?? i} value={String(id)}>{p.name || p.title || `Project ${id ?? i+1}`}</option>})}</select></label>
        <label className="test-field"><span>Video</span><select className="form-input" value={videoId} onChange={e=>setVideoId(e.target.value)} disabled={loadingVideos || !videos.length}><option value="">{loadingVideos?'Loading videos...':videos.length?'Select a video':'No videos available'}</option>{videos.map((v,i)=>{const id=v.id ?? v.video_id;return <option key={id ?? i} value={String(id)}>{v.filename || v.name || `Video ${id ?? i+1}`} (ID {id})</option>})}</select></label>
      </div>}
      {selectedVideo && <div className="selected-video-row"><div className="selected-video-icon"><FileVideo size={18}/></div><div className="selected-video-copy"><strong>{selectedVideo.filename || selectedVideo.name || `Video ${videoId}`}</strong><span>Video ID: {videoId} · Project ID: {projectId}</span></div><div className="selected-video-actions"><Button variant="secondary" onClick={processVideo} loading={processing} disabled={generating}><PlayCircle size={15}/> Process video</Button><Button onClick={generate} loading={generating} disabled={processing || loadingCases}><Sparkles size={15}/> Generate test cases</Button></div></div>}
      <p className="test-helper"><AlertTriangle size={14}/> If generation reports missing frames, click <strong>Process video</strong> first. Processing and generation may take a little time for larger recordings.</p>
    </section>

    <section className="panel test-results-panel">
      <div className="panel-heading"><div><h2>Video analysis results</h2><p>Results returned by OCR, frame extraction and visual-change detection endpoints.</p></div><Button variant="secondary" onClick={loadAnalysis} loading={loadingAnalysis} disabled={!videoId}><RefreshCw size={15}/> Load analysis results</Button></div>
      {!videoId ? <EmptyState title="Select a video first" description="Choose a project and video above to load analysis results."/> : <div className="test-analysis-grid">
        {[['OCR text', analysisResults.ocr], ['Extracted frames', analysisResults.frames], ['Detected changes', analysisResults.changes]].map(([label, value]) => <article className="test-analysis-card" key={label}><h3>{label}</h3>{value === null ? <p className="test-no-value">Click “Load analysis results” to request this result.</p> : <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 260, overflow: 'auto', fontSize: 12 }}>{JSON.stringify(value, null, 2)}</pre>}</article>)}
      </div>}
      <p className="test-results-footnote">These panels show the actual API responses. Visual verification is not marked Passed/Failed unless the backend provides a comparison or execution result.</p>
    </section>

    <section className="panel test-results-panel">
      <div className="panel-heading"><div><h2>Generated test cases</h2><p>Saved cases returned by your FastAPI backend</p></div><span className="test-count-pill"><ClipboardList size={15}/>{cases.length} {cases.length===1?'case':'cases'}</span></div>
      {loadingCases ? <LoadingBlock label="Loading saved test cases..."/> : !videoId ? <EmptyState title="Select a video" description="Choose a project and a video above to load its saved test cases."/> : cases.length === 0 ? <EmptyState title="No test cases yet" description="Load saved cases or generate test cases from the selected video's analyzed frames." action={<Button onClick={generate} loading={generating} disabled={!selectedVideo}><Sparkles size={15}/> Generate test cases</Button>}/> : <>
        {meta && <div className="test-summary-strip"><span><strong>{meta.total_frames ?? '—'}</strong><small>Frames analyzed</small></span><span><strong>{meta.selected_frames?.length ?? '—'}</strong><small>Selected frames</small></span><span><strong>{meta.test_cases_generated ?? meta.test_cases_count ?? cases.length}</strong><small>Saved test cases</small></span></div>}
        <div className="test-case-list">{cases.map((c,i)=>{const id=c.id ?? c.test_case_id ?? i;const open=!!expanded[id];return <article className="test-case-card" key={id}>
          <button className="test-case-card-head" onClick={()=>setExpanded(prev=>({...prev,[id]:!prev[id]}))} aria-expanded={open}>
            <span className="test-case-number">{c.test_case_id || `TC-${String(i+1).padStart(3,'0')}`}</span><span className="test-case-title-wrap"><strong>{c.title || 'Untitled test case'}</strong><small>{c.action_type || 'Action not specified'}{c.source_frame ? ` · ${c.source_frame}` : ''}</small></span><span className={`test-status status-${String(c.status||'draft').toLowerCase().replace(/[^a-z0-9-]/g,'-')}`}>{c.status || 'draft'}</span><span className="test-confidence">{c.confidence || 'low'} confidence</span>{open?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button>
          {open && <div className="test-case-details">{c.description && <p className="test-description">{c.description}</p>}<div className="test-detail-grid"><div><h4>Preconditions</h4>{listValue(c.preconditions).length?<ul>{listValue(c.preconditions).map((s,j)=><li key={j}>{typeof s==='object'?JSON.stringify(s):s}</li>)}</ul>:<p className="test-no-value">No preconditions specified.</p>}</div><div><h4>Steps</h4>{listValue(c.steps).length?<ol>{listValue(c.steps).map((s,j)=><li key={j}>{typeof s==='object'?JSON.stringify(s):s}</li>)}</ol>:<p className="test-no-value">No steps specified.</p>}</div></div><div className="expected-result"><strong>Expected result</strong><p>{c.expected_result || 'No expected result provided.'}</p></div><div className="test-case-meta">Created: {readableDate(c.created_at)}</div></div>}
        </article>})}</div>
        <p className="test-results-footnote">These are generated test-case specifications. Execution pass/fail results are not shown because the current backend endpoints do not expose a test execution endpoint.</p>
      </>}
    </section>
  </>;
}
