import { PrismaClient, Role, LifeStage, HealthFocusType, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NekoKu database seed...');

  // 1. Clean existing records in reverse order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productHealthFocus.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.catHealthConcern.deleteMany();
  await prisma.catProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Administrator Account for Chikia
  const adminPasswordHash = await bcrypt.hash('admin12345', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nekoku.my',
      fullName: 'Chikia (NekoKu Admin)',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      phoneNumber: '+60 12-345 6789',
      addresses: {
        create: [
          {
            recipientName: 'Chikia',
            phone: '+60 12-345 6789',
            streetAddress: 'No. 18, Jalan Neko Sakura, Bukit Bintang',
            city: 'Kuala Lumpur',
            postalCode: '55100',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('✅ Created Admin user: admin@nekoku.my / admin12345');

  // 3. Create Registered Cat Profiles for Admin
  const mochi = await prisma.catProfile.create({
    data: {
      userId: admin.id,
      name: 'Mochi',
      breed: 'British Shorthair',
      lifeStage: LifeStage.ADULT,
      weightKg: 4.8,
      isNeutered: true,
      avatarUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
      allergies: 'Chicken by-products',
      healthConcerns: {
        create: [
          { condition: HealthFocusType.URINARY_CARE },
          { condition: HealthFocusType.HAIRBALL_CONTROL },
        ],
      },
    },
  });

  const luna = await prisma.catProfile.create({
    data: {
      userId: admin.id,
      name: 'Luna',
      breed: 'Scottish Fold',
      lifeStage: LifeStage.KITTEN,
      weightKg: 1.9,
      isNeutered: false,
      avatarUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80',
      allergies: 'Grain sensitivities',
      healthConcerns: {
        create: [
          { condition: HealthFocusType.SENSITIVE_DIGESTION },
          { condition: HealthFocusType.SKIN_AND_COAT },
        ],
      },
    },
  });

  const oliver = await prisma.catProfile.create({
    data: {
      userId: admin.id,
      name: 'Oliver',
      breed: 'Maine Coon Mix',
      lifeStage: LifeStage.SENIOR,
      weightKg: 6.2,
      isNeutered: true,
      avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
      allergies: 'None',
      healthConcerns: {
        create: [
          { condition: HealthFocusType.KIDNEY_SUPPORT },
          { condition: HealthFocusType.WEIGHT_MANAGEMENT },
        ],
      },
    },
  });

  console.log('✅ Created cat profiles: Mochi (Adult), Luna (Kitten), Oliver (Senior)');

  // 4. Create Categories
  const catVetDiet = await prisma.category.create({
    data: {
      name: 'Veterinary Diets',
      slug: 'veterinary-diets',
      description: 'Clinically formulated diets addressing specific feline health conditions.',
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
    },
  });

  const catDryFood = await prisma.category.create({
    data: {
      name: 'Dry Kibble & Raw',
      slug: 'dry-kibble-raw',
      description: 'High-protein, grain-free and nutrient-dense complete dry cat foods.',
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
    },
  });

  const catWetFood = await prisma.category.create({
    data: {
      name: 'Wet Gourmet & Broths',
      slug: 'wet-gourmet-broths',
      description: 'Hydration-rich pates, shreds, and comforting bone broths.',
      imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=600&q=80',
    },
  });

  const catLitter = await prisma.category.create({
    data: {
      name: 'Natural Litter & Hygiene',
      slug: 'natural-litter-hygiene',
      description: 'Dust-free, flushable tofu, cassava, and odor-locking plant litters.',
      imageUrl: 'https://images.unsplash.com/photo-1615789591457-74a63395c990?auto=format&fit=crop&w=600&q=80',
    },
  });

  const catSupplements = await prisma.category.create({
    data: {
      name: 'Health & Supplements',
      slug: 'health-and-supplements',
      description: 'Omega-3 oils, digestive probiotics, calming drops, and joint support.',
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
    },
  });

  // 5. Create Specialty Products
  const productsData = [
    {
      name: 'Royal Canin Feline Urinary S/O Vet Diet',
      slug: 'royal-canin-feline-urinary-so',
      brand: 'Royal Canin',
      categoryId: catVetDiet.id,
      description: 'Specially formulated to dissolve struvite stones and reduce recurrence of calcium oxalate uroliths. Controlled magnesium and phosphorus levels promote optimal urine saturation.',
      ingredients: 'Chicken meal, brewers rice, corn gluten meal, powdered cellulose, natural flavors, fish oil, calcium sulfate, potassium chloride.',
      price: 54.99,
      stockQuantity: 45,
      targetLifeStage: LifeStage.ADULT,
      isSpecialtyDiet: true,
      isFeatured: true,
      rating: 4.9,
      ratingCount: 128,
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.URINARY_CARE],
    },
    {
      name: 'Hill\'s Prescription Diet k/d Early Kidney Support',
      slug: 'hills-prescription-diet-kd-kidney',
      brand: 'Hill\'s Prescription Diet',
      categoryId: catVetDiet.id,
      description: 'Clinically proven nutrition to protect vital kidney function, stimulate appetite, and slow progression of kidney conditions in senior cats.',
      ingredients: 'Brown rice, corn gluten meal, pork fat, whole grain wheat, egg product, dried beet pulp, fish oil, L-lysine.',
      price: 58.50,
      stockQuantity: 30,
      targetLifeStage: LifeStage.SENIOR,
      isSpecialtyDiet: true,
      isFeatured: true,
      rating: 4.8,
      ratingCount: 94,
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.KIDNEY_SUPPORT, HealthFocusType.GENERAL_WELLNESS],
    },
    {
      name: 'Orijen Guardian 8 Specialized Health Formula',
      slug: 'orijen-guardian-8-specialized-formula',
      brand: 'Orijen',
      categoryId: catDryFood.id,
      description: 'Crafted with 90% premium poultry and fish ingredients. Supports immune function, muscle maintenance, digestive health, healthy skin & coat, and heart wellness.',
      ingredients: 'Fresh chicken, fresh wild-caught salmon, turkey, whole herring, chicken liver, dehydrated mackerel, whole green lentils, cranberries.',
      price: 46.99,
      stockQuantity: 60,
      targetLifeStage: LifeStage.ALL_STAGES,
      isSpecialtyDiet: false,
      isFeatured: true,
      rating: 5.0,
      ratingCount: 210,
      imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.SKIN_AND_COAT, HealthFocusType.GENERAL_WELLNESS, HealthFocusType.HAIRBALL_CONTROL],
    },
    {
      name: 'Purina Pro Plan LiveClear Sensitive Skin & Stomach Kitten',
      slug: 'purina-pro-plan-liveclear-kitten-sensitive',
      brand: 'Purina Pro Plan',
      categoryId: catDryFood.id,
      description: 'Fortified with live probiotics for digestive & immune health in young kittens. Features gentle turkey as the #1 ingredient for sensitive stomachs.',
      ingredients: 'Turkey, rice, pea protein, dried egg product, beef fat, fish meal, natural flavor, chicory root, taurine.',
      price: 32.99,
      stockQuantity: 50,
      targetLifeStage: LifeStage.KITTEN,
      isSpecialtyDiet: true,
      isFeatured: true,
      rating: 4.9,
      ratingCount: 88,
      imageUrl: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.SENSITIVE_DIGESTION, HealthFocusType.SKIN_AND_COAT],
    },
    {
      name: 'Tiki Cat Aloha Friends Grain-Free Wet Mousse (Pack of 12)',
      slug: 'tiki-cat-aloha-friends-wet-mousse',
      brand: 'Tiki Cat',
      categoryId: catWetFood.id,
      description: 'Silky smooth chicken and pumpkin pureed mousse. Pumpkin provides gentle fiber to aid digestion, prevent constipation, and dissolve hairballs effortlessly.',
      ingredients: 'Chicken broth, chicken, pumpkin, sunflower seed oil, calcium lactate, dicalcium phosphate, taurine, vitamin E.',
      price: 24.99,
      stockQuantity: 80,
      targetLifeStage: LifeStage.ALL_STAGES,
      isSpecialtyDiet: true,
      isFeatured: false,
      rating: 4.7,
      ratingCount: 142,
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.HAIRBALL_CONTROL, HealthFocusType.SENSITIVE_DIGESTION],
    },
    {
      name: 'Feline Natural Freeze-Dried Raw Lamb & King Salmon',
      slug: 'feline-natural-freeze-dried-lamb-salmon',
      brand: 'Feline Natural',
      categoryId: catDryFood.id,
      description: 'New Zealand grass-fed lamb and sustainably caught King Salmon. Rich in natural omega fatty acids for glossy coats and lean muscle support.',
      ingredients: 'Lamb, lamb heart, king salmon, lamb kidney, lamb liver, lamb blood, flaxseed flakes, New Zealand green mussels.',
      price: 39.50,
      stockQuantity: 35,
      targetLifeStage: LifeStage.ADULT,
      isSpecialtyDiet: false,
      isFeatured: true,
      rating: 4.9,
      ratingCount: 75,
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.SKIN_AND_COAT, HealthFocusType.WEIGHT_MANAGEMENT],
    },
    {
      name: 'NekoKu 100% Pure Wild Alaskan Salmon Oil (250ml)',
      slug: 'nekoku-wild-alaskan-salmon-oil',
      brand: 'NekoKu Wellness',
      categoryId: catSupplements.id,
      description: 'Cold-pressed pure Alaskan salmon oil packed with EPA and DHA. Relieves itchy dry skin, eliminates excessive shedding, and supports joint mobility.',
      ingredients: '100% Wild Alaskan Salmon Oil, Mixed Tocopherols (natural preservative).',
      price: 19.99,
      stockQuantity: 100,
      targetLifeStage: LifeStage.ALL_STAGES,
      isSpecialtyDiet: true,
      isFeatured: true,
      rating: 5.0,
      ratingCount: 340,
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.SKIN_AND_COAT, HealthFocusType.GENERAL_WELLNESS],
    },
    {
      name: 'NekoKu Flushable Activated Charcoal Tofu Cat Litter (6L)',
      slug: 'nekoku-activated-charcoal-tofu-litter',
      brand: 'NekoKu Clean',
      categoryId: catLitter.id,
      description: '99.9% dust-free 2mm fine tofu pellets blended with activated bamboo charcoal. Instant 1.5-second clumping, paw-gentle, and 100% biodegradable & flushable.',
      ingredients: 'Natural pea fiber, food-grade cornstarch, activated bamboo charcoal microparticles, guar gum.',
      price: 15.99,
      stockQuantity: 120,
      targetLifeStage: LifeStage.ALL_STAGES,
      isSpecialtyDiet: false,
      isFeatured: true,
      rating: 4.9,
      ratingCount: 412,
      imageUrl: 'https://images.unsplash.com/photo-1615789591457-74a63395c990?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.GENERAL_WELLNESS],
    },
    {
      name: 'Vet\'s Best Feline Urinary Tract Chewables (60 Tablets)',
      slug: 'vets-best-urinary-tract-chewables',
      brand: 'Vet\'s Best',
      categoryId: catSupplements.id,
      description: 'Veterinarian-formulated chewable bites with cranberry extract, D-mannose, and marshmallow root to maintain normal urinary tract health and pH balance.',
      ingredients: 'Cranberry extract, D-mannose, marshmallow root, brewer\'s dried yeast, chicken liver flavor.',
      price: 18.25,
      stockQuantity: 70,
      targetLifeStage: LifeStage.ADULT,
      isSpecialtyDiet: true,
      isFeatured: false,
      rating: 4.8,
      ratingCount: 67,
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.URINARY_CARE],
    },
    {
      name: 'Hill\'s Science Diet Adult Light Hairball Control',
      slug: 'hills-science-diet-light-hairball',
      brand: 'Hill\'s Science Diet',
      categoryId: catDryFood.id,
      description: 'Provides precise nutrition for less active adult cats requiring a low-calorie diet to maintain a healthy weight while natural fibers reduce hairball formation.',
      ingredients: 'Chicken, whole grain wheat, corn gluten meal, powdered cellulose, pea fiber, dried tomato pomace, L-carnitine.',
      price: 42.99,
      stockQuantity: 40,
      targetLifeStage: LifeStage.ADULT,
      isSpecialtyDiet: true,
      isFeatured: false,
      rating: 4.6,
      ratingCount: 95,
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.HAIRBALL_CONTROL, HealthFocusType.WEIGHT_MANAGEMENT],
    },
    {
      name: 'Royal Canin Mother & Babycat Ultra Soft Mousse Can',
      slug: 'royal-canin-mother-babycat-mousse',
      brand: 'Royal Canin',
      categoryId: catWetFood.id,
      description: 'Ultra-soft mousse texture designed for weaning kittens (1 to 4 months old) and lactating queens. Enhanced with DHA for cognitive brain development.',
      ingredients: 'Water sufficient for processing, chicken, chicken liver, pork by-products, wheat gluten, fish oil, marigold extract.',
      price: 2.89,
      stockQuantity: 200,
      targetLifeStage: LifeStage.KITTEN,
      isSpecialtyDiet: true,
      isFeatured: true,
      rating: 5.0,
      ratingCount: 156,
      imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.SENSITIVE_DIGESTION, HealthFocusType.GENERAL_WELLNESS],
    },
    {
      name: 'ProDen PlaqueOff Dental Powder for Cats (40g)',
      slug: 'proden-plaqueoff-dental-powder',
      brand: 'ProDen PlaqueOff',
      categoryId: catSupplements.id,
      description: '100% natural organic sea kelp powder sprinkled daily onto food. Clinically proven to reduce plaque, tartar buildup, and bad breath naturally through saliva.',
      ingredients: 'Specially selected Norwegian seaweed (A.N ProDen).',
      price: 21.50,
      stockQuantity: 65,
      targetLifeStage: LifeStage.ALL_STAGES,
      isSpecialtyDiet: true,
      isFeatured: false,
      rating: 4.9,
      ratingCount: 180,
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      healthFocuses: [HealthFocusType.DENTAL_CARE],
    },
  ];

  for (const item of productsData) {
    const { healthFocuses, imageUrl, ...prodData } = item;
    await prisma.product.create({
      data: {
        ...prodData,
        images: {
          create: [{ url: imageUrl, isPrimary: true }],
        },
        healthFocuses: {
          create: healthFocuses.map((hf) => ({ focus: hf })),
        },
      },
    });
  }

  console.log(`✅ Seeded ${productsData.length} specialty cat products with health tags!`);

  // 6. Create Seeded Orders for Admin User
  const sampleProduct1 = await prisma.product.findFirst({ where: { slug: 'royal-canin-feline-urinary-so' } });
  const sampleProduct2 = await prisma.product.findFirst({ where: { slug: 'nekoku-activated-charcoal-tofu-litter' } });
  const sampleProduct3 = await prisma.product.findFirst({ where: { slug: 'nekoku-wild-alaskan-salmon-oil' } });

  const defaultAddr = await prisma.address.findFirst({ where: { userId: admin.id } });

  if (sampleProduct1 && sampleProduct2 && defaultAddr) {
    await prisma.order.create({
      data: {
        orderNumber: 'NK-20260908-4821',
        userId: admin.id,
        addressId: defaultAddr.id,
        subtotal: 70.98,
        shippingFee: 0.00,
        totalAmount: 70.98,
        status: OrderStatus.SHIPPED,
        paymentMethod: 'MOCK_VISA_SIMULATION',
        paymentId: 'SIM_PAY_1788949210000',
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: sampleProduct1.id,
              productName: sampleProduct1.name,
              unitPrice: sampleProduct1.price,
              quantity: 1,
              totalPrice: sampleProduct1.price,
            },
            {
              productId: sampleProduct2.id,
              productName: sampleProduct2.name,
              unitPrice: sampleProduct2.price,
              quantity: 1,
              totalPrice: sampleProduct2.price,
            },
          ],
        },
      },
    });

    if (sampleProduct3) {
      await prisma.order.create({
        data: {
          orderNumber: 'NK-20260910-9104',
          userId: admin.id,
          addressId: defaultAddr.id,
          subtotal: 19.99,
          shippingFee: 4.99,
          totalAmount: 24.98,
          status: OrderStatus.PROCESSING,
          paymentMethod: 'MOCK_VISA_SIMULATION',
          paymentId: 'SIM_PAY_1789035966000',
          paidAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          items: {
            create: [
              {
                productId: sampleProduct3.id,
                productName: sampleProduct3.name,
                unitPrice: sampleProduct3.price,
                quantity: 1,
                totalPrice: sampleProduct3.price,
              },
            ],
          },
        },
      });
    }

    console.log('✅ Created 2 sample orders for admin@nekoku.my');
  }

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
