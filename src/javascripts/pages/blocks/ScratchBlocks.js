// @flow
/* eslint-disable no-redeclare */
import ScratchBlocks from 'scratch-blocks';

import { generator } from '../generators/generator';
import { python } from '../generators/python';
import { control as python_control } from '../generators/python/control';

import { javascript } from '../generators/javascript';
import { control as javascript_control } from '../generators/javascript/control';

import './control';
import './operators';
import './motion';
import './sensing';
import './variable';
// import { operator_blocks } from './operators';
// import { motion_blocks } from './motion';
// import { variable_blocks } from './variable';

ScratchBlocks.LED_VARIABLE_TYPE = 'led';
ScratchBlocks.Msg.NEW_LED_TITLE = 'New led name:';
ScratchBlocks.Msg.LED_MODAL_TITLE = 'New led';
ScratchBlocks.FUNCTION_VARIABLE_TYPE = 'function';
ScratchBlocks.Msg.NEW_FUNCTION_TITLE = 'New function name:';
ScratchBlocks.Msg.FUNCTION_MODAL_TITLE = 'New function';
ScratchBlocks.Msg.RENAME_FUNCTION = 'Rename function';
ScratchBlocks.Msg.DELETE_FUNCTION = 'Delete the "%1" function';
ScratchBlocks.Msg.RENAME_FUNCTION_TITLE = 'Rename function "%1" to:';
ScratchBlocks.Msg.RENAME_FUNCTION_MODAL_TITLE = 'Rename Function';

generator(ScratchBlocks);
python(ScratchBlocks);
python_control(ScratchBlocks);

javascript(ScratchBlocks);
javascript_control(ScratchBlocks);

ScratchBlocks.Scrollbar.scrollbarThickness = 8;

// Disable workspace context menu
ScratchBlocks.WorkspaceSvg.prototype.showContextMenu_ = function() {};

// Override ScratchBlocks varibale function
ScratchBlocks.FieldVariable.dropdownCreate = function() {
  if (!this.variable_) {
    throw new Error(
      'Tried to call dropdownCreate on a variable field with no' +
        ' variable selected.'
    );
  }
  let variableModelList = [];
  const name = this.getText();
  let workspace = null;
  if (this.sourceBlock_) {
    workspace = this.sourceBlock_.workspace;
  }
  if (workspace) {
    let variableTypes = this.getVariableTypes_();
    variableModelList = [];
    // Get a copy of the list, so that adding rename and new variable options
    // doesn't modify the workspace's list.
    for (let i = 0; i < variableTypes.length; i++) {
      const variableType = variableTypes[i];
      const variables = workspace.getVariablesOfType(variableType);
      variableModelList = variableModelList.concat(variables);

      const potentialVarMap = workspace.getPotentialVariableMap();
      if (potentialVarMap) {
        const potentialVars = potentialVarMap.getVariablesOfType(variableType);
        variableModelList = variableModelList.concat(potentialVars);
      }
    }
  }
  variableModelList.sort(ScratchBlocks.VariableModel.compareByName);

  const options = [];
  for (let i = 0; i < variableModelList.length; i++) {
    // Set the uuid as the internal representation of the variable.
    options[i] = [variableModelList[i].name, variableModelList[i].getId()];
  }
  if (this.defaultType_ == ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
    options.unshift([
      ScratchBlocks.Msg.NEW_BROADCAST_MESSAGE,
      ScratchBlocks.NEW_BROADCAST_MESSAGE_ID,
    ]);
  } else {
    // Scalar variables and lists have the same backing action, but the option
    // text is different.
    if (this.defaultType_ == ScratchBlocks.LIST_VARIABLE_TYPE) {
      var renameText = ScratchBlocks.Msg.RENAME_LIST;
      var deleteText = ScratchBlocks.Msg.DELETE_LIST;
    } else if (this.defaultType_ == ScratchBlocks.FUNCTION_VARIABLE_TYPE) {
      var renameText = ScratchBlocks.Msg.RENAME_FUNCTION;
      var deleteText = ScratchBlocks.Msg.DELETE_FUNCTION;
    } else {
      var renameText = ScratchBlocks.Msg.RENAME_VARIABLE;
      var deleteText = ScratchBlocks.Msg.DELETE_VARIABLE;
    }
    options.push([renameText, ScratchBlocks.RENAME_VARIABLE_ID]);
    if (deleteText) {
      options.push([
        deleteText.replace('%1', name),
        ScratchBlocks.DELETE_VARIABLE_ID,
      ]);
    }
  }

  return options;
};

ScratchBlocks.Variables.renameVariable = function(
  workspace,
  variable,
  opt_callback
) {
  // Validation and modal message/title depends on the variable type
  let promptMsg, modalTitle;
  const varType = variable.type;
  if (varType == ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
    console.warn(
      'Unexpected attempt to rename a broadcast message with ' +
        'id: ' +
        variable.getId() +
        ' and name: ' +
        variable.name
    );
    return;
  }
  if (varType == ScratchBlocks.LIST_VARIABLE_TYPE) {
    promptMsg = ScratchBlocks.Msg.RENAME_LIST_TITLE;
    modalTitle = ScratchBlocks.Msg.RENAME_LIST_MODAL_TITLE;
  } else if (varType == ScratchBlocks.FUNCTION_VARIABLE_TYPE) {
    promptMsg = ScratchBlocks.Msg.RENAME_FUNCTION_TITLE;
    modalTitle = ScratchBlocks.Msg.RENAME_FUNCTION_MODAL_TITLE;
  } else {
    // Default for all other types of variables
    promptMsg = ScratchBlocks.Msg.RENAME_VARIABLE_TITLE;
    modalTitle = ScratchBlocks.Msg.RENAME_VARIABLE_MODAL_TITLE;
  }
  const validate = ScratchBlocks.Variables.nameValidator_.bind(null, varType);

  const promptText = promptMsg.replace('%1', variable.name);
  let promptDefaultText = variable.name;
  if (
    variable.isCloud &&
    variable.name.indexOf(ScratchBlocks.Variables.CLOUD_PREFIX) == 0
  ) {
    promptDefaultText = promptDefaultText.substring(
      ScratchBlocks.Variables.CLOUD_PREFIX.length
    );
  }

  ScratchBlocks.prompt(
    promptText,
    promptDefaultText,
    function(newName, additionalVars) {
      if (
        variable.isCloud &&
        newName.length > 0 &&
        newName.indexOf(ScratchBlocks.Variables.CLOUD_PREFIX) == 0
      ) {
        newName = newName.substring(
          ScratchBlocks.Variables.CLOUD_PREFIX.length
        );
        // The name validator will add the prefix back
      }
      additionalVars = additionalVars || [];
      var additionalVarNames = variable.isLocal ? [] : additionalVars;
      var validatedText = validate(
        newName,
        workspace,
        additionalVarNames,
        variable.isCloud
      );
      if (validatedText) {
        workspace.renameVariableById(variable.getId(), validatedText);
        if (opt_callback) {
          opt_callback(newName);
        }
      } else {
        // User canceled prompt without a value.
        if (opt_callback) {
          opt_callback(null);
        }
      }
    },
    modalTitle,
    varType
  );
};

ScratchBlocks.Variables.createVariable = function(
  workspace,
  opt_callback,
  opt_type
) {
  // Decide on a modal message based on the opt_type. If opt_type was not
  // provided, default to the original message for scalar variables.
  var newMsg, modalTitle;
  if (opt_type == ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
    newMsg = ScratchBlocks.Msg.NEW_BROADCAST_MESSAGE_TITLE;
    modalTitle = ScratchBlocks.Msg.BROADCAST_MODAL_TITLE;
  } else if (opt_type == ScratchBlocks.LIST_VARIABLE_TYPE) {
    newMsg = ScratchBlocks.Msg.NEW_LIST_TITLE;
    modalTitle = ScratchBlocks.Msg.LIST_MODAL_TITLE;
  } else if (opt_type == ScratchBlocks.LED_VARIABLE_TYPE) {
    newMsg = ScratchBlocks.Msg.NEW_LED_TITLE;
    modalTitle = ScratchBlocks.Msg.LED_MODAL_TITLE;
  } else if (opt_type == ScratchBlocks.FUNCTION_VARIABLE_TYPE) {
    newMsg = ScratchBlocks.Msg.NEW_FUNCTION_TITLE;
    modalTitle = ScratchBlocks.Msg.FUNCTION_MODAL_TITLE;
  } else {
    // Note: this case covers 1) scalar variables, 2) any new type of
    // variable not explicitly checked for above, and 3) a null or undefined
    // opt_type -- turns a falsey opt_type into ''
    // TODO (#1251) Warn developers that they didn't provide an opt_type/provided
    // a falsey opt_type
    opt_type = opt_type ? opt_type : '';
    newMsg = ScratchBlocks.Msg.NEW_VARIABLE_TITLE;
    modalTitle = ScratchBlocks.Msg.VARIABLE_MODAL_TITLE;
  }
  var validate = ScratchBlocks.Variables.nameValidator_.bind(null, opt_type);

  // Prompt the user to enter a name for the variable
  ScratchBlocks.prompt(
    newMsg,
    '',
    function(data, additionalVars, variableOptions) {
      variableOptions = variableOptions || {};
      var scope = variableOptions.scope;
      var isLocal = scope === 'local' || false;
      var isCloud = variableOptions.isCloud || false;
      // Default to [] if additionalVars is not provided
      additionalVars = additionalVars || [];
      // Only use additionalVars for global variable creation.
      var additionalVarNames = isLocal ? [] : additionalVars;

      let text = '';
      if (opt_type === ScratchBlocks.LED_VARIABLE_TYPE) {
        text = data.varName;
      } else {
        text = data;
      }

      var validatedText = validate(
        text,
        workspace,
        additionalVarNames,
        isCloud,
        opt_callback
      );
      if (validatedText) {
        // The name is valid according to the type, create the variable
        var potentialVarMap = workspace.getPotentialVariableMap();
        var variable;
        // This check ensures that if a new variable is being created from a
        // workspace that already has a variable of the same name and type as
        // a potential variable, that potential variable gets turned into a
        // real variable and thus there aren't duplicate options in the field_variable
        // dropdown.
        if (potentialVarMap && opt_type) {
          variable = ScratchBlocks.Variables.realizePotentialVar(
            validatedText,
            opt_type,
            workspace,
            false
          );
        }
        if (!variable) {
          variable = workspace.createVariable(
            validatedText,
            opt_type,
            null,
            isLocal,
            isCloud
          );
        }

        var flyout = workspace.isFlyout ? workspace : workspace.getFlyout();
        var variableBlockId = variable.getId();
        if (flyout.setCheckboxState) {
          flyout.setCheckboxState(variableBlockId, true);
        }

        if (opt_callback) {
          opt_callback(variableBlockId);
        }
      } else {
        // User canceled prompt without a value.
        if (opt_callback) {
          opt_callback(null);
        }
      }
    },
    modalTitle,
    opt_type
  );
};

export { ScratchBlocks };
