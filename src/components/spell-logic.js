const DIE_REGEX = /(\d+)d(\d+)/;
const SLOT_EFFECT_REGEX = /increases by (\d+d\d+) for each slot level above (\d+)/;
const PLAYER_LEVEL_EFFECT_REGEX = /(\d+\S+ level \(\d+d\d+\))+/g;
const DECONSTRUCTED_LEVEL_EFFECT_REGEX = /^(\d+)\S+ level \((\d+d\d+)\)/;
const BASE_DAMAGE_REGEX = /takes? (\d+d\d+) (\w+) damage/;

function importAll(r) {
    return r.keys().map(r);
}
//const spell_sprites = importAll(require.context('../../assets/images', false, /spell_sprites_\d+\.png$/));
const spell_sprites = importAll(require.context('../assets/images', true, /SpellBook\d+_\d+\.(png|PNG)$/));
function getSpellSprites() {
	return spell_sprites;
}

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

const FILTER_TYPES = {
	REGEX: "regex",
	BOOLEAN: "boolean",
};

class SpellFilter {
	constructor({type, value, props}) {
		this._type = type;
		this._value = value;
		if (!Array.isArray(props)) {
			props = [props];
		}
		this._props = props;
	}


	static filter(item) {
		return this.filter(item);
	}

	set value(value) {
		this._value = value;
	}

	set props(props) {
		this._props = props;
	}
}

class BooleanFilter extends SpellFilter {
	constructor({value, props}) {
		super({
			props: props,
			type: FILTER_TYPES.BOOLEAN,
			value: value,
		});
	}

	filter(item) {
		const filter_value = this._value;
		return this._props.some(prop => !!item[ prop ] === filter_value);
	}
}

class RegexFilter extends SpellFilter {
	constructor({value, props}) {
		super({
			props: props,
			type: FILTER_TYPES.REGEX,
			value: value,
		});
	}

	filter(item) {
		const filter_value = new RegExp(this._value, 'i');
		return this._props.some(prop => item[prop].match(filter_value));
	}
}

function createSpellFilters(filters_args) {
	return filters_args.map((filter_args) => FILTER_GENERATOR[filter_args.type] && FILTER_GENERATOR[filter_args.type](filter_args));
}

const FILTER_GENERATOR = {
	boolean: (args) => new BooleanFilter(args),
	regex: (args) => new RegexFilter(args),
}

function filterSpellList({spells = null, filters = []}) {
	//const filter_properties = Object.keys(filters).filter(filter_name => filters[filter_name]);
	if (!spells) { return null; }
	if (!filters || filters.length === 0) { return spells };
	const spell_filters = createSpellFilters(filters);
	return Object.keys(spells).reduce((filtered_spells, spell_name) => {
		const spell = spells[spell_name];
		const passed = spell_filters.every(filter => filter.filter(spell));
		if (passed) {	
			filtered_spells[spell_name] = spell;
		}

		return filtered_spells;
	}, {});
}

function extractSpellIconName(icon_url) {
	const icon_name_match = icon_url.match(/\/static\/media\/(SpellBook\d+\_\d+)\./);
	return icon_name_match[1];
}

function findSpellIconUrl(icon_name) {
	return spell_sprites.find(sprite => extractSpellIconName(sprite) === icon_name);
}

function initializeSpellIcons(spells) {
	Object.keys(spells).forEach(spell_key => {
		if (spells[spell_key].icon_name) {
			spells[spell_key].icon = findSpellIconUrl(spells[spell_key].icon_name);
		}
		//"/static/media/SpellBook01_39.e761070b.png"
	});
}

function outputSpellJson(spells) {
	let formatted_output = {};
	Object.keys(spells).forEach(spell_key => {
		const spell = spells[ spell_key ];
		const output_obj = {
			casting_time: spell.casting_time,
			components: spell.components,
			duration: spell.duration,
			description: spell.description,
			level: spell.level,
			range: spell.range,
			school: spell.school,
			icon_name: spell.icon_name,
		};
		formatted_output[ spell.name ] = output_obj;
	});
	console.log(JSON.stringify(formatted_output));
}

const spell_logic = {
	calculateDamage: calculateDamage,
	getSpellBaseDamageInfo: getSpellBaseDamageInfo,
	getSpellPlayerLevelEffects: getSpellPlayerLevelEffects,
	getSpellSlotLevelEffects: getSpellSlotLevelEffects,
	getBaseDamageType: getBaseDamageType,
	getBaseDamage: getBaseDamage,
	filterSpellList: filterSpellList,
	getSpellSprites: getSpellSprites,
	initializeSpellIcons: initializeSpellIcons,
	outputSpellJson: outputSpellJson,
};

export default spell_logic;

