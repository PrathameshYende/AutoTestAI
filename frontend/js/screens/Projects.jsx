/* Projects screen connected to the real FastAPI project endpoints. */
function Projects({ theme }) {
  return (
    <Screen
      theme={theme}
      active="Projects"
      crumbs={["Workspace", "Projects"]}
      loader={() => API.getProjects()}
    >
      {(data) => <ProjectsBody theme={theme} initial={Array.isArray(data) ? data : []} />}
    </Screen>
  );
}

function ProjectsBody({ theme, initial }) {
  const toast = useToast();
  const [list, setList] = useState(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => { setList(initial); }, [initial]);

  const shown = list.filter((p) =>
    ((p.name || "") + " " + (p.description || ""))
      .toLowerCase().includes(query.toLowerCase())
  );

  async function createProject(e) {
    if (e) e.preventDefault();
    if (!form.name.trim()) {
      setError("Enter a project name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await API.createProject({
        name: form.name.trim(),
        description: form.description.trim()
      });
      setList((current) => [created, ...current]);
      setForm({ name: "", description: "" });
      setOpen(false);
      toast("Project created successfully.");
    } catch (err) {
      setError(err.message || "Could not create project.");
    } finally {
      setBusy(false);
    }
  }

  async function removeProject(project) {
    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    try {
      await API.deleteProject(project.id);
      setList((current) => current.filter((p) => p.id !== project.id));
      toast("Project deleted.");
    } catch (err) {
      toast(err.message || "Could not delete project.");
    }
  }

  return (
    <>
      <PageHead
        eyebrow={<><span>WORKSPACE</span><Icon n="chevron-right" s={11} /><span>Projects</span></>}
        title="Projects"
        badge={<Pill tone="info">{list.length} projects</Pill>}
        sub="Manage your applications and upload recordings to generate draft test cases."
        actions={
          <button className="btn btn-primary" onClick={() => { setError(""); setOpen(true); }}>
            <Icon n="plus" s={14} /> New Project
          </button>
        }
      />

      <section className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="card-title">Your projects</div>
            <div className="small muted" style={{ marginTop: 4 }}>
              Project data is loaded from your FastAPI backend.
            </div>
          </div>
          <label className="input" style={{ width: 260, height: 34 }}>
            <Icon n="search" s={13} />
            <input
              placeholder="Search projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </section>

      <div className="col" style={{ gap: 12 }}>
        {shown.map((p) => (
          <article className="card card-pad" key={p.id}>
            <div className="row-between" style={{ gap: 16, alignItems: "flex-start" }}>
              <div className="row" style={{ gap: 12, alignItems: "flex-start", minWidth: 0 }}>
                <div style={{
                  width: 40, height: 40, flex: "0 0 40px",
                  borderRadius: "var(--radius)", background: "var(--info-bg)",
                  color: "var(--link)", display: "grid", placeItems: "center",
                  fontWeight: 700, fontSize: 16
                }}>
                  {(p.name || "P").slice(0, 1).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                  <div className="small muted" style={{ marginTop: 5, overflowWrap: "anywhere" }}>
                    {p.description || "No description added."}
                  </div>
                  <div className="xs muted mono" style={{ marginTop: 8 }}>
                    Project ID: {p.id} · Owner ID: {p.owner_id}
                  </div>
                  <div className="xs muted" style={{ marginTop: 4 }}>
                    Created: {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
                  </div>
                </div>
              </div>
              <div className="col" style={{ alignItems: "flex-end", gap: 10, flex: "0 0 auto" }}>
                <Pill tone={String(p.status).toLowerCase() === "active" ? "ok" : "muted"}>
                  {p.status || "Unknown"}
                </Pill>
                <button className="btn btn-sm" onClick={() => go("/dark/upload")}>
                  <Icon n="upload" s={13} /> Upload recording
                </button>
                <button className="btn btn-sm" onClick={() => removeProject(p)} title="Delete project">
                  <Icon n="trash-2" s={13} /> Delete
                </button>
              </div>
            </div>
          </article>
        ))}
        {shown.length === 0 && (
          <div className="card card-pad muted">
            {list.length ? "No projects match your search." : "No projects yet. Create your first project to get started."}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => { if (!busy) setOpen(false); }}
        title="Create project"
        width={520}
        footer={
          <>
            <button className="btn" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
            <button className="btn btn-primary" onClick={createProject} disabled={busy || !form.name.trim()}>
              {busy ? "Creating..." : "Create project"}
            </button>
          </>
        }
      >
        <form className="modal-body col" style={{ gap: 14 }} onSubmit={createProject}>
          <label className="field">
            <span>Project name</span>
            <div className="input">
              <input
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Student Portal"
                maxLength={200}
              />
            </div>
          </label>
          <label className="field">
            <span>Description</span>
            <div className="input">
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What application are you testing?"
                maxLength={1000}
              />
            </div>
          </label>
          {error && <div className="small" role="alert" style={{ color: "var(--c-fail)" }}>{error}</div>}
        </form>
      </Modal>
    </>
  );
}

window.Projects = Projects;
