import { loadEnv, defineConfig } from "vite";
import { resolve } from "path";
import glsl from "vite-plugin-glsl";
import topLevelAwait from "vite-plugin-top-level-await";

// import { entryReplacementPlugin } from "@packages/plugins/vite";
// console.log(entryReplacementPlugin);
const config = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      entryReplacementPlugin(env.VITE_ENTRY),
      glsl(),

      topLevelAwait({
        promiseExportName: "__tla",
        promiseImportName: (i) => `__tla_${i}`,
      }),
    ],
    assetsInclude: ["**/*.glb"],
    resolve: {
      alias: {
        "three/addons": "three/examples/jsm",
        "three/tsl": "three/tsl",
      },
    },
  };
});

export default config;

function entryReplacementPlugin(entry) {
  return {
    name: "vite-plugin-entry-replacement",

    transformIndexHtml(html) {
      return html.replace("%ENTRY_SCRIPT%", resolve(__dirname, entry));
    },
  };
}
