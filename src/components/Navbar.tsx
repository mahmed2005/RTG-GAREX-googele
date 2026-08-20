import React, { useState } from 'react';
import { useStore, PageType } from '../context/StoreContext';
import { Logo } from './Logo';
import { MobileDrawer } from './MobileDrawer';
import { ShoppingBag, Menu, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPage, setCurrentPage, cartItemsCount, setIsCartOpen } = useStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navLinks: { id: PageType; label: string }[] = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'products', label: 'المنتجات' },
    { id: 'pubg_accounts', label: 'حسابات PUBG' },
    { id: 'pubg_uc', label: 'شدات PUBG' },
    { id: 'contact', label: 'تواصل معنا' },
  ];

  return (
    <>
      <header
        id="main-navbar"
        className="sticky top-0 z-40 w-full bg-[#0e1017]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Right Side: Hamburger (Mobile) + Cart Button */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-colors md:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Shopping Cart Button */}
            <button
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-all hover:border-red-500/40 group"
              aria-label="عرض سلة المشتريات"
            >
              <ShoppingBag className="w-6 h-6 group-hover:text-red-400 transition-colors" />
              {cartItemsCount > 0 && (
                <span
                  id="header-cart-count-badge"
                  className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-900/80 animate-pulse"
                >
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>

          {/* Center / Desktop Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  id={`desktop-nav-${link.id}`}
                  onClick={() => setCurrentPage(link.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${
                    isActive
                      ? 'text-red-400 bg-red-600/10 border border-red-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-500 rounded-full glow-red-sm" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Left Side: Brand Logo */}
          <Logo
            size="md"
            onClick={() => setCurrentPage('home')}
            className="cursor-pointer"
          />
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};
