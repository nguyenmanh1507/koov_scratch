// @flow
import * as React from 'react';
import Modal, { Props as ModalProps } from 'react-modal';

import {
  ScratchBlocks,
  // makeToolBox
} from '../blocks/ScratchBlocks';
import makeToolboxXML from '../../../lib/makeToolboxXML';
import Prompt from '../../components/Prompt';
import KoovVariables from '../../dynamic-categories/koov-variables';
import KoovFunctions from '../../dynamic-categories/koov-functions';
import LEDMatrixPrompt from '../../components/LEDMatrixPrompt';
import Interpreter from 'JS-Interpreter/interpreter';

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
  mode: number,
};
class OverlayNavigation extends React.Component<Props, State> {
  blockDiv = null;
  workspace: ScratchBlocks = null;
  startBlock = null;
  allowTrackingDragBlock: boolean = false;
  blocksGhost = {};
  selectedBlock: ScratchBlocks;
  highlightPause = false;
  latestCode = '';
  myInterpreter = null;

  state = {
    prompt: null,
    mode: 0,
  };

  componentDidMount() {
    this.workspace = ScratchBlocks.inject(this.blockDiv, {
      // toolbox: makeToolboxXML(),
      zoom: { startScale: 0.75 },
      scrollbars: true, // disable dragging on readonly workspace
      trashcan: true,
      sounds: false,
      media: 'http://koov_scratch_gui.surge.sh/media/',
      grid: { spacing: 30, length: 3, colour: '#ccc', snap: true },
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
    this.generateCodeAndLoadIntoInterpreter();
    this.workspace.addChangeListener(this.handleWorkspaceChange);
    window.ws = this.workspace;

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

    this.loadBlocks();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { mode } = this.state;
    if (mode !== prevState.mode) {
      this.executeMode(mode);
    }
  }

  loadBlocks = () => {
    // Add start block
    const dom = ScratchBlocks.Xml.textToDom(defaultWS);
    ScratchBlocks.Xml.domToWorkspace(dom, this.workspace);
  };

  changeMode = (mode: number) => {
    this.setState({ mode });
  };

  setBlocksGhostFromIds(ids: Array<string>) {
    ids.forEach(id => {
      const block = this.workspace.getBlockById(id);
      if (block) {
        block.setDisabled(true);
      }
    });
    // block.setMovable(false);
    // block.setDisabled(true);
    // if (block.childBlocks_) {
    //   for (let i = 0; i <= block.childBlocks_.length - 1; i++) {
    //     setAllBlockDisabled(block.childBlocks_[i]);
    //   }
    // }
  }

  setBlockUnmove(block: ScratchBlocks) {
    block.setMovable(false);
    if (block.childBlocks_) {
      for (let i = 0; i <= block.childBlocks_.length - 1; i++) {
        this.setBlockUnmove(block.childBlocks_[i]);
      }
    }
  }

  getBlockGhostFromIds = (ids: Array<string>) => {
    ids.forEach(id => {
      const block = this.workspace.getBlockById(id);
      if (block) {
        this.blocksGhost[id] = block;
      }
    });
  };

  handleWorkspaceChange = (event: any) => {
    const { mode } = this.state;
    if (!(event instanceof ScratchBlocks.Events.Ui) && mode === 0) {
      // Something changed. Parser needs to be reloaded.
      this.generateCodeAndLoadIntoInterpreter();
    }

    if (event.type === ScratchBlocks.Events.FINISHED_LOADING) {
      // Start tracking user drag drop block
      this.allowTrackingDragBlock = true;
    }

    if (this.allowTrackingDragBlock) {
      if (event.type === ScratchBlocks.Events.BLOCK_CREATE) {
        this.selectedBlock = this.workspace.getBlockById(event.blockId);
        if (this.selectedBlock) {
          for (let id in this.blocksGhost) {
            if (
              this.selectedBlock.type === this.blocksGhost[id].type.slice(0, -6) // remove '_ghost'
            ) {
              this.workspace.highlightBlock(id, true);
              return;
            }
          }
        }
      }

      if (event.type === ScratchBlocks.Events.END_DRAG) {
        if (this.selectedBlock) {
          for (let id in this.blocksGhost) {
            if (
              this.selectedBlock.type === this.blocksGhost[id].type.slice(0, -6) // remove '_ghost'
            ) {
              this.blocksGhost[id].setDisabled(false);
              this.blocksGhost[id].setHighlightBlock(false);
              delete this.blocksGhost[id];
              this.selectedBlock.dispose();
              return;
            }
          }
        }
      }
    }
  };

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

  executeGhostBlock = () => {
    // set block ghost unmoveable
    const blockGhost = this.workspace.getBlockById('F6ohp%h4z.XvtIe5]BP6');
    this.setBlocksGhostFromIds(blockGhostIds);
    this.getBlockGhostFromIds(blockGhostIds);
    this.setBlockUnmove(blockGhost);
  };

  highlightExplainedBlock = () => {
    let block = this.workspace.getBlockById('~zb^0y`c*~O03d_Sz9jv');
    block.setHighlightBlock(true);
    block = this.workspace.getBlockById('63Nwi+q,%eBt:AkF;yj`');
    block.setHighlightBlock(true);
    block = this.workspace.getBlockById('H4,.6mhN0dF2:b8$-}x_');
    block.setHighlightBlock(true);
    block = this.workspace.getBlockById('}/)7?@,bS20YQ3+2Qv=3');
    block.setHighlightBlock(true);
  };

  executeMode = (mode: number) => {
    switch (mode) {
      case 0:
        break;
      case 1:
        this.highlightExplainedBlock();
        break;
      case 2:
        this.showCorrect();
        break;
      case 3:
        this.showComment();
        break;
      case 4:
        this.executeGhostBlock();
        break;
      case 5:
        this.highlightParam();
        break;
      default:
        break;
    }
  };

  resetStepUi = (clearOutput: boolean) => {
    this.workspace.highlightBlock(null);
    this.highlightPause = false;

    if (clearOutput) {
      console.info('Program output:\n=================');
    }
  };

  generateCodeAndLoadIntoInterpreter = () => {
    ScratchBlocks.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    ScratchBlocks.JavaScript.addReservedWords('highlightBlock');
    this.latestCode = ScratchBlocks.JavaScript.workspaceToCode(this.workspace);
    this.resetStepUi(true);
  };

  highlightBlock = (id: string) => {
    this.workspace.highlightBlock(id);
    this.highlightPause = true;
  };

  initApi = (interpreter: Interpreter, scope: any) => {
    // Add an API function for the alert() block, generated for "text_print" blocks.
    interpreter.setProperty(
      scope,
      'alert',
      interpreter.createNativeFunction(function(text: string) {
        text = text ? text.toString() : '';
        // outputArea.value += '\n' + text;
        console.info(text);
      })
    );

    let wrapper = null;

    // Add an API function for the prompt() block.
    wrapper = text => {
      text = text ? text.toString() : '';
      return interpreter.createPrimitive(prompt(text));
    };
    interpreter.setProperty(
      scope,
      'prompt',
      interpreter.createNativeFunction(wrapper)
    );

    // Add an API function for highlighting blocks.
    wrapper = id => {
      id = id ? id.toString() : '';
      return interpreter.createPrimitive(this.highlightBlock(id));
    };
    interpreter.setProperty(
      scope,
      'highlightBlock',
      interpreter.createNativeFunction(wrapper)
    );
  };

  stepCode = () => {
    if (!this.myInterpreter) {
      // First statement of this code.
      // Clear the program output.
      this.resetStepUi(true);
      this.myInterpreter = new Interpreter(this.latestCode, this.initApi);

      // And then show generated code in an alert.
      // In a timeout to allow the outputArea.value to reset first.
      setTimeout(() => {
        console.info(
          'Ready to execute the following code\n' +
            '===================================\n' +
            this.latestCode
        );
        this.highlightPause = true;
        this.stepCode();
      }, 1);
      return;
    }
    this.highlightPause = false;
    do {
      try {
        var hasMoreCode = this.myInterpreter.step();
      } finally {
        if (!hasMoreCode) {
          // Program complete, no more code to execute.
          // outputArea.value += '\n\n<< Program complete >>';

          this.myInterpreter = null;
          this.resetStepUi(false);

          // Cool down, to discourage accidentally restarting the program.
          // stepButton.disabled = 'disabled';
          setTimeout(function() {
            // stepButton.disabled = '';
          }, 2000);

          // return;
        }
      }
      // Keep executing until a highlight statement is reached,
      // or the code completes or errors.
    } while (hasMoreCode && !this.highlightPause);
  };

  showCorrect = () => {
    const block = this.workspace.getBlockById('63Nwi+q,%eBt:AkF;yj`');
    block.setCommentText(
      '\u2705 プログラムを2秒止める',
      null,
      null,
      null,
      true,
      true
    );
  };

  showComment = () => {
    const block = this.workspace.getBlockById('}/)7?@,bS20YQ3+2Qv=3');
    block.setCommentText('プログラムを2秒止める', null, null, null, true, true);
  };

  highlightParam = () => {
    const block = this.workspace.getBlockById('3_~4nH}]!e`Bx6Z7tuA{');
    block.setInputHighlight(true);
  };

  render() {
    const { prompt, mode } = this.state;
    const isOpenPrompt = prompt ? prompt.optVarType !== 'led' : false;
    const isOpenLEDPrompt = prompt ? prompt.optVarType === 'led' : false;

    return (
      <React.Fragment>
        <div
          className="scratch-canvas"
          ref={r => {
            this.blockDiv = r;
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <button
            className="btn btn-primary btn-sm mb-2"
            onClick={() => this.changeMode(0)}
          >
            #0 Highlight Executed Block
          </button>
          {mode === 0 && (
            <button
              className="btn btn-outline-primary btn-sm mb-2"
              onClick={this.stepCode}
            >
              Step code
            </button>
          )}
          <button
            className="btn btn-primary btn-sm mb-2"
            onClick={() => this.changeMode(1)}
          >
            #1 Highlight Explained Block
          </button>
          <button
            className="btn btn-primary btn-sm mb-2"
            onClick={() => this.changeMode(2)}
          >
            #2 Balloon Correct
          </button>
          <button
            className="btn btn-primary btn-sm mb-2"
            onClick={() => this.changeMode(3)}
          >
            #3 Balloon Comment
          </button>
          <button
            className="btn btn-primary btn-sm mb-2"
            onClick={() => this.changeMode(4)}
          >
            #4 Ghost Block
          </button>
          <button
            className="btn btn-primary btn-sm mb-2"
            onClick={() => this.changeMode(5)}
          >
            #5 Highlight Param
          </button>
        </div>
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

export default OverlayNavigation;

const defaultWS =
  '<xml><variables><variable type="" id="Rhe~6+]t$qPa)lLga?2!" islocal="false" iscloud="false">a</variable></variables><block type="when_green_flag_clicked_ghost" id="F6ohp%h4z.XvtIe5]BP6" x="285" y="135"><next><block type="set_variable_to_ghost" id="GPD)IE,:%I)G/hs2/Z40"><field name="NAME" id="Rhe~6+]t$qPa)lLga?2!" variabletype="">a</field><value name="VALUE"><shadow type="math_number" id="_YZw+{`,ZWWU0sjizu01"><field name="NUM">10</field></shadow></value><next><block type="set_dcmotor_power_ghost" id="Efv/#(G-2!77bYN=P.B^"><field name="PORT">V0</field><value name="POWER"><shadow type="math_number" id="I5pXY(Jk+=Nw?yb-_hCQ"><field name="NUM">10</field></shadow></value><next><block type="forever_ghost" id="H]mtfu/|xwWMB9f7U#9N"><statement name="BLOCKS"><block type="set_dcmotor_power_ghost" id="63Nwi+q,%eBt:AkF;yj`"><field name="PORT">V0</field><value name="POWER"><shadow type="math_number" id="{Kw8@Co)Y4nOEzc^#@#4"><field name="NUM">5</field></shadow></value><next><block type="wait_ghost" id="~zb^0y`c*~O03d_Sz9jv"><value name="SECS"><shadow type="math_positive_number" id="3_~4nH}]!e`Bx6Z7tuA{"><field name="NUM">2</field></shadow></value><next><block type="set_dcmotor_power_ghost" id="H4,.6mhN0dF2:b8$-}x_"><field name="PORT">V0</field><value name="POWER"><shadow type="math_number" id="I!-]2!91oQQAE/j4:DRf"><field name="NUM">5</field></shadow></value><next><block type="wait_ghost" id="}/)7?@,bS20YQ3+2Qv=3"><value name="SECS"><shadow type="math_positive_number" id="x?eP{Trkijqf^O|HUnho"><field name="NUM">2</field></shadow></value></block></next></block></next></block></next></block></statement></block></next></block></next></block></next></block></xml>';

// expected data return from QDL
const blockGhostIds = [
  '~zb^0y`c*~O03d_Sz9jv',
  'H4,.6mhN0dF2:b8$-}x_',
  '}/)7?@,bS20YQ3+2Qv=3',
];
