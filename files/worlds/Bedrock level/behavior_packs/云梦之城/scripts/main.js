import { system, world, Direction, ItemStack, ItemUseAfterEvent } from '@minecraft/server'
import { liquorItems, gobletEntities } from './config.js'

world.afterEvents.itemUse.subscribe(ev => {
    if (!handleGobletInteract(ev)) {
        spawnEntityIfMatch(ev, 'liquor:smirnoff', 'liquor:smirnoff_entity')
        spawnEntityIfMatch(ev, 'liquor:whiskey', 'liquor:whiskey_entity')
        spawnEntityIfMatch(ev, 'liquor:wine', 'liquor:wine_entity')
        spawnEntityIfMatch(ev, 'liquor:sapphire', 'liquor:sapphire_entity')
        spawnEntityIfMatch(ev, 'goblet:highball', 'goblet:highball_entity')
        spawnEntityIfMatch(ev, 'goblet:martini', 'goblet:martini_entity')
        spawnEntityIfMatch(ev, 'goblet:beer_mug', 'goblet:beer_mug_entity')
    }
})

world.afterEvents.entityHitEntity.subscribe(ev => {
    despawnEntityIfMatch(ev, 'liquor:smirnoff_entity', 'liquor:smirnoff')
    despawnEntityIfMatch(ev, 'liquor:whiskey_entity', 'liquor:whiskey')
    despawnEntityIfMatch(ev, 'liquor:wine_entity', 'liquor:wine')
    despawnEntityIfMatch(ev, 'liquor:sapphire_entity', 'liquor:sapphire')
    despawnEntityIfMatch(ev, 'goblet:highball_entity', 'goblet:highball')
    despawnEntityIfMatch(ev, 'goblet:martini_entity', 'goblet:martini')
    despawnEntityIfMatch(ev, 'goblet:beer_mug_entity', 'goblet:beer_mug')
})

function spawnEntityIfMatch(ev, itemType, entityType) {
    if (ev.itemStack.typeId === itemType) {
        const blockHit = ev.source.getBlockFromViewDirection({
            maxDistance: 5
        })

        if (!blockHit) {
            return
        }
        
        const { block, face, faceLocation } = blockHit

        if (face === Direction.Up) {
            const src = ev.source
            src.runCommand(`clear @s ${ev.itemStack.typeId} 0 1`)
            const entity = src.dimension.spawnEntity(entityType, {
                x: block.x + faceLocation.x,
                y: block.y + faceLocation.y,
                z: block.z + faceLocation.z
            })

            entity.teleport(entity.location, {
                facingLocation: {
                    x: src.location.x,
                    y: entity.getHeadLocation().y,
                    z: src.location.z
                }
            })
        }
    }
}

function despawnEntityIfMatch(ev, entityType, itemType) {
    if (ev.hitEntity.typeId === entityType) {
        const victim = ev.hitEntity
        victim.dimension.spawnItem(new ItemStack(itemType), victim.location)
        victim.teleport({
            ...victim.location, y: victim.location.y - 20
        })
        system.runTimeout(() => victim.kill(), 20)
    }
}

/**
 * @param {ItemUseAfterEvent} ev 
 */
function handleGobletInteract(ev) {
    for (const [ type, content ] of Object.entries(liquorItems)) {
        if (content.includes(ev.itemStack.typeId)) {
            return _handleGobletInteract(ev, type)
        }
    }

    return _handleGobletInteract(ev, 'empty')
}

function _handleGobletInteract(ev, type) {
    const src = ev.source
    const closedEntity = src.getEntitiesFromViewDirection({ maxDistance: 5 })[0]

    if (!closedEntity) {
        return false
    }

    if (!gobletEntities.includes(closedEntity.entity.typeId)) {
        return false
    }

    closedEntity.entity.runCommand(`playanimation @s animation.goblet.${type}`)
    return true
}