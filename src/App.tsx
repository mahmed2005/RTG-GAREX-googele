import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { FeaturesSection } from './components/FeaturesSection';
import { LatestProducts } from './components/LatestProducts';
import { DirectOrderBanner } from './components/DirectOrderBanner';
import { ProductsPage } from './components/ProductsPage';
import { PubgAccountsPage } from './components/PubgAccountsPage';
import { PubgUcPage } from './components/PubgUcPage';
import { ContactPage } from './components/ContactPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PubgUcModal } from './components/PubgUcModal';
import { PubgAccountModal } from './components/PubgAccountModal';
import { SellAccountModal } from './components/SellAccountModal';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { currentPage, setCurrentPage } = useStore();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rtg_admin_authenticated') === 'true';
  });

  // Support direct secret URL access via #admin or ?page=admin
  useEffect(() => {
    const handleUrlCheck = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#admin' || hash === '#/admin' || search.includes('page=admin') || search.includes('admin=true')) {
        setCurrentPage('admin');
      }
    };

    handleUrlCheck();
    window.addEventListener('hashchange', handleUrlCheck);
    return () => window.removeEventListener('hashchange', handleUrlCheck);
  }, [setCurrentPage]);

  // Keep auth state in sync with session
  useEffect(() => {
    if (currentPage === 'admin') {
      const isAuth = sessionStorage.getItem('rtg_admin_authenticated') === 'true';
      setIsAdminAuthenticated(isAuth);
    }
  }, [currentPage]);

  // Scroll to top smoothly on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e0e2ec] flex flex-col font-['Cairo',sans-serif] selection:bg-red-600 selection:text-white">
      {/* 2.5s Luxury Splash Screen on site open */}
      {showSplash && (
        <SplashScreen
          duration={2500}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Navbar */}
      <Navbar />

      {/* Main Content Pages with Smooth Motion Transition */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {currentPage === 'home' && (
              <>
                <HomeHero />
                <FeaturesSection />
                <LatestProducts />
                <DirectOrderBanner />
              </>
            )}

            {currentPage === 'products' && <ProductsPage />}
            {currentPage === 'pubg_accounts' && <PubgAccountsPage />}
            {currentPage === 'pubg_uc' && <PubgUcPage />}
            {currentPage === 'contact' && <ContactPage />}
            {currentPage === 'admin' && (
              isAdminAuthenticated ? (
                <AdminDashboard />
              ) : (
                <AdminLogin
                  onLoginSuccess={() => setIsAdminAuthenticated(true)}
                  onCancel={() => setCurrentPage('home')}
                />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <CheckoutModal />
      <PubgUcModal />
      <PubgAccountModal />
      <SellAccountModal />
      <VideoPreviewModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
