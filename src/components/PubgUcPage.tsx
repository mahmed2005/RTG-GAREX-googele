import React from 'react';
import { useStore } from '../context/StoreContext';
import { UcPackage } from '../types';
import { Zap, ShieldCheck, Clock, CheckCircle2, Star, ExternalLink } from 'lucide-react';

export const PubgUcPage: React.FC = () => {
  const { ucPackages, setSelectedUcPackage } = useStore();

  const steps = [
    {
      num: '1',
      title: 'اختر الباقة',
      desc: 'حدد عدد الشدات التي تريدها واضغط "اطلب الآن".',
    },
    {
      num: '2',
      title: 'أكمل البيانات',
      desc: 'اكتب اسمك ورقم هاتفك والـ ID الخاص بحسابك في PUBG.',
    },
    {
      num: '3',
      title: 'ادفع',
      desc: 'أرسل المبلغ عبر ليبيانا أو حوالة بنكية حسب اختيارك.',
    },
    {
      num: '4',
      title: 'استلم الكود',
      desc: 'يصلك كود الشدات على واتسابك وتستخدمه في موقع ميداسباي.',
    },
  ];

  return (
    <div className="py-8 sm:py-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3 glow-gold">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>شحن نظامي مباشر</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            شحن شدات <span className="text-amber-400">PUBG</span>
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mb-6">
            اختر الباقة التي تناسبك وأكمل الطلب مباشرة، الكود يصلك على واتسابك خلال دقائق معدودة.
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-[#151824] px-3 py-1.5 rounded-xl border border-white/5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              شحن نظامي 100%
            </span>
            <span className="flex items-center gap-1.5 bg-[#151824] px-3 py-1.5 rounded-xl border border-white/5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              تسليم فوري
            </span>
            <span className="flex items-center gap-1.5 bg-[#151824] px-3 py-1.5 rounded-xl border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              مضمون أو استرداد
            </span>
          </div>
        </div>

        {/* Packages List matching video */}
        <div className="space-y-4 mb-14">
          {ucPackages.map((pkg) => {
            const hasBonus = pkg.bonusUc > 0;
            const totalUc = pkg.ucAmount + pkg.bonusUc;

            return (
              <div
                key={pkg.id}
                id={`uc-pkg-card-${pkg.id}`}
                className={`relative bg-[#12141e] hover:bg-[#161925] border rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-xl ${
                  pkg.isPopular
                    ? 'border-amber-500/40 bg-[#161824]'
                    : 'border-white/10 hover:border-red-500/30'
                }`}
              >
                {/* Popular Star Tag */}
                {pkg.isPopular && (
                  <div className="absolute -top-3 right-6 bg-amber-500 text-black font-extrabold text-[10px] px-3 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-amber-950/80">
                    <Star className="w-3 h-3 fill-black" />
                    <span>الأكثر طلباً</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* UC Details */}
                  <div className="flex items-center gap-4 text-right w-full sm:w-auto">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                      <Zap className="w-7 h-7 fill-amber-400" />
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                          {pkg.ucAmount}
                        </span>
                        <span className="text-sm font-bold text-amber-400">UC</span>
                        {hasBonus && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                            +{pkg.bonusUc} مجاناً
                          </span>
                        )}
                      </div>

                      {hasBonus && (
                        <p className="text-xs text-slate-400 mt-1">
                          المجموع: <span className="text-white font-mono font-bold">{totalUc} UC</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Order Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-right sm:text-left">
                      <span className="text-xl sm:text-2xl font-black text-white font-mono">
                        {pkg.price}
                      </span>
                      <span className="text-xs text-slate-400 mr-1.5 font-sans">د.ل</span>
                    </div>

                    <button
                      id={`order-uc-btn-${pkg.id}`}
                      onClick={() => setSelectedUcPackage(pkg)}
                      className={`px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm active:scale-95 transition-all ${
                        pkg.isPopular
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-950/60 font-extrabold'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60'
                      }`}
                    >
                      اطلب الآن
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* "كيف يتم الشحن؟" Steps */}
        <div className="mb-12 bg-[#12141e] border border-white/10 rounded-3xl p-6 sm:p-8">
          <h3 className="text-xl font-bold text-white text-center mb-8">
            كيف يتم الشحن؟
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="p-4 rounded-2xl bg-[#171a26] border border-white/5 text-center flex flex-col items-center"
              >
                <div className="w-9 h-9 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-mono font-black text-sm mb-3">
                  {step.num}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Midasbuy Guide Note matching video */}
        <div className="bg-[#141724] border border-white/10 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-right text-xs leading-relaxed text-slate-300">
            <p className="font-bold text-white mb-1">
              ملاحظة: بعد استلام الكود
            </p>
            <p>
              افتح موقع{' '}
              <a
                href="https://www.midasbuy.com"
                target="_blank"
                rel="noreferrer"
                className="text-red-400 font-mono font-bold underline hover:text-red-300 inline-flex items-center gap-0.5"
              >
                midasbuy.com <ExternalLink className="w-3 h-3" />
              </a>{' '}
              وسجّل دخولك، ثم الصق الكود في خانة الاسترداد. الشدات ستظهر في حسابك فوراً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
