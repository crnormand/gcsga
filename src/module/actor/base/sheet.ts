import { BaseActorGURPS } from "@actor"
import { ItemType, SYSTEM_NAME } from "@module/data"
import { DamageChat } from "@module/damage_calculator/damage_chat_message"
import { DnD } from "@util/drag_drop"
import { ActorGURPS } from "@module/config"
import { PropertiesToSource } from "types/types/helperTypes"
import { ItemDataBaseProperties } from "types/foundry/common/data/data.mjs/itemData"
import { LastActor } from "@util"
import { ContainerGURPS, ItemFlags } from "@item"

type DispatchFunctions = Record<string, (arg: any) => void>

export class ActorSheetGURPS extends ActorSheet {
	readonly dropDispatch: DispatchFunctions = {
		[DamageChat.TYPE]: this.actor.handleDamageDrop.bind(this.actor),
	}

	static override get defaultOptions(): ActorSheet.Options {
		const options = ActorSheet.defaultOptions
		mergeObject(options, {
			classes: ["gurps", "actor"],
		})
		return options
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.on("click", () => LastActor.set(this.actor))
	}

	protected override _onDrop(event: DragEvent): void {
		if (!event?.dataTransfer) return

		let dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)

		if (this.dropDispatch[dragData.type]) this.dropDispatch[dragData.type](dragData.payload)

		super._onDrop(event)
	}

	emulateItemDrop(data: any) {
		const item = fromUuidSync(data.uuid) as Item
		if (!item) return
		return this._onDropItemCreate({ ...item.toObject(), uuid: data.uuid } as any)
	}

	// DragData handling
	protected override async _onDropItem(
		event: DragEvent,
		data: ActorSheet.DropData.Item & { actor: BaseActorGURPS; _uuid?: string }
	): Promise<unknown> {
		const top = Boolean($(".border-top").length)
		const inContainer = Boolean($(".border-in").length)

		$(".border-bottom").removeClass("border-bottom")
		$(".border-top").removeClass("border-top")
		$(".border-in").removeClass("border-in")

		// Return super._onDropItem(event, data)

		if (!this.actor.isOwner) return false

		let item: Item
		if (data._uuid) {
			const importData = {
				type: data.type,
				uuid: data._uuid,
			}
			item = await (Item.implementation as any).fromDropData(importData)
		} else {
			item = await (Item.implementation as any).fromDropData(data)
		}
		const itemData = { ...item.toObject(), id: item.id }

		// Handle item sorting within the same Actor
		if (this.actor.uuid === item.actor?.uuid) {
			return this._onSortItem(event, itemData, { top: top, in: inContainer })
		}

		// const updates = await this._onDropItemCreate(itemData)
		// if (!updates.length) return
		// const rootID = updates[0].id

		// if (item instanceof ContainerGURPS) {
		// 	const itemList =
		// 		item.items.contents.map(e =>
		// 			mergeObject(e.toObject(), {
		// 				[`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: rootID
		// 			})
		// 		)
		// 	await this._onDropItemCreate(itemList)
		// }
		return this._onDropNestedItemCreate([item], { id: null })
		// return this._onDropItemCreate(itemList)
	}

	async _onDropNestedItemCreate(items: Item[], context: { id: string | null } = { id: null }) {
		items = items instanceof Array ? items : [items]
		const itemData = items.map(e =>
			mergeObject(e.toObject(), { [`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: context.id })
		)
		const newItems = await this._onDropItemCreate(itemData as any)
		let totalItems = newItems
		for (let i = 0; i < items.length; i++) {
			if (items[i] instanceof ContainerGURPS) {
				const parent = items[i] as ContainerGURPS
				const childItems = await this._onDropNestedItemCreate(parent.items.contents, { id: newItems[i].id })
				totalItems = totalItems.concat(childItems)
			}
		}
		return totalItems
	}

	async _onDropItemCreate(itemData: any) {
		return super._onDropItemCreate(itemData)
	}

	protected override async _onDragStart(event: DragEvent): Promise<void> {
		const list = event.currentTarget
		// If (event.target.classList.contains("contents-link")) return;

		let itemData: any
		let dragData: any

		// Owned Items
		if ($(list as HTMLElement).data("uuid")) {
			const uuid = $(list as HTMLElement).data("uuid")
			itemData = (await fromUuid(uuid))?.toObject()
			itemData._id = null
			// Adding both uuid and itemData here. Foundry default functions don't read _uuid, but they do read uuid
			// this prevents Foundry from attempting to get the object from uuid, which would cause it to complain
			// e.g. in cases where an item inside a container is dragged into the items tab
			dragData = {
				type: "Item",
				_uuid: uuid,
				data: itemData,
			}

			// Create custom drag image
			const dragImage = document.createElement("div")
			dragImage.innerHTML = await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/drag-image.hbs`, {
				name: `${itemData?.name}`,
				type: `${itemData?.type.replace("_container", "").replaceAll("_", "-")}`,
			})
			dragImage.id = "drag-ghost"
			document.body.querySelectorAll("#drag-ghost").forEach(e => e.remove())
			document.body.appendChild(dragImage)
			const height = (document.body.querySelector("#drag-ghost") as HTMLElement).offsetHeight
			event.dataTransfer?.setDragImage(dragImage, 0, height / 2)
		}

		// Active Effect
		if ((list as HTMLElement).dataset.effectId) {
			const effect = this.actor.effects.get((list as HTMLElement).dataset.effectId!)
			dragData = (effect as any)?.toDragData()
		}

		// Set data transfer
		event.dataTransfer?.setData("text/plain", JSON.stringify(dragData))
	}

	protected override async _onSortItem(
		event: DragEvent,
		itemData: PropertiesToSource<ItemDataBaseProperties> & { id: string | null },
		options: { top: boolean; in: boolean } = { top: false, in: false }
	): Promise<Item[]> {
		const source: any = this.actor.items.get(itemData.id!)
		let dropTarget = $(event.target!).closest(".desc[data-uuid]")
		const id = dropTarget?.data("uuid").split(".").at(-1)
		let target: any = this.actor.items.get(id)
		if (!target) return []
		let parent: any = target?.container
		let parents = target?.parents
		if (options.in) {
			parent = target
			target = parent.children.contents[0] ?? null
		}
		const siblings = (parent!.items as Collection<Item>).filter(
			i => i.id !== source!.id && (source as any)!.sameSection(i)
		)
		if (target && !(source as any)?.sameSection(target)) return []

		const sortUpdates = SortingHelpers.performIntegerSort(source, {
			target: target,
			siblings: siblings,
			sortBefore: options.top,
		})
		const updateData = sortUpdates.map(u => {
			const update = u.update
			;(update as any)._id = u.target!._id
			return update
		}) as { _id: string; sort: number; [key: string]: any }[]

		console.log(source, source.container, parent)
		if (source && source.container !== parent) {
			const id = updateData.findIndex(e => (e._id = source._id))
			if (source.items && parents.includes(source)) return []
			console.log(updateData)
			updateData[id][`flags.${SYSTEM_NAME}.${ItemFlags.Container}`] = parent instanceof Item ? parent.id : null
			if ([ItemType.Equipment, ItemType.EquipmentContainer].includes(source.type)) {
				if (dropTarget.hasClass("other")) updateData[id]["system.other"] = true
				else updateData[id]["system.other"] = false
			}
			console.log(updateData)
			// await source.parent!.deleteEmbeddedDocuments("Item", [source!._id!], { render: false })
			// return parent?.createEmbeddedDocuments(
			// 	"Item",
			// 	[
			// 		{
			// 			name: source.name!,
			// 			system: source.system,
			// 			type: source.type,
			// 			flags: source.flags,
			// 			sort: updateData[0].sort,
			// 		},
			// 	],
			// 	{ temporary: false }
			// )
		}
		return this.actor!.updateEmbeddedDocuments("Item", updateData) as unknown as Item[]
	}

	protected _getHeaderButtons(): Application.HeaderButton[] {
		const all_buttons = super._getHeaderButtons()
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}
}

export interface ActorSheetGURPS extends ActorSheet {
	object: ActorGURPS
}
