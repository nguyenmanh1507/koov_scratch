
export function control(ScratchBlocks) {

  //let indexes = ['i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's'];

  ScratchBlocks.JavaScript['when_green_flag_clicked'] = function (_block) {
    return "start();\n";
  };


  ScratchBlocks.JavaScript['when_green_flag_clicked_ghost'] = function (_block) {
    return "\n";
  };

  ScratchBlocks.JavaScript['set_variable_to_ghost'] = function (_block) {
    return "var a = 10;\n";
  };

  ScratchBlocks.JavaScript['set_dcmotor_power_ghost'] = function (_block) {
    return "var dc = 10\n";
  };

  ScratchBlocks.JavaScript['set_dcmotor_power'] = function (_block) {
    return "var dc = 10\n";
  };

  ScratchBlocks.JavaScript['forever_ghost'] = function (_block) {
    return `
      for (var i = 0; i <= 10; i++) {
        dc = 5;
        dc = 5;
        dc = 5;
        dc = 5;
      }
    `;
  };

  ScratchBlocks.JavaScript['wait'] = function (block) {
    console.info(block);
    var secs = block.getInputTargetBlock('SECS');
    return `sleep(${secs});\n`;
  };

  /*
  ScratchBlocks.JavaScript['repeatblock'] = function (block) {

    ScratchBlocks.JavaScript.loopCounter = ScratchBlocks.JavaScript.loopCounter || 0;

    // If/elseif/else condition.
    var code = '', branchCode, conditionCode;

    var targetBlock = block.getInputTargetBlock('TIMES');
    console.info('targetBlock=', targetBlock);

    conditionCode = ScratchBlocks.JavaScript.valueToCode(block, 'TIMES',
      ScratchBlocks.JavaScript.ORDER_NONE) || '0';
    branchCode = ScratchBlocks.JavaScript.statementToCode(block, 'DO');
    code += `for ( let ${indexes[ScratchBlocks.JavaScript.loopCounter ]} = 0; ${indexes[ScratchBlocks.JavaScript.loopCounter ]} <= ` + conditionCode + `; ${indexes[ScratchBlocks.JavaScript.loopCounter ]}++) {\n` + branchCode + '}';
    ScratchBlocks.JavaScript.loopCounter++;

    return code + '\n';
  };
  */
}
