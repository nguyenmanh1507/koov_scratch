// @flow
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
          text: 'Start',
        },
      ],
      nextStatement: null,
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['function'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 %2',
      args0: [
        {
          type: 'field_label',
          text: 'function',
        },
        {
          type: 'field_variable',
          name: 'FUNCTION',
          variableTypes: ['function'],
        },
      ],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'BLOCKS' }],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['call_function'] = {
  init: function() {
    this.jsonInit({
      message0: 'call function %1',
      args0: [
        {
          type: 'field_variable_getter',
          name: 'FUNCTION',
          variableType: 'function',
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['wait'] = {
  init: function() {
    this.jsonInit({
      message0: 'wait %1 secs',
      args0: [
        {
          type: 'input_value',
          name: 'SECS',
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
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
          name: 'BLOCKS',
        },
      ],
      args2: [
        {
          type: 'field_image',
          src: PATH_TO_MEDIA + 'repeat.svg',
          width: 24,
          height: 24,
          alt: '*',
          flip_rtl: true,
        },
      ],
      extensions: ['shape_end'],
      colour: COLOUR,
    });
  },
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
          name: 'COUNT',
        },
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'BLOCKS',
        },
      ],
      args2: [
        {
          type: 'field_image',
          src: PATH_TO_MEDIA + 'repeat.svg',
          width: 24,
          height: 24,
          alt: '*',
          flip_rtl: true,
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
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
          check: 'Boolean',
        },
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'BLOCKS',
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
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
          check: 'Boolean',
        },
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'THEN_BLOCKS',
        },
      ],
      args3: [
        {
          type: 'input_statement',
          name: 'ELSE_BLOCKS',
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['wait_until'] = {
  init: function() {
    this.jsonInit({
      message0: 'wait until %1',
      args0: [
        {
          type: 'input_value',
          name: 'CONDITION',
          check: 'Boolean',
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
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
          check: 'Boolean',
        },
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'BLOCKS',
        },
      ],
      args2: [
        {
          type: 'field_image',
          src: PATH_TO_MEDIA + 'repeat.svg',
          width: 24,
          height: 24,
          alt: '*',
          flip_rtl: true,
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['servomotor_synchronized_motion'] = {
  init: function() {
    this.jsonInit({
      message0: 'servo motor synchro motion (speed %1)',
      message1: '%1',
      message2: '%1',
      lastDummyAlign2: 'RIGHT',
      args0: [
        {
          type: 'input_value',
          name: 'SPEED',
          check: 'Boolean',
        },
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'BLOCKS',
        },
      ],
      args2: [
        {
          type: 'field_image',
          src: PATH_TO_MEDIA + 'repeat.svg',
          width: 24,
          height: 24,
          alt: '*',
          flip_rtl: true,
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['breakpoint'] = {
  init: function() {
    this.jsonInit({
      message0: '%1',
      args0: [
        {
          type: 'field_label',
          text: 'breakpoint',
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};
