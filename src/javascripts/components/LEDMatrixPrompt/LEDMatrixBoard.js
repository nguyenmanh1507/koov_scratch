// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import range from 'lodash/range';
import isEmpty from 'lodash/isEmpty';

import type { MatrixType, rgbType } from './LEDMatrixPrompt';
import { MATRIX_COLUMN } from '../../constants';

class LEDMatrixBoard extends Component<Props> {
  render() {
    const {
      matrix,
      handleClickElement,
      handleAddColumn,
      handleDeleteColumn,
    } = this.props;
    return (
      <Container>
        <Row>
          {range(matrix.col).map((colVal, index) => (
            <ColumnNumber key={`index-${index}`}>{index}</ColumnNumber>
          ))}
        </Row>
        {range(matrix.row).map((rowVal, i) => (
          <Row key={`row-${i}`}>
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
                  onClick={() => {
                    handleClickElement(color, id);
                  }}
                />
              );
            })}
          </Row>
        ))}
        <Row>
          {range(matrix.col).map((colVal, index) => {
            if (index <= MATRIX_COLUMN - 1) {
              return (
                <div
                  key={`index-${index}`}
                  style={{ width: 20, flexShrink: 0 }}
                />
              );
            }

            return (
              <button
                key={`index-${index}`}
                style={{ width: 20, flexShrink: 0, padding: 0 }}
                onClick={() => {
                  handleDeleteColumn(index);
                }}
              >
                X
              </button>
            );
          })}
        </Row>
        <button onClick={handleAddColumn}>Add</button>
      </Container>
    );
  }
}

export default LEDMatrixBoard;

type Props = {
  matrix: MatrixType,
  handleClickElement: (rgb: rgbType, id: string) => void,
  handleAddColumn: () => void,
  handleDeleteColumn: (col: number) => void,
};

const Container = styled.div`
  max-width: 600px;
  overflow-y: auto;
`;

const Row = styled.div`
  display: flex;
`;

const Element = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0);
  background-color: ${({ color }) =>
    color ? `rgb(${color.r}, ${color.g}, ${color.b})` : `rgb(0, 0, 0)`};
  flex-shrink: 0;
`;

const ColumnNumber = styled.div`
  width: 20px;
  height: 20px;
  text-align: center;
  flex-shrink: 0;
`;
