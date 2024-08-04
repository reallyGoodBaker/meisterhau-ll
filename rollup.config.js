import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
    {
        input: './files/plugins/yuumo.js',
        output: {
            file: './build/yuumo.ll3/yuumo.ll3.js',
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
            file: './build/meisterhau/meisterhau.ll3.js',
            format: 'cjs'
        },
        plugins: [
            commonjs(),
            nodeResolve(),
        ]
    },
]