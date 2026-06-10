type Guide = {
  id: string;
  size: string;
  weightRange: string;
  bustRange: string;
  waistRange: string;
  hipRange: string;
};

export function SizeGuide({ guides }: { guides: Guide[]; imageUrl?: string | null }) {
  return (
    <section id="bang-size" className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Chọn size</p>
        <h2 className="text-xl font-bold text-brand-900 sm:text-2xl">Bảng size đồ bộ bigsize</h2>
      </div>
      <div className="-mx-4 overflow-x-auto rounded-md border border-brand-100 bg-white shadow-sm sm:mx-0">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-brand-50 text-brand-900">
            <tr>
              <th className="p-3">Size</th>
              <th className="p-3">Cân nặng</th>
              <th className="p-3">Vòng ngực</th>
              <th className="p-3">Eo</th>
              <th className="p-3">Vòng mông</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id} className="border-t border-brand-100">
                <td className="p-3 font-bold text-brand-700">{guide.size}</td>
                <td className="p-3">{guide.weightRange}</td>
                <td className="p-3">{guide.bustRange}</td>
                <td className="p-3">{guide.waistRange}</td>
                <td className="p-3">{guide.hipRange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
