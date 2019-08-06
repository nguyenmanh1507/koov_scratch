// @flow
import ScratchBlocks from 'scratch-blocks';

const COLOUR = '#f27f62';

ScratchBlocks.Blocks['variable_ref'] = {
  init: function() {
    this.jsonInit({
      message0: 'variable %1',
      args0: [
        {
          type: 'field_variable',
          name: 'NAME',
          variable: 'x',
          // variableTypes: ['Number', 'String'],
          // defaultType: 'String',
        },
      ],
      extensions: ['output_number'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['set_variable_to'] = {
  init: function() {
    this.jsonInit({
      message0: 'set variable %1 to %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [['VAR', 'VAR']],
        },
        {
          type: 'input_value',
          name: 'VALUE',
          check: 'Number',
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['change_variable_by'] = {
  init: function() {
    this.jsonInit({
      message0: 'increase variable %1 by %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [['VAR', 'VAR']],
        },
        {
          type: 'input_value',
          name: 'VALUE',
          check: 'Number',
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['list_add'] = {
  init: function() {
    this.jsonInit({
      message0: 'add %1 to the list %2',
      args0: [
        {
          type: 'input_value',
          name: 'VALUE',
          check: 'Number',
        },
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [['VAR', 'VAR']],
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['list_delete'] = {
  init: function() {
    this.jsonInit({
      message0: 'delete %1 on list %2',
      args0: [
        {
          type: 'input_value',
          name: 'POSITION',
        },
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [['VAR', 'VAR']],
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['list_insert'] = {
  init: function() {
    this.jsonInit({
      message0: 'insert %1 for %2 on list %3',
      args0: [
        {
          type: 'input_value',
          name: 'VALUE',
          check: 'Number',
        },
        {
          type: 'input_value',
          name: 'POSITION',
          check: 'Number',
        },
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [['VAR', 'VAR']],
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['list_replace'] = {
  init: function() {
    this.jsonInit({
      message0: 'replace item %1 with %2 on list %3',
      args0: [
        {
          type: 'input_value',
          name: 'POSITION',
          check: 'Number',
        },
        {
          type: 'input_value',
          name: 'VALUE',
          check: 'Number',
        },
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [['VAR', 'VAR']],
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['list_ref'] = {
  init: function() {
    this.jsonInit({
      message0: 'item %1 on list %2',
      args0: [
        {
          type: 'input_value',
          name: 'VALUE',
          check: 'Number',
        },
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [['VAR', 'VAR']],
        },
      ],
      extensions: ['output_number'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['list_length'] = {
  init: function() {
    this.jsonInit({
      message0: 'length of list %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [['VAR', 'VAR']],
        },
      ],
      extensions: ['output_number'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['led_matrix'] = {
  init: function() {
    this.jsonInit({
      message0: 'show x%1, y%2 of %3 on multi color matrix %4',
      args0: [
        {
          type: 'input_value',
          name: 'X',
          // value: 0,
          // min: 0,
          // max: 100,
          // precision: 1,
        },
        {
          type: 'input_value',
          name: 'Y',
          // value: 0,
          // min: 0,
          // max: 100,
          // precision: 1,
        },
        {
          type: 'input_value',
          name: 'IMAGE',
          text: '',
        },
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [
            ['V2', 'V2'],
            ['V3', 'V3'],
            ['V4', 'V4'],
            ['V5', 'V5'],
            ['V6', 'V6'],
            ['V7', 'V7'],
            ['V8', 'V8'],
            ['V9', 'V9'],
          ],
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};
