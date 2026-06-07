export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 px-4">
      <form action="/api/admin/login" method="post" className="w-full max-w-md space-y-4 rounded-md bg-white p-6 shadow-soft">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Đăng nhập admin</h1>
          <p className="text-sm text-brand-700">Quản lý sản phẩm, media và đơn hàng.</p>
        </div>
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
        <input className="w-full" name="email" type="email" placeholder="Email" required />
        <input className="w-full" name="password" type="password" placeholder="Mật khẩu" required />
        <button className="w-full rounded-md bg-brand-700 px-4 py-3 font-bold text-white">Đăng nhập</button>
      </form>
    </main>
  );
}
