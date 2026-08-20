import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PubgAccount, UcPackage, CartItem, Order, StoreSettings, LibyanCity, PubgSellSubmission } from '../types';
import { GoogleSheetsService } from '../services/googleSheets';
import { AppsScriptService } from '../services/appsScript';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_PUBG_ACCOUNTS, 
  INITIAL_UC_PACKAGES, 
  LIBYAN_CITIES, 
  INITIAL_STORE_SETTINGS 
} from '../data/initialData';

export type PageType = 'home' | 'products' | 'pubg_accounts' | 'pubg_uc' | 'contact' | 'admin';

interface StoreContextType {
  // Navigation
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Data
  products: Product[];
  pubgAccounts: PubgAccount[];
  ucPackages: UcPackage[];
  cities: LibyanCity[];
  settings: StoreSettings;
  orders: Order[];
  
  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemsCount: number;

  // Modals
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedUcPackage: UcPackage | null;
  setSelectedUcPackage: (pkg: UcPackage | null) => void;
  selectedAccountForBuy: PubgAccount | null;
  setSelectedAccountForBuy: (acc: PubgAccount | null) => void;
  isSellAccountOpen: boolean;
  setIsSellAccountOpen: (open: boolean) => void;
  previewVideoUrl: string | null;
  setPreviewVideoUrl: (url: string | null) => void;

  // Order Submissions
  submitGearOrder: (customerData: {
    name: string;
    phone: string;
    altPhone?: string;
    city: string;
    region: string;
    paymentMethod: string;
  }) => void;

  submitUcOrder: (orderData: {
    name: string;
    phone: string;
    pubgId: string;
    pkg: UcPackage;
  }) => void;

  submitAccountOrder: (account: PubgAccount, customerData: {
    name: string;
    phone: string;
  }) => void;

  submitSellAccount: (data: Omit<PubgSellSubmission, 'id' | 'date' | 'status'>) => void;

  // PUBG Submissions Management & Display toggle
  pubgSubmissions: PubgSellSubmission[];
  allPubgAccounts: PubgAccount[];
  togglePubgDisplay: (id: string, newDisplay: 'نعم' | 'لا') => Promise<void>;
  approvePubgSubmission: (id: string) => void;
  rejectPubgSubmission: (id: string) => void;
  deletePubgSubmission: (id: string) => void;

  // Apps Script live sync
  refreshFromAppsScript: () => Promise<void>;
  isAppsScriptSyncing: boolean;

  // Admin Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addPubgAccount: (account: Omit<PubgAccount, 'id'>) => void;
  updatePubgAccount: (id: string, account: Partial<PubgAccount>) => void;
  deletePubgAccount: (id: string) => void;

  addUcPackage: (pkg: Omit<UcPackage, 'id'>) => void;
  updateUcPackage: (id: string, pkg: Partial<UcPackage>) => void;
  deleteUcPackage: (id: string) => void;

  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'rtg_products_v2_clean',
  PUBG_ACCOUNTS: 'rtg_pubg_accounts_v2_clean',
  UC_PACKAGES: 'rtg_uc_packages_v2',
  SETTINGS: 'rtg_settings_v2',
  ORDERS: 'rtg_orders_v2',
  CART: 'rtg_cart_v2',
  PUBG_SUBMISSIONS: 'rtg_pubg_submissions_v2',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // Persistence State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [pubgAccounts, setPubgAccounts] = useState<PubgAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PUBG_ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_PUBG_ACCOUNTS;
    } catch {
      return INITIAL_PUBG_ACCOUNTS;
    }
  });

  const [allPubgAccounts, setAllPubgAccounts] = useState<PubgAccount[]>(() => {
    try {
      const saved = localStorage.getItem('rtg_all_pubg_accounts_v2');
      return saved ? JSON.parse(saved) : INITIAL_PUBG_ACCOUNTS;
    } catch {
      return INITIAL_PUBG_ACCOUNTS;
    }
  });

  const [ucPackages, setUcPackages] = useState<UcPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UC_PACKAGES);
      return saved ? JSON.parse(saved) : INITIAL_UC_PACKAGES;
    } catch {
      return INITIAL_UC_PACKAGES;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
    } catch {
      return INITIAL_STORE_SETTINGS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pubgSubmissions, setPubgSubmissions] = useState<PubgSellSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PUBG_SUBMISSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cities] = useState<LibyanCity[]>(LIBYAN_CITIES);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedUcPackage, setSelectedUcPackage] = useState<UcPackage | null>(null);
  const [selectedAccountForBuy, setSelectedAccountForBuy] = useState<PubgAccount | null>(null);
  const [isSellAccountOpen, setIsSellAccountOpen] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const [isAppsScriptSyncing, setIsAppsScriptSyncing] = useState(false);

  // Fetch live store data from backend API (/api/store) and optionally Google Apps Script
  const fetchServerData = async () => {
    try {
      const res = await fetch('/api/store');
      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 'success') {
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
          if (Array.isArray(data.pubgAccounts) && data.pubgAccounts.length > 0) {
            setPubgAccounts(data.pubgAccounts);
          }
          if (Array.isArray(data.allPubgAccounts) && data.allPubgAccounts.length > 0) {
            setAllPubgAccounts(data.allPubgAccounts);
          }
          if (Array.isArray(data.ucPackages) && data.ucPackages.length > 0) {
            setUcPackages(data.ucPackages);
          }
          if (data.settings && typeof data.settings === 'object') {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
        }
      }
    } catch (err) {
      console.warn('Local API fetch error:', err);
    }
  };

  // Fetch live store data from Google Apps Script Web App
  const refreshFromAppsScript = async () => {
    // Always fetch unified server data first
    await fetchServerData();

    const config = AppsScriptService.getConfig();
    if (!config.webAppUrl) return;

    try {
      setIsAppsScriptSyncing(true);
      const data = await AppsScriptService.fetchStoreData(config.webAppUrl);

      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      }
      if (data.pubgAccounts && Array.isArray(data.pubgAccounts)) {
        setPubgAccounts(data.pubgAccounts);
      }
      if (data.allPubgAccounts && Array.isArray(data.allPubgAccounts) && data.allPubgAccounts.length > 0) {
        setAllPubgAccounts(data.allPubgAccounts);
      } else if (data.pubgAccounts && Array.isArray(data.pubgAccounts)) {
        setAllPubgAccounts(data.pubgAccounts);
      }
      if (data.pubgSubmissions && Array.isArray(data.pubgSubmissions)) {
        setPubgSubmissions(data.pubgSubmissions);
      }
      if (data.ucPackages && Array.isArray(data.ucPackages) && data.ucPackages.length > 0) {
        setUcPackages(data.ucPackages);
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }

      // Sync fetched Apps Script data to backend server
      fetch('/api/store/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: data.products,
          pubgAccounts: data.pubgAccounts,
          allPubgAccounts: data.allPubgAccounts || data.pubgAccounts,
          ucPackages: data.ucPackages,
          settings: data.settings,
          pubgSubmissions: data.pubgSubmissions,
        }),
      }).catch(() => {});
    } catch (e) {
      console.warn('Could not auto-fetch from Google Apps Script:', e);
    } finally {
      setIsAppsScriptSyncing(false);
    }
  };

  // Auto-fetch on mount, interval polling (every 30s), and window/tab focus
  useEffect(() => {
    // Immediate initial sync
    fetchServerData();
    refreshFromAppsScript();

    // Periodic sync so all visitors and devices stay updated in real time
    const interval = setInterval(() => {
      refreshFromAppsScript();
    }, 30000);

    // Refresh when user returns to tab or focuses the window
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshFromAppsScript();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PUBG_ACCOUNTS, JSON.stringify(pubgAccounts));
  }, [pubgAccounts]);

  useEffect(() => {
    localStorage.setItem('rtg_all_pubg_accounts_v2', JSON.stringify(allPubgAccounts));
  }, [allPubgAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UC_PACKAGES, JSON.stringify(ucPackages));
  }, [ucPackages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PUBG_SUBMISSIONS, JSON.stringify(pubgSubmissions));
  }, [pubgSubmissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Open WhatsApp Helper
  const openWhatsApp = (phoneDigits: string, text: string) => {
    const encoded = encodeURIComponent(text);
    const cleanNumber = phoneDigits.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Helper to record order into connected Google Sheet / Apps Script if configured
  const syncOrderToGoogleSheets = (order: Order) => {
    // 1. OAuth Sheets API if configured
    const config = GoogleSheetsService.getConfig();
    const token = GoogleSheetsService.getStoredToken();
    if (config.spreadsheetId && token) {
      GoogleSheetsService.appendOrderToSheet(token, config.spreadsheetId, order).catch(() => {});
    }

    // 2. Apps Script Web App backend if configured
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.submitOrder(appsScriptConfig.webAppUrl, order).catch(() => {});
    }
  };

  // Submit Gear Order
  const submitGearOrder = (customerData: {
    name: string;
    phone: string;
    altPhone?: string;
    city: string;
    region: string;
    paymentMethod: string;
  }) => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      type: 'gear',
      customerName: customerData.name,
      phone: customerData.phone,
      altPhone: customerData.altPhone,
      city: customerData.city,
      region: customerData.region,
      paymentMethod: customerData.paymentMethod,
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        price: c.product.price,
        quantity: c.quantity,
      })),
      total: cartTotal,
      date: new Date().toLocaleString('ar-LY'),
      status: 'pending',
    };

    setOrders((prev) => [newOrder, ...prev]);
    syncOrderToGoogleSheets(newOrder);

    // Build WhatsApp message format matching video exactly:
    let message = `*طلب جديد من RTG Gear X* 🎮\n\n`;
    message += `*معلومات العميل:*\n`;
    message += `الاسم: ${customerData.name}\n`;
    message += `الهاتف: ${customerData.phone}\n`;
    if (customerData.altPhone) {
      message += `رقم احتياطي: ${customerData.altPhone}\n`;
    }
    message += `المدينة: ${customerData.city}\n`;
    message += `المنطقة: ${customerData.region}\n`;
    message += `طريقة الدفع: ${customerData.paymentMethod === 'تحويل مصرفي' ? '💳 تحويل مصرفي' : '💵 كاش'}\n\n`;
    message += `*تفاصيل الطلب:*\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `الكمية: ${item.quantity} | السعر: ${item.product.price * item.quantity} د.ل\n`;
    });

    message += `\n*الإجمالي: ${cartTotal} د.ل*`;

    openWhatsApp(settings.whatsappNumber, message);
    clearCart();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  // Submit UC Order
  const submitUcOrder = (orderData: {
    name: string;
    phone: string;
    pubgId: string;
    pkg: UcPackage;
  }) => {
    const totalUc = orderData.pkg.ucAmount + orderData.pkg.bonusUc;
    const pkgName = `${orderData.pkg.ucAmount} UC ${orderData.pkg.bonusUc > 0 ? `(+${orderData.pkg.bonusUc} مجاناً)` : ''}`;

    const newOrder: Order = {
      id: `UC-${Date.now()}`,
      type: 'pubg_uc',
      customerName: orderData.name,
      phone: orderData.phone,
      pubgId: orderData.pubgId,
      packageName: pkgName,
      total: orderData.pkg.price,
      date: new Date().toLocaleString('ar-LY'),
      status: 'pending',
    };

    setOrders((prev) => [newOrder, ...prev]);
    syncOrderToGoogleSheets(newOrder);

    // Build UC WhatsApp message matching video:
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.toLocaleTimeString('ar-LY')}`;

    let message = `*طلب شدات جديد – RTG Gear X* ⚡\n\n`;
    message += `👤 *الاسم:* ${orderData.name}\n`;
    message += `📱 *الهاتف:* ${orderData.phone}\n`;
    message += `🆔 *PUBG ID:* ${orderData.pubgId}\n`;
    message += `📦 *الباقة:* ${orderData.pkg.ucAmount} UC\n`;
    message += `💰 *السعر:* ${orderData.pkg.price} د.ل\n`;
    message += `⏰ *الوقت:* ${formattedDate}\n\n`;
    message += `يرجى تأكيد الطلب وإرسال تفاصيل الدفع`;

    openWhatsApp(settings.whatsappNumber, message);
    setSelectedUcPackage(null);
  };

  // Submit PUBG Account Buy
  const submitAccountOrder = (account: PubgAccount, customerData: {
    name: string;
    phone: string;
  }) => {
    const newOrder: Order = {
      id: `ACC-${Date.now()}`,
      type: 'pubg_account',
      customerName: customerData.name,
      phone: customerData.phone,
      packageName: account.title,
      total: account.price,
      date: new Date().toLocaleString('ar-LY'),
      status: 'pending',
    };

    setOrders((prev) => [newOrder, ...prev]);
    syncOrderToGoogleSheets(newOrder);

    let message = `*طلب شراء حساب PUBG – RTG Gear X* 👑\n\n`;
    message += `👤 *الاسم:* ${customerData.name}\n`;
    message += `📱 *الهاتف:* ${customerData.phone}\n`;
    message += `🎯 *الحساب المطلوب:* ${account.title}\n`;
    message += `🏷️ *المستوى والبادج:* ${account.level} (${account.badge})\n`;
    message += `💰 *السعر:* ${account.price} د.ل\n\n`;
    message += `يرجى تزويدي بطريقة الدفع وتفاصيل التسليم الآمن للحساب`;

    openWhatsApp(settings.whatsappNumber, message);
    setSelectedAccountForBuy(null);
  };

  // Submit Sell Account
  const submitSellAccount = (data: Omit<PubgSellSubmission, 'id' | 'date' | 'status'>) => {
    const newSubmission: PubgSellSubmission = {
      ...data,
      id: `sub-${Date.now()}`,
      date: new Date().toLocaleString('ar-LY'),
      status: 'pending',
    };

    // Save locally
    setPubgSubmissions((prev) => [newSubmission, ...prev]);

    // If Google Sheets is connected, append to Google Sheet in real-time
    const sheetsConfig = GoogleSheetsService.getConfig();
    const token = GoogleSheetsService.getStoredToken();
    if (token && sheetsConfig.spreadsheetId) {
      GoogleSheetsService.appendPubgSubmissionToSheet(token, sheetsConfig.spreadsheetId, newSubmission).catch(console.error);
    }

    // If Google Apps Script Web App is connected, post directly to Google Sheet
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.submitPubgSellAccount(appsScriptConfig.webAppUrl, newSubmission).catch(console.error);
    }

    let message = `*طلب عرض حساب PUBG للبيع – RTG Gear X* 👑\n\n`;
    message += `👤 *الاسم الثلاثي:* ${data.fullName}\n`;
    message += `🎮 *اسم الحساب:* ${data.accountName}\n`;
    message += `⭐ *مستوى الحساب (Level):* ${data.accountLevel}\n`;
    message += `⚡ *مستوى القوة:* ${data.powerLevel || 'غير محدد'}\n`;
    message += `👔 *عدد الميثيك العادي:* ${data.mythicsCount || '0'}\n`;
    message += `✨ *عدد الميثيك الذهبي:* ${data.goldenMythicsCount || '0'}\n`;
    message += `🔫 *الأسلحة القابلة للتطوير:* ${data.upgradableWeapons || 'لا يوجد'}\n`;
    message += `🏎️ *سكنات السيارات:* ${data.carsCount || '0'}\n`;
    message += `🏷️ *الهاشتاجات والألقاب:* ${data.hashtagsCount || '0'}\n`;
    message += `🔗 *روابط ربط الحساب:* ${data.linkedAccounts}\n`;
    message += `💰 *سعر البيع المطلوب:* ${data.salePrice} د.ل\n`;
    message += `📱 *رقم هاتف البائع:* ${data.phone}\n`;
    message += `💸 *الرقم المحول منه 5 ليرات:* ${data.transferPhone}\n`;
    if (data.videoUrl) {
      message += `🎥 *رابط فيديو الحساب (أقل من 40 ثانية):* ${data.videoUrl}\n`;
    }
    message += `\n✅ *تم التعهد بملكية الحساب وتحويل رسوم الـ 5 ليرات إلى 0943981577*`;

    openWhatsApp(settings.whatsappNumber, message);
    setIsSellAccountOpen(false);
  };

  // Approve PUBG Submission (Add to live store PUBG accounts list)
  const approvePubgSubmission = (id: string) => {
    const submission = pubgSubmissions.find((s) => s.id === id);
    if (!submission) return;

    // Create features list for account card
    const feats: string[] = [];
    if (submission.mythicsCount) feats.push(`${submission.mythicsCount} ميثيك`);
    if (submission.upgradableWeapons) feats.push(submission.upgradableWeapons);
    if (submission.powerLevel) feats.push(`قوة ${submission.powerLevel}`);
    if (submission.linkedAccounts) feats.push(submission.linkedAccounts);

    const newAccount: PubgAccount = {
      id: submission.id || `acc-${Date.now()}`,
      title: submission.accountName || `حساب PUBG لفل ${submission.accountLevel}`,
      badge: 'حساب موثق',
      level: `LVL ${submission.accountLevel}`,
      price: parseFloat(submission.salePrice) || 0,
      oldPrice: (parseFloat(submission.salePrice) || 0) * 1.15,
      features: feats.length > 0 ? feats : ['حساب مميز', 'تسليم آمن', 'موثق من الإدارة'],
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      videoUrl: submission.videoUrl || '',
      isAvailable: true,
      approved: true,
      status: 'approved',
      powerLevel: submission.powerLevel,
      mythicsCount: submission.mythicsCount,
      goldenMythicsCount: submission.goldenMythicsCount,
      upgradableWeaponsCount: submission.upgradableWeapons,
      carsCount: submission.carsCount,
      hashtagsCount: submission.hashtagsCount,
      linkedAccounts: submission.linkedAccounts,
      sellerName: submission.fullName,
      sellerPhone: submission.phone,
    };

    setPubgAccounts((prev) => {
      const exists = prev.some((a) => a.id === newAccount.id);
      if (exists) {
        return prev.map((a) => (a.id === newAccount.id ? newAccount : a));
      }
      return [newAccount, ...prev];
    });

    setPubgSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'approved' } : s))
    );

    // Call Apps Script to set 'نعم' and publish in Google Sheets
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.approvePubgSubmission(appsScriptConfig.webAppUrl, id).catch(console.error);
    }
  };

  // Reject PUBG Submission
  const rejectPubgSubmission = (id: string) => {
    setPubgSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s))
    );
    setPubgAccounts((prev) => prev.filter((a) => a.id !== id));

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.rejectPubgSubmission(appsScriptConfig.webAppUrl, id).catch(console.error);
    }
  };

  // Delete PUBG Submission
  const deletePubgSubmission = (id: string) => {
    setPubgSubmissions((prev) => prev.filter((s) => s.id !== id));
    setPubgAccounts((prev) => prev.filter((a) => a.id !== id));

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.deletePubgAccount(appsScriptConfig.webAppUrl, id).catch(console.error);
    }
  };

  // Admin CRUD for Products
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);

    // Save to local server
    fetch('/api/store/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch(() => {});

    // Send to Google Sheets Apps Script
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.addProduct(appsScriptConfig.webAppUrl, newProduct).catch(console.error);
    }
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );

    // Sync state to server
    setTimeout(() => {
      fetch('/api/store/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: products.map(p => p.id === id ? { ...p, ...updated } : p) }),
      }).catch(() => {});
    }, 100);

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.updateProduct(appsScriptConfig.webAppUrl, id, updated).catch(console.error);
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));

    // Delete on server
    fetch(`/api/store/product/${id}`, { method: 'DELETE' }).catch(() => {});

    // Delete from Google Sheets Apps Script
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.deleteProduct(appsScriptConfig.webAppUrl, id).catch(console.error);
    }
  };

  // Admin CRUD for PUBG Accounts
  const addPubgAccount = (account: Omit<PubgAccount, 'id'>) => {
    const newAccount: PubgAccount = {
      ...account,
      id: `acc-${Date.now()}`,
      approved: true,
      status: 'approved',
    };
    setPubgAccounts((prev) => [newAccount, ...prev]);

    // Save to server
    fetch('/api/store/pubg-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAccount),
    }).catch(() => {});

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.syncAllData(appsScriptConfig.webAppUrl, {
        products,
        pubgAccounts: [newAccount, ...pubgAccounts],
      }).catch(console.error);
    }
  };

  const updatePubgAccount = (id: string, updated: Partial<PubgAccount>) => {
    setPubgAccounts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.updatePubgAccount(appsScriptConfig.webAppUrl, id, updated).catch(console.error);
    }
  };

  // Toggle PUBG Account Display on website ("نعم" / "لا")
  const togglePubgDisplay = async (id: string, newDisplay: 'نعم' | 'لا') => {
    const isApproved = newDisplay === 'نعم';

    // 1. Update allPubgAccounts
    setAllPubgAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              displayOnSite: newDisplay,
              approved: isApproved,
              status: isApproved ? 'approved' : 'pending',
              isAvailable: isApproved,
            }
          : acc
      )
    );

    // 2. Update pubgAccounts (Visible on public site)
    setPubgAccounts((prev) => {
      if (isApproved) {
        const target = allPubgAccounts.find((a) => a.id === id);
        if (target) {
          const approvedAcc: PubgAccount = {
            ...target,
            displayOnSite: 'نعم',
            approved: true,
            status: 'approved',
            isAvailable: true,
          };
          const exists = prev.some((a) => a.id === id);
          return exists
            ? prev.map((a) => (a.id === id ? approvedAcc : a))
            : [approvedAcc, ...prev];
        }
        return prev;
      } else {
        return prev.filter((a) => a.id !== id);
      }
    });

    // 3. Send update to Google Apps Script Web App
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      try {
        await AppsScriptService.setPubgDisplay(appsScriptConfig.webAppUrl, id, newDisplay);
      } catch (err) {
        console.error('Error toggling PUBG account display in Google Sheets:', err);
      }
    }
  };

  const deletePubgAccount = (id: string) => {
    setPubgAccounts((prev) => prev.filter((item) => item.id !== id));
    setAllPubgAccounts((prev) => prev.filter((item) => item.id !== id));
    setPubgSubmissions((prev) => prev.filter((s) => s.id !== id));

    // Delete on server
    fetch(`/api/store/pubg-account/${id}`, { method: 'DELETE' }).catch(() => {});

    // Delete from Google Sheets Apps Script
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.deletePubgAccount(appsScriptConfig.webAppUrl, id).catch(console.error);
    }
  };

  // Admin CRUD for UC Packages
  const addUcPackage = (pkg: Omit<UcPackage, 'id'>) => {
    const newPkg: UcPackage = {
      ...pkg,
      id: `uc-${Date.now()}`,
    };
    setUcPackages((prev) => [...prev, newPkg]);

    // Save on server
    fetch('/api/store/uc-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPkg),
    }).catch(() => {});

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.addUcPackage(appsScriptConfig.webAppUrl, newPkg).catch(console.error);
    }
  };

  const updateUcPackage = (id: string, updated: Partial<UcPackage>) => {
    setUcPackages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.updateUcPackage(appsScriptConfig.webAppUrl, id, updated).catch(console.error);
    }
  };

  const deleteUcPackage = (id: string) => {
    setUcPackages((prev) => prev.filter((item) => item.id !== id));

    // Delete on server
    fetch(`/api/store/uc-package/${id}`, { method: 'DELETE' }).catch(() => {});

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.deleteUcPackage(appsScriptConfig.webAppUrl, id).catch(console.error);
    }
  };

  // Admin Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };

      // Update on server
      fetch('/api/store/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      }).catch(() => {});

      const appsScriptConfig = AppsScriptService.getConfig();
      if (appsScriptConfig.webAppUrl) {
        AppsScriptService.saveSettings(appsScriptConfig.webAppUrl, merged).catch(console.error);
      }
      return merged;
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setPubgAccounts(INITIAL_PUBG_ACCOUNTS);
    setUcPackages(INITIAL_UC_PACKAGES);
    setSettings(INITIAL_STORE_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.PUBG_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.UC_PACKAGES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  return (
    <StoreContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedCategory,
        setSelectedCategory,
        products,
        pubgAccounts,
        ucPackages,
        cities,
        settings,
        orders,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartItemsCount,
        isCheckoutOpen,
        setIsCheckoutOpen,
        selectedUcPackage,
        setSelectedUcPackage,
        selectedAccountForBuy,
        setSelectedAccountForBuy,
        isSellAccountOpen,
        setIsSellAccountOpen,
        previewVideoUrl,
        setPreviewVideoUrl,
        submitGearOrder,
        submitUcOrder,
        submitAccountOrder,
        submitSellAccount,
        pubgSubmissions,
        allPubgAccounts,
        togglePubgDisplay,
        approvePubgSubmission,
        rejectPubgSubmission,
        deletePubgSubmission,
        refreshFromAppsScript,
        isAppsScriptSyncing,
        addProduct,
        updateProduct,
        deleteProduct,
        addPubgAccount,
        updatePubgAccount,
        deletePubgAccount,
        addUcPackage,
        updateUcPackage,
        deleteUcPackage,
        updateSettings,
        updateOrderStatus,
        deleteOrder,
        resetToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
