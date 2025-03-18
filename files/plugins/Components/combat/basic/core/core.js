const { knockback, clearVelocity, impulse, applyKnockbackAtVelocityDirection } = require('../../../scripts-rpc/func/kinematics')
const { combat: { damage: _damage, _damageLL } } = require('../../../scripts-rpc/func/index')
const { playAnim, playParticle } = require('../index')
const { movement, camera, movementInput } = require('../generic/index')
const { selectFromRange } = require('../generic/range')
const { Status, defaultAcceptableInputs } = require('./status')
const { Task } = require('../generic/task')
const {
    lookAt, lookAtTarget, distanceToTarget, adsorbToTarget, adsorbTo,
    onTick, toggleLock, hasLock, releaseTarget, adsorbOrSetVelocity
} = require('../generic/lock')
const { setVelocity, isCollide } = require('../generic/kinematic')
const { vec2, vec2ToAngle } = require('../generic/vec')
const { clearCamera } = require('../generic/camera')
const { Tick } = require('../components/tick')
const { CameraFading } = require('../components/camera-fading')
const { DamageModifier } = require('../components/damage-modifier')
const { registerCommand } = require('./commands')
const { antiTreeshaking } = require('../components/anti-treeshaking')
const { Stamina } = require('../components/core/stamina')
const { input } = require('scripts-rpc/func/input')
const { Team } = require('../components/team')
const { IncomingAttack } = require('../default')
const { em, es } = require('./event')
const { listenEntitiyWithAi, ai } = require('./ai/core')
const { setupAiCommands } = require('./ai')

const yawToVec2 = yaw => {
    const rad = yaw * Math.PI / 180.0
    return {
        x: Math.cos(rad),
        y: Math.sin(rad)
    }
}

function isEntity(actor) {
    return Boolean(actor?.type)
}

function damageWithCameraFading(victim, damage, cause, abuser, projectile, damageOpt) {
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

function knockdown(abuser, victim, knockback=2) {
    em.emitNone('knockdown', abuser, victim, knockback)
}

function trap(pl, data) {
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

/**
 * @param {any} abuser 
 * @param {any} victim 
 * @param {DamageOption} damageOpt
 */
function attack(abuser, victim, damageOpt) {
    em.emitNone('attack', abuser, victim, damageOpt)
}

const playerOverrideEvents = [
    'onUseItem',
    'onAttack',
    'onChangeSprinting',
]
const mobEvents = [
    // 'onMobHurt',
    'onProjectileHitEntity',
]
// const customEvents = [
//     'onParry', 'onParried', 'onEndOfLife', 'onHurt', 'onBlocked', 'onBlock', 'onHit'
// ]

/**@type {Map<string, Status>}*/

/**@type {(pl: any) => Status}*/
const _status = pl => Status.get(pl.uniqueId)

function freeze(pl) {
    movement(pl, false)
    camera(pl, false)
}

function unfreeze(pl) {
    movement(pl)
    // movementInput(pl, true)
    camera(pl)
}

function getMoveDir(pl) {
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

/**
 * @param {MovementContext} mixins
 * @returns {MovementContext}
 */
function _ctx(pl, mixins={}) {
    const status = _status(pl)
    return {
        camera,
        movement,
        movementInput,
        selectFromRange,
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
        setSpeed: (pl, speed) => pl.setMovementSpeed(speed),
        ...mixins
    }
}

function watchMainhandChange(pl) {
    const status = Status.get(pl.uniqueId)
    const hand = pl.getHand()?.type ?? 'minecraft:air'
    
    status.hand = hand
    return status
}

const pick = (obj, arr) =>
    arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {})

const playerAttrPickList = [
    'inAir', 'inWater', 'inLava', 'inRain', 'inSnow', 'inWall', 'inWaterOrRain', 'isInvisible', 'isHungry',
    'isOnFire', 'isOnGround', 'isOnHotBlock', 'isGliding', 'isFlying', 'isMoving'
]

/**
 * @param {Player} pl
 * @param {Status} status 
 * @returns 
 */
const defaultPacker = (pl, bind, status) => {
    const allowedState = checkMoveState(bind, status)
    const picked = pick(pl, playerAttrPickList)
    const stamina = status.componentManager.getComponent(Stamina).unwrap()

    /**@type {TransitionOptMixins}*/
    const mixins = {
        stamina: stamina.stamina,
        hasTarget: hasLock(pl),
        repulsible: status.repulsible,
        isCollide: false,//isCollide(pl),
        preInput: status.preInput,
        isSneaking: input.isPressing(pl, 'sneak'),
        isDodging: input.isPressing(pl, 'jump'),
    }

    return {
        prevent: false,
        allowedState,
        ...picked,
        ...mixins,
    }
}

const dataPackers = {
    onSneak(args) {
        return {
            isSneaking: args[1]
        }
    },
    onChangeSprinting(args) {
        return {
            sprinting: args[1]
        }
    },
    onEndOfLife(args) {
        const status = Status.get(args[0].uniqueId)
        return {
            preInput: status.preInput
        }
    },
    onTrap([pl, data]) {
        const status = Status.get(pl.uniqueId)
        return {
            preInput: status.preInput,
            ...data
        }
    },
    onDeflection([ _, __, { direction } ]) {
        return {
            direction: direction === 'middle' ? 'vertical' : direction
        }
    },
    onBlock([ _, __, { direction } ]) {
        return {
            direction: direction === 'middle' ? 'vertical' : direction
        }
    },
    onHurt([ pl ]) {
        return {
            hegemony: Status.get(pl.uniqueId).hegemony
        }
    }
}

function checkCondition(cond, data) {
    for (const [ k, v ] of Object.entries(cond)) {
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
            if (!v(data[k])) {
                return false
            }

            continue
        }

        if (k === 'stamina') {
            const val = data[k]
            if (val < v) {
                return false
            }

            continue
        }

        if (cond[k] !== data[k]) {
            return false
        }
    }

    return true
}

const defaultTransitionCondition = {
    prevent: false,
    allowedState: 'both',
}

function initCombatComponent(pl, bind, status) {
    if (!bind) {
        return
    }

    const { moves, entry } = bind
    const move = moves[entry]

    status.status = entry
    status.duration = 0

    if (move.onEnter) {
        move?.onEnter?.(pl, _ctx(pl))
    }
}

/**
 * @param {any} pl 
 * @param {TrickModule} bind 
 * @param {Status} status 
 * @param {string} eventName 
 * @param {() => void} prevent 
 * @param {any[]} args 
 * @returns 
 */
function transition(pl, bind, status, eventName, prevent, args) {
    if (!bind) {
        return
    }

    if (status.status === 'unknown') {
        initCombatComponent(pl, bind, status)
    }

    const currentMove = bind.moves[status.status]
    if (!currentMove) {
        return
    }

    const transitions = currentMove.transitions

    let next,
        cond,
        candidates = []

    for (const [_next, _cond] of Object.entries(transitions)) {
        if (Object.keys(_cond).includes(eventName)) {
            const next = _next
            const cond = Object.assign({}, defaultTransitionCondition, (_cond || {})[eventName])
            candidates.push([next, cond])
        }
    }

    if (!candidates.length) {
        return
    }

    let dataPacker, data = defaultPacker(pl, bind, status)
    if (dataPacker = dataPackers[eventName]) {
        data = Object.assign(data, dataPacker(args))
    }

    for (const [ $next, $cond ] of candidates) {
        if (!checkCondition($cond, data)) {
            continue
        }

        next = $next
        cond = $cond
    }

    if (!next) {
        return
    }

    let previousStatus = status.status

    if (cond.prevent) {
        prevent()
    }

    status.status = next
    status.duration = 0
    const nextMove = bind.moves[next] || bind.moves[bind.entry]

    if (nextMove.immediately) {
        nextMove.onAct(pl, _ctx(pl, {
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
            previousMoveState: +(status.duration > (currentMove.cast || 0))
        }))
    }
}

/**
 * @param {TrickModule} mod 
 * @param {Status} _status 
 * @returns {'none'|'cast'|'backswing'|'finish'}
 */
function checkMoveState(mod, _status) {
    const { status, duration } = _status
    const move = mod.moves[status]

    if (move.immediately) {
        return 'none'
    }

    return duration <= (move.cast || 0) ? 'cast' :
        duration <= (move.cast || 0) + (move.backswing || 0) ? 'backswing' : 'finish'
}

function clearStatus(pl, s, hand, hasBind) {
    s.reset()
    s.hand = hand
    if (!hasBind) {
        playAnim(pl, 'animation.general.stand')
    }
}

function listenPlayerItemChange(mods) {
    const playerMainhanded = new Map()
    const playerOffhanded = new Map()

    function getMod(hand) {
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

    em.on('onChangeMainhand', (pl, hand, old) => {
        const status = Status.get(pl.uniqueId)
        const oldBind = getMod(old)

        if (!status) {
            return
        }

        releaseTarget(pl.uniqueId)

        if (oldBind) {
            const move = oldBind.moves[status.status]
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

function listenAllCustomEvents(mods) {
    function getMod(hand) {
        return mods.get(hand) ?? mods.get('*')
    }

    function getModCompatibility(actor) {
        if (!isEntity(actor)) {
            return getMod(getHandedItemType(actor))
        }

        return ai.getRegistration(actor.type)[1]
    }

    em.on('onTick', onTick(em))
    em.on('onTick', () => {
        for (const [uniqueId, status] of Status.status.entries()) {
            if (typeof uniqueId !== 'string') {
                return
            }

            if (uniqueId === 'global_status') {
                continue
            }

            const pl = mc.getPlayer(uniqueId)
            const bind = getMod(status.hand)

            if (!pl || !bind) {
                return
            }

            const attackTime = pl.quickEvalMolangScript('v.attack_time')
            // pl.quickEvalMolangScript(`v.mov_mag = math.sqrt( math.pow( query.movement_direction(0), 2 ) + math.pow( query.movement_direction(2), 2));
            // v.nmov_x = query.movement_direction(0) / v.mov_mag;
            // v.nmov_z = query.movement_direction(2) / v.mov_mag;
            // v.dr = v.nmov_x > 0 ? -math.acos(v.nmov_z) : math.acos(v.nmov_z);
            // v.head_y_rot = query.head_y_rotation(this);
            // t.rot = v.dr - v.head_y_rot;
            // v.rot_to_facing = t.rot < 0 ? t.rot + 360 : t.rot;
            // v.dir_to_facing = 1 <= 0 ? 0
            //     : v.rot_to_facing < 45 ? 1
            //     : v.rot_to_facing < 135 ? 2
            //     : v.rot_to_facing < 225 ? 3
            //     : v.rot_to_facing < 315 ? 4
            //     : 1;
            // `)
            // console.log(pl.quickEvalMolangScript('math.mod(q.modified_distance_moved, 12) * 0.125'))

            // console.log(pl.name, attackTime)
            if (attackTime > 0 && attackTime < 0.3) {
                es.put('onAttack', [pl, Function.prototype, [ pl ]])
            }
        }
    })

    em.on('onTick', () => {
        Tick.tick++

        for (const [uniqueId, status] of Status.status.entries()) {
            if (typeof uniqueId !== 'string') {
                return
            }

            if (uniqueId === 'global_status') {
                continue
            }

            let pl = mc.getPlayer(uniqueId)
            let bind = getMod(status.hand)
            if (!pl) {
                pl = mc.getEntity(+uniqueId)
                bind = ai.getRegistration(pl.type)[1]
            }

            if (!pl ||!bind) {
                return
            }

            const currentMove = bind.moves[status.status]
            const duration = status.duration++

            if (!currentMove) {
                status.status = 'unknown'
                return transition(pl, bind, status, '', Function.prototype, [ pl ])
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
                    duration/((currentMove.cast || 0) + (currentMove.backswing || 0))
                )
            }

            status.componentManager.handleTicks(pl)

            if (duration >= (currentMove.cast || 0) + (currentMove.backswing || 0)) {
                if (currentMove.onLeave) {
                    currentMove.onLeave(pl, _context)
                }
                return transition(pl, bind, status, 'onEndOfLife', Function.prototype, [ pl ])
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

    em.on('attack', (abuser, victim, /**@type {DamageOption}*/ damageOpt) => {
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
        } = damageOpt

        const victimIsEntity = !victim.xuid
        const abuserStatus = Status.get(abuser.uniqueId)

        if (victimIsEntity && !ai.isRegistered(victim)) {
            transition(
                abuser,
                getModCompatibility(abuser),
                abuserStatus,
                'onHit',
                Function.prototype,
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

        const victimStatus = Status.get(victim.uniqueId)

        const _knockback = (h, repulsible) => {
            if (powerful || repulsible) {
                const abuserPos = abuser.pos
                const victimPos = victim.pos
                knockback(victim, victimPos.x - abuserPos.x, victimPos.z - abuserPos.z, h, -2)
                return
            }

            if (!victimIsEntity && victim?.toPlayer?.()?.gameMode === 1) {
                return
            }

            knockback(victim, 0, 0, 0, -2)
        }
        const doDamage = () => {
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

        victimStatus.componentManager.attachComponent(new IncomingAttack(
            direction,
            permeable,
            parryable,
            powerful,
            trace,
        ))

        if (victimStatus.isInvulnerable) {
            transition(
                victim,
                getModCompatibility(victim),
                victimStatus,
                'onNotHurt',
                Function.prototype,
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

        doDamage()
    })

    em.on('deflect', (abuser, victim, damageOpt) => {
        const aStatus = Status.get(abuser.uniqueId)
        transition(
            abuser,
            getModCompatibility(abuser),
            aStatus,
            'onMissAttack',
            Function.prototype,
            [abuser, victim, damageOpt]
        )

        const vStatus = Status.get(victim.uniqueId)
        transition(
            victim,
            getModCompatibility(victim),
            vStatus,
            'onDeflection',
            Function.prototype,
            [victim, abuser, damageOpt]
        )
    })

    em.on('dodge', (abuser, victim, damageOpt) => {
        const aStatus = Status.get(abuser.uniqueId)
        transition(
            abuser,
            getModCompatibility(abuser),
            aStatus,
            'onMissAttack',
            Function.prototype,
            [abuser, victim, damageOpt]
        )

        const vStatus = Status.get(victim.uniqueId)
        transition(
            victim,
            getModCompatibility(victim),
            vStatus,
            'onDodge',
            Function.prototype,
            [victim, abuser, damageOpt]
        )
    })

    em.on('parried', (abuser, victim, damageOpt) => {
        const aStatus = Status.get(abuser.uniqueId)
        transition(
            abuser,
            getModCompatibility(abuser),
            aStatus,
            'onParried',
            Function.prototype,
            [abuser, victim, damageOpt]
        )

        const vStatus = Status.get(victim.uniqueId)
        transition(
            victim,
            getModCompatibility(victim),
            vStatus,
            'onParry',
            Function.prototype,
            [victim, abuser, damageOpt]
        )
    })

    em.on('block', (abuser, victim, damageOpt) => {
        transition(
            abuser,
            getModCompatibility(abuser),
            Status.get(abuser.uniqueId),
            'onBlocked',
            Function.prototype,
            [abuser, victim, damageOpt]
        )

        transition(
            victim,
            getModCompatibility(victim),
            Status.get(victim.uniqueId),
            'onBlock',
            Function.prototype,
            [victim, abuser, damageOpt]
        )
    })

    em.on('hurt', (abuser, victim, damageOpt) => {
        const {
            damage, damageType, damagingProjectile
        } = damageOpt

        if (!abuser.health) {
            return
        }

        transition(
            abuser,
            getModCompatibility(abuser),
            Status.get(abuser.uniqueId),
            'onHit',
            Function.prototype,
            [abuser, victim, damageOpt]
        )

        let flag = true,
            prevent = () => flag = false

        const victimStatus = Status.get(victim.uniqueId)
        const victimMod = getModCompatibility(victim)

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

    em.on('onHurtByEntity', (victim, abuser, damageOpt, prevent) => {
        transition(
            victim,
            getModCompatibility(victim),
            Status.get(victim.uniqueId),
            'onHurtByMob',
            prevent,
            [ victim, abuser, damageOpt ]
        )
    })

    em.on('knockdown', (abuser, victim, knockbackStrength, time=30) => {
        const aStatus = Status.get(abuser.uniqueId)
        const aMod = getMod(aStatus.hand)

        const vStatus = Status.get(victim.uniqueId)
        const vMod = getMod(vStatus.hand)

        if (vStatus && !vStatus.repulsible) {
            return
        }

        if (aStatus && aMod) {
            transition(abuser, aMod, aStatus, 'onKnockdownOther', Function.prototype, [ abuser, victim, time ])
        }

        if (vStatus && vMod) {
            const aPos = abuser.pos
            const vPos = victim.pos

            transition(victim, vMod, vStatus, 'onKnockdown', Function.prototype, [ victim, abuser, time ])            
            knockback(victim, vPos.x - aPos.x, vPos.z - aPos.z, knockbackStrength, 0)
        }
    })

    // TODO
    em.on('onReleaseLock', (pl, hand) => {
        const bind = getModCompatibility(pl)
        const status = Status.get(pl.uniqueId)

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onReleaseLock', Function.prototype, [ pl ])
    })

    em.on('onLock', (pl, hand, target) => {
        const bind = getModCompatibility(pl)
        const status = Status.get(pl.uniqueId)

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onLock', Function.prototype, [ pl, target ])
    })

    em.on('onFeint', (pl, hand, prevent) => {
        const bind = getModCompatibility(pl)
        const status = Status.get(pl.uniqueId)

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onFeint', prevent, [ pl ])
    })

    em.on('trap', (pl, data) => {
        const status = Status.get(pl.uniqueId)
        const bind = getModCompatibility(pl)

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onTrap', Function.prototype, [ pl, data ])
    })
}

function listenAllMcEvents(collection) {
    const mods = new Map()

    function getMod(hand) {
        return mods.get(hand) ?? mods.get('*')
    }

    function getModCompatibility(actor) {
        if (!isEntity(actor)) {
            return getMod(getHandedItemType(actor))
        }

        return ai.getRegistration(actor.type)[1]
    }

    collection.forEach(mod => {
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

        const status = Status.get(args[0].uniqueId)
        const inputable = status.acceptableInput(type)

        if (inputable) {
            status.setPreInput(type)
        }

        return inputable
    })

    const acceptableStreamHandler = n =>
        (pl, prevent, args) => {
            if (!isEntity(pl)) {
                const status = watchMainhandChange(pl)
        
                if (!mods.has(status.hand)) {
                    return
                }

                transition(pl, getMod(status.hand), status, n, prevent, args)
                return
            }

            const status = Status.get(pl.uniqueId)
            const mod = ai.getRegistration(pl.type)[1]

            if (!mod) {
                return
            }

            transition(pl, mod, status, n, prevent, args)
        }

    em.on('input.sneak', (pl, isSneaking) => {
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
                const status = Status.get(pl.uniqueId)

                clearCamera(pl)
                initCombatComponent(pl, mod, status)
                transition(pl, mod, status, 'onChangeSprinting', Function.prototype, args)
            }

            return false
        }

        let cancelEvent = false,
        prevent = () => cancelEvent = true
        es.put('onChangeSprinting', [pl, prevent, args])

        return !cancelEvent
    })
    
    em.on('input.jump', (pl, press) => {
        if (press) {
            es.put('onDodge', [ pl, Function.prototype, [ pl ] ])
            em.emitNone(hasLock(pl) ? 'onDodge' : 'onJump', pl, Function.prototype, [ pl ]);
        }
    })

    em.on('onDodge', acceptableStreamHandler('onDodge'))

    playerOverrideEvents.forEach(n => em.on(n, acceptableStreamHandler(n)))

    mobEvents.forEach(n => {
        mc.listen(n, (...args) => {
            let cancelEvent = false,
                prevent = () => cancelEvent = true
            
            let pl = args[0]

            if (mobEvents.includes(n)) {
                if (!pl.isPlayer()) {
                    return true
                }

                pl = pl.toPlayer()
            }

            const status = watchMainhandChange(pl)
            
            if (!mods.has(status.hand)) {
                return
            }

            transition(pl, getMod(status.hand), status, n, prevent, args)

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

        victim = victim.toPlayer()

        if (!abuser) {
            return true
        }

        if (!abuser.isPlayer()) {
            em.emitNone('onHurtByEntity', victim, abuser, damageOpt, prevent)
            return flag
        }

        return false
    })

    mc.listen('onAttackEntity', pl => {
        es.put('onAttack', [pl, Function.prototype, [ pl ]])
        const status = Status.get(pl.uniqueId)

        status.acceptableInput('onAttack', false)
        setTimeout(() => {
            status.acceptableInput('onAttack', true)
        }, 300)
        return false
    })

    mc.listen('onTick', () => em.emitNone('onTick'))

    mc.listen('onRespawn', pl => {
        setTimeout(() => {
            unfreeze(pl)
            clearCamera(pl)
            initCombatComponent(pl, getModCompatibility(pl), Status.get(pl.uniqueId))
        }, 300)
    })

    mc.listen('onLeft', pl => {
        Status.status.delete(pl.uniqueId)
    })

    mc.listen('onPlayerDie', pl => {
        releaseTarget(pl.uniqueId)
        mc.runcmdEx(`/inputpermission set "${pl.name}" jump enabled`)
        mc.runcmdEx(`/inputpermission set "${pl.name}" sneak enabled`)
    })

    listenAllCustomEvents(mods)
    registerCommand()
    listenEntitiyWithAi()
    setupAiCommands()
}

function getHandedItemType(pl) {
    return pl.getHand().type
}

antiTreeshaking()

module.exports = {
    emitter: em, listenAllMcEvents,
    initCombatComponent, transition,
}