import ScratchBlocks from 'scratch-blocks';

// Blocks definition

const COLOUR = '#2cc3ea';
const PATH_TO_MEDIA = 'http://koov_scratch_gui.surge.sh/media/';

ScratchBlocks.Blocks['when_green_flag_clicked'] = {
  init: function() {
    this.jsonInit({
      enableContextMenu: false,
      message0: '%1',
      args0: [
        {
          type: 'field_label',
          text: 'Start'
        }
      ],
      nextStatement: null,
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['function'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 %2',
      args0: [
        {
          type: 'field_label',
          text: 'function'
        },
        {
          type: 'field_input',
          name: 'FUNCTION',
          text: ''
        }
      ],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'BLOCKS' }],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['wait'] = {
  init: function() {
    this.jsonInit({
      message0: 'wait %1 secs',
      args0: [
        {
          type: 'input_value',
          name: 'SECS'
        }
      ],
      extensions: ['shape_statement'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['forever'] = {
  init: function() {
    this.jsonInit({
      message0: 'forever',
      message1: '%1', // Statement
      message2: '%1', // Icon
      lastDummyAlign2: 'RIGHT',
      args1: [
        {
          type: 'input_statement',
          name: 'BLOCKS'
        }
      ],
      args2: [
        {
          type: 'field_image',
          src: PATH_TO_MEDIA + 'repeat.svg',
          width: 24,
          height: 24,
          alt: '*',
          flip_rtl: true
        }
      ],
      extensions: ['shape_end'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['repeat'] = {
  init: function() {
    this.jsonInit({
      message0: 'repeat %1',
      message1: '%1', // Statement
      message2: '%1', // Icon
      lastDummyAlign2: 'RIGHT',
      args0: [
        {
          type: 'input_value',
          name: 'COUNT'
        }
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'BLOCKS'
        }
      ],
      args2: [
        {
          type: 'field_image',
          src: PATH_TO_MEDIA + 'repeat.svg',
          width: 24,
          height: 24,
          alt: '*',
          flip_rtl: true
        }
      ],
      extensions: ['shape_statement'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['if_then'] = {
  init: function() {
    this.jsonInit({
      type: 'control_if',
      message0: 'if %1 then',
      message1: '%1', // Statement
      args0: [
        {
          type: 'input_value',
          name: 'CONDITION',
          check: 'Boolean'
        }
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'BLOCKS'
        }
      ],
      extensions: ['shape_statement'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['if_then_else'] = {
  /**
   * Block for if-else.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      type: 'control_if_else',
      message0: 'if %1 then',
      message1: '%1',
      message2: 'else',
      message3: '%1',
      args0: [
        {
          type: 'input_value',
          name: 'CONDITION',
          check: 'Boolean'
        }
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'THEN_BLOCKS'
        }
      ],
      args3: [
        {
          type: 'input_statement',
          name: 'ELSE_BLOCKS'
        }
      ],
      extensions: ['shape_statement'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['wait_until'] = {
  init: function() {
    this.jsonInit({
      message0: 'wait until %1',
      args0: [
        {
          type: 'input_value',
          name: 'CONDITION',
          check: 'Boolean'
        }
      ],
      extensions: ['shape_statement'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['repeat_until'] = {
  init: function() {
    this.jsonInit({
      message0: 'repeat until %1',
      message1: '%1',
      message2: '%1',
      lastDummyAlign2: 'RIGHT',
      args0: [
        {
          type: 'input_value',
          name: 'CONDITION',
          check: 'Boolean'
        }
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'BLOCKS'
        }
      ],
      args2: [
        {
          type: 'field_image',
          src: PATH_TO_MEDIA + 'repeat.svg',
          width: 24,
          height: 24,
          alt: '*',
          flip_rtl: true
        }
      ],
      extensions: ['shape_statement'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['breakpoint'] = {
  init: function() {
    this.jsonInit({
      message0: '%1',
      args0: [
        {
          type: 'field_label',
          text: 'breakpoint'
        }
      ],
      extensions: ['shape_statement'],
      colour: COLOUR
    });
  }
};

// export const control_blocks = {
//   when_green_flag_clicked: {
//     enableContextMenu: false,
//     message0: '%1',
//     args0: [
//       {
//         type: 'field_label',
//         text: 'Start',
//         class: 'event-blocks-text'
//       }
//     ],
//     nextStatement: null,
//     colour: COLOUR
//   },
//   // wait: {
//   //   enableContextMenu: false,
//   //   message0: 'wait %1 secs',
//   //   args0: [
//   //     {
//   //       type: 'field_number',
//   //       name: 'secs',
//   //       check: 'Number',
//   //       value: '3'
//   //     }
//   //   ],
//   //   previousStatement: null,
//   //   nextStatement: null,
//   //   colour: COLOUR
//   // },
//   control_wait: {
//     id: 'control_wait',
//     message0: 'wait %1 secs',
//     args0: [
//       {
//         type: 'input_value',
//         name: 'DURATION'
//       }
//     ],
//     extensions: ['shape_statement'],
//     colour: COLOUR
//   },
//   control_wait_until: {
//     message0: 'wait until %1',
//     args0: [
//       {
//         type: 'input_value',
//         name: 'CONDITION',
//         check: 'Boolean'
//       }
//     ],
//     extensions: ['shape_statement'],
//     colour: COLOUR
//   },
//   function: {
//     enableContextMenu: false,
//     message0: '%1 %2',
//     args0: [
//       {
//         type: 'field_label',
//         text: 'function'
//       },
//       {
//         type: 'field_input',
//         name: 'function',
//         text: 'name'
//       }
//     ],
//     nextStatement: null,
//     colour: COLOUR
//   },
//   forever: {
//     id: 'control_forever',
//     message0: 'forever',
//     message1: '%1', // Statement
//     message2: '%1', // Icon
//     lastDummyAlign2: 'RIGHT',
//     args1: [
//       {
//         type: 'input_statement',
//         name: 'SUBSTACK'
//       }
//     ],
//     args2: [
//       {
//         type: 'field_image',
//         src: 'http://koov_scratch_gui.surge.sh/media/icons/control_repeat.svg',
//         width: 24,
//         height: 24,
//         alt: '*',
//         flip_rtl: true
//       }
//     ],
//     extensions: ['shape_end'],
//     colour: COLOUR
//   },
//   repeat: {
//     id: 'control_repeat',
//     message0: 'repeat %1',
//     message1: '%1', // Statement
//     message2: '%1', // Icon
//     lastDummyAlign2: 'RIGHT',
//     args0: [
//       {
//         type: 'input_value',
//         name: 'TIMES'
//       }
//     ],
//     args1: [
//       {
//         type: 'input_statement',
//         name: 'SUBSTACK'
//       }
//     ],
//     args2: [
//       {
//         type: 'field_image',
//         src: 'http://koov_scratch_gui.surge.sh/media/icons/control_repeat.svg',
//         width: 24,
//         height: 24,
//         alt: '*',
//         flip_rtl: true
//       }
//     ],
//     extensions: ['shape_statement'],
//     colour: COLOUR
//   },
//   control_if: {
//     type: 'control_if',
//     message0: 'if %1 then',
//     message1: '%1', // Statement
//     args0: [
//       {
//         type: 'input_value',
//         name: 'CONDITION',
//         check: 'Boolean'
//       }
//     ],
//     args1: [
//       {
//         type: 'input_statement',
//         name: 'SUBSTACK'
//       }
//     ],
//     extensions: ['shape_statement'],
//     colour: COLOUR
//   },
//   control_if_else: {
//     type: 'control_if_else',
//     message0: 'if %1 then',
//     message1: '%1',
//     message2: 'else',
//     message3: '%1',
//     args0: [
//       {
//         type: 'input_value',
//         name: 'CONDITION',
//         check: 'Boolean'
//       }
//     ],
//     args1: [
//       {
//         type: 'input_statement',
//         name: 'SUBSTACK'
//       }
//     ],
//     args3: [
//       {
//         type: 'input_statement',
//         name: 'SUBSTACK2'
//       }
//     ],
//     extensions: ['shape_statement'],
//     colour: COLOUR
//   },
//   control_repeat_util: {
//     message0: 'repeat until %1',
//     message1: '%1',
//     message2: '%1',
//     lastDummyAlign2: 'RIGHT',
//     args0: [
//       {
//         type: 'input_value',
//         name: 'CONDITION',
//         check: 'Boolean'
//       }
//     ],
//     args1: [
//       {
//         type: 'input_statement',
//         name: 'SUBSTACK'
//       }
//     ],
//     args2: [
//       {
//         type: 'field_image',
//         src: 'http://koov_scratch_gui.surge.sh/media/icons/control_repeat.svg',
//         width: 24,
//         height: 24,
//         alt: '*',
//         flip_rtl: true
//       }
//     ],
//     extensions: ['shape_statement'],
//     colour: COLOUR
//   }
// };
