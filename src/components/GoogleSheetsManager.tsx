import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { GoogleSheetsService, GoogleSheetsConfig } from '../services/googleSheets';
import { AppsScriptService, AppsScriptConfig, GOOGLE_APPS_SCRIPT_TEMPLATE } from '../services/appsScript';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  DownloadCloud, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  ShieldCheck,
  PlusCircle,
  FileText,
  Copy,
  Check,
  Code2,
  Cpu,
  Github,
  Sparkles,
  Zap,
  HelpCircle,
  Link2
} from 'lucide-react';

export const GoogleSheetsManager: React.FC = () => {
  const { 
    products, 
    pubgAccounts, 
    ucPackages, 
    orders, 
    settings, 
    pubgSubmissions, 
    updateProduct, 
    updateSettings,
    refreshFromAppsScript,
    isAppsScriptSyncing
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'appscript' | 'github_guide' | 'google_oauth'>('appscript');

  // Apps Script State
  const [appsScriptConfig, setAppsScriptConfig] = useState<AppsScriptConfig>(AppsScriptService.getConfig());
  const [webAppUrl, setWebAppUrl] = useState(appsScriptConfig.webAppUrl || '');
  const [isCopied, setIsCopied] = useState(false);
  const [appsScriptLoading, setAppsScriptLoading] = useState(false);

  // Google OAuth Sheets State
  const [config, setConfig] = useState<GoogleSheetsConfig>(GoogleSheetsService.getConfig());
  const [customSheetId, setCustomSheetId] = useState(config.spreadsheetId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setConfig(GoogleSheetsService.getConfig());
    setAppsScriptConfig(AppsScriptService.getConfig());
    if (config.spreadsheetId) {
      setCustomSheetId(config.spreadsheetId);
    }
  }, []);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 6000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setIsCopied(true);
    showStatus('success', 'تم نسخ كود Google Apps Script الكامل إلى الحافظة بنجاح!');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSaveWebAppUrl = async () => {
    if (!webAppUrl.trim()) {
      showStatus('error', 'يرجى إدخال رابط Google Apps Script Web App');
      return;
    }

    try {
      setAppsScriptLoading(true);
      const updated = AppsScriptService.saveConfig({
        webAppUrl: webAppUrl.trim(),
      });
      setAppsScriptConfig(updated);

      // Test connection by fetching data
      const fetched = await AppsScriptService.fetchStoreData(webAppUrl.trim());
      showStatus('success', `تم الاتصال بنجاح بـ Google Sheets! تم جلب (${fetched.products?.length || 0} منتج و ${fetched.pubgAccounts?.length || 0} حساب ببجي)`);
      
      // Auto refresh store context
      await refreshFromAppsScript();
    } catch (err: any) {
      showStatus('error', err.message || 'فشل الاتصال برابط Web App، تأكد من نشر السكريبت بحق وصول: أي شخص (Anyone)');
    } finally {
      setAppsScriptLoading(false);
    }
  };

  const handleSyncAllToAppsScript = async () => {
    if (!webAppUrl.trim()) {
      showStatus('error', 'يرجى حفظ رابط Web App أولاً');
      return;
    }

    try {
      setAppsScriptLoading(true);
      await AppsScriptService.syncAllData(webAppUrl.trim(), {
        products,
        pubgAccounts,
      });
      showStatus('success', 'تم إرسال ومزامنة كافة منتجات المتجر وحسابات ببجي بنجاح إلى جدول Google Sheets!');
    } catch (err: any) {
      showStatus('error', err.message || 'فشل مزامنة البيانات مع Google Sheets');
    } finally {
      setAppsScriptLoading(false);
    }
  };

  /**
   * 1. Create a brand new Google Spreadsheet in the user's account (OAuth)
   */
  const handleCreateNewSpreadsheet = async () => {
    try {
      setIsLoading(true);
      setStatusMsg(null);

      // Step 1: Request Google Auth
      const token = await GoogleSheetsService.authenticate();

      // Step 2: Create Spreadsheet & populate with products, accounts, uc, orders, submissions & settings
      const result = await GoogleSheetsService.createStoreSpreadsheet(token, {
        products,
        pubgAccounts,
        ucPackages,
        orders,
        settings,
        pubgSubmissions,
      });

      setConfig(GoogleSheetsService.getConfig());
      setCustomSheetId(result.spreadsheetId);
      showStatus('success', 'تم إنشاء جدول Google Sheets جديد بنجاح وتصدير كافة بيانات المتجر وطلبات البيع إليه!');
    } catch (err: any) {
      showStatus('error', err.message || 'حدث خطأ أثناء إنشاء جدول البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2. Push/Export current store data to existing Google Sheet
   */
  const handleSyncToSheets = async () => {
    const targetId = customSheetId.trim() || config.spreadsheetId;
    if (!targetId) {
      showStatus('error', 'يرجى إدخال معرف جدول Google أو إنشاء جدول جديد أولاً');
      return;
    }

    try {
      setIsLoading(true);
      setStatusMsg(null);

      const token = await GoogleSheetsService.authenticate();
      await GoogleSheetsService.exportAllDataToSheet(token, targetId, {
        products,
        pubgAccounts,
        ucPackages,
        orders,
        settings,
        pubgSubmissions,
      });

      const updated = GoogleSheetsService.saveConfig({
        spreadsheetId: targetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetId}/edit`,
        lastSyncedAt: new Date().toLocaleString('ar-LY'),
      });
      setConfig(updated);

      showStatus('success', 'تم تحديث ورفع كافة بيانات المتجر وطلبات البيع بنجاح إلى جدول Google Sheets!');
    } catch (err: any) {
      showStatus('error', err.message || 'فشل مزامنة البيانات مع جدول Google');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 3. Pull/Import data from Google Sheets into the store
   */
  const handleImportFromSheets = async () => {
    const targetId = customSheetId.trim() || config.spreadsheetId;
    if (!targetId) {
      showStatus('error', 'يرجى إدخال معرف جدول Google لجلب البيانات منه');
      return;
    }

    try {
      setIsLoading(true);
      setStatusMsg(null);

      const token = await GoogleSheetsService.authenticate();
      const imported = await GoogleSheetsService.importFromGoogleSheets(token, targetId);

      // Save imported data locally
      let itemsCount = 0;
      if (imported.products && imported.products.length > 0) {
        localStorage.setItem('rtg_products_v1', JSON.stringify(imported.products));
        itemsCount += imported.products.length;
      }
      if (imported.pubgAccounts && imported.pubgAccounts.length > 0) {
        localStorage.setItem('rtg_pubg_accounts_v1', JSON.stringify(imported.pubgAccounts));
        itemsCount += imported.pubgAccounts.length;
      }
      if (imported.ucPackages && imported.ucPackages.length > 0) {
        localStorage.setItem('rtg_uc_packages_v1', JSON.stringify(imported.ucPackages));
        itemsCount += imported.ucPackages.length;
      }
      if (imported.settings) {
        updateSettings(imported.settings);
      }

      showStatus('success', `تم استيراد ${itemsCount} عنصر وتحديث المتجر بالكامل بنجاح من جدول Google!`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      showStatus('error', err.message || 'فشل استيراد البيانات من جدول Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSheetId = () => {
    if (!customSheetId.trim()) return;
    const cleanId = customSheetId.includes('/d/')
      ? customSheetId.split('/d/')[1].split('/')[0]
      : customSheetId.trim();

    const updated = GoogleSheetsService.saveConfig({
      spreadsheetId: cleanId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${cleanId}/edit`,
    });
    setConfig(updated);
    setCustomSheetId(cleanId);
    showStatus('success', 'تم حفظ معرف جدول Google بنجاح');
  };

  return (
    <div className="space-y-8 animate-fadeIn text-right">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-[#12141e] to-teal-950/40 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                GOOGLE APPS SCRIPT BACKEND & GOOGLE SHEETS
              </span>
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                قاعدة بيانات حية مجانية
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              ربط الموقع بـ Google Sheets عبر Google Apps Script
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              يعمل سكريبت Google Apps Script كخادم خلفي (Backend) مجاني يربط متجرك بجدول Google Sheets. يتم حفظ طلبات بيع الحسابات والطلبات تلقائياً، وعند إضافة أي منتج أو الموافقة على حساب بكتابة <strong className="text-emerald-400">«نعم»</strong> يظهر للجميع فوراً!
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleCopyScript}
              className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2.5 transition-all flex-shrink-0"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>تم نسخ الكود!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ كود Apps Script الكامل</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('appscript')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'appscript'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
              : 'bg-[#151824] text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>إعداد وربط Google Apps Script (موصى به)</span>
        </button>

        <button
          onClick={() => setActiveTab('github_guide')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'github_guide'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60'
              : 'bg-[#151824] text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Github className="w-4 h-4 text-indigo-300" />
          <span>دليل رفع الموقع على GitHub ونشره للعامة</span>
        </button>

        <button
          onClick={() => setActiveTab('google_oauth')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'google_oauth'
              ? 'bg-emerald-600/80 text-white shadow-lg shadow-emerald-950/60'
              : 'bg-[#151824] text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>الربط المباشر بحساب Google (OAuth API)</span>
        </button>
      </div>

      {/* Status Feedback */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-3 animate-fadeIn ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/15 border-red-500/40 text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TAB 1: GOOGLE APPS SCRIPT BACKEND */}
      {activeTab === 'appscript' && (
        <div className="space-y-8">
          {/* How It Works Explainer Card */}
          <div className="bg-[#12141e] border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <Sparkles className="w-5 h-5" />
              <span>كيف تعمل المزامنة الحية وكلمة «نعم» لعرض الحسابات والمنتجات؟</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono">
                  1
                </span>
                <strong className="text-white block text-sm">تسجيل فوري لطلبات بيع الحسابات</strong>
                <p className="text-slate-400">
                  عندما يملأ أي زائر نموذج "بيع حساب"، يرسل الموقع البيانات تلقائياً إلى صفحة <strong className="text-white">"طلبات بيع الحسابات"</strong> في Google Sheets مع كافة المواصفات ورقم تحويل الـ 5 ليرات.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono">
                  2
                </span>
                <strong className="text-white block text-sm">كتابة كلمة «نعم» للنشر الفوري</strong>
                <p className="text-slate-400">
                  في العمود الأخير <strong className="text-amber-300">«الموافقة والنشر»</strong>، بمجرد أن تكتب كلمة <strong className="text-emerald-400">«نعم»</strong> بجانب أي حساب، سيظهر الحساب تلقائياً في واجهة المتجر لجميع الناس!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono">
                  3
                </span>
                <strong className="text-white block text-sm">إضافة وحذف المنتجات للجميع</strong>
                <p className="text-slate-400">
                  عندما تضيف أو تحذف أي منتج في صفحة <strong className="text-white">"المنتجات"</strong> في Google Sheets أو عبر لوحة الإدارة، يتحدث المتجر لجميع الزوار مباشرة عند فتحهم للموقع.
                </p>
              </div>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <span>خطوات تثبيت السكريبت في صفحة Google Sheets (تأخذ دقيقة واحدة فقط):</span>
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center flex-shrink-0 font-mono">
                  1
                </span>
                <div className="space-y-1">
                  <strong className="text-white block">فتح صفحة Google Sheets والدخول إلى Apps Script:</strong>
                  <p className="text-slate-300 leading-relaxed">
                    افتح جدول Google Sheets الجديد أو الحالي، ومن القائمة العلوية اضغط على: <strong className="text-emerald-300">ملحقات (Extensions)</strong> ⟵ ثم اختر <strong className="text-emerald-300">Apps Script</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center flex-shrink-0 font-mono">
                  2
                </span>
                <div className="space-y-1">
                  <strong className="text-white block">لصق الكود وحفظه:</strong>
                  <p className="text-slate-300 leading-relaxed">
                    اضغط على زر <button onClick={handleCopyScript} className="text-emerald-400 underline font-bold inline-flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> نسخ كود Apps Script الكامل</button>، ثم امسح أي سطر موجود داخل محرر Apps Script والصق الكود بالكامل، واضغط على أيقونة الحفظ (💾).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center flex-shrink-0 font-mono">
                  3
                </span>
                <div className="space-y-1">
                  <strong className="text-white block">نشر السكريبت كتطبيق ويب (Web App):</strong>
                  <p className="text-slate-300 leading-relaxed">
                    من أعلى يمين محرر Apps Script، اضغط على <strong className="text-amber-300">نشر (Deploy)</strong> ⟵ <strong className="text-amber-300">نشر جديد (New deployment)</strong>.
                    <br />
                    اختر النوع: <strong className="text-white">تطبيق ويب (Web app)</strong>.
                    <br />
                    اضبط خيار <strong className="text-red-300">"من يملك حق الوصول" (Who has access)</strong> على: <strong className="text-emerald-300 font-bold">أي شخص (Anyone)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center flex-shrink-0 font-mono">
                  4
                </span>
                <div className="space-y-1">
                  <strong className="text-white block">نسخ الرابط ووضعه هنا:</strong>
                  <p className="text-slate-300 leading-relaxed">
                    اضغط (نشر / Deploy)، وانسخ <strong className="text-emerald-300">رابط تطبيق الويب (Web App URL)</strong> الذي ينتهي بـ <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono text-xs">/exec</code>، ثم الصقه في الخانة أدناه واضغط "حفظ واختبار الاتصال".
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Web App URL Input Card */}
          <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs text-slate-400 font-mono">
                {appsScriptConfig.lastSyncedAt ? `آخر اتصال: ${appsScriptConfig.lastSyncedAt}` : 'لم يتم الاتصال بعد'}
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-400" />
                <span>رابط Google Apps Script Web App الخاص بك</span>
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  رابط تطبيق الويب (Web App URL)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="url"
                    dir="ltr"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full sm:flex-1 bg-[#181b27] border border-white/10 rounded-2xl py-3 px-4 text-white text-xs font-mono outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={handleSaveWebAppUrl}
                    disabled={appsScriptLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
                  >
                    {appsScriptLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    <span>حفظ واختبار الاتصال</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleSyncAllToAppsScript}
                  disabled={appsScriptLoading || !webAppUrl}
                  className="p-4 rounded-2xl bg-[#181b27] hover:bg-[#202434] border border-white/10 text-right transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                    <UploadCloud className="w-4 h-4" />
                    <span>تصدير كافة منتجات وحسابات الموقع إلى Google Sheets</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    يقوم بإنشاء وتعبئة صفحات (المنتجات، حسابات PUBG، طلبات البيع) بالبيانات الحالية
                  </p>
                </button>

                <button
                  onClick={refreshFromAppsScript}
                  disabled={isAppsScriptSyncing || !webAppUrl}
                  className="p-4 rounded-2xl bg-[#181b27] hover:bg-[#202434] border border-white/10 text-right transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
                    <RefreshCw className={`w-4 h-4 ${isAppsScriptSyncing ? 'animate-spin' : ''}`} />
                    <span>جلب وتحديث البيانات الحية الآن من Google Sheets</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    إعادة جلب المنتجات والحسابات التي قمت بالموافقة عليها بـ «نعم»
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GITHUB GUIDE */}
      {activeTab === 'github_guide' && (
        <div className="bg-[#12141e] border border-indigo-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">كيفية رفع الموقع على GitHub ونشره أونلاين للعامة</h3>
              <p className="text-xs text-slate-400">
                يمكنك تصدير كود هذا المشروع ورفعه على مستودع GitHub وربطه بمنصات النشر المجانية مثل Vercel أو Netlify.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <strong className="text-indigo-300 font-bold text-sm block">1. تصدير المشروع كملف ZIP أو الاتصال بـ GitHub:</strong>
              <p className="text-slate-300 leading-relaxed">
                من القائمة العلوية في محرر AI Studio، اضغط على زر <strong className="text-white">Export / Download ZIP</strong> لتنزيل كافة ملفات الموقع على جهازك، أو اضغط <strong className="text-white">Export to GitHub</strong> لإنشاء مستودع مباشر.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <strong className="text-indigo-300 font-bold text-sm block">2. أوامر رفع المشروع عبر Git Terminal:</strong>
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-indigo-200 dir-ltr space-y-1 overflow-x-auto">
                <div>git init</div>
                <div>git add .</div>
                <div>git commit -m "Initial commit for RTG Gear X Store"</div>
                <div>git branch -M main</div>
                <div>git remote add origin https://github.com/USERNAME/rtg-gear-x.git</div>
                <div>git push -u origin main</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <strong className="text-indigo-300 font-bold text-sm block">3. النشر المباشر على Vercel أو Cloud Run:</strong>
              <p className="text-slate-300 leading-relaxed">
                بمجرد رفع المشروع على GitHub، افتح موقع <strong className="text-white">Vercel.com</strong> أو <strong className="text-white">Netlify</strong> واضغط <em>Import from GitHub</em>. سيتعرف النظام تلقائياً على Vite وReact ويبني الموقع برابط رسمي دائم ومجاني بنسبة 100%!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE OAUTH API */}
      {activeTab === 'google_oauth' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Connected Sheet Details */}
            <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-xs text-slate-400">
                    {config.spreadsheetId ? 'متصل وجاهز' : 'غير متصل بعد'}
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>الجدول المتصل حالياً عبر OAuth</span>
                  </h3>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      معرف الجدول (Spreadsheet ID أو رابط الجدول الكامل)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        dir="ltr"
                        value={customSheetId}
                        onChange={(e) => setCustomSheetId(e.target.value)}
                        placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                        className="flex-1 bg-[#181b27] border border-white/10 rounded-xl py-2.5 px-3 text-white text-xs font-mono outline-none focus:border-emerald-500/50"
                      />
                      <button
                        onClick={handleSaveSheetId}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>

                  {config.spreadsheetUrl && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                      <a
                        href={config.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
                      >
                        <span>فتح الجدول في Google Sheets</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <span className="text-[11px] text-slate-400 font-mono">
                        آخر مزامنة: {config.lastSyncedAt || 'الآن'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  صلاحية وصول آمنة ومشفرة عبر حسابك
                </span>
                <button
                  onClick={handleCreateNewSpreadsheet}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors"
                >
                  إنشاء جدول جديد
                </button>
              </div>
            </div>

            {/* Card 2: Two-way Data Synchronization */}
            <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-xs text-slate-400">تحكم ثنائي الاتجاه</span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>مزامنة واستيراد البيانات</span>
                  </h3>
                </div>

                <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                  يمكنك رفع كافة التعديلات التي تقوم بها في لوحة التحكم إلى جدول Google، أو تعديل البيانات مباشرة في جدول Google ثم الضغط على "استيراد البيانات" لتحديث الموقع فوراً.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Push button */}
                  <button
                    onClick={handleSyncToSheets}
                    disabled={isLoading}
                    className="p-4 rounded-2xl bg-[#181b27] hover:bg-[#202434] border border-white/10 text-right transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                      <UploadCloud className="w-4 h-4" />
                      <span>تصدير إلى Google Sheets</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      إرسال المنتجات والطلبات الحالية إلى الجدول
                    </p>
                  </button>

                  {/* Pull button */}
                  <button
                    onClick={handleImportFromSheets}
                    disabled={isLoading}
                    className="p-4 rounded-2xl bg-[#181b27] hover:bg-[#202434] border border-white/10 text-right transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
                      <DownloadCloud className="w-4 h-4" />
                      <span>استيراد من Google Sheets</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      جلب التعديلات والأسعار الجديدة من الجدول
                    </p>
                  </button>
                </div>
              </div>

              <div className="pt-3 text-[11px] text-slate-500">
                * يحتوي الجدول المنشأ على 5 صفحات مخصصة: المنتجات، حسابات ببجي، طلبات بيع الحسابات، باقات الشدات، والطلبات الواردة.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
