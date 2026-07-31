import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

const navItems = ['Dashboard', 'Products', 'Health', 'Logs', 'About']

function useApi(path) {
  const [state, setState] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    let mounted = true
    fetch(`${API_BASE}${path}`)
      .then((res) => res.json())
      .then((data) => mounted && setState({ loading: false, data, error: null }))
      .catch((error) => mounted && setState({ loading: false, data: null, error: error.message }))
    return () => {
      mounted = false
    }
  }, [path])

  return state
}

function Panel({ title, value, detail }) {
  return (
    <section style={styles.panel}>
      <div style={styles.panelLabel}>{title}</div>
      <div style={styles.panelValue}>{value}</div>
      {detail ? <div style={styles.panelDetail}>{detail}</div> : null}
    </section>
  )
}

function App() {
  const info = useApi('/info')
  const health = useApi('/health')
  const dbInfo = useApi('/database/info')
  const logs = useApi('/logs')

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.kicker}>Engineering Console</div>
          <h1 style={styles.title}>MongoDB Learning Platform</h1>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <div key={item} style={styles.navItem}>
              {item}
            </div>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <div>Phase 1</div>
          <div>Standalone MongoDB</div>
          <div>FastAPI + PyMongo</div>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <div style={styles.kicker}>Operations Dashboard</div>
            <h2 style={styles.sectionTitle}>Infrastructure visibility first</h2>
          </div>
          <div style={styles.timestamp}>
            {info.data?.timestamp ? `Updated ${new Date(info.data.timestamp).toLocaleString()}` : 'Loading status...'}
          </div>
        </header>

        <section style={styles.grid}>
          <Panel title="MongoDB Connection" value={health.data?.mongodb ?? 'Loading'} detail={health.error ?? 'Health signal from /health'} />
          <Panel title="Current Database" value={info.data?.database ?? 'Loading'} detail={dbInfo.data?.uri ?? 'MongoDB target URI'} />
          <Panel title="Hostname" value={info.data?.hostname ?? 'Loading'} detail={info.data?.environment ?? 'Environment'} />
          <Panel title="Database Version" value={info.data?.database_version ?? 'Unknown'} detail={dbInfo.data?.healthy ? 'Reachable' : 'Waiting for connection'} />
          <Panel title="Application Uptime" value={info.data?.uptime_seconds != null ? `${info.data.uptime_seconds}s` : 'Loading'} detail="FastAPI process runtime" />
          <Panel title="API Health" value={health.data?.application ?? 'Loading'} detail={health.data?.current_error ?? 'No current error'} />
        </section>

        <section style={styles.contentGrid}>
          <article style={styles.card}>
            <h3 style={styles.cardTitle}>Request Flow</h3>
            <pre style={styles.codeBlock}>{`Browser
  ↓
React frontend
  ↓
FastAPI
  ↓
PyMongo
  ↓
MongoDB`}</pre>
          </article>

          <article style={styles.card}>
            <h3 style={styles.cardTitle}>Recent Logs</h3>
            <div style={styles.logList}>
              {(logs.data?.items ?? []).slice(0, 8).map((entry, index) => (
                <div key={`${entry.timestamp}-${index}`} style={styles.logRow}>
                  <span style={styles.logTime}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  <span>{entry.method}</span>
                  <span>{entry.path}</span>
                  <span>{entry.success ? 'OK' : 'FAIL'}</span>
                  <span>{entry.mongo_response}</span>
                </div>
              ))}
              {!logs.loading && (logs.data?.items?.length ?? 0) === 0 ? <div style={styles.empty}>No logs captured yet.</div> : null}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

const styles = {
  shell: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
    color: '#0f172a',
    fontFamily: 'system-ui, sans-serif'
  },
  sidebar: {
    padding: 24,
    borderRight: '1px solid #dbe2ea',
    background: '#0f172a',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  kicker: { fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8' },
  title: { fontSize: 28, lineHeight: 1.1, margin: '10px 0 24px' },
  nav: { display: 'grid', gap: 8 },
  navItem: { padding: '10px 12px', borderRadius: 10, background: '#111827', border: '1px solid #1f2937' },
  sidebarFooter: { fontSize: 13, color: '#94a3b8', display: 'grid', gap: 4 },
  main: { padding: 24, display: 'grid', gap: 24 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16 },
  sectionTitle: { margin: '6px 0 0', fontSize: 28 },
  timestamp: { color: '#475569', fontSize: 14 },
  grid: { display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' },
  panel: { background: 'white', border: '1px solid #dbe2ea', borderRadius: 14, padding: 18, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' },
  panelLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' },
  panelValue: { fontSize: 24, fontWeight: 700, marginTop: 10 },
  panelDetail: { color: '#475569', marginTop: 8, fontSize: 14 },
  contentGrid: { display: 'grid', gap: 16, gridTemplateColumns: '1.2fr 0.8fr' },
  card: { background: 'white', border: '1px solid #dbe2ea', borderRadius: 14, padding: 18 },
  cardTitle: { marginTop: 0, marginBottom: 14 },
  codeBlock: { margin: 0, padding: 16, background: '#0f172a', color: '#e2e8f0', borderRadius: 12, overflowX: 'auto' },
  logList: { display: 'grid', gap: 8 },
  logRow: { display: 'grid', gridTemplateColumns: '96px 64px 1fr 64px 120px', gap: 8, padding: '10px 12px', background: '#f8fafc', borderRadius: 10, fontSize: 13 },
  logTime: { color: '#64748b' },
  empty: { color: '#64748b', padding: '8px 0' }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
