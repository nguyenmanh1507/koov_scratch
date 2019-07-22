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
// import { operator_blocks } from './operators';
// import { motion_blocks } from './motion';
// import { variable_blocks } from './variable';

generator(ScratchBlocks);
python(ScratchBlocks);
python_control(ScratchBlocks);

javascript(ScratchBlocks);
javascript_control(ScratchBlocks);

ScratchBlocks.Scrollbar.scrollbarThickness = 8;

// Disable workspace context menu
ScratchBlocks.WorkspaceSvg.prototype.showContextMenu_ = function() {};

export {
  ScratchBlocks,
  // makeToolBox,
  // allBlocks
};
