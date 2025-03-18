import { initCombatComponent } from '../../core'
import { ai, MeisterhauAI, MeisterhauAIState } from '../core'
import { tricks } from '../tricks/ornateTwoHander'

export class Guard extends MeisterhauAI {
    define: () => AsyncGenerator<MeisterhauAIState, void, unknown> = () => {
        const self = this
        async function *moves() {
            while (true) {
                yield () => self.attack() as any
                await self.wait(1000)
                yield () => self.useItem()
                await self.wait(1000)
                yield () => self.sneak()
                await self.wait(1000)
            }
        }

        return moves()
    }

    async run() {
        initCombatComponent(this.actor, tricks, this.status)
        while (true) {
            await this.tick()
        }
    }
}

ai.register('meisterhau:guard', Guard, tricks)