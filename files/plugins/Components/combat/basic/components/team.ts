import { BaseComponent } from '@core/component'
import { Fields, PublicComponent } from '@core/config'

/** 队伍组件 - 管理玩家队伍 */
@PublicComponent('team')
@Fields([ 'name' ])
export class Team extends BaseComponent {
    /** 队伍玩家映射表 */
    static readonly players = new Map<Team, Set<Player>>()

    constructor(
        /** 队伍名称 */
        public name: string = 'default',
    ) {
        super()
    }

    /** 创建队伍组件 */
    static create({ name }: { name: string }) {
        return new Team(name)
    }

    /** 组件附加时添加玩家到队伍 */
    onAttach(): boolean | void | Promise<boolean | void> {
        this.getActor().use(pl => {
            const players = Team.players.get(this) || new Set()
            players.add(pl as Player)
            Team.players.set(this, players)
        })
    }

    /** 组件分离时从队伍移除玩家 */
    onDetach(): void | Promise<void> {
        this.getActor().use(pl => {
            const players = Team.players.get(this)
            if (players) {
                players.delete(pl as Player)
            }
        })
    }

    /** 获取队伍成员 */
    getTeamMembers(): Set<Player> {
        return Team.players.get(this) || new Set()
    }
}
