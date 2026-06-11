import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, customerName, rating, comment, imageUrl } = body;

    if (!productId || !customerName || !rating) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Đánh giá phải từ 1 đến 5 sao" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        customerName: customerName.trim(),
        rating: Number(rating),
        comment: comment?.trim() || null,
        imageUrl: imageUrl || null,
        isVisible: true
      }
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Không thể gửi đánh giá" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Thiếu productId" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { productId, isVisible: true },
      orderBy: { createdAt: "desc" }
    });

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({ reviews, avgRating, total: reviews.length });
  } catch {
    return NextResponse.json({ reviews: [], avgRating: 0, total: 0 });
  }
}
