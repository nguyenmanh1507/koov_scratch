```js
import {
  AddButtonSVG,
  DeleteButtonSVG,
  EraserButtonOffSVG,
  PaintCursorOnSVG,
  EraserCursorSVG,
  PaintCursorSVG,
  SyringeButtonOffSVG,
  SyringeButtonOnSVG,
  SyringeCursorSVG,
} from './SVGIcon';

<div style={{ display: 'flex', justifyContent: 'center', alignItem: 'center' }}>
  <AddButtonSVG />
  <DeleteButtonSVG />
  <EraserButtonOffSVG />
  <EraserCursorSVG />
  <PaintCursorOnSVG active={true} color={{ r: 38, g: 77, b: 83 }} />
  <PaintCursorSVG color={{ r: 38, g: 77, b: 83 }} />
  <SyringeButtonOffSVG />
  <SyringeButtonOnSVG />
  <SyringeCursorSVG />
</div>;
```
