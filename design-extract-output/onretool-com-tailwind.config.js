// Measured with designlang: https://designlang.app
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(70, 23%, 97%)',
            '100': 'hsl(70, 23%, 94%)',
            '200': 'hsl(70, 23%, 86%)',
            '300': 'hsl(70, 23%, 76%)',
            '400': 'hsl(70, 23%, 64%)',
            '500': 'hsl(70, 23%, 50%)',
            '600': 'hsl(70, 23%, 40%)',
            '700': 'hsl(70, 23%, 32%)',
            '800': 'hsl(70, 23%, 24%)',
            '900': 'hsl(70, 23%, 16%)',
            '950': 'hsl(70, 23%, 10%)',
            DEFAULT: '#e9ebdf'
        },
        'neutral-50': '#ffffff',
        'neutral-100': '#cbccc4',
        'neutral-200': '#151515',
        'neutral-300': '#433e38',
        'neutral-400': '#242424',
        'neutral-500': '#b6b8af',
        'neutral-600': '#f7f8f4',
        'neutral-700': '#8b867f',
        'neutral-800': '#000000',
        background: '#151515',
        foreground: '#e9ebdf'
    },
    fontFamily: {
        sans: [
            'saansFont',
            'sans-serif'
        ],
        font1: [
            'pxGroteskFont',
            'sans-serif'
        ]
    },
    fontSize: {
        '12': [
            '12px',
            {
                lineHeight: '14.4px',
                letterSpacing: '0.12px'
            }
        ],
        '14': [
            '14px',
            {
                lineHeight: '16.8px',
                letterSpacing: '0.28px'
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
                lineHeight: '27px',
                letterSpacing: '0.18px'
            }
        ],
        '44.9231': [
            '44.9231px',
            {
                lineHeight: '47.1693px',
                letterSpacing: '-0.449231px'
            }
        ],
        '32.9231': [
            '32.9231px',
            {
                lineHeight: '34.5693px',
                letterSpacing: '-0.329231px'
            }
        ],
        '28.9231': [
            '28.9231px',
            {
                lineHeight: '30.3693px',
                letterSpacing: '-0.289231px'
            }
        ],
        '22.4615': [
            '22.4615px',
            {
                lineHeight: '26.9538px',
                letterSpacing: '-0.224615px'
            }
        ],
        '13.2308': [
            '13.2308px',
            {
                lineHeight: '13.2308px',
                letterSpacing: '0.132308px'
            }
        ],
        '11.3846': [
            '11.3846px',
            {
                lineHeight: '13.6615px',
                letterSpacing: '0.113846px'
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
        '8': '32px',
        '9': '36px',
        '10': '40px'
    },
    borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        full: '36px'
    },
    boxShadow: {
        xs: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px'
    },
    screens: {
        '400px': '400px',
        sm: '544px',
        md: '768px',
        lg: '1024px',
        '1200px': '1200px',
        xl: '1280px',
        '1440px': '1440px',
        '1441px': '1441px'
    },
    transitionDuration: {
        '100': '0.1s',
        '150': '0.15s',
        '200': '0.2s',
        '300': '0.3s',
        '400': '0.4s',
        '600': '0.6s'
    },
    transitionTimingFunction: {
        custom: 'cubic-bezier(0.64, 0, 0.76, 1)'
    },
    container: {
        center: true,
        padding: '0px'
    },
    maxWidth: {
        container: '2240px'
    }
},
  },
};
