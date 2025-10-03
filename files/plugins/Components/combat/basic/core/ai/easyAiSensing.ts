import { TargetLock } from "@combat/basic/components/core/target-lock"
import { MeisterhauAI } from "./core"
import { Actor } from "../inputSimulator"
import { Optional } from "@utils/optional"

export interface AiSensingConfig {
    fov: number
    range: number
    
}

export class EasyAISensing {
    constructor(
        public readonly ai: MeisterhauAI
    ) {}

    get components() {
        return this.ai.status.componentManager
    }

    hasTarget(): boolean {
        return !this.components.getComponent(TargetLock).isEmpty()
    }

    getTarget(): Optional<Actor> {
        return this.components.getComponent(TargetLock).unwrap().target
    }

    
}