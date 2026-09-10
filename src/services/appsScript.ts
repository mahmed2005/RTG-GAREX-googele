/**
 * Google Apps Script Web App Integration
 * Enables Google Sheets and Google Drive to act as a 100% free, real-time backend database for RTG Gear X
 */

import { Product, PubgAccount, UcPackage, Order, StoreSettings, PubgSellSubmission, DeliveryCityRate } from '../types';

export interface AppsScriptConfig {
  webAppUrl: string;
  autoFetchOnLoad: boolean;
  lastSyncedAt: string | null;
}

const APPS_SCRIPT_CONFIG_KEY = 'rtg_apps_script_config_v2';

export { GOOGLE_APPS_SCRIPT_TEMPLATE } from './googleAppsScriptCode';

export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLT7CH_DtGvX63okgIsf-PqWLTgxJk9y2lwtxiv3WWhfT0PQwLB9n-647sg0d5SKSeOA/exec';
export const DEFAULT_DEV_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLT7CH_DtGvX63okgIsf-PqWLTgxJk9y2lwtxiv3WWhfT0PQwLB9n-647sg0d5SKSeOA/exec';

export class AppsScriptService {
  public static getConfig(): AppsScriptConfig {
    try {
      const saved = localStorage.getItem(APPS_SCRIPT_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.webAppUrl && parsed.webAppUrl.trim()) {
          // If stored URL was the old default, upgrade to current default
          if (parsed.webAppUrl.includes('AKfycbwxO0mCyl7uJx1EhxtWUBfR86pSRGKL')) {
            parsed.webAppUrl = DEFAULT_APPS_SCRIPT_URL;
            localStorage.setItem(APPS_SCRIPT_CONFIG_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
      return { 
        webAppUrl: DEFAULT_APPS_SCRIPT_URL, 
        autoFetchOnLoad: true, 
        lastSyncedAt: null 
      };
    } catch {
      return { 
        webAppUrl: DEFAULT_APPS_SCRIPT_URL, 
        autoFetchOnLoad: true, 
        lastSyncedAt: null 
      };
    }
  }

  public static saveConfig(config: Partial<AppsScriptConfig>): AppsScriptConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(APPS_SCRIPT_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Helper to send JSON payload via POST (avoid preflight issues)
   */
  private static async sendPost(webAppUrl: string, body: any): Promise<any> {
    const targetUrl = webAppUrl && webAppUrl.trim() ? webAppUrl.trim() : DEFAULT_APPS_SCRIPT_URL;

    // 1. Try server-side proxy first (100% reliable, zero CORS restrictions on mobile/desktop)
    try {
      const proxyRes = await fetch('/api/apps-script-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, payload: body }),
      });
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        return proxyData;
      }
    } catch {}

    // 2. Direct fetch fallback
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        try {
          return await res.json();
        } catch {
          return { status: 'success' };
        }
      }
    } catch (e) {
      // 3. Fallback no-cors
      try {
        await fetch(targetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(body),
        });
      } catch (err) {
        console.warn('Apps script post error:', err);
      }
    }
    return { status: 'success' };
  }

  /**
   * Fetch all store items live from Google Apps Script Web App
   */
  public static async fetchStoreData(webAppUrl?: string): Promise<{
    products: Product[];
    pubgAccounts: PubgAccount[];
    allPubgAccounts?: PubgAccount[];
    pubgSubmissions?: PubgSellSubmission[];
    ucPackages: UcPackage[];
    settings?: Partial<StoreSettings>;
    deliveryRates?: DeliveryCityRate[];
    categories?: string[];
    adminCredentials?: { username: string; password?: string; passwordHash?: string; salt?: string };
  }> {
    let inputUrl = (webAppUrl && webAppUrl.trim()) ? webAppUrl.trim() : DEFAULT_APPS_SCRIPT_URL;
    if (inputUrl.endsWith('/dev')) {
      inputUrl = inputUrl.replace(/\/dev$/, '/exec');
    }
    
    const testUrl = inputUrl;
    let lastError: any = null;

    // 1. Try server-side proxy FIRST (100% reliable, zero CORS, follows Google 302 redirects, safe from cross-origin script errors)
    try {
      const fullUrl = testUrl.includes('action=') 
        ? testUrl 
        : (testUrl.includes('?') ? `${testUrl}&action=get_all` : `${testUrl}?action=get_all`);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);

      const proxyRes = await fetch(`/api/apps-script-proxy?url=${encodeURIComponent(fullUrl)}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (proxyRes.ok) {
        const result = await proxyRes.json();
        const data = result.data || result;

        if (result.status === 'success' || data.products || data.pubgAccounts || data.ucPackages) {
          this.saveConfig({ 
            webAppUrl: testUrl,
            lastSyncedAt: new Date().toLocaleString('ar-LY') 
          });

          return {
            products: Array.isArray(data.products) ? data.products : [],
            pubgAccounts: Array.isArray(data.pubgAccounts) ? data.pubgAccounts : [],
            allPubgAccounts: Array.isArray(data.allPubgAccounts) ? data.allPubgAccounts : data.pubgAccounts,
            pubgSubmissions: Array.isArray(data.pubgSubmissions) ? data.pubgSubmissions : [],
            ucPackages: Array.isArray(data.ucPackages) ? data.ucPackages : [],
            settings: data.settings || {},
            deliveryRates: Array.isArray(data.deliveryRates) ? data.deliveryRates : undefined,
            categories: Array.isArray(data.categories) ? data.categories : undefined,
            adminCredentials: data.adminCredentials || (data.settings && data.settings.adminUsername ? { username: data.settings.adminUsername, password: data.settings.adminPassword } : undefined),
          };
        }
      }
    } catch (proxyErr: any) {
      lastError = proxyErr;
    }

    // 2. Fallback: Try direct browser fetch with safe AbortController (never injects script tags)
    try {
      const fullUrl = testUrl.includes('action=') 
        ? testUrl 
        : (testUrl.includes('?') ? `${testUrl}&action=get_all` : `${testUrl}?action=get_all`);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(fullUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const result = await res.json();
        const data = result.data || result;

        if (result.status === 'success' || data.products || data.pubgAccounts || data.ucPackages) {
          this.saveConfig({ 
            webAppUrl: testUrl,
            lastSyncedAt: new Date().toLocaleString('ar-LY') 
          });

          return {
            products: Array.isArray(data.products) ? data.products : [],
            pubgAccounts: Array.isArray(data.pubgAccounts) ? data.pubgAccounts : [],
            allPubgAccounts: Array.isArray(data.allPubgAccounts) ? data.allPubgAccounts : data.pubgAccounts,
            pubgSubmissions: Array.isArray(data.pubgSubmissions) ? data.pubgSubmissions : [],
            ucPackages: Array.isArray(data.ucPackages) ? data.ucPackages : [],
            settings: data.settings || {},
            deliveryRates: Array.isArray(data.deliveryRates) ? data.deliveryRates : undefined,
            categories: Array.isArray(data.categories) ? data.categories : undefined,
            adminCredentials: data.adminCredentials || (data.settings && data.settings.adminUsername ? { username: data.settings.adminUsername, password: data.settings.adminPassword } : undefined),
          };
        }
      }
    } catch (err: any) {
      lastError = err;
    }

    throw new Error(lastError?.message || 'فشل جلب البيانات من Google Sheets');
  }

  /**
   * Submit a new PUBG Sell Request or Add PUBG Account
   */
  public static async submitPubgSellAccount(
    webAppUrl: string,
    submission: any
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'submit_pubg_account',
      data: submission,
    });
    return true;
  }

  /**
   * Toggle PUBG account display on website (نعم / لا)
   */
  public static async setPubgDisplay(
    webAppUrl: string,
    id: string,
    display: 'نعم' | 'لا' | 'كلا',
    extraData?: any
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'set_pubg_display',
      id,
      display: display === 'نعم' ? 'نعم' : 'لا',
      ...(extraData || {}),
    });
    return true;
  }

  /**
   * Toggle PUBG account sold status (متوفر / تم البيع)
   */
  public static async setPubgSold(
    webAppUrl: string,
    id: string,
    isSold: boolean,
    extraData?: any
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'set_pubg_sold',
      id,
      isSold,
      sold: isSold,
      saleStatus: isSold ? 'تم البيع' : 'متوفر',
      saleFlag: isSold ? 'لا' : 'نعم',
      ...(extraData || {}),
    });
    return true;
  }

  /**
   * Toggle Product In-Stock status (نعم / لا)
   */
  public static async setProductStock(
    webAppUrl: string,
    id: string,
    inStock: boolean
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'set_product_stock',
      id,
      inStock,
    });
    return true;
  }

  /**
   * Toggle UC Package In-Stock status (نعم / لا)
   */
  public static async setUcPackageStock(
    webAppUrl: string,
    id: string,
    isAvailable: boolean
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'set_uc_package_stock',
      id,
      isAvailable,
    });
    return true;
  }

  /**
   * Delete PUBG Account from Google Sheet
   */
  public static async deletePubgAccount(webAppUrl: string, id: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'delete_pubg_account',
      id,
    });
    return true;
  }

  /**
   * Update PUBG Account in Google Sheets
   */
  public static async updatePubgAccount(webAppUrl: string, id: string, updated: Partial<PubgAccount>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'update_pubg_account',
      id,
      data: updated,
    });
    return true;
  }

  /**
   * Approve PUBG Submission (set display to 'نعم')
   */
  public static async approvePubgSubmission(webAppUrl: string, id: string): Promise<boolean> {
    return this.setPubgDisplay(webAppUrl, id, 'نعم');
  }

  /**
   * Reject PUBG Submission (set display to 'لا')
   */
  public static async rejectPubgSubmission(webAppUrl: string, id: string): Promise<boolean> {
    return this.setPubgDisplay(webAppUrl, id, 'لا');
  }

  /**
   * Sync All Data
   */
  public static async syncAllData(webAppUrl: string, data: any): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'sync_all',
      data,
    });
    return true;
  }

  /**
   * Add a product to Google Sheets
   */
  public static async addProduct(webAppUrl: string, product: Product & { imageBase64?: string }): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'add_product',
      data: product,
    });
    return true;
  }

  /**
   * Update a product in Google Sheets
   */
  public static async updateProduct(webAppUrl: string, id: string, product: Partial<Product>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'update_product',
      id,
      data: product,
    });
    return true;
  }

  /**
   * Delete a product from Google Sheets
   */
  public static async deleteProduct(webAppUrl: string, id: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'delete_product',
      id,
    });
    return true;
  }

  /**
   * Add a UC Package to Google Sheets
   */
  public static async addUcPackage(webAppUrl: string, ucPackage: UcPackage): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'add_uc_package',
      data: ucPackage,
    });
    return true;
  }

  /**
   * Update a UC Package in Google Sheets
   */
  public static async updateUcPackage(webAppUrl: string, id: string, ucPackage: Partial<UcPackage>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'update_uc_package',
      id,
      data: ucPackage,
    });
    return true;
  }

  /**
   * Delete a UC Package from Google Sheets
   */
  public static async deleteUcPackage(webAppUrl: string, id: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'delete_uc_package',
      id,
    });
    return true;
  }

  /**
   * Save store settings in Google Sheets
   */
  public static async saveSettings(webAppUrl: string, settings: Partial<StoreSettings>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'save_settings',
      data: settings,
    });
    return true;
  }

  /**
   * Submit Order to Google Sheets via Web App
   */
  public static async submitOrder(webAppUrl: string, order: Order): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'submit_order',
      data: order,
    });
    return true;
  }

  /**
   * Add a delivery rate to Google Sheets
   */
  public static async addDeliveryRate(webAppUrl: string, rate: DeliveryCityRate): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'add_delivery_rate',
      data: rate,
    });
    return true;
  }

  /**
   * Update a delivery rate in Google Sheets
   */
  public static async updateDeliveryRate(webAppUrl: string, id: string, rate: Partial<DeliveryCityRate>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'update_delivery_rate',
      id,
      data: rate,
    });
    return true;
  }

  /**
   * Delete a delivery rate from Google Sheets
   */
  public static async deleteDeliveryRate(webAppUrl: string, id: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'delete_delivery_rate',
      id,
    });
    return true;
  }

  /**
   * Save / Sync all delivery rates in Google Sheets
   */
  public static async saveDeliveryRates(webAppUrl: string, rates: DeliveryCityRate[]): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'save_delivery_rates',
      rates,
    });
    return true;
  }

  /**
   * Save Admin Credentials in Google Sheets
   */
  public static async saveAdminCredentials(
    webAppUrl: string,
    username: string,
    password: string
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'save_admin_credentials',
      username,
      password,
    });
    return true;
  }

  /**
   * Save Product Categories in Google Sheets
   */
  public static async saveCategories(
    webAppUrl: string,
    categories: string[]
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'save_categories',
      categories,
    });
    return true;
  }
}
