// Measured with designlang: https://designlang.app
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(212, 92%, 97%)',
            '100': 'hsl(212, 92%, 94%)',
            '200': 'hsl(212, 92%, 86%)',
            '300': 'hsl(212, 92%, 76%)',
            '400': 'hsl(212, 92%, 64%)',
            '500': 'hsl(212, 92%, 50%)',
            '600': 'hsl(212, 92%, 40%)',
            '700': 'hsl(212, 92%, 32%)',
            '800': 'hsl(212, 92%, 24%)',
            '900': 'hsl(212, 92%, 16%)',
            '950': 'hsl(212, 92%, 10%)',
            DEFAULT: '#0969da'
        },
        secondary: {
            '50': 'hsl(40, 100%, 97%)',
            '100': 'hsl(40, 100%, 94%)',
            '200': 'hsl(40, 100%, 86%)',
            '300': 'hsl(40, 100%, 76%)',
            '400': 'hsl(40, 100%, 64%)',
            '500': 'hsl(40, 100%, 50%)',
            '600': 'hsl(40, 100%, 40%)',
            '700': 'hsl(40, 100%, 32%)',
            '800': 'hsl(40, 100%, 24%)',
            '900': 'hsl(40, 100%, 16%)',
            '950': 'hsl(40, 100%, 10%)',
            DEFAULT: '#9a6700'
        },
        'neutral-50': '#1f2328',
        'neutral-100': '#59636e',
        'neutral-200': '#ffffff',
        'neutral-300': '#a4aea6',
        'neutral-400': '#818b98',
        'neutral-500': '#d1d9e0',
        'neutral-600': '#000000',
        'neutral-700': '#545454',
        'neutral-800': '#f0f6fc',
        'neutral-900': '#353d37',
        background: '#ffffff',
        foreground: '#1f2328'
    },
    fontFamily: {
        sans: [
            'Mona Sans VF',
            'sans-serif'
        ],
        heading: [
            'Mona Sans',
            'sans-serif'
        ],
        mono: [
            'Mona Sans Mono',
            'sans-serif'
        ]
    },
    fontSize: {
        '11': [
            '11px',
            {
                lineHeight: '10px',
                letterSpacing: '0.21px'
            }
        ],
        '12': [
            '12px',
            {
                lineHeight: '19.5px'
            }
        ],
        '14': [
            '14px',
            {
                lineHeight: '21px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: 'normal'
            }
        ],
        '20': [
            '20px',
            {
                lineHeight: '25px'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: '36px'
            }
        ],
        '32': [
            '32px',
            {
                lineHeight: '48px'
            }
        ],
        '13.6': [
            '13.6px',
            {
                lineHeight: '20.4px'
            }
        ]
    },
    spacing: {
        '0': '2px',
        '1': '3px',
        '2': '4px',
        '3': '5px',
        '4': '6px',
        '5': '7px',
        '6': '8px',
        '7': '10px',
        '8': '12px',
        '9': '13px',
        '10': '16px',
        '11': '20px',
        '12': '24px',
        '13': '32px',
        '14': '40px'
    },
    borderRadius: {
        sm: '3px',
        md: '6px',
        xl: '24px',
        full: '50px'
    },
    boxShadow: {
        xs: 'rgba(31, 35, 40, 0.04) 0px 1px 0px 0px'
    },
    transitionDuration: {
        '80': '0.08s',
        '200': '0.2s',
        '300': '0.3s',
        '400': '0.4s',
        '500': '0.5s'
    },
    transitionTimingFunction: {
        linear: 'linear',
        custom: 'cubic-bezier(0.33, 1, 0.68, 1)',
        default: 'ease'
    },
    container: {
        center: true,
        padding: '0px'
    },
    maxWidth: {
        container: '100%'
    }
},
  },
};
