// LiteLoader-AIDS automatic generated
/// <reference path="e:\llse/dts/llaids/src/index.d.ts"/>

const config = require("./File").config;

const Money = {
    get(player, type) {
        if (type == "score") {
            let score = config.getScore()
            if (mc.getScoreObjective(score) != null)
                return player.getScore(score);
            else
                return 0
        } else { return money.get(player.xuid) };
    },
    add(player, type, int) {
        if (type == "score") {
            let score = config.getScore()
            if (mc.getScoreObjective(score) != null)
                return player.addScore(score, Number(int));
            else
                return false
        } else { return money.add(player.xuid, Number(int)) };
    },
    reduce: (player, type, int) => {
        if (type == "score") {
            let score = config.getScore()
            if (mc.getScoreObjective(score) != null)
                return player.reduceScore(score, Number(int));
            else
                return false
        } else { return money.reduce(player.xuid, Number(int)) };
    }
}

module.exports = Money;