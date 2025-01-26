import { BaseComponent } from '@core/component'
import { Fields, PublicComponent } from '@core/config'

@PublicComponent('team')
@Fields([ 'name' ])
export class Team extends BaseComponent {
    static readonly players = new Map<Team, Set<Player>>()

    constructor(
        public name: string = 'default',
    ) {
        super()
    }

    static create({ name }: { name: string }) {
        return new Team(name)
    }

    onAttach(): boolean | void | Promise<boolean | void> {
        this.getEntity().use(pl => {
            const players = Team.players.get(this) || new Set()
            players.add(pl as Player)
            Team.players.set(this, players)
        })
    }

    onDetach(): void | Promise<void> {
        this.getEntity().use(pl => {
            const players = Team.players.get(this)
            if (players) {
                players.delete(pl as Player)
            }
        })
    }
}