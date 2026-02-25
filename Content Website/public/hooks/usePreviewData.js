import { useEffect, useState } from 'react';
import { createSupabaseClient } from '../services/supabaseClient.js';

function usePreviewData(clientSlug, previewMode) {
  const [posts, setPosts] = useState([]);
  const [logoKit, setLogoKit] = useState(null);
  const [logoAssets, setLogoAssets] = useState([]);
  const [logoColors, setLogoColors] = useState([]);
  const [logoStorySteps, setLogoStorySteps] = useState([]);
  const [clientMeta, setClientMeta] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: '', message: '' });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const clientName = clientMeta?.name || 'Clients Feed';
    const modeLabel = previewMode === 'article' ? 'Άρθρα' : previewMode === 'logo' ? 'Logo Kit' : 'Instagram';
    document.title = `${clientName} - ${modeLabel} Preview`;
  }, [clientMeta, previewMode]);

  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) {
      setStatus({ loading: false, error: 'Ρύθμισε τα Supabase keys στο /public/config.js', message: '' });
      return;
    }

    if (!clientSlug) {
      setStatus({ loading: false, error: 'Λείπει client link. Χρησιμοποίησε το preview link από το portal.', message: '' });
      return;
    }

    client
      .from('clients')
      .select('id,name,slug')
      .eq('slug', clientSlug)
      .single()
      .then(({ data: clientData, error: clientError }) => {
        if (clientError) {
          setStatus({ loading: false, error: 'Το client link δεν είναι έγκυρο.', message: '' });
          return;
        }

        setClientMeta(clientData);

        if (previewMode === 'logo') {
          client
            .from('logo_kits')
            .select('id,title,status,approval_status,client_notes,version,created_at,client_id')
            .eq('client_id', clientData.id)
            .eq('status', 'published')
            .order('version', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .then(async ({ data: kitsData, error: kitsError }) => {
              if (kitsError) {
                setStatus({ loading: false, error: kitsError.message, message: '' });
                return;
              }

              const selectedKit = (kitsData || [])[0] || null;
              setLogoKit(selectedKit);
              setPosts([]);

              if (!selectedKit) {
                setLogoAssets([]);
                setLogoColors([]);
                setLogoStorySteps([]);
                setStatus({ loading: false, error: '', message: '' });
                return;
              }

              const [{ data: assetsData, error: assetsError }, { data: colorsData, error: colorsError }, { data: storyData, error: storyError }] = await Promise.all([
                client.from('logo_assets').select('id,asset_type,file_name,file_ext,file_url,file_path,sort_order').eq('logo_kit_id', selectedKit.id).order('sort_order', { ascending: true }),
                client.from('logo_colors').select('id,hex_color,sort_order').eq('logo_kit_id', selectedKit.id).order('sort_order', { ascending: true }),
                client.from('logo_story_steps').select('id,step_order,step_text').eq('logo_kit_id', selectedKit.id).order('step_order', { ascending: true })
              ]);

              if (assetsError || colorsError || storyError) {
                setStatus({
                  loading: false,
                  error: assetsError?.message || colorsError?.message || storyError?.message || 'Σφάλμα logo kit φόρτωσης',
                  message: ''
                });
                return;
              }

              setLogoAssets(assetsData || []);
              setLogoColors(colorsData || []);
              setLogoStorySteps(storyData || []);
              setStatus({ loading: false, error: '', message: '' });
            });
          return;
        }

        client
          .from('posts')
          .select('id,title,caption,image_url,created_at,username,status,sort_order,approval_status,client_notes,client_id')
          .eq('status', 'published')
          .eq('client_id', clientData.id)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) {
              setStatus({ loading: false, error: error.message, message: '' });
              return;
            }
            setLogoKit(null);
            setLogoAssets([]);
            setLogoColors([]);
            setLogoStorySteps([]);
            setPosts(data || []);
            setStatus({ loading: false, error: '', message: '' });
          });
      });
  }, [clientSlug, previewMode]);

  async function updateReview(postId, changes, successMessage) {
    const client = createSupabaseClient();
    if (!client) return;
    const targetIds = Array.isArray(postId) ? postId : [postId];
    const savingKey = targetIds.length > 1 ? `group-${targetIds.join('-')}` : `${targetIds[0]}`;
    setSavingId(savingKey);
    setStatus((prev) => ({ ...prev, message: '' }));

    const query = client
      .from('posts')
      .update(changes)
      .select('id,approval_status,client_notes');

    const { data, error } = targetIds.length > 1
      ? await query.in('id', targetIds)
      : await query.eq('id', targetIds[0]).single();

    if (error) {
      setStatus((prev) => ({ ...prev, message: `Σφάλμα ενημέρωσης: ${error.message}` }));
      setSavingId(null);
      return false;
    }

    const rows = Array.isArray(data) ? data : [data];
    const rowsById = rows.reduce((acc, row) => {
      if (row?.id) acc[row.id] = row;
      return acc;
    }, {});

    setPosts((prev) =>
      prev.map((post) =>
        rowsById[post.id]
          ? {
              ...post,
              approval_status: rowsById[post.id].approval_status,
              client_notes: rowsById[post.id].client_notes
            }
          : post
      )
    );
    setStatus((prev) => ({ ...prev, message: successMessage }));
    setSavingId(null);
    return true;
  }

  async function updateLogoKitReview(changes, successMessage) {
    const client = createSupabaseClient();
    if (!client || !logoKit?.id) return false;
    const savingKey = `logo-${logoKit.id}`;
    setSavingId(savingKey);
    setStatus((prev) => ({ ...prev, message: '' }));

    const { data, error } = await client
      .from('logo_kits')
      .update(changes)
      .eq('id', logoKit.id)
      .select('id,approval_status,client_notes')
      .single();

    if (error) {
      setStatus((prev) => ({ ...prev, message: `Σφάλμα ενημέρωσης: ${error.message}` }));
      setSavingId(null);
      return false;
    }

    setLogoKit((prev) => ({
      ...prev,
      approval_status: data.approval_status,
      client_notes: data.client_notes
    }));
    setStatus((prev) => ({ ...prev, message: successMessage }));
    setSavingId(null);
    return true;
  }

  return {
    posts,
    logoKit,
    logoAssets,
    logoColors,
    logoStorySteps,
    clientMeta,
    status,
    savingId,
    updateReview,
    updateLogoKitReview
  };
}

export { usePreviewData };
