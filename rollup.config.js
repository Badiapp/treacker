import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

import pkg from './package.json'

const commonJsConfig = {
  include: 'node_modules/**',
  namedExports: {
    react: [
      'createContext',
      'useContext',
      'useEffect',
      'useMemo'
    ]
  }
}

export default {
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
}
