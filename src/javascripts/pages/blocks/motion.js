const COLOUR = '#83ca32';

export const motion_blocks = {
  motion_movesteps_hello: {
    message0: 'move %1 steps',
    args0: [
      {
        type: 'input_value',
        name: 'STEPS'
      }
    ],
    extensions: ['shape_statement'],
    colour: COLOUR
  },
  motion_turnright: {
    message0: 'turn %1 %2 degrees',
    args0: [
      {
        type: 'field_image',
        src: 'http://koov_scratch_gui.surge.sh/media/icons/rotate-right.svg',
        width: 24,
        height: 24
      },
      {
        type: 'input_value',
        name: 'DEGREES'
      }
    ],
    extensions: ['shape_statement'],
    colour: COLOUR,
  }
};
