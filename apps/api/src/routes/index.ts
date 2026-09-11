import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as catController from '../controllers/cat.controller';
import * as productController from '../controllers/product.controller';
import * as categoryController from '../controllers/category.controller';
import * as cartController from '../controllers/cart.controller';
import * as orderController from '../controllers/order.controller';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.getMe);

// --- Cat Profiles & Smart Recommendations ---
router.get('/cats', authenticate, catController.getMyCats);
router.post('/cats', authenticate, catController.createCat);
router.get('/cats/:id', authenticate, catController.getCatById);
router.put('/cats/:id', authenticate, catController.updateCat);
router.delete('/cats/:id', authenticate, catController.deleteCat);
router.get('/cats/:id/recommendations', authenticate, catController.getRecommendationsForCat);

// --- Public Product Catalog & Categories ---
router.get('/categories', categoryController.getCategories);
router.get('/products', productController.getProducts);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products/:slug', productController.getProductBySlug);

// --- Cart Operations ---
router.get('/cart', authenticate, cartController.getCart);
router.post('/cart/items', authenticate, cartController.addItemToCart);
router.patch('/cart/items/:itemId', authenticate, cartController.updateCartItem);
router.delete('/cart/items/:itemId', authenticate, cartController.removeCartItem);
router.delete('/cart', authenticate, cartController.clearCart);

// --- Orders & Simulated Checkout ---
router.post('/checkout/simulate', authenticate, orderController.simulateCheckout);
router.get('/orders', authenticate, orderController.getMyOrders);
router.get('/orders/:id', authenticate, orderController.getOrderById);

// --- 5 Admin Modules ---
// 1. Overview Dashboard
router.get('/admin/overview', authenticate, requireAdmin, adminController.getAdminOverview);

// 2. Product Management
router.post('/admin/products', authenticate, requireAdmin, adminController.createProduct);
router.put('/admin/products/:id', authenticate, requireAdmin, adminController.updateProduct);
router.patch('/admin/products/:id/stock', authenticate, requireAdmin, adminController.updateProductStock);
router.delete('/admin/products/:id', authenticate, requireAdmin, adminController.deleteProduct);

// 3. Order Management
router.get('/admin/orders', authenticate, requireAdmin, adminController.getAllOrdersAdmin);
router.patch('/admin/orders/:id/status', authenticate, requireAdmin, adminController.updateOrderStatusAdmin);

// 4. Category Management
router.post('/admin/categories', authenticate, requireAdmin, adminController.createCategoryAdmin);
router.put('/admin/categories/:id', authenticate, requireAdmin, adminController.updateCategoryAdmin);
router.delete('/admin/categories/:id', authenticate, requireAdmin, adminController.deleteCategoryAdmin);

// 5. User & Pet Profiles
router.get('/admin/users', authenticate, requireAdmin, adminController.getUsersWithCatsAdmin);

export default router;
