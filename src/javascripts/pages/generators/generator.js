/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 */
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for generating executable code from
 * Blockly code.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

export function generator(ScratchBlocks)
{

  /**
   * Class for a code generator that translates the blocks into a language.
   * @param {string} name Language name of this generator.
   * @constructor
   */
  ScratchBlocks.Generator = function (name) {
    this.name_ = name;
    this.FUNCTION_NAME_PLACEHOLDER_REGEXP_ =
      new RegExp(this.FUNCTION_NAME_PLACEHOLDER_, 'g');
  };

  /**
   * Category to separate generated function names from variables and procedures.
   */
  ScratchBlocks.Generator.NAME_TYPE = 'generated_function';

  /**
   * Arbitrary code to inject into locations that risk causing infinite loops.
   * Any instances of '%1' will be replaced by the block ID that failed.
   * E.g. '  checkTimeout(%1);\n'
   * @type {?string}
   */
  ScratchBlocks.Generator.prototype.INFINITE_LOOP_TRAP = null;

  /**
   * Arbitrary code to inject before every statement.
   * Any instances of '%1' will be replaced by the block ID of the statement.
   * E.g. 'highlight(%1);\n'
   * @type {?string}
   */
  ScratchBlocks.Generator.prototype.STATEMENT_PREFIX = null;

  /**
   * The method of indenting.  Defaults to two spaces, but language generators
   * may override this to increase indent or change to tabs.
   * @type {string}
   */
  ScratchBlocks.Generator.prototype.INDENT = '  ';

  /**
   * Maximum length for a comment before wrapping.  Does not account for
   * indenting level.
   * @type {number}
   */
  ScratchBlocks.Generator.prototype.COMMENT_WRAP = 60;

  /**
   * List of outer-inner pairings that do NOT require parentheses.
   * @type {!Array.<!Array.<number>>}
   */
  ScratchBlocks.Generator.prototype.ORDER_OVERRIDES = [];

  /**
   * Generate code for all blocks in the workspace to the specified language.
   * @param {ScratchBlocks.Workspace} workspace Workspace to generate code from.
   * @return {string} Generated code.
   */
  ScratchBlocks.Generator.prototype.workspaceToCode = function (workspace) {
    if (!workspace) {
      // Backwards compatibility from before there could be multiple workspaces.
      console.warn('No workspace specified in workspaceToCode call.  Guessing.');
      workspace = ScratchBlocks.getMainWorkspace();
    }
    var code = [];
    this.init(workspace);
    var blocks = workspace.getTopBlocks(true);
    for (var x = 0, block; blocks[x]; x++) {
      block = blocks[x];
      var line = this.blockToCode(block);
      if (Array.isArray(line)) {
        // Value blocks return tuples of code and operator order.
        // Top-level blocks don't care about operator order.
        line = line[0];
      }
      if (line) {
        if (block.outputConnection) {
          // This block is a naked value.  Ask the language's code generator if
          // it wants to append a semicolon, or something.
          line = this.scrubNakedValue(line);
        }
        code.push(line);
        this.adjustCurrentLine_(2);
      }
    }
    code = code.join('\n');  // Blank line between each section.
    code = this.finish(code);
    // Final scrubbing of whitespace.
    //
    // But, don't delete newlines as it changes line numbers.
    code = code.replace(/^\s+\n/, '\n');
    code = code.replace(/\n\s+$/, '\n');
    code = code.replace(/[ \t]+\n/g, '\n');
    return code;
  };

// The following are some helpful functions which can be used by multiple
// languages.

  /**
   * Prepend a common prefix onto each line of code.
   * @param {string} text The lines of code.
   * @param {string} prefix The common prefix.
   * @return {string} The prefixed lines of code.
   */
  ScratchBlocks.Generator.prototype.prefixLines = function (text, prefix) {
    return prefix + text.replace(/(?!\n$)\n/g, '\n' + prefix);
  };

  /**
   * Recursively spider a tree of blocks, returning all their comments.
   * @param {!ScratchBlocks.Block} block The block from which to start spidering.
   * @return {string} Concatenated list of comments.
   */
  ScratchBlocks.Generator.prototype.allNestedComments = function (block) {
    var comments = [];
    var blocks = block.getDescendants(true);
    for (var i = 0; i < blocks.length; i++) {
      var comment = blocks[i].getCommentText();
      if (comment) {
        comments.push(comment);
      }
    }
    // Append an empty string to create a trailing line break when joined.
    if (comments.length) {
      comments.push('');
    }
    return comments.join('\n');
  };

  /**
   * Generate code for the specified block (and attached blocks).
   * @param {ScratchBlocks.Block} block The block to generate code for.
   * @param {boolean=} opt_thisOnly True to generate code for only this statement.
   * @return {string|!Array} For statement blocks, the generated code.
   *     For value blocks, an array containing the generated code and an
   *     operator order value.  Returns '' if block is null.
   */
  ScratchBlocks.Generator.prototype.blockToCode = function (block, opt_thisOnly) {
    if (!block) {
      return '';
    }
    if (block.disabled) {
      // Skip past this block if it is disabled.
      return opt_thisOnly ? '' : this.blockToCode(block.getNextBlock());
    }

    var func = this[block.type];
    if (typeof func != 'function') {
      throw Error('Language "' + this.name_ + '" does not know how to generate ' +
        ' code for block type "' + block.type + '".');
    }
    this.addLineNumberDb_(block);
    // First argument to func.call is the value of 'this' in the generator.
    // Prior to 24 September 2013 'this' was the only way to access the block.
    // The current prefered method of accessing the block is through the second
    // argument to func.call, which becomes the first parameter to the generator.
    var code = func.call(block, block);
    if (Array.isArray(code)) {
      // Value blocks return tuples of code and operator order.
      if (!block.outputConnection) {
        throw TypeError('Expecting string from statement block: ' + block.type);
      }
      return [this.scrub_(block, code[0], opt_thisOnly), code[1]];
    } else if (typeof code == 'string') {
      var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
      if (this.STATEMENT_PREFIX) {
        code = this.STATEMENT_PREFIX.replace(/%1/g, '\'' + id + '\'') + code;
      }
      return this.scrub_(block, code, opt_thisOnly);
    } else if (code === null) {
      // Block has handled code generation itself.
      return '';
    } else {
      throw SyntaxError('Invalid code generated: ' + code);
    }
  };

  /**
   * Generate code representing the specified value input.
   * @param {!ScratchBlocks.Block} block The block containing the input.
   * @param {string} name The name of the input.
   * @param {number} outerOrder The maximum binding strength (minimum order value)
   *     of any operators adjacent to "block".
   * @return {string} Generated code or '' if no blocks are connected or the
   *     specified input does not exist.
   */
  ScratchBlocks.Generator.prototype.valueToCode = function (block, name, outerOrder) {
    if (isNaN(outerOrder)) {
      throw TypeError('Expecting valid order from block: ' + block.type);
    }
    var targetBlock = block.getInputTargetBlock(name);
    if (!targetBlock) {
      return '';
    }
    var tuple = this.blockToCode(targetBlock);
    if (tuple === '') {
      // Disabled block.
      return '';
    }
    // Value blocks must return code and order of operations info.
    // Statement blocks must only return code.
    if (!Array.isArray(tuple)) {
      throw TypeError('Expecting tuple from value block: ' + targetBlock.type);
    }
    var code = tuple[0];
    var innerOrder = tuple[1];
    if (isNaN(innerOrder)) {
      throw TypeError('Expecting valid order from value block: ' +
        targetBlock.type);
    }
    if (!code) {
      return '';
    }

    // Add parentheses if needed.
    var parensNeeded = false;
    var outerOrderClass = Math.floor(outerOrder);
    var innerOrderClass = Math.floor(innerOrder);
    if (outerOrderClass <= innerOrderClass) {
      if (outerOrderClass == innerOrderClass &&
        (outerOrderClass == 0 || outerOrderClass == 99)) {
        // Don't generate parens around NONE-NONE and ATOMIC-ATOMIC pairs.
        // 0 is the atomic order, 99 is the none order.  No parentheses needed.
        // In all known languages multiple such code blocks are not order
        // sensitive.  In fact in Python ('a' 'b') 'c' would fail.
      } else {
        // The operators outside this code are stronger than the operators
        // inside this code.  To prevent the code from being pulled apart,
        // wrap the code in parentheses.
        parensNeeded = true;
        // Check for special exceptions.
        for (var i = 0; i < this.ORDER_OVERRIDES.length; i++) {
          if (this.ORDER_OVERRIDES[i][0] == outerOrder &&
            this.ORDER_OVERRIDES[i][1] == innerOrder) {
            parensNeeded = false;
            break;
          }
        }
      }
    }
    if (parensNeeded) {
      // Technically, this should be handled on a language-by-language basis.
      // However all known (sane) languages use parentheses for grouping.
      code = '(' + code + ')';
    }
    return code;
  };

  /**
   * Generate code representing the statement.  Indent the code.
   * @param {!ScratchBlocks.Block} block The block containing the input.
   * @param {string} name The name of the input.
   * @return {string} Generated code or '' if no blocks are connected.
   */
  ScratchBlocks.Generator.prototype.statementToCode = function (block, name) {
    var targetBlock = block.getInputTargetBlock(name);
    var code = this.blockToCode(targetBlock);
    // Value blocks must return code and order of operations info.
    // Statement blocks must only return code.
    if (typeof code != 'string') {
      throw TypeError('Expecting code from statement block: ' +
        (targetBlock && targetBlock.type));
    }
    if (code) {
      code = this.prefixLines(/** @type {string} */ (code), this.INDENT);
    }
    return code;
  };

  /**
   * Add an infinite loop trap to the contents of a loop.
   * If loop is empty, add a statment prefix for the loop block.
   * @param {string} branch Code for loop contents.
   * @param {string} id ID of enclosing block.
   * @return {string} Loop contents, with infinite loop trap added.
   */
  ScratchBlocks.Generator.prototype.addLoopTrap = function (branch, id) {
    id = id.replace(/\$/g, '$$$$');  // Issue 251.
    if (this.INFINITE_LOOP_TRAP) {
      branch = this.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + id + '\'') + branch;
    }
    if (this.STATEMENT_PREFIX) {
      branch += this.prefixLines(this.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + id + '\''), this.INDENT);
    }
    return branch;
  };

  /**
   * Comma-separated list of reserved words.
   * @type {string}
   * @private
   */
  ScratchBlocks.Generator.prototype.RESERVED_WORDS_ = '';

  /**
   * Add one or more words to the list of reserved words for this language.
   * @param {string} words Comma-separated list of words to add to the list.
   *     No spaces.  Duplicates are ok.
   */
  ScratchBlocks.Generator.prototype.addReservedWords = function (words) {
    this.RESERVED_WORDS_ += words + ',';
  };

  /**
   * This is used as a placeholder in functions defined using
   * ScratchBlocks.Generator.provideFunction_.  It must not be legal code that could
   * legitimately appear in a function definition (or comment), and it must
   * not confuse the regular expression parser.
   * @type {string}
   * @private
   */
  ScratchBlocks.Generator.prototype.FUNCTION_NAME_PLACEHOLDER_ = '{leCUI8hutHZI4480Dc}';

  /**
   * Define a function to be included in the generated code.
   * The first time this is called with a given desiredName, the code is
   * saved and an actual name is generated.  Subsequent calls with the
   * same desiredName have no effect but have the same return value.
   *
   * It is up to the caller to make sure the same desiredName is not
   * used for different code values.
   *
   * The code gets output when ScratchBlocks.Generator.finish() is called.
   *
   * @param {string} desiredName The desired name of the function (e.g., isPrime).
   * @param {!Array.<string>} code A list of statements.  Use '  ' for indents.
   * @return {string} The actual name of the new function.  This may differ
   *     from desiredName if the former has already been taken by the user.
   * @private
   */
  ScratchBlocks.Generator.prototype.provideFunction_ = function (desiredName, code) {
    if (!this.definitions_[desiredName]) {
      var functionName = this.variableDB_.getDistinctName(desiredName,
        ScratchBlocks.Procedures.NAME_TYPE);
      this.functionNames_[desiredName] = functionName;
      var codeText = code.join('\n').replace(
        this.FUNCTION_NAME_PLACEHOLDER_REGEXP_, functionName);
      // Change all '  ' indents into the desired indent.
      // To avoid an infinite loop of replacements, change all indents to '\0'
      // character first, then replace them all with the indent.
      // We are assuming that no provided functions contain a literal null char.
      var oldCodeText;
      while (oldCodeText != codeText) {
        oldCodeText = codeText;
        codeText = codeText.replace(/^(( {2})*) {2}/gm, '$1\0');
      }
      codeText = codeText.replace(/\0/g, this.INDENT);
      this.definitions_[desiredName] = codeText;
    }
    return this.functionNames_[desiredName];
  };

  /**
   * Hook for code to run before code generation starts.
   * Subclasses may override this, e.g. to initialise the database of variable
   * names.
   * @param {!ScratchBlocks.Workspace} _workspace Workspace to generate code from.
   */
  ScratchBlocks.Generator.prototype.init = function (_workspace) {
    // Optionally override
  };

  /**
   * Common tasks for generating code from blocks.  This is called from
   * blockToCode and is called on every block, not just top level blocks.
   * Subclasses may override this, e.g. to generate code for statements following
   * the block, or to handle comments for the specified block and any connected
   * value blocks.
   * @param {!ScratchBlocks.Block} _block The current block.
   * @param {string} code The JavaScript code created for this block.
   * @return {string} JavaScript code with comments and subsequent blocks added.
   * @private
   */
  ScratchBlocks.Generator.prototype.scrub_ = function (_block, code) {
    // Optionally override
    return code;
  };

  /**
   * Hook for code to run at end of code generation.
   * Subclasses may override this, e.g. to prepend the generated code with the
   * variable definitions.
   * @param {string} code Generated code.
   * @return {string} Completed code.
   */
  ScratchBlocks.Generator.prototype.finish = function (code) {
    // Optionally override
    return code;
  };

  /**
   * Naked values are top-level blocks with outputs that aren't plugged into
   * anything.
   * Subclasses may override this, e.g. if their language does not allow
   * naked values.
   * @param {string} line Line of generated code.
   * @return {string} Legal line of code.
   */
  ScratchBlocks.Generator.prototype.scrubNakedValue = function (line) {
    // Optionally override
    return line;
  };

  ScratchBlocks.Generator.prototype.symbolDb_ = Object.create(null);
  ScratchBlocks.Generator.prototype.reservedSymbols_ = [];
  ScratchBlocks.Generator.prototype.defineSymbol_ = function (key, value) {
    if (this.symbolDb_[key] && this.symbolDb_[key] !== value)
      throw new Error(
        `Symbol ${key} is already defined as ${this.symbolDb_[key]}`);
    this.symbolDb_[key] = value;
  };
  ScratchBlocks.Generator.prototype.referSymbol_ = function (key) {
    return this.symbolDb_[key];
  };
  ScratchBlocks.Generator.prototype.existingSymbol_ = function (value) {
    return this.reservedSymbols_.includes(value) ||
      Object.values(this.symbolDb_).includes(value);
  };
  ScratchBlocks.Generator.prototype.internSymbol_ = function (prefix, name) {
    return `${prefix}${name}`;
  };

  /*
   * Number of lines for prologue.  Calculated after blocks are
   * converted to code.
   */
  ScratchBlocks.Generator.prototype.prologueLineCount_ = 0;

  /*
   * Holds closure to calculate absolute line number for the current
   * line.
   */
  ScratchBlocks.Generator.prototype.currentLine_ = () => 0;

  /*
   * Start line offset database.  Used to adjust line number of
   * functions.
   */
  ScratchBlocks.Generator.prototype.startLineDb_ = Object.create(null);

  /*
   * Prepare to start counting line numbers for functions.  Line
   * numbers of functions are initially relative to the start of
   * function.
   */
  ScratchBlocks.Generator.prototype.setStartLine_ = function (tag) {
    if (this.startLineDb_[tag] !== undefined)
      throw new Error(`setStartLine_: Duplicated tag: ${tag}`);
    this.startLineDb_[tag] = 0;
    this.currentLine_ = () => this.startLineDb_[tag];
  };

  /*
   * Block id to line number database.
   */
  ScratchBlocks.Generator.prototype.lineNumberDb_ = Object.create(null);

  /*
   * Capture current line number for the given block.  The absolute
   * line number can be calculated after all conversions are done.
   */
  ScratchBlocks.Generator.prototype.addLineNumberDb_ = function (block) {
    this.lineNumberDb_[block.id] = this.currentLine_;
  };

  /*
   * Advance current line number by `n'.
   */
  ScratchBlocks.Generator.prototype.adjustCurrentLine_ = function (n) {
    const lineFn = this.currentLine_;
    this.currentLine_ = () => lineFn() + n;
  };

  /*
   * Calculated absolute line number for each blocks.
   */
  ScratchBlocks.Generator.prototype.blockIdToLineNumberMap = function (ws) {
    const v = Object.create(null);
    for (var id in this.lineNumberDb_) {
      v[id] = {
        type: ws.getBlockById(id).type,
        line: this.lineNumberDb_[id]()
      };
    }
    return v;
  };
}
