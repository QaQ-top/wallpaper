import { Plugin, IndexHtmlTransformResult, HtmlTagDescriptor } from 'vite';
import legacy, { Options } from '@vitejs/plugin-legacy';

/**
 * Wallpaper 是下载 壁纸直接运行
 * file协议下，script module 会跨域
 * 直接开启兼容性模式，保证能在 file协议 执行
 */
function deleteNoModule(result: HtmlTagDescriptor[]) {
  result.forEach(i => {
    if (i.tag === 'script') {
      i.attrs.nomodule && delete i.attrs.nomodule;
    }
  });
  return result;
}

function compatibleWallpaper(result: IndexHtmlTransformResult | Promise<void | IndexHtmlTransformResult>): IndexHtmlTransformResult | Promise<void | IndexHtmlTransformResult> {

  const getWallpaperResult = (result: IndexHtmlTransformResult) => {
    if (result instanceof Array) {
      return deleteNoModule(result);
    }
    if (result instanceof Object) {
      return deleteNoModule(result.tags);
    }
    return result;
  }
  if (result instanceof Promise) {
    return result.then(res => {
      return res ? getWallpaperResult(res) : res;
    });
  } else {
    return getWallpaperResult(result)
  }

}

export default function (options: Options) {
  const plugins = legacy(options) as unknown as Plugin[];

  plugins.forEach(i => {
    if (i.name === 'legacy-post-process' && i.transformIndexHtml) {
      if (typeof i.transformIndexHtml === 'function') {
        const indexHtmlTransform = i.transformIndexHtml;
        i.transformIndexHtml = (html, ctx) => {
          const result = indexHtmlTransform(html, ctx);
          return result ? compatibleWallpaper(result) : result;
        }
      } else {
        const transform = i.transformIndexHtml.transform
        i.transformIndexHtml.transform = (html, ctx) => {
          const result = transform(html, ctx);
          return result ? compatibleWallpaper(result) : result;
        }
      }
    }
  });
  return plugins;
};
