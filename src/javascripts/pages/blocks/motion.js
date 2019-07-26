// @flow
import ScratchBlocks from 'scratch-blocks';

const COLOUR = '#83ca32';

ScratchBlocks.Blocks['set_servomotor_degree'] = {
  init: function() {
    this.jsonInit({
      message0: 'set servo motor %1 to %2 degrees',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [
            ['V2', 'V2'],
            ['V3', 'V3'],
            ['V4', 'V4'],
            ['V5', 'V5'],
            ['V9', 'V9'],
          ],
        },
        {
          type: 'field_angle',
          name: 'DEGREE',
          angle: 0,
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['set_dcmotor_power'] = {
  init: function() {
    this.jsonInit({
      message0: 'DC motor %1 speed %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['V0', 'V0'], ['V1', 'V1']],
        },
        {
          type: 'field_number',
          name: 'POWER',
          value: 0,
          min: 0,
          max: 100,
          precision: 1,
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['turn_dcmotor_on'] = {
  init: function() {
    this.jsonInit({
      message0: 'DC motor %1 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['V0', 'V0'], ['V1', 'V1']],
        },
        {
          type: 'field_dropdown',
          name: 'DIRECTION',
          options: [['NORMAL', 'NORMAL'], ['REVERSE', 'REVERSE']],
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['turn_dcmotor_off'] = {
  init: function() {
    this.jsonInit({
      message0: 'DC motor %1 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['V0', 'V0'], ['V1', 'V1']],
        },
        {
          type: 'field_dropdown',
          name: 'MODE',
          options: [['COAST', 'COAST'], ['BREAK', 'BREAK']],
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['buzzer_on'] = {
  init: function() {
    this.jsonInit({
      message0: 'buzzer %1 on frequency %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['V2', 'V2'], ['V9', 'V9']],
        },
        {
          type: 'field_dropdown',
          name: 'FREQUENCY',
          options: [['COAST', 'COAST'], ['BREAK', 'BREAK']],
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['buzzer_off'] = {
  init: function() {
    this.jsonInit({
      message0: 'buzzer %1 off',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['V2', 'V2'], ['V9', 'V9']],
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['turn_led'] = {
  init: function() {
    this.jsonInit({
      message0: 'LED %1 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['V2', 'V2'], ['V9', 'V9']],
        },
        {
          type: 'field_dropdown',
          name: 'MODE',
          options: [['ON', 'ON'], ['OFF', 'OFF']],
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['multi_led'] = {
  init: function() {
    this.jsonInit({
      message0: 'set multi LED R to %1 G to %2 B to %3',
      args0: [
        {
          type: 'field_number',
          name: 'R',
          value: 0,
          min: 0,
          max: 100,
          precision: 1,
        },
        {
          type: 'field_number',
          name: 'G',
          value: 0,
          min: 0,
          max: 100,
          precision: 1,
        },
        {
          type: 'field_number',
          name: 'B',
          value: 0,
          min: 0,
          max: 100,
          precision: 1,
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};
