export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/',
        },
        sitemap: 'https://mrahmed-shendy.com/sitemap.xml', // Replace with your actual sitemap URL
    };
}
