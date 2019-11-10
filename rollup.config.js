import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import serve from 'rollup-plugin-serve'
import replace from '@rollup/plugin-replace'

import pkg from './package.json'

const commonJsConfig = {
  include: 'node_modules/**',
  namedExports: {
    react: [
      'createContext',
      'useContext',
      'useEffect',
      'useMemo',
      'useState'
    ]
  }
}

export default [
  {
    input: 'src/index.js',
    external: ['react', 'prop-types'],
    output: [
      {
        file: pkg.main,
        format: 'cjs'
      },
      {
        file: pkg.module,
        format: 'esm'
      }
    ],
    plugins: [
      commonjs(commonJsConfig),
      peerDepsExternal(),
      resolve(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  },
  {
    input: 'example/index.js',
    output: {
      file: 'dist/demo.js',
      format: 'cjs'
    },
    plugins: [
      commonjs(commonJsConfig),
      resolve(),
      babel({
        exclude: 'node_modules/**'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      serve({
        contentBase: ['dist', 'example']
      })
    ]
  }
]
