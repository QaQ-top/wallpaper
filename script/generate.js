const {
  readFile,
  writeFile,
  appendFileSync,
  existsSync,
  readdirSync,
  statSync,
  unlinkSync,
  rmdirSync,
} = require("fs");
const readline = require("readline");
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
        const [isClear] = txt.match(/(?<=clearCache\s*=\s*)(true|false)/) || [
          null,
        ];
        if (isClear == "true") {
          deleteDir(defaultPath);
        } else if (isClear == null) {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          rl.question(
            `存在上一次构建的缓存，在${defaultPath.replace(
              /\\\\/g,
              "/"
            )}，是否删除？ Y(yes) N(no)`,
            (answer) => {
              answer = answer.trim();
              console.log(`输入结果: ${answer}！`);
              if (answer == "Y") {
                deleteDir(defaultPath);
                rl.close();
              } else if (answer == "N") {
                appendFileSync(
                  localPath,
                  `\r\nexport const clearCache = false;`
                );
                rl.close();
              }
            }
          );
        }
      }
    }
  }
});
