import React from 'react';
import styled from 'styled-components';

const MyInput = styled.input`
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-left: 1rem;
`;
const MyTextArea = styled.textarea`
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-left: 1rem;
  width: 100%;
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
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement> &
      React.ChangeEvent<HTMLInputElement>,
  ) => void;
  style?: any;
  type?: 'textarea' | 'input';
}
export const Input = (props: IInputProps) => {
  return (
    <StyledDiv>
      {props.type === 'textarea' ? (
        <>
          <label htmlFor={props.name} style={{ whiteSpace: 'nowrap' }}>
            {props.label}
          </label>
          <MyTextArea
            id={props.name}
            placeholder={props.placeholder}
            style={props.style}
            rows={5}
            value={props.value}
            onChange={props.onChange}
          />
        </>
      ) : (
        <>
          <label htmlFor={props.name}>{props.label}</label>
          <MyInput id={props.name} {...props} />
        </>
      )}
    </StyledDiv>
  );
};
