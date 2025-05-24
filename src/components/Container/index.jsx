import styled from 'styled-components';

export const StyledHover = styled.div`
  cursor: pointer;
  &:active {
    opacity: 0.8;
  }
`;

export const StyledIconContainer = styled.div`
  width: ${props => props.width || '2rem'};
  height: ${props => props.height || '2rem'};
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.background || 'rgba(11, 207, 206, 1)'};
  transition: background 0.3s ease, transform 0.3s ease;

  &:hover {
    background: ${props => props.backgroundHover || 'rgba(11, 150, 150, 1)'};
    transform: scale(1.1);
  }

  &:active {
    background: ${props => props.backgroundActive || 'rgba(11, 100, 100, 1)'};
    transform: scale(0.95);
  }
`;

export const ContainerClassification = styled.div`
  border-radius: 8px;
  padding: 8px;
  background: rgb(0, 134, 132, 1);
  background: linear-gradient(45deg, rgba(0, 134, 132, 0.9) 0%, rgba(0, 17, 20, 1) 100%);
  width: ${props => props.width || ` 300px`};
`;

export const ContainerOverlay = styled.div`
  position: absolute;
  top: calc(50% + -120px);
  left: 26%;
  width: 0;
  z-index: 10;
  opacity: ${props => (props.isopen ? 1 : 0)};
  visibility: ${props => (props.isopen ? 'visible' : 'hidden')};
  transition: opacity ${props => (props.isopen ? '300ms ease' : '0ms')};
`;

export const RotatingContainer = styled.div`
  transition: transform 0.5s ease;
  cursor: pointer;

  &:hover {
    transform: rotate(180deg);
  }
`;

export const AnimatedContainer = styled.div`
  transition: transform 0.3s ease, background-color 0.3s ease;
  transform: scale(1);
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  color: ${props => props.color || ''};

  &:hover {
    transform: scale(${props => props.scale || 1.01});
    background: ${props => props.background || ''};
    opacity: 0.9;
  }
  &:active {
    transform: scale(${props => props.scale || 1});
  }
`;

export const AnimatedButton = styled.button`
  transition: transform 0.3s ease, background-color 0.3s ease;
  transform: scale(1);
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  color: ${props => props.color || ''};

  &:hover {
    transform: scale(${props => props.scale || 1.2});
    background: ${props => props.background || ''};
    opacity: 0.9;
  }
  &:active {
    transform: scale(${props => props.scale || 1});
  }
`;

export const VerticalTreeLine = styled.div`
  border-left: 2px solid #f0fff4;
  height: 100%;
  position: absolute;
  left: 0.5rem;
  top: ${props => props.top || ` 2.5rem`};
`;

export const HorizonTreeLine = styled.div`
  border-top: 2px solid #f0fff4;
  width: 1rem;
  position: absolute;
  left: ${props => props.left || ` 0.5rem`};
  top: 1rem;
  z-index: 1;
`;

export const StyledGradient = styled.div`
  background: radial-gradient(
        396.06% 200.48% at 15.69% 86.61%,
        rgba(124, 135, 254, 0.49485) 0%,
        rgba(11, 252, 243, 0.7) 0%,
        rgba(11, 252, 243, 0) 100%
      )
      /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */,
    linear-gradient(0deg, rgba(12, 25, 57, 0.5), rgba(12, 25, 57, 0.5)),
    linear-gradient(0deg, rgba(12, 25, 57, 0.2), rgba(12, 25, 57, 0.2));
`;
