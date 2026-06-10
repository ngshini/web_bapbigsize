import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { getPublicPictureDir, listPictureFiles } from "@/lib/media";

export async function POST(request: NextRequest) {
  if (!getAdminFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  fs.mkdirSync(getPublicPictureDir(), { recursive: true });
  const files = listPictureFiles();
  for (const file of files) {
    fs.copyFileSync(file.sourcePath, `${getPublicPictureDir()}/${file.fileName}`);
  }
  return NextResponse.json({ copied: files.length });
}
