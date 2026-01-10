/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'selector',
    theme: {
        extend: {
            colors: {
                primary: '#4169E1', // Royal Blue
                secondary: '#FFD700', // Gold
                background: '#F8FAFC', // Slate-50
            },
            fontFamily: {
                sans: ['Sarabun', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
