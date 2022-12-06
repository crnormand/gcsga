import { ActorDataGURPS, ActorSourceGURPS } from "@actor/data"
import Document, {
	Context,
	DocumentModificationOptions,
	Metadata,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs"
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData"
import { BaseUser } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs"
import { ActorFlags, ActorSystemData, BaseActorSourceGURPS } from "./data"
import { SYSTEM_NAME } from "@module/data"

export interface ActorConstructorContextGURPS extends Context<TokenDocument> {
	gurps?: {
		ready?: boolean
		imported?: boolean
	}
}

class BaseActorGURPS extends Actor {
	constructor(data: ActorSourceGURPS, context: ActorConstructorContextGURPS = {}) {
		if (context.gurps?.ready) {
			super(data, context)
			this.noPrepare = false
		} else {
			mergeObject(context, { gurps: { ready: true } })
			const ActorConstructor = (CONFIG as any).GURPS.Actor.documentClasses[data.type]
			return ActorConstructor ? new ActorConstructor(data, context) : new BaseActorGURPS(data, context)
		}
	}

	protected async _preCreate(
		data: ActorDataConstructorData & ActorDataGURPS,
		options: DocumentModificationOptions,
		user: BaseUser
	): Promise<void> {
		// @ts-ignore TODO:
		if (this._source.img === foundry.documents.BaseActor.DEFAULT_ICON)
			this._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${data.type}.svg`
		await super._preCreate(data, options, user)
	}

	protected async _preUpdate(
		changed: DeepPartial<ActorDataConstructorData & ActorDataGURPS>,
		options: DocumentModificationOptions,
		user: BaseUser
	): Promise<void> {
		const defaultToken = `systems/${SYSTEM_NAME}/assets/icons/${this.type}.svg`
		if (changed.img && !(changed as any).prototypeToken?.texture?.src) {
			if (
				!(this as any).prototypeToken.texture.src ||
				(this as any).prototypeToken.texture.src === defaultToken
			) {
				setProperty(changed, "prototypeToken.texture.src", changed.img)
			} else {
				setProperty(changed, "prototypeToken.texture.src", (this as any).prototypeToken.texture.src)
			}
		}
		await super._preUpdate(changed, options, user)
	}

	get deepItems(): Collection<Item> {
		const deepItems: Item[] = []
		for (const item of this.items as any as Collection<Item>) {
			deepItems.push(item)
			if ((item as any).items)
				for (const i of (item as any).deepItems) {
					deepItems.push(i)
				}
		}
		return new Collection(
			deepItems.map(e => {
				return [e.id!, e]
			})
		)
	}

	updateEmbeddedDocuments(
		embeddedName: string,
		updates?: Record<string, unknown>[] | undefined,
		context?: DocumentModificationContext | undefined
	): Promise<Document<any, this, Metadata<any>>[]> {
		return super.updateEmbeddedDocuments(embeddedName, updates, context)
	}

	get sizeMod(): number {
		return 0
	}

	prepareDerivedData(): void {
		super.prepareDerivedData()
		// @ts-ignore until foundry types v10
		setProperty(this.flags, `${SYSTEM_NAME}.${ActorFlags.SelfModifiers}`, [])
		// @ts-ignore until foundry types v10
		setProperty(this.flags, `${SYSTEM_NAME}.${ActorFlags.TargetModifiers}`, [])

		const sizemod = this.sizeMod
		if (sizemod !== 0) {
			// @ts-ignore until foundry types v10
			this.flags[SYSTEM_NAME][ActorFlags.TargetModifiers].push({
				name: "for Size Modifier",
				modifier: sizemod,
				tags: [],
			})
		}
	}
}

interface BaseActorGURPS extends Actor {
	// Readonly data: BaseActorDataGURPS;
	noPrepare: boolean
	deepItems: Collection<Item>
	// Temp
	system: ActorSystemData
	_source: BaseActorSourceGURPS
	_id: string
}

export { BaseActorGURPS }
