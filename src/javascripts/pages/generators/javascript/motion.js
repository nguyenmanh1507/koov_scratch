export function control(ScratchBlocks) {
  //let indexes = ['i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's'];

  console.info(ScratchBlocks);
  ScratchBlocks.JavaScript['when-green-flag-clicked'] = function(_block) {
    return 'start();\n';
  };

  ScratchBlocks.JavaScript['wait'] = function(block) {
    console.info(block);
    var secs = block.getFieldValue('secs');
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
