import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import ts from '@rollup/plugin-typescript'
import { typescriptPaths as paths } from 'rollup-plugin-typescript-paths'
import json from '@rollup/plugin-json'

export default [
    {
        input: './files/plugins/yuumo.js',
        output: {
            file: './build/yuumo.ll3/yuumo.ll3.js',
            format: 'cjs',
        },
        plugins: [
            commonjs(),
            nodeResolve(),
            ts(),
            paths(),
            json(),
        ]
    },
    {
        input: './files/plugins/meisterhau.js',
        output: {
            file: './build/meisterhau/meisterhau.ll3.js',
            format: 'cjs',
        },
        plugins: [
            commonjs(),
            nodeResolve(),
            ts(),
            paths(),
            json(),
        ]
    },
]