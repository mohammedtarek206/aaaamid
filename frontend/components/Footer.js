'use client';

import { GraduationCap, Facebook, Youtube, MessageCircle } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="py-32 bg-black/80 backdrop-blur-3xl border-t border-white/5 relative z-10 font-cairo">
            <div className="container mx-auto px-6 text-center">
                <div className="flex items-center justify-center gap-6 mb-16">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center gold-text border border-white/10">
                        <GraduationCap size={32} />
                    </div>
                    <span className="text-5xl font-black gold-text tracking-tighter">العميد</span>
                </div>

                <div className="flex justify-center gap-12 mb-20 text-gray-500 font-black text-sm uppercase tracking-widest">
                    <a href="#about" className="hover:text-gold transition-colors">عن المنصة</a>
                    <a href="#features" className="hover:text-gold transition-colors">المميزات</a>
                    <a href="#" className="hover:text-gold transition-colors">سياسة الخصوصية</a>
                </div>

                <div className="mb-24 flex justify-center gap-10">
                    <a href="https://www.facebook.com/share/1ajY85wpZL/" target="_blank" className="w-16 h-16 glass-panel flex items-center justify-center hover:bg-gold hover:text-black transition-all cursor-pointer rounded-2xl">
                        <Facebook size={24} />
                    </a>
                    <a href="https://youtube.com" target="_blank" className="w-16 h-16 glass-panel flex items-center justify-center hover:bg-gold hover:text-black transition-all cursor-pointer rounded-2xl">
                        <Youtube size={24} />
                    </a>
                    <a href="https://www.tiktok.com/@mr.ahmed.shendy.o?_r=1&_t=ZS-92sXIWCeZKk" target="_blank" className="w-16 h-16 glass-panel flex items-center justify-center hover:bg-gold hover:text-black transition-all cursor-pointer rounded-2xl">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                    </a>
                    <a href="https://wa.me/201228056212" target="_blank" className="w-16 h-16 glass-panel flex items-center justify-center hover:bg-gold hover:text-black transition-all cursor-pointer rounded-2xl">
                        <MessageCircle size={24} />
                    </a>
                </div>

                <div className="pt-20 border-t border-white/5 flex flex-col items-center gap-10">
                    <div className="flex items-center gap-14 text-center">
                        <div className="space-y-2">
                            <div className="text-[10px] text-gray-600 font-black uppercase tracking-[5px]">Developer</div>
                            <div className="flex items-center gap-3">
                                <div className="text-lg font-black text-gray-400">م. محمد طارق</div>
                                <a href="https://wa.me/201284621015" target="_blank" className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all">
                                    <MessageCircle size={16} />
                                </a>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-white/5"></div>
                        <div className="space-y-2">
                            <div className="text-[10px] text-gray-600 font-black uppercase tracking-[5px]">Contact</div>
                            <div className="text-lg font-black text-gray-400 tabular-nums">01284621015</div>
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-700 font-black uppercase tracking-[10px] opacity-40">
                        © 2026 Al-Amid Platform • Educational Excellence
                    </div>
                </div>
            </div>
        </footer>
    );
}
