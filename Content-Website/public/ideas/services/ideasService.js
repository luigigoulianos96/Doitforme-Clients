import { createSupabaseClient } from '../../services/supabaseClient.js';
import { inferLinkPlatform, normalizeIdeaLink } from '../utils/ideaHelpers.js';

const IDEAS_SELECT = 'id,client_id,title,analysis,requirements,status,approval_status,client_notes,client_feedback_image_url,client_feedback_image_path,client_feedback_audio_url,client_feedback_audio_path,inspiration_links,sort_order,created_at,updated_at';

function getIdeasClient() {
  return createSupabaseClient();
}

async function fetchClientBySlug(client, slug) {
  return client
    .from('clients')
    .select('id,name,slug')
    .eq('slug', slug)
    .single();
}

async function fetchIdeasByClient(client, clientId, { onlyPublished = false } = {}) {
  let query = client
    .from('content_ideas')
    .select(IDEAS_SELECT)
    .eq('client_id', clientId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (onlyPublished) {
    query = query.eq('status', 'published');
  }

  return query;
}

async function createIdea(client, payload) {
  return client
    .from('content_ideas')
    .insert(payload)
    .select(IDEAS_SELECT)
    .single();
}

async function updateIdea(client, ideaId, payload) {
  return client
    .from('content_ideas')
    .update(payload)
    .eq('id', ideaId)
    .select(IDEAS_SELECT)
    .single();
}

async function updateIdeaReviewViaApi(clientSlug, ideaId, changes) {
  const response = await fetch('/api/ideas/review-update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clientSlug,
      ideaId,
      changes
    })
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    payload = null;
  }

  if (!response.ok || !payload?.ok || !payload?.data) {
    const message = payload?.error || `API request failed (${response.status})`;
    return { data: null, error: { message } };
  }

  return { data: payload.data, error: null };
}

async function deleteIdea(client, ideaId) {
  return client
    .from('content_ideas')
    .delete()
    .eq('id', ideaId);
}

function normalizeIdeaRow(row) {
  const links = Array.isArray(row?.inspiration_links)
    ? row.inspiration_links
    : [];

  return {
    ...row,
    client_feedback_image_url: `${row?.client_feedback_image_url || ''}`.trim(),
    client_feedback_image_path: `${row?.client_feedback_image_path || ''}`.trim(),
    client_feedback_audio_url: `${row?.client_feedback_audio_url || ''}`.trim(),
    client_feedback_audio_path: `${row?.client_feedback_audio_path || ''}`.trim(),
    inspiration_links: links.map((item) => ({
      url: normalizeIdeaLink(item?.url || ''),
      platform: `${item?.platform || ''}`.trim() || inferLinkPlatform(item?.url || '')
    })).filter((item) => item.url)
  };
}

function hasMissingIdeasTableError(error) {
  const message = `${error?.message || ''}`.toLowerCase();
  return message.includes('content_ideas') && message.includes('does not exist');
}

export {
  IDEAS_SELECT,
  getIdeasClient,
  fetchClientBySlug,
  fetchIdeasByClient,
  createIdea,
  updateIdea,
  updateIdeaReviewViaApi,
  deleteIdea,
  normalizeIdeaRow,
  hasMissingIdeasTableError
};
