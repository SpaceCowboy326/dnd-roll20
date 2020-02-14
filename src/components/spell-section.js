import React, { useState, useEffect } from 'react';

import { Slider, Divider, InputNumber, Row, Col, Typography, Icon, Switch } from 'antd';
import Spell from './spell';
import SpellLogic from './spell-logic';

const spells_json_link = "spells.json";
let spell_list;
let spell_list_refresh_required;

const slot_level_slider_marks = [...Array(9).keys()].reduce((marks, index) => {
    // TODO: can specify styles for each label here later if we want to.
    // change "index +1 to { label: index + 1, styles {...}}"
    // const box_shadow = "5px 5px 5px " + index * 3 + "px #0ff";
    marks[index + 1] = index + 1;
    return marks;
}, {});

export default function SpellSection(props) {
    const[slotLevel, setSlotLevel] = useState(4);
    const[playerLevel, setPlayerLevel] = useState(5);
    const[showKnownSpellsOnly, setShowKnownSpellsOnly] = useState(5);
    const[spells, setSpells] = useState(null);

    const left_justify_column = {
        textAlign: "left",
    };

    useEffect(() => {
        const fetchSpells = async () => {
            const spells_json_response = await fetch(spells_json_link);
            const spells_json = await spells_json_response.json();
            setSpells(spells_json);
        };
        fetchSpells();
    }, []);

    const onSlotLevelChange = value => {
        spell_list_refresh_required = true;
        setSlotLevel(value);
    };

    const onPlayerLevelChange = value => {
        spell_list_refresh_required = true;
        setPlayerLevel(value);
    };

    const toggleShowKnownSpellsOnly = value => {
        spell_list_refresh_required = true;
        setShowKnownSpellsOnly(value);
        console.log(showKnownSpellsOnly);
    }

    function getSpellContent() {
        // return a cached version of the spell list if the player data hasn't been updated since
        // we last rendered
        if (spell_list && !spell_list_refresh_required) {
            return spell_list;
        }

        const player_data = {
            playerLevel: playerLevel,
            slotLevel: slotLevel
        };
        // reset the "updated" flag for player data since we are rgenerating the spell list
        spell_list_refresh_required = false;
        return spells &&
            Object.keys(spells).map((spell_name) => {
                spells[spell_name].name = spell_name;
                const key = spell_name.replace(/ /g, '_').toLowerCase();
                return <Col span={8} item="true" key={key}>
                        <Spell player_data={player_data} spell={spells[spell_name]} playerLevel={playerLevel} slotLevel={slotLevel}></Spell>
                    </Col>;
            });
    }

    // spell list shouldn't change (currently, anyway). Only initialize once.
    spell_list = getSpellContent();

    const container_styles = {
        padding: "0 30px",
    };

    return (
        <div style={container_styles}>
            <Icon type="read" style={{fontSize: "60px"}}/>
            <Row type="flex" justify="start">
                <Col style={left_justify_column} span={3}>
                    <span>Character Level</span>
                </Col>
                <Col style={left_justify_column} span={3}>
                    <InputNumber
                        min={1}
                        max={20}
                        onChange={onPlayerLevelChange}
                        value={playerLevel}
                    />
                </Col>
                <Col style={left_justify_column} span={2}>
                    <span>Known Spells Only</span>
                </Col>
                <Col style={left_justify_column} span={3}>
                    <Switch onChange={toggleShowKnownSpellsOnly}></Switch>
                </Col>
            </Row>
            <Row type="flex" justify="start" align="middle" gutter={[30,0]}>
                <Col style={left_justify_column} span={3}>
                    <span>Spell Slot Level</span>
                </Col>
                <Col span={12}>
                    <Slider
                        min={1}
                        max={9}
                        onChange={onSlotLevelChange}
                        value={typeof slotLevel === 'number' ? slotLevel : 0}
                        marks={slot_level_slider_marks}
                    />
                </Col>
                <Col span={4}>
                    <InputNumber
                        min={1}
                        max={20}
                        style={{ marginLeft: 16 }}
                        value={slotLevel}
                        onChange={onSlotLevelChange}
                    />
                </Col>
          </Row>
          <Divider></Divider>
          <Row gutter={[16, 20]} >
            {spell_list}
          </Row>
        </div>
    );
}