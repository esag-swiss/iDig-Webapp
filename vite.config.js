import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: "src/quasar-variables.sass",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      // @quasar/vite-plugin injects `@import 'src/quasar-variables.sass'`,
      // a path relative to the project root. Modern Dart Sass no longer
      // resolves the cwd implicitly, so we add it explicitly.
      sass: { loadPaths: [fileURLToPath(new URL(".", import.meta.url))] },
      scss: { loadPaths: [fileURLToPath(new URL(".", import.meta.url))] },
    },
  },
});
