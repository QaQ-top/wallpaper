import { Plugin, IndexHtmlTransformResult, IndexHtmlTransformHook, HtmlTagDescriptor } from 'vite';
import legacy, { Options } from '@vitejs/plugin-legacy';

/**
 * Wallpaper 是下载 壁纸直接运行
 * file协议下，script module 会跨域
 * 直接开启兼容性模式，保证能在 file协议 执行
 */
function deleteNoModule(result: HtmlTagDescriptor[]) {
  result.forEach(i => {
    if (i.tag === 'script') {
      if(i.attrs) {
        i.attrs.nomodule && delete i.attrs.nomodule;
      }
    }
  });
  return result;
}

/**
 * 删除 html 无用脚本引入
 */
function deleteTags(html: string) {
  const matchTags = /\<script\stype\=\"module\"\scrossorigin.+\s.+\.js\">\s+/
  return html.replace(matchTags, '');
}

/**
 * 处理结果
 */
function compatibleWallpaper(result: IndexHtmlTransformResult | Promise<void | IndexHtmlTransformResult>): IndexHtmlTransformResult | Promise<void | IndexHtmlTransformResult> {

  const getWallpaperResult = (result: IndexHtmlTransformResult) => {
    if (result instanceof Array) {
      return deleteNoModule(result);
    }
    if (result instanceof Object) {
      return {
        ...result,
        tags: deleteNoModule(result.tags),
      };
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

/**
 * 生成切片函数
 */
function generateHandle(indexHtmlTransform: IndexHtmlTransformHook) {
  return (html, ctx) => {
    const result = indexHtmlTransform(deleteTags(html), ctx);
    return result ? compatibleWallpaper(result) : result;
  }
}

interface outFile {
  filename: string;
  content: { [k: string]: any } | Uint8Array;
}

interface WallpaperOptions {
  compatible?: Options
  outFiles?: outFile[]
}


export default function (options: WallpaperOptions): Plugin[] {
  let plugins = legacy(options.compatible) as unknown as Plugin[];
  plugins.some(i => {
    if (i.name === 'vite:legacy-post-process' && i.transformIndexHtml) {
      if (typeof i.transformIndexHtml === 'function') {
        const indexHtmlTransform = i.transformIndexHtml;
        i.transformIndexHtml = generateHandle(indexHtmlTransform)
      } else {
        const transform = i.transformIndexHtml.transform
        i.transformIndexHtml.transform = generateHandle(transform)
      }
      return true;
    }
    return false;
  });

  plugins = [
    ...plugins,
    {
      name: 'wallpaper-optimise-build',
      enforce: 'post',
      apply: 'build',
      generateBundle(outputOptions, bundle) {
        Object.entries(bundle).some(([key, value]) => {
          const buildFilename = value.fileName.split("/").pop()!.split(".").shift();
          if(value.name === 'index' && buildFilename === "index") {
            // 删除 module 引入的文件 chunk，file协议无法使用。
            delete bundle[key];
            return true;
          }
          return false;
        })
      }
    },
  ];
  
  if(options.outFiles) {
    plugins.push({
      name: 'wallpaper-generate-config',
      enforce: 'post',
      apply: 'build',
      generateBundle(outputOptions, bundle) {
        if (options) {
          const filenames = Object.keys(bundle);
          options.outFiles?.forEach(option => {
            const fileName = option.filename;
            if (!filenames.includes(fileName)) {
              this.emitFile({
                type: 'asset',
                fileName,
                source: JSON.stringify(option.content)
              });
            }
          });
        }
      }
    })
  }
  return plugins
};
