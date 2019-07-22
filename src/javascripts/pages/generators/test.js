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

const Bplus = (x, y) => (
  block({ type: "plus" }, [
    value({ name: "X" }, Bnumber(x, "math_number")),
    value({ name: "Y" }, Bnumber(y, "math_number")) ]));

const Bmultiply = (x, y) => (
  block({ type: "multiply" }, [
    value({ name: "X" }, Bnumber(x, "math_number")),
    value({ name: "Y" }, Bnumber(y, "math_number")) ]));

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

//    expect(true).toBe(true);
//    expect(() => { throw new Error(3); }).toThrow();
  } finally {
    workspace.dispose();
  }
});

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
