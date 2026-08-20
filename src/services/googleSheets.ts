/**
 * Google Sheets and Drive Integration for RTG Gear X
 * Uses Google Identity Services (GIS) Client-side OAuth with scopes:
 * - https://www.googleapis.com/auth/spreadsheets
 * - https://www.googleapis.com/auth/drive.file
 */

import { Product, PubgAccount, UcPackage, Order, StoreSettings, PubgSellSubmission } from '../types';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

export interface GoogleSheetsConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  autoSyncOrders: boolean;
}

const CONFIG_STORAGE_KEY = 'rtg_google_sheets_config_v1';
const TOKEN_STORAGE_KEY = 'rtg_google_access_token_v1';

export class GoogleSheetsService {
  private static tokenClient: any = null;
  private static accessToken: string | null = null;

  public static getConfig(): GoogleSheetsConfig {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : { spreadsheetId: null, spreadsheetUrl: null, lastSyncedAt: null, autoSyncOrders: true };
    } catch {
      return { spreadsheetId: null, spreadsheetUrl: null, lastSyncedAt: null, autoSyncOrders: true };
    }
  }

  public static saveConfig(config: Partial<GoogleSheetsConfig>) {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  public static getStoredToken(): string | null {
    if (this.accessToken) return this.accessToken;
    try {
      const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      this.accessToken = token;
      return token;
    } catch {
      return null;
    }
  }

  public static setStoredToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  /**
   * Request user OAuth authorization popup
   */
  public static async authenticate(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if GIS script loaded
      if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
        // Dynamically load GIS script if not present
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.initAndRequestToken(resolve, reject);
        };
        script.onerror = () => reject(new Error('فشل تحميل Google Identity Services SDK'));
        document.body.appendChild(script);
      } else {
        this.initAndRequestToken(resolve, reject);
      }
    });
  }

  private static initAndRequestToken(
    resolve: (token: string) => void,
    reject: (error: any) => void
  ) {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: '687491684836-apps.googleusercontent.com', // Will work with current OAuth brand
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          if (response.access_token) {
            this.setStoredToken(response.access_token);
            resolve(response.access_token);
          } else {
            reject(new Error('لم يتم استلام مفتاح المصادقة'));
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  }

  /**
   * Create a new Google Spreadsheet with structured sheets for RTG Gear X:
   * 1. Products (المنتجات)
   * 2. PUBG Accounts (حسابات ببجي)
   * 3. UC Packages (باقات الشدات)
   * 4. Orders (الطلبات الواردة)
   * 5. PUBG Sell Submissions (طلبات بيع الحسابات)
   * 6. Settings (الإعدادات)
   */
  public static async createStoreSpreadsheet(
    token: string,
    storeData: {
      products: Product[];
      pubgAccounts: PubgAccount[];
      ucPackages: UcPackage[];
      orders: Order[];
      settings: StoreSettings;
      pubgSubmissions?: PubgSellSubmission[];
    }
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const title = `RTG Gear X - قاعدة بيانات المتجر والطلبات (${new Date().toLocaleDateString('ar-LY')})`;

    // Create the spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
          locale: 'ar_LY',
          autoRecalc: 'ON_CHANGE',
        },
        sheets: [
          { properties: { title: 'المنتجات', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'حسابات PUBG', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'باقات الشدات UC', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'طلبات بيع الحسابات', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'الطلبات الواردة', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'إعدادات المتجر', gridProperties: { frozenRowCount: 1 } } },
        ],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'فشل إنشاء جدول بيانات Google');
    }

    const createdData = await createRes.json();
    const spreadsheetId = createdData.spreadsheetId;
    const spreadsheetUrl = createdData.spreadsheetUrl;

    // Populate sheets with headers & initial data
    await this.exportAllDataToSheet(token, spreadsheetId, storeData);

    this.saveConfig({
      spreadsheetId,
      spreadsheetUrl,
      lastSyncedAt: new Date().toLocaleString('ar-LY'),
    });

    return { spreadsheetId, spreadsheetUrl };
  }

  /**
   * Export all store data into the Google Sheet
   */
  public static async exportAllDataToSheet(
    token: string,
    spreadsheetId: string,
    data: {
      products: Product[];
      pubgAccounts: PubgAccount[];
      ucPackages: UcPackage[];
      orders: Order[];
      settings: StoreSettings;
      pubgSubmissions?: PubgSellSubmission[];
    }
  ): Promise<void> {
    // 1. Products Sheet data
    const productsHeader = ['المعرف (ID)', 'اسم المنتج', 'الفئة', 'السعر (د.ل)', 'السعر القديم', 'الحالة', 'رابط الصورة', 'الوصف'];
    const productsRows = data.products.map((p) => [
      p.id,
      p.name,
      p.category,
      p.price,
      p.oldPrice || '',
      p.inStock ? 'متوفر' : 'غير متوفر',
      p.image,
      p.description || '',
    ]);

    // 2. PUBG Accounts data
    const accountsHeader = ['المعرف (ID)', 'العنوان', 'البادج', 'المستوى', 'السعر (د.ل)', 'الحالة', 'المميزات', 'رابط الصورة', 'رابط الفيديو'];
    const accountsRows = data.pubgAccounts.map((a) => [
      a.id,
      a.title,
      a.badge,
      a.level,
      a.price,
      a.isAvailable ? 'متاح للبيع' : 'تم البيع',
      a.features.join(' | '),
      a.image,
      a.videoUrl || '',
    ]);

    // 3. UC Packages data
    const ucHeader = ['المعرف (ID)', 'كمية الشدات', 'شدات إضافية مجانية', 'السعر (د.ل)', 'الأكثر طلباً'];
    const ucRows = data.ucPackages.map((u) => [
      u.id,
      u.ucAmount,
      u.bonusUc,
      u.price,
      u.isPopular ? 'نعم' : 'لا',
    ]);

    // 4. PUBG Sell Submissions Sheet data
    const submissionsHeader = [
      'المعرف (ID)',
      'تاريخ التقديم',
      'الاسم الثلاثي',
      'اسم الحساب',
      'المستوى (Level)',
      'مستوى القوة',
      'عدد الميثيك العادي',
      'عدد الميثيك الذهبي',
      'الأسلحة المطورة',
      'سكنات السيارات',
      'الهاشتاجات',
      'روابط الربط',
      'السعر المطلوب (د.ل)',
      'رقم هاتف البائع',
      'الرقم المحول منه 5 ليرات',
      'رابط الفيديو (40 ثانية)',
      'حالة الطلب',
    ];
    const submissionsRows = (data.pubgSubmissions || []).map((s) => [
      s.id,
      s.date,
      s.fullName,
      s.accountName,
      s.accountLevel,
      s.powerLevel,
      s.mythicsCount,
      s.goldenMythicsCount,
      s.upgradableWeapons,
      s.carsCount,
      s.hashtagsCount,
      s.linkedAccounts,
      s.salePrice,
      s.phone,
      s.transferPhone,
      s.videoUrl,
      s.status === 'approved' ? 'تمت الموافقة والنشر' : s.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة',
    ]);

    // 5. Orders Sheet data
    const ordersHeader = ['رقم الطلب', 'التاريخ والوقت', 'نوع الطلب', 'اسم العميل', 'رقم الهاتف', 'المدينة', 'المنطقة', 'طريقة الدفع / التفاصيل', 'الإجمالي (د.ل)', 'الحالة'];
    const ordersRows = data.orders.map((o) => {
      let details = '';
      if (o.type === 'gear' && o.items) {
        details = o.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ');
      } else if (o.type === 'pubg_uc') {
        details = `ID: ${o.pubgId} - ${o.packageName}`;
      } else if (o.type === 'pubg_account') {
        details = `الحساب: ${o.packageName}`;
      }

      return [
        o.id,
        o.date,
        o.type === 'gear' ? 'معدات ألعاب' : o.type === 'pubg_uc' ? 'شحن شدات' : 'حساب PUBG',
        o.customerName,
        o.phone,
        o.city || '-',
        o.region || '-',
        details,
        o.total,
        o.status === 'completed' ? 'مكتمل' : o.status === 'processing' ? 'قيد التنفيذ' : o.status === 'cancelled' ? 'ملغي' : 'معلق',
      ];
    });

    // 6. Store Settings data
    const settingsRows = [
      ['الإعداد', 'القيمة'],
      ['اسم المتجر', data.settings.storeName],
      ['رقم الواتساب لاستلام الطلبات', data.settings.whatsappNumber],
      ['رقم الهاتف المعروض', data.settings.phoneDisplay],
      ['حساب TikTok', data.settings.tiktokHandle],
      ['حساب Instagram', data.settings.instagramHandle],
      ['نص التوصيل', data.settings.shippingText],
      ['أوقات العمل', data.settings.hoursText],
      ['عن المتجر', data.settings.aboutText],
    ];

    // Batch update all sheets
    const body = {
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: 'المنتجات!A1:H' + (productsRows.length + 1),
          values: [productsHeader, ...productsRows],
        },
        {
          range: 'حسابات PUBG!A1:I' + (accountsRows.length + 1),
          values: [accountsHeader, ...accountsRows],
        },
        {
          range: 'باقات الشدات UC!A1:E' + (ucRows.length + 1),
          values: [ucHeader, ...ucRows],
        },
        {
          range: 'طلبات بيع الحسابات!A1:Q' + (submissionsRows.length + 1),
          values: [submissionsHeader, ...submissionsRows],
        },
        {
          range: 'الطلبات الواردة!A1:J' + (ordersRows.length + 1),
          values: [ordersHeader, ...ordersRows],
        },
        {
          range: 'إعدادات المتجر!A1:B' + settingsRows.length,
          values: settingsRows,
        },
      ],
    };

    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.json();
      throw new Error(err.error?.message || 'فشل تحديث بيانات الجدول');
    }

    this.saveConfig({ lastSyncedAt: new Date().toLocaleString('ar-LY') });
  }

  /**
   * Append a new PUBG Sell Submission row directly to 'طلبات بيع الحسابات'
   */
  public static async appendPubgSubmissionToSheet(
    token: string,
    spreadsheetId: string,
    submission: PubgSellSubmission
  ): Promise<boolean> {
    try {
      const row = [
        submission.id,
        submission.date,
        submission.fullName,
        submission.accountName,
        submission.accountLevel,
        submission.powerLevel,
        submission.mythicsCount,
        submission.goldenMythicsCount,
        submission.upgradableWeapons,
        submission.carsCount,
        submission.hashtagsCount,
        submission.linkedAccounts,
        submission.salePrice,
        submission.phone,
        submission.transferPhone,
        submission.videoUrl,
        'قيد المراجعة',
      ];

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/طلبات بيع الحسابات!A:Q:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [row] }),
        }
      );

      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Append a new order directly to the 'الطلبات الواردة' sheet in real-time
   */
  public static async appendOrderToSheet(
    token: string,
    spreadsheetId: string,
    order: Order
  ): Promise<boolean> {
    try {
      let details = '';
      if (order.type === 'gear' && order.items) {
        details = order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ');
      } else if (order.type === 'pubg_uc') {
        details = `ID: ${order.pubgId} - ${order.packageName}`;
      } else if (order.type === 'pubg_account') {
        details = `الحساب: ${order.packageName}`;
      }

      const row = [
        order.id,
        order.date,
        order.type === 'gear' ? 'معدات ألعاب' : order.type === 'pubg_uc' ? 'شحن شدات' : 'حساب PUBG',
        order.customerName,
        order.phone,
        order.city || '-',
        order.region || '-',
        details,
        order.total,
        order.status === 'completed' ? 'مكتمل' : 'معلق',
      ];

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/الطلبات الواردة!A:J:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [row] }),
        }
      );

      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Import data from Google Sheets into the store
   */
  public static async importFromGoogleSheets(
    token: string,
    spreadsheetId: string
  ): Promise<{
    products?: Product[];
    pubgAccounts?: PubgAccount[];
    ucPackages?: UcPackage[];
    settings?: Partial<StoreSettings>;
    pubgSubmissions?: PubgSellSubmission[];
  }> {
    const ranges = [
      'المنتجات!A2:H100',
      'حسابات PUBG!A2:I100',
      'باقات الشدات UC!A2:E100',
      'إعدادات المتجر!A2:B20',
      'طلبات بيع الحسابات!A2:Q100',
    ];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&')}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'فشل جلب البيانات من جدول Google');
    }

    const data = await res.json();
    const [productsVal, accountsVal, ucVal, settingsVal, submissionsVal] = data.valueRanges || [];

    const imported: any = {};

    // Parse products
    if (productsVal?.values && productsVal.values.length > 0) {
      imported.products = productsVal.values
        .filter((row: any[]) => row && row[1])
        .map((row: any[], index: number) => ({
          id: row[0] || `prod-${Date.now()}-${index}`,
          name: row[1] || '',
          category: row[2] || 'سماعات',
          price: parseFloat(row[3]) || 0,
          oldPrice: parseFloat(row[4]) || 0,
          inStock: row[5] === 'متوفر' || row[5] === 'true' || row[5] === 'نعم',
          image: row[6] || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
          description: row[7] || '',
        }));
    }

    // Parse PUBG Accounts
    if (accountsVal?.values && accountsVal.values.length > 0) {
      imported.pubgAccounts = accountsVal.values
        .filter((row: any[]) => row && row[1])
        .map((row: any[], index: number) => ({
          id: row[0] || `acc-${Date.now()}-${index}`,
          title: row[1] || '',
          badge: row[2] || 'كونكيرور',
          level: row[3] || 'LVL 70',
          price: parseFloat(row[4]) || 0,
          isAvailable: row[5] === 'متاح للبيع' || row[5] === 'true' || row[5] === 'نعم',
          features: row[6] ? row[6].split('|').map((s: string) => s.trim()) : [],
          image: row[7] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
          videoUrl: row[8] || '',
        }));
    }

    // Parse UC Packages
    if (ucVal?.values && ucVal.values.length > 0) {
      imported.ucPackages = ucVal.values
        .filter((row: any[]) => row && row[1])
        .map((row: any[], index: number) => ({
          id: row[0] || `uc-${Date.now()}-${index}`,
          ucAmount: parseInt(row[1]) || 60,
          bonusUc: parseInt(row[2]) || 0,
          price: parseFloat(row[3]) || 0,
          isPopular: row[4] === 'نعم' || row[4] === 'true',
        }));
    }

    // Parse Settings
    if (settingsVal?.values && settingsVal.values.length > 0) {
      const sett: any = {};
      settingsVal.values.forEach((row: string[]) => {
        if (!row || row.length < 2) return;
        const key = row[0]?.trim();
        const val = row[1]?.trim();
        if (key === 'اسم المتجر') sett.storeName = val;
        if (key === 'رقم الواتساب لاستلام الطلبات') sett.whatsappNumber = val;
        if (key === 'رقم الهاتف المعروض') sett.phoneDisplay = val;
        if (key === 'حساب TikTok') sett.tiktokHandle = val;
        if (key === 'حساب Instagram') sett.instagramHandle = val;
        if (key === 'نص التوصيل') sett.shippingText = val;
        if (key === 'أوقات العمل') sett.hoursText = val;
        if (key === 'عن المتجر') sett.aboutText = val;
      });
      imported.settings = sett;
    }

    // Parse Submissions
    if (submissionsVal?.values && submissionsVal.values.length > 0) {
      imported.pubgSubmissions = submissionsVal.values
        .filter((row: any[]) => row && row[2])
        .map((row: any[], index: number) => ({
          id: row[0] || `sub-${Date.now()}-${index}`,
          date: row[1] || new Date().toLocaleString('ar-LY'),
          fullName: row[2] || '',
          accountName: row[3] || '',
          accountLevel: row[4] || '',
          powerLevel: row[5] || '',
          mythicsCount: row[6] || '',
          goldenMythicsCount: row[7] || '',
          upgradableWeapons: row[8] || '',
          carsCount: row[9] || '',
          hashtagsCount: row[10] || '',
          linkedAccounts: row[11] || '',
          salePrice: row[12] || '',
          phone: row[13] || '',
          transferPhone: row[14] || '',
          videoUrl: row[15] || '',
          status: row[16] === 'تمت الموافقة والنشر' ? 'approved' : row[16] === 'مرفوض' ? 'rejected' : 'pending',
        }));
    }

    return imported;
  }
}

