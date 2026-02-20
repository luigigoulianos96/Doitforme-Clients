import React, { useState } from 'react';
import styled from 'styled-components';
import { Grey_Link } from '/node_modules/monica-alexandria/dist/index.mjs';

const CaptionBlock = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const CaptionText = styled.p`
  margin: 0;
  color: ${(p) => p.theme.color};
`;

const CaptionName = styled.h6`
  margin: 0;
  color: ${(p) => p.theme.flare};
`;

const CaptionAction = styled.div`
  display: flex;
  justify-content: flex-start;
`;

// Renders client caption text with expand/collapse behavior.
// Backend integration: caption comes from posts.caption query field.
export const Client_Caption_Block = ({ username, caption }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const finalCaption = `${caption || 'Η λεζάντα εκκρεμεί...'}`.trim();
  const limit = 150;
  const shouldCollapse = finalCaption.length > limit;
  const visibleCaption = shouldCollapse && isExpanded === false ? `${finalCaption.slice(0, limit).trimEnd()}...` : finalCaption;

  return (
    <CaptionBlock>
      <CaptionName>{username || 'gymway.official'}</CaptionName>
      <CaptionText>{visibleCaption}</CaptionText>
      <CaptionAction>
        {shouldCollapse && <Grey_Link text={isExpanded ? 'Λιγότερα' : 'Περισσότερα'} onClick={() => setIsExpanded(!isExpanded)} />}
      </CaptionAction>
    </CaptionBlock>
  );
};
