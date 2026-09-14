import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Address } from '../../types';
import { X, CheckCircle, ShieldCheck, PackageCheck, ArrowRight, MapPin, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { formatRM } from '../../utils/format';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutModalOpen, closeCheckoutModal, cart, simulateCheckout } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Kuala Lumpur');
  const [postalCode, setPostalCode] = useState('50480');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isCheckoutModalOpen && user) {
      api.get('/addresses')
        .then((res) => {
          if (res.data.success && res.data.data.length > 0) {
            const addrs: Address[] = res.data.data;
            setAddresses(addrs);
            const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
            setSelectedAddressId(defaultAddr.id);
            setRecipientName(defaultAddr.recipientName);
            setStreetAddress(defaultAddr.streetAddress);
            setCity(defaultAddr.city);
            setPostalCode(defaultAddr.postalCode);
          } else {
            setRecipientName(user.fullName || '');
            setStreetAddress('');
            setCity('Kuala Lumpur');
            setPostalCode('50480');
          }
        })
        .catch(() => {
          setRecipientName(user.fullName || '');
        });
    }
  }, [isCheckoutModalOpen, user]);

  const handleSelectAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    const found = addresses.find((a) => a.id === addrId);
    if (found) {
      setRecipientName(found.recipientName);
      setStreetAddress(found.streetAddress);
      setCity(found.city);
      setPostalCode(found.postalCode);
    }
  };

  if (!isCheckoutModalOpen) return null;

  const subtotal = cart?.subtotal || 0;
  const shippingFee = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + shippingFee;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      setError('');

      // Simulate payment network delay (1.2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const order = await simulateCheckout({
        addressId: selectedAddressId || undefined,
        recipientName,
        streetAddress,
        city,
        postalCode,
        paymentMethod: 'MOCK_VISA_SIMULATION',
      });

      setOrderCompleted(order);
      setIsProcessing(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Checkout failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-orange-100 max-h-[90vh] flex flex-col animate-modal-spring">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Simulated Checkout Gateway</h3>
              <p className="text-[11px] text-slate-500">Test order flow with live stock deduction</p>
            </div>
          </div>
          <button
            onClick={closeCheckoutModal}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {orderCompleted ? (
            /* Order Completed Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Mock Order Successful</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Thank you for caring for your cats! 🐾</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Order <strong className="text-slate-900">{orderCompleted.orderNumber}</strong> has been created and inventory was deducted.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="font-bold text-slate-900">{recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Address:</span>
                  <span className="font-semibold text-slate-700">{streetAddress}, {city}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                  <span>Total Paid:</span>
                  <span className="text-brand-600">{formatRM(total)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    closeCheckoutModal();
                    navigate('/orders');
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  View in Order History
                </button>
                <button
                  onClick={closeCheckoutModal}
                  className="py-3 px-4 rounded-2xl bg-orange-50 text-brand-700 hover:bg-orange-100 font-bold text-xs transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handlePay} className="space-y-4">
              {error && (
                <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Saved Address Selector */}
              {addresses.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Select Saved Address
                  </label>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => handleSelectAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.recipientName} ({a.streetAddress}, {a.city}) {a.isDefault ? '— Default' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Delivery Address Details */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Delivery Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    required
                  />
                </div>
              </div>

              {/* Payment Card Simulation */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Simulated Payment Method</p>
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 bg-white/10 rounded-md flex items-center justify-center font-black text-[10px] tracking-wider text-amber-300">
                      VISA
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest">{cardNumber}</p>
                      <p className="text-[10px] text-slate-400">Mock Card for Demonstration</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>

              {/* Summary */}
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Items ({cart?.totalItems}):</span>
                  <span className="font-bold font-sans">{formatRM(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee:</span>
                  <span className="font-bold font-sans">{shippingFee === 0 ? 'FREE' : formatRM(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-1.5 border-t border-orange-200/60">
                  <span>Total:</span>
                  <span className="text-brand-600 font-sans">{formatRM(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !cart?.items?.length}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition hover:scale-[1.01] disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Simulating Transaction...
                  </span>
                ) : (
                  <>
                    <span>Confirm & Pay {formatRM(total)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
