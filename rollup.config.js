import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs"
    },
    {
      file: "dist/index.umd.js",
      format: "umd",
      name: "TEMP_UMD_MODULE_NAME_CHANGE_ME"
    },
    {
      file: "dist/index.esm.js",
      format: "esm"
    }
  ],
  plugins: [
    typescript({
      typescript: require("typescript"),
      abortOnError: false,
      tsconfigOverride: {
        compilerOptions: {
          module: "ES2015"
        }
      }
    })
  ]
};
