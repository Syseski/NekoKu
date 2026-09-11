import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { formatRM } from '../../utils/format';
import { Package, Search, Clock, Eye, Truck, CheckCircle2, X } from 'lucide-react';

interface AdminOrderSectionProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  selectedOrderForModal: Order | null;
  onSelectOrderForModal: (order: Order | null) => void;
}

export const AdminOrderSection: React.FC<AdminOrderSectionProps> = ({
  orders,
  onUpdateStatus,
  selectedOrderForModal,
  onSelectOrderForModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.fullName && order.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' ? true : order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Paid ✓</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">Processing 📦</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">Shipped 🚚</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">Delivered 🎉</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">Cancelled ✖</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order #, customer name, email..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Order Status ({orders.length})</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing / Packed</option>
            <option value="SHIPPED">Shipped (In Transit)</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer Info</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4">Items Count</th>
                <th className="py-3.5 px-4">Total (RM)</th>
                <th className="py-3.5 px-4">Status & Pipeline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{order.user?.fullName || 'Customer'}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{order.user?.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {order.items?.length || 0} items
                    </td>
                    <td className="py-3.5 px-4 font-black font-sans text-slate-900 text-sm">
                      {formatRM(order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Pipeline Status Selector */}
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="PENDING_PAYMENT">PENDING</option>
                        <option value="PAID">PAID (Confirmed)</option>
                        <option value="PROCESSING">PROCESSING (Packing)</option>
                        <option value="SHIPPED">SHIPPED (In Transit)</option>
                        <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectOrderForModal(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-brand-700 font-bold text-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No orders found for this criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-orange-100 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Details</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="font-extrabold text-slate-900 text-lg">{selectedOrderForModal.orderNumber}</h3>
                  {getStatusBadge(selectedOrderForModal.status)}
                </div>
              </div>
              <button
                onClick={() => onSelectOrderForModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Customer & Delivery Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Customer Information
                  </span>
                  <p className="font-bold text-slate-900">{selectedOrderForModal.user?.fullName || 'NekoKu Customer'}</p>
                  <p className="text-slate-500">{selectedOrderForModal.user?.email}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Shipping Address
                  </span>
                  <p className="font-semibold text-slate-800">
                    No. 18, Jalan Neko Sakura, Bukit Bintang
                  </p>
                  <p className="text-slate-500">55100, Kuala Lumpur, Malaysia</p>
                  <p className="text-brand-600 font-bold mt-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Courier: Flash / J&T Express (Tracking: NK-MY-{selectedOrderForModal.orderNumber.slice(-4)})
                  </p>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Order Items List
                </span>
                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrderForModal.items?.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 text-brand-800 font-bold flex items-center justify-center text-[11px]">
                          {item.quantity}x
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <p className="text-[10px] text-slate-400 font-sans">{formatRM(item.unitPrice)} per unit</p>
                        </div>
                      </div>
                      <span className="font-bold font-sans text-slate-900 text-sm">
                        {formatRM(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold font-sans">{formatRM(selectedOrderForModal.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee (Express):</span>
                  <span className="font-bold font-sans">
                    {Number(selectedOrderForModal.shippingFee) === 0 ? 'FREE' : formatRM(selectedOrderForModal.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-1.5 border-t border-orange-200">
                  <span>Total Amount:</span>
                  <span className="text-brand-600 font-sans">{formatRM(selectedOrderForModal.totalAmount)}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Payment Method: <strong>{selectedOrderForModal.paymentMethod.replace(/_/g, ' ')}</strong>
              </span>
              <button
                onClick={() => onSelectOrderForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
