import { useEffect, useMemo, useState } from 'react';
import { Code2, Download, FileVideo, Globe, RefreshCw, Sparkles, AlertTriangle, Copy, Check } from 'lucide-react';
import { projectsApi, videosApi, testCasesApi, automationApi, errorMessage } from '../lib/api.js';
import { Button, EmptyState, ErrorBanner, LoadingBlock, PageHeading } from '../components/Ui.jsx';

export default function Automation() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [videos, setVideos] = useState([]);
  const [videoId, setVideoId] = useState('');
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [source, setSource] = useState('both');
  const [framework, setFramework] = useState('playwright');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [generated, setGenerated] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { (async () => { setLoading(true); try { const rows = await projectsApi.list(); setProjects(rows); if (rows.length) setProjectId(String(rows[0].id ?? rows[0].project_id ?? '')); } catch (e) { setError(errorMessage(e)); } finally { setLoading(false); } })(); }, []);
  useEffect(() => { (async () => { if (!projectId) { setVideos([]); setVideoId(''); return; } setError(''); setVideos([]); setVideoId(''); setCases([]); setCaseId(''); setGenerated(null); try { const rows = await videosApi.listForProject(projectId); setVideos(rows); if (rows.length) setVideoId(String(rows[0].id ?? rows[0].video_id ?? '')); } catch (e) { setError(errorMessage(e)); } })(); }, [projectId]);
  useEffect(() => { (async () => { if (!videoId) { setCases([]); setCaseId(''); return; } setError(''); setCases([]); setCaseId(''); setGenerated(null); try { const data = await testCasesApi.list(videoId); const rows = Array.isArray(data?.test_cases) ? data.test_cases : (Array.isArray(data) ? data : []); setCases(rows); if (rows.length) setCaseId(String(rows[0].id ?? rows[0].test_case_id ?? '')); } catch (e) { setError(errorMessage(e)); } })(); }, [videoId]);

  const selectedCase = useMemo(() => cases.find(c => String(c.id ?? c.test_case_id) === String(caseId)), [cases, caseId]);
  const selectedVideo = useMemo(() => videos.find(v => String(v.id ?? v.video_id) === String(videoId)), [videos, videoId]);
  async function generate(e) {
    e.preventDefault(); if (!videoId || !caseId) { setError('Select a video and a saved test case first.'); return; }
    if (selectedCase?.status === 'needs_review' && !window.confirm('This test case is marked needs_review. Generate a draft script anyway? It must be reviewed before execution.')) return;
    setBusy(true); setError(''); setNotice(''); setGenerated(null);
    try {
      const result = await automationApi.generate(videoId, { test_case_id: caseId, target_url: targetUrl.trim() || null, source, framework });
      setGenerated(result); setNotice('Automation draft generated. Review the script and target URL before running it.');
    } catch (e2) { setError(errorMessage(e2)); }
    finally { setBusy(false); }
  }
  function download() {
    if (!generated?.code) return;
    const blob = new Blob([generated.code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `${(selectedCase?.test_case_id || 'autotestai_test').replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}.py`; a.click(); URL.revokeObjectURL(url);
  }
  async function copyCode() { if (!generated?.code) return; try { await navigator.clipboard.writeText(generated.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setError('Clipboard access was blocked by the browser. Use Download .py instead.'); } }

  return <>
    <PageHeading eyebrow="AUTOMATION STUDIO" title="Generate automation code" description="Turn saved test cases into reviewable Python browser-automation scripts using saved recording context, an optional target URL, or both." action={<Button variant="secondary" onClick={() => window.location.reload()}><RefreshCw size={15}/> Refresh</Button>} />
    {error && <ErrorBanner>{error}</ErrorBanner>}
    {notice && <div className="notice-card test-notice"><Check size={18}/><div>{notice}</div></div>}
    <section className="panel automation-source-panel">
      <div className="panel-heading"><div><h2>Choose test input</h2><p>Scripts are generated from saved test-case details. A URL improves locator and navigation accuracy.</p></div><span className="panel-heading-icon"><Code2 size={17}/></span></div>
      {loading ? <LoadingBlock label="Loading projects..."/> : projects.length === 0 ? <EmptyState title="No projects found" description="Create a project and upload/process a recording before generating automation."/> : <form className="automation-form" onSubmit={generate}>
        <div className="automation-form-grid">
          <label className="test-field"><span>Project</span><select className="form-input" value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="">Select project</option>{projects.map((p,i)=>{const id=p.id??p.project_id;return <option key={id??i} value={String(id)}>{p.name||p.title||`Project ${id??i+1}`}</option>})}</select></label>
          <label className="test-field"><span>Recording</span><select className="form-input" value={videoId} onChange={e=>setVideoId(e.target.value)} disabled={!videos.length}><option value="">{videos.length?'Select video':'No videos found'}</option>{videos.map((v,i)=>{const id=v.id??v.video_id;return <option key={id??i} value={String(id)}>{v.filename||v.name||`Video ${id??i+1}`} (ID {id})</option>})}</select></label>
          <label className="test-field"><span>Saved test case</span><select className="form-input" value={caseId} onChange={e=>{setCaseId(e.target.value);setGenerated(null);}} disabled={!cases.length}><option value="">{cases.length?'Select test case':'No saved test cases'}</option>{cases.map((c,i)=>{const id=c.id??c.test_case_id;return <option key={id??i} value={String(id)}>{c.test_case_id||`TC-${i+1}`} — {c.title||'Untitled test case'}{c.status==='needs_review'?' (review required)':''}</option>})}</select></label>
          <label className="test-field"><span>Automation framework</span><select className="form-input" value={framework} onChange={e=>setFramework(e.target.value)}><option value="playwright">Python + Playwright (recommended)</option><option value="selenium">Python + Selenium</option></select></label>
          <label className="test-field automation-url-field"><span>Target website URL <small>(optional, recommended)</small></span><input className="form-input" type="url" value={targetUrl} onChange={e=>setTargetUrl(e.target.value)} placeholder={selectedVideo?.url || 'https://example.com/login'} /></label>
          <label className="test-field"><span>Context source</span><select className="form-input" value={source} onChange={e=>setSource(e.target.value)}><option value="both">Recording + optional URL</option><option value="recording">Recording/test-case context</option><option value="url">Website URL context (no live crawl)</option></select></label>
        </div>
        {selectedCase && <div className="automation-case-preview"><div><strong>{selectedCase.test_case_id} · {selectedCase.title}</strong><p>{selectedCase.description || 'No description supplied.'}</p></div><span className={`test-status status-${String(selectedCase.status||'draft').toLowerCase().replace(/[^a-z0-9-]/g,'-')}`}>{selectedCase.status || 'draft'}</span></div>}
        {source !== 'recording' && !targetUrl.trim() && <div className="automation-warning"><AlertTriangle size={16}/><span>No target URL supplied. Generated code will read <code>TARGET_URL</code> from the environment; it will not guess a real URL unless the test-case context provides one.</span></div>}
        <div className="automation-submit-row"><Button type="submit" loading={busy} disabled={!videoId || !caseId}><Sparkles size={16}/> Generate automation code</Button><span>Generation returns a draft. It does not execute code.</span></div>
      </form>}
    </section>
    {generated && <section className="panel automation-output-panel">
      <div className="panel-heading"><div><h2>Generated Python script</h2><p>{generated.model || 'AI-generated draft'} · {generated.framework || framework}</p></div><div className="automation-output-actions"><Button variant="secondary" onClick={copyCode}><Copy size={15}/>{copied?'Copied':'Copy code'}</Button><Button onClick={download}><Download size={15}/> Download .py</Button></div></div>
      {generated.warnings?.length > 0 && <div className="automation-warning"><AlertTriangle size={16}/><div>{generated.warnings.map((w,i)=><p key={i}>{w}</p>)}</div></div>}
      <div className="automation-code-meta"><span>Test case: {generated.test_case_id || selectedCase?.test_case_id}</span><span>Target: {generated.target_url || 'TARGET_URL environment variable'}</span><span>Review before execution</span></div>
      <pre className="automation-code"><code>{generated.code}</code></pre>
      <p className="test-results-footnote">For safety, this screen only generates and downloads code. It does not execute AI-generated scripts. Install the selected framework and run the reviewed script in a controlled test environment.</p>
    </section>}
  </>;
}
