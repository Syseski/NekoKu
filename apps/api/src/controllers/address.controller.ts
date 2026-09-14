import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const addressSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional().nullable(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().optional().default('Malaysia'),
  isDefault: z.boolean().optional().default(false),
});

export const getMyAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }],
    });

    res.status(200).json({ success: true, data: addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch addresses' });
  }
};

export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = addressSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if user has any addresses yet. If not, make this one default.
    const existingCount = await prisma.address.count({ where: { userId } });
    const isDefault = existingCount === 0 || validated.isDefault;

    if (isDefault) {
      // Unset previous defaults
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        recipientName: validated.recipientName,
        phone: validated.phone,
        streetAddress: validated.streetAddress,
        city: validated.city,
        state: validated.state,
        postalCode: validated.postalCode,
        country: validated.country || 'Malaysia',
        isDefault,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create address' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validated = addressSchema.parse(req.body);
    const userId = req.user!.id;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    if (validated.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        recipientName: validated.recipientName,
        phone: validated.phone,
        streetAddress: validated.streetAddress,
        city: validated.city,
        state: validated.state,
        postalCode: validated.postalCode,
        country: validated.country || 'Malaysia',
        ...(validated.isDefault !== undefined && { isDefault: validated.isDefault }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to update address' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    await prisma.address.delete({ where: { id } });

    // If deleted address was default, set another one as default
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({ where: { userId } });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete address' });
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updated = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to set default address' });
  }
};
