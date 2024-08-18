const { knockback } = require('../../../scripts-rpc/func/kinematics')


const setVelocity = (pl, rotation, h, v) => {
    const { yaw } = pl.direction
    const rad = (yaw + rotation) * Math.PI / 180.0
    knockback(pl, Math.cos(rad), Math.sin(rad), h, v)
}

function isCollide(pl) {
    const { x: _x, z: _z } = pl.pos
    const x = Math.abs(_x)
    const z = Math.abs(_z)

    let mayCollide = x - Math.floor(x) < 0.301 ? 1
        : x - Math.floor(x) > 0.699 ? 2
            : z - Math.floor(z) < 0.301 ? 3
                : z - Math.floor(z) > 0.699 ? 4 : 0

    const bPos = pl.blockPos

    switch (mayCollide) {
        default:
            return false
    
        case 1:
            const nx = mc.getBlock(bPos.x - 1, bPos.y, bPos.z, bPos.dimid)
            return !nx.isAir && !nx.thickness

        case 2:
            const px = mc.getBlock(bPos.x + 1, bPos.y, bPos.z, bPos.dimid)
            return !px.isAir && !px.thickness
        
        case 3:
            const nz = mc.getBlock(bPos.x, bPos.y, bPos.z - 1, bPos.dimid)
            return !nz.isAir && !nz.thickness
        
        case 4:
            const pz = mc.getBlock(bPos.x, bPos.y, bPos.z + 1, bPos.dimid)
            return !pz.isAir && !pz.thickness 
    }
}

module.exports = {
    setVelocity, isCollide
}