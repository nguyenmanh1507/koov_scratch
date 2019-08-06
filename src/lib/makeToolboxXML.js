// import { ScratchBlocks } from '../javascripts/pages/blocks/ScratchBlocks';

// const categorySeparator = '<sep gap="36"/>';
// const categorySeparator = '<sep gap="36"/>';
// const blockSeparator = '<sep gap="36"/>';

const control = () => {
  return `
  <category name="%{BKY_CATEGORY_CONTROL}" id="control" colour="#2cc3ea" secondaryColour="#2cc3ea">
    <block type="when_green_flag_clicked"></block>
    <block type="function"></block>
    <block type="call_function"></block>
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
    <block type="servomotor_synchronized_motion"/>
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

const motion = () => {
  return `
  <category name="%{BKY_CATEGORY_MOTION}" id="motion" colour="#83ca32" secondaryColour="#83ca32">
    <block type="set_servomotor_degree">
      <value name="DEGREE">
        <shadow type="math_angle">
          <field name="NUM">0</field>
        </shadow>
      </value>
    </block>
    <block type="set_dcmotor_power">
      <value name="POWER">
        <shadow type="math_number">
          <field name="NUM">0</field>
        </shadow>
      </value>
    </block>
    <block type="turn_dcmotor_on"></block>
    <block type="turn_dcmotor_off"></block>
    <block type="buzzer_on">
      <value name="FREQUENCY">
        <shadow type="note">
          <field name="NOTE">60</field>
        </shadow>
      </value>
    </block>
    <block type="buzzer_off"></block>
    <block type="turn_led"></block>
    <block type="multi_led">
      <value name="R">
        <shadow type="math_number">
          <field name="NUM">0</field>
        </shadow>
      </value>
      <value name="B">
        <shadow type="math_number">
          <field name="NUM">0</field>
        </shadow>
      </value>
      <value name="G">
        <shadow type="math_number">
          <field name="NUM">0</field>
        </shadow>
      </value>
    </block>
  </category>
  `;
};

const sensing = () => {
  return `
  <category name="%{BKY_CATEGORY_SENSING}" id="sensing" colour="#20b583" secondaryColour="#20b583">
    <block type="light_sensor_value"></block>
    <block type="sound_sensor_value"></block>
    <block type="touch_sensor_value"></block>
    <block type="ir_photo_reflector_value"></block>
    <block type="3_axis_digital_accelerometer_value"></block>
    <block type="button_value"></block>
    <block type="reset_timer"></block>
    <block type="timer"></block>
    <block type="color_sensor_value"></block>
    <block type="ultrasonic_distance_sensor"></block>
  </category>
  `;
};

const variable = () => {
  return `
  <category name="Variables" id="variable" colour="#f27f62" secondaryColour="#f27f62">
    <block type="variable_ref"></block>
    <block type="set_variable_to">
      <value name="VALUE">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="change_variable_by">
      <value name="VALUE">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="list_add">
      <value name="VALUE">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="list_delete">
      <value name="POSITION">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="list_insert">
      <value name="VALUE">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="POSITION">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="list_replace">      
      <value name="POSITION">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
      <value name="VALUE">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="list_ref">
      <value name="VALUE">
        <shadow type="math_number">
          <field name="NUM"/>
        </shadow>
      </value>
    </block>
    <block type="list_length"></block>
    <block type="led_matrix">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM">0</field>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM">0</field>
        </shadow>
      </value>
      <value name="IMAGE">
        <shadow type="text">
          <field name="TEXT"></field>
        </shadow>
      </value>
    </block>
  </category>
  `;
};

const xmlOpen = '<xml style="display: none">';
const xmlClose = '</xml>';

const makeToolboxXML = () => {
  return [
    xmlOpen,
    control(),
    motion(),
    sensing(),
    operator(),
    variable(),
    xmlClose,
  ].join('\n');
};

export default makeToolboxXML;
