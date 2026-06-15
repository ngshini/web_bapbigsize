export default function Loading() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-brand-100">
              <div className="aspect-[3/4] w-full animate-pulse bg-brand-50" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-full animate-pulse rounded bg-brand-50" />
                <div className="h-6 w-1/2 animate-pulse rounded bg-brand-50" />
                <div className="h-10 w-full animate-pulse rounded-md bg-brand-50" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
