const COLOUR = '#f27f62';

export const variable_blocks = {
  variables_get: {
    type: 'variables_get',
    message0: '%1',
    args0: [
      {
        type: 'field_variable',
        name: 'VAR', // Static name of the field
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}' // Given at runtime
      }
    ],
    output: null,
    colour: COLOUR
  }
};
