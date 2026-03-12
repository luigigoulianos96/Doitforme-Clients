import { useEffect, useState } from 'react';
import {
  fetchClientBySlug,
  fetchIdeasByClient,
  getIdeasClient,
  hasMissingIdeasTableError,
  normalizeIdeaRow,
  updateIdea
} from '../services/ideasService.js';
import { normalizeIdeaApprovalStatus } from '../utils/ideaHelpers.js';
import { deleteFile, getPublicUrl, uploadFile } from '../../services/storageService.js';
import { notifyReviewEvent } from '../../services/reviewPushService.js';

function sanitizePathSegment(value, fallback) {
  const cleaned = `${value || ''}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

function buildFeedbackAssetPath(kind, clientSlug, ideaId, fileName) {
  const clientSegment = sanitizePathSegment(clientSlug, 'default');
  const ideaSegment = sanitizePathSegment(ideaId, 'idea');
  const nameParts = `${fileName || 'attachment'}`.split('.');
  const extension = nameParts.length > 1 ? sanitizePathSegment(nameParts.pop(), 'bin') : 'bin';
  const baseName = sanitizePathSegment(nameParts.join('.'), `feedback-${kind}`);
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `ideas/feedback/${kind}/${clientSegment}/${ideaSegment}/${Date.now()}-${randomSuffix}-${baseName}.${extension}`;
}

async function removeFeedbackAsset(path) {
  if (!path) return;
  try {
    await deleteFile({ path });
  } catch {
    // Best effort cleanup only.
  }
}

function useIdeasReviewData(clientSlug) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '', message: '' });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const client = getIdeasClient();
    if (!client) {
      setStatus({ loading: false, error: 'Ρύθμισε τα Supabase keys στο /public/config.js', message: '' });
      return;
    }

    if (!clientSlug) {
      setStatus({ loading: false, error: 'Λείπει client link. Χρησιμοποίησε το ideas preview link από το portal.', message: '' });
      return;
    }

    fetchClientBySlug(client, clientSlug).then(async ({ data: clientData, error: clientError }) => {
      if (clientError) {
        setStatus({ loading: false, error: 'Το client link δεν είναι έγκυρο.', message: '' });
        return;
      }

      setSelectedClient(clientData);

      const { data, error } = await fetchIdeasByClient(client, clientData.id, { onlyPublished: true });
      if (error) {
        if (hasMissingIdeasTableError(error)) {
          setStatus({ loading: false, error: 'Η βάση δεν έχει ακόμα setup για content ideas.', message: '' });
          return;
        }
        setStatus({ loading: false, error: error.message, message: '' });
        return;
      }

      setIdeas((data || []).map(normalizeIdeaRow));
      setStatus({ loading: false, error: '', message: '' });
    });
  }, [clientSlug]);

  async function updateIdeaReview(ideaId, changes, successMessage, options = {}) {
    const client = getIdeasClient();
    const targetIdeaId = Array.isArray(ideaId) ? ideaId[0] : ideaId;
    if (!client || !targetIdeaId) return false;

    setSavingId(targetIdeaId);
    setStatus((prev) => ({ ...prev, message: '' }));

    const targetIdea = ideas.find((item) => `${item.id}` === `${targetIdeaId}`);
    const previousImagePath = targetIdea?.client_feedback_image_path || '';
    const previousAudioPath = targetIdea?.client_feedback_audio_path || '';
    let uploadedFeedbackImagePath = '';
    let uploadedFeedbackAudioPath = '';

    const payload = {
      approval_status: normalizeIdeaApprovalStatus(changes?.approval_status),
      client_notes: `${changes?.client_notes || ''}`.trim(),
      ...(options.feedbackImageRemoved ? { client_feedback_image_url: '', client_feedback_image_path: '' } : {}),
      ...(options.feedbackAudioRemoved ? { client_feedback_audio_url: '', client_feedback_audio_path: '' } : {})
    };

    if (options.feedbackImageFile) {
      try {
        uploadedFeedbackImagePath = await uploadFile({
          file: options.feedbackImageFile,
          path: buildFeedbackAssetPath('image', selectedClient?.slug || clientSlug, targetIdeaId, options.feedbackImageFile.name)
        });
        payload.client_feedback_image_path = uploadedFeedbackImagePath;
        payload.client_feedback_image_url = getPublicUrl(uploadedFeedbackImagePath);
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
          path: buildFeedbackAssetPath('audio', selectedClient?.slug || clientSlug, targetIdeaId, options.feedbackAudioFile.name)
        });
        payload.client_feedback_audio_path = uploadedFeedbackAudioPath;
        payload.client_feedback_audio_url = getPublicUrl(uploadedFeedbackAudioPath);
      } catch (error) {
        if (uploadedFeedbackImagePath) await removeFeedbackAsset(uploadedFeedbackImagePath);
        setStatus((prev) => ({ ...prev, message: `Σφάλμα upload ήχου: ${error.message}` }));
        setSavingId(null);
        return false;
      }
    }

    const { data, error } = await updateIdea(client, targetIdeaId, payload);
    if (error) {
      if (uploadedFeedbackImagePath) await removeFeedbackAsset(uploadedFeedbackImagePath);
      if (uploadedFeedbackAudioPath) await removeFeedbackAsset(uploadedFeedbackAudioPath);
      setStatus((prev) => ({ ...prev, message: `Σφάλμα ενημέρωσης: ${error.message}` }));
      setSavingId(null);
      return false;
    }

    setIdeas((prev) => prev.map((idea) => (
      idea.id === targetIdeaId
        ? normalizeIdeaRow(data || { ...idea, ...payload, id: targetIdeaId })
        : idea
    )));

    if ((uploadedFeedbackImagePath || options.feedbackImageRemoved) && previousImagePath && previousImagePath !== uploadedFeedbackImagePath) {
      await removeFeedbackAsset(previousImagePath);
    }
    if ((uploadedFeedbackAudioPath || options.feedbackAudioRemoved) && previousAudioPath && previousAudioPath !== uploadedFeedbackAudioPath) {
      await removeFeedbackAsset(previousAudioPath);
    }

    setStatus((prev) => ({ ...prev, message: successMessage }));
    setSavingId(null);

    await notifyReviewEvent({
      clientSlug: selectedClient?.slug || clientSlug,
      clientName: selectedClient?.name || '',
      contentType: 'ideas',
      approvalStatus: data?.approval_status || payload.approval_status || '',
      hasClientNotes: `${data?.client_notes || payload.client_notes || ''}`.trim().length > 0,
      hasFeedbackAttachment: Boolean(
        data?.client_feedback_image_url
        || data?.client_feedback_image_path
        || data?.client_feedback_audio_url
        || data?.client_feedback_audio_path
      ),
      targetIds: [targetIdeaId]
    });

    return true;
  }

  return {
    selectedClient,
    ideas,
    status,
    savingId,
    updateIdeaReview
  };
}

export { useIdeasReviewData };
