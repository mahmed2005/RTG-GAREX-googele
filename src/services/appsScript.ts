/**
 * Google Apps Script Web App Integration
 * Enables Google Sheets to act as a 100% free, real-time backend database for RTG Gear X
 */

import { Product, PubgAccount, UcPackage, Order, StoreSettings, PubgSellSubmission } from '../types';

export interface AppsScriptConfig {
  webAppUrl: string;
  autoFetchOnLoad: boolean;
  lastSyncedAt: string | null;
}

const APPS_SCRIPT_CONFIG_KEY = 'rtg_apps_script_config_v1';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * RTG GEAR X - BACKEND CONTROLLER FOR GOOGLE SHEETS
 * سكريبت متجر RTG Gear X لإدارة المنتجات وحسابات PUBG والطلبات تلقائياً
 * =========================================================================
 * طريقة التثبيت:
 * 1. في جدول Google Sheets، اضغط على (ملحقات / Extensions) ثم (Apps Script).
 * 2. امسح كل الكود الموجود هناك، والصق هذا الكود بالكامل.
 * 3. اضغط على زر الحفظ (أيقونة القرص).
 * 4. اضغط على (نشر / Deploy) -> (نشر جديد / New deployment).
 * 5. اختر النوع: تطبيق ويب (Web app).
 * 6. اضبط "من يملك حق الوصول" (Who has access) على: أي شخص (Anyone).
 * 7. اضغط (نشر / Deploy) وانسخ رابط تطبيق الويب (Web App URL) وضعه في لوحة تحكم الموقع.
 * =========================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetsIfMissing(ss);

    var action = e.parameter.action || 'get_all';

    if (action === 'get_all') {
      var data = getAllStoreData(ss);
      return createJsonResponse({ status: 'success', data: data });
    }

    return createJsonResponse({ status: 'error', message: 'إجراء غير معروف' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetsIfMissing(ss);

    var raw = e.postData.contents;
    var payload = JSON.parse(raw);
    var action = payload.action;

    // 1. إضافة طلب بيع حساب ببجي جديد من الزائر
    if (action === 'submit_pubg_account') {
      var sub = payload.data;
      var sheet = ss.getSheetByName('طلبات بيع الحسابات');
      sheet.appendRow([
        sub.id || 'sub-' + new Date().getTime(),
        sub.date || new Date().toLocaleString('ar-LY'),
        sub.fullName || '',
        sub.accountName || '',
        sub.accountLevel || '',
        sub.powerLevel || '',
        sub.mythicsCount || '0',
        sub.goldenMythicsCount || '0',
        sub.upgradableWeapons || '',
        sub.carsCount || '0',
        sub.hashtagsCount || '0',
        sub.linkedAccounts || '',
        sub.salePrice || '0',
        sub.phone || '',
        sub.transferPhone || '',
        sub.videoUrl || '',
        'لا' // هل تمت الموافقة؟ (اكتب 'نعم' للموافقة والعرض في الموقع)
      ]);
      return createJsonResponse({ status: 'success', message: 'تم استلام وحفظ طلب بيع الحساب بنجاح' });
    }

    // 2. إضافة طلب شراء منتج أو شدات أو حساب
    if (action === 'submit_order') {
      var order = payload.data;
      var sheet = ss.getSheetByName('الطلبات الواردة');
      sheet.appendRow([
        order.id || 'ORD-' + new Date().getTime(),
        order.date || new Date().toLocaleString('ar-LY'),
        order.type || '',
        order.customerName || '',
        order.phone || '',
        order.city || '',
        order.region || '',
        order.paymentMethod || '',
        order.total || 0,
        'قيد الانتظار',
        JSON.stringify(order.items || [])
      ]);
      return createJsonResponse({ status: 'success', message: 'تم حفظ الطلب في Google Sheets' });
    }

    // 3. مزامنة كاملة للمنتجات من لوحة الإدارة
    if (action === 'sync_all') {
      saveAllStoreData(ss, payload.data);
      return createJsonResponse({ status: 'success', message: 'تمت مزامنة كافة بيانات المتجر بنجاح' });
    }

    return createJsonResponse({ status: 'error', message: 'Action not handled' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// دالة جلب كافة بيانات المتجر
function getAllStoreData(ss) {
  // 1. المنتجات
  var prodSheet = ss.getSheetByName('المنتجات');
  var prodData = prodSheet.getDataRange().getValues();
  var products = [];
  for (var i = 1; i < prodData.length; i++) {
    var r = prodData[i];
    if (r[0] && r[1]) {
      products.push({
        id: String(r[0]),
        name: String(r[1]),
        category: String(r[2]),
        price: Number(r[3]) || 0,
        oldPrice: r[4] ? Number(r[4]) : undefined,
        image: String(r[5]),
        tag: r[6] ? String(r[6]) : undefined,
        description: String(r[7] || ''),
        inStock: r[8] === 'لا' ? false : true,
        featured: r[9] === 'نعم' ? true : false
      });
    }
  }

  // 2. حسابات ببجي المعروضة
  var accSheet = ss.getSheetByName('حسابات PUBG');
  var accData = accSheet.getDataRange().getValues();
  var pubgAccounts = [];
  for (var j = 1; j < accData.length; j++) {
    var a = accData[j];
    if (a[0] && a[1]) {
      var isAvailable = a[16] === 'لا' ? false : true;
      var isApproved = a[17] === 'نعم' || a[17] === '' || a[17] === undefined; // إذا كُتب نعم أو فارغ يعتبر متاح
      if (isApproved) {
        pubgAccounts.push({
          id: String(a[0]),
          title: String(a[1]),
          badge: String(a[2]),
          level: String(a[3]),
          price: Number(a[4]) || 0,
          oldPrice: a[5] ? Number(a[5]) : undefined,
          powerLevel: String(a[6] || ''),
          mythicsCount: String(a[7] || ''),
          goldenMythicsCount: String(a[8] || ''),
          upgradableWeaponsCount: String(a[9] || ''),
          carsCount: String(a[10] || ''),
          hashtagsCount: String(a[11] || ''),
          linkedAccounts: String(a[12] || ''),
          image: String(a[13] || ''),
          videoUrl: String(a[14] || ''),
          features: a[15] ? String(a[15]).split(',').map(function(s){return s.trim();}) : [],
          isAvailable: isAvailable,
          sellerName: String(a[18] || ''),
          sellerPhone: String(a[19] || '')
        });
      }
    }
  }

  // 3. طلبات بيع الحسابات الواردة من الزوار
  var subSheet = ss.getSheetByName('طلبات بيع الحسابات');
  var subData = subSheet.getDataRange().getValues();
  var submissions = [];
  for (var k = 1; k < subData.length; k++) {
    var s = subData[k];
    if (s[0] && s[2]) {
      var approved = String(s[16]).trim() === 'نعم';
      var rejected = String(s[16]).trim() === 'مرفوض';
      var status = approved ? 'approved' : (rejected ? 'rejected' : 'pending');

      var subObj = {
        id: String(s[0]),
        date: String(s[1]),
        fullName: String(s[2]),
        accountName: String(s[3]),
        accountLevel: String(s[4]),
        powerLevel: String(s[5] || ''),
        mythicsCount: String(s[6] || ''),
        goldenMythicsCount: String(s[7] || ''),
        upgradableWeapons: String(s[8] || ''),
        carsCount: String(s[9] || ''),
        hashtagsCount: String(s[10] || ''),
        linkedAccounts: String(s[11] || ''),
        salePrice: String(s[12] || ''),
        phone: String(s[13] || ''),
        transferPhone: String(s[14] || ''),
        videoUrl: String(s[15] || ''),
        status: status
      };
      submissions.push(subObj);

      // إذا وضع المدير كلمة "نعم" في الخانة الأخيرة لطلب البيع، يتم إضافته تلقائياً لقائمة الحسابات المعروضة بالموقع!
      if (approved) {
        pubgAccounts.push({
          id: subObj.id,
          title: subObj.accountName || ('حساب PUBG لفل ' + subObj.accountLevel),
          badge: 'حساب موثق',
          level: 'LVL ' + subObj.accountLevel,
          price: Number(subObj.salePrice) || 0,
          oldPrice: (Number(subObj.salePrice) || 0) * 1.15,
          powerLevel: subObj.powerLevel,
          mythicsCount: subObj.mythicsCount,
          goldenMythicsCount: subObj.goldenMythicsCount,
          upgradableWeaponsCount: subObj.upgradableWeapons,
          carsCount: subObj.carsCount,
          hashtagsCount: subObj.hashtagsCount,
          linkedAccounts: subObj.linkedAccounts,
          image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
          videoUrl: subObj.videoUrl,
          features: [subObj.mythicsCount ? subObj.mythicsCount + ' ميثيك' : 'حساب مميز', subObj.upgradableWeapons || 'أسلحة مميزة', 'تسليم آمن'],
          isAvailable: true,
          sellerName: subObj.fullName,
          sellerPhone: subObj.phone
        });
      }
    }
  }

  // 4. باقات الشدات
  var ucSheet = ss.getSheetByName('باقات الشدات UC');
  var ucData = ucSheet.getDataRange().getValues();
  var ucPackages = [];
  for (var u = 1; u < ucData.length; u++) {
    var uc = ucData[u];
    if (uc[0] && uc[1]) {
      ucPackages.push({
        id: String(uc[0]),
        ucAmount: Number(uc[1]) || 0,
        bonusUc: Number(uc[2]) || 0,
        price: Number(uc[3]) || 0,
        tag: uc[4] ? String(uc[4]) : undefined,
        isPopular: uc[5] === 'نعم' ? true : false
      });
    }
  }

  return {
    products: products,
    pubgAccounts: pubgAccounts,
    pubgSubmissions: submissions,
    ucPackages: ucPackages
  };
}

// دالة حفظ ومزامنة كافة البيانات
function saveAllStoreData(ss, data) {
  if (data.products && data.products.length > 0) {
    var pSheet = ss.getSheetByName('المنتجات');
    var pHeader = ['المعرف (ID)', 'اسم المنتج', 'التصنيف', 'السعر (د.ل)', 'السعر القديم', 'رابط الصورة', 'الشارة (Tag)', 'الوصف', 'متوفر؟ (نعم/لا)', 'مميز؟ (نعم/لا)'];
    var pRows = data.products.map(function(p) {
      return [p.id, p.name, p.category, p.price, p.oldPrice || '', p.image, p.tag || '', p.description, p.inStock ? 'نعم' : 'لا', p.featured ? 'نعم' : 'لا'];
    });
    pSheet.clearContents();
    pSheet.getRange(1, 1, pRows.length + 1, pHeader.length).setValues([pHeader].concat(pRows));
  }

  if (data.pubgAccounts && data.pubgAccounts.length > 0) {
    var aSheet = ss.getSheetByName('حسابات PUBG');
    var aHeader = ['المعرف (ID)', 'عنوان الحساب', 'الرتبة', 'المستوى', 'السعر (د.ل)', 'السعر القديم', 'مستوى القوة', 'ميثيك عادي', 'ميثيك ذهبي', 'أسلحة مطورة', 'سيارات', 'هاشتاجات', 'روابط الربط', 'رابط الصورة', 'رابط الفيديو', 'المميزات', 'متاح؟ (نعم/لا)', 'عرض في الموقع (نعم/لا)', 'اسم البائع', 'هاتف البائع'];
    var aRows = data.pubgAccounts.map(function(a) {
      return [
        a.id, a.title, a.badge, a.level, a.price, a.oldPrice || '',
        a.powerLevel || '', a.mythicsCount || '', a.goldenMythicsCount || '',
        a.upgradableWeaponsCount || '', a.carsCount || '', a.hashtagsCount || '',
        a.linkedAccounts || '', a.image, a.videoUrl || '',
        (a.features || []).join(', '),
        a.isAvailable ? 'نعم' : 'لا',
        'نعم',
        a.sellerName || '', a.sellerPhone || ''
      ];
    });
    aSheet.clearContents();
    aSheet.getRange(1, 1, aRows.length + 1, aHeader.length).setValues([aHeader].concat(aRows));
  }
}

// دالة التأكد من وجود جميع الصفحات
function setupSheetsIfMissing(ss) {
  var requiredSheets = [
    {
      name: 'المنتجات',
      headers: ['المعرف (ID)', 'اسم المنتج', 'التصنيف', 'السعر (د.ل)', 'السعر القديم', 'رابط الصورة', 'الشارة (Tag)', 'الوصف', 'متوفر؟ (نعم/لا)', 'مميز؟ (نعم/لا)']
    },
    {
      name: 'حسابات PUBG',
      headers: ['المعرف (ID)', 'عنوان الحساب', 'الرتبة', 'المستوى', 'السعر (د.ل)', 'السعر القديم', 'مستوى القوة', 'ميثيك عادي', 'ميثيك ذهبي', 'أسلحة مطورة', 'سيارات', 'هاشتاجات', 'روابط الربط', 'رابط الصورة', 'رابط الفيديو', 'المميزات', 'متاح؟ (نعم/لا)', 'عرض في الموقع (نعم/لا)', 'اسم البائع', 'هاتف البائع']
    },
    {
      name: 'طلبات بيع الحسابات',
      headers: ['المعرف (ID)', 'تاريخ التقديم', 'الاسم الثلاثي', 'اسم الحساب', 'المستوى', 'مستوى القوة', 'ميثيك عادي', 'ميثيك ذهبي', 'الأسلحة المطورة', 'السيارات', 'الهاشتاجات', 'روابط الربط', 'السعر المطلوب', 'رقم الهاتف', 'الرقم المحول منه 5 ليرات', 'رابط الفيديو', 'الموافقة والنشر (نعم/لا)']
    },
    {
      name: 'باقات الشدات UC',
      headers: ['المعرف (ID)', 'الشدات الأساسية', 'البونص', 'السعر (د.ل)', 'الشارة (Tag)', 'شائع؟ (نعم/لا)']
    },
    {
      name: 'الطلبات الواردة',
      headers: ['رقم الطلب', 'التاريخ', 'نوع الطلب', 'اسم العميل', 'رقم الهاتف', 'المدينة', 'المنطقة', 'طريقة الدفع', 'الإجمالي', 'الحالة', 'تفاصيل العناصر']
    }
  ];

  requiredSheets.forEach(function(sInfo) {
    var sheet = ss.getSheetByName(sInfo.name);
    if (!sheet) {
      sheet = ss.insertSheet(sInfo.name);
      sheet.appendRow(sInfo.headers);
      sheet.setFrozenRows(1);
    }
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export class AppsScriptService {
  public static getConfig(): AppsScriptConfig {
    try {
      const saved = localStorage.getItem(APPS_SCRIPT_CONFIG_KEY);
      return saved
        ? JSON.parse(saved)
        : { webAppUrl: '', autoFetchOnLoad: true, lastSyncedAt: null };
    } catch {
      return { webAppUrl: '', autoFetchOnLoad: true, lastSyncedAt: null };
    }
  }

  public static saveConfig(config: Partial<AppsScriptConfig>): AppsScriptConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(APPS_SCRIPT_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Fetch all store items live from Google Apps Script Web App
   */
  public static async fetchStoreData(webAppUrl: string): Promise<{
    products: Product[];
    pubgAccounts: PubgAccount[];
    pubgSubmissions: PubgSellSubmission[];
    ucPackages: UcPackage[];
  }> {
    if (!webAppUrl || !webAppUrl.trim()) {
      throw new Error('يرجى إدخال رابط Google Apps Script Web App أولاً');
    }

    const cleanUrl = webAppUrl.trim();
    const url = cleanUrl.includes('?') ? `${cleanUrl}&action=get_all` : `${cleanUrl}?action=get_all`;

    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (!res.ok) {
      throw new Error(`تعذر الاتصال بـ Google Apps Script (${res.status})`);
    }

    const result = await res.json();
    if (result.status !== 'success' || !result.data) {
      throw new Error(result.message || 'فشل جلب البيانات من Google Sheets');
    }

    this.saveConfig({ lastSyncedAt: new Date().toLocaleString('ar-LY') });
    return result.data;
  }

  /**
   * Submit a new PUBG Sell Request to Google Sheets via Web App
   */
  public static async submitPubgSellAccount(
    webAppUrl: string,
    submission: PubgSellSubmission
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    try {
      await fetch(webAppUrl.trim(), {
        method: 'POST',
        mode: 'no-cors', // Standard Google Apps Script cross-origin POST handling
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit_pubg_account',
          data: submission,
        }),
      });
      return true;
    } catch (e) {
      console.warn('Apps script submit account fallback error:', e);
      return false;
    }
  }

  /**
   * Submit Order to Google Sheets via Web App
   */
  public static async submitOrder(webAppUrl: string, order: Order): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    try {
      await fetch(webAppUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit_order',
          data: order,
        }),
      });
      return true;
    } catch (e) {
      console.warn('Apps script submit order error:', e);
      return false;
    }
  }

  /**
   * Sync all products and accounts to Google Sheets via Web App
   */
  public static async syncAllData(
    webAppUrl: string,
    data: {
      products: Product[];
      pubgAccounts: PubgAccount[];
    }
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) {
      throw new Error('يرجى تحديد رابط Google Apps Script Web App');
    }

    try {
      await fetch(webAppUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_all',
          data,
        }),
      });

      this.saveConfig({ lastSyncedAt: new Date().toLocaleString('ar-LY') });
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'فشل مزامنة البيانات مع Google Apps Script');
    }
  }
}
