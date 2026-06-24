// Skeleton chỉ cho vùng nội dung — sidebar từ layout giữ nguyên nên chuyển trang thấy tức thì.
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-md bg-white p-5 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-7 w-20 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="rounded-md bg-white p-5 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
