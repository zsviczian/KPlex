import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import { env } from "process";

const DIST_FOLDER = 'dist';
const isProd = (process.env.NODE_ENV === "production");
console.log(`Building for ${isProd ? "production" : "development"}`);

export default {
  input: "src/index.ts",
  output: {
    file: `${DIST_FOLDER}/main.js`,
    format: "cjs",
    exports: "default",
    SourceMap: !isProd, 
  },
  external: ["obsidian", "fs", "os", "path"],
  plugins: [
    typescript({
      sourceMap: !isProd,
    }),
    resolve({
      browser: true,
    }),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ["@babel/preset-react", "@babel/preset-typescript"],
    }),
    commonjs(),
    ...(isProd 
      ? [
        terser({
          toplevel: false,
          compress: { passes: 2 },
          format: {
            comments: false, // Remove all comments
          },
        })] 
      : []
    ),
    copy({
      targets: [
        { src: 'manifest.json', dest: DIST_FOLDER },
        { src: 'styles.css', dest: DIST_FOLDER }
      ],
      verbose: true,
    }),
  ],
};
