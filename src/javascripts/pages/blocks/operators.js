import ScratchBlocks from 'scratch-blocks';

// Blocks definition
const COLOUR = '#427ce2';

ScratchBlocks.Blocks['plus'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      message0: '%1 + %2',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        },
        {
          type: 'input_value',
          name: 'Y'
        }
      ],
      extensions: ['output_number'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['minus'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 - %2',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        },
        {
          type: 'input_value',
          name: 'Y'
        }
      ],
      extensions: ['output_number'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['multiply'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 * %2',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        },
        {
          type: 'input_value',
          name: 'Y'
        }
      ],
      extensions: ['output_number'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['divide'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 / %2',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        },
        {
          type: 'input_value',
          name: 'Y'
        }
      ],
      extensions: ['output_number'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['pick_random'] = {
  init: function() {
    this.jsonInit({
      message0: 'pick random %1 to %2',
      args0: [
        {
          type: 'input_value',
          name: 'FROM'
        },
        {
          type: 'input_value',
          name: 'TO'
        }
      ],
      extensions: ['output_number'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['less_than'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 < %2',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        },
        {
          type: 'input_value',
          name: 'Y'
        }
      ],
      extensions: ['output_boolean'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['less_than_or_equal'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 <= %2',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        },
        {
          type: 'input_value',
          name: 'Y'
        }
      ],
      extensions: ['output_boolean'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['equal'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 = %2',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        },
        {
          type: 'input_value',
          name: 'Y'
        }
      ],
      extensions: ['output_boolean'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['greater_than'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 > %2',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        },
        {
          type: 'input_value',
          name: 'Y'
        }
      ],
      extensions: ['output_boolean'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['greater_than_or_equal'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 >= %2',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        },
        {
          type: 'input_value',
          name: 'Y'
        }
      ],
      extensions: ['output_boolean'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['and'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 and %2',
      args0: [
        {
          type: 'input_value',
          name: 'X',
          check: 'Boolean'
        },
        {
          type: 'input_value',
          name: 'Y',
          check: 'Boolean'
        }
      ],
      extensions: ['output_boolean'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['or'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 or %2',
      args0: [
        {
          type: 'input_value',
          name: 'X',
          check: 'Boolean'
        },
        {
          type: 'input_value',
          name: 'Y',
          check: 'Boolean'
        }
      ],
      extensions: ['output_boolean'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['not'] = {
  init: function() {
    this.jsonInit({
      message0: 'not %1',
      args0: [
        {
          type: 'input_value',
          name: 'X',
          check: 'Boolean'
        }
      ],
      extensions: ['output_boolean'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['mod'] = {
  init: function() {
    this.jsonInit({
      message0: '%1 mod %2',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        },
        {
          type: 'input_value',
          name: 'Y'
        }
      ],
      extensions: ['output_number'],
      colour: COLOUR
    });
  }
};

ScratchBlocks.Blocks['round'] = {
  init: function() {
    this.jsonInit({
      message0: 'round %1',
      args0: [
        {
          type: 'input_value',
          name: 'X'
        }
      ],
      extensions: ['output_number'],
      colour: COLOUR
    });
  }
};
