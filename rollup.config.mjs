import * as pkg from './package.json';
import typescript from '@rollup/plugin-typescript';
import shader from 'rollup-plugin-shader';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { defineConfig } from 'rollup';

// eslint-disable-next-line no-undef
const mode = process.env.MODE;
const isProd = mode === 'prod';

export default defineConfig({
  input: `src/index.ts`,
  external: ['cesium', '@turf/turf', 'mitt', 'heatmap.js'],
  output: [
    {
      file: pkg.main,
      exports: 'named',
      format: 'cjs',
      sourcemap: !isProd
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: !isProd
    },
    {
      file: 'dist/index.global.js',
      name: 'EarthEngine',
      format: 'iife',
      sourcemap: !isProd,
      globals: {
        cesium: 'Cesium',
        '@turf/turf': 'Turf',
        mitt: 'Mitt',
        'heatmap.js': 'Heatmap'
      }
    }
  ],
  plugins: [typescript(), shader(), nodeResolve(), commonjs(), terser()]
});
