import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validators";

async function readInput(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return request.json();
  return Object.fromEntries((await request.formData()).entries());
}

export async function GET(request: NextRequest) {
  if (!getAdminFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.storeSetting.findFirst();
  return NextResponse.json({ data: settings });
}

export async function POST(request: NextRequest) {
  return PUT(request);
}

export async function PUT(request: NextRequest) {
  if (!getAdminFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readInput(request);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  const existing = await prisma.storeSetting.findFirst();
  const settings = existing ? await prisma.storeSetting.update({ where: { id: existing.id }, data: parsed.data }) : await prisma.storeSetting.create({ data: parsed.data });
  if ((request.headers.get("content-type") ?? "").includes("application/json")) return NextResponse.json(settings);
  return NextResponse.redirect(new URL("/admin/settings", request.url), { status: 303 });
}
