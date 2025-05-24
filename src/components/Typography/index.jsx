import React from 'react';
import styled from 'styled-components';

export const Text = styled.div`
  font-size: ${props => props.size || `14px`};
  font-weight: ${props => props.weight || 400};
  color: ${props => props.color || 'rgba(255, 255, 255, 1)'};
  line-height: ${props => props.lineHeigh || ''};
  display: flex;
  align-items: center;
`;

export const Text2 = styled.div`
  font-size: ${props => props.size || `12px`};
  font-weight: ${props => props.weight || 400};
  color: ${props => props.color || 'rgba(173, 180, 193, 1)'};
  display: flex;
  align-items: center;
`;

export const Text3 = styled.div`
  font-size: ${props => props.size || `14px`};
  font-weight: ${props => props.weight || 500};
  color: ${props => props.color || 'rgba(203, 255, 253, 1)'};
  display: flex;
  align-items: center;
`;

export const H1 = styled.div`
  font-size: ${props => props.size || `18px`};
  font-weight: ${props => props.weight || 600};
  color: ${props => props.color || 'rgba(11, 207, 206, 1)'};
`;

export const Title = styled.div`
  font-size: ${props => props.size || '40px'};
  font-weight: ${props => props.weight || 500};
  line-height: 27px;
  color: ${props => props.color || 'rgba(11, 207, 206, 1)'};
`;

export const SubTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 26.4px;
  color: rgba(203, 255, 253, 1);
`;

export const TextMandatory = ({ children, ...other }) => {
  return (
    <Text {...other}>
      {children}
      <span className='text-red-500'>*</span>
    </Text>
  );
};
