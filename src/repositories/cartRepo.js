'use strict';

const prisma = require('./prismaClient');

// Shape adapter — services access cart.items[].product._id, cart.items[].variant, etc.
function toMongo(row) {
  if (!row) return null;
  const { id, userId, couponDiscount, items = [], ...rest } = row;
  return {
    ...rest,
    _id: id,
    id,
    user: userId,
    couponDiscount: Number(couponDiscount),
    items: items.map(itemToMongo),
  };
}

function itemToMongo(item) {
  if (!item) return null;
  const { id, cartId, productId, variantId, variantName, variantSku, variantColor, variantSize, price, compareAtPrice, savedForLater, ...rest } = item;
  return {
    ...rest,
    _id: id,
    id,
    product: { _id: productId, id: productId },
    variant: variantId ?? undefined,
    variantDetails: (variantName || variantColor || variantSize)
      ? { name: variantName, sku: variantSku, color: variantColor, size: variantSize }
      : null,
    price: Number(price),
    compareAtPrice: compareAtPrice != null ? Number(compareAtPrice) : undefined,
    savedForLater: savedForLater ?? false,
  };
}

const ITEM_INCLUDE = {
  items: {
    where: { savedForLater: false },
    include: {
      product: { select: { id: true, name: true, slug: true, price: true, stock: true, isActive: true, thumbnailUrl: true, images: true } },
    },
  },
};

class CartRepository {
  async findByUser(userId) {
    const row = await prisma.cart.findUnique({ where: { userId }, include: ITEM_INCLUDE });
    return toMongo(row);
  }

  async create(data) {
    const row = await prisma.cart.create({
      data: { userId: data.user ?? data.userId },
      include: ITEM_INCLUDE,
    });
    return toMongo(row);
  }

  async upsertCart(userId, data) {
    const row = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {
        couponCode: data.couponCode ?? null,
        couponDiscount: data.couponDiscount ?? 0,
      },
      include: ITEM_INCLUDE,
    });
    // If clearCart — delete all items
    if (data.items && data.items.length === 0) {
      await prisma.cartItem.deleteMany({ where: { cartId: row.id } });
      row.items = [];
    }
    return toMongo(row);
  }

  async addItem(userId, itemData) {
    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const row = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: itemData.product,
        variantId: itemData.variant ?? null,
        variantName: itemData.variantDetails?.name ?? null,
        variantSku: itemData.variantDetails?.sku ?? null,
        variantColor: itemData.variantDetails?.color ?? null,
        variantSize: itemData.variantDetails?.size ?? null,
        quantity: itemData.quantity,
        price: itemData.price,
        compareAtPrice: itemData.compareAtPrice ?? null,
        name: itemData.name ?? null,
        slug: itemData.slug ?? null,
        thumbnail: itemData.thumbnail ?? null,
      },
    });
    return itemToMongo(row);
  }

  async updateItemQuantity(cartId, itemId, quantity) {
    return prisma.cartItem.update({ where: { id: itemId, cartId }, data: { quantity } });
  }

  async removeItem(cartId, itemId) {
    return prisma.cartItem.delete({ where: { id: itemId, cartId } });
  }

  async clearItems(userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  async setCoupon(userId, code, discount) {
    const row = await prisma.cart.upsert({
      where: { userId },
      create: { userId, couponCode: code, couponDiscount: discount },
      update: { couponCode: code, couponDiscount: discount },
      include: ITEM_INCLUDE,
    });
    return toMongo(row);
  }

  async findById(id) {
    const row = await prisma.cart.findUnique({ where: { id }, include: ITEM_INCLUDE });
    return toMongo(row);
  }
}

module.exports = new CartRepository();
