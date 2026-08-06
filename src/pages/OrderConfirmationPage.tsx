import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatPKR } from '../utils/format';
import {
  CheckCircle,
  Package,
  Truck,
  ArrowRight,
  Store,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface OrderConfirmationPageProps {
  orderId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  onNavigate
}) => {
  const { orders } = useMarketplace();

  const order = orders.find((o) => o.id === orderId || o.masterOrderId === orderId) || orders[0];

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-xs text-stone-500">Order not found.</p>
        <button onClick={() => onNavigate('shop')} className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold">
          Return to Shop
        </button>
      </div>
    );
  }

  const subOrdersList = order.subOrders || order.sellerOrders || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-emerald-50 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-md">
        <div className="w-16 h-16 rounded-full bg-emerald-800 text-emerald-300 flex items-center justify-center mx-auto border-2 border-emerald-400">
          <CheckCircle size={36} />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold">
          Order Successfully Placed!
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm font-light max-w-lg mx-auto leading-relaxed">
          Thank you for supporting independent Pakistani craft makers. Your order ID is{' '}
          <span className="font-mono font-bold text-amber-300">{order.masterOrderId || order.id}</span>.
        </p>
      </div>

      {/* Summary Details */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-stone-200 text-xs">
          <div>
            <span className="text-stone-400 block uppercase font-bold text-[10px]">Date Placed</span>
            <span className="font-semibold text-stone-900">{order.createdAt}</span>
          </div>
          <div>
            <span className="text-stone-400 block uppercase font-bold text-[10px]">Payment Method</span>
            <span className="font-semibold text-stone-900">{order.paymentMethod}</span>
          </div>
          <div>
            <span className="text-stone-400 block uppercase font-bold text-[10px]">Delivery Address</span>
            <span className="font-semibold text-stone-900">{order.addressLine || order.shippingAddress?.addressLine}, {order.city || order.shippingAddress?.city}</span>
          </div>
        </div>

        {/* Sub-Orders Breakdown */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-stone-900 text-base">
            Sub-Orders Dispatched to Seller Studios ({subOrdersList.length})
          </h3>

          <div className="space-y-4">
            {subOrdersList.map((sub) => (
              <div key={sub.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-amber-800" />
                    <span className="font-bold text-stone-900">{sub.sellerShopName}</span>
                    <span className="text-[10px] font-mono text-stone-400">({sub.subOrderId})</span>
                  </div>

                  <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full capitalize">
                    Status: {sub.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2">
                  {sub.items.map((i) => (
                    <div key={i.id} className="flex justify-between items-center text-stone-800">
                      <span>
                        {i.quantity}x {i.productTitle}
                      </span>
                      <span className="font-semibold">{formatPKR(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-[11px] text-stone-500 pt-2 border-t border-stone-200 font-medium">
                  <span>Shipping Fee: {formatPKR(sub.shippingFee)}</span>
                  <span>
                    Sub-order Total: <span className="font-bold text-stone-900">{formatPKR(sub.totalAmount)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grand Total */}
        <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline text-stone-950 font-bold text-lg">
          <span>Master Order Grand Total:</span>
          <span className="font-sans text-2xl text-amber-950">{formatPKR(order.grandTotal)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => onNavigate('account')}
          className="px-6 py-3 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
        >
          Track Order in Customer Account
        </button>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 border border-stone-300 text-stone-800 rounded-xl text-xs font-bold hover:bg-stone-50"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
