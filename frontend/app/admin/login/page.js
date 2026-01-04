'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Lock, User, LogIn, ShieldAlert, GraduationCap, XCircle, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login/admin', { username, password });
            localStorage.setItem('adminToken', response.data.token);
            router.push('/admin/dashboard');
        } catch (err) {
            console.error('Login Error:', err);
            const message = err.response?.data?.error || (err.code === 'ERR_NETWORK' ? 'لا يمكن الاتصال بالسيرفر - تأكد من تشغيل الباكيند' : 'اسم المستخدم أو كلمة المرور غير صحيحة');
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen math-grid flex items-center justify-center p-6 relative overflow-hidden bg-black">
            <div className="glow-mesh top-0 right-0 animate-pulse-glow"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[500px] relative z-10"
            >
                <div className="luxury-card p-1 gold-gradient overflow-hidden">
                    <div className="bg-[#020202] rounded-[31px] p-12 md:p-16 text-center">

                        <div className="w-20 h-20 gold-gradient rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(201,160,80,0.4)] mb-8">
                            <Lock size={36} className="text-black" />
                        </div>

                        <h1 className="text-3xl font-black mb-2 text-white">لوحة التحكم</h1>
                        <p className="text-gray-500 font-bold mb-12 text-sm uppercase tracking-[3px]">Admin Secure Gateway</p>

                        <form onSubmit={handleLogin} className="space-y-6 text-right">
                            <div className="space-y-2">
                                <label className="text-xs font-black gold-text uppercase tracking-widest block pr-2">اسم المستخدم</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Admin Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl focus:outline-none focus:border-gold transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black gold-text uppercase tracking-widest block pr-2">كلمة المرور</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl focus:outline-none focus:border-gold transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold"
                                >
                                    <XCircle size={16} />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full text-lg py-5 mt-4 group"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin"></div>
                                ) : (
                                    <>دخول المشرف <LogIn size={20} /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 pt-8 border-t border-white/5 text-center">
                            <div className="inline-flex items-center gap-2 text-[10px] text-gray-700 font-black uppercase tracking-[2px]">
                                <ShieldCheck className="text-gold" size={14} />
                                بوابة دخول مشفرة بالكامل
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

