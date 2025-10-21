/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
    entryPoints: [
        "./files/plugins/global.d.ts",
        "./files/plugins/Components/utils/*.ts",
        "./files/plugins/Components/scripts-rpc/*.ts",
        "./files/plugins/Components/combat/basic/*",
    ],
    out: "docs",
    plugin: [
        'typedoc-github-theme'
    ],
    entryPointStrategy: 'expand',
    sourceLinkExternal: false,
}

export default config