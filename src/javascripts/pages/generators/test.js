/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 */
/* eslint-disable */

'use strict';

const xmlserializer = require('xmlserializer');
import { ScratchBlocks } from '../blocks/ScratchBlocks';

const merge = (a, b) => Object.assign({}, a, b);
const e = (tag) => (attrs, inner) => {
  if (!inner instanceof Array)
    inner = [ inner ]
  return { tag, attrs, inner };
};

const { xml, block, next, value, shadow, field, statement, variables } = [
  'xml', 'block', 'next', 'value', 'shadow', 'field', 'statement', 'variables'
].reduce((acc, x) => {
  acc[x] = e(x);
  return acc;
}, {});

const j2e = j => {
  if (typeof j === 'number' || typeof j == 'string')
    return document.createTextNode(String(j));

  const e = document.createElement(j.tag);
  Object.keys(j.attrs || {}).
    filter(k => j.attrs[k]).
    forEach(k => e.setAttribute(k, j.attrs[k]));
  (j.inner || []).forEach(j => e.appendChild(j2e(j)));
  return e;
};

const chain_blocks = (self, blks) => {
  const rec = (self, blks) => {
    if (blks.length === 0)
      return;
    if (self.inner.some(x => x.tag === 'next'))
      throw new Error(`block already chained: ${JSON.stringify(self)}`);
    self.inner.push(next({}, [ blks[0] ]));
    rec(blks[0], blks.slice(1));
  };
  rec(self, blks);
  return self;
};

let id = 0;

const Bblock = (attrs, inner) => {
  if (!attrs.hasOwnProperty('id'))
    attrs.id = `block${id++}`;
  return block(attrs, inner);
};

const Bshadow = (attrs, inner) => {
  if (!attrs.hasOwnProperty('id'))
    attrs.id = `block${id++}`;
  return shadow(attrs, inner);
};

const Bstart = (...blks) => (
  chain_blocks(
    Bblock({ type: "when_green_flag_clicked", x: 10, y: 10 }, []), blks));

const statements = (blks, name = "BLOCKS") => (
  blks.length === 0 ? [] : [
    statement({ name }, [
      chain_blocks(blks[0], blks.slice(1)) ])]);

const Bforever = (...blks) => (
  Bblock({ type: "forever" }, [ ...statements(blks) ]));

const Brepeat = (n, blks) => (
  Bblock({ type: "repeat" }, [
    value({ name: "COUNT" }, Bnumber(n, "math_whole_number")),
      ...statements(blks)]));

const Brepeat_until = (condition, blks) => (
  Bblock({ type: "repeat_until" }, [
    value({ name: "CONDITION" }, [ ...condition ]),
      ...statements(blks)]));

const Bwait_until = (condition) => (
  Bblock({ type: "wait_until" }, [
    value({ name: "CONDITION" }, [ ...condition ])]));

const Bfunction = (name, blks) => (
  Bblock({ type: "function", x: 10, y: 10 }, [
    field({ name: 'FUNCTION' }, [ ...name ]),
      ...statements(blks)]));

const Bcall_function = (name) => (
  Bblock({ type: "call_function", x: 10, y: 10 }, [
    field({ name: 'FUNCTION' }, [ ...name ])]));

const Bif_then = (condition, blks) => (
  Bblock({ type: "if_then" }, [
    value({ name: "CONDITION" }, [ ...condition ]),
      ...statements(blks)]));

const Bif_then_else = (condition, then_blks, else_blks) => (
  Bblock({ type: "if_then_else" }, [
    value({ name: "CONDITION" }, [ ...condition ]),
      ...statements(then_blks, "THEN_BLOCKS"),
      ...statements(else_blks, "ELSE_BLOCKS")]));

const Bnumber = (n, type, num = "NUM") => {
  const [ shadow_arg, block_arg ] = (() => {
    if (n === null)
      return [[], []];
    if (typeof n === 'number')
      return [[ n ], []];
    return [[ 0 ], [ n ]];
  })();

  return [
    Bshadow({ type: type }, [
      field({ name: num }, [...shadow_arg]) ]),
      ...block_arg ];
};

const Bwait = n => (
  Bblock({ type: "wait" }, [
    value({ name: "SECS" }, Bnumber(n, "math_positive_number")) ]));

const Bset_servomotor_degree = (port, degree) => (
  Bblock({ type: 'set_servomotor_degree' }, [
    field({ name: 'PORT' }, [ port ]),
    value({ name: 'DEGREE' }, Bnumber(degree, 'math_angle')) ]));

const Bset_dcmotor_power = (port, power) => (
  Bblock({ type: 'set_dcmotor_power' }, [
    field({ name: 'PORT' }, [ port ]),
    value({ name: 'POWER' }, Bnumber(power, 'math_number')) ]));

const Bturn_dcmotor_on = (port, direction) => (
  Bblock({ type: 'turn_dcmotor_on' }, [
    field({ name: 'PORT' }, [ port ]),
    field({ name: 'DIRECTION' }, [ direction ]) ]));

const Bturn_dcmotor_off = (port, mode) => (
  Bblock({ type: 'turn_dcmotor_off' }, [
    field({ name: 'PORT' }, [ port ]),
    field({ name: 'MODE' }, [ mode ]) ]));

const Bbuzzer_on = (port, frequency) => (
  Bblock({ type: 'buzzer_on' }, [
    field({ name: 'PORT' }, [ port ]),
    value({ name: 'FREQUENCY' }, Bnumber(frequency, 'note', 'NOTE')) ]));

const Bbuzzer_off = (port) => (
  Bblock({ type: 'buzzer_off' }, [
    field({ name: 'PORT' }, [ port ]) ]));

const Bturn_led = (port, mode) => (
  Bblock({ type: 'turn_led' }, [
    field({ name: 'PORT' }, [ port ]),
    field({ name: 'MODE' }, [ mode ]) ]));

const Bmulti_led = (r, g, b) => (
  Bblock({ type: 'multi_led' }, [
    value({ name: 'R' }, Bnumber(r, 'math_number')),
    value({ name: 'G' }, Bnumber(g, 'math_number')),
    value({ name: 'B' }, Bnumber(b, 'math_number')) ]));

const binop = (name, xname = "X", yname = "Y") => (x, y) => (
  Bblock({ type: name }, [
    value({ name: xname }, Bnumber(x, "math_number")),
    value({ name: yname }, Bnumber(y, "math_number")) ]));

const uniop = (name, xname = "X") => (x) => (
  Bblock({ type: name }, [
    value({ name: xname }, Bnumber(x, "math_number")) ]));

const Bplus = binop('plus');
const Bminus = binop('minus');;
const Bmultiply = binop('multiply');
const Bdivide = binop('divide');
const Bmod = binop('mod');
const Bpick_random = binop('pick_random', 'FROM', 'TO');
const Bless_than = binop('less_than');
const Bless_than_or_equal = binop('less_than_or_equal');
const Bequal = binop('equal');
const Bgreater_than = binop('greater_than');
const Bgreater_than_or_equal = binop('greater_than_or_equal');
const Band = binop('and');
const Bor = binop('or');
const Bnot = uniop('not');
const Bround = uniop('round');

const assert = (msg, e) => { if (!e) throw new Error(msg); return true; };

const sensor = (type, ...fields) => (...arg) => (
  assert(
    `Number of args ${arg.length} does not match with fields: ${fields}`,
    fields.length === arg.length) &&
    Bblock({ type, x: 10, y: 10 }, fields.map((_, idx) => (
      field({ name: fields[idx] }, [ ...arg[idx] ]) ))));

const Blight_sensor_value = sensor("light_sensor_value", "PORT");
const Bsound_sensor_value = sensor("sound_sensor_value", "PORT");
const Bir_photo_reflector_value = sensor("ir_photo_reflector_value", "PORT");
const B3_axis_digital_accelerometer_value = sensor(
  "3_axis_digital_accelerometer_value", "PORT", "DIRECTION");
const Bcolor_sensor_value = sensor("color_sensor_value", "PORT", "COMPONENT");
const Bultrasonic_distance_sensor = sensor(
  "ultrasonic_distance_sensor", "PORT");
const Btouch_sensor_value = sensor("touch_sensor_value", "PORT", "MODE");
const Bbutton_value = sensor("button_value", "PORT", "MODE");

test('wait notation (single)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block2', x: 10, y: 10 }, [
            next({}, [
              block({ type: "wait", id: 'block1' }, [
                value({ name: "SECS" }, [
                  shadow({ type: "math_positive_number", id: 'block0' }, [
                    field({ name: "NUM" }, [ 999 ]) ])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bwait(999))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('wait notation (double)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block4', x: 10, y: 10 }, [
            next({}, [
              block({ type: "wait", id: 'block1' }, [
                value({ name: "SECS" }, [
                  shadow({ type: "math_positive_number", id: 'block0' }, [
                    field({ name: "NUM" }, [ 1 ]) ])]),
                next({}, [
                  block({ type: "wait", id: 'block3' }, [
                    value({ name: "SECS" }, [
                      shadow({ type: "math_positive_number", id: 'block2' }, [
                        field({ name: "NUM" }, [ 2 ]) ])]) ])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bwait(1),
          Bwait(2))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));

    expect(() => {
      Bstart(
        block({ type: "wait", id: 'block1' }, [
          value({ name: "SECS" }, [
            shadow({ type: "math_positive_number", id: 'block0' }, [
              field({ name: "NUM" }, [ 1 ]) ])]),
          next({}, [
            block({ type: "wait", id: 'block3' }, [
              value({ name: "SECS" }, [
                shadow({ type: "math_positive_number", id: 'block2' }, [
                  field({ name: "NUM" }, [ 2 ]) ])]) ])])]),
        Bwait(3) )}).toThrow(/^block already chained: /);

  } finally {
    workspace.dispose();
  }
});

test('set_servomotor_degree (empty) notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block2', x: 10, y: 10 }, [
            next({}, [
              block({ type: "set_servomotor_degree", id: 'block1' }, [
                field({ name: "PORT" }, [ 'V2' ]),
                value({ name: "DEGREE" }, [
                  shadow({ type: "math_angle", id: 'block0' }, [
                    field({ name: "NUM" }, [ 0 ]) ])]) ])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bset_servomotor_degree('V2', 0))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('set_servomotor_degree (1 + 2) notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block5', x: 10, y: 10 }, [
            next({}, [
              block({ type: "set_servomotor_degree", id: 'block4' }, [
                field({ name: "PORT" }, [ 'V2' ]),
                value({ name: "DEGREE" }, [
                  shadow({ type: "math_angle", id: 'block3' }, [
                    field({ name: "NUM" }, [ 0 ]) ]),
                  block({ type: "plus", id: 'block2' }, [
                    value({ name: "X" }, [
                      shadow({ type: "math_number", id: 'block0' }, [
                        field({ name: "NUM" }, [ 1 ]) ])]),
                    value({ name: "Y" }, [
                      shadow({ type: "math_number", id: 'block1' }, [
                        field({ name: "NUM" }, [ 2 ]) ])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bset_servomotor_degree('V2', Bplus(1, 2)))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('set_dcmotor_power notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block2', x: 10, y: 10 }, [
            next({}, [
              block({ type: "set_dcmotor_power", id: 'block1' }, [
                field({ name: "PORT" }, [ 'V0' ]),
                value({ name: "POWER" }, [
                  shadow({ type: "math_number", id: 'block0' }, [
                    field({ name: "NUM" }, [ 0 ]) ])]) ])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bset_dcmotor_power('V0', 0))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('turn_dcmotor_on notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block1', x: 10, y: 10 }, [
            next({}, [
              block({ type: "turn_dcmotor_on", id: 'block0' }, [
                field({ name: "PORT" }, [ 'V0' ]),
                field({ name: "DIRECTION" }, [ 'NORMAL' ]) ])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bturn_dcmotor_on('V0', 'NORMAL'))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('turn_dcmotor_off notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block1', x: 10, y: 10 }, [
            next({}, [
              block({ type: "turn_dcmotor_off", id: 'block0' }, [
                field({ name: "PORT" }, [ 'V0' ]),
                field({ name: "MODE" }, [ 'COAST' ]) ])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bturn_dcmotor_off('V0', 'COAST'))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('buzzer_on (empty) notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block2', x: 10, y: 10 }, [
            next({}, [
              block({ type: "buzzer_on", id: 'block1' }, [
                field({ name: "PORT" }, [ 'V2' ]),
                value({ name: "FREQUENCY" }, [
                  shadow({ type: "note", id: 'block0' }, [
                    field({ name: "NOTE" }, [ 0 ]) ])]) ])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bbuzzer_on('V2', 0))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('buzzer_on (1 + 2) notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block5', x: 10, y: 10 }, [
            next({}, [
              block({ type: "buzzer_on", id: 'block4' }, [
                field({ name: "PORT" }, [ 'V2' ]),
                value({ name: "FREQUENCY" }, [
                  shadow({ type: "note", id: 'block3' }, [
                    field({ name: "NOTE" }, [ 0 ]) ]),
                  block({ type: "plus", id: 'block2' }, [
                    value({ name: "X" }, [
                      shadow({ type: "math_number", id: 'block0' }, [
                        field({ name: "NUM" }, [ 1 ]) ])]),
                    value({ name: "Y" }, [
                      shadow({ type: "math_number", id: 'block1' }, [
                        field({ name: "NUM" }, [ 2 ]) ])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bbuzzer_on('V2', Bplus(1, 2)))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('turn_led notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block1', x: 10, y: 10 }, [
            next({}, [
              block({ type: "turn_led", id: 'block0' }, [
                field({ name: "PORT" }, [ 'V2' ]),
                field({ name: "MODE" }, [ 'ON' ]) ])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bturn_led('V2', 'ON'))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('multi_led (1 + 2, 3 + 4, 5 + 6) notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block13', x: 10, y: 10 }, [
            next({}, [
              block({ type: "multi_led", id: 'block12' }, [
                value({ name: "R" }, [
                  shadow({ type: "math_number", id: 'block9' }, [
                    field({ name: "NUM" }, [ 0 ]) ]),
                  block({ type: "plus", id: 'block2' }, [
                    value({ name: "X" }, [
                      shadow({ type: "math_number", id: 'block0' }, [
                        field({ name: "NUM" }, [ 1 ]) ])]),
                    value({ name: "Y" }, [
                      shadow({ type: "math_number", id: 'block1' }, [
                        field({ name: "NUM" }, [ 2 ]) ])])])]),
                value({ name: "G" }, [
                  shadow({ type: "math_number", id: 'block10' }, [
                    field({ name: "NUM" }, [ 0 ]) ]),
                  block({ type: "plus", id: 'block5' }, [
                    value({ name: "X" }, [
                      shadow({ type: "math_number", id: 'block3' }, [
                        field({ name: "NUM" }, [ 3 ]) ])]),
                    value({ name: "Y" }, [
                      shadow({ type: "math_number", id: 'block4' }, [
                        field({ name: "NUM" }, [ 4 ]) ])])])]),
                value({ name: "B" }, [
                  shadow({ type: "math_number", id: 'block11' }, [
                    field({ name: "NUM" }, [ 0 ]) ]),
                  block({ type: "plus", id: 'block8' }, [
                    value({ name: "X" }, [
                      shadow({ type: "math_number", id: 'block6' }, [
                        field({ name: "NUM" }, [ 5 ]) ])]),
                    value({ name: "Y" }, [
                      shadow({ type: "math_number", id: 'block7' }, [
                        field({ name: "NUM" }, [ 6 ]) ])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bmulti_led(Bplus(1, 2), Bplus(3, 4), Bplus(5, 6)))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('forever notation (empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block1', x: 10, y: 10 }, [
            next({}, [
              block({ type: "forever", id: 'block0' }, [])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bforever())]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('forever notation (non empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block3', x: 10, y: 10 }, [
            next({}, [
              block({ type: "forever", id: 'block2' }, [
                statement({ name: "BLOCKS" }, [
                  block({ type: "wait", id: 'block1' }, [
                    value({ name: "SECS" }, [
                      shadow({ type: "math_positive_number", id: 'block0' }, [
                        field({ name: "NUM" }, [ 999 ]) ])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bforever(
            Bwait(999)))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('repeat notation (no count and empty blocks)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block2', x: 10, y: 10 }, [
            next({}, [
              block({ type: "repeat", id: 'block1' }, [
                value({ name: "COUNT" }, [
                  shadow({ type: "math_whole_number", id: 'block0' }, [
                    field({ name: "NUM" })])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Brepeat(null, []))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('repeat notation (count == 1 and empty blocks)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block2', x: 10, y: 10 }, [
            next({}, [
              block({ type: "repeat", id: 'block1' }, [
                value({ name: "COUNT" }, [
                  shadow({ type: "math_whole_number", id: 'block0' }, [
                    field({ name: "NUM" }, [1])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Brepeat(1, []))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('repeat notation (count == 1 and single block)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block4', x: 10, y: 10 }, [
            next({}, [
              block({ type: "repeat", id: 'block3' }, [
                value({ name: "COUNT" }, [
                  shadow({ type: "math_whole_number", id: 'block2' }, [
                    field({ name: "NUM" }, [1])])]),
                statement({ name: "BLOCKS" }, [
                  block({ type: "wait", id: 'block1' }, [
                    value({ name: "SECS" }, [
                      shadow({ type: "math_positive_number", id: 'block0' }, [
                        field({ name: "NUM" }, [ 2 ]) ])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Brepeat(1, [ Bwait(2) ]))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('repeat notation (count == 1 and two blocks)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block6', x: 10, y: 10 }, [
            next({}, [
              block({ type: "repeat", id: 'block5' }, [
                value({ name: "COUNT" }, [
                  shadow({ type: "math_whole_number", id: 'block4' }, [
                    field({ name: "NUM" }, [1])])]),
                statement({ name: "BLOCKS" }, [
                  block({ type: "wait", id: 'block1' }, [
                    value({ name: "SECS" }, [
                      shadow({ type: "math_positive_number", id: 'block0' }, [
                        field({ name: "NUM" }, [ 2 ]) ])]),
                    next({}, [
                      block({ type: "wait", id: 'block3' }, [
                        value({ name: "SECS" }, [
                          shadow({
                            type: "math_positive_number", id: 'block2' }, [
                              field({ name: "NUM" }, [ 3 ])
                            ])])])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Brepeat(1, [ Bwait(2), Bwait(3) ]))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('function notation (no name and empty blocks)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block0', x: 10, y: 10 }, []),
        block({ type: "function", id: 'block1', x: 10, y: 10 }, [
          field({ name: "FUNCTION" }, [])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(),
        Bfunction([], [])]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('function notation (name == "f" and empty blocks)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block0', x: 10, y: 10 }, []),
        block({ type: "function", id: 'block1', x: 10, y: 10 }, [
          field({ name: "FUNCTION" }, [ 'f' ])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(),
        Bfunction(['f'], [])]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('function notation (name == "f" and single block)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block0', x: 10, y: 10 }, []),
        block({
          type: "function", id: 'block3', x: 10, y: 10 }, [
            field({ name: "FUNCTION" }, [ 'f' ]),
            statement({ name: "BLOCKS" }, [
              block({ type: "wait", id: 'block2' }, [
                value({ name: "SECS" }, [
                  shadow({ type: "math_positive_number", id: 'block1' }, [
                    field({ name: "NUM" }, [ 2 ]) ])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(),
        Bfunction(['f'], [ Bwait(2) ])]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('function notation (name == "f" and two blocks)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block0', x: 10, y: 10 }, []),
        block({ type: "function", id: 'block5', x: 10, y: 10 }, [
          field({ name: "FUNCTION" }, [ 'f' ]),
          statement({ name: "BLOCKS" }, [
            block({ type: "wait", id: 'block2' }, [
              value({ name: "SECS" }, [
                shadow({ type: "math_positive_number", id: 'block1' }, [
                  field({ name: "NUM" }, [ 2 ]) ])]),
              next({}, [
                block({ type: "wait", id: 'block4' }, [
                  value({ name: "SECS" }, [
                    shadow({
                      type: "math_positive_number", id: 'block3' }, [
                        field({ name: "NUM" }, [ 3 ]) ])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(),
        Bfunction(['f'], [ Bwait(2), Bwait(3) ])]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('call_function notation (no name)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block0', x: 10, y: 10 }, []),
        block({ type: "call_function", id: 'block1', x: 10, y: 10 }, [
          field({ name: "FUNCTION" }, [ "NAME" ])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(),
        Bcall_function([ "NAME" ])]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('wait(1 + 2) notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block5', x: 10, y: 10 }, [
            next({}, [
              block({ type: "wait", id: 'block4' }, [
                value({ name: "SECS" }, [
                  shadow({ type: "math_positive_number", id: 'block3' }, [
                    field({ name: "NUM" }, [ 0 ]) ]),
                  block({ type: "plus", id: 'block2' }, [
                    value({ name: "X" }, [
                      shadow({ type: "math_number", id: 'block0' }, [
                        field({ name: "NUM" }, [ 1 ]) ]) ]),
                    value({ name: "Y" }, [
                      shadow({ type: "math_number", id: 'block1' }, [
                        field({ name: "NUM" }, [ 2 ]) ]) ])]) ])])])])]));

    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bwait(Bplus(1, 2)))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('when_green_flag_clicked notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "when_green_flag_clicked", id: 'block4', x: 10, y: 10 }, [
            next({}, [
              block({ type: "wait", id: 'block1' }, [
                value({ name: "SECS" }, [
                  shadow({ type: "math_positive_number", id: 'block0' }, [
                    field({ name: "NUM" }, [ 1 ]) ])]),
                next({}, [
                  block({ type: "wait", id: 'block3' }, [
                    value({ name: "SECS" }, [
                      shadow({ type: "math_positive_number", id: 'block2' }, [
                        field({ name: "NUM" }, [ 2 ]) ])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bwait(1),
          Bwait(2) )]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);
  } finally {
    workspace.dispose();
  }
});

test('light_sensor_value notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "light_sensor_value", id: 'block0', x: 10, y: 10 }, [
            field({ name: "PORT" }, [ "K2" ]) ])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        Blight_sensor_value([ "K2" ]) ]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);

    expect(() => { Blight_sensor_value(); }).toThrow(
      (/^Number of args 0 does not match with fields: PORT$/));
    expect(() => { Blight_sensor_value([], []); }).toThrow(
      (/^Number of args 2 does not match with fields: PORT$/));
  } finally {
    workspace.dispose();
  }
});

test('3_axis_digital_accelerometer_value notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block({
          type: "3_axis_digital_accelerometer_value",
          id: 'block0', x: 10, y: 10 }, [
            field({ name: "PORT" }, [ "K2" ]),
            field({ name: "DIRECTION" }, [ "X" ])])]));
    const dom2 = j2e(
      xml({}, [
        variables({}, []),
        B3_axis_digital_accelerometer_value([ "K2" ], [ "X" ]) ]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);

    const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    expect(dom2).toEqual(dom3);

    expect(() => { B3_axis_digital_accelerometer_value(); }).toThrow(
      (/^Number of args 0 does not match with fields: PORT,DIRECTION$/));
    expect(() => { B3_axis_digital_accelerometer_value([]); }).toThrow(
      (/^Number of args 1 does not match with fields: PORT,DIRECTION$/));
    expect(() => {
      B3_axis_digital_accelerometer_value([], [], []); }).toThrow(
        (/^Number of args 3 does not match with fields: PORT,DIRECTION$/));
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for when_green_flag_clicked is under construction.
 */

test('when_green_flag_clicked with empty blocks', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bstart() ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('def main():\n  pass\n');

    expect(true).toBe(true);
    expect(() => { throw new Error(3); }).toThrow();
  } finally {
    workspace.dispose();
  }
});


/*
 * Tests for + and *.
 */

test('1 + 2', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bplus(1, 2) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 + 2' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 + (2 + 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bplus(1, Bplus(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 + (2 + 3)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 + 2) + 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bplus(Bplus(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 + 2) + 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 + (2 * 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bplus(1, Bmultiply(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 + 2 * 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 * 2) + 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bplus(Bmultiply(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 * 2 + 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 + 2) * 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmultiply(Bplus(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 + 2) * 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 * (2 * 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmultiply(1, Bmultiply(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 * (2 * 3)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 * 2) * 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmultiply(Bmultiply(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 * 2) * 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for -, / and %.
 */

test('1 - 2', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bminus(1, 2) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 - 2' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 - (2 - 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bminus(1, Bminus(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 - (2 - 3)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 - 2) - 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bminus(Bminus(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 - 2) - 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 - (2 / 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bminus(1, Bdivide(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 - 2 / 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 / 2) - 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bminus(Bdivide(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 / 2 - 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 - 2) / 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bdivide(Bminus(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 - 2) / 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 / (2 / 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bdivide(1, Bdivide(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 / (2 / 3)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 / 2) / 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bdivide(Bdivide(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 / 2) / 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 - (2 % 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bminus(1, Bmod(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 - 2 % 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 % 2) - 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bminus(Bmod(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 % 2 - 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 - 2) % 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmod(Bminus(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 - 2) % 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 * (2 % 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmultiply(1, Bmod(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 * (2 % 3)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 % 2) * 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmultiply(Bmod(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 % 2) * 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 * 2) % 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmod(Bmultiply(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 * 2) % 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

/*
 * Mix of + and -, or, * and /.
 */

test('1 + (2 - 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bplus(1, Bminus(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 + (2 - 3)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 + 2) - 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bminus(Bplus(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 + 2) - 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 * (2 / 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmultiply(1, Bdivide(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 * (2 / 3)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 * 2) / 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bdivide(Bmultiply(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 * 2) / 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('round(1.5)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bround(1.5) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('round(1.5)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 + round(1.5)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bplus(1, Bround(1.5)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 + round(1.5)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('round(1.5) - 1', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bminus(Bround(1.5), 1) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('round(1.5) - 1' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 / (round(1.5) - 1)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bdivide(1, Bminus(Bround(1.5), 1)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 / (round(1.5) - 1)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 * (round(1.5) * 2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmultiply(1, Bmultiply(Bround(1.5), 2)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 * (round(1.5) * 2)' + "\n");
  } finally {
    workspace.dispose();
  }
});

/*
 * Test for pick_random().
 */

test('pick_random(1, 2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bpick_random(1, 2) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    const fn = (
      'lambda x, y: int(random.random() * (int(y) - int(x) + 1)) + int(x)'
    );
    expect(pcode).toBe(`\
import random\n\n\n\
(${fn})(1, 2)\
` + "\n");
  } finally {
    workspace.dispose();
  }
});

test('pick_random(1 + 2, 3 - 4)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bpick_random(Bplus(1, 2), Bminus(3, 4)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    const fn = (
      'lambda x, y: int(random.random() * (int(y) - int(x) + 1)) + int(x)'
    );
    expect(pcode).toBe(`\
import random\n\n\n\
(${fn})(1 + 2, 3 - 4)\
` + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 + pick_random(2, 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bplus(1, Bpick_random(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    const fn = (
      'lambda x, y: int(random.random() * (int(y) - int(x) + 1)) + int(x)'
    );
    expect(pcode).toBe(`\
import random\n\n\n\
1 + (${fn})(2, 3)\
` + "\n");
  } finally {
    workspace.dispose();
  }
});

/*
 * Comparators.
 */

test('1 < 2', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bless_than(1, 2) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 < 2' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 + 2 < 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bless_than(Bplus(1, 2), 3) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 + 2 < 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 < 2 + 3', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bless_than(1, Bplus(2, 3)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 < 2 + 3' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 + 2 < 3 - 4', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bless_than(Bplus(1, 2), Bminus(3, 4)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 + 2 < 3 - 4' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 <= 2', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bless_than_or_equal(1, 2) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 <= 2' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 == 2', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bequal(1, 2) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 == 2' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 > 2', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bgreater_than(1, 2) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 > 2' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 >= 2', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bgreater_than_or_equal(1, 2) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 >= 2' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 < 2 && 3 <= 4', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Band(Bless_than(1, 2), Bless_than_or_equal(3, 4)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 < 2 and 3 <= 4' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('1 < 2 || 3 <= 4', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bor(Bless_than(1, 2), Bless_than_or_equal(3, 4)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 < 2 or 3 <= 4' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 < 2 && 3 <= 4) || (5 > 6 && 7 <= 8)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bor(
          Band(Bless_than(1, 2), Bless_than_or_equal(3, 4)),
          Band(Bgreater_than(5, 6), Bgreater_than_or_equal(7, 8)) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 < 2 and 3 <= 4 or 5 > 6 and 7 >= 8' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 < 2 || 3 <= 4) && (5 > 6 || 7 <= 8)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Band(
          Bor(Bless_than(1, 2), Bless_than_or_equal(3, 4)),
          Bor(Bgreater_than(5, 6), Bgreater_than_or_equal(7, 8)) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('(1 < 2 or 3 <= 4) and (5 > 6 or 7 >= 8)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 < 2 && 3 <= 4) && (5 > 6 && 7 <= 8)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Band(
          Band(Bless_than(1, 2), Bless_than_or_equal(3, 4)),
          Band(Bgreater_than(5, 6), Bgreater_than_or_equal(7, 8)) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 < 2 and 3 <= 4 and 5 > 6 and 7 >= 8' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('(1 < 2 || 3 <= 4) || (5 > 6 || 7 <= 8)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bor(
          Bor(Bless_than(1, 2), Bless_than_or_equal(3, 4)),
          Bor(Bgreater_than(5, 6), Bgreater_than_or_equal(7, 8)) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('1 < 2 or 3 <= 4 or 5 > 6 or 7 >= 8' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('not (1 < 2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bnot(Bless_than(1, 2)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('not 1 < 2' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('not (1 < 2) && not (3 <= 4)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Band(Bnot(Bless_than(1, 2)), Bnot(Bless_than_or_equal(3, 4))) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('not 1 < 2 and not 3 <= 4' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('not (1 < 2 && 3 <= 4)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bnot(Band(Bless_than(1, 2), Bless_than_or_equal(3, 4))) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('not (1 < 2 and 3 <= 4)' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('not (1 < 2) || not (3 <= 4)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bor(Bnot(Bless_than(1, 2)), Bnot(Bless_than_or_equal(3, 4))) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('not 1 < 2 or not 3 <= 4' + "\n");
  } finally {
    workspace.dispose();
  }
});

test('not (1 < 2 || 3 <= 4)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bnot(Bor(Bless_than(1, 2), Bless_than_or_equal(3, 4))) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('not (1 < 2 or 3 <= 4)' + "\n");
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for wait block.
 */

test('wait(1)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bwait(1) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
time.sleep(1)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'math_positive_number', line: 3, },
      block1: { type: 'wait', line: 3, },
    });
  } finally {
    workspace.dispose();
  }
});

test('wait(1 + 2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bwait(Bplus(1, 2)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
time.sleep(1 + 2)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'math_number', line: 3, },
      block1: { type: 'math_number', line: 3, },
      block2: { type: 'plus', line: 3, },
      block4: { type: 'wait', line: 3, },
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for set_servomotor_degree block.
 */

test('set_servomotor_degree(V2, 1)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bset_servomotor_degree('V2', 1) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V2 = koov.servo_motor(koov.V2)\n\
\n\
\n\
V2.set_degree(1)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'math_angle', line: 6 },
      block1: { type: 'set_servomotor_degree', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

test('set_servomotor_degree(V2, 1 + 2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bset_servomotor_degree('V2', Bplus(1, 2)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V2 = koov.servo_motor(koov.V2)\n\
\n\
\n\
V2.set_degree(1 + 2)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'math_number', line: 6, },
      block1: { type: 'math_number', line: 6, },
      block2: { type: 'plus', line: 6, },
      block4: { type: 'set_servomotor_degree', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for set_dcmotor_power block.
 */

test('set_dcmotor_power(V0, 1)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bset_dcmotor_power('V0', 1) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V0 = koov.dc_motor(koov.V0)\n\
\n\
\n\
V0.set_power(1)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'math_number', line: 6 },
      block1: { type: 'set_dcmotor_power', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

test('set_dcmotor_power(V0, 1 + 2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bset_dcmotor_power('V0', Bplus(1, 2)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V0 = koov.dc_motor(koov.V0)\n\
\n\
\n\
V0.set_power(1 + 2)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'math_number', line: 6, },
      block1: { type: 'math_number', line: 6, },
      block2: { type: 'plus', line: 6, },
      block4: { type: 'set_dcmotor_power', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for turn_dcmotor_on block.
 */

test('turn_dcmotor_on(V0, NORMAL)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bturn_dcmotor_on('V0', 'NORMAL') ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V0 = koov.dc_motor(koov.V0)\n\
\n\
\n\
V0.set_mode(koov.dc_motor.NORMAL)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'turn_dcmotor_on', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for turn_dcmotor_off block.
 */

test('turn_dcmotor_off(V0, COAST)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bturn_dcmotor_off('V0', 'COAST') ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V0 = koov.dc_motor(koov.V0)\n\
\n\
\n\
V0.set_mode(koov.dc_motor.COAST)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'turn_dcmotor_off', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for buzzer_on block.
 */

test('buzzer_on(V2, 1)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bbuzzer_on('V2', 1) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V2 = koov.buzzer(koov.V2)\n\
\n\
\n\
V2.on(1)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'note', line: 6 },
      block1: { type: 'buzzer_on', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

test('buzzer_on(V2, 1 + 2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bbuzzer_on('V2', Bplus(1, 2)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V2 = koov.buzzer(koov.V2)\n\
\n\
\n\
V2.on(1 + 2)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'math_number', line: 6, },
      block1: { type: 'math_number', line: 6, },
      block2: { type: 'plus', line: 6, },
      block4: { type: 'buzzer_on', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for buzzer_off block.
 */

test('buzzer_off(V2, 1)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bbuzzer_off('V2') ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V2 = koov.buzzer(koov.V2)\n\
\n\
\n\
V2.off()\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'buzzer_off', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for turn_led block.
 */

test('turn_led(V2, ON)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bturn_led('V2', 'ON') ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V2 = koov.led(koov.V2)\n\
\n\
\n\
V2.on()\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'turn_led', line: 6 }
    });

    expect(() => {
      const dom = j2e(
        xml({}, [
          Bturn_led("V2", "NONE") ]));
      ScratchBlocks.Xml.domToWorkspace(dom, workspace);
      ScratchBlocks.Python.workspaceToCode(workspace); }).toThrow(
        (/^turn_led: Invalid mode: NONE$/));
  } finally {
    workspace.dispose();
  }
});

test('turn_led(V2, OFF)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bturn_led('V2', 'OFF') ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
V2 = koov.led(koov.V2)\n\
\n\
\n\
V2.off()\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'turn_led', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

test('multi_led(0, 1, 2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmulti_led(0, 1, 2) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
RGB = koov.multi_led(koov.RGB)\n\
\n\
\n\
RGB.on(0, 1, 2)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'math_number', line: 6 },
      block1: { type: 'math_number', line: 6 },
      block2: { type: 'math_number', line: 6 },
      block3: { type: 'multi_led', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

test('multi_led(1 + 2, 3 + 4, 5 + 6)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bmulti_led(Bplus(1, 2), Bplus(3, 4), Bplus(5, 6)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
RGB = koov.multi_led(koov.RGB)\n\
\n\
\n\
RGB.on(1 + 2, 3 + 4, 5 + 6)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'math_number', line: 6 },
      block1: { type: 'math_number', line: 6 },
      block2: { type: 'plus', line: 6 },
      block3: { type: 'math_number', line: 6 },
      block4: { type: 'math_number', line: 6 },
      block5: { type: 'plus', line: 6 },
      block6: { type: 'math_number', line: 6 },
      block7: { type: 'math_number', line: 6 },
      block8: { type: 'plus', line: 6 },
      block12: { type: 'multi_led', line: 6 }
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for light_sensor block.
 */

test('light_sensor_value(K2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Blight_sensor_value([ "K2" ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K2 = koov.light_sensor(koov.K2)\n\
\n\
\n\
K2.value\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: "light_sensor_value", line: 6, }
    });
  } finally {
    workspace.dispose();
  }
});

test('light_sensor_value(K2) in wait block', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bstart(
          Bwait(Bplus(1, Blight_sensor_value([ "K2" ]))) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
import time\n\
\n\
\n\
K2 = koov.light_sensor(koov.K2)\n\
\n\
\n\
def main():\n\
  time.sleep(1 + K2.value)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'light_sensor_value', line: 8, },
      block1: { type: 'math_number', line: 8, },
      block3: { type: 'plus', line: 8, },
      block5: { type: 'wait', line: 8, },
      block6: { type: 'when_green_flag_clicked', line: 7, },
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for sound_sensor block.
 */

test('sound_sensor_value(K2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bsound_sensor_value([ "K2" ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K2 = koov.sound_sensor(koov.K2)\n\
\n\
\n\
K2.value\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: "sound_sensor_value", line: 6, }
    });
  } finally {
    workspace.dispose();
  }
});

test('sound_sensor_value(K2) in wait block', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bstart(
          Bwait(Bplus(1, Bsound_sensor_value([ "K2" ]))) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
import time\n\
\n\
\n\
K2 = koov.sound_sensor(koov.K2)\n\
\n\
\n\
def main():\n\
  time.sleep(1 + K2.value)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'sound_sensor_value', line: 8, },
      block1: { type: 'math_number', line: 8, },
      block3: { type: 'plus', line: 8, },
      block5: { type: 'wait', line: 8, },
      block6: { type: 'when_green_flag_clicked', line: 7, },
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for ir_photo_reflector block.
 */

test('ir_photo_reflector_value(K2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bir_photo_reflector_value([ "K2" ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K2 = koov.ir_photo_reflector(koov.K2)\n\
\n\
\n\
K2.value\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: "ir_photo_reflector_value", line: 6, }
    });
  } finally {
    workspace.dispose();
  }
});

test('ir_photo_reflector_value(K2) in wait block', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bstart(
          Bwait(Bplus(1, Bir_photo_reflector_value([ "K2" ]))) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
import time\n\
\n\
\n\
K2 = koov.ir_photo_reflector(koov.K2)\n\
\n\
\n\
def main():\n\
  time.sleep(1 + K2.value)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'ir_photo_reflector_value', line: 8, },
      block1: { type: 'math_number', line: 8, },
      block3: { type: 'plus', line: 8, },
      block5: { type: 'wait', line: 8, },
      block6: { type: 'when_green_flag_clicked', line: 7, },
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for ultrasonic_distance_sensor block.
 */

test('ultrasonic_distance_sensor(K2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bultrasonic_distance_sensor([ "K2" ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K2 = koov.ultrasonic_distance_sensor(koov.K2)\n\
\n\
\n\
K2.value\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: "ultrasonic_distance_sensor", line: 6, }
    });
  } finally {
    workspace.dispose();
  }
});

test('ultrasonic_distance_sensor(K2) in wait block', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bstart(
          Bwait(Bplus(1, Bultrasonic_distance_sensor([ "K2" ]))) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
import time\n\
\n\
\n\
K2 = koov.ultrasonic_distance_sensor(koov.K2)\n\
\n\
\n\
def main():\n\
  time.sleep(1 + K2.value)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'ultrasonic_distance_sensor', line: 8, },
      block1: { type: 'math_number', line: 8, },
      block3: { type: 'plus', line: 8, },
      block5: { type: 'wait', line: 8, },
      block6: { type: 'when_green_flag_clicked', line: 7, },
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for 3_axis_digital_accelerometer_value block.
 */

test('3_axis_digital_accelerometer_value(K0)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        B3_axis_digital_accelerometer_value([ "K0" ], [ "X" ]),
        B3_axis_digital_accelerometer_value([ "K0" ], [ "Y" ]),
        B3_axis_digital_accelerometer_value([ "K0" ], [ "Z" ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K0 = koov.accelerometer(koov.K0)\n\
\n\
\n\
K0.x\n\
\n\
K0.y\n\
\n\
K0.z\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: "3_axis_digital_accelerometer_value", line: 6, },
      block1: { type: "3_axis_digital_accelerometer_value", line: 8, },
      block2: { type: "3_axis_digital_accelerometer_value", line: 10, }
    });
  } finally {
    workspace.dispose();
  }
});

test('3_axis_digital_accelerometer_value(K0) in wait block', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bstart(
          Bwait(
            Bplus(1, B3_axis_digital_accelerometer_value([ "K0" ], [ "X" ]))),
          Bwait(
            Bplus(2, B3_axis_digital_accelerometer_value([ "K0" ], [ "Y" ]))),
          Bwait(
            Bplus(
              3, B3_axis_digital_accelerometer_value([ "K0" ], [ "Z" ]))) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
import time\n\
\n\
\n\
K0 = koov.accelerometer(koov.K0)\n\
\n\
\n\
def main():\n\
  time.sleep(1 + K0.x)\n\
  time.sleep(2 + K0.y)\n\
  time.sleep(3 + K0.z)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: '3_axis_digital_accelerometer_value', line: 8, },
      block1: { type: 'math_number', line: 8, },
      block3: { type: 'plus', line: 8, },
      block5: { type: 'wait', line: 8, },
      block6: { type: '3_axis_digital_accelerometer_value', line: 9, },
      block7: { type: 'math_number', line: 9, },
      block9: { type: 'plus', line: 9, },
      block11: { type: 'wait', line: 9, },
      block12: { type: '3_axis_digital_accelerometer_value', line: 10, },
      block13: { type: 'math_number', line: 10, },
      block15: { type: 'plus', line: 10, },
      block17: { type: 'wait', line: 10, },
      block18: { type: 'when_green_flag_clicked', line: 7, },
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for color_sensor_value block.
 */

test('color_sensor_value(K0)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bcolor_sensor_value([ "K0" ], [ "R" ]),
        Bcolor_sensor_value([ "K0" ], [ "G" ]),
        Bcolor_sensor_value([ "K0" ], [ "B" ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K0 = koov.color_sensor(koov.K0)\n\
\n\
\n\
K0.r\n\
\n\
K0.g\n\
\n\
K0.b\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: "color_sensor_value", line: 6, },
      block1: { type: "color_sensor_value", line: 8, },
      block2: { type: "color_sensor_value", line: 10, }
    });
  } finally {
    workspace.dispose();
  }
});

test('color_sensor_value(K0) in wait block', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bstart(
          Bwait(
            Bplus(1, Bcolor_sensor_value([ "K0" ], [ "R" ]))),
          Bwait(
            Bplus(2, Bcolor_sensor_value([ "K0" ], [ "G" ]))),
          Bwait(
            Bplus(3, Bcolor_sensor_value([ "K0" ], [ "B" ]))) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
import time\n\
\n\
\n\
K0 = koov.color_sensor(koov.K0)\n\
\n\
\n\
def main():\n\
  time.sleep(1 + K0.r)\n\
  time.sleep(2 + K0.g)\n\
  time.sleep(3 + K0.b)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'color_sensor_value', line: 8, },
      block1: { type: 'math_number', line: 8, },
      block3: { type: 'plus', line: 8, },
      block5: { type: 'wait', line: 8, },
      block6: { type: 'color_sensor_value', line: 9, },
      block7: { type: 'math_number', line: 9, },
      block9: { type: 'plus', line: 9, },
      block11: { type: 'wait', line: 9, },
      block12: { type: 'color_sensor_value', line: 10, },
      block13: { type: 'math_number', line: 10, },
      block15: { type: 'plus', line: 10, },
      block17: { type: 'wait', line: 10, },
      block18: { type: 'when_green_flag_clicked', line: 7, },
    });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for touch_sensor block.
 */

test('touch_sensor_value(K2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Btouch_sensor_value([ "K2" ], [ "ON" ]),
        Btouch_sensor_value([ "K2" ], [ "OFF" ])]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K2 = koov.touch_sensor(koov.K2)\n\
\n\
\n\
K2.value == 0\n\
\n\
K2.value != 0\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: "touch_sensor_value", line: 6, },
      block1: { type: "touch_sensor_value", line: 8, }
    });
  } finally {
    workspace.dispose();
  }
});

test('touch_sensor_value(K2) in if_then block', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bstart(
          Bif_then([ Btouch_sensor_value([ "K2" ], [ "ON" ]) ], []),
          Bif_then([ Btouch_sensor_value([ "K2" ], [ "OFF" ]) ], []) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K2 = koov.touch_sensor(koov.K2)\n\
\n\
\n\
def main():\n\
  if K2.value == 0:\n\
    pass\n\
  if K2.value != 0:\n\
    pass\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'touch_sensor_value', line: 7, },
      block1: { type: 'if_then', line: 7, },
      block2: { type: 'touch_sensor_value', line: 9, },
      block3: { type: 'if_then', line: 9, },
      block4: { type: 'when_green_flag_clicked', line: 6, },
    });
  } finally {
    workspace.dispose();
  }
});

test('touch_sensor_value(K2) in if_then not block', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bstart(
          Bif_then([ Bnot(Btouch_sensor_value([ "K2" ], [ "ON" ])) ], []),
          Bif_then([
            Bnot(Btouch_sensor_value([ "K2" ], [ "OFF" ])) ], []) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K2 = koov.touch_sensor(koov.K2)\n\
\n\
\n\
def main():\n\
  if not K2.value == 0:\n\
    pass\n\
  if not K2.value != 0:\n\
    pass\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'touch_sensor_value', line: 7, },
      block2: { type: 'not', line: 7, },
      block3: { type: 'if_then', line: 7, },
      block4: { type: 'touch_sensor_value', line: 9, },
      block6: { type: 'not', line: 9, },
      block7: { type: 'if_then', line: 9, },
      block8: { type: 'when_green_flag_clicked', line: 6, },
    });

    expect(() => {
      const dom = j2e(
        xml({}, [
          Btouch_sensor_value([ "K2" ], [ "NONE" ]) ]));
      ScratchBlocks.Xml.domToWorkspace(dom, workspace);
      ScratchBlocks.Python.workspaceToCode(workspace); }).toThrow(
        (/^touch_sensor_value: Unknown mode: NONE$/));
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for core_button block.
 */

test('button_value(K2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bbutton_value([ "K2" ], [ "ON" ]),
        Bbutton_value([ "K2" ], [ "OFF" ])]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K2 = koov.core_button(koov.K2)\n\
\n\
\n\
K2.value == 0\n\
\n\
K2.value != 0\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: "button_value", line: 6, },
      block1: { type: "button_value", line: 8, }
    });
  } finally {
    workspace.dispose();
  }
});

test('button_value(K2) in if_then block', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bstart(
          Bif_then([ Bbutton_value([ "K2" ], [ "ON" ]) ], []),
          Bif_then([ Bbutton_value([ "K2" ], [ "OFF" ]) ], []) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K2 = koov.core_button(koov.K2)\n\
\n\
\n\
def main():\n\
  if K2.value == 0:\n\
    pass\n\
  if K2.value != 0:\n\
    pass\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'button_value', line: 7, },
      block1: { type: 'if_then', line: 7, },
      block2: { type: 'button_value', line: 9, },
      block3: { type: 'if_then', line: 9, },
      block4: { type: 'when_green_flag_clicked', line: 6, },
    });
  } finally {
    workspace.dispose();
  }
});

test('button_value(K2) in if_then not block', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bstart(
          Bif_then([ Bnot(Bbutton_value([ "K2" ], [ "ON" ])) ], []),
          Bif_then([
            Bnot(Bbutton_value([ "K2" ], [ "OFF" ])) ], []) )]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import koov\n\
\n\
\n\
K2 = koov.core_button(koov.K2)\n\
\n\
\n\
def main():\n\
  if not K2.value == 0:\n\
    pass\n\
  if not K2.value != 0:\n\
    pass\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'button_value', line: 7, },
      block2: { type: 'not', line: 7, },
      block3: { type: 'if_then', line: 7, },
      block4: { type: 'button_value', line: 9, },
      block6: { type: 'not', line: 9, },
      block7: { type: 'if_then', line: 9, },
      block8: { type: 'when_green_flag_clicked', line: 6, },
    });

    expect(() => {
      const dom = j2e(
        xml({}, [
          Bbutton_value([ "K2" ], [ "NONE" ]) ]));
      ScratchBlocks.Xml.domToWorkspace(dom, workspace);
      ScratchBlocks.Python.workspaceToCode(workspace); }).toThrow(
        (/^button_value: Unknown mode: NONE$/));
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for forever block.
 */

test('forever(empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bforever() ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('while True:\n  pass\n');
  } finally {
    workspace.dispose();
  }
});

test('forever(with single wait)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bforever(Bwait(1)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
while True:\n\
  time.sleep(1)\n');
  } finally {
    workspace.dispose();
  }
});

test('forever(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bforever(Bwait(1), Bwait(2)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
while True:\n\
  time.sleep(1)\n\
  time.sleep(2)\n');
  } finally {
    workspace.dispose();
  }
});

test('nested forever(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bforever(
          Bwait(1),
          Bwait(2),
          Bforever(
            Bwait(3),
            Bwait(4) ))]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
while True:\n\
  time.sleep(1)\n\
  time.sleep(2)\n\
  while True:\n\
    time.sleep(3)\n\
    time.sleep(4)\n');
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for repeat block.
 */

test('repeat(empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Brepeat(1, []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('for _ in range(1):\n  pass\n');
  } finally {
    workspace.dispose();
  }
});

test('repeat(with single wait)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Brepeat(Bplus(1, 2), [ Bwait(1) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
for _ in range(1 + 2):\n\
  time.sleep(1)\n');
  } finally {
    workspace.dispose();
  }
});

test('repeat(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Brepeat(1, [ Bwait(1), Bwait(2) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
for _ in range(1):\n\
  time.sleep(1)\n\
  time.sleep(2)\n');
  } finally {
    workspace.dispose();
  }
});

test('nested repeat(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Brepeat(1, [
          Bwait(1),
          Bwait(2),
          Brepeat(2, [
            Bwait(3),
            Bwait(4) ])])]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
for _ in range(1):\n\
  time.sleep(1)\n\
  time.sleep(2)\n\
  for _ in range(2):\n\
    time.sleep(3)\n\
    time.sleep(4)\n');
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for repeat_until block.
 */

test('repeat_until(empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Brepeat_until([ Bequal(1, 0) ], []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('while not 1 == 0:\n  pass\n');
  } finally {
    workspace.dispose();
  }
});

test('repeat_until(with single wait)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Brepeat_until([ Band(Bequal(1, 0), Bequal(2, 3)) ], [ Bwait(1) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
while not (1 == 0 and 2 == 3):\n\
  time.sleep(1)\n');
  } finally {
    workspace.dispose();
  }
});

test('repeat_until(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Brepeat_until([ Bequal(1, 0) ], [ Bwait(1), Bwait(2) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
while not 1 == 0:\n\
  time.sleep(1)\n\
  time.sleep(2)\n');
  } finally {
    workspace.dispose();
  }
});

test('nested repeat_until(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Brepeat_until([ Bequal(1, 0) ], [
          Bwait(1),
          Bwait(2),
          Brepeat_until([ Bequal(2, 3) ], [
            Bwait(3),
            Bwait(4) ])])]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
while not 1 == 0:\n\
  time.sleep(1)\n\
  time.sleep(2)\n\
  while not 2 == 3:\n\
    time.sleep(3)\n\
    time.sleep(4)\n');
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for wait_until block.
 */

test('wait_until(empty condition)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bwait_until([], []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    expect(
      () => ScratchBlocks.Python.workspaceToCode(workspace)).toThrow(
        (/^wait_until: No arguments$/));
  } finally {
    workspace.dispose();
  }
});

test('wait_until(non empty condition)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bwait_until([ Bequal(1, 0) ], []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
while not 1 == 0:\n\
  time.sleep(0.01)');
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for function block.
 */

test('function(empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bfunction('f', []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    //const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
def f_f():\n\
  pass\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'function', line: 0 } });
  } finally {
    workspace.dispose();
  }
});

test('function(reserved symbol name)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        variables({}, []),
        Bfunction('main', []),
        Bstart() ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    //const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
def f_main():\n\
  pass\n\n\n\
def main():\n\
  pass\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'function', line: 0 },
      block1: { type: 'when_green_flag_clicked', line: 4 }});
  } finally {
    workspace.dispose();
  }
});

test('function(conflicting function name)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bfunction('f', [ Bwait(1) ]),
        Bfunction('f ', [ Bwait(2) ]),
        Bfunction('$f', [ Bwait(3) ])]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    //const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\
\n\
\n\
def f_f():\n\
  time.sleep(1)\n\
\n\
\n\
def f_f1():\n\
  time.sleep(2)\n\
\n\
\n\
def f_f2():\n\
  time.sleep(3)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'math_positive_number', line: 4, },
      block1: { type: 'wait', line: 4, },
      block2: { type: 'function', line: 3, },
      block3: { type: 'math_positive_number', line: 8, },
      block4: { type: 'wait', line: 8, },
      block5: { type: 'function', line: 7, },
      block6: { type: 'math_positive_number', line: 12, },
      block7: { type: 'wait', line: 12, },
      block8: { type: 'function', line: 11, },
    });
  } finally {
    workspace.dispose();
  }
});

test('function(empty) and start', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bwait(1),
          Bwait(2) ),
        Bfunction('f', []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    //const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\
\n\
\n\
def main():\n\
  time.sleep(1)\n\
  time.sleep(2)\n\
\n\
\n\
def f_f():\n\
  pass\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block4: { type: 'when_green_flag_clicked', line: 3 },
      block1: { type: 'wait', line: 4 },
      block0: { type: 'math_positive_number', line: 4 },
      block3: { type: 'wait', line: 5 },
      block2: { type: 'math_positive_number', line: 5 },
      block5: { type: 'function', line: 8 } });
  } finally {
    workspace.dispose();
  }
});

test('function(with single wait)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bfunction('f', [ Bwait(1) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
def f_f():\n\
  time.sleep(1)\n');
  } finally {
    workspace.dispose();
  }
});

test('function(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bfunction('f', [ Bwait(1), Bwait(2) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
def f_f():\n\
  time.sleep(1)\n\
  time.sleep(2)\n');
  } finally {
    workspace.dispose();
  }
});

test('function(empty) and call_function', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        variables({}, []),
        Bstart(
          Bcall_function('f') ),
        Bfunction('f', []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
def main():\n\
  f_f()\n\
\n\
\n\
def f_f():\n\
  pass\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'call_function', line: 1 },
      block1: { type: 'when_green_flag_clicked', line: 0 },
      block2: { type: 'function', line: 4 } });
  } finally {
    workspace.dispose();
  }
});

test('function contains call_function', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        variables({}, []),
        Bfunction('f', [
          Bcall_function('f') ])]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
def f_f():\n\
  f_f()\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block0: { type: 'call_function', line: 1 },
      block1: { type: 'function', line: 0 } });
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for if then.
 */

test('if then(empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bif_then([ Bless_than(1, 2) ], []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('if 1 < 2:\n  pass\n');
  } finally {
    workspace.dispose();
  }
});

test('if then(single wait)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bif_then([ Bless_than(1, 2) ], [ Bwait(3) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
if 1 < 2:\n\
  time.sleep(3)\n');
  } finally {
    workspace.dispose();
  }
});

test('if then(two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bif_then([ Bless_than(1, 2) ], [ Bwait(3), Bwait(4) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
if 1 < 2:\n\
  time.sleep(3)\n\
  time.sleep(4)\n');
  } finally {
    workspace.dispose();
  }
});

test('if then(nested two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bif_then([ Bless_than(1, 2) ], [
          Bwait(3),
          Bwait(4),
          Bif_then([ Bgreater_than(5, 6) ], [
            Bwait(7),
            Bwait(8) ])]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
if 1 < 2:\n\
  time.sleep(3)\n\
  time.sleep(4)\n\
  if 5 > 6:\n\
    time.sleep(7)\n\
    time.sleep(8)\n');
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for if then else.
 */

test('if then else(empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bif_then_else([ Bless_than(1, 2) ], [], []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
if 1 < 2:\n\
  pass\n\
else:\n\
  pass\n');
  } finally {
    workspace.dispose();
  }
});

test('if then else(single wait in then clause)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bif_then_else([ Bless_than(1, 2) ], [ Bwait(3) ], []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
if 1 < 2:\n\
  time.sleep(3)\n\
else:\n\
  pass\n');
  } finally {
    workspace.dispose();
  }
});

test('if then else(single wait in else clause)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [ Bif_then_else([ Bless_than(1, 2) ], [], [ Bwait(3) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
if 1 < 2:\n\
  pass\n\
else:\n\
  time.sleep(3)\n');
  } finally {
    workspace.dispose();
  }
});

test('if then else(single wait in both clause)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bif_then_else([ Bless_than(1, 2) ], [ Bwait(3) ], [ Bwait(4) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
if 1 < 2:\n\
  time.sleep(3)\n\
else:\n\
  time.sleep(4)\n');
  } finally {
    workspace.dispose();
  }
});

test('if then else(two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bif_then_else(
          [ Bless_than(1, 2) ],
          [ Bwait(3), Bwait(4) ],
          [ Bwait(5), Bwait(6) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
if 1 < 2:\n\
  time.sleep(3)\n\
  time.sleep(4)\n\
else:\n\
  time.sleep(5)\n\
  time.sleep(6)\n');
  } finally {
    workspace.dispose();
  }
});

test('if then else(nested two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom = j2e(
      xml({}, [
        Bif_then_else(
          [ Bless_than(1, 2) ],
          [
            Bwait(3),
            Bwait(4),
            Bif_then_else(
              [ Bgreater_than(5, 6) ],
              [
                Bwait(7),
                Bwait(8) ],
              [
                Bwait(9),
                Bwait(10) ])],
          [
            Bwait(11),
            Bwait(12),
            Bif_then_else(
              [ Bequal(13, 14) ],
              [
                Bwait(15),
                Bwait(16) ],
              [
                Bwait(17),
                Bwait(18) ])]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);
    //const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    //console.log('dom3 %o', xmlserializer.serializeToString(dom3));

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\
\n\
\n\
if 1 < 2:\n\
  time.sleep(3)\n\
  time.sleep(4)\n\
  if 5 > 6:\n\
    time.sleep(7)\n\
    time.sleep(8)\n\
  else:\n\
    time.sleep(9)\n\
    time.sleep(10)\n\
else:\n\
  time.sleep(11)\n\
  time.sleep(12)\n\
  if 13 == 14:\n\
    time.sleep(15)\n\
    time.sleep(16)\n\
  else:\n\
    time.sleep(17)\n\
    time.sleep(18)\n');

    expect(ScratchBlocks.Python.blockIdToLineNumberMap(workspace)).toEqual({
      block35: { type: 'if_then_else', line: 3 },
      block2: { type: 'less_than', line: 3 },
      block0: { type: 'math_number', line: 3 },
      block1: { type: 'math_number', line: 3 },
      block4: { type: 'wait', line: 4 },
      block3: { type: 'math_positive_number', line: 4 },
      block6: { type: 'wait', line: 5 },
      block5: { type: 'math_positive_number', line: 5 },
      block18: { type: 'if_then_else', line: 6 },
      block9: { type: 'greater_than', line: 6 },
      block7: { type: 'math_number', line: 6 },
      block8: { type: 'math_number', line: 6 },
      block11: { type: 'wait', line: 7 },
      block10: { type: 'math_positive_number', line: 7 },
      block13: { type: 'wait', line: 8 },
      block12: { type: 'math_positive_number', line: 8 },
      block15: { type: 'wait', line: 10 },
      block14: { type: 'math_positive_number', line: 10 },
      block17: { type: 'wait', line: 11 },
      block16: { type: 'math_positive_number', line: 11 },
      block20: { type: 'wait', line: 13 },
      block19: { type: 'math_positive_number', line: 13 },
      block22: { type: 'wait', line: 14 },
      block21: { type: 'math_positive_number', line: 14 },
      block34: { type: 'if_then_else', line: 15 },
      block25: { type: 'equal', line: 15 },
      block23: { type: 'math_number', line: 15 },
      block24: { type: 'math_number', line: 15 },
      block27: { type: 'wait', line: 16 },
      block26: { type: 'math_positive_number', line: 16 },
      block29: { type: 'wait', line: 17 },
      block28: { type: 'math_positive_number', line: 17 },
      block31: { type: 'wait', line: 19 },
      block30: { type: 'math_positive_number', line: 19 },
      block33: { type: 'wait', line: 20 },
      block32: { type: 'math_positive_number', line: 20 } });
  } finally {
    workspace.dispose();
  }
});
