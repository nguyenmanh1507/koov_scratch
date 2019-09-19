```js
initialState = { isOpen: true };
<div>
  <button
    onClick={() => {
      setState({ isOpen: true });
    }}
  >
    Show LEDMatrixPrompt
  </button>
  <LEDMatrixPrompt
    isOpen={state.isOpen}
    label="Demo"
    ariaHideApp={false}
    onOk={() => {}}
    onRequestClose={() => {
      setState({ isOpen: false });
    }}
  />
</div>;
```

```js
import ColorPalette from './ColorPalette';

initialState = { color: { r: 0, g: 0, b: 0 } };

<div>
  <div>{JSON.stringify(state.color)}</div>
  <ColorPalette
    onColorTrackMove={color => {
      setState({ color });
    }}
  />
</div>;
```
