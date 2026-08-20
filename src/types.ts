export type Category = 
  | 'الكل'
  | 'سماعات'
  | 'مبردات'
  | 'كروت شاشة'
  | 'ميكروفونات'
  | 'كيبورد'
  | 'ماوس';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  oldPrice?: number;
  image: string;
  tag?: string;
  description: string;
  inStock: boolean;
  featured?: boolean;
}

export interface PubgAccount {
  id: string;
  title: string;
  badge: string; // e.g. 'كونكيرور', 'آيس ماستر', 'آيس دومينيتور'
  level: string; // e.g. 'LVL 78', 'LVL 65'
  price: number;
  oldPrice?: number;
  features: string[];
  image: string;
  videoUrl?: string;
  isAvailable: boolean;
  viewsCount?: number;
  approved?: boolean; // هل تمت الموافقة عليه (نعم في الشيت)
  status?: 'pending' | 'approved' | 'rejected';
  // Detailed specifications
  powerLevel?: string;
  mythicsCount?: string;
  goldenMythicsCount?: string;
  upgradableWeaponsCount?: string;
  carsCount?: string;
  hashtagsCount?: string;
  linkedAccounts?: string;
  sellerName?: string;
  sellerPhone?: string;
  transferPhone?: string;
  videoFileBase64?: string;
  videoFileName?: string;
}

export interface PubgSellSubmission {
  id: string;
  fullName: string;
  accountName: string;
  accountLevel: string;
  mythicsCount: string;
  powerLevel: string;
  goldenMythicsCount: string;
  upgradableWeapons: string;
  carsCount: string;
  hashtagsCount: string;
  linkedAccounts: string; // e.g. الهاتف، الجيميل، فيسبوك...
  salePrice: string;
  phone: string;
  transferPhone: string; // الرقم الذي تم إرسال 5 ليرات منه
  videoUrl: string; // رابط فيديو الحساب
  videoFileBase64?: string; // ملف الفيديو الأصلي مرفوع مباشرة
  videoFileName?: string;
  videoMimeType?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UcPackage {
  id: string;
  ucAmount: number;
  bonusUc: number;
  price: number;
  isPopular?: boolean;
  tag?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  type: 'gear' | 'pubg_uc' | 'pubg_account';
  customerName: string;
  phone: string;
  altPhone?: string;
  city?: string;
  region?: string;
  paymentMethod?: string;
  pubgId?: string;
  packageName?: string;
  items?: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
}

export interface LibyanCity {
  name: string;
  regions: string[];
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  country: string;
  whatsappNumber: string; // international digits e.g. 218934590635
  phoneDisplay: string; // e.g. +218 93 459 0635
  supportPhoneAlt: string; // e.g. 0934590635
  tiktokUrl: string;
  tiktokHandle: string;
  facebookUrl: string;
  facebookHandle: string;
  instagramUrl: string;
  instagramHandle: string;
  aboutText: string;
  shippingText: string;
  hoursText: string;
  currency: string;
  logoUrl?: string;
}
