// @flow
import React, { Component, createRef } from 'react';
import styled from 'styled-components';

let oldX: ?number = null;
let oldY: ?number = null;

type Props = {
  style?: Object,
  onColorTrackMove?: ({ r: number, g: number, b: number }) => void,
  onColorTrackLeave?: () => void,
  onColorTrackEnter?: () => void,
  onColorTrackClick?: () => void,
};
class ColorPalette extends Component<Props> {
  paletteRef: Object = createRef();
  ctx: CanvasRenderingContext2D;
  canvasX: number;
  canvasY: number;

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    this.renderColorPalette();
    this.paletteRef.current.addEventListener('mousemove', this.handleMouseMove);
    this.paletteRef.current.addEventListener(
      'mouseleave',
      this.handleMouseLeave
    );
    this.paletteRef.current.addEventListener(
      'mouseenter',
      this.handleMouseEnter
    );
    this.paletteRef.current.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    this.paletteRef.current.removeEventListener(
      'mousemove',
      this.handleMouseMove
    );
    this.paletteRef.current.removeEventListener(
      'mouseleave',
      this.handleMouseLeave
    );
    this.paletteRef.current.removeEventListener(
      'mouseenter',
      this.handleMouseEnter
    );
    this.paletteRef.current.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove = (event: MouseEvent) => {
    const { onColorTrackMove } = this.props;
    const rect = this.paletteRef.current.getBoundingClientRect();
    this.canvasX = Math.floor(event.pageX - rect.left);
    this.canvasY = Math.floor(event.pageY - rect.top);

    const imageData = this.ctx.getImageData(this.canvasX, this.canvasY, 1, 1);

    const [r, g, b] = imageData.data;

    if (typeof onColorTrackMove === 'function') {
      onColorTrackMove({ r, g, b });
    }

    this.ctx.clearRect(0, 0, 256, 256);
    this.drawPalette();
    this.drawCircle(this.canvasX, this.canvasY);
  };

  handleMouseLeave = () => {
    const { onColorTrackLeave } = this.props;
    if (typeof onColorTrackLeave === 'function') {
      onColorTrackLeave();
    }
  };

  handleMouseEnter = () => {
    const { onColorTrackEnter } = this.props;
    if (typeof onColorTrackEnter === 'function') {
      onColorTrackEnter();
    }
  };

  handleMouseUp = () => {
    const { onColorTrackClick } = this.props;
    if (typeof onColorTrackClick === 'function') {
      oldX = this.canvasX;
      oldY = this.canvasY;

      onColorTrackClick();
    }
  };

  renderColorPalette = () => {
    this.paletteRef.current.width = 256;
    this.paletteRef.current.height = 256;
    this.ctx = this.paletteRef.current.getContext('2d');

    this.drawPalette();
    this.drawCircle(oldX, oldY);
  };

  drawPalette = () => {
    // Create gradient
    // const colorWidth = 256 / 6;
    const grad1 = this.ctx.createLinearGradient(0, 0, 256, 0);
    grad1.addColorStop(0, 'red');
    grad1.addColorStop(0.16666, 'yellow');
    grad1.addColorStop(0.16666 * 2, 'green');
    grad1.addColorStop(0.16666 * 3, 'aqua');
    grad1.addColorStop(0.16666 * 4, 'blue');
    grad1.addColorStop(0.16666 * 5, '#fe25eb');
    grad1.addColorStop(0.16666 * 6, 'red');
    this.ctx.fillStyle = grad1;
    this.ctx.fillRect(0, 0, 256, 256);

    const grad2 = this.ctx.createLinearGradient(0, 0, 0, 256 * 0.4);
    grad2.addColorStop(0, 'white');
    grad2.addColorStop(0.1, 'rgba(255, 255, 255, 0.9)');
    // grad2.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    grad2.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    this.ctx.fillStyle = grad2;
    this.ctx.fillRect(0, 0, 256, 256);

    const grad3 = this.ctx.createLinearGradient(0, 256, 0, 256 * 0.4);
    grad3.addColorStop(0, 'black');
    grad3.addColorStop(0.1, 'rgba(0, 0, 0, 0.8)');
    grad3.addColorStop(0.3, 'rgba(0, 0, 0, 0.3)');
    grad3.addColorStop(0.6, 'transparent');
    this.ctx.fillStyle = grad3;
    this.ctx.fillRect(0, 0, 256, 256);
  };

  drawCircle = (x: ?number, y: ?number) => {
    if (!x) {
      x = 256 / 2;
    }

    if (!y) {
      y = 256 / 2;
    }

    this.ctx.beginPath();
    this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'gray';
    this.ctx.stroke();
  };

  render() {
    const { style } = this.props;

    return (
      <Container style={style}>
        <ArrowUp />
        <CanvasWrap>
          <canvas ref={this.paletteRef} />
        </CanvasWrap>
      </Container>
    );
  }
}

export default ColorPalette;

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
`;

const ArrowUp = styled.div`
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 12px solid #618fbe;
  z-index: 10;
`;

const CanvasWrap = styled.div`
  display: inline-flex;
  padding: 6px;
  border-radius: 4px;
  background-color: #618fbe;
  box-shadow: 2px 2px 10px 2px rgba(0, 0, 0, 0.6);

  > canvas {
    cursor: none;
  }
`;
