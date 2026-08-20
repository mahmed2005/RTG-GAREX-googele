import React from 'react';
import { useStore } from '../context/StoreContext';
import { PubgAccount } from '../types';
import { 
  ShieldCheck, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Tag, 
  Plus, 
  Flame, 
  ShoppingBag,
  Gamepad2,
  ExternalLink 
} from 'lucide-react';

export const PubgAccountsPage: React.FC = () => {
  const { 
    pubgAccounts, 
    setSelectedAccountForBuy, 
    setPreviewVideoUrl,
    settings
  } = useStore();

  const handleOpenGoogleForm = () => {
    const formUrl = settings.googleFormUrl || 'https://forms.gle/LCS6CgXUWciHH21k8';
    window.open(formUrl, '_blank');
  };

  // Filter only available and approved accounts
  const visibleAccounts = pubgAccounts.filter(
    (acc) => acc.isAvailable && acc.approved !== false && acc.status !== 'rejected'
  );

  return (
    <div className="py-8 sm:py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>حسابات موثوقة ومضمونة 100%</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            حسابات <span className="text-red-500">PUBG Mobile</span>
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            تصفح أفضل حسابات ببجي موبايل المعروضة للبيع، حسابات نادرة، أسلحة مطورة، وألقاب مميزة. جميع الحسابات يتم فحصها وضمانها بالكامل.
          </p>
        </div>

        {/* Sell Your Account Banner - Redirects directly to Google Form */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="bg-[#151824] border border-white/10 hover:border-red-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  تريد بيع حسابك؟
                </h3>
                <p className="text-slate-400 text-xs">
                  اضغط لتعبئة نموذج Google Form الرسمي وسيتم مراجعة حسابك واعتماده للعرض بالمتجر
                </p>
              </div>
            </div>

            <button
              id="open-sell-account-google-form-btn"
              onClick={handleOpenGoogleForm}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>اعرض حسابك للبيع</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Accounts Grid or Clean Empty State */}
        {visibleAccounts.length === 0 ? (
          <div className="text-center py-16 bg-[#12141e] rounded-3xl border border-white/5 p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">لا توجد حسابات معروضة حالياً</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              كن أول من يعرض حسابه للبيع في المتجر! املأ نموذج Google Form وسيتم إضافته إلى Google Sheet واعتماده للعرض فوراً.
            </p>
            <button
              onClick={handleOpenGoogleForm}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <span>+ اعرض حسابك للبيع الآن</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {visibleAccounts.map((acc) => (
              <div
                key={acc.id}
                id={`pubg-account-card-${acc.id}`}
                className="bg-[#12141e] border border-white/10 hover:border-red-500/30 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 group"
              >
                {/* Media Thumbnail with Video / Play button */}
                <div className="relative w-full aspect-video bg-black/60 overflow-hidden">
                  <img
                    src={acc.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
                    alt={acc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />

                  {/* Level and Rank Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs shadow-md">
                      {acc.badge || 'حساب موثق'}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white font-mono font-bold text-xs border border-white/10">
                      {acc.level}
                    </span>
                  </div>

                  {/* Video Play Overlay */}
                  {acc.videoUrl && (
                    <button
                      id={`play-video-acc-${acc.id}`}
                      onClick={() => setPreviewVideoUrl(acc.videoUrl!)}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl backdrop-blur-xs transition-transform hover:scale-110"
                      aria-label="مشاهدة فيديو الحساب"
                    >
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </button>
                  )}
                </div>

                {/* Account Content */}
                <div className="p-6 flex-1 flex flex-col justify-between text-right">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                      {acc.title}
                    </h3>

                    {/* Detailed Specs Badges if present */}
                    {(acc.mythicsCount || acc.goldenMythicsCount || acc.upgradableWeaponsCount || acc.carsCount || acc.linkedAccounts) && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 p-3 rounded-2xl bg-[#161926] border border-white/5 text-[11px]">
                        {acc.mythicsCount && (
                          <div className="text-slate-300">
                            <span className="text-slate-500 block text-[10px]">ميثيك عادي:</span>
                            <span className="font-bold text-red-400">{acc.mythicsCount}</span>
                          </div>
                        )}
                        {acc.goldenMythicsCount && (
                          <div className="text-slate-300">
                            <span className="text-slate-500 block text-[10px]">ميثيك ذهبي:</span>
                            <span className="font-bold text-amber-400">{acc.goldenMythicsCount}</span>
                          </div>
                        )}
                        {acc.upgradableWeaponsCount && (
                          <div className="text-slate-300">
                            <span className="text-slate-500 block text-[10px]">أسلحة مطورة:</span>
                            <span className="font-bold text-white">{acc.upgradableWeaponsCount}</span>
                          </div>
                        )}
                        {acc.carsCount && (
                          <div className="text-slate-300">
                            <span className="text-slate-500 block text-[10px]">سيارات:</span>
                            <span className="font-bold text-white">{acc.carsCount}</span>
                          </div>
                        )}
                        {acc.powerLevel && (
                          <div className="text-slate-300">
                            <span className="text-slate-500 block text-[10px]">مستوى القوة:</span>
                            <span className="font-bold text-emerald-400 font-mono">{acc.powerLevel}</span>
                          </div>
                        )}
                        {acc.linkedAccounts && (
                          <div className="text-slate-300">
                            <span className="text-slate-500 block text-[10px]">الربط:</span>
                            <span className="font-bold text-slate-300 truncate block">{acc.linkedAccounts}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Features tags grid */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {(acc.features || []).map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-[#171a26] border border-white/5 text-[11px] sm:text-xs text-slate-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">السعر</span>
                      <span className="text-2xl font-black text-red-500 font-mono">
                        {acc.price.toLocaleString()} د.ل
                      </span>
                    </div>

                    <button
                      id={`buy-account-btn-${acc.id}`}
                      onClick={() => setSelectedAccountForBuy(acc)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-red-950/60 transition-all flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>شراء الحساب</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
