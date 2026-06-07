# Tổng kho đồ bộ miền Nam - Bắp Bigsize

Website bán đồ bộ nữ bigsize, có trang bán hàng, trang chi tiết sản phẩm, giỏ hàng, admin quản lý sản phẩm/đơn hàng, Supabase PostgreSQL/Storage và thanh toán sandbox VNPAY/MoMo.

## Đã làm trong dự án

- Xây dựng website bán hàng bằng Next.js App Router, TypeScript, Tailwind CSS.
- Kết nối Supabase PostgreSQL bằng Prisma.
- Kết nối Supabase Storage để lưu ảnh/video sản phẩm.
- Tạo trang chủ theo kiểu web bán hàng.
- Tạo trang danh sách sản phẩm `/san-pham`.
- Tạo trang chi tiết sản phẩm `/san-pham/[slug]`.
- Thêm gallery ảnh/video, có nút chuyển ảnh trái/phải.
- Thêm chọn màu, chọn size, tăng/giảm số lượng, thêm vào giỏ, mua ngay.
- Thêm icon giỏ hàng trên header, có badge số lượng.
- Thêm trang giỏ hàng `/gio-hang`, thanh toán nhiều sản phẩm trong một đơn.
- Thêm form đặt hàng gồm tên, số điện thoại, địa chỉ, tỉnh/thành, quận/huyện, phường/xã, ghi chú.
- Thêm admin login, dashboard, quản lý sản phẩm, media, đơn hàng, cài đặt shop.
- Thêm địa chỉ khách hàng và mã hàng trong bảng đơn hàng admin.
- Thêm sản phẩm H02 và media sản phẩm.
- Thêm logo shop.
- Thiết kế footer theo layout nhiều cột, tông hồng pastel.
- Thêm thanh toán COD, VNPAY sandbox, MoMo sandbox.
- Thêm callback/return VNPAY và MoMo.
- Thêm IPN endpoint cho VNPAY và MoMo.

## Công nghệ

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- Supabase PostgreSQL
- Supabase Storage
- Zod
- JWT admin auth
- VNPAY sandbox
- MoMo sandbox

## Cấu trúc chính

```txt
app/
  page.tsx                         Trang chủ
  san-pham/page.tsx                Danh sách sản phẩm
  san-pham/[slug]/page.tsx         Chi tiết sản phẩm
  gio-hang/page.tsx                Giỏ hàng/thanh toán
  admin/...                        Trang quản trị
  api/orders                       Tạo đơn hàng COD/giỏ hàng
  api/payments/vnpay               Tạo thanh toán VNPAY
  api/payments/vnpay/ipn           IPN VNPAY
  api/payments/momo                Tạo thanh toán MoMo
  api/payments/momo/ipn            IPN MoMo
  thanh-toan/vnpay                 Trang khách quay lại sau VNPAY
  thanh-toan/momo                  Trang khách quay lại sau MoMo

components/public/                 Component giao diện khách hàng
components/admin/                  Component admin
lib/                               Prisma, Supabase, validators, helpers
prisma/schema.prisma               Schema database
prisma/seed.ts                     Seed dữ liệu mẫu/admin/sản phẩm
scripts/upload-media-to-supabase.ts Upload media lên Supabase Storage
picture/                           Ảnh/video gốc local
```

## Cài đặt local

Yêu cầu:

- Node.js 20+
- npm
- Tài khoản Supabase

Cài dependencies:

```bash
npm install
```

Tạo file môi trường:

```bash
cp .env.example .env.local
```

Sau đó điền biến môi trường vào `.env.local`.

## Biến môi trường

Không commit `.env` hoặc `.env.local` lên GitHub.

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=

VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
```

Giải thích nhanh:

- `DATABASE_URL`: Supabase Postgres transaction pooler, dùng cho app.
- `DIRECT_URL`: Supabase Postgres session pooler, dùng cho migration/db push.
- `NEXT_PUBLIC_SUPABASE_URL`: URL Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable/anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: secret key server-side để upload Storage.
- `JWT_SECRET`: chuỗi bí mật để ký token admin.
- `NEXT_PUBLIC_SITE_URL`: URL website. Local dùng `http://localhost:3000`.
- `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`: thông tin VNPAY sandbox.
- `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`: thông tin MoMo sandbox.

## Đưa database lên Supabase

1. Tạo project Supabase.
2. Vào Supabase Dashboard, lấy connection string.
3. Dùng pooler như sau:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@...pooler.supabase.com:5432/postgres"
```

Nếu mật khẩu có ký tự đặc biệt như `@`, phải encode thành `%40`.

Ví dụ:

```txt
matkhau@123  ->  matkhau%40123
```

4. Đẩy schema Prisma lên Supabase:

```bash
npx prisma db push
```

5. Generate Prisma Client:

```bash
npm run prisma:generate
```

6. Seed dữ liệu mẫu:

```bash
npm run prisma:seed
```

Sau bước này database sẽ có:

- Admin mặc định.
- Cài đặt shop.
- Sản phẩm H01/H02.
- Biến thể size/màu.
- Khuyến mãi combo.
- Bảng size.

## Supabase Storage

Website dùng bucket:

```txt
product-media
```

Script upload sẽ tự tạo bucket nếu chưa có quyền/tồn tại.

Đặt ảnh/video vào thư mục:

```txt
picture/
```

Upload media lên Supabase:

```bash
npm run media:upload
```

Nếu chỉ muốn chạy fallback local:

```bash
npm run media:sync
```

Quy ước file:

- `logo.jpg`: logo shop.
- File có tên liên quan `size`, `bangsize`: bảng size.
- File H01/H02: ảnh/video sản phẩm.
- Video hỗ trợ `.mp4`, `.mov`, `.webm`.
- Ảnh hỗ trợ `.jpg`, `.jpeg`, `.png`, `.webp`.

## Chạy dự án

Chạy dev:

```bash
npm run dev
```

Mở:

```txt
http://localhost:3000
```

Build production:

```bash
npm run build
```

Chạy production local sau build:

```bash
npm run start
```

Nếu Next.js bị cache lạ, dừng server rồi xoá cache:

```bash
rm -rf .next
npm run dev
```

## Tài khoản admin

Sau khi chạy seed:

```txt
URL: /admin/login
Email: admin@bapbigsize.local
Mật khẩu: Admin@123456
```

Các trang admin:

- `/admin/dashboard`: tổng quan.
- `/admin/products`: danh sách sản phẩm.
- `/admin/products/create`: thêm sản phẩm.
- `/admin/products/[id]/edit`: sửa sản phẩm.
- `/admin/orders`: quản lý đơn hàng.
- `/admin/settings`: cài đặt shop/logo/SĐT/email/Zalo.

## Luồng mua hàng

1. Khách vào trang sản phẩm.
2. Chọn màu, size, số lượng.
3. Bấm `Thêm vào giỏ`.
4. Icon giỏ hàng trên header cập nhật số lượng.
5. Khách vào `/gio-hang`.
6. Nhập thông tin nhận hàng.
7. Chọn thanh toán:
   - COD
   - MoMo sandbox
   - VNPAY sandbox
8. Đơn hàng được lưu vào admin.

## Thanh toán COD

COD hoạt động ngay, không cần key bên ngoài.

Khi khách bấm thanh toán COD:

- Tạo đơn trong database.
- Trừ tồn kho biến thể.
- Admin thấy đơn ở `/admin/orders`.

## Thanh toán VNPAY sandbox

Đã tích hợp:

- API tạo payment: `/api/payments/vnpay`
- Return URL: `/thanh-toan/vnpay`
- IPN URL: `/api/payments/vnpay/ipn`

Biến môi trường cần điền:

```env
VNPAY_PAYMENT_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNPAY_TMN_CODE="..."
VNPAY_HASH_SECRET="..."
```

Thẻ test VNPAY:

```txt
Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ: NGUYEN VAN A
Ngày phát hành: 07/15
OTP: 123456
```

Khi deploy lên domain thật, gửi cho VNPAY IPN URL:

```txt
https://ten-domain-cua-ban.com/api/payments/vnpay/ipn
```

Lưu ý: localhost không nhận IPN từ VNPAY được. Return URL vẫn test được, nhưng IPN cần domain public HTTPS.

## Thanh toán MoMo sandbox

Đã tích hợp:

- API tạo payment: `/api/payments/momo`
- Return URL: `/thanh-toan/momo`
- IPN URL: `/api/payments/momo/ipn`

Biến môi trường cần điền:

```env
MOMO_ENDPOINT="https://test-payment.momo.vn/v2/gateway/api/create"
MOMO_PARTNER_CODE="..."
MOMO_ACCESS_KEY="..."
MOMO_SECRET_KEY="..."
```

MoMo cũng cần domain public HTTPS để IPN gọi được ổn định.

## API quan trọng

Public:

- `GET /api/products`
- `GET /api/products/[slug]`
- `POST /api/orders`
- `POST /api/payments/vnpay`
- `GET /api/payments/vnpay/ipn`
- `POST /api/payments/momo`
- `POST /api/payments/momo/ipn`

Admin:

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/products/[id]`
- `PUT /api/admin/products/[id]`
- `PATCH /api/admin/products/[id]/status`
- `POST /api/admin/upload`
- `POST /api/admin/media/sync-picture`
- `GET /api/admin/orders`
- `GET /api/admin/orders/[id]`
- `PATCH /api/admin/orders/[id]`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

## Deploy lên Vercel

1. Tạo GitHub repo và push project.
2. Vào Vercel, Import Project.
3. Chọn framework Next.js.
4. Build command:

```bash
npm run build
```

5. Cấu hình Environment Variables trên Vercel giống `.env.local`.
6. Sau khi deploy, cập nhật:

```env
NEXT_PUBLIC_SITE_URL="https://domain-cua-ban.com"
```

7. Nếu dùng VNPAY/MoMo, cập nhật URL bên merchant:

```txt
VNPAY Return URL: https://domain-cua-ban.com/thanh-toan/vnpay
VNPAY IPN URL: https://domain-cua-ban.com/api/payments/vnpay/ipn

MoMo Redirect URL: https://domain-cua-ban.com/thanh-toan/momo
MoMo IPN URL: https://domain-cua-ban.com/api/payments/momo/ipn
```

8. Chạy lại:

```bash
npx prisma db push
npm run prisma:seed
npm run media:upload
```

## Checklist chạy từ đầu

```bash
npm install
cp .env.example .env.local
# điền .env.local
npx prisma db push
npm run prisma:generate
npm run media:upload
npm run prisma:seed
npm run dev
```

Mở:

```txt
http://localhost:3000
```

## Ghi chú bảo mật

- Không đưa `.env`, `.env.local`, service role key, VNPAY hash secret, MoMo secret key lên GitHub.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` có thể public, nhưng `SUPABASE_SERVICE_ROLE_KEY` tuyệt đối không public.
- Trước khi chạy thật, nên đổi mật khẩu admin seed mặc định.
- Sandbox VNPAY/MoMo chỉ để test, không dùng cho thanh toán thật.
- Khi chạy thật, cần merchant production của VNPAY/MoMo và domain HTTPS.
