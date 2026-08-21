import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_PUBG_ACCOUNTS, 
  INITIAL_UC_PACKAGES, 
  INITIAL_STORE_SETTINGS 
} from './src/data/initialData';
import { ALL_DELIVERY_RATES } from './src/data/deliveryData';

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'store-db.json');

// In-Memory Database initialized with default fallback or saved file
interface StoreDatabase {
  products: any[];
  pubgAccounts: any[];
  allPubgAccounts: any[];
  pubgSubmissions: any[];
  ucPackages: any[];
  deliveryRates: any[];
  settings: any;
  orders: any[];
  appsScriptUrl?: string;
  lastUpdated: string;
}

function loadDatabase(): StoreDatabase {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          products: Array.isArray(parsed.products) ? parsed.products : [],
          pubgAccounts: Array.isArray(parsed.pubgAccounts) ? parsed.pubgAccounts : [],
          allPubgAccounts: Array.isArray(parsed.allPubgAccounts) ? parsed.allPubgAccounts : (Array.isArray(parsed.pubgAccounts) ? parsed.pubgAccounts : []),
          pubgSubmissions: Array.isArray(parsed.pubgSubmissions) ? parsed.pubgSubmissions : [],
          ucPackages: Array.isArray(parsed.ucPackages) ? parsed.ucPackages : INITIAL_UC_PACKAGES,
          deliveryRates: Array.isArray(parsed.deliveryRates) ? parsed.deliveryRates : ALL_DELIVERY_RATES,
          settings: parsed.settings && typeof parsed.settings === 'object' ? { ...INITIAL_STORE_SETTINGS, ...parsed.settings } : INITIAL_STORE_SETTINGS,
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          appsScriptUrl: parsed.appsScriptUrl || '',
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
      }
    }
  } catch (e) {
    console.warn('Could not read store-db.json, using defaults:', e);
  }

  return {
    products: [],
    pubgAccounts: [],
    allPubgAccounts: [],
    pubgSubmissions: [],
    ucPackages: INITIAL_UC_PACKAGES,
    deliveryRates: ALL_DELIVERY_RATES,
    settings: INITIAL_STORE_SETTINGS,
    orders: [],
    lastUpdated: new Date().toISOString(),
  };
}

function saveDatabase(db: StoreDatabase) {
  try {
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving store-db.json:', e);
  }
}

let db = loadDatabase();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), productsCount: db.products.length });
  });

  // GET Store Data (Available to all phones, PCs, tablets with zero CORS/Auth blocks)
  app.get('/api/store', (req, res) => {
    res.json({
      status: 'success',
      products: db.products,
      pubgAccounts: db.pubgAccounts,
      allPubgAccounts: db.allPubgAccounts,
      pubgSubmissions: db.pubgSubmissions,
      ucPackages: db.ucPackages,
      deliveryRates: db.deliveryRates,
      settings: db.settings,
      orders: db.orders,
      lastUpdated: db.lastUpdated,
    });
  });

  // POST Sync Full Store Data from Client or Apps Script
  app.post('/api/store/sync', (req, res) => {
    try {
      const { products, pubgAccounts, allPubgAccounts, ucPackages, deliveryRates, settings, pubgSubmissions } = req.body;
      if (Array.isArray(products)) {
        db.products = products;
      }
      if (Array.isArray(pubgAccounts)) {
        db.pubgAccounts = pubgAccounts;
      }
      if (Array.isArray(allPubgAccounts)) {
        db.allPubgAccounts = allPubgAccounts;
      }
      if (Array.isArray(ucPackages)) {
        db.ucPackages = ucPackages;
      }
      if (Array.isArray(deliveryRates)) {
        db.deliveryRates = deliveryRates;
      }
      if (Array.isArray(pubgSubmissions)) {
        db.pubgSubmissions = pubgSubmissions;
      }
      if (settings && typeof settings === 'object') {
        db.settings = { ...db.settings, ...settings };
      }
      saveDatabase(db);
      res.json({ status: 'success', message: 'تمت مزامنة بيانات المتجر بنجاح' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Update Product (PUT)
  app.put('/api/store/product/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updated = req.body;
      db.products = db.products.map(p => p.id === id ? { ...p, ...updated } : p);
      saveDatabase(db);
      res.json({ status: 'success', message: 'Product updated' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Add Product
  app.post('/api/store/product', (req, res) => {
    try {
      const newProduct = req.body;
      if (!newProduct.id) {
        newProduct.id = 'p_' + Date.now();
      }
      db.products = [newProduct, ...db.products];
      saveDatabase(db);
      res.json({ status: 'success', product: newProduct });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Delete Product
  app.delete('/api/store/product/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.products = db.products.filter(p => p.id !== id);
      saveDatabase(db);
      res.json({ status: 'success', message: 'Product deleted' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Add PUBG Account
  app.post('/api/store/pubg-account', (req, res) => {
    try {
      const newAcc = req.body;
      if (!newAcc.id) {
        newAcc.id = 'pubg_' + Date.now();
      }
      db.allPubgAccounts = [newAcc, ...db.allPubgAccounts];
      if (newAcc.displayOnSite === 'نعم' || newAcc.approved) {
        db.pubgAccounts = [newAcc, ...db.pubgAccounts];
      }
      saveDatabase(db);
      res.json({ status: 'success', account: newAcc });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Delete PUBG Account
  app.delete('/api/store/pubg-account/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.allPubgAccounts = db.allPubgAccounts.filter(a => a.id !== id);
      db.pubgAccounts = db.pubgAccounts.filter(a => a.id !== id);
      saveDatabase(db);
      res.json({ status: 'success', message: 'PUBG account deleted' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Add UC Package
  app.post('/api/store/uc-package', (req, res) => {
    try {
      const newPkg = req.body;
      if (!newPkg.id) {
        newPkg.id = 'uc_' + Date.now();
      }
      db.ucPackages = [...db.ucPackages, newPkg];
      saveDatabase(db);
      res.json({ status: 'success', package: newPkg });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Delete UC Package
  app.delete('/api/store/uc-package/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.ucPackages = db.ucPackages.filter(u => u.id !== id);
      saveDatabase(db);
      res.json({ status: 'success', message: 'UC Package deleted' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Delivery Rates CRUD
  app.post('/api/store/delivery-rate', (req, res) => {
    try {
      const newRate = req.body;
      if (!newRate.id) {
        newRate.id = 'rate_' + Date.now();
      }
      db.deliveryRates = [newRate, ...db.deliveryRates];
      saveDatabase(db);
      res.json({ status: 'success', rate: newRate });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  app.put('/api/store/delivery-rate/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.deliveryRates = db.deliveryRates.map(r => r.id === id ? { ...r, ...req.body } : r);
      saveDatabase(db);
      res.json({ status: 'success', message: 'Delivery rate updated' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  app.delete('/api/store/delivery-rate/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.deliveryRates = db.deliveryRates.filter(r => r.id !== id);
      saveDatabase(db);
      res.json({ status: 'success', message: 'Delivery rate deleted' });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Update Settings
  app.post('/api/store/settings', (req, res) => {
    try {
      db.settings = { ...db.settings, ...req.body };
      saveDatabase(db);
      res.json({ status: 'success', settings: db.settings });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Server-Side Apps Script Proxy (Eliminates mobile browser CORS & Google Auth issues)
  app.post('/api/apps-script-proxy', async (req, res) => {
    try {
      const { url, payload } = req.body;
      if (!url) {
        return res.status(400).json({ status: 'error', message: 'Missing URL' });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        res.json(json);
      } catch {
        res.json({ status: 'success', raw: text });
      }
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RTG Gear X Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
