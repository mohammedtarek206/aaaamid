'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShieldAlert, Trophy, GraduationCap, ArrowLeft, ArrowRight, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

export default function ExamPage() {
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const router = useRouter();

    const submitExam = useCallback(async (finalAnswers) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await api.post(`/student/exams/${id}/submit`, {
                answers: finalAnswers || answers
            });
            setResult(response.data);

            // Log exam submission
            try {
                await api.post('/student/activity/log', {
                    action: 'submit_exam',
                    targetId: id,
                    details: `تسليم امتحان: ${exam?.title} - الدرجة: ${response.data.score}/${response.data.totalPoints}`
                });
            } catch (e) { console.warn('Activity log failed'); }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }, [id, answers, isSubmitting]);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await api.get(`/student/exams/${id}`);
                setExam(response.data.exam);
                setQuestions(response.data.questions);
                setTimeLeft(response.data.exam.duration * 60);

                // Log exam start
                try {
                    await api.post('/student/activity/log', {
                        action: 'start_exam',
                        targetId: id,
                        details: `بدء امتحان: ${response.data.exam.title}`
                    });
                } catch (e) { console.warn('Activity log failed'); }
            } catch (err) {
                console.error(err);
            }
        };
        fetchExam();
    }, [id]);

    useEffect(() => {
        if (timeLeft <= 0 && exam && !result) {
            submitExam();
            return;
        }
        const timer = setInterval(() => { setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)); }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, exam, result, submitExam]);

    const handleAnswerSelect = (questionId, selectedAnswerIndex) => {
        if (result) return;
        setAnswers(prev => {
            const indexStr = selectedAnswerIndex.toString();
            const existing = prev.find(a => a.questionId === questionId);
            if (existing) return prev.map(a => a.questionId === questionId ? { ...a, selectedAnswer: indexStr } : a);
            return [...prev, { questionId, selectedAnswer: indexStr }];
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!exam) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
        </div>
    );

    if (result) return (
        <div className="min-h-screen math-grid flex items-center justify-center p-6 bg-black relative">
            <div className="glow-mesh top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[650px] relative z-10"
            >
                <div className="luxury-card overflow-hidden gold-gradient p-[1px]">
                    <div className="bg-[#020202] rounded-[31px] p-12 md:p-20 text-center">

                        <div className={`w-32 h-32 mx-auto rounded-[32px] flex items-center justify-center mb-10 shadow-2xl ${result.score / result.totalPoints >= 0.5 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {result.score / result.totalPoints >= 0.5 ? <Trophy size={64} /> : <CheckCircle2 size={64} className="opacity-20" />}
                        </div>

                        <h2 className="text-4xl font-black mb-6 gold-text italic">انتهى التقييم</h2>

                        <div className="grid grid-cols-2 gap-8 mb-12 bg-white/5 p-10 rounded-[30px] border border-white/5">
                            <div className="text-center">
                                <div className="text-[10px] text-gray-500 font-black uppercase mb-2">درجتك الحالية</div>
                                <div className="text-5xl font-black gold-text">{result.score}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] text-gray-500 font-black uppercase mb-2">الدرجة الكلية</div>
                                <div className="text-5xl font-black">{result.totalPoints}</div>
                            </div>
                        </div>

                        <p className="text-lg font-bold mb-14 text-gray-400">
                            {result.score / result.totalPoints >= 0.85
                                ? 'أداء استثنائي! أنت فعلاً من ملوك العميد.'
                                : 'أداء جيد جداً، واصل اجتهادك لتصل للكمال.'}
                        </p>

                        <button onClick={() => router.back()} className="btn-primary w-full text-xl py-6 group">
                            العودة للمنصة <ArrowLeft className="group-hover:translate-x-[-10px] transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen math-grid pb-24">
            {/* Exam Header */}
            <header className="fixed top-0 w-full z-[100] bg-black/60 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 gold-gradient rounded-xl sm:rounded-2xl flex items-center justify-center text-black shadow-lg shrink-0">
                            <GraduationCap size={20} className="sm:w-[28px]" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-xl font-black gold-text leading-tight truncate max-w-[120px] sm:max-w-none">{exam.title}</h1>
                            <div className="hidden xs:block text-[8px] sm:text-[9px] text-gray-500 font-black uppercase tracking-[2px] mt-0.5 italic">Exam System Active</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-8">
                        <div className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl luxury-card gold-border !border-white/5 ${timeLeft < 300 ? 'border-red-500/30 text-red-500 animate-pulse' : 'gold-text'}`}>
                            <Clock size={16} className="shrink-0 sm:w-[22px]" />
                            <span className="text-base sm:text-2xl font-black tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
                        </div>
                        <button onClick={() => submitExam()} disabled={isSubmitting} className="hidden sm:flex btn-primary !py-3 !px-10 !text-sm !rounded-xl shrink-0">
                            تسليم الآن
                        </button>
                    </div>
                </div>
            </header>

            <main className={`mx-auto transition-all duration-700 ${exam.driveLink ? 'max-w-[98%] h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 p-4 lg:p-8 pt-32' : 'max-w-4xl px-6 pt-32 sm:pt-40 pb-32 space-y-12'}`}>
                {exam.driveLink ? (
                    <>
                        {/* PDF Viewer Side - Premium Container */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-[3] luxury-card border-white/5 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <iframe
                                src={`https://drive.google.com/file/d/${exam.driveLink.match(/\/d\/([\w-]+)/)?.[1] || exam.driveLink.match(/id=([\w-]+)/)?.[1] || exam.driveLink}/preview`}
                                className="w-full h-full border-none relative z-10"
                                allow="autoplay"
                            ></iframe>
                            <div className="absolute bottom-6 left-6 z-20 flex gap-3">
                                <a
                                    href={exam.driveLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black gold-text hover:bg-gold hover:text-black transition-all flex items-center gap-3 shadow-2xl"
                                >
                                    <ExternalLink size={16} /> فـتح فـي نـافذة جـديـدة
                                </a>
                            </div>
                        </motion.div>

                        {/* Answer Sheet Side - High-Tech Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 luxury-card border-white/10 flex flex-col overflow-hidden bg-[#050505]/60 backdrop-blur-2xl relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>

                            <div className="p-8 border-b border-white/5 shrink-0 relative">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="text-right">
                                        <h4 className="text-sm font-black gold-text uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                                            ورقة الإجابة الرقمية
                                        </h4>
                                        <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">Digital OMR System v2.0</p>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[20px] font-black gold-text leading-none">
                                            {answers.length}<span className="text-xs text-gray-600 mx-1">/</span>{questions.length}
                                        </div>
                                        <div className="text-[8px] text-gray-500 font-bold uppercase">الأسئلة المحلولة</div>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(answers.length / questions.length) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-gold/50 to-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                                    ></motion.div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-custom relative z-10">
                                {questions.map((q, idx) => {
                                    const studentAnswer = answers.find(a => a.questionId === q._id);
                                    const isAnswered = studentAnswer !== undefined;

                                    return (
                                        <motion.div
                                            key={q._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`p-5 rounded-[32px] flex flex-col gap-4 transition-all border relative overflow-hidden group/item
                                                ${isAnswered ? 'bg-gold/[0.03] border-gold/20 shadow-lg shadow-gold/5' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex justify-between items-center relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] border transition-all
                                                        ${isAnswered ? 'bg-gold text-black border-gold shadow-lg shadow-gold/20' : 'bg-white/5 text-gray-500 border-white/5'}`}>
                                                        {idx + 1}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isAnswered ? 'gold-text' : 'text-gray-600'}`}>Question</span>
                                                </div>
                                                {isAnswered && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                        <CheckCircle2 size={16} className="text-gold" />
                                                    </motion.div>
                                                )}
                                            </div>

                                            <div className="flex justify-between gap-2 relative z-10">
                                                {['A', 'B', 'C', 'D'].map((opt, oIdx) => {
                                                    const isSelected = studentAnswer?.selectedAnswer === oIdx.toString();
                                                    return (
                                                        <button
                                                            key={oIdx}
                                                            onClick={() => handleAnswerSelect(q._id, oIdx)}
                                                            className={`flex-1 h-12 rounded-2xl font-black text-xs transition-all border flex items-center justify-center
                                                                ${isSelected
                                                                    ? 'bg-gold text-black border-gold shadow-[0_4px_20px_rgba(212,175,55,0.4)] scale-105'
                                                                    : 'bg-black/40 text-gray-500 border-white/5 hover:border-gold/30 hover:text-gold'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Glow Mesh for Answered Items */}
                                            {isAnswered && <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[40px] rounded-full pointer-events-none"></div>}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="p-6 border-t border-white/5 shrink-0 bg-black/60 relative z-10">
                                <button
                                    onClick={() => submitExam()}
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-gold to-[#b38f36] hover:from-[#f3ca52] hover:to-gold text-black font-black py-5 rounded-[28px] shadow-2xl shadow-gold/20 transition-all flex items-center justify-center gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Trophy size={20} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] opacity-70 leading-none mb-1 font-bold">انتهيت من الحل؟</div>
                                        <div className="text-lg">تـسليم الإجـابـات الآن</div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </>
                ) : (
                    questions.map((q, idx) => (
                        <motion.div
                            key={q._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="luxury-card p-10 md:p-14 relative group"
                        >
                            <div className="glow-mesh top-0 right-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity"></div>

                            <div className="flex items-start gap-8 mb-12">
                                <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center text-black font-black text-2xl shrink-0 shadow-lg">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] gold-text font-black uppercase tracking-widest mb-3">السؤال ({q.points} نقاط)</div>
                                    <p className="text-2xl md:text-3xl font-bold leading-relaxed">{q.text}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 pl-0 md:pr-24">
                                {q.options.map((opt, oIdx) => {
                                    const isSelected = answers.find(a => a.questionId === q._id)?.selectedAnswer === oIdx.toString();
                                    return (
                                        <button
                                            key={oIdx}
                                            onClick={() => handleAnswerSelect(q._id, oIdx)}
                                            className={`group/opt flex items-center gap-5 p-6 rounded-[24px] border-2 transition-all text-right
                          ${isSelected
                                                    ? 'border-gold bg-gold/10'
                                                    : 'border-white/5 bg-white/5 hover:border-gold/30 hover:bg-white/[0.08]'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-all
                          ${isSelected ? 'gold-gradient text-black' : 'bg-white/10 text-white/30 group-hover/opt:bg-white/20'} `}>
                                                {String.fromCharCode(65 + oIdx)}
                                            </div>
                                            <span className={`flex-1 font-bold text-[17px] ${isSelected ? 'gold-text' : 'text-gray-400 group-hover/opt:text-white'} `}>{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))
                )}

                <div className="py-20 text-center">
                    <div className="inline-flex items-center gap-4 text-gray-600 bg-white/5 px-10 py-5 rounded-[24px] border border-white/5 backdrop-blur-xl">
                        <ShieldAlert size={20} className="text-gold animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[2px]">نظام حماية البيانات المشفر : مـراقـب بـواسـطة الـعمـيد</span>
                    </div>
                </div>
            </main>

            {/* Mobile Submit Bar */}
            <div className="sm:hidden fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-[100]">
                <button
                    onClick={() => submitExam()}
                    disabled={isSubmitting}
                    className="w-full btn-primary !py-4 !text-base !rounded-2xl shadow-2xl flex items-center justify-center gap-3"
                >
                    <CheckCircle2 size={20} />
                    تسليم الاختبار الآن
                </button>
            </div>
        </div>
    );
}
