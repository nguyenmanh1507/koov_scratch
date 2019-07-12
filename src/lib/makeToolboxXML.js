// import { ScratchBlocks } from '../javascripts/pages/blocks/ScratchBlocks';

// const categorySeparator = '<sep gap="36"/>';
// const categorySeparator = '<sep gap="36"/>';
// const blockSeparator = '<sep gap="36"/>';

const control = () => {
  return `
  <category name="%{BKY_CATEGORY_CONTROL}" id="control" colour="#2cc3ea" secondaryColour="#2cc3ea">
    <block type="when_green_flag_clicked"></block>
    <block type="function"></block>
    <block type="wait">
      <value name="SECS">
        <shadow type="math_positive_number">
          <field name="NUM"></field>
        </shadow>
      </value>
    </block>
    <block type="forever"/>
    <block type="repeat">
      <value name="COUNT">
        <shadow type="math_whole_number">
          <field name="NUM"></field>
        </shadow>
      </value>
    </block>
    <block type="if_then"/>
    <block type="if_then_else"/>
    <block type="wait_until"/>
    <block type="repeat_until"/>
    <block type="breakpoint"/>
  </category>
  `;
};

const operator = () => {
  return `
  <category name="%{BKY_CATEGORY_OPERATORS}" id="operators" colour="#427ce2" secondaryColour="#427ce2">
    <block type="plus">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="minus">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="multiply">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="divide">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="less_than">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM" />
        </shadow>
      </value>
    </block>
    <block type="less_than_or_equal">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM" />
        </shadow>
      </value>
    </block>
    <block type="equal">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM" />
        </shadow>
      </value>
    </block>
    <block type="greater_than">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM" />
        </shadow>
      </value>
    </block>
    <block type="greater_than_or_equal">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM" />
        </shadow>
      </value>
    </block>
    <block type="pick_random">
      <value name="FROM">
        <shadow type="math_number">
          <field name="NUM" />
        </shadow>
      </value>
      <value name="TO">
        <shadow type="math_number">
          <field name="NUM" />
        </shadow>
      </value>
    </block>
    <block type="and" />
    <block type="or" />
    <block type="not" />
    <block type="mod">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="round">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
  </category>
  `;
};

const xmlOpen = '<xml style="display: none">';
const xmlClose = '</xml>';

const makeToolboxXML = () => {
  return [xmlOpen, control(), operator(), xmlClose].join('\n');
};

export default makeToolboxXML;
