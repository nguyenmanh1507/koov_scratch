/* eslint-disable no-redeclare */
import ScratchBlocks from 'scratch-blocks';

import { javascript } from '../generators/javascript';
import { control } from '../generators/javascript/control';
import './control';
import './operators';
// import { operator_blocks } from './operators';
// import { motion_blocks } from './motion';
// import { variable_blocks } from './variable';

javascript(ScratchBlocks);
control(ScratchBlocks);

ScratchBlocks.Scrollbar.scrollbarThickness = 8;

// Disable workspace context menu
ScratchBlocks.WorkspaceSvg.prototype.showContextMenu_ = function() {};

// Modify start block size
// ScratchBlocks.BlockSvg.START_HAT_PATH = 'c 25,-22 91,-22 116,0';
// ScratchBlocks.BlockSvg.START_HAT_HEIGHT = 0;

// const originalDrawLeft = ScratchBlocks.BlockSvg.prototype.renderDrawLeft_;
// ScratchBlocks.BlockSvg.prototype.renderDrawLeft_ = function(steps) {
//   const result = originalDrawLeft.call(this, steps);
//   if (this.startHat_) {
//     // start block
//     steps[1] = 'm 0, 16 ' + steps[1];
//     steps[6] = steps[6] - 16;
//   }
//   return result;
// };

export {
  ScratchBlocks
  // makeToolBox,
  // allBlocks
};
