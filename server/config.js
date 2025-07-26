/**@type {{forward: number|null; lipDependencies: string[]; sync: Array<{path: string; exclude?: RegExp}>}}*/
module.exports = {
    forward: null,
    lipDependencies: [
        'github.com/LiteLDev/LeviLamina@1.1.1'
    ],
    sync: [
        'worlds/**/*',
        'config/**/*',
        'lib/*',
    ],
    builds: [
        'meisterhau',
        '-yuumo.ll3',
    ]
}