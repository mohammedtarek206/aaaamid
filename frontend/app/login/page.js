'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { LogIn, ShieldAlert, GraduationCap, XCircle } from 'lucide-react';

export default function Login() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login/student', { code });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('student', JSON.stringify(response.data.student));
      router.push(`/dashboard/grade/${response.data.student.grade}`);
    } catch (err) {
      setError(err.response?.data?.error || 'كود الطالب غير صحيح أو حدث خطأ ما');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen math-grid flex items-center justify-center p-6 relative overflow-hidden">
      <div className="glow-mesh top-0 right-0 animate-pulse-glow"></div>
      <div className="glow-mesh bottom-0 left-0 animate-pulse-glow" style={{ animationDelay: '3s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[550px] relative z-10"
      >
        <div className="luxury-card p-0 md:p-1 overflow-hidden gold-gradient">
          <div className="bg-[#020202] rounded-[31px] p-10 md:p-16 text-center">

            <div className="w-20 h-20 gold-gradient rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(201,160,80,0.4)] mb-8">
              <GraduationCap size={40} className="text-black" />
            </div>

            <h1 className="text-3xl font-black mb-3">تسجيل الدخول <br /><span className="gold-text">للطلاب</span></h1>
            <p className="text-gray-500 font-bold mb-12 text-sm">منصة العميد لتعليم الرياضيات</p>

            <form onSubmit={handleLogin} className="space-y-8 text-right">
              <div className="space-y-3">
                <label className="text-xs font-black gold-text uppercase tracking-widest block pr-2">كود الطالب التعليمي</label>
                <input
                  type="text"
                  placeholder="أدخل الكود الخاص بك"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border-0 border-b-2 border-white/10 p-6 text-center text-3xl font-black focus:outline-none focus:border-gold transition-all placeholder:text-gray-800 placeholder:text-sm placeholder:tracking-normal rounded-t-2xl tracking-[4px]"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-sm font-bold"
                >
                  <XCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full text-xl py-6 relative overflow-hidden group shadow-2xl"
              >
                {isLoading ? (
                  <div className="w-7 h-7 border-4 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <>دخول الآن <LogIn size={24} /></>
                )}
                <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
              </button>
            </form>

            <div className="mt-16 pt-10 border-t border-white/5 space-y-4">
              <p className="text-xs font-bold text-gray-500">واجهت مشكلة؟ تفضل بالتواصل مع الدعم</p>
              <button className="gold-text font-black text-sm hover:underline">مركز مساعدة الطلاب عبر واتساب</button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center items-center gap-3 text-[10px] text-gray-700 font-black uppercase tracking-[3px]">
          <ShieldAlert size={14} />
          نظام حماية البيانات النشط
        </div>
      </motion.div>
    </div>
  );
}
