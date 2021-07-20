/// <reference types="./wallpaper" />
import { name } from '../package.json';

/**
 * Wallpaper 提供给用户自定义的一些配置项
 */
interface SchemeConfigProps {
  /**
   * 主题配色默认配置
   */
  schemecolor?: PropValue<string>;
  schemeslider?: PropValue<number>;
  schemecheckbox?: PropValue<boolean>;
  schemecombo?: PropValue<string>;
  schemetext?: PropValue<string>;
  schemeimage?: PropValue<string>;
  schemerandomdirectory?: PropValue<string>;
}

/**
 * wallpaper 系统配置项
 */
export interface WallpaperConfig {
  /**
   * 壁纸名称
   */
  title: string;
  /**
   * 壁纸类型
   */
  type: "Web",
  /**
   * 壁纸封面
   */
  preview?: string,
  /**
   * 入口文件 (index.html)
   */
  file: string;
  /**
   * 壁纸 属性配置项
   */
  general?: {
    properties?: SchemeConfigProps;
    supportsaudioprocessing?: boolean;
  }
}

/**
 * 根据自己 wallpaper 安装的世界路径配置(进行改代)
 */
const wallpaperPath = "D:\\Steam\\steamapps\\common\\wallpaper_engine\\projects\\myprojects";
/**
 * 壁纸名称(同步到 steam 社区)
 */
const projectName = "";


/**
 * 根据环境变量生成 最终壁纸 配置项与构建路径
 */
function getConfig(config: WallpaperConfig): [WallpaperConfig, string] {
  
  let createFilename = "dev";

  // 定义发布时的名称和发布构建的路径
  if(process.env.GLOBAL_ENV === "prod") {
    config.title = projectName || name;
    createFilename = new Function(`return ${[...config.title].map(i => i.charCodeAt(0)).join("+")}`)();
  }

  return [config, `${wallpaperPath}\\${createFilename}`]
}


const [wallpaperConfig, buildPath] = getConfig({
  title: "dev",
  type: "Web",
  file: "index.html",
  general: {
    properties: {
      schemecolor: {
        order: 0,
        text: "ui_browse_properties_scheme_color",
        type: "color",
        value: "0 0 0"
      }
    },
    supportsaudioprocessing: true
  },
})


export default wallpaperConfig;
export const wallpaper_engine_projects_path = buildPath;