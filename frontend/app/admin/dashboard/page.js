'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Video, FileText, BarChart3, Plus, Search,
    LogOut, GraduationCap, Key, Edit2, Trash2, ExternalLink,
    RefreshCw, PlayCircle, Layout, BookOpen, Trophy, Phone
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
    const [selectedResult, setSelectedResult] = useState(null);
    const [selectedExamQuestions, setSelectedExamQuestions] = useState([]);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [genData, setGenData] = useState({ count: 10, grade: 1, track: 'عام' });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activities, setActivities] = useState([]);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showAnswersModal, setShowAnswersModal] = useState(false);
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
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('token');
                    router.push('/admin/login');
                }
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

    const [statusLoading, setStatusLoading] = useState({});

    const toggleStatus = async (id) => {
        setStatusLoading(prev => ({ ...prev, [id]: true }));
        try {
            const res = await api.patch(`/admin/students/${id}/toggle-status`);
            setStudents(students.map(s => s._id === id ? res.data : s));
        } catch (err) {
            console.error('Toggle Status Error:', err.response?.data || err);
            const errorMsg = err.response?.data?.error || 'حدث خطأ أثناء تحديث الحالة - تأكد من صلاحيات الأدمن';
            alert(errorMsg);
        } finally {
            setStatusLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleGenerateCodes = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/students/generate', genData);
            setStudents([...res.data, ...students]);
            setShowGenerateModal(false);
            alert(`تم توليد ${res.data.length} كود بنجاح`);
        } catch (err) {
            alert('خطأ في توليد الأكواد');
        }
    };

    const fetchActivity = async (student) => {
        try {
            const res = await api.get(`/admin/students/${student._id}/activity`);
            setSelectedStudent(res.data.student);
            setActivities(res.data.activities);
            setShowActivityModal(true);
        } catch (err) {
            alert('خطأ في تحميل النشاط');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const logout = () => {
        localStorage.clear();
        router.push('/admin/login');
    };

    const fetchResultDetails = async (result) => {
        try {
            const res = await api.get(`/admin/exams/${result.examId._id}/questions`);
            setSelectedExamQuestions(res.data);
            setSelectedResult(result);
            setShowAnswersModal(true);
        } catch (err) {
            alert('حدث خطأ أثناء تحميل تفاصيل الامتحان');
        }
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
            <aside className="w-[300px] border-l border-white/5 bg-[#050505] p-8 flex flex-col fixed h-full right-0 no-print">
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
            <main className="mr-[300px] flex-1 p-12 overflow-y-auto no-print">
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
                        {['videos', 'exams', 'free-videos'].includes(activeTab) && (
                            <button
                                onClick={() => { setEditMode(false); resetNewData(activeTab); setShowAddModal(true); }}
                                className="btn-primary !py-3 !px-8 !text-sm !rounded-xl"
                            >
                                <Plus size={18} /> إضافة جديد
                            </button>
                        )}
                        {activeTab === 'students' && (
                            <div className="flex gap-4">
                                <button
                                    onClick={handlePrint}
                                    className="btn-outline !py-3 !px-8 !text-sm !rounded-xl !border-blue-500/30 !text-blue-400 hover:!bg-blue-500/10"
                                >
                                    <FileText size={18} /> طباعة الأكواد
                                </button>
                                <button
                                    onClick={() => setShowGenerateModal(true)}
                                    className="btn-primary !py-3 !px-8 !text-sm !rounded-xl gold-gradient !text-black"
                                >
                                    <Key size={18} /> توليد أكواد تلقائي
                                </button>
                            </div>
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
                                                {activeTab === 'students' && (
                                                    <>
                                                        <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest text-center">رقم الهاتف</th>
                                                        <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest text-center">ولي الأمر</th>
                                                        <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest text-center">الشعبة</th>
                                                    </>
                                                )}
                                                {(activeTab === 'videos' || activeTab === 'exams') && (
                                                    <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest text-center">الشعبة</th>
                                                )}
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
                                                    {activeTab === 'students' && (
                                                        <>
                                                            <td className="p-6 text-center text-xs font-bold text-gray-400">{item.phone || '---'}</td>
                                                            <td className="p-6 text-center text-xs font-bold text-gray-400">{item.parentPhone || '---'}</td>
                                                            <td className="p-6 text-center">
                                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${item.track === 'علمي' ? 'bg-blue-500/10 text-blue-500' : item.track === 'أدبي' ? 'bg-purple-500/10 text-purple-500' : 'bg-gold/10 text-gold'}`}>
                                                                    {item.track || 'عام'}
                                                                </span>
                                                            </td>
                                                        </>
                                                    )}
                                                    {(activeTab === 'videos' || activeTab === 'exams') && (
                                                        <td className="p-6 text-center">
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${item.track === 'علمي' ? 'bg-blue-500/10 text-blue-500' : item.track === 'أدبي' ? 'bg-purple-500/10 text-purple-500' : 'bg-gold/10 text-gold'}`}>
                                                                {item.track || 'عام'}
                                                            </span>
                                                        </td>
                                                    )}
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
                                                                disabled={statusLoading[item._id]}
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${item.isActive !== false
                                                                    ? 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20'
                                                                    : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                                                                    } ${statusLoading[item._id] ? 'opacity-50 cursor-wait' : ''}`}
                                                            >
                                                                {statusLoading[item._id] ? (
                                                                    <RefreshCw size={14} className="animate-spin" />
                                                                ) : (
                                                                    <div className={`w-2 h-2 rounded-full ${item.isActive !== false ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}></div>
                                                                )}
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
                                                            {activeTab === 'students' && (
                                                                <>
                                                                    <button onClick={() => fetchActivity(item)} className="p-2.5 bg-blue-500/5 rounded-xl text-blue-500/50 hover:text-blue-500 hover:bg-blue-500/10 transition-all" title="تواجد الطالب"><BarChart3 size={16} /></button>
                                                                    <button onClick={() => { setSelectedStudent(item); setShowPermissionsModal(true); }} className="p-2.5 bg-gold/5 rounded-xl text-gold/50 hover:text-gold hover:bg-gold/10 transition-all" title="الصلاحيات"><BookOpen size={16} /></button>
                                                                </>
                                                            )}
                                                            {activeTab !== 'results' ? (
                                                                <>
                                                                    <button onClick={() => handleEditClick(item)} className="p-2.5 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                                                                    {activeTab === 'exams' && (
                                                                        <button onClick={() => router.push(`/admin/dashboard/exam/${item._id}`)} className="p-2.5 bg-gold/5 rounded-xl text-gold/50 hover:text-gold hover:bg-gold/10 transition-all font-black text-[10px]">الأسئلة</button>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div className="flex items-center gap-3">
                                                                    <button onClick={() => fetchResultDetails(item)} className="p-2.5 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all flex items-center gap-2">
                                                                        <ExternalLink size={16} />
                                                                        <span className="text-[10px] font-bold">عرض الإجابات</span>
                                                                    </button>
                                                                </div>
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
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pr-2">اسم الطالب رباعي</label>
                                                <input type="text" value={newData.name || ''} placeholder="مثال: أحمد محمد علي حسن" onChange={e => setNewData({ ...newData, name: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 transition-all font-bold" required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pr-2">رقم الهاتف</label>
                                                    <input type="tel" value={newData.phone || ''} placeholder="01xxxxxxxxx" onChange={e => setNewData({ ...newData, phone: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 transition-all font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pr-2">هاتف ولي الأمر</label>
                                                    <input type="tel" value={newData.parentPhone || ''} placeholder="01xxxxxxxxx" onChange={e => setNewData({ ...newData, parentPhone: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 transition-all font-bold" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pr-2">المرحلة</label>
                                                    <select
                                                        value={newData.grade || 1}
                                                        onChange={e => {
                                                            const grade = parseInt(e.target.value);
                                                            setNewData({ ...newData, grade, track: grade === 1 ? 'عام' : (newData.track || 'عام') });
                                                        }}
                                                        className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 transition-all font-bold appearance-none text-white [&>option]:bg-[#020202]"
                                                    >
                                                        <option value="1">الأول الثانوي</option>
                                                        <option value="2">الثاني الثانوي</option>
                                                        <option value="3">الثالث الثانوي</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pr-2">الشعبة</label>
                                                    <select
                                                        value={newData.track || 'عام'}
                                                        onChange={e => setNewData({ ...newData, track: e.target.value })}
                                                        disabled={newData.grade === 1}
                                                        className={`w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 transition-all font-bold appearance-none text-white [&>option]:bg-[#020202] ${newData.grade === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <option value="عام">عام</option>
                                                        <option value="علمي">علمي</option>
                                                        <option value="أدبي">أدبي</option>
                                                    </select>
                                                </div>
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
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase pr-2">المرحلة</label>
                                                    <select
                                                        value={newData.grade || 1}
                                                        onChange={e => {
                                                            const grade = parseInt(e.target.value);
                                                            setNewData({ ...newData, grade, track: grade === 1 ? 'عام' : (newData.track || 'عام') });
                                                        }}
                                                        className="w-full bg-[#0a0a0a] border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold appearance-none"
                                                    >
                                                        <option value="1">الأول الثانوي</option>
                                                        <option value="2">الثاني الثانوي</option>
                                                        <option value="3">الثالث الثانوي</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase pr-2">الشعبة</label>
                                                    <select
                                                        value={newData.track || 'عام'}
                                                        onChange={e => setNewData({ ...newData, track: e.target.value })}
                                                        disabled={newData.grade === 1}
                                                        className={`w-full bg-[#0a0a0a] border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold appearance-none ${newData.grade === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <option value="عام">عام</option>
                                                        <option value="علمي">علمي</option>
                                                        <option value="أدبي">أدبي</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'exams' && (
                                        <>
                                            <input type="text" value={newData.title || ''} placeholder="عنوان الامتحان" onChange={e => setNewData({ ...newData, title: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                            <input type="text" value={newData.driveLink || ''} placeholder="رابط ملف الامتحان (Google Drive)" onChange={e => setNewData({ ...newData, driveLink: e.target.value })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="number" value={newData.duration || ''} placeholder="المدة (بالدقائق)" onChange={e => setNewData({ ...newData, duration: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                                <input type="number" value={newData.attemptsAllowed || 1} placeholder="المحاولات" onChange={e => setNewData({ ...newData, attemptsAllowed: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold" required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase pr-2">المرحلة</label>
                                                    <select
                                                        value={newData.grade || 1}
                                                        onChange={e => {
                                                            const grade = parseInt(e.target.value);
                                                            setNewData({ ...newData, grade, track: grade === 1 ? 'عام' : (newData.track || 'عام') });
                                                        }}
                                                        className="w-full bg-[#0a0a0a] border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold appearance-none"
                                                    >
                                                        <option value="1">الأول الثانوي</option>
                                                        <option value="2">الثاني الثانوي</option>
                                                        <option value="3">الثالث الثانوي</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase pr-2">الشعبة</label>
                                                    <select
                                                        value={newData.track || 'عام'}
                                                        onChange={e => setNewData({ ...newData, track: e.target.value })}
                                                        disabled={newData.grade === 1}
                                                        className={`w-full bg-[#0a0a0a] border border-white/5 p-4 rounded-xl focus:outline-none focus:border-gold/30 font-bold appearance-none ${newData.grade === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <option value="عام">عام</option>
                                                        <option value="علمي">علمي</option>
                                                        <option value="أدبي">أدبي</option>
                                                    </select>
                                                </div>
                                            </div>
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
            <AnimatePresence>
                {/* View Answers Modal */}
                {showAnswersModal && selectedResult && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAnswersModal(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="w-full max-w-[800px] h-[80vh] bg-[#050505] border border-white/5 rounded-[40px] relative z-10 flex flex-col overflow-hidden shadow-2xl"
                        >
                            <div className="p-10 border-b border-white/5 flex justify-between items-center shrink-0">
                                <div className="text-right">
                                    <h3 className="text-2xl font-black gold-text mb-2">إجابات الطالب: {selectedResult.studentId?.name}</h3>
                                    <div className="text-xs text-gray-500 font-bold">{selectedResult.examId?.title} • الدرجة: {selectedResult.score} / {selectedResult.totalPoints}</div>
                                </div>
                                <button onClick={() => setShowAnswersModal(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-custom">
                                {selectedExamQuestions.map((q, idx) => {
                                    const studentAnswer = selectedResult.answers.find(a => a.questionId === q._id);
                                    return (
                                        <div key={q._id} className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5">
                                            <div className="flex items-start gap-6 mb-6">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${studentAnswer?.isCorrect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {idx + 1}
                                                </div>
                                                <p className="text-lg font-bold leading-relaxed">{q.text}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-16">
                                                {q.options.map((opt, oIdx) => {
                                                    const isSelected = studentAnswer?.selectedAnswer === oIdx.toString();
                                                    const isCorrectOpt = q.correctAnswer === oIdx.toString();

                                                    let variantClass = "bg-white/5 text-gray-500 border-white/0";
                                                    if (isSelected && studentAnswer?.isCorrect) variantClass = "bg-green-500/10 text-green-500 border-green-500/30 border";
                                                    if (isSelected && !studentAnswer?.isCorrect) variantClass = "bg-red-500/10 text-red-500 border-red-500/30 border";
                                                    if (!isSelected && isCorrectOpt) variantClass = "bg-green-500/5 text-green-500/60 border-green-500/10 border dashed";

                                                    return (
                                                        <div key={oIdx} className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${variantClass}`}>
                                                            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] shrink-0">
                                                                {String.fromCharCode(65 + oIdx)}
                                                            </div>
                                                            {opt}
                                                            {isSelected && (studentAnswer?.isCorrect ? ' ✓' : ' ✗')}
                                                            {!isSelected && isCorrectOpt && ' (الإجابة الصحيحة)'}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Batch Generate Modal */}
                {showGenerateModal && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 font-cairo">
                            <h3 className="text-2xl font-black gold-text mb-8 text-right">توليد أكواد تلقائي</h3>
                            <form onSubmit={handleGenerateCodes} className="space-y-6 text-right">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 pr-2">عدد الأكواد</label>
                                    <input type="number" value={genData.count} onChange={e => setGenData({ ...genData, count: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:border-gold/30 outline-none font-bold" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 pr-2">المرحلة الدراسية</label>
                                    <select
                                        value={genData.grade}
                                        onChange={e => {
                                            const grade = parseInt(e.target.value);
                                            setGenData({ ...genData, grade, track: grade === 1 ? 'عام' : genData.track });
                                        }}
                                        className="w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:border-gold/30 outline-none font-bold appearance-none [&>option]:bg-black"
                                    >
                                        <option value="1">الأول الثانوي</option>
                                        <option value="2">الثاني الثانوي</option>
                                        <option value="3">الثالث الثانوي</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 pr-2">الشعبة (للثاني والثالث)</label>
                                    <select
                                        value={genData.track}
                                        onChange={e => setGenData({ ...genData, track: e.target.value })}
                                        disabled={genData.grade === 1}
                                        className={`w-full bg-white/5 border border-white/5 p-4 rounded-xl focus:border-gold/30 outline-none font-bold appearance-none [&>option]:bg-black ${genData.grade === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="عام">عام</option>
                                        <option value="علمي">علمي</option>
                                        <option value="أدبي">أدبي</option>
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button type="submit" className="btn-primary flex-1 !rounded-2xl !py-4 gold-gradient !text-black">توليد الآن</button>
                                    <button type="button" onClick={() => setShowGenerateModal(false)} className="btn-outline flex-1 !rounded-2xl !py-4">إلغاء</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Student Activity Modal */}
                {showActivityModal && selectedStudent && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-full max-w-3xl h-[85vh] bg-[#050505] border border-white/5 rounded-[40px] relative z-10 flex flex-col overflow-hidden shadow-2xl font-cairo"
                        >
                            {/* Modal Header */}
                            <div className="p-10 border-b border-white/5 flex justify-between items-center shrink-0 bg-gradient-to-l from-white/[0.02] to-transparent">
                                <button onClick={() => setShowActivityModal(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all font-black">✕</button>
                                <div className="text-right">
                                    <h3 className="text-2xl font-black gold-text mb-1">{selectedStudent.name || 'طالب مجهول'}</h3>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[2px]">Student Comprehensive Health & Activity Report</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-custom">
                                {/* Profile Quick Info Card */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'الكود التعليمي', val: selectedStudent.code, icon: <Key size={14} /> },
                                        { label: 'رقم الهاتف', val: selectedStudent.phone || 'غير مسجل', icon: <ExternalLink size={14} /> },
                                        { label: 'ولي الأمر', val: selectedStudent.parentPhone || 'غير مسجل', icon: <Users size={14} /> },
                                        { label: 'إجمالي التفاعل', val: `${Math.round((activities.filter(a => a.action === 'heartbeat').length * 5) / 60)} ساعة`, icon: <RefreshCw size={14} /> }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/5 p-5 rounded-3xl text-center flex flex-col items-center gap-2 group hover:border-gold/20 transition-all">
                                            <div className="text-gold opacity-40 group-hover:opacity-100 transition-opacity">{stat.icon}</div>
                                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</div>
                                            <div className="text-sm font-black">{stat.val}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Accessible Content Summary */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black gold-text uppercase tracking-widest flex items-center justify-end gap-3">
                                            المحتوى المتاح حالياً <BookOpen size={16} />
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedStudent.accessibleVideos?.length > 0 || selectedStudent.accessibleExams?.length > 0 ? (
                                                <>
                                                    {selectedStudent.accessibleVideos?.map(v => (
                                                        <div key={v._id} className="flex items-center gap-4 bg-green-500/5 border border-green-500/10 p-4 rounded-2xl">
                                                            <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                                            <div className="flex-1 text-right">
                                                                <div className="text-sm font-bold text-green-500/80">{v.title}</div>
                                                                <div className="text-[8px] font-black text-gray-600 uppercase">Video Lecture • {v.unit}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {selectedStudent.accessibleExams?.map(e => (
                                                        <div key={e._id} className="flex items-center gap-4 bg-gold/5 border border-gold/10 p-4 rounded-2xl">
                                                            <div className="w-1 h-1 rounded-full bg-gold"></div>
                                                            <div className="flex-1 text-right">
                                                                <div className="text-sm font-bold gold-text">{e.title}</div>
                                                                <div className="text-[8px] font-black text-gray-600 uppercase">Final Assessment • {e.duration} MIN</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="text-center py-6 text-xs font-bold text-gray-700 italic">لا يوجد محتوى متاح لهذا الطالب حالياً</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Logs */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black gold-text uppercase tracking-widest flex items-center justify-end gap-3">
                                            سجل التواجد والنشاط <BarChart3 size={16} />
                                        </h4>
                                        <div className="space-y-3 relative before:absolute before:right-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                                            {activities.length === 0 ? (
                                                <div className="text-center py-10 text-xs font-bold text-gray-700">لا يوجد نشاط مسجل</div>
                                            ) : (
                                                activities.map((act, i) => (
                                                    <div key={i} className="relative pr-10">
                                                        <div className={`absolute right-2 top-2 w-[14px] h-[14px] rounded-full border-2 border-[#050505] z-10 
                                                            ${act.action === 'login' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                                                                act.action === 'view_video' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                                                                    act.action === 'submit_exam' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/20'}`}>
                                                        </div>
                                                        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-1 items-end group hover:bg-white/5 transition-colors">
                                                            <div className="text-[10px] font-black tracking-widest">
                                                                {act.action === 'login' && 'تسجيل دخول'}
                                                                {act.action === 'view_video' && 'مشاهدة محاضرة'}
                                                                {act.action === 'start_exam' && 'بدأ اختبار'}
                                                                {act.action === 'submit_exam' && 'تسليم إجابات'}
                                                                {act.action === 'heartbeat' && 'التواجد النشط'}
                                                            </div>
                                                            <div className="text-[8px] font-black text-gray-600">{new Date(act.timestamp).toLocaleString('ar-EG')}</div>
                                                            {act.details && <div className="text-[10px] text-gray-500 mt-2 italic">"{act.details}"</div>}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Permissions Modal */}
                {showPermissionsModal && selectedStudent && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 max-h-[80vh] flex flex-col font-cairo">
                            <h3 className="text-2xl font-black gold-text mb-8 text-right">صلاحيات الطالب</h3>
                            <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                                <div>
                                    <h4 className="text-sm font-black text-gray-500 mb-4 text-right">الفيديوهات المتاحة ({selectedStudent.grade})</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {videos.filter(v => v.grade === selectedStudent.grade).map(v => (
                                            <label key={v._id} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudent.accessibleVideos?.includes(v._id)}
                                                    onChange={async (e) => {
                                                        const newVids = e.target.checked
                                                            ? [...(selectedStudent.accessibleVideos || []), v._id]
                                                            : (selectedStudent.accessibleVideos || []).filter(id => id !== v._id);
                                                        try {
                                                            const res = await api.patch(`/admin/students/${selectedStudent._id}/permissions`, { accessibleVideos: newVids });
                                                            setSelectedStudent(res.data);
                                                            setStudents(students.map(s => s._id === res.data._id ? res.data : s));
                                                        } catch (err) { alert('خطأ في تحديث الصلاحيات'); }
                                                    }}
                                                    className="w-5 h-5 accent-gold"
                                                />
                                                <span className="flex-1 text-right font-bold text-sm">{v.title}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-500 mb-4 text-right">الامتحانات المتاحة ({selectedStudent.grade})</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {exams.filter(e => e.grade === selectedStudent.grade).map(ex => (
                                            <label key={ex._id} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudent.accessibleExams?.includes(ex._id)}
                                                    onChange={async (e) => {
                                                        const newEx = e.target.checked
                                                            ? [...(selectedStudent.accessibleExams || []), ex._id]
                                                            : (selectedStudent.accessibleExams || []).filter(id => id !== ex._id);
                                                        try {
                                                            const res = await api.patch(`/admin/students/${selectedStudent._id}/permissions`, { accessibleExams: newEx });
                                                            setSelectedStudent(res.data);
                                                            setStudents(students.map(s => s._id === res.data._id ? res.data : s));
                                                        } catch (err) { alert('خطأ في تحديث الصلاحيات'); }
                                                    }}
                                                    className="w-5 h-5 accent-gold"
                                                />
                                                <span className="flex-1 text-right font-bold text-sm">{ex.title}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowPermissionsModal(false)} className="btn-primary mt-8 !rounded-2xl !py-4">إغلاق</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Hidden Print Area - Premium Black & Gold ID Cards */}
            <div id="print-area">
                <div className="print-grid">
                    {filteredData.filter(s => s.code).map((student, i) => (
                        <div key={i} className={`print-card ${student.grade === 3 ? 'theme-gold' :
                            student.grade === 2 ? 'theme-silver' :
                                'theme-bronze'
                            }`}>

                            {/* Metallic Sidebar */}
                            <div className="print-card-sidebar">
                                <div className="print-photo-box">
                                    <Users size={24} className="text-white/50" />
                                </div>
                                <div className="print-card-sidebar-text">
                                    AL-AMID PORTAL
                                </div>
                            </div>

                            {/* Main Body */}
                            <div className="print-card-body" style={{ direction: 'rtl' }}>
                                <div className="print-header">
                                    <div className="print-title accent-text flex items-center gap-2">
                                        <GraduationCap size={16} /> منظومة العميد التعليمية
                                    </div>
                                </div>

                                <div className="print-student-name">{student.name}</div>

                                <div className="print-details">
                                    <span className="print-tag text-white">
                                        {student.grade === 3 ? 'الصف الثالث الثانوي' :
                                            student.grade === 2 ? 'الصف الثاني الثانوي' :
                                                'الصف الأول الثانوي'}
                                    </span>
                                    {student.track && (
                                        <span className="print-tag text-white">
                                            {student.track}
                                        </span>
                                    )}
                                </div>

                                <div className="print-code">{student.code}</div>

                                <div className="print-footer">
                                    الدعم الفني: <span className="accent-text" style={{ direction: 'ltr' }}>01284621015</span> <Phone size={10} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
