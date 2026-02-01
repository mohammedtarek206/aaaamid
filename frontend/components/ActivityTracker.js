'use client';

import { useEffect } from 'react';
import api from '@/lib/api';

export default function ActivityTracker() {
    useEffect(() => {
        // Only run if there is a student token
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;

        // Don't track if admin (dashboard path usually contains /admin)
        if (window.location.pathname.startsWith('/admin')) return;

        const logHeartbeat = async () => {
            try {
                await api.post('/student/activity/log', {
                    action: 'heartbeat',
                    details: 'تواجد نشط على المنصة'
                });
            } catch (err) {
                // Silently fail, don't interrupt user experience
                // console.warn('Heartbeat log failed');
            }
        };

        // Initial log
        logHeartbeat();

        // Every 5 minutes
        const interval = setInterval(logHeartbeat, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return null; // This component doesn't render anything
}
