import React, { useEffect, useRef, useState } from 'react';
import { Textarea_ } from 'https://esm.sh/monica-alexandria@4.5.15?dev&external=react,react-dom,styled-components,react-transition-group';
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
import { getPreviewText } from '../../utils/previewText.js';

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

function normalizeInstagramDisplayName(value) {
  const source = `${value || ''}`.trim();
  if (!source) return '';
  return source.replace(/-\d{3,}$/g, '');
}

function CaptionBlock({ username, caption, copy }) {
  const [expanded, setExpanded] = useState(false);
  const finalCaption = (caption || (copy?.isEnglish ? 'Caption pending...' : 'Η λεζάντα εκκρεμεί...')).trim();
  const shouldCollapse = finalCaption.length > 120;

  return React.createElement(CaptionWrap, null, React.createElement(Caption, { $expanded:

    expanded }, React.createElement("strong", null,
  username || ''), " ", finalCaption), React.createElement(CaptionToggleRow, null,


  shouldCollapse && React.createElement(InlineAction, { type:
    "button", onClick: () => setExpanded((prev) => !prev) },
  expanded ? (copy?.isEnglish ? 'See less' : 'Δείτε λιγότερα') : (copy?.isEnglish ? 'See more' : 'Δείτε περισσότερα'))
  ));




}

function LinkedInCaptionBlock({ text, copy }) {
  const [expanded, setExpanded] = useState(false);
  const finalText = `${text || (copy?.isEnglish ? 'Post copy pending...' : 'Το κείμενο του post εκκρεμεί...')}`.trim();
  const shouldCollapse = finalText.length > 160;
  const visibleText = shouldCollapse && !expanded ? `${finalText.slice(0, 160).trim()}...` : finalText;

  return React.createElement(
    'div',
    null,
    React.createElement(
      'p',
      {
        style: {
          margin: 0,
          color: '#111827',
          fontSize: '1.42rem',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap'
        }
      },
      visibleText
    ),
    shouldCollapse
      ? React.createElement(
          'button',
          {
            type: 'button',
            onClick: () => setExpanded((prev) => !prev),
            style: {
              marginTop: 6,
              padding: 0,
              border: 0,
              background: 'transparent',
              color: '#6b7280',
              font: 'inherit',
              fontSize: '1.32rem',
              fontWeight: 700,
              cursor: 'pointer'
            }
          },
          expanded ? 'less' : '... more'
        )
      : null
  );
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
  postIds = [],
  reviewOnly = false,
  copy = null
}) {
  const t = copy || getPreviewText(false);
  const fallback = previewMode === 'article' ? `${t.articleFallbackLabel} ${index + 1}` : `${t.postFallbackLabel} ${index + 1}`;
  const isLinkedIn = previewMode === 'linkedin';
  const isSocialPreview = previewMode === 'instagram' || isLinkedIn;
  const displayUsername = previewMode === 'instagram'
    ? normalizeInstagramDisplayName(clientName || post.username || '')
    : (clientName || post.username || '');
  const [notes, setNotes] = useState('');
  const [articleText, setArticleText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [articleEditorExpanded, setArticleEditorExpanded] = useState(false);
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
  const articleTextareaRef = useRef(null);

  const isInstagramStory = previewMode === 'instagram' && instagramKind === 'story';
  const isStorySectionReview = isInstagramStory && reviewOnly;
  const isInstagramCarousel = isSocialPreview && instagramKind === 'carousel';
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
    setArticleEditorExpanded(false);
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
    if (previewMode !== 'article') return;
    const textarea = articleTextareaRef.current;
    if (!textarea) return;

    const collapsedHeight = '18rem';

    if (!articleEditorExpanded) {
      textarea.style.height = collapsedHeight;
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [articleEditorExpanded, articleText, previewMode]);

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
      setAttachmentError(t.selectImageError);
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
      setAudioError(t.audioUnsupportedError);
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
          setAudioError(t.audioEmptyError);
          return;
        }

        setDraftAudioFile(buildRecordedAudioFile(audioBlob, mimeType));
      };

      recorder.onerror = () => {
        setAudioError(t.audioFailedError);
        audioRecorderRef.current = null;
        setIsRecordingAudio(false);
        stopAudioStream();
      };

      recorder.start();
      setIsRecordingAudio(true);
    } catch {
      setAudioError(t.microphoneDeniedError);
      stopAudioStream();
    }
  }

  async function handleSendDraftAttachment() {
    if (!draftAttachmentFile) return;
    const ok = await onUpdateReview(
      targetPostIds,
      {},
      t.attachmentUploaded,
      { feedbackImageFile: draftAttachmentFile }
    );
    if (!ok) return;
    onAppendHistory(post.id, draftAttachmentFile.name, t.attachment);
    setQueuedAttachmentFile(null);
    setQueuedAttachmentName('');
    setDraftAttachmentFile(null);
    setAttachmentError('');
    setRemoveStoredAttachment(false);
    setHideStoredAttachment(false);
  }

  function handleRemoveStoredAttachment() {
    setQueuedAttachmentFile(null);
    setQueuedAttachmentName('');
    setDraftAttachmentFile(null);
    setAttachmentError('');
    setRemoveStoredAttachment(true);
    setHideStoredAttachment(true);
    onUpdateReview(
      targetPostIds,
      {
        client_feedback_image_url: '',
        client_feedback_image_path: ''
      },
      t.attachmentRemoved,
      { feedbackImageRemoved: true }
    ).then((ok) => {
      if (!ok) {
        setRemoveStoredAttachment(false);
        setHideStoredAttachment(false);
        return;
      }
      onAppendHistory(post.id, getFileNameFromPath(post.client_feedback_image_path) || t.attachment, t.removeAttachmentAction);
    });
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
      t.audioRemoved,
      { feedbackAudioRemoved: true }
    ).then((ok) => {
      if (!ok) {
        setHideStoredAudio(false);
        return;
      }
      onAppendHistory(post.id, getFileNameFromPath(post.client_feedback_audio_path) || t.audioLabel, t.removeAudioAction);
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
      t.audioUploaded,
      { feedbackAudioFile: draftAudioFile }
    );
    if (!ok) return;
    onAppendHistory(post.id, draftAudioFile.name, t.sendAudioAction);
    clearDraftAudio();
    setHideStoredAudio(false);
  }

  async function handleSaveNotes() {
    if (noteMissing) return;
    const nextFeedbackFile = draftAttachmentFile || queuedAttachmentFile;
    const saveMessage = isStorySectionReview
      ? t.storyNotesSaved
      : t.notesSaved;
    const ok = await onUpdateReview(
      targetPostIds,
      {
        client_notes: trimmedNotes,
        ...(removeStoredAttachment && !nextFeedbackFile ? {
          client_feedback_image_url: '',
          client_feedback_image_path: ''
        } : {})
      },
      saveMessage,
      {
        feedbackImageFile: nextFeedbackFile,
        feedbackImageRemoved: removeStoredAttachment && !nextFeedbackFile
      }
    );
    if (!ok) return;
    onAppendHistory(post.id, trimmedNotes, t.noteAction);
    if (nextFeedbackFile) {
      onAppendHistory(post.id, nextFeedbackFile.name, t.attachment);
    }
    setNotes('');
    setNotesOpen(false);
    clearDraftAttachmentSelection();
    setQueuedAttachmentFile(null);
    setQueuedAttachmentName('');
    setRemoveStoredAttachment(false);
    setHideStoredAttachment(false);
  }

  async function handleDecision(nextStatus) {
    const articleValue = articleText.trim();
    const previousArticleText = `${post.client_notes || post.caption || ''}`.trim();
    const existingClientNotes = `${post.client_notes || ''}`.trim();
    const clientNotesValue = previewMode === 'article' ? articleValue : trimmedNotes || existingClientNotes;
    const successLabel = previewMode === 'article' ?
    nextStatus === 'approved' ? t.articleApproved : t.articleRejected :
    isStorySectionReview ?
    nextStatus === 'approved' ? t.storiesApproved : t.storiesRejected :
    nextStatus === 'approved' ? t.postApproved : t.postRejected;

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
      onAppendHistory(post.id, nextFeedbackFile.name, t.attachment);
    }
    const articleDecisionHistoryValue = articleValue !== previousArticleText
      ? { beforeText: previousArticleText, afterText: articleValue }
      : t.noTextChange;
    onAppendHistory(
      post.id,
      previewMode === 'article' ? articleDecisionHistoryValue : trimmedNotes || t.noNote,
      nextStatus === 'approved' ? t.approvalAction : t.rejectionAction
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
      nextStatus === 'approved' ? t.articleApprovedNotice : t.articleRejectedNotice :
      isStorySectionReview ?
      nextStatus === 'approved' ? t.storiesApprovedNotice : t.storiesRejectedNotice :
      nextStatus === 'approved' ? t.postApprovedNotice : t.postRejectedNotice
    );
  }

  async function handleArticleSave() {
    const nextText = articleText.trim();
    if (!nextText) return;
    const previousText = `${post.client_notes || post.caption || ''}`.trim();
    const ok = await onUpdateReview(
      post.id,
      { client_notes: nextText, approval_status: 'pending' },
      t.articleChangesSaved
    );
    if (!ok) return;
    onAppendHistory(post.id, { beforeText: previousText, afterText: nextText }, t.articleChangeAction);
  }

  function getCompactCardStyle() {
    return {
      marginTop: 8,
      padding: '6px 0 0',
      borderTop: '1px solid rgba(15, 23, 42, 0.08)',
      borderRadius: 0,
      background: 'transparent'
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
            title: hasStoredImage || draftAttachmentFile ? t.screenshotReady : t.addScreenshot,
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
            title: isRecordingAudio ? t.stopRecording : draftAudioFile ? t.newRecording : hasStoredAudio ? t.newAudioRecording : t.startRecording,
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
    const currentAttachmentLabel = draftAttachmentFile ? draftAttachmentFile.name : hasStoredAttachment ? t.storedAttachmentLabel : '';
    const shouldRenderAttachmentControls = Boolean(currentAttachmentLabel || currentAttachmentUrl || attachmentError);

    if (!shouldRenderAttachmentControls) {
      return null;
    }

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
          currentAttachmentLabel || t.screenshotLabel
        ),
        React.createElement(
          'label',
          {
            htmlFor: `feedback-attachment-${post.id}`,
            title: t.addImage,
            style: {
              ...getIconButtonStyle(Boolean(draftAttachmentFile)),
              cursor: pending ? 'default' : 'pointer'
            }
          },
          renderImageIcon()
        )
      ),
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
                  onClick: handleSendDraftAttachment,
                  disabled: pending,
                  style: getMiniActionStyle('confirm')
                },
                t.upload
              ),
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: clearDraftAttachmentSelection,
                  disabled: pending,
                  style: getMiniActionStyle('danger')
                },
                t.remove
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
                t.remove
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
          alt: t.previewAttachmentAlt,
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
      getFileNameFromPath(post.client_feedback_audio_path) || t.storedAudioLabel :
      '';
    const shouldRenderAudioControls = Boolean(currentAudioLabel || draftAudioPreviewUrl || audioError);

    if (!shouldRenderAudioControls) {
      return null;
    }

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
          isRecordingAudio ? t.recordingInProgress : draftAudioFile ? t.audioReadyLabel : currentAudioLabel || t.audioLabel
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: handleAudioRecorderToggle,
            disabled: pending,
            title: isRecordingAudio ? t.stopRecording : t.startRecording,
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
                t.upload
              ),
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: clearDraftAudio,
                  disabled: pending || isRecordingAudio,
                  style: getMiniActionStyle('danger')
                },
                t.remove
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
              t.remove
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

  function renderInstagramReviewSection() {
    return React.createElement(ReviewSection, null, React.createElement(ReviewBox, null, React.createElement(ReviewHead, null, React.createElement("span", null, t.clientNotes), React.createElement(InlineAction, { type:




      "button", onClick: () => setShowHistory((prev) => !prev), disabled: (historyEntries || []).length === 0 }, t.notesHistory)),



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
      isStorySectionReview ? t.storyNotePlaceholder : t.notePlaceholder }), React.createElement(SaveRow, null, renderInlineFeedbackTools(), React.createElement(SaveNoteButton, { type:


      "button", onClick: handleSaveNotes, disabled: pending || noteMissing }, t.save)), renderFeedbackAttachmentControls(), renderFeedbackAudioControls()) : React.createElement(React.Fragment, null, React.createElement(NoteCollapsed, { type:





      "button", onClick: () => setNotesOpen(true) }, t.addNewNote)), React.createElement(DecisionRow, null,





    !decisionLocked && React.createElement(DecisionButton, { type:
      "button", $type: "approve", onClick: () => handleDecision('approved'), disabled: pending }, t.approve),



    !decisionLocked && React.createElement(DecisionButton, { type:
      "button", $type: "decline", onClick: () => handleDecision('disapproved'), disabled: pending }, t.reject),



    decisionLocked && React.createElement(DecisionButton, { type:
      "button", onClick: () => setDecisionLocked(false), disabled: pending }, t.changeDecision)),




    decisionNotice && React.createElement(DecisionNotice, null, decisionNotice)));
  }

  if (previewMode === 'article') {
    return React.createElement(BlogPost, { $loading:
      pending, $delay: `${Math.min(index * 45, 550)}ms` }, React.createElement(BlogContent, null, React.createElement(BlogTopRow, null,


    post.image_url && React.createElement(BlogThumb, null, React.createElement("img", { src:

      post.image_url, alt: stripPostTypePrefix(post.title) || fallback, loading: "lazy" })),
    React.createElement(BlogTopMeta, null, React.createElement(BlogMeta, null,



    formatHistoryDateTime(post.created_at), post.username ? ` • ${post.username}` : ''), React.createElement(BlogTitle, null,

    stripPostTypePrefix(post.title) || fallback))), React.createElement(ReviewSection, null, React.createElement(ArticleEditWrap, null, React.createElement(ReviewHead, null, React.createElement("span", null, t.articleEditTitle), React.createElement(InlineAction, { type:







      "button", onClick: () => setShowHistory((prev) => !prev), disabled: (historyEntries || []).length === 0 }, t.articleHistory)),



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
    React.createElement(ArticleEditTextarea, { ref:


      articleTextareaRef, $expanded:


      articleEditorExpanded, rows:


      "16", value:
      articleText, onChange:
      (event) => setArticleText(event.target.value), onClick:
      () => setArticleEditorExpanded(true), onBlur:
      () => setArticleEditorExpanded(false), placeholder:
      t.articlePlaceholder }), React.createElement(SaveRow, null, renderInlineFeedbackTools(), React.createElement(SaveNoteButton, { type:


      "button", onClick: handleArticleSave, disabled: pending || articleText.trim().length === 0 }, t.saveArticleChange)), renderFeedbackAttachmentControls(), renderFeedbackAudioControls(), React.createElement(DecisionRow, null,




    !decisionLocked && React.createElement(DecisionButton, { type:
      "button", $type: "approve", onClick: () => handleDecision('approved'), disabled: pending }, t.approve),



    !decisionLocked && React.createElement(DecisionButton, { type:
      "button", $type: "decline", onClick: () => handleDecision('disapproved'), disabled: pending }, t.reject),



    decisionLocked && React.createElement(DecisionButton, { type:
      "button", onClick: () => setDecisionLocked(false), disabled: pending }, t.changeDecision)

    ),


    decisionNotice && React.createElement(DecisionNotice, null, decisionNotice)))),



    pending && React.createElement(LoadingOverlay, null, React.createElement(LoadingBadge, null, t.saving))


    );



  }

  if (reviewOnly && isSocialPreview) {
    return React.createElement(React.Fragment, null, renderInstagramReviewSection(),



    pending && React.createElement(LoadingOverlay, null, React.createElement(LoadingBadge, null, t.saving))


    );
  }

  if (isLinkedIn) {
    const linkedInShellStyle = {
      position: 'relative',
      borderRadius: '1.35rem',
      border: '1px solid rgba(15, 23, 42, 0.12)',
      background: '#ffffff',
      color: '#111827',
      overflow: 'hidden',
      boxShadow: '0 18px 38px rgba(15, 23, 42, 0.08)'
    };

    const linkedInHeaderStyle = {
      display: 'grid',
      gridTemplateColumns: '56px minmax(0, 1fr) auto',
      gap: '0.95rem',
      alignItems: 'start',
      padding: '1.35rem 1.35rem 0.95rem'
    };

    const linkedInLogoStyle = {
      width: 56,
      height: 56,
      borderRadius: 12,
      background: '#111111',
      color: '#ffffff',
      display: 'grid',
      placeItems: 'center',
      fontSize: '2rem',
      fontWeight: 800,
      lineHeight: 1
    };

    const linkedInMenuRowStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
      color: '#4b5563',
      fontSize: '2rem',
      lineHeight: 1
    };

    const linkedInMediaStyle = {
      position: 'relative',
      marginTop: '1rem',
      background: '#e5e7eb',
      borderTop: '1px solid rgba(15, 23, 42, 0.08)',
      borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
    };

    const linkedInActionRowStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '0.25rem',
      padding: '0.55rem 0.75rem 0.8rem'
    };

    const linkedInActionButtonStyle = {
      border: 0,
      background: 'transparent',
      color: '#4b5563',
      font: 'inherit',
      fontSize: '1.26rem',
      fontWeight: 700,
      padding: '0.7rem 0.35rem',
      borderRadius: 10
    };

    return React.createElement(
      'div',
      { style: linkedInShellStyle },
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'div',
          { style: linkedInHeaderStyle },
          React.createElement(
            'div',
            { style: linkedInLogoStyle, ['aria-hidden']: 'true' },
            React.createElement('span', null, (clientName || post.username || 'in').slice(0, 2).toLowerCase()),
            React.createElement('span', { style: { color: '#84cc16' } }, '.')
          ),
          React.createElement(
            'div',
            { style: { minWidth: 0 } },
            React.createElement(
              'strong',
              {
                style: {
                  display: 'block',
                  fontSize: '1.62rem',
                  lineHeight: 1.2,
                  color: '#111827'
                }
              },
              clientName || post.username || 'LinkedIn Preview'
            ),
            React.createElement(
              'div',
              {
                style: {
                  marginTop: 4,
                  color: '#6b7280',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }
              },
              React.createElement('span', null, '3d'),
              React.createElement('span', null, '•'),
              React.createElement('span', null, 'Public')
            )
          ),
          React.createElement(
            'div',
            { style: linkedInMenuRowStyle, ['aria-hidden']: 'true' },
            React.createElement('span', null, '•••'),
            React.createElement('span', null, '×')
          )
        ),
        React.createElement(
          'div',
          { style: { padding: '0 1.35rem' } },
          React.createElement(LinkedInCaptionBlock, { text: post.caption, copy: t })
        ),
        React.createElement(
          'div',
          { style: linkedInMediaStyle },
          activeSlide.image_url && !isVideo
            ? React.createElement('img', {
                src: activeSlide.image_url,
                alt: stripPostTypePrefix(activeSlide.title) || fallback,
                loading: 'lazy',
                style: {
                  display: 'block',
                  width: '100%',
                  maxHeight: '72rem',
                  objectFit: 'cover'
                }
              })
            : activeSlide.image_url && isVideo
              ? React.createElement('video', {
                  src: activeSlide.image_url,
                  controls: true,
                  playsInline: true,
                  preload: 'metadata',
                  style: {
                    display: 'block',
                    width: '100%',
                    maxHeight: '72rem',
                    background: '#111827'
                  }
                })
              : React.createElement(
                  'div',
                  {
                    style: {
                      minHeight: '24rem',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#6b7280',
                      fontSize: '1.3rem'
                    }
                  },
                  t.noMedia
                ),
          isInstagramCarousel && activeSlides.length > 1
            ? React.createElement(
                'div',
                {
                  style: {
                    position: 'absolute',
                    inset: 'auto 0 1rem 0',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }
                },
                React.createElement(
                  'button',
                  {
                    type: 'button',
                    onClick: () => setCarouselIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length),
                    style: {
                      border: 0,
                      borderRadius: 999,
                      width: 34,
                      height: 34,
                      background: 'rgba(17, 24, 39, 0.76)',
                      color: '#ffffff',
                      fontSize: '1.6rem',
                      cursor: 'pointer'
                    }
                  },
                  '‹'
                ),
                React.createElement(
                  'button',
                  {
                    type: 'button',
                    onClick: () => setCarouselIndex((prev) => (prev + 1) % activeSlides.length),
                    style: {
                      border: 0,
                      borderRadius: 999,
                      width: 34,
                      height: 34,
                      background: 'rgba(17, 24, 39, 0.76)',
                      color: '#ffffff',
                      fontSize: '1.6rem',
                      cursor: 'pointer'
                    }
                  },
                  '›'
                )
              )
            : null
        ),
        React.createElement(
          'div',
          {
            style: {
              padding: '0.65rem 1.35rem 0',
              color: '#6b7280',
              fontSize: '1.14rem',
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
            }
          },
          t.linkedinEngagement
        ),
        React.createElement(
          'div',
          { style: linkedInActionRowStyle },
          [t.like, t.comment, t.repost, t.send].map((label) =>
            React.createElement(
              'button',
              {
                key: label,
                type: 'button',
                style: linkedInActionButtonStyle
              },
              label
            )
          )
        ),
        React.createElement('div', {
          style: {
            borderTop: '1px solid rgba(15, 23, 42, 0.08)'
          }
        }),
        renderInstagramReviewSection(),
        pending && React.createElement(LoadingOverlay, null, React.createElement(LoadingBadge, null, t.saving))
      )
    );
  }

  return React.createElement(Post, { $loading:
    pending, $delay: `${Math.min(index * 45, 550)}ms` }, React.createElement(PostHeader, null, React.createElement(Avatar, null), React.createElement("div", null, React.createElement("strong", null,




  displayUsername || '', React.createElement(OrderBadge, null,
  postOrderLabel(post, index)))), React.createElement(Menu, null, isLinkedIn ? 'in' : "...")), React.createElement(Media, { role:





    "img", ["aria-label"]: isLinkedIn ? t.linkedinPreviewAria : t.instagramPreviewAria, $ratio: isInstagramStory ? '9 / 16' : isLinkedIn ? '16 / 9' : '4 / 5' },
  activeSlide.image_url && !isVideo ? React.createElement("img", { src:
    activeSlide.image_url, alt: stripPostTypePrefix(activeSlide.title) || fallback, loading: "lazy" }) :
  activeSlide.image_url && isVideo ? React.createElement("video", { src:
    activeSlide.image_url, controls: true, playsInline: true, preload: "metadata" }) : React.createElement(React.Fragment, null, React.createElement(MediaTag, null,


  previewMode === 'article' ? t.articlePreview : isLinkedIn ? t.linkedinPreview : t.postPreview), React.createElement(MediaFilename, null,
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



  !isInstagramStory && React.createElement(LikesLine, null, previewMode === 'article' ? t.articlePreviewLine : isLinkedIn ? t.linkedinEngagement : t.instagramLikesLine),

  !isInstagramStory && React.createElement(PostBody, null, React.createElement(CaptionBlock, { username:

    displayUsername, caption: post.caption, copy: t })),


  isSocialPreview && renderInstagramReviewSection(),



  pending && React.createElement(LoadingOverlay, null, React.createElement(LoadingBadge, null, t.saving))


  );



}

export { PostCard };
