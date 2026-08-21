export type Category = 
  | 'الكل'
  | 'كاميرات مراقبة'
  | 'سماعات'
  | 'مبردات'
  | 'كروت شاشة'
  | 'ميكروفونات'
  | 'كيبورد'
  | 'ماوس'
  | 'إكسسوارات'
  | 'أخرى';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  oldPrice?: number; // السعر الخاص / المخفض قبل الخصم أو السعر الأصلي
  image: string; // رابط الصورة
  imageBase64?: string; // صورة مرفوعة كملف
  tag?: string;
  description: string;
  inStock: boolean;
  featured?: boolean;
}

export interface PubgAccount {
  id: string;
  title: string;
  badge: string; // e.g. 'كونكيرور', 'آيس ماستر', 'حساب موثق'
  level: string; // مستوى الحساب e.g. 'LVL 78'
  price: number; // سعر بيع الحساب بالدينار
  oldPrice?: number;
  features: string[];
  image: string;
  videoUrl?: string;
  isAvailable: boolean;
  viewsCount?: number;
  approved?: boolean; // هل تم وضع 'نعم' في الشيت للعرض بالموقع
  status?: 'pending' | 'approved' | 'rejected';
  
  // 17 Detailed Google Sheet Fields
  ownerName?: string; // 1. اسم المالك
  fullName?: string; // توافق خلفي
  accountName?: string; // 2. اسم الحساب المراد بيعه
  accountLevel?: string; // 3. مستوى الحساب
  mythicsCount?: string; // 4. عدد المثكات الموجودة
  apartmentLevel?: string; // 5. مستوى الشقة / الروم
  powerLevel?: string; // توافق خلفي
  goldCount?: string; // 6. عدد مقاييس الذهب / الميثيك الذهبي
  goldenMythicsCount?: string; // توافق خلفي
  upgradableWeaponsCount?: string; // 7. عدد الأسلحة قيد التطوير
  carsCount?: string; // 8. عدد السيارات
  hashtagsCount?: string; // 9. عدد الهاشتاجات والألقاب
  linkedServices?: string; // 10. خدمات الربط (فيسبوك، جيميل، هاتف، آي كلاود)
  linkedAccounts?: string; // توافق خلفي
  salePrice?: string | number; // 11. سعر بيع الحساب
  sellerPhone?: string; // 12. رقم هاتف البائع / المشتري
  phone?: string; // توافق خلفي
  sellerName?: string; // توافق خلفي
  transferPhone?: string; // 13. رقم الهاتف المحول منه رسوم العرض (5 دينار)
  storeReceivePhone?: string; // 14. رقم الهاتف لتحويل 5 دينار إليه
  siteRating?: string | number; // 16. تقييمك للموقع
  displayOnSite?: 'نعم' | 'لا'; // 17. هل يتم عرض هذا الحساب على الموقع؟
  
  // Extra media storage fields
  videoFileBase64?: string;
  videoFileName?: string;
}

export interface PubgSellSubmission {
  id: string;
  date: string;
  // Exact 17 fields in user-specified order
  ownerName: string; // 1. اسم المالك
  fullName?: string; // توافق خلفي
  accountName: string; // 2. اسم الحساب المراد بيعه
  accountLevel: string; // 3. مستوى الحساب
  mythicsCount: string; // 4. عدد المثكات الموجودة في الحساب
  apartmentLevel?: string; // 5. مستوى الشقة
  powerLevel?: string; // توافق خلفي
  goldCount?: string; // 6. عدد مقاييس الذهب / الميثيك الذهبي
  goldenMythicsCount?: string; // توافق خلفي
  upgradableWeapons: string; // 7. عدد الأسلحة قيد التطوير
  carsCount: string; // 8. عدد السيارات
  hashtagsCount: string; // 9. عدد الهاشتاجات
  linkedServices: string; // 10. ما هي الخدمات التي تم ربط حسابك بها (فيسبوك، جيميل، هاتف، آي كلاود)
  linkedAccounts?: string; // توافق خلفي
  salePrice: string; // 11. سعر بيع الحساب
  sellerPhone: string; // 12. رقم هاتف البائع
  phone?: string; // توافق خلفي
  transferPhone?: string; // 13. رقم الهاتف الذي تم التحويل منه رسوم العرض
  storeReceivePhone?: string; // 14. رقم الهاتف المتاح بالموقع لتحويل 5 دينار إليه
  videoUrl?: string; // 15. فيديو لا يتجاوز 40 ثانية للحساب
  siteRating?: string; // 16. تقييمك للموقع
  displayOnSite: 'نعم' | 'لا'; // 17. هل يتم عرض هذا الحساب على الموقع (نعم/لا)
  
  // Video upload metadata
  videoFileBase64?: string;
  videoFileName?: string;
  videoMimeType?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UcPackage {
  id: string;
  ucAmount: number;
  bonusUc: number;
  price: number;
  discountPrice?: number; // سعر الحسم / الخصم الخاص
  isPopular?: boolean;
  tag?: string;
  isAvailable?: boolean;
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
  price?: number | string;
  zone?: string;
}

export interface DeliveryCityRate {
  id: string;
  name: string;
  price: number | string;
  priceDisplay: string;
  zoneId: string;
  zoneName: string;
  estimatedTime?: string;
  notes?: string;
}

export interface DeliveryZoneGroup {
  id: string;
  name: string;
  badgeColor: string;
  borderColor: string;
  bgColor: string;
  priceDisplay: string;
  description?: string;
  cities: string[];
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  country: string;
  whatsappNumber: string; // international digits e.g. 218934590635
  phoneDisplay: string; // e.g. +218 93 459 0635
  supportPhoneAlt: string; // e.g. 0934590635
  transferFeePhone: string; // رقم تحويل رسوم الـ 5 دينار لعرض الحساب (مثال: 0943981577)
  googleFormUrl: string; // رابط نموذج جوجل فورم المباشر
  googleSheetUrl: string; // رابط جدول جوجل شيت
  appsScriptUrl: string; // رابط تطبيق ويب Apps Script
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
