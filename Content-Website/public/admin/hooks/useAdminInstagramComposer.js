import { useEffect, useMemo, useState } from 'react';

export default function useAdminInstagramComposer({
  contentType = 'instagram',
  contentLabel = 'Instagram',
  allowStories = true,
  allowGrid = true,
  client,
  session,
  selectedClient,
  posts,
  setBusy,
  setStatus,
  loadPosts,
  validateSelectedClientScope,
  createStorageAdapter,
  createMediaItems,
  slugFilename,
  makeTypedTitle,
  parseCaptions,
  parsePostType,
  instagramEntryMeta,
  stripPostTypePrefix,
  isVideoPost,
  isExistingFeedOrderEntry,
  isInstagramGridFile
}) {
  const [mediaItems, setMediaItems] = useState([]);
  const [carouselPosts, setCarouselPosts] = useState([]);
  const [feedOrderItems, setFeedOrderItems] = useState([]);
  const [instagramGridItems, setInstagramGridItems] = useState([]);
  const [instagramStoryItems, setInstagramStoryItems] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [draggedCarouselSlideId, setDraggedCarouselSlideId] = useState('');
  const [orderLocked, setOrderLocked] = useState(false);
  const [captionsText, setCaptionsText] = useState('');

  useEffect(() => {
    return () => {
      [
        carouselPosts.flatMap((carouselPost) => carouselPost.items),
        instagramGridItems,
        instagramStoryItems
      ].forEach((collection) => {
        collection.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      });
    };
  }, [carouselPosts, instagramGridItems, instagramStoryItems]);

  async function updatePostSortOrder(postId, sortOrder) {
    const { error } = await client
      .from('posts')
      .update({ sort_order: sortOrder })
      .eq('id', postId);

    return error;
  }

  function appendFiles(files) {
    if (orderLocked) {
      setStatus('Ξεκλείδωσε πρώτα τη σειρά αν θέλεις να προσθέσεις ή να αλλάξεις αρχεία.');
      return;
    }

    const validFiles = Array.from(files || []).filter((file) =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
      setStatus('Ρίξε μόνο αρχεία εικόνας/βίντεο.');
      return;
    }

    const nextItems = createMediaItems(validFiles);
    setMediaItems((prev) => [...prev, ...nextItems]);
    setFeedOrderItems((prev) => [
      ...prev,
      ...nextItems.map((item) => ({
        id: `single:${item.id}`,
        kind: 'single',
        refId: item.id
      }))
    ]);
    setStatus(`Προστέθηκαν ${validFiles.length} αρχεία.`);
  }

  function appendInstagramGridFiles(files) {
    const validFiles = Array.from(files || []).filter((file) => isInstagramGridFile(file));
    if (validFiles.length === 0) {
      setStatus('Η ενιαία 9άδα δέχεται μόνο 1 αρχείο .png.');
      return;
    }
    const nextItems = createMediaItems([validFiles[0]]).map((item) => ({ ...item, kind: 'image' }));
    setInstagramGridItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return nextItems;
    });
    setStatus('Φορτώθηκε το PNG για την ενιαία 9άδα.');
  }

  function clearInstagramGrid() {
    setInstagramGridItems((prev) => {
      prev.forEach((gridItem) => URL.revokeObjectURL(gridItem.previewUrl));
      return [];
    });
  }

  function appendCarouselFiles(files) {
    if (orderLocked) {
      setStatus('Ξεκλείδωσε πρώτα τη σειρά αν θέλεις να προσθέσεις ή να αλλάξεις carousel.');
      return;
    }

    const validFiles = Array.from(files || []).filter((file) =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    if (validFiles.length === 0) {
      setStatus('Το carousel δέχεται εικόνες ή βίντεο.');
      return;
    }
    const nextItems = createMediaItems(validFiles);
    const nextCarouselId = `${Date.now()}-carousel-${Math.random().toString(36).slice(2, 8)}`;
    setCarouselPosts((prev) => [
      ...prev,
      {
        id: nextCarouselId,
        items: nextItems
      }
    ]);
    setFeedOrderItems((prev) => [
      ...prev,
      {
        id: `carousel:${nextCarouselId}`,
        kind: 'carousel',
        refId: nextCarouselId
      }
    ]);
    setStatus(`Δημιουργήθηκε carousel post με ${nextItems.length} slides.`);
  }

  function removeCarouselMedia(carouselId, itemId) {
    setCarouselPosts((prev) => {
      const targetCarousel = prev.find((carouselPost) => carouselPost.id === carouselId);
      const targetItem = targetCarousel?.items.find((item) => item.id === itemId);
      if (targetItem?.previewUrl) URL.revokeObjectURL(targetItem.previewUrl);

      const next = prev
        .map((carouselPost) =>
          carouselPost.id === carouselId
            ? { ...carouselPost, items: carouselPost.items.filter((item) => item.id !== itemId) }
            : carouselPost
        )
        .filter((carouselPost) => carouselPost.items.length > 0);

      const stillExists = next.some((carouselPost) => carouselPost.id === carouselId);
      if (!stillExists) {
        setFeedOrderItems((orderPrev) => orderPrev.filter((entry) => !(entry.kind === 'carousel' && entry.refId === carouselId)));
      }

      return next;
    });
  }

  function removeCarouselPost(carouselId) {
    setCarouselPosts((prev) => {
      const targetCarousel = prev.find((carouselPost) => carouselPost.id === carouselId);
      if (targetCarousel) {
        targetCarousel.items.forEach((item) => {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
      }
      return prev.filter((carouselPost) => carouselPost.id !== carouselId);
    });
    setFeedOrderItems((prev) => prev.filter((entry) => !(entry.kind === 'carousel' && entry.refId === carouselId)));
  }

  function appendInstagramStories(files) {
    const validFiles = Array.from(files || []).filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));
    if (validFiles.length === 0) {
      setStatus('Τα stories δέχονται μόνο εικόνες ή βίντεο.');
      return;
    }
    const nextItems = createMediaItems(validFiles);
    setInstagramStoryItems((prev) => [...prev, ...nextItems]);
    setStatus(`Προστέθηκαν ${nextItems.length} stories draft.`);
  }

  function removeInstagramStoryItem(itemId) {
    setInstagramStoryItems((prev) => {
      const selected = prev.find((item) => item.id === itemId);
      if (selected?.previewUrl) URL.revokeObjectURL(selected.previewUrl);
      return prev.filter((item) => item.id !== itemId);
    });
  }

  function reorderItems(items, fromIndex, toIndex) {
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;
    const copy = [...items];
    const [picked] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, picked);
    return copy;
  }

  function handleTileDrop(targetId) {
    if (orderLocked || !draggedId) return;
    setFeedOrderItems((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === draggedId);
      const toIndex = prev.findIndex((item) => item.id === targetId);
      return reorderItems(prev, fromIndex, toIndex);
    });
    setDraggedId(null);
  }

  function removeMedia(id) {
    if (orderLocked) return;
    setMediaItems((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
    setFeedOrderItems((prev) => prev.filter((entry) => !(entry.kind === 'single' && entry.refId === id)));
  }

  function clearMedia() {
    if (orderLocked) return;
    mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaItems([]);
    setFeedOrderItems((prev) => prev.filter((entry) => entry.kind !== 'single'));
    setStatus('Η λίστα αρχείων καθαρίστηκε.');
  }

  function clearCarouselUploads() {
    if (orderLocked) return;
    carouselPosts.forEach((carouselPost) => {
      carouselPost.items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    });
    setCarouselPosts([]);
    setFeedOrderItems((prev) => prev.filter((entry) => entry.kind !== 'carousel'));
    setStatus('Τα carousel uploads καθαρίστηκαν.');
  }

  function handleCarouselSlideDrop(carouselId, targetItemId) {
    if (orderLocked || !draggedCarouselSlideId) return;
    const [sourceCarouselId, sourceItemId] = draggedCarouselSlideId.split('::');
    if (sourceCarouselId !== carouselId || !sourceItemId) return;

    setCarouselPosts((prev) =>
      prev.map((carouselPost) => {
        if (carouselPost.id !== carouselId) return carouselPost;
        const fromIndex = carouselPost.items.findIndex((item) => item.id === sourceItemId);
        const toIndex = carouselPost.items.findIndex((item) => item.id === targetItemId);
        return {
          ...carouselPost,
          items: reorderItems(carouselPost.items, fromIndex, toIndex)
        };
      })
    );
    setDraggedCarouselSlideId('');
  }

  const existingFeedPreviewItems = useMemo(() => {
    const next = [];
    const carouselEntries = new Map();

    posts
      .filter((post) => parsePostType(post) === contentType)
      .forEach((post) => {
        const meta = instagramEntryMeta(post);

        if (meta.kind === 'story' || meta.kind === 'grid') return;

        if (meta.kind === 'carousel') {
          const groupId = meta.groupId || post.id;
          let entry = carouselEntries.get(groupId);

          if (!entry) {
            entry = {
              id: `existing-carousel:${groupId}`,
              kind: 'existing-carousel',
              refId: groupId,
              label: '',
              removable: false,
              previewMedia: {
                kind: isVideoPost(post) ? 'video' : 'image',
                previewUrl: post.image_url,
                file: { name: meta.fileName || `Carousel ${groupId}` }
              },
              posts: [],
              sortOrder: Number.isFinite(post.sort_order) ? post.sort_order : 0
            };
            carouselEntries.set(groupId, entry);
            next.push(entry);
          }

          entry.posts.push(post);
          entry.sortOrder = Math.min(entry.sortOrder, Number.isFinite(post.sort_order) ? post.sort_order : entry.sortOrder);
          return;
        }

        next.push({
          id: `existing-single:${post.id}`,
          kind: 'existing-single',
          refId: post.id,
          label: meta.fileName || stripPostTypePrefix(post.title),
          removable: false,
          previewMedia: {
            kind: isVideoPost(post) ? 'video' : 'image',
            previewUrl: post.image_url,
            file: { name: meta.fileName || stripPostTypePrefix(post.title) || 'Feed post' }
          },
          posts: [post],
          sortOrder: Number.isFinite(post.sort_order) ? post.sort_order : 0
        });
      });

    next.forEach((entry) => {
      if (entry.kind !== 'existing-carousel') return;

      entry.posts.sort((a, b) => {
        const aMeta = instagramEntryMeta(a);
        const bMeta = instagramEntryMeta(b);
        return aMeta.slideOrder - bMeta.slideOrder;
      });
      entry.label = `Carousel (${entry.posts.length} slides)`;
    });

    return next;
  }, [posts, parsePostType, instagramEntryMeta, stripPostTypePrefix, isVideoPost, contentType]);

  const existingFeedOrderItems = useMemo(
    () => existingFeedPreviewItems.map((item) => ({ id: item.id, kind: item.kind, refId: item.refId })),
    [existingFeedPreviewItems]
  );

  const existingFeedPreviewMap = useMemo(
    () => new Map(existingFeedPreviewItems.map((item) => [item.id, item])),
    [existingFeedPreviewItems]
  );

  useEffect(() => {
    setFeedOrderItems((prev) => {
      const preservedDraftItems = prev.filter((item) => !isExistingFeedOrderEntry(item));
      const knownEntries = new Map([
        ...existingFeedOrderItems.map((item) => [item.id, item]),
        ...preservedDraftItems.map((item) => [item.id, item])
      ]);
      const next = [];
      const seen = new Set();

      prev.forEach((item) => {
        const resolved = knownEntries.get(item.id);
        if (!resolved || seen.has(item.id)) return;
        next.push(resolved);
        seen.add(item.id);
      });

      existingFeedOrderItems.forEach((item) => {
        if (seen.has(item.id)) return;
        next.push(item);
        seen.add(item.id);
      });

      preservedDraftItems.forEach((item) => {
        if (seen.has(item.id)) return;
        next.push(item);
        seen.add(item.id);
      });

      if (
        next.length === prev.length &&
        next.every((item, index) => item.id === prev[index]?.id && item.kind === prev[index]?.kind && item.refId === prev[index]?.refId)
      ) {
        return prev;
      }

      return next;
    });
  }, [existingFeedOrderItems, isExistingFeedOrderEntry]);

  const feedPreviewItems = useMemo(() => {
    const mediaById = new Map(mediaItems.map((item) => [item.id, item]));
    const carouselById = new Map(carouselPosts.map((carouselPost) => [carouselPost.id, carouselPost]));

    return feedOrderItems
      .map((orderItem) => {
        if (orderItem.kind === 'single') {
          const item = mediaById.get(orderItem.refId);
          if (!item) return null;
          return {
            id: orderItem.id,
            kind: 'single',
            label: item.file.name,
            removable: true,
            removeId: item.id,
            previewMedia: item
          };
        }

        if (orderItem.kind === 'carousel') {
          const carouselPost = carouselById.get(orderItem.refId);
          if (!carouselPost) return null;
          return {
            id: orderItem.id,
            kind: 'carousel',
            label: `Carousel (${carouselPost.items.length} slides)`,
            removable: true,
            removeId: carouselPost.id,
            previewMedia: carouselPost.items[0]
          };
        }

        const existingItem = existingFeedPreviewMap.get(orderItem.id);
        if (!existingItem) return null;
        return {
          ...existingItem,
          kind: existingItem.kind === 'existing-carousel' ? 'carousel' : 'single'
        };
      })
      .filter(Boolean);
  }, [feedOrderItems, mediaItems, carouselPosts, existingFeedPreviewMap]);

  const parsedCaptions = useMemo(() => parseCaptions(captionsText), [captionsText, parseCaptions]);
  const plannedFeedPostCount = feedOrderItems.filter((item) => item.kind === 'single' || item.kind === 'carousel').length;
  const carouselSlideCount = carouselPosts.reduce((sum, carouselPost) => sum + carouselPost.items.length, 0);
  const mappedCaptions = Array.from({ length: plannedFeedPostCount }).reduce((sum, _item, index) => sum + (parsedCaptions[index] ? 1 : 0), 0);
  const hasDraftSingleUploads = mediaItems.length > 0;
  const hasDraftCarouselUploads = carouselPosts.length > 0;
  const hasDraftFeedItems = feedOrderItems.some((item) => item.kind === 'single' || item.kind === 'carousel');
  const currentExistingFeedOrderIds = feedOrderItems.filter((item) => isExistingFeedOrderEntry(item)).map((item) => item.id);
  const hasExistingFeedReorder =
    currentExistingFeedOrderIds.length === existingFeedOrderItems.length &&
    currentExistingFeedOrderIds.some((id, index) => id !== existingFeedOrderItems[index]?.id);
  const requiresLockedFeedOrder = hasDraftFeedItems || hasExistingFeedReorder;

  async function handleFeedUpload() {
    if (!client || !session || !selectedClient) return;
    const clientScope = await validateSelectedClientScope();
    if (!clientScope.ok) return;

    const totalUploads = mediaItems.length + carouselSlideCount;
    const canRefreshExistingFeedOrder = existingFeedOrderItems.length > 0;
    if (totalUploads === 0 && !canRefreshExistingFeedOrder) {
      setStatus(`Ανέβασε τουλάχιστον ένα ${contentLabel} feed post ή carousel.`);
      return;
    }

    if (requiresLockedFeedOrder && !orderLocked) {
      setStatus('Κλείδωσε τη σειρά feed πριν το ανέβασμα.');
      return;
    }

    const captions = parseCaptions(captionsText);
    setBusy(true);
    setStatus('Γίνεται ανέβασμα feed αναρτήσεων...');

    const storage = createStorageAdapter();

    const dynamicUsername = (selectedClient?.slug || selectedClient?.name || '').trim();
    const mediaById = new Map(mediaItems.map((item) => [item.id, item]));
    const carouselById = new Map(carouselPosts.map((carouselPost) => [carouselPost.id, carouselPost]));
    const existingFeedById = new Map(existingFeedPreviewItems.map((item) => [item.id, item]));
    const existingInstagramPosts = posts.filter((post) => parsePostType(post) === contentType);
    const existingStoryPosts = existingInstagramPosts
      .filter((post) => instagramEntryMeta(post).kind === 'story')
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
    const existingGridPosts = existingInstagramPosts
      .filter((post) => instagramEntryMeta(post).kind === 'grid')
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
    const feedPublishItems = feedOrderItems
      .map((orderItem) => {
        if (orderItem.kind === 'single') {
          const item = mediaById.get(orderItem.refId);
          if (!item) return null;
          return { kind: 'new-single', item };
        }

        if (orderItem.kind === 'carousel') {
          const carouselPost = carouselById.get(orderItem.refId);
          if (!carouselPost) return null;
          return { kind: 'new-carousel', carouselPost };
        }

        if (orderItem.kind === 'existing-single') {
          const existingItem = existingFeedById.get(orderItem.id);
          if (!existingItem) return null;
          return { kind: 'existing-single', existingItem };
        }

        if (orderItem.kind === 'existing-carousel') {
          const existingItem = existingFeedById.get(orderItem.id);
          if (!existingItem) return null;
          return { kind: 'existing-carousel', existingItem };
        }

        return null;
      })
      .filter(Boolean);

    let sortOrderCursor = 1;
    let draftCaptionCursor = 0;
    for (let feedIndex = 0; feedIndex < feedPublishItems.length; feedIndex += 1) {
      const feedItem = feedPublishItems[feedIndex];

      if (feedItem.kind === 'existing-single') {
        const targetPost = feedItem.existingItem.posts[0];
        const updateError = await updatePostSortOrder(targetPost.id, sortOrderCursor);
        if (updateError) {
          setStatus(`Σφάλμα ανανέωσης σειράς (${feedItem.existingItem.label}): ${updateError.message}`);
          setBusy(false);
          return;
        }
        sortOrderCursor += 1;
        continue;
      }

      if (feedItem.kind === 'existing-carousel') {
        for (let slideIndex = 0; slideIndex < feedItem.existingItem.posts.length; slideIndex += 1) {
          const updateError = await updatePostSortOrder(feedItem.existingItem.posts[slideIndex].id, sortOrderCursor);
          if (updateError) {
            setStatus(`Σφάλμα ανανέωσης σειράς (${feedItem.existingItem.label}): ${updateError.message}`);
            setBusy(false);
            return;
          }
        }
        sortOrderCursor += 1;
        continue;
      }

      if (feedItem.kind === 'new-single') {
        const file = feedItem.item.file;
        const fileName = `${Date.now()}-single-${feedIndex}-${slugFilename(file.name)}`;
        const path = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await storage.upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          setStatus(`Σφάλμα upload (${file.name}): ${uploadError.message}`);
          setBusy(false);
          return;
        }

        const { data: publicData } = storage.getPublicUrl(path);
        const payload = {
          title: makeTypedTitle(contentType, `SINGLE::${file.name}`),
          image_url: publicData.publicUrl,
          image_path: path,
          caption: captions[draftCaptionCursor] || `Post ${draftCaptionCursor + 1}: Η λεζάντα εκκρεμεί.`,
          client_id: clientScope.value.id,
          status: 'published',
          approval_status: 'pending',
          client_notes: '',
          username: dynamicUsername,
          like_count: 160 + draftCaptionCursor * 20,
          sort_order: sortOrderCursor
        };
        const { error: insertError } = await client.from('posts').insert(payload);
        if (insertError) {
          setStatus(`Σφάλμα βάσης (${file.name}): ${insertError.message}`);
          setBusy(false);
          return;
        }
        draftCaptionCursor += 1;
        sortOrderCursor += 1;
        continue;
      }

      if (feedItem.kind === 'new-carousel') {
        const carouselGroupId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const carouselCaption = captions[draftCaptionCursor] || `Carousel ${draftCaptionCursor + 1}: Η λεζάντα εκκρεμεί.`;

        for (let slideIndex = 0; slideIndex < feedItem.carouselPost.items.length; slideIndex += 1) {
          const slide = feedItem.carouselPost.items[slideIndex];
          const file = slide.file;
          const fileName = `${Date.now()}-carousel-${feedIndex}-${slideIndex}-${slugFilename(file.name)}`;
          const path = `${session.user.id}/${fileName}`;

          const { error: uploadError } = await storage.upload(path, file, { cacheControl: '3600', upsert: false });

          if (uploadError) {
            setStatus(`Σφάλμα upload (${file.name}): ${uploadError.message}`);
            setBusy(false);
            return;
          }

          const { data: publicData } = storage.getPublicUrl(path);
          const payload = {
            title: makeTypedTitle(contentType, `CAROUSEL::${carouselGroupId}::${slideIndex + 1}::${file.name}`),
            image_url: publicData.publicUrl,
            image_path: path,
            caption: carouselCaption,
            client_id: clientScope.value.id,
            status: 'published',
            approval_status: 'pending',
            client_notes: '',
            username: dynamicUsername,
            like_count: 160,
            sort_order: sortOrderCursor
          };
          const { error: insertError } = await client.from('posts').insert(payload);
          if (insertError) {
            setStatus(`Σφάλμα βάσης (${file.name}): ${insertError.message}`);
            setBusy(false);
            return;
          }
        }
        draftCaptionCursor += 1;
        sortOrderCursor += 1;
      }
    }

    for (let i = 0; i < existingStoryPosts.length; i += 1) {
      const updateError = await updatePostSortOrder(existingStoryPosts[i].id, sortOrderCursor + i);
      if (updateError) {
        setStatus(`Σφάλμα ανανέωσης story σειράς (${instagramEntryMeta(existingStoryPosts[i]).fileName || 'Story'}): ${updateError.message}`);
        setBusy(false);
        return;
      }
    }
    sortOrderCursor += existingStoryPosts.length;

    for (let i = 0; i < existingGridPosts.length; i += 1) {
      const updateError = await updatePostSortOrder(existingGridPosts[i].id, sortOrderCursor + i);
      if (updateError) {
        setStatus(`Σφάλμα ανανέωσης 9άδας σειράς (${instagramEntryMeta(existingGridPosts[i]).fileName || 'Grid'}): ${updateError.message}`);
        setBusy(false);
        return;
      }
    }

    mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    carouselPosts.forEach((carouselPost) => {
      carouselPost.items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    });
    setMediaItems([]);
    setCarouselPosts([]);
    setFeedOrderItems([]);
    setOrderLocked(false);
    setCaptionsText('');
    setStatus(
      `Ολοκληρώθηκε. Ανανεώθηκε η σειρά feed και ανέβηκαν ${mediaItems.length} single, ${carouselPosts.length} carousel posts (${carouselSlideCount} slides).`
    );
    await loadPosts();
    setBusy(false);
  }

  async function handleStoriesUpload() {
    if (!allowStories && !allowGrid) return;
    if (!client || !session || !selectedClient) return;
    const clientScope = await validateSelectedClientScope();
    if (!clientScope.ok) return;

    const totalUploads = instagramStoryItems.length + instagramGridItems.length;
    if (totalUploads === 0) {
      setStatus('Ανέβασε τουλάχιστον ένα story ή ένα PNG 9άδας.');
      return;
    }

    setBusy(true);
    setStatus('Γίνεται ανέβασμα stories και 9άδας...');

    const storage = createStorageAdapter();
    const dynamicUsername = (selectedClient?.slug || selectedClient?.name || '').trim();
    const existingInstagramPosts = posts.filter((post) => parsePostType(post) === contentType);
    const existingFeedPosts = existingInstagramPosts.filter((post) => {
      const kind = instagramEntryMeta(post).kind;
      return kind !== 'story' && kind !== 'grid';
    });
    const existingStoryPosts = existingInstagramPosts
      .filter((post) => instagramEntryMeta(post).kind === 'story')
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
    const existingGridPosts = existingInstagramPosts
      .filter((post) => instagramEntryMeta(post).kind === 'grid')
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

    let sortOrderCursor = existingFeedPosts.reduce(
      (max, post) => Math.max(max, Number(post.sort_order) || 0),
      0
    ) + 1;

    for (let i = 0; i < existingStoryPosts.length; i += 1) {
      const updateError = await updatePostSortOrder(existingStoryPosts[i].id, sortOrderCursor + i);
      if (updateError) {
        setStatus(`Σφάλμα ανανέωσης story σειράς (${instagramEntryMeta(existingStoryPosts[i]).fileName || 'Story'}): ${updateError.message}`);
        setBusy(false);
        return;
      }
    }
    sortOrderCursor += existingStoryPosts.length;

    for (let i = 0; i < instagramStoryItems.length; i += 1) {
      const storyItem = instagramStoryItems[i];
      const file = storyItem.file;
      const fileName = `${Date.now()}-story-${i}-${slugFilename(file.name)}`;
      const path = `${session.user.id}/${fileName}`;
      const { error: uploadError } = await storage.upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setStatus(`Σφάλμα upload story (${file.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }

      const { data: publicData } = storage.getPublicUrl(path);
      const payload = {
        title: makeTypedTitle(contentType, `STORY::${file.name}`),
        image_url: publicData.publicUrl,
        image_path: path,
        caption: '',
        client_id: clientScope.value.id,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        username: dynamicUsername,
        like_count: 0,
        sort_order: sortOrderCursor + i
      };
      const { error: insertError } = await client.from('posts').insert(payload);
      if (insertError) {
        setStatus(`Σφάλμα βάσης story (${file.name}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }
    sortOrderCursor += instagramStoryItems.length;

    for (let i = 0; i < existingGridPosts.length; i += 1) {
      const updateError = await updatePostSortOrder(existingGridPosts[i].id, sortOrderCursor + i);
      if (updateError) {
        setStatus(`Σφάλμα ανανέωσης 9άδας σειράς (${instagramEntryMeta(existingGridPosts[i]).fileName || 'Grid'}): ${updateError.message}`);
        setBusy(false);
        return;
      }
    }
    sortOrderCursor += existingGridPosts.length;

    if (instagramGridItems.length > 0) {
      const gridItem = instagramGridItems[0];
      const file = gridItem.file;
      const fileName = `${Date.now()}-grid9-${slugFilename(file.name)}`;
      const path = `${session.user.id}/${fileName}`;
      const { error: uploadError } = await storage.upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) {
        setStatus(`Σφάλμα upload 9άδας (${file.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }
      const { data: publicData } = storage.getPublicUrl(path);
      const payload = {
        title: makeTypedTitle(contentType, `GRID9::${file.name}`),
        image_url: publicData.publicUrl,
        image_path: path,
        caption: 'Έτσι θα διαμορφωθεί το Instagram feed σας μετά τη δημοσίευση όλων των posts.',
        client_id: clientScope.value.id,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        username: dynamicUsername,
        like_count: 0,
        sort_order: sortOrderCursor
      };
      const { error: insertError } = await client.from('posts').insert(payload);
      if (insertError) {
        setStatus(`Σφάλμα βάσης 9άδας (${file.name}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }

    instagramStoryItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    instagramGridItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setInstagramStoryItems([]);
    setInstagramGridItems([]);
    setStatus(
      `Ολοκληρώθηκε. Ανέβηκαν ${instagramStoryItems.length} stories${instagramGridItems.length > 0 ? ' και 1 αρχείο 9άδας' : ''}.`
    );
    await loadPosts();
    setBusy(false);
  }

  return {
    carouselPosts,
    feedPreviewItems,
    instagramGridItems,
    instagramStoryItems,
    dragActive,
    orderLocked,
    captionsText,
    mappedCaptions,
    plannedFeedPostCount,
    hasDraftSingleUploads,
    hasDraftCarouselUploads,
    allowStories,
    allowGrid,
    requiresLockedFeedOrder,
    hasPendingFeedChanges: hasDraftFeedItems || hasExistingFeedReorder,
    setDragActive,
    setDraggedId,
    setCaptionsText,
    setOrderLocked,
    setDraggedCarouselSlideId,
    appendFiles,
    appendCarouselFiles,
    removeCarouselPost,
    removeCarouselMedia,
    handleTileDrop,
    handleCarouselSlideDrop,
    removeMedia,
    clearMedia,
    clearCarouselUploads,
    appendInstagramGridFiles,
    clearInstagramGrid,
    appendInstagramStories,
    removeInstagramStoryItem,
    onSubmitFeed: handleFeedUpload,
    onSubmitStories: handleStoriesUpload
  };
}
