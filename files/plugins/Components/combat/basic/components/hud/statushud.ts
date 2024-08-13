import { Optional } from "@utils/optional"
import { ComponentManager } from "combat/basic/core/component"
import { PublicComponent, Fields } from "../../core/config"
import { HudComponent, HudComponentParams } from "./hud"
import { TargetLock } from "../target-lock"
import { Stamina } from "../stamina"
import { Status } from '../../core/status'

@PublicComponent('status-hud')
@Fields([ 'content', 'type', 'fadeIn', 'fadeOut', 'stay' ])
export class StatusHud extends HudComponent {
    constructor(
        content: string = '',
        type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 = 4,
        fadeIn = 0,
        fadeOut = 0,
        stay = 2,
    ) {
        super(content, type, fadeIn, fadeOut, stay)
    }

    static create({ content, type, fadeIn, fadeOut, stay }: HudComponentParams = {}): StatusHud {
        return new StatusHud(content, type, fadeIn, fadeOut, stay)
    }

    private targetLock: Optional<TargetLock> = Optional.none()
    private targetStamina: Optional<Stamina> = Optional.none()
    private stamina: Optional<Stamina> = Optional.none()

    onAttach(manager: ComponentManager) {
        if ((this.targetLock = manager.getComponent(TargetLock)).isEmpty()) {
            return true
        }

        if ((this.stamina = manager.getComponent(Stamina)).isEmpty()) {
            return true
        }

        manager.beforeTick(() => {
            const lock = this.targetLock.unwrap()
            if (!lock.targetIsPlayer) {
                return
            }

            const target = lock.target.unwrap()
            this.targetStamina = Status.get((target as Player).xuid).componentManager.getComponent(Stamina)
        })
    }

    renderStatus() {
        if (this.targetLock.isEmpty()) {
            return
        }

        const lock = this.targetLock.unwrap()
        const target = lock.target.unwrap()
        const isPlayer = lock.targetIsPlayer
        const { health, maxHealth, name} = target
        const contents = []
        const shortName = name.length > 14 ? name.substring(0, 14) + '…' : name

        contents.push(shortName)
        contents.push(`§${ health / maxHealth < 0.3 ? '4' : 'a' }❤ ${
            isPlayer
                ? this.intProgress(health * 5, maxHealth * 5)
                : this.intProgress(health, maxHealth)
        }§r`)

        if (!this.targetStamina.isEmpty()) {
            const { stamina, maxStamina } = this.targetStamina.unwrap()
            contents.push(`§${ stamina / maxStamina < 0.3 ? '6' : 'f' }⚡⚡ ${this.intProgress(stamina, maxStamina)}§r`)
        } else {
            contents.push('')
        }

        if (!this.stamina.isEmpty()) {
            const { stamina, maxStamina } = this.stamina.unwrap()
            const repeatCount = Math.round(stamina / maxStamina * 20)
            const progressbar = '▮'.repeat(repeatCount) + '§0' + '▮'.repeat(20 - repeatCount)
            contents.push(`§${ stamina / maxStamina < 0.3 ? '3' : '9' }${progressbar}§r`)
        }

        this.content = contents.join('\n')
    }

    private intProgress(val: number, total: number) {
        return String(Math.round(val)).padStart(3, ' ') + '/'
            + String(Math.round(total)).padEnd(3, ' ')
    }

    onTick(_: ComponentManager, pl: Optional<Player>): void {
        this.renderStatus()
        this.renderHud(pl)
    }
}