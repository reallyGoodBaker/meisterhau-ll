const database = require('../db.lib')

const scenes = database('./data/match/scene')
const areas = database('./data/match/area')

/**
 * @param {SceneConfig} config 
 */
function addScene(config) {
    if (!scenes.get(config.id)) {
        scenes.set(
            config.id,
            config
        )

        return true
    }

    return false
}

/**
 * @param {string} id 
 */
function deleteScene(id) {
    return scenes.delete(id)
}

/**
 * @param {string} id 
 */
function getScene(id) {
    return scenes.get(id)
}

function listScene() {
    return scenes.listKey()
}

/**
 * @param {SceneConfig} config 
 */
function addScene(config) {
    if (!scenes.get(config.id)) {
        scenes.set(
            config.id,
            config
        )

        return true
    }

    return false
}

/**
 * @param {string} id 
 */
function deleteScene(id) {
    return scenes.delete(id)
}

/**
 * @param {string} id 
 */
function getScene(id) {
    return scenes.get(id)
}

function listScene() {
    return scenes.listKey()
}