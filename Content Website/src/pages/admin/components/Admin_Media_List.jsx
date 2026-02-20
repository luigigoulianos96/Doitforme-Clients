import React from 'react';
import styled from 'styled-components';
import { Main_, Red_ } from '/node_modules/monica-alexandria/dist/index.mjs';

const Grid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  @media (max-width: 100rem) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 70rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 46rem) {
    grid-template-columns: 1fr;
  }
`;

const Tile = styled.article`
  border: 0.1rem solid ${(p) => p.theme.high};
  border-radius: var(--smallRadius);
  padding: var(--normalPads);
  background: ${(p) => p.theme.low};
  display: grid;
  gap: 0.8rem;
`;

const Thumb = styled.div`
  border-radius: var(--smallRadius);
  overflow: hidden;
  background: ${(p) => p.theme.background};
`;

const Image = styled.img`
  width: 100%;
  height: 24rem;
  object-fit: cover;
  display: block;
`;

const Video = styled.video`
  width: 100%;
  height: 24rem;
  object-fit: cover;
  display: block;
`;

// Renders draggable media tile list used in upload step.
// Backend integration: order produced here must be used in upload loop sequence.
export const Admin_Media_List = ({ items, orderLocked, onDragStart, onDragOver, onDrop, onRemove }) => {
  return (
    <Grid>
      {items.map((item, index) => (
        <Tile key={item.id} draggable={!orderLocked} onDragStart={() => onDragStart(item.id)} onDragOver={onDragOver} onDrop={() => onDrop(item.id)}>
          <h6>Ανάρτηση {index + 1}</h6>
          <Thumb>
            {item.kind === 'video' && <Video src={item.previewUrl} muted playsInline preload="metadata" />}
            {item.kind === 'image' && <Image src={item.previewUrl} alt={item.file.name} loading="lazy" />}
          </Thumb>
          <p>{item.file.name}</p>
          {!orderLocked && <Red_ text="Αφαίρεση" onClick={() => onRemove(item.id)} />}
          {orderLocked && <Main_ text="Κλειδωμένη σειρά" disabled />}
        </Tile>
      ))}
    </Grid>
  );
};
