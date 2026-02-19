const { useEffect, useMemo, useState } = React;

function createSupabaseClient() {
  const config = window.APP_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('PASTE_')) {
    return null;
  }
  return supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
}

function formatLikes(value) {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}

function relativeDate(iso) {
  if (!iso) return 'Today';
  const diff = Date.now() - new Date(iso).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  if (diff < dayMs) return 'Today';
  const days = Math.max(1, Math.floor(diff / dayMs));
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function isVideoPost(post) {
  const value = `${post?.image_url || ''} ${post?.title || ''}`.toLowerCase();
  return ['.mp4', '.mov', '.webm', '.m4v'].some((ext) => value.includes(ext));
}

function PostCard({ post, index }) {
  const fallback = `Post ${index + 1}`;
  const isVideo = isVideoPost(post);

  return (
    <article className="ig-post" style={{ animationDelay: `${Math.min(index * 45, 550)}ms` }}>
      <header className="ig-post__header">
        <div className="avatar"></div>
        <div>
          <strong>{post.username || 'gymway.official'}</strong>
          <p>{relativeDate(post.created_at)} ago</p>
        </div>
        <span className="menu">...</span>
      </header>

      <div className="ig-post__media" role="img" aria-label="Instagram preview post">
        {post.image_url && !isVideo ? (
          <img src={post.image_url} alt={post.title || fallback} loading="lazy" />
        ) : post.image_url && isVideo ? (
          <video src={post.image_url} controls playsInline preload="metadata" />
        ) : (
          <>
            <div className="ig-post__tag">POST PREVIEW</div>
            <div className="ig-post__filename">{post.title || fallback}</div>
          </>
        )}
      </div>

      <div className="ig-post__actions">
        <span>♥</span>
        <span>💬</span>
        <span>➤</span>
        <span className="save">✦</span>
      </div>

      <div className="ig-post__body">
        <p className="likes">{formatLikes(post.like_count || 180 + index * 21)} likes</p>
        <p className="caption">
          <strong>{post.username || 'gymway.official'}</strong> {post.caption || 'Caption pending...'}
        </p>
      </div>
    </article>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '' });

  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) {
      setStatus({ loading: false, error: 'Ρύθμισε τα Supabase keys στο /public/config.js' });
      return;
    }

    client
      .from('posts')
      .select('id,title,caption,image_url,created_at,username,like_count,status,sort_order')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setStatus({ loading: false, error: error.message });
          return;
        }
        setPosts(data || []);
        setStatus({ loading: false, error: '' });
      });
  }, []);

  const totalLikes = useMemo(
    () => posts.reduce((sum, post, idx) => sum + (post.like_count || 180 + idx * 21), 0),
    [posts]
  );

  return (
    <main className="page">
      <section className="hero reveal">
        <div className="hero__orb hero__orb--left"></div>
        <div className="hero__orb hero__orb--right"></div>

        <p className="eyebrow">INSTAGRAM CLIENT PREVIEW</p>
        <h1>Gym Way Approval Feed</h1>
        <p className="subtitle">
          Live preview για τον πελάτη. Τα posts και οι λεζάντες φορτώνουν από Supabase.
          <a href="./admin.html" className="hero-link"> Admin panel</a>
        </p>

        <div className="stats">
          <article>
            <span>Published Posts</span>
            <strong>{posts.length}</strong>
          </article>
          <article>
            <span>Total Likes (preview)</span>
            <strong>{formatLikes(totalLikes)}</strong>
          </article>
          <article>
            <span>Status</span>
            <strong>{status.loading ? 'Syncing' : 'Live'}</strong>
          </article>
        </div>
      </section>

      {status.loading && <p className="state">Loading preview feed...</p>}
      {status.error && <p className="state state--error">Error: {status.error}</p>}

      {!status.loading && !status.error && (
        <section className="feed reveal">
          {posts.length === 0 ? (
            <p className="state">Δεν υπάρχουν published posts ακόμα. Μπες στο Admin για upload.</p>
          ) : (
            posts.map((post, idx) => <PostCard key={post.id} post={post} index={idx} />)
          )}
        </section>
      )}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
