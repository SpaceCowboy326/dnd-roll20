import React, { useState, useEffect } from 'react';

import { Slider, Input, Divider, InputNumber, Row, Col, Typography, Switch, Button } from 'antd';
import Spell from './spell';
import SpellLogic from './spell-logic';
//import spell_book from '../assets/images/spell_book.png'
import IconSelector from './inputs/icon-selector';

const spells_json_link = "spells.json";
const { Title } = Typography;
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
    const[showKnownSpellsOnly, setShowKnownSpellsOnly] = useState(false);
    const[textFilter, setTextFilter] = useState("");
    const[spells, setSpells] = useState(null);
    const[iconSelectionSpell, setIconSelectionSpell] = useState(null);
    const left_justify_column = {
        textAlign: "left",
    };

    useEffect(() => {
        const fetchSpells = async () => {
            const spells_json_response = await fetch(spells_json_link);
            const spells_json = await spells_json_response.json();
            for (const spell_name in spells_json) {
                // TODO: replace this with "initialize" function. Add properties not stored in the JSON.
                spells_json[spell_name].name = spell_name;
            }
            SpellLogic.initializeSpellIcons(spells_json);
            console.log("initialized", spells_json);
            setSpells(spells_json);
        };
        fetchSpells();
    }, []);

    console.log("Rendering Spell Section");

    const onSlotLevelChange = value => {
        spell_list_refresh_required = true;
        setSlotLevel(value);
    };

    const onPlayerLevelChange = value => {
        spell_list_refresh_required = true;
        setPlayerLevel(value);
    };

    const onTextFilterChange = ({ target: { value } }) => {
        spell_list_refresh_required = true;
        setTextFilter(value);
    };

    const toggleShowKnownSpellsOnly = value => {
        spell_list_refresh_required = true;
        setShowKnownSpellsOnly(value);
    }

    function getFilterData() {
        return [
            {type: "boolean", props: "known", value: showKnownSpellsOnly},
            {type: "regex", props: ["description", "name"], value: textFilter},
        ];
    }

    function getSpellContent() {
        // return a cached version of the spell list if the player data hasn't been updated since
        // we last rendered
        if (spell_list && !spell_list_refresh_required) {
       //     return spell_list;
        }

        const player_data = {
            playerLevel: playerLevel,
            slotLevel: slotLevel
        };
        const filter_data = getFilterData();
        const filtered_spell_list = SpellLogic.filterSpellList({spells: spells, filters: filter_data});
        // reset the "updated" flag for player data since we are rgenerating the spell list
        spell_list_refresh_required = false;
        return filtered_spell_list &&
            Object.keys(filtered_spell_list).map((spell_name) => {
                const key = spell_name.replace(/ /g, '_').toLowerCase();
                return <Col span={8} item="true" key={key}>
                        {/* <Spell player_data={player_data} openIconModal={openIconModal} spell={spells[spell_name]} playerLevel={playerLevel} slotLevel={slotLevel}></Spell> */}
                        <Spell player_data={player_data} setIconSelectionSpell={setIconSelectionSpell} spell={spells[spell_name]} playerLevel={playerLevel} slotLevel={slotLevel}></Spell>
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
            <Title level={2}>DnD Spellbook</Title>
            {/* <img src={spell_book} alt="SPELLZ" /> */}
            <Row type="flex" justify="start" gutter={10, 10}>
                <Col style={left_justify_column}>
                    <span>Character Level</span>
                </Col>
                <Col style={left_justify_column}>
                    <InputNumber
                        min={1}
                        max={20}
                        onChange={onPlayerLevelChange}
                        value={playerLevel}
                    />
                </Col>
                <Col style={left_justify_column}>
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
                <Col><Button onClick={()=>SpellLogic.outputSpellJson(spells)}>Output</Button></Col>

          </Row>
            <Row justify="start" align="middle" gutter={[30,0]}>
                <Col style={left_justify_column}>
                    <Input onChange={onTextFilterChange} placeholder="Search..."/>
                </Col>
            </Row>
          <Divider></Divider>
          <Row align="top" type="flex" gutter={[16, 20]} >
            {spell_list}
          </Row>
          <IconSelector spell={iconSelectionSpell} setIconSelectionSpell={setIconSelectionSpell}></IconSelector>
        </div>
    );
}