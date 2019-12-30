import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import {terser} from "rollup-plugin-terser";

export default {
  input: 'src/index.ts', // our source file
  output: [
    {
      file: 'build/rl-loadout-lib.min.js',
      format: 'umd',
      name: 'RocketLoadout', // the global which can be used in a browser,
      globals: {
        three: 'three'
      }
    },
    {
      file: 'build/rl-loadout-lib.js',
      format: 'umd',
      name: 'RocketLoadout', // the global which can be used in a browser,
      globals: {
        three: 'three'
      }
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    'three'
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      tsconfigOverride: {
        compilerOptions: {
          module: 'es2015',
          declaration: false,
          declarationMap: false
        }
      }
    }),
    terser({
      include: [/^.+\.min\.js$/]
    }) // minifies generated bundles
  ]
};
