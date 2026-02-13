'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ScreenProtection() {
    const router = useRouter();
    const [studentInfo, setStudentInfo] = useState(null);
    const [blackout, setBlackout] = useState(false);

    useEffect(() => {
        // Fetch student info for watermark
        const fetchStudent = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await api.get('/student/profile');
                    setStudentInfo(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch student profile", err);
            }
        };
        fetchStudent();

        const handleViolation = async (type) => {
            try {
                setBlackout(true); // Immediate local penalty
                if (localStorage.getItem('token')) {
                    await api.post('/student/violation', { type });
                    alert('تم حظر الحساب لمحاولة تصوير المحتوى. يرجى التواصل مع الدعم الفني.');
                    localStorage.removeItem('token');
                    router.push('/login');
                } else {
                    alert('ممنوع تصوير المحتوى!');
                }
            } catch (err) {
                console.error(err);
            }
        };

        // 1. Disable Right Click
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // 2. Disable Print Screen / Special Keys
        const handleKeyDown = (e) => {
            if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || (e.ctrlKey && e.key === 's') || (e.metaKey && e.shiftKey)) {
                e.preventDefault();
                handleViolation('screenshot');
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'PrintScreen') {
                handleViolation('screenshot');
            }
        };

        // 3. Prevent Copy/Select/Drag
        const handleSelectStart = (e) => {
            e.preventDefault();
        };

        // 4. Mobile Specific: Prevent Long Press & Touch Callouts
        const handleTouchStart = (e) => {
            if (e.touches.length > 1) {
                // Prevent multi-touch (often used for gestures)
                e.preventDefault();
            }
        };

        // 5. Detection of "Blur" (App switching/Control Center/Screenshot UI)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setBlackout(true); // Immediate blackout
            } else {
                // Optional: Keep blackout for a moment to annoy user or if strict mode
                setBlackout(false);
            }
        };

        const handleWindowBlur = () => {
            // Often triggers when screenshot UI overlay appears
            setBlackout(true);
        };

        const handleWindowFocus = () => {
            setBlackout(false);
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('selectstart', handleSelectStart);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        // Apply strict CSS for mobile
        const style = document.createElement('style');
        style.innerHTML = `
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      img, video {
        pointer-events: none !important;
      }
      @media print {
        html, body { display: none !important; }
      }
    `;
        document.head.appendChild(style);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('selectstart', handleSelectStart);
            window.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
            if (document.head.contains(style)) document.head.removeChild(style);
        };
    }, [router]);

    return (
        <>
            {/* Blackout Overlay */}
            {blackout && (
                <div className="fixed inset-0 bg-black z-[10000] flex items-center justify-center text-center p-10">
                    <div className="text-white">
                        <div className="text-4xl font-bold mb-4">⚠️</div>
                        <div className="text-xl font-bold mb-2">محاولة تصوير محظورة!</div>
                        <div className="text-sm opacity-70">يمنع استخدام أدوات التصوير أو الخروج من التطبيق أثناء المشاهدة.</div>
                    </div>
                </div>
            )}

            {/* Watermark Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden flex flex-wrap content-between justify-between p-10 opacity-[0.05]">
                {/* Dynamic Watermark Grid to cover screen against phone capture */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="transform -rotate-45 text-xl font-black text-gray-500 whitespace-nowrap select-none">
                        {studentInfo ? `${studentInfo.name || 'Student'} • ${studentInfo.code} • ${studentInfo.phone}` : 'العميد - El Amid Platform'}
                    </div>
                ))}
            </div>
        </>
    );
}
