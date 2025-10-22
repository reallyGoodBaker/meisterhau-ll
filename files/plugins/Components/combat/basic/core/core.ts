import { knockback, clearVelocity, impulse, applyKnockbackAtVelocityDirection } from '../../../scripts-rpc/func/kinematics'
import { combat } from '../../../scripts-rpc/func/index'
import { playAnim, playParticle } from '../index'
import { movement, camera, movementInput } from '../generic/index'
import { selectFromSector } from '../generic/range'
import { Status, defaultAcceptableInputs } from './status'
import { Task } from '../generic/task'
import {
    lookAt, lookAtTarget, distanceToTarget, adsorbToTarget, adsorbTo,
    onTick, toggleLock, hasLock, releaseTarget, adsorbOrSetVelocity
} from '../generic/lock'
import { setVelocity } from '../generic/kinematic'
import { clearCamera } from '../generic/camera'
import { Tick } from '../components/tick'
import { CameraFading } from '../components/camera-fading'
import { DamageModifier } from '../components/damage-modifier'
import { registerCommand } from './commands'
import { antiTreeshaking } from '../components/anti-treeshaking'
import { Stamina } from '../components/core/stamina'
import { input } from 'scripts-rpc/func/input'
import { Team } from '../components/team'
import { IncomingAttack } from '../default'
import { em, es } from './event'
import { listenEntitiyWithAi, ai } from './ai/core'
import { setupAiCommands } from './ai'
import { registerHudCommands } from '../components/hud/command'
import { yawToVec2 } from '../../../utils/math'
import { Actor } from '@utils/actor'
import { HurtDisplay } from '../components/hud/hurtDisplay'

export const emitter = em

const { damage: _damage, _damageLL } = combat


function isEntity(actor: Actor) {
    // @ts-ignore
    return Boolean(actor?.type)
}

function damageWithCameraFading(victim: Actor, damage: number, cause: EntityDamageCause = 'entityAttack', abuser: Actor, projectile: Actor, damageOpt: DamageOption) {
    HurtDisplay.notifyHurt(abuser, victim, damageOpt as any)

    if (!isEntity(abuser)) {
        CameraFading.fadeFromAttackDirection(abuser, damageOpt)
    }
    // _damage(victim, damage, cause, abuser, projectile)
    _damageLL(victim, damage)

    const victimPos = victim.feetPos
    const abuserPos = abuser.feetPos
    const dpos = {
        x: 0.7 * victimPos.x + 0.3 * abuserPos.x,
        z: 0.7 * victimPos.z + 0.3 * abuserPos.z,
    }

    playParticle(`weapon:hit_${damageOpt.direction || 'left'}`, {
        x: dpos.x,
        y: abuserPos.y + 1.2,
        z: dpos.z,
        dimid: victimPos.dimid
    })
}

function knockdown(abuser: Actor, victim: Actor, knockback=2) {
    em.emitNone('knockdown', abuser, victim, knockback)
}

function trap(pl: Actor, data: any) {
    em.emitNone('trap', pl, data)
}

em.connectWatcher({
    // add(...args) {
    //     console.log(args)
    // },
    // emit(arg) {
    //     console.log(arg.type)
    // }
})

function attack(abuser: Actor, victim: Actor, damageOpt: DamageOption) {
    em.emitNone('attack', abuser, victim, damageOpt)
}

const playerOverrideEvents = [
    'onUseItem',
    'onAttack',
    'onChangeSprinting',
]
const mobEvents = [
    'onProjectileHitEntity',
]

const _status = (pl: Actor) => Status.getOrCreate(pl.uniqueId)

function freeze(pl: Actor) {
    movement(pl, false)
    camera(pl, false)
}

function unfreeze(pl: Actor) {
    movement(pl)
    // movementInput(pl, true)
    camera(pl)
}

function getMoveDir(pl: Player) {
    // const previusPos = {
    //     x: pl.feetPos.x,
    //     z: pl.feetPos.z
    // }
    // const uniqueId = pl.uniqueId

    // return new Promise(res => {
    //     setTimeout(() => {
    //         const currentPos = mc.getPlayer(uniqueId).feetPos
    //         const movVec = vec2(currentPos.x, currentPos.z, previusPos.x, previusPos.z)
    //         let rot = vec2ToAngle(movVec) * 180 / Math.PI - pl.direction.yaw

    //         rot = rot < -180 ? rot + 360
    //             : rot > 190 ? rot - 360 : rot

    //         const direct = isNaN(rot) ? 0
    //             : rot < -135 ? 3
    //                 : rot < -45 ? 4
    //                     : rot < 45 ? 1
    //                         : rot < 135 ? 2 : 3
            
    //         res(direct)
    //     }, 50);
    // })
    return input.moveDir(pl)
}


function _ctx(pl: Actor, mixins: Partial<MovementContext> = {}): MovementContext {
    const status = _status(pl)
    return {
        camera,
        movement,
        movementInput,
        selectFromSector,
        knockback,
        attack,
        freeze,
        unfreeze,
        status,
        components: status.componentManager,
        clearVelocity,
        impulse,
        setVelocity,
        yawToVec2,
        applyKnockbackAtVelocityDirection,
        task: Task.get(pl.uniqueId),
        lookAt,
        lookAtTarget,
        distanceToTarget,
        adsorbToTarget,
        adsorbTo,
        knockdown,
        releaseTarget,
        adsorbOrSetVelocity,
        getMoveDir,
        trap,
        setSpeed: (pl: Actor, speed: number) => pl.setMovementSpeed(speed),
        ...mixins
    } as any
}

function watchMainhandChange(pl: Player) {
    const status = Status.getOrCreate(pl.uniqueId)
    const hand = pl?.getHand()?.type ?? 'minecraft:air'
    
    status.hand = hand
    return status
}

const pick = (obj: any, arr: typeof playerAttrPickList) =>
    arr.reduce((iter: any, val) => (val in obj && (iter[val] = obj[val]), iter), {})

const playerAttrPickList = [
    'inAir', 'inWater', 'inLava', 'inRain', 'inSnow', 'inWall', 'inWaterOrRain', 'isInvisible', 'isHungry',
    'isOnFire', 'isOnGround', 'isOnHotBlock', 'isGliding', 'isFlying', 'isMoving'
] as const

type ExtractArray<T> = T extends readonly any[] ? T[number] : never

const defaultPacker = (pl: Actor, bind: TrickModule, status: Status) => {
    const allowedState = checkMoveState(bind, status)
    const picked = pick(pl, playerAttrPickList) as Partial<Record<ExtractArray<typeof playerAttrPickList>, any>>
    const stamina = status.componentManager.getComponent(Stamina).unwrap()

    const mixins: TransitionOptMixins = {
        stamina: stamina.stamina,
        hasTarget: hasLock(pl),
        repulsible: status.repulsible,
        isCollide: false,//isCollide(pl),
        isSneaking: input.isPressing(pl as Player, 'sneak'),
        isDodging: input.isPressing(pl as Player, 'jump'),
    }

    return {
        prevent: false,
        allowedState,
        preInput: status.preInput,
        ...picked,
        ...mixins,
    }
}

const dataPackers = {
    onSneak(args: any[]) {
        return {
            isSneaking: args[1]
        }
    },
    onChangeSprinting(args: any[]) {
        return {
            sprinting: args[1]
        }
    },
    onEndOfLife(args: any[]) {
        const status = Status.getOrCreate(args[0].uniqueId)
        return {
            preInput: status.preInput
        }
    },
    onTrap([pl, data]: any[]) {
        const status = Status.getOrCreate(pl.uniqueId)
        return {
            preInput: status.preInput,
            ...data
        }
    },
    onDeflection([ _, __, { direction } ]: any[]) {
        return {
            direction: direction === 'middle' ? 'vertical' : direction
        }
    },
    onBlock([ _, __, { direction } ]: any[]) {
        return {
            direction: direction === 'middle' ? 'vertical' : direction
        }
    },
    onHurt([ pl ]: any[]) {
        return {
            hegemony: Status.getOrCreate(pl.uniqueId).hegemony
        }
    }
}

function checkCondition(cond: TransitionCondition, data: ReturnType<typeof defaultPacker>) {
    for (const [ k, v ] of Object.entries<any>(cond)) {
        if (k === 'prevent') {
            continue
        }

        if (k === 'allowedState') {
            const dataState = data[k]
            if (dataState === 'finish' || v === 'both' || v === dataState) {
                continue
            }

            return false
        }

        if (typeof v === 'function') {
            if (!v(data[k as keyof typeof data])) {
                return false
            }

            continue
        }

        if (k === 'stamina') {
            const val = data[k] as number
            if (val < v) {
                return false
            }

            continue
        }

        if (cond[k as keyof typeof cond] !== data[k as keyof typeof data]) {
            return false
        }
    }

    return true
}

const defaultTransitionCondition = {
    prevent: false,
    allowedState: 'both',
}

export function initCombatComponent(pl: Actor, bind: TrickModule, status: Status) {
    if (!bind) {
        return
    }

    const { moves, entry } = bind
    const move = moves.getMove(entry)

    status.status = entry
    status.duration = 0

    if (move.onEnter) {
        move?.onEnter?.(pl, _ctx(pl) )
    }
}


export function transition(pl: Actor, bind: TrickModule, status: Status, eventName: string, prevent: () => void, args: any[]) {
    if (!bind) {
        return
    }

    if (status.status === 'unknown') {
        initCombatComponent(pl, bind, status)
        return
    }

    const currentMove = bind.moves.getMove(status.status)
    if (!currentMove) {
        return
    }

    const transitions = currentMove.transitions

    let next: string,
        cond: TransitionCondition,
        candidates: [string, typeof cond][] = []

    for (const [_next, _cond] of Object.entries(transitions)) {
        if (Object.keys(_cond).includes(eventName)) {
            const next = _next
            const cond = Object.assign({}, defaultTransitionCondition, (_cond || {})[eventName as keyof typeof _cond])
            candidates.push([next, cond])
        }
    }

    if (!candidates.length) {
        return
    }

    let dataPacker, data = defaultPacker(pl, bind, status)
    if (dataPacker = dataPackers[eventName as keyof typeof dataPackers]) {
        data = Object.assign(data, dataPacker(args))
    }

    for (const [ $next, $cond ] of candidates) {
        if (!checkCondition($cond, data)) {
            continue
        }

        next = $next
        cond = $cond
    }

    // @ts-ignore
    if (!next || next === 'unknown') {
        return
    }

    let previousStatus = status.status

    // @ts-ignore
    if (cond.prevent) {
        prevent()
    }

    status.status = next
    status.duration = 0
    const nextMove = bind.moves.getMove(next) ?? bind.moves.getMove(bind.entry)

    if (nextMove.immediately) {
        nextMove.onAct?.(pl, _ctx(pl, {
            rawArgs: args,
            prevent,
            previousStatus,
            previousMoveState: -1
        }))
        
        // return em.once('onTick', () => transition(pl, bind, status, 'onEndOfLife', prevent, args))
        transition(pl, bind, status, 'onEndOfLife', prevent, args)
        return
    }

    if (currentMove.onLeave) {
        currentMove.onLeave(pl, _ctx(pl, {
            rawArgs: args,
            prevent,
            nextStatus: next
        }))
    }

    if (nextMove.onEnter) {
        nextMove.onEnter(pl, _ctx(pl, {
            rawArgs: args,
            prevent,
            previousStatus,
            previousMoveState: +(status.duration > (currentMove.cast || 0)) as any
        }))
    }
}


function checkMoveState(mod: TrickModule, _status: Status) {
    const { status, duration } = _status
    const move = mod.moves.getMove(status)

    if (move.immediately) {
        return 'none'
    }

    return duration <= (move.cast || 0) ? 'cast' :
        duration <= (move.cast || 0) + (move.backswing || 0) ? 'backswing' : 'finish'
}

function clearStatus(pl: Actor, s: Status, hand: string, hasBind?: TrickModule) {
    s.reset()
    s.hand = hand
    if (!hasBind) {
        playAnim(pl, 'animation.general.stand')
    }
}

function listenPlayerItemChange(mods: Map<string, TrickModule>) {
    const playerMainhanded = new Map()
    const playerOffhanded = new Map()

    function getMod(hand: string) {
        return mods.get(hand) ?? mods.get('*')
    }

    em.on('onTick', () => {
        mc.getOnlinePlayers().forEach(pl => {
            const mainhand = pl.getHand().type
            const offhand = pl.getOffHand().type
            const previousMainhand = playerMainhanded.get(pl.uniqueId)
            const previousOffhand = playerOffhanded.get(pl.uniqueId)

            if (mainhand !== previousMainhand) {
                em.emitNone('onChangeMainhand', pl, mainhand, previousMainhand)
                playerMainhanded.set(pl.uniqueId, mainhand)
            }

            if (offhand !== previousOffhand) {
                em.emitNone('onChangeOffhand', pl, offhand, previousOffhand)
                playerOffhanded.set(pl.uniqueId, offhand)
            }
        })
    })

    em.on('onChangeMainhand', (pl: Player, hand: string, old: string) => {
        const status = Status.getOrCreate(pl.uniqueId)
        const oldBind = getMod(old)

        if (!status || status.status == 'unknown') {
            return
        }

        releaseTarget(pl.uniqueId)

        if (oldBind) {
            const move = oldBind.moves.getMove(status.status)
            if (move?.onLeave) {
                move.onLeave(pl, _ctx(pl))
            }
        }
        
        const bind = getMod(hand)
        clearStatus(pl, status, hand, bind)
        if (!bind) {
            return
        }

        initCombatComponent(pl, bind, status)
    })
}

function listenAllCustomEvents(mods: Map<string, TrickModule>) {
    function getMod(hand: string) {
        return mods.get(hand) ?? mods.get('*')
    }

    function getModCompatibility(actor: Actor) {
        if (!isEntity(actor)) {
            return getMod(getHandedItemType(actor as Player))
        }

        return ai.getRegistration((actor as Entity).type).tricks
    }

    em.on('onTick', onTick(em))
    em.on('onTick', () => {
        Tick.tick++

        for (const [uniqueId, status] of Status.status.entries()) {
            if (typeof uniqueId !== 'string') {
                return
            }

            if (uniqueId === 'global_status') {
                continue
            }

            let pl: Actor = mc.getPlayer(uniqueId)
            let bind = getMod(status.hand)
            if (!pl) {
                pl = mc.getEntity(+uniqueId)
                if (!pl) {
                    continue
                }
                bind = ai.getRegistration(pl.type)?.tricks
            }

            if (!pl ||!bind) {
                continue
            }

            if (!bind.moves.hasMove(status.status)) {
                return
            }

            const currentMove = bind.moves.getMove(status.status)
            const duration = status.duration++

            if (!currentMove) {
                status.status = 'unknown'
                return transition(pl, bind, status, '', Function.prototype as any, [ pl ])
            }

            const _context = _ctx(pl)

            if (currentMove.timeline) {
                const handler = currentMove.timeline[duration]
                if (handler?.call) {
                    handler.call(null, pl, _context)
                }
            }

            if (currentMove.onTick) {
                currentMove.onTick(
                    pl,
                    _context,
                )
            }

            status.componentManager.handleTicks(pl)

            if (duration >= (currentMove.cast || 0) + (currentMove.backswing || 0)) {
                if (currentMove.onLeave) {
                    currentMove.onLeave(pl, _context)
                }
                return transition(pl, bind, status, 'onEndOfLife', Function.prototype as any, [ pl ])
            }

            if (duration == currentMove.cast) {
                if (currentMove.onAct) {
                    currentMove.onAct(pl, _context)
                }
                return
            }
        }
    })

    /**@type {DamageOption}*/
    const defaultDamageOpt = {
        damage: 0,
        damageType: 'entityAttack',
        permeable: false,
        parryable: true,
        knockback: 0.2,
        shock: false,
        powerful: false,
        direction: 'left',
        stiffness: 500,
        trace: false,
    }

    em.on('attack', (abuser: Actor, victim: Actor, damageOpt: DamageOption) => {
        damageOpt = Object.assign({}, defaultDamageOpt, damageOpt)
        const {
            damage,
            damageType,
            damagingProjectile,
            permeable,
            parryable,
            knockback: _k,
            shock,
            powerful,
            trace,
            direction,
        } = damageOpt as Required<DamageOption>

        const victimIsEntity = !(victim as Player).xuid
        const abuserStatus = Status.getOrCreate(abuser.uniqueId)

        if (victimIsEntity && !ai.isRegistered(victim as Entity)) {
            const mod = getModCompatibility(abuser)
            if (!mod) {
                return
            }

            transition(
                abuser,
                mod,
                abuserStatus,
                'onHit',
                Function.prototype as any,
                [ abuser, victim, damageOpt ]
            )

            return damageWithCameraFading(
                victim,
                damage,
                damageType,
                abuser,
                damagingProjectile,
                damageOpt,
            )
        }

        const victimStatus = Status.getOrCreate(victim.uniqueId)

        const _knockback = (h: number, repulsible: boolean) => {
            if (powerful || repulsible) {
                const abuserPos = abuser.pos
                const victimPos = victim.pos
                knockback(victim, victimPos.x - abuserPos.x, victimPos.z - abuserPos.z, h, -2)
                return
            }

            if (!victimIsEntity && (victim as Entity)?.toPlayer?.()?.gameMode === 1) {
                return
            }

            knockback(victim, 0, 0, 0, -2)
        }
        const doDamage = (incomingAttack?: IncomingAttack) => {
            if ((incomingAttack as any).cancel) {
                return
            }

            _knockback(_k, victimStatus.repulsible)
            victimStatus.shocked = shock

            const modifier = victimStatus.componentManager
                .getComponent(DamageModifier)
                .orElse(DamageModifier.defaultModifierOpt).modifier
            const actualDamage = damage * modifier

            em.emitNone('hurt', abuser, victim, {
                ...damageOpt,
                damage: actualDamage, 
                damageType: 'override',
            })
        }

        if (!victimStatus) {
            return doDamage()
        }

        const incomingAttack = new IncomingAttack(
            damage,
            abuser,
            direction,
            permeable,
            parryable,
            powerful,
            trace,
        )
        victimStatus.componentManager.attachComponent(incomingAttack)

        if (victimStatus.isInvulnerable) {
            const mod = getModCompatibility(victim)
            if (!mod) {
                return
            }

            transition(
                victim,
                mod,
                victimStatus,
                'onNotHurt',
                Function.prototype as any,
                [victim, abuser, damageOpt]
            )
            return
        }

        const victimTeam = victimStatus.componentManager.getComponent(Team)
        const abuserTeam = abuserStatus.componentManager.getComponent(Team)
        if (!victimTeam.isEmpty() && !abuserTeam.isEmpty() && victimTeam.unwrap().name === abuserTeam.unwrap().name) {
            return
        }

        if (victimStatus.isWaitingDeflection && !permeable && !powerful) {
            return em.emitNone('deflect', abuser, victim, damageOpt)
        }

        if (victimStatus.isDodging && !trace) {
            return em.emitNone('dodge', abuser, victim, damageOpt)
        }

        if (victimStatus.isWaitingParry && parryable) {
            return em.emitNone('parried', abuser, victim, damageOpt)
        }

        if (victimStatus.isBlocking && !permeable) {
            _knockback(_k * 0.4, victimStatus.repulsible)
            return em.emitNone('block', abuser, victim, damageOpt)
        }

        doDamage(incomingAttack)
    })

    em.on('deflect', (abuser: Actor, victim: Actor, damageOpt: DamageOption) => {
        const aStatus = Status.getOrCreate(abuser.uniqueId)
        const abuserMod = getModCompatibility(abuser)
        if (!abuserMod) {
            return
        }

        transition(
            abuser,
            abuserMod,
            aStatus,
            'onMissAttack',
            Function.prototype as any,
            [abuser, victim, damageOpt]
        )

        const vStatus = Status.getOrCreate(victim.uniqueId)
        const vMod = getModCompatibility(victim)
        if (!vMod) {
            return
        }

        transition(
            victim,
            vMod,
            vStatus,
            'onDeflection',
            Function.prototype as any,
            [victim, abuser, damageOpt]
        )
    })

    em.on('dodge', (abuser: Actor, victim: Actor, damageOpt: DamageOption) => {
        const aStatus = Status.getOrCreate(abuser.uniqueId)
        const abuserMod = getModCompatibility(abuser)
        if (!abuserMod) {
            return
        }

        transition(
            abuser,
            abuserMod,
            aStatus,
            'onMissAttack',
            Function.prototype as any,
            [abuser, victim, damageOpt]
        )

        const vStatus = Status.getOrCreate(victim.uniqueId)
        const vMod = getModCompatibility(victim)
        if (!vMod) {
            return
        }

        transition(
            victim,
            vMod,
            vStatus,
            'onDodge',
            Function.prototype as any,
            [victim, abuser, damageOpt]
        )
    })

    em.on('parried', (abuser: Actor, victim: Actor, damageOpt: DamageOption) => {
        const aStatus = Status.getOrCreate(abuser.uniqueId)
        const abuserMod = getModCompatibility(abuser)
        if (!abuserMod) {
            return
        }

        transition(
            abuser,
            abuserMod,
            aStatus,
            'onParried',
            Function.prototype as any,
            [abuser, victim, damageOpt]
        )

        const vStatus = Status.getOrCreate(victim.uniqueId)
        const vMod = getModCompatibility(victim)
        if (!vMod) {
            return
        }

        transition(
            victim,
            vMod,
            vStatus,
            'onParry',
            Function.prototype as any,
            [victim, abuser, damageOpt]
        )
    })

    em.on('block', (abuser: Actor, victim: Actor, damageOpt: DamageOption) => {
        const abuserMod = getModCompatibility(abuser)
        const victimMod = getModCompatibility(victim)
        if (!abuserMod || !victimMod) {
            return
        }

        transition(
            abuser,
            abuserMod,
            Status.getOrCreate(abuser.uniqueId),
            'onBlocked',
            Function.prototype as any,
            [abuser, victim, damageOpt]
        )

        transition(
            victim,
            victimMod,
            Status.getOrCreate(victim.uniqueId),
            'onBlock',
            Function.prototype as any,
            [victim, abuser, damageOpt]
        )
    })

    em.on('hurt', (abuser: Actor, victim: Actor, damageOpt: DamageOption) => {
        const {
            damage, damageType, damagingProjectile
        } = damageOpt

        if (!abuser.health) {
            return
        }

        const abuserMod = getModCompatibility(abuser)
        if (!abuserMod) {
            return
        }

        transition(
            abuser,
            abuserMod,
            Status.getOrCreate(abuser.uniqueId),
            'onHit',
            Function.prototype as any,
            [abuser, victim, damageOpt]
        )

        let flag = true,
            prevent = () => flag = false

        const victimStatus = Status.getOrCreate(victim.uniqueId)
        const victimMod = getModCompatibility(victim)
        if (!victimMod) {
            return
        }

        if (!victimStatus.hegemony) {
            transition(
                victim,
                victimMod,
                victimStatus,
                'onHurt',
                prevent,
                [victim, abuser, damageOpt]
            )
        }

        if (damageOpt.powerful) {
            transition(
                victim,
                victimMod,
                victimStatus,
                'onInterrupted',
                prevent,
                [victim, abuser, damageOpt]
            )
        }

        if (flag) {
            damageWithCameraFading(victim, damage, damageType, abuser, damagingProjectile, damageOpt)
        }
    })

    em.on('onHurtByEntity', (victim: Actor, abuser: Actor, damageOpt: DamageOption, prevent: () => void) => {
        const abuserMod = getModCompatibility(abuser)
        if (!abuserMod) {
            return
        }

        transition(
            victim,
            abuserMod,
            Status.getOrCreate(victim.uniqueId),
            'onHurtByMob',
            prevent,
            [ victim, abuser, damageOpt ]
        )
    })

    em.on('knockdown', (abuser: Actor, victim: Actor, knockbackStrength: number, time=30) => {
        const aStatus = Status.getOrCreate(abuser.uniqueId)
        const aMod = getMod(aStatus.hand)

        const vStatus = Status.getOrCreate(victim.uniqueId)
        const vMod = getMod(vStatus.hand)

        if (vStatus && !vStatus.repulsible) {
            return
        }

        if (aStatus && aMod) {
            transition(abuser, aMod, aStatus, 'onKnockdownOther', Function.prototype as any, [ abuser, victim, time ])
        }

        if (vStatus && vMod) {
            const aPos = abuser.pos
            const vPos = victim.pos

            transition(victim, vMod, vStatus, 'onKnockdown', Function.prototype as any, [ victim, abuser, time ])            
            knockback(victim, vPos.x - aPos.x, vPos.z - aPos.z, knockbackStrength, 0)
        }
    })

    // TODO
    em.on('onReleaseLock', (pl: Actor) => {
        const bind = getModCompatibility(pl)
        const status = Status.getOrCreate(pl.uniqueId)

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onReleaseLock', Function.prototype as any, [ pl ])
    })

    em.on('onLock', (pl: Actor, hand: string, target: Actor) => {
        const bind = getModCompatibility(pl)
        const status = Status.getOrCreate(pl.uniqueId)

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onLock', Function.prototype as any, [ pl, target ])
    })

    em.on('onFeint', (pl: Actor, hand: string, prevent: () => void) => {
        const bind = getModCompatibility(pl)
        const status = Status.getOrCreate(pl.uniqueId)

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onFeint', prevent, [ pl ])
    })

    em.on('trap', (pl: Actor, data: any) => {
        const status = Status.getOrCreate(pl.uniqueId)
        const bind = getModCompatibility(pl)

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onTrap', Function.prototype as any, [ pl, data ])
    })
}

export function listenAllMcEvents(collection: TrickModule[]) {
    const mods = new Map<string, TrickModule>()

    function getMod(hand: string) {
        return mods.get(hand) ?? mods.get('*')
    }

    function getModCompatibility(actor: Actor) {
        if (!isEntity(actor)) {
            return getMod(getHandedItemType(actor as Player))
        }

        return ai.getRegistration((actor as Entity).type).tricks
    }

    collection.forEach((mod: TrickModule) => {
        const binding = mod.bind
        const bind = !Array.isArray(binding)
            ? [ binding ]
            : binding

        bind.forEach(itemType => {
            mods.set(itemType, mod)
        })
    })

    listenPlayerItemChange(mods)
    
    es.addFilter(({ type, args }) => {
        if (!defaultAcceptableInputs.includes(type)) {
            return true
        }

        const status = Status.getOrCreate(args[0].uniqueId)
        const inputable = status.acceptableInput(type)

        if (inputable) {
            status.setPreInput(type as keyof InputableTransitionMap)
        }

        return inputable as boolean
    })

    const acceptableStreamHandler = (n: string) =>
        (pl: Actor, prevent: () => void, args: any[]) => {
            if (!isEntity(pl)) {
                const status = watchMainhandChange(pl as Player)
        
                if (!mods.has(status.hand)) {
                    return
                }

                const mod = mods.get(status.hand)
                if (!mod) {
                    return
                }

                transition(pl, mod, status, n, prevent, args)
                return
            }

            const status = Status.getOrCreate(pl.uniqueId)
            const mod = ai.getRegistration((pl as Entity).type).tricks

            if (!mod) {
                return
            }

            transition(pl, mod, status, n, prevent, args)
        }

    em.on('input.sneak', (pl: Actor, isSneaking: boolean) => {
        es.put(isSneaking ? 'onSneak' : 'onReleaseSneak', [pl, Function.prototype, [ pl, isSneaking ]])
    })
    em.on('onSneak', acceptableStreamHandler('onSneak'))
    em.on('onReleaseSneak', acceptableStreamHandler('onReleaseSneak'))

    mc.listen('onUseItem', (...args) => {
        const [ pl, item ] = args

        if (!mods.has(item.type)) {
            return true
        }

        if (!hasLock(pl)) {
            const val = toggleLock(pl.uniqueId)
            pl.setSprinting(false)
            if (val) {
                em.emitNone('onLock', pl, item.type, val)
            }

            return false
        }

        let cancelEvent = false,
        prevent = () => cancelEvent = true
        es.put('onUseItem', [pl, prevent, args])

        return !cancelEvent
    })

    mc.listen('onChangeSprinting', (...args) => {
        const pl = args[0]
        if (hasLock(pl)) {
            if (toggleLock(pl.uniqueId) === null) {
                const mod = getModCompatibility(pl)
                if (!mod) {
                    return false
                }

                const status = Status.getOrCreate(pl.uniqueId)

                clearCamera(pl)
                initCombatComponent(pl, mod, status)
                transition(pl, mod, status, 'onChangeSprinting', Function.prototype as any, args)
            }

            return false
        }

        let cancelEvent = false,
        prevent = () => cancelEvent = true
        es.put('onChangeSprinting', [pl, prevent, args])

        return !cancelEvent
    })

    mc.listen('onScoreChanged', (pl, val, obj) => {
        if (obj !== 'attack_time') {
            return
        }

        if (val) {
            es.put('onAttack', [pl, Function.prototype, [ pl ]])
        }
    })
    
    em.on('input.jump', (pl: Actor, press: boolean) => {
        if (press) {
            es.put('onDodge', [ pl, Function.prototype, [ pl ] ])
            em.emitNone(hasLock(pl) ? 'onDodge' : 'onJump', pl, Function.prototype, [ pl ]);
        }
    })

    em.on('onDodge', acceptableStreamHandler('onDodge'))

    playerOverrideEvents.forEach(n => em.on(n, acceptableStreamHandler(n)))

    mobEvents.forEach(n => {
        mc.listen(n as any, (...args) => {
            let cancelEvent = false,
                prevent = () => cancelEvent = true
            
            let pl = args[0]

            if (mobEvents.includes(n)) {
                if (!(pl as any).isPlayer()) {
                    return true
                }

                pl = (pl as any).toPlayer()
            }

            const status = watchMainhandChange(pl)
            
            if (!mods.has(status.hand)) {
                return
            }

            transition(pl, getMod(status.hand) as any, status, n, prevent, args)

            return !cancelEvent
        })
    })

    mc.listen('onOpenContainer', () => {
        // console.log(pl)
    })

    mc.listen('onOpenContainerScreen', pl => {
        if (hasLock(pl)) {
            let cancel = true
            es.put('onFeint', [ pl, Function.prototype, [ pl ] ])

            return !cancel
        }
    })

    mc.listen('onRide', rider => {
        if (!rider.isPlayer()) {
            return true
        }

        const pl = rider.toPlayer()
        if (!pl) {
            return
        }

        if (mods.has(pl.getHand().type) && !input.isPressing(pl, 'sneak')) {
            return false
        }
    })


    /**@type {EntityDamageCause[]}*/
    const causeList = [
        'override', 'contact', 'entityAttack', 'projectile', 'suffocation', 'fall', 'fire',
        'fireTick', 'lava', 'drowning', 'blockExplosion', 'entityExplosion', 'void', 'suicide',
        'magic', 'wither', 'starve', 'anvil', 'thorns', 'fallingBlock', 'piston', 'flyIntoWall',
        'magma', 'fireworks', 'lightning', 'charging', 'temperature', 'freezing', 'stalactite',
        'stalagmite'
    ]

    causeList[-1] = 'none'

    mc.listen('onMobHurt', (victim, abuser, damage, cause) => {
        const damageType = causeList[cause]

        if (damageType === 'override') {
            return true
        }

        let flag = true,
            prevent = () => {
                flag = false
            }
        
        const damageOpt = {
            damage,
            damageType
        }

        if (!victim.isPlayer()) {
            return true
        }

        const victimPlayer = victim.toPlayer()

        if (!abuser) {
            return true
        }

        if (!abuser.isPlayer()) {
            em.emitNone('onHurtByEntity', victimPlayer, abuser, damageOpt, prevent)
            return flag
        }

        return false
    })

    mc.listen('onAttackEntity', pl => {
        es.put('onAttack', [pl, Function.prototype, [ pl ]])
        const status = Status.getOrCreate(pl.uniqueId)

        status.acceptableInput('onAttack', false)
        setTimeout(() => {
            status.acceptableInput('onAttack', true)
        }, 300)
        return false
    })

    mc.listen('onAttackBlock', pl => {
        es.put('onAttack', [pl, Function.prototype, [ pl ]])
        const status = Status.getOrCreate(pl.uniqueId)

        status.acceptableInput('onAttack', false)
        setTimeout(() => {
            status.acceptableInput('onAttack', true)
        }, 300)
        return false
    })

    mc.listen('onTick', () => em.emitNone('onTick'))

    mc.listen('onRespawn', pl => {
        const mod = getModCompatibility(pl)
        if (!mod) {
            return
        }

        setTimeout(() => {
            unfreeze(pl)
            clearCamera(pl)
            initCombatComponent(pl, mod, Status.getOrCreate(pl.uniqueId))
        })
    })

    mc.listen('onLeft', pl => {
        Status.status.delete(pl.uniqueId)
    })

    mc.listen('onPlayerDie', pl => {
        releaseTarget(pl.uniqueId)
        mc.runcmdEx(`/inputpermission set "${pl.name}" jump enabled`)
        mc.runcmdEx(`/inputpermission set "${pl.name}" sneak enabled`)
    })

    mc.listen('onMobDie', en => {
        Status.status.delete(en.uniqueId)
    })

    mc.listen('onServerStarted', () => {
        mc.getScoreObjective('attack_time') ?? mc.newScoreObjective('attack_time', 'attack_time')

        listenAllCustomEvents(mods)
        listenEntitiyWithAi()
    })

    registerHudCommands()
    registerCommand()
    setupAiCommands()
}

function getHandedItemType(pl: Player) {
    return pl.getHand()?.type
}

antiTreeshaking()