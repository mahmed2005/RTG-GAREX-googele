import React from 'react';
import { Zap, ShieldCheck, Headphones } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      id: 'speed',
      title: 'سرعة في التنفيذ',
      description: 'تسليم فوري لشدات ببجي وحسابات الألعاب، وشحن سريع للمعدات.',
      icon: <Zap className="w-7 h-7 text-red-500" />,
      glowColor: 'group-hover:border-red-500/40',
    },
    {
      id: 'security',
      title: 'موثوقية وأمان',
      description: 'منتجات أصلية 100%، وحسابات ببجي مضمونة ومفحوصة بالكامل.',
      icon: <ShieldCheck className="w-7 h-7 text-red-500" />,
      glowColor: 'group-hover:border-red-500/40',
    },
    {
      id: 'support',
      title: 'دعم فني مستمر',
      description: 'فريقنا متواجد دائماً للرد على استفساراتك وحل أي مشكلة قد تواجهك.',
      icon: <Headphones className="w-7 h-7 text-red-500" />,
      glowColor: 'group-hover:border-red-500/40',
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            لماذا تختار <span className="text-red-500">RTG Gear X</span>؟
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            نحن نفهم احتياجات اللاعبين وصناع المحتوى، ونسعى لتقديم أفضل خدمة
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((item) => (
            <div
              key={item.id}
              id={`feature-card-${item.id}`}
              className={`group p-7 rounded-3xl bg-[#12141e] border border-white/10 hover:bg-[#161825] transition-all duration-300 flex flex-col items-center text-center ${item.glowColor}`}
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-red-600/20 transition-all">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>

              {/* Description */}
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
