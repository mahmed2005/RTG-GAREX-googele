import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Default credentials (can also be changed from inside dashboard)
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'rtg2026';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Check stored custom admin credentials or defaults
      const storedUser = localStorage.getItem('rtg_admin_user') || ADMIN_USER;
      const storedPass = localStorage.getItem('rtg_admin_pass') || ADMIN_PASS;

      if (username.trim() === storedUser && password === storedPass) {
        // Save session
        sessionStorage.setItem('rtg_admin_authenticated', 'true');
        setLoading(false);
        onLoginSuccess();
      } else {
        setLoading(false);
        setError('اسم المستخدم أو كلمة المرور غير صحيحة!');
      }
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#12141e] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-500 mb-4 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">تسجيل دخول الإدارة</h2>
          <p className="text-xs text-slate-400">
            صفحة خاصة بالمسؤولين فقط للتحكم في المنتجات والطلبات وجداول Google
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-shake">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
              اسم المستخدم (Username)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="w-full bg-[#181b27] border border-white/10 rounded-xl py-3 px-4 pr-10 text-white text-sm outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-right"
              />
              <User className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
              كلمة المرور (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181b27] border border-white/10 rounded-xl py-3 px-4 pr-10 text-white text-sm outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-right"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>دخول إلى لوحة التحكم</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={onCancel}
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للمتجر</span>
          </button>
          <span className="text-[11px] text-slate-500">RTG Gear X Security</span>
        </div>
      </div>
    </div>
  );
};
