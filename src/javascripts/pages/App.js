// @flow
import * as React from 'react';
import Modal, { Props as ModalProps } from 'react-modal';

import {
  ScratchBlocks,
  // makeToolBox
} from './blocks/ScratchBlocks';
import makeToolboxXML from '../../lib/makeToolboxXML';
import Prompt from '../components/Prompt';
import KoovVariables from '../dynamic-categories/koov-variables';
import KoovFunctions from '../dynamic-categories/koov-functions';
import LEDMatrixPrompt from '../components/LEDMatrixPrompt';

Modal.setAppElement('#main');

type Props = {};
type State = {
  prompt: ?{
    callback: ModalProps.callback,
    message: string,
    defaultValue?: string,
    optTitle: string,
    optVarType: string,
  },
};
class App extends React.Component<Props, State> {
  blockDiv = null;
  workspace: ScratchBlocks = null;
  startBlock = null;

  state = {
    prompt: null,
  };

  componentDidMount() {
    this.workspace = ScratchBlocks.inject(this.blockDiv, {
      // toolbox: makeToolboxXML(),
      zoom: { startScale: 0.75 },
      scrollbars: true, // disable dragging on readonly workspace
      trashcan: true,
      sounds: false,
      media: 'http://koov_scratch_gui.surge.sh/media/',
      readOnly: false,
    });

    // register koov dynamic categories
    this.workspace.registerToolboxCategoryCallback(
      'KOOV_VARIABLES',
      KoovVariables.variablesCategory
    );
    this.workspace.registerToolboxCategoryCallback(
      'KOOV_FUNCTIONS',
      KoovFunctions.FunctionsCategory
    );

    this.workspace.updateToolbox(makeToolboxXML());
    window.ws = this.workspace;

    // Add start block
    const startBlock = this.workspace.newBlock('when_green_flag_clicked');
    startBlock.initSvg();
    startBlock.render();
    startBlock.moveBy(100, 100);
    startBlock.setDeletable(false);
    this.workspace.render();

    ScratchBlocks.prompt = (
      message,
      defaultValue,
      callback,
      optTitle,
      optVarType
    ) => {
      this.setState({
        prompt: { callback, message, defaultValue, optTitle, optVarType },
      });
    };
  }

  handleRequestClose = () => {
    this.setState({
      prompt: null,
    });
  };

  handlePromptCallback = (value: string) => {
    const { prompt } = this.state;

    if (prompt) {
      prompt.callback(value);
    }
    this.handleRequestClose();
  };

  toDom() {
    return ScratchBlocks.Xml.workspaceToDom(this.workspace);
  }

  fromDom(dom: string) {
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
    const { prompt } = this.state;
    const isOpenPrompt = prompt ? prompt.optVarType !== 'led' : false;
    const isOpenLEDPrompt = prompt ? prompt.optVarType === 'led' : false;

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
        <Prompt
          label={prompt ? prompt.message : ''}
          isOpen={isOpenPrompt}
          onRequestClose={this.handleRequestClose}
          onOk={this.handlePromptCallback}
        />
        <LEDMatrixPrompt
          label={prompt ? prompt.message : ''}
          isOpen={isOpenLEDPrompt}
          onRequestClose={this.handleRequestClose}
          onOk={this.handlePromptCallback}
        />
      </React.Fragment>
    );
  }
}

export default App;
