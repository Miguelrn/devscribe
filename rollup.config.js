import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "@rollup/plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import css from 'rollup-plugin-css-only';
import path from "path";
import fs from "fs";

const production = !process.env.ROLLUP_WATCH;

export default fs
  .readdirSync(path.join(__dirname, "webviews", "pages"))
  .map((input) => {
    const name = input.split(".")[0];
    return {
      input: "webviews/pages/" + input,
      output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "out/compiled/" + name + ".js",
      },
      plugins: [
        svelte({
          // enable run-time checks when not in production
          dev: !production,
          // we'll extract any component CSS out into
          // a separate file - better for performance
          css: css(),
          preprocess: sveltePreprocess(),

          // Emit CSS as "files" for other plugins to process. default is true
          emitCss: false,

          // Warnings are normally passed straight to Rollup. You can
          // optionally handle them here, for example to squelch
          // warnings with a particular code
          onwarn: (warning, handler) => {
            // e.g. don't warn on <marquee> elements, cos they're cool
            if (warning.code === 'a11y-distracting-elements') {return;}

            // let Rollup handle all other warnings normally
            handler(warning);
          },

          // You can pass any of the Svelte compiler options
          // compilerOptions: {

          //   // By default, the client-side compiler is used. You
          //   // can also use the server-side rendering compiler
          //   generate: 'ssr',

          //   // ensure that extra attributes are added to head
          //   // elements for hydration (used with generate: 'ssr')
          //   hydratable: true,

          //   // You can optionally set 'customElement' to 'true' to compile
          //   // your components to custom elements (aka web elements)
          //   customElement: false
          // }
        }),
        // see NOTICE below
        resolve({
          browser: true,
          dedupe: ["svelte"],
                  }),
        commonjs(),
        typescript({
          tsconfig: "webviews/tsconfig.json",
          sourceMap: !production,
          inlineSources: !production,
        }),

        production && terser(),
              ],
      watch: {
        clearScreen: false,
      },
    };
  });
