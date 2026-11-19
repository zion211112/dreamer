// Measured with designlang: https://designlang.app
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        'neutral-50': '#000000',
        'neutral-100': '#b0b5c0',
        'neutral-200': '#efeff0',
        'neutral-300': '#f9f9fa',
        'neutral-400': '#e2e2e2',
        background: '#efeff0',
        foreground: '#b0b5c0'
    },
    fontFamily: {
        body: [
            'Inter Variable',
            'sans-serif'
        ]
    },
    fontSize: {
        '12': [
            '12px',
            {
                lineHeight: '18px'
            }
        ],
        '13': [
            '13px',
            {
                lineHeight: '19.5px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: 'normal'
            }
        ]
    },
    borderRadius: {
        lg: '12px'
    },
    transitionDuration: {
        '100': '0.1s',
        '200': '0.2s',
        '400': '0.4s',
        '450': '0.45s',
        '800': '0.8s'
    },
    transitionTimingFunction: {
        custom: 'cubic-bezier(0.45, 0, 0.55, 1)',
        default: 'ease'
    }
},
  },
};
