'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy, ShieldCheck, Users, PlayCircle, Star, ArrowLeft, GraduationCap, Play, Youtube, Info, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [freeVideos, setFreeVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreeVideos = async () => {
      try {
        const res = await api.get('/public/free-videos');
        setFreeVideos(res.data);
      } catch (err) {
        console.error('Error fetching free videos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFreeVideos();
  }, []);

  const stats = [
    { label: 'طالب وطالبة', value: '15,000+', icon: <Users size={24} /> },
    { label: 'ساعة فيديو', value: '800+', icon: <PlayCircle size={24} /> },
    { label: 'سنة خبرة', value: '20+', icon: <Trophy size={24} /> },
    { label: 'تقييم عام', value: '4.9/5', icon: <Star size={24} /> },
  ];

  return (
    <main className="min-h-screen math-grid relative overflow-hidden">
      {/* Dynamic Glows & Floating Elements */}
      <div className="glow-mesh top-[-10%] right-[-10%] animate-pulse-glow"></div>
      <div className="glow-mesh bottom-[-10%] left-[-10%] animate-pulse-glow" style={{ animationDelay: '5s' }}></div>

      <div className="absolute top-[20%] left-[5%] w-1 h-20 gold-gradient opacity-20 blur-sm rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
      <div className="absolute top-[40%] right-[3%] w-2 h-32 luxury-gradient opacity-10 blur-sm rounded-full animate-pulse" style={{ animationDuration: '5s' }}></div>
      <div className="absolute bottom-[20%] right-[10%] w-1 h-24 gold-gradient opacity-15 blur-sm rounded-full animate-bounce" style={{ animationDuration: '4s' }}></div>

      {/* Modern Navbar */}
      <nav className="fixed top-0 w-full z-[100] bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(201,160,80,0.3)]">
              <GraduationCap size={28} className="text-black" />
            </div>
            <span className="text-2xl font-black gold-text tracking-tighter">العميد</span>
          </div>

          <div className="hidden lg:flex items-center gap-12 text-sm font-bold text-gray-400">
            <a href="#grades" className="hover:text-gold transition-colors">المراحل الدراسية</a>
            <a href="#about" className="hover:text-gold transition-colors">عن المنصة</a>
            <a href="#stats" className="hover:text-gold transition-colors">إنجازاتنا</a>
            <Link href="/login" className="btn-primary !px-8 !py-2.5 !text-sm !rounded-xl">
              دخول الطلاب
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-right"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full luxury-card gold-text text-sm font-black mb-10">
              <span className="w-2 h-2 rounded-full gold-gradient animate-pulse"></span>
              أقوى منظمة تعليمية في الرياضيات
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-8">
              طريقك <span className="gold-text">المضمون</span> <br />
              نحو القمة التعليمية
            </h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-12 max-w-3xl mx-auto lg:mx-0">
              مع  العميد، نتحول من مجرد "شرح" إلى "تمكين ذكاء رياضي".
              نحن نبني بطلاً في كل طالب، ونفتح لك أبواب كليات القمة بأحدث أساليب التدريس.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <Link href="/login" className="btn-primary text-lg px-12 group">
                ابدأ رحلتك الآن <ArrowLeft size={22} className="group-hover:translate-x-[-8px] transition-transform" />
              </Link>
              <button className="btn-outline text-lg px-12">
                دروس مجانية
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="relative w-full max-w-[650px] aspect-[10/14] mx-auto group">
              <div className="absolute -inset-8 border border-gold/15 rounded-[64px] opacity-40 group-hover:scale-105 transition-transform duration-1000"></div>
              <div className="w-full h-full luxury-card !rounded-[56px] overflow-hidden p-4 animate-float relative z-10 shadow-[0_0_80px_rgba(201,160,80,0.15)]">
                <img
                  src="/teacher.jpg"
                  alt="الأستاذ العميد"
                  className="w-full h-full object-cover object-top rounded-[44px] hover:scale-110 transition-all duration-[3000ms]"
                />
              </div>

              {/* Badges */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                className="absolute top-20 -right-12 luxury-card p-6 border-gold/30 z-20 shadow-2xl backdrop-blur-3xl"
              >
                <div className="text-5xl font-black gold-text italic">20+</div>
                <div className="text-[10px] text-gray-500 font-black mt-2 uppercase tracking-[3px]">سنة من العطاء</div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-20 -left-16 luxury-card p-7 border-gold/30 z-20 shadow-2xl backdrop-blur-3xl"
              >
                <div className="flex gap-5 items-center">
                  <div className="w-14 h-14 gold-gradient rounded-2xl flex items-center justify-center text-black shadow-xl shrink-0">
                    <ShieldCheck size={28} />
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black">أمان ملكي</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">تشفير بيانات الطالب</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Free Videos Section */}
      <section id="free-lectures" className="py-40 px-6 container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="text-right flex-1">
            <h2 className="text-4xl md:text-6xl font-black mb-6">محاضرات <span className="gold-text">مجانية</span></h2>
            <div className="w-40 h-1.5 gold-gradient rounded-full"></div>
            <p className="mt-8 text-gray-400 font-medium max-w-xl text-lg">استمتع بمشاهدة نخبة من أقوى المحاضرات المجانية لشرح أهم أجزاء المنهج بأسلوب العميد المتميز.</p>
          </div>
          <Link href="https://youtube.com" target="_blank" className="btn-outline !rounded-2xl !py-4 flex items-center gap-4 text-red-500 border-red-500/10 hover:bg-red-500/5 transition-all">
            قناتنا على يوتيوب <Youtube size={24} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence>
            {freeVideos.length > 0 ? freeVideos.map((v, i) => (
              <motion.div
                key={v._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="luxury-card group overflow-hidden hover:border-gold/30 transition-all border-white/5 bg-white/[0.02]"
              >
                <div className="aspect-video relative overflow-hidden">
                  <iframe
                    className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=0&controls=1`}
                    title={v.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <div className="absolute inset-0 bg-black group-hover:opacity-0 transition-opacity duration-700 z-10">
                    <img
                      src={`https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`}
                      alt={v.title}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-125 transition-all duration-500">
                        <Play size={32} fill="white" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8 text-right">
                  <h3 className="text-xl font-black mb-4 group-hover:gold-text transition-colors leading-tight">{v.title}</h3>
                  <p className="text-gray-500 text-sm font-bold line-clamp-2 leading-relaxed">{v.description}</p>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 luxury-card text-center border-dashed border-white/10 italic text-gray-600">
                جاري رفع محاضرات مجانية جديدة قريباً...
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Stats Grid */}
      <section id="stats" className="py-20 relative px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="luxury-card p-10 text-center hover:border-gold/50 transition-all group lg:reveal"
            >
              <div className="w-16 h-16 mx-auto gold-gradient rounded-2xl flex items-center justify-center text-black mb-6 shadow-xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="text-4xl font-black mb-2">{item.value}</div>
              <div className="text-gray-500 font-bold text-sm tracking-wide">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Grades Section */}
      <section id="grades" className="py-40 px-6 container mx-auto text-right">
        <div className="mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6">المراحل <span className="gold-text">التعليمية</span></h2>
          <div className="w-40 h-1.5 gold-gradient rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[1, 2, 3].map((grade) => (
            <motion.div
              key={grade}
              whileHover={{ y: -15 }}
              className="luxury-card p-2 group bg-gradient-to-b from-white/10 to-transparent"
            >
              <div className="bg-[#020202] rounded-[30px] p-10 h-full flex flex-col">
                <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center text-black font-black text-2xl mb-8 group-hover:rotate-12 transition-transform">
                  {grade}
                </div>
                <h3 className="text-2xl font-black mb-4">
                  {grade === 1 && 'الصف الأول الثانوي'}
                  {grade === 2 && 'الصف الثاني الثانوي'}
                  {grade === 3 && 'الصف الثالث الثانوي'}
                </h3>
                <p className="text-gray-400 font-medium mb-12 leading-relaxed h-20">
                  {grade === 1 && 'تأسيس شامل للرياضيات، بناء القاعدة الأساسية للنجاح.'}
                  {grade === 2 && 'تعمق في الجبر، التفاضل، وحساب المثلثات.'}
                  {grade === 3 && 'سنة الحلم، المراجعات النهائية والتدريب المكثف على الامتحانات.'}
                </p>
                <Link href="/login" className="mt-auto flex items-center gap-4 gold-text font-black group-hover:gap-6 transition-all">
                  دخول القسم <ArrowLeft size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-black/50 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-4xl font-black gold-text mb-10">العميد</div>
          <p className="text-gray-500 text-sm max-w-xl mx-auto mb-12">
            منصتكم الأولى للتفوق في مادة الرياضيات. نحن هنا لنصنع منكم خبراء وليس مجرد طلاب.
          </p>
          <div className="flex justify-center gap-10 text-xs font-black text-gray-600 uppercase tracking-widest">
            <a href="#" className="hover:text-gold transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms</a>
            <a href="#" className="hover:text-gold transition-colors">Contact</a>
          </div>
          <div className="mt-20 flex flex-col items-center gap-6">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-panel py-4 px-10 rounded-[28px] border border-white/5 bg-white/[0.01] inline-flex items-center gap-10 group hover:border-gold/20 hover:shadow-[0_0_40px_rgba(201,160,80,0.05)] transition-all duration-700"
            >
              <div className="text-right">
                <div className="text-[8px] text-gray-500 font-black uppercase tracking-[3px] mb-1.5 opacity-60">Architected By</div>
                <div className="text-sm font-black text-gray-400 group-hover:gold-text transition-colors duration-500">م. محمد طارق</div>
              </div>

              <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

              <div className="text-left">
                <div className="text-[8px] text-gray-500 font-black uppercase tracking-[3px] mb-1.5 opacity-60">Operations</div>
                <div className="text-xs font-black text-gray-500 group-hover:text-white transition-colors duration-500 tabular-nums">01284621015</div>
              </div>
            </motion.div>

            <div className="text-[9px] text-gray-700 font-bold uppercase tracking-[5px] mt-4 opacity-40">
              Elite Educational Ecosystem &copy; 2024
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
