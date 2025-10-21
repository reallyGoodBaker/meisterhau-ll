import { Team } from './team'
import { Status } from '../core/status'
import { cmd, CommandPermission } from '@utils/command'

/** 比赛规则枚举 */
export enum MatchRules {
    /** 三局两胜制 */
    BestOf,
    /** 固定回合制 */
    FixedRounds,
}

/** 比赛管理类 */
export class Match {
    /** 所有比赛映射表 */
    static readonly matches = new Map<Team, Match>()

    constructor(
        public readonly team1: Team,
        public readonly team2: Team,
        public readonly rule: MatchRules = MatchRules.BestOf,
        public readonly rounds: number = 5,
        public readonly wins: [number, number] = [0, 0],
        public currentRound: number = 1,
    ) {
        Match.matches.set(team1, this)
        Match.matches.set(team2, this)
    }

    /** 查找队伍的比赛 */
    static findMatch(team: Team): Match | undefined {
        return Match.matches.get(team)
    }

    /** 销毁比赛 */
    destroy() {
        Match.matches.delete(this.team1)
        Match.matches.delete(this.team2)
    }

    /** 获取领先分数 */
    lead() {
        return Math.max(...this.wins)
    }

    /** 检查比赛是否结束 */
    finished(): boolean {
        if (this.rule === MatchRules.BestOf) {
            return this.lead() > Math.floor(this.rounds / 2)
        }

        if (this.rule === MatchRules.FixedRounds) {
            return this.currentRound < this.rounds
        }

        return false
    }

    /** 队伍获胜 */
    win(team: Team) {
        const won = this.team1 === team ? 0 :
            this.team2 === team? 1 : -1

        if (won === -1) {
            return
        }

        this.wins[won]++
        this.currentRound++
    }

    /** 队伍失败 */
    lose(team: Team) {
        const won = this.team1 === team ? 1 :
            this.team2 === team? 0 : -1

        if (won === -1) {
            return
        }

        this.wins[won]++
        this.currentRound++
    }

    /** 获取比赛结果 */
    result() {
        if (this.wins[0] > this.wins[1]) {
            return [ this.team1, this.team2 ]
        }

        return [ this.team2, this.team1 ]
    }
}

mc.listen('onPlayerDie', pl => {
    Status.getOrCreate(pl.uniqueId).componentManager.getComponent(Team).use(team => {
        const match = Match.findMatch(team)
        if (!match) {
            return
        }

        match.lose(team)

        const [ winner, loser ] = match.result()
        const winningPlayers = Team.players.get(winner)
        const losingPlayers = Team.players.get(loser)

        if (match.finished()) {
            if (winningPlayers) {
                winningPlayers.forEach(pl => {
                    pl.setTitle(`获胜`)
                })
            }

            if (losingPlayers) {
                losingPlayers.forEach(pl => {
                    pl.setTitle(`失败`)
                })
            }

            return
        }

        if (winningPlayers) {
            winningPlayers.forEach(pl => {
                pl.setTitle(`第 ${match.currentRound} 回合`)
                pl.setTitle(`共 ${match.rounds} 回合`)
            })
        }

        if (losingPlayers) {
            losingPlayers.forEach(pl => {
                pl.setTitle(`第 ${match.currentRound} 回合`)
                pl.setTitle(`共 ${match.rounds} 回合`)
            })
        }
    })
})

cmd('match', '开启对局', CommandPermission.Everyone).setup(register => {
    register('<pl:player> best_of <rounds:int>', (cmd, ori, out, res) => {
        const source = ori.player as Player
        const { pl, rounds } = res as { pl: Player[], rounds: number }
        
        const sourceTeamOpt = Status.getOrCreate(source.uniqueId).componentManager.getComponent(Team)
        const targetTeamOpt = Status.getOrCreate(pl[0].uniqueId).componentManager.getComponent(Team)

        if (sourceTeamOpt.isEmpty() || targetTeamOpt.isEmpty()) {
            return out.error('必须在不同伍中才能进行对局')
        }

        const sourceTeam = sourceTeamOpt.unwrap()
        const targetTeam = targetTeamOpt.unwrap()

        if (Match.findMatch(sourceTeam)) {
            return out.error('你已经在进行对局了')
        }

        if (Match.findMatch(targetTeam)) {
            return out.error('对方已经在进行对局了')
        }

        new Match(
            sourceTeam,
            targetTeam,
            MatchRules.BestOf,
            rounds
        )
    })
})
