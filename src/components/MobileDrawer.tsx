import React from 'react';
import { useStore, PageType } from '../context/StoreContext';
import { Logo } from './Logo';
import { 
  Home, 
  Gamepad2, 
  UserCheck, 
  Zap, 
  PhoneCall, 
  ShieldCheck, 
  X, 
  Settings, 
  MessageCircle,
  ExternalLink,
  Search,
  Truck
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, onOpenSearch }) => {
  const { currentPage, setCurrentPage, settings } = useStore();

  if (!isOpen) return null;

  const navItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
    { id: 'products', label: 'المنتجات', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'pubg_accounts', label: 'حسابات PUBG', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'pubg_uc', label: 'شدات PUBG', icon: <Zap className="w-5 h-5" /> },
    { id: 'delivery_rates', label: 'أسعار التوصيل', icon: <Truck className="w-5 h-5" /> },
    { id: 'contact', label: 'تواصل معنا', icon: <PhoneCall className="w-5 h-5" /> },
  ];

  const handleNav = (page: PageType) => {
    setCurrentPage(page);
    onClose();
  };

  const handleSearchClick = () => {
    onClose();
    if (onOpenSearch) {
      onOpenSearch();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="drawer-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      />

      {/* Slide Drawer Content */}
      <div
        id="nav-drawer-content"
        className="absolute inset-y-0 right-0 max-w-[320px] w-full bg-[#10121a] border-l border-white/10 shadow-2xl flex flex-col justify-between p-6 transform transition-transform duration-300 ease-out z-10"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <Logo size="sm" onClick={() => handleNav('home')} />
            <button
              id="close-drawer-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Search Button in Mobile Menu */}
          <button
            onClick={handleSearchClick}
            className="w-full mt-4 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/40 rounded-xl flex items-center justify-between text-slate-300 text-xs font-bold transition-all"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-red-400" />
              <span>بحث شامل في المتجر...</span>
            </span>
            <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded-md font-mono">
              بحث
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="mt-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const isAdmin = item.id === 'admin';
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-base transition-all text-right w-full ${
                    isActive
                      ? 'bg-red-600/15 text-red-400 border border-red-500/30'
                      : isAdmin
                      ? 'bg-white/5 text-amber-400/90 hover:bg-amber-500/10 hover:text-amber-300'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={isActive ? 'text-red-400' : isAdmin ? 'text-amber-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isAdmin && (
                    <span className="mr-auto text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-mono">
                      ADMIN
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Direct WhatsApp Support */}
        <div className="pt-6 border-t border-white/10 space-y-4">
          <a
            id="drawer-whatsapp-btn"
            href={`https://wa.me/${settings.whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-950/50 transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>تواصل مباشر واتساب</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              متجر مضمون 100%
            </span>
            <span>ليبيا 🇱🇾</span>
          </div>
        </div>
      </div>
    </div>
  );
};

