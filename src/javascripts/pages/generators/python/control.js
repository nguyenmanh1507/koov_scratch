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
  const binop_values = (block, op, order, xname = 'X', yname = 'Y') => {
    const x = ScratchBlocks.Python.valueToCode(block, xname, order);
    const y = ScratchBlocks.Python.valueToCode(block, yname, order);
    if (!x)
      throw new Error(`${op}: no first argument`);
    if (!y)
      throw new Error(`${op}: no second argument`);
    return { x, y };
  };

  const uniop_value = (block, op, order) => {
    const x = ScratchBlocks.Python.valueToCode(block, 'X', order);
    if (!x)
      throw new Error(`${op}: No arguments`);
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
    const { x, y } = binop_values(
      block, 'pick_random', ScratchBlocks.Python.ORDER_NONE, 'FROM', 'TO');
    const fn = (
      'lambda x, y: int(random.random() * (int(y) - int(x) + 1)) + int(x)' );
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
    ScratchBlocks.Python.adjustCurrentLine_(1); // 'def main():'
    const code = ScratchBlocks.Python.prefixLines(
      ScratchBlocks.Python.blockToCode(block.getNextBlock()) || 'pass',
      ScratchBlocks.Python.INDENT);

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
      throw new Error(`${op}: No arguments`);
    use_module('time');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `time.sleep(${secs})\n`;
  };

  const statementToCode = (block, name = "BLOCKS") => {
    const stmts = ScratchBlocks.Python.statementToCode(block, name);

    if (stmts)
      return stmts;

    ScratchBlocks.Python.adjustCurrentLine_(1);
    return pass();
  };

  ScratchBlocks.Python['forever'] = (block) => {
    ScratchBlocks.Python.adjustCurrentLine_(1); // 'while True:'
    const stmts = statementToCode(block);

    return `while True:\n${stmts}`;
  };

  ScratchBlocks.Python['repeat'] = (block) => {
    const count = ScratchBlocks.Python.valueToCode(
      block, 'COUNT', ScratchBlocks.Python.ORDER_NONE);
    ScratchBlocks.Python.adjustCurrentLine_(1); // for _ in range():
    const stmts = statementToCode(block);
    const op = 'repeat';
    if (!count)
      throw new Error(`${op}: No arguments`);

    return `for _ in range(${count}):\n${stmts}`;
  };

  ScratchBlocks.Python['repeat_until'] = (block) => {
    const cond = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_LOGICAL_NOT);
    ScratchBlocks.Python.adjustCurrentLine_(1); // while not ...:
    const stmts = statementToCode(block);
    const op = 'repeat_until';
    if (!cond)
      throw new Error(`${op}: No arguments`);

    return `while not ${cond}:\n${stmts}`;
  };

  ScratchBlocks.Python['wait_until'] = (block) => {
    const stmts = '  time.sleep(0.01)';
    const cond = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_LOGICAL_NOT);
    const op = 'wait_until';
    if (!cond)
      throw new Error(`${op}: No arguments`);

    use_module('time');
    return `while not ${cond}:\n${stmts}`;
  };

  ScratchBlocks.Python['function'] = (block) => {
    const op = 'function';
    const fn = block.getField('FUNCTION').getText();
    if (!fn)
      throw new Error(`${op}: No arguments`);
    const symbol = ScratchBlocks.Python.internSymbol_('f_', fn);
    const tag = `def ${symbol}`;
    ScratchBlocks.Python.setStartLine_(tag);
    ScratchBlocks.Python.addLineNumberDb_(block);
    ScratchBlocks.Python.adjustCurrentLine_(1); // def ...():
    const stmts = statementToCode(block);

    ScratchBlocks.Python.definitions_[tag] = `def ${symbol}():\n${stmts}`;
    return null;
  };

  ScratchBlocks.Python['call_function'] = (block) => {
    const op = 'call_function';
    const fn = block.getField('FUNCTION').getText();
    if (!fn)
      throw new Error(`${op}: No arguments`);

    const symbol = ScratchBlocks.Python.internSymbol_('f_', fn);
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `${symbol}()\n`;
  };

  ScratchBlocks.Python['if_then'] = (block) => {
    const condition = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_NONE);
    ScratchBlocks.Python.adjustCurrentLine_(1); // if ...:
    const stmts = statementToCode(block);
    const op = 'if_then';
    if (!condition)
      throw new Error(`${op}: No arguments`);

    return `if ${condition}:\n${stmts}`;
  };

  ScratchBlocks.Python['if_then_else'] = (block) => {
    const condition = ScratchBlocks.Python.valueToCode(
      block, 'CONDITION', ScratchBlocks.Python.ORDER_NONE);
    ScratchBlocks.Python.adjustCurrentLine_(1); // if ...:
    const then_blocks = statementToCode(block, 'THEN_BLOCKS');
    ScratchBlocks.Python.adjustCurrentLine_(1); // else:
    const else_blocks = statementToCode(block, 'ELSE_BLOCKS');
    const op = 'if_then_else';
    if (!condition)
      throw new Error(`${op}: No arguments`);

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

  ScratchBlocks.Python['turn_led'] = (block) => {
    const port = block.getFieldValue('PORT');
    const mode = block.getFieldValue('MODE');

    use_module('koov');
    use_port(port, 'led');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    if (mode === 'ON')
      return `${port}.on()\n`;
    if (mode === 'OFF')
      return `${port}.off()\n`;
    throw new Error(`turn_led: Invalid mode: ${mode}`);
  };

  ScratchBlocks.Python['multi_led'] = (block) => {
    const port = 'RGB';
    const r = ScratchBlocks.Python.valueToCode(
      block, 'R', ScratchBlocks.Python.ORDER_NONE);
    const g = ScratchBlocks.Python.valueToCode(
      block, 'G', ScratchBlocks.Python.ORDER_NONE);
    const b = ScratchBlocks.Python.valueToCode(
      block, 'B', ScratchBlocks.Python.ORDER_NONE);

    use_module('koov');
    use_port(port, 'multi_led');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `${port}.on(${r}, ${g}, ${b})\n`;
  };

  /*
   * Sensors.
   */

  ScratchBlocks.Python['light_sensor_value'] = (block) => {
    const port = block.getFieldValue('PORT');

    use_module('koov');
    use_port(port, 'light_sensor');
    return [`${port}.value`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  ScratchBlocks.Python['sound_sensor_value'] = (block) => {
    const port = block.getFieldValue('PORT');

    use_module('koov');
    use_port(port, 'sound_sensor');
    return [`${port}.value`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  ScratchBlocks.Python['ir_photo_reflector_value'] = (block) => {
    const port = block.getFieldValue('PORT');

    use_module('koov');
    use_port(port, 'ir_photo_reflector');
    return [`${port}.value`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  ScratchBlocks.Python['ultrasonic_distance_sensor_value'] = (block) => {
    const port = block.getFieldValue('PORT');

    use_module('koov');
    use_port(port, 'ultrasonic_distance_sensor');
    return [`${port}.value`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  ScratchBlocks.Python['3_axis_digital_accelerometer_value'] = (block) => {
    const port = block.getFieldValue('PORT');
    const direction = block.getFieldValue('DIRECTION');

    use_module('koov');
    use_port(port, 'accelerometer');
    return [
      `${port}.${direction.toLowerCase()}`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  ScratchBlocks.Python['color_sensor_value'] = (block) => {
    const port = block.getFieldValue('PORT');
    const component = block.getFieldValue('COMPONENT');

    use_module('koov');
    use_port(port, 'color_sensor');
    return [
      `${port}.${component.toLowerCase()}`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  ScratchBlocks.Python['touch_sensor_value'] = (block) => {
    const op = 'touch_sensor_value';
    const port = block.getFieldValue('PORT');
    const mode = block.getFieldValue('MODE');

    use_module('koov');
    use_port(port, 'touch_sensor');
    if (mode === 'ON')
      return [`${port}.value == 0`, ScratchBlocks.Python.ORDER_RELATIONAL];
    if (mode === 'OFF')
      return [`${port}.value != 0`, ScratchBlocks.Python.ORDER_RELATIONAL];
    throw new Error(`${op}: Unknown mode: ${mode}`);
  };

  ScratchBlocks.Python['button_value'] = (block) => {
    const op = 'button_value';
    const port = block.getFieldValue('PORT');
    const mode = block.getFieldValue('MODE');

    use_module('koov');
    use_port(port, 'core_button');
    if (mode === 'ON')
      return [`${port}.value == 0`, ScratchBlocks.Python.ORDER_RELATIONAL];
    if (mode === 'OFF')
      return [`${port}.value != 0`, ScratchBlocks.Python.ORDER_RELATIONAL];
    throw new Error(`${op}: Unknown mode: ${mode}`);
  };

  ScratchBlocks.Python['timer'] = (_block) => {
    use_module('koov');
    return [`koov.timer()`, ScratchBlocks.Python.ORDER_ATOMIC];
  };

  ScratchBlocks.Python['reset_timer'] = (_block) => {
    use_module('koov');
    ScratchBlocks.Python.adjustCurrentLine_(1);
    return `koov.reset_timer()\n`;
  };
}
