import React from 'react';
import styled from 'styled-components';

const MyInput = styled.input`
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-left: 0.5rem;
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
`;

interface IInputProps {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export const Input = (props: IInputProps) => {
  return (
    <StyledDiv>
      <label htmlFor={props.name}>{props.label}</label>
      <MyInput id={props.name} {...props} />
    </StyledDiv>
  );
};
