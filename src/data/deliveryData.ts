import { DeliveryCityRate, DeliveryZoneGroup } from '../types';

export const DELIVERY_ZONES: DeliveryZoneGroup[] = [
  {
    id: 'tripoli_central',
    name: 'داخل طرابلس',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    borderColor: 'border-red-500/40',
    bgColor: 'from-red-950/40 to-[#12141e]',
    priceDisplay: '15 - 20 د.ل',
    description: 'توصيل سريع ومباشر لجميع أحياء وشوارع طرابلس وضواحيها القريبة خلال 24 ساعة',
    cities: [
      'طرابلس (وسط البلاد)',
      'سوق الجمعة',
      'عين زارة',
      'أبو سليم',
      'حي الأندلس',
      'قرقارش',
      'غوط الشعال',
      'تاجوراء',
      'جنزور',
      'طريق المطار',
      'الدريبي',
      'الهضبة الخضراء',
      'الفرناج',
      'زاوية الدهماني',
      'بن عاشور',
      'السياحية',
      'النوفليين',
      'السراج',
      'فشلوم',
      'زناتة',
      'الظهرة'
    ]
  },
  {
    id: 'tripoli_suburbs',
    name: 'ضواحي طرابلس',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    borderColor: 'border-rose-500/30',
    bgColor: 'from-rose-950/30 to-[#12141e]',
    priceDisplay: '20 - 30 د.ل',
    description: 'المناطق المحيطة بطرابلس الكبرى والنواحي الأربعة',
    cities: [
      'أنجيلة (20 د.ل)',
      'الكريمية (20 د.ل)',
      'السواني (25 د.ل)',
      'الزهراء (25 د.ل)',
      'الساعدية (25 د.ل)',
      'العزيزية (25 د.ل)',
      'السبيعة (25 د.ل)',
      'قصر بن غشير (25 د.ل)',
      'سوق الخميس مسيحل (25 د.ل)',
      'خلة الفرجان (25 د.ل)',
      'وادي الربيع (25 د.ل)',
      'الباعيش (25 د.ل)',
      'سوق السبت (25 د.ل)',
      'ورشفانة (30 د.ل)'
    ]
  },
  {
    id: 'tripoli_east',
    name: 'شرق طرابلس',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/30',
    bgColor: 'from-amber-950/30 to-[#12141e]',
    priceDisplay: '25 د.ل',
    description: 'المدن والبلديات الواقعة على الساحل الشرقي لطرابلس',
    cities: [
      'القره بوللي',
      'قماطة',
      'قصر خيار',
      'الخمس',
      'زليتن',
      'مسلاتة'
    ]
  },
  {
    id: 'tripoli_west',
    name: 'غرب طرابلس',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    borderColor: 'border-orange-500/30',
    bgColor: 'from-orange-950/30 to-[#12141e]',
    priceDisplay: '20 - 40 د.ل',
    description: 'المدن والبلديات على الساحل الغربي والمنفذ الحدودي',
    cities: [
      'الماية (25 د.ل)',
      'الزاوية (25 د.ل)',
      'زوارة (25 د.ل)',
      'المطرد (20 د.ل)',
      'صرمان (30 د.ل)',
      'صبراتة (30 د.ل)',
      'العجيلات (30 د.ل)',
      'الجميل (30 د.ل)',
      'رقدالين (30 د.ل)',
      'زلطن (30 د.ل)',
      'رأس أجدير (40 د.ل)'
    ]
  },
  {
    id: 'tripoli_south',
    name: 'جنوب طرابلس',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    borderColor: 'border-yellow-500/30',
    bgColor: 'from-yellow-950/30 to-[#12141e]',
    priceDisplay: '30 د.ل',
    description: 'مدن ومناطق جنوب طرابلس وترهونة وبني وليد',
    cities: [
      'ترهونة',
      'بني وليد'
    ]
  },
  {
    id: 'western_mountains',
    name: 'الجبل الغربي (نفوسة)',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500/30',
    bgColor: 'from-blue-950/30 to-[#12141e]',
    priceDisplay: '25 - 45 د.ل',
    description: 'كافة مدن وقرى جبل نفوسة والسهول المجاورة',
    cities: [
      'غريان (25 د.ل)',
      'الأصابعة (35 د.ل)',
      'الرابطة (35 د.ل)',
      'القواليش (35 د.ل)',
      'العوينة (35 د.ل)',
      'القلعة (35 د.ل)',
      'يفرن (35 د.ل)',
      'ككلة (35 د.ل)',
      'الرحيبات (40 د.ل)',
      'جادو (40 د.ل)',
      'كاباو (40 د.ل)',
      'الرقيعات (40 د.ل)',
      'نالوت (40 د.ل)',
      'الزنتان (40 د.ل)',
      'الرجبان (40 د.ل)',
      'تيجي (45 د.ل)',
      'بدر (45 د.ل)',
      'الجوش (45 د.ل)'
    ]
  },
  {
    id: 'central_region',
    name: 'المنطقة الوسطى',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/30',
    bgColor: 'from-purple-950/30 to-[#12141e]',
    priceDisplay: '25 - 40 د.ل',
    description: 'مدن خليج سرت والجفرة ومصراتة والموانئ النفطية',
    cities: [
      'مصراتة (25 د.ل)',
      'سرت (30 د.ل)',
      'هراوة (30 د.ل)',
      'النوفلية (30 د.ل)',
      'بن جواد (30 د.ل)',
      'رأس لانوف (30 د.ل)',
      'أجدابيا (30 د.ل)',
      'البريقة (30 د.ل)',
      'هون (35 د.ل)',
      'سوكنة (35 د.ل)',
      'ودان (35 د.ل)',
      'الجفرة (35 د.ل)',
      'زلة (40 د.ل)'
    ]
  },
  {
    id: 'eastern_region',
    name: 'المنطقة الشرقية (برقة)',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/30',
    bgColor: 'from-emerald-950/30 to-[#12141e]',
    priceDisplay: '30 - 50 د.ل',
    description: 'بنغازي والجبل الأخضر وطبرق والحدود الشرقية',
    cities: [
      'بنغازي (30 د.ل)',
      'توكرة (35 د.ل)',
      'المرج (35 د.ل)',
      'البيضاء (35 د.ل)',
      'قمينس (35 د.ل)',
      'سلوق (35 د.ل)',
      'شحات (40 د.ل)',
      'سوسة (40 د.ل)',
      'درنة (40 د.ل)',
      'القبة (40 د.ل)',
      'طبرق (40 د.ل)',
      'الأبرق (40 د.ل)',
      'إمساعد (50 د.ل)'
    ]
  },
  {
    id: 'southern_region',
    name: 'المنطقة الجنوبية (فزان)',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    borderColor: 'border-cyan-500/30',
    bgColor: 'from-cyan-950/30 to-[#12141e]',
    priceDisplay: '35 - 50 د.ل',
    description: 'سبها ووادي الشاطئ وأوباري ومرزق وغات وغدامس',
    cities: [
      'مزدة (35 د.ل)',
      'الشويرف (35 د.ل)',
      'القريات (35 د.ل)',
      'سبها (35 د.ل)',
      'براك الشاطئ (40 د.ل)',
      'الشاطئ (40 د.ل)',
      'أوباري (45 د.ل)',
      'أم الأرانب (45 د.ل)',
      'وادي عتبة (45 د.ل)',
      'مرزق (45 د.ل)',
      'القطرون (45 د.ل)',
      'تراغن (45 د.ل)',
      'غدامس (45 د.ل)',
      'غات (50 د.ل)'
    ]
  },
  {
    id: 'south_east',
    name: 'الجنوب الشرقي (الواحات والكفرة)',
    badgeColor: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
    borderColor: 'border-lime-500/30',
    bgColor: 'from-lime-950/30 to-[#12141e]',
    priceDisplay: '50 د.ل',
    description: 'جالو وأوجلة وحوض الواحات والكفرة',
    cities: [
      'جالو (50 د.ل)',
      'أوجلة (50 د.ل)',
      'الواحات (50 د.ل)',
      'إخرخرة / إجخرة (50 د.ل)',
      'الكفرة (50 د.ل)'
    ]
  }
];

export const ALL_DELIVERY_RATES: DeliveryCityRate[] = [
  // 1. داخل طرابلس
  { id: 'tripoli_central', name: 'داخل طرابلس (وسط البلد والأحياء الرئيسية)', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'souq_jumaa', name: 'سوق الجمعة', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'ain_zara', name: 'عين زارة', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'abu_salim', name: 'أبو سليم', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'hay_andalus', name: 'حي الأندلس / قرقارش', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'ghot_shaal', name: 'غوط الشعال', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'tajoura', name: 'تاجوراء', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'janzour', name: 'جنزور', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'tarik_matar', name: 'طريق المطار / الدريبي', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'hadba', name: 'الهضبة الخضراء', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'farnaj', name: 'الفرناج', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'zawiyat_dahmani', name: 'زاوية الدهماني', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'bin_ashour', name: 'بن عاشور / النوفليين', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },
  { id: 'sarraj', name: 'السراج', price: '15 - 20', priceDisplay: '15 - 20 د.ل', zoneId: 'tripoli_central', zoneName: 'داخل طرابلس', estimatedTime: '24 ساعة' },

  // 2. ضواحي طرابلس
  { id: 'anjila', name: 'أنجيلة', price: 20, priceDisplay: '20 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'karimiya', name: 'الكريمية', price: 20, priceDisplay: '20 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'swani', name: 'السواني', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'zahra', name: 'الزهراء', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'saadiya', name: 'الساعدية', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'aziziya', name: 'العزيزية', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'sbiaa', name: 'السبيعة', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'qasr_bin_ghashir', name: 'قصر بن غشير', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'souq_khamis_msayhil', name: 'سوق الخميس مسيحل', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'khalat_ferjan', name: 'خلة الفرجان', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'wadi_rabee', name: 'وادي الربيع', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'baeesh', name: 'الباعيش', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'souq_sebt', name: 'سوق السبت', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'warshafana', name: 'ورشفانة', price: 30, priceDisplay: '30 د.ل', zoneId: 'tripoli_suburbs', zoneName: 'ضواحي طرابلس', estimatedTime: '24 - 48 ساعة' },

  // 3. شرق طرابلس (25 د.ل حسب توجيه المستخدم)
  { id: 'qarabolli', name: 'القره بوللي', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_east', zoneName: 'شرق طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'qmata', name: 'قماطة', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_east', zoneName: 'شرق طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'qasr_khiar', name: 'قصر خيار', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_east', zoneName: 'شرق طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'khoms', name: 'الخمس', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_east', zoneName: 'شرق طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'zliten', name: 'زليتن', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_east', zoneName: 'شرق طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'msallata', name: 'مسلاتة', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_east', zoneName: 'شرق طرابلس', estimatedTime: '24 - 48 ساعة' },

  // 4. غرب طرابلس (الماية، الزاوية، زوارة = 25 د.ل)
  { id: 'maya', name: 'الماية', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'zawiya', name: 'الزاوية', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'zwara', name: 'زوارة', price: 25, priceDisplay: '25 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'matrad', name: 'المطرد', price: 20, priceDisplay: '20 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'surman', name: 'صرمان', price: 30, priceDisplay: '30 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'sabrata', name: 'صبراتة', price: 30, priceDisplay: '30 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'ajelat', name: 'العجيلات', price: 30, priceDisplay: '30 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'jmeil', name: 'الجميل', price: 30, priceDisplay: '30 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'raqdalin', name: 'رقدالين', price: 30, priceDisplay: '30 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'zaltan', name: 'زلطن (زلتن)', price: 30, priceDisplay: '30 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'ras_ajdir', name: 'رأس أجدير (المنفذ)', price: 40, priceDisplay: '40 د.ل', zoneId: 'tripoli_west', zoneName: 'غرب طرابلس', estimatedTime: '48 ساعة' },

  // 5. جنوب طرابلس
  { id: 'tarhuna', name: 'ترهونة', price: 30, priceDisplay: '30 د.ل', zoneId: 'tripoli_south', zoneName: 'جنوب طرابلس', estimatedTime: '24 - 48 ساعة' },
  { id: 'bani_walid', name: 'بني وليد', price: 30, priceDisplay: '30 د.ل', zoneId: 'tripoli_south', zoneName: 'جنوب طرابلس', estimatedTime: '24 - 48 ساعة' },

  // 6. الجبل الغربي
  { id: 'gharyan', name: 'غريان', price: 25, priceDisplay: '25 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '24 - 48 ساعة' },
  { id: 'asabaa', name: 'الأصابعة', price: 35, priceDisplay: '35 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'rabta', name: 'الرابطة', price: 35, priceDisplay: '35 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'qawalish', name: 'القواليش', price: 35, priceDisplay: '35 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'uwayna', name: 'العوينة', price: 35, priceDisplay: '35 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'qalaa', name: 'القلعة', price: 35, priceDisplay: '35 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'yafran', name: 'يفرن', price: 35, priceDisplay: '35 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'kekla', name: 'ككلة', price: 35, priceDisplay: '35 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'ruhaybat', name: 'الرحيبات', price: 40, priceDisplay: '40 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'jadu', name: 'جادو', price: 40, priceDisplay: '40 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'kabaw', name: 'كاباو', price: 40, priceDisplay: '40 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'ruqayyat', name: 'الرقيعات', price: 40, priceDisplay: '40 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'nalut', name: 'نالوت', price: 40, priceDisplay: '40 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'zintan', name: 'الزنتان', price: 40, priceDisplay: '40 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'rajban', name: 'الرجبان', price: 40, priceDisplay: '40 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 ساعة' },
  { id: 'teeji', name: 'تيجي', price: 45, priceDisplay: '45 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 - 72 ساعة' },
  { id: 'bader', name: 'بدر', price: 45, priceDisplay: '45 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 - 72 ساعة' },
  { id: 'jowsh', name: 'الجوش', price: 45, priceDisplay: '45 د.ل', zoneId: 'western_mountains', zoneName: 'الجبل الغربي', estimatedTime: '48 - 72 ساعة' },

  // 7. المنطقة الوسطى
  { id: 'misrata', name: 'مصراتة', price: 25, priceDisplay: '25 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '24 - 48 ساعة' },
  { id: 'sirt', name: 'سرت', price: 30, priceDisplay: '30 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '48 ساعة' },
  { id: 'harawa', name: 'هراوة', price: 30, priceDisplay: '30 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '48 ساعة' },
  { id: 'nawfaliya', name: 'النوفلية', price: 30, priceDisplay: '30 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '48 ساعة' },
  { id: 'bin_jawad', name: 'بن جواد', price: 30, priceDisplay: '30 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '48 ساعة' },
  { id: 'ras_lanuf', name: 'رأس لانوف', price: 30, priceDisplay: '30 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '48 ساعة' },
  { id: 'brega', name: 'البريقة', price: 30, priceDisplay: '30 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '48 ساعة' },
  { id: 'ajdabiya', name: 'أجدابيا', price: 30, priceDisplay: '30 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '48 ساعة' },
  { id: 'hun', name: 'هون (الجفرة)', price: 35, priceDisplay: '35 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '48 - 72 ساعة' },
  { id: 'sokna', name: 'سوكنة', price: 35, priceDisplay: '35 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '48 - 72 ساعة' },
  { id: 'waddan', name: 'ودان', price: 35, priceDisplay: '35 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '48 - 72 ساعة' },
  { id: 'zella', name: 'زلة', price: 40, priceDisplay: '40 د.ل', zoneId: 'central_region', zoneName: 'المنطقة الوسطى', estimatedTime: '72 ساعة' },

  // 8. المنطقة الشرقية
  { id: 'benghazi', name: 'بنغازي', price: 30, priceDisplay: '30 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 ساعة' },
  { id: 'tukra', name: 'توكرة', price: 35, priceDisplay: '35 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'marj', name: 'المرج', price: 35, priceDisplay: '35 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'bayda', name: 'البيضاء', price: 35, priceDisplay: '35 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'qaminis', name: 'قمينس', price: 35, priceDisplay: '35 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'slouq', name: 'سلوق', price: 35, priceDisplay: '35 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'shahat', name: 'شحات', price: 40, priceDisplay: '40 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'sousa', name: 'سوسة', price: 40, priceDisplay: '40 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'derna', name: 'درنة', price: 40, priceDisplay: '40 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'qubba', name: 'القبة', price: 40, priceDisplay: '40 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'abraq', name: 'الأبرق', price: 40, priceDisplay: '40 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'tobruk', name: 'طبرق', price: 40, priceDisplay: '40 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '48 - 72 ساعة' },
  { id: 'msaad', name: 'إمساعد (الحدود الشرقية)', price: 50, priceDisplay: '50 د.ل', zoneId: 'eastern_region', zoneName: 'المنطقة الشرقية', estimatedTime: '72 ساعة' },

  // 9. المنطقة الجنوبية
  { id: 'mizda', name: 'مزدة', price: 35, priceDisplay: '35 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '48 ساعة' },
  { id: 'shwerif', name: 'الشويرف', price: 35, priceDisplay: '35 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '48 - 72 ساعة' },
  { id: 'qurayyat', name: 'القريات', price: 35, priceDisplay: '35 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '48 - 72 ساعة' },
  { id: 'sabha', name: 'سبها', price: 35, priceDisplay: '35 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '48 - 72 ساعة' },
  { id: 'brak_shatti', name: 'براك الشاطئ (وادي الشاطئ)', price: 40, priceDisplay: '40 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '48 - 72 ساعة' },
  { id: 'ubari', name: 'أوباري', price: 45, priceDisplay: '45 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '72 ساعة' },
  { id: 'um_aranib', name: 'أم الأرانب', price: 45, priceDisplay: '45 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '72 ساعة' },
  { id: 'wadi_otba', name: 'وادي عتبة', price: 45, priceDisplay: '45 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '72 ساعة' },
  { id: 'murzuq', name: 'مرزق', price: 45, priceDisplay: '45 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '72 ساعة' },
  { id: 'qatrun', name: 'القطرون', price: 45, priceDisplay: '45 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '72 ساعة' },
  { id: 'traghan', name: 'تراغن', price: 45, priceDisplay: '45 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '72 ساعة' },
  { id: 'ghadames', name: 'غدامس', price: 45, priceDisplay: '45 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '72 ساعة' },
  { id: 'ghat', name: 'غات', price: 50, priceDisplay: '50 د.ل', zoneId: 'southern_region', zoneName: 'المنطقة الجنوبية', estimatedTime: '72 - 96 ساعة' },

  // 10. الجنوب الشرقي
  { id: 'jalu', name: 'جالو', price: 50, priceDisplay: '50 د.ل', zoneId: 'south_east', zoneName: 'الجنوب الشرقي', estimatedTime: '72 ساعة' },
  { id: 'awjila', name: 'أوجلة', price: 50, priceDisplay: '50 د.ل', zoneId: 'south_east', zoneName: 'الجنوب الشرقي', estimatedTime: '72 ساعة' },
  { id: 'wahat', name: 'الواحات', price: 50, priceDisplay: '50 د.ل', zoneId: 'south_east', zoneName: 'الجنوب الشرقي', estimatedTime: '72 ساعة' },
  { id: 'jakharra', name: 'إخرخرة (إجخرة)', price: 50, priceDisplay: '50 د.ل', zoneId: 'south_east', zoneName: 'الجنوب الشرقي', estimatedTime: '72 ساعة' },
  { id: 'kufra', name: 'الكفرة', price: 50, priceDisplay: '50 د.ل', zoneId: 'south_east', zoneName: 'الجنوب الشرقي', estimatedTime: '72 - 96 ساعة' },
];

/**
 * Utility helper to lookup delivery price and zone for any city input string
 */
export const findDeliveryRate = (search: string): DeliveryCityRate | null => {
  if (!search || !search.trim()) return null;
  const clean = search.trim().toLowerCase();

  // 1. Direct exact or includes match
  const found = ALL_DELIVERY_RATES.find(
    (rate) =>
      clean.includes(rate.name.toLowerCase()) ||
      rate.name.toLowerCase().includes(clean) ||
      clean.includes(rate.id.toLowerCase())
  );
  if (found) return found;

  // 2. Zone lookup fallback
  if (clean.includes('طرابلس') || clean.includes('سوق الجمعة') || clean.includes('تاجوراء') || clean.includes('جنزور')) {
    return ALL_DELIVERY_RATES[0];
  }
  if (clean.includes('بنغازي')) {
    return ALL_DELIVERY_RATES.find((r) => r.id === 'benghazi') || null;
  }
  if (clean.includes('مصراتة')) {
    return ALL_DELIVERY_RATES.find((r) => r.id === 'misrata') || null;
  }
  if (clean.includes('الزاوية') || clean.includes('زاوية')) {
    return ALL_DELIVERY_RATES.find((r) => r.id === 'zawiya') || null;
  }
  if (clean.includes('زوارة') || clean.includes('زواره')) {
    return ALL_DELIVERY_RATES.find((r) => r.id === 'zwara') || null;
  }
  if (clean.includes('الماية') || clean.includes('مايه') || clean.includes('المايه')) {
    return ALL_DELIVERY_RATES.find((r) => r.id === 'maya') || null;
  }
  if (clean.includes('غريان')) {
    return ALL_DELIVERY_RATES.find((r) => r.id === 'gharyan') || null;
  }
  if (clean.includes('سبها')) {
    return ALL_DELIVERY_RATES.find((r) => r.id === 'sabha') || null;
  }

  return null;
};
