import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product, Category, Order, OrderStatus } from '../types';
import { AdminOverviewSection } from '../components/admin/AdminOverviewSection';
import { AdminProductSection } from '../components/admin/AdminProductSection';
import { AdminOrderSection } from '../components/admin/AdminOrderSection';
import { AdminCategorySection } from '../components/admin/AdminCategorySection';
import { AdminUserSection } from '../components/admin/AdminUserSection';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Users,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

type AdminTab = 'overview' | 'products' | 'orders' | 'categories' | 'users';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      else setIsRefreshing(true);

      const [overviewRes, prodRes, catRes, ordRes, usrRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/products?limit=100'),
        api.get('/categories'),
        api.get('/admin/orders'),
        api.get('/admin/users'),
      ]);

      setOverviewData(overviewRes.data.data);
      setProducts(prodRes.data.data.products);
      setCategories(catRes.data.data);
      setOrders(ordRes.data.data);
      setUsers(usrRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStockChange = async (productId: string, newStock: number) => {
    try {
      await api.patch(`/admin/products/${productId}/stock`, { stockQuantity: newStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stockQuantity: newStock } : p))
      );
    } catch (err) {
      alert('Failed to update stock quantity');
    }
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrderForModal && selectedOrderForModal.id === orderId) {
        setSelectedOrderForModal({ ...selectedOrderForModal, status: newStatus });
      }
      // Refresh overview KPIs in background
      const overviewRes = await api.get('/admin/overview');
      setOverviewData(overviewRes.data.data);
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await api.delete(`/admin/products/${productId}`);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        const overviewRes = await api.get('/admin/overview');
        setOverviewData(overviewRes.data.data);
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const tabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string }[] = [
    {
      id: 'overview',
      label: '1. Overview Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'products',
      label: '2. Product Catalog & CRUD',
      icon: Package,
      badge: products.length,
    },
    {
      id: 'orders',
      label: '3. Order Management',
      icon: ShoppingBag,
      badge: overviewData?.kpis?.activeOrders > 0 ? `${overviewData.kpis.activeOrders} Active` : orders.length,
    },
    {
      id: 'categories',
      label: '4. Category Management',
      icon: Layers,
      badge: categories.length,
    },
    {
      id: 'users',
      label: '5. Users & Cat Profiles',
      icon: Users,
      badge: users.length,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-5">
            
            {/* Admin Profile Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black shadow-xs flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-black text-slate-900 truncate">NekoKu Admin</h2>
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-wider">
                    Master
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">Control Center (RM)</p>
              </div>
            </div>

            {/* Vertical Menu Items */}
            <nav className="space-y-1.5">
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Main Menu
              </p>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all text-left ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{tab.label.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black flex-shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Actions in Sidebar */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => fetchData(false)}
                disabled={isRefreshing}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition disabled:opacity-50 border border-slate-200/60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-600' : 'text-slate-400'}`} />
                <span>{isRefreshing ? 'Refreshing Data...' : 'Refresh Data'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {/* Header breadcrumb / banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {activeTab === 'overview' && 'Live store metrics, revenue trends, and recent customer activity.'}
                {activeTab === 'products' && 'Manage your catalog, stock levels, categories, and feline health tags.'}
                {activeTab === 'orders' && 'Track order status, manage fulfillment pipelines, and view customer invoices.'}
                {activeTab === 'categories' && 'Organize cat foods, treats, toys, and care supplies by categories.'}
                {activeTab === 'users' && 'Review registered cat parents and their personalized feline health profiles.'}
              </p>
            </div>
          </div>

          {/* Active Section Content */}
          {isLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs space-y-3 animate-pulse">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading NekoKu admin data...</p>
            </div>
          ) : (
            <div key={activeTab} className="animate-fade-in">
              {/* Section 1: Overview Dashboard */}
              {activeTab === 'overview' && (
                <AdminOverviewSection
                  overviewData={overviewData}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onSelectOrder={(order) => {
                    setSelectedOrderForModal(order);
                    setActiveTab('orders');
                  }}
                />
              )}

              {/* Section 2: Product Management CRUD */}
              {activeTab === 'products' && (
                <AdminProductSection
                  products={products}
                  categories={categories}
                  onRefresh={() => fetchData(false)}
                  onUpdateStock={handleStockChange}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {/* Section 3: Order Management & Fulfillment Pipeline */}
              {activeTab === 'orders' && (
                <AdminOrderSection
                  orders={orders}
                  onUpdateStatus={handleOrderStatusChange}
                  selectedOrderForModal={selectedOrderForModal}
                  onSelectOrderForModal={setSelectedOrderForModal}
                />
              )}

              {/* Section 4: Category Management CRUD */}
              {activeTab === 'categories' && (
                <AdminCategorySection
                  categories={categories}
                  onRefresh={() => fetchData(false)}
                />
              )}

              {/* Section 5: Users & Registered Cat Profiles Review */}
              {activeTab === 'users' && (
                <AdminUserSection
                  users={users}
                />
              )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
