import { CustomComponent } from "@combat/basic/core/component"
import { Status } from "@combat/basic/core/status"
import { Actor } from "@utils/actor"
import { Delegate } from "@utils/events"
import { Optional } from "@utils/optional"

export interface AiHearingConfig {
    channels: string[]
    /**
     * 最低音量，低于该音量不触发
     */
    minVolumn?: number
    /**
     * 最高音量，高于该音量不触发
     */
    maxVolumn?: number
}

export interface ISoundSource {
    channel: string
    pos: IntPos | FloatPos
    sourceActor: Optional<Actor>
    volumn: number
}

export class AiHearing extends CustomComponent {
    static readonly aiHearingChannels = new Map<Optional<Actor>, ISoundSource[]>()

    static addSoundSource(soundSource: ISoundSource) {
        const sources = AiHearing.aiHearingChannels.get(soundSource.sourceActor) ?? []
        sources.push(soundSource)
        AiHearing.aiHearingChannels.set(soundSource.sourceActor, sources)
        AiHearing._tryNotifyHearing(soundSource)
    }

    private static _tryNotifyHearing(source: ISoundSource) {
        const { pos, volumn, sourceActor, channel } = source
        const spreadRadius = Math.min(32, Math.max(volumn * 16, 16))
        const entities = mc.getEntities(pos, spreadRadius)
        entities.forEach(entity => Optional.some(Status.get(entity.uniqueId)?.componentManager.getComponent(AiHearing)).use(hearing => {
            const dist = sourceActor.match(
                Infinity,
                actor => actor.distanceTo(entity)
            )
            const minVolumn = hearing.conf.minVolumn ?? 0
            const maxVolumn = hearing.conf.maxVolumn ?? 2
            const volumnRemain = Math.max(volumn - 0.0625 * dist, 0)
            if (hearing.conf.channels.includes(channel) && volumnRemain >= minVolumn && volumnRemain <= maxVolumn) {
                hearing.onHeard.call(source)
                hearing.heardActors.add(sourceActor.unwrap())
            }
        }))
    }

    readonly heardActors: Set<Actor> = new Set()

    constructor(
        readonly conf: AiHearingConfig
    ) {
        super()
    }

    readonly onHeard = new Delegate<[ISoundSource]>()
}