
export function control(ScratchBlocks) {
  ScratchBlocks.Python['when_green_flag_clicked'] = function (_block) {
    return "start();\n";
  };

  ScratchBlocks.Python['wait'] = function (block) {
    var secs = block.getInputTargetBlock('SECS');
    return `sleep(${secs});\n`;
  };
}
