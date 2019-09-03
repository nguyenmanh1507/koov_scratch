// @flow
import ScratchBlocks from 'scratch-blocks';
import escape from 'lodash/escape';

const KoovVariables = {};

ScratchBlocks.Msg.NEW_LED = 'Make a led';
ScratchBlocks.Msg.NEW_LED_TITLE = 'New led name:';
ScratchBlocks.DEFAULT_LIST_ITEM = '';
ScratchBlocks.Msg.DEFAULT_LIST_ITEM = '';

KoovVariables.variablesCategory = function(workspace: ScratchBlocks) {
  let variableModelList = workspace.getVariablesOfType('');
  variableModelList.sort(ScratchBlocks.VariableModel.compareByName);
  const xmlList = [];

  // Make a variable button
  KoovVariables.addCreateButton(xmlList, workspace, 'VARIABLE');

  for (let i = 0; i < variableModelList.length; i++) {
    KoovVariables.addDataVariable(xmlList, variableModelList[i]);
  }

  if (variableModelList.length > 0) {
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
    const firstVariable = variableModelList[0];

    KoovVariables.addSetVariableTo(xmlList, firstVariable);
    KoovVariables.addChangeVariableBy(xmlList, firstVariable);
    // KoovVariables.addShowVariable(xmlList, firstVariable);
    // KoovVariables.addHideVariable(xmlList, firstVariable);
  }

  KoovVariables.addSep(xmlList);

  // Make a list button
  KoovVariables.addCreateButton(xmlList, workspace, 'LIST');
  variableModelList = workspace.getVariablesOfType(
    ScratchBlocks.LIST_VARIABLE_TYPE
  );
  variableModelList.sort(ScratchBlocks.VariableModel.compareByName);
  for (let i = 0; i < variableModelList.length; i++) {
    KoovVariables.addDataList(xmlList, variableModelList[i]);
  }

  if (variableModelList.length > 0) {
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
    const firstVariable = variableModelList[0];

    KoovVariables.addAddToList(xmlList, firstVariable);
    KoovVariables.addDeleteOfList(xmlList, firstVariable);
    // KoovVariables.addDeleteAllOfList(xmlList, firstVariable);
    KoovVariables.addInsertAtList(xmlList, firstVariable);
    KoovVariables.addReplaceItemOfList(xmlList, firstVariable);
    // KoovVariables.addSep(xmlList);
    KoovVariables.addItemOfList(xmlList, firstVariable);
    // KoovVariables.addItemNumberOfList(xmlList, firstVariable);
    KoovVariables.addLengthOfList(xmlList, firstVariable);
    KoovVariables.addListContainsItem(xmlList, firstVariable);
    // KoovVariables.addSep(xmlList);
    // KoovVariables.addShowList(xmlList, firstVariable);
    // KoovVariables.addHideList(xmlList, firstVariable);
  }

  KoovVariables.addSep(xmlList);

  // Make a led button
  KoovVariables.addCreateButton(xmlList, workspace, 'LED');
  variableModelList = workspace.getVariablesOfType(
    ScratchBlocks.LED_VARIABLE_TYPE
  );
  variableModelList.sort(ScratchBlocks.VariableModel.compareByName);
  for (let i = 0; i < variableModelList.length; i++) {
    KoovVariables.addDataLed(xmlList, variableModelList[i]);
  }

  if (variableModelList.length > 0) {
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
    const firstVariable = variableModelList[0];
    KoovVariables.addLedMatrix(xmlList, firstVariable);
  }

  return xmlList;
};

KoovVariables.createVariableButtonHandler = function(
  workspace: any,
  opt_callback?: (text: ?string) => void,
  opt_type?: string
) {
  // const
  const type = opt_type || '';
  let msg = '';

  const promptAndCheckWithAlert = function(defaultName: string) {
    KoovVariables.promptName(
      ScratchBlocks.Msg['NEW_VARIABLE_TITLE'],
      defaultName,
      function(text) {
        if (text) {
          const existing = KoovVariables.nameUsedWithAnyType_(
            text,
            null,
            workspace
          );
          if (existing) {
            const lowerCase = text.toLowerCase();
            if (existing.type == type) {
              msg = ScratchBlocks.Msg['VARIABLE_ALREADY_EXISTS'].replace(
                '%1',
                lowerCase
              );
            } else {
              msg =
                ScratchBlocks.Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE'];
              msg = msg.replace('%1', lowerCase).replace('%2', existing.type);
            }
            ScratchBlocks.alert('', function() {
              promptAndCheckWithAlert(text); // Recurse
            });
          } else {
            // No conflict
            workspace.createVariable(text, type);
            if (opt_callback) {
              opt_callback(text);
            }
          }
        } else {
          // User canceled prompt.
          if (opt_callback) {
            opt_callback(null);
          }
        }
      }
    );
  };
  promptAndCheckWithAlert('');
};

KoovVariables.promptName = function(
  promptText: string,
  defaultText: string,
  callback: (newVar: ?string) => void
) {
  ScratchBlocks.prompt(promptText, defaultText, function(newVar) {
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').trim();
      if (
        newVar == ScratchBlocks.Msg['RENAME_VARIABLE'] ||
        newVar == ScratchBlocks.Msg['NEW_VARIABLE']
      ) {
        // Ok, not ALL names are legal...
        newVar = null;
      }
    }
    callback(newVar);
  });
};

KoovVariables.nameUsedWithAnyType_ = function(
  name: string,
  type: ?string,
  workspace: any
) {
  const allVariables = workspace.getVariableMap().getAllVariables();

  console.info(allVariables);

  name = name.toLowerCase();
  for (let i = 0, variable; (variable = allVariables[i]); i++) {
    if (variable.name.toLowerCase() == name && variable.type != type) {
      return variable;
    }
  }
  return null;
};

KoovVariables.flyoutCategoryBlocks = function(workspace: any) {
  const variableModelList = workspace.getVariablesOfType('');

  const xmlList = [];
  if (variableModelList.length > 0) {
    // New variables are added to the end of the variableModelList.
    const mostRecentVariable = variableModelList[variableModelList.length - 1];
    if (ScratchBlocks.Blocks['variable_ref']) {
      const block = ScratchBlocks.Xml.textToDom('<block></block>');
      block.setAttribute('type', 'variable_ref');
      block.setAttribute('gap', ScratchBlocks.Blocks['math_change'] ? 8 : 24);
      block.appendChild(
        KoovVariables.generateVariableFieldDom(mostRecentVariable)
      );
      xmlList.push(block);
    }
    //   if (ScratchBlocks.Blocks['math_change']) {
    //     var block = ScratchBlocks.utils.xml.createElement('block');
    //     block.setAttribute('type', 'math_change');
    //     block.setAttribute('gap', ScratchBlocks.Blocks['variables_get'] ? 20 : 8);
    //     block.appendChild(
    //       KoovVariables.generateVariableFieldDom(mostRecentVariable)
    //     );
    //     var value = ScratchBlocks.Xml.textToDom(
    //       '<value name="DELTA">' +
    //         '<shadow type="math_number">' +
    //         '<field name="NUM">1</field>' +
    //         '</shadow>' +
    //         '</value>'
    //     );
    //     block.appendChild(value);
    //     xmlList.push(block);
    //   }

    //   if (ScratchBlocks.Blocks['variables_get']) {
    //     variableModelList.sort(ScratchBlocks.VariableModel.compareByName);
    //     for (var i = 0, variable; (variable = variableModelList[i]); i++) {
    //       var block = ScratchBlocks.utils.xml.createElement('block');
    //       block.setAttribute('type', 'variables_get');
    //       block.setAttribute('gap', 8);
    //       block.appendChild(KoovVariables.generateVariableFieldDom(variable));
    //       xmlList.push(block);
    //     }
    //   }
  }
  return xmlList;
};

KoovVariables.generateVariableFieldDom = function(variableModel: Object) {
  /* Generates the following XML:
   * <field name="VAR" id="goKTKmYJ8DhVHpruv" variabletype="int">foo</field>
   */
  var field = ScratchBlocks.Xml.textToDom('<field></field>');
  field.setAttribute('name', 'VAR');
  field.setAttribute('id', variableModel.getId());
  field.setAttribute('variabletype', variableModel.type);
  var name = document.createTextNode(variableModel.name);
  field.appendChild(name);
  return field;
};

KoovVariables.addCreateButton = function(
  xmlList: Array<Object>,
  workspace: any,
  type: string
) {
  const button = document.createElement('button');
  // Set default msg, callbackKey, and callback values for type 'VARIABLE'
  let msg = ScratchBlocks.Msg.NEW_VARIABLE;
  let callbackKey = 'CREATE_VARIABLE';
  let callback = function(button) {
    ScratchBlocks.Variables.createVariable(
      button.getTargetWorkspace(),
      null,
      ''
    );
  };

  if (type === 'LIST') {
    msg = ScratchBlocks.Msg.NEW_LIST;
    callbackKey = 'CREATE_LIST';
    callback = function(button) {
      ScratchBlocks.Variables.createVariable(
        button.getTargetWorkspace(),
        null,
        ScratchBlocks.LIST_VARIABLE_TYPE
      );
    };
  }

  if (type === 'LED') {
    msg = ScratchBlocks.Msg.NEW_LED;
    callbackKey = 'CREATE_LED';
    callback = function(button) {
      ScratchBlocks.Variables.createVariable(
        button.getTargetWorkspace(),
        null,
        ScratchBlocks.LED_VARIABLE_TYPE
      );
    };
  }

  button.setAttribute('text', msg);
  button.setAttribute('callbackKey', callbackKey);
  workspace.registerButtonCallback(callbackKey, callback);
  xmlList.push(button);
};

KoovVariables.addDataVariable = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block id="variableId" type="variable_ref">
  //    <field name="NAME">variablename</field>
  // </block>
  KoovVariables.addBlock(xmlList, variable, 'variable_ref', 'NAME');
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute('id', variable.getId());
};

KoovVariables.addSetVariableTo = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block type="set_variable_to" gap="20">
  //   <value name="NAME">
  //    <shadow type="data_variablemenu"></shadow>
  //   </value>
  //   <value name="VALUE">
  //     <shadow type="math_number">
  //       <field name="NUM">0</field>
  //     </shadow>
  //   </value>
  // </block>
  KoovVariables.addBlock(xmlList, variable, 'set_variable_to', 'NAME', [
    'VALUE',
    'math_number',
    0,
  ]);
};

KoovVariables.addChangeVariableBy = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block type="change_variable_by">
  //   <value name="NAME">
  //    <shadow type="data_variablemenu"></shadow>
  //   </value>
  //   <value name="VALUE">
  //     <shadow type="math_number">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  KoovVariables.addBlock(xmlList, variable, 'change_variable_by', 'NAME', [
    'VALUE',
    'math_number',
    1,
  ]);
};

KoovVariables.addDataList = function(xmlList: Array<Object>, variable: Object) {
  // <block id="variableId" type="list">
  //    <field name="LIST">variablename</field>
  // </block>
  KoovVariables.addBlock(xmlList, variable, 'list', 'LIST');
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute('id', variable.getId());
};

KoovVariables.addAddToList = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block type="list_add">
  //   <field name="NAME" variabletype="list" id="">variablename</field>
  //   <value name="VALUE">
  //     <shadow type="math_number">
  //       <field name="NUM">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  KoovVariables.addBlock(xmlList, variable, 'list_add', 'NAME', [
    'VALUE',
    'math_number',
    ScratchBlocks.DEFAULT_LIST_ITEM,
  ]);
};

KoovVariables.addDeleteOfList = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block type="list_delete">
  //   <field name="NAME" variabletype="list" id="">variablename</field>
  //   <value name="POSITION">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  KoovVariables.addBlock(xmlList, variable, 'list_delete', 'NAME', [
    'POSITION',
    'math_integer',
    1,
  ]);
};

KoovVariables.addInsertAtList = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block type="list_insert">
  //   <field name="NAME" variabletype="list" id="">variablename</field>
  //   <value name="POSITION">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="VALUE">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  KoovVariables.addBlock(
    xmlList,
    variable,
    'list_insert',
    'NAME',
    ['POSITION', 'math_integer', 1],
    ['VALUE', 'text', ScratchBlocks.Msg.DEFAULT_LIST_ITEM]
  );
};

KoovVariables.addReplaceItemOfList = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block type="list_replace">
  //   <field name="NAME" variabletype="list" id="">variablename</field>
  //   <value name="POSITION">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="VALUE">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  KoovVariables.addBlock(
    xmlList,
    variable,
    'list_replace',
    'NAME',
    ['POSITION', 'math_integer', 1],
    ['VALUE', 'text', ScratchBlocks.Msg.DEFAULT_LIST_ITEM]
  );
};

KoovVariables.addItemOfList = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block type="list_ref">
  //   <field name="NAME" variabletype="list" id="">variablename</field>
  //   <value name="POSITION">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  KoovVariables.addBlock(xmlList, variable, 'list_ref', 'NAME', [
    'POSITION',
    'math_integer',
    1,
  ]);
};

KoovVariables.addLengthOfList = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block type="list_length">
  //   <field name="NAME" variabletype="list" id="">variablename</field>
  // </block>
  KoovVariables.addBlock(xmlList, variable, 'list_length', 'NAME');
};

KoovVariables.addListContainsItem = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block type="list_contain">
  //   <field name="NAME" variabletype="list" id="">variablename</field>
  //   <value name="VALUE">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  KoovVariables.addBlock(xmlList, variable, 'list_contain', 'NAME', [
    'VALUE',
    'text',
    ScratchBlocks.Msg.DEFAULT_LIST_ITEM,
  ]);
};

KoovVariables.addDataLed = function(xmlList: Array<Object>, variable: Object) {
  // <block id="ledId" type="led_ref">
  //    <field name="LED">ledname</field>
  // </block>
  KoovVariables.addBlock(xmlList, variable, 'led_ref', 'LED');
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute('id', variable.getId());
};

KoovVariables.addLedMatrix = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block id="ledId" type="led_matrix">
  //   <field name="LED">ledname</field>
  //   <field name="PORT">port</field>
  //   <value name="X">
  //     <shadow type="math_integer">
  //        <field name="NUM">0</field>
  //     </shadow>
  //     <shadow type="math_integer">
  //        <field name="NUM">0</field>
  //     </shadow>
  //   </value>
  // </block>
  KoovVariables.addBlock(
    xmlList,
    variable,
    'led_matrix',
    'IMAGE',
    ['X', 'math_integer', 0],
    ['Y', 'math_integer', 0]
  );
};

KoovVariables.addBlock = function(
  xmlList: Array<any>,
  variable: Object,
  blockType: string,
  fieldName: string,
  opt_value?: Array<any>,
  opt_secondValue?: Array<any>
) {
  if (ScratchBlocks.Blocks[blockType]) {
    let firstValueField = '';
    let secondValueField = '';
    if (opt_value) {
      firstValueField = KoovVariables.createValue(
        opt_value[0],
        opt_value[1],
        opt_value[2]
      );
    }
    if (opt_secondValue) {
      secondValueField = KoovVariables.createValue(
        opt_secondValue[0],
        opt_secondValue[1],
        opt_secondValue[2]
      );
    }

    const gap = 8;
    const blockText =
      '<xml>' +
      '<block type="' +
      blockType +
      '" gap="' +
      gap +
      '">' +
      KoovVariables.generateVariableFieldXml_(variable, fieldName) +
      firstValueField +
      secondValueField +
      '</block>' +
      '</xml>';
    const block = ScratchBlocks.Xml.textToDom(blockText).firstChild;
    xmlList.push(block);
  }
};

KoovVariables.createValue = function(
  valueName: string,
  type: string,
  value: string
) {
  let fieldName = '';
  switch (valueName) {
    case 'NAME':
      fieldName = 'TEXT';
      break;
    case 'POSITION':
    case 'X':
    case 'Y':
      fieldName = 'NUM';
      break;
    case 'VALUE':
      if (type === 'math_number') {
        fieldName = 'NUM';
      } else {
        fieldName = 'TEXT';
      }
      break;
  }
  const valueField =
    '<value name="' +
    valueName +
    '">' +
    '<shadow type="' +
    type +
    '">' +
    '<field name="' +
    fieldName +
    '">' +
    value +
    '</field>' +
    '</shadow>' +
    '</value>';
  return valueField;
};

KoovVariables.addSep = function(xmlList: Array<any>) {
  var gap = 60;
  var sepText = '<xml>' + '<sep gap="' + gap + '"/>' + '</xml>';
  var sep = ScratchBlocks.Xml.textToDom(sepText).firstChild;
  xmlList.push(sep);
};

/**** Blockly.Variables *****/

KoovVariables.generateVariableFieldXml_ = function(
  variableModel: Object,
  opt_name: string
) {
  // The variable name may be user input, so it may contain characters that need
  // to be escaped to create valid XML.
  var typeString = variableModel.type;
  if (typeString == '') {
    typeString = "''";
  }
  var fieldName = opt_name || 'VARIABLE';
  var text =
    '<field name="' +
    fieldName +
    '" id="' +
    variableModel.getId() +
    '" variabletype="' +
    escape(typeString) +
    '">' +
    escape(variableModel.name) +
    '</field>';
  return text;
};

export default KoovVariables;
