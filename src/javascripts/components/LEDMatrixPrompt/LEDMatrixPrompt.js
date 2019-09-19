// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import forEach from 'lodash/forEach';
import isEmpty from 'lodash/isEmpty';
// import debounce from 'lodash/debounce';
import Modal, { ModalProps } from 'react-modal';
// import Color from 'color';

import LEDMatrixBoard from './LEDMatrixBoard';
import { MATRIX_ROW, MATRIX_COLUMN, MATRIX_MAX_COLUMN } from '../../constants';
import {
  PaintCursorOnSVG,
  EraserButtonOffSVG,
  SyringeButtonOffSVG,
  PaintCursorSVG,
  SyringeCursorSVG,
  EraserCursorSVG,
} from '../../components/SVGIcon';
import ColorPalette from './ColorPalette';

// <defs><style>.cls-1{fill:#485566;}</style></defs>

class LEDMatrixPrompt extends Component<Props, State> {
  oldSelectedColor: rgbType;
  oldMode: ModeType;
  clickCount: number = 0;
  modalRef: ?HTMLDivElement;
  cursorRef: ?HTMLDivElement;
  rect: Object;

  state = {
    mode: '',
    varName: '',
    selectedColor: {
      r: 51,
      g: 61,
      b: 255,
    },
    matrix: {
      row: MATRIX_ROW,
      col: MATRIX_COLUMN,
      el: {},
    },
    isOpenColorPalette: false,
    isError: false,
  };

  setMode = (mode: ModeType) => {
    if (mode === 'PAINT') {
      this.setState({ mode });
    } else {
      this.setState({ mode, isOpenColorPalette: false });
      this.clickCount = 0;
    }
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
    if (mode === 'PAINT') {
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

  handleAddColumn = (cb?: () => void) => {
    const {
      matrix: { col },
    } = this.state;

    if (col >= MATRIX_MAX_COLUMN) {
      return;
    }

    this.setState(
      prevState => ({
        ...prevState,
        matrix: {
          ...prevState.matrix,
          col: prevState.matrix.col + 1,
        },
      }),
      () => {
        if (typeof cb === 'function') {
          cb();
        }
      }
    );
  };

  handleInsertColumn = (colIndex: number) => {
    const {
      matrix: { col, el },
    } = this.state;

    if (col >= MATRIX_MAX_COLUMN) {
      return;
    }

    // 1. Add one column to matrix
    const newCol = col + 1;

    const newEl = {};
    forEach(el, (value, id) => {
      const oldRowIndex = parseInt(id.split('-')[0]);
      const oldColIndex = parseInt(id.split('-')[1]);
      // 2. Find led on the right of new insert column
      // and add + 1 to column of that
      if (oldColIndex > colIndex) {
        newEl[`${oldRowIndex}-${oldColIndex + 1}`] = value;
        return;
      }

      newEl[id] = value;
    });

    this.setState(prevState => ({
      ...prevState,
      matrix: {
        ...prevState.matrix,
        col: newCol,
        el: { ...newEl },
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

  handleMouseMoveModal = (event: MouseEvent) => {
    const { mode } = this.state;
    // console.info({ event: event.pageY });

    if (this.modalRef && this.cursorRef) {
      if (!this.rect) {
        this.rect = this.modalRef.getBoundingClientRect();
      }
      const x = event.pageX - this.rect.left;
      const y = event.pageY - this.rect.top;

      switch (mode) {
        case 'PAINT':
        case 'CLEAR':
        case 'INSPECT':
          this.modalRef.style.cursor = 'none';
          break;
        default:
          this.modalRef.style.cursor = 'default';
      }
      this.cursorRef.style.left = x - 20 + 'px';
      this.cursorRef.style.top = y - 20 + 'px';
    }
  };

  handleMouseLeave = () => {
    if (this.cursorRef) {
      this.cursorRef.style.visibility = 'hidden';
    }
  };

  handleMouseEnter = () => {
    if (this.cursorRef) {
      this.cursorRef.style.visibility = 'visible';
    }
  };

  setClickCount = () => {
    if (this.clickCount === 0) {
      this.clickCount += 1;
    }
  };

  handleOk = () => {
    const { varName, matrix } = this.state;
    const { onOk, onRequestClose } = this.props;

    if (isEmpty(varName)) {
      this.setState({ isError: true });
      return;
    }

    onOk({ varName, matrix });
    onRequestClose();
  };

  render() {
    const { isOpen, onRequestClose, ...rest } = this.props;
    const {
      varName,
      selectedColor,
      matrix,
      mode,
      isOpenColorPalette,
      isError,
    } = this.state;

    return (
      <Modal
        isOpen={isOpen}
        className="prompt-new-var"
        onRequestClose={onRequestClose}
        {...rest}
      >
        <Container
          mode={mode}
          ref={ref => (this.modalRef = ref)}
          onMouseMove={this.handleMouseMoveModal}
          onMouseLeave={this.handleMouseLeave}
          onMouseEnter={this.handleMouseEnter}
          onDragStart={(event: SyntheticEvent<HTMLDivElement>) => {
            // https://stackoverflow.com/questions/704564/disable-drag-and-drop-on-html-elements
            event.preventDefault();
          }}
          onDrop={(event: SyntheticEvent<HTMLDivElement>) => {
            event.preventDefault();
          }}
        >
          <Header>
            {/* <ColorAlert color={selectedColor} /> */}
            <InputColorName
              type="text"
              value={varName}
              onChange={(event: SyntheticInputEvent<HTMLInputElement>) => {
                this.setVarName(event.currentTarget.value);
                if (isEmpty(event.currentTarget.value)) {
                  this.setState({ isError: true });
                } else {
                  this.setState({ isError: false });
                }
              }}
              id="led-name"
              onFocus={() => {
                this.setMode('');
              }}
              mode={mode}
            />
            {isError && (
              <ErrorMsg>
                <i className="fas fa-exclamation-circle"></i> Please input the
                name
              </ErrorMsg>
            )}
            <Row>
              <ButtonPaintWrap>
                <ColorButton
                  onClick={() => {
                    this.setMode('PAINT');
                    if (this.clickCount >= 1) {
                      this.setState({ isOpenColorPalette: true });
                    }
                    this.clickCount += 1;
                  }}
                  mode={mode}
                >
                  <PaintCursorOnSVG
                    active={mode === 'PAINT'}
                    color={selectedColor}
                  />
                </ColorButton>
                {isOpenColorPalette && (
                  // && this.oldMode === 'PAINT'
                  <ColorPalette
                    style={{
                      position: 'absolute',
                      top: 40,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 10,
                    }}
                    onColorTrackEnter={() => {
                      this.oldSelectedColor = selectedColor;
                    }}
                    onColorTrackMove={({ r, g, b }) => {
                      this.setSelectedColor({ r, g, b });
                    }}
                    onColorTrackLeave={() => {
                      this.setSelectedColor(this.oldSelectedColor);
                    }}
                    onColorTrackClick={() => {
                      this.setState({ isOpenColorPalette: false });
                    }}
                  />
                )}
              </ButtonPaintWrap>
              <ColorButton
                onClick={() => {
                  this.setMode('CLEAR');
                }}
                mode={mode}
              >
                <EraserButtonOffSVG active={mode === 'CLEAR'} />
              </ColorButton>
              <ColorButton
                onClick={() => {
                  this.setMode('INSPECT');
                }}
                mode={mode}
              >
                <SyringeButtonOffSVG active={mode === 'INSPECT'} />
              </ColorButton>
              <ColorInputContainer>
                <ColorInputWrap>
                  <ColorChannel channel="red">R:</ColorChannel>
                  <ColorInput
                    type="number"
                    min={0}
                    max={255}
                    value={selectedColor.r}
                    onChange={(
                      event: SyntheticInputEvent<HTMLInputElement>
                    ) => {
                      this.setSelectedColor({
                        r: colorValueFormat(event.currentTarget.value),
                      });
                    }}
                    onFocus={() => {
                      this.setMode('');
                    }}
                    mode={mode}
                  />
                </ColorInputWrap>
                <ColorInputWrap>
                  <ColorChannel channel="green">G:</ColorChannel>
                  <ColorInput
                    type="number"
                    min={0}
                    max={255}
                    value={selectedColor.g}
                    onChange={(
                      event: SyntheticInputEvent<HTMLInputElement>
                    ) => {
                      this.setSelectedColor({
                        g: colorValueFormat(event.currentTarget.value),
                      });
                    }}
                    onFocus={() => {
                      this.setMode('');
                    }}
                    mode={mode}
                  />
                </ColorInputWrap>
                <ColorInputWrap>
                  <ColorChannel channel="blue">B:</ColorChannel>
                  <ColorInput
                    type="number"
                    min={0}
                    max={255}
                    value={selectedColor.b}
                    onChange={(
                      event: SyntheticInputEvent<HTMLInputElement>
                    ) => {
                      this.setSelectedColor({
                        b: colorValueFormat(event.currentTarget.value),
                      });
                    }}
                    onFocus={() => {
                      this.setMode('');
                    }}
                    mode={mode}
                  />
                </ColorInputWrap>
              </ColorInputContainer>
            </Row>
          </Header>
          <Row>
            <LEDMatrixBoard
              mode={mode}
              selectedColor={selectedColor}
              matrix={matrix}
              handleClickElement={this.handleClickElement}
              handleAddColumn={this.handleAddColumn}
              handleInsertColumn={this.handleInsertColumn}
              handleDeleteColumn={this.handleDeleteColumn}
              setSelectedColor={this.setSelectedColor}
              isOpenColorPalette={isOpenColorPalette}
              setMode={this.setMode}
              setClickCount={this.setClickCount}
            />
          </Row>
          <Row style={{ padding: '10px 0', justifyContent: 'center' }}>
            <CancelButton onClick={onRequestClose} mode={mode}>
              <i className="fas fa-times"></i>
            </CancelButton>
            <OkButton onClick={this.handleOk} mode={mode}>
              <i className="fas fa-check"></i>
            </OkButton>
          </Row>
          <Cursor ref={ref => (this.cursorRef = ref)} mode={mode}>
            {mode === 'PAINT' && <PaintCursorSVG color={selectedColor} />}
            {mode === 'INSPECT' && <SyringeCursorSVG />}
            {mode === 'CLEAR' && <EraserCursorSVG />}
          </Cursor>
        </Container>
      </Modal>
    );
  }
}

export default LEDMatrixPrompt;

export type ModeType = 'PAINT' | 'CLEAR' | 'INSPECT' | '';
export type rgbType = { r: number, g: number, b: number };
type Props = {
  ...ModalProps,
};
type State = {
  mode: ModeType,
  varName: string,
  selectedColor: rgbType,
  matrix: MatrixType,
  isOpenColorPalette: boolean,
  isError: boolean,
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

const Container = styled.div`
  position: relative;
`;

const Row = styled.div`
  display: flex;
`;

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
  margin-bottom: 10px;
  padding: 8px;
  color: #fff;
  text-align: center;
  cursor: ${({ mode }) => (isEmpty(mode) ? 'auto' : 'none')};
`;

const Header = styled.div`
  padding: 10px 22px;
`;

const FooterButton = styled.button`
  border: 0;
  background-color: transparent;
  font-size: 36px;
  cursor: pointer;
`;

const CancelButton = styled(FooterButton)`
  color: #000;
  margin-right: 20px;
  cursor: ${({ mode }) => (isEmpty(mode) ? 'pointer' : 'none')};
`;

const OkButton = styled(FooterButton)`
  color: #ffe15c;
  cursor: ${({ mode }) => (isEmpty(mode) ? 'pointer' : 'none')};
`;

const ButtonPaintWrap = styled.div`
  position: relative;
  display: flex;
`;

const ColorButton = styled.button`
  cursor: ${({ mode }) => (isEmpty(mode) ? 'pointer' : 'none')};
  border: 0;
  background-color: transparent;
  padding: 0;
  line-height: 0;
  outline: none;
`;

const ColorInputContainer = styled.div`
  display: flex;
  margin-left: auto;
`;

const ColorInputWrap = styled.div`
  display: flex;
  &:not(:first-child) {
    margin-left: 10px;
  }
`;

const ColorInput = styled.input`
  width: 60px;
  height: 42px;
  color: #fff;
  border: 0;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
  border-radius: 0 8px 8px 0;
  background-color: #59687c;
  cursor: ${({ mode }) => (isEmpty(mode) ? 'auto' : 'none')};
`;

const channels = {
  red: 'red',
  green: 'green',
  blue: 'blue',
};

const ColorChannel = styled.div`
  width: 32px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  background-color: ${({ channel }) => (channel ? channels[channel] : 'red')};
  border-radius: 8px 0 0 8px;
`;

const Cursor = styled.div`
  position: absolute;
  visibility: ${({ mode }) => (!isEmpty(mode) ? 'visible' : 'hidden')};
  pointer-events: none;
  /* background-color: peru; */

  & #paint-cursor-svg,
  #syringe-cursor-svg,
  #eraser-cursor-svg {
    width: 70px;
  }
`;

const ErrorMsg = styled.div`
  text-align: center;
  font-size: 13px;
  margin-bottom: 5px;
  color: #fff;
`;
