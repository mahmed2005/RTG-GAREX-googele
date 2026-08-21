import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  PhoneCall, 
  MessageCircle, 
  Truck, 
  Clock, 
  Info, 
  ExternalLink,
  ShieldCheck 
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useStore();

  const socialLinks = [
    {
      id: 'tiktok',
      name: 'TikTok',
      handle: settings.tiktokHandle,
      url: settings.tiktokUrl,
      icon: (
        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.49V8.58a8.28 8.28 0 0 0 4.84 1.56V6.69z" />
        </svg>
      ),
      bg: 'bg-black/60 border-white/10 hover:border-white/30',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: settings.facebookHandle,
      url: settings.facebookUrl,
      icon: (
        <svg className="w-5 h-5 fill-[#1877f2]" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      bg: 'bg-[#1877f2]/10 border-[#1877f2]/30 hover:bg-[#1877f2]/20',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: settings.instagramHandle,
      url: settings.instagramUrl,
      icon: (
        <svg className="w-5 h-5 fill-[#e1306c]" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      bg: 'bg-[#e1306c]/10 border-[#e1306c]/30 hover:bg-[#e1306c]/20',
    },
  ];

  return (
    <div className="py-8 sm:py-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            تواصل <span className="text-red-500">معنا</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            نحن متواجدون دائماً لخدمتك، تابعنا على منصات التواصل الاجتماعي لمعرفة أحدث العروض والمنتجات.
          </p>
        </div>

        {/* Social Platforms Grid matching video */}
        <div className="mb-10">
          <h2 className="text-sm font-bold text-slate-300 mb-4 text-right flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-500 rounded-full" />
            <span>منصاتنا</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {socialLinks.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                id={`social-link-${item.id}`}
                className={`p-5 rounded-3xl border ${item.bg} flex items-center justify-between transition-all group shadow-lg`}
              >
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                <div className="text-right flex items-center gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono" dir="ltr">
                      {item.handle}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    {item.icon}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Direct WhatsApp Support Card matching video */}
        <div className="mb-10 bg-[#12141e] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
            <MessageCircle className="w-8 h-8 fill-emerald-500" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            دعم واتساب المباشر
          </h3>

          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            هل تحتاج لمساعدة فورية؟ فريقنا متواجد للرد على جميع استفساراتكم وتأكيد طلباتكم فوراً.
          </p>

          <div className="pt-2">
            <a
              id="contact-whatsapp-direct-btn"
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-emerald-950/70 transition-all font-mono"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>تواصل الآن {settings.phoneDisplay}</span>
            </a>
          </div>
        </div>

        {/* About Store Section matching video */}
        <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/10">
            <Info className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white">عن المتجر</h3>
          </div>

          <div className="text-right space-y-4">
            <h4 className="text-xl font-bold text-white">RTG Gear X</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {settings.aboutText}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            {/* Shipping */}
            <div className="p-4 rounded-2xl bg-[#171a26] border border-white/5 flex items-start gap-3 text-right">
              <div className="p-2 rounded-xl bg-red-600/10 text-red-400 flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white mb-1">التوصيل والشحن</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {settings.shippingText}
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="p-4 rounded-2xl bg-[#171a26] border border-white/5 flex items-start gap-3 text-right">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white mb-1">أوقات العمل</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {settings.hoursText}
                </p>
              </div>
            </div>
          </div>

          {/* PUBG Account Sell Info & Fee Transfer */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">رقم تحويل رسوم عرض الحسابات (5 دينار)</h5>
                <p className="text-xs font-mono font-bold text-amber-300 mt-0.5" dir="ltr">
                  {settings.transferFeePhone || '0943981577'}
                </p>
              </div>
            </div>

            {settings.googleFormUrl && (
              <a
                href={settings.googleFormUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors self-end sm:self-auto"
              >
                <span>نموذج عرض الحساب للبيع</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
