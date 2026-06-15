export default function Loading() {
  return (
    <main className="bg-white pb-24 sm:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-start lg:py-8">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-[3/4] w-full animate-pulse rounded-md bg-brand-50" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 w-20 animate-pulse rounded-md bg-brand-50" />
            ))}
          </div>
        </div>
        {/* Info */}
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-brand-50" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-brand-50" />
          <div className="h-10 w-40 animate-pulse rounded bg-brand-50" />
          <div className="h-24 w-full animate-pulse rounded bg-brand-50" />
          <div className="h-12 w-full animate-pulse rounded-md bg-brand-50" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-12 animate-pulse rounded-md bg-brand-50" />
            <div className="h-12 animate-pulse rounded-md bg-brand-50" />
          </div>
        </div>
      </div>
    </main>
  );
}
