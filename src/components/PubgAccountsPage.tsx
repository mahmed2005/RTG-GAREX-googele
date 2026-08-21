import React from 'react';
import { useStore } from '../context/StoreContext';
import { PubgAccount } from '../types';
import { PubgVideoPlayer } from './PubgVideoPlayer';
import { soundEngine } from '../utils/soundEngine';
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
  ExternalLink,
  Target,
  Car,
  Link2,
  Award,
  Crown
} from 'lucide-react';

export const PubgAccountsPage: React.FC = () => {
  const { 
    pubgAccounts, 
    setSelectedAccountForBuy, 
    setPreviewVideoUrl,
    settings
  } = useStore();

  const handleOpenGoogleForm = () => {
    soundEngine.playButtonClick();
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
                  اضغط لتعبئة نموذج بيع الحساب وسيتم مراجعة حسابك وفحصه واعتماده للعرض بالمتجر
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
              كن أول من يعرض حسابه للبيع في المتجر! املأ نموذج عرض الحساب وسيتم إضافته ومراجعته واعتماده للعرض فوراً.
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
            {visibleAccounts.map((acc) => {
              const mythics = acc.mythicsCount || '—';
              const weapons = acc.upgradableWeaponsCount || '—';
              const cars = acc.carsCount || '—';
              const linked = acc.linkedServices || acc.linkedAccounts || 'موثق';

              return (
                <div
                  key={acc.id}
                  id={`pubg-account-card-${acc.id}`}
                  className="bg-[#12141e] border border-white/10 hover:border-red-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 group hover:shadow-red-950/20"
                >
                  {/* Upper Section: Video Player with Minimalist Overlay */}
                  <PubgVideoPlayer
                    videoUrl={acc.videoUrl}
                    thumbnailUrl={acc.image}
                    title={acc.title}
                    badge={acc.badge || 'حساب موثق'}
                    level={acc.level || (acc.accountLevel ? `LVL ${acc.accountLevel}` : undefined)}
                    onExpand={(url) => setPreviewVideoUrl(url)}
                  />

                  {/* Lower Section: Organized Gaming Specs & Pricing */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between text-right">
                    <div>
                      {/* Account Title Header */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                            {acc.title || acc.accountName || 'حساب PUBG مميز'}
                          </h3>
                        </div>
                        <span className="text-[11px] font-bold text-red-400 bg-red-950/40 px-2.5 py-1 rounded-xl border border-red-500/20">
                          {acc.badge || 'موثق'}
                        </span>
                      </div>

                      {/* Organized 4-Grid Specs (Flame / Target / Car / Link) */}
                      <div className="grid grid-cols-2 gap-2.5 mb-5">
                        {/* 1. Mythics */}
                        <div className="p-3 rounded-2xl bg-[#171a27] border border-white/5 hover:border-red-500/30 transition-colors flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
                            <Flame className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-400 block font-medium">الميثيك</span>
                            <span className="text-sm font-black text-red-400 font-mono">{mythics}</span>
                          </div>
                        </div>

                        {/* 2. Upgradable Weapons */}
                        <div className="p-3 rounded-2xl bg-[#171a27] border border-white/5 hover:border-blue-500/30 transition-colors flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Target className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-400 block font-medium">أسلحة مطورة</span>
                            <span className="text-sm font-black text-white font-mono">{weapons}</span>
                          </div>
                        </div>

                        {/* 3. Cars */}
                        <div className="p-3 rounded-2xl bg-[#171a27] border border-white/5 hover:border-amber-500/30 transition-colors flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Car className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-400 block font-medium">السيارات</span>
                            <span className="text-sm font-black text-amber-400 font-mono">{cars}</span>
                          </div>
                        </div>

                        {/* 4. Linked Account */}
                        <div className="p-3 rounded-2xl bg-[#171a27] border border-white/5 hover:border-emerald-500/30 transition-colors flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div className="text-left max-w-[90px] truncate">
                            <span className="text-[10px] text-slate-400 block font-medium">الربط</span>
                            <span className="text-xs font-bold text-emerald-300 truncate block">{linked}</span>
                          </div>
                        </div>
                      </div>

                      {/* Optional Secondary Highlights (Golden Mythic, Apartment, Rating) if available */}
                      {(acc.goldCount || acc.goldenMythicsCount || acc.apartmentLevel || acc.hashtagsCount) && (
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          {(acc.goldCount || acc.goldenMythicsCount) && (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-400" />
                              <span>ميثيك ذهبي: {acc.goldCount || acc.goldenMythicsCount}</span>
                            </span>
                          )}
                          {acc.apartmentLevel && (
                            <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold">
                              مستوى الشقة: {acc.apartmentLevel}
                            </span>
                          )}
                          {acc.hashtagsCount && (
                            <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-bold flex items-center gap-1">
                              <Award className="w-3 h-3 text-cyan-400" />
                              <span>الألقاب: {acc.hashtagsCount}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price & Action Section */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">سعر الحساب</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-red-500 font-mono tracking-tight">
                            {acc.price.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-300">د.ل</span>
                        </div>
                      </div>

                      <button
                        id={`buy-account-btn-${acc.id}`}
                        onClick={() => {
                          soundEngine.playButtonClick();
                          setSelectedAccountForBuy(acc);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-red-950/60 transition-all flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>شراء الحساب</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
