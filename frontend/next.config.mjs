import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['www.dailymotion.com'],
    },
    webpack: (config) => {
        config.resolve.alias['@'] = path.resolve(__dirname);
        return config;
    },
    async rewrites() {
        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://el-amid-api.vercel.app';
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
