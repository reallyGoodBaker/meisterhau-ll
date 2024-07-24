/**@type {{forward: number|null; alias: {bds: string; ll: string}; sync: Array<{path: string; exclude?: RegExp}>}}*/
module.exports = {
    forward: null,
    alias: {
        bds: "1.20.11.01",
        ll: "2.14.1"
    },
    sync: [
        'plugins/initServer.js',
        'plugins/Components/**/*',
        'plugins/ServerConfig/*',
        'worlds/**/*',
        'config/**/*',
        'lib/*',
        'Glacie.dll',
    ]
}