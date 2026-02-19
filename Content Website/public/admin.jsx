const { useEffect, useMemo, useState } = React;

function createSupabaseClient() {
  const config = window.APP_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('PASTE_')) {
    return null;
  }
  return supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
}

function parseCaptions(text) {
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

  if (paragraphs.length > 0) return paragraphs;

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function slugFilename(name) {
  return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function AdminApp() {
  const [client, setClient] = useState(null);
  const [configError, setConfigError] = useState('');
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [images, setImages] = useState([]);
  const [captionsText, setCaptionsText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const supabaseClient = createSupabaseClient();
    if (!supabaseClient) {
      setConfigError('Ρύθμισε πρώτα το /public/config.js με SUPABASE_URL + ANON_KEY.');
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
      .select('id,title,caption,image_url,status,sort_order,created_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      setStatus(`Load error: ${error.message}`);
      return;
    }

    setPosts(data || []);
  }

  async function handleSignIn(event) {
    event.preventDefault();
    if (!client) return;

    setBusy(true);
    setStatus('Signing in...');

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(`Sign-in error: ${error.message}`);
      setBusy(false);
      return;
    }

    setStatus('Signed in.');
    setBusy(false);
  }

  async function handleSignOut() {
    if (!client) return;
    await client.auth.signOut();
    setStatus('Signed out.');
  }

  async function handleCaptionsFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCaptionsText(text);
    setStatus('captions.txt loaded.');
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!client || !session) return;

    if (images.length === 0) {
      setStatus('Διάλεξε τουλάχιστον 1 εικόνα.');
      return;
    }

    setBusy(true);
    setStatus('Uploading...');

    const captions = parseCaptions(captionsText || '');
    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';

    for (let i = 0; i < images.length; i += 1) {
      const file = images[i];
      const fileName = `${Date.now()}-${i}-${slugFilename(file.name)}`;
      const path = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setStatus(`Upload error (${file.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }

      const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);

      const payload = {
        title: file.name,
        image_url: publicData.publicUrl,
        image_path: path,
        caption: captions[i] || `Dummy caption ${i + 1}: Δυνατό concept post για Gym Way.`,
        status: 'published',
        username: 'gymway.official',
        like_count: 160 + i * 20,
        sort_order: i + 1
      };

      const { error: insertError } = await client.from('posts').insert(payload);
      if (insertError) {
        setStatus(`DB error (${file.name}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }

    setStatus(`Done. Uploaded ${images.length} posts.`);
    setImages([]);
    await loadPosts();
    setBusy(false);
  }

  async function togglePublish(post) {
    const next = post.status === 'published' ? 'draft' : 'published';
    const { error } = await client.from('posts').update({ status: next }).eq('id', post.id);
    if (error) {
      setStatus(`Update error: ${error.message}`);
      return;
    }
    setStatus(`Post ${post.title} -> ${next}`);
    await loadPosts();
  }

  const captionCount = useMemo(() => parseCaptions(captionsText || '').length, [captionsText]);

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
          <p className="eyebrow">ADMIN LOGIN</p>
          <h1>Gym Way Content Manager</h1>
          <p className="subtitle">Σύνδεση admin για upload φωτογραφιών και λεζαντών.</p>

          <form className="admin-form" onSubmit={handleSignIn}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button type="submit" disabled={busy}>{busy ? 'Please wait...' : 'Sign in'}</button>
          </form>

          {status && <p className="state">{status}</p>}
          <p className="caption-source"><a href="./index.html">Go to public preview</a></p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero reveal">
        <p className="eyebrow">ADMIN PANEL</p>
        <h1>Upload Posts + captions.txt</h1>
        <p className="subtitle">Κάνε upload φωτογραφίες/βίντεο και ένα txt με λεζάντες. Γίνεται αυτόματο pair κατά σειρά.</p>

        <form className="admin-form" onSubmit={handleUpload}>
          <label>
            Instagram media (images + videos)
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm,video/x-m4v"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
            />
          </label>

          <label>
            captions.txt
            <input type="file" accept="text/plain" onChange={handleCaptionsFile} />
          </label>

          <label>
            Ή paste captions text
            <textarea
              rows="6"
              value={captionsText}
              onChange={(e) => setCaptionsText(e.target.value)}
              placeholder="Μία λεζάντα ανά γραμμή ή με κενή γραμμή ανάμεσα"
            />
          </label>

          <div className="admin-actions">
            <button type="submit" disabled={busy}>{busy ? 'Uploading...' : 'Upload + Publish'}</button>
            <button type="button" className="secondary" onClick={handleSignOut}>Sign out</button>
            <a href="./index.html" className="secondary-link">Open public preview</a>
          </div>
        </form>

        <p className="state">Images selected: {images.length} | Captions parsed: {captionCount}</p>
        {status && <p className="state">{status}</p>}
      </section>

      <section className="admin-list reveal">
        <h2>All Posts</h2>
        {posts.length === 0 ? (
          <p className="state">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <article className="admin-row" key={post.id}>
              <div>
                <strong>{post.title}</strong>
                <p>{post.caption}</p>
                <small>{formatDate(post.created_at)}</small>
              </div>
              <div className="admin-row__actions">
                <span className={post.status === 'published' ? 'pill pill--ok' : 'pill'}>{post.status}</span>
                <button type="button" className="secondary" onClick={() => togglePublish(post)}>
                  {post.status === 'published' ? 'Unpublish' : 'Publish'}
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
