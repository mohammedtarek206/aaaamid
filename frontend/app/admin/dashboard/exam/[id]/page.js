'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, ArrowRight, Save, HelpCircle, GraduationCap } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function QuestionManager() {
    const { id: examId } = useParams();
    const router = useRouter();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState({
        text: '',
        type: 'MCQ',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [e, q] = await Promise.all([
                    api.get('/admin/exams'), // We don't have a single exam route, filter from list or add one
                    api.get(`/admin/exams/${examId}/questions`)
                ]);
                const currentExam = e.data.find(ex => ex._id === examId);
                setExam(currentExam);
                setQuestions(q.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [examId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const res = await api.put(`/admin/questions/${currentQuestion._id}`, currentQuestion);
                setQuestions(questions.map(q => q._id === currentQuestion._id ? res.data : q));
            } else {
                const res = await api.post(`/admin/exams/${examId}/questions`, currentQuestion);
                setQuestions([...questions, res.data]);
            }
            setShowModal(false);
            resetForm();
        } catch (err) {
            alert('حدث خطأ أثناء حفظ السؤال');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
        try {
            await api.delete(`/admin/questions/${id}`);
            setQuestions(questions.filter(q => q._id !== id));
        } catch (err) {
            alert('حدث خطأ أثناء الحذف');
        }
    };

    const resetForm = () => {
        setCurrentQuestion({
            text: '',
            type: 'MCQ',
            options: ['', '', '', ''],
            correctAnswer: '',
            points: 1
        });
        setIsEditing(false);
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold">جاري التحميل...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-8 font-cairo">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all">
                        <ArrowRight size={20} /> العودة للوحة التحكم
                    </button>
                    <div className="text-right">
                        <h1 className="text-3xl font-black gold-text">{exam?.title || 'إدارة الأسئلة'}</h1>
                        <p className="text-gray-500 font-bold">إضافة وتعديل أسئلة الامتحان</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="luxury-card p-6 border-dashed border-gold/30 flex items-center justify-center gap-4 hover:bg-gold/5 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <span className="text-xl font-black">إضافة سؤال جديد</span>
                    </button>

                    {questions.map((q, idx) => (
                        <motion.div
                            key={q._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="luxury-card p-8 relative group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-2">
                                    <button onClick={() => { setCurrentQuestion(q); setIsEditing(true); setShowModal(true); }} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(q._id)} className="p-2 bg-red-500/5 rounded-lg text-red-500/50 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                </div>
                                <div className="text-right">
                                    <span className="bg-gold/10 text-gold text-[10px] font-black px-3 py-1 rounded-full border border-gold/20 mb-2 inline-block">سؤال {idx + 1}</span>
                                    <h3 className="text-xl font-bold">{q.text}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {q.options.map((opt, i) => (
                                    <div key={i} className={`p-4 rounded-xl border ${parseInt(q.correctAnswer) === i ? 'border-green-500/50 bg-green-500/5 text-green-500' : 'border-white/5 bg-white/5 text-gray-400'} text-right font-bold text-sm`}>
                                        {opt}
                                        {parseInt(q.correctAnswer) === i && <CheckCircle2 size={14} className="inline mr-2" />}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm"></motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-[#050505] border border-gold/20 rounded-[30px] p-10 relative z-10 overflow-hidden shadow-2xl">
                            <h2 className="text-2xl font-black mb-8 gold-text text-right">{isEditing ? 'تعديل سؤال' : 'إضافة سؤال جديد'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-6 text-right">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase pr-2">نص السؤال</label>
                                    <textarea
                                        value={currentQuestion.text}
                                        onChange={e => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 transition-all font-bold resize-none h-32"
                                        placeholder="اكتب السؤال هنا..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {currentQuestion.options.map((opt, i) => (
                                        <div key={i} className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase pr-2">الخيار {i + 1}</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...currentQuestion.options];
                                                        newOpts[i] = e.target.value;
                                                        setCurrentQuestion({ ...currentQuestion, options: newOpts });
                                                    }}
                                                    className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 transition-all font-bold pr-12"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: i.toString() })}
                                                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${currentQuestion.correctAnswer === i.toString() ? 'bg-green-500 text-black' : 'bg-white/5 text-gray-600 hover:text-white'}`}
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-8">
                                    <button type="submit" className="btn-primary flex-1 !rounded-xl !py-4 shadow-xl flex items-center justify-center gap-2">
                                        <Save size={20} /> حفظ السؤال
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 !rounded-xl !py-4">إلغاء</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
