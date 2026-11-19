// Measured with designlang: https://designlang.app
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(154, 35%, 97%)',
            '100': 'hsl(154, 35%, 94%)',
            '200': 'hsl(154, 35%, 86%)',
            '300': 'hsl(154, 35%, 76%)',
            '400': 'hsl(154, 35%, 64%)',
            '500': 'hsl(154, 35%, 50%)',
            '600': 'hsl(154, 35%, 40%)',
            '700': 'hsl(154, 35%, 32%)',
            '800': 'hsl(154, 35%, 24%)',
            '900': 'hsl(154, 35%, 16%)',
            '950': 'hsl(154, 35%, 10%)',
            DEFAULT: '#2b5945'
        },
        secondary: {
            '50': 'hsl(222, 54%, 97%)',
            '100': 'hsl(222, 54%, 94%)',
            '200': 'hsl(222, 54%, 86%)',
            '300': 'hsl(222, 54%, 76%)',
            '400': 'hsl(222, 54%, 64%)',
            '500': 'hsl(222, 54%, 50%)',
            '600': 'hsl(222, 54%, 40%)',
            '700': 'hsl(222, 54%, 32%)',
            '800': 'hsl(222, 54%, 24%)',
            '900': 'hsl(222, 54%, 16%)',
            '950': 'hsl(222, 54%, 10%)',
            DEFAULT: '#3860be'
        },
        'neutral-50': '#1e2124',
        'neutral-100': '#636363',
        'neutral-200': '#767676',
        'neutral-300': '#ffffff',
        'neutral-400': '#555555',
        'neutral-500': '#000000',
        'neutral-600': '#f4f7f6',
        'neutral-700': '#bbbbbb',
        'neutral-800': '#d8d8d8',
        background: '#ffffff',
        foreground: '#636363'
    },
    fontFamily: {
        sans: [
            'Alliance No.1',
            'sans-serif'
        ],
        heading: [
            'Alliance No.2',
            'sans-serif'
        ]
    },
    fontSize: {
        '14': [
            '14px',
            {
                lineHeight: '14px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: '14px'
            }
        ],
        '18': [
            '18px',
            {
                lineHeight: 'normal'
            }
        ],
        '20': [
            '20px',
            {
                lineHeight: '28.572px'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: '38.4px'
            }
        ],
        '27': [
            '27px',
            {
                lineHeight: '33.75px'
            }
        ],
        '28': [
            '28px',
            {
                lineHeight: '44.8px'
            }
        ],
        '40': [
            '40px',
            {
                lineHeight: '64px'
            }
        ],
        '24.66': [
            '24.66px',
            {
                lineHeight: '29.592px'
            }
        ],
        '16.2': [
            '16.2px',
            {
                lineHeight: '38px',
                letterSpacing: '0.162px'
            }
        ],
        '15.75': [
            '15.75px',
            {
                lineHeight: '22.05px'
            }
        ],
        '15.3': [
            '15.3px',
            {
                lineHeight: '30.6px'
            }
        ],
        '14.634': [
            '14.634px',
            {
                lineHeight: 'normal'
            }
        ],
        '14.4': [
            '14.4px',
            {
                lineHeight: 'normal'
            }
        ],
        '13.5': [
            '13.5px',
            {
                lineHeight: 'normal'
            }
        ]
    },
    spacing: {
        '1': '5px',
        '2': '10px',
        '3': '15px',
        '4': '20px',
        '5': '25px',
        '6': '30px',
        '8': '40px'
    },
    borderRadius: {
        xs: '2px',
        xl: '20px',
        full: '50px'
    },
    boxShadow: {
        xs: 'rgb(199, 197, 199) -3px -3px 5px -2px',
        sm: 'rgba(0, 0, 0, 0) 0px 2px 4px 0px, rgba(50, 50, 93, 0.1) 0px 7px 14px 0px'
    },
    screens: {
        '400px': '400px',
        sm: '426px',
        '550px': '550px',
        '560px': '560px',
        md: '768px',
        lg: '960px',
        '1200px': '1200px',
        '1440px': '1440px'
    },
    transitionDuration: {
        '0': '0s',
        '100': '0.1s',
        '125': '0.125s',
        '150': '0.15s',
        '175': '0.175s',
        '200': '0.2s',
        '250': '0.25s',
        '300': '0.3s',
        '33.33': '0.03333s',
        '66.66': '0.06666s',
        '99.99': '0.09999s',
        '133.32': '0.13332s',
        '166.65': '0.16665s',
        '199.98': '0.19998s',
        '233.31': '0.23331s'
    },
    transitionTimingFunction: {
        default: 'ease',
        linear: 'linear'
    },
    container: {
        center: true,
        padding: '0px'
    },
    maxWidth: {
        container: '1440px'
    }
},
  },
};
