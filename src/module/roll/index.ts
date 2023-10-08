import { CharacterGURPS } from "@actor"
import { ActorGURPS } from "@module/config"
import { RollModifier, RollType, SETTINGS, SYSTEM_NAME, UserFlags } from "@module/data"
import { RollTypeData, rollTypeHandlers } from "./refactor"

enum RollSuccess {
	Success = "success",
	Failure = "failure",
	CriticalSuccess = "critical_success",
	CriticalFailure = "critical_failure",
}

const MODIFIER_CLASS_ZERO = "zero"
const MODIFIER_CLASS_NEGATIVE = "neg"
const MODIFIER_CLASS_POSITIVE = "pos"

export class RollGURPS extends Roll {
	originalFormula = ""

	usingMod = false

	system: Record<string, any> = {}

	static override CHAT_TEMPLATE = `systems/${SYSTEM_NAME}/templates/dice/roll.hbs`

	static override TOOLTIP_TEMPLATE = `systems/${SYSTEM_NAME}/templates/dice/tooltip.hbs`

	constructor(formula: string, data: any, options?: any) {
		const originalFormula = formula
		// Formula = formula.replace(/([0-9]+)[dD]([\D])/g, "$1d6$2")
		// formula = formula.replace(/([0-9]+)[dD]$/g, "$1d6")
		super(formula, data, options)

		this.usingMod = formula.includes("@gmod")
		this.originalFormula = originalFormula
	}

	get formula() {
		return this.originalFormula
			.replace(/d6/g, "d")
			.replace(/\*/g, "x")
			.replace(/\+\s*@gmod[c]?/g, "")
			.trim()
	}

	static override replaceFormulaData(
		formula: string,
		data: any,
		options?: {
			missing: string
			warn: boolean
		}
	): string {
		let dataRgx = new RegExp(/\$([a-z.0-9_-]+)/gi)
		const newFormula = formula.replace(dataRgx, (match, term) => {
			if (data.actor) {
				let value: any = (data.actor as CharacterGURPS).resolveVariable(term.replace("$", "")) ?? null
				if (value === null) {
					if (options?.warn && ui.notifications)
						ui.notifications.warn(game.i18n.format("DICE.WarnMissingData", { match }))
					return options?.missing !== undefined ? String(options.missing) : match
				}
				return String(value).trim()
			}
			return ""
		})
		return super.replaceFormulaData(newFormula, data, options)
	}

	override _prepareData(data: any) {
		let d: any = super._prepareData(data) ?? {}
		d.gmod = game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierTotal)
		if (!d.hasOwnProperty("gmodc"))
			Object.defineProperty(d, "gmodc", {
				get() {
					const mod = game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierTotal) as number
					game.ModifierButton.clear()
					return mod
				},
			})
		return d
	}

	/**
	 * Master function to handle various types of roll
	 * @param {StoredDocument<User>} user
	 * @param {ActorGURPS} actor
	 * @param data
	 */
	static async handleRoll(user: StoredDocument<User> | null, actor: ActorGURPS | any, data: any): Promise<void> {
		if (actor instanceof CharacterGURPS) {
			const lastStack = user?.getFlag(SYSTEM_NAME, UserFlags.ModifierStack)
			const lastTotal = user?.getFlag(SYSTEM_NAME, UserFlags.ModifierTotal)
			await user?.setFlag(SYSTEM_NAME, UserFlags.LastStack, lastStack)
			await user?.setFlag(SYSTEM_NAME, UserFlags.LastTotal, lastTotal)
		}

		console.log(data)

		return rollTypeHandlers[data.type as RollType].handleRollType(
			user,
			actor,
			data as RollTypeData,
			(game.settings.get(SYSTEM_NAME, SETTINGS.ROLL_FORMULA) as string) || "3d6",
			data.hidden
		)
	}
}
