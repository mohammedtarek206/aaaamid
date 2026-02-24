import './globals.css';
import Footer from '@/components/Footer';
import ActivityTracker from '@/components/ActivityTracker';
import ScreenProtection from '@/components/ScreenProtection';

export const metadata = {
    title: {
        default: 'منصه العميد احمد شندي | افضل منصة لتعليم الرياضيات',
        template: '%s | منصه العميد احمد شندي'
    },
    description: 'منصه العميد احمد شندي هي المنصة التعليمية الرائدة في شرح مادة الرياضيات البحتة والتطبيقية لطلاب المرحلة الثانوية العامة والأزهرية. شرح مبسط، مراجعات نهائية، وامتحانات تفاعلية مع مستر احمد شندي.',
    keywords: [
        'منصه العميد',
        'احمد شندي',
        'منصه العميد احمد شندي',
        'العميد احمد شندي',
        'مستر احمد شندي',
        'العميد في الرياضيات',
        'رياضيات ثانوية عامة',
        'شرح رياضيات ثانوية عامة',
        'مراجعة نهائية رياضيات',
        'امتحانات رياضيات اونلاين',
        'منصة تعليمية',
        'ثانوية عامة',
        'Mr Ahmed Shendi',
        'Shendi Math',
        'math platform',
        'elamid',
        'el-amid'
    ],
    authors: [{ name: 'Ahmed Shendi' }, { name: 'العميد' }],
    creator: 'Ahmed Shendi',
    publisher: 'منصه العميد',
    metadataBase: new URL('https://mrahmed-shendy.com'),
    alternates: {
        canonical: '/',
    },
    verification: {
        google: 'ygK6_lEkVU_ABo0G90AcslR-jTe2SBfQemAIk0pLkMM',
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
        title: 'منصه العميد احمد شندي | طريقك الي التفوق في الرياضيات',
        description: 'انضم الآن إلى منصه العميد احمد شندي وتمتع بأحدث طرق شرح الرياضيات للثانوية العامة. فيديوهات عالية الجودة، اختبارات دورية، ومتابعة مستمرة.',
        url: 'https://mrahmed-shendy.com',
        siteName: 'منصه العميد احمد شندي',
        locale: 'ar_EG',
        type: 'website',
        images: [
            {
                url: '/opengraph-image.png', // Ensure this image exists in public folder or update path
                width: 1200,
                height: 630,
                alt: 'منصه العميد احمد شندي',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'منصه العميد احمد شندي',
        description: 'افضل منصة لتعليم الرياضيات للمرحلة الثانوية مع مستر احمد شندي.',
        creator: '@mrahmedshendy', // Update if there is a specific twitter handle
        images: ['/twitter-image.png'], // Ensure this image exists
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5, // Allow users to zoom for accessibility
        userScalable: true,
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
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
                    'https://www.youtube.com/@Ahme-wn7bm',
                    'https://www.tiktok.com/@mr.ahmed.shendy.o'
                ]
            },
            {
                '@type': 'WebSite',
                'name': 'منصه العميد احمد شندي',
                'alternateName': ['العميد', 'El Amid', 'Shendi Math'],
                'url': 'https://mrahmed-shendy.com',
                'potentialAction': {
                    '@type': 'SearchAction',
                    'target': 'https://mrahmed-shendy.com/search?q={search_term_string}',
                    'query-input': 'required name=search_term_string'
                }
            }
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
