import { loadEnv, defineConfig } from "vite";
import { resolve } from "path";
import glsl from "vite-plugin-glsl";

// import { entryReplacementPlugin } from "@packages/plugins/vite";
// console.log(entryReplacementPlugin);
const config = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [entryReplacementPlugin(env.VITE_ENTRY), glsl()],
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
