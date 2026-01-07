'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Trophy, ShieldCheck, Users, PlayCircle, Star,
  ArrowLeft, GraduationCap, Play, Youtube, Info, CheckCircle2,
  Facebook, MessageCircle, Instagram, Code, Target, Zap, Heart
} from 'lucide-react';

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
    { label: 'سنة خبرة', value: '16+', icon: <Trophy size={24} /> },
    { label: 'تقييم عام', value: '4.9/5', icon: <Star size={24} /> },
  ];

  const features = [
    { title: 'شرح احترافي', desc: 'تبسيط أعقد المفاهيم الرياضية بأسلوب منطقي وسلس.', icon: <Zap size={32} /> },
    { title: 'نظام امتحانات', desc: 'تقييم دوري شامل يحاكي نظام الامتحانات الجديد.', icon: <Target size={32} /> },
    { title: 'متابعة دقيقة', desc: 'تقارير أداء دورية لضمان تطور مستوى الطالب.', icon: <CheckCircle2 size={32} /> },
    { title: 'دعم فني', desc: 'فريق متخصص للرد على استفسارات الطلاب التقنية والتعليمية.', icon: <MessageCircle size={32} /> },
  ];

  const reviews = [
    { name: 'أحمد محمد', grade: '3 ثانوى', comment: 'أفضل مدرس رياضيات في مصر بلا منازع، الشرح مبسط جداً والأسئلة قوية.' },
    { name: 'سارة خالد', grade: '3 ثانوى', comment: 'المنصة سهلت عليا كتير، خصوصاً المتابعة والامتحانات الدورية.' },
    { name: 'ياسين علي', grade: '2 ثانوى', comment: 'كنت بخاف من الرياضيات، لكن مع العميد بقيت المادة المفضلة عندي.' },
  ];

  return (
    <main className="min-h-screen math-grid relative overflow-hidden text-white bg-deep">
      {/* Dynamic Glows */}
      <div className="glow-mesh top-[-10%] right-[-10%] animate-pulse-glow"></div>
      <div className="glow-mesh bottom-[-10%] left-[-10%] animate-pulse-glow" style={{ animationDelay: '5s' }}></div>

      {/* Modern Navbar */}
      <nav className="fixed top-0 w-full z-[100] bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(201,160,80,0.3)] group-hover:scale-110 transition-transform">
              <GraduationCap size={28} className="text-black" />
            </div>
            <span className="text-2xl font-black gold-text tracking-tighter">العميد</span>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-gray-400">
            <a href="#about" className="hover:text-gold transition-colors">عن المنصة</a>
            <a href="#features" className="hover:text-gold transition-colors">المميزات</a>
            <a href="#grades" className="hover:text-gold transition-colors">الصفوف</a>
            <a href="#free-lectures" className="hover:text-gold transition-colors">المحاضرات</a>
            <Link href="/login" className="btn-primary !px-8 !py-3 !text-xs !rounded-xl !tracking-widest">
              دخول الطلاب
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-52 pb-32 px-6 container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-right"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-gold/20 bg-gold/5 gold-text text-[10px] font-black uppercase tracking-[3px] mb-10">
              <span className="w-2 h-2 rounded-full gold-gradient animate-pulse"></span>
              أقوى منظمة تعليمية في الرياضيات
            </div>
            <h1 className="text-5xl md:text-8xl font-black leading-[1] mb-10">
              اصنع <span className="gold-text">مستقبلك</span> <br />
              بمنطق الأساطير
            </h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-12 max-w-2xl mx-auto lg:mx-0 font-medium">
              مع العميد، نتحول من مجرد "شرح" إلى "تمكين ذكاء رياضي". نحن نبني بطلاً في كل طالب، ونفتح لك أبواب كليات القمة بأحدث أساليب التدريس العالمية.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <Link href="/login" className="btn-primary text-sm px-14 py-5 !rounded-2xl group shadow-2xl shadow-gold/20">
                ابدأ رحلتك الآن <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
              </Link>
              <a href="#free-lectures" className="btn-outline text-sm px-14 py-5 !rounded-2xl border-white/10 hover:bg-white/5">
                محاضرات مجانية
              </a>
            </div>

            {/* Social Icons Hero */}
            <div className="mt-16 flex justify-center lg:justify-start gap-8 opacity-40 hover:opacity-100 transition-all duration-700">
              <a href="https://youtube.com" target="_blank" className="hover:text-red-600 transition-colors"><Youtube size={28} /></a>
              <a href="https://www.facebook.com/share/1ajY85wpZL/" target="_blank" className="hover:text-blue-600 transition-colors"><Facebook size={28} /></a>
              <a href="https://www.tiktok.com/@mr.ahmed.shendy.o?_r=1&_t=ZS-92sXIWCeZKk" target="_blank" className="hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
              </a>
              <a href="https://wa.me/201228056212" target="_blank" className="hover:text-green-500 transition-colors"><MessageCircle size={28} /></a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="relative w-full max-w-[550px] aspect-[10/13] mx-auto group">
              <div className="absolute -inset-10 border border-gold/10 rounded-[80px] opacity-30 group-hover:scale-105 transition-all duration-1000"></div>
              <div className="absolute -inset-20 border border-gold/5 rounded-[100px] opacity-10 group-hover:scale-110 transition-all duration-1000"></div>

              <div className="w-full h-full glass-panel !rounded-[64px] overflow-hidden p-3 animate-float relative z-10 shadow-2xl border-gold/20">
                <div className="w-full h-full overflow-hidden rounded-[52px]">
                  <img
                    src="/teacher.jpg"
                    alt="الأستاذ العميد"
                    className="w-full h-full object-cover object-top hover:scale-110 transition-all duration-[4000ms]"
                  />
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-10 -right-10 glass-panel p-8 gold-border shadow-2xl z-20 backdrop-blur-3xl animate-bounce-slow">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center text-black">
                    <Trophy size={32} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black italic">16+</div>
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-[2px]">عام من الخبرة</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-40 relative px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1 order-2 lg:order-1">
            <h2 className="text-4xl md:text-6xl font-black mb-8">عن <span className="gold-text">الأستاذ العميد</span></h2>
            <div className="w-24 h-2 gold-gradient rounded-full mb-10"></div>
            <div className="space-y-6 text-gray-400 text-lg font-medium leading-relaxed">
              <p>يعتبر الأستاذ "العميد" علماً من أعلام تدريس مادة الرياضيات للمرحلة الثانوية، حيث نجح على مدار أكثر من 16 عاماً في تخريج آلاف الطلاب الذين التحقوا بكليات القمة.</p>
              <p>تميز منهجه بالجمع بين الفهم العميق للقواعد الرياضية والقدرة على حل أعقد المسائل في وقت قياسي باستخدام استراتيجيات "التفكير المنطقي السريع".</p>
              <div className="grid grid-cols-2 gap-8 pt-10">
                <div className="p-6 glass-panel border-white/5 hover:border-gold/30 transition-all">
                  <h4 className="gold-text font-black text-xl mb-2 underline underline-offset-8 decoration-gold/20">رؤيتنا</h4>
                  <p className="text-sm">تحويل الرياضيات من مادة صعبة إلى لغة ذكاء يستمتع بها الطالب.</p>
                </div>
                <div className="p-6 glass-panel border-white/5 hover:border-gold/30 transition-all">
                  <h4 className="gold-text font-black text-xl mb-2 underline underline-offset-8 decoration-gold/20">هدفنا</h4>
                  <p className="text-sm">ضمان الدرجة النهائية لكل طالب يلتزم بمنظومة العميد.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-5 pt-12">
                <div className="h-64 glass-panel gold-border overflow-hidden rounded-[32px]">
                  <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800" className="w-full h-full object-cover opacity-50" alt="Math" />
                </div>
                <div className="h-48 gold-gradient rounded-[32px] flex items-center justify-center text-black">
                  <GraduationCap size={64} />
                </div>
              </div>
              <div className="space-y-5">
                <div className="h-48 glass-panel border-white/10 rounded-[32px] flex items-center justify-center">
                  <Star size={48} className="text-gold" />
                </div>
                <div className="h-64 glass-panel border-white/10 overflow-hidden rounded-[32px]">
                  <img src="https://images.unsplash.com/photo-1509228468518-180dd48a57a1?w=800" className="w-full h-full object-cover opacity-50" alt="Math" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 px-6 container mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter">لماذا تختار <span className="gold-text">العميد؟</span></h2>
          <p className="text-gray-500 font-bold max-w-2xl mx-auto">نحن لا نقدم مجرد دروس، بل نقدم منظومة تعليمية متكاملة تضمن لك التفوق.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-right">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="glass-panel p-10 border-white/5 hover:border-gold/40 transition-all duration-500 relative group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-24 h-24 gold-gradient opacity-0 group-hover:opacity-[0.05] blur-3xl -ml-12 -mt-12 transition-opacity"></div>
              <div className="w-20 h-20 bg-gold/5 rounded-3xl flex items-center justify-center text-gold mb-8 shadow-2xl group-hover:bg-gold group-hover:text-black transition-all">
                {f.icon}
              </div>
              <h3 className="text-2xl font-black mb-4">{f.title}</h3>
              <p className="text-gray-500 font-bold leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Grades Section */}
      <section id="grades" className="py-40 px-6 container mx-auto text-right">
        <div className="flex flex-wrap justify-between items-end mb-24 gap-10">
          <div>
            <h2 className="text-4xl md:text-7xl font-black mb-6">الصفوف <span className="gold-text">الدراسية</span></h2>
            <div className="w-32 h-2 gold-gradient rounded-full"></div>
          </div>
          <Link href="/login" className="px-10 py-5 glass-panel border-gold/30 gold-text font-black rounded-2xl flex items-center gap-4 hover:bg-gold/5 transition-all">
            اختر صفك الدراسي <ArrowLeft size={18} />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {[1, 2, 3].map((grade) => (
            <motion.div
              key={grade}
              whileHover={{ y: -15 }}
              className="glass-panel p-2 shadow-2xl border-white/5 overflow-hidden group"
            >
              <div className="bg-[#050505] rounded-[24px] overflow-hidden">
                <div className="h-52 bg-bg-surface relative overflow-hidden">
                  <div className="absolute inset-0 bg-gold/10 mix-blend-overlay"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-white/5 text-[150px] leading-none select-none">
                    {grade}
                  </div>
                  <div className="absolute bottom-10 right-10">
                    <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-xl">
                      {grade}
                    </div>
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-black mb-4">
                    {grade === 1 && 'الصف الأول الثانوي'}
                    {grade === 2 && 'الصف الثاني الثانوي'}
                    {grade === 3 && 'الصف الثالث الثانوي'}
                  </h3>
                  <p className="text-gray-500 font-bold mb-10 leading-relaxed min-h-[80px]">
                    {grade === 1 && 'تأسيس شامل للرياضيات، بناء القاعدة الأساسية للنجاح في النظام الحديث.'}
                    {grade === 2 && 'التعمق في الجبر، التفاضل، وحساب المثلثات بأساليب مبتكرة.'}
                    {grade === 3 && 'سنة الحلم، المراجعات النهائية والتدريب المكثف على الامتحانات الشاملة.'}
                  </p>
                  <Link href="/login" className="w-full py-5 rounded-xl border border-white/10 font-black flex items-center justify-center gap-4 group-hover:bg-gold group-hover:text-black hover:border-transparent transition-all">
                    سجل الآن <ArrowLeft size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-40 px-6 relative">
        <div className="glow-mesh top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 opacity-[0.03]"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <Heart size={48} className="text-red-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter underline underline-offset-[20px] decoration-gold/20">قالوا عن <span className="gold-text">العميد</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((r, i) => (
              <motion.div
                key={i}
                className="glass-panel p-12 relative border-white/5"
              >
                <Star className="text-gold mb-8" size={32} fill="currentColor" />
                <p className="text-lg font-bold italic text-gray-400 mb-10 leading-relaxed">"{r.comment}"</p>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full gold-gradient p-[1px]">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-black gold-text">
                      {r.name[0]}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-xl">{r.name}</div>
                    <div className="text-xs font-black text-gold/60 uppercase tracking-widest mt-1">{r.grade}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Videos Section */}
      <section id="free-lectures" className="py-40 px-6 container mx-auto">
        <div className="flex flex-wrap justify-between items-end mb-24 gap-10">
          <div className="text-right">
            <h2 className="text-4xl md:text-7xl font-black mb-6">محاضرات <span className="gold-text">مجانية</span></h2>
            <div className="w-32 h-2 gold-gradient rounded-full"></div>
            <p className="mt-8 text-gray-500 font-bold max-w-xl text-lg">استمتع بنخبة من أقوى المحاضرات المجانية لشرح أهم أجزاء المنهج بأسلوب متميز.</p>
          </div>
          <a href="https://youtube.com" target="_blank" className="px-10 py-5 rounded-2xl bg-red-600/10 text-red-500 border border-red-500/20 font-black flex items-center gap-4 hover:bg-red-600 hover:text-white transition-all">
            قناتنا على يوتيوب <Youtube size={24} />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          <AnimatePresence>
            {freeVideos.length > 0 ? freeVideos.map((v, i) => (
              <motion.div
                key={v._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-panel group overflow-hidden border-white/5 hover:border-gold/30 transition-all"
              >
                <div className="aspect-video relative overflow-hidden bg-black/40">
                  <iframe
                    className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=0`}
                    title={v.title}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                  <div className="absolute inset-0 bg-black group-hover:opacity-0 transition-opacity duration-700 z-10 flex items-center justify-center">
                    <img
                      src={`https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`}
                      alt={v.title}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-125 transition-all">
                      <Play size={32} fill="white" />
                    </div>
                  </div>
                </div>
                <div className="p-10 text-right">
                  <h3 className="text-2xl font-black mb-4 group-hover:gold-text transition-colors">{v.title}</h3>
                  <p className="text-gray-500 font-bold line-clamp-2 leading-relaxed">{v.description}</p>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 glass-panel border-dashed border-white/10 text-center font-bold text-gray-600">
                جاري رفع محاضرات مجانية جديدة قريباً...
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Dynamic Statistics Loop */}
      <section id="stats" className="py-20 relative overflow-hidden bg-white/[0.01] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((s, i) => (
              <div key={i} className="text-center group">
                <div className="text-gold mb-4 flex justify-center group-hover:scale-125 transition-transform duration-500">{s.icon}</div>
                <div className="text-5xl font-black mb-2 tabular-nums">{s.value}</div>
                <div className="text-xs font-black uppercase tracking-[4px] text-gray-500 group-hover:text-white transition-colors">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-black/80 backdrop-blur-3xl border-t border-white/5 relative z-10">
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
            <a href="https://www.facebook.com/share/1ajY85wpZL/" target="_blank" className="w-16 h-16 glass-panel flex items-center justify-center hover:bg-gold hover:text-black transition-all cursor-pointer rounded-2xl"><Facebook size={24} /></a>
            <a href="https://youtube.com" target="_blank" className="w-16 h-16 glass-panel flex items-center justify-center hover:bg-gold hover:text-black transition-all cursor-pointer rounded-2xl"><Youtube size={24} /></a>
            <a href="https://www.tiktok.com/@mr.ahmed.shendy.o?_r=1&_t=ZS-92sXIWCeZKk" target="_blank" className="w-16 h-16 glass-panel flex items-center justify-center hover:bg-gold hover:text-black transition-all cursor-pointer rounded-2xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
            </a>
            <a href="https://wa.me/201228056212" target="_blank" className="w-16 h-16 glass-panel flex items-center justify-center hover:bg-gold hover:text-black transition-all cursor-pointer rounded-2xl"><MessageCircle size={24} /></a>
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
              Elite Educational Ecosystem &copy; 2024
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .math-grid {
          background-image: 
            radial-gradient(circle at 2px 2px, rgba(201, 160, 80, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .glow-mesh {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(201,160,80,0.15) 0%, rgba(201,160,80,0) 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 8s infinite ease-in-out;
        }
        .animate-float {
            animation: float 6s infinite ease-in-out;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
            animation: bounce-slow 4s infinite ease-in-out;
        }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(-1deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
        }
      `}</style>
    </main>
  );
}
