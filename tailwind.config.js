// tailwind.config.js
export default {
    content: ['./index.html',
      './src/**/*.{js,ts,jsx,tsx}',
      './node_modules/flowbite/**/*.js' 
    ],
    theme: {
      extend: {
        keyframes: {
          'fade-in': {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          'slide-in-from-bottom': {
            '0%': { transform: 'translateY(40px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
        },
        animation: {
          'fade-in': 'fade-in 1s ease-out forwards',
          'slide-in-from-bottom': 'slide-in-from-bottom 1s ease-out forwards',
        },
      },
    },
    plugins: [
      require('flowbite/plugin')
    ],
  };
  