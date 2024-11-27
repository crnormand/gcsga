import { PoolThreshold, PoolThresholdSchema } from "./pool-threshold.ts"
import fields = foundry.data.fields
import { ActorType, gid } from "@module/data/constants.ts"
import { attribute, progression } from "@util"
import { ActorDataModel } from "@module/data/actor/abstract.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"
import { AttributeHolderTemplate } from "@module/data/actor/templates/attribute-holder.ts"
import { VariableResolver, evaluateToNumber } from "@module/util/index.ts"
import { AbstractStatDef, AbstractStatDefSchema } from "../abstract-stat/index.ts"
import { ActorInst } from "@module/data/actor/helpers.ts"

class AttributeDef<
	TActor extends AttributeHolderTemplate = AttributeHolderTemplate,
> extends AbstractStatDef<AttributeDefSchema> {
	// static override attributeClass = AttributeGURPS

	static override defineSchema(): AttributeDefSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({
				required: true,
				nullable: false,
				choices: attribute.TypesChoices,
				initial: attribute.Type.Integer,
				label: "GURPS.Attribute.Definition.FIELDS.Type.Name",
			}),
			placement: new fields.StringField({
				required: false,
				nullable: false,
				blank: false,
				choices: attribute.PlacementsChoices,
				initial: attribute.Placement.Automatic,
				label: "GURPS.Attribute.Definition.FIELDS.Placement.Name",
			}),
			id: new fields.StringField({
				required: true,
				nullable: false,
				initial: "id",
				label: "GURPS.Attribute.Definition.FIELDS.Id.Name",
			}),
			base: new fields.StringField({
				required: true,
				nullable: false,
				initial: "10",
				label: "GURPS.Attribute.Definition.FIELDS.Base.Name",
			}),
			name: new fields.StringField({
				required: true,
				nullable: false,
				initial: "id",
				label: "GURPS.Attribute.Definition.FIELDS.Name.Name",
			}),
			full_name: new fields.StringField({
				required: false,
				nullable: false,
				initial: "",
				label: "GURPS.Attribute.Definition.FIELDS.FullName.Name",
			}),
			cost_per_point: new fields.NumberField({
				required: true,
				nullable: false,
				min: 0,
				initial: 0,
				label: "GURPS.Attribute.Definition.FIELDS.CostPerPoint.Name",
			}),
			cost_adj_percent_per_sm: new fields.NumberField({
				required: false,
				nullable: false,
				integer: true,
				min: 0,
				max: 80,
				initial: 0,
				label: "GURPS.Attribute.Definition.FIELDS.CostAdjPercentPerSm.Name",
			}),
			thresholds: new fields.ArrayField(new fields.EmbeddedDataField(PoolThreshold), {
				required: false,
				nullable: false,
				label: "GURPS.Attribute.Definition.FIELDS.Thresholds.Name",
			}),
		}
	}

	static override cleanData(
		source?: object | undefined,
		options?: Record<string, unknown> | undefined,
	): SourceFromSchema<fields.DataSchema> {
		let { type, thresholds }: Partial<SourceFromSchema<AttributeDefSchema>> = {
			type: undefined,
			thresholds: undefined,
			...source,
		}
		if (type === attribute.Type.Pool || type === attribute.Type.PoolRef) {
			thresholds ||= [new PoolThreshold().toObject()]
		} else {
			thresholds = undefined
		}
		return super.cleanData({ ...source, type, thresholds }, options)
	}

	get fullName(): string {
		if (!this.full_name) return this.name
		return this.full_name
	}

	get combinedName(): string {
		if (!this.full_name) return this.name
		if (!this.name || this.name === this.full_name) return this.full_name
		return `${this.full_name} (${this.name})`
	}

	get isPrimary(): boolean {
		if (this.type === attribute.Type.PrimarySeparator) return true
		if (
			this.type === attribute.Type.Pool ||
			this.type === attribute.Type.PoolRef ||
			this.type === attribute.Type.SecondarySeparator ||
			this.isSeparator
		)
			return false
		if (this.placement === attribute.Placement.Primary) return true
		return !isNaN(parseInt(this.base))
	}

	get isSecondary(): boolean {
		if (this.type === attribute.Type.SecondarySeparator) return true
		if (
			this.type === attribute.Type.Pool ||
			this.type === attribute.Type.PoolRef ||
			this.type === attribute.Type.PrimarySeparator ||
			this.isSeparator
		)
			return false
		if (this.placement === attribute.Placement.Secondary) return true
		return isNaN(parseInt(this.base))
	}

	get isSeparator(): boolean {
		return [
			attribute.Type.PrimarySeparator,
			attribute.Type.SecondarySeparator,
			attribute.Type.PoolSeparator,
		].includes(this.type)
	}

	baseValue(resolver: VariableResolver): number {
		return evaluateToNumber(this.base, resolver)
	}

	computeCost(actor: ActorDataModel, value: number, cost_reduction: number, size_modifier: number): number {
		if (!actor.hasTemplate(ActorTemplateType.Settings)) {
			console.error("Actor does not have settings. Cannot compute cost")
			return 0
		}
		let cost = value * (this.cost_per_point || 0)
		if (
			size_modifier > 0 &&
			(this.cost_adj_percent_per_sm ?? 0) > 0 &&
			!(
				this.id === gid.HitPoints &&
				actor.settings.damage_progression === progression.Option.KnowingYourOwnStrength
			)
		)
			cost_reduction = size_modifier * (this.cost_adj_percent_per_sm ?? 0)
		if (cost_reduction > 0) {
			if (cost_reduction > 80) cost_reduction = 80
			cost = (cost * (100 - cost_reduction)) / 100
		}
		return Math.round(cost)
	}

	// generateNewAttribute(): AttributeGURPS {
	// 	return new AttributeGURPS({ id: this.id }, { parent: this.actor.system, order: 0 })
	// }
}

interface AttributeDef extends AbstractStatDef<AttributeDefSchema>, ModelPropsFromSchema<AttributeDefSchema> {
	get actor(): ActorInst<ActorType.Character>
}

type AttributeDefSchema = AbstractStatDefSchema & {
	type: fields.StringField<attribute.Type, attribute.Type, true, false, true>
	placement: fields.StringField<attribute.Placement, attribute.Placement, false, false, true>
	name: fields.StringField<string, string, true, false, true>
	full_name: fields.StringField<string, string, false, false, true>
	cost_per_point: fields.NumberField<number, number, true, false, true>
	cost_adj_percent_per_sm: fields.NumberField<number, number, false, false, true>
	thresholds: fields.ArrayField<
		fields.EmbeddedDataField<PoolThreshold>,
		Partial<SourceFromSchema<PoolThresholdSchema>>[],
		PoolThreshold[],
		false,
		false,
		false
	>
}

export { AttributeDef, type AttributeDefSchema }
