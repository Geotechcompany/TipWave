module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          indigo: {
            100: '#E0E7FF',
            200: '#C7D2FE',
            500: '#6366F1',
            800: '#3730A3',
          },
        },
        animation: {
          'spin-slow': 'spin 3s linear infinite',
          'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
          spin: {
            '0%': { transform: 'rotate(0deg) scale(1)' },
            '50%': { transform: 'rotate(180deg) scale(1.1)' },
            '100%': { transform: 'rotate(360deg) scale(1)' },
          },
          ping: {
            '0%': { transform: 'scale(1)', opacity: '1' },
            '75%, 100%': { transform: 'scale(1.2)', opacity: '0' },
          },
          pulse: {
            '0%, 100%': { opacity: '1', transform: 'scale(1)' },
            '50%': { opacity: '0.5', transform: 'scale(0.9)' },
          },
        },
      },
    },
    plugins: [],
  }