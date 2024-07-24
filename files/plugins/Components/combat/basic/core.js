/// <reference path="./types.d.ts"/>

const { EventEmitter } = require('../../events')
const console = require('../../console/main')
const { knockback, clearVelocity, impulse, applyKnockbackAtVelocityDirection } = require('../../scripts-rpc/func/kinematics')
const { combat: { damage: _damage } } = require('../../scripts-rpc/func')
const { playAnim } = require('./index')
const { movement, camera, movementInput } = require('./generic')
const { cmd } = require('../../command')
const { selectFromRange } = require('./generic/range')
const { Status, defaultAcceptableInputs } = require('./generic/status')
const { Task } = require('./generic/task')
const { EventInputStream } = require('./generic/event-stream')
const {
    lookAt, lookAtTarget, distanceToTarget, adsorbToTarget, adsorbTo,
    onTick, toggleLock, hasLock, releaseTarget, adsorbOrSetVelocity
} = require('./generic/lock')
const { setVelocity, isCollide } = require('./generic/kinematic')
const { vec2, vec2ToAngle } = require('./generic/vec')
const { clearCamera } = require('./generic/camera')

const em = new EventEmitter({ enableWatcher: true })
const es = EventInputStream.get(em)

const yawToVec2 = yaw => {
    const rad = yaw * Math.PI / 180.0
    return {
        x: Math.cos(rad),
        y: Math.sin(rad)
    }
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

const playerEvents = [
    'onSneak', 'onUseItem', 'onChangeSprinting',
    'onJump',
]
const mobEvents = [
    // 'onMobHurt',
    'onProjectileHitEntity',
]
// const customEvents = [
//     'onParry', 'onParried', 'onEndOfLife', 'onHurt', 'onBlocked', 'onBlock', 'onHit'
// ]

/**@type {Map<string, PlayerStatus>}*/

/**@type {(pl: any) => PlayerStatus}*/
const _status = pl => Status.get(pl.xuid)

function freeze(pl) {
    movement(pl, false)
    camera(pl, false)
}

function unfreeze(pl) {
    movement(pl)
    movementInput(pl, true)
    camera(pl)
}

function getMoveDir(pl) {
    const previusPos = {
        x: pl.feetPos.x,
        z: pl.feetPos.z
    }
    const xuid = pl.xuid

    return new Promise(res => {
        em.once('onTick', () => {
            const currentPos = mc.getPlayer(xuid).feetPos
            const movVec = vec2(currentPos.x, currentPos.z, previusPos.x, previusPos.z)
            let rot = vec2ToAngle(movVec) * 180 / Math.PI - pl.direction.yaw

            rot = rot < -180 ? rot + 360
                : rot > 190 ? rot - 360 : rot

            const direct = isNaN(rot) ? 0
                : rot < -135 ? 3
                    : rot < -45 ? 4
                        : rot < 45 ? 1
                            : rot < 135 ? 2 : 3
            
            res(direct)
        })
    })
}

/**
 * @param {MovementContext} mixins
 * @returns {MovementContext}
 */
function _ctx(pl, mixins={}) {
    return {
        camera,
        movement,
        movementInput,
        selectFromRange,
        knockback,
        attack,
        freeze,
        unfreeze,
        status: _status(pl),
        clearVelocity,
        impulse,
        setVelocity,
        yawToVec2,
        applyKnockbackAtVelocityDirection,
        task: Task.get(pl.xuid),
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
    const status = Status.get(pl.xuid)
    const hand = pl.getHand()?.type || 'minecraft:air'
    
    status.hand = hand
    return status
}

const pick = (obj, arr) =>
    arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {})

const playerAttrPickList = [
    'inAir', 'inWater', 'inLava', 'inRain', 'inSnow', 'inWall', 'inWaterOrRain', 'isInvisible', 'isHungry',
    'isOnFire', 'isOnGround', 'isOnHotBlock', 'isGliding', 'isFlying', 'isMoving', 'isSneaking'
]

const defaultPacker = (pl, bind, status) => {
    const allowedState = checkMoveState(bind, status)
    const picked = pick(pl, playerAttrPickList)

    // console.log(pl.name, ' packer:', isCollide(pl))

    /**@type {TransitionOptMixins}*/
    const mixins = {
        stamina: status.stamina || 0,
        hasTarget: hasLock(pl),
        repulsible: status.repulsible,
        isCollide: isCollide(pl),
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
        const status = Status.get(args[0].xuid)
        return {
            preInput: status.preInput
        }
    },
    onTrap(args) {
        const [ pl, data ] = args
        const status = Status.get(pl.xuid)
        return {
            preInput: status.preInput,
            ...data
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
        move.onEnter(pl, _ctx(pl))
    }
}

// const timeTracks = new Map()

/**
 * @param {any} pl 
 * @param {TrickModule} bind 
 * @param {PlayerStatus} status 
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
        /**@type {DefaultTransitionOption}*/cond

    /**@type {[string, DefaultTransitionOption][]}*/
    let candidates = []

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
        data = Object.assign(dataPacker(args), data)
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
        
        return em.once('onTick', () => transition(pl, bind, status, 'onEndOfLife', prevent, args))
    }

    // const track = timeTracks.get(pl.xuid) ?? []
    // track.forEach(t => clearInterval(t))
    // track.length = 0

    if (currentMove.onLeave) {
        currentMove.onLeave(pl, _ctx(pl, {
            rawArgs: args,
            prevent,
            nextStatus: next
        }))
    }

    // let i = 0
    // const _track = currentMove.timeTrack ?? {}
    // for (const time in _track) {
    //     const handler = _track[time]

    //     track[i++] = setTimeout(() => handler.call(undefined, pl, _ctx(pl)), Math.round(+time))
    // }
    // timeTracks.set(pl.xuid, track)

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
 * @param {PlayerStatus} _status 
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
    s.clear()
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
            const previousMainhand = playerMainhanded.get(pl.xuid)
            const previousOffhand = playerOffhanded.get(pl.xuid)

            if (mainhand !== previousMainhand) {
                em.emitNone('onChangeMainhand', pl, mainhand, previousMainhand)
                playerMainhanded.set(pl.xuid, mainhand)
            }

            if (offhand !== previousOffhand) {
                em.emitNone('onChangeOffhand', pl, offhand, previousOffhand)
                playerOffhanded.set(pl.xuid, offhand)
            }
        })
    })

    em.on('onChangeMainhand', (pl, hand, old) => {
        const status = Status.get(pl.xuid)
        const oldBind = getMod(old)

        releaseTarget(pl.xuid)

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

    em.on('onTick', onTick(em))
    em.on('onTick', () => {
        for (const [xuid, status] of Status.status.entries()) {
            if (typeof xuid !== 'string') {
                return
            }
            const pl = mc.getPlayer(xuid)
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
        for (const [xuid, status] of Status.status.entries()) {
            if (typeof xuid !== 'string') {
                return
            }
            const pl = mc.getPlayer(xuid)
            const bind = getMod(status.hand)

            if (!bind) {
                return
            }

            const currentMove = bind.moves[status.status]
            const duration = status.duration++

            if (!currentMove) {
                status.status = 'unknown'
                return transition(pl, bind, status, '', Function.prototype, [ pl ])
            }

            if (currentMove.onTick) {
                currentMove.onTick(
                    pl,
                    _ctx(pl),
                    duration/((currentMove.cast || 0) + (currentMove.backswing || 0))
                )
            }

            if (currentMove.timeline) {
                const handler = currentMove.timeline[duration]
                if (handler?.call) {
                    handler.call(null, pl, _ctx(pl))
                }
            }

            if (duration >= (currentMove.cast || 0) + (currentMove.backswing || 0)) {
                if (currentMove.onLeave) {
                    currentMove.onLeave(pl, _ctx(pl))
                }
                return transition(pl, bind, status, 'onEndOfLife', Function.prototype, [ pl ])
            }

            if (duration == currentMove.cast) {
                if (currentMove.onAct) {
                    currentMove.onAct(pl, _ctx(pl))
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
        stiffness: 600,
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
        } = damageOpt

        let isPlayer

        if (victim.xuid) {
            isPlayer = true
        }

        if (!isPlayer && !victim.isPlayer()) {
            return _damage(
                victim,
                damage,
                damageType,
                abuser,
                damagingProjectile
            )
        }

        const victimizedPlayer = isPlayer ? victim : victim.toPlayer()
        const victimStatus = Status.get(victimizedPlayer.xuid)

        const _knockback = (h, repulsible) => {
            if (powerful || repulsible) {
                const abuserPos = abuser.pos
                const victimPos = victim.pos
                knockback(victim, victimPos.x - abuserPos.x, victimPos.z - abuserPos.z, h, -2)
                return
            }

            knockback(victim, 0, 0, 0, -2)
        }
        const doDamage = () => {
            _knockback(_k, victimStatus.repulsible)

            victimStatus.shocked = shock
            em.emitNone('hurt', abuser, victimizedPlayer, {
                ...damageOpt,
                damage: damage * 0.2, 
                damageType: 'override',
            })
        }

        if (!victimStatus) {
            return doDamage()
        }

        if (victimStatus.isWaitingDeflection && !permeable && !powerful) {
            return em.emitNone('deflect', abuser, victimizedPlayer, damageOpt)
        }

        if (victimStatus.isDodging && !trace) {
            return em.emitNone('dodge', abuser, victimizedPlayer, damageOpt)
        }

        if (victimStatus.isWaitingParry && parryable) {
            return em.emitNone('parried', abuser, victimizedPlayer, damageOpt)
        }

        if (victimStatus.isBlocking && !permeable) {
            _knockback(_k * 0.4, victimStatus.repulsible)
            return em.emitNone('block', abuser, victimizedPlayer, damageOpt)
        }

        doDamage()
    })

    em.on('deflect', (abuser, victim, damageOpt) => {
        const aStatus = Status.get(abuser.xuid)
        transition(
            abuser,
            getMod(aStatus.hand),
            aStatus,
            'onMissAttack',
            Function.prototype,
            [abuser, victim, damageOpt]
        )

        const vStatus = Status.get(victim.xuid)
        transition(
            victim,
            getMod(vStatus.hand),
            vStatus,
            'onDeflection',
            Function.prototype,
            [victim, abuser, damageOpt]
        )
    })

    em.on('dodge', (abuser, victim, damageOpt) => {
        const aStatus = Status.get(abuser.xuid)
        transition(
            abuser,
            getMod(aStatus.hand),
            aStatus,
            'onMissAttack',
            Function.prototype,
            [abuser, victim, damageOpt]
        )

        const vStatus = Status.get(victim.xuid)
        transition(
            victim,
            getMod(vStatus.hand),
            vStatus,
            'onDodge',
            Function.prototype,
            [victim, abuser, damageOpt]
        )
    })

    em.on('parried', (abuser, victim, damageOpt) => {
        const aStatus = Status.get(abuser.xuid)
        transition(
            abuser,
            getMod(aStatus.hand),
            aStatus,
            'onParried',
            Function.prototype,
            [abuser, victim, damageOpt]
        )

        const vStatus = Status.get(victim.xuid)
        transition(
            victim,
            getMod(vStatus.hand),
            vStatus,
            'onParry',
            Function.prototype,
            [victim, abuser, damageOpt]
        )
    })

    em.on('block', (abuser, victim, damageOpt) => {
        transition(
            abuser,
            getMod(getHandedItemType(abuser)),
            Status.get(abuser.xuid),
            'onBlocked',
            Function.prototype,
            [abuser, victim, damageOpt]
        )

        transition(
            victim,
            getMod(getHandedItemType(victim)),
            Status.get(victim.xuid),
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
            getMod(getHandedItemType(abuser)),
            Status.get(abuser.xuid),
            'onHit',
            Function.prototype,
            [abuser, victim, damageOpt]
        )

        let flag = true,
            prevent = () => flag = false

        const victimStatus = Status.get(victim.xuid)

        transition(
            victim,
            getMod(getHandedItemType(victim)),
            victimStatus,
            'onHurt',
            prevent,
            [victim, abuser, damageOpt]
        )

        if (victimStatus.hegemony && damageOpt.powerful) {
            transition(
                victim,
                getMod(getHandedItemType(victim)),
                victimStatus,
                'onInterrupted',
                prevent,
                [victim, abuser, damageOpt]
            )
        }

        if (flag) {
            _damage(victim, damage, damageType, abuser, damagingProjectile)
        }
    })

    em.on('onHurtByEntity', (victim, abuser, damageOpt, prevent) => {
        transition(
            victim,
            getMod(getHandedItemType(victim)),
            Status.get(victim.xuid),
            'onHurtByMob',
            prevent,
            [ victim, abuser, damageOpt ]
        )
    })

    em.on('knockdown', (abuser, victim, knockbackStrength, time=30) => {
        const aStatus = Status.get(abuser.xuid)
        const aMod = getMod(aStatus.hand)

        const vStatus = Status.get(victim.xuid)
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

    em.on('onReleaseLock', (pl, hand) => {
        const bind = getMod(hand)
        const status = Status.get(pl.xuid)

        if (!bind || !status) {
            return
        }

        pl.quickEvalMolangScript('v.posture = 0;')

        transition(pl, bind, status, 'onReleaseLock', Function.prototype, [ pl ])
    })

    em.on('onLock', (pl, hand, target) => {
        const bind = getMod(hand)
        const status = Status.get(pl.xuid)

        if (!bind || !status) {
            return
        }

        pl.quickEvalMolangScript('v.posture = 1;')

        transition(pl, bind, status, 'onLock', Function.prototype, [ pl, target ])
    })

    em.on('onFeint', (pl, hand, prevent) => {
        const bind = getMod(hand)
        const status = Status.get(pl.xuid)

        if (!bind || !status) {
            return
        }

        transition(pl, bind, status, 'onFeint', prevent, [ pl ])
    })

    em.on('trap', (pl, data) => {
        const status = Status.get(pl.xuid)
        const bind = getMod(status.hand)

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

        const status = Status.get(args[0].xuid)
        const inputable = status.acceptableInput(type)

        if (inputable) {
            status.setPreInput(type)
        }

        return inputable
    })

    const acceptableStreamHandler = n =>
        (pl, prevent, args) => {
            const status = watchMainhandChange(pl)
        
            if (!mods.has(status.hand)) {
                return
            }

            transition(pl, getMod(status.hand), status, n, prevent, args)
        }

    playerEvents.forEach(n => {
        mc.listen(n, (...args) => {
            let cancelEvent = false,
            prevent = () => cancelEvent = true
            
            let pl = args[0]
            es.put(n, [pl, prevent, args])

            return !cancelEvent
        })

        em.on(n, acceptableStreamHandler(n))
    })

    em.on('onAttack', acceptableStreamHandler('onAttack'))

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

    mc.listen('onDropItem', (pl, item) => {
        if (mods.has(item.type)) {
            Status.get(pl.xuid)?.disableInputs([
                'onAttack'
            ])

            setTimeout(() => {
                Status.get(pl.xuid)?.enableInputs([
                    'onAttack'
                ])
            }, 300);

            if (pl.isSneaking) {
                return true
            }

            const val = toggleLock(pl.xuid)

            if (val !== false) {
                em.emitNone(
                    val === null ? 'onReleaseLock' : 'onLock',
                    pl, item.type, val
                )
            }
            
            return false
        }
    })

    mc.listen('onOpenContainer', pl => {
        // console.log(pl)
    })

    mc.listen('onOpenContainerScreen', pl => {
        if (hasLock(pl)) {
            let cancel = true
            es.put('onFeint', [ pl, Function.prototype, [ pl ] ])

            return !cancel
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
        return false
    })

    mc.listen('onTick', () => em.emitNone('onTick'))

    mc.listen('onRespawn', pl => {
        setTimeout(() => {
            unfreeze(pl)
            clearCamera(pl)
            initCombatComponent(pl, getMod(getHandedItemType(pl)), Status.get(pl.xuid))
        }, 300)
    })

    mc.listen('onLeft', pl => {
        Status.status.delete(pl.xuid)
    })

    mc.listen('onPlayerDie', pl => {
        releaseTarget(pl.xuid)
    })

    listenAllCustomEvents(mods)
    registerCommand()
}

function registerCommand() {
    // cmd('status', '修改状态', 1).setup(registry => {
    //     registry
    //     .register('<pl:player> clear', (_, ori, out, res) => {
    //         const pl = res.pl

    //         if (!pl) {
    //             return
    //         }

    //         pl.forEach(pl => {
    //             _status(pl).clear()
    //         })
    //     })
    //     .register('<pl:player> freeze', (_, ori, out, res) => {
    //         const pl = res.pl

    //         if (!pl) {
    //             return
    //         }

    //         pl.forEach(pl => {
    //             movement(pl, false)
    //             camera(pl, false)
    //         })
    //     })
    //     .register('<pl:player> unfreeze', (_, ori, out, res) => {
    //         const pl = res.pl

    //         if (!pl) {
    //             return
    //         }

    //         pl.forEach(pl => {
    //             movement(pl)
    //             camera(pl)
    //         })
    //     })
    //     .register('<pl:player> set <input:string> enabled', (_, ori, out, res) => {
    //         const { pl, input } = res

    //         if (!pl) {
    //             return
    //         }

    //         pl.forEach(pl => {
    //             Status
    //                 .get(pl.xuid)
    //                 .acceptableInput(input, true)
    //         })
    //     })
    //     .register('<pl:player> set <input:string> disabled', (_, ori, out, res) => {
    //         const { pl, input } = res

    //         if (!pl) {
    //             return
    //         }

    //         pl.forEach(pl => {
    //             Status
    //                 .get(pl.xuid)
    //                 .acceptableInput(input, false)
    //         })
    //     })
    //     .register('<pl:player> query <input:string>', (_, ori, out, res) => {
    //         const { pl, input } = res

    //         if (!pl) {
    //             return
    //         }

    //         pl.forEach(pl => {
    //             const enabled = Status
    //                 .get(pl.xuid)
    //                 .acceptableInput(input)

    //             pl.tell(`${input}状态: ${enabled ? 'enabled' : 'disabled'}`)
    //         })
    //     })
    //     .submit()
    // })
}

function getHandedItemType(pl) {
    return pl.getHand().type
}

module.exports = {
    emitter: em, listenAllMcEvents, 
}