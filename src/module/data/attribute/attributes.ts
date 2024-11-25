import { AttributeGURPS, AttributeSchema } from "./attribute.ts"
import fields = foundry.data.fields
import { ActorDataModel } from "../actor/abstract.ts"

class Attributes extends foundry.abstract.DataModel<ActorDataModel, AttributesSchema> {
	private declare _map: Map<string, AttributeGURPS>
	private declare _set: Record<string, AttributeGURPS>

	static override defineSchema(): AttributesSchema {
		const fields = foundry.data.fields
		return {
			list: new fields.ArrayField(new fields.EmbeddedDataField(AttributeGURPS), {
				required: true,
				nullable: false,
				initial: [],
			}),
		}
	}

	get map(): Map<string, AttributeGURPS> {
		return (this._map ??= new Map(this.list.map(e => [e.id, e])))
	}

	get set(): Record<string, AttributeGURPS> {
		return Object.fromEntries(this.list.map(e => [e.id, e]))
	}

	get primary(): Record<string, AttributeGURPS> {
		return Object.fromEntries(this.list.filter(e => e.isPrimary).map(e => [e.id, e]))
	}

	get secondary(): Record<string, AttributeGURPS> {
		return Object.fromEntries(this.list.filter(e => e.isSecondary).map(e => [e.id, e]))
	}

	get pool(): Record<string, AttributeGURPS> {
		return Object.fromEntries(this.list.filter(e => e.isPool).map(e => [e.id, e]))
	}
}

interface Attributes extends ModelPropsFromSchema<AttributesSchema> {}

type AttributesSchema = {
	list: fields.ArrayField<
		fields.EmbeddedDataField<AttributeGURPS>,
		SourceFromSchema<AttributeSchema>[],
		AttributeGURPS[],
		true,
		false,
		true
	>
}

export { Attributes, type AttributesSchema }
