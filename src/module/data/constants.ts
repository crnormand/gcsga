import Sortable from "sortablejs"

const SYSTEM_NAME = "gcsga"

enum COMPENDIA {
	CONDITIONS = "conditions",
	MANEUVERS = "maneuvers",
}

// Settings
enum SETTINGS {
	// Menus
	COLORS = "colors",
	DEFAULT_SHEET_SETTINGS = "default_sheet_settings",
	DEFAULT_ATTRIBUTES = "default_attributes",
	DEFAULT_HIT_LOCATIONS = "default_hit_locations",
	// Book Settings
	BASE_BOOKS = "base_books",
	BASIC_SET_PDF = "basic_set_pdf",
	// Rule Variations
	ROLL_FORMULA = "roll_formula",
	INITIATIVE_FORMULA = "initiative_formula",
	SSRT = "ssrt",
	DEFAULT_DAMAGE_LOCATION = "default_damage_location",
	// QOL
	AUTOMATIC_UNREADY = "automatic_unready",

	// Token View
	MANEUVER_DETAIL = "maneuver_detail",
	SHOW_TOKEN_MODIFIERS = "enable_token_modifier_window",

	// Not yet implemented
	DAMAGE_TYPES = "damage_types",
	ROLL_MODIFIERS = "roll_modifiers",

	// Leagacy. Not in use.
	PORTRAIT_OVERWRITE = "portrait_overwrite",
	STATIC_IMPORT_HP_FP = "import_hp_fp",
	STATIC_IMPORT_BODY_PLAN = "import_bodyplan",
	STATIC_AUTOMATICALLY_SET_IGNOREQTY = "auto-ignore-qty",
	SHOW_IMPORT_BUTTON = "show_import_button",
	IGNORE_IMPORT_NAME = "ignore_import_name",
	WORLD_SYSTEM_VERSION = "world_system_version",
	WORLD_SCHEMA_VERSION = "world_schema_version",

	// Compendium Browser. Not in use.
	COMPENDIUM_BROWSER_PACKS = "compendium_browser_packs",
	COMPENDIUM_BROWSER_SOURCES = "compendium_browser_sources",
	COMPENDIUM_SKILL_DEFAULTS = "compendium_skill_defaults",

	// ???
	MODIFIER_LIST_COLLAPSE = "modifier_list_collapse",
}

enum SSRT_SETTING {
	STANDARD = "standard",
	SIMPLIFIED = "simplified",
	TENS = "tens",
}

enum MANEUVER_DETAIL_SETTING {
	FULL = "full",
	NO_FEINT = "no_feint",
	GENERAL = "general",
}

enum SOCKET {
	INITIATIVE_CHANGED = "initiative_changed",
	UPDATE_BUCKET = "update_bucket",
}

enum EFFECT_ACTION {
	ADD = "add",
	REMOVE = "remove",
}

const DEFAULT_INITIATIVE_FORMULA = (): string => {
	return "$basic_speed+($dx/10000)+(1d6/100000)"
}

// Item
enum ItemType {
	Trait = "trait",
	TraitContainer = "traitContainer",
	TraitModifier = "traitModifier",
	TraitModifierContainer = "traitModifierContainer",
	Skill = "skill",
	Technique = "technique",
	SkillContainer = "skillContainer",
	Spell = "spell",
	RitualMagicSpell = "ritualMagicSpell",
	SpellContainer = "spellContainer",
	Equipment = "equipment",
	EquipmentContainer = "equipmentContainer",
	EquipmentModifier = "equipmentModifier",
	EquipmentModifierContainer = "equipmentModifierContainer",
	Note = "note",
	NoteContainer = "noteContainer",
	WeaponMelee = "weaponMelee",
	WeaponRanged = "weaponRanged",
}

const ItemTypes = [
	ItemType.Trait,
	ItemType.TraitContainer,
	ItemType.TraitModifier,
	ItemType.TraitModifierContainer,
	ItemType.Skill,
	ItemType.Technique,
	ItemType.SkillContainer,
	ItemType.Spell,
	ItemType.RitualMagicSpell,
	ItemType.SpellContainer,
	ItemType.Equipment,
	ItemType.EquipmentContainer,
	ItemType.EquipmentModifier,
	ItemType.EquipmentModifierContainer,
	ItemType.Note,
	ItemType.NoteContainer,
	ItemType.WeaponMelee,
	ItemType.WeaponRanged,
]

// type ItemTypes =
// 	| ItemType.Trait
// 	| ItemType.TraitContainer
// 	| ItemType.TraitModifier
// 	| ItemType.TraitModifierContainer
// 	| ItemType.Skill
// 	| ItemType.Technique
// 	| ItemType.SkillContainer
// 	| ItemType.Spell
// 	| ItemType.RitualMagicSpell
// 	| ItemType.SpellContainer
// 	| ItemType.Equipment
// 	| ItemType.EquipmentContainer
// 	| ItemType.EquipmentModifier
// 	| ItemType.EquipmentModifierContainer
// 	| ItemType.Note
// 	| ItemType.NoteContainer
// 	// | ItemType.LegacyItem
// 	// | ItemType.Effect
// 	// | ItemType.Condition
// 	| ItemType.WeaponMelee
// 	| ItemType.WeaponRanged

// type EffectType = ItemType.Effect | ItemType.Condition

type WeaponType = ItemType.WeaponMelee | ItemType.WeaponRanged

const DefaultHaver = [ItemType.Skill, ItemType.Technique, ItemType.WeaponMelee, ItemType.WeaponRanged]

// const ABSTRACT_CONTAINER_TYPES = new Set([
// 	ItemType.Trait,
// 	ItemType.TraitContainer,
// 	ItemType.TraitModifierContainer,
// 	ItemType.Skill,
// 	ItemType.Technique,
// 	ItemType.SkillContainer,
// 	ItemType.Spell,
// 	ItemType.RitualMagicSpell,
// 	ItemType.SpellContainer,
// 	ItemType.Equipment,
// 	ItemType.EquipmentContainer,
// 	ItemType.EquipmentModifierContainer,
// 	ItemType.NoteContainer,
// ] as const)
//
// const CONTAINER_TYPES = new Set([
// 	ItemType.TraitContainer,
// 	ItemType.TraitModifierContainer,
// 	ItemType.SkillContainer,
// 	ItemType.SpellContainer,
// 	ItemType.EquipmentContainer,
// 	ItemType.EquipmentModifierContainer,
// 	ItemType.NoteContainer,
// ] as const)

// type ContainerType =
// 	| ItemType.Trait
// 	| ItemType.TraitContainer
// 	| ItemType.TraitModifierContainer
// 	| ItemType.Skill
// 	| ItemType.Technique
// 	| ItemType.SkillContainer
// 	| ItemType.Spell
// 	| ItemType.RitualMagicSpell
// 	| ItemType.SpellContainer
// 	| ItemType.Equipment
// 	| ItemType.EquipmentContainer
// 	| ItemType.EquipmentModifierContainer
// 	| ItemType.NoteContainer

enum ItemFlags {
	Deprecation = "deprecation",
	// Container = "container",
	Other = "other", // used for equipment only
	Unready = "unready",
	Overlay = "overlay", // used for effects only
}

// Active Effect
enum EffectType {
	Effect = "effect",
	Condition = "condition",
}

type EffectTypes = EffectType.Effect | EffectType.Condition

enum ConditionID {
	// Posture
	PostureCrouch = "crouching",
	PostureKneel = "kneeling",
	PostureSit = "sitting",
	PostureCrawl = "crawling",
	PostureProne = "prone",
	// Serious Damage
	Reeling = "reeling",
	Fatigued = "fatigued",
	Crippled = "crippled",
	Bleeding = "bleeding",
	Dead = "dead",
	// Shock / Unconsciousness
	Shock = "shock",
	Pain = "pain",
	Unconscious = "unconscious",
	Sleeping = "sleeping",
	Comatose = "comatose",
	// Confusion ?
	Stun = "stun",
	MentalStun = "mental-stun",
	Poisoned = "poisoned",
	Burning = "burning",
	Cold = "cold",
	// Movement Bad
	Disarmed = "disarmed",
	Falling = "falling",
	Grappled = "grappled",
	Restrained = "restrained",
	Pinned = "pinned",
	// Stealth / Movement Good
	Sprinting = "sprinting",
	Flying = "flying",
	Stealthy = "stealthy",
	Waiting = "waiting",
	Invisible = "invisible",
	// Afflictions
	Coughing = "coughing",
	Retching = "retching",
	Nausea = "nausea",
	Agony = "agony",
	Seizure = "seizure",
	// Disabled Function
	Blind = "blind", // Inconsistency here between "blinded" and "blind" to match foundry default name
	Deafened = "deafened",
	Silenced = "silenced",
	Choking = "choking",
	HeartAttack = "heart-attack",
	// Drunk-adjacent
	Euphoric = "euphoric",
	Hallucinating = "hallucinating",
	Drunk = "drunk",
	Drowsy = "drowsy",
	Dazed = "dazed",
	// ConditionTrigger -- this is a special condition that is used to trigger other effects.
	Trigger = "trigger",
}

enum ManeuverID {
	// Row 1
	DoNothing = "do-nothing",
	Attack = "attack",
	AOA = "all-out-attack",
	AOD = "all-out-defense",
	// Row 2
	Move = "move",
	MoveAndAttack = "move-and-attack",
	AOADouble = "all-out-attack-double",
	AODDouble = "all-out-defense-double",
	// Row 3
	ChangePosture = "change-posture",
	Feint = "feint",
	AOAFeint = "all-out-attack-feint",
	AODDodge = "all-out-defense-dodge",
	// Row 4
	Ready = "ready",
	Evaluate = "evaluate",
	AOADetermined = "all-out-attack-determined",
	AODParry = "all-out-defense-parry",
	// Row 5
	Concentrate = "concentrate",
	Aim = "aim",
	AOAStrong = "all-out-attack-strong",
	AODBlock = "all-out-defense-block",
	// Row 6
	Wait = "wait",
	BLANK_1 = "blank-1",
	AOASF = "all-out-attack-suppressing-fire",
	BLANK_2 = "blank-2",
}

// Actor
enum ActorType {
	Character = "character",
	// Character = "character_gcs",
	LegacyCharacter = "legacyCharacter",
	// LegacyEnemy = "enemy",
	Loot = "loot",
	// MassCombatElement = "element",
	// Vehicle = "vehicle",
	// Merchant = "merchant",
}

enum ActorFlags {
	TargetModifiers = "targetModifiers",
	SelfModifiers = "selfModifiers",
	Deprecation = "deprecation",
	MoveType = "move_type",
	AutoEncumbrance = "auto_encumbrance",
	AutoThreshold = "auto_threshold",
	AutoDamage = "auto_damage",
	Import = "import",
}

// Commonly Used Values
enum gid {
	All = "all",
	BasicMove = "basic_move",
	BasicSpeed = "basic_speed",
	Block = "block",
	ConditionalModifier = "conditional_modifier",
	Dexterity = "dx",
	Dodge = "dodge",
	Equipment = "equipment",
	EquipmentModifier = "equipment_modifier",
	FatiguePoints = "fp",
	Flexible = "flexible",
	FrightCheck = "fright_check",
	Health = "ht",
	Hearing = "hearing",
	HitPoints = "hp",
	Intelligence = "iq",
	LiftingStrength = "lifting_st",
	Move = "move",
	Note = "note",
	Parry = "parry",
	Perception = "per",
	ReactionModifier = "reaction_modifier",
	RitualMagicSpell = "ritual_magic_spell",
	SizeModifier = "sm",
	Skill = "skill",
	Spell = "spell",
	Strength = "st",
	StrikingStrength = "striking_st",
	TasteSmell = "taste_smell",
	Technique = "technique",
	Ten = "10",
	ThrowingStrength = "throwing_st",
	Torso = "torso",
	Touch = "touch",
	Trait = "trait",
	TraitModifier = "trait_modifier",
	Vision = "vision",
	Will = "will",
	// Damage
	Thrust = "thrust",
	Swing = "swing",
	// Move Types
	Ground = "ground",
	Water = "water",
	Air = "air",
	Space = "space",
}

// Rolls
enum RollType {
	Attribute = "attribute",
	Skill = "skill",
	SkillRelative = "skill_rsl",
	Spell = "spell",
	SpellRelative = "spell_rsl",
	Attack = "attack",
	Parry = "parry",
	Block = "block",
	Damage = "damage",
	Modifier = "modifier",
	ControlRoll = "control_roll",
	Location = "location",
	Generic = "generic",
}

enum RollModifierTags {
	Range = "range",
}

const GURPS_COMMANDS = (() => {
	const any = "([^]*)" // Any character, including new lines
	return {
		mook: new RegExp(`^\\/mook ?${any}`, "i"),
	}
})()

enum HOOKS {
	ADD_MODIFEIR = "addModifier",
	DROP_ITEM_SHEET_DATA = "dropItemSheetData",
	GET_ITEM_CONTEXT_OPTIONS = "getItemContextOptions",
	GET_EFFECT_CONTEXT_OPTIONS = "getEffectContextOptions",
}

const SORTABLE_BASE_OPTIONS: Sortable.Options = {
	animation: 200,
	direction: "vertical",
	dragClass: "drag-preview",
	dragoverBubble: true,
	easing: "cubic-bezier(1, 0, 0, 1)",
	fallbackOnBody: true,
	// filter: "div.item-summary",
	filter: "div.item-summary",
	ghostClass: "drag-gap",
	group: "inventory",
	preventOnFilter: false,
	swapThreshold: 0.25,

	// These options are from the Autoscroll plugin and serve as a fallback on mobile/safari/ie/edge
	// Other browsers use the native implementation
	scroll: true,
	scrollSensitivity: 30,
	scrollSpeed: 15,

	delay: 500,
	delayOnTouchOnly: true,
}

// const ContainedQuantityNumericCompareTypes: NumericCompareType[] = [
// 	NumericCompareType.EqualsNumber,
// 	NumericCompareType.AtLeastNumber,
// 	NumericCompareType.AtMostNumber,
// ]

// enum StringCompareType {
// 	AnyString = "none",
// 	IsString = "is",
// 	IsNotString = "is_not",
// 	ContainsString = "contains",
// 	DoesNotContainString = "does_not_contain",
// 	StartsWithString = "starts_with",
// 	DoesNotStartWithString = "does_not_start_with",
// 	EndsWithString = "ends_with",
// 	DoesNotEndWithString = "does_not_end_with",
// }

// const AllStringCompareTypes: StringCompareType[] = [
// 	StringCompareType.AnyString,
// 	StringCompareType.IsString,
// 	StringCompareType.IsNotString,
// 	StringCompareType.ContainsString,
// 	StringCompareType.DoesNotContainString,
// 	StringCompareType.StartsWithString,
// 	StringCompareType.DoesNotStartWithString,
// 	StringCompareType.EndsWithString,
// 	StringCompareType.DoesNotEndWithString,
// ]

export {
	// ABSTRACT_CONTAINER_TYPES,
	ActorFlags,
	ActorType,
	COMPENDIA,
	// CONTAINER_TYPES,
	ConditionID,
	DEFAULT_INITIATIVE_FORMULA,
	DefaultHaver,
	EFFECT_ACTION,
	EffectType,
	GURPS_COMMANDS,
	HOOKS,
	ItemFlags,
	ItemType,
	MANEUVER_DETAIL_SETTING,
	ManeuverID,
	RollModifierTags,
	RollType,
	SETTINGS,
	SOCKET,
	SORTABLE_BASE_OPTIONS,
	SSRT_SETTING,
	SYSTEM_NAME,
	gid,
	ItemTypes,
}

// export type { EffectTypes, ItemTypes, WeaponType }
export type { EffectTypes, WeaponType }
