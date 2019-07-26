// @flow
import ScratchBlocks from 'scratch-blocks';

const COLOUR = '#20b583';

ScratchBlocks.Blocks['light_sensor_value'] = {
  init: function() {
    this.jsonInit({
      message0: 'light sensor %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['K2', 'K2'], ['K7', 'K7']],
        },
      ],
      extensions: ['output_number'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['sound_sensor_value'] = {
  init: function() {
    this.jsonInit({
      message0: 'sound sensor %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['K2', 'K2'], ['K7', 'K7']],
        },
      ],
      extensions: ['output_number'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['touch_sensor_value'] = {
  init: function() {
    this.jsonInit({
      message0: 'push switch %1 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['K2', 'K2'], ['K7', 'K7']],
        },
        {
          type: 'field_dropdown',
          name: 'MODE',
          options: [['ON', 'ON'], ['OFF', 'OFF']],
        },
      ],
      extensions: ['output_boolean'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['ir_photo_reflector_value'] = {
  init: function() {
    this.jsonInit({
      message0: 'IR photoreflector %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['K2', 'K2'], ['K7', 'K7']],
        },
      ],
      extensions: ['output_number'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['3_axis_digital_accelerometer_value'] = {
  init: function() {
    this.jsonInit({
      message0: 'accelerometer %1 to the %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['K2', 'K2'], ['K7', 'K7']],
        },
        {
          type: 'field_dropdown',
          name: 'DIRECTION',
          options: [['X', 'X'], ['Y', 'Y'], ['Z', 'Z']],
        },
      ],
      extensions: ['output_number'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['button_value'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 core button %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['A0', 'A0'], ['A3', 'A3']],
        },
        {
          type: 'field_dropdown',
          name: 'MODE',
          options: [['ON', 'ON'], ['OFF', 'OFF']],
        },
      ],
      extensions: ['output_boolean'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['reset_timer'] = {
  init: function() {
    this.jsonInit({
      message0: '%1',
      args0: [
        {
          type: 'field_label',
          text: 'reset timer',
        },
      ],
      extensions: ['shape_statement'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['timer'] = {
  init: function() {
    this.jsonInit({
      message0: '%1',
      args0: [
        {
          type: 'field_label',
          text: 'timer in seconds',
        },
      ],
      extensions: ['output_number'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['color_sensor_value'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 of color sensor %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['K2', 'K2'], ['K7', 'K7']],
        },
        {
          type: 'field_dropdown',
          name: 'COMPONENT',
          options: [['R', 'R'], ['G', 'G'], ['B', 'B']],
        },
      ],
      extensions: ['output_number'],
      colour: COLOUR,
    });
  },
};

ScratchBlocks.Blocks['ultrasonic_distance_sensor'] = {
  init: function() {
    this.jsonInit({
      message0: 'distance sensor %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PORT',
          options: [['K0', 'K0'], ['K1', 'K1']],
        },
      ],
      extensions: ['output_number'],
      colour: COLOUR,
    });
  },
};
