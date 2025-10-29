import { remote } from '../llrpc.js'
import { world } from '@minecraft/server'

remote.expose('lookAt', (source, target) => {
    const sourcePlayer = world.getAllPlayers().find(player => player.id === source)
    if (!sourcePlayer) {
        return
    }

    const targetEntity = world.getEntity(target)
    if (!targetEntity) {
        return
    }

    sourcePlayer.camera.setCamera('meisterhau:battle', {
        
    })
})

remote.expose('setBattleCamera', () => {

})