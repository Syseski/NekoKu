import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { LifeStage, HealthFocusType } from '@prisma/client';

const catProfileSchema = z.object({
  name: z.string().min(1, 'Cat name is required'),
  breed: z.string().optional(),
  birthDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  lifeStage: z.nativeEnum(LifeStage).optional(),
  weightKg: z.number().positive().optional(),
  isNeutered: z.boolean().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  allergies: z.string().optional(),
  healthConcerns: z.array(z.nativeEnum(HealthFocusType)).optional(),
});

// Helper: Calculate life stage from birthdate if not explicitly provided
function calculateLifeStage(birthDate?: Date): LifeStage {
  if (!birthDate) return LifeStage.ADULT;
  const now = new Date();
  const diffMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
  if (diffMonths <= 12) return LifeStage.KITTEN;
  if (diffMonths >= 84) return LifeStage.SENIOR; // 7+ years
  return LifeStage.ADULT;
}

export const getMyCats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cats = await prisma.catProfile.findMany({
      where: { userId: req.user!.id },
      include: {
        healthConcerns: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: cats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch cats' });
  }
};

export const getCatById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cat = await prisma.catProfile.findFirst({
      where: { id, userId: req.user!.id },
      include: {
        healthConcerns: true,
      },
    });

    if (!cat) {
      res.status(404).json({ success: false, message: 'Cat profile not found' });
      return;
    }

    res.status(200).json({ success: true, data: cat });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = catProfileSchema.parse(req.body);
    const lifeStage = validated.lifeStage || calculateLifeStage(validated.birthDate);

    const cat = await prisma.catProfile.create({
      data: {
        userId: req.user!.id,
        name: validated.name,
        breed: validated.breed,
        birthDate: validated.birthDate,
        lifeStage,
        weightKg: validated.weightKg,
        isNeutered: validated.isNeutered || false,
        avatarUrl: validated.avatarUrl,
        allergies: validated.allergies,
        healthConcerns: validated.healthConcerns
          ? {
              create: validated.healthConcerns.map((condition) => ({ condition })),
            }
          : undefined,
      },
      include: { healthConcerns: true },
    });

    res.status(201).json({ success: true, message: 'Cat profile created', data: cat });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validated = catProfileSchema.parse(req.body);

    const existingCat = await prisma.catProfile.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existingCat) {
      res.status(404).json({ success: false, message: 'Cat profile not found' });
      return;
    }

    const lifeStage = validated.lifeStage || calculateLifeStage(validated.birthDate || existingCat.birthDate || undefined);

    // Update cat and refresh health conditions
    const updatedCat = await prisma.$transaction(async (tx) => {
      if (validated.healthConcerns !== undefined) {
        await tx.catHealthConcern.deleteMany({ where: { catProfileId: id } });
        if (validated.healthConcerns.length > 0) {
          await tx.catHealthConcern.createMany({
            data: validated.healthConcerns.map((condition) => ({
              catProfileId: id,
              condition,
            })),
          });
        }
      }

      return tx.catProfile.update({
        where: { id },
        data: {
          name: validated.name,
          breed: validated.breed,
          birthDate: validated.birthDate,
          lifeStage,
          weightKg: validated.weightKg,
          isNeutered: validated.isNeutered,
          avatarUrl: validated.avatarUrl,
          allergies: validated.allergies,
        },
        include: { healthConcerns: true },
      });
    });

    res.status(200).json({ success: true, message: 'Cat profile updated', data: updatedCat });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await prisma.catProfile.deleteMany({
      where: { id, userId: req.user!.id },
    });

    if (deleted.count === 0) {
      res.status(404).json({ success: false, message: 'Cat profile not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Cat profile deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------------
// SMART RECOMMENDATION ENGINE
// ---------------------------------------------------------------------------------
export const getRecommendationsForCat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cat = await prisma.catProfile.findFirst({
      where: { id, userId: req.user!.id },
      include: { healthConcerns: true },
    });

    if (!cat) {
      res.status(404).json({ success: false, message: 'Cat profile not found' });
      return;
    }

    const catConditions = cat.healthConcerns.map((hc) => hc.condition);

    // Fetch products that match the cat's life stage OR have matching health focus
    const allCandidateProducts = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        healthFocuses: true,
      },
    });

    // Score and rank candidates
    const scoredProducts = allCandidateProducts.map((product) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Health condition match (Highest priority)
      const matchingFocuses = product.healthFocuses.filter((hf) =>
        catConditions.includes(hf.focus)
      );

      if (matchingFocuses.length > 0) {
        score += matchingFocuses.length * 50;
        const conditionLabels = matchingFocuses.map((f) => f.focus.replace(/_/g, ' ')).join(', ');
        reasons.push(`Targeted care for ${conditionLabels}`);
      }

      // 2. Life Stage match
      if (product.targetLifeStage === cat.lifeStage) {
        score += 30;
        reasons.push(`Tailored for ${cat.lifeStage.toLowerCase()} life stage`);
      } else if (product.targetLifeStage === LifeStage.ALL_STAGES) {
        score += 15;
      } else {
        score -= 20; // Incompatible age bracket
      }

      // 3. Featured & High Rating
      if (product.isFeatured) score += 5;
      score += Math.round(product.rating * 2);

      return {
        ...product,
        matchScore: score,
        matchReasons: reasons,
        isIdealMatch: matchingFocuses.length > 0 || product.targetLifeStage === cat.lifeStage,
      };
    });

    // Filter out poorly matched and sort descending by score
    const recommendations = scoredProducts
      .filter((p) => p.matchScore > 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        cat: {
          id: cat.id,
          name: cat.name,
          lifeStage: cat.lifeStage,
          healthConcerns: catConditions,
        },
        recommendations,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
