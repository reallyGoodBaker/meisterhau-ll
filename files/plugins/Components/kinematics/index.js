const { cmd } = require('../utils/command')
const {
    setup: setupMobs, getScoreUid, add, rm
} = require('./mobs')

const kinematicsMap = new Map()


function tp(suid, dx = 0, dy = 0, dz = 0, facing, isVec) {
    if (dx + dy + dz === 0) {
        return
    }

    const facingInfo = facing
        ?  isVec
            ? ` facing ${facing.x} ${facing.y} ${facing.z}`
            : ` ${facing.pitch} ${facing.yaw}`
        : ' true'

    return mc.runcmdEx(`execute as @e[scores={suid=${suid}}] at @s run tp @s ~${dx} ~${dy} ~${dz}${facingInfo}`)
}

function initKinematicsStatus(suid) {
    const status = {
        vx: 0, vy: 0, vz: 0,
        ax: 0, ay: 0, az: 0
    }
    kinematicsMap.set(suid, status)
    return status
}

function setVelocity(suid, x = 0, y = 0, z = 0) {
    let status = kinematicsMap.get(suid) || initKinematicsStatus(suid)

    status.vx = x
    status.vy = y
    status.vz = z
}

function setAccelerate(suid, x = 0, y = 0, z = 0) {
    let status = kinematicsMap.get(suid) || initKinematicsStatus(suid)

    status.ax = x
    status.ay = y
    status.az = z
}

const deltaTick = 0.05
const gravityAccelerate = 9.8

function freshStatus() {
    kinematicsMap.forEach((v, suid) => {
        const {
            ax, ay, az
        } = v

        if (ax + ay + az !== 0) {
            v.vx += ax * deltaTick
            v.vy += ay * deltaTick
            v.vz += az * deltaTick
        }

        v.vy -= gravityAccelerate * deltaTick

        const {
            vx, vy, vz
        } = v

        let dx =  vx * deltaTick
            ,dy = vy * deltaTick
            ,dz = vz * deltaTick

        if (!tp(suid, dx, dy, dz)) {
            kinematicsMap.delete(suid)
            // const entity = get(suid)
            // entity?.hurt(Math.sqrt(vx**2 + vy**2 + vz**2) * 0.9, ActorDamageCause.FlyIntoWall)
            // positionFix(entity, suid, v)
        }
    })
}

function addWatchable(entity) {
    const [suid, success] = add(entity)

    if (!suid || !success) {
        return false
    }

    return true
}

function rmWatchable(entity) {
    const suid = rm(entity)

    if (!suid) {
        return false
    }

    kinematicsMap.delete(suid)
    return true
}

function setup() {
    setupMobs()
    mc.listen('onTick', freshStatus)

    cmd('kinematics', '设置运动学属性')
    .setup(regsitry => {
        regsitry
        .register('watch <entity:entity>', (_1, _2, out, { entity }) => {
            const list = entity.map(e => addWatchable(e)).filter(v => v)
            out.success(`添加 ${list.length} 个运动学监视对象`)
        })
        .register('unwatch <watched:entity>', (_1, _2, out, {watched}) => {
            const list = watched.map(e => rmWatchable(e)).filter(v => v)
            out.success(`移除 ${list.length} 个运动学监视对象`)
        })
        .register('velocity <v:vec>', (_, { entity: ori }, out, args) => {
            const { v } = args
            let suid = getScoreUid(ori.uniqueId)

            if (!suid) {
                return
            }

            setVelocity(suid, v.x - 0.5, v.y, v.z - 0.5)
        })
        .register('accelerate <a:vec>', (_, { entity: ori }, out, args) => {
            const { a } = args
            let suid = getScoreUid(ori.uniqueId)
            if (!suid) {
                return
            }

            setAccelerate(suid, a.x - 0.5, a.y, a.z - 0.5)
        })
        .submit()
    })
}

module.exports = {
    setup, setAccelerate, setVelocity
}