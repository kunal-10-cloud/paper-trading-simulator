export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#00E396', // Neon Green
                secondary: '#775DD0', // Purple
                accent: '#FF4560', // Red

                // Semantic Colors (Adapts to theme)
                background: 'var(--background)',
                surface: 'var(--surface)',
                border: 'var(--border)',
                text: 'var(--text)',
                muted: 'var(--muted)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
