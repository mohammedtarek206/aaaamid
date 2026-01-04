/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#c9a050',
                    light: '#ecd08a',
                    dark: '#a67c37',
                    glow: 'rgba(201, 160, 80, 0.3)',
                },
                deep: '#020202',
                surface: '#0a0a0a',
                card: 'rgba(15, 15, 15, 0.7)',
                dim: '#a0a0a0',
            },
            fontFamily: {
                cairo: ['Cairo', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'luxury-glow': '0 0 30px rgba(201, 160, 80, 0.4)',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 10s infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(1deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.3', filter: 'blur(100px)' },
                    '50%': { opacity: '0.6', filter: 'blur(130px)' },
                }
            }
        },
    },
    plugins: [],
}
