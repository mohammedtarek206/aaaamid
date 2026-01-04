'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FileText, Clock, LogOut, GraduationCap, ArrowRight, User, Star, ShieldCheck } from 'lucide-react';

export default function GradeDashboard() {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const storedStudent = localStorage.getItem('student');
      if (storedStudent) setStudent(JSON.parse(storedStudent));

      try {
        const [vRes, eRes] = await Promise.all([
          api.get('/student/videos'),
          api.get('/student/exams')
        ]);
        setVideos(vRes.data);
        setExams(eRes.data);
      } catch (err) {
        if (err.response?.status === 401) router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const gradeNames = { '1': 'الصف الأول الثانوي', '2': 'الصف الثاني الثانوي', '3': 'الصف الثالث الثانوي' };
  const logout = () => { localStorage.clear(); router.push('/login'); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen math-grid pb-24">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-[100] bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap size={28} className="text-black" />
            </div>
            <div className="hidden sm:block">
              <div className="font-black text-xl gold-text tracking-tighter">منصة العميد</div>
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-[2px]">Educational Ecosystem</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-black">{student?.name}</span>
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{gradeNames[id]}</span>
            </div>
            <button onClick={logout} className="btn-outline !py-2 !px-5 !text-xs !rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10">
              خروج <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-32">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="luxury-card p-12 mb-16 relative overflow-hidden group"
        >
          <div className="glow-mesh -top-20 -right-20 opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="text-center md:text-right">
              <h1 className="text-4xl md:text-5xl font-black mb-4">أهلاً بك، {student?.name?.split(' ')[0]} 🔥</h1>
              <p className="text-gray-400 text-lg font-medium">مستعد لرحلة تعلم استثنائية اليوم؟</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[{ label: 'فيديو', val: videos.length }, { label: 'اختبار', val: exams.length }].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/5 px-8 py-5 rounded-[24px] text-center">
                  <div className="text-3xl font-black gold-text">{s.val}</div>
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-4">
                <div className="w-1.5 h-8 gold-gradient rounded-full"></div> المحاضرات المتاحة
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <AnimatePresence>
                {videos.length > 0 ? videos.map((v, i) => (
                  <motion.div
                    key={v._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => router.push(`/watch/${v._id}`)}
                    className="luxury-card group cursor-pointer overflow-hidden hover:border-gold/30 transition-all"
                  >
                    <div className="aspect-video relative bg-black overflow-hidden">
                      <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      <Play size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" fill="currentColor" />
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[9px] font-black gold-text px-3 py-1 bg-gold/5 rounded-full uppercase tracking-tighter">{v.unit}</span>
                        <span className="text-[9px] font-black text-gray-500 px-3 py-1 bg-white/5 rounded-full uppercase tracking-tighter">{v.lesson}</span>
                      </div>
                      <h3 className="text-xl font-black mb-6 group-hover:gold-text transition-colors leading-tight">{v.title}</h3>
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                          <Clock size={12} /> متاح للمشاهدة
                        </div>
                        <ArrowRight size={20} className="text-gold -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-full py-20 luxury-card text-center border-dashed border-white/10 italic text-gray-600">
                    لا يوجد دروس متاحة لصفك حالياً.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <h2 className="text-2xl font-black flex items-center gap-4">
              <div className="w-1.5 h-8 gold-gradient rounded-full"></div> بنك الاختبارات
            </h2>

            <div className="space-y-4">
              {exams.length > 0 ? exams.map((e, i) => (
                <motion.div
                  key={e._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/exam/${e._id}`)}
                  className="luxury-card p-6 flex items-center gap-6 cursor-pointer hover:bg-gold/5 hover:border-gold/20 transition-all group"
                >
                  <div className="w-14 h-14 gold-gradient rounded-2xl flex items-center justify-center text-black group-hover:scale-110 transition-transform shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm mb-1 group-hover:gold-text transition-colors truncate">{e.title}</h4>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{e.duration} MIN • START NOW</div>
                  </div>
                </motion.div>
              )) : (
                <p className="text-center text-gray-600 font-bold p-10 luxury-card border-dashed">لا توجد اختبارات.</p>
              )}
            </div>

            {/* Achievement Card */}
            <div className="luxury-card p-10 border-gold/10 bg-gradient-to-br from-gold/5 via-transparent to-transparent">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 gold-gradient rounded-[24px] flex items-center justify-center text-black shadow-xl">
                  <Star size={32} />
                </div>
                <div>
                  <div className="text-lg font-black">{student?.name}</div>
                  <div className="text-[10px] font-black text-gold uppercase tracking-[1px] mt-1">كود: {student?.code}</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black gold-text uppercase">
                  <span>التقدم التعليمي</span>
                  <span>0%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-0 h-full gold-gradient shadow-[0_0_10px_rgba(201,160,80,0.5)] transition-all duration-1000"></div>
                </div>
                <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                  <ShieldCheck size={16} className="text-green-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">الحساب محمي بنظام التشفير الملكي</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
