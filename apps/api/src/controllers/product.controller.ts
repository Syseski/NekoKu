import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { LifeStage, HealthFocusType, Prisma } from '@prisma/client';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      lifeStage,
      healthFocus,
      isSpecialtyDiet,
      isFeatured,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 12));
    const skip = (pageNumber - 1) * pageSize;

    const where: Prisma.ProductWhereInput = {};

    // 1. Filter by Category Slug or ID
    if (category) {
      where.category = {
        OR: [
          { slug: category as string },
          { id: category as string },
        ],
      };
    }

    // 2. Filter by Life Stage
    if (lifeStage) {
      const stage = lifeStage as LifeStage;
      where.targetLifeStage = {
        in: [stage, LifeStage.ALL_STAGES],
      };
    }

    // 3. Filter by Health Focus
    if (healthFocus) {
      const focus = healthFocus as HealthFocusType;
      where.healthFocuses = {
        some: { focus },
      };
    }

    // 4. Specialty Diet / Featured filters
    if (isSpecialtyDiet !== undefined) {
      where.isSpecialtyDiet = isSpecialtyDiet === 'true';
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    // 5. Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = new Prisma.Decimal(minPrice as string);
      if (maxPrice) where.price.lte = new Prisma.Decimal(maxPrice as string);
    }

    // 6. Search query (Name, Brand, Ingredients, Description)
    if (search) {
      const query = (search as string).trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { ingredients: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'rating') orderBy = { rating: 'desc' };
    if (sortBy === 'name_asc') orderBy = { name: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          healthFocuses: true,
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        category: true,
        images: true,
        healthFocuses: true,
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Also get related products in same category / health focus
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      include: {
        images: true,
        healthFocuses: true,
      },
      take: 4,
    });

    res.status(200).json({
      success: true,
      data: {
        product,
        relatedProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      include: {
        category: true,
        images: true,
        healthFocuses: true,
      },
      take: 8,
    });

    res.status(200).json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
