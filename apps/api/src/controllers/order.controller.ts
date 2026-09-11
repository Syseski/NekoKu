import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { OrderStatus } from '@prisma/client';

const checkoutSchema = z.object({
  addressId: z.string().uuid().optional(),
  recipientName: z.string().optional(),
  phone: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  paymentMethod: z.string().default('MOCK_CARD_SIMULATION'),
});

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `NK-${dateStr}-${randomStr}`;
}

export const simulateCheckout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const input = checkoutSchema.parse(req.body);
    const userId = req.user!.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty' });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      let finalAddressId = input.addressId;
      if (!finalAddressId && input.recipientName && input.streetAddress) {
        const newAddress = await tx.address.create({
          data: {
            userId,
            recipientName: input.recipientName,
            phone: input.phone || '',
            streetAddress: input.streetAddress,
            city: input.city || 'San Francisco',
            postalCode: input.postalCode || '94107',
          },
        });
        finalAddressId = newAddress.id;
      }

      let subtotal = 0;
      const orderItemCreations = [];

      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.product.name} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.stockQuantity} remaining.`);
        }

        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: product.stockQuantity - item.quantity,
          },
        });

        const itemTotal = Number(product.price) * item.quantity;
        subtotal += itemTotal;

        orderItemCreations.push({
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          totalPrice: itemTotal,
        });
      }

      const shippingFee = subtotal >= 50 ? 0 : 4.99;
      const totalAmount = subtotal + shippingFee;
      const orderNumber = generateOrderNumber();

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: finalAddressId,
          subtotal,
          shippingFee,
          totalAmount,
          status: OrderStatus.PAID,
          paymentMethod: input.paymentMethod,
          paymentId: `SIM_PAY_${Date.now()}`,
          paidAt: new Date(),
          items: {
            create: orderItemCreations,
          },
        },
        include: {
          items: true,
          deliveryAddress: true,
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: '🎉 Mock order placed successfully! Stock has been deducted.',
      data: order,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(400).json({ success: false, message: error.message || 'Checkout failed' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
        deliveryAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        userId: req.user!.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
        deliveryAddress: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
