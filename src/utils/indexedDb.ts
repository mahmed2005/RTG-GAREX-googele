/**
 * High-Performance IndexedDB Storage for RTG Gear X
 * Provides instant (<10ms) local cache retrieval for products, accounts, UC packages,
 * bypassing localStorage 5MB quota restrictions for large base64 image datasets.
 */

const DB_NAME = 'rtg_store_cache_v1';
const DB_VERSION = 1;
const STORE_NAME = 'app_cache';

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export const indexedDbService = {
  async get<T>(key: string): Promise<T | null> {
    const db = await openDb();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          resolve((req.result as T) ?? null);
        };

        req.onerror = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  },

  async set<T>(key: string, value: T): Promise<void> {
    const db = await openDb();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(value, key);

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  },

  async saveAllStoreData(data: {
    products?: any[];
    pubgAccounts?: any[];
    allPubgAccounts?: any[];
    ucPackages?: any[];
    deliveryRates?: any[];
    settings?: any;
    categories?: any[];
  }): Promise<void> {
    try {
      if (Array.isArray(data.products) && data.products.length > 0) {
        await this.set('cached_products', data.products);
      }
      if (Array.isArray(data.pubgAccounts)) {
        await this.set('cached_pubg_accounts', data.pubgAccounts);
      }
      if (Array.isArray(data.allPubgAccounts)) {
        await this.set('cached_all_pubg_accounts', data.allPubgAccounts);
      }
      if (Array.isArray(data.ucPackages)) {
        await this.set('cached_uc_packages', data.ucPackages);
      }
      if (Array.isArray(data.deliveryRates)) {
        await this.set('cached_delivery_rates', data.deliveryRates);
      }
      if (data.settings) {
        await this.set('cached_settings', data.settings);
      }
      if (Array.isArray(data.categories)) {
        await this.set('cached_categories', data.categories);
      }
    } catch (e) {
      console.warn('[indexedDb] Failed to save all store data:', e);
    }
  },

  async getAllStoreData(): Promise<{
    products: any[] | null;
    pubgAccounts: any[] | null;
    allPubgAccounts: any[] | null;
    ucPackages: any[] | null;
    deliveryRates: any[] | null;
    settings: any | null;
    categories: any[] | null;
  }> {
    try {
      const [
        products,
        pubgAccounts,
        allPubgAccounts,
        ucPackages,
        deliveryRates,
        settings,
        categories,
      ] = await Promise.all([
        indexedDbService.get<any[]>('cached_products'),
        indexedDbService.get<any[]>('cached_pubg_accounts'),
        indexedDbService.get<any[]>('cached_all_pubg_accounts'),
        indexedDbService.get<any[]>('cached_uc_packages'),
        indexedDbService.get<any[]>('cached_delivery_rates'),
        indexedDbService.get<any>('cached_settings'),
        indexedDbService.get<any[]>('cached_categories'),
      ]);

      return {
        products,
        pubgAccounts,
        allPubgAccounts,
        ucPackages,
        deliveryRates,
        settings,
        categories,
      };
    } catch {
      return {
        products: null,
        pubgAccounts: null,
        allPubgAccounts: null,
        ucPackages: null,
        deliveryRates: null,
        settings: null,
        categories: null,
      };
    }
  },
};
