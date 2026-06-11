import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { listPictureFiles } from "../lib/media";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const colors = ["Đen", "Xám đậm", "Xám nhạt", "Xanh đen", "Đỏ đô"];
const sizes = [
  { size: "M", weight: "45-55kg", bust: "75-80cm", waist: "dưới 72cm", hip: "85-93cm" },
  { size: "L", weight: "55-65kg", bust: "85-94cm", waist: "dưới 82cm", hip: "94-102cm" },
  { size: "XL", weight: "65-75kg", bust: "95-104cm", waist: "dưới 92cm", hip: "103-110cm" },
  { size: "2XL", weight: "75-85kg", bust: "105-115cm", waist: "dưới 102cm", hip: "111-120cm" }
];

function storagePublicUrl(fileName: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return `/picture/${encodeURIComponent(fileName)}`;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-media/${encodeURIComponent(fileName)}`;
}

function isH02File(fileName: string) {
  return /(h02|ho2|^ha_|\bha2?_)/i.test(fileName);
}

async function main() {
  const files = listPictureFiles();
  const logo = files.find((file) => file.role === "LOGO" && file.mediaType === "IMAGE");
  const mediaFiles = files.filter((file) => file.role === "PRODUCT");
  const h01Media = mediaFiles.filter((file) => !isH02File(file.fileName));
  const h02Media = mediaFiles.filter((file) => isH02File(file.fileName));
  const productGallery = h01Media.length ? h01Media : files.filter((file) => !isH02File(file.fileName));

  await prisma.user.upsert({
    where: { email: "admin@bapbigsize.local" },
    update: {},
    create: {
      fullName: "Admin Bắp Bigsize",
      email: "admin@bapbigsize.local",
      passwordHash: await bcrypt.hash("Admin@123456", 12),
      role: "ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { email: "bapstore2508@gmail.com" },
    update: { passwordHash: await bcrypt.hash("123456", 12) },
    create: {
      fullName: "Shop Bắp",
      email: "bapstore2508@gmail.com",
      passwordHash: await bcrypt.hash("123456", 12),
      role: "ADMIN"
    }
  });

  await prisma.storeSetting.upsert({
    where: { id: "store-default" },
    update: logo ? { logoUrl: storagePublicUrl(logo.fileName) } : {},
    create: {
      id: "store-default",
      storeName: "Tổng kho đồ bộ miền Nam",
      slogan: "Bắp Bigsize - Đồ bộ nữ big size",
      phone: "0976934604",
      email: "bapstore2508@gmail.com",
      address: "7/134/39 Liên khu 5-6, Bình Hưng Hòa B, Bình Tân, TP. Hồ Chí Minh",
      logoUrl: logo ? storagePublicUrl(logo.fileName) : null,
      zaloUrl: "https://zalo.me/0976934604",
      facebookUrl: ""
    }
  });

  const category = await prisma.category.upsert({
    where: { slug: "do-bo-nu-bigsize" },
    update: {},
    create: {
      name: "Đồ bộ nữ big size",
      slug: "do-bo-nu-bigsize",
      description: "Đồ bộ nữ big size form 45-85kg"
    }
  });

  for (const [index, guide] of sizes.entries()) {
    await prisma.sizeGuide.upsert({
      where: { size: guide.size },
      update: { weightRange: guide.weight, bustRange: guide.bust, waistRange: guide.waist, hipRange: guide.hip, sortOrder: index + 1 },
      create: {
        size: guide.size,
        weightRange: guide.weight,
        bustRange: guide.bust,
        waistRange: guide.waist,
        hipRange: guide.hip,
        sortOrder: index + 1
      }
    });
  }

  const product = await prisma.product.upsert({
    where: { productCode: "H01" },
    update: {
      categoryId: category.id,
      name: "Bắp bigsize - Set bộ thiết kế cao cấp",
      slug: "bap-bigsize-set-bo-thiet-ke-cao-cap",
      shortDescription: "Set bộ thiết kế cổ trụ thêu gấu, chất thun co giãn, form 45-85kg.",
      description:
        "Sản phẩm hot của shop. Set bộ thiết kế cổ trụ thêu gấu, thun co giãn form 45-85kg. Hàng thiết kế may kỹ, tỉ mỉ, chất liệu cao cấp, tay nghề cao, được kiểm tra chất lượng đầu ra trước khi đến tay khách hàng. Chất liệu thun tăm QC cao cấp, mềm mịn, thoải mái cho người mặc. Phong cách sang trọng, thanh lịch, phù hợp đi làm, đi chơi và du lịch. Đường may tỉ mỉ, bền đẹp. Thiết kế phù hợp xu hướng hiện nay. Tông màu sang trọng, tôn dáng và tôn da. Khách được kiểm tra hàng, mặc thử, trả lại không mất phí ship. Bảo hành lỗi 1 đổi 1 trong vòng 7 ngày.",
      material: "Thun tăm QC cao cấp",
      originalPrice: 250000,
      salePrice: 199000,
      status: "ACTIVE",
      isHot: true,
      isFeatured: true
    },
    create: {
      categoryId: category.id,
      productCode: "H01",
      name: "Bắp bigsize - Set bộ thiết kế cao cấp",
      slug: "bap-bigsize-set-bo-thiet-ke-cao-cap",
      shortDescription: "Set bộ thiết kế cổ trụ thêu gấu, chất thun co giãn, form 45-85kg.",
      description:
        "Sản phẩm hot của shop. Set bộ thiết kế cổ trụ thêu gấu, thun co giãn form 45-85kg. Hàng thiết kế may kỹ, tỉ mỉ, chất liệu cao cấp, tay nghề cao, được kiểm tra chất lượng đầu ra trước khi đến tay khách hàng. Chất liệu thun tăm QC cao cấp, mềm mịn, thoải mái cho người mặc. Phong cách sang trọng, thanh lịch, phù hợp đi làm, đi chơi và du lịch. Đường may tỉ mỉ, bền đẹp. Thiết kế phù hợp xu hướng hiện nay. Tông màu sang trọng, tôn dáng và tôn da. Khách được kiểm tra hàng, mặc thử, trả lại không mất phí ship. Bảo hành lỗi 1 đổi 1 trong vòng 7 ngày.",
      material: "Thun tăm QC cao cấp",
      originalPrice: 250000,
      salePrice: 199000,
      status: "ACTIVE",
      isHot: true,
      isFeatured: true,
      seoTitle: "Bắp bigsize - Set bộ thiết kế cao cấp H01",
      seoDescription: "Set bộ nữ bigsize chất thun tăm QC cao cấp, form 45-85kg."
    }
  });

  await prisma.productMedia.deleteMany({ where: { productId: product.id } });
  await prisma.productVariant.deleteMany({ where: { productId: product.id } });
  await prisma.promotion.deleteMany({ where: { productId: product.id } });

  await prisma.productMedia.createMany({
    data: productGallery.map((file, index) => ({
      productId: product.id,
      mediaUrl: storagePublicUrl(file.fileName),
      mediaType: file.mediaType,
      altText: `Bắp bigsize H01 ${index + 1}`,
      isMain: index === 0 && file.mediaType === "IMAGE",
      sortOrder: index,
      storagePath: file.storagePath,
      originalFileName: file.fileName
    }))
  });

  await prisma.productVariant.createMany({
    data: colors.flatMap((color) =>
      sizes.map((guide) => ({
        productId: product.id,
        size: guide.size,
        color,
        sku: `H01-${guide.size}-${color.replace(/\s+/g, "-").toUpperCase()}`,
        price: 199000,
        stockQuantity: 20,
        isActive: true
      }))
    )
  });

  await prisma.promotion.createMany({
    data: [
      { productId: product.id, name: "Mua 1 set", minQuantity: 1, finalPrice: 199000, discountAmount: 51000 },
      { productId: product.id, name: "Mua 2 set", minQuantity: 2, finalPrice: 378000, discountAmount: 122000 },
      { productId: product.id, name: "Mua 3 set", minQuantity: 3, finalPrice: 557000, discountAmount: 193000 }
    ]
  });

  const h02Product = await prisma.product.upsert({
    where: { productCode: "H02" },
    update: {
      categoryId: category.id,
      name: "Set bộ suông nữ suông trơn co giãn",
      slug: "set-bo-suong-nu-suong-tron-co-gian-h02",
      shortDescription: "Set bộ suông nữ trơn co giãn, form 45-85kg, chất thun tăm QC cao cấp.",
      description:
        "Set bộ suông nữ suông trơn co giãn form 45-85kg. Hàng thiết kế may kỹ, tỉ mỉ, chất liệu cao cấp, tay nghề cao, được kiểm tra chất lượng đầu ra trước khi đến tay khách hàng. Chất liệu thun tăm QC cao cấp được may tỉ mỉ chi tiết, mang lại sự thoải mái và mềm mịn cho người mặc. Phong cách thời trang sang trọng, thanh lịch, phù hợp đi làm, đi chơi và du lịch. Đường may tỉ mỉ, bền đẹp. Thiết kế đẹp phù hợp xu hướng đang hot hiện nay. Tông màu sang trọng, tôn dáng và tôn da. Khách được kiểm tra hàng, mặc thử, trả lại không mất phí ship. Bảo hành lỗi 1 đổi 1 trong vòng 7 ngày.",
      material: "Thun tăm QC cao cấp",
      originalPrice: 250000,
      salePrice: 199000,
      status: "ACTIVE",
      isHot: true,
      isFeatured: true,
      seoTitle: "H02 - Set bộ suông nữ suông trơn co giãn",
      seoDescription: "Set bộ suông nữ trơn co giãn form 45-85kg, chất thun tăm QC cao cấp."
    },
    create: {
      categoryId: category.id,
      productCode: "H02",
      name: "Set bộ suông nữ suông trơn co giãn",
      slug: "set-bo-suong-nu-suong-tron-co-gian-h02",
      shortDescription: "Set bộ suông nữ trơn co giãn, form 45-85kg, chất thun tăm QC cao cấp.",
      description:
        "Set bộ suông nữ suông trơn co giãn form 45-85kg. Hàng thiết kế may kỹ, tỉ mỉ, chất liệu cao cấp, tay nghề cao, được kiểm tra chất lượng đầu ra trước khi đến tay khách hàng. Chất liệu thun tăm QC cao cấp được may tỉ mỉ chi tiết, mang lại sự thoải mái và mềm mịn cho người mặc. Phong cách thời trang sang trọng, thanh lịch, phù hợp đi làm, đi chơi và du lịch. Đường may tỉ mỉ, bền đẹp. Thiết kế đẹp phù hợp xu hướng đang hot hiện nay. Tông màu sang trọng, tôn dáng và tôn da. Khách được kiểm tra hàng, mặc thử, trả lại không mất phí ship. Bảo hành lỗi 1 đổi 1 trong vòng 7 ngày.",
      material: "Thun tăm QC cao cấp",
      originalPrice: 250000,
      salePrice: 199000,
      status: "ACTIVE",
      isHot: true,
      isFeatured: true,
      seoTitle: "H02 - Set bộ suông nữ suông trơn co giãn",
      seoDescription: "Set bộ suông nữ trơn co giãn form 45-85kg, chất thun tăm QC cao cấp."
    }
  });

  await prisma.productMedia.deleteMany({ where: { productId: h02Product.id } });
  await prisma.productVariant.deleteMany({ where: { productId: h02Product.id } });
  await prisma.promotion.deleteMany({ where: { productId: h02Product.id } });

  if (h02Media.length) {
    await prisma.productMedia.createMany({
      data: h02Media.map((file, index) => ({
        productId: h02Product.id,
        mediaUrl: storagePublicUrl(file.fileName),
        mediaType: file.mediaType,
        altText: `Set bộ suông nữ H02 ${index + 1}`,
        isMain: index === 0 && file.mediaType === "IMAGE",
        sortOrder: index,
        storagePath: file.storagePath,
        originalFileName: file.fileName
      }))
    });
  }

  await prisma.productVariant.createMany({
    data: colors.flatMap((color) =>
      sizes.map((guide) => ({
        productId: h02Product.id,
        size: guide.size,
        color,
        sku: `H02-${guide.size}-${color.replace(/\s+/g, "-").toUpperCase()}`,
        price: 199000,
        stockQuantity: 20,
        isActive: true
      }))
    )
  });

  await prisma.promotion.createMany({
    data: [
      { productId: h02Product.id, name: "Mua 1 set", minQuantity: 1, finalPrice: 199000, discountAmount: 51000 },
      { productId: h02Product.id, name: "Mua 2 set", minQuantity: 2, finalPrice: 378000, discountAmount: 20000 },
      { productId: h02Product.id, name: "Mua 3 set", minQuantity: 3, finalPrice: 557000, discountAmount: 40000 }
    ]
  });

  console.log("Seed completed. Admin: admin@bapbigsize.local / Admin@123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
