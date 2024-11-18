import { ActorType, gid } from "../constants.ts"
import { EvalEmbeddedRegex, StringBuilder, TooltipGURPS, difficulty, replaceAllStringFunc } from "@util"
import { SkillLevel, calculateTechniqueLevel } from "./helpers.ts"
import { SkillDefault } from "./components/skill-default.ts"
import { Nameable } from "@module/util/index.ts"
import { AttributeDifficultyField } from "./fields/attribute-difficulty-field.ts"
import { ItemDataModel } from "./abstract.ts"
import { ActorTemplateType } from "../actor/types.ts"
import { ToggleableNumberField } from "../fields/index.ts"
import { ReplaceableStringField } from "../fields/replaceable-string-field.ts"
import {
	AbstractSkillTemplate,
	AbstractSkillTemplateSchema,
	ActionTemplate,
	ActionTemplateSchema,
	BasicInformationTemplate,
	BasicInformationTemplateSchema,
	ContainerTemplate,
	ContainerTemplateSchema,
	PrereqTemplate,
	PrereqTemplateSchema,
	ReplacementTemplate,
	ReplacementTemplateSchema,
	SpellTemplate,
	SpellTemplateSchema,
	StudyTemplate,
	StudyTemplateSchema,
} from "./templates/index.ts"

class RitualMagicSpellData extends ItemDataModel.mixin(
	ActionTemplate,
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
	SpellTemplate,
) {
	// static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-ritual-magic-spell", "gurps.details-prereqs", "gurps.details-study"]
		context.embedsParts = ["gurps.embeds-weapon-melee", "gurps.embeds-weapon-ranged"]
	}

	static override defineSchema(): RitualMagicSpellSchema {
		return this.mergeSchema(super.defineSchema(), {
			difficulty: new AttributeDifficultyField({
				initial: {
					attribute: "",
					difficulty: difficulty.Level.Average,
				},
				attributeChoices: { "": "" },
				difficultyChoices: difficulty.LevelsChoices("GURPS.AttributeDifficulty.AttributeKey", [
					difficulty.Level.Easy,
					difficulty.Level.VeryHard,
					difficulty.Level.Wildcard,
				]),
				label: "GURPS.Item.Spell.FIELDS.Difficulty.Name",
			}),
			base_skill: new ReplaceableStringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Ritual Magic",
				label: "GURPS.Item.RitualMagicSpell.FIELDS.BaseSkill.Name",
			}),
			prereq_count: new ToggleableNumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
				label: "GURPS.Item.RitualMagicSpell.FIELDS.PrereqCount.Name",
			}),
		}) as RitualMagicSpellSchema
	}

	override calculateLevel(): SkillLevel {
		const name = this.nameWithReplacements
		const powerSource = this.powerSourceWithReplacements
		const skillName = this.skillNameWithReplacements
		const prereqCount = this.prereq_count
		const tags = this.tags
		const difficulty = this.difficulty.difficulty
		const points = this.adjustedPoints(null)

		let skillLevel: SkillLevel = { level: Number.MIN_SAFE_INTEGER, relativeLevel: 0, tooltip: "" }
		if (this.college.length === 0) {
			skillLevel = this._determineLevelForCollege(name, "", skillName, prereqCount, tags, difficulty, points)
		} else {
			for (const college of this.college) {
				const possible = this._determineLevelForCollege(
					name,
					college,
					skillName,
					prereqCount,
					tags,
					difficulty,
					points,
				)
				if (skillLevel.level < possible.level) skillLevel = possible
			}
		}

		if (this.actor?.isOfType(ActorType.Character)) {
			const tooltip = new TooltipGURPS()
			tooltip.push(skillLevel.tooltip)
			const bonus = Math.trunc(
				this.actor.system.spellBonusFor(name, powerSource, this.collegeWithReplacements, tags, tooltip),
			)
			skillLevel.level += bonus
			skillLevel.relativeLevel += bonus
			skillLevel.tooltip = tooltip.toString()
		}
		return skillLevel
	}

	private _determineLevelForCollege(
		name: string,
		college: string,
		skillName: string,
		prereqCount: number,
		tags: string[],
		difficulty: difficulty.Level,
		points: number,
	): SkillLevel {
		const def = new SkillDefault({
			type: gid.Skill,
			name: skillName,
			specialization: college,
			modifier: -prereqCount,
		})
		if (college !== "") def.name = ""
		const limit = 0
		const skilllevel = calculateTechniqueLevel(
			this.actor,
			new Map(),
			name,
			college,
			tags,
			def,
			difficulty,
			points,
			false,
			limit,
		)
		skilllevel.relativeLevel = def.modifier
		def.specialization = ""
		def.modifier -= 6
		const fallback = calculateTechniqueLevel(
			this.actor,
			new Map(),
			name,
			college,
			tags,
			def,
			difficulty,
			points,
			false,
			limit,
		)
		fallback.relativeLevel += def.modifier
		if (skilllevel.level >= fallback.level) return skilllevel
		return fallback
	}

	satisfied(tooltip: TooltipGURPS | null = null): boolean {
		const actor = this.actor
		if (!actor?.isOfType(ActorType.Character)) {
			return true
		}
		const colleges = this.collegeWithReplacements
		if (colleges.length === 0) {
			if (tooltip !== null) {
				tooltip.push(game.i18n.localize("GURPS.Tooltip.Prefix"))
				tooltip.push(game.i18n.localize("GURPS.Prereq.RitualMagic.College"))
			}
			return false
		}
		for (const college of colleges) {
			if (actor.system.bestSkillNamed(this.skillNameWithReplacements, college, false) !== null) return true
		}
		if (actor.system.bestSkillNamed(this.skillNameWithReplacements, "", false) !== null) return true
		if (tooltip !== null) {
			tooltip.push(game.i18n.localize("GURPS.Tooltip.Prefix"))
			const name = this.skillNameWithReplacements
			let buffer = game.i18n.format("GURPS.Prereq.RitualMagic.SkillFirst", {
				name,
				specialization: colleges[0],
			})
			for (const [index, college] of colleges.entries()) {
				if (index === 0) continue
				buffer = game.i18n.format("GURPS.Prereq.RitualMagic.SkillOr", {
					existing: buffer,
					name,
					specialization: college,
				})
			}
			tooltip.push(game.i18n.format("GURPS.Prereq.RitualMagic.Skill", { name: buffer }))
		}
		return false
	}

	override get processedName(): string {
		const buffer = new StringBuilder()
		buffer.push(this.nameWithReplacements)
		if (this.tech_level_required) buffer.push(game.i18n.format("GURPS.TechLevelShort", { level: this.tech_level }))
		return buffer.toString()
	}

	override get processedNotes(): string {
		return replaceAllStringFunc(EvalEmbeddedRegex, this.notesWithReplacements, this.parent.actor)
	}

	override adjustedPoints(tooltip: TooltipGURPS | null = null, temporary = false): number {
		let points = this.points
		if (this.actor?.hasTemplate(ActorTemplateType.Features)) {
			points += this.actor.system.spellPointBonusFor(
				this.nameWithReplacements,
				this.powerSourceWithReplacements,
				this.collegeWithReplacements,
				this.tags,
				tooltip,
				temporary,
			)
			points = Math.max(points, 0)
		}
		return points
	}

	/** Nameables */
	override fillWithNameableKeys(
		m: Map<string, string>,
		existing: Map<string, string> = this.nameableReplacements,
	): void {
		super.fillWithNameableKeys(m, existing)

		Nameable.extract(this.notes, m, existing)
		Nameable.extract(this.power_source, m, existing)
		Nameable.extract(this.spell_class, m, existing)
		Nameable.extract(this.resist, m, existing)
		Nameable.extract(this.casting_cost, m, existing)
		Nameable.extract(this.maintenance_cost, m, existing)
		Nameable.extract(this.casting_time, m, existing)
		Nameable.extract(this.duration, m, existing)
		Nameable.extract(this.base_skill, m, existing)

		this._fillWithNameableKeysFromPrereqs(m, existing)
		this._fillWithNameableKeysFromEmbeds(m, existing)
	}

	protected _fillWithNameableKeysFromEmbeds(m: Map<string, string>, existing: Map<string, string>): void {
		const attacks = this.attacks

		for (const attack of attacks) {
			attack.fillWithNameableKeys(m, existing)
		}
	}

	/**  Replacements */
	get skillNameWithReplacements(): string {
		return Nameable.apply(this.power_source, this.nameableReplacements)
	}
}

interface RitualMagicSpellData extends ModelPropsFromSchema<RitualMagicSpellSchema> {
	// get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

type RitualMagicSpellSchema = ActionTemplateSchema &
	BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema &
	SpellTemplateSchema & {
		base_skill: ReplaceableStringField<string, string, true, false, true>
		prereq_count: ToggleableNumberField<number, number, true, false, true>
	}

export { RitualMagicSpellData, type RitualMagicSpellSchema }
