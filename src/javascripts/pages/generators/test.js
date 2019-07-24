/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 */

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
      throw new Error(`block ${self} already chained`);
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

const statements = (blks, name) => (
  blks.length === 0 ? [] :
    [ statement({ name: name ? name : "BLOCKS"}, [
      chain_blocks(blks[0], blks.slice(1)) ])]
);

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

const Bif_then = (condition, blks) => (
  Bblock({ type: "if_then" }, [
    value({ name: "CONDITION" }, [ ...condition ]),
      ...statements(blks)]));

const Bif_then_else = (condition, then_blks, else_blks) => (
  Bblock({ type: "if_then_else" }, [
    value({ name: "CONDITION" }, [ ...condition ]),
      ...statements(then_blks, "THEN_BLOCKS"),
      ...statements(else_blks, "ELSE_BLOCKS")]));

const Bnumber = (n, type) => {
  const [ shadow_arg, block_arg ] = (() => {
    if (n === null)
      return [[], []];
    if (typeof n === 'number')
      return [[ n ], []];
    return [[], [ n ]];
  })();

  return [
    Bshadow({ type: type }, [ field({ name: "NUM"}, [...shadow_arg]) ]),
      ...block_arg ];
};

const Bwait = n => (
  Bblock({ type: "wait" }, [
    value({ name: "SECS" }, Bnumber(n, "math_positive_number")) ]));

const binop = (name, xname, yname) => (x, y) => (
  Bblock({ type: name }, [
    value({ name: xname ? xname : "X" }, Bnumber(x, "math_number")),
    value({ name: yname ? yname : "Y" }, Bnumber(y, "math_number")) ]));

const uniop = (name, xname) => (x) => (
  Bblock({ type: name }, [
    value({ name: xname ? xname : "X" }, Bnumber(x, "math_number")) ]));

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

test('wait notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block(
          { type: "when_green_flag_clicked", id: 'block2', x: 10, y: 10 }, [
            next({}, [
              block({ type: "wait", id: 'block1' }, [
                value({ name: "SECS" }, [
                  shadow({ type: "math_positive_number", id: 'block0' }, [
                    field({ name: "NUM"}, [ 999 ]) ])])])])])]));
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

test('forever notation (empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block(
          { type: "when_green_flag_clicked", id: 'block1', x: 10, y: 10 }, [
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
        block(
          { type: "when_green_flag_clicked", id: 'block3', x: 10, y: 10 }, [
            next({}, [
              block({ type: "forever", id: 'block2' }, [
                statement({ name: "BLOCKS"}, [
                  block({ type: "wait", id: 'block1' }, [
                    value({ name: "SECS" }, [
                      shadow({ type: "math_positive_number", id: 'block0' }, [
                        field({ name: "NUM"}, [ 999 ]) ])])])])])])])]));
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
        block(
          { type: "when_green_flag_clicked", id: 'block2', x: 10, y: 10 }, [
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
        block(
          { type: "when_green_flag_clicked", id: 'block2', x: 10, y: 10 }, [
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
        block(
          { type: "when_green_flag_clicked", id: 'block4', x: 10, y: 10 }, [
            next({}, [
              block({ type: "repeat", id: 'block3' }, [
                value({ name: "COUNT" }, [
                  shadow({ type: "math_whole_number", id: 'block2' }, [
                    field({ name: "NUM" }, [1])])]),
                statement({ name: "BLOCKS" }, [
                  block({ type: "wait", id: 'block1' }, [
                    value({ name: "SECS" }, [
                      shadow({ type: "math_positive_number", id: 'block0' }, [
                        field({ name: "NUM"}, [ 2 ]) ])])])])])])])]));
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
        block(
          { type: "when_green_flag_clicked", id: 'block6', x: 10, y: 10 }, [
            next({}, [
              block({ type: "repeat", id: 'block5' }, [
                value({ name: "COUNT" }, [
                  shadow({ type: "math_whole_number", id: 'block4' }, [
                    field({ name: "NUM" }, [1])])]),
                statement({ name: "BLOCKS" }, [
                  block({ type: "wait", id: 'block1' }, [
                    value({ name: "SECS" }, [
                      shadow({ type: "math_positive_number", id: 'block0' }, [
                        field({ name: "NUM"}, [ 2 ]) ])]),
                    next({}, [
                      block({ type: "wait", id: 'block3' }, [
                        value({ name: "SECS" }, [
                          shadow(
                            { type: "math_positive_number", id: 'block2' }, [
                              field({ name: "NUM"}, [ 3 ])
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
        block(
          { type: "when_green_flag_clicked", id: 'block0', x: 10, y: 10 }, []),
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
        block(
          { type: "when_green_flag_clicked", id: 'block0', x: 10, y: 10 }, []),
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
        block(
          { type: "when_green_flag_clicked", id: 'block0', x: 10, y: 10 }, []),
        block(
          { type: "function", id: 'block3', x: 10, y: 10 }, [
            field({ name: "FUNCTION" }, [ 'f' ]),
            statement({ name: "BLOCKS" }, [
              block({ type: "wait", id: 'block2' }, [
                value({ name: "SECS" }, [
                  shadow({ type: "math_positive_number", id: 'block1' }, [
                    field({ name: "NUM"}, [ 2 ]) ])])])])])]));
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
        block(
          { type: "when_green_flag_clicked", id: 'block0', x: 10, y: 10 }, []),
        block({ type: "function", id: 'block5', x: 10, y: 10 }, [
          field({ name: "FUNCTION" }, [ 'f' ]),
          statement({ name: "BLOCKS" }, [
            block({ type: "wait", id: 'block2' }, [
              value({ name: "SECS" }, [
                shadow({ type: "math_positive_number", id: 'block1' }, [
                  field({ name: "NUM"}, [ 2 ]) ])]),
              next({}, [
                block({ type: "wait", id: 'block4' }, [
                  value({ name: "SECS" }, [
                    shadow(
                      { type: "math_positive_number", id: 'block3' }, [
                        field({ name: "NUM"}, [ 3 ]) ])])])])])])])]));
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

test('wait(1 + 2) notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  id = 0;
  try {
    const dom1 = j2e(
      xml({}, [
        variables({}, []),
        block(
          { type: "when_green_flag_clicked", id: 'block5', x: 10, y: 10 }, [
            next({}, [
              block({ type: "wait", id: 'block4' }, [
                value({ name: "SECS" }, [
                  shadow({ type: "math_positive_number", id: 'block3' }, [
                    field({ name: "NUM"}, []) ]),
                  block({ type: "plus", id: 'block2' }, [
                    value({ name: "X" }, [
                      shadow({ type: "math_number", id: 'block0' }, [
                        field({ name: "NUM"}, [ 1 ]) ]) ]),
                    value({ name: "Y" }, [
                      shadow({ type: "math_number", id: 'block1' }, [
                        field({ name: "NUM"}, [ 2 ]) ]) ])]) ])])])])]));

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
        block(
          { type: "when_green_flag_clicked", id: 'block4', x: 10, y: 10 }, [
            next({}, [
              block({ type: "wait", id: 'block1' }, [
                value({ name: "SECS" }, [
                  shadow({ type: "math_positive_number", id: 'block0' }, [
                    field({ name: "NUM"}, [ 1 ]) ])]),
                next({}, [
                  block({ type: "wait", id: 'block3' }, [
                    value({ name: "SECS" }, [
                      shadow({ type: "math_positive_number", id: 'block2' }, [
                        field({ name: "NUM"}, [ 2 ]) ])])])])])])])]));
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
//    console.log(pcode);

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
    expect(pcode).toBe('while True:\n  pass');
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
    expect(pcode).toBe('for _ in range(1):\n  pass');
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
    expect(pcode).toBe('while not 1 == 0:\n  pass');
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
      () => ScratchBlocks.Python.workspaceToCode(workspace)).toThrow();
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

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('def f():\n  pass');
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
def f():\n\
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
def f():\n\
  time.sleep(1)\n\
  time.sleep(2)\n');
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
    expect(pcode).toBe('if 1 < 2:\n  pass');
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
  pass');
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
  pass');
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

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
import time\n\n\n\
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
  } finally {
    workspace.dispose();
  }
});
