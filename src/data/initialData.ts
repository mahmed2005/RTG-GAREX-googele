import { Product, PubgAccount, UcPackage, LibyanCity, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PUBG_ACCOUNTS: PubgAccount[] = [];

export const INITIAL_UC_PACKAGES: UcPackage[] = [];

export const LIBYAN_CITIES: LibyanCity[] = [
  {
    name: 'طرابلس',
    regions: [
      'وسط طرابلس',
      'سوق الجمعة',
      'أبو سليم',
      'عين زارة',
      'الفرناج',
      'حي الأندلس',
      'قرقارش',
      'زاوية الدهماني',
      'غوط الشعال',
      'تاجوراء',
      'جنزور',
      'طريق المطار',
      'الدريبي',
      'الهضبة الخضراء',
    ],
  },
  {
    name: 'بنغازي',
    regions: [
      'الماجوري',
      'الفويهات',
      'الهواري',
      'الحدائق',
      'البركة',
      'بوعطني',
      'الصابري',
      'السلماني',
      'الكيش',
      'وسط البلاد',
      'طريق المطار',
    ],
  },
  {
    name: 'مصراتة',
    regions: ['وسط المدينة', 'طمينة', 'الزروق', 'رأس الطوبة', 'الغيران', 'قصر أحمد', 'السكت', 'المقاصبة'],
  },
  {
    name: 'الزاوية',
    regions: ['وسط المدينة', 'جوددائم', 'الحرشة', 'ديل الرأس', 'أبو عيسى', 'بئر معمر'],
  },
  {
    name: 'الخمس',
    regions: ['المركز', 'لبدة', 'كعام', 'سوق الخميس', 'الساحل'],
  },
  {
    name: 'زليتن',
    regions: ['المركز', 'سوق الثلاثاء', 'كدوة', 'الجمعة', 'البازة'],
  },
  {
    name: 'سبها',
    regions: ['القرضة', 'المهدية', 'سكرة', 'الجديد', 'المنشية', 'حجارة'],
  },
  {
    name: 'طبرق',
    regions: ['وسط المدينة', 'المنارة', 'باب درنة', 'شارع الفنار'],
  },
  {
    name: 'البيضاء',
    regions: ['المركز', 'وردامة', 'حي الزهور', 'الكاوة', 'البيضاء الغربية'],
  },
  {
    name: 'صرمان',
    regions: ['المركز', 'الشاطئ', 'المطلقة'],
  },
  {
    name: 'صبراتة',
    regions: ['المركز', 'الآثار', 'النهضة', 'تليل'],
  },
  {
    name: 'غريان',
    regions: ['المركز', 'تغرنة', 'بني خليفة', 'القواسم'],
  },
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'RTG GEAR X',
  tagline: 'MOBILE & GAMING ACCESSORIES',
  country: 'GAMING STORE - LIBYA',
  whatsappNumber: '218934590635',
  phoneDisplay: '+218 93 459 0635',
  supportPhoneAlt: '+2180934590635',
  tiktokUrl: 'https://tiktok.com/@rtggearx',
  tiktokHandle: 'rtggearx@',
  facebookUrl: 'https://facebook.com/rtggearx',
  facebookHandle: 'RTG GEARx',
  instagramUrl: 'https://instagram.com/rtg_gearx',
  instagramHandle: 'rtg_gearx@',
  aboutText: 'هو متجر متخصص في كل ما يخص عالم الألعاب (الجيمينج) وصناعة المحتوى. انطلقنا من شغفنا بالألعاب لنقدم للاعبين في ليبيا والوطن العربي أفضل المعدات بأفضل الأسعار. نحن لسنا مجرد متجر نحن مجتمع للاعبين، نختار منتجاتنا بعناية فائقة لضمان حصولك على أداء متميز يرفع من مستواك في اللعب وتمنحك أفضل تجربة ممكنة.',
  shippingText: 'توصيل متوفر لجميع المحافظات والمدن الليبية عبر شركات الشحن المعتمدة.',
  hoursText: 'متواجدون على مدار الساعة عبر الواتساب لتلبية طلباتكم.',
  currency: 'د.ل',
};
