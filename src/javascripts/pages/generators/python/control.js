/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 */

export function control(ScratchBlocks) {
  const pass = () => ScratchBlocks.Python.INDENT + 'pass';
  const use_module = (name) => {
    ScratchBlocks.Python.definitions_[`import ${name}`] = `import ${name}`;
  };

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

  const uniop_value = (block, op, order) => {
    const x = ScratchBlocks.Python.valueToCode(block, 'X', order);
    if (!x)
      throw new Error(`${op}: no arguments`);
    return x;
  };

  ScratchBlocks.Python['plus'] = (block) => {
    const { x, y } = binop_values(
      block, 'plus', ScratchBlocks.Python.ORDER_ADDITIVE);
    return [`${x} + ${y}`, ScratchBlocks.Python.ORDER_ADDITIVE];
  };

  ScratchBlocks.Python['minus'] = (block) => {
    const { x, y } = binop_values(
      block, 'minus', ScratchBlocks.Python.ORDER_ADDITIVE);
    return [`${x} - ${y}`, ScratchBlocks.Python.ORDER_ADDITIVE];
  };

  ScratchBlocks.Python['multiply'] = (block) => {
    const { x, y } = binop_values(
      block, 'multiply', ScratchBlocks.Python.ORDER_MULTIPLICATIVE);
    return [`${x} * ${y}`, ScratchBlocks.Python.ORDER_MULTIPLICATIVE];
  };

  ScratchBlocks.Python['divide'] = (block) => {
    const { x, y } = binop_values(
      block, 'divide', ScratchBlocks.Python.ORDER_MULTIPLICATIVE);
    return [`${x} / ${y}`, ScratchBlocks.Python.ORDER_MULTIPLICATIVE];
  };

  ScratchBlocks.Python['mod'] = (block) => {
    const { x, y } = binop_values(
      block, 'mod', ScratchBlocks.Python.ORDER_MULTIPLICATIVE);
    return [`${x} % ${y}`, ScratchBlocks.Python.ORDER_MULTIPLICATIVE];
  };

  ScratchBlocks.Python['less_than'] = (block) => {
    const { x, y } = binop_values(
      block, 'less_than', ScratchBlocks.Python.ORDER_RELATIONAL);
    return [`${x} < ${y}`, ScratchBlocks.Python.ORDER_RELATIONAL];
  };

  ScratchBlocks.Python['less_than_or_equal'] = (block) => {
    const { x, y } = binop_values(
      block, 'less_than_or_equal', ScratchBlocks.Python.ORDER_RELATIONAL);
    return [`${x} <= ${y}`, ScratchBlocks.Python.ORDER_RELATIONAL];
  };

  ScratchBlocks.Python['equal'] = (block) => {
    const { x, y } = binop_values(
      block, 'equal', ScratchBlocks.Python.ORDER_RELATIONAL);
    return [`${x} == ${y}`, ScratchBlocks.Python.ORDER_RELATIONAL];
  };

  ScratchBlocks.Python['greater_than'] = (block) => {
    const { x, y } = binop_values(
      block, 'greater_than', ScratchBlocks.Python.ORDER_RELATIONAL);
    return [`${x} > ${y}`, ScratchBlocks.Python.ORDER_RELATIONAL];
  };

  ScratchBlocks.Python['greater_than_or_equal'] = (block) => {
    const { x, y } = binop_values(
      block, 'greater_than_or_equal', ScratchBlocks.Python.ORDER_RELATIONAL);
    return [`${x} >= ${y}`, ScratchBlocks.Python.ORDER_RELATIONAL];
  };

  ScratchBlocks.Python['and'] = (block) => {
    const { x, y } = binop_values(
      block, 'and', ScratchBlocks.Python.ORDER_LOGICAL_AND);
    return [`${x} and ${y}`, ScratchBlocks.Python.ORDER_LOGICAL_AND];
  };

  ScratchBlocks.Python['or'] = (block) => {
    const { x, y } = binop_values(
      block, 'or', ScratchBlocks.Python.ORDER_LOGICAL_OR);
    return [`${x} or ${y}`, ScratchBlocks.Python.ORDER_LOGICAL_OR];
  };

  ScratchBlocks.Python['not'] = (block) => {
    const x = uniop_value(
      block, 'not', ScratchBlocks.Python.ORDER_LOGICAL_NOT);
    return [`not ${x}`, ScratchBlocks.Python.ORDER_LOGICAL_NOT];
  };

  ScratchBlocks.Python['round'] = (block) => {
    const x = uniop_value(block, 'round', ScratchBlocks.Python.ORDER_ATOMIC);
    return [`round(${x})`, ScratchBlocks.Python.ORDER_ATOMIC];
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
    use_module('time');
    return `time.sleep(${secs})\n`;
  };

  ScratchBlocks.Python['forever'] = (block) => {
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS') || pass();

    return `while True:\n${stmts}`;
  };

  ScratchBlocks.Python['repeat'] = (block) => {
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS') || pass();
    const count = ScratchBlocks.Python.valueToCode(
      block, 'COUNT', ScratchBlocks.Python.ORDER_NONE);
    const op = 'repeat';
    if (!count)
      throw new Error(`${op}: no arguments`);

    return `for _ in range(${count}):\n${stmts}`;
  };

  ScratchBlocks.Python['repeat_until'] = (block) => {
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS') || pass();
    const cond = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_LOGICAL_NOT);
    const op = 'repeat_until';
    if (!cond)
      throw new Error(`${op}: no arguments`);

    return `while not ${cond}:\n${stmts}`;
  };

  ScratchBlocks.Python['wait_until'] = (block) => {
    const stmts = '  time.sleep(0.01)';
    const cond = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_LOGICAL_NOT);
    const op = 'wait_until';
    if (!cond)
      throw new Error(`${op}: no arguments`);

    use_module('time');
    return `while not ${cond}:\n${stmts}`;
  };

  ScratchBlocks.Python['function'] = (block) => {
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS') || pass();
    const fn = block.getFieldValue('FUNCTION');
    const op = 'function';
    if (!fn)
      throw new Error(`${op}: no arguments`);

    return `def ${fn}():\n${stmts}`;
  };

  ScratchBlocks.Python['if_then'] = (block) => {
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS') || pass();
    const condition = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_NONE);
    const op = 'if_then';
    if (!condition)
      throw new Error(`${op}: no arguments`);

    return `if ${condition}:\n${stmts}`;
  };

  ScratchBlocks.Python['if_then_else'] = (block) => {
    const then_blocks = ScratchBlocks.Python.statementToCode(
      block, 'THEN_BLOCKS') || pass() + '\n';
    const else_blocks = ScratchBlocks.Python.statementToCode(
      block, 'ELSE_BLOCKS') || pass();
    const condition = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_NONE);
    const op = 'if_then_else';
    if (!condition)
      throw new Error(`${op}: no arguments`);

    return `if ${condition}:\n${then_blocks}else:\n${else_blocks}`;
  };
}
