const DIE_REGEX = /(\d+)d(\d+)/;
const SLOT_EFFECT_REGEX = /increases by (\d+d\d+) for each slot level above (\d+)/;
const PLAYER_LEVEL_EFFECT_REGEX = /(\d+\S+ level \(\d+d\d+\))+/g;
const DECONSTRUCTED_LEVEL_EFFECT_REGEX = /^(\d+)\S+ level \((\d+d\d+)\)/;
const BASE_DAMAGE_REGEX = /takes? (\d+d\d+) (\w+) damage/;

/*
async function getSpellsJson() {
    const spells_json_link = "spells.json";
    const spells_json_response = await fetch(spells_json_link);
    const spells_json = await spells_json_response.json();
    window.spells_json = spells_json;
    return spells_json
}

let spells_json;
getSpellsJson().then(resp => {
	spells_json = resp;
	initializeSpellComponents();
});
*/
// determine the effects a spell has if a player uses a spell at a level above its natural level, if any
function getSpellSlotLevelEffects(spell) {
	return spell.description.match(SLOT_EFFECT_REGEX);
}

// calculate the actual added number of dice based on the player level and the slot level effects
// expects an array with
// 0: the spell description (unused)
// 1: the number of dice added per slot level
// 2: the type of die added (d6, d12, d20 etc)
function calculateSlotLevelEffects(current_level, slot_level_effects) {
	const level_threshold = parseInt(slot_level_effects[2]);
	const effect_increase = slot_level_effects[1];

	const levels_above_threshold = current_level - level_threshold;
	let added_dice;
	if (levels_above_threshold > 0) {
		const die_vals = effect_increase.match(DIE_REGEX);
		const die_count = die_vals[1];
		const die_max = die_vals[2];
		added_dice = (die_count * levels_above_threshold) + "d" + die_max;
	}
	return added_dice;
}

function getSpellPlayerLevelEffects(spell) {
	const spell_description = spell.description;
	return spell_description.match(PLAYER_LEVEL_EFFECT_REGEX);
}

function calculatePlayerLevelEffects(current_level, player_level_effects) {
	let ret_level_effect;
	player_level_effects.some(level_effect => {
		const deconstructed_level_effect = level_effect.match(DECONSTRUCTED_LEVEL_EFFECT_REGEX);
		const required_level = parseInt(deconstructed_level_effect[1]);
		if (required_level <= current_level) {
			ret_level_effect = deconstructed_level_effect[2];
		}
		return required_level > current_level;
	});
	return ret_level_effect;
}

// get info relted to the spell's base damage
function getSpellBaseDamageInfo(spell) {
	const spell_description = spell.description;
	const spell_damage_components = spell_description.match(BASE_DAMAGE_REGEX);
	return spell_damage_components;
}

// return base damage type
function getBaseDamageType(base_damage_info) {
	return base_damage_info[2];
}

// return the base damage dice
function getBaseDamage(base_damage_info) {
	return base_damage_info[1];
}

/*
function spellIncreasesAtLevels() {
	Object.keys(spells_json).forEach(spell_name => {
		const spell_description = spells_json[spell_name].description;
		const player_level_effects = spell_description.match(PLAYER_LEVEL_EFFECT_REGEX);
		if (player_level_effects) {
			player_level_effects.some(level_effect => {
				const deconstructed_level_effect = level_effect.match(DECONSTRUCTED_LEVEL_EFFECT_REGEX);
				console.log("deconstructed effect", deconstructed_level_effect);
			});
		}
	});
};
*/
/*
function evaluateSpells(current_player_level = 5, current_slot_level = 6) {
	for(let spell_name in spells_json) {
		console.log("Spell name:", spell_name);
		console.log("Spell desc:", spells_json[spell_name].description);

		const spell = spells_json[spell_name];
		const slot_effects = getSpellSlotLevelEffects(spell);
		if (slot_effects) {
			const added_dice = calculateSlotLevelEffects(current_slot_level, slot_effects);
			console.log("Going to add " + added_dice + " to your spell!");
		}

		const base_damage_info = getSpellBaseDamageInfo(spell);
		if (base_damage_info) {
			const base_damage = getBaseDamage(base_damage_info);
			const base_damage_type = getBaseDamageType(base_damage_info);
			console.log("Going to do " + base_damage + " " + base_damage_type + " damage!");
		}

		let player_level_effects = getSpellPlayerLevelEffects(spell);
		if (player_level_effects) {
			let added_dice = calculatePlayerLevelEffects(current_player_level, player_level_effects);
			console.log("added dice from player level", added_dice);
		}
	}
}
*/
/*
function initializeSpellComponents() {
	for(let spell_name in spells_json) {
		const spell_container = document.getElementById("spell_container");
		spell_container.appendChild(createSpellComponent(spell_name));
	}
}
*/
/*
function createSpellComponent(spell_name) {
	const spell_div = document.createElement('div');
	spell_div.className = "dnd--spell-div";
	spell_div.innerHTML = spell_name;
	const spell = spells_json[spell_name];

	let base_damage,
		damage_type,
		slot_level_effects,
		player_level_effects;

	const base_damage_info = getSpellBaseDamageInfo(spell);
	if (base_damage_info) {
		base_damage = getBaseDamage(base_damage_info);
		damage_type = getBaseDamageType(base_damage_info);
		//console.log("Going to do " + base_damage + " " + base_damage_type + " damage!");
	}
	player_level_effects = getSpellPlayerLevelEffects(spell);
	slot_level_effects = getSpellSlotLevelEffects(spell);

	const spell_args = {
		base_damage: base_damage,
		damage_type: damage_type,
		slot_level_effects: slot_level_effects,
		player_level_effects: player_level_effects,
	};

	spell_div.addEventListener("click", (e) => {
		//logDamage(spell_args);
		calculateDamage(spell_args);
	});
	return spell_div;
}
*/
function calculateDamage(args) {
	// console.log("args is?", args);
	const base_damage = args.base_damage;
	// const damage_type = args.damage_type;
	const slot_level_effects = args.slot_level_effects;
	const player_level_effects = args.player_level_effects;
	// console.log("player level eff", player_level_effects);

	const current_player_level = args.player_level;
	const current_slot_level = args.slot_level;
	// console.log("spell name", args.spell_name);

	let actual_damage = [base_damage];
	if (player_level_effects) {
		const player_level_damage = calculatePlayerLevelEffects(current_player_level, player_level_effects);
		if (player_level_damage) {
			actual_damage[0] = player_level_damage;
		}
	}

	if (slot_level_effects) {
		const slot_level_damage = calculateSlotLevelEffects(current_slot_level, slot_level_effects);
		if (slot_level_damage) {
			actual_damage.push(slot_level_damage);
		}
	}


	const final_actual_damage = actual_damage.join(" + ");
	return final_actual_damage;
}

const spell_logic = {
	calculateDamage: calculateDamage,
	getSpellBaseDamageInfo: getSpellBaseDamageInfo,
	getSpellPlayerLevelEffects: getSpellPlayerLevelEffects,
	getSpellSlotLevelEffects: getSpellSlotLevelEffects,
	getBaseDamageType: getBaseDamageType,
	getBaseDamage: getBaseDamage,
};

export default spell_logic;

