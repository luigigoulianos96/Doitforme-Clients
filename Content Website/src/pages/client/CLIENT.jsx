import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, Main_, Page, ThemeLight } from 'monica-alexandria';
import { create_supabase_client } from '/src/utils/supabase/supabase_client.jsx';
import { read_notes_history, write_notes_history, create_history_entry } from '/src/utils/history/notes_history.jsx';
import { Client_Post_Card } from '/src/pages/client/components/Client_Post_Card.jsx';
import { build_client_counts } from '/src/pages/client/utils/client_page_helpers.jsx';


const Hero = styled(Card)`
  padding: var(--largePads);
  display: grid;
  gap: 1.2rem;
  background: ${(p) => p.theme.background};
`;

const HeroTitle = styled.h1`
  margin: 0;
  color: ${(p) => p.theme.color};
`;

const HeroText = styled.p`
  margin: 0;
  color: ${(p) => p.theme.mid};
`;

const Stats = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
`;

const StatCard = styled.div`
  border: 0.1rem solid ${(p) => p.theme.high};
  border-radius: var(--smallRadius);
  padding: var(--normalPads);
  background: ${(p) => p.theme.low};
`;

const Feed = styled.section`
  display: grid;
  gap: 1.4rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 98rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 68rem) {
    grid-template-columns: 1fr;
  }
`;

const StateText = styled.p`
  margin: 0;
  color: ${(p) => p.theme.mid};
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${(p) => p.theme.error};
`;

// Renders client approvals page and keeps local review interactions in sync.
// Backend integration: load published posts first, then run post update requests by post id.
export const CLIENT = () => {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '', message: '' });
  const [savingId, setSavingId] = useState(null);
  const [notesHistoryByPost, setNotesHistoryByPost] = useState({});

  useEffect(() => {
    setNotesHistoryByPost(read_notes_history());
  }, []);

  useEffect(() => {
    const client = create_supabase_client();

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

  const update_review = async (postId, changes, successMessage) => {
    const client = create_supabase_client();

    if (!client) {
      return false;
    }

    setSavingId(postId);
    setStatus((previous) => ({ ...previous, message: '' }));

    const { data, error } = await client
      .from('posts')
      .update(changes)
      .eq('id', postId)
      .select('id,approval_status,client_notes')
      .single();

    if (error) {
      setStatus((previous) => ({ ...previous, message: `Σφάλμα ενημέρωσης: ${error.message}` }));
      setSavingId(null);
      return false;
    }

    setPosts((previous) => {
      return previous.map((post) => {
        const keepCurrent = post.id !== postId;
        const updatePost = {
          ...post,
          approval_status: data.approval_status,
          client_notes: data.client_notes
        };

        return keepCurrent ? post : updatePost;
      });
    });

    setStatus((previous) => ({ ...previous, message: successMessage }));
    setSavingId(null);
    return true;
  };

  const append_note_history = (postId, text, action) => {
    const entry = create_history_entry(text, action);

    setNotesHistoryByPost((previous) => {
      const next = {
        ...previous,
        [postId]: [entry, ...(previous[postId] || [])]
      };

      write_notes_history(next);
      return next;
    });
  };

  const counts = build_client_counts(posts);
  const hasNoPosts = posts.length === 0;

  return (
    <Page>
      <Hero>
        <HeroTitle>Gym Way Ροή Εγκρίσεων</HeroTitle>
        <HeroText>Αυτή η σελίδα προορίζεται για τον πελάτη και χρησιμοποιείται για σημειώσεις και εγκρίσεις αναρτήσεων.</HeroText>
        <Main_ text="Πίνακας διαχείρισης" onClick={() => { window.location.href = '/public/admin.html'; }} />

        <Stats>
          <StatCard>
            <h6>Εγκεκριμένα</h6>
            <p>{counts.approvedCount}</p>
          </StatCard>
          <StatCard>
            <h6>Απορριφθέντα</h6>
            <p>{counts.disapprovedCount}</p>
          </StatCard>
          <StatCard>
            <h6>Χρειάζονται έλεγχο</h6>
            <p>{counts.needsReviewCount}</p>
          </StatCard>
        </Stats>
      </Hero>

      {status.loading && <StateText>Φόρτωση προεπισκόπησης...</StateText>}
      {status.error && <ErrorText>Σφάλμα: {status.error}</ErrorText>}
      {status.message && <StateText>{status.message}</StateText>}

      {!status.loading && !status.error && (
        <Feed>
          {hasNoPosts && <StateText>Δεν υπάρχουν δημοσιευμένες αναρτήσεις ακόμα. Μπες στη Διαχείριση για ανέβασμα.</StateText>}
          {posts.map((post, index) => (
            <Client_Post_Card
              key={post.id}
              post={post}
              index={index}
              pending={savingId === post.id}
              onUpdateReview={update_review}
              historyEntries={notesHistoryByPost[post.id] || []}
              onAppendHistory={append_note_history}
            />
          ))}
        </Feed>
      )}
    </Page>
  );
};

// Exposes the preferred theme for entrypoint providers.
// Backend integration: theme is frontend-only and does not require backend calls.
export const CLIENT_THEME = ThemeLight;
