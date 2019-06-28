import ScratchBlocks from 'scratch-blocks';

import {javascript} from '../generators/javascript';
import {control} from '../generators/javascript/control';
import {control_blocks} from './control';

javascript(ScratchBlocks);
control(ScratchBlocks);

ScratchBlocks.Scrollbar.scrollbarThickness = 8;

// Disable workspace context menu
ScratchBlocks.WorkspaceSvg.prototype.showContextMenu_ = function() {};

// Modify start block size
//ScratchBlocks.BlockSvg.START_HAT_PATH = 'c 25,-22 91,-22 116,0';
//ScratchBlocks.BlockSvg.START_HAT_HEIGHT = 0;

const originalDrawLeft = ScratchBlocks.BlockSvg.prototype.renderDrawLeft_;
ScratchBlocks.BlockSvg.prototype.renderDrawLeft_ = function(steps) {
  const result = originalDrawLeft.call(this, steps);
  if (this.startHat_) {
    // start block
    steps[1] = 'm 0, 16 ' + steps[1];
    steps[6] = steps[6] - 16;
  }
  return result;
};

const originalRenderFields = ScratchBlocks.BlockSvg.prototype.renderFields_;
ScratchBlocks.BlockSvg.prototype.renderFields_ = function(fieldList, cursorX, cursorY) {
  if (this.startHat_) {
    cursorY = cursorY + 4;
  }
  return originalRenderFields.call(this, fieldList, cursorX, cursorY);
};

const originalRenderDraw = ScratchBlocks.BlockSvg.prototype.renderDraw_;
ScratchBlocks.BlockSvg.prototype.renderDraw_ = function(iconWidth, inputRows) {
  if (!this.outputConnection && !this.previousConnection) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, 120);
  }
  return originalRenderDraw.call(this, iconWidth, inputRows);
};
// end modify start block size

/*
// Colours
ScratchBlocks.Colours.overrideColours({
  // text color is defined by css.
  event: {
    primary: '#ffe19b', // block
    secondary: '#ffd26e', // highlight
    tertiary: '#e6be6e', // border
  },
  motion: {
    primary: '#bedcff',
    secondary: '#91c3ff',
    tertiary: '#8cb9f0',
  },
  stackGlow: '#ffc847',
});

*/
for (const blockName in control_blocks) {
  ScratchBlocks.Blocks[blockName] = {
    init: function() {
      this.jsonInit(control_blocks[blockName]);
    },
  };
}

// Toolbox

const add_category = (toolbox, blockTypes, blocks, _colour) => {

  toolbox += `<category name="Control">`;
  for (const blockType of blockTypes) {
    if (blocks[blockType]) {
      toolbox += `<block type="${blockType}"></block>`;
    }
  }

  toolbox += `</category>`;
  return toolbox;
};

const makeToolBox = (blockTypes) => {
  let toolbox = '<xml id="toolbox" style="display: none">';
  toolbox = add_category(toolbox, blockTypes, control_blocks,"5ba55b");
  toolbox = add_category(toolbox, blockTypes, control_blocks,"5ba55b");
  toolbox += '</xml>';

  console.info("@@@", toolbox);

  return toolbox;
};

let allBlocks = [];
for (const blockName in control_blocks) {
  allBlocks.push(blockName);
}

export { ScratchBlocks, makeToolBox, allBlocks };
