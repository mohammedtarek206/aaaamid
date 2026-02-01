import './globals.css';
import Footer from '@/components/Footer';
import ActivityTracker from '@/components/ActivityTracker';

export const metadata = {
    title: 'العميد - منصة الرياضيات التعليمية',
    description: 'منصة العميد لتعليم الرياضيات للمرحلة الثانوية - الأستاذ العميد',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        viewportFit: 'cover',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="ar" dir="rtl">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;400;700;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body>
                <ActivityTracker />
                {children}
                <Footer />
            </body>
        </html>
    );
}
