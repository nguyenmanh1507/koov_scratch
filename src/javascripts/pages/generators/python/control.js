/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 */

export function control(ScratchBlocks) {
  ScratchBlocks.Python['math_number'] = (block) => {
    const n = block.getFieldValue('NUM');
    return [`${n}`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  ScratchBlocks.Python['math_positive_number'] = (block) => {
    const n = block.getFieldValue('NUM');
    return [`${n}`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  ScratchBlocks.Python['math_whole_number'] = (block) => {
    const n = block.getFieldValue('NUM');
    return [`${n}`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  /*
   * Operators
   */
  const binop_values = (block, op, order) => {
    const x = ScratchBlocks.Python.valueToCode(block, 'X', order);
    const y = ScratchBlocks.Python.valueToCode(block, 'Y', order);
    if (!x)
      throw new Error(`${op}: no first argument`);
    if (!y)
      throw new Error(`${op}: no second argument`);
    return { x, y };
  };

  ScratchBlocks.Python['plus'] = (block) => {
    const { x, y } = binop_values(
      block, 'plus', ScratchBlocks.Python.ORDER_ADDITIVE);
    return [`${x} + ${y}`, ScratchBlocks.Python.ORDER_ADDITIVE];
  };

  ScratchBlocks.Python['multiply'] = (block) => {
    const { x, y } = binop_values(
      block, 'multiply', ScratchBlocks.Python.ORDER_MULTIPLICATIVE);
    return [`${x} * ${y}`, ScratchBlocks.Python.ORDER_MULTIPLICATIVE];
  };

  /*
   * Statements
   */
  ScratchBlocks.Python['when_green_flag_clicked'] = (_block) => {
    return "";
  };

  ScratchBlocks.Python['wait'] = (block) => {
    const secs = ScratchBlocks.Python.valueToCode(
      block, 'SECS', ScratchBlocks.Python.ORDER_NONE);
    const op = 'wait';
    if (!secs)
      throw new Error(`${op}: no arguments`);
    return `time.sleep(${secs})\n`;
  };

  ScratchBlocks.Python['forever'] = (block) => {
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS');

    if (!stmts)
      return `while True:\n  pass`;
    return `while True:\n${stmts}`;
  };

  ScratchBlocks.Python['repeat'] = (block) => {
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS');
    const count = ScratchBlocks.Python.valueToCode(
      block, 'COUNT', ScratchBlocks.Python.ORDER_NONE);
    const op = 'repeat';
    if (!count)
      throw new Error(`${op}: no arguments`);

    if (!stmts)
      return `for _ in range(${count}):\n  pass`;
    return `for _ in range(${count}):\n${stmts}`;
  };
}
