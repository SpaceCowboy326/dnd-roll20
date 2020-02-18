import React, { useState, useEffect, useRef } from 'react';

import { Card, Icon, Popover } from 'antd';

import './spell.css';
import SpellLogic from './spell-logic';



export default function Spell(props) {
    const[expanded, setExpanded] = useState(false);
    const[added, setAdded] = useState(false);
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

    const card_extra_content = expanded ? <div className="spell-card-extra">
      <div className="spell-card-icons">
        {add_remove_icon}
        {card_extra_damage_content}
        <Popover placement="topLeft" title={"Damage Type"} onClick={preventClose} content={base_damage_type || "N/A"} trigger="click">
          {card_icon}
        </Popover>
      </div>
    </div>
    : null;

    const main_content = <div className="spell-card-description">{spell.description}</div>;

    const spell_class_name = [
        "spell-card",
        expanded ? "spell-card__expanded" : "spell-card__collapsed",
    ].join(" ");

    return (
      <Card
          className={spell_class_name}
          onClick={toggleExpanded}
          title={spell.name}
          size="small"
          extra={card_extra_content}
      >
        {main_content}
        <input type="hidden" ref={dice_copy_input} value={roll_command_text}/>
      </Card>
    );
}
