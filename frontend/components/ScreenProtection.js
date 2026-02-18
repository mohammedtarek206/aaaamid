'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ScreenProtection() {
    const router = useRouter();
    const [studentInfo, setStudentInfo] = useState(null);
    const blackoutRef = useRef(null);

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

        // Immediate Blackout Function (Bypasses React State for Speed)
        const triggerBlackout = () => {
            if (blackoutRef.current) {
                blackoutRef.current.style.display = 'flex';
            }
        };

        const removeBlackout = () => {
            if (blackoutRef.current) {
                blackoutRef.current.style.display = 'none';
            }
        };

        const handleViolation = async (type) => {
            try {
                triggerBlackout(); // Immediate local penalty
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
            const isAdminPath = window.location.pathname.startsWith('/admin');

            if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 's') || (e.metaKey && e.shiftKey)) {
                e.preventDefault();
                handleViolation('screenshot');
            }

            // Allow Ctrl+P and Print only on Admin Dashboard
            if (e.ctrlKey && e.key === 'p') {
                if (!isAdminPath) {
                    e.preventDefault();
                    handleViolation('screenshot');
                }
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

        // 5. Aggressive Visibility/Blur Detection (Instant Blackout)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerBlackout(); // Immediate blackout
            } else {
                // Keep blackout for 1 second to punish/deter
                setTimeout(removeBlackout, 500);
            }
        };

        const handleWindowBlur = () => {
            // Often triggers when screenshot UI overlay appears
            triggerBlackout();
        };

        const handleWindowFocus = () => {
            removeBlackout();
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('selectstart', handleSelectStart);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });

        // Critical Events for Mobile
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);
        document.addEventListener('freeze', triggerBlackout); // Experimental
        document.addEventListener('resume', removeBlackout); // Experimental

        const isAdminPath = window.location.pathname.startsWith('/admin');
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
                -webkit-user-drag: none !important;
            }
            img, video {
                pointer-events: none !important;
                user-drag: none !important;
            }
            @media print {
                ${isAdminPath ? '' : 'html, body { display: none !important; }'}
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
            document.removeEventListener('freeze', triggerBlackout);
            document.removeEventListener('resume', removeBlackout);
            if (document.head.contains(style)) document.head.removeChild(style);
        };
    }, [router]);

    return (
        <>
            {/* Instant Blackout Overlay (Direct DOM Control) */}
            <div
                ref={blackoutRef}
                style={{ display: 'none' }}
                className="fixed inset-0 bg-black z-[10000] flex items-center justify-center text-center p-10"
            >
                <div className="text-white">
                    <div className="text-4xl font-bold mb-4">⚠️</div>
                    <div className="text-xl font-bold mb-2">محاولة تصوير محظورة!</div>
                    <div className="text-sm opacity-70">يمنع استخدام أدوات التصوير أو الخروج من التطبيق.</div>
                </div>
            </div>

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
