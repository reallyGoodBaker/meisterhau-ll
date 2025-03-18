'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var commonjs = require('@rollup/plugin-commonjs');
var pluginNodeResolve = require('@rollup/plugin-node-resolve');
var ts = require('@rollup/plugin-typescript');
var rollupPluginTypescriptPaths = require('rollup-plugin-typescript-paths');
var json = require('@rollup/plugin-json');

var rollup_config = [
    {
        input: './files/plugins/yuumo.js',
        output: {
            file: './build/yuumo.ll3/yuumo.ll3.js',
            format: 'cjs',
        },
        plugins: [
            commonjs(),
            pluginNodeResolve.nodeResolve(),
            ts(),
            rollupPluginTypescriptPaths.typescriptPaths(),
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
            pluginNodeResolve.nodeResolve(),
            ts(),
            rollupPluginTypescriptPaths.typescriptPaths(),
            json(),
        ]
    }
];

exports.default = rollup_config;
