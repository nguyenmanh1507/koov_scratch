// @flow
import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import range from 'lodash/range';
import isEmpty from 'lodash/isEmpty';

import type { MatrixType, rgbType, ModeType } from './LEDMatrixPrompt';
import { MATRIX_COLUMN } from '../../constants';
import { AddButtonSVG, DeleteButtonSVG } from '../SVGIcon';

class LEDMatrixBoard extends Component<Props> {
  oldColor: rgbType;
  allowSetState: boolean = false;
  scrollableDivRef: Object = createRef();

  shouldComponentUpdate() {
    const { isOpenColorPalette } = this.props;

    if (isOpenColorPalette) {
      return false;
    }

    // if (mode === 'INSPECT' && selectedColor === nextProps.selectedColor) {
    //   return false;
    // }
    return true;
  }

  handleAddColumn = () => {
    this.props.handleAddColumn(() => {
      this.scrollableDivRef.current.scrollLeft = this.scrollableDivRef.current.scrollWidth;
    });
  };

  render() {
    const {
      mode,
      selectedColor,
      matrix,
      handleClickElement,
      handleInsertColumn,
      handleDeleteColumn,
      setSelectedColor,
      setMode,
      setClickCount,
    } = this.props;
    return (
      <Container>
        <Edge />
        <ScrollableDiv ref={this.scrollableDivRef}>
          <LEDWRap>
            <Row
              style={{
                marginLeft: 30,
                marginBottom: -10,
                transform: 'translateY(-10px)',
              }}
            >
              {range(matrix.col).map((colVal, index) => {
                if (index >= matrix.col - 1) return null;

                return (
                  <ButtonInsertColumn
                    key={`index-${index}`}
                    onClick={() => {
                      handleInsertColumn(index);
                    }}
                    mode={mode}
                  >
                    <AddButtonSVG />
                  </ButtonInsertColumn>
                );
              })}
            </Row>
            <Row style={{ marginBottom: 5 }}>
              {range(matrix.col).map((colVal, index) => (
                <ColumnNumber key={`index-${index}`}>{index}</ColumnNumber>
              ))}
            </Row>
            {range(matrix.row).map((rowVal, i) => (
              <Row
                key={`row-${i}`}
                style={{ marginBottom: i >= matrix.row - 1 ? 0 : 15 }}
              >
                {range(matrix.col).map((colVal, j) => {
                  const id = `${i}-${j}`;
                  let color;
                  if (!isEmpty(matrix.el[id])) {
                    color = matrix.el[id];
                  } else {
                    color = { r: 0, g: 0, b: 0 };
                  }

                  return (
                    <Element
                      key={id}
                      color={color}
                      onMouseDown={() => {
                        if (mode === 'INSPECT') {
                          this.oldColor = color;
                          setMode('PAINT');
                          setClickCount();
                        }
                        handleClickElement(color, id);
                      }}
                      onMouseMove={(
                        event: SyntheticMouseEvent<HTMLDivElement>
                      ) => {
                        if (mode === 'INSPECT' && this.allowSetState) {
                          this.allowSetState = false;
                          setSelectedColor(color);
                          return;
                        }

                        // https://stackoverflow.com/questions/3944122/detect-left-mouse-button-press
                        if (event.buttons === 1) {
                          handleClickElement(color, id);
                        }
                      }}
                      onMouseEnter={() =>
                        // event: SyntheticMouseEvent<HTMLDivElement>
                        {
                          if (mode === 'INSPECT') {
                            this.oldColor = selectedColor;
                            this.allowSetState = true;
                          }
                        }
                      }
                      onMouseLeave={() => {
                        if (mode === 'INSPECT') {
                          setSelectedColor(this.oldColor);
                        }
                      }}
                    />
                  );
                })}
              </Row>
            ))}
            <Row style={{ transform: 'translateY(20px)' }}>
              {range(matrix.col).map((colVal, index) => {
                if (index <= MATRIX_COLUMN - 1 && matrix.col <= MATRIX_COLUMN) {
                  return <ButtonDeleteGhost key={`index-${index}`} />;
                }

                return (
                  <ButtonDelete
                    key={`index-${index}`}
                    onClick={() => {
                      handleDeleteColumn(index);
                    }}
                    mode={mode}
                  >
                    <DeleteButtonSVG />
                  </ButtonDelete>
                );
              })}
            </Row>
          </LEDWRap>
        </ScrollableDiv>
        <Edge />

        <ButtonAdd onClick={this.handleAddColumn} mode={mode}>
          <AddButtonSVG />
        </ButtonAdd>
      </Container>
    );
  }
}

export default LEDMatrixBoard;

type Props = {
  mode: ModeType,
  selectedColor: rgbType,
  matrix: MatrixType,
  handleClickElement: (rgb: rgbType, id: string) => void,
  handleAddColumn: (cb?: () => void) => void,
  handleInsertColumn: (col: number) => void,
  handleDeleteColumn: (col: number) => void,
  setSelectedColor: (color: rgbType) => void,
  isOpenColorPalette: boolean,
  setMode: (mode: ModeType) => void,
  setClickCount: () => void,
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  /* max-width: 480px; */
  padding: 10px 40px;
  width: 100%;
  /* overflow-y: auto; */
  background-color: #000;
`;

const Row = styled.div`
  display: flex;

  & #add-button-svg {
    width: 17px;
  }
`;

const Element = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid rgb(72, 85, 102);
  background-color: ${({ color }) =>
    color ? `rgb(${color.r}, ${color.g}, ${color.b})` : `rgb(0, 0, 0)`};
  flex-shrink: 0;

  &:not(:last-child) {
    margin-right: 20px;
  }
`;

const ColumnNumber = styled.div`
  width: 30px;
  /* height: 30px; */
  text-align: center;
  flex-shrink: 0;
  color: #fff;
  user-select: none;

  &:not(:last-child) {
    margin-right: 20px;
  }
`;

const ButtonAdd = styled.button`
  display: inline-flex;
  padding: 0;
  margin-left: 15px;
  border: 0;
  background-color: transparent;
  outline: none;
  cursor: ${({ mode }) => (isEmpty(mode) ? 'pointer' : 'none')};
`;

const ButtonInsertColumn = styled.button`
  width: 20px;
  margin-right: 30px;
  display: flex;
  justify-content: center;
  border: 0;
  background-color: #000;
  padding: 0;
  outline: none;
  cursor: ${({ mode }) => (isEmpty(mode) ? 'pointer' : 'none')};
`;

const ButtonDelete = styled.button`
  width: 30px;
  flexshrink: 0;
  border: 0;
  background-color: transparent;
  padding: 0;
  outline: none;
  cursor: ${({ mode }) => (isEmpty(mode) ? 'pointer' : 'none')};

  &:not(:last-child) {
    margin-right: 20px;
  }
`;

const ButtonDeleteGhost = styled.div`
  width: 30px;
  height: 34px;
  flexshrink: 0;
  &:not(:last-child) {
    margin-right: 20px;
  }
`;

const LEDWRap = styled.div`
  position: relative;
  padding: 0 20px;
  margin-top: 15px;
  margin-bottom: 20px;
  /* border-right: 2px solid rgb(72, 85, 102);
  border-left: 2px solid rgb(72, 85, 102); */

  &::before,
  &::after {
    display: block;
    content: '';
    height: 2px;
    background-color: rgb(72, 85, 102);
    margin: 0 -20px;
  }
`;

const ScrollableDiv = styled.div`
  position: relative;
  display: flex;
  /* width: 274px; */
  max-width: 324px;
  /* border-right: 2px solid rgb(72, 85, 102);
  border-left: 2px solid rgb(72, 85, 102); */
  overflow-x: scroll;
  margin-bottom: 10px;

  &::-webkit-scrollbar {
    width: 0.3em;
  }
  /* &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  } */
  &::-webkit-scrollbar-thumb {
    background-color: rgb(126, 149, 179);
    outline: 1px solid slategrey;
    border-radius: 8px;
  }
`;

const Edge = styled.div`
  width: 2px;
  height: 278px;
  background-color: rgb(72, 85, 102);
  transform: translateY(-15px);
`;
