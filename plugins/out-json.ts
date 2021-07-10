import { Plugin } from 'vite';

interface Options {
  filename: string;
  content: any;
}

export default function (options: Options[]): Plugin{
  return {
    name: "out-json",
    enforce: 'post',
    apply: 'build',
    generateBundle(outputOptions, bundle) {
      const filenames = Object.keys(bundle);
      options.forEach(option => {
        const fileName = option.filename;
        if(!filenames.includes(fileName)) {
          this.emitFile({
            type: 'asset',
            fileName,
            source: JSON.stringify(option.content)
         });
        }
      });
    }
  };
};
