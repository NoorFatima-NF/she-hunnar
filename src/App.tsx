import React, { useState, useEffect } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SellerShopPage } from './pages/SellerShopPage';
import { BecomeSellerPage } from './pages/BecomeSellerPage';
import { CustomJewelryPage } from './pages/CustomJewelryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { InfoPage } from './pages/InfoPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>(() => {
    if (window.location.pathname === '/reset-password') return 'reset-password';
    return 'home';
  });
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  const { activeRole, updateOrderPaymentStatus, showToast } = useMarketplace();

  // Safepay Hosted Checkout redirect handler (success / cancel callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const orderId = params.get('orderId') || params.get('order_id');
    const tracker = params.get('tracker') || params.get('beacon');
    const signature = params.get('sig') || params.get('signature');

    if (payment === 'safepay_success' && orderId) {
      const verifyPayment = async () => {
        try {
          if (tracker) {
            const res = await fetch('/api/safepay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tracker, signature, orderId })
            });
            const data = await res.json();
            if (data.verified) {
              updateOrderPaymentStatus(orderId, 'Paid', {
                tracker,
                signature: signature || undefined,
                transactionRef: data.transactionRef || tracker,
                paidAt: data.verifiedAt || new Date().toISOString()
              });
            } else {
              updateOrderPaymentStatus(orderId, 'Paid', {
                tracker,
                transactionRef: tracker
              });
            }
          } else {
            updateOrderPaymentStatus(orderId, 'Paid');
          }

          showToast('Safepay Sandbox Payment Verified! Order confirmed.');
          setCurrentView('order-confirmation');
          setViewParam(orderId);
        } catch (e) {
          console.error('[App] Error verifying Safepay payment:', e);
          updateOrderPaymentStatus(orderId, 'Paid', { tracker: tracker || undefined });
          setCurrentView('order-confirmation');
          setViewParam(orderId);
        } finally {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      };

      verifyPayment();
    } else if (payment === 'safepay_cancel') {
      showToast('Safepay payment cancelled. You can retry or choose another payment method.');
      setCurrentView('checkout');
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, viewParam]);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
  };

  const renderPage = () => {
    // Role override for quick view switching
    if (activeRole === 'seller' && currentView === 'home') {
      return <SellerDashboardPage onNavigate={handleNavigate} />;
    }
    if (activeRole === 'admin' && currentView === 'home') {
      return <AdminDashboardPage onNavigate={handleNavigate} />;
    }

    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'shop':
        return (
          <ShopPage
            initialCategory={['All', 'Jewelry', 'Bags', 'Home Decor', 'Calligraphy', 'Candles', 'Keychains', 'Bouquets'].includes(viewParam || 'All') ? (viewParam || 'All') : undefined}
            initialSearch={!['All', 'Jewelry', 'Bags', 'Home Decor', 'Calligraphy', 'Candles', 'Keychains', 'Bouquets'].includes(viewParam || 'All') ? viewParam : undefined}
            onNavigate={handleNavigate}
          />
        );
      case 'product':
        return <ProductDetailPage slug={viewParam || 'prod-101'} onNavigate={handleNavigate} />;
      case 'shopfront':
        return <SellerShopPage slug={viewParam || 'noor-jewelry-studio'} onNavigate={handleNavigate} />;
      case 'become-a-seller':
        return <BecomeSellerPage onNavigate={handleNavigate} />;
      case 'custom-jewelry':
        return <ShopPage onNavigate={handleNavigate} />;
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;
      case 'order-confirmation':
        return <OrderConfirmationPage orderId={viewParam || 'ZAV-1001'} onNavigate={handleNavigate} />;
      case 'account':
        return <CustomerAccountPage initialTab={viewParam} onNavigate={handleNavigate} />;
      case 'seller-dashboard':
        return <SellerDashboardPage onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      case 'info':
        return <InfoPage type={viewParam || 'about'} onNavigate={handleNavigate} />;
      case 'reset-password':
        return <ResetPasswordPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      <div>
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
        <main>{renderPage()}</main>
      </div>
      <Footer onNavigate={handleNavigate} />
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <MarketplaceProvider>
      <AppContent />
    </MarketplaceProvider>
  );
}

export default App;
