import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  width: 100%;
  text-align: center;
  margin-top: 2;
  padding: 0.75rem;
  background-color: #f3f3f3;
  border-radius: 0.75rem;
  border: 1px #000 solid;
  color: #000
`;

export const Box = ({ children }: { children: JSX.Element | string }) => {
  return <StyledButton>{children}</StyledButton>;
};
export default Box;
