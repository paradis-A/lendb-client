import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import { terser } from "rollup-plugin-terser";
import builtins from 'rollup-plugin-node-builtins';
import json from "@rollup/plugin-json";
export default {
    input: "lib/index.ts",
    output: [
        {
            file: "dist/index.js",
            name: "index.js",
            format: "es",
        },
    ],
    plugins: [
        commonjs({
            include: "node_modules/**",
            extensions: [".js",".cjs",".ts"],
            ignoreGlobal: false,
            sourceMap: false,
            browser: true
        }),
        builtins({ crypto: true }),
        resolve({
            jsnext: true,
            main: true,browser: true
        }),
        typescript(),
        globals(),
        terser(),
        json(),
    ],
};
