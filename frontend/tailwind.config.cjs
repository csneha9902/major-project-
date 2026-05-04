module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Exo 2'", 'Inter', 'system-ui', 'sans-serif'],
        body: ["'Open Sans'", 'Inter', 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      colors: {
        'neuro': {
          'bg': '#0a0e1a',
          'surface': '#111827',
          'glass': 'rgba(17, 24, 39, 0.6)',
          'cyan': '#06d6a0',
          'violet': '#8b5cf6',
          'blue': '#3b82f6',
        },
      },
      borderRadius: {
        'glass': '16px',
      },
      boxShadow: {
        'glass': '0 4px 6px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.2), 0 0 40px rgba(6,214,160,0.03)',
        'glass-hover': '0 8px 16px rgba(0,0,0,0.4), 0 16px 32px rgba(0,0,0,0.25), 0 0 60px rgba(6,214,160,0.08)',
        'glow-cyan': '0 0 15px rgba(6,214,160,0.25), 0 0 30px rgba(6,214,160,0.1)',
        'glow-violet': '0 0 15px rgba(139,92,246,0.25), 0 0 30px rgba(139,92,246,0.1)',
      },
    },
  },
  plugins: [],
}
