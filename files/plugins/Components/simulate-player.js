const { cmd } = require('./command')

function setup() {
    cmd('simplayer', '假人', 1)
    .setup(registry => {
        registry.register('<pos:pos> <name:string>', (_, ori, out, res) => {
            mc.spawnSimulatedPlayer(res.name, res.pos)
        })
        .submit()
    })
}

module.exports = {
    setup
}