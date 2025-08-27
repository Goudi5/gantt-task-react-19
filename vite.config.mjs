import image from "@rollup/plugin-image";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  const configuration = {
    plugins: [peerDepsExternal(), react(), image()],
    build: {
      minify: false,
      lib: {
        name: "gantt-task-react",
        entry: path.resolve(__dirname, "src/index.tsx"),
        formats: ["es", "umd"],
        fileName: format => `gantt-task-react.${format}.js`,
      },
    },
    test: {
      environment: "jsdom",
      coverage: {
        reporter: ["text", "html"],
      },
    },
  };
  return configuration;
});
