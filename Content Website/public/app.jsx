const { useEffect, useMemo, useState } = React;
const NOTES_HISTORY_KEY = 'gymway_notes_history_v1';

function createSupabaseClient() {
  const config = window.APP_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('PASTE_')) {
    return null;
  }
  return supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
}

function relativeDate(iso) {
  if (!iso) return 'Σήμερα';
  const diff = Date.now() - new Date(iso).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  if (diff < dayMs) return 'Σήμερα';
  const days = Math.max(1, Math.floor(diff / dayMs));
  if (days < 7) return `${days}η`;
  return `${Math.floor(days / 7)}εβδ`;
}

function isVideoPost(post) {
  const value = `${post?.image_url || ''} ${post?.title || ''}`.toLowerCase();
  return ['.mp4', '.mov', '.webm', '.m4v'].some((ext) => value.includes(ext));
}

function approvalLabel(status) {
  if (status === 'approved') return 'Εγκρίθηκε';
  if (status === 'disapproved') return 'Απορρίφθηκε';
  return 'Σε αναμονή';
}

function formatHistoryDateTime(iso) {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return '-';
  return value.toLocaleString('el-GR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function readNotesHistory() {
  try {
    const raw = window.localStorage.getItem(NOTES_HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeNotesHistory(value) {
  try {
    window.localStorage.setItem(NOTES_HISTORY_KEY, JSON.stringify(value));
  } catch {
    // Best effort only.
  }
}

function CaptionBlock({ username, caption }) {
  const [expanded, setExpanded] = useState(false);
  const finalCaption = (caption || 'Η λεζάντα εκκρεμεί...').trim();
  const limit = 150;
  const shouldCollapse = finalCaption.length > limit;
  const visibleCaption = shouldCollapse && !expanded
    ? `${finalCaption.slice(0, limit).trimEnd()}...`
    : finalCaption;

  return (
    <div className="caption-wrap">
      <p className="caption">
        <strong>{username || 'gymway.official'}</strong> {visibleCaption}
      </p>
      {shouldCollapse && (
        <button type="button" className="caption-toggle" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? 'Λιγότερα' : 'Περισσότερα'}
        </button>
      )}
    </div>
  );
}

function PostCard({ post, index, onUpdateReview, pending, historyEntries, onAppendHistory }) {
  const fallback = `Ανάρτηση ${index + 1}`;
  const isVideo = isVideoPost(post);
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const trimmedNotes = notes.trim();
  const noteMissing = trimmedNotes.length === 0;

  async function handleSaveNotes() {
    if (noteMissing) return;
    const ok = await onUpdateReview(post.id, { client_notes: trimmedNotes }, 'Οι σημειώσεις αποθηκεύτηκαν.');
    if (!ok) return;
    onAppendHistory(post.id, trimmedNotes, 'Σημείωση');
    setNotes('');
  }

  async function handleDecision(nextStatus) {
    const ok = await onUpdateReview(
      post.id,
      { approval_status: nextStatus, client_notes: trimmedNotes },
      nextStatus === 'approved' ? 'Η ανάρτηση εγκρίθηκε.' : 'Η ανάρτηση απορρίφθηκε.'
    );
    if (!ok) return;
    onAppendHistory(
      post.id,
      trimmedNotes || 'Χωρίς σημείωση.',
      nextStatus === 'approved' ? 'Έγκριση' : 'Απόρριψη'
    );
    setNotes('');
  }

  return (
    <article className={`ig-post ${pending ? 'ig-post--loading' : ''}`} style={{ animationDelay: `${Math.min(index * 45, 550)}ms` }}>
      <header className="ig-post__header">
        <div className="avatar"></div>
        <div>
          <strong>{post.username || 'gymway.official'}</strong>
          <p>{relativeDate(post.created_at)} πριν</p>
        </div>
        <span className="menu">...</span>
      </header>

      <div className="ig-post__media" role="img" aria-label="Προεπισκόπηση ανάρτησης Instagram">
        {post.image_url && !isVideo ? (
          <img src={post.image_url} alt={post.title || fallback} loading="lazy" />
        ) : post.image_url && isVideo ? (
          <video src={post.image_url} controls playsInline preload="metadata" />
        ) : (
          <>
            <div className="ig-post__tag">ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΝΑΡΤΗΣΗΣ</div>
            <div className="ig-post__filename">{post.title || fallback}</div>
          </>
        )}
      </div>

      <div className="ig-post__actions">
        <span className={`pill ${post.approval_status === 'approved' ? 'pill--ok' : ''}`}>
          {approvalLabel(post.approval_status)}
        </span>
        <span>{relativeDate(post.created_at)} πριν</span>
      </div>

      <div className="ig-post__body">
        <CaptionBlock username={post.username} caption={post.caption} />
        <div className="review-box">
          <div className="review-box__head">
            <label htmlFor={`notes-${post.id}`}>Σημειώσεις πελάτη</label>
            <button
              type="button"
              className="notes-history-toggle"
              onClick={() => setShowHistory((prev) => !prev)}
              disabled={(historyEntries || []).length === 0}
            >
              Ιστορικό σημειώσεων
            </button>
          </div>
          {showHistory && (historyEntries || []).length > 0 && (
            <div className="notes-history">
              {(historyEntries || []).map((entry) => (
                <article key={entry.id} className="notes-history__item">
                  <small>{formatHistoryDateTime(entry.createdAt)} • {entry.action}</small>
                  <p>{entry.text}</p>
                </article>
              ))}
            </div>
          )}
          <textarea
            id={`notes-${post.id}`}
            rows="3"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Γράψε σχόλιο για αυτή την ανάρτηση..."
          />
          <div className="review-box__actions">
            <button type="button" className="secondary" onClick={handleSaveNotes} disabled={pending || noteMissing}>
              Αποθήκευση σημείωσης
            </button>
            <button type="button" onClick={() => handleDecision('approved')} disabled={pending}>
              Έγκριση
            </button>
            <button type="button" className="danger" onClick={() => handleDecision('disapproved')} disabled={pending}>
              Απόρριψη
            </button>
          </div>
          <small>Η σημείωση είναι προαιρετική για έγκριση ή απόρριψη.</small>
        </div>
      </div>
      {pending && (
        <div className="ig-post__loading">
          <span>Αποθήκευση...</span>
        </div>
      )}
    </article>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '', message: '' });
  const [savingId, setSavingId] = useState(null);
  const [notesHistoryByPost, setNotesHistoryByPost] = useState({});

  useEffect(() => {
    setNotesHistoryByPost(readNotesHistory());
  }, []);

  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) {
      setStatus({ loading: false, error: 'Ρύθμισε τα Supabase keys στο /public/config.js', message: '' });
      return;
    }

    client
      .from('posts')
      .select('id,title,caption,image_url,created_at,username,status,sort_order,approval_status,client_notes')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setStatus({ loading: false, error: error.message, message: '' });
          return;
        }
        setPosts(data || []);
        setStatus({ loading: false, error: '', message: '' });
      });
  }, []);

  async function updateReview(postId, changes, successMessage) {
    const client = createSupabaseClient();
    if (!client) return;
    setSavingId(postId);
    setStatus((prev) => ({ ...prev, message: '' }));

    const { data, error } = await client
      .from('posts')
      .update(changes)
      .eq('id', postId)
      .select('id,approval_status,client_notes')
      .single();

    if (error) {
      setStatus((prev) => ({ ...prev, message: `Σφάλμα ενημέρωσης: ${error.message}` }));
      setSavingId(null);
      return false;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              approval_status: data.approval_status,
              client_notes: data.client_notes
            }
          : post
      )
    );
    setStatus((prev) => ({ ...prev, message: successMessage }));
    setSavingId(null);
    return true;
  }

  function appendNoteHistory(postId, text, action) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      action,
      createdAt: new Date().toISOString()
    };

    setNotesHistoryByPost((prev) => {
      const next = {
        ...prev,
        [postId]: [entry, ...(prev[postId] || [])]
      };
      writeNotesHistory(next);
      return next;
    });
  }

  const approvedCount = useMemo(
    () => posts.filter((post) => post.approval_status === 'approved').length,
    [posts]
  );
  const disapprovedCount = useMemo(
    () => posts.filter((post) => post.approval_status === 'disapproved').length,
    [posts]
  );
  const needsReviewCount = useMemo(
    () => posts.filter((post) => (post.client_notes || '').trim().length > 0).length,
    [posts]
  );

  return (
    <main className="page">
      <section className="hero reveal">
        <div className="hero__orb hero__orb--left"></div>
        <div className="hero__orb hero__orb--right"></div>

        <p className="eyebrow">ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΠΕΛΑΤΗ INSTAGRAM</p>
        <h1>Gym Way Ροή Εγκρίσεων</h1>
        <p className="subtitle">
          Αυτή η σελίδα προορίζεται μόνο για τον πελάτη.
          Χρησιμοποιείται για σημειώσεις και εγκρίσεις αναρτήσεων.
          <a href="./admin.html" className="hero-link"> Πίνακας διαχείρισης</a>
        </p>

        <div className="stats">
          <article>
            <span>Εγκεκριμένα</span>
            <strong>{approvedCount}</strong>
          </article>
          <article>
            <span>Απορριφθέντα</span>
            <strong>{disapprovedCount}</strong>
          </article>
          <article>
            <span>Χρειάζονται έλεγχο</span>
            <strong>{needsReviewCount}</strong>
          </article>
        </div>
      </section>

      {status.loading && <p className="state">Φόρτωση προεπισκόπησης...</p>}
      {status.error && <p className="state state--error">Σφάλμα: {status.error}</p>}
      {status.message && <p className="state">{status.message}</p>}

      {!status.loading && !status.error && (
        <section className="feed reveal">
          {posts.length === 0 ? (
            <p className="state">Δεν υπάρχουν δημοσιευμένες αναρτήσεις ακόμα. Μπες στη Διαχείριση για ανέβασμα.</p>
          ) : (
            posts.map((post, idx) => (
              <PostCard
                key={post.id}
                post={post}
                index={idx}
                pending={savingId === post.id}
                onUpdateReview={updateReview}
                historyEntries={notesHistoryByPost[post.id] || []}
                onAppendHistory={appendNoteHistory}
              />
            ))
          )}
        </section>
      )}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
