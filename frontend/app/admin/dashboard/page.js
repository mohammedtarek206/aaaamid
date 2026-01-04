'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Video, FileText, BarChart3, Plus, Search,
    LogOut, GraduationCap, Key, Edit2, Trash2, ExternalLink,
    RefreshCw, PlayCircle, Layout, BookOpen, Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [videos, setVideos] = useState([]);
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [freeVideos, setFreeVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newData, setNewData] = useState({ grade: 1 });
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const extractDailymotionId = (input) => {
        if (!input) return '';
        const match = input.match(/(?:dailymotion\.com(?:\/video|\/embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/);
        return match ? match[1] : input.trim();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [s, v, e, r, fv] = await Promise.all([
                    api.get('/admin/students'),
                    api.get('/admin/videos'),
                    api.get('/admin/exams'),
                    api.get('/admin/results'),
                    api.get('/admin/free-videos')
                ]);
                setStudents(s.data);
                setVideos(v.data);
                setExams(e.data);
                setResults(r.data);
                setFreeVideos(fv.data);
            } catch (err) {
                if (err.response?.status === 401) router.push('/admin/login');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            // Clean Dailymotion ID if activeTab is videos
            const preparedData = { ...newData };
            if (activeTab === 'videos' && preparedData.dailymotionId) {
                preparedData.dailymotionId = extractDailymotionId(preparedData.dailymotionId);
            }

            const res = editMode
                ? await api.put(`/admin/${activeTab}/${editingId}`, preparedData)
                : await api.post(`/admin/${activeTab}`, preparedData);

            if (activeTab === 'students') setStudents(editMode ? students.map(s => s._id === editingId ? res.data : s) : [res.data, ...students]);
            if (activeTab === 'videos') setVideos(editMode ? videos.map(v => v._id === editingId ? res.data : v) : [res.data, ...videos]);
            if (activeTab === 'exams') setExams(editMode ? exams.map(e => e._id === editingId ? res.data : e) : [res.data, ...exams]);
            if (activeTab === 'free-videos') setFreeVideos(editMode ? freeVideos.map(fv => fv._id === editingId ? res.data : fv) : [res.data, ...freeVideos]);

            setShowAddModal(false);
            setEditMode(false);
            setEditingId(null);
            setNewData({ grade: 1 });
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'حدث خطأ أثناء العملية';
            alert(`خطأ: ${errorMsg}`);
        }
    };

    const resetNewData = (tab) => {
        if (tab === 'students') setNewData({ grade: 1, name: '' });
        else if (tab === 'videos') setNewData({ grade: 1, title: '', dailymotionId: '', unit: '', lesson: '' });
        else if (tab === 'exams') setNewData({ grade: 1, title: '', duration: 30, attemptsAllowed: 1 });
        else if (tab === 'free-videos') setNewData({ title: '', youtubeId: '', description: '' });
        else setNewData({ grade: 1 });
    };

    const handleEditClick = (item) => {
        setNewData(item);
        setEditingId(item._id);
        setEditMode(true);
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await api.delete(`/admin/${activeTab}/${id}`);
            if (activeTab === 'students') setStudents(students.filter(s => s._id !== id));
            if (activeTab === 'videos') setVideos(videos.filter(v => v._id !== id));
            if (activeTab === 'exams') setExams(exams.filter(e => e._id !== id));
            if (activeTab === 'results') setResults(results.filter(r => r._id !== id));
            if (activeTab === 'free-videos') setFreeVideos(freeVideos.filter(fv => fv._id !== id));
        } catch (err) {
            alert('حدث خطأ أثناء الحذف');
        }
    };

    const toggleStatus = async (id) => {
        try {
            const res = await api.patch(`/admin/students/${id}/toggle-status`);
            setStudents(students.map(s => s._id === id ? res.data : s));
        } catch (err) {
            alert('حدث خطأ أثناء تحديث الحالة');
        }
    };

    const logout = () => {
        localStorage.clear();
        router.push('/admin/login');
    };

    const getFilteredData = () => {
        const query = searchQuery.toLowerCase();
        if (activeTab === 'students') return students.filter(s => s.name?.toLowerCase().includes(query) || s.code?.toLowerCase().includes(query));
        if (activeTab === 'videos') return videos.filter(v => v.title?.toLowerCase().includes(query) || v.unit?.toLowerCase().includes(query) || v.lesson?.toLowerCase().includes(query));
        if (activeTab === 'exams') return exams.filter(e => e.title?.toLowerCase().includes(query));
        if (activeTab === 'free-videos') return freeVideos.filter(fv => fv.title?.toLowerCase().includes(query) || fv.youtubeId?.toLowerCase().includes(query));
        if (activeTab === 'results') return results.filter(r => r.studentId?.name?.toLowerCase().includes(query) || r.examId?.title?.toLowerCase().includes(query));
        return [];
    };

    const filteredData = getFilteredData();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <RefreshCw className="text-gold animate-spin" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-black flex text-white font-cairo">
            {/* Sidebar */}
            <aside className="w-[300px] border-l border-white/5 bg-[#050505] p-8 flex flex-col fixed h-full right-0">
                <div className="flex items-center gap-4 mb-16 px-2">
                    <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-lg">
                        <GraduationCap size={28} className="text-black" />
                    </div>
                    <div>
                        <div className="text-xl font-black gold-text leading-none">الإدارة</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[2px] mt-1">Amid Portal</div>
                    </div>
                </div>

                <nav className="space-y-3 flex-1">
                    {[
                        { id: 'students', label: 'إدارة الطلاب', icon: Users },
                        { id: 'videos', label: 'المحتوي المرئي', icon: Video },
                        { id: 'exams', label: 'الامتحانات', icon: FileText },
                        { id: 'results', label: 'نتائج الطلاب', icon: GraduationCap },
                        { id: 'free-videos', label: 'فيديوهات اليوتيوب', icon: PlayCircle },
                        { id: 'stats', label: 'الإحصائيات', icon: Layout },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm
                                ${activeTab === item.id
                                    ? 'bg-gold/10 text-gold border border-gold/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={logout}
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm mt-auto"
                >
                    <LogOut size={20} />
                    تسجيل الخروج
                </button>
            </aside>

            {/* Main Content */}
            <main className="mr-[300px] flex-1 p-12 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <header className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-black mb-2">
                                {activeTab === 'students' ? 'إدارة الطلاب' :
                                    activeTab === 'videos' ? 'المحتوى المرئي' :
                                        activeTab === 'exams' ? 'بنك الامتحانات' :
                                            activeTab === 'results' ? 'نتائج الطلاب' :
                                                activeTab === 'free-videos' ? 'فيديوهات اليوتيوب' :
                                                    'الإحصائيات العامة'}
                            </h2>
                            <p className="text-gray-500 font-bold">لوحة التحكم في منظومة العميد التعليمية</p>
                        </div>
                        {['students', 'videos', 'exams', 'free-videos'].includes(activeTab) && (
                            <button
                                onClick={() => { setEditMode(false); resetNewData(activeTab); setShowAddModal(true); }}
                                className="btn-primary !py-3 !px-8 !text-sm !rounded-xl"
                            >
                                <Plus size={18} /> إضافة جديد
                            </button>
                        )}
                    </header>

                    {/* Stats Summary Rows */}
                    <div className="grid grid-cols-4 gap-6 mb-12">
                        <div className="luxury-card p-6 border-white/5">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">إجمالي الطلاب</div>
                            <div className="text-3xl font-black">{students.length}</div>
                        </div>
                        <div className="luxury-card p-6 border-white/5">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">عدد الفيديوهات</div>
                            <div className="text-3xl font-black">{videos.length}</div>
                        </div>
                        <div className="luxury-card p-6 border-white/5">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">الاختبارات</div>
                            <div className="text-3xl font-black">{exams.length}</div>
                        </div>
                        <div className="luxury-card p-6 border-white/5">
                            <div className="text-gold text-xs font-bold uppercase tracking-widest mb-2">إجمالي النتائج</div>
                            <div className="text-3xl font-black gold-text">{results.length}</div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    {activeTab === 'stats' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="luxury-card p-10 bg-gold/5 border-gold/10">
                                <h4 className="text-xl font-black mb-8 flex items-center gap-3"><Users className="text-gold" /> الطلاب حسب المرحلة</h4>
                                <div className="space-y-6">
                                    {[1, 2, 3].map(g => (
                                        <div key={g} className="flex justify-between items-center">
                                            <span className="text-gray-400 font-bold">{g === 3 ? 'الثالث الثانوي' : g === 2 ? 'الثاني الثانوي' : 'الأول الثانوي'}</span>
                                            <span className="gold-text font-black text-lg">{students.filter(s => s.grade === g).length}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="luxury-card p-10 bg-white/5 border-white/5">
                                <h4 className="text-xl font-black mb-8 flex items-center gap-3"><BookOpen className="text-blue-400" /> المحتوى التعليمي</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold">إجمالي المحاضرات</span>
                                        <span className="font-black text-lg">{videos.length + freeVideos.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold">إجمالي الامتحانات</span>
                                        <span className="font-black text-lg">{exams.length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="luxury-card p-10 bg-white/5 border-white/5">
                                <h4 className="text-xl font-black mb-8 flex items-center gap-3"><Trophy className="text-yellow-400" /> التفاعل والنتائج</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold">طلاب مختبرين</span>
                                        <span className="font-black text-lg">{[...new Set(results.map(r => r.studentId?._id))].length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold">متوسط الدرجات</span>
                                        <span className="font-black text-lg text-green-500">
                                            {results.length > 0 ? Math.round((results.reduce((acc, r) => acc + (r.score / r.totalPoints), 0) / results.length) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Action Bar */}
                            <div className="flex gap-4 mb-8">
                                <div className="flex-1 relative group">
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="ابحث بالاسم أو الكود..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-white/5 p-4 pr-12 rounded-2xl focus:outline-none focus:border-gold/30 transition-all font-bold text-sm"
                                    />
                                </div>
                            </div>

                            <div className="luxury-card border-white/5 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right border-collapse">
                                        <thead className="bg-white/[0.02]">
                                            <tr>
                                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">
                                                    {activeTab === 'results' ? 'الطالب / الاختبار' : 'المعلومات'}
                                                </th>
                                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">
                                                    {activeTab === 'students' ? 'الكود التعليمي' :
                                                        activeTab === 'videos' ? 'Dailymotion ID' :
                                                            activeTab === 'free-videos' ? 'YouTube ID' :
                                                                activeTab === 'results' ? 'الدرجة' : 'الرقم التعريفي'}
                                                </th>
                                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">
                                                    {activeTab === 'free-videos' ? 'الوصف' : 'المعلومات الإضافية'}
                                                </th>
                                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">الحالة</th>
                                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest text-center">إجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((item, idx) => (
                                                <motion.tr
                                                    key={item._id}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors group"
                                                >
                                                    <td className="p-6">
                                                        <div className="font-black text-sm">{item.name || item.title || item.studentId?.name}</div>
                                                        <div className="text-[10px] text-gray-600 font-bold mt-1 uppercase">
                                                            {activeTab === 'results' ? `Exam: ${item.examId?.title}` : `ID: ${item._id.slice(-8)}`}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        {item.code ? (
                                                            <div className="inline-flex items-center gap-2 bg-gold/5 px-4 py-2 rounded-xl border border-gold/10 font-bold text-xs gold-text">
                                                                <Key size={14} />
                                                                {item.code}
                                                            </div>
                                                        ) : item.dailymotionId ? (
                                                            <span className="text-xs text-gray-500">{item.dailymotionId}</span>
                                                        ) : item.score !== undefined ? (
                                                            <div className="font-black text-gold">{item.score} / {item.totalPoints}</div>
                                                        ) : (
                                                            <span className="text-gray-700">---</span>
                                                        )}
                                                    </td>
                                                    <td className="p-6">
                                                        {activeTab === 'free-videos' ? (
                                                            <div className="text-xs text-gray-500 max-w-[200px] truncate">{item.description || '---'}</div>
                                                        ) : (
                                                            <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase text-gray-400">
                                                                {item.grade === 3 || item.examId?.grade === 3 ? 'الثالث الثانوي' :
                                                                    item.grade === 2 || item.examId?.grade === 2 ? 'الثاني الثانوي' :
                                                                        item.grade === 1 || item.examId?.grade === 1 ? 'الأول الثانوي' : '---'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-6">
                                                        {activeTab === 'students' ? (
                                                            <button
                                                                onClick={() => toggleStatus(item._id)}
                                                                className="flex items-center gap-2 hover:opacity-80 transition-all"
                                                            >
                                                                <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)] ${item.isActive !== false ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}></div>
                                                                <span className="text-xs font-bold">{item.isActive !== false ? 'نشط' : 'معطل'}</span>
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                                                                <span className="text-xs font-bold">نشط</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center justify-center gap-3">
                                                            {activeTab !== 'results' ? (
                                                                <>
                                                                    <button onClick={() => handleEditClick(item)} className="p-2.5 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                                                                    {activeTab === 'exams' && (
                                                                        <button onClick={() => router.push(`/admin/dashboard/exam/${item._id}`)} className="p-2.5 bg-gold/5 rounded-xl text-gold/50 hover:text-gold hover:bg-gold/10 transition-all font-black text-[10px]">الأسئلة</button>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <button onClick={() => window.open(`${api.defaults.baseURL}/admin/results/${item._id}/report`, '_blank')} className="p-2.5 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><ExternalLink size={16} /></button>
                                                            )}
                                                            <button onClick={() => handleDelete(item._id)} className="p-2.5 bg-red-500/5 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                            {
                                                filteredData.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="p-20 text-center italic text-gray-600">لا توجد سجلات مطابقة للبحث...</td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-[500px] luxury-card p-1 gold-gradient relative z-10 overflow-hidden shadow-2xl"
                        >
                            <div className="bg-[#020202] rounded-[31px] p-10 md:p-14">
                                <h3 className="text-2xl font-black mb-10 gold-text text-right">
                                    {editMode ? 'تعديل البيانات' : 'إضافة بيانات جديدة'}
                                </h3>
                                <form onSubmit={handleAdd} className="space-y-6 text-right">
                                    {activeTab === 'students' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pr-2">اسم الطالب الثلاثي</label>
                                                <input type="text" value={newData.name || ''} placeholder="مثال: أحمد محمد علي" onChange={e => setNewData({ ...newData, name: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 transition-all font-bold" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pr-2">المرحلة الدراسية</label>
                                                <select value={newData.grade || 1} onChange={e => setNewData({ ...newData, grade: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 transition-all font-bold appearance-none" required>
                                                    <option value="1">الأول الثانوي</option>
                                                    <option value="2">الثاني الثانوي</option>
                                                    <option value="3">الثالث الثانوي</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'videos' && (
                                        <>
                                            <input type="text" value={newData.title || ''} placeholder="عنوان المحاضرة" onChange={e => setNewData({ ...newData, title: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                            <input type="text" value={newData.dailymotionId || ''} placeholder="Dailymotion ID" onChange={e => setNewData({ ...newData, dailymotionId: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" value={newData.unit || ''} placeholder="الوحدة" onChange={e => setNewData({ ...newData, unit: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                                <input type="text" value={newData.lesson || ''} placeholder="الدرس" onChange={e => setNewData({ ...newData, lesson: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                            </div>
                                            <select value={newData.grade || 1} onChange={e => setNewData({ ...newData, grade: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required>
                                                <option value="1">الأول الثانوي</option>
                                                <option value="2">الثاني الثانوي</option>
                                                <option value="3">الثالث الثانوي</option>
                                            </select>
                                        </>
                                    )}

                                    {activeTab === 'exams' && (
                                        <>
                                            <input type="text" value={newData.title || ''} placeholder="عنوان الامتحان" onChange={e => setNewData({ ...newData, title: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="number" value={newData.duration || ''} placeholder="المدة (بالدقائق)" onChange={e => setNewData({ ...newData, duration: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                                <input type="number" value={newData.attemptsAllowed || 1} placeholder="المحاولات" onChange={e => setNewData({ ...newData, attemptsAllowed: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                            </div>
                                            <select value={newData.grade || 1} onChange={e => setNewData({ ...newData, grade: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required>
                                                <option value="1">الأول الثانوي</option>
                                                <option value="2">الثاني الثانوي</option>
                                                <option value="3">الثالث الثانوي</option>
                                            </select>
                                        </>
                                    )}

                                    {activeTab === 'free-videos' && (
                                        <>
                                            <input type="text" value={newData.title || ''} placeholder="عنوان الفيديو" onChange={e => setNewData({ ...newData, title: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                            <input type="text" value={newData.youtubeId || ''} placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" onChange={e => setNewData({ ...newData, youtubeId: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                            <textarea value={newData.description || ''} placeholder="وصف الفيديو" onChange={e => setNewData({ ...newData, description: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold h-24" />
                                        </>
                                    )}

                                    <div className="flex gap-4 pt-6">
                                        <button type="submit" className="btn-primary flex-1 !rounded-xl !py-4 shadow-xl">
                                            {editMode ? 'تحديث البيانات' : 'حفظ البيانات'}
                                        </button>
                                        <button type="button" onClick={() => { setShowAddModal(false); setEditMode(false); }} className="btn-outline flex-1 !rounded-xl !py-4">إلغاء</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
