/* Extension screen: Analytics (linked from the sidebar, not drawn in the Figma). */
function Analytics({ theme }) {
  const [range, setRange] = useState("12w");
  return (
    <Screen theme={theme} active="Analytics" crumbs={["Production - v2.4.1", "Analytics"]} loader={() => API.getAnalytics(range)} deps={[range]}>
      {(data) => <AnalyticsBody theme={theme} data={data} range={range} setRange={setRange} />}
    </Screen>
  );
}

function AnalyticsBody({ theme, data, range, setRange }) {
  // Shorter ranges show the tail of the 12-week series.
  const n = { "4w": 4, "8w": 8, "12w": 12 }[range];
  const labels = data.trend.labels.slice(-n);
  const series = [
    { name: "Pass rate", data: data.trend.pass.slice(-n), color: "var(--c-pass)" },
    { name: "Flakiness ×10", data: data.trend.flaky.slice(-n).map(v => +(v * 10).toFixed(1)), color: "var(--warn-c)" }
  ];
  const volSeries = [
    { key: "p", label: "Passed", color: "var(--c-pass)" },
    { key: "f", label: "Failed", color: "var(--c-fail)" },
    { key: "h", label: "Healed", color: "var(--c-heal)" }
  ];
  const maxSuite = Math.max(...data.suites.map(s => s[1]));
  const fmtSec = (s) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;

  return (
    <>
      <PageHead
        title="Analytics"
        sub="Quality trends across every project: pass rate, flakiness, execution time and where failures come from."
        actions={<>
          <div className="seg">{["4w", "8w", "12w"].map(r => <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>Last {r.replace("w", " weeks")}</button>)}</div>
          <button className="btn" onClick={() => downloadFile(`autotest-analytics-${range}.csv`, ["week,pass_rate,flakiness", ...labels.map((l, i) => `${l},${series[0].data[i]},${data.trend.flaky.slice(-n)[i]}`)].join("\n"), "text/csv")}><Icon n="download" s={14} /> Export CSV</button>
        </>}
      />

      <div className="grid-5">
        {data.kpis.map(([label, v, dec, suf, delta, tone]) => (
          <Kpi key={label} label={label} value={v} decimals={dec} suffix={suf} sub={<span className="row" style={{ gap: 4 }}><Icon n={delta.startsWith("-") ? "trending-down" : "trending-up"} s={11} />{delta} vs previous</span>} tone={tone} />
        ))}
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <section className="card card-pad a-up">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div className="card-title"><Icon n="chart-line" s={16} /> Pass rate &amp; flakiness</div>
            <div className="row" style={{ gap: 12 }}>
              {series.map(s => <span key={s.name} className="row xs" style={{ gap: 5 }}><i style={{ width: 10, height: 3, background: s.color, borderRadius: 2 }} />{s.name}</span>)}
            </div>
          </div>
          <LineChart labels={labels} series={series} height={240} yMin={0} yMax={100} />
        </section>
        <section className="card card-pad a-up">
          <div className="card-title" style={{ marginBottom: 12 }}><Icon n="chart-pie" s={16} /> Failure causes</div>
          <div className="row" style={{ gap: 20, alignItems: "center" }}>
            <Donut parts={data.causes} center={`${data.causes.reduce((a, c) => a + c[1], 0)}`} />
            <div className="col grow" style={{ gap: 10 }}>
              {data.causes.map(([name, v, color]) => (
                <div key={name} className="row-between small">
                  <span className="row" style={{ gap: 8 }}><i style={{ width: 10, height: 10, borderRadius: 2, background: color }} />{name}</span>
                  <b className="mono xs">{v}%</b>
                </div>
              ))}
              <div className="xs muted" style={{ marginTop: 4 }}>41% of failures were UI changes that self-healing can repair.</div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="card card-pad a-up">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <div className="card-title"><Icon n="chart-column-stacked" s={16} /> Weekly test volume</div>
            <div className="row" style={{ gap: 12 }}>{volSeries.map(s => <span key={s.key} className="row xs" style={{ gap: 5 }}><i style={{ width: 9, height: 9, background: s.color, borderRadius: 2 }} />{s.label}</span>)}</div>
          </div>
          <StackedBars data={data.volume} series={volSeries} height={200} />
        </section>
        <section className="card card-pad a-up">
          <div className="card-title" style={{ marginBottom: 14 }}><Icon n="timer" s={16} /> Avg. execution time by suite</div>
          <div className="col" style={{ gap: 12 }}>
            {data.suites.map(([name, s]) => <HBar key={name} label={name} value={s} max={maxSuite} right={fmtSec(s)} color={s === maxSuite ? "var(--warn-c)" : "var(--link)"} />)}
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="card a-up" style={{ overflow: "hidden" }}>
          <div className="card-head"><div className="card-title"><Icon n="shuffle" s={16} /> Most flaky tests</div><button className="link small" onClick={() => go(pagePath(theme, "failures"))}>Open failures</button></div>
          <table className="table">
            <thead><tr><th>Test</th><th>Project</th><th>Flake rate</th></tr></thead>
            <tbody>
              {data.flaky.map(([id, name, rate, project]) => (
                <tr key={id} className="row-hover">
                  <td><span className="mono small" style={{ color: "var(--link)" }}>{id}</span> <span className="small">{name}</span></td>
                  <td className="small muted">{project}</td>
                  <td style={{ width: 140 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <div className="hbar grow" style={{ background: "var(--surface-3)" }}><i className="a-fill" style={{ width: `${rate * 2.5}%`, background: "var(--warn-c)" }} /></div>
                      <span className="mono xs">{rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card card-pad a-up">
          <div className="card-title" style={{ marginBottom: 14 }}><Icon n="shield-check" s={16} /> Coverage by module</div>
          <div className="col" style={{ gap: 12 }}>
            {data.coverage.map(([name, v]) => <HBar key={name} label={name} value={v} right={`${v}%`} color={v < 75 ? "var(--c-fail)" : "var(--c-pass)"} />)}
          </div>
          <div className="xs muted" style={{ marginTop: 14 }}>Reports and Gradebook are below the 75% coverage goal. Record a workflow to close the gap.</div>
          <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => go(pagePath(theme, "upload"))}><Icon n="video" s={13} /> Record workflow</button>
        </section>
      </div>
    </>
  );
}
window.Analytics = Analytics;
