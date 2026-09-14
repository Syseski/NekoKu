import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CatProfilesPage } from './pages/CatProfilesPage';
import { OrdersPage } from './pages/OrdersPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { useAuthStore } from './store/authStore';
import { useCatStore } from './store/catStore';
import { useCartStore } from './store/cartStore';

export const App: React.FC = () => {
  const { user, fetchMe, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuthStore();
  const { fetchCats } = useCatStore();
  const { fetchCart } = useCartStore();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user && !isAdmin) {
      fetchCats();
      fetchCart();
    }
  }, [user, isAdmin]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
        {/* Header */}
        <Navbar onOpenAuthModal={openAuthModal} />

        {/* Main Content Pages */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/account"
              element={<AccountPage />}
            />
            <Route
              path="/profile"
              element={<AccountPage />}
            />
            <Route
              path="/cats"
              element={user && !isAdmin ? <CatProfilesPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/orders"
              element={user && !isAdmin ? <OrdersPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/admin"
              element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Slide-Over Drawers & Modals (Customers Only) */}
        {!isAdmin && (
          <>
            <CartDrawer onOpenAuth={openAuthModal} />
            <CheckoutModal />
          </>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
        />

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;

