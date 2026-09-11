import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                healthFocuses: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: {
          items: {
            include: {
              product: {
                include: { images: true, healthFocuses: true },
              },
            },
          },
        },
      });
    }

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        ...cart,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalItems,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addItemToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity } = addItemSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (product.stockQuantity < quantity) {
      res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
      return;
    }

    // Ensure cart exists
    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user!.id } });
    }

    // Upsert cart item
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stockQuantity) {
        res.status(400).json({ success: false, message: 'Not enough stock available' });
        return;
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    // Return updated cart
    return getCart(req, res);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { quantity } = updateItemSchema.parse(req.body);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        cart: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== req.user!.id) {
      res.status(404).json({ success: false, message: 'Cart item not found' });
      return;
    }

    if (cartItem.product.stockQuantity < quantity) {
      res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
      return;
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return getCart(req, res);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.user!.id) {
      res.status(404).json({ success: false, message: 'Cart item not found' });
      return;
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return getCart(req, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.status(200).json({ success: true, message: 'Cart cleared successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
