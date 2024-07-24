const mobs = new Map()
const mobUidList = [null]
const emptyIndexList = new Set()

function getScoreboard(name) {
    return mc.getScoreObjective(name) ?? mc.newScoreObjective(name, name)
}

function addWhereEmpty(el) {
    if (emptyIndexList.size) {
        let index
        for (const i of emptyIndexList) {
            index = i
            break
        }

        emptyIndexList.delete(index)
        mobUidList[index] = el

        return index
    }

    mobUidList.push(el)
    return mobUidList.length - 1
}

const tag = 'CanBeKinematicObj'
function canBeKinematicObj() {
    mc.runcmdEx(`scoreboard players set @e[tag=!${tag}] suid 0`)
}

function add(mob) {
    const uid = mob.uniqueId
    const ob = getScoreboard('suid')

    if (mobUidList.includes(uid)) {
        return [getScoreUid(uid), false]
    }

    mobs.set(uid, mob)
    const scoreUid = addWhereEmpty(uid)
    const scoreTarget = mob.isPlayer()
        ? mob.toPlayer()
        : uid

    if (!ob.getScore(scoreTarget)) {
        ob.setScore(scoreTarget, scoreUid)
        mob.addTag(tag)
        return [scoreUid, true]
    }

    return [0, false]
}

function rm(mob) {
    const uid = mob.uniqueId
    const suid = getScoreUid(uid)

    mob.removeTag(tag)
    if (mobs.delete(uid)) {
        mobUidList[suid] = null
        emptyIndexList.add(suid)
        
        return suid
    }
    
    return 0
}

function get(suid) {
    return mobs.get(mobUidList[suid])
}

function getScoreUid(uid) {
    const suid = mobUidList.indexOf(uid)

    return !~suid ? 0 : suid
}

function setup() {
    mc.runcmdEx('scoreboard players set @e suid 0')
    mc.listen('onMobDie', mob => {
        if (!mob.isPlayer()) {
            rm(mob)
        }
    })
    mc.listen('onTick', canBeKinematicObj)
    mc.listen('onLeft', mob => rm(mob))
}

module.exports = {
    get, getScoreUid, setup, add, rm
}