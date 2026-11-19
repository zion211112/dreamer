// Measured with designlang: https://designlang.app
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        'neutral-50': '#cbced5',
        'neutral-100': '#0a0a0a',
        'neutral-200': '#000000',
        'neutral-300': '#ffffff',
        'neutral-400': '#646875',
        background: '#ffffff',
        foreground: '#000000'
    },
    fontSize: {
        '14': [
            '14px',
            {
                lineHeight: '21px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: '24px'
            }
        ]
    },
    spacing: {
        '0': '16px'
    },
    screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '1400px': '1400px',
        '1440px': '1440px',
        '2xl': '1536px',
        '1920px': '1920px'
    },
    transitionDuration: {
        '2000': '2s'
    },
    transitionTimingFunction: {
        default: 'ease'
    }
},
  },
};
