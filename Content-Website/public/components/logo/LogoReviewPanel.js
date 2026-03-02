import React, { useEffect, useRef, useState } from 'react';
import { Textarea_ } from 'monica-alexandria';
import { getPreviewText } from '../../utils/previewText.js';
import {
  ReviewSection,
  ReviewBox,
  ReviewHead,
  InlineAction,
  NotesHistory,
  NoteItem,
  NoteText,
  SaveRow,
  SaveNoteButton,
  NoteCollapsed,
  DecisionRow,
  DecisionButton,
  DecisionNotice
} from '../../core/styles/App.styles.js';
import { formatHistoryDateTime } from '../../hooks/useNotesHistory.js';

const h = React.createElement;
const ACCEPTED_FEEDBACK_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function isSupportedFeedbackImage(file) {
  if (!file) return false;
  if (ACCEPTED_FEEDBACK_IMAGE_TYPES.includes(file.type)) return true;
  return /\.(jpe?g|png|webp)$/i.test(`${file.name || ''}`);
}

function LogoReviewPanel({
  logoKit,
  pending,
  supportsFeedbackImages,
  supportsFeedbackAudio,
  historyEntries,
  onAppendHistory,
  onUpdateLogoKitReview,
  copy = null
}) {
  const t = copy || getPreviewText(false);
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [decisionLocked, setDecisionLocked] = useState(logoKit?.approval_status !== 'pending');
  const [decisionNotice, setDecisionNotice] = useState('');
  const [draftAttachmentFile, setDraftAttachmentFile] = useState(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [draftAudioFile, setDraftAudioFile] = useState(null);
  const [draftAudioPreviewUrl, setDraftAudioPreviewUrl] = useState('');
  const [audioError, setAudioError] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [hideStoredAudio, setHideStoredAudio] = useState(false);
  const audioRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    setDecisionLocked(logoKit?.approval_status !== 'pending');
    setNotes('');
    setNotesOpen(true);
    setDraftAttachmentFile(null);
    setAttachmentError('');
    setDraftAudioFile(null);
    setDraftAudioPreviewUrl('');
    setAudioError('');
    setIsRecordingAudio(false);
    setHideStoredAudio(false);
    audioRecorderRef.current = null;
    audioChunksRef.current = [];
    stopAudioStream();
  }, [logoKit?.id, logoKit?.approval_status]);

  useEffect(() => {
    if (!decisionNotice) return;
    const timer = window.setTimeout(() => setDecisionNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [decisionNotice]);

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
    return new File([audioBlob], `logo-voice-note-${Date.now()}.${extension}`, {
      type: mimeType || 'audio/webm'
    });
  }

  function handleAttachmentChange(event) {
    const nextFile = event.target.files?.[0] || null;
    event.target.value = '';
    if (!nextFile) return;

    if (!isSupportedFeedbackImage(nextFile)) {
      setDraftAttachmentFile(null);
      setAttachmentError(t.selectImageError);
      return;
    }

    setDraftAttachmentFile(nextFile);
    setAttachmentError('');
  }

  function clearDraftAudio() {
    setDraftAudioFile(null);
    setDraftAudioPreviewUrl('');
    setAudioError('');
  }

  async function handleAudioRecorderToggle() {
    if (pending || !supportsFeedbackAudio) return;

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

      recorder.onstop = () => {
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

  async function handleSendDraftAudio() {
    if (!draftAudioFile) return;
    const ok = await onUpdateLogoKitReview(
      {},
      t.audioUploaded,
      { feedbackAudioFile: draftAudioFile }
    );
    if (!ok) return;
    onAppendHistory(logoKit.id, draftAudioFile.name, t.sendAudioAction);
    clearDraftAudio();
    setHideStoredAudio(true);
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
    const palette = kind === 'danger'
      ? { background: '#fef2f2', color: '#b91c1c' }
      : { background: '#ecfeff', color: '#0f766e' };
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
    return h(
      'svg',
      { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' },
      h('rect', { x: '4', y: '5', width: '16', height: '14', rx: '3', stroke: 'currentColor', strokeWidth: '1.8' }),
      h('circle', { cx: '9', cy: '10', r: '1.5', fill: 'currentColor' }),
      h('path', { d: 'M7 16l3.5-3.5 2.5 2.5L15.5 12 18 16', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' })
    );
  }

  function renderMicIcon() {
    return h(
      'svg',
      { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' },
      h('rect', { x: '9', y: '4', width: '6', height: '10', rx: '3', stroke: 'currentColor', strokeWidth: '1.8' }),
      h('path', { d: 'M6.5 11.5a5.5 5.5 0 0011 0', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' }),
      h('path', { d: 'M12 17v3', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' }),
      h('path', { d: 'M9 20h6', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' })
    );
  }

  function renderInlineFeedbackTools() {
    const hasStoredImage = Boolean(logoKit.client_feedback_image_path);
    const hasStoredAudio = Boolean(logoKit.client_feedback_audio_path) && !hideStoredAudio;

    return h(
      React.Fragment,
      null,
      supportsFeedbackImages
        ? h('input', {
            id: `logo-feedback-attachment-${logoKit.id}`,
            type: 'file',
            accept: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
            onChange: handleAttachmentChange,
            disabled: pending,
            style: { display: 'none' }
          })
        : null,
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginRight: 'auto'
          }
        },
        supportsFeedbackImages
          ? h(
              'label',
              {
                htmlFor: `logo-feedback-attachment-${logoKit.id}`,
                title: hasStoredImage || draftAttachmentFile ? t.screenshotReady : t.addScreenshot,
                style: {
                  ...getIconButtonStyle(Boolean(draftAttachmentFile || hasStoredImage)),
                  cursor: pending ? 'default' : 'pointer'
                }
              },
              renderImageIcon()
            )
          : null,
        supportsFeedbackAudio
          ? h(
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
          : null
      )
    );
  }

  async function handleSaveNotes() {
    const trimmedNotes = notes.trim();
    if (!trimmedNotes) return;
    const ok = await onUpdateLogoKitReview(
      { client_notes: trimmedNotes, approval_status: 'pending' },
      t.notesSaved
    );
    if (!ok) return;
    onAppendHistory(logoKit.id, trimmedNotes, t.noteAction);
    setNotes('');
    setNotesOpen(false);
  }

  async function handleDecision(nextStatus) {
    const trimmedNotes = notes.trim();
    const existingClientNotes = `${logoKit.client_notes || ''}`.trim();
    const payload = {
      approval_status: nextStatus,
      client_notes: trimmedNotes || existingClientNotes
    };
    const successLabel = nextStatus === 'approved' ? t.logoKitApproved : t.logoKitRejected;
    const ok = await onUpdateLogoKitReview(payload, successLabel, {
      feedbackImageFile: draftAttachmentFile
    });
    if (!ok) return;
    if (draftAttachmentFile) {
      onAppendHistory(logoKit.id, draftAttachmentFile.name, t.attachmentScreenshot);
      setDraftAttachmentFile(null);
      setAttachmentError('');
    }
    onAppendHistory(logoKit.id, trimmedNotes || t.noNote, nextStatus === 'approved' ? t.approvalAction : t.rejectionAction);
    setNotes('');
    setDecisionLocked(true);
    setDecisionNotice(nextStatus === 'approved' ? t.logoKitApprovedNotice : t.logoKitRejectedNotice);
  }

  return h(
    ReviewSection,
    null,
    h(
      ReviewBox,
      null,
      h(
        ReviewHead,
        null,
        h('span', null, t.clientNotes),
        h(
          InlineAction,
          { type: 'button', onClick: () => setShowHistory((prev) => !prev), disabled: (historyEntries || []).length === 0 },
          t.notesHistory
        )
      ),
      showHistory && (historyEntries || []).length > 0
        ? h(
            NotesHistory,
            null,
            (historyEntries || []).map((entry) =>
              h(
                NoteItem,
                { key: entry.id },
                h('small', null, `${formatHistoryDateTime(entry.createdAt)} • ${entry.action}`),
                h(NoteText, null, entry.text)
              )
            )
          )
        : null,
      notesOpen
        ? h(
            React.Fragment,
            null,
            h(Textarea_, {
              id: `logo-kit-notes-${logoKit?.id || 'new'}`,
              rows: '3',
              value: notes,
              onChange: (event) => setNotes(event.target.value),
              placeholder: t.logoNotePlaceholder
            }),
            h(
              SaveRow,
              null,
              renderInlineFeedbackTools(),
              h(
                SaveNoteButton,
                { type: 'button', onClick: handleSaveNotes, disabled: pending || !notes.trim() },
                t.save
              )
            ),
            attachmentError
              ? h('small', { style: { display: 'block', marginTop: 6, color: '#b91c1c' } }, attachmentError)
              : null,
            draftAudioPreviewUrl
              ? h('audio', {
                  controls: true,
                  src: draftAudioPreviewUrl,
                  style: { display: 'block', width: '100%', marginTop: 6, height: 32 }
                })
              : null,
            draftAudioFile
              ? h(
                  'div',
                  { style: { display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 } },
                  h(
                    'button',
                    {
                      type: 'button',
                      onClick: handleSendDraftAudio,
                      disabled: pending || isRecordingAudio,
                      style: getMiniActionStyle('confirm')
                    },
                    t.upload
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      onClick: clearDraftAudio,
                      disabled: pending || isRecordingAudio,
                      style: getMiniActionStyle('danger')
                    },
                    t.remove
                  )
                )
              : null,
            audioError
              ? h('small', { style: { display: 'block', marginTop: 6, color: '#b91c1c' } }, audioError)
              : null
          )
        : h(
            React.Fragment,
            null,
            h(
              NoteCollapsed,
              { type: 'button', onClick: () => setNotesOpen(true) },
              t.addNewNote
            )
          ),
      h(
        DecisionRow,
        null,
        !decisionLocked
          ? h(
              DecisionButton,
              { type: 'button', $type: 'approve', onClick: () => handleDecision('approved'), disabled: pending },
              t.approve
            )
          : null,
        !decisionLocked
          ? h(
              DecisionButton,
              { type: 'button', $type: 'decline', onClick: () => handleDecision('disapproved'), disabled: pending },
              t.reject
            )
          : null,
        decisionLocked
          ? h(
              DecisionButton,
              { type: 'button', onClick: () => setDecisionLocked(false), disabled: pending },
              t.changeDecision
            )
          : null
      ),
      decisionNotice ? h(DecisionNotice, null, decisionNotice) : null
    )
  );
}

export { LogoReviewPanel };
