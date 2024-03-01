import { defineConfig } from "vite";
import WallpaperConfig from "./config";

import vue from "@vitejs/plugin-vue";
import wallpaper from "./plugins/compatible-wallpaper";

import { resolve } from "path";

export default defineConfig(async () => {
  const [wallpaperConfig, wallpaper_engine_projects_path] =
    await WallpaperConfig;
  return {
    base: "./",
    define: {
      GLOBAL_ENV: JSON.stringify(process.env.GLOBAL_ENV),
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    plugins: [
      vue(),
      wallpaper({
        compatible: {
          targets: "ie >= 11",
        },
        outFiles: [
          {
            filename: "project.json",
            content: wallpaperConfig,
          },
        ],
      }),
    ],
    build:
      process.env.GLOBAL_ENV === "local"
        ? undefined
        : {
            // wallpaper_engine 创建项目的地址
            outDir: wallpaper_engine_projects_path,
          },
  };
});
