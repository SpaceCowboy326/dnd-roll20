import React, { useState, useEffect } from 'react';
import { Modal, Typography, Row, Col, } from 'antd';

function importAll(r) {
    return r.keys().map(r);
}
//const spell_sprites = importAll(require.context('../../assets/images', false, /spell_sprites_\d+\.png$/));
const spell_sprites = importAll(require.context('../../assets/images', true, /SpellBook\d+_\d+\.png$/));
console.log("Spell Sprites:", spell_sprites);

const SPRITE_DIMENSION = 128;
const SPRITE_SHEET_DIMENSION = 2048;

const modal_styles = {
    width: "70vw",
};

let icon_html = [];
let total_count = 0;
// little arbitrary... this is the number of icons in the sprite sheets.
// will hopefully find a better way to map these, but this is what I've got for now.
const MAX_COUNT = 1797;

function selectIcon(e, me) {
    console.log("I was clicked!", e.target);
    if (e.target.classList.contains("selected_icon")) {
        e.target.classList.remove("selected_icon");
    }
    else {
        document.querySelectorAll(".selected_icon").forEach(selected_icon => {
            selected_icon.classList.remove("selected_icon");
        });
        e.target.classList.add("selected_icon");
    }
}

spell_sprites.forEach((sprite, index) => {
    icon_html.push(
        <Col key={total_count}>
            <img
                // key={total_count}
                // key={"img-" + total_count}
                src={sprite}
                className="icon-selector-icon"
                onClick={selectIcon}
                alt="(spell icons)"
            ></img>
        </Col>
    );
    total_count++;
});


/*
spell_sprites.forEach(sprite_sheet => {
    for (let x = 0 ; x < SPRITE_SHEET_DIMENSION && total_count < MAX_COUNT; x = x + SPRITE_DIMENSION) {
        for (let y = 0; y < SPRITE_SHEET_DIMENSION && total_count < MAX_COUNT; y = y + SPRITE_DIMENSION) {
            const sprite_styles = {
                backgroundImage: "url(" + sprite_sheet + ")",
                backgroundPosition: -y + "px " + -x + "px",
                // backgroundRepeat: "no-repeat",
                // display: "inline-block",
                // height: SPRITE_DIMENSION,
                // transform: "scale(0.25)",
                // transition: "all 2s",
                // width: SPRITE_DIMENSION,
            };
            icon_html.push(
                <div class="icon-container"
                    onClick={selectIcon}
                >
                    <div
                        key={total_count}
                        class="icon-selector-icon"
                        sprite-id={total_count}
                        style={sprite_styles}
                        alt="(spell icons)">
                    </div>
                </div>
            );
            total_count++;
        }
    }
});
*/
export default function IconSelector(props) {
    const[isVisible, setIsVisible] = useState(props.isVisible);

    function handleOk(e) {
        console.log(e);
        setIsVisible(false);
    };

    function handleCancel(e) {
        console.log(e);
        setIsVisible(false);
    };

    return (
        /*
        <Modal
          title="Basic Modal"
          visible={props.toggled}
          onOk={handleOk}
          onCancel={handleCancel}
        >
            {icon_list}
        </Modal>
        */
       <Modal style={modal_styles} visible={isVisible} title="Select an Icon" onOk={handleOk} onCancel={handleCancel}>
            <Row align="top" type="flex" gutter={[2, 3]} >
                {icon_html}
            </Row>
        </Modal>
    );
}