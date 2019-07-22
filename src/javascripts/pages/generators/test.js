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

const { xml, block, next, value, shadow, field, statement } = [
  'xml', 'block', 'next', 'value', 'shadow', 'field', 'statement'
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

const Bstart = (...blks) => (
  chain_blocks(block({ type: "when_green_flag_clicked" }, []), blks));

const Bforever = (...blks) => {
  if (blks.length === 0)
    return block({ type: "forever" }, []);
  return block({ type: "forever" }, [
    statement({ name: "BLOCKS"}, [
      chain_blocks(blks[0], blks.slice(1)) ])]);
};

const Brepeat = (n, blks) => {
  if (blks.length === 0)
    return (
      block({ type: "repeat" }, [
        value({ name: "COUNT" }, Bnumber(n, "math_whole_number"))]));
  return block({ type: "repeat" }, [
    value({ name: "COUNT" }, Bnumber(n, "math_whole_number")),
    statement({ name: "BLOCKS"}, [
      chain_blocks(blks[0], blks.slice(1)) ])]);
};

const Bif_then = (condition, blks) => {
  if (blks.length === 0)
    return (
      block({ type: "if_then" }, [
        value({ name: "CONDITION" }, [ condition ])]));
  return block({ type: "if_then" }, [
    value({ name: "CONDITION" }, [ condition ]),
    statement({ name: "BLOCKS"}, [
      chain_blocks(blks[0], blks.slice(1)) ])]);
};

const Bif_then_else = (condition, then_blks, else_blks) => {
  if (then_blks.length === 0 && else_blks.length === 0)
    return (
      block({ type: "if_then_else" }, [
        value({ name: "CONDITION" }, [ condition ])]));
  if (else_blks.length === 0)
    return block({ type: "if_then_else" }, [
      value({ name: "CONDITION" }, [ condition ]),
      statement({ name: "THEN_BLOCKS"}, [
        chain_blocks(then_blks[0], then_blks.slice(1)) ])]);
  if (then_blks.length === 0)
    return block({ type: "if_then_else" }, [
      value({ name: "CONDITION" }, [ condition ]),
      statement({ name: "ELSE_BLOCKS"}, [
        chain_blocks(else_blks[0], else_blks.slice(1)) ])]);
  return block({ type: "if_then_else" }, [
    value({ name: "CONDITION" }, [ condition ]),
    statement({ name: "THEN_BLOCKS"}, [
      chain_blocks(then_blks[0], then_blks.slice(1)) ]),
    statement({ name: "ELSE_BLOCKS"}, [
      chain_blocks(else_blks[0], else_blks.slice(1)) ])]);
};

const Bnumber = (n, type) => {
  if (n === null)
    return [ shadow({ type: type }, [ field({ name: "NUM"}, []) ])];
  if (typeof n === 'number')
    return [ shadow({ type: type }, [ field({ name: "NUM"}, [ n ]) ])];
  return [
    shadow({ type: type }, [ field({ name: "NUM"}, []) ]),
    n ];
};

const Bwait = n => (
  block({ type: "wait" }, [
    value({ name: "SECS" }, Bnumber(n, "math_positive_number")) ]));

const binop = (name, xname, yname) => (x, y) => (
  block({ type: name }, [
    value({ name: xname ? xname : "X" }, Bnumber(x, "math_number")),
    value({ name: yname ? yname : "Y" }, Bnumber(y, "math_number")) ]));

const Bplus = binop('plus');
const Bminus = binop('minus');;
const Bmultiply = binop('multiply');
const Bdivide = binop('divide');
const Bpick_random = binop('pick_random', 'FROM', 'TO');
const Bless_than = binop('less_than');
const Bless_than_or_equal = binop('less_than_or_equal');
const Bequal = binop('equal');
const Bgreater_than = binop('greater_than');
const Bgreater_than_or_equal = binop('greater_than_or_equal');

test('wait notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom1 = j2e(
      xml({}, [
        block({ type: "when_green_flag_clicked" }, [
          next({}, [
            block({ type: "wait" }, [
              value({ name: "SECS" }, [
                shadow({ type: "math_positive_number" }, [
                  field({ name: "NUM"}, [ 999 ]) ])])])])])]));
    const dom2 = j2e(
      xml({}, [
        Bstart(
          Bwait(999))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);
    ScratchBlocks.Xml.workspaceToDom(workspace);

    // const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    // console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('forever notation (empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom1 = j2e(
      xml({}, [
        block({ type: "when_green_flag_clicked" }, [
          next({}, [
            block({ type: "forever" }, [])])])]));
    const dom2 = j2e(
      xml({}, [
        Bstart(
          Bforever())]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);
    ScratchBlocks.Xml.workspaceToDom(workspace);

    // const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    // console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('forever notation (non empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom1 = j2e(
      xml({}, [
        block({ type: "when_green_flag_clicked" }, [
          next({}, [
            block({ type: "forever" }, [
              statement({ name: "BLOCKS"}, [
                block({ type: "wait" }, [
                  value({ name: "SECS" }, [
                    shadow({ type: "math_positive_number" }, [
                      field({ name: "NUM"}, [ 999 ]) ])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        Bstart(
          Bforever(
            Bwait(999)))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);
    ScratchBlocks.Xml.workspaceToDom(workspace);

    // const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    // console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('repeat notation (no count and empty blocks)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom1 = j2e(
      xml({}, [
        block({ type: "when_green_flag_clicked" }, [
          next({}, [
            block({ type: "repeat" }, [
              value({ name: "COUNT" }, [
                shadow({ type: "math_whole_number" }, [
                  field({ name: "NUM" })])])])])])]));
    const dom2 = j2e(
      xml({}, [
        Bstart(
          Brepeat(null, []))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);
    ScratchBlocks.Xml.workspaceToDom(workspace);
  } finally {
    workspace.dispose();
  }
});

test('repeat notation (count == 1 and empty blocks)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom1 = j2e(
      xml({}, [
        block({ type: "when_green_flag_clicked" }, [
          next({}, [
            block({ type: "repeat" }, [
              value({ name: "COUNT" }, [
                shadow({ type: "math_whole_number" }, [
                  field({ name: "NUM" }, [1])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        Bstart(
          Brepeat(1, []))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);
    ScratchBlocks.Xml.workspaceToDom(workspace);
  } finally {
    workspace.dispose();
  }
});

test('repeat notation (count == 1 and single blocks)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom1 = j2e(
      xml({}, [
        block({ type: "when_green_flag_clicked" }, [
          next({}, [
            block({ type: "repeat" }, [
              value({ name: "COUNT" }, [
                shadow({ type: "math_whole_number" }, [
                  field({ name: "NUM" }, [1])])]),
              statement({ name: "BLOCKS" }, [
                block({ type: "wait" }, [
                  value({ name: "SECS" }, [
                    shadow({ type: "math_positive_number" }, [
                      field({ name: "NUM"}, [ 2 ]) ])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        Bstart(
          Brepeat(1, [ Bwait(2) ]))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);
    ScratchBlocks.Xml.workspaceToDom(workspace);
  } finally {
    workspace.dispose();
  }
});

test('repeat notation (count == 1 and single blocks)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom1 = j2e(
      xml({}, [
        block({ type: "when_green_flag_clicked" }, [
          next({}, [
            block({ type: "repeat" }, [
              value({ name: "COUNT" }, [
                shadow({ type: "math_whole_number" }, [
                  field({ name: "NUM" }, [1])])]),
              statement({ name: "BLOCKS" }, [
                block({ type: "wait" }, [
                  value({ name: "SECS" }, [
                    shadow({ type: "math_positive_number" }, [
                      field({ name: "NUM"}, [ 2 ]) ])]),
                  next({}, [
                    block({ type: "wait" }, [
                      value({ name: "SECS" }, [
                        shadow({ type: "math_positive_number" }, [
                          field({ name: "NUM"}, [ 3 ]) ])])])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        Bstart(
          Brepeat(1, [ Bwait(2), Bwait(3) ]))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);
    ScratchBlocks.Xml.workspaceToDom(workspace);
  } finally {
    workspace.dispose();
  }
});

test('wait(1 + 2) notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom1 = j2e(
      xml({}, [
        block({ type: "when_green_flag_clicked" }, [
          next({}, [
            block({ type: "wait" }, [
              value({ name: "SECS" }, [
                shadow({ type: "math_positive_number" }, [
                  field({ name: "NUM"}, []) ]),
                block({ type: "plus" }, [
                  value({ name: "X" }, [
                    shadow({ type: "math_number" }, [
                      field({ name: "NUM"}, [ 1 ]) ]) ]),
                  value({ name: "Y" }, [
                    shadow({ type: "math_number" }, [
                      field({ name: "NUM"}, [ 2 ]) ]) ])]) ])])])])]));

    const dom2 = j2e(
      xml({}, [
        Bstart(
          Bwait(Bplus(1, 2)))]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);
    ScratchBlocks.Xml.workspaceToDom(workspace);

    // const dom3 = ScratchBlocks.Xml.workspaceToDom(workspace);
    // console.log('dom3 %o', xmlserializer.serializeToString(dom3));
  } finally {
    workspace.dispose();
  }
});

test('when_green_flag_clicked notation', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom1 = j2e(
      xml({}, [
        block({ type: "when_green_flag_clicked" }, [
          next({}, [
            block({ type: "wait" }, [
              value({ name: "SECS" }, [
                shadow({ type: "math_positive_number" }, [
                  field({ name: "NUM"}, [ 1 ]) ])]),
              next({}, [
                block({ type: "wait" }, [
                  value({ name: "SECS" }, [
                    shadow({ type: "math_positive_number" }, [
                      field({ name: "NUM"}, [ 2 ]) ])])])])])])])]));
    const dom2 = j2e(
      xml({}, [
        Bstart(
          Bwait(1),
          Bwait(2) )]));

    expect(dom1).toEqual(dom2);
    ScratchBlocks.Xml.domToWorkspace(dom2, workspace);
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for when_green_flag_clicked is under construction.
 */

test('when_green_flag_clicked with empty blocks', () => {
  const workspace = new ScratchBlocks.Workspace();
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

/*
 * Tests for - and /.
 */

test('1 - 2', () => {
  const workspace = new ScratchBlocks.Workspace();
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

/*
 * Mix of + and -, or, * and /.
 */

test('1 + (2 - 3)', () => {
  const workspace = new ScratchBlocks.Workspace();
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

/*
 * Comparators.
 */

test('1 < 2', () => {
  const workspace = new ScratchBlocks.Workspace();
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

/*
 * Tests for wait block.
 */

test('wait(1)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom = j2e(
      xml({}, [ Bwait(1) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('time.sleep(1)\n');
  } finally {
    workspace.dispose();
  }
});

test('wait(1 + 2)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom = j2e(
      xml({}, [ Bwait(Bplus(1, 2)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('time.sleep(1 + 2)\n');
  } finally {
    workspace.dispose();
  }
});

/*
 * Tests for forever block.
 */

test('forever(empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
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
  try {
    const dom = j2e(
      xml({}, [ Bforever(Bwait(1)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('while True:\n  time.sleep(1)\n');
  } finally {
    workspace.dispose();
  }
});

test('forever(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom = j2e(
      xml({}, [ Bforever(Bwait(1), Bwait(2)) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
while True:\n\
  time.sleep(1)\n\
  time.sleep(2)\n');
  } finally {
    workspace.dispose();
  }
});

test('nested forever(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
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
  try {
    const dom = j2e(
      xml({}, [ Brepeat(Bplus(1, 2), [ Bwait(1) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('for _ in range(1 + 2):\n  time.sleep(1)\n');
  } finally {
    workspace.dispose();
  }
});

test('repeat(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom = j2e(
      xml({}, [ Brepeat(1, [ Bwait(1), Bwait(2) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
for _ in range(1):\n\
  time.sleep(1)\n\
  time.sleep(2)\n');
  } finally {
    workspace.dispose();
  }
});

test('nested repeat(with two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
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
 * Tests for if then.
 */

test('if then(empty)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom = j2e(
      xml({}, [ Bif_then(Bless_than(1, 2), []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('if 1 < 2:\n  pass');
  } finally {
    workspace.dispose();
  }
});

test('if then(single wait)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom = j2e(
      xml({}, [ Bif_then(Bless_than(1, 2), [ Bwait(3) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
if 1 < 2:\n\
  time.sleep(3)\n');
  } finally {
    workspace.dispose();
  }
});

test('if then(two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom = j2e(
      xml({}, [ Bif_then(Bless_than(1, 2), [ Bwait(3), Bwait(4) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
if 1 < 2:\n\
  time.sleep(3)\n\
  time.sleep(4)\n');
  } finally {
    workspace.dispose();
  }
});

test('if then(nested two waits)', () => {
  const workspace = new ScratchBlocks.Workspace();
  try {
    const dom = j2e(
      xml({}, [
        Bif_then(Bless_than(1, 2), [
          Bwait(3),
          Bwait(4),
          Bif_then(Bgreater_than(5, 6), [
            Bwait(7),
            Bwait(8) ])]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
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
  try {
    const dom = j2e(
      xml({}, [ Bif_then_else(Bless_than(1, 2), [], []) ]));

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
  try {
    const dom = j2e(
      xml({}, [ Bif_then_else(Bless_than(1, 2), [ Bwait(3) ], []) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
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
  try {
    const dom = j2e(
      xml({}, [ Bif_then_else(Bless_than(1, 2), [], [ Bwait(3) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
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
  try {
    const dom = j2e(
      xml({}, [
        Bif_then_else(Bless_than(1, 2), [ Bwait(3) ], [ Bwait(4) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
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
  try {
    const dom = j2e(
      xml({}, [
        Bif_then_else(
          Bless_than(1, 2),
          [ Bwait(3), Bwait(4) ],
          [ Bwait(5), Bwait(6) ]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
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
  try {
    const dom = j2e(
      xml({}, [
        Bif_then_else(
          Bless_than(1, 2),
          [
            Bwait(3),
            Bwait(4),
            Bif_then_else(
              Bgreater_than(5, 6),
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
              Bequal(13, 14),
              [
                Bwait(15),
                Bwait(16) ],
              [
                Bwait(17),
                Bwait(18) ])]) ]));

    ScratchBlocks.Xml.domToWorkspace(dom, workspace);

    const pcode = ScratchBlocks.Python.workspaceToCode(workspace);
    expect(pcode).toBe('\
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
