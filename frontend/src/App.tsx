import { useState, useCallback, useEffect } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout,
  isLoggedIn,
  addDemoWearableData,
  runWellnessAnalysis,
  getMe,
  getInsights,
  getLatestScores,
} from './api';

type Tab = 'login' | 'register';
type Page = 'dashboard' | 'insights' | 'profile';

const DEMO_USERS = [
  { label: 'Active Andy (good sleep, active)', email: 'demo-active@wellness-demo.local', password: 'DemoPass123!' },
  { label: 'Restless Sam (less sleep, stressed)', email: 'demo-restless@wellness-demo.local', password: 'DemoPass123!' },
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [tab, setTab] = useState<Tab>('login');
  const [page, setPage] = useState<Page>('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    scores: Array<{ scoreType?: string; type?: string; score: number; explanation?: string }>;
    insights: Array<{ title: string; description: string; recommendations?: string[] }>;
    processedDataPoints: number;
  } | null>(null);
  const [profile, setProfile] = useState<{ email: string; firstName?: string; lastName?: string } | null>(null);
  const [insightsList, setInsightsList] = useState<Array<{ id: string; title: string; description: string; category: string; recommendations: string[] }>>([]);
  const [latestScores, setLatestScores] = useState<Record<string, { score: number; explanation?: string }>>({});

  const loadProfile = useCallback(async () => {
    try {
      const p = await getMe();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  const loadInsights = useCallback(async () => {
    try {
      const list = await getInsights();
      setInsightsList(list);
    } catch {
      setInsightsList([]);
    }
  }, []);

  const loadLatestScores = useCallback(async () => {
    try {
      const scores = await getLatestScores();
      setLatestScores(scores);
    } catch {
      setLatestScores({});
    }
  }, []);

  useEffect(() => {
    if (loggedIn && page === 'profile') loadProfile();
  }, [loggedIn, page, loadProfile]);

  useEffect(() => {
    if (loggedIn && page === 'insights') {
      loadInsights();
      loadLatestScores();
    }
  }, [loggedIn, page, loadInsights, loadLatestScores]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiLogin(email, password);
      setLoggedIn(true);
      setResult(null);
      setPage('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const handleDemoLogin = useCallback(async (demoEmail: string, demoPassword: string) => {
    setError('');
    setLoading(true);
    try {
      await apiLogin(demoEmail, demoPassword);
      setLoggedIn(true);
      setResult(null);
      setPage('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiRegister(email, password, firstName, lastName);
      setLoggedIn(true);
      setResult(null);
      setPage('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [email, password, firstName, lastName]);

  const handleAddDemoData = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await addDemoWearableData();
      setResult(null);
      alert('Demo data added (~24 points over 5 days). Run the analysis.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add demo data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRunAnalysis = useCallback(async () => {
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await runWellnessAnalysis();
      setResult(data);
      loadInsights();
      loadLatestScores();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [loadInsights, loadLatestScores]);

  const handleLogout = useCallback(() => {
    logout();
    setLoggedIn(false);
    setResult(null);
    setProfile(null);
    setInsightsList([]);
    setLatestScores({});
    setError('');
  }, []);

  if (!loggedIn) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Wellness Intelligence</h1>
        </header>
        <div className="card">
          <div className="tabs">
            <button type="button" className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError(''); }}>Log in</button>
            <button type="button" className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError(''); }}>Register</button>
          </div>
          {DEMO_USERS.length > 0 && (
            <div className="demo-logins">
              <p className="meta">Quick demo (run backend seed first: <code>cd backend && npx prisma db seed</code>)</p>
              {DEMO_USERS.map((u) => (
                <button key={u.email} type="button" className="btn btn-demo" onClick={() => handleDemoLogin(u.email, u.password)} disabled={loading}>
                  {u.label}
                </button>
              ))}
            </div>
          )}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-row"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
              <div className="form-row"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="btn" disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</button>
            </form>
          )}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="form-row"><label>First name</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
              <div className="form-row"><label>Last name</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
              <div className="form-row"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
              <div className="form-row"><label>Password (min 8)</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" /></div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="btn" disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Wellness Intelligence</h1>
        <nav className="main-nav">
          <button type="button" className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}>Dashboard</button>
          <button type="button" className={page === 'insights' ? 'active' : ''} onClick={() => setPage('insights')}>Insights</button>
          <button type="button" className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}>Profile</button>
        </nav>
      </header>

      {page === 'dashboard' && (
        <>
          <div className="card">
            <p className="meta">Add demo wearable data (≈24 points over 5 days), then run the AI analysis.</p>
            <button type="button" className="btn" onClick={handleAddDemoData} disabled={loading}>{loading ? 'Adding…' : 'Add demo wearable data'}</button>
            <button type="button" className="btn" onClick={handleRunAnalysis} disabled={loading} style={{ marginLeft: '0.5rem' }}>{loading ? 'Running…' : 'Run wellness analysis'}</button>
            {error && <div className="error" style={{ marginTop: '1rem' }}>{error}</div>}
          </div>
          {result && (
            <div className="card">
              <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>Your results</h2>
              <p className="meta">Processed {result.processedDataPoints} data point(s).</p>
              <div className="scores-grid">
                {result.scores.map((s) => (
                  <div key={s.scoreType || s.type || ''} className="score-card">
                    <div className="label">{s.scoreType || s.type || 'Score'}</div>
                    <div className="value">{s.score}</div>
                    {s.explanation && <div className="explanation">{s.explanation}</div>}
                  </div>
                ))}
              </div>
              {result.insights.length > 0 && (
                <>
                  <h3 style={{ marginBottom: '0.75rem' }}>Insights</h3>
                  {result.insights.map((insight, i) => (
                    <div key={i} className="insight">
                      <h3>{insight.title}</h3>
                      <p>{insight.description}</p>
                      {insight.recommendations?.length ? <ul>{insight.recommendations.slice(0, 3).map((r, j) => <li key={j}>{r}</li>)}</ul> : null}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </>
      )}

      {page === 'insights' && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Latest scores & insights</h2>
          {Object.keys(latestScores).length > 0 && (
            <div className="scores-grid" style={{ marginBottom: '1.5rem' }}>
              {Object.entries(latestScores).map(([type, s]) => (
                <div key={type} className="score-card">
                  <div className="label">{type}</div>
                  <div className="value">{s.score}</div>
                  {s.explanation && <div className="explanation">{s.explanation}</div>}
                </div>
              ))}
            </div>
          )}
          {insightsList.length === 0 && Object.keys(latestScores).length === 0 && <p className="meta">Run analysis on the Dashboard first.</p>}
          {insightsList.length > 0 && (
            <>
              <h3>Saved insights</h3>
              {insightsList.map((i) => (
                <div key={i.id} className="insight">
                  <h3>{i.title}</h3>
                  <p>{i.description}</p>
                  {i.recommendations?.length ? <ul>{i.recommendations.slice(0, 3).map((r, j) => <li key={j}>{r}</li>)}</ul> : null}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {page === 'profile' && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Profile</h2>
          {profile ? (
            <>
              <p><strong>{profile.firstName} {profile.lastName}</strong></p>
              <p className="meta">{profile.email}</p>
            </>
          ) : (
            <p className="loading">Loading…</p>
          )}
          <button type="button" className="btn btn-secondary" onClick={handleLogout} style={{ marginTop: '1rem' }}>Log out</button>
        </div>
      )}
    </div>
  );
}
