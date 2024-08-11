const { cmd } = require('./utils/command')
const { alert } = require('./ui')

function distStr(entity, dest, showDiff=true) {
    const pos = entity.blockPos
    const distance = ~~entity.distanceTo(dest)

    const diff = `    |${dest.x - pos.x}, ${dest.y - pos.y}, ${dest.z - pos.z}|`

    return distance + (showDiff ? diff : '')
}

function setup() {
    cmd('whoami', '我是谁？', 0)
    .setup(registry => {
        registry
        .register('name', (cmd, ori, out) => {
            out.success(ori.entity.name)
        })
        .register('type', (_, ori, out) => {
            out.success(ori.entity.type)
        })
        .register('id <mob:entity>', (_, ori, out, args) => {
            const source = ori.player ?? ori.entity
            const targets = args.mob

            targets.forEach(t => {
                source.tell(t.uniqueId)
            })
        })
        .register('dist <position:pos>', (_, ori, out, args) => {
            const dest = args.position
            out.success(distStr(ori.entity, dest))
        })
        .register('dist <mob:entity>', (_, ori, out, args) => {
            const source = ori.player ?? ori.entity
            const targets = args.mob
            
            for (const target of targets) {
                const dest = target.blockPos
                if (!target.isPlayer()) {
                    out.success(distStr(source, dest))
                    continue
                }

                alert('', `${source.name} 想要知道你的位置，是否提供？`, '提供', '拒绝', () => {
                    source.tell(distStr(source, dest))
                }, () => {
                    source.tell(distStr(source, dest, false))
                }).send(target.toPlayer())
            }
        })
        .submit()
    })
}

module.exports = {
    setup
}