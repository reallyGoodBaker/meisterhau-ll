const { cmd } = require('./utils/command')

function setup() {
    cmd('simplayer', '假人', 1)
    .setup(registry => {
        registry.register('<pos:pos> <name:string>', (_, ori, out, res) => {
            const { x, y, z, dimid } = res.pos
            mc.spawnSimulatedPlayer(res.name, x, y, z, dimid)
        })
        .submit()
    })
}

module.exports = {
    setup
}