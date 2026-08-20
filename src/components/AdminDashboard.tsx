import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, PubgAccount, UcPackage, Category, Order } from '../types';
import { GoogleSheetsManager } from './GoogleSheetsManager';
import { 
  Settings, 
  Gamepad2, 
  UserCheck, 
  Zap, 
  ShoppingBag, 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Check, 
  X, 
  Phone, 
  Globe, 
  ShieldAlert,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  LogOut,
  Sparkles,
  Video,
  ExternalLink,
  Clock
} from 'lucide-react';

type AdminTab = 'products' | 'pubg_accounts' | 'pubg_submissions' | 'pubg_uc' | 'settings' | 'orders' | 'google_sheets';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    pubgAccounts,
    addPubgAccount,
    updatePubgAccount,
    deletePubgAccount,
    pubgSubmissions,
    approvePubgSubmission,
    rejectPubgSubmission,
    deletePubgSubmission,
    ucPackages,
    addUcPackage,
    updateUcPackage,
    deleteUcPackage,
    settings,
    updateSettings,
    orders,
    updateOrderStatus,
    deleteOrder,
    resetToDefaults,
    setCurrentPage,
    setPreviewVideoUrl,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [toastMsg, setToastMsg] = useState('');

  // Editing state for products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'سماعات',
    price: 0,
    oldPrice: 0,
    image: '',
    description: '',
    inStock: true,
  });

  // Editing state for PUBG accounts
  const [editingAccount, setEditingAccount] = useState<PubgAccount | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState<Omit<PubgAccount, 'id'>>({
    title: '',
    badge: 'كونكيرور',
    level: 'LVL 75',
    price: 1000,
    features: ['50 ميثيك', '10 أسلحة مطورة', 'فول ماكس'],
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    videoUrl: '',
    isAvailable: true,
    powerLevel: '6000',
    mythicsCount: '50',
    goldenMythicsCount: '2',
    upgradableWeaponsCount: '10',
    carsCount: '3',
    hashtagsCount: '5',
    linkedAccounts: 'جيميل متاح',
    sellerName: '',
    sellerPhone: '',
  });
  const [featuresInput, setFeaturesInput] = useState('');

  // Editing state for UC Packages
  const [editingUc, setEditingUc] = useState<UcPackage | null>(null);
  const [isAddingUc, setIsAddingUc] = useState(false);
  const [ucForm, setUcForm] = useState<Omit<UcPackage, 'id'>>({
    ucAmount: 60,
    bonusUc: 0,
    price: 12,
    isPopular: false,
  });

  // Store Settings local form state
  const [settingsForm, setSettingsForm] = useState(settings);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Product Handlers
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || productForm.price <= 0) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, productForm);
      showToast('تم تحديث المنتج بنجاح');
      setEditingProduct(null);
    } else {
      addProduct(productForm);
      showToast('تمت إضافة المنتج بنجاح');
      setIsAddingProduct(false);
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      oldPrice: prod.oldPrice || 0,
      image: prod.image,
      description: prod.description,
      inStock: prod.inStock,
    });
    setIsAddingProduct(false);
  };

  // PUBG Account Handlers
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.title || accountForm.price <= 0) return;

    const feats = featuresInput
      ? featuresInput.split(',').map((s) => s.trim()).filter(Boolean)
      : accountForm.features;

    const finalData = { ...accountForm, features: feats };

    if (editingAccount) {
      updatePubgAccount(editingAccount.id, finalData);
      showToast('تم تحديث حساب PUBG بنجاح');
      setEditingAccount(null);
    } else {
      addPubgAccount(finalData);
      showToast('تمت إضافة حساب PUBG بنجاح');
      setIsAddingAccount(false);
    }
  };

  const startEditAccount = (acc: PubgAccount) => {
    setEditingAccount(acc);
    setAccountForm({
      title: acc.title,
      badge: acc.badge,
      level: acc.level,
      price: acc.price,
      features: acc.features,
      image: acc.image,
      videoUrl: acc.videoUrl || '',
      isAvailable: acc.isAvailable,
      powerLevel: acc.powerLevel || '',
      mythicsCount: acc.mythicsCount || '',
      goldenMythicsCount: acc.goldenMythicsCount || '',
      upgradableWeaponsCount: acc.upgradableWeaponsCount || '',
      carsCount: acc.carsCount || '',
      hashtagsCount: acc.hashtagsCount || '',
      linkedAccounts: acc.linkedAccounts || '',
      sellerName: acc.sellerName || '',
      sellerPhone: acc.sellerPhone || '',
    });
    setFeaturesInput(acc.features.join(', '));
    setIsAddingAccount(false);
  };

  // UC Package Handlers
  const handleSaveUc = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUc) {
      updateUcPackage(editingUc.id, ucForm);
      showToast('تم تحديث باقة الشدات');
      setEditingUc(null);
    } else {
      addUcPackage(ucForm);
      showToast('تمت إضافة باقة الشدات');
      setIsAddingUc(false);
    }
  };

  const startEditUc = (pkg: UcPackage) => {
    setEditingUc(pkg);
    setUcForm({
      ucAmount: pkg.ucAmount,
      bonusUc: pkg.bonusUc,
      price: pkg.price,
      isPopular: !!pkg.isPopular,
    });
    setIsAddingUc(false);
  };

  // Settings Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    showToast('تم حفظ إعدادات المتجر بنجاح');
  };

  const categoriesList: Category[] = [
    'سماعات',
    'مبردات',
    'كروت شاشة',
    'ميكروفونات',
    'كيبورد',
    'ماوس',
  ];

  return (
    <div className="py-8 sm:py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-white/10">
          <div>
            <div className="flex items-center justify-end sm:justify-start gap-2.5 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold rounded-lg">
                ADMIN PANEL
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                لوحة تحكم المتجر
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              تحكم بجميع محتويات الموقع: المنتجات، حسابات ببجي، باقات الشحن، ورقم الواتساب
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sessionStorage.removeItem('rtg_admin_authenticated');
                setCurrentPage('home');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1.5 border border-red-500/20 transition-colors"
              title="تسجيل خروج من لوحة التحكم"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل خروج</span>
            </button>

            <button
              onClick={() => setCurrentPage('home')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition-colors"
            >
              <span>معاينة الموقع</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                resetToDefaults();
                showToast('تمت إعادة ضبط البيانات الافتراضية بنجاح');
              }}
              className="p-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 transition-colors"
              title="إعادة ضبط البيانات الأصلية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center justify-start gap-2 overflow-x-auto pb-4 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/80'
                : 'bg-[#151824] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>المنتجات والمعدات ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pubg_accounts')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'pubg_accounts'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/80'
                : 'bg-[#151824] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>حسابات PUBG المعروضة ({pubgAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pubg_submissions')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap relative ${
              activeTab === 'pubg_submissions'
                ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-lg shadow-amber-950/80'
                : 'bg-[#151824] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>طلبات بيع الحسابات الواردة ({pubgSubmissions.length})</span>
            {pubgSubmissions.filter((s) => s.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-2 left-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('pubg_uc')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'pubg_uc'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/80'
                : 'bg-[#151824] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>باقات الشدات ({ucPackages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/80'
                : 'bg-[#151824] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>سجل الطلبات ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('google_sheets')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'google_sheets'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/80'
                : 'bg-[#151824] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>جداول بيانات Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/80'
                : 'bg-[#151824] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>إعدادات المتجر</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">إدارة المنتجات والمعدات</h2>
              {!isAddingProduct && !editingProduct && (
                <button
                  onClick={() => {
                    setIsAddingProduct(true);
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      category: 'سماعات',
                      price: 150,
                      oldPrice: 0,
                      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
                      description: '',
                      inStock: true,
                    });
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
              )}
            </div>

            {/* Product Add/Edit Form */}
            {(isAddingProduct || editingProduct) && (
              <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <button
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-bold text-white">
                    {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </h3>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">اسم المنتج</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">الفئة</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value as Category })}
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none cursor-pointer"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat} className="bg-[#11131c]">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">السعر (د.ل)</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">السعر قبل الخصم (اختياري)</label>
                      <input
                        type="number"
                        value={productForm.oldPrice || ''}
                        onChange={(e) => setProductForm({ ...productForm, oldPrice: Number(e.target.value) || undefined })}
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">رابط صورة المنتج (Image URL)</label>
                    <input
                      type="url"
                      required
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الوصف والمواصفات</label>
                    <textarea
                      rows={3}
                      required
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.inStock}
                        onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                        className="w-4 h-4 accent-red-600 rounded"
                      />
                      <span>متوفر في المخزون (In Stock)</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProduct(false);
                        setEditingProduct(null);
                      }}
                      className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-[#12141e] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#171926] text-slate-400 font-bold border-b border-white/10">
                    <tr>
                      <th className="py-4 px-4">الصورة</th>
                      <th className="py-4 px-4">اسم المنتج</th>
                      <th className="py-4 px-4">الفئة</th>
                      <th className="py-4 px-4">السعر</th>
                      <th className="py-4 px-4">الحالة</th>
                      <th className="py-4 px-4 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-black/40"
                          />
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{prod.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 bg-red-600/15 text-red-400 rounded-lg font-semibold">
                            {prod.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {prod.price} د.ل
                        </td>
                        <td className="py-3 px-4">
                          {prod.inStock ? (
                            <span className="text-emerald-400 font-bold">متوفر</span>
                          ) : (
                            <span className="text-red-400 font-bold">نفذ</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEditProduct(prod)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                              title="تعديل"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                deleteProduct(prod.id);
                                showToast(`تم حذف ${prod.name} بنجاح`);
                              }}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PUBG ACCOUNTS MANAGEMENT */}
        {activeTab === 'pubg_accounts' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">إدارة حسابات PUBG Mobile</h2>
              {!isAddingAccount && !editingAccount && (
                <button
                  onClick={() => {
                    setIsAddingAccount(true);
                    setEditingAccount(null);
                    setAccountForm({
                      title: '',
                      badge: 'كونكيرور',
                      level: 'LVL 75',
                      price: 1200,
                      features: ['50 ميثيك', '15 سلاح مطور', 'فول ماكس', 'سكين سيارة'],
                      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
                      videoUrl: '',
                      isAvailable: true,
                    });
                    setFeaturesInput('50 ميثيك, 15 سلاح مطور, فول ماكس, سكين سيارة');
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة حساب جديد</span>
                </button>
              )}
            </div>

            {/* Account Form */}
            {(isAddingAccount || editingAccount) && (
              <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <button
                    onClick={() => {
                      setIsAddingAccount(false);
                      setEditingAccount(null);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-bold text-white">
                    {editingAccount ? 'تعديل حساب PUBG' : 'إضافة حساب جديد'}
                  </h3>
                </div>

                <form onSubmit={handleSaveAccount} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الحساب</label>
                    <input
                      type="text"
                      required
                      value={accountForm.title}
                      onChange={(e) => setAccountForm({ ...accountForm, title: e.target.value })}
                      placeholder="مثال: حساب ميثيك فاشون - كونكيرور سيزون 19"
                      className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">البادج (Badge)</label>
                      <input
                        type="text"
                        required
                        value={accountForm.badge}
                        onChange={(e) => setAccountForm({ ...accountForm, badge: e.target.value })}
                        placeholder="كونكيرور / آيس ماستر"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">المستوى (Level)</label>
                      <input
                        type="text"
                        required
                        value={accountForm.level}
                        onChange={(e) => setAccountForm({ ...accountForm, level: e.target.value })}
                        placeholder="LVL 78"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">السعر (د.ل)</label>
                      <input
                        type="number"
                        required
                        value={accountForm.price}
                        onChange={(e) => setAccountForm({ ...accountForm, price: Number(e.target.value) })}
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">مستوى القوة</label>
                      <input
                        type="text"
                        value={accountForm.powerLevel || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, powerLevel: e.target.value })}
                        placeholder="مثال: 6500"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">عدد الميثيك العادي</label>
                      <input
                        type="text"
                        value={accountForm.mythicsCount || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, mythicsCount: e.target.value })}
                        placeholder="مثال: 55 ميثيك"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">عدد الميثيك الذهبي</label>
                      <input
                        type="text"
                        value={accountForm.goldenMythicsCount || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, goldenMythicsCount: e.target.value })}
                        placeholder="مثال: 3 بدلات"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">الأسلحة المطورة والماكس</label>
                      <input
                        type="text"
                        value={accountForm.upgradableWeaponsCount || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, upgradableWeaponsCount: e.target.value })}
                        placeholder="مثال: 12 سلاح مطور"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">عدد السيارات</label>
                      <input
                        type="text"
                        value={accountForm.carsCount || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, carsCount: e.target.value })}
                        placeholder="مثال: 4 سيارات"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">الهاشتاجات والألقاب</label>
                      <input
                        type="text"
                        value={accountForm.hashtagsCount || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, hashtagsCount: e.target.value })}
                        placeholder="مثال: 8 هاشتاجات"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">روابط الربط (جيميل، فيسبوك...)</label>
                      <input
                        type="text"
                        value={accountForm.linkedAccounts || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, linkedAccounts: e.target.value })}
                        placeholder="مثال: جيميل + فيسبوك"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">اسم البائع (داخلي)</label>
                      <input
                        type="text"
                        value={accountForm.sellerName || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, sellerName: e.target.value })}
                        placeholder="محمد علي"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">رقم هاتف البائع (داخلي)</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={accountForm.sellerPhone || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, sellerPhone: e.target.value })}
                        placeholder="091xxxxxxx"
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm font-mono text-right outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      المميزات السريعة للبطاقة (افصل بين كل ميزة بفاصلة ,)
                    </label>
                    <input
                      type="text"
                      required
                      value={featuresInput}
                      onChange={(e) => setFeaturesInput(e.target.value)}
                      placeholder="75 ميثيك, 20 سلاح مطور, بدلة المومياء, ام فور الجوكر ماكس, فول ماكس..."
                      className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">رابط الصورة (Image URL)</label>
                      <input
                        type="url"
                        required
                        value={accountForm.image}
                        onChange={(e) => setAccountForm({ ...accountForm, image: e.target.value })}
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm font-mono text-left outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">رابط الفيديو (اختياري)</label>
                      <input
                        type="url"
                        value={accountForm.videoUrl || ''}
                        onChange={(e) => setAccountForm({ ...accountForm, videoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-4 text-white text-sm font-mono text-left outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingAccount ? 'حفظ التعديلات' : 'إضافة الحساب'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAccount(false);
                        setEditingAccount(null);
                      }}
                      className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Accounts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pubgAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-5 rounded-3xl bg-[#12141e] border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={acc.image}
                      alt={acc.title}
                      className="w-16 h-16 rounded-2xl object-cover border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-red-600/20 text-red-400 text-[10px] font-bold">
                          {acc.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{acc.level}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{acc.title}</h4>
                      <p className="text-xs text-red-400 font-mono font-bold mt-1">
                        {acc.price.toLocaleString()} د.ل
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEditAccount(acc)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                      title="تعديل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        deletePubgAccount(acc.id);
                        showToast(`تم حذف الحساب ${acc.title} بنجاح`);
                      }}
                      className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PUBG SUBMISSIONS (طلبات بيع الحسابات الواردة من المستخدمين) */}
        {activeTab === 'pubg_submissions' && (
          <div className="space-y-8">
            {/* Header & Stats Banner */}
            <div className="bg-gradient-to-r from-amber-950/40 via-[#12141e] to-red-950/30 border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      PUBG SELL REQUESTS
                    </span>
                    <span className="text-xs text-slate-400">تحقق وموافقة فورية</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    طلبات بيع حسابات PUBG الواردة ({pubgSubmissions.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    هنا تظهر جميع طلبات إضافة حسابات PUBG المقدمة من الزوار. تأكد من تحويل 5 ليرات إلى الرقم <strong className="text-amber-300 font-mono">0943981577</strong>، وافحص تفاصيل الحساب وفيديو الاستعراض، ثم اضغط على زر "موافقة ونشر في المتجر" ليظهر الحساب مباشرة للمشترين.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('google_sheets')}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>عرض وحفظ في Google Sheets</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submissions List */}
            {pubgSubmissions.length === 0 ? (
              <div className="text-center py-16 bg-[#12141e] border border-white/10 rounded-3xl space-y-3">
                <Sparkles className="w-12 h-12 text-amber-500/40 mx-auto" />
                <h3 className="text-base font-bold text-white">لا توجد طلبات بيع حسابات حالياً</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  عندما يقوم أي عميل بإرسال طلب بيع حساب ببجي الخاص به من واجهة المتجر، سيظهر هنا مع كافة التفاصيل للتأكيد والنشر.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {pubgSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`p-6 rounded-3xl border transition-all ${
                      sub.status === 'approved'
                        ? 'bg-[#12181e] border-emerald-500/30'
                        : sub.status === 'rejected'
                        ? 'bg-[#1e1214] border-red-500/20 opacity-75'
                        : 'bg-[#12141e] border-amber-500/30 shadow-lg shadow-amber-950/20'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-5 border-b border-white/10">
                      {/* Left: Main Header Info */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                              sub.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : sub.status === 'rejected'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            }`}
                          >
                            {sub.status === 'approved' && <Check className="w-3.5 h-3.5" />}
                            {sub.status === 'rejected' && <X className="w-3.5 h-3.5" />}
                            {sub.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                            <span>
                              {sub.status === 'approved'
                                ? 'معتمد ومنشور في المتجر'
                                : sub.status === 'rejected'
                                ? 'مرفوض'
                                : 'قيد المراجعة والتدقيق'}
                            </span>
                          </span>

                          <span className="text-xs text-slate-400 font-mono">
                            📅 {sub.date}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <span>{sub.accountName}</span>
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-amber-300 text-xs font-bold">
                            LVL {sub.accountLevel}
                          </span>
                        </h3>
                      </div>

                      {/* Right: Price & Fee Status */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">سعر البيع المطلوب:</span>
                          <span className="text-xl font-black text-amber-400 font-mono">
                            {sub.salePrice} د.ل
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right">
                          <span className="text-[10px] text-amber-300 font-bold block">رقم تحويل رسوم 5 ليرات:</span>
                          <span className="text-xs font-mono font-bold text-white dir-ltr">
                            {sub.transferPhone || 'غير مدخل'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Specifications Grid */}
                    <div className="py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 border-b border-white/5 text-xs">
                      <div className="p-3 rounded-xl bg-white/5">
                        <span className="text-slate-400 block text-[11px]">مستوى القوة:</span>
                        <strong className="text-white mt-0.5 block">{sub.powerLevel || '—'}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <span className="text-slate-400 block text-[11px]">ميثيك عادي:</span>
                        <strong className="text-purple-300 mt-0.5 block">{sub.mythicsCount || '0'}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <span className="text-slate-400 block text-[11px]">ميثيك ذهبي:</span>
                        <strong className="text-amber-300 mt-0.5 block">{sub.goldenMythicsCount || '0'}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <span className="text-slate-400 block text-[11px]">سكنات السيارات:</span>
                        <strong className="text-cyan-300 mt-0.5 block">{sub.carsCount || '0'}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <span className="text-slate-400 block text-[11px]">الهاشتاجات:</span>
                        <strong className="text-white mt-0.5 block">{sub.hashtagsCount || '0'}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <span className="text-slate-400 block text-[11px]">روابط الربط:</span>
                        <strong className="text-amber-200 mt-0.5 block truncate" title={sub.linkedAccounts}>
                          {sub.linkedAccounts || '—'}
                        </strong>
                      </div>
                    </div>

                    {/* Weapons & Extra info */}
                    <div className="py-4 space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-slate-400 font-bold min-w-[140px]">الأسلحة المطورة:</span>
                        <span className="text-white font-medium bg-white/5 px-3 py-1.5 rounded-lg flex-1">
                          {sub.upgradableWeapons || 'لا يوجد أسلحة مطورة محددة'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-slate-400 font-bold min-w-[140px]">بيانات البائع:</span>
                        <span className="text-slate-200">
                          {sub.fullName} ({sub.phone})
                        </span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {sub.videoUrl && (
                          <button
                            onClick={() => setPreviewVideoUrl(sub.videoUrl || null)}
                            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-2 border border-amber-500/30 transition-colors"
                          >
                            <Video className="w-4 h-4" />
                            <span>مشاهدة فيديو الحساب</span>
                          </button>
                        )}

                        <a
                          href={`https://wa.me/${sub.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `مرحباً ${sub.fullName}، بخصوص طلب عرض حساب ببجي (${sub.accountName}) في متجر RTG Gear X:`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition-colors"
                        >
                          <Phone className="w-4 h-4 text-emerald-400" />
                          <span>مراسلة البائع واتساب</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        {sub.status !== 'approved' && (
                          <button
                            onClick={() => {
                              approvePubgSubmission(sub.id);
                              showToast('تمت الموافقة على الحساب وإدراجه بنجاح في متجر حسابات ببجي المعروضة!');
                            }}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all"
                          >
                            <Check className="w-4 h-4" />
                            <span>موافقة ونشر في المتجر فوراً</span>
                          </button>
                        )}

                        {sub.status === 'pending' && (
                          <button
                            onClick={() => {
                              rejectPubgSubmission(sub.id);
                              showToast('تم تغيير حالة الطلب إلى مرفوض');
                            }}
                            className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs flex items-center gap-2 border border-red-500/30 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>رفض الطلب</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm('هل تريد حذف هذا الطلب نهائياً؟')) {
                              deletePubgSubmission(sub.id);
                              showToast('تم حذف الطلب');
                            }
                          }}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PUBG UC PACKAGES */}
        {activeTab === 'pubg_uc' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">إدارة باقات شدات PUBG</h2>
              {!isAddingUc && !editingUc && (
                <button
                  onClick={() => {
                    setIsAddingUc(true);
                    setEditingUc(null);
                    setUcForm({
                      ucAmount: 1000,
                      bonusUc: 100,
                      price: 150,
                      isPopular: false,
                    });
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة باقة جديدة</span>
                </button>
              )}
            </div>

            {/* UC Form */}
            {(isAddingUc || editingUc) && (
              <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 space-y-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-white">
                  {editingUc ? 'تعديل الباقة' : 'إضافة باقة شدات'}
                </h3>

                <form onSubmit={handleSaveUc} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">كمية الـ UC</label>
                      <input
                        type="number"
                        required
                        value={ucForm.ucAmount}
                        onChange={(e) => setUcForm({ ...ucForm, ucAmount: Number(e.target.value) })}
                        className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">الشدات المجانية (Bonus)</label>
                      <input
                        type="number"
                        value={ucForm.bonusUc}
                        onChange={(e) => setUcForm({ ...ucForm, bonusUc: Number(e.target.value) })}
                        className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">السعر (د.ل)</label>
                      <input
                        type="number"
                        required
                        value={ucForm.price}
                        onChange={(e) => setUcForm({ ...ucForm, price: Number(e.target.value) })}
                        className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm font-mono outline-none"
                      />
                    </div>
                  </div>

                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ucForm.isPopular}
                      onChange={(e) => setUcForm({ ...ucForm, isPopular: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span>تمييز كباقة (الأكثر طلباً ⭐)</span>
                  </label>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingUc(false);
                        setEditingUc(null);
                      }}
                      className="px-4 py-2.5 bg-white/5 text-slate-400 rounded-xl text-xs font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* UC Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ucPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-5 rounded-3xl bg-[#12141e] border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white font-mono">{pkg.ucAmount} UC</span>
                      {pkg.bonusUc > 0 && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">
                          +{pkg.bonusUc}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-black text-amber-400 font-mono mt-1 block">
                      {pkg.price} د.ل
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEditUc(pkg)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        deleteUcPackage(pkg.id);
                        showToast(`تم حذف باقة ${pkg.ucAmount} UC بنجاح`);
                      }}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS LOG */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">سجل طلبات العملاء</h2>
              <span className="text-xs text-slate-400">
                يتم حفظ كل طلب يُرسل عبر الموقع لمتابعته
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center bg-[#12141e] border border-white/5 rounded-3xl text-slate-400 text-sm">
                لا توجد طلبات مسجلة بعد. عند قيام العميل بالطلب ستظهر كافة بياناته هنا.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-6 rounded-3xl bg-[#12141e] border border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-400">#{ord.id}</span>
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white/10 text-white">
                          {ord.type === 'gear' ? 'معدات' : ord.type === 'pubg_uc' ? 'شدات PUBG' : 'حساب PUBG'}
                        </span>
                        <span className="text-xs text-slate-500">{ord.date}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as Order['status'])}
                          className="bg-[#181b27] border border-white/10 text-xs text-white rounded-xl py-1.5 px-3 outline-none cursor-pointer"
                        >
                          <option value="pending">معلق (Pending)</option>
                          <option value="processing">قيد التنفيذ</option>
                          <option value="completed">مكتمل (Completed)</option>
                          <option value="cancelled">ملغي</option>
                        </select>

                        <button
                          onClick={() => {
                            deleteOrder(ord.id);
                            showToast(`تم حذف الطلب #${ord.id} بنجاح`);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block">العميل:</span>
                        <span className="font-bold text-white">{ord.customerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">الهاتف:</span>
                        <span className="font-mono text-white" dir="ltr">{ord.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">الإجمالي:</span>
                        <span className="font-mono font-bold text-red-400">{ord.total} د.ل</span>
                      </div>
                    </div>

                    {ord.city && (
                      <div className="text-xs text-slate-400">
                        <span>العنوان: {ord.city} - {ord.region} | الدفع: {ord.paymentMethod}</span>
                      </div>
                    )}

                    {ord.pubgId && (
                      <div className="text-xs text-amber-300 font-mono">
                        <span>PUBG ID: {ord.pubgId} | الباقة: {ord.packageName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: GOOGLE SHEETS INTEGRATION */}
        {activeTab === 'google_sheets' && (
          <GoogleSheetsManager />
        )}

        {/* TAB 6: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white pb-4 border-b border-white/10">
              إعدادات المتجر ومعلومات التواصل
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المتجر</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم الواتساب لاستلام الطلبات (أرقام دولية بدون +)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="218934590635"
                    className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm font-mono text-left outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف المعروض</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settingsForm.phoneDisplay}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phoneDisplay: e.target.value })}
                    placeholder="+218 93 459 0635"
                    className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm font-mono text-left outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">حساب TikTok</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settingsForm.tiktokHandle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tiktokHandle: e.target.value })}
                    className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm font-mono text-left outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">حساب Instagram</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settingsForm.instagramHandle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagramHandle: e.target.value })}
                    className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm font-mono text-left outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نص "عن المتجر"</label>
                <textarea
                  rows={4}
                  value={settingsForm.aboutText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, aboutText: e.target.value })}
                  className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نص التوصيل</label>
                  <input
                    type="text"
                    value={settingsForm.shippingText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingText: e.target.value })}
                    className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نص أوقات العمل</label>
                  <input
                    type="text"
                    value={settingsForm.hoursText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hoursText: e.target.value })}
                    className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none"
                  />
                </div>
              </div>

              {/* Admin Login Credentials Section */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>تغيير بيانات تسجيل دخول لوحة التحكم (Username & Password)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستخدم للإدارة (Admin Username)</label>
                    <input
                      type="text"
                      defaultValue={localStorage.getItem('rtg_admin_user') || 'admin'}
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          localStorage.setItem('rtg_admin_user', e.target.value.trim());
                        }
                      }}
                      className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور الجديدة (Admin Password)</label>
                    <input
                      type="text"
                      defaultValue={localStorage.getItem('rtg_admin_pass') || 'rtg2026'}
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          localStorage.setItem('rtg_admin_pass', e.target.value.trim());
                        }
                      }}
                      className="w-full bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-950/60 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>حفظ جميع الإعدادات</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
