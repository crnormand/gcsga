import { RollModifier, RollType, SETTINGS, SYSTEM_NAME, UserFlags } from "@module/data"
import { RollGURPS } from "@module/roll"
import { LastActor } from "@util"
import { ModifierBucket } from "./bucket"
import { ModifierWindow } from "./window"

export class ModifierButton extends Application {
	modifierMode: "prompt" | "bucket" = "prompt"

	showing: boolean

	private _window?: ModifierWindow | ModifierBucket

	constructor(options = {}) {
		super(options)
		this.showing = false
		this.modifierMode = game.settings.get(SYSTEM_NAME, SETTINGS.MODIFIER_MODE)
	}

	async render(
		force?: boolean | undefined,
		options?: Application.RenderOptions<ApplicationOptions> | undefined
	): Promise<unknown> {
		await this.recalculateModTotal(game.user)
		this.modifierMode = game.settings.get(SYSTEM_NAME, SETTINGS.MODIFIER_MODE)
		if (this.window?.rendered) await this.window.render()
		return super.render(force, options)
	}

	get window(): ModifierWindow | ModifierBucket {
		this.modifierMode = game.settings.get(SYSTEM_NAME, SETTINGS.MODIFIER_MODE)
		if (this._window) {
			if (this._window instanceof ModifierWindow && this.modifierMode === "bucket")
				this._window = new ModifierBucket(this, {})
			else if (this._window instanceof ModifierBucket && this.modifierMode === "prompt")
				this._window = new ModifierWindow(this, {})
			return this._window
		}
		if (this.modifierMode === "bucket") this._window = new ModifierBucket(this, {})
		else this._window = new ModifierWindow(this, {})
		return this._window
	}

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			popOut: false,
			minimizable: false,
			resizable: false,
			id: "ModifierButton",
			template: `systems/${SYSTEM_NAME}/templates/modifier-app/button.hbs`,
			classes: ["modifier-button"],
		})
	}

	async getData(options?: Partial<ApplicationOptions> | undefined): Promise<object> {
		const user = game.user
		let total = (user?.getFlag(SYSTEM_NAME, UserFlags.ModifierTotal) as number) ?? 0
		let buttonMagnet = ""
		if (user?.getFlag(SYSTEM_NAME, UserFlags.ModifierSticky) === true) buttonMagnet = "sticky"
		let buttonColor = "total-white"
		if (total > 0) buttonColor = "total-green"
		if (total < 0) buttonColor = "total-red"
		const showDice = true
		const currentActor = user?.isGM ? await LastActor.get() : null

		return mergeObject(super.getData(options), {
			total: total,
			buttonColor: buttonColor,
			buttonMagnet: buttonMagnet,
			imgDice: `systems/${SYSTEM_NAME}/assets/3d6.webp`,
			currentActor: currentActor ? currentActor.name : null,
			showDice,
		})
	}

	_injectHTML(html: JQuery<HTMLElement>): void {
		if ($("body").find("#modifier-app").length === 0) {
			html.insertAfter($("body").find("#hotbar-page-controls"))
			this._element = html
		}
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)

		// window.addEventListener("wheel", event => {
		// 	event.stopPropagation()
		// 	// console.log(event.deltaY)
		// 	const delta = (event.deltaY < 0) ? -1 : 1
		// 	const element = $(event.currentTarget!)
		// 	if (
		// 		element.attr("id") === "modifier-app" ||
		// 		element.parent("#modifier-app")
		// 	) this._onMouseWheel(delta)
		// }, { passive: false })

		// html.on("wheel", event => this._onMouseWheel(event), {passive: true})
		html[0].addEventListener("wheel", event => this._onMouseWheel(event), { passive: true })

		html.find("#modifier-app").on("click", event => this._onClick(event))
		html.find(".magnet").on("click", event => this._onMagnetClick(event))
		html.find(".trash").on("click", event => this.resetMods(event))

		html.find("#dice-roller").on("click", event => this._onDiceClick(event))
		html.find("#dice-roller").on("contextmenu", event => this._onDiceContextMenu(event))
	}

	async _onClick(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		if (this.showing) {
			await this.window.close()
			game.ModifierList.fadeOut()
		} else {
			await this.window.render(true)
			game.ModifierList.fadeIn()
		}
	}

	async _onDiceClick(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		return RollGURPS.handleRoll(game.user, null, {
			type: RollType.Generic,
			formula: "3d6",
			hidden: event.ctrlKey,
		})
	}

	async _onDiceContextMenu(event: JQuery.ContextMenuEvent): Promise<void> {
		event.preventDefault()
		return RollGURPS.handleRoll(game.user, null, {
			type: RollType.Generic,
			formula: "1d6",
			hidden: event.ctrlKey,
		})
	}

	async _onMagnetClick(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		event.stopPropagation()
		const sticky = game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierSticky) ?? false
		await game.user?.setFlag(SYSTEM_NAME, UserFlags.ModifierSticky, !sticky)
		return this.render()
	}

	async clear() {
		await game.user?.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, [])
		await game.user?.setFlag(SYSTEM_NAME, UserFlags.ModifierTotal, 0)
		game.ModifierList.render()
		return this.render(true)
	}

	async resetMods(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		event.stopPropagation()
		return this.clear()
	}

	// async _onMouseWheel(delta: number) {
	// 	return game.ModifierList.addModifier({
	// 		name: "",
	// 		modifier: delta,
	// 		tags: [],
	// 	})
	// }

	async _onMouseWheel(event: WheelEvent) {
		const delta = Math.round(event.deltaY / -100)
		return game.ModifierList.addModifier({
			name: "",
			modifier: delta,
			tags: [],
		})
	}

	async recalculateModTotal(user: StoredDocument<User> | null): Promise<unknown> {
		if (!user) return
		let total = 0
		const mods: RollModifier[] = (user.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]) ?? []
		if (mods.length > 0)
			for (const m of mods) {
				total += m.modifier
			}
		await user.setFlag(SYSTEM_NAME, UserFlags.ModifierTotal, total)
	}
}
