import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PubgAccount, UcPackage, CartItem, Order, StoreSettings, LibyanCity, PubgSellSubmission, DeliveryCityRate } from '../types';
import { GoogleSheetsService } from '../services/googleSheets';
import { AppsScriptService } from '../services/appsScript';
import { ALL_DELIVERY_RATES } from '../data/deliveryData';
import { safeStorage } from '../utils/safeStorage';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_PUBG_ACCOUNTS, 
  INITIAL_UC_PACKAGES, 
  LIBYAN_CITIES, 
  INITIAL_STORE_SETTINGS 
} from '../data/initialData';

export type PageType = 'home' | 'products' | 'product_detail' | 'pubg_accounts' | 'pubg_uc' | 'delivery_rates' | 'contact' | 'admin';

interface StoreContextType {
  // Navigation
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  openProductDetails: (product: Product) => void;
  
  // Data
  products: Product[];
  pubgAccounts: PubgAccount[];
  ucPackages: UcPackage[];
  cities: LibyanCity[];
  deliveryRates: DeliveryCityRate[];
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
    region?: string;
    deliveryFee?: string | number;
    notes?: string;
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
  togglePubgDisplay: (id: string, newDisplay: 'نعم' | 'لا' | 'كلا') => Promise<void>;
  togglePubgSold: (id: string, isSold: boolean) => Promise<void>;
  toggleUcPackageStock: (id: string, isAvailable: boolean) => Promise<void>;
  toggleProductStock: (id: string, inStock: boolean) => Promise<void>;
  buyNowDirect: (product: Product, quantity?: number) => void;
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

  // Delivery Rates Admin Actions
  addDeliveryRate: (rate: Omit<DeliveryCityRate, 'id'>) => Promise<void>;
  updateDeliveryRate: (id: string, rate: Partial<DeliveryCityRate>) => Promise<void>;
  deleteDeliveryRate: (id: string) => Promise<void>;
  resetDeliveryRates: () => Promise<void>;
  syncDeliveryRatesToSheets: () => Promise<boolean>;

  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  resetToDefaults: () => void;

  // Data Loading Notification
  isDataLoading: boolean;
  dataLoadedMessage: string | null;
  dismissDataLoadedMessage: () => void;

  // Dynamic Categories Management
  categories: string[];
  addCategory: (name: string) => Promise<boolean>;
  deleteCategory: (name: string) => Promise<boolean>;
  saveCategoriesToSheets: (cats: string[]) => Promise<boolean>;

  // Admin Credentials Management (Username & Password)
  adminCredentials: { username: string; password: string };
  updateAdminCredentials: (oldUser: string, oldPass: string, newUser: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const DEFAULT_CATEGORIES: string[] = [
  'الكل',
  'كاميرات مراقبة',
  'سماعات',
  'مبردات',
  'كروت شاشة',
  'ميكروفونات',
  'كيبورد',
  'ماوس',
  'إكسسوارات',
];

const STORAGE_KEYS = {
  PRODUCTS: 'rtg_products_v4_unified',
  PUBG_ACCOUNTS: 'rtg_pubg_accounts_v4_unified',
  UC_PACKAGES: 'rtg_uc_packages_v4_unified',
  DELIVERY_RATES: 'rtg_delivery_rates_v4_unified',
  SETTINGS: 'rtg_settings_v4_unified',
  ORDERS: 'rtg_orders_v4_unified',
  CART: 'rtg_cart_v4_unified',
  PUBG_SUBMISSIONS: 'rtg_pubg_submissions_v4_unified',
  CATEGORIES: 'rtg_categories_v4_unified',
  ADMIN_CREDENTIALS: 'rtg_admin_credentials_v4',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // Persistence State
  const [products, setProducts] = useState<Product[]>(() => 
    safeStorage.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, [])
  );

  const [pubgAccounts, setPubgAccounts] = useState<PubgAccount[]>(() => 
    safeStorage.getItem<PubgAccount[]>(STORAGE_KEYS.PUBG_ACCOUNTS, [])
  );

  const [allPubgAccounts, setAllPubgAccounts] = useState<PubgAccount[]>(() => 
    safeStorage.getItem<PubgAccount[]>('rtg_all_pubg_accounts_v2', [])
  );

  const [ucPackages, setUcPackages] = useState<UcPackage[]>(() => 
    safeStorage.getItem<UcPackage[]>(STORAGE_KEYS.UC_PACKAGES, INITIAL_UC_PACKAGES)
  );

  const [deliveryRates, setDeliveryRates] = useState<DeliveryCityRate[]>(() => 
    safeStorage.getItem<DeliveryCityRate[]>(STORAGE_KEYS.DELIVERY_RATES, ALL_DELIVERY_RATES)
  );

  const [settings, setSettings] = useState<StoreSettings>(() => 
    safeStorage.getItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS)
  );

  const [orders, setOrders] = useState<Order[]>(() => 
    safeStorage.getItem<Order[]>(STORAGE_KEYS.ORDERS, [])
  );

  const [pubgSubmissions, setPubgSubmissions] = useState<PubgSellSubmission[]>(() => 
    safeStorage.getItem<PubgSellSubmission[]>(STORAGE_KEYS.PUBG_SUBMISSIONS, [])
  );

  const [cart, setCart] = useState<CartItem[]>(() => 
    safeStorage.getItem<CartItem[]>(STORAGE_KEYS.CART, [])
  );

  const [cities] = useState<LibyanCity[]>(LIBYAN_CITIES);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() =>
    safeStorage.getItem<Product | null>('rtg_selected_product_v1', null)
  );

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    safeStorage.setItem('rtg_selected_product_v1', product);
    setCurrentPage('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedUcPackage, setSelectedUcPackage] = useState<UcPackage | null>(null);
  const [selectedAccountForBuy, setSelectedAccountForBuy] = useState<PubgAccount | null>(null);
  const [isSellAccountOpen, setIsSellAccountOpen] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const [isAppsScriptSyncing, setIsAppsScriptSyncing] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [dataLoadedMessage, setDataLoadedMessage] = useState<string | null>(null);
  const [hasShownLoadedToast, setHasShownLoadedToast] = useState(false);

  const [categories, setCategories] = useState<string[]>(() =>
    safeStorage.getItem<string[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
  );

  const [adminCredentials, setAdminCredentials] = useState<{ username: string; password: string }>(() => {
    const saved = safeStorage.getItem<{ username: string; password: string }>(STORAGE_KEYS.ADMIN_CREDENTIALS, {
      username: localStorage.getItem('rtg_admin_user') || 'admin',
      password: localStorage.getItem('rtg_admin_pass') || 'rtg2026',
    });
    return saved;
  });

  // Trigger notification when data is loaded for the first time
  useEffect(() => {
    if (!isDataLoading && !hasShownLoadedToast) {
      setHasShownLoadedToast(true);
      setDataLoadedMessage('تم تحميل وتحديث المنتجات وحسابات ببجي وأسعار الشدات بنجاح! جميع المنتجات متوفرة الآن في الموقع.');
      const timer = setTimeout(() => {
        setDataLoadedMessage(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isDataLoading, hasShownLoadedToast]);

  const dismissDataLoadedMessage = () => {
    setDataLoadedMessage(null);
  };

  const addCategory = async (name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (categories.includes(trimmed)) return false;

    const newCats = [...categories, trimmed];
    setCategories(newCats);
    safeStorage.setItem(STORAGE_KEYS.CATEGORIES, newCats);

    // 1. Sync to local backend server
    fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: newCats }),
    }).catch(() => {});

    // 2. Sync to Google Sheets dedicated "تصنيفات المنتجات" sheet
    const cfg = AppsScriptService.getConfig();
    if (cfg.webAppUrl) {
      try {
        await AppsScriptService.saveCategories(cfg.webAppUrl, newCats);
        await AppsScriptService.addCategoryToSheets(cfg.webAppUrl, trimmed);
      } catch (e) {
        console.warn('Failed saving categories to Sheets:', e);
      }
    }
    return true;
  };

  const deleteCategory = async (name: string): Promise<boolean> => {
    if (name === 'الكل') return false;
    const newCats = categories.filter((c) => c !== name);
    setCategories(newCats);
    safeStorage.setItem(STORAGE_KEYS.CATEGORIES, newCats);
    if (selectedCategory === name) {
      setSelectedCategory('الكل');
    }

    // 1. Sync to local backend server
    fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: newCats }),
    }).catch(() => {});

    // 2. Sync to Google Sheets dedicated "تصنيفات المنتجات" sheet
    const cfg = AppsScriptService.getConfig();
    if (cfg.webAppUrl) {
      try {
        await AppsScriptService.saveCategories(cfg.webAppUrl, newCats);
        await AppsScriptService.deleteCategoryFromSheets(cfg.webAppUrl, name);
      } catch (e) {
        console.warn('Failed saving categories to Sheets:', e);
      }
    }
    return true;
  };

  const saveCategoriesToSheets = async (cats: string[]): Promise<boolean> => {
    // 1. Save to local backend server
    fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: cats }),
    }).catch(() => {});

    setCategories(cats);
    safeStorage.setItem(STORAGE_KEYS.CATEGORIES, cats);

    const cfg = AppsScriptService.getConfig();
    if (!cfg.webAppUrl) return true;
    try {
      await AppsScriptService.saveCategories(cfg.webAppUrl, cats);
      return true;
    } catch (e) {
      console.warn('Error saving categories to Sheets:', e);
      return false;
    }
  };

  const updateAdminCredentials = async (
    oldUser: string,
    oldPass: string,
    newUser: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const currentStoredUser = localStorage.getItem('rtg_admin_user') || adminCredentials.username || 'admin';
    const currentStoredPass = localStorage.getItem('rtg_admin_pass') || adminCredentials.password || 'rtg2026';

    if (oldUser.trim() !== currentStoredUser || oldPass !== currentStoredPass) {
      return { success: false, message: 'اسم المستخدم القديم أو كلمة المرور القديمة غير صحيحة!' };
    }

    if (!newUser.trim() || !newPass.trim()) {
      return { success: false, message: 'يرجى إدخال اسم المستخدم الجديد وكلمة المرور الجديدة' };
    }

    const updatedCreds = {
      username: newUser.trim(),
      password: newPass.trim(),
    };

    setAdminCredentials(updatedCreds);
    safeStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, updatedCreds);
    localStorage.setItem('rtg_admin_user', updatedCreds.username);
    localStorage.setItem('rtg_admin_pass', updatedCreds.password);

    setSettings((prev) => ({
      ...prev,
      adminUsername: updatedCreds.username,
      adminPassword: updatedCreds.password,
    }));

    // 1. Update backend server instantly
    try {
      await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCreds),
      });
    } catch (e) {
      console.warn('Could not update backend server credentials:', e);
    }

    // 2. Update Google Sheets dedicated "أمان الأدمن" sheet
    const cfg = AppsScriptService.getConfig();
    if (cfg.webAppUrl) {
      try {
        await AppsScriptService.saveAdminCredentials(cfg.webAppUrl, updatedCreds.username, updatedCreds.password);
      } catch (err) {
        console.warn('Could not sync admin credentials to Google Sheets immediately:', err);
      }
    }

    return { 
      success: true, 
      message: 'تم حفظ وتحديث بيانات دخول الأدمن بنجاح في ورقة «أمان الأدمن» بـ Google Sheets والمتجر!' 
    };
  };

  // Fetch live store data from backend API (/api/store) and optionally Google Apps Script
  const fetchServerData = async () => {
    try {
      const res = await fetch('/api/store');
      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 'success') {
          if (Array.isArray(data.products)) {
            setProducts(data.products);
          }
          if (Array.isArray(data.pubgAccounts)) {
            setPubgAccounts(data.pubgAccounts);
          }
          if (Array.isArray(data.allPubgAccounts)) {
            setAllPubgAccounts(data.allPubgAccounts);
          }
          if (Array.isArray(data.ucPackages)) {
            setUcPackages(data.ucPackages);
          }
          if (Array.isArray(data.deliveryRates)) {
            setDeliveryRates(data.deliveryRates);
          }
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
            safeStorage.setItem(STORAGE_KEYS.CATEGORIES, data.categories);
          }
          if (data.adminCredentials && data.adminCredentials.username && data.adminCredentials.password) {
            const creds = { username: data.adminCredentials.username, password: data.adminCredentials.password };
            setAdminCredentials(creds);
            safeStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, creds);
            localStorage.setItem('rtg_admin_user', creds.username);
            localStorage.setItem('rtg_admin_pass', creds.password);
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

    // Helper to normalize PUBG accounts and ensure videoUrl is detected from any field (including storeReceivePhone if entered as Drive link)
    const normalizeAccounts = (accounts: PubgAccount[]): PubgAccount[] => {
      return accounts.map((acc) => {
        let finalVideo = acc.videoUrl || '';
        // If videoUrl is empty or not a link, check if storeReceivePhone or transferPhone has a video link
        if (!finalVideo || !finalVideo.startsWith('http')) {
          if (acc.storeReceivePhone && (acc.storeReceivePhone.includes('drive.google.com') || acc.storeReceivePhone.includes('youtu') || acc.storeReceivePhone.includes('.mp4'))) {
            finalVideo = acc.storeReceivePhone;
          } else if (acc.transferPhone && (acc.transferPhone.includes('drive.google.com') || acc.transferPhone.includes('youtu') || acc.transferPhone.includes('.mp4'))) {
            finalVideo = acc.transferPhone;
          }
        }
        return {
          ...acc,
          videoUrl: finalVideo,
        };
      });
    };

    try {
      setIsAppsScriptSyncing(true);
      const data = await AppsScriptService.fetchStoreData(config.webAppUrl);

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
      if (data.pubgAccounts && Array.isArray(data.pubgAccounts)) {
        const normAccounts = normalizeAccounts(data.pubgAccounts);
        setPubgAccounts(normAccounts);
      }
      if (data.allPubgAccounts && Array.isArray(data.allPubgAccounts)) {
        const normAll = normalizeAccounts(data.allPubgAccounts);
        setAllPubgAccounts(normAll);
      } else if (data.pubgAccounts && Array.isArray(data.pubgAccounts)) {
        const normAccounts = normalizeAccounts(data.pubgAccounts);
        setAllPubgAccounts(normAccounts);
      }
      if (data.pubgSubmissions && Array.isArray(data.pubgSubmissions)) {
        setPubgSubmissions(data.pubgSubmissions);
      }
      if (data.ucPackages && Array.isArray(data.ucPackages)) {
        setUcPackages(data.ucPackages);
      }
      if (data.deliveryRates && Array.isArray(data.deliveryRates)) {
        setDeliveryRates(data.deliveryRates);
      }
      if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
        safeStorage.setItem(STORAGE_KEYS.CATEGORIES, data.categories);
      }
      if (data.adminCredentials && data.adminCredentials.username && data.adminCredentials.password) {
        const creds = { username: data.adminCredentials.username, password: data.adminCredentials.password };
        setAdminCredentials(creds);
        safeStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, creds);
        localStorage.setItem('rtg_admin_user', creds.username);
        localStorage.setItem('rtg_admin_pass', creds.password);
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }

      // Sync fetched Apps Script data to backend server
      const normalizedAccountsForSync = data.pubgAccounts ? normalizeAccounts(data.pubgAccounts) : [];
      const normalizedAllForSync = data.allPubgAccounts ? normalizeAccounts(data.allPubgAccounts) : normalizedAccountsForSync;

      fetch('/api/store/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: data.products || [],
          pubgAccounts: normalizedAccountsForSync,
          allPubgAccounts: normalizedAllForSync,
          ucPackages: data.ucPackages || [],
          deliveryRates: data.deliveryRates || deliveryRates,
          categories: data.categories || categories,
          adminCredentials: data.adminCredentials || adminCredentials,
          settings: data.settings,
          pubgSubmissions: data.pubgSubmissions || [],
        }),
      }).catch(() => {});
    } catch (e) {
      console.warn('Could not auto-fetch from Google Apps Script:', e);
    } finally {
      setIsAppsScriptSyncing(false);
      setIsDataLoading(false);
    }
  };

  // Auto-fetch on mount, interval polling (every 15s), and window/tab focus
  useEffect(() => {
    // Immediate initial sync
    fetchServerData();
    refreshFromAppsScript();

    // Periodic sync so all visitors and devices stay updated in real time
    const interval = setInterval(() => {
      refreshFromAppsScript();
    }, 15000);

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

  // Sync to local storage safely
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.PUBG_ACCOUNTS, pubgAccounts);
  }, [pubgAccounts]);

  useEffect(() => {
    safeStorage.setItem('rtg_all_pubg_accounts_v2', allPubgAccounts);
  }, [allPubgAccounts]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.UC_PACKAGES, ucPackages);
  }, [ucPackages]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.PUBG_SUBMISSIONS, pubgSubmissions);
  }, [pubgSubmissions]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.DELIVERY_RATES, deliveryRates);
  }, [deliveryRates]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.CART, cart);
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
    region?: string;
    deliveryFee?: string | number;
    notes?: string;
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
      region: customerData.region || customerData.city,
      notes: customerData.notes,
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
    message += `*معلومات العميل والتوصيل:*\n`;
    message += `الاسم: ${customerData.name}\n`;
    message += `الهاتف: ${customerData.phone}\n`;
    if (customerData.altPhone) {
      message += `رقم احتياطي: ${customerData.altPhone}\n`;
    }
    message += `المدينة / المنطقة: ${customerData.city}\n`;
    if (customerData.region && customerData.region !== customerData.city) {
      message += `العنوان التفصيلي: ${customerData.region}\n`;
    }
    if (customerData.deliveryFee) {
      message += `سعر التوصيل: ${customerData.deliveryFee} د.ل\n`;
    }
    if (customerData.notes) {
      message += `ملاحظات العميل: ${customerData.notes}\n`;
    }
    message += `طريقة الدفع: ${customerData.paymentMethod === 'تحويل مصرفي' ? '💳 تحويل مصرفي' : '💵 كاش'}\n\n`;
    message += `*تفاصيل الطلب:*\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `الكمية: ${item.quantity} | السعر: ${item.product.price * item.quantity} د.ل\n`;
    });

    message += `\n*إجمالي المنتجات: ${cartTotal} د.ل*`;
    if (customerData.deliveryFee && typeof customerData.deliveryFee === 'number') {
      message += `\n*الإجمالي الكلي مع التوصيل: ${cartTotal + customerData.deliveryFee} د.ل*`;
    } else if (customerData.deliveryFee) {
      message += `\n*التوصيل التقديري: ${customerData.deliveryFee} د.ل*`;
    }

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
    const updatedList = products.map((item) => (item.id === id ? { ...item, ...updated } : item));
    setProducts(updatedList);

    // Sync state to server immediately
    fetch(`/api/store/product/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
    fetch('/api/store/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: updatedList }),
    }).catch(() => {});

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.updateProduct(appsScriptConfig.webAppUrl, id, updated).catch(console.error);
    }
  };

  const deleteProduct = (id: string) => {
    const updatedList = products.filter((item) => item.id !== id);
    setProducts(updatedList);

    // Delete on server and sync
    fetch(`/api/store/product/${id}`, { method: 'DELETE' }).catch(() => {});
    fetch('/api/store/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: updatedList }),
    }).catch(() => {});

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
      displayOnSite: 'نعم',
      isAvailable: true,
    };
    const updatedPubg = [newAccount, ...pubgAccounts];
    const updatedAll = [newAccount, ...allPubgAccounts];
    setPubgAccounts(updatedPubg);
    setAllPubgAccounts(updatedAll);

    // Save to server
    fetch('/api/store/pubg-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAccount),
    }).catch(() => {});
    fetch('/api/store/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubgAccounts: updatedPubg, allPubgAccounts: updatedAll }),
    }).catch(() => {});

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.submitPubgSellAccount(appsScriptConfig.webAppUrl, {
        ...newAccount,
        displayOnSite: 'نعم',
      }).catch(console.error);
    }
  };

  const updatePubgAccount = (id: string, updated: Partial<PubgAccount>) => {
    const updatedAll = allPubgAccounts.map((item) => (item.id === id ? { ...item, ...updated } : item));
    const updatedPubg = pubgAccounts.map((item) => (item.id === id ? { ...item, ...updated } : item));
    setAllPubgAccounts(updatedAll);
    setPubgAccounts(updatedPubg);

    // Sync to server
    fetch('/api/store/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubgAccounts: updatedPubg, allPubgAccounts: updatedAll }),
    }).catch(() => {});

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.updatePubgAccount(appsScriptConfig.webAppUrl, id, updated).catch(console.error);
    }
  };

  // Toggle PUBG Account Display on website ("نعم" / "لا")
  const togglePubgDisplay = async (id: string, newDisplay: 'نعم' | 'لا' | 'كلا') => {
    const isApproved = newDisplay === 'نعم';
    const displayValue: 'نعم' | 'لا' = isApproved ? 'نعم' : 'لا';
    const target = allPubgAccounts.find((a) => a.id === id);

    // 1. Update allPubgAccounts
    setAllPubgAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              displayOnSite: displayValue,
              approved: isApproved,
              status: isApproved ? 'approved' : 'pending',
              isAvailable: isApproved && !acc.isSold,
            }
          : acc
      )
    );

    // 2. Update pubgAccounts (Visible on public site)
    setPubgAccounts((prev) => {
      if (isApproved) {
        if (target) {
          const approvedAcc: PubgAccount = {
            ...target,
            displayOnSite: 'نعم',
            approved: true,
            status: 'approved',
            isAvailable: !target.isSold,
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
        await AppsScriptService.setPubgDisplay(appsScriptConfig.webAppUrl, id, displayValue, {
          rowIndex: target?.rowIndex,
          rowNumber: target?.rowNumber,
          accountName: target?.accountName || target?.title,
          phone: target?.sellerPhone || target?.phone,
        });
      } catch (err) {
        console.error('Error toggling PUBG account display in Google Sheets:', err);
      }
    }
  };

  // Toggle PUBG Account Sold Status ("متوفر" / "تم البيع")
  const togglePubgSold = async (id: string, isSold: boolean) => {
    const saleStatus = isSold ? 'تم البيع' : 'متوفر';
    const target = allPubgAccounts.find((a) => a.id === id);

    // 1. Update allPubgAccounts
    setAllPubgAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              isSold,
              sold: isSold,
              saleStatus,
              isAvailable: !isSold,
              badge: isSold ? 'تم البيع' : 'حساب موثق',
            }
          : acc
      )
    );

    // 2. Update pubgAccounts
    setPubgAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              isSold,
              sold: isSold,
              saleStatus,
              isAvailable: !isSold,
              badge: isSold ? 'تم البيع' : 'حساب موثق',
            }
          : acc
      )
    );

    // 3. Send update to Google Apps Script
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      try {
        await AppsScriptService.setPubgSold(appsScriptConfig.webAppUrl, id, isSold, {
          rowIndex: target?.rowIndex,
          rowNumber: target?.rowNumber,
          accountName: target?.accountName || target?.title,
          phone: target?.sellerPhone || target?.phone,
        });
      } catch (err) {
        console.error('Error toggling PUBG sold status in Google Sheets:', err);
      }
    }
  };

  // Toggle UC Package Stock (In-Stock / Out-of-Stock)
  const toggleUcPackageStock = async (id: string, isAvailable: boolean) => {
    setUcPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, isAvailable } : pkg))
    );

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      try {
        await AppsScriptService.setUcPackageStock(appsScriptConfig.webAppUrl, id, isAvailable);
      } catch (err) {
        console.error('Error toggling UC package stock in Google Sheets:', err);
      }
    }
  };

  // Toggle Product Stock (In-Stock / Out-of-Stock)
  const toggleProductStock = async (id: string, inStock: boolean) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, inStock } : prod))
    );

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      try {
        await AppsScriptService.setProductStock(appsScriptConfig.webAppUrl, id, inStock);
      } catch (err) {
        console.error('Error toggling Product stock in Google Sheets:', err);
      }
    }
  };

  // Direct Buy Now Single Session (Without aggregating)
  const buyNowDirect = (product: Product, quantity: number = 1) => {
    setCart([{ product, quantity }]);
    setIsCheckoutOpen(true);
  };

  const deletePubgAccount = (id: string) => {
    const updatedPubg = pubgAccounts.filter((item) => item.id !== id);
    const updatedAll = allPubgAccounts.filter((item) => item.id !== id);
    setPubgAccounts(updatedPubg);
    setAllPubgAccounts(updatedAll);
    setPubgSubmissions((prev) => prev.filter((s) => s.id !== id));

    // Delete on server
    fetch(`/api/store/pubg-account/${id}`, { method: 'DELETE' }).catch(() => {});
    fetch('/api/store/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubgAccounts: updatedPubg, allPubgAccounts: updatedAll }),
    }).catch(() => {});

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
    const updatedList = ucPackages.map((item) => (item.id === id ? { ...item, ...updated } : item));
    setUcPackages(updatedList);

    // Sync to server
    fetch('/api/store/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ucPackages: updatedList }),
    }).catch(() => {});

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.updateUcPackage(appsScriptConfig.webAppUrl, id, updated).catch(console.error);
    }
  };

  const deleteUcPackage = (id: string) => {
    const updatedList = ucPackages.filter((item) => item.id !== id);
    setUcPackages(updatedList);

    // Delete on server
    fetch(`/api/store/uc-package/${id}`, { method: 'DELETE' }).catch(() => {});
    fetch('/api/store/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ucPackages: updatedList }),
    }).catch(() => {});

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.deleteUcPackage(appsScriptConfig.webAppUrl, id).catch(console.error);
    }
  };

  // Delivery Rates Admin CRUD
  const addDeliveryRate = async (rate: Omit<DeliveryCityRate, 'id'>) => {
    const newRate: DeliveryCityRate = {
      ...rate,
      id: `rate-${Date.now()}`,
      priceDisplay: rate.priceDisplay || (rate.price ? `${rate.price} د.ل` : '25 د.ل'),
    };
    setDeliveryRates((prev) => [newRate, ...prev]);

    // Save on local server
    fetch('/api/store/delivery-rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRate),
    }).catch(() => {});

    // Save to Google Sheets if connected
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.addDeliveryRate(appsScriptConfig.webAppUrl, newRate).catch(console.error);
    }
  };

  const updateDeliveryRate = async (id: string, updated: Partial<DeliveryCityRate>) => {
    setDeliveryRates((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...updated,
              priceDisplay:
                updated.priceDisplay !== undefined
                  ? updated.priceDisplay
                  : updated.price !== undefined
                  ? `${updated.price} د.ل`
                  : r.priceDisplay,
            }
          : r
      )
    );

    // Update on local server
    fetch(`/api/store/delivery-rate/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});

    // Update in Google Sheets
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.updateDeliveryRate(appsScriptConfig.webAppUrl, id, updated).catch(console.error);
    }
  };

  const deleteDeliveryRate = async (id: string) => {
    setDeliveryRates((prev) => prev.filter((r) => r.id !== id));

    // Delete on local server
    fetch(`/api/store/delivery-rate/${id}`, { method: 'DELETE' }).catch(() => {});

    // Delete in Google Sheets
    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.deleteDeliveryRate(appsScriptConfig.webAppUrl, id).catch(console.error);
    }
  };

  const resetDeliveryRates = async () => {
    setDeliveryRates(ALL_DELIVERY_RATES);
    localStorage.removeItem(STORAGE_KEYS.DELIVERY_RATES);

    const appsScriptConfig = AppsScriptService.getConfig();
    if (appsScriptConfig.webAppUrl) {
      AppsScriptService.saveDeliveryRates(appsScriptConfig.webAppUrl, ALL_DELIVERY_RATES).catch(console.error);
    }
  };

  const syncDeliveryRatesToSheets = async (): Promise<boolean> => {
    const appsScriptConfig = AppsScriptService.getConfig();
    if (!appsScriptConfig.webAppUrl) return false;
    return AppsScriptService.saveDeliveryRates(appsScriptConfig.webAppUrl, deliveryRates);
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
    setDeliveryRates(ALL_DELIVERY_RATES);
    setSettings(INITIAL_STORE_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.PUBG_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.UC_PACKAGES);
    localStorage.removeItem(STORAGE_KEYS.DELIVERY_RATES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  return (
    <StoreContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedCategory,
        setSelectedCategory,
        selectedProduct,
        setSelectedProduct,
        openProductDetails,
        products,
        pubgAccounts,
        ucPackages,
        cities,
        deliveryRates,
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
        togglePubgSold,
        toggleUcPackageStock,
        toggleProductStock,
        buyNowDirect,
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
        addDeliveryRate,
        updateDeliveryRate,
        deleteDeliveryRate,
        resetDeliveryRates,
        syncDeliveryRatesToSheets,
        updateSettings,
        updateOrderStatus,
        deleteOrder,
        resetToDefaults,
        isDataLoading,
        dataLoadedMessage,
        dismissDataLoadedMessage,
        categories,
        addCategory,
        deleteCategory,
        saveCategoriesToSheets,
        adminCredentials,
        updateAdminCredentials,
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
