import React, { useState } from 'react';
import { CaptionWrap, Caption, CaptionToggleRow, InlineAction } from '../core/styles/App.styles.js';

function CaptionBlock({ username, caption }) {
  const [expanded, setExpanded] = useState(false);
  const finalCaption = (caption || 'Η λεζάντα εκκρεμεί...').trim();
  const shouldCollapse = finalCaption.length > 120;

  return (
    <CaptionWrap>
      <Caption $expanded={expanded}>
        <strong>{username || ''}</strong> {finalCaption}
      </Caption>
      <CaptionToggleRow>
        {shouldCollapse && (
          <InlineAction type="button" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? 'Δείτε λιγότερα' : 'Δείτε περισσότερα'}
          </InlineAction>
        )}
      </CaptionToggleRow>
    </CaptionWrap>
  );
}

export { CaptionBlock };
