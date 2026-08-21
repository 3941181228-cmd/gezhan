// 图片批量优化:PNG → WebP(缩放最长边1200px,质量80)
// 作品集网格展示宽度约300-600px,1200px 够 2x 高 DPI;超长截图(如 3860x12302)缩放后体积大降
import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import { join } from "path";

const cats = ["beiqi", "carlot", "guangfeng", "ip", "linglong"];
let pngTotal = 0, webpTotal = 0, count = 0;

for (const cat of cats) {
  const dir = join("public/works", cat);
  let files;
  try { files = await readdir(dir); } catch { console.log(`跳过 ${cat}(目录不存在)`); continue; }
  const pngs = files.filter(f => f.endsWith(".png"));
  let catPng = 0, catWebp = 0;
  for (const f of pngs) {
    const src = join(dir, f);
    const out = join(dir, f.replace(/\.png$/, ".webp"));
    await sharp(src)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(out);
    const s = (await stat(src)).size, o = (await stat(out)).size;
    pngTotal += s; webpTotal += o; catPng += s; catWebp += o; count++;
  }
  console.log(`${cat}: ${pngs.length}张  ${(catPng/1048576).toFixed(1)}M → ${(catWebp/1048576).toFixed(1)}M`);
}
console.log(`---`);
console.log(`合计 ${count}张: PNG ${(pngTotal/1048576).toFixed(1)}M → WebP ${(webpTotal/1048576).toFixed(1)}M (压缩率 ${((1-webpTotal/pngTotal)*100).toFixed(0)}%)`);
