// Measured with designlang: https://designlang.app
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(214, 82%, 97%)',
            '100': 'hsl(214, 82%, 94%)',
            '200': 'hsl(214, 82%, 86%)',
            '300': 'hsl(214, 82%, 76%)',
            '400': 'hsl(214, 82%, 64%)',
            '500': 'hsl(214, 82%, 50%)',
            '600': 'hsl(214, 82%, 40%)',
            '700': 'hsl(214, 82%, 32%)',
            '800': 'hsl(214, 82%, 24%)',
            '900': 'hsl(214, 82%, 16%)',
            '950': 'hsl(214, 82%, 10%)',
            DEFAULT: '#166ee1'
        },
        secondary: {
            '50': 'hsl(198, 100%, 97%)',
            '100': 'hsl(198, 100%, 94%)',
            '200': 'hsl(198, 100%, 86%)',
            '300': 'hsl(198, 100%, 76%)',
            '400': 'hsl(198, 100%, 64%)',
            '500': 'hsl(198, 100%, 50%)',
            '600': 'hsl(198, 100%, 40%)',
            '700': 'hsl(198, 100%, 32%)',
            '800': 'hsl(198, 100%, 24%)',
            '900': 'hsl(198, 100%, 16%)',
            '950': 'hsl(198, 100%, 10%)',
            DEFAULT: '#88dbff'
        },
        accent: {
            '50': 'hsl(216, 100%, 97%)',
            '100': 'hsl(216, 100%, 94%)',
            '200': 'hsl(216, 100%, 86%)',
            '300': 'hsl(216, 100%, 76%)',
            '400': 'hsl(216, 100%, 64%)',
            '500': 'hsl(216, 100%, 50%)',
            '600': 'hsl(216, 100%, 40%)',
            '700': 'hsl(216, 100%, 32%)',
            '800': 'hsl(216, 100%, 24%)',
            '900': 'hsl(216, 100%, 16%)',
            '950': 'hsl(216, 100%, 10%)',
            DEFAULT: '#a0c6ff'
        },
        'neutral-50': '#ffffff',
        'neutral-100': '#616670',
        'neutral-200': '#000000',
        'neutral-300': '#c4c7cd',
        'neutral-400': '#41454d',
        'neutral-500': '#808080',
        'neutral-600': '#aaaaaa',
        'neutral-700': '#dde1e3',
        background: '#ffffff',
        foreground: '#1d1f25'
    },
    fontFamily: {
        heading: [
            'Inter Display',
            'sans-serif'
        ]
    },
    fontSize: {
        '11': [
            '11px',
            {
                lineHeight: '13.75px'
            }
        ],
        '13': [
            '13px',
            {
                lineHeight: '19.5px'
            }
        ],
        '14': [
            '14px',
            {
                lineHeight: '17.5px'
            }
        ],
        '15': [
            '15px',
            {
                lineHeight: '18.75px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: 'normal'
            }
        ],
        '17': [
            '17px',
            {
                lineHeight: '25.5px',
                letterSpacing: '-0.16px'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: '30px'
            }
        ],
        '12.8': [
            '12.8px',
            {
                lineHeight: '16px'
            }
        ]
    },
    spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px'
    },
    borderRadius: {
        xs: '2px',
        md: '10px',
        full: '9999px'
    },
    boxShadow: {
        xs: 'rgba(0, 0, 0, 0.1) 0px 1px 0px 0px',
        sm: 'rgba(0, 0, 0, 0.24) 0px 0px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px, rgba(0, 0, 0, 0.08) 0px 2px 4px 0px'
    },
    screens: {
        '0px': '0px',
        xs: '360px',
        sm: '640px',
        md: '820px',
        lg: '1024px',
        '1152px': '1152px',
        '1664px': '1664px'
    },
    transitionDuration: {
        '85': '0.085s',
        '100': '0.1s',
        '200': '0.2s',
        '300': '0.3s'
    },
    transitionTimingFunction: {
        default: 'ease'
    },
    container: {
        center: true,
        padding: '0px'
    },
    maxWidth: {
        container: '1236px'
    }
},
  },
};
