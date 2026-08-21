import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, PubgAccount, UcPackage, Category } from '../types';
import { AppsScriptService, AppsScriptConfig, GOOGLE_APPS_SCRIPT_TEMPLATE } from '../services/appsScript';
import { DeliveryRatesAdmin } from './DeliveryRatesAdmin';
import { 
  Gamepad2, 
  UserCheck, 
  Zap, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Phone, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  Link2, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  LogOut, 
  Upload, 
  Image as ImageIcon, 
  ShieldCheck, 
  Share2, 
  Globe, 
  AlertTriangle,
  Truck
} from 'lucide-react';

type AdminTab = 'products' | 'pubg_accounts' | 'pubg_uc' | 'delivery_rates' | 'social_contact' | 'sheets_sync';

interface DeleteItemState {
  type: 'product' | 'pubg_account' | 'pubg_uc';
  id: string;
  name: string;
}

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    deleteProduct,
    updateProduct,
    allPubgAccounts,
    pubgAccounts,
    togglePubgDisplay,
    deletePubgAccount,
    ucPackages,
    addUcPackage,
    deleteUcPackage,
    deliveryRates,
    settings,
    updateSettings,
    setCurrentPage,
    refreshFromAppsScript,
    isAppsScriptSyncing,
    setPreviewVideoUrl,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Deletion Confirmation Modal State
  const [itemToDelete, setItemToDelete] = useState<DeleteItemState | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Apps Script Sync State
  const [appsScriptConfig, setAppsScriptConfig] = useState<AppsScriptConfig>(AppsScriptService.getConfig());
  const [webAppUrl, setWebAppUrl] = useState(appsScriptConfig.webAppUrl || '');
  const [isCopied, setIsCopied] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Products Tab State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'سماعات',
    price: 0,
    oldPrice: undefined,
    image: '',
    imageBase64: '',
    description: '',
    inStock: true,
  });

  // PUBG Accounts Tab State
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    ownerName: '',
    accountName: '',
    accountLevel: '70',
    mythicsCount: '30',
    apartmentLevel: 'مستوى 5',
    goldCount: '2',
    upgradableWeapons: 'M4 جوكر لفل 5',
    carsCount: '3',
    hashtagsCount: '4',
    linkedServices: 'جيميل متاح',
    salePrice: '500',
    sellerPhone: '0912345678',
    transferPhone: '0912345678',
    videoUrl: '',
  });

  // UC Packages Tab State
  const [isAddingUc, setIsAddingUc] = useState(false);
  const [ucForm, setUcForm] = useState<Omit<UcPackage, 'id'>>({
    ucAmount: 660,
    bonusUc: 60,
    price: 35,
    isPopular: false,
  });

  // Social & Contact Links Form State
  const [socialForm, setSocialForm] = useState({
    tiktokUrl: settings.tiktokUrl || 'https://www.tiktok.com/@rtg_gear_x',
    tiktokHandle: settings.tiktokHandle || '@rtg_gear_x',
    facebookUrl: settings.facebookUrl || 'https://www.facebook.com/share/18H2vFuhd9/',
    facebookHandle: settings.facebookHandle || 'RTG Gear X',
    instagramUrl: settings.instagramUrl || 'https://www.instagram.com/rtg_gear_x',
    instagramHandle: settings.instagramHandle || '@rtg_gear_x',
    whatsappNumber: settings.whatsappNumber || '218934590635',
    phoneDisplay: settings.phoneDisplay || '+218 93 459 0635',
    supportPhoneAlt: settings.supportPhoneAlt || '0934590635',
    transferFeePhone: settings.transferFeePhone || '0943981577',
    googleFormUrl: settings.googleFormUrl || 'https://forms.gle/LCS6CgXUWciHH21k8',
  });
  const [isSavingSocial, setIsSavingSocial] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('rtg_admin_authenticated');
    setCurrentPage('home');
  };

  // Perform Item Deletion
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (itemToDelete.type === 'product') {
        deleteProduct(itemToDelete.id);
        showToast('success', `تم حذف المنتج "${itemToDelete.name}" نهائياً من الموقع وجدول Google Sheets`);
      } else if (itemToDelete.type === 'pubg_account') {
        deletePubgAccount(itemToDelete.id);
        showToast('success', `تم حذف حساب PUBG "${itemToDelete.name}" نهائياً من الموقع وجدول Google Sheets`);
      } else if (itemToDelete.type === 'pubg_uc') {
        deleteUcPackage(itemToDelete.id);
        showToast('success', `تم حذف باقة الشدات "${itemToDelete.name}" نهائياً من الموقع وجدول Google Sheets`);
      }
      setItemToDelete(null);
    } catch (err: any) {
      showToast('error', 'حدث خطأ أثناء الحذف: ' + (err.message || 'حاول مجدداً'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Save Social & Contact Links
  const handleSaveSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSocial(true);
    try {
      updateSettings(socialForm);

      const cfg = AppsScriptService.getConfig();
      if (cfg.webAppUrl) {
        await AppsScriptService.saveSettings(cfg.webAppUrl, socialForm);
        showToast('success', 'تم حفظ وتحديث روابط تيك توك وفيسبوك وانستقرام وأرقام الهواتف في Google Sheets والموقع بنجاح!');
      } else {
        showToast('success', 'تم تحديث روابط التواصل في الموقع بنجاح! (قم بربط Google Apps Script لحفظها في الشيت تلقائياً)');
      }
    } catch (err: any) {
      showToast('error', 'تعذر حفظ الروابط: ' + (err.message || 'خطأ في الاتصال'));
    } finally {
      setIsSavingSocial(false);
    }
  };

  // 1. Handle Add Product
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      showToast('error', 'يرجى إدخال اسم المنتج وسعر المنتج');
      return;
    }

    const finalImage = productForm.imageBase64 || productForm.image || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80';

    addProduct({
      ...productForm,
      image: finalImage,
      price: Number(productForm.price),
      oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : undefined,
    });

    setProductForm({
      name: '',
      category: 'سماعات',
      price: 0,
      oldPrice: undefined,
      image: '',
      imageBase64: '',
      description: '',
      inStock: true,
    });
    setIsAddingProduct(false);
    showToast('success', 'تمت إضافة المنتج وحفظه في Google Sheet بنجاح!');
  };

  // Image Upload Handler for Products
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm((prev) => ({
          ...prev,
          imageBase64: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Handle PUBG Account Actions
  const handleToggleAccountDisplay = async (accId: string, currentStatus: 'نعم' | 'لا' | undefined) => {
    const newStatus: 'نعم' | 'لا' = currentStatus === 'نعم' ? 'لا' : 'نعم';
    try {
      await togglePubgDisplay(accId, newStatus);
      showToast(
        'success',
        newStatus === 'نعم' 
          ? 'تم تغيير الحالة إلى (نعم) وعرض الحساب بالموقع فوراً!' 
          : 'تم إخفاء الحساب من الموقع بنجاح.'
      );
    } catch (err: any) {
      showToast('error', 'حدث خطأ أثناء تحديث حالة الحساب');
    }
  };

  const handleManualAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.accountName || !accountForm.sellerPhone) {
      showToast('error', 'يرجى إدخال اسم الحساب ورقم هاتف البائع');
      return;
    }

    const newAcc: PubgAccount = {
      id: `acc-${Date.now()}`,
      title: accountForm.accountName,
      accountName: accountForm.accountName,
      ownerName: accountForm.ownerName,
      level: `LVL ${accountForm.accountLevel}`,
      accountLevel: accountForm.accountLevel,
      badge: 'حساب موثق',
      price: Number(accountForm.salePrice) || 0,
      salePrice: accountForm.salePrice,
      sellerPhone: accountForm.sellerPhone,
      transferPhone: accountForm.transferPhone,
      mythicsCount: accountForm.mythicsCount,
      apartmentLevel: accountForm.apartmentLevel,
      goldCount: accountForm.goldCount,
      upgradableWeaponsCount: accountForm.upgradableWeapons,
      carsCount: accountForm.carsCount,
      hashtagsCount: accountForm.hashtagsCount,
      linkedServices: accountForm.linkedServices,
      linkedAccounts: accountForm.linkedServices,
      videoUrl: accountForm.videoUrl,
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      displayOnSite: 'نعم',
      approved: true,
      status: 'approved',
      features: [
        accountForm.mythicsCount ? `${accountForm.mythicsCount} ميثيك` : '',
        accountForm.upgradableWeapons || '',
        accountForm.carsCount ? `${accountForm.carsCount} سيارات` : '',
      ].filter(Boolean),
    };

    // Save to apps script
    const config = AppsScriptService.getConfig();
    if (config.webAppUrl) {
      await AppsScriptService.submitPubgSellAccount(config.webAppUrl, {
        ...accountForm,
        id: newAcc.id,
        displayOnSite: 'نعم',
      });
    }

    await togglePubgDisplay(newAcc.id, 'نعم');
    setIsAddingAccount(false);
    showToast('success', 'تمت إضافة الحساب واعتماده للعرض في الموقع بنجاح!');
  };

  // 3. Handle Add UC Package
  const handleUcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ucForm.ucAmount || !ucForm.price) {
      showToast('error', 'يرجى إدخال كمية الشدات والسعر');
      return;
    }

    addUcPackage({
      ucAmount: Number(ucForm.ucAmount),
      bonusUc: Number(ucForm.bonusUc) || 0,
      price: Number(ucForm.price),
      isPopular: ucForm.isPopular,
    });

    setUcForm({
      ucAmount: 660,
      bonusUc: 60,
      price: 35,
      isPopular: false,
    });
    setIsAddingUc(false);
    showToast('success', 'تمت إضافة باقة الشدات إلى Google Sheet بنجاح!');
  };

  // 4. Handle Apps Script Save & Sync
  const handleSaveAndSync = async () => {
    if (!webAppUrl.trim()) {
      showToast('error', 'يرجى إدخال رابط تطبيق الويب Google Apps Script أولاً');
      return;
    }

    try {
      setIsManualSyncing(true);
      const updated = AppsScriptService.saveConfig({
        webAppUrl: webAppUrl.trim(),
      });
      setAppsScriptConfig(updated);

      await refreshFromAppsScript();
      showToast('success', 'تم جلب وتحديث كافة المنتجات والحسابات وباقات الشدات من Google Sheet بنجاح!');
    } catch (err: any) {
      showToast('error', err.message || 'تعذر الاتصال بـ Google Sheets، تأكد من صحة الرابط ونشر السكريبت بحق وصول Anyone');
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setIsCopied(true);
    showToast('success', 'تم نسخ كود Apps Script الكامل إلى الحافظة بنجاح!');
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Determine list of accounts to display
  // Merge allPubgAccounts and pubgAccounts to ensure no account is missed
  const displayedPubgAccounts = allPubgAccounts.length > 0 ? allPubgAccounts : pubgAccounts;

  return (
    <div className="min-h-screen bg-[#0a0b10] py-8 px-4 sm:px-6 lg:px-8 text-right font-['Cairo',sans-serif]">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Header */}
        <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                لوحة تحكم الأدمن <span className="text-red-500 text-sm font-mono font-bold">RTG GEAR X</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                إدارة سهلة ومباشرة مرتبطة مع Google Sheets بدون أي تعقيد
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('home')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all flex items-center gap-2 border border-white/10"
            >
              <span>معاينة المتجر</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-2 border border-red-500/20"
            >
              <span>تسجيل خروج</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-bold animate-fadeIn ${
              toastMsg.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/15 border-red-500/30 text-red-300'
            }`}
          >
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* 6 Main Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`p-3.5 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
              activeTab === 'products'
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/60'
                : 'bg-[#12141e] text-slate-300 border-white/10 hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" />
            <span>المنتجات ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pubg_accounts')}
            className={`p-3.5 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
              activeTab === 'pubg_accounts'
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/60'
                : 'bg-[#12141e] text-slate-300 border-white/10 hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-4 h-4 flex-shrink-0" />
            <span>حسابات ببجي ({displayedPubgAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pubg_uc')}
            className={`p-3.5 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
              activeTab === 'pubg_uc'
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/60'
                : 'bg-[#12141e] text-slate-300 border-white/10 hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            <span>باقات الشدات ({ucPackages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery_rates')}
            className={`p-3.5 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
              activeTab === 'delivery_rates'
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/60'
                : 'bg-[#12141e] text-slate-300 border-white/10 hover:bg-white/5'
            }`}
          >
            <Truck className="w-4 h-4 flex-shrink-0" />
            <span>أسعار التوصيل ({deliveryRates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('social_contact')}
            className={`p-3.5 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
              activeTab === 'social_contact'
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/60'
                : 'bg-[#12141e] text-slate-300 border-white/10 hover:bg-white/5'
            }`}
          >
            <Share2 className="w-4 h-4 flex-shrink-0" />
            <span>صفحات التواصل</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets_sync')}
            className={`p-3.5 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
              activeTab === 'sheets_sync'
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/60'
                : 'bg-[#12141e] text-slate-300 border-white/10 hover:bg-white/5'
            }`}
          >
            <Link2 className="w-4 h-4 flex-shrink-0" />
            <span>كود Apps Script</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-red-500" />
                <span>إدارة المنتجات في المتجر وجوجل شيت</span>
              </h2>
              <button
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingProduct ? 'إلغاء' : 'إضافة منتج جديد'}</span>
              </button>
            </div>

            {/* Add Product Form */}
            {isAddingProduct && (
              <form onSubmit={handleProductSubmit} className="bg-[#151824] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-white/10">
                  إضافة منتج جديد إلى Google Sheet
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المنتج *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="مثال: سماعة HyperX Cloud II"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">فئة المنتج</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value as Category })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    >
                      <option value="كاميرات مراقبة">كاميرات مراقبة</option>
                      <option value="سماعات">سماعات</option>
                      <option value="كيبورد">كيبوردات</option>
                      <option value="ماوس">ماوسات</option>
                      <option value="ميكروفونات">ميكروفونات</option>
                      <option value="مبردات">مبردات</option>
                      <option value="كروت شاشة">كروت شاشة</option>
                      <option value="إكسسوارات">إكسسوارات</option>
                      <option value="الكل">أخرى / عام</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">السعر (دينار ليبي) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.price || ''}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      placeholder="مثال: 180"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">السعر قبل الخصم (اختياري)</label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.oldPrice || ''}
                      onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="مثال: 220"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط صورة المنتج (URL)</label>
                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none mb-2"
                    />
                    
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 cursor-pointer flex items-center gap-2">
                        <Upload className="w-4 h-4 text-red-400" />
                        <span>أو ارفع صورة من جهازك</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      {productForm.imageBase64 && (
                        <span className="text-[11px] text-emerald-400 font-bold">✓ تم اختيار صورة من الجهاز</span>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">الوصف والمواصفات</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="اكتب مواصفات المنتج ومميزاته..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg transition-all"
                  >
                    حفظ وإضافة للمتجر
                  </button>
                </div>
              </form>
            )}

            {/* Products List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div key={prod.id} className="bg-[#12141e] border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md group hover:border-red-500/30 transition-all">
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.image || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'}
                      alt={prod.name}
                      className="w-16 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0 bg-black/40"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-red-400 font-bold">
                        {prod.category}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate mt-1">{prod.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-red-500 font-mono">{prod.price} د.ل</span>
                        {prod.oldPrice && (
                          <span className="text-[10px] text-slate-500 line-through font-mono">{prod.oldPrice} د.ل</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <button
                      onClick={() => updateProduct(prod.id, { inStock: !prod.inStock })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        prod.inStock ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {prod.inStock ? 'متوفر بالمخزون' : 'غير متوفر'}
                    </button>

                    <button
                      onClick={() => setItemToDelete({ type: 'product', id: prod.id, name: prod.name })}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="حذف المنتج"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PUBG ACCOUNTS */}
        {activeTab === 'pubg_accounts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#12141e] border border-white/10 rounded-2xl p-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-red-500" />
                  <span>طلبات وحسابات PUBG Mobile</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  تأكد من تحويل رسوم العرض (5 دينار) بالاتصال بالبائع ثم اضغط على زر العرض لتغييره إلى <strong className="text-emerald-400 font-bold">(نعم)</strong> ليظهر بالموقع.
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <a
                  href={settings.googleFormUrl || 'https://forms.gle/LCS6CgXUWciHH21k8'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>نموذج Google Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setIsAddingAccount(!isAddingAccount)}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingAccount ? 'إلغاء' : 'إضافة حساب يدوياً'}</span>
                </button>
              </div>
            </div>

            {/* Add Account Manually Form */}
            {isAddingAccount && (
              <form onSubmit={handleManualAddAccount} className="bg-[#151824] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-white/10">
                  إضافة حساب ببجي يدوياً وعرضه في الموقع
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المالك</label>
                    <input
                      type="text"
                      value={accountForm.ownerName}
                      onChange={(e) => setAccountForm({ ...accountForm, ownerName: e.target.value })}
                      placeholder="اسم صاحب الحساب"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الحساب في اللعبة *</label>
                    <input
                      type="text"
                      required
                      value={accountForm.accountName}
                      onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                      placeholder="مثال: 〆KING〆"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">مستوى الحساب (Level)</label>
                    <input
                      type="text"
                      value={accountForm.accountLevel}
                      onChange={(e) => setAccountForm({ ...accountForm, accountLevel: e.target.value })}
                      placeholder="75"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">عدد الميثكات</label>
                    <input
                      type="text"
                      value={accountForm.mythicsCount}
                      onChange={(e) => setAccountForm({ ...accountForm, mythicsCount: e.target.value })}
                      placeholder="35"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">الأسلحة المطورة</label>
                    <input
                      type="text"
                      value={accountForm.upgradableWeapons}
                      onChange={(e) => setAccountForm({ ...accountForm, upgradableWeapons: e.target.value })}
                      placeholder="M4 جوكر لفل 5، AWM ماكس"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">عدد سكنات السيارات</label>
                    <input
                      type="text"
                      value={accountForm.carsCount}
                      onChange={(e) => setAccountForm({ ...accountForm, carsCount: e.target.value })}
                      placeholder="3"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">خدمات الربط</label>
                    <input
                      type="text"
                      value={accountForm.linkedServices}
                      onChange={(e) => setAccountForm({ ...accountForm, linkedServices: e.target.value })}
                      placeholder="جيميل + رقم متاح"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">سعر البيع المطلوب (د.ل) *</label>
                    <input
                      type="text"
                      required
                      value={accountForm.salePrice}
                      onChange={(e) => setAccountForm({ ...accountForm, salePrice: e.target.value })}
                      placeholder="850"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم هاتف البائع *</label>
                    <input
                      type="text"
                      required
                      value={accountForm.sellerPhone}
                      onChange={(e) => setAccountForm({ ...accountForm, sellerPhone: e.target.value })}
                      placeholder="0912345678"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">الرقم المحول منه 5 دينار</label>
                    <input
                      type="text"
                      value={accountForm.transferPhone}
                      onChange={(e) => setAccountForm({ ...accountForm, transferPhone: e.target.value })}
                      placeholder="0923456789"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط فيديو الحساب (اختياري)</label>
                    <input
                      type="url"
                      value={accountForm.videoUrl}
                      onChange={(e) => setAccountForm({ ...accountForm, videoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddingAccount(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
                  >
                    حفظ وعرض الحساب بالموقع
                  </button>
                </div>
              </form>
            )}

            {/* Accounts Cards List */}
            {displayedPubgAccounts.length === 0 ? (
              <div className="text-center py-12 bg-[#12141e] rounded-3xl border border-white/5 p-6">
                <Gamepad2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">لا توجد حسابات مسجلة حالياً</h3>
                <p className="text-xs text-slate-400 mb-4">
                  عندما يملأ الزبائن نموذج Google Form أو تضيف حساباً يدوياً، ستظهر الطلبات هنا مباشرة.
                </p>
                <button
                  onClick={handleSaveAndSync}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                >
                  تحديث البيانات من Google Sheet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedPubgAccounts.map((acc) => {
                  const isApproved = acc.displayOnSite === 'نعم' || acc.approved === true;
                  const sellerNumber = acc.sellerPhone || '';
                  const cleanSellerPhone = sellerNumber.replace(/[^0-9]/g, '');

                  return (
                    <div
                      key={acc.id}
                      className={`bg-[#12141e] border rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all ${
                        isApproved ? 'border-emerald-500/30 hover:border-emerald-500/50' : 'border-amber-500/30 hover:border-amber-500/50'
                      }`}
                    >
                      {/* Account Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-black text-white">
                            {acc.accountName || acc.title}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                            {acc.level || `LVL ${acc.accountLevel || '70'}`}
                          </span>
                          {acc.ownerName && (
                            <span className="text-xs text-slate-400">
                              (المالك: {acc.ownerName})
                            </span>
                          )}
                        </div>

                        {/* Specs row */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                          {acc.mythicsCount && (
                            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-amber-300 font-mono">
                              ⭐ {acc.mythicsCount} ميثيك
                            </span>
                          )}
                          {acc.upgradableWeaponsCount && (
                            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-red-300">
                              🔫 {acc.upgradableWeaponsCount}
                            </span>
                          )}
                          {acc.carsCount && (
                            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-blue-300">
                              🏎️ {acc.carsCount} سيارات
                            </span>
                          )}
                          {acc.linkedServices && (
                            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-slate-400">
                              🔗 {acc.linkedServices}
                            </span>
                          )}
                        </div>

                        {/* Verification info: Seller Phone & Transfer Phone */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                          {sellerNumber && (
                            <div className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-1 rounded-xl">
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>هاتف البائع: <strong className="text-white font-mono">{sellerNumber}</strong></span>
                              <a
                                href={`tel:${sellerNumber}`}
                                className="text-emerald-400 hover:underline mr-1 font-bold"
                              >
                                اتصال
                              </a>
                              <a
                                href={`https://wa.me/${cleanSellerPhone.startsWith('218') ? cleanSellerPhone : '218' + cleanSellerPhone.replace(/^0+/, '')}?text=${encodeURIComponent('السلام عليكم بخصوص حساب ببجي المعروض في متجر RTG Gear X')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline mr-1 font-bold flex items-center gap-0.5"
                              >
                                <MessageCircle className="w-3 h-3" />
                                واتساب
                              </a>
                            </div>
                          )}

                          {acc.transferPhone && (
                            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl font-bold">
                              <span>الرقم المحول منه 5 د.ل: <strong className="font-mono">{acc.transferPhone}</strong></span>
                            </div>
                          )}

                          {acc.videoUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewVideoUrl(acc.videoUrl!)}
                              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-xl transition-colors font-bold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>مشاهدة فيديو الحساب</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Price & Approval Toggle Controls */}
                      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                        <div className="text-right">
                          <span className="text-lg font-black text-red-500 font-mono">
                            {acc.price || acc.salePrice} د.ل
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Toggle Button (نعم / لا) */}
                          <button
                            onClick={() => handleToggleAccountDisplay(acc.id, acc.displayOnSite || (isApproved ? 'نعم' : 'لا'))}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                              isApproved
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
                                : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-950/60'
                            }`}
                          >
                            {isApproved ? (
                              <>
                                <Eye className="w-4 h-4" />
                                <span>معروض بالموقع (نعم)</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" />
                                <span>مخفي (لا) - اضغط للعرض</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setItemToDelete({ type: 'pubg_account', id: acc.id, name: acc.accountName || acc.title || 'حساب ببجي' })}
                            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="حذف الحساب نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PUBG UC PACKAGES */}
        {activeTab === 'pubg_uc' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>إدارة باقات شدات PUBG Mobile</span>
              </h2>

              <button
                onClick={() => setIsAddingUc(!isAddingUc)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingUc ? 'إلغاء' : 'إضافة باقة شدات جديدة'}</span>
              </button>
            </div>

            {/* Add UC Form */}
            {isAddingUc && (
              <form onSubmit={handleUcSubmit} className="bg-[#151824] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-white/10">
                  إضافة باقة شدات جديدة إلى Google Sheet
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">كمية الشدات الأساسية (UC) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={ucForm.ucAmount || ''}
                      onChange={(e) => setUcForm({ ...ucForm, ucAmount: Number(e.target.value) })}
                      placeholder="مثال: 660"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">شدات إضافية مجانية (Bonus)</label>
                    <input
                      type="number"
                      min="0"
                      value={ucForm.bonusUc || ''}
                      onChange={(e) => setUcForm({ ...ucForm, bonusUc: Number(e.target.value) })}
                      placeholder="مثال: 60"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">السعر (دينار ليبي) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={ucForm.price || ''}
                      onChange={(e) => setUcForm({ ...ucForm, price: Number(e.target.value) })}
                      placeholder="مثال: 35"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="uc-is-popular"
                      checked={ucForm.isPopular}
                      onChange={(e) => setUcForm({ ...ucForm, isPopular: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-[#0e1017] border-white/10"
                    />
                    <label htmlFor="uc-is-popular" className="text-xs font-bold text-slate-300 cursor-pointer">
                      تمييز هذه الباقة كـ "الأكثر طلباً"
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddingUc(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
                  >
                    إضافة الباقة
                  </button>
                </div>
              </form>
            )}

            {/* UC Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {ucPackages.map((pkg) => (
                <div key={pkg.id} className="bg-[#12141e] border border-white/10 hover:border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden group">
                  {pkg.isPopular && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      الأكثر طلباً 🔥
                    </span>
                  )}

                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-amber-400 font-mono font-black text-xl">
                      <Zap className="w-5 h-5 fill-amber-400" />
                      <span>{pkg.ucAmount} UC</span>
                    </div>
                    {pkg.bonusUc > 0 && (
                      <span className="text-[11px] text-emerald-400 font-bold block mt-1">
                        + {pkg.bonusUc} UC مجاناً
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-base font-black text-white font-mono">{pkg.price} د.ل</span>
                    <button
                      onClick={() => setItemToDelete({ type: 'pubg_uc', id: pkg.id, name: `${pkg.ucAmount} UC` })}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="حذف الباقة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: DELIVERY RATES MANAGEMENT */}
        {activeTab === 'delivery_rates' && (
          <div className="animate-fadeIn">
            <DeliveryRatesAdmin />
          </div>
        )}

        {/* TAB 4: SOCIAL MEDIA & CONTACT LINKS */}
        {activeTab === 'social_contact' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-red-500" />
                    <span>صفحات التواصل الاجتماعي وأرقام الهواتف</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    قم بتحديث روابط صفحات تيك توك، فيسبوك، انستقرام وأرقام الهواتف ليتم حفظها في Google Sheet وتحديثها في جميع أزرار الموقع وصفحة "اتصل بنا" تلقائياً.
                  </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <Globe className="w-4 h-4" />
                  <span>تحديث مباشر لجميع الأجهزة</span>
                </div>
              </div>

              <form onSubmit={handleSaveSocialLinks} className="space-y-6">
                {/* Social Networks Group */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <span>1. روابط صفحات السوشيال ميديا الرسمية (TikTok - Facebook - Instagram)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* TikTok */}
                    <div className="bg-[#151824] border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/40 inline-block"></span>
                          صفحة تيك توك (TikTok)
                        </span>
                        {socialForm.tiktokUrl && (
                          <a href={socialForm.tiktokUrl} target="_blank" rel="noreferrer" className="text-[11px] text-red-400 hover:underline flex items-center gap-1">
                            <span>زيارة</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">رابط الحساب المباشر (URL)</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={socialForm.tiktokUrl}
                          onChange={(e) => setSocialForm({ ...socialForm, tiktokUrl: e.target.value })}
                          placeholder="https://www.tiktok.com/@rtg_gear_x"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">اسم المعرف الظاهر (@Handle)</label>
                        <input
                          type="text"
                          dir="ltr"
                          value={socialForm.tiktokHandle}
                          onChange={(e) => setSocialForm({ ...socialForm, tiktokHandle: e.target.value })}
                          placeholder="@rtg_gear_x"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Facebook */}
                    <div className="bg-[#151824] border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                          صفحة فيسبوك (Facebook)
                        </span>
                        {socialForm.facebookUrl && (
                          <a href={socialForm.facebookUrl} target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:underline flex items-center gap-1">
                            <span>زيارة</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">رابط الصفحة المباشر (URL)</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={socialForm.facebookUrl}
                          onChange={(e) => setSocialForm({ ...socialForm, facebookUrl: e.target.value })}
                          placeholder="https://www.facebook.com/share/..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">اسم الصفحة الظاهر</label>
                        <input
                          type="text"
                          value={socialForm.facebookHandle}
                          onChange={(e) => setSocialForm({ ...socialForm, facebookHandle: e.target.value })}
                          placeholder="RTG Gear X"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Instagram */}
                    <div className="bg-[#151824] border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-600 inline-block"></span>
                          حساب انستقرام (Instagram)
                        </span>
                        {socialForm.instagramUrl && (
                          <a href={socialForm.instagramUrl} target="_blank" rel="noreferrer" className="text-[11px] text-pink-400 hover:underline flex items-center gap-1">
                            <span>زيارة</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">رابط الحساب المباشر (URL)</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={socialForm.instagramUrl}
                          onChange={(e) => setSocialForm({ ...socialForm, instagramUrl: e.target.value })}
                          placeholder="https://www.instagram.com/rtg_gear_x"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">اسم المعرف الظاهر (@Handle)</label>
                        <input
                          type="text"
                          dir="ltr"
                          value={socialForm.instagramHandle}
                          onChange={(e) => setSocialForm({ ...socialForm, instagramHandle: e.target.value })}
                          placeholder="@rtg_gear_x"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Google Form Link */}
                    <div className="bg-[#151824] border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                          نموذج بيع الحسابات (Google Form)
                        </span>
                        {socialForm.googleFormUrl && (
                          <a href={socialForm.googleFormUrl} target="_blank" rel="noreferrer" className="text-[11px] text-purple-400 hover:underline flex items-center gap-1">
                            <span>معاينة</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">رابط نموذج Google Form المباشر</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={socialForm.googleFormUrl}
                          onChange={(e) => setSocialForm({ ...socialForm, googleFormUrl: e.target.value })}
                          placeholder="https://forms.gle/..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Numbers Group */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <span>2. أرقام الهواتف والدعم والتحويل</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الواتساب (بدون +)</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={socialForm.whatsappNumber}
                        onChange={(e) => setSocialForm({ ...socialForm, whatsappNumber: e.target.value })}
                        placeholder="218934590635"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الاتصال المباشر (للاتصال)</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={socialForm.supportPhoneAlt}
                        onChange={(e) => setSocialForm({ ...socialForm, supportPhoneAlt: e.target.value })}
                        placeholder="0934590635"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم استقبال تحويل 5 دينار لعرض الحساب</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={socialForm.transferFeePhone}
                        onChange={(e) => setSocialForm({ ...socialForm, transferFeePhone: e.target.value })}
                        placeholder="0943981577"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:border-red-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={isSavingSocial}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/60 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingSocial ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جارٍ الحفظ في Google Sheets...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>حفظ وتحديث صفحات التواصل في Google Sheets والموقع</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: GOOGLE SHEETS APPS SCRIPT SYNC */}
        {activeTab === 'sheets_sync' && (
          <div className="space-y-6">
            <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-red-500" />
                  <span>ربط وجلب بيانات المتجر من Google Sheet</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  ضع رابط تطبيق الويب (Google Apps Script Web App URL) واضغط على جلب البيانات لربط الموقع تلقائياً بجدول البيانات الخاص بك.
                </p>
              </div>

              {/* Input Box for Apps Script Web App URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  رابط تطبيق الويب (Google Apps Script Web App URL) *
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="url"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    dir="ltr"
                    className="flex-1 px-4 py-3 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveAndSync}
                    disabled={isManualSyncing || isAppsScriptSyncing}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isManualSyncing || isAppsScriptSyncing ? 'animate-spin' : ''}`} />
                    <span>حفظ وجلب البيانات من Google Sheet</span>
                  </button>
                </div>

                {appsScriptConfig.lastSyncedAt && (
                  <p className="text-[11px] text-emerald-400 font-mono mt-1">
                    ✓ آخر مزامنة ناجحة: {appsScriptConfig.lastSyncedAt}
                  </p>
                )}
              </div>

              {/* 3 Step Setup Guide */}
              <div className="bg-[#151824] border border-white/10 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>طريقة الحصول على الرابط في 3 خطوات سريعة:</span>
                </h3>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>افتح جدول Google Sheet واضغط من القائمة العلوية على (<strong>الإضافات / Extensions</strong>) ثم (<strong>Apps Script</strong>).</li>
                  <li>امسح أي كود موجود والصق الكود الموجود أدناه، ثم اضغط حفظ (Save).</li>
                  <li>اضغط على الزر الأزرق (<strong>Deploy / نشر</strong>) ثم (<strong>New deployment / نشر جديد</strong>)، واختر نوع <strong>Web app</strong>، واجعل <strong>Who has access: Anyone (أي شخص)</strong>، ثم انسخ الرابط وضعه في الخانة بالأعلى.</li>
                </ol>
              </div>

              {/* Copy Script Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    كود Apps Script الكامل والمعدل لجدول بياناتك (شامل الحذف وصفحات التواصل):
                  </label>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'تم النسخ!' : 'نسخ الكود بالكامل'}</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    readOnly
                    rows={12}
                    dir="ltr"
                    value={GOOGLE_APPS_SCRIPT_TEMPLATE}
                    className="w-full p-4 rounded-2xl bg-[#090a0f] border border-white/10 text-slate-300 font-mono text-[11px] leading-relaxed focus:outline-none resize-none select-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ITEM DELETION CONFIRMATION DIALOG                  */}
        {/* ========================================================= */}
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#12141e] border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-red-950/50 space-y-5 text-right font-['Cairo',sans-serif]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-white">
                    تأكيد حذف نهائي
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    هل أنت متأكد من رغبتك في حذف هذا العنصر؟
                  </p>
                </div>
                <button
                  onClick={() => setItemToDelete(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target Details Card */}
              <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>نوع العنصر:</span>
                  <span className="text-red-400 font-bold">
                    {itemToDelete.type === 'product' && '📦 منتج متجر'}
                    {itemToDelete.type === 'pubg_account' && '🎮 حساب PUBG Mobile'}
                    {itemToDelete.type === 'pubg_uc' && '⚡ باقة شدات UC'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>الاسم / الوصف:</span>
                  <strong className="text-white truncate max-w-[200px]">{itemToDelete.name}</strong>
                </div>
                <div className="pt-2 border-t border-white/5 text-[11px] text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>سيتم إزالته فوراً من الموقع وحذفه نهائياً من جدول Google Sheets.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-red-950/60 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جارٍ الحذف...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>نعم، حذف نهائي</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
