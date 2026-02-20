const { useEffect, useMemo, useState } = React;

function createSupabaseClient() {
  const config = window.APP_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('PASTE_')) {
    return null;
  }
  return supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
}

function slugFilename(name) {
  return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function reviewState(post) {
  const hasNotes = (post.client_notes || '').trim().length > 0;
  if (post.approval_status === 'approved' && !hasNotes) return 'ready';
  if (post.approval_status === 'disapproved' || hasNotes) return 'changes';
  return 'awaiting';
}

function reviewStateLabel(state) {
  if (state === 'ready') return 'Έτοιμο για δημοσίευση';
  if (state === 'changes') return 'Χρειάζεται αλλαγές';
  return 'Αναμονή ελέγχου πελάτη';
}

function approvalLabel(status) {
  if (status === 'approved') return 'Εγκρίθηκε';
  if (status === 'disapproved') return 'Απορρίφθηκε';
  return 'Σε αναμονή';
}

function isVideoFile(file) {
  return file?.type?.startsWith('video/');
}

function parseCaptions(text) {
  const cleaned = (text || '').trim();
  if (!cleaned) return [];

  const byPost = [];
  const regex = /Post\s*(\d+)\s*:\s*([\s\S]*?)(?=(?:\n\s*Post\s*\d+\s*:)|$)/gi;
  let match = regex.exec(cleaned);

  while (match) {
    const index = Number(match[1]) - 1;
    if (index >= 0) {
      byPost[index] = match[2].trim();
    }
    match = regex.exec(cleaned);
  }

  if (byPost.some(Boolean)) return byPost;

  return cleaned
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createMediaItems(files) {
  return files.map((file) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    kind: isVideoFile(file) ? 'video' : 'image'
  }));
}

function AdminApp() {
  const [client, setClient] = useState(null);
  const [configError, setConfigError] = useState('');
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [orderLocked, setOrderLocked] = useState(false);
  const [captionsText, setCaptionsText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const supabaseClient = createSupabaseClient();
    if (!supabaseClient) {
      setConfigError('Ρύθμισε πρώτα το /public/config.js με SUPABASE_URL και SUPABASE_ANON_KEY.');
      return;
    }

    setClient(supabaseClient);

    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!client || !session) return;
    loadPosts();
  }, [client, session]);

  async function loadPosts() {
    const { data, error } = await client
      .from('posts')
      .select('id,title,caption,image_url,image_path,status,sort_order,created_at,approval_status,client_notes')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      setStatus(`Σφάλμα φόρτωσης: ${error.message}`);
      return;
    }

    setPosts(data || []);
  }

  function appendFiles(files) {
    if (orderLocked) {
      setStatus('Ξεκλείδωσε πρώτα τη σειρά αν θέλεις να προσθέσεις ή να αλλάξεις αρχεία.');
      return;
    }

    const validFiles = Array.from(files || []).filter((file) =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
      setStatus('Ρίξε μόνο αρχεία εικόνας/βίντεο.');
      return;
    }

    const nextItems = createMediaItems(validFiles);
    setMediaItems((prev) => [...prev, ...nextItems]);
    setStatus(`Προστέθηκαν ${validFiles.length} αρχεία.`);
  }

  function reorderItems(fromIndex, toIndex) {
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setMediaItems((prev) => {
      const copy = [...prev];
      const [picked] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, picked);
      return copy;
    });
  }

  function handleTileDrop(targetId) {
    if (orderLocked || !draggedId) return;
    const fromIndex = mediaItems.findIndex((item) => item.id === draggedId);
    const toIndex = mediaItems.findIndex((item) => item.id === targetId);
    reorderItems(fromIndex, toIndex);
    setDraggedId(null);
  }

  function removeMedia(id) {
    if (orderLocked) return;
    setMediaItems((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function clearMedia() {
    if (orderLocked) return;
    mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaItems([]);
    setStatus('Η λίστα αρχείων καθαρίστηκε.');
  }

  async function handleSignIn(event) {
    event.preventDefault();
    if (!client) return;

    setBusy(true);
    setStatus('Γίνεται σύνδεση...');

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(`Σφάλμα σύνδεσης: ${error.message}`);
      setBusy(false);
      return;
    }

    setStatus('Συνδέθηκες επιτυχώς.');
    setBusy(false);
  }

  async function handleSignOut() {
    if (!client) return;
    await client.auth.signOut();
    setStatus('Έγινε αποσύνδεση.');
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!client || !session) return;

    if (mediaItems.length === 0) {
      setStatus('Βήμα 1: Ρίξε πρώτα τουλάχιστον 1 αρχείο πολυμέσου.');
      return;
    }

    if (!orderLocked) {
      setStatus('Βήμα 2: Κλείδωσε την τελική σειρά αναρτήσεων πριν το ανέβασμα.');
      return;
    }

    const captions = parseCaptions(captionsText);
    setBusy(true);
    setStatus('Γίνεται ανέβασμα και δημιουργία αναρτήσεων...');

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';

    for (let i = 0; i < mediaItems.length; i += 1) {
      const item = mediaItems[i];
      const file = item.file;
      const fileName = `${Date.now()}-${i}-${slugFilename(file.name)}`;
      const path = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setStatus(`Σφάλμα upload (${file.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }

      const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);

      const payload = {
        title: file.name,
        image_url: publicData.publicUrl,
        image_path: path,
        caption: captions[i] || `Post ${i + 1}: Η λεζάντα εκκρεμεί.`,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        username: 'gymway.official',
        like_count: 160 + i * 20,
        sort_order: i + 1
      };

      const { error: insertError } = await client.from('posts').insert(payload);
      if (insertError) {
        setStatus(`Σφάλμα βάσης (${file.name}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }

    mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaItems([]);
    setOrderLocked(false);
    setCaptionsText('');
    setStatus(`Ολοκληρώθηκε. Ανέβηκαν ${mediaItems.length} αναρτήσεις με τη κλειδωμένη σειρά.`);
    await loadPosts();
    setBusy(false);
  }

  async function togglePublish(post) {
    const next = post.status === 'published' ? 'draft' : 'published';
    const { error } = await client.from('posts').update({ status: next }).eq('id', post.id);
    if (error) {
      setStatus(`Σφάλμα ενημέρωσης: ${error.message}`);
      return;
    }
    setStatus(`Ανάρτηση ${post.title} -> ${next === 'published' ? 'δημοσιευμένη' : 'πρόχειρη'}`);
    await loadPosts();
  }

  async function deletePostPermanently(post) {
    if (!client) return;
    const confirmed = window.confirm(`Να διαγραφεί οριστικά το "${post.title}"; Αυτή η ενέργεια δεν αναιρείται.`);
    if (!confirmed) return;

    setBusy(true);
    setStatus(`Διαγραφή ${post.title}...`);

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';

    if (post.image_path) {
      const { error: storageError } = await client.storage.from(bucket).remove([post.image_path]);
      if (storageError) {
        setStatus(`Σφάλμα διαγραφής storage: ${storageError.message}`);
        setBusy(false);
        return;
      }
    }

    const { error: deleteError } = await client.from('posts').delete().eq('id', post.id);
    if (deleteError) {
      setStatus(`Σφάλμα διαγραφής βάσης: ${deleteError.message}`);
      setBusy(false);
      return;
    }

    setStatus(`Το "${post.title}" διαγράφηκε οριστικά.`);
    await loadPosts();
    setBusy(false);
  }

  async function deleteAllPostsPermanently() {
    if (!client || posts.length === 0) return;
    const confirmed = window.confirm(`Να διαγραφούν ΟΛΕΣ οι ${posts.length} αναρτήσεις οριστικά; Αυτή η ενέργεια δεν αναιρείται.`);
    if (!confirmed) return;

    setBusy(true);
    setStatus('Γίνεται οριστική διαγραφή όλων των αναρτήσεων...');

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';
    const paths = posts.map((post) => post.image_path).filter(Boolean);

    if (paths.length > 0) {
      const { error: storageError } = await client.storage.from(bucket).remove(paths);
      if (storageError) {
        setStatus(`Σφάλμα διαγραφής storage: ${storageError.message}`);
        setBusy(false);
        return;
      }
    }

    const ids = posts.map((post) => post.id);
    const { error: deleteError } = await client.from('posts').delete().in('id', ids);
    if (deleteError) {
      setStatus(`Σφάλμα διαγραφής βάσης: ${deleteError.message}`);
      setBusy(false);
      return;
    }

    setStatus('Όλες οι αναρτήσεις διαγράφηκαν οριστικά.');
    await loadPosts();
    setBusy(false);
  }

  const parsedCaptions = useMemo(() => parseCaptions(captionsText), [captionsText]);
  const mappedCaptions = useMemo(
    () => mediaItems.reduce((sum, _item, index) => sum + (parsedCaptions[index] ? 1 : 0), 0),
    [mediaItems, parsedCaptions]
  );
  const approvalOverview = useMemo(
    () =>
      posts.reduce(
        (acc, post) => {
          const state = reviewState(post);
          if (state === 'ready') acc.ready += 1;
          if (state === 'changes') acc.changes += 1;
          if (state === 'awaiting') acc.awaiting += 1;
          if (post.approval_status === 'approved') acc.approved += 1;
          if (post.approval_status === 'disapproved') acc.disapproved += 1;
          return acc;
        },
        { ready: 0, changes: 0, awaiting: 0, approved: 0, disapproved: 0 }
      ),
    [posts]
  );

  if (configError) {
    return (
      <main className="page">
        <section className="hero">
          <p className="state state--error">{configError}</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="page">
        <section className="hero reveal">
          <p className="eyebrow">ΣΥΝΔΕΣΗ ΔΙΑΧΕΙΡΙΣΗΣ</p>
          <h1>Gym Way Διαχείριση Περιεχομένου</h1>
          <p className="subtitle">Συνδέσου για ανέβασμα αρχείων και διαχείριση εγκρίσεων.</p>

          <form className="admin-form" onSubmit={handleSignIn}>
            <label>
              Ηλεκτρονικό ταχυδρομείο
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Κωδικός
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button type="submit" disabled={busy}>{busy ? 'Περίμενε...' : 'Σύνδεση'}</button>
          </form>

          {status && <p className="state">{status}</p>}
          <p className="caption-source"><a href="./index.html">Μετάβαση στην προεπισκόπηση πελάτη</a></p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero reveal">
        <p className="eyebrow">ΠΙΝΑΚΑΣ ΔΙΑΧΕΙΡΙΣΗΣ</p>
        <h1>Ανέβασμα Περιεχομένου σε 3 Βήματα</h1>
        <p className="subtitle">Ρίξε αρχεία, βάλε την τελική σειρά του προφίλ, κλείδωσέ τη και μετά κάνε επικόλληση όλων των λεζαντών σε ένα κείμενο.</p>

        <form className="admin-form" onSubmit={handleUpload}>
          <section className="admin-step">
            <h2>Βήμα 1. Σύρε και άφησε όλα τα αρχεία πολυμέσων</h2>
            <div
              className={`dropzone ${dragActive ? 'dropzone--active' : ''} ${orderLocked ? 'dropzone--locked' : ''}`}
              onDragOver={(event) => {
                event.preventDefault();
                if (!orderLocked) setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                appendFiles(event.dataTransfer.files);
              }}
            >
              <p>Ρίξε εικόνες/βίντεο εδώ</p>
              <label className="secondary-link file-picker">
                Επιλογή αρχείων
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  disabled={orderLocked}
                  onChange={(event) => {
                    appendFiles(event.target.files || []);
                    event.target.value = '';
                  }}
                />
              </label>
              <small>{orderLocked ? 'Η σειρά είναι κλειδωμένη. Ξεκλείδωσε για αλλαγές.' : 'Μπορείς να προσθέτεις αρχεία με πολλαπλά drop.'}</small>
            </div>
          </section>

          <section className="admin-step">
            <h2>Βήμα 2. Ορισμός σειράς αναρτήσεων και κλείδωμα τελικής θέσης</h2>
            {mediaItems.length === 0 ? (
              <p className="state">Δεν υπάρχουν αρχεία ακόμα.</p>
            ) : (
              <>
                <div className="media-grid">
                  {mediaItems.map((item, index) => (
                    <article
                      key={item.id}
                      className="media-tile"
                      draggable={!orderLocked}
                      onDragStart={() => setDraggedId(item.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleTileDrop(item.id)}
                    >
                      <span className="media-index">Ανάρτηση {index + 1}</span>
                      <div className="media-thumb">
                        {item.kind === 'video' ? (
                          <video src={item.previewUrl} muted playsInline preload="metadata" />
                        ) : (
                          <img src={item.previewUrl} alt={item.file.name} loading="lazy" />
                        )}
                      </div>
                      <p>{item.file.name}</p>
                      {!orderLocked && (
                        <button type="button" className="secondary" onClick={() => removeMedia(item.id)}>Αφαίρεση</button>
                      )}
                    </article>
                  ))}
                </div>

                <div className="admin-actions">
                  {!orderLocked ? (
                    <button type="button" onClick={() => setOrderLocked(true)}>Κλείδωμα τελικής σειράς</button>
                  ) : (
                    <button type="button" className="secondary" onClick={() => setOrderLocked(false)}>Ξεκλείδωμα σειράς</button>
                  )}
                  <button type="button" className="secondary" onClick={clearMedia} disabled={orderLocked}>Καθαρισμός αρχείων</button>
                </div>
              </>
            )}
          </section>

          <section className="admin-step">
            <h2>Βήμα 3. Επικόλληση όλων των λεζαντών σε ένα κείμενο</h2>
            <label>
              Πεδίο λεζαντών
              <textarea
                rows="8"
                value={captionsText}
                onChange={(event) => setCaptionsText(event.target.value)}
                placeholder={"Post 1: Πρώτη λεζάντα\n\nPost 2: Δεύτερη λεζάντα\n\nPost 3: Τρίτη λεζάντα"}
              />
            </label>
            <p className="state">Αντιστοιχισμένες λεζάντες: {mappedCaptions}/{mediaItems.length}</p>
          </section>

          <div className="admin-actions">
            <button type="submit" disabled={busy}>{busy ? 'Γίνεται ανέβασμα...' : 'Ανέβασμα + Δημοσίευση τελικής σειράς'}</button>
            <button type="button" className="secondary" onClick={handleSignOut}>Αποσύνδεση</button>
            <a href="./index.html" className="secondary-link">Άνοιγμα προεπισκόπησης πελάτη</a>
          </div>
        </form>

        {status && <p className="state">{status}</p>}
      </section>

      <section className="admin-list reveal">
        <div className="admin-list__header">
          <h2>Όλες οι Αναρτήσεις</h2>
          <button type="button" className="danger" onClick={deleteAllPostsPermanently} disabled={busy || posts.length === 0}>
            Οριστική διαγραφή όλων
          </button>
        </div>
        <div className="approval-overview">
          <article className="overview-card overview-card--changes">
            <span>Χρειάζονται αλλαγές</span>
            <strong>{approvalOverview.changes}</strong>
            {approvalOverview.changes > 0 && <em className="overview-dot" aria-hidden="true"></em>}
          </article>
          <article className="overview-card overview-card--ready">
            <span>Έτοιμα για δημοσίευση</span>
            <strong>{approvalOverview.ready}</strong>
            {approvalOverview.ready > 0 && <em className="overview-dot overview-dot--ok" aria-hidden="true"></em>}
          </article>
          <article className="overview-card overview-card--awaiting">
            <span>Αναμονή ελέγχου</span>
            <strong>{approvalOverview.awaiting}</strong>
            {approvalOverview.awaiting > 0 && <em className="overview-dot overview-dot--idle" aria-hidden="true"></em>}
          </article>
        </div>
        {posts.length === 0 ? (
          <p className="state">Δεν υπάρχουν αναρτήσεις ακόμα.</p>
        ) : (
          posts.map((post) => (
            <article className={`admin-row admin-row--${reviewState(post)}`} key={post.id}>
              <div>
                <strong>{post.title}</strong>
                <p>{post.caption}</p>
                <p><strong>Σημειώσεις πελάτη:</strong> {(post.client_notes || '').trim() || 'Δεν υπάρχουν σημειώσεις ακόμα.'}</p>
                <small>{formatDate(post.created_at)}</small>
              </div>
              <div className="admin-row__actions">
                <span className={post.status === 'published' ? 'pill pill--ok' : 'pill'}>
                  {post.status === 'published' ? 'Δημοσιευμένο' : 'Πρόχειρο'}
                </span>
                <span className={post.approval_status === 'approved' ? 'pill pill--ok' : post.approval_status === 'disapproved' ? 'pill pill--danger' : 'pill'}>
                  {approvalLabel(post.approval_status)}
                </span>
                <span className={reviewState(post) === 'ready' ? 'pill pill--ok' : reviewState(post) === 'changes' ? 'pill pill--danger' : 'pill'}>
                  {reviewStateLabel(reviewState(post))}
                </span>
                <button type="button" className="secondary" onClick={() => togglePublish(post)}>
                  {post.status === 'published' ? 'Απόσυρση' : 'Δημοσίευση'}
                </button>
                <button type="button" className="danger" onClick={() => deletePostPermanently(post)} disabled={busy}>
                  Οριστική διαγραφή
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp />);
