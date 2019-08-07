/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 */

export function control(ScratchBlocks) {
  const pass = () => ScratchBlocks.Python.INDENT + 'pass\n';
  const use_module = (name) => {
    ScratchBlocks.Python.definitions_[`import ${name}`] = `import ${name}`;
  };
  const use_port = (port, type) => {
    const init = `${port} = koov.${type}(koov.${port})`;
    if (ScratchBlocks.Python.definitions_[`port ${port}`] &&
       ScratchBlocks.Python.definitions_[`port ${port}`] != init)
      throw new Error(`${port} is already used for ${init}`);
    ScratchBlocks.Python.definitions_[`port ${port}`] = init;
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

  ScratchBlocks.Python['math_angle'] = (block) => {
    const n = block.getFieldValue('NUM');
    return [`${n}`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  ScratchBlocks.Python['note'] = (block) => {
    const n = block.getFieldValue('NOTE');
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

  ScratchBlocks.Python['pick_random'] = (block) => {
    const x = ScratchBlocks.Python.valueToCode(
      block, 'FROM', ScratchBlocks.Python.ORDER_NONE);
    const y = ScratchBlocks.Python.valueToCode(
      block, 'TO', ScratchBlocks.Python.ORDER_NONE);
    const op = 'pick_random';
    if (!y)
      throw new Error(`${op}: no first argument`);
    if (!y)
      throw new Error(`${op}: no second argument`);
    const fn = (
      'lambda x, y: int(random.random() * (int(y) - int(x) + 1)) + int(x)'
    );
    use_module('random');
    return [`(${fn})(${x}, ${y})`, ScratchBlocks.Python.ORDER_FUNCTION_CALL];
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
  ScratchBlocks.Python['when_green_flag_clicked'] = (block) => {
    const tag = `def main`;
    ScratchBlocks.Python.setStartLine_(tag);
    ScratchBlocks.Python.addLineNumberDb_(block);
    ScratchBlocks.Python.adjustCurrentLine_(1);
    const code = ScratchBlocks.Python.prefixLines(
      ScratchBlocks.Python.blockToCode(
        block.getNextBlock()), ScratchBlocks.Python.INDENT);

    ScratchBlocks.Python.definitions_[tag] = `def main():\n${code}`;
    return null;
  };

  ScratchBlocks.Python['breakpoint'] = (_block) => {
    return "";
  };

  ScratchBlocks.Python['wait'] = (block) => {
    const secs = ScratchBlocks.Python.valueToCode(
      block, 'SECS', ScratchBlocks.Python.ORDER_NONE);
    const op = 'wait';
    if (!secs)
      throw new Error(`${op}: no arguments`);
    use_module('time');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `time.sleep(${secs})\n`;
  };

  ScratchBlocks.Python['forever'] = (block) => {
    ScratchBlocks.Python.adjustCurrentLine_(1);
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS') || pass();

    return `while True:\n${stmts}`;
  };

  ScratchBlocks.Python['repeat'] = (block) => {
    const count = ScratchBlocks.Python.valueToCode(
      block, 'COUNT', ScratchBlocks.Python.ORDER_NONE);
    ScratchBlocks.Python.adjustCurrentLine_(1);
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS') || pass();
    const op = 'repeat';
    if (!count)
      throw new Error(`${op}: no arguments`);

    return `for _ in range(${count}):\n${stmts}`;
  };

  ScratchBlocks.Python['repeat_until'] = (block) => {
    const cond = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_LOGICAL_NOT);
    ScratchBlocks.Python.adjustCurrentLine_(1);
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS') || pass();
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
    const fn = block.getFieldValue('FUNCTION');
    if (fn === 'main')
      throw new Error(`Function name 'main' is reserved`);
    const tag = `def ${fn}`;
    ScratchBlocks.Python.setStartLine_(tag);
    ScratchBlocks.Python.addLineNumberDb_(block);
    ScratchBlocks.Python.adjustCurrentLine_(1);
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS') || pass();
    const op = 'function';
    if (!fn)
      throw new Error(`${op}: no arguments`);

    ScratchBlocks.Python.definitions_[tag] = `def ${fn}():\n${stmts}`;
    return null;
  };

  ScratchBlocks.Python['call_function'] = (block) => {
    ScratchBlocks.Python.adjustCurrentLine_(1);
    const fn = block.getFieldValue('FUNCTION');
    const op = 'call_function';
    if (!fn)
      throw new Error(`${op}: no arguments`);

    return `${fn}()\n`;
  };

  ScratchBlocks.Python['if_then'] = (block) => {
    const condition = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_NONE);
    ScratchBlocks.Python.adjustCurrentLine_(1);
    const stmts = ScratchBlocks.Python.statementToCode(
      block, 'BLOCKS') || pass();
    const op = 'if_then';
    if (!condition)
      throw new Error(`${op}: no arguments`);

    return `if ${condition}:\n${stmts}`;
  };

  ScratchBlocks.Python['if_then_else'] = (block) => {
    const condition = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_NONE);
    ScratchBlocks.Python.adjustCurrentLine_(1);
    const then_blocks = ScratchBlocks.Python.statementToCode(
      block, 'THEN_BLOCKS') || pass();
    ScratchBlocks.Python.adjustCurrentLine_(1);
    const else_blocks = ScratchBlocks.Python.statementToCode(
      block, 'ELSE_BLOCKS') || pass();
    const op = 'if_then_else';
    if (!condition)
      throw new Error(`${op}: no arguments`);

    return `if ${condition}:\n${then_blocks}else:\n${else_blocks}`;
  };

  ScratchBlocks.Python['set_servomotor_degree'] = (block) => {
    const port = block.getFieldValue('PORT');
    const degree = ScratchBlocks.Python.valueToCode(
      block, 'DEGREE', ScratchBlocks.Python.ORDER_NONE);

    use_module('koov');
    use_port(port, 'servo_motor');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `${port}.set_degree(${degree})\n`;
  };

  ScratchBlocks.Python['set_dcmotor_power'] = (block) => {
    const port = block.getFieldValue('PORT');
    const power = ScratchBlocks.Python.valueToCode(
      block, 'POWER', ScratchBlocks.Python.ORDER_NONE);

    use_module('koov');
    use_port(port, 'dc_motor');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `${port}.set_power(${power})\n`;
  };

  ScratchBlocks.Python['turn_dcmotor_on'] = (block) => {
    const port = block.getFieldValue('PORT');
    const direction = block.getFieldValue('DIRECTION');

    if (!['NORMAL', 'REVERSE'].includes(direction))
      throw new Error(`turn_dcmotor_on: invalid direction: ${direction}`);

    use_module('koov');
    use_port(port, 'dc_motor');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `${port}.set_mode(koov.dc_motor.${direction})\n`;
  };

  ScratchBlocks.Python['turn_dcmotor_off'] = (block) => {
    const port = block.getFieldValue('PORT');
    const mode = block.getFieldValue('MODE');

    if (!['COAST', 'BRAKE'].includes(mode))
      throw new Error(`turn_dcmotor_off: invalid mode: ${mode}`);

    use_module('koov');
    use_port(port, 'dc_motor');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `${port}.set_mode(koov.dc_motor.${mode})\n`;
  };

  ScratchBlocks.Python['buzzer_on'] = (block) => {
    const port = block.getFieldValue('PORT');
    const frequency = ScratchBlocks.Python.valueToCode(
      block, 'FREQUENCY', ScratchBlocks.Python.ORDER_NONE);

    use_module('koov');
    use_port(port, 'buzzer');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `${port}.on(${frequency})\n`;
  };

  ScratchBlocks.Python['buzzer_off'] = (block) => {
    const port = block.getFieldValue('PORT');

    use_module('koov');
    use_port(port, 'buzzer');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `${port}.off()\n`;
  };
}
