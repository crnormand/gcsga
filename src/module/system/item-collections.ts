import { ItemType } from "@module/data/constants.ts"
import { ItemInst } from "@module/data/item/helpers.ts"
import { ActorGURPS2 } from "@module/documents/actor.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import EmbeddedCollection from "types/foundry/common/abstract/embedded-collection.js"

class ItemCollectionsMap<TActor extends ActorGURPS2> {
	declare traits: Collection<ItemInst<ItemType.Trait> | ItemInst<ItemType.TraitContainer>>
	declare skills: Collection<
		ItemInst<ItemType.Skill> | ItemInst<ItemType.Technique> | ItemInst<ItemType.SkillContainer>
	>

	declare spells: Collection<
		ItemInst<ItemType.Spell> | ItemInst<ItemType.RitualMagicSpell> | ItemInst<ItemType.SpellContainer>
	>

	declare equipment: Collection<ItemInst<ItemType.Equipment> | ItemInst<ItemType.EquipmentContainer>>
	declare carriedEquipment: Collection<ItemInst<ItemType.Equipment> | ItemInst<ItemType.EquipmentContainer>>
	declare otherEquipment: Collection<ItemInst<ItemType.Equipment> | ItemInst<ItemType.EquipmentContainer>>
	declare notes: Collection<ItemInst<ItemType.Note> | ItemInst<ItemType.NoteContainer>>
	// declare weapons: Collection<ItemInst<ItemType.WeaponMelee> | ItemInst<ItemType.WeaponRanged>>
	// declare meleeWeapons: Collection<ItemInst<ItemType.WeaponMelee>>
	// declare rangedWeapons: Collection<ItemInst<ItemType.WeaponRanged>>

	constructor(items: EmbeddedCollection<ItemGURPS2<TActor>>) {
		this.traits = new Collection(
			items.filter(item => item.isOfType(ItemType.Trait, ItemType.TraitContainer)).map(e => [e.id, e]),
		) as unknown as this["traits"]
		this.skills = new Collection(
			items
				.filter(item => item.isOfType(ItemType.Skill, ItemType.Technique, ItemType.SkillContainer))
				.map(e => [e.id, e]),
		) as unknown as this["skills"]
		this.spells = new Collection(
			items
				.filter(item => item.isOfType(ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer))
				.map(e => [e.id, e]),
		) as unknown as this["spells"]
		this.equipment = new Collection(
			items.filter(item => item.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)).map(e => [e.id, e]),
		) as unknown as this["equipment"]
		this.carriedEquipment = new Collection(
			items
				.filter(
					item =>
						item.isOfType(ItemType.Equipment, ItemType.EquipmentContainer) && item.system.other === false,
				)
				.map(e => [e.id, e]),
		) as unknown as this["carriedEquipment"]
		this.otherEquipment = new Collection(
			items
				.filter(
					item =>
						item.isOfType(ItemType.Equipment, ItemType.EquipmentContainer) && item.system.other === true,
				)
				.map(e => [e.id, e]),
		) as unknown as this["otherEquipment"]
		this.notes = new Collection(
			items.filter(item => item.isOfType(ItemType.Note, ItemType.NoteContainer)).map(e => [e.id, e]),
		) as unknown as this["notes"]
		// this.weapons = new Collection(
		// 	items.filter(item => item.isOfType(ItemType.WeaponMelee, ItemType.WeaponRanged)).map(e => [e.id, e]),
		// ) as unknown as this["weapons"]
		// this.meleeWeapons = new Collection(
		// 	items.filter(item => item.isOfType(ItemType.WeaponMelee)).map(e => [e.id, e]),
		// ) as unknown as this["meleeWeapons"]
		// this.rangedWeapons = new Collection(
		// 	items.filter(item => item.isOfType(ItemType.WeaponRanged)).map(e => [e.id, e]),
		// ) as unknown as this["rangedWeapons"]
	}
}

export { ItemCollectionsMap }
