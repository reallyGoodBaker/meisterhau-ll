import { Optional } from "@utils/optional"

export function getPlayer(info: string, init: (pl: Player) => void) {
    const pl = mc.getPlayer(String(info))
    pl && init(pl) 
    return Optional.some(pl)
}