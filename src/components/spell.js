import React, { useState, useRef } from 'react';

import { Card, Collapse, Icon, Popover, Typography } from 'antd';
import './spell.css';
import SpellLogic from './spell-logic';

const { Panel } = Collapse;
const { Text } = Typography;


export default function Spell(props) {
    const[expanded, setExpanded] = useState(false);
    // check the spell to see if it is already known
    const[added, setAdded] = useState((props.spell && props.spell.known) || false);
    const dice_copy_input = useRef();
    const spell = props.spell;

//useEffect(() => console.log("Props player is", props.playerLevel), [props.playerLevel]);
//useEffect(() => console.log("Props slot is", props.slotLevel), [props.slotLevel]);

    function toggleExpanded() {
      setExpanded(!expanded);
    }

    function addSpell(e) {
      setAdded(true);
      spell.known = true;
      e.stopPropagation();
    }
    function removeSpell(e) {
      setAdded(false);
      spell.known = false;
      e.stopPropagation();
    }

    function preventClose(e) {
      e.stopPropagation();
    }

    // retrieve base damage info
    const base_damage_info = SpellLogic.getSpellBaseDamageInfo(spell);
    let base_damage_type,
      base_damage;
    if (base_damage_info) {
      base_damage = SpellLogic.getBaseDamage(base_damage_info);
      base_damage_type = SpellLogic.getBaseDamageType(base_damage_info);
    }

    // set colors based on damage type
    const DAMAGE_TYPE_COLOR_MAP = {
      acid: "green",
      bludgeoning: "brown",
      cold: "blue",
      fire: "red",
      force: "blue",
      lightning: "yellow",
      nature: "green",
      necrotic: "purple",
      radiant: "gold",
    };
    const icon_color = DAMAGE_TYPE_COLOR_MAP[base_damage_type];
    const slot_level_effects = SpellLogic.getSpellSlotLevelEffects(spell);
    const player_level_effects = SpellLogic.getSpellPlayerLevelEffects(spell);

    // retrieve the total dice rolled taking player level and slot level into account
    const actual_damage = SpellLogic.calculateDamage({
      spell_name: spell.name,
      player_level_effects: player_level_effects,
      slot_level_effects: slot_level_effects,
      base_damage: base_damage,
      damage_type: base_damage_type,
      slot_level: props.slotLevel,
      player_level: props.playerLevel,
    });

    // for copying the roll-20 roll command for this spell
    const roll_command_text = "/roll " + actual_damage;
    function copyToClipboard(e) {
      navigator.permissions.query({name: "clipboard-write"}).then(result => {
        if (result.state === "granted" || result.state === "prompt") {
          navigator.clipboard.writeText(roll_command_text);
        }
      });
      e.stopPropagation();
    }

    const add_remove_icon = added ?
      <Icon className="spell-card-icon" onClick={removeSpell} type="minus" style={{fontWeight: '700', fontSize: '16px', color: 'red'}} /> :
      <Icon className="spell-card-icon" onClick={addSpell} type="read" style={{fontWeight: '700', fontSize: '16px'}} />;

    const card_icon = <Icon className="spell-card-icon spell-card-icon--damage-type" type="heat-map" style={{color: icon_color}} />;

    const select_icon = <Icon type="file-jpg" onClick={(e) => {props.setIconSelectionSpell(spell);e.stopPropagation();}} />
    let spell_icon_img = null;
    if (spell.icon) {
      spell_icon_img = <img className="spell-icon-img" alt="icon" src={spell.icon}></img>
    }

    const title_html = <div>{spell_icon_img} <span>{spell.name}</span></div>

    let card_extra_damage_content = actual_damage ?
      <div className="spell-card-extra--damage-content">
        <Popover
          placement="topLeft"
          title={"Total Damage"}
          content={actual_damage}
          onClick={preventClose}
          trigger="click"
        >
          <Icon className="spell-card-icon" type="border-outer" />
        </Popover>
        <Icon className="spell-card-icon" type="copy" onClick={copyToClipboard}></Icon>
      </div>
      : null;

    const damage_type_display = <span style={{textTransform: "capitalize"}}>{ base_damage_type || "N/A"}</span>
    const card_extra_content = expanded ? <div className="spell-card-extra">
      <div className="spell-card-icons">
        {select_icon}
        {add_remove_icon}
        {card_extra_damage_content}
        {/* <Popover placement="topLeft" title={"Damage Type"} onClick={preventClose} content={base_damage_type || "N/A"} trigger="click"> */}
        <Popover placement="topLeft" title={"Damage Type"} onClick={preventClose} content={damage_type_display} trigger="click">
          {card_icon}
        </Popover>
      </div>
    </div>
    : null;

    const grid_container_styles = {
      display: "grid",
      fontSize: "14px",
      gridTemplateColumns: "1fr 2fr",
    };
    const grid_value_styles = {
      paddingLeft: "10px",
      textAlign: "left",
    };
    const grid_label_styles = {
      paddingLeft: "15px",
      textAlign: "right",
    };

    const main_content = 
      <div className="spell-card-description" onClick={preventClose}>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="Requirements" key="1">
            <div style={grid_container_styles}>
              <div style={grid_label_styles}><Text strong>Spell Level:</Text></div>
              <div style={grid_value_styles}><Text>{spell.level}</Text></div>
              <div style={grid_label_styles}><Text strong>Components:</Text></div>
              <div style={grid_value_styles}><Text>{spell.components}</Text></div>
              <div style={grid_label_styles}><Text strong>Casting Time:</Text></div>
              <div style={grid_value_styles}><Text>{spell.casting_time}</Text></div>
            </div>
          </Panel>
          <Panel header="General" key="2">
            <div style={grid_container_styles}>
              <div style={grid_label_styles}><Text strong>School:</Text></div>
              <div style={grid_value_styles}><Text>{spell.school}</Text></div>
              <div style={grid_label_styles}><Text strong>Range:</Text></div>
              <div style={grid_value_styles}><Text>{spell.range}</Text></div>
              <div style={grid_label_styles}><Text strong>Duration:</Text></div>
              <div style={grid_value_styles}><Text>{spell.duration}</Text></div>
            </div>
          </Panel>
          <Panel header="Description" key="3">
            {spell.description}
          </Panel>
        </Collapse>
      </div>;

    const spell_class_name = [
        "spell-card",
        expanded ? "spell-card__expanded" : "spell-card__collapsed",
    ].join(" ");

    return (
      <Card
          className={spell_class_name}
          onClick={toggleExpanded}
          // title={ spell.name }
          title={title_html}
          size="small"
          extra={card_extra_content}
      >
        {main_content}
        <input type="hidden" ref={dice_copy_input} value={roll_command_text}/>
      </Card>
    );
}
