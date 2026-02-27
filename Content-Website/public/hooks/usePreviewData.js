import { useEffect, useState } from 'react';
import { createSupabaseClient } from '../services/supabaseClient.js';
import { deleteFile, getPublicUrl, uploadFile } from '../services/storageService.js';

function sanitizePathSegment(value, fallback) {
  const cleaned = `${value || ''}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

function buildFeedbackAssetPath(kind, clientSlug, postId, fileName) {
  const clientSegment = sanitizePathSegment(clientSlug, 'default');
  const postSegment = sanitizePathSegment(postId, 'post');
  const nameParts = `${fileName || 'attachment'}`.split('.');
  const extension = nameParts.length > 1 ? sanitizePathSegment(nameParts.pop(), 'bin') : 'bin';
  const baseName = sanitizePathSegment(nameParts.join('.'), `feedback-${kind}`);
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `feedback/${kind}/${clientSegment}/${postSegment}/${Date.now()}-${randomSuffix}-${baseName}.${extension}`;
}

async function removeFeedbackAsset(path) {
  if (!path) return;
  try {
    await deleteFile({ path });
  } catch {
    // Best effort cleanup only.
  }
}

function hasMissingColumnError(error, columns) {
  const message = `${error?.message || ''}`.toLowerCase();
  return columns.some((column) => message.includes(`${column}`.toLowerCase()));
}

const POSTS_SELECT_WITH_FEEDBACK_ATTACHMENTS = 'id,title,caption,image_url,created_at,username,status,sort_order,approval_status,client_notes,client_feedback_image_url,client_feedback_image_path,client_feedback_audio_url,client_feedback_audio_path,client_id';
const POSTS_SELECT_WITH_FEEDBACK_IMAGE = 'id,title,caption,image_url,created_at,username,status,sort_order,approval_status,client_notes,client_feedback_image_url,client_feedback_image_path,client_id';
const POSTS_SELECT_WITH_FEEDBACK_AUDIO = 'id,title,caption,image_url,created_at,username,status,sort_order,approval_status,client_notes,client_feedback_audio_url,client_feedback_audio_path,client_id';
const POSTS_SELECT_BASE = 'id,title,caption,image_url,created_at,username,status,sort_order,approval_status,client_notes,client_id';
const POSTS_UPDATE_SELECT_WITH_FEEDBACK_ATTACHMENTS = 'id,approval_status,client_notes,client_feedback_image_url,client_feedback_image_path,client_feedback_audio_url,client_feedback_audio_path';
const POSTS_UPDATE_SELECT_WITH_FEEDBACK_IMAGE = 'id,approval_status,client_notes,client_feedback_image_url,client_feedback_image_path';
const POSTS_UPDATE_SELECT_WITH_FEEDBACK_AUDIO = 'id,approval_status,client_notes,client_feedback_audio_url,client_feedback_audio_path';
const POSTS_UPDATE_SELECT_BASE = 'id,approval_status,client_notes';

function queryPublishedPosts(client, clientId, selectClause) {
  return client
    .from('posts')
    .select(selectClause)
    .eq('status', 'published')
    .eq('client_id', clientId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
}

function getPostsUpdateSelect(supportsFeedbackImages, supportsFeedbackAudio) {
  if (supportsFeedbackImages && supportsFeedbackAudio) return POSTS_UPDATE_SELECT_WITH_FEEDBACK_ATTACHMENTS;
  if (supportsFeedbackImages) return POSTS_UPDATE_SELECT_WITH_FEEDBACK_IMAGE;
  if (supportsFeedbackAudio) return POSTS_UPDATE_SELECT_WITH_FEEDBACK_AUDIO;
  return POSTS_UPDATE_SELECT_BASE;
}

function usePreviewData(clientSlug, previewMode) {
  const [posts, setPosts] = useState([]);
  const [logoKit, setLogoKit] = useState(null);
  const [logoAssets, setLogoAssets] = useState([]);
  const [logoColors, setLogoColors] = useState([]);
  const [logoStorySteps, setLogoStorySteps] = useState([]);
  const [clientMeta, setClientMeta] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: '', message: '' });
  const [savingId, setSavingId] = useState(null);
  const [supportsFeedbackImages, setSupportsFeedbackImages] = useState(true);
  const [supportsFeedbackAudio, setSupportsFeedbackAudio] = useState(true);

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

        queryPublishedPosts(client, clientData.id, POSTS_SELECT_WITH_FEEDBACK_ATTACHMENTS)
          .then(async ({ data, error }) => {
            let nextSupportsFeedbackImages = true;
            let nextSupportsFeedbackAudio = true;

            if (error && hasMissingColumnError(error, ['client_feedback_audio_url', 'client_feedback_audio_path'])) {
              nextSupportsFeedbackAudio = false;
              const fallbackResult = await queryPublishedPosts(client, clientData.id, POSTS_SELECT_WITH_FEEDBACK_IMAGE);
              data = fallbackResult.data;
              error = fallbackResult.error;
            }

            if (error && hasMissingColumnError(error, ['client_feedback_image_url', 'client_feedback_image_path'])) {
              nextSupportsFeedbackImages = false;
              const fallbackSelect = nextSupportsFeedbackAudio ? POSTS_SELECT_WITH_FEEDBACK_AUDIO : POSTS_SELECT_BASE;
              const fallbackResult = await queryPublishedPosts(client, clientData.id, fallbackSelect);
              data = fallbackResult.data;
              error = fallbackResult.error;
            }

            if (!error) {
              setSupportsFeedbackImages(nextSupportsFeedbackImages);
              setSupportsFeedbackAudio(nextSupportsFeedbackAudio);
            }

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

  async function updateReview(postId, changes, successMessage, options = {}) {
    const client = createSupabaseClient();
    if (!client) return;
    const targetIds = Array.isArray(postId) ? postId : [postId];
    const savingKey = targetIds.length > 1 ? `group-${targetIds.join('-')}` : `${targetIds[0]}`;
    const targetPosts = posts.filter((post) => targetIds.includes(post.id));
    const previousImagePaths = [...new Set(targetPosts.map((post) => post.client_feedback_image_path).filter(Boolean))];
    const previousAudioPaths = [...new Set(targetPosts.map((post) => post.client_feedback_audio_path).filter(Boolean))];
    let uploadedFeedbackImagePath = '';
    let uploadedFeedbackAudioPath = '';
    let nextChanges = { ...changes };
    setSavingId(savingKey);
    setStatus((prev) => ({ ...prev, message: '' }));

    if (options.feedbackImageFile || options.feedbackAudioFile) {
      const primaryTarget = targetPosts[0];
      if (!primaryTarget) {
        setStatus((prev) => ({ ...prev, message: 'Δεν βρέθηκε το post για upload attachment.' }));
        setSavingId(null);
        return false;
      }

      if (options.feedbackImageFile && !supportsFeedbackImages) {
        setStatus((prev) => ({
          ...prev,
          message: 'Το schema δεν έχει ενημερωθεί ακόμα για image feedback attachments. Τρέξε το νέο SQL update στο Supabase.'
        }));
        setSavingId(null);
        return false;
      }

      if (options.feedbackAudioFile && !supportsFeedbackAudio) {
        setStatus((prev) => ({
          ...prev,
          message: 'Το schema δεν έχει ενημερωθεί ακόμα για audio feedback attachments. Τρέξε το νέο SQL update στο Supabase.'
        }));
        setSavingId(null);
        return false;
      }

      if (options.feedbackImageFile) {
        try {
          uploadedFeedbackImagePath = await uploadFile({
            file: options.feedbackImageFile,
            path: buildFeedbackAssetPath('image', clientSlug, primaryTarget.id, options.feedbackImageFile.name)
          });
          nextChanges = {
            ...nextChanges,
            client_feedback_image_path: uploadedFeedbackImagePath,
            client_feedback_image_url: getPublicUrl(uploadedFeedbackImagePath)
          };
        } catch (error) {
          setStatus((prev) => ({ ...prev, message: `Σφάλμα upload εικόνας: ${error.message}` }));
          setSavingId(null);
          return false;
        }
      }

      if (options.feedbackAudioFile) {
        try {
          uploadedFeedbackAudioPath = await uploadFile({
            file: options.feedbackAudioFile,
            path: buildFeedbackAssetPath('audio', clientSlug, primaryTarget.id, options.feedbackAudioFile.name)
          });
          nextChanges = {
            ...nextChanges,
            client_feedback_audio_path: uploadedFeedbackAudioPath,
            client_feedback_audio_url: getPublicUrl(uploadedFeedbackAudioPath)
          };
        } catch (error) {
          if (uploadedFeedbackImagePath) {
            await removeFeedbackAsset(uploadedFeedbackImagePath);
          }
          setStatus((prev) => ({ ...prev, message: `Σφάλμα upload ήχου: ${error.message}` }));
          setSavingId(null);
          return false;
        }
      }
    }

    const query = client
      .from('posts')
      .update(nextChanges)
      .select(getPostsUpdateSelect(supportsFeedbackImages, supportsFeedbackAudio));

    const { data, error } = targetIds.length > 1
      ? await query.in('id', targetIds)
      : await query.eq('id', targetIds[0]).single();

    if (error) {
      if (uploadedFeedbackImagePath) {
        await removeFeedbackAsset(uploadedFeedbackImagePath);
      }
      if (uploadedFeedbackAudioPath) {
        await removeFeedbackAsset(uploadedFeedbackAudioPath);
      }
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
              client_notes: rowsById[post.id].client_notes,
              client_feedback_image_url: rowsById[post.id].client_feedback_image_url || post.client_feedback_image_url || '',
              client_feedback_image_path: rowsById[post.id].client_feedback_image_path || post.client_feedback_image_path || '',
              client_feedback_audio_url: rowsById[post.id].client_feedback_audio_url || post.client_feedback_audio_url || '',
              client_feedback_audio_path: rowsById[post.id].client_feedback_audio_path || post.client_feedback_audio_path || ''
            }
          : post
      )
    );

    if (uploadedFeedbackImagePath || options.feedbackImageRemoved) {
      await Promise.all(
        previousImagePaths
          .filter((path) => path !== uploadedFeedbackImagePath)
          .map((path) => removeFeedbackAsset(path))
      );
    }

    if (uploadedFeedbackAudioPath || options.feedbackAudioRemoved) {
      await Promise.all(
        previousAudioPaths
          .filter((path) => path !== uploadedFeedbackAudioPath)
          .map((path) => removeFeedbackAsset(path))
      );
    }

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
    supportsFeedbackImages,
    supportsFeedbackAudio,
    updateReview,
    updateLogoKitReview
  };
}

export { usePreviewData };
