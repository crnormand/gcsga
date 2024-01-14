import { ContainerGURPS } from "@item/container"
import { MeleeWeaponGURPS } from "@item/melee_weapon"
import { RangedWeaponGURPS } from "@item/ranged_weapon"
import { BaseWeaponGURPS } from "@item/weapon"
import { Feature, ItemDataGURPS } from "@module/config"
import { ActorType, ItemType, SYSTEM_NAME } from "@module/data"
import { PrereqList } from "@prereq"
import { EvalEmbeddedRegex, replaceAllStringFunc, resolveStudyHours, sheetDisplayNotes } from "@util"
import { DocumentModificationOptions } from "types/foundry/common/abstract/document.mjs"
import { ItemDataConstructorData } from "types/foundry/common/data/data.mjs/itemData"
import { BaseUser } from "types/foundry/common/documents.mjs"
import { MergeObjectOptions } from "types/foundry/common/utils/helpers.mjs"
import { ItemGCSSource } from "./data"
import { display, feature, study } from "@util/enum"

export abstract class ItemGCS<SourceType extends ItemGCSSource = ItemGCSSource> extends ContainerGURPS<SourceType> {
	unsatisfied_reason = ""

	protected async _preCreate(
		data: ItemDataGURPS,
		options: DocumentModificationOptions,
		user: BaseUser
	): Promise<void> {
		let type = data.type.replace("_container", "")
		if (type === ItemType.Technique) type = ItemType.Skill
		else if (type === ItemType.RitualMagicSpell) type = ItemType.Spell
		else if (type === ItemType.Equipment) type = "equipment"
		else if (type === ItemType.LegacyEquipment) type = "legacy_equipment"
		if (this._source.img === (foundry.documents.BaseItem as any).DEFAULT_ICON)
			this._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${type}.svg`
		let gcs_type: string = data.type
		if (gcs_type === ItemType.Equipment) gcs_type = "equipment"
			; (this._source.system as any).type = gcs_type
		await super._preCreate(data, options, user)
	}

	override async update(
		data: DeepPartial<ItemDataConstructorData | (ItemDataConstructorData & Record<string, unknown>)>,
		context?: DocumentModificationContext & MergeObjectOptions & { noPrepare?: boolean }
	): Promise<this | undefined> {
		if (this.parent instanceof Actor && context?.noPrepare)
			this.parent.noPrepare = true
		return super.update(data, context)
		// if (!(this.parent instanceof Item)) {
		// 	// if (this.parent instanceof Actor)
		// 	// 	this.parent.noPrepare = context?.noPrepare ?? false
		// 	return super.update(data, context)
		// }
		// data._id = this.id
		// await this.container?.updateEmbeddedDocuments("Item", [data])
		// // @ts-expect-error type not properly declared, to do later
		// this.render(false, { action: "update", data: data })
	}

	override get actor(): (typeof CONFIG.GURPS.Actor.documentClasses)[ActorType.Character] | null {
		const actor = super.actor
		if (actor?.type === ActorType.Character) return actor
		return null
	}

	get unsatisfiedReason(): string {
		return ""
	}

	get studyHours(): number {
		return resolveStudyHours((this.system as any).study ?? [])
	}

	get studyHoursNeeded(): string {
		const system = this.system as any
		if (system.study_hours_needed === "") return study.Level.Standard
		return system.study_hours_needed
	}

	get localNotes(): string {
		return this.system.notes ?? ""
	}

	get notes(): string {
		return replaceAllStringFunc(EvalEmbeddedRegex, this.localNotes, this.actor)
	}

	get ratedStrength(): number {
		return 0
	}

	get formattedName(): string {
		return this.name ?? ""
	}

	get enabled(): boolean {
		return true
	}

	get tags(): string[] {
		return this.system.tags
	}

	secondaryText(_optionChecker: (option: display.Option) => boolean): string {
		return ""
	}

	get reference(): string {
		return this.system.reference
	}

	get isLeveled(): boolean {
		return false
	}

	get levels(): number {
		return 0
	}

	get features(): Feature[] {
		if (!this.system.hasOwnProperty("features")) return []

		return (this.system as any).features.map((e: Partial<Feature>) => {
			const FeatureConstructor = CONFIG.GURPS.Feature.classes[e.type as feature.Type]
			const f = FeatureConstructor.fromObject(e)
			if (this.isLeveled) f.setLevel(this.levels)
			return f
		})
	}

	get prereqs() {
		if (!(this.system as any).prereqs) return new PrereqList()
		return PrereqList.fromObject((this.system as any).prereqs)
	}

	get prereqsEmpty(): boolean {
		if (!(this.system as any).prereqs.prereqs) return true
		return this.prereqs?.prereqs.length === 0
	}

	get meleeWeapons(): Collection<MeleeWeaponGURPS> {
		const meleeWeapons: Collection<MeleeWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof MeleeWeaponGURPS) meleeWeapons.set(item._id, item)
		}
		return meleeWeapons
	}

	get rangedWeapons(): Collection<RangedWeaponGURPS> {
		const rangedWeapons: Collection<RangedWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof RangedWeaponGURPS) rangedWeapons.set(item._id, item)
		}
		return rangedWeapons
	}

	get weapons(): Collection<BaseWeaponGURPS> {
		const weapons: Collection<BaseWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof BaseWeaponGURPS) weapons.set(item._id, item)
		}
		return weapons
	}

	exportSystemData(_keepOther: boolean): any {
		const system: any = this.system
		system.name = this.name
		if (system.features)
			system.features = system.features.map((e: Feature) => {
				const { effective: _, ...rest } = e
				return rest
			})
		if ((this as any).children)
			system.children = (this as any).children.map((e: ItemGCS) => e.exportSystemData(false))
		if ((this as any).modifiers)
			system.modifiers = (this as any).modifiers.map((e: ItemGCS) => e.exportSystemData(false))
		if ((this as any).weapons)
			system.weapons = (this as any).weapons.map((e: BaseWeaponGURPS) => e.exportSystemData(false))
		return system
	}

	prepareData(): void {
		if (this.parent?.noPrepare) return
		super.prepareData()
	}

	protected _getCalcValues(): this["system"]["calc"] {
		return {
			name: this.formattedName,
			indent: this.parents.length,
			resolved_notes: sheetDisplayNotes(this.secondaryText(display.Option.isInline), { unsatisfied: this.unsatisfied_reason }),
		}
	}

	prepareDerivedData(): void {
		this.system.calc = this._getCalcValues()
		this._source.system.calc = this._getCalcValues()
	}
}
