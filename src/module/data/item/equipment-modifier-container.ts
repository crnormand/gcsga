import { ItemDataModel } from "./abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { align, cell, display } from "@util"
import { CellData, CellDataOptions } from "./components/cell-data.ts"

class EquipmentModifierContainerData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	ContainerTemplate,
	ReplacementTemplate,
) {
	static override childTypes = new Set([ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-container"]
		context.embedsParts = ["gurps.embeds-equipment-modifier"]
	}

	static override defineSchema(): EquipmentModifierContainerSchema {
		return this.mergeSchema(super.defineSchema(), {}) as EquipmentModifierContainerSchema
	}

	override cellData(_options: { hash: CellDataOptions } = { hash: {} }): Record<string, CellData> {
		return {
			enabled: new CellData({
				type: cell.Type.Toggle,
				checked: false,
				alignment: align.Option.Middle,
				classList: ["item-toggle"],
			}),
			dropdown: new CellData({
				type: cell.Type.Dropdown,
				open: this.open,
				classList: ["item-dropdown"],
			}),
			name: new CellData({
				type: cell.Type.Text,
				primary: this.nameWithReplacements,
				secondary: this.secondaryText(display.Option.isInline),
				tooltip: this.secondaryText(display.Option.isTooltip),
				classList: ["item-name"],
			}),
			techLevel: new CellData({
				type: cell.Type.Text,
				primary: "",
				classList: ["item-tech-level"],
			}),
			cost: new CellData({
				type: cell.Type.Text,
				primary: "",
				classList: ["item-value-adjustment"],
			}),
			weight: new CellData({
				type: cell.Type.Text,
				primary: "",
				classList: ["item-weight-adjustment"],
			}),
		}
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		if (optionChecker(SheetSettings.for(this.parent.actor).notes_display)) return this.notesWithReplacements
		return ""
	}
}

interface EquipmentModifierContainerData extends ModelPropsFromSchema<EquipmentModifierContainerSchema> {}

type EquipmentModifierContainerSchema = BasicInformationTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {}

export { EquipmentModifierContainerData, type EquipmentModifierContainerSchema }
