import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { createClient } from '@supabase/supabase-js';

const WAITLIST_TABLE = (window.WAITLIST_CONFIG?.WAITLIST_TABLE || 'waitlist_signups').trim();

let waitlistClientCache = null;
let waitlistClientKey = '';

function createWaitlistSupabaseClient() {
  const config = window.WAITLIST_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) return null;
  const cacheKey = `${config.SUPABASE_URL}::${config.SUPABASE_ANON_KEY}`;
  if (waitlistClientCache && waitlistClientKey === cacheKey) return waitlistClientCache;
  waitlistClientCache = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  waitlistClientKey = cacheKey;
  return waitlistClientCache;
}

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const drift = keyframes`
  0% { transform: translateX(0px); }
  50% { transform: translateX(6px); }
  100% { transform: translateX(0px); }
`;

const AppStyle = createGlobalStyle`
  :root {
    --panel-border: color-mix(in srgb, var(--greyDark) 38%, transparent);
    --panel-soft: color-mix(in srgb, var(--gloom) 66%, transparent);
    --text-main: var(--white);
    --text-muted: var(--greyDark);
    --shadow: 0 24px 70px color-mix(in srgb, var(--black) 38%, transparent);
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
    background-attachment: fixed;
  }
`;

const Page = styled.main`
  width: min(1200px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 24px 0 36px;
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid var(--panel-border);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--dark) 86%, transparent), color-mix(in srgb, var(--gloom) 70%, transparent));
  box-shadow: var(--shadow);
  min-height: 78vh;
`;

const Nav = styled.header`
  height: 74px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
`;

const TopLogo = styled.img`
  width: min(220px, 44vw);
  display: block;
  filter: drop-shadow(0 8px 16px color-mix(in srgb, var(--black) 25%, transparent));
`;

const HeroCenter = styled.div`
  position: relative;
  z-index: 2;
  width: min(860px, calc(100% - 28px));
  margin: 0 auto;
  padding: 56px 0 46px;
  display: grid;
  gap: 16px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 auto;
  max-width: 12ch;
  font-family: 'Syne', sans-serif;
  font-size: clamp(3.4rem, 9vw, 6.8rem);
  line-height: 0.92;
  letter-spacing: -0.06em;
`;

const Subtitle = styled.p`
  margin: 0 auto;
  max-width: 54ch;
  color: var(--text-muted);
  line-height: 1.7;
  font-size: clamp(0.98rem, 1.8vw, 1.18rem);
`;

const Form = styled.form`
  margin-top: 8px;
  display: grid;
  gap: 12px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const fieldStyles = `
  min-height: 56px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);
  background: color-mix(in srgb, var(--gloom) 72%, transparent);
  color: var(--text-main);
  padding: 0 16px;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &:focus {
    border-color: color-mix(in srgb, var(--focus) 54%, var(--greyDark));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus) 14%, transparent);
  }

  &::placeholder {
    color: color-mix(in srgb, var(--greyDark) 90%, transparent);
  }
`;

const Input = styled.input`${fieldStyles}`;

const Submit = styled.button`
  min-height: 58px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--success) 46%, transparent);
  background: color-mix(in srgb, var(--success) 16%, var(--gloomDark));
  color: var(--success);
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.66;
    cursor: wait;
  }
`;

const InlineNote = styled.p`
  margin: 0;
  color: ${(props) => (props.$error ? 'var(--error)' : 'var(--success)')};
  font-size: 0.92rem;
`;

const SocialChip = styled.div`
  position: absolute;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);
  background: color-mix(in srgb, var(--white) 92%, transparent);
  color: var(--dark);
  box-shadow: 0 14px 28px color-mix(in srgb, var(--black) 20%, transparent);
  animation: ${float} ${(props) => props.$duration || '4.5s'} ease-in-out infinite;

  & > div {
    animation: ${drift} ${(props) => props.$drift || '5.2s'} ease-in-out infinite;
  }
`;

const SocialIconWrap = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: ${(props) => (props.$type === 'fb'
    ? 'linear-gradient(135deg, #1877f2, #1b4fcf)'
    : 'linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)')};
`;

function SocialIcon({ type = 'fb' }) {
  if (type === 'fb') {
    return (
      <SocialIconWrap $type="fb">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15.12 8.21H13.8V6.88c0-.55.45-.99.99-.99h1.33V3.56h-1.33A3.32 3.32 0 0 0 11.48 6.88v1.33H9.82v2.33h1.66v9.89h2.32v-9.9h1.9l.42-2.32Z"
            fill="white"
          />
        </svg>
      </SocialIconWrap>
    );
  }

  return (
    <SocialIconWrap $type="ig">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" stroke="white" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="white" />
      </svg>
    </SocialIconWrap>
  );
}

const initialForm = {
  full_name: '',
  email: '',
  phone: '',
  company_name: ''
};

function normalizeTrimmedValue(value) {
  return `${value || ''}`.replace(/\s+/g, ' ').trim();
}

function resolveFriendlyError(error) {
  const code = `${error?.code || ''}`.trim();
  const message = `${error?.message || ''}`.toLowerCase();
  if (code === '23505' || message.includes('duplicate key')) return 'Αυτό το email υπάρχει ήδη στη λίστα.';
  if (message.includes('relation') && message.includes('does not exist')) return `Το table "${WAITLIST_TABLE}" δεν βρέθηκε.`;
  if (message.includes('row-level security')) return 'Το Supabase policy μπλοκάρει public submissions.';
  return error?.message || 'Κάτι πήγε στραβά. Δοκίμασε ξανά.';
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [busy, setBusy] = useState(false);
  const supabaseReady = useMemo(() => Boolean(createWaitlistSupabaseClient()), []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const payload = {
      full_name: normalizeTrimmedValue(form.full_name),
      email: normalizeTrimmedValue(form.email).toLowerCase(),
      company_name: normalizeTrimmedValue(form.company_name),
      role: 'waitlist',
      monthly_clients: '',
      biggest_bottleneck: `phone=${normalizeTrimmedValue(form.phone)}`
    };

    if (!payload.full_name || !payload.email || !payload.company_name || !normalizeTrimmedValue(form.phone)) {
      setStatus({ type: 'error', message: 'Συμπλήρωσε όνομα, email, τηλέφωνο και agency/company.' });
      return;
    }

    const supabase = createWaitlistSupabaseClient();
    if (!supabase) {
      setStatus({ type: 'error', message: 'Λείπει το waitlist config.' });
      return;
    }

    setBusy(true);
    const { error } = await supabase.from(WAITLIST_TABLE).insert([payload]);
    if (error) {
      setStatus({ type: 'error', message: resolveFriendlyError(error) });
      setBusy(false);
      return;
    }

    setForm(initialForm);
    setStatus({ type: 'success', message: 'Η αίτηση καταχωρήθηκε. Θα επικοινωνήσουμε για early access.' });
    setBusy(false);
  }

  return (
    <>
      <AppStyle />
      <Page>
        <Hero>
          <Nav>
            <TopLogo src="/waitlist/doitforme-logo.svg" alt="Doitforme logo" />
          </Nav>

          <HeroCenter>
            <Title>Your social media tools in a workspace.</Title>
            <Subtitle>
              Proposals, client approvals, and Meta scheduling in one workflow.
              Apply now for the first unofficial release.
            </Subtitle>

            <Form onSubmit={handleSubmit}>
              <Row>
                <Input
                  type="text"
                  value={form.full_name}
                  onChange={(event) => updateField('full_name', event.target.value)}
                  placeholder="Ονοματεπώνυμο *"
                />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="Διεύθυνση Email *"
                />
              </Row>
              <Row>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="Κινητό τηλέφωνο *"
                />
                <Input
                  type="text"
                  value={form.company_name}
                  onChange={(event) => updateField('company_name', event.target.value)}
                  placeholder="Agency / Company *"
                />
              </Row>
              {status.message ? <InlineNote $error={status.type === 'error'}>{status.message}</InlineNote> : null}
              {!supabaseReady ? <InlineNote $error>Το waitlist config δεν είναι διαθέσιμο.</InlineNote> : null}
              <Submit type="submit" disabled={busy || !supabaseReady}>
                {busy ? 'Υποβολή...' : 'Κλείσε θέση στο early access'}
              </Submit>
            </Form>
          </HeroCenter>

          <SocialChip style={{ left: '7%', top: '22%' }} $duration="4.6s" $drift="5.1s"><SocialIcon type="ig" /></SocialChip>
          <SocialChip style={{ left: '15%', top: '62%' }} $duration="5.2s" $drift="4.8s"><SocialIcon type="fb" /></SocialChip>
          <SocialChip style={{ right: '9%', top: '20%' }} $duration="4.2s" $drift="5.4s"><SocialIcon type="ig" /></SocialChip>
          <SocialChip style={{ right: '17%', top: '64%' }} $duration="5.4s" $drift="4.9s"><SocialIcon type="fb" /></SocialChip>
          <SocialChip style={{ left: '28%', top: '15%' }} $duration="4.9s" $drift="5.5s"><SocialIcon type="fb" /></SocialChip>
          <SocialChip style={{ right: '28%', top: '46%' }} $duration="5.1s" $drift="4.7s"><SocialIcon type="ig" /></SocialChip>
        </Hero>
      </Page>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
