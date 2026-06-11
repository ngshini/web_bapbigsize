import { prisma } from "@/lib/prisma";
import { getFallbackLogoUrl, getFallbackSizeGuideUrl, listPictureFiles } from "@/lib/media";
import { calculatePromotionPrice } from "@/lib/pricing";

export const defaultStore = {
  storeName: "Tổng kho đồ bộ miền Nam",
  slogan: "Bắp Bigsize - Thời trang bigsize nữ",
  phone: "0976934604",
  email: "bapstore2508@gmail.com",
  address: "7/134/39 Liên khu 5-6, Bình Hưng Hòa B, Bình Tân, TP. Hồ Chí Minh",
  logoUrl: null as string | null,
  facebookUrl: "",
  zaloUrl: "https://zalo.me/0976934604"
};

export { calculatePromotionPrice };

export function fallbackProduct() {
  const files = listPictureFiles();
  const productMedia = files.filter((file) => file.role === "PRODUCT");
  const media = (productMedia.length ? productMedia : files).map((file, index) => ({
    id: file.fileName,
    mediaUrl: file.publicUrl,
    mediaType: file.mediaType,
    altText: "Bắp bigsize - Set bộ thiết kế cao cấp",
    isMain: index === 0 && file.mediaType === "IMAGE",
    sortOrder: index,
    originalFileName: file.fileName
  }));

  return {
    id: "fallback-h01",
    productCode: "H01",
    name: "Bắp bigsize - Set bộ thiết kế cao cấp",
    slug: "bap-bigsize-set-bo-thiet-ke-cao-cap",
    shortDescription: "Set bộ thiết kế cổ trụ thêu gấu, chất thun co giãn, form 45-85kg.",
    description:
      "Sản phẩm hot của shop. Set bộ thiết kế cổ trụ thêu gấu, thun co giãn form 45-85kg. Hàng thiết kế may kỹ, tỉ mỉ, chất liệu cao cấp, tay nghề cao, được kiểm tra chất lượng đầu ra trước khi đến tay khách hàng.",
    material: "Thun tăm QC cao cấp",
    originalPrice: 250000,
    salePrice: 199000,
    status: "ACTIVE",
    isHot: true,
    isFeatured: true,
    media,
    variants: ["Đen", "Xám đậm", "Xám nhạt", "Xanh đen", "Đỏ đô"].flatMap((color) =>
      [
        ["M", "45-55kg"],
        ["L", "55-65kg"],
        ["XL", "65-75kg"],
        ["2XL", "75-85kg"]
      ].map(([size]) => ({
        id: `${color}-${size}`,
        size,
        color,
        sku: `H01-${size}-${color}`,
        price: 199000,
        stockQuantity: 20,
        isActive: true
      }))
    ),
    promotions: [
      { id: "p1", name: "Mua 1 set", minQuantity: 1, finalPrice: 199000 },
      { id: "p2", name: "Mua 2 set", minQuantity: 2, finalPrice: 378000 },
      { id: "p3", name: "Mua 3 set", minQuantity: 3, finalPrice: 557000 }
    ],
    reviews: [] as any[]
  };
}

export async function getStoreSettings() {
  try {
    const settings = await prisma.storeSetting.findFirst();
    return {
      ...defaultStore,
      ...settings,
      logoUrl: settings?.logoUrl ?? getFallbackLogoUrl()
    };
  } catch {
    return { ...defaultStore, logoUrl: getFallbackLogoUrl() };
  }
}

export async function getSizeGuides() {
  try {
    const guides = await prisma.sizeGuide.findMany({ orderBy: { sortOrder: "asc" } });
    if (guides.length) return guides;
  } catch {}

  return [
    { id: "M", size: "M", weightRange: "45-55kg", bustRange: "75-80cm", waistRange: "dưới 72cm", hipRange: "85-93cm", sortOrder: 1 },
    { id: "L", size: "L", weightRange: "55-65kg", bustRange: "85-94cm", waistRange: "dưới 82cm", hipRange: "94-102cm", sortOrder: 2 },
    { id: "XL", size: "XL", weightRange: "65-75kg", bustRange: "95-104cm", waistRange: "dưới 92cm", hipRange: "103-110cm", sortOrder: 3 },
    { id: "2XL", size: "2XL", weightRange: "75-85kg", bustRange: "105-115cm", waistRange: "dưới 102cm", hipRange: "111-120cm", sortOrder: 4 }
  ];
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { media: { orderBy: { sortOrder: "asc" } }, variants: true, promotions: true, category: true },
      orderBy: [{ isHot: "desc" }, { createdAt: "desc" }]
    });
    return products.length ? products : [fallbackProduct()];
  } catch {
    return [fallbackProduct()];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { media: { orderBy: { sortOrder: "asc" } }, variants: true, promotions: true, category: true, reviews: true }
    });
    return product ?? (slug === fallbackProduct().slug ? fallbackProduct() : null);
  } catch {
    const product = fallbackProduct();
    return slug === product.slug ? product : null;
  }
}

export async function getSizeGuideImage() {
  return getFallbackSizeGuideUrl();
}

export async function getRelatedProducts(currentSlug: string, categoryId?: string | null, limit = 4) {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        slug: { not: currentSlug },
        ...(categoryId ? { categoryId } : {})
      },
      include: { media: { orderBy: { sortOrder: "asc" } }, variants: true },
      orderBy: [{ isHot: "desc" }, { createdAt: "desc" }],
      take: limit
    });
    if (products.length) return products;
    // If no products in same category, get any other products
    const fallbackProducts = await prisma.product.findMany({
      where: { status: "ACTIVE", slug: { not: currentSlug } },
      include: { media: { orderBy: { sortOrder: "asc" } }, variants: true },
      orderBy: [{ isHot: "desc" }, { createdAt: "desc" }],
      take: limit
    });
    return fallbackProducts;
  } catch {
    return [];
  }
}

