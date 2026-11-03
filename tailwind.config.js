/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wyndham: {
          blue: '#0076CE',
          dark: '#005FA8',
          light: '#EBF4FC',
          accent: '#0084EA',
        },
        apple: {
          bg: '#F5F5F7',
          card: '#FFFFFF',
          text: '#1D1D1F',
          muted: '#86868B',
          subtle: '#AEAEB2',
          light: '#FBFBFD',
          border: 'rgba(0, 0, 0, 0.08)',
          borderSubtle: 'rgba(0, 0, 0, 0.04)',
          blue: '#0076CE',
          navy: '#003B64',
          gold: '#C59B27',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          teal: '#30B0C7',
          indigo: '#5856D6',
          purple: '#AF52DE',
          fill: 'rgba(120, 120, 128, 0.08)',
          fillHover: 'rgba(120, 120, 128, 0.14)',
          darkBg: '#081830',
          darkCard: '#0E274A',
          darkNavy: '#0A1F3B',
          darkFill: 'rgba(0, 118, 206, 0.18)',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          'system-ui',
          '"Inter"',
          'sans-serif'
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          '"JetBrains Mono"',
          'monospace'
        ],
      },
      boxShadow: {
        'apple-card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 14px rgba(0, 0, 0, 0.02)',
        'apple-hover': '0 2px 6px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)',
        'apple-pill': '0 1px 2px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
