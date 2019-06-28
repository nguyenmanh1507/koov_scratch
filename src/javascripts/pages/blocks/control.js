

// Blocks definition
export const control_blocks = {
  "when-green-flag-clicked": {
    enableContextMenu: false,
    message0: '%1',
    args0: [
      {
        type: 'field_label',
        text: 'Start',
        class: 'event-blocks-text',
      },
    ],
    nextStatement: null,
    colour: "#61bcdb"
  },

  "wait": {
    enableContextMenu: false,
    message0: "wait %1 secs",
    args0: [
      {
        type: "field_number",
        name: "secs",
        check: "Number",
        value: "3"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#61bcdb",
  }
};

