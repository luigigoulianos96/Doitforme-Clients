import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { create_supabase_client, resolve_storage_bucket } from '/src/utils/supabase/supabase_client.jsx';
import { approval_status_label, parse_captions_text, slug_filename } from '/src/utils/post/post_helpers.jsx';
import { review_state_key, review_state_label, build_approval_overview } from '/src/pages/admin/utils/admin_page_helpers.jsx';
import { Admin_Login_Form } from '/src/pages/admin/components/Admin_Login_Form.jsx';
import { Admin_Media_List } from '/src/pages/admin/components/Admin_Media_List.jsx';
import { Card, Grey_Link, Main_, Page, Red_, Textarea_ } from 'monica-alexandria';

const Page = styled(Page)`
  // width: min(120rem, 94vw);
  // margin: 0 auto;
  // padding: 4rem 0;
  // display: grid;
  // gap: 2rem;
`;

const Hero = styled(Card)`
  padding: var(--largePads);
  display: grid;
  gap: 1rem;
`;

const Dropzone = styled.div`
  border: 0.2rem dashed ${(p) => p.theme.high};
  border-radius: var(--normalRadius);
  padding: var(--largePads);
  background: ${(p) => p.theme.low};
  display: grid;
  gap: 1rem;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const StateText = styled.p`
  margin: 0;
  color: ${(p) => p.theme.mid};
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${(p) => p.theme.error};
`;

const Overview = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
`;

const OverviewCard = styled.article`
  border: 0.1rem solid ${(p) => p.theme.high};
  border-radius: var(--smallRadius);
  padding: var(--normalPads);
  background: ${(p) => p.theme.background};
`;

const PostList = styled.section`
  display: grid;
  gap: 1rem;
`;

const PostRow = styled.article`
  border: 0.1rem solid ${(p) => p.theme.high};
  border-radius: var(--smallRadius);
  padding: var(--normalPads);
  background: ${(p) => p.theme.low};
  display: grid;
  gap: 1rem;
`;

// Creates local media list rows from selected files.
// Backend integration: this local list defines upload order used by storage and DB calls.
export const create_media_items = (files) => {
  return files.map((file) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    kind: file.type.startsWith('video/') ? 'video' : 'image'
  }));
};

// Renders admin workflow for upload, ordering, publishing and permanent deletion.
// Backend integration: execute per-post upload first, then insert DB record, in strict order.
export const ADMIN = () => {
  const [client, setClient] = useState(null);
  const [configError, setConfigError] = useState('');
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [draggedId, setDraggedId] = useState('');
  const [orderLocked, setOrderLocked] = useState(false);
  const [captionsText, setCaptionsText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const supabaseClient = create_supabase_client();

    if (!supabaseClient) {
      setConfigError('Ρύθμισε πρώτα το /public/config.js με SUPABASE_URL και SUPABASE_ANON_KEY.');
      return;
    }

    setClient(supabaseClient);

    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const load_posts = async () => {
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
  };

  useEffect(() => {
    const ready = Boolean(client) && Boolean(session);

    if (ready) {
      load_posts();
    }
  }, [client, session]);

  const append_files = (fileList) => {
    const validFiles = Array.from(fileList || []).filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));

    if (orderLocked) {
      setStatus('Ξεκλείδωσε πρώτα τη σειρά αν θέλεις να προσθέσεις ή να αλλάξεις αρχεία.');
      return;
    }

    if (validFiles.length === 0) {
      setStatus('Ρίξε μόνο αρχεία εικόνας/βίντεο.');
      return;
    }

    const nextItems = create_media_items(validFiles);
    setMediaItems((previous) => [...previous, ...nextItems]);
    setStatus(`Προστέθηκαν ${validFiles.length} αρχεία.`);
  };

  const reorder_items = (fromIndex, toIndex) => {
    const validMove = fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex;

    if (!validMove) {
      return;
    }

    setMediaItems((previous) => {
      const copy = [...previous];
      const [picked] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, picked);
      return copy;
    });
  };

  const handle_tile_drop = (targetId) => {
    const fromIndex = mediaItems.findIndex((item) => item.id === draggedId);
    const toIndex = mediaItems.findIndex((item) => item.id === targetId);
    const canMove = Boolean(draggedId) && orderLocked === false;

    if (canMove) {
      reorder_items(fromIndex, toIndex);
      setDraggedId('');
    }
  };

  const remove_media = (id) => {
    if (orderLocked) {
      return;
    }

    setMediaItems((previous) => {
      const found = previous.find((item) => item.id === id);

      if (found) {
        URL.revokeObjectURL(found.previewUrl);
      }

      return previous.filter((item) => item.id !== id);
    });
  };

  const clear_media = () => {
    if (orderLocked) {
      return;
    }

    mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaItems([]);
    setStatus('Η λίστα αρχείων καθαρίστηκε.');
  };

  const handle_sign_in = async (event) => {
    event.preventDefault();

    if (!client) {
      return;
    }

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
  };

  const handle_sign_out = async () => {
    if (!client) {
      return;
    }

    await client.auth.signOut();
    setStatus('Έγινε αποσύνδεση.');
  };

  const handle_upload = async (event) => {
    event.preventDefault();

    if (!client || !session) {
      return;
    }

    if (mediaItems.length === 0) {
      setStatus('Βήμα 1: Ρίξε πρώτα τουλάχιστον 1 αρχείο πολυμέσου.');
      return;
    }

    if (!orderLocked) {
      setStatus('Βήμα 2: Κλείδωσε την τελική σειρά αναρτήσεων πριν το ανέβασμα.');
      return;
    }

    const captions = parse_captions_text(captionsText);
    const bucket = resolve_storage_bucket();

    setBusy(true);
    setStatus('Γίνεται ανέβασμα και δημιουργία αναρτήσεων...');

    for (let index = 0; index < mediaItems.length; index += 1) {
      const item = mediaItems[index];
      const file = item.file;
      const fileName = `${Date.now()}-${index}-${slug_filename(file.name)}`;
      const path = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await client.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });

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
        caption: captions[index] || `Post ${index + 1}: Η λεζάντα εκκρεμεί.`,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        username: 'gymway.official',
        like_count: 160 + index * 20,
        sort_order: index + 1
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
    await load_posts();
    setBusy(false);
  };

  const toggle_publish = async (post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    const { error } = await client.from('posts').update({ status: nextStatus }).eq('id', post.id);

    if (error) {
      setStatus(`Σφάλμα ενημέρωσης: ${error.message}`);
      return;
    }

    setStatus(`Ανάρτηση ${post.title} -> ${nextStatus === 'published' ? 'δημοσιευμένη' : 'πρόχειρη'}`);
    await load_posts();
  };

  const delete_post_permanently = async (post) => {
    if (!client) {
      return;
    }

    const confirmed = window.confirm(`Να διαγραφεί οριστικά το "${post.title}"; Αυτή η ενέργεια δεν αναιρείται.`);

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setStatus(`Διαγραφή ${post.title}...`);

    const bucket = resolve_storage_bucket();

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
    await load_posts();
    setBusy(false);
  };

  const delete_all_posts_permanently = async () => {
    const canDelete = Boolean(client) && posts.length > 0;

    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm(`Να διαγραφούν ΟΛΕΣ οι ${posts.length} αναρτήσεις οριστικά; Αυτή η ενέργεια δεν αναιρείται.`);

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setStatus('Γίνεται οριστική διαγραφή όλων των αναρτήσεων...');

    const bucket = resolve_storage_bucket();
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
    await load_posts();
    setBusy(false);
  };

  const captions = parse_captions_text(captionsText);
  const mappedCaptions = mediaItems.reduce((total, _item, index) => total + (captions[index] ? 1 : 0), 0);
  const overview = build_approval_overview(posts, review_state_key);

  if (configError) {
    return (
      <Page>
        <Hero>
          <ErrorText>{configError}</ErrorText>
        </Hero>
      </Page>
    );
  }

  if (!session) {
    return (
      <Page>
        <Hero>
          <h1>Gym Way Διαχείριση Περιεχομένου</h1>
          <p>Συνδέσου για ανέβασμα αρχείων και διαχείριση εγκρίσεων.</p>
          <Admin_Login_Form
            email={email}
            password={password}
            busy={busy}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handle_sign_in}
          />
          {status && <StateText>{status}</StateText>}
          <Grey_Link text="Μετάβαση στην προεπισκόπηση πελάτη" onClick={() => { window.location.href = '/public/index.html'; }} />
        </Hero>
      </Page>
    );
  }

  return (
    <Page>
      <Hero>
        <h1>Ανέβασμα Περιεχομένου σε 3 Βήματα</h1>
        <p>Ρίξε αρχεία, βάλε την τελική σειρά, κλείδωσέ τη και μετά κάνε επικόλληση όλων των λεζαντών.</p>

        <form onSubmit={handle_upload}>
          <h3>Βήμα 1. Σύρε και άφησε όλα τα αρχεία πολυμέσων</h3>
          <Dropzone
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              append_files(event.dataTransfer.files);
            }}
          >
            <p>Ρίξε εικόνες/βίντεο εδώ</p>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              disabled={orderLocked}
              onChange={(event) => {
                append_files(event.target.files || []);
                event.target.value = '';
              }}
            />
          </Dropzone>

          <h3>Βήμα 2. Ορισμός σειράς αναρτήσεων και κλείδωμα τελικής θέσης</h3>
          {mediaItems.length === 0 && <StateText>Δεν υπάρχουν αρχεία ακόμα.</StateText>}
          {mediaItems.length > 0 && (
            <>
              <Admin_Media_List
                items={mediaItems}
                orderLocked={orderLocked}
                onDragStart={setDraggedId}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handle_tile_drop}
                onRemove={remove_media}
              />

              <Actions>
                {!orderLocked && <Main_ text="Κλείδωμα τελικής σειράς" onClick={() => setOrderLocked(true)} />}
                {orderLocked && <Main_ text="Ξεκλείδωμα σειράς" onClick={() => setOrderLocked(false)} />}
                <Red_ text="Καθαρισμός αρχείων" onClick={clear_media} disabled={orderLocked} />
              </Actions>
            </>
          )}

          <h3>Βήμα 3. Επικόλληση όλων των λεζαντών σε ένα κείμενο</h3>
          <Textarea_
            rows={8}
            value={captionsText}
            onChange={(event) => setCaptionsText(event.target.value)}
            placeholder={'Post 1: Πρώτη λεζάντα\n\nPost 2: Δεύτερη λεζάντα\n\nPost 3: Τρίτη λεζάντα'}
          />
          <StateText>Αντιστοιχισμένες λεζάντες: {mappedCaptions}/{mediaItems.length}</StateText>

          <Actions>
            <Main_ text={busy ? 'Γίνεται ανέβασμα...' : 'Ανέβασμα + Δημοσίευση τελικής σειράς'} disabled={busy} />
            <Main_ text="Αποσύνδεση" onClick={handle_sign_out} />
            <Red_ text="Οριστική διαγραφή όλων" onClick={delete_all_posts_permanently} disabled={busy || posts.length === 0} />
            <Grey_Link text="Άνοιγμα προεπισκόπησης πελάτη" onClick={() => { window.location.href = '/public/index.html'; }} />
          </Actions>
        </form>

        {status && <StateText>{status}</StateText>}
      </Hero>

      <Overview>
        <OverviewCard>
          <h6>Χρειάζονται αλλαγές</h6>
          <p>{overview.changes}</p>
        </OverviewCard>
        <OverviewCard>
          <h6>Έτοιμα για δημοσίευση</h6>
          <p>{overview.ready}</p>
        </OverviewCard>
        <OverviewCard>
          <h6>Αναμονή ελέγχου</h6>
          <p>{overview.awaiting}</p>
        </OverviewCard>
      </Overview>

      <PostList>
        {posts.map((post) => (
          <PostRow key={post.id}>
            <h6>{post.title}</h6>
            <p>{post.caption}</p>
            <p>Σημειώσεις πελάτη: {`${post.client_notes || ''}`.trim() || 'Δεν υπάρχουν σημειώσεις ακόμα.'}</p>
            <p>{new Date(post.created_at).toLocaleString()}</p>
            <p>{approval_status_label(post.approval_status)} • {review_state_label(review_state_key(post))}</p>
            <Actions>
              <Main_ text={post.status === 'published' ? 'Απόσυρση' : 'Δημοσίευση'} onClick={() => toggle_publish(post)} />
              <Red_ text="Οριστική διαγραφή" onClick={() => delete_post_permanently(post)} disabled={busy} />
            </Actions>
          </PostRow>
        ))}
      </PostList>
    </Page>
  );
};

// Exposes the preferred theme for entrypoint providers.
// Backend integration: theme layer is static and has no backend dependency.
export const ADMIN_THEME = ThemeLight;
