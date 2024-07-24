import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
    {
        input: './files/plugins/yuumo.js',
        output: {
            file: './files/plugins/yuumo.ll3.js',
            format: 'cjs'
        },
        plugins: [
            commonjs(),
            nodeResolve(),
        ]
    },
    {
        input: './files/plugins/meisterhau.js',
        output: {
            file: './files/plugins/meisterhau.ll3.js',
            format: 'cjs'
        },
        plugins: [
            commonjs(),
            nodeResolve(),
        ]
    },
]