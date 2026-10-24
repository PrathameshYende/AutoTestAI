/** @type {import('tailwindcss').Config} */
export default { darkMode: 'class', content: ['./index.html', './src/**/*.{js,jsx}'], theme: { extend: { colors: { accent: { 50:'#f5f3ff',100:'#ede9fe',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9' } }, boxShadow: { glow: '0 0 35px rgba(139,92,246,.12)' } } }, plugins: [] };
