import { Product, PubgAccount, UcPackage, LibyanCity, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PUBG_ACCOUNTS: PubgAccount[] = [];

export const INITIAL_UC_PACKAGES: UcPackage[] = [
  {
    id: 'uc-1787261945562',
    ucAmount: 660,
    bonusUc: 60,
    price: 35,
    isPopular: true,
    isAvailable: true,
    tag: 'شحن فوري بالـ ID',
  },
];

export { LIBYAN_CITIES } from './libyanCities';

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'RTG GEAR X',
  tagline: 'MOBILE & GAMING ACCESSORIES',
  country: 'GAMING STORE - LIBYA',
  whatsappNumber: '218934590635',
  phoneDisplay: '+218 93 459 0635',
  supportPhoneAlt: '+2180934590635',
  transferFeePhone: '0943981577',
  googleFormUrl: 'https://forms.gle/LCS6CgXUWciHH21k8',
  googleSheetUrl: '',
  appsScriptUrl: '',
  tiktokUrl: 'https://tiktok.com/@rtggearx',
  tiktokHandle: 'rtggearx@',
  facebookUrl: 'https://facebook.com/rtggearx',
  facebookHandle: 'RTG GEARx',
  instagramUrl: 'https://instagram.com/rtg_gearx',
  instagramHandle: 'rtg_gearx@',
  aboutText: 'هو متجر متخصص في كل ما يخص عالم الألعاب (الجيمينج) وصناعة المحتوى. انطلقنا من شغفنا بالألعاب لنقدم للاعبين في ليبيا والوطن العربي أفضل المعدات بأفضل الأسعار. نحن لسنا مجرد متجر نحن مجتمع للاعبين، نختار منتجاتنا بعناية فائقة لضمان حصولك على أداء متميز يرفع من مستواك في اللعب وتمنحك أفضل تجربة ممكنة.',
  shippingText: 'توصيل سريع لجميع المدن الليبية بالتعاون مع شركة درب السبيل (داخل طرابلس 15 - 20 د.ل، شرق وغرب طرابلس والزاوية وزوارة والماية 25 د.ل، وكافة المدن والمناطق).',
  hoursText: 'متواجدون على مدار الساعة عبر الواتساب لتلبية طلباتكم.',
  currency: 'د.ل',
};
