import { z } from "zod";

export const orderSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1, "Vui lòng chọn size"),
  color: z.string().min(1, "Vui lòng chọn màu"),
  quantity: z.coerce.number().int().min(1).max(99),
  customerName: z.string().min(2, "Vui lòng nhập họ tên"),
  customerPhone: z.string().min(8, "Vui lòng nhập số điện thoại"),
  customerAddress: z.string().min(5, "Vui lòng nhập địa chỉ"),
  note: z.string().optional().default("")
});

export const cartOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1, "Vui lòng chọn size"),
        color: z.string().min(1, "Vui lòng chọn màu"),
        quantity: z.coerce.number().int().min(1).max(99)
      })
    )
    .min(1, "Giỏ hàng chưa có sản phẩm"),
  customerName: z.string().min(2, "Vui lòng nhập họ tên"),
  customerPhone: z.string().min(8, "Vui lòng nhập số điện thoại"),
  customerAddress: z.string().min(5, "Vui lòng nhập địa chỉ"),
  note: z.string().optional().default("")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const productSchema = z.object({
  name: z.string().min(2),
  productCode: z.string().min(1),
  slug: z.string().min(1),
  categoryId: z.string().min(1),
  shortDescription: z.string().optional().default(""),
  description: z.string().optional().default(""),
  material: z.string().optional().default(""),
  originalPrice: z.coerce.number().int().min(0),
  salePrice: z.coerce.number().int().min(0),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).default("ACTIVE"),
  isHot: z.coerce.boolean().default(false),
  isFeatured: z.coerce.boolean().default(false),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size: z.string().min(1),
        color: z.string().min(1),
        sku: z.string().min(1),
        price: z.coerce.number().int().min(0),
        stockQuantity: z.coerce.number().int().min(0),
        isActive: z.coerce.boolean().default(true)
      })
    )
    .default([]),
  promotions: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        minQuantity: z.coerce.number().int().min(1),
        finalPrice: z.coerce.number().int().min(0),
        discountAmount: z.coerce.number().int().min(0).default(0),
        isActive: z.coerce.boolean().default(true)
      })
    )
    .default([]),
  media: z
    .array(
      z.object({
        id: z.string().optional(),
        mediaUrl: z.string().min(1),
        mediaType: z.enum(["IMAGE", "VIDEO"]),
        altText: z.string().optional().default(""),
        isMain: z.coerce.boolean().default(false),
        sortOrder: z.coerce.number().int().default(0),
        storagePath: z.string().optional().nullable(),
        originalFileName: z.string().optional().nullable()
      })
    )
    .default([])
});

export const settingsSchema = z.object({
  storeName: z.string().min(2),
  slogan: z.string().optional().default(""),
  phone: z.string().min(8),
  email: z.string().email(),
  address: z.string().min(5),
  logoUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  zaloUrl: z.string().optional().nullable()
});
