// import { AbstractWeaponTemplate } from "../templates/index.ts"
// import { WeaponField } from "./weapon-field.ts"
// import { Int, StringBuilder, TooltipGURPS, feature } from "@util"
// import { ToggleableNumberField } from "@module/data/fields/index.ts"
//
// class WeaponRecoil extends WeaponField<AbstractWeaponTemplate, WeaponRecoilSchema> {
// 	static override defineSchema(): WeaponRecoilSchema {
// 		return {
// 			shot: new ToggleableNumberField({
// 				required: true,
// 				nullable: false,
// 				min: 0,
// 				initial: 0,
// 			}),
// 			slug: new ToggleableNumberField({
// 				required: true,
// 				nullable: false,
// 				min: 0,
// 				initial: 0,
// 			}),
// 		}
// 	}
//
// 	static override fromString(s: string): WeaponRecoil {
// 		const wr = new WeaponRecoil().toObject()
// 		s = s.replaceAll(" ", "").replaceAll(",", "")
// 		const parts = s.split("/")
// 		;[wr.shot] = Int.extract(parts[0])
// 		if (parts.length > 1) {
// 			;[wr.slug] = Int.extract(parts[1])
// 		}
// 		return new WeaponRecoil(wr)
// 	}
//
// 	override toString(): string {
// 		if (this.shot === 0 && this.slug === 0) return ""
// 		const buffer = new StringBuilder()
// 		buffer.push(this.shot.toString())
// 		if (this.slug !== 0) buffer.push("/", this.slug.toString())
// 		return buffer.toString()
// 	}
//
// 	override tooltip(_w: AbstractWeaponTemplate): string {
// 		if (this.shot !== 0 && this.slug !== 0 && this.shot !== this.slug) game.i18n.localize("GURPS.Tooltip.Recoil")
// 		return ""
// 	}
//
// 	override resolve(w: AbstractWeaponTemplate, tooltip: TooltipGURPS | null): WeaponRecoil {
// 		const result = this.toObject()
// 		if (this.shot > 0 || this.slug > 0) {
// 			let percent = 0
// 			for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponRecoilBonus)) {
// 				const amt = bonus.adjustedAmountForWeapon(w)
// 				if (bonus.percent) percent += amt
// 				else {
// 					result.shot += amt
// 					result.slug += amt
// 				}
// 			}
// 			if (percent !== 0) {
// 				result.shot += Math.trunc((result.shot * percent) / 100)
// 				result.slug += Math.trunc((result.slug * percent) / 100)
// 			}
// 			if (this.shot > 0) result.shot = Math.max(result.shot, 1)
// 			else result.shot = 0
//
// 			if (this.slug > 0) result.slug = Math.max(result.slug, 1)
// 			else result.slug = 0
// 		}
// 		return new WeaponRecoil(result)
// 	}
// }
//
// interface WeaponRecoil
// 	extends WeaponField<AbstractWeaponTemplate, WeaponRecoilSchema>,
// 		ModelPropsFromSchema<WeaponRecoilSchema> {}
//
// type WeaponRecoilSchema = {
// 	shot: ToggleableNumberField<number, number, true, false, true>
// 	slug: ToggleableNumberField<number, number, true, false, true>
// }
//
// export { WeaponRecoil, type WeaponRecoilSchema }
