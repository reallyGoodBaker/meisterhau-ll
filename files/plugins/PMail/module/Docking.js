// LiteLoader-AIDS automatic generated
/// <reference path="e:\llse/dts/llaids/src/index.d.ts"/>

const docking = {
    PCsvip() { return ll.listPlugins().includes("PCsvip") },
    PCsvipVersion() {
        if (ll.hasExported("PCsvip", "version"))
            return ll.import("PCsvip", "version")();
        else
            return "v2.0.0 Beta 24.02.1204A";
    },
    PCsvipAddTime: (player, int) => {
        if (docking.PCsvipVersion() > "v2.0.0 Beta 24.02.1204A")
            return ll.import("PCsvip", "addtime")(player, int)
        else
            return ll.import("PCsvip", "addviptime")(player.realName, int)
    },
    PLib() { return ll.listPlugins().includes("PLib") },
    PLibVersion() {
        if (ll.hasExported("PLib", "version"))
            return ll.import("PLib", "version")();
        else
            return "v1.0.9";
    },
    PLibBind(name) { return ll.import("PLib", "bind")(name) },
    PLibPlayer(name) {
        let player_data = ll.import("PLib", "getplayer")();
        if (name != null) {
            let newObj = {};
            player_data.forEach((data) => {
                newObj[data.gameid] = data;
            });
            return newObj[name];
        } else {
            return player_data;
        };
    },
    PLibItem(item) { return ll.import("PLib", "item")(item) },
    PLibItemInfo(item) { return ll.import("PLib", "iteminfo")(item) },
    PMenu() { return ll.listPlugins().includes("PMenu") },
    PMenuItem() { return ll.import("PMenu", "iteminfo")() },
    PAPI() { return ll.listPlugins().includes("BEPlaceholderAPI") },
    GMLIB() { File.exists("./plugins/GMLIB-LegacyRemoteCallApi/GMLIB-LegacyRemoteCallApi.dll") },
    PAPIjs() {
        if (this.PAPI)
            return require('../../../lib/BEPlaceholderAPI-JS.js').PAPI
        else
            return require("./GMLIB-LegacyRemoteCallApi/lib/BEPlaceholderAPI-JS").PAPI;
    }
}

module.exports = docking