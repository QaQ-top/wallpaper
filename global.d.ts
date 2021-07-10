/// <reference types="vite/client" />
/// <reference types="./config/wallpaper" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare const GLOBAL_ENV: "dev" | "prod";

interface ProcessEnv {
  GLOBAL_ENV: "dev" | "prod";
}
