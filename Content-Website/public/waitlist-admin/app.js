import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled, { createGlobalStyle } from 'styled-components';
import { createClient } from '@supabase/supabase-js';

const WAITLIST_TABLE = (window.WAITLIST_CONFIG?.WAITLIST_TABLE || 'waitlist_signups').trim();

let clientCache = null;
let clientCacheKey = '';

function createWaitlistSupabaseClient() {
  const config = window.WAITLIST_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) return null;
  const cacheKey = `${config.SUPABASE_URL}::${config.SUPABASE_ANON_KEY}`;
  if (clientCache && clientCacheKey === cacheKey) return clientCache;
  clientCache = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  clientCacheKey = cacheKey;
  return clientCache;
}

const AppStyle = createGlobalStyle`
  :root {
    --panel: color-mix(in srgb, var(--dark) 82%, transparent);
    --panel-border: color-mix(in srgb, var(--greyDark) 38%, transparent);
    --text-main: var(--white);
    --text-muted: var(--greyDark);
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: 'Sora', sans-serif;
    color: var(--text-main);
    background:
      radial-gradient(circle at 10% 16%, color-mix(in srgb, var(--main) 42%, transparent) 0%, transparent 35%),
      radial-gradient(circle at 86% 11%, color-mix(in srgb, var(--focus) 38%, transparent) 0%, transparent 32%),
      linear-gradient(145deg, var(--black) 0%, var(--dark) 52%, var(--gloomDark) 100%);
  }
`;

const Page = styled.main`
  width: min(1200px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 26px 0 40px;
  display: grid;
  gap: 14px;
`;

const Panel = styled.section`
  border-radius: 20px;
  border: 1px solid var(--panel-border);
  background: var(--panel);
  padding: 18px;
`;

const Header = styled(Panel)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h1`
  margin: 0;
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1;
`;

const Muted = styled.p`
  margin: 0;
  color: var(--text-muted);
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  min-height: 52px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 32%, transparent);
  background: color-mix(in srgb, var(--gloom) 72%, transparent);
  color: var(--text-main);
  padding: 0 14px;
  outline: none;
`;

const Button = styled.button`
  min-height: 48px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--success) 46%, transparent);
  background: color-mix(in srgb, var(--success) 16%, var(--gloomDark));
  color: var(--success);
  padding: 0 14px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.66;
    cursor: wait;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: var(--error);
`;

const TableWrap = styled.div`
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 920px;

  th,
  td {
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid color-mix(in srgb, var(--greyDark) 22%, transparent);
    vertical-align: top;
  }

  th {
    color: var(--text-muted);
    font-size: 0.82rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function App() {
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const supabase = useMemo(() => createWaitlistSupabaseClient(), []);

  async function loadRows() {
    if (!supabase) return;
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from(WAITLIST_TABLE)
      .select('id,full_name,email,company_name,role,monthly_clients,biggest_bottleneck,created_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message || 'Load failed.');
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!supabase) {
      setError('Missing waitlist Supabase config.');
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) {
      setRows([]);
      return;
    }
    loadRows();
  }, [session]);

  async function handleSignIn(event) {
    event.preventDefault();
    if (!supabase) return;
    setAuthLoading(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password
    });
    if (signInError) {
      setError(signInError.message || 'Sign in failed.');
      setAuthLoading(false);
      return;
    }
    setAuthLoading(false);
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  }

  return (
    <>
      <AppStyle />
      <Page>
        <Header>
          <div>
            <Title>Waitlist Admin</Title>
            <Muted>{session ? `Table: ${WAITLIST_TABLE}` : 'Login required'}</Muted>
          </div>
          {session ? <Button type="button" onClick={handleSignOut}>Sign out</Button> : null}
        </Header>

        {!session ? (
          <Panel>
            <form onSubmit={handleSignIn}>
              <Row>
                <Input
                  type="email"
                  value={credentials.email}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="User email"
                  required
                />
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Password"
                  required
                />
              </Row>
              <div style={{ marginTop: '10px' }}>
                <Button type="submit" disabled={authLoading}>{authLoading ? 'Signing in...' : 'Sign in'}</Button>
              </div>
            </form>
          </Panel>
        ) : (
          <Panel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
              <Muted>Total: {rows.length}</Muted>
              <Button type="button" onClick={loadRows} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
            </div>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Created</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Clients</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>{formatDate(row.created_at)}</td>
                      <td>{row.full_name || '-'}</td>
                      <td>{row.email || '-'}</td>
                      <td>{row.company_name || '-'}</td>
                      <td>{row.role || '-'}</td>
                      <td>{row.monthly_clients || '-'}</td>
                      <td>{row.biggest_bottleneck || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </Panel>
        )}

        {error ? <ErrorText>{error}</ErrorText> : null}
      </Page>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
