import React from 'react';
import { Modal, Row, Col, } from 'antd';
import SpellLogic from '../spell-logic';

const spell_sprites = SpellLogic.getSpellSprites();
console.log("Spell Sprites:", spell_sprites);

const modal_styles = {
    width: "70vw",
};

let icon_html = [];
let total_count = 0;

spell_sprites.forEach((sprite, index) => {
    icon_html.push(
        <Col key={total_count}>
            <img
                src={sprite}
                className="icon-selector-icon"
                alt="(spell icons)"
            ></img>
        </Col>
    );
    total_count++;
});

export default function IconSelector(props) {
    function handleOk(e) {
        console.log(e);
        props.setIconSelectionSpell(null);
        clearModalSelection()
    }

    function handleCancel(e) {
        console.log(e);
        props.setIconSelectionSpell(null);
        clearModalSelection()
    }

    function clearModalSelection() {
        document.querySelectorAll(".selected_icon").forEach(selected_icon => {
            selected_icon.classList.remove("selected_icon");
        });
    }

    function selectIcon(e) {
        if (e.target.classList.contains("selected_icon")) {
            e.target.classList.remove("selected_icon");
        }
        else {
            clearModalSelection();
            e.target.classList.add("selected_icon");
            props.spell.icon = e.target.getAttribute("src");
            console.log("Spell Icon", props.spell.icon);
        }
    }

    return (
        <div>
            <Modal style={modal_styles} visible={!!props.spell} title="Select an Icon" onOk={handleOk} onCancel={handleCancel}>
                <Row align="top" type="flex" onClick={selectIcon} gutter={[2, 3]} >
                    {icon_html}
                </Row>
            </Modal>
            {/* this might be a terrible idea, but pre-rendering the images so the first modal load doesn't take forever. */}
            <Row align="top" type="flex" style={{height: 0, overflow: "hidden", visibility:"hidden"}}>
                {icon_html}
            </Row>
        </div>
    );
}