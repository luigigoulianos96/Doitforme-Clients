import { keyframes } from 'styled-components';

const cardIn = keyframes`
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const cardFlip = keyframes`
  0% { transform: rotateY(0deg) scale(1); }
  50% { transform: rotateY(68deg) scale(0.992); }
  100% { transform: rotateY(0deg) scale(1); }
`;

const slideEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const imageFade = keyframes`
  from {
    opacity: 0.32;
    transform: scale(0.985);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export { cardIn, cardFlip, slideEnter, imageFade };
