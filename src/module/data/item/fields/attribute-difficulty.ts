import { difficulty } from "@util"
import fields = foundry.data.fields
import { ItemDataModel } from "@module/data/abstract.ts"
import { gid } from "@module/data/constants.ts"
import { getAttributeChoices } from "@module/data/attribute/helpers.ts"

class AttributeDifficulty extends foundry.abstract.DataModel<ItemDataModel, AttributeDifficultySchema> {
	constructor(
		data?: DeepPartial<SourceFromSchema<AttributeDifficultySchema>>,
		options?: DataModelConstructionOptions<ItemDataModel>,
	) {
		super(data, options)
		if (options?.parent) {
			;(this.schema.fields.attribute as any).choices = getAttributeChoices(
				this.parent.actor,
				this.attribute,
				"GURPS.Item.Skill.FIELDS.Difficulty.Attribute",
				{
					blank: false,
					ten: true,
					size: false,
					dodge: false,
					parry: false,
					block: false,
					skill: false,
				},
			).choices
		}
	}

	static override defineSchema(): AttributeDifficultySchema {
		const fields = foundry.data.fields

		const attributeChoices = getAttributeChoices(
			null,
			gid.Dexterity,
			"GURPS.Item.Skill.FIELDS.Difficulty.Attribute",
			{
				blank: false,
				ten: true,
				size: false,
				dodge: false,
				parry: false,
				block: false,
				skill: false,
			},
		).choices

		return {
			attribute: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: attributeChoices,
				initial: gid.Dexterity,
			}),
			difficulty: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: difficulty.LevelsChoices("GURPS.Item.Skill.FIELDS.Difficulty.Difficulty"),
				initial: difficulty.Level.Average,
			}),
		}
	}

	override toString(): string {
		return `${this.attribute.toString()}/${this.difficulty.toString()}`
	}
}

interface AttributeDifficulty
	extends foundry.abstract.DataModel<ItemDataModel, AttributeDifficultySchema>,
		ModelPropsFromSchema<AttributeDifficultySchema> {}

type AttributeDifficultySchema = {
	attribute: fields.StringField<string, string, true, false, true>
	difficulty: fields.StringField<difficulty.Level, difficulty.Level, true, false, true>
}

export { AttributeDifficulty, type AttributeDifficultySchema }
