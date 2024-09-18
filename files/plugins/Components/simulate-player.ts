import { cmd } from '@utils/command'
import { interruptExcept } from '@utils/defined'

const _listeners = new WeakMap<SimulatedPlayer, { [k: string]: (...args: any[]) => void }>()

export function spawn(pos: IntPos, name: string) {
    return mc.spawnSimulatedPlayer(name, pos)
}

export function despawn(pl: SimulatedPlayer) {
    interruptExcept(pl.isSimulatedPlayer())

    pl.simulateDisconnect()
}

export function listener(pl: SimulatedPlayer, listeners: { [k: string]: (...args: any[]) => void }) {
    _listeners.set(pl, listeners)
}

function buildCallListener(type: string) {
    return (mob: Entity, ...args: any[]) => {
        if (!mob.isPlayer()) {
            return
        }
    
        const pl = mob.toPlayer()
        if (!pl?.isSimulatedPlayer()) {
            return
        }
    
        const listeners = _listeners.get(pl as SimulatedPlayer)
        if (!listeners) {
            return
        }
    
        listeners[type]?.apply(pl, args)
    }
}

function listenMobEvent(type: string) {
    mc.listen(type as any, buildCallListener(type))
}

export function setup() {
    cmd('simplayer', '假人', 1)
    .setup(registry => {
        registry
            .register('<pos:pos> <name:string>', (_, ori, out, { pos, name }) => {
                spawn(pos, name)
            })
            .register('despawn <pl:player>',(_, ori, out, res) => {
                (res.pl as SimulatedPlayer[]).forEach(sim => {
                    despawn(sim)
                })
            })
            .submit()
    })

    listenMobEvent('onMobHurt')
    listenMobEvent('onMobDie')
}