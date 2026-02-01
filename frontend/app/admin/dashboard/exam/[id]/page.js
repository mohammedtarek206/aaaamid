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
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkCount, setBulkCount] = useState(1);
    const [bulkAnswers, setBulkAnswers] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [e, q] = await Promise.all([
                    api.get(`/admin/exams/${examId}`),
                    api.get(`/admin/exams/${examId}/questions`)
                ]);
                setExam(e.data);
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="luxury-card p-6 border-dashed border-gold/30 flex items-center justify-center gap-4 hover:bg-gold/5 transition-all group h-full"
                    >
                        <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <span className="text-xl font-black">إضافة سؤال منفرد</span>
                    </button>

                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="luxury-card p-6 border-dashed border-blue-500/30 flex items-center justify-center gap-4 hover:bg-blue-500/5 transition-all group h-full"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <HelpCircle size={24} />
                        </div>
                        <span className="text-xl font-black">توليد أسئلة سريعة (Drive)</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
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

            {/* Bulk Setup Modal - Premium Redesign */}
            <AnimatePresence>
                {showBulkModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12 bg-black/90 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="w-full max-w-5xl bg-[#020202] border border-blue-500/30 rounded-[45px] p-8 md:p-12 max-h-[90vh] flex flex-col shadow-[0_0_100px_rgba(59,130,246,0.15)] relative overflow-hidden"
                        >
                            {/* Decorative Glow */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

                            <div className="flex flex-col md:flex-row justify-between items-center mb-10 shrink-0 gap-6 relative z-10">
                                <div className="text-right">
                                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-blue-600">توليد الأسئلة السريع</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest bg-white/5 px-3 py-1 rounded-lg inline-block">Digital Answer Sheet Generator</p>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black text-gray-500 mr-2">عدد الأسئلة:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={bulkCount}
                                        onChange={e => setBulkCount(parseInt(e.target.value) || 1)}
                                        className="bg-black/80 border border-blue-500/20 p-3 rounded-xl w-24 focus:outline-none focus:border-blue-500 transition-all text-center font-black text-blue-400"
                                    />
                                    <button onClick={() => setShowBulkModal(false)} className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 mb-10 scrollbar-custom relative z-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {Array.from({ length: bulkCount }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.01 }}
                                            className={`p-5 rounded-[32px] flex flex-col items-center gap-5 transition-all border group
                                                ${bulkAnswers[i] !== undefined ? 'bg-blue-600/[0.03] border-blue-500/20 shadow-lg' : 'bg-white/[0.03] border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${bulkAnswers[i] !== undefined ? 'bg-blue-500 animate-pulse' : 'bg-gray-700'}`}></div>
                                                <span className={`text-xs font-black ${bulkAnswers[i] !== undefined ? 'text-blue-400' : 'text-gray-500'}`}>السؤال {i + 1}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {['A', 'B', 'C', 'D'].map((opt, oIdx) => (
                                                    <button
                                                        key={oIdx}
                                                        onClick={() => setBulkAnswers({ ...bulkAnswers, [i]: oIdx.toString() })}
                                                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all flex items-center justify-center border
                                                            ${bulkAnswers[i] === oIdx.toString()
                                                                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_4px_15px_rgba(59,130,246,0.3)]'
                                                                : 'bg-black/40 text-gray-400 border-white/5 hover:border-blue-500/30 hover:text-blue-400'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="shrink-0 relative z-10">
                                <button
                                    onClick={async () => {
                                        if (Object.keys(bulkAnswers).length < bulkCount) {
                                            if (!confirm('لم تقم بتحديد إجابات لجميع الأسئلة. سيتم تعيين A كإجابة تلقائية للباقي. هل تريد الاستمرار؟')) return;
                                        }
                                        try {
                                            const bulkData = Array.from({ length: bulkCount }).map((_, i) => ({
                                                text: `سؤال رقم ${i + 1}`,
                                                options: ['A', 'B', 'C', 'D'],
                                                correctAnswer: bulkAnswers[i] || '0',
                                                points: 1
                                            }));
                                            const res = await api.post(`/admin/exams/${examId}/questions/bulk`, { questions: bulkData });
                                            setQuestions([...questions, ...res.data]);
                                            setShowBulkModal(false);
                                            setBulkAnswers({});
                                        } catch (err) { alert('خطأ في توليد الأسئلة'); }
                                    }}
                                    className="w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-black py-5 rounded-[28px] shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Save size={20} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] opacity-70 leading-none mb-1 font-bold">توليد {bulkCount} سؤال</div>
                                        <div className="text-lg">تثبيت ورقة الإجابة الآن</div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
