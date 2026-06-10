import fs from "node:fs";
import path from "node:path";
import { getPublicPictureDir, listPictureFiles } from "../lib/media";

const targetDir = getPublicPictureDir();
fs.mkdirSync(targetDir, { recursive: true });

const files = listPictureFiles();
for (const file of files) {
  fs.copyFileSync(file.sourcePath, path.join(targetDir, file.fileName));
}

console.log(`Copied ${files.length} media files to public/picture.`);
