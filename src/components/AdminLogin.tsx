import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldAlert, ArrowRight, CheckCircle2, Cloud } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AppsScriptService } from '../services/appsScript';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const { adminCredentials } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingCloud, setCheckingCloud] = useState(false);

  // Default credentials fallback from context
  const ADMIN_USER = adminCredentials?.username || 'admin';
  const ADMIN_PASS = adminCredentials?.password || 'rtg2026';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // 1. Immediate local check
    const storedUser = (localStorage.getItem('rtg_admin_user') || ADMIN_USER).trim();
    const storedPass = (localStorage.getItem('rtg_admin_pass') || ADMIN_PASS).trim();

    if (cleanUser === storedUser && cleanPass === storedPass) {
      sessionStorage.setItem('rtg_admin_authenticated', 'true');
      localStorage.setItem('rtg_admin_user', cleanUser);
      localStorage.setItem('rtg_admin_pass', cleanPass);
      setLoading(false);
      onLoginSuccess();
      return;
    }

    // 2. Cross-Device Live Online Check (in case credentials were changed from PC/another device)
    setCheckingCloud(true);
    try {
      const cfg = AppsScriptService.getConfig();
      const isVerified = await AppsScriptService.verifyAdminOnline(cfg.webAppUrl, cleanUser, cleanPass);

      if (isVerified) {
        // Successfully verified from Google Sheets "أمان الأدمن" / Server!
        sessionStorage.setItem('rtg_admin_authenticated', 'true');
        localStorage.setItem('rtg_admin_user', cleanUser);
        localStorage.setItem('rtg_admin_pass', cleanPass);
        setLoading(false);
        setCheckingCloud(false);
        onLoginSuccess();
        return;
      }
    } catch (err) {
      console.warn('Online verification attempt failed:', err);
    }

    setLoading(false);
    setCheckingCloud(false);
    setError('اسم المستخدم أو كلمة المرور غير صحيحة! تأكد من كتابة البيانات المطابقة لورقة «أمان الأدمن» أو المحفوظة بلوحة التحكم.');
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
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{checkingCloud ? 'جارٍ التحقق من ورقة أمان الأدمن سحابياً...' : 'جارٍ تسجيل الدخول...'}</span>
                </>
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
