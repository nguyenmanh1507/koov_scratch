// @flow
import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import Modal, { Props as ModalProps } from 'react-modal';
import {
  ScratchBlocks,
  // makeToolBox
} from './blocks/ScratchBlocks';
import makeToolboxXML from '../../lib/makeToolboxXML';
import Prompt from '../components/Prompt';
import KoovVariables from '../dynamic-categories/koov-variables';

Modal.setAppElement('#main');

type Props = {};
type State = {
  prompt: ?{
    callback: ModalProps.callback,
    message: string,
    defaultValue?: string,
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

    this.workspace.registerToolboxCategoryCallback(
      'KOOV_VARIABLES',
      KoovVariables.variablesCategory
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
      callback
      // optTitle,
      // optVarType
    ) => {
      this.setState({
        prompt: { callback, message, defaultValue },
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
      console.info('callback');
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

  handleTestClick = () => {
    console.info({ workspace: this.workspace.getAllVariables() });
  };

  render() {
    const { prompt } = this.state;

    return (
      <React.Fragment>
        <div className={'button'} onClick={this.onClick.bind(this)}>
          toCode
        </div>
        <button
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 100,
          }}
          onClick={this.handleTestClick}
        >
          Test
        </button>
        <div className={'scratch-blocks-overlay'} />
        <div
          className={'scratch-canvas'}
          ref={r => {
            this.blockDiv = r;
          }}
        />
        <Prompt
          label={prompt ? prompt.message : ''}
          isOpen={!isEmpty(prompt)}
          onRequestClose={this.handleRequestClose}
          onOk={this.handlePromptCallback}
        />
      </React.Fragment>
    );
  }
}

export default App;
