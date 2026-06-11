"use client";

import { FormEvent, useState } from "react";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";

type Review = {
  id: string;
  customerName: string;
  rating: number;
  comment?: string | null;
  imageUrl?: string | null;
  isVisible: boolean;
  createdAt: string | Date;
};

type ProductReviewsProps = {
  productId: string;
  initialReviews: Review[];
  avgRating: number;
};

function StarRating({ rating, max = 5, size = 18, interactive = false, onChange }: {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = interactive ? (hover || rating) > i : rating > i;
        return (
          <Star
            key={i}
            size={size}
            className={`transition ${filled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
            onClick={() => interactive && onChange?.(i + 1)}
            onMouseEnter={() => interactive && setHover(i + 1)}
            onMouseLeave={() => interactive && setHover(0)}
          />
        );
      })}
    </div>
  );
}

export function ProductReviews({ productId, initialReviews, avgRating }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [avg, setAvg] = useState(avgRating);
  const [form, setForm] = useState({ customerName: "", rating: 5, comment: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.customerName.trim()) {
      setMessage("Vui lòng nhập tên của bạn");
      return;
    }
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, ...form })
    });
    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      const newReview: Review = {
        id: data.review.id,
        customerName: form.customerName,
        rating: form.rating,
        comment: form.comment || null,
        imageUrl: null,
        isVisible: true,
        createdAt: new Date()
      };
      setReviews((prev) => [newReview, ...prev]);
      setAvg((prev) => {
        const total = prev * (reviews.length) + form.rating;
        return total / (reviews.length + 1);
      });
      setForm({ customerName: "", rating: 5, comment: "" });
      setMessage("Cảm ơn bạn đã đánh giá! ⭐");
      setShowForm(false);
    } else {
      setMessage(data.error ?? "Không thể gửi đánh giá");
    }
  }

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length
  }));

  return (
    <section id="danh-gia" className="mx-auto max-w-6xl px-4 pb-12">
      <div className="rounded-md border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        {/* Tiêu đề */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={24} className="text-brand-700" />
            <h2 className="text-xl font-bold text-brand-900">
              Đánh giá sản phẩm
              {reviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">({reviews.length} đánh giá)</span>
              )}
            </h2>
          </div>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900"
          >
            <Star size={16} />
            {showForm ? "Đóng" : "Viết đánh giá"}
          </button>
        </div>

        {/* Tổng điểm */}
        {reviews.length > 0 && (
          <div className="mt-5 flex flex-col gap-5 rounded-md bg-brand-50 p-4 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-5xl font-bold text-brand-900">{avg.toFixed(1)}</p>
              <StarRating rating={Math.round(avg)} size={20} />
              <p className="text-sm text-slate-500">{reviews.length} đánh giá</p>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              {ratingDist.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-right text-slate-600">{star}</span>
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="w-5 text-slate-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form viết đánh giá */}
        {showForm && (
          <form onSubmit={submit} className="mt-5 rounded-md border border-brand-100 bg-brand-50 p-4">
            <p className="font-bold text-brand-900">Chia sẻ đánh giá của bạn</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Đánh giá của bạn *</label>
                <StarRating
                  rating={form.rating}
                  size={32}
                  interactive
                  onChange={(r) => setForm({ ...form, rating: r })}
                />
              </div>

              <input
                required
                placeholder="Tên của bạn *"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              />

              <textarea
                placeholder="Nhận xét của bạn về sản phẩm (không bắt buộc)"
                rows={3}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full resize-none rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              />

              {message && (
                <p className={`rounded-md p-3 text-sm font-semibold ${message.includes("Cảm ơn") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-brand-700 py-3 font-bold text-white transition hover:bg-brand-900 disabled:opacity-60"
              >
                {loading ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        )}

        {/* Danh sách đánh giá */}
        {reviews.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center text-slate-400">
            <ThumbsUp size={40} className="text-slate-200" />
            <p className="font-semibold">Chưa có đánh giá nào</p>
            <p className="text-sm">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-brand-50">
            {reviews.map((review) => (
              <div key={review.id} className="py-4 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-900">{review.customerName}</p>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                  </div>
                  <p className="shrink-0 text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                {review.comment && (
                  <p className="mt-2 pl-13 text-sm leading-6 text-slate-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
