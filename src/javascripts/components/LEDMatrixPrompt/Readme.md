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
