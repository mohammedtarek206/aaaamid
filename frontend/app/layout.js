import './globals.css';
import Footer from '@/components/Footer';
import ActivityTracker from '@/components/ActivityTracker';

export const metadata = {
    title: {
        default: 'العميد | مستر احمد شندي - منصة الرياضيات التعليمية',
        template: '%s | مستر احمد شندي'
    },
    description: 'منصة العميد التعليمية بقيادة مستر احمد شندي، أقوى منصة لتدريس الرياضيات للمرحلة الثانوية العامة. شرح مبسط، امتحانات دورية، ومتابعة مستمرة لضمان التفوق.',
    keywords: ['مستر احمد شندي', 'احمد شندي', 'العميد', 'العميد في الرياضيات', 'رياضيات ثانوية عامة', 'منصة العميد', 'مدرس رياضيات', 'ثانوية عامة', 'Mr Ahmed Shendi', 'Shendi Math', 'mrahmedshendy', 'mr ahmed shendy', 'ahmedshendy', 'mrahmed-shendy'],
    authors: [{ name: 'Ahmed Shendi' }, { name: 'العميد' }],
    creator: 'Ahmed Shendi',
    publisher: 'العميد',
    verification: {
        google: '1sL70BlEUIeH-SpjrwdMJ72f2aqiIIBc3yXHXPxiVxE',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'العميد | مستر احمد شندي - منصة الرياضيات التعليمية',
        description: 'انضم لرحلة التفوق في الرياضيات مع مستر احمد شندي (العميد). شرح احترافي، امتحانات، ومتابعة دقيقة لطلاب الثانوية العامة.',
        url: 'https://mrahmed-shendy.com',
        siteName: 'العميد - El Amid',
        locale: 'ar_EG',
        type: 'website',
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        viewportFit: 'cover',
    },
};

export default function RootLayout({ children }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': 'Ahmed Shendi',
        'alternateName': ['مستر احمد شندي', 'العميد', 'Mr. Ahmed Shendi', 'mrahmedshendy'],
        'url': 'https://mrahmed-shendy.com',
        'jobTitle': 'Teacher',
        'worksFor': {
            '@type': 'Organization',
            'name': 'العميد - El Amid'
        },
        'sameAs': [
            'https://www.facebook.com/share/1ajY85wpZL/',
            'https://www.youtube.com/@Ahme-wn7bm', // Update with actual channel handle if needed
            'https://www.tiktok.com/@mr.ahmed.shendy.o'
        ]
    };

    return (
        <html lang="ar" dir="rtl">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;400;700;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body>
                <ActivityTracker />
                {children}
                <Footer />
            </body>
        </html>
    );
}
