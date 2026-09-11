export type Role = 'CUSTOMER' | 'ADMIN';

export type LifeStage = 'KITTEN' | 'ADULT' | 'SENIOR' | 'ALL_STAGES';

export type HealthFocusType =
  | 'URINARY_CARE'
  | 'HAIRBALL_CONTROL'
  | 'SENSITIVE_DIGESTION'
  | 'WEIGHT_MANAGEMENT'
  | 'KIDNEY_SUPPORT'
  | 'SKIN_AND_COAT'
  | 'DENTAL_CARE'
  | 'GENERAL_WELLNESS';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: Role;
  catProfiles?: CatProfile[];
}

export interface CatHealthConcern {
  id?: string;
  condition: HealthFocusType;
}

export interface CatProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  breed?: string;
  birthDate?: string;
  lifeStage: LifeStage;
  weightKg?: number;
  isNeutered: boolean;
  allergies?: string;
  healthConcerns: CatHealthConcern[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface ProductHealthFocus {
  id: string;
  focus: HealthFocusType;
}

export interface Product {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  slug: string;
  brand: string;
  description: string;
  ingredients?: string;
  price: string | number;
  stockQuantity: number;
  targetLifeStage: LifeStage;
  isSpecialtyDiet: boolean;
  isFeatured: boolean;
  rating: number;
  ratingCount: number;
  images: ProductImage[];
  healthFocuses: ProductHealthFocus[];
  
  // Dynamic fields from recommendation engine
  matchScore?: number;
  matchReasons?: string[];
  isIdealMatch?: boolean;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

export interface OrderItem {
  id: string;
  productName: string;
  unitPrice: number | string;
  quantity: number;
  totalPrice: number | string;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: { fullName: string; email: string };
  subtotal: number | string;
  shippingFee: number | string;
  totalAmount: number | string;
  status: OrderStatus;
  paymentMethod: string;
  paidAt?: string;
  createdAt: string;
  items: OrderItem[];
}
