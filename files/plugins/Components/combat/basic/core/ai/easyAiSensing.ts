import { TargetLock } from "@combat/basic/components/core/target-lock"
import { MeisterhauAI } from "./core"
import { Actor } from "../inputSimulator"
import { Optional } from "@utils/optional"
import { Status } from "../status"
import { AiHearing } from "@combat/basic/components/ai/hearing"
import { AiVision } from "@combat/basic/components/ai/vision"

export class EasyAISensing {
    constructor(
        public readonly ai: MeisterhauAI,
    ) {}

    get components() {
        return this.ai.status.componentManager
    }

    hasTarget(): boolean {
        return !this.components.getComponent(TargetLock).isEmpty()
    }

    getTarget(): Optional<Actor> {
        return this.components.getComponent(TargetLock).match(
            Optional.none(),
            targetLock => targetLock.target,
        )
    }

    targetInRange(range: number): boolean {
        return this.getTarget().match(
            false,
            actor => this.ai.actor.match(
                false,
                aiActor => actor.distanceTo(aiActor) <= range
            ),
        )
    }

    targetStatus(): Optional<Status> {
        return this.getTarget().match(
            Optional.none(),
            actor => Optional.some(Status.getOrCreate(actor.uniqueId)),
        )
    }

    hasTargetInputed(...inputTypes: (keyof InputableTransitionMap)[]): boolean {
        return this.targetStatus().match(
            false,
            status => {
                if (!status.preInput) {
                    return false   
                }

                return inputTypes.includes(status.preInput as any)
            },
        )
    }

    canHearTarget(hearingCtor: ConstructorOf<AiHearing> = AiHearing): boolean {
        return this.getTarget().match(
            false,
            actor => this.components.getComponent(hearingCtor).match(
                false,
                hearing => hearing.heardActors.has(actor)
            ),
        )
    }

    canSeeTarget(visionCtor: ConstructorOf<AiVision> = AiVision): boolean {
        return this.getTarget().match(
            false,
            actor => this.components.getComponent(visionCtor).match(
                false,
                vision => vision.seenActors.has(actor)
            ),
        )
    }

    targetIsBlocking(): boolean {
        return this.targetStatus().match(
            false,
            actor => actor.isBlocking,
        )
    }

    actorIterapted(iterapted: string[] = [ 'blocked', 'parried', 'hurt' ]): boolean {
        const stateName = this.ai.status.status
        return iterapted.includes(stateName)
    }
}