import { CustomComponent } from "@combat/basic/core/component"
import { Status } from "@combat/basic/core/status"
import { Actor } from "@utils/actor"
import { Delegate } from "@utils/events"
import { Optional } from "@utils/optional"

/** AI听觉配置接口 */
export interface AiHearingConfig {
    /** 监听的音频通道列表 */
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

/** 音频源接口 */
export interface ISoundSource {
    /** 音频通道 */
    channel: string
    /** 音频位置 */
    pos: IntPos | FloatPos
    /** 音频源角色 */
    sourceActor: Optional<Actor>
    /** 音量大小 */
    volumn: number
}

/** AI听觉组件 - 管理AI的听觉检测功能 */
export class AiHearing extends CustomComponent {
    /** 音频源映射表，按角色存储音频源 */
    static readonly aiHearingChannels = new Map<Optional<Actor>, ISoundSource[]>()

    /**
     * 添加音频源
     * @param soundSource 音频源信息
     */
    static addSoundSource(soundSource: ISoundSource) {
        const sources = AiHearing.aiHearingChannels.get(soundSource.sourceActor) ?? []
        sources.push(soundSource)
        AiHearing.aiHearingChannels.set(soundSource.sourceActor, sources)
        AiHearing._tryNotifyHearing(soundSource)
    }

    /**
     * 尝试通知听觉组件
     * @param source 音频源信息
     */
    private static _tryNotifyHearing(source: ISoundSource) {
        const { pos, volumn, sourceActor, channel } = source
        // 计算音频传播半径
        const spreadRadius = Math.min(32, Math.max(volumn * 16, 16))
        const entities = mc.getEntities(pos, spreadRadius)

        // 通知范围内的所有听觉组件
        entities.forEach(entity => Optional.some(Status.get(entity.uniqueId)?.componentManager.getComponent(AiHearing)).use(hearing => {
            // 计算距离
            const dist = sourceActor.match(
                Infinity,
                actor => actor.distanceTo(entity)
            )
            const minVolumn = hearing.conf.minVolumn ?? 0
            const maxVolumn = hearing.conf.maxVolumn ?? 2
            // 计算剩余音量（随距离衰减）
            const volumnRemain = Math.max(volumn - 0.0625 * dist, 0)

            // 检查是否满足触发条件
            if (hearing.conf.channels.includes(channel) && volumnRemain >= minVolumn && volumnRemain <= maxVolumn) {
                hearing.onHeard.call(source)
                hearing.heardActors.add(sourceActor.unwrap())
            }
        }))
    }

    /** 已听到的角色集合 */
    readonly heardActors: Set<Actor> = new Set()

    /**
     * 构造函数
     * @param conf AI听觉配置
     */
    constructor(
        readonly conf: AiHearingConfig
    ) {
        super()
    }

    /** 当听到音频时触发的事件 */
    readonly onHeard = new Delegate<[ISoundSource]>()
}
