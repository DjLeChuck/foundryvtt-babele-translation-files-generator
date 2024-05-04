import commonjs from '@rollup/plugin-commonjs';
import sass from 'rollup-plugin-sass';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';

export default {
  input: './scripts/btfg.mjs',
  output: {
    file: 'assets/btfg.js',
    format: 'es',
  },
  plugins: [
    commonjs(),
    sass({
      output: true,
      processor: css => postcss([autoprefixer])
        .process(css, { from: './assets/btfg.css' })
        .then(result => result.css),
    }),
  ],
  watch: ['module/', 'scss/'],
};
