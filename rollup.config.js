import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import ts from 'rollup-plugin-typescript2'

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
            ts(),
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
            ts(),
        ]
    },
    {
        input: './files/plugins/yuumo.js',
        output: {
            file: './files/plugins/yuumo.ll3/yuumo.ll3.js',
            format: 'cjs'
        },
        plugins: [
            commonjs(),
            nodeResolve(),
            ts(),
        ]
    },
    {
        input: './files/plugins/meisterhau.js',
        output: {
            file: './files/plugins/meisterhau/meisterhau.ll3.js',
            format: 'cjs'
        },
        plugins: [
            commonjs(),
            nodeResolve(),
            ts(),
        ]
    },
]