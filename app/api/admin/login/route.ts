import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { setAdminCookie, signAdminToken, verifyPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await request.json() : Object.fromEntries((await request.formData()).entries());
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Email hoặc mật khẩu không hợp lệ" }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || user.role !== "ADMIN" || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Sai thông tin đăng nhập" }, { status: 401 });
    }

    await setAdminCookie(signAdminToken({ sub: user.id, email: user.email, role: user.role }));
    if (contentType.includes("application/json")) return NextResponse.json({ ok: true });
    return NextResponse.redirect(new URL("/admin/dashboard", request.url), { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const isConfigError = message.includes("DATABASE_URL") || message.includes("JWT_SECRET");
    const errorMessage = isConfigError ? "Chưa cấu hình DATABASE_URL hoặc JWT_SECRET trong .env.local" : "Không thể đăng nhập. Vui lòng kiểm tra cấu hình server.";

    if (contentType.includes("application/json")) {
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const redirectUrl = new URL("/admin/login", request.url);
    redirectUrl.searchParams.set("error", errorMessage);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }
}
