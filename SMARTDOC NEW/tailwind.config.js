/*import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [tailwindcss, autoprefixer],
};*/


/*module.exports = {
  theme: {
    extend: {
      borderRadius: {
        '2xl': '1rem',
      },
      colors: {
        primary: '#2563eb', // Tailwind's blue-600
      },
    },
  },
};
*/



// tailwind.config.js
// module.exports = {
//   content: ['./index.html', './src/**/*.{js,jsx}'],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ['Inter', 'sans-serif'],
//       },
//     },
//   },
//   plugins: [],
// };

/*import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 👇 ensures page reloads or direct URL works
    historyApiFallback: true
  }
});*/

// tailwind.config.js
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

