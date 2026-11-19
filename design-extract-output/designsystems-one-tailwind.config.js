// Measured with designlang: https://designlang.app
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(348, 69%, 97%)',
            '100': 'hsl(348, 69%, 94%)',
            '200': 'hsl(348, 69%, 86%)',
            '300': 'hsl(348, 69%, 76%)',
            '400': 'hsl(348, 69%, 64%)',
            '500': 'hsl(348, 69%, 50%)',
            '600': 'hsl(348, 69%, 40%)',
            '700': 'hsl(348, 69%, 32%)',
            '800': 'hsl(348, 69%, 24%)',
            '900': 'hsl(348, 69%, 16%)',
            '950': 'hsl(348, 69%, 10%)',
            DEFAULT: '#82182e'
        },
        secondary: {
            '50': 'hsl(212, 100%, 97%)',
            '100': 'hsl(212, 100%, 94%)',
            '200': 'hsl(212, 100%, 86%)',
            '300': 'hsl(212, 100%, 76%)',
            '400': 'hsl(212, 100%, 64%)',
            '500': 'hsl(212, 100%, 50%)',
            '600': 'hsl(212, 100%, 40%)',
            '700': 'hsl(212, 100%, 32%)',
            '800': 'hsl(212, 100%, 24%)',
            '900': 'hsl(212, 100%, 16%)',
            '950': 'hsl(212, 100%, 10%)',
            DEFAULT: '#0070f3'
        },
        accent: {
            '50': 'hsl(0, 100%, 97%)',
            '100': 'hsl(0, 100%, 94%)',
            '200': 'hsl(0, 100%, 86%)',
            '300': 'hsl(0, 100%, 76%)',
            '400': 'hsl(0, 100%, 64%)',
            '500': 'hsl(0, 100%, 50%)',
            '600': 'hsl(0, 100%, 40%)',
            '700': 'hsl(0, 100%, 32%)',
            '800': 'hsl(0, 100%, 24%)',
            '900': 'hsl(0, 100%, 16%)',
            '950': 'hsl(0, 100%, 10%)',
            DEFAULT: '#ee0000'
        },
        'neutral-50': '#ccc8c3',
        'neutral-100': '#62626e',
        'neutral-200': '#000000',
        'neutral-300': '#ffffff',
        'neutral-400': '#e7f0ee',
        'neutral-500': '#333333',
        'neutral-600': '#737373',
        background: '#f0eae2',
        foreground: '#0f0f14'
    },
    fontFamily: {
        sans: [
            'Figtree',
            'sans-serif'
        ],
        font1: [
            'Nanum Pen Script',
            'sans-serif'
        ]
    },
    fontSize: {
        '10': [
            '10px',
            {
                lineHeight: '15px',
                letterSpacing: '-0.32px'
            }
        ],
        '11': [
            '11px',
            {
                lineHeight: '16.5px',
                letterSpacing: '-0.32px'
            }
        ],
        '12': [
            '12px',
            {
                lineHeight: '14.4px',
                letterSpacing: '0.96px'
            }
        ],
        '13': [
            '13px',
            {
                lineHeight: '19.5px',
                letterSpacing: '-0.13px'
            }
        ],
        '14': [
            '14px',
            {
                lineHeight: '20px',
                letterSpacing: '-0.32px'
            }
        ],
        '15': [
            '15px',
            {
                lineHeight: '22.5px',
                letterSpacing: '-0.15px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: '24px'
            }
        ],
        '18': [
            '18px',
            {
                lineHeight: '28px',
                letterSpacing: '-0.32px'
            }
        ],
        '20': [
            '20px',
            {
                lineHeight: '28px',
                letterSpacing: '-0.4px'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: '28.8px'
            }
        ],
        '28': [
            '28px',
            {
                lineHeight: '28px',
                letterSpacing: '-0.32px'
            }
        ],
        '36': [
            '36px',
            {
                lineHeight: '40px',
                letterSpacing: '-1.26px'
            }
        ],
        '40': [
            '40px',
            {
                lineHeight: '40px',
                letterSpacing: '-0.32px'
            }
        ],
        '44': [
            '44px',
            {
                lineHeight: '52.8px',
                letterSpacing: '-1.54px'
            }
        ],
        '41.716': [
            '41.716px',
            {
                lineHeight: '38.3787px',
                letterSpacing: '-1.66864px'
            }
        ]
    },
    spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px'
    },
    borderRadius: {
        md: '6px',
        lg: '16px',
        xl: '24px',
        full: '999px'
    },
    boxShadow: {
        xs: 'rgba(0, 0, 0, 0.1) 0px 2px 4px 0px',
        sm: 'rgba(0, 0, 0, 0.12) 0px 8px 30px 0px'
    },
    screens: {
        sm: '640px',
        lg: '1024px',
        xl: '1280px',
        '1680px': '1680px'
    },
    transitionDuration: {
        '150': '0.15s',
        '160': '0.16s',
        '200': '0.2s'
    },
    transitionTimingFunction: {
        custom: 'cubic-bezier(0.25, 1, 0.5, 1)'
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
