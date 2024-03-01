const {
  readFile,
  writeFile,
  existsSync,
  readdirSync,
  statSync,
  unlinkSync,
  rmdirSync,
} = require("fs");
const { resolve, join } = require("path");
const localPath = resolve(__dirname, "../config/.local.ts");
const defaultPath = "C:\\\\Users\\\\wallpaper_engine_0527";

const deleteDir = (dir) => {
  const list = readdirSync(dir);
  list.forEach((el) => {
    const subDir = join(dir, el);
    if (statSync(subDir).isDirectory()) {
      deleteDir(subDir);
    } else {
      unlinkSync(subDir);
    }
  });
  rmdirSync(dir);
};

readFile(localPath, (err, data) => {
  if (err) {
    writeFile(
      localPath,
      `/** 根据自己的喜欢自定义打包路径 **/\r\nexport const wallpaperDefaultPath = "${defaultPath}";
      `,
      (err) => {
        if (!err) {
          console.log("generate .local");
        } else {
          console.log(err);
        }
      }
    );
  } else {
    const txt = data.toString();
    if (!txt.includes(defaultPath)) {
      const isExist = existsSync(defaultPath);
      if (isExist) {
        // [TODO] 可添加 控制台对话 询问开发者是否删除
        deleteDir(defaultPath);
      }
    }
  }
});
