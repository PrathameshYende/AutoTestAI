/* Extension screen: Help & Documentation (sidebar footer link, not drawn in the Figma). */
function Help({ theme }) {
  return (
    <Screen theme={theme} active="Help & Documentation" crumbs={["Workspace", "Documentation & Help"]} loader={() => API.getHelp()}>
      {(data) => <HelpBody theme={theme} data={data} />}
    </Screen>
  );
}

function HelpBody({ theme, data }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [article, setArticle] = useState(null);
  const [cat, setCat] = useState(null);
  const listRef = useRef(null);

  useEffect(() => { if (listRef.current) window.Anim.staggerIn(listRef.current.children); }, [q, cat]);

  const term = q.toLowerCase();
  const articles = data.articles.filter(a => (!cat || a.cat === cat) && (a.title + a.cat + a.body.join(" ")).toLowerCase().includes(term));
  const open = data.articles.find(a => a.id === article);

  return (
    <>
      <section className="card a-up" style={{ padding: "32px 28px", textAlign: "center", background: "linear-gradient(160deg, var(--info-bg), var(--surface) 70%)" }}>
        <div className="row" style={{ justifyContent: "center", gap: 8 }}><Pill tone="info">Docs v2.4</Pill></div>
        <h1 className="page-title" style={{ marginTop: 10 }}>How can we help?</h1>
        <p className="muted" style={{ marginTop: 6 }}>Guides for recording, workflows, generated tests, self-healing and CI.</p>
        <label className="input" style={{ maxWidth: 520, margin: "18px auto 0", height: 42, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Icon n="search" s={16} /><input placeholder="Search the documentation..." value={q} onChange={e => setQ(e.target.value)} style={{ fontSize: 14 }} />
          {q && <button className="icon-btn" onClick={() => setQ("")} aria-label="Clear"><Icon n="x" s={14} /></button>}
        </label>
      </section>

      {!q && !cat && (
        <section className="a-up">
          <div className="card-title" style={{ marginBottom: 12 }}><Icon n="rocket" s={16} /> Quick start</div>
          <div className="grid-4">
            {data.quickstart.map(([t, d, ic], i) => (
              <div key={t} className="card card-pad a-up" style={{ position: "relative" }}>
                <span className="mono xs faint" style={{ position: "absolute", right: 14, top: 12 }}>0{i + 1}</span>
                <span style={{ width: 34, height: 34, borderRadius: "var(--radius)", background: "var(--info-bg)", color: "var(--link)", display: "grid", placeItems: "center" }}><Icon n={ic} s={17} /></span>
                <b style={{ display: "block", marginTop: 12 }}>{t}</b>
                <p className="small muted" style={{ marginTop: 4, lineHeight: "18px" }}>{d}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="side-layout" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
        <div className="col" style={{ gap: 16 }}>
          <section className="card a-up">
            <div className="card-head">
              <div className="card-title"><Icon n="library" s={16} /> {cat ? cat : q ? `Results for "${q}"` : "Browse by topic"}</div>
              {(cat || q) && <button className="link small" onClick={() => { setCat(null); setQ(""); }}>Clear filter</button>}
            </div>
            {!q && !cat ? (
              <div className="grid-4" style={{ padding: "0 16px 16px", gap: 8 }}>
                {data.categories.map(([name, ic, n]) => (
                  <button key={name} className="inset" onClick={() => setCat(name)} style={{ padding: 12, textAlign: "left", color: "var(--text)", cursor: "pointer" }}>
                    <Icon n={ic} s={16} style={{ color: "var(--link)" }} />
                    <div style={{ fontWeight: 500, marginTop: 8, fontSize: 13 }}>{name}</div>
                    <div className="xs muted">{n} articles</div>
                  </button>
                ))}
              </div>
            ) : (
              <div ref={listRef}>
                {articles.length === 0 && <div className="small muted" style={{ padding: "0 16px 16px" }}>No articles found. Try another term or contact support.</div>}
                {articles.map(a => (
                  <div key={a.id} className="list-row" onClick={() => setArticle(a.id)}>
                    <Icon n="file-text" s={16} style={{ color: "var(--link)" }} />
                    <div className="grow"><b style={{ fontWeight: 500 }}>{a.title}</b><div className="xs muted">{a.cat} · {a.read} read</div></div>
                    <Icon n="chevron-right" s={15} className="muted" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {!q && !cat && (
            <section className="card a-up">
              <div className="card-head"><div className="card-title"><Icon n="flame" s={16} /> Popular articles</div></div>
              {data.articles.map(a => (
                <div key={a.id} className="list-row" onClick={() => setArticle(a.id)}>
                  <Icon n="file-text" s={16} style={{ color: "var(--link)" }} />
                  <div className="grow"><b style={{ fontWeight: 500 }}>{a.title}</b><div className="xs muted">{a.cat} · {a.read} read</div></div>
                  <Icon n="chevron-right" s={15} className="muted" />
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="col" style={{ gap: 16 }}>
          <section className="card card-pad a-up">
            <div className="card-title" style={{ marginBottom: 10 }}><Icon n="keyboard" s={16} /> Keyboard shortcuts</div>
            {data.shortcuts.map(([k, d]) => (
              <div key={k} className="row-between small" style={{ padding: "7px 0", borderTop: "1px solid var(--border-soft)" }}>
                <span className="muted">{d}</span><span className="kbd">{k}</span>
              </div>
            ))}
          </section>
          <section className="card card-pad a-up">
            <div className="card-title" style={{ marginBottom: 10 }}><Icon n="sparkles" s={16} /> What's new</div>
            {data.changelog.map(([v, t]) => (
              <div key={v} className="row small" style={{ gap: 10, alignItems: "flex-start", padding: "7px 0", borderTop: "1px solid var(--border-soft)" }}>
                <Pill tone="info">{v}</Pill><span className="muted" style={{ lineHeight: "18px" }}>{t}</span>
              </div>
            ))}
          </section>
          <section className="card card-pad a-up" style={{ background: "var(--info-bg)" }}>
            <div className="card-title"><Icon n="life-buoy" s={16} /> Still stuck?</div>
            <p className="small muted" style={{ marginTop: 6 }}>Our QA engineers answer within one business day.</p>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => toast("Support request form would open here.")}><Icon n="message-circle" s={13} /> Contact support</button>
              <button className="btn btn-sm" onClick={() => toast("Status: all systems operational.")}><Icon n="activity" s={13} /> System status</button>
            </div>
          </section>
        </div>
      </div>

      <Modal open={!!open} onClose={() => setArticle(null)} title={open ? open.title : ""} width={640}
        footer={open && <><span className="xs muted" style={{ marginRight: "auto" }}>Was this helpful?</span>
          <button className="btn btn-sm" onClick={() => { toast("Thanks for the feedback!"); setArticle(null); }}><Icon n="thumbs-up" s={13} /> Yes</button>
          <button className="btn btn-sm" onClick={() => { toast("Thanks — we'll improve this article."); setArticle(null); }}><Icon n="thumbs-down" s={13} /> No</button></>}>
        {open && (
          <div className="modal-body">
            <div className="row" style={{ gap: 8, marginBottom: 14 }}><Pill tone="info">{open.cat}</Pill><span className="xs muted">{open.read} read</span></div>
            {open.body.map((p, i) => <p key={i} style={{ lineHeight: "22px", marginBottom: 12, fontSize: 14 }}>{p}</p>)}
          </div>
        )}
      </Modal>
    </>
  );
}
window.Help = Help;
