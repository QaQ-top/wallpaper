interface PropValue<T> {
  icon?: string;
  key?: string;
  order: number;
  text: string;
  type: string;
  /**
   * 用户操作后的当前属性的值
   */
  value: T
}

interface PropertiesConfigProps {
  /**
   * 主题配色
   */
  customcolor: PropValue<string>;
  customslider?: PropValue<number>;
  customcheckbox?: PropValue<boolean>;
  customcombo?: PropValue<string>;
  customtext?: PropValue<string>;
  customimage?: PropValue<string>;
  customrandomdirectory?: PropValue<string>;
}


/**
 * 用户更新 配置项时 wallpaper 更新的结果
 */
interface defaultUserProp extends PropertiesConfigProps {
  /**
   * 显示颜色选项
   */
  wec_e: PropValue<boolean>;
  /**
   * 亮度
   */
  wec_brs: PropValue<number>;
  /**
   * 对比度
   */
  wec_con: PropValue<number>;
  /**
   * 饱和度
   */
   wec_sa: PropValue<number>;
  /**
   * 色调偏移
   */
  wec_hue: PropValue<number>;
  /**
   * 翻转
   */
  alignmentfliph: PropValue<boolean>;
}

interface Window {
  wallpaperPropertyListener: {
    /**
     * wallpaper 壁纸配置界面有更新时 触发该方法
     */
    applyUserProperties?: (prop: defaultUserProp) => void;
    userDirectoryFilesAddedOrChanged?: (key: string, changeFiles: string[]) => void;
    userDirectoryFilesRemoved?: (key: string, removeFiles: string[]) => void;
    applyGeneralProperties?: (prop: { fps: number}) => void;
    onPluginLoaded?: (name: 'led' | 'cue', version: string)  => void;
  };
  wallpaperRequestRandomFileForProperty: (event: "customrandomdirectory", callback: (key: string, filePath: string) => void) => void;
  wallpaperRegisterAudioListener: (callback: (audios: number[]) => void) => void;
}