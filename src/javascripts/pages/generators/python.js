/**
 * @license
 * Visual Blocks Language
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


export function python(ScratchBlocks) {

  /**
   * Python code generator.
   * @type {!Blockly.Generator}
   */
  ScratchBlocks.Python = new ScratchBlocks.Generator('Python');

  /**
   * List of illegal variable names.
   * This is not intended to be a security feature.  ScratchBlocks is 100% client-side,
   * so bypassing this list is trivial.  This is intended to prevent users from
   * accidentally clobbering a built-in object or function.
   * @private
   */
  ScratchBlocks.Python.addReservedWords(
    // import keyword
    // print(','.join(sorted(keyword.kwlist)))
    // https://docs.python.org/3/reference/lexical_analysis.html#keywords
    // https://docs.python.org/2/reference/lexical_analysis.html#keywords
    'False,None,True,and,as,assert,break,class,continue,def,del,elif,else,' +
    'except,exec,finally,for,from,global,if,import,in,is,lambda,nonlocal,not,' +
    'or,pass,print,raise,return,try,while,with,yield,' +
    // https://docs.python.org/3/library/constants.html
    // https://docs.python.org/2/library/constants.html
    'NotImplemented,Ellipsis,__debug__,quit,exit,copyright,license,credits,' +
    // >>> print(','.join(sorted(dir(__builtins__))))
    // https://docs.python.org/3/library/functions.html
    // https://docs.python.org/2/library/functions.html
    'ArithmeticError,AssertionError,AttributeError,BaseException,' +
    'BlockingIOError,BrokenPipeError,BufferError,BytesWarning,' +
    'ChildProcessError,ConnectionAbortedError,ConnectionError,' +
    'ConnectionRefusedError,ConnectionResetError,DeprecationWarning,EOFError,' +
    'Ellipsis,EnvironmentError,Exception,FileExistsError,FileNotFoundError,' +
    'FloatingPointError,FutureWarning,GeneratorExit,IOError,ImportError,' +
    'ImportWarning,IndentationError,IndexError,InterruptedError,' +
    'IsADirectoryError,KeyError,KeyboardInterrupt,LookupError,MemoryError,' +
    'ModuleNotFoundError,NameError,NotADirectoryError,NotImplemented,' +
    'NotImplementedError,OSError,OverflowError,PendingDeprecationWarning,' +
    'PermissionError,ProcessLookupError,RecursionError,ReferenceError,' +
    'ResourceWarning,RuntimeError,RuntimeWarning,StandardError,' +
    'StopAsyncIteration,StopIteration,SyntaxError,SyntaxWarning,SystemError,' +
    'SystemExit,TabError,TimeoutError,TypeError,UnboundLocalError,' +
    'UnicodeDecodeError,UnicodeEncodeError,UnicodeError,' +
    'UnicodeTranslateError,UnicodeWarning,UserWarning,ValueError,Warning,' +
    'ZeroDivisionError,_,__build_class__,__debug__,__doc__,__import__,' +
    '__loader__,__name__,__package__,__spec__,abs,all,any,apply,ascii,' +
    'basestring,bin,bool,buffer,bytearray,bytes,callable,chr,classmethod,cmp,' +
    'coerce,compile,complex,copyright,credits,delattr,dict,dir,divmod,' +
    'enumerate,eval,exec,execfile,exit,file,filter,float,format,frozenset,' +
    'getattr,globals,hasattr,hash,help,hex,id,input,int,intern,isinstance,' +
    'issubclass,iter,len,license,list,locals,long,map,max,memoryview,min,' +
    'next,object,oct,open,ord,pow,print,property,quit,range,raw_input,reduce,' +
    'reload,repr,reversed,round,set,setattr,slice,sorted,staticmethod,str,' +
    'sum,super,tuple,type,unichr,unicode,vars,xrange,zip'
  );

  /**
   * Order of operation ENUMs.
   * http://docs.python.org/reference/expressions.html#summary
   */
  ScratchBlocks.Python.ORDER_ATOMIC = 0;            // 0 "" ...
  ScratchBlocks.Python.ORDER_COLLECTION = 1;        // tuples, lists, dictionaries
  ScratchBlocks.Python.ORDER_STRING_CONVERSION = 1; // `expression...`
  ScratchBlocks.Python.ORDER_MEMBER = 2.1;          // . []
  ScratchBlocks.Python.ORDER_FUNCTION_CALL = 2.2;   // ()
  ScratchBlocks.Python.ORDER_EXPONENTIATION = 3;    // **
  ScratchBlocks.Python.ORDER_UNARY_SIGN = 4;        // + -
  ScratchBlocks.Python.ORDER_BITWISE_NOT = 4;       // ~
  ScratchBlocks.Python.ORDER_MULTIPLICATIVE = 5;    // * / // %
  ScratchBlocks.Python.ORDER_ADDITIVE = 6;          // + -
  ScratchBlocks.Python.ORDER_BITWISE_SHIFT = 7;     // << >>
  ScratchBlocks.Python.ORDER_BITWISE_AND = 8;       // &
  ScratchBlocks.Python.ORDER_BITWISE_XOR = 9;       // ^
  ScratchBlocks.Python.ORDER_BITWISE_OR = 10;       // |
  ScratchBlocks.Python.ORDER_RELATIONAL = 11;       // in, not in, is, is not,
                                              //     <, <=, >, >=, <>, !=, ==
  ScratchBlocks.Python.ORDER_LOGICAL_NOT = 12;      // not
  ScratchBlocks.Python.ORDER_LOGICAL_AND = 13;      // and
  ScratchBlocks.Python.ORDER_LOGICAL_OR = 14;       // or
  ScratchBlocks.Python.ORDER_CONDITIONAL = 15;      // if else
  ScratchBlocks.Python.ORDER_LAMBDA = 16;           // lambda
  ScratchBlocks.Python.ORDER_NONE = 99;             // (...)

  /**
   * List of outer-inner pairings that do NOT require parentheses.
   * @type {!Array.<!Array.<number>>}
   */
  ScratchBlocks.Python.ORDER_OVERRIDES = [
    // (foo()).bar -> foo().bar
    // (foo())[0] -> foo()[0]
    [ScratchBlocks.Python.ORDER_FUNCTION_CALL, ScratchBlocks.Python.ORDER_MEMBER],
    // (foo())() -> foo()()
    [ScratchBlocks.Python.ORDER_FUNCTION_CALL, ScratchBlocks.Python.ORDER_FUNCTION_CALL],
    // (foo.bar).baz -> foo.bar.baz
    // (foo.bar)[0] -> foo.bar[0]
    // (foo[0]).bar -> foo[0].bar
    // (foo[0])[1] -> foo[0][1]
    [ScratchBlocks.Python.ORDER_MEMBER, ScratchBlocks.Python.ORDER_MEMBER],
    // (foo.bar)() -> foo.bar()
    // (foo[0])() -> foo[0]()
    [ScratchBlocks.Python.ORDER_MEMBER, ScratchBlocks.Python.ORDER_FUNCTION_CALL],

    // not (not foo) -> not not foo
    [ScratchBlocks.Python.ORDER_LOGICAL_NOT, ScratchBlocks.Python.ORDER_LOGICAL_NOT],
    // a and (b and c) -> a and b and c
    [ScratchBlocks.Python.ORDER_LOGICAL_AND, ScratchBlocks.Python.ORDER_LOGICAL_AND],
    // a or (b or c) -> a or b or c
    [ScratchBlocks.Python.ORDER_LOGICAL_OR, ScratchBlocks.Python.ORDER_LOGICAL_OR]
  ];

  /**
   * Initialise the database of variable names.
   * @param {!ScratchBlocks.Workspace} workspace Workspace to generate code from.
   */
  ScratchBlocks.Python.init = function (workspace) {
    var i;
    /**
     * Empty loops or conditionals are not allowed in Python.
     */
    ScratchBlocks.Python.PASS = this.INDENT + 'pass\n';
    // Create a dictionary of definitions to be printed before the code.
    ScratchBlocks.Python.definitions_ = Object.create(null);
    // Create a dictionary mapping desired function names in definitions_
    // to actual function names (to avoid collisions with user functions).
    ScratchBlocks.Python.functionNames_ = Object.create(null);

    if (!ScratchBlocks.Python.variableDB_) {
      ScratchBlocks.Python.variableDB_ =
        new ScratchBlocks.Names(ScratchBlocks.Python.RESERVED_WORDS_);
    } else {
      ScratchBlocks.Python.variableDB_.reset();
    }

    ScratchBlocks.Python.variableDB_.setVariableMap(workspace.getVariableMap());

    var defvars = [];
    // Add developer variables (not created or named by the user).
    var devVarList = ScratchBlocks.Variables.allDeveloperVariables(workspace);
    for (i = 0; i < devVarList.length; i++) {
      defvars.push(ScratchBlocks.Python.variableDB_.getName(devVarList[i],
        ScratchBlocks.Names.DEVELOPER_VARIABLE_TYPE) + ' = None');
    }

    // Add user variables, but only ones that are being used.
    /*
    var variables = ScratchBlocks.Variables.allUsedVarModels(workspace);
    for (i = 0; i < variables.length; i++) {
      defvars.push(ScratchBlocks.Python.variableDB_.getName(variables[i].getId(),
        ScratchBlocks.Variables.NAME_TYPE) + ' = None');
    }
    */

    ScratchBlocks.Python.definitions_['variables'] = defvars.join('\n');
  };

  /**
   * Prepend the generated code with the variable definitions.
   * @param {string} code Generated code.
   * @return {string} Completed code.
   */
  ScratchBlocks.Python.finish = function (code) {
    // Convert the definitions dictionary into a list.
    var imports = [];
    var definitions = [];
    for (var name in ScratchBlocks.Python.definitions_) {
      var def = ScratchBlocks.Python.definitions_[name];
      if (def.match(/^(from\s+\S+\s+)?import\s+\S+/)) {
        imports.push(def);
      } else {
        definitions.push(def);
      }
    }
    // Clean up temporary data.
    delete ScratchBlocks.Python.definitions_;
    delete ScratchBlocks.Python.functionNames_;
    ScratchBlocks.Python.variableDB_.reset();
    var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
    return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
  };

  /**
   * Naked values are top-level blocks with outputs that aren't plugged into
   * anything.
   * @param {string} line Line of generated code.
   * @return {string} Legal line of code.
   */
  ScratchBlocks.Python.scrubNakedValue = function (line) {
    return line + '\n';
  };

  /**
   * Encode a string as a properly escaped Python string, complete with quotes.
   * @param {string} string Text to encode.
   * @return {string} Python string.
   * @private
   */
  ScratchBlocks.Python.quote_ = function (string) {
    // Can't use goog.string.quote since % must also be escaped.
    string = string.replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\\n');

    // Follow the CPython behaviour of repr() for a non-byte string.
    var quote = '\'';
    if (string.indexOf('\'') !== -1) {
      if (string.indexOf('"') === -1) {
        quote = '"';
      } else {
        string = string.replace(/'/g, '\\\'');
      }
    }

    return quote + string + quote;
  };

  /**
   * Common tasks for generating Python from blocks.
   * Handles comments for the specified block and any connected value blocks.
   * Calls any statements following this block.
   * @param {!ScratchBlocks.Block} block The current block.
   * @param {string} code The Python code created for this block.
   * @param {boolean=} opt_thisOnly True to generate code for only this statement.
   * @return {string} Python code with comments and subsequent blocks added.
   * @private
   */
  ScratchBlocks.Python.scrub_ = function (block, code, opt_thisOnly) {
    var commentCode = '';
    // Only collect comments for blocks that aren't inline.
    if (!block.outputConnection || !block.outputConnection.targetConnection) {
      // Collect comment for this block.
      let comment = block.getCommentText();
      comment = ScratchBlocks.utils.wrap(comment, ScratchBlocks.Python.COMMENT_WRAP - 3);
      if (comment) {
        if (block.getProcedureDef) {
          // Use a comment block for function comments.
          commentCode += '"""' + comment + '\n"""\n';
        } else {
          commentCode += ScratchBlocks.Python.prefixLines(comment + '\n', '# ');
        }
      }
      // Collect comments for all value arguments.
      // Don't collect comments for nested statements.
      for (var i = 0; i < block.inputList.length; i++) {
        if (block.inputList[i].type == ScratchBlocks.INPUT_VALUE) {
          var childBlock = block.inputList[i].connection.targetBlock();
          if (childBlock) {
            let comment = ScratchBlocks.Python.allNestedComments(childBlock);
            if (comment) {
              commentCode += ScratchBlocks.Python.prefixLines(comment, '# ');
            }
          }
        }
      }
    }
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    var nextCode = opt_thisOnly ? '' : ScratchBlocks.Python.blockToCode(nextBlock);
    return commentCode + code + nextCode;
  };

  /**
   * Gets a property and adjusts the value, taking into account indexing, and
   * casts to an integer.
   * @param {!ScratchBlocks.Block} block The block.
   * @param {string} atId The property ID of the element to get.
   * @param {number=} opt_delta Value to add.
   * @param {boolean=} opt_negate Whether to negate the value.
   * @return {string|number}
   */
  ScratchBlocks.Python.getAdjustedInt = function (block, atId, opt_delta, opt_negate) {
    var delta = opt_delta || 0;
    if (block.workspace.options.oneBasedIndex) {
      delta--;
    }
    var defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
    var atOrder = delta ? ScratchBlocks.Python.ORDER_ADDITIVE :
      ScratchBlocks.Python.ORDER_NONE;
    var at = ScratchBlocks.Python.valueToCode(block, atId, atOrder) || defaultAtIndex;

    if (ScratchBlocks.isNumber(at)) {
      // If the index is a naked number, adjust it right now.
      at = parseInt(at, 10) + delta;
      if (opt_negate) {
        at = -at;
      }
    } else {
      // If the index is dynamic, adjust it in code.
      if (delta > 0) {
        at = 'int(' + at + ' + ' + delta + ')';
      } else if (delta < 0) {
        at = 'int(' + at + ' - ' + -delta + ')';
      } else {
        at = 'int(' + at + ')';
      }
      if (opt_negate) {
        at = '-' + at;
      }
    }
    return at;
  };
}