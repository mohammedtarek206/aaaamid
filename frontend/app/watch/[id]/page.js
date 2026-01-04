'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Layout, BookOpen, ShieldAlert, Clock, Star, Info, GraduationCap } from 'lucide-react';

export default function WatchVideo() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const router = useRouter();

  const extractDailymotionId = (input) => {
    if (!input) return '';
    const match = input.match(/(?:dailymotion\.com(?:\/video|\/embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/);
    return match ? match[1] : input.trim();
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await api.get('/student/videos');
        const v = response.data.find(item => item._id === id);
        setVideo(v);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVideo();
  }, [id]);

  if (!video) return (
    <div className="min-h-screen flex items-center justify-center bg-deep">
      <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-deep math-grid pb-24">
      {/* Header */}
      <nav className="glass-panel !rounded-none border-0 border-b border-white/5 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 text-text-dim hover:gold-text transition-all font-black text-sm group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            الرجوع للقائمة
          </button>

          <div className="flex items-center gap-6">
            <div className="text-left hidden sm:block">
              <div className="font-black gold-text text-sm tracking-tight">{video.title}</div>
              <div className="text-[9px] text-text-dim font-black uppercase tracking-[2px] mt-1">{video.unit} • {video.lesson}</div>
            </div>
            <div className="w-12 h-12 luxury-gradient rounded-2xl flex items-center justify-center text-black shadow-lg">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Player Area */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel overflow-hidden gold-border shadow-2xl relative aspect-video rounded-[32px]"
            >
              <div className="absolute inset-0 bg-black">
                <iframe
                  src={`https://www.dailymotion.com/embed/video/${extractDailymotionId(video.dailymotionId)}?api=postMessage&autoplay=1&mute=0`}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                  width="100%"
                  height="100%"
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            </motion.div>

            <div className="glass-panel p-10 md:p-16 gold-border rounded-[40px] relative overflow-hidden">
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 luxury-gradient opacity-[0.02] blur-[100px] -mr-32 -mt-32 rounded-full"></div>

              <div className="flex flex-wrap gap-4 mb-10">
                <span className="px-6 py-1.5 bg-gold/10 text-gold border border-gold/20 rounded-full text-[10px] font-black uppercase tracking-[2px]">{video.unit}</span>
                <span className="px-6 py-1.5 bg-white/5 text-text-dim border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[2px]">المحاضرة رقم 4</span>
                <span className="px-6 py-1.5 bg-white/5 text-text-dim border border-white/5 rounded-full text-[10px] font-black uppercase tracking-[2px] flex items-center gap-2">
                  <Clock size={12} className="text-gold" /> 45:00 دقيقة
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black mb-10 leading-snug">{video.title}</h1>
              <p className="text-text-dim text-lg font-medium leading-[1.8] mb-12 max-w-4xl">
                نستعرض في هذه المحاضرة شرحاً مفصلاً لموضوع "{video.lesson}" مع التركيز على أهم النقاط الجوهرية التي ترد في امتحانات الثانوية العامة.
                مع العميد، سنقوم بفك شيفرة كل مسألة بخطوات منطقية وبسيطة تضمن لك الفهم الكامل.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 glass-panel gold-border bg-gold/5 rounded-[32px]">
                  <h4 className="font-black mb-4 flex items-center gap-3 gold-text"><Star size={20} /> أهداف المحاضرة</h4>
                  <ul className="text-sm text-text-dim font-bold space-y-3">
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 luxury-gradient rounded-full mt-1.5 shrink-0"></div>
                      استيعاب القوانين الأساسية والمشتقة للموضوع.
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 luxury-gradient rounded-full mt-1.5 shrink-0"></div>
                      التدريب على حل المسائل المركبة (نظام الأسئلة الحديثة).
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 luxury-gradient rounded-full mt-1.5 shrink-0"></div>
                      ربط المحتوى الحالي بالمواضيع السابقة لضمان تسلسل الأفكار.
                    </li>
                  </ul>
                </div>
                <div className="p-8 glass-panel border-red-500/10 bg-red-500/5 rounded-[32px]">
                  <h4 className="font-black mb-4 flex items-center gap-3 text-red-400"><ShieldAlert size={20} /> تنبيه الأمان</h4>
                  <p className="text-xs text-text-dim font-medium leading-relaxed">
                    هذا الفيديو مخصص لك كطالب مسجل في منصة العميد. يمنع تداول كود الحساب أو تسجيل المحتوى،
                    حيث أن النظام يقوم بالتعرف التلقائي على محاولات التسجيل ويقوم بحظر الحساب فوراً.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black flex items-center gap-3">
                <div className="w-1.5 h-6 luxury-gradient rounded-full"></div>
                المحاضرات التالية
              </h3>
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="glass-panel p-5 rounded-2xl flex gap-6 cursor-pointer gold-border hover:bg-white/5 transition-all group">
                  <div className="w-24 h-16 bg-bg-surface rounded-xl shrink-0 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Play size={16} className="text-text-dim group-hover:gold-text" fill="currentColor" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-xs font-black mb-1 group-hover:gold-text transition-colors">تكملة شرح {video.lesson} - بـ {item}</div>
                    <div className="text-[9px] text-text-dim font-bold uppercase tracking-widest">{video.unit}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-panel p-10 rounded-[40px] gold-border text-center bg-gradient-to-b from-gold/10 to-transparent">
              <div className="w-16 h-16 luxury-gradient rounded-2xl flex items-center justify-center text-black mx-auto mb-8 shadow-2xl">
                <Info size={32} strokeWidth={2.5} />
              </div>
              <h4 className="text-xl font-black mb-4 gold-text leading-tight">جاهز للتقييم؟</h4>
              <p className="text-xs text-text-dim font-bold mb-10 leading-relaxed px-4">
                بعد الانتهاء من المشاهدة، تأكد من حل الاختبار الملحق لقياس مدى استيعابك للمحاضرة.
              </p>
              <button className="w-full py-5 luxury-gradient text-black font-black rounded-2xl text-sm glow-btn shadow-xl flex items-center justify-center gap-3 hover:gap-5 transition-all">
                بدء الاختبار الآن <ArrowLeft size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .math-grid {
          background-image: 
            radial-gradient(circle at 2px 2px, rgba(201, 160, 80, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}
