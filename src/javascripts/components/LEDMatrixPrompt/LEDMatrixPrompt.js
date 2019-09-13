// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import forEach from 'lodash/forEach';
import Modal, { ModalProps } from 'react-modal';
// import Color from 'color';

import LEDMatrixBoard from './LEDMatrixBoard';
import { MATRIX_ROW, MATRIX_COLUMN, MATRIX_MAX_COLUMN } from '../../constants';
import Icon from '../../../assets/icons/eraser_button_on.svg';

console.info({ icon: Icon });

class LEDMatrixPrompt extends Component<Props, State> {
  state = {
    mode: '',
    varName: '',
    selectedColor: {
      r: 0,
      g: 0,
      b: 0,
    },
    matrix: {
      row: MATRIX_ROW,
      col: MATRIX_COLUMN,
      el: {},
    },
  };

  setMode = (mode: ModeType) => {
    this.setState({ mode });
  };

  setVarName = (varName: string) => {
    this.setState({ varName });
  };

  setSelectedColor = (value: Object) => {
    this.setState(prevState => ({
      ...prevState,
      selectedColor: {
        ...prevState.selectedColor,
        ...value,
      },
    }));
  };

  handleClickElement = (rgb: rgbType, coordinate: string) => {
    const { mode, selectedColor } = this.state;
    if (mode === 'ADD') {
      this.setState(prevState => {
        const newState = { ...prevState };
        newState.matrix.el[coordinate] = selectedColor;
        return newState;
      });
      return;
    }

    if (mode === 'CLEAR') {
      this.setState(prevState => {
        const newState = { ...prevState };
        if (Object.keys(prevState.matrix.el).includes(coordinate)) {
          delete newState.matrix.el[coordinate];
        }

        return newState;
      });
      return;
    }

    if (mode === 'INSPECT') {
      this.setState({
        selectedColor: rgb,
      });
      return;
    }
  };

  handleAddColumn = () => {
    const {
      matrix: { col },
    } = this.state;

    if (col >= MATRIX_MAX_COLUMN) {
      return;
    }

    this.setState(prevState => ({
      ...prevState,
      matrix: {
        ...prevState.matrix,
        col: prevState.matrix.col + 1,
      },
    }));
  };

  handleDeleteColumn = (colIndex: number) => {
    const {
      matrix: { el },
    } = this.state;

    const newEl = {};
    forEach(el, (value, id) => {
      const oldRowIndex = parseInt(id.split('-')[0]);
      const oldColIndex = parseInt(id.split('-')[1]);

      // 1. remove led color at deleted column
      if (oldColIndex === colIndex) {
        return;
      }

      // 2. re-map color:
      // all cols that has index > deleted col will shift to left by one
      if (oldColIndex > colIndex) {
        newEl[`${oldRowIndex}-${oldColIndex - 1}`] = value;
        return;
      }

      newEl[id] = value;
    });

    this.setState(prevState => ({
      ...prevState,
      matrix: {
        ...prevState.matrix,
        // 3. remove last column & update new elements color
        col: prevState.matrix.col - 1,
        el: { ...newEl },
      },
    }));
  };

  render() {
    const { isOpen, onRequestClose, onOk, ...rest } = this.props;
    const { varName, selectedColor, matrix } = this.state;

    return (
      <Modal
        isOpen={isOpen}
        className="prompt-new-var"
        onRequestClose={onRequestClose}
        {...rest}
      >
        <Container>
          <Header>
            {/* <ColorAlert color={selectedColor} /> */}
            <InputColorName
              type="text"
              value={varName}
              onChange={(event: SyntheticInputEvent<HTMLInputElement>) => {
                this.setVarName(event.currentTarget.value);
              }}
              id="led-name"
            />
            <Row>
              <button
                onClick={() => {
                  this.setMode('ADD');
                }}
              >
                {/* <Icon /> */}
              </button>
              <button
                onClick={() => {
                  this.setMode('CLEAR');
                }}
              >
                Clear color
              </button>
              <button
                onClick={() => {
                  this.setMode('INSPECT');
                }}
              >
                Inspect color
              </button>
              <div>
                R:{' '}
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={selectedColor.r}
                  onChange={(event: SyntheticInputEvent<HTMLInputElement>) => {
                    this.setSelectedColor({
                      r: colorValueFormat(event.currentTarget.value),
                    });
                  }}
                />
              </div>
              <div>
                G:{' '}
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={selectedColor.g}
                  onChange={(event: SyntheticInputEvent<HTMLInputElement>) => {
                    this.setSelectedColor({
                      g: colorValueFormat(event.currentTarget.value),
                    });
                  }}
                />
              </div>
              <div>
                B:{' '}
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={selectedColor.b}
                  onChange={(event: SyntheticInputEvent<HTMLInputElement>) => {
                    this.setSelectedColor({
                      b: colorValueFormat(event.currentTarget.value),
                    });
                  }}
                />
              </div>
            </Row>
          </Header>
          <Row>
            <LEDMatrixBoard
              matrix={matrix}
              handleClickElement={this.handleClickElement}
              handleAddColumn={this.handleAddColumn}
              handleDeleteColumn={this.handleDeleteColumn}
            />
          </Row>
          <CancelButton onClick={onRequestClose}>
            <i className="fas fa-times"></i>
          </CancelButton>
          <OkButton
            onClick={() => {
              onOk({ varName, matrix });
            }}
          >
            <i className="fas fa-check"></i>
          </OkButton>
        </Container>
      </Modal>
    );
  }
}

export default LEDMatrixPrompt;

type ModeType = 'ADD' | 'CLEAR' | 'INSPECT' | '';
export type rgbType = { r: number, g: number, b: number };
type Props = {
  ...ModalProps,
};
type State = {
  mode: ModeType,
  varName: string,
  selectedColor: rgbType,
  matrix: MatrixType,
};
export type MatrixType = {
  row: number,
  col: number,
  el: {
    [key: string]: rgbType,
  },
};

/**
 * Format string value to number and limit between 0-100
 *
 * @param  {string} value
 * @returns number
 */
function colorValueFormat(value: string): number {
  let color = parseInt(value) || 0;

  if (color > 255) {
    color = 255;
  }

  if (color < 0) {
    color = 0;
  }

  return color;
}

const Container = styled.div``;

const Row = styled.div``;

// const ColorAlert = styled.div`
//   width: 100px;
//   height: 40px;
//   background-color: ${({ color }) => `rgb(${color.r}, ${color.g}, ${color.b})`};
// `;

const InputColorName = styled.input`
  border-radius: 8px;
  background-color: #58687d;
  width: 100%;
  border: 0;
  height: 40px;
  padding: 8px;
  color: #fff;
  text-align: center;
`;

const Header = styled.div`
  padding: 10px 22px;
`;

const FooterButton = styled.button`
  border: 0;
  background-color: transparent;
  font-size: 28px;
  cursor: pointer;
`;

const CancelButton = styled(FooterButton)`
  color: #000;
`;

const OkButton = styled(FooterButton)`
  color: #ffe15c;
`;
