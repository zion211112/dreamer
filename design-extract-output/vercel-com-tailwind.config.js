// Measured with designlang: https://designlang.app
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
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
            DEFAULT: '#0072f5'
        },
        secondary: {
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
            DEFAULT: '#ff0000'
        },
        accent: {
            '50': 'hsl(35, 100%, 97%)',
            '100': 'hsl(35, 100%, 94%)',
            '200': 'hsl(35, 100%, 86%)',
            '300': 'hsl(35, 100%, 76%)',
            '400': 'hsl(35, 100%, 64%)',
            '500': 'hsl(35, 100%, 50%)',
            '600': 'hsl(35, 100%, 40%)',
            '700': 'hsl(35, 100%, 32%)',
            '800': 'hsl(35, 100%, 24%)',
            '900': 'hsl(35, 100%, 16%)',
            '950': 'hsl(35, 100%, 10%)',
            DEFAULT: '#ff990a'
        },
        'neutral-50': '#ebebeb',
        'neutral-100': '#171717',
        'neutral-200': '#4d4d4d',
        'neutral-300': '#8f8f8f',
        'neutral-400': '#ffffff',
        'neutral-500': '#000000',
        'neutral-600': '#7d7d7d',
        background: '#ffffff',
        foreground: '#4d4d4d'
    },
    fontFamily: {
        sans: [
            'GeistSans',
            'sans-serif'
        ],
        font1: [
            'GeistSerif',
            'sans-serif'
        ],
        font2: [
            'GeistPixelSquare',
            'sans-serif'
        ],
        mono: [
            'Geist Mono',
            'sans-serif'
        ]
    },
    fontSize: {
        '12': [
            '12px',
            {
                lineHeight: '20.4px'
            }
        ],
        '13': [
            '13px',
            {
                lineHeight: '20px'
            }
        ],
        '14': [
            '14px',
            {
                lineHeight: '20px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: '24px'
            }
        ],
        '20': [
            '20px',
            {
                lineHeight: '30px'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: '32px',
                letterSpacing: '-0.96px'
            }
        ],
        '40': [
            '40px',
            {
                lineHeight: '48px',
                letterSpacing: '-2.4px'
            }
        ]
    },
    spacing: {
        '1': '2px',
        '2': '4px',
        '3': '6px',
        '4': '8px',
        '5': '10px',
        '6': '12px',
        '8': '16px',
        '12': '24px',
        '16': '32px',
        '24': '48px'
    },
    borderRadius: {
        sm: '4px',
        full: '50px'
    },
    boxShadow: {
        xs: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 2px 0px, rgb(250, 250, 250) 0px 0px 0px 1px',
        sm: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.02) 0px 1px 1px 0px, rgba(0, 0, 0, 0.04) 0px 4px 8px 0px, rgb(250, 250, 250) 0px 0px 0px 1px, rgb(255, 255, 255) 0px 0px 0px 1px'
    },
    screens: {
        '401px': '401px',
        sm: '601px',
        md: '769px',
        lg: '961px'
    },
    transitionDuration: {
        '150': '0.15s',
        '200': '0.2s'
    },
    transitionTimingFunction: {
        custom: 'cubic-bezier(0.3, 0.57, 0.07, 0.95)'
    },
    container: {
        center: true,
        padding: '0px'
    },
    maxWidth: {
        container: '1280px'
    }
},
  },
};
