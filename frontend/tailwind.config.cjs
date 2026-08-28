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
          'bg': '#000000',
          'surface': '#111111',
          'glass': 'rgba(17, 17, 17, 0.6)',
          'primary': '#000000',
          'secondary': '#333333',
          'tertiary': '#666666',
          'light': '#CCCCCC',
          'lighter': '#EEEEEE',
          'white': '#FFFFFF',
        },
      },
      borderRadius: {
        'glass': '16px',
      },
      boxShadow: {
        'glass': '0 4px 6px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.2), 0 0 40px rgba(0,0,0,0.03)',
        'glass-hover': '0 8px 16px rgba(0,0,0,0.4), 0 16px 32px rgba(0,0,0,0.25), 0 0 60px rgba(0,0,0,0.08)',
        'glow-primary': '0 0 15px rgba(0,0,0,0.25), 0 0 30px rgba(0,0,0,0.1)',
        'glow-secondary': '0 0 15px rgba(51,51,51,0.25), 0 0 30px rgba(51,51,51,0.1)',
      },
    },
  },
  plugins: [],
}
