import './globals.css';

export const metadata = {
    title: 'العميد - منصة الرياضيات التعليمية',
    description: 'منصة العميد لتعليم الرياضيات للمرحلة الثانوية - الأستاذ العميد',
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
                {children}
            </body>
        </html>
    );
}
