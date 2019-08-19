// @flow
import React, { createRef } from 'react';
import Modal, { Props } from 'react-modal';
import styled from 'styled-components';

// type Props = { isOpen: boolean, onRequestClose: () => void };
const Prompt = function({ isOpen, label, onRequestClose, onOk }: Props) {
  const newVarInputRef = createRef();

  return (
    <Modal
      isOpen={isOpen}
      className="prompt-new-var"
      onRequestClose={onRequestClose}
    >
      <Label>{label}</Label>
      <Input type="text" ref={newVarInputRef} />
      <ButtonWrap>
        <button onClick={onRequestClose}>Close</button>
        <button
          onClick={() => {
            if (newVarInputRef.current) {
              onOk(newVarInputRef.current.value);
            }
          }}
        >
          OK
        </button>
      </ButtonWrap>
    </Modal>
  );
};

export default Prompt;

const Label = styled.label`
  display: block;
`;

const Input = styled.input`
  width: 100%;
`;

const ButtonWrap = styled.div`
  display: flex;
`;
