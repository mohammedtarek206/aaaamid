'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShieldAlert, Trophy, GraduationCap, ArrowLeft, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

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
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center text-black shadow-lg">
                            <GraduationCap size={28} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black gold-text leading-none">{exam.title}</h1>
                            <div className="text-[9px] text-gray-500 font-black uppercase tracking-[2px] mt-1 italic">Exam System Active</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className={`flex items-center gap-4 px-8 py-3 rounded-2xl luxury-card gold-border !border-white/5 ${timeLeft < 300 ? 'border-red-500/30 text-red-500 animate-pulse' : 'gold-text'}`}>
                            <Clock size={22} className="shrink-0" />
                            <span className="text-2xl font-black tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
                        </div>
                        <button onClick={() => submitExam()} disabled={isSubmitting} className="btn-primary !py-3 !px-10 !text-sm !rounded-xl">
                            تسليم الآن
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-40 space-y-12">
                {questions.map((q, idx) => (
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
                ))}

                <div className="py-20 text-center">
                    <div className="inline-flex items-center gap-4 text-gray-600 bg-white/5 px-10 py-5 rounded-[24px] border border-white/5 backdrop-blur-xl">
                        <ShieldAlert size={20} className="text-gold animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[2px]">نظام حماية البيانات المشفر : مـراقـب بـواسـطة الـعمـيد</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
