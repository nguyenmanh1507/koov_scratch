import * as React from 'react';
import {
  ScratchBlocks
  // makeToolBox
} from './blocks/ScratchBlocks';
import makeToolboxXML from '../../lib/makeToolboxXML';

class App extends React.Component {
  componentDidMount() {
    this.workspace = ScratchBlocks.inject(this.blockDiv, {
      toolbox: makeToolboxXML(),
      zoom: { startScale: 0.75 },
      scrollbars: true, // disable dragging on readonly workspace
      trashcan: true,
      sounds: false,
      media: 'http://koov_scratch_gui.surge.sh/media/',
      readOnly: false
    });

    // Add start block
    const startBlock = this.workspace.newBlock('when_green_flag_clicked');
    startBlock.initSvg();
    startBlock.render();
    startBlock.moveBy(100, 100);
    startBlock.setDeletable(false);
    this.workspace.render();
  }

  toDom() {
    return ScratchBlocks.Xml.workspaceToDom(this.workspace);
  }

  fromDom(dom) {
    if (typeof dom === 'string') {
      dom = ScratchBlocks.Xml.textToDom(dom);
    }
    ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(dom, this.workspace);

    const startBlock = this.startBlock;
    if (startBlock) startBlock.setDeletable(false);
  }

  onClick() {
    let code = ScratchBlocks.JavaScript.workspaceToCode(this.workspace);
    console.info(code);
  }

  render() {
    return (
      <React.Fragment>
        <div className={'button'} onClick={this.onClick.bind(this)}>
          toCode
        </div>
        <div className={'scratch-blocks-overlay'} />
        <div
          className={'scratch-canvas'}
          ref={r => {
            this.blockDiv = r;
          }}
        />
      </React.Fragment>
    );
  }
}

export default App;
