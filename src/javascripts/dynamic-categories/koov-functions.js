// @flow
import ScratchBlocks from 'scratch-blocks';

const KoovFunctions = {};

KoovFunctions.FunctionsCategory = function(workspace: ScratchBlocks) {
  const xmlList = [];

  // Make a list button
  KoovFunctions.addCreateButton(xmlList, workspace);
  const variableModelList = workspace.getVariablesOfType(
    ScratchBlocks.FUNCTION_VARIABLE_TYPE
  );
  variableModelList.sort(ScratchBlocks.VariableModel.compareByName);
  if (variableModelList.length > 0) {
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
    const firstVariable = variableModelList[0];
    KoovFunctions.addFunction(xmlList, firstVariable);
  }

  for (let i = 0; i < variableModelList.length; i++) {
    KoovFunctions.addDataFunction(xmlList, variableModelList[i]);
  }

  return xmlList;
};

KoovFunctions.addCreateButton = function(
  xmlList: Array<Object>,
  workspace: any
) {
  const button = document.createElement('button');

  const msg = 'Make a function';
  const callbackKey = 'CREATE_KOOV_FUNCTION';
  const callback = function(button) {
    ScratchBlocks.Variables.createVariable(
      button.getTargetWorkspace(),
      null,
      ScratchBlocks.FUNCTION_VARIABLE_TYPE
    );
  };

  button.setAttribute('text', msg);
  button.setAttribute('callbackKey', callbackKey);
  workspace.registerButtonCallback(callbackKey, callback);
  xmlList.push(button);
};

KoovFunctions.addDataFunction = function(
  xmlList: Array<Object>,
  variable: Object
) {
  // <block id="functionId" type="call_function">
  //    <field name="FUNCTION">functionname</field>
  // </block>
  KoovFunctions.addBlock(xmlList, variable, 'call_function', 'FUNCTION');
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute('id', variable.getId());
};

KoovFunctions.addFunction = function(xmlList: Array<Object>, variable: Object) {
  // <block type="function">
  //   <field name="FUNCTION" variabletype="function" id="">functionname</field>
  // </block>
  KoovFunctions.addBlock(xmlList, variable, 'function', 'FUNCTION');
};

KoovFunctions.addBlock = function(
  xmlList: Array<any>,
  variable: Object,
  blockType: string,
  fieldName: string
) {
  if (ScratchBlocks.Blocks[blockType]) {
    let firstValueField = '';
    let secondValueField = '';

    const gap = 8;
    const blockText =
      '<xml>' +
      '<block type="' +
      blockType +
      '" gap="' +
      gap +
      '">' +
      KoovFunctions.generateVariableFieldXml_(variable, fieldName) +
      firstValueField +
      secondValueField +
      '</block>' +
      '</xml>';
    const block = ScratchBlocks.Xml.textToDom(blockText).firstChild;
    xmlList.push(block);
  }
};

/**** Blockly.Variables *****/

KoovFunctions.generateVariableFieldXml_ = function(
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

export default KoovFunctions;
