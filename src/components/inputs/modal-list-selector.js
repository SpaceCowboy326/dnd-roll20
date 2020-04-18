import React, { useState, useEffect } from 'react';
import { Input, Modal Typography, Icon } from 'antd';

export default function SpellSection(props) {
    const[slotLevel, setSlotLevel] = useState(4);

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
            console.log("initialized", spells_json);
        };
        fetchSpells();
    }, []);

    const onSlotLevelChange = value => {
        spell_list_refresh_required = true;
        setSlotLevel(value);
    };


    return (
        <div style={container_styles}>
            <img src={spell_book} alt="SPELLZ" />
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
            <Row type="flex" justify="start" align="middle" gutter={[30,0]}>
                <Col style={left_justify_column}>
                    <Input onChange={onTextFilterChange} placeholder="Search..."/>
                </Col>
            </Row>
          <Divider></Divider>
          <Row gutter={[16, 20]} >
            {spell_list}
          </Row>
        </div>
    );
}