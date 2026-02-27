import React, { useEffect, useRef, useState } from 'react';
import { Textarea_ } from 'monica-alexandria';
import {
  Post,
  BlogPost,
  BlogTopRow,
  BlogThumb,
  BlogTopMeta,
  BlogContent,
  BlogMeta,
  BlogTitle,
  PostHeader,
  Avatar,
  Menu,
  OrderBadge,
  Media,
  MediaTag,
  MediaFilename,
  LikesLine,
  CarouselControls,
  CarouselControlButton,
  CarouselDots,
  CarouselDot,
  PostBody,
  CaptionWrap,
  Caption,
  CaptionToggleRow,
  ReviewSection,
  ReviewBox,
  ArticleEditWrap,
  ArticleEditTextarea,
  ReviewHead,
  InlineAction,
  NotesHistory,
  NoteItem,
  NoteText,
  DecisionRow,
  DecisionNotice,
  DecisionButton,
  SaveRow,
  SaveNoteButton,
  NoteCollapsed,
  LoadingOverlay,
  LoadingBadge } from
'../../core/styles/App.styles.js';
import { formatHistoryDateTime } from '../../hooks/useNotesHistory.js';
import { stripPostTypePrefix, isVideoPost, postOrderLabel } from '../../utils/appHelpers.js';

const ACCEPTED_FEEDBACK_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_FEEDBACK_AUDIO_TYPES = [
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'audio/webm'
];

function isSupportedFeedbackImage(file) {
  if (!file) return false;
  if (ACCEPTED_FEEDBACK_IMAGE_TYPES.includes(file.type)) return true;
  return /\.(jpe?g|png|webp)$/i.test(`${file.name || ''}`);
}

function isSupportedFeedbackAudio(file) {
  if (!file) return false;
  if (ACCEPTED_FEEDBACK_AUDIO_TYPES.includes(file.type)) return true;
  return /\.(m4a|mp3|wav|aac|webm)$/i.test(`${file.name || ''}`);
}

function getFileNameFromPath(value) {
  const pathValue = `${value || ''}`.trim();
  if (!pathValue) return '';
  const parts = pathValue.split('/');
  return parts[parts.length - 1] || pathValue;
}

function CaptionBlock({ username, caption }) {
  const [expanded, setExpanded] = useState(false);
  const finalCaption = (caption || 'Η λεζάντα εκκρεμεί...').trim();
  const shouldCollapse = finalCaption.length > 120;

  return React.createElement(CaptionWrap, null, React.createElement(Caption, { $expanded:

    expanded }, React.createElement("strong", null,
  username || ''), " ", finalCaption), React.createElement(CaptionToggleRow, null,


  shouldCollapse && React.createElement(InlineAction, { type:
    "button", onClick: () => setExpanded((prev) => !prev) },
  expanded ? 'Δείτε λιγότερα' : 'Δείτε περισσότερα')
  ));




}


function PostCard({
  post,
  index,
  onUpdateReview,
  pending,
  historyEntries,
  onAppendHistory,
  clientName = '',
  previewMode,
  instagramKind = 'single',
  carouselSlides = [],
  postIds = []
}) {
  const fallback = previewMode === 'article' ? `Άρθρο ${index + 1}` : `Ανάρτηση ${index + 1}`;
  const [notes, setNotes] = useState('');
  const [articleText, setArticleText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [decisionLocked, setDecisionLocked] = useState(post.approval_status !== 'pending');
  const [decisionNotice, setDecisionNotice] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [draftAttachmentFile, setDraftAttachmentFile] = useState(null);
  const [queuedAttachmentFile, setQueuedAttachmentFile] = useState(null);
  const [queuedAttachmentName, setQueuedAttachmentName] = useState('');
  const [draftAttachmentPreviewUrl, setDraftAttachmentPreviewUrl] = useState('');
  const [attachmentError, setAttachmentError] = useState('');
  const [removeStoredAttachment, setRemoveStoredAttachment] = useState(false);
  const [hideStoredAttachment, setHideStoredAttachment] = useState(false);
  const [draftAudioFile, setDraftAudioFile] = useState(null);
  const [draftAudioPreviewUrl, setDraftAudioPreviewUrl] = useState('');
  const [hideStoredAudio, setHideStoredAudio] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const audioRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const isInstagramStory = previewMode === 'instagram' && instagramKind === 'story';
  const isInstagramCarousel = previewMode === 'instagram' && instagramKind === 'carousel';
  const targetPostIds = postIds.length > 0 ? postIds : [post.id];
  const activeSlides = isInstagramCarousel ?
  carouselSlides.length > 0 ? carouselSlides : [post] :
  [post];
  const activeSlide = activeSlides[carouselIndex] || activeSlides[0] || post;
  const isVideo = isVideoPost(activeSlide);

  const trimmedNotes = notes.trim();
  const noteMissing = trimmedNotes.length === 0;

  useEffect(() => {
    setDecisionLocked(post.approval_status !== 'pending');
  }, [post.approval_status]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [post.id]);

  useEffect(() => {
    setDraftAttachmentFile(null);
    setQueuedAttachmentFile(null);
    setQueuedAttachmentName('');
    setDraftAttachmentPreviewUrl('');
    setAttachmentError('');
    setRemoveStoredAttachment(false);
    setHideStoredAttachment(false);
    setDraftAudioFile(null);
    setDraftAudioPreviewUrl('');
    setHideStoredAudio(false);
    setAudioError('');
    setIsRecordingAudio(false);
    audioRecorderRef.current = null;
    audioChunksRef.current = [];
    stopAudioStream();
  }, [post.id]);

  useEffect(() => {
    if (!decisionNotice) return;
    const timer = window.setTimeout(() => setDecisionNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [decisionNotice]);

  useEffect(() => {
    if (!draftAttachmentFile) {
      setDraftAttachmentPreviewUrl('');
      return undefined;
    }

    const objectUrl = window.URL.createObjectURL(draftAttachmentFile);
    setDraftAttachmentPreviewUrl(objectUrl);
    return () => window.URL.revokeObjectURL(objectUrl);
  }, [draftAttachmentFile]);

  useEffect(() => {
    const nextText = `${post.client_notes || post.caption || ''}`.trim();
    setArticleText(nextText);
  }, [post.client_notes, post.caption]);

  useEffect(() => {
    if (!draftAudioFile) {
      setDraftAudioPreviewUrl('');
      return undefined;
    }

    const objectUrl = window.URL.createObjectURL(draftAudioFile);
    setDraftAudioPreviewUrl(objectUrl);
    return () => window.URL.revokeObjectURL(objectUrl);
  }, [draftAudioFile]);

  useEffect(() => {
    return () => {
      audioRecorderRef.current = null;
      audioChunksRef.current = [];
      stopAudioStream();
    };
  }, []);

  function handleAttachmentChange(event) {
    const nextFile = event.target.files?.[0] || null;
    event.target.value = '';

    if (!nextFile) {
      return;
    }

    if (!isSupportedFeedbackImage(nextFile)) {
      setDraftAttachmentFile(null);
      setAttachmentError('Επέλεξε εικόνα JPG, JPEG, PNG ή WEBP.');
      return;
    }

    setAttachmentError('');
    setDraftAttachmentFile(nextFile);
    setQueuedAttachmentFile(null);
    setQueuedAttachmentName('');
    setRemoveStoredAttachment(false);
    setHideStoredAttachment(false);
  }

  function clearDraftAttachmentSelection() {
    setDraftAttachmentFile(null);
    setAttachmentError('');
  }

  function stopAudioStream() {
    if (!audioStreamRef.current) return;
    audioStreamRef.current.getTracks().forEach((track) => track.stop());
    audioStreamRef.current = null;
  }

  function getAudioExtension(fileType) {
    const normalizedType = `${fileType || ''}`.toLowerCase();
    if (normalizedType.includes('mp4') || normalizedType.includes('m4a')) return 'm4a';
    if (normalizedType.includes('mpeg') || normalizedType.includes('mp3')) return 'mp3';
    if (normalizedType.includes('wav')) return 'wav';
    if (normalizedType.includes('aac')) return 'aac';
    return 'webm';
  }

  function buildRecordedAudioFile(audioBlob, mimeType) {
    const extension = getAudioExtension(mimeType);
    return new File([audioBlob], `voice-note-${Date.now()}.${extension}`, {
      type: mimeType || 'audio/webm'
    });
  }

  async function handleAudioRecorderToggle() {
    if (pending) return;

    const activeRecorder = audioRecorderRef.current;
    if (activeRecorder && activeRecorder.state === 'recording') {
      activeRecorder.stop();
      return;
    }

    const mediaDevices = window.navigator && window.navigator.mediaDevices;
    if (!window.MediaRecorder || !mediaDevices || !mediaDevices.getUserMedia) {
      setAudioError('Η εγγραφή ήχου δεν υποστηρίζεται σε αυτόν τον browser.');
      return;
    }

    try {
      setAudioError('');
      const stream = await mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new window.MediaRecorder(stream);
      audioRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const firstChunk = audioChunksRef.current[0];
        const mimeType = recorder.mimeType || (firstChunk && firstChunk.type) || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        audioRecorderRef.current = null;
        setIsRecordingAudio(false);
        stopAudioStream();

        if (!audioBlob.size) {
          setAudioError('Δεν καταγράφηκε ήχος.');
          return;
        }

        setDraftAudioFile(buildRecordedAudioFile(audioBlob, mimeType));
      };

      recorder.onerror = () => {
        setAudioError('Η εγγραφή ήχου απέτυχε.');
        audioRecorderRef.current = null;
        setIsRecordingAudio(false);
        stopAudioStream();
      };

      recorder.start();
      setIsRecordingAudio(true);
    } catch {
      setAudioError('Δεν δόθηκε πρόσβαση στο μικρόφωνο.');
      stopAudioStream();
    }
  }

  function handleQueueAttachment() {
    if (!draftAttachmentFile) return;
    setQueuedAttachmentFile(draftAttachmentFile);
    setQueuedAttachmentName(draftAttachmentFile.name);
    setDraftAttachmentFile(null);
    setAttachmentError('');
    setHideStoredAttachment(true);
    onAppendHistory(post.id, draftAttachmentFile.name, 'Συνημμένο');
  }

  function handleRemoveStoredAttachment() {
    setQueuedAttachmentFile(null);
    setQueuedAttachmentName('');
    setDraftAttachmentFile(null);
    setAttachmentError('');
    setRemoveStoredAttachment(true);
    setHideStoredAttachment(true);
    onAppendHistory(post.id, getFileNameFromPath(post.client_feedback_image_path) || 'Συνημμένο', 'Αφαίρεση συνημμένου');
  }

  function handleRemoveStoredAudio() {
    setAudioError('');
    setDraftAudioFile(null);
    setDraftAudioPreviewUrl('');
    setHideStoredAudio(true);
    onUpdateReview(
      targetPostIds,
      {
        client_feedback_audio_url: '',
        client_feedback_audio_path: ''
      },
      'Το ηχητικό αφαιρέθηκε.',
      { feedbackAudioRemoved: true }
    ).then((ok) => {
      if (!ok) {
        setHideStoredAudio(false);
        return;
      }
      onAppendHistory(post.id, getFileNameFromPath(post.client_feedback_audio_path) || 'Ηχητικό', 'Αφαίρεση ηχητικού');
    });
  }

  function clearDraftAudio() {
    setDraftAudioFile(null);
    setDraftAudioPreviewUrl('');
    setAudioError('');
  }

  async function handleSendDraftAudio() {
    if (!draftAudioFile) return;
    const ok = await onUpdateReview(
      targetPostIds,
      {},
      'Το ηχητικό ανέβηκε.',
      { feedbackAudioFile: draftAudioFile }
    );
    if (!ok) return;
    onAppendHistory(post.id, draftAudioFile.name, 'Αποστολή ηχητικού μηνύματος');
    clearDraftAudio();
    setHideStoredAudio(true);
  }

  async function handleSaveNotes() {
    if (noteMissing) return;
    const ok = await onUpdateReview(targetPostIds, { client_notes: trimmedNotes }, 'Οι σημειώσεις αποθηκεύτηκαν.');
    if (!ok) return;
    onAppendHistory(post.id, trimmedNotes, 'Σημείωση');
    setNotes('');
    setNotesOpen(false);
  }

  async function handleDecision(nextStatus) {
    const articleValue = articleText.trim();
    const existingClientNotes = `${post.client_notes || ''}`.trim();
    const clientNotesValue = previewMode === 'article' ? articleValue : trimmedNotes || existingClientNotes;
    const successLabel = previewMode === 'article' ?
    nextStatus === 'approved' ? 'Το άρθρο εγκρίθηκε.' : 'Το άρθρο απορρίφθηκε.' :
    nextStatus === 'approved' ? 'Η ανάρτηση εγκρίθηκε.' : 'Η ανάρτηση απορρίφθηκε.';

    const nextFeedbackFile = draftAttachmentFile || queuedAttachmentFile;
    const ok = await onUpdateReview(
      targetPostIds,
      {
        approval_status: nextStatus,
        client_notes: clientNotesValue,
        ...(removeStoredAttachment && !nextFeedbackFile ? {
          client_feedback_image_url: '',
          client_feedback_image_path: ''
        } : {})
      },
      successLabel,
      {
        feedbackImageFile: nextFeedbackFile,
        feedbackImageRemoved: removeStoredAttachment && !nextFeedbackFile
      }
    );
    if (!ok) return;
    if (nextFeedbackFile && !queuedAttachmentName) {
      onAppendHistory(post.id, nextFeedbackFile.name, 'Συνημμένο');
    }
    onAppendHistory(
      post.id,
      previewMode === 'article' ? articleValue || 'Χωρίς αλλαγή κειμένου.' : trimmedNotes || 'Χωρίς σημείωση.',
      nextStatus === 'approved' ? 'Έγκριση' : 'Απόρριψη'
    );
    setNotes('');
    clearDraftAttachmentSelection();
    setQueuedAttachmentFile(null);
    setQueuedAttachmentName('');
    setRemoveStoredAttachment(false);
    setHideStoredAttachment(true);
    setDecisionLocked(true);
    setDecisionNotice(
      previewMode === 'article' ?
      nextStatus === 'approved' ? 'Εγκρίνατε το άρθρο.' : 'Απορρίψατε το άρθρο.' :
      nextStatus === 'approved' ? 'Εγκρίνατε τη δημοσίευση.' : 'Απορρίψατε τη δημοσίευση.'
    );
  }

  async function handleArticleSave() {
    const nextText = articleText.trim();
    if (!nextText) return;
    const previousText = `${post.client_notes || post.caption || ''}`.trim();
    const ok = await onUpdateReview(
      post.id,
      { client_notes: nextText, approval_status: 'pending' },
      'Οι αλλαγές άρθρου αποθηκεύτηκαν και στάλθηκαν στον admin.'
    );
    if (!ok) return;
    onAppendHistory(post.id, { beforeText: previousText, afterText: nextText }, 'Αλλαγή άρθρου');
  }

  function getCompactCardStyle() {
    return {
      marginTop: 8,
      padding: '8px 10px',
      border: '1px solid rgba(15, 23, 42, 0.08)',
      borderRadius: 14,
      background: 'rgba(248, 250, 252, 0.88)'
    };
  }

  function getIconButtonStyle(active) {
    return {
      width: 36,
      height: 36,
      borderRadius: 12,
      border: 'none',
      background: active ? '#111827' : '#e2e8f0',
      color: active ? '#ffffff' : '#0f172a',
      cursor: pending ? 'default' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0
    };
  }

  function getMiniActionStyle(kind) {
    const palette = kind === 'danger' ?
      { background: '#fef2f2', color: '#b91c1c' } :
      { background: '#ecfeff', color: '#0f766e' };
    return {
      border: 'none',
      borderRadius: 999,
      padding: '4px 8px',
      background: palette.background,
      color: palette.color,
      cursor: pending ? 'default' : 'pointer',
      fontSize: 11,
      fontWeight: 700
    };
  }

  function renderImageIcon() {
    return React.createElement(
      'svg',
      { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', ['aria-hidden']: 'true' },
      React.createElement('rect', { x: '4', y: '5', width: '16', height: '14', rx: '3', stroke: 'currentColor', strokeWidth: '1.8' }),
      React.createElement('circle', { cx: '9', cy: '10', r: '1.5', fill: 'currentColor' }),
      React.createElement('path', { d: 'M7 16l3.5-3.5 2.5 2.5L15.5 12 18 16', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' })
    );
  }

  function renderMicIcon() {
    return React.createElement(
      'svg',
      { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', ['aria-hidden']: 'true' },
      React.createElement('rect', { x: '9', y: '4', width: '6', height: '10', rx: '3', stroke: 'currentColor', strokeWidth: '1.8' }),
      React.createElement('path', { d: 'M6.5 11.5a5.5 5.5 0 0011 0', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' }),
      React.createElement('path', { d: 'M12 17v3', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' }),
      React.createElement('path', { d: 'M9 20h6', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' })
    );
  }

  function renderInlineFeedbackTools() {
    const hasStoredImage = Boolean(post.client_feedback_image_path) && !removeStoredAttachment && !hideStoredAttachment;
    const hasStoredAudio = Boolean(post.client_feedback_audio_path) && !hideStoredAudio;

    return React.createElement(
      React.Fragment,
      null,
      React.createElement('input', {
        id: `feedback-attachment-${post.id}`,
        type: 'file',
        accept: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
        onChange: handleAttachmentChange,
        disabled: pending,
        style: { display: 'none' }
      }),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginRight: 'auto'
          }
        },
        React.createElement(
          'label',
          {
            htmlFor: `feedback-attachment-${post.id}`,
            title: hasStoredImage || draftAttachmentFile ? 'Screenshot έτοιμο' : 'Προσθήκη screenshot',
            style: {
              ...getIconButtonStyle(Boolean(draftAttachmentFile || hasStoredImage)),
              cursor: pending ? 'default' : 'pointer'
            }
          },
          renderImageIcon()
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: handleAudioRecorderToggle,
            disabled: pending,
            title: isRecordingAudio ? 'Σταμάτημα εγγραφής' : draftAudioFile ? 'Νέα εγγραφή' : hasStoredAudio ? 'Νέα εγγραφή ηχητικού' : 'Έναρξη εγγραφής',
            style: getIconButtonStyle(Boolean(isRecordingAudio || draftAudioFile || hasStoredAudio))
          },
          renderMicIcon()
        )
      )
    );
  }

  function renderFeedbackAttachmentControls() {
    const hasStoredAttachment = Boolean(post.client_feedback_image_path) && !removeStoredAttachment && !hideStoredAttachment;
    const currentAttachmentUrl = draftAttachmentPreviewUrl || (hasStoredAttachment ? post.client_feedback_image_url : '');
    const currentAttachmentLabel = draftAttachmentFile ? draftAttachmentFile.name : hasStoredAttachment ? 'Αποθηκευμένο attachment feedback' : '';

    return React.createElement(
      'div',
      {
        style: getCompactCardStyle()
      },
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }
        },
        React.createElement(
          'small',
          { style: { fontSize: 12, fontWeight: 600, color: '#334155' } },
          currentAttachmentLabel || 'Screenshot'
        ),
        React.createElement(
          'label',
          {
            htmlFor: `feedback-attachment-${post.id}`,
            title: 'Προσθήκη εικόνας',
            style: {
              ...getIconButtonStyle(Boolean(draftAttachmentFile)),
              cursor: pending ? 'default' : 'pointer'
            }
          },
          renderImageIcon()
        )
      ),
      React.createElement('input', {
        id: `feedback-attachment-${post.id}`,
        type: 'file',
        accept: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
        onChange: handleAttachmentChange,
        disabled: pending,
        style: { display: 'none' }
      }),
      currentAttachmentLabel ?
        React.createElement(
          'div',
          {
            style: {
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }
          },
          React.createElement(
            'small',
            {
              style: {
                color: '#64748b',
                fontSize: 11,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }
            },
            currentAttachmentLabel
          ),
          draftAttachmentFile ?
            React.createElement(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: 6 } },
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: handleQueueAttachment,
                  disabled: pending,
                  style: getMiniActionStyle('confirm')
                },
                'Αποστολή'
              ),
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: clearDraftAttachmentSelection,
                  disabled: pending,
                  style: getMiniActionStyle('danger')
                },
                'Αφαίρεση'
              )
            ) :
            hasStoredAttachment ?
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: handleRemoveStoredAttachment,
                  disabled: pending,
                  style: getMiniActionStyle('danger')
                },
                'Αφαίρεση'
              ) :
              null
        ) :
        null,
      attachmentError ?
        React.createElement(
          'small',
          {
            style: {
              display: 'block',
              marginTop: 6,
              color: '#b91c1c'
            }
          },
          attachmentError
        ) :
        null,
      currentAttachmentUrl ?
        React.createElement('img', {
          src: currentAttachmentUrl,
          alt: 'Preview attachment feedback',
          style: {
            display: 'block',
            marginTop: 8,
            width: '100%',
            maxHeight: 120,
            objectFit: 'cover',
            borderRadius: 10,
            border: '1px solid rgba(15, 23, 42, 0.08)'
          }
        }) :
        null
    );
  }

  function renderFeedbackAudioControls() {
    const hasStoredAudio = Boolean(post.client_feedback_audio_path) && !hideStoredAudio;
    const currentAudioLabel = draftAudioFile ?
      draftAudioFile.name :
      hasStoredAudio ?
      getFileNameFromPath(post.client_feedback_audio_path) || 'Αποθηκευμένο ηχητικό feedback' :
      '';

    return React.createElement(
      'div',
      {
        style: getCompactCardStyle()
      },
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }
        },
        React.createElement(
          'small',
          {
            style: {
              fontSize: 12,
              fontWeight: 600,
              color: '#334155'
            }
          },
          isRecordingAudio ? 'Γίνεται εγγραφή...' : draftAudioFile ? 'Έτοιμο ηχητικό' : currentAudioLabel || 'Ηχητικό'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: handleAudioRecorderToggle,
            disabled: pending,
            title: isRecordingAudio ? 'Σταμάτημα εγγραφής' : 'Έναρξη εγγραφής',
            style: getIconButtonStyle(isRecordingAudio)
          },
          renderMicIcon()
        )
      ),
      draftAudioPreviewUrl ?
        React.createElement('audio', {
          controls: true,
          src: draftAudioPreviewUrl,
          style: {
            display: 'block',
            width: '100%',
            marginTop: 8,
            height: 32
          }
        }) :
        null,
      currentAudioLabel ?
        React.createElement(
          'div',
          {
            style: {
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }
          },
          React.createElement(
            'small',
            {
              style: {
                color: '#64748b',
                fontSize: 11,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }
            },
            currentAudioLabel
          ),
          draftAudioFile ?
            React.createElement(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: 6 } },
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: handleSendDraftAudio,
                  disabled: pending || isRecordingAudio,
                  style: getMiniActionStyle('confirm')
                },
                'Αποστολή'
              ),
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: clearDraftAudio,
                  disabled: pending || isRecordingAudio,
                  style: getMiniActionStyle('danger')
                },
                'Αφαίρεση'
              )
            ) :
            hasStoredAudio ?
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: handleRemoveStoredAudio,
                disabled: pending || isRecordingAudio,
                style: getMiniActionStyle('danger')
              },
              'Αφαίρεση'
            ) :
            null
        ) :
        null,
      audioError ?
        React.createElement(
          'small',
          {
            style: {
              display: 'block',
              marginTop: 6,
              color: '#b91c1c'
            }
          },
          audioError
        ) :
        null
    );
  }

  if (previewMode === 'article') {
    return React.createElement(BlogPost, { $loading:
      pending, $delay: `${Math.min(index * 45, 550)}ms` }, React.createElement(BlogContent, null, React.createElement(BlogTopRow, null,


    post.image_url && React.createElement(BlogThumb, null, React.createElement("img", { src:

      post.image_url, alt: stripPostTypePrefix(post.title) || fallback, loading: "lazy" })),
    React.createElement(BlogTopMeta, null, React.createElement(BlogMeta, null,



    formatHistoryDateTime(post.created_at), post.username ? ` • ${post.username}` : ''), React.createElement(BlogTitle, null,

    stripPostTypePrefix(post.title) || fallback))), React.createElement(ReviewSection, null, React.createElement(ArticleEditWrap, null, React.createElement(ReviewHead, null, React.createElement("span", null, "Επεξεργασία άρθρου πελάτη"), React.createElement(InlineAction, { type:







      "button", onClick: () => setShowHistory((prev) => !prev), disabled: (historyEntries || []).length === 0 }, "Ιστορικό αλλαγών")),



    showHistory && (historyEntries || []).length > 0 && React.createElement(NotesHistory, null,

    (historyEntries || []).map((entry) => React.createElement(NoteItem, { key:
      entry.id }, React.createElement("small", null,
    formatHistoryDateTime(entry.createdAt), " • ", entry.action),
    (entry.changes || []).length > 0 ?
    (entry.changes || []).map((change, changeIndex) => React.createElement(NoteText, { key:
      `${entry.id}-${change.type}-${changeIndex}` },
    change.type === 'added' ? 'Added: ' : 'Removed: ',
    change.paragraph)

    ) : React.createElement(NoteText, null,

    entry.text))


    )),
    React.createElement(ArticleEditTextarea, { rows:


      "16", value:
      articleText, onChange:
      (event) => setArticleText(event.target.value), placeholder:
      "Επεξεργάσου το άρθρο και αποθήκευσε..." }), React.createElement(SaveRow, null, renderInlineFeedbackTools(), React.createElement(SaveNoteButton, { type:


    "button", onClick: handleArticleSave, disabled: pending || articleText.trim().length === 0 }, "⌾ Αποθήκευση αλλαγής άρθρου")), draftAudioPreviewUrl && React.createElement("audio", { controls: true, src: draftAudioPreviewUrl, style: { display: 'block', width: '100%', marginTop: 6, height: 32 } }), draftAudioFile && React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 } }, React.createElement("button", { type: "button", onClick: handleSendDraftAudio, disabled: pending || isRecordingAudio, style: getMiniActionStyle('confirm') }, "Αποστολή"), React.createElement("button", { type: "button", onClick: clearDraftAudio, disabled: pending || isRecordingAudio, style: getMiniActionStyle('danger') }, "Αφαίρεση")), React.createElement(DecisionRow, null,




    !decisionLocked && React.createElement(DecisionButton, { type:
      "button", $type: "approve", onClick: () => handleDecision('approved'), disabled: pending }, "✓ Έγκριση"),



    !decisionLocked && React.createElement(DecisionButton, { type:
      "button", $type: "decline", onClick: () => handleDecision('disapproved'), disabled: pending }, "✕ Απόρριψη"),



    decisionLocked && React.createElement(DecisionButton, { type:
      "button", onClick: () => setDecisionLocked(false), disabled: pending }, "Αλλαγή Απόφασης")

    ),


    decisionNotice && React.createElement(DecisionNotice, null, decisionNotice)))),



    pending && React.createElement(LoadingOverlay, null, React.createElement(LoadingBadge, null, "Αποθήκευση..."))


    );



  }

  return React.createElement(Post, { $loading:
    pending, $delay: `${Math.min(index * 45, 550)}ms` }, React.createElement(PostHeader, null, React.createElement(Avatar, null), React.createElement("div", null, React.createElement("strong", null,




  clientName || post.username || '', React.createElement(OrderBadge, null,
  postOrderLabel(post, index)))), React.createElement(Menu, null, "...")), React.createElement(Media, { role:





    "img", ["aria-label"]: "Προεπισκόπηση ανάρτησης Instagram", $ratio: isInstagramStory ? '9 / 16' : '4 / 5' },
  activeSlide.image_url && !isVideo ? React.createElement("img", { src:
    activeSlide.image_url, alt: stripPostTypePrefix(activeSlide.title) || fallback, loading: "lazy" }) :
  activeSlide.image_url && isVideo ? React.createElement("video", { src:
    activeSlide.image_url, controls: true, playsInline: true, preload: "metadata" }) : React.createElement(React.Fragment, null, React.createElement(MediaTag, null,


  previewMode === 'article' ? 'ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΡΘΡΟΥ' : 'ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΝΑΡΤΗΣΗΣ'), React.createElement(MediaFilename, null,
  stripPostTypePrefix(activeSlide.title) || fallback)),


  isInstagramCarousel && activeSlides.length > 1 && React.createElement(CarouselControls, null, React.createElement(CarouselControlButton, { type:


    "button", onClick:
    () => setCarouselIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length) }, "←"), React.createElement(CarouselDots, null,




  activeSlides.map((_, dotIndex) => React.createElement(CarouselDot, { key:
    `${post.id}-dot-${dotIndex}`, $active: dotIndex === carouselIndex })
  )), React.createElement(CarouselControlButton, { type:


    "button", onClick:
    () => setCarouselIndex((prev) => (prev + 1) % activeSlides.length) }, "→"))



  ),



  !isInstagramStory && React.createElement(LikesLine, null, previewMode === 'article' ? 'Article Preview' : '9,311 likes'),

  !isInstagramStory && React.createElement(PostBody, null, React.createElement(CaptionBlock, { username:

    post.username, caption: post.caption })),



  previewMode === 'instagram' && React.createElement(ReviewSection, null, React.createElement(ReviewBox, null, React.createElement(ReviewHead, null, React.createElement("span", null, "Σημειώσεις πελάτη"), React.createElement(InlineAction, { type:




    "button", onClick: () => setShowHistory((prev) => !prev), disabled: (historyEntries || []).length === 0 }, "Ιστορικό σημειώσεων")),



  showHistory && (historyEntries || []).length > 0 && React.createElement(NotesHistory, null,

  (historyEntries || []).map((entry) => React.createElement(NoteItem, { key:
    entry.id }, React.createElement("small", null,
  formatHistoryDateTime(entry.createdAt), " • ", entry.action), React.createElement(NoteText, null,
  entry.text))

  )),


  notesOpen ? React.createElement(React.Fragment, null, React.createElement(Textarea_, { id:


    `notes-${post.id}`, rows:
    "3", value:
    notes, onChange:
    (event) => setNotes(event.target.value), placeholder:
    "Γράψε σχόλιο για αυτή την ανάρτηση..." }), React.createElement(SaveRow, null, renderInlineFeedbackTools(), React.createElement(SaveNoteButton, { type:


    "button", onClick: handleSaveNotes, disabled: pending || noteMissing }, "⌾ Αποθήκευση")), draftAudioPreviewUrl && React.createElement("audio", { controls: true, src: draftAudioPreviewUrl, style: { display: 'block', width: '100%', marginTop: 6, height: 32 } }), draftAudioFile && React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 } }, React.createElement("button", { type: "button", onClick: handleSendDraftAudio, disabled: pending || isRecordingAudio, style: getMiniActionStyle('confirm') }, "Αποστολή"), React.createElement("button", { type: "button", onClick: clearDraftAudio, disabled: pending || isRecordingAudio, style: getMiniActionStyle('danger') }, "Αφαίρεση"))) : React.createElement(React.Fragment, null, React.createElement(NoteCollapsed, { type:






    "button", onClick: () => setNotesOpen(true) }, "+ Προσθήκη νέας σημείωσης")), React.createElement(DecisionRow, null,





  !decisionLocked && React.createElement(DecisionButton, { type:
    "button", $type: "approve", onClick: () => handleDecision('approved'), disabled: pending }, "✓ Έγκριση"),



  !decisionLocked && React.createElement(DecisionButton, { type:
    "button", $type: "decline", onClick: () => handleDecision('disapproved'), disabled: pending }, "✕ Απόρριψη"),



  decisionLocked && React.createElement(DecisionButton, { type:
    "button", onClick: () => setDecisionLocked(false), disabled: pending }, "Αλλαγή Απόφασης")),




  decisionNotice && React.createElement(DecisionNotice, null, decisionNotice))),



  pending && React.createElement(LoadingOverlay, null, React.createElement(LoadingBadge, null, "Αποθήκευση..."))


  );



}

export { PostCard };
