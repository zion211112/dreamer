// React Theme — extracted from https://www.palantir.com/docs/foundry/object-explorer/getting-started/
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
    neutral700: string;
    neutral800: string;
 *   };
 *   fonts: {
    body: string;
 *   };
 *   fontSizes: {
    '16': string;
    '18': string;
    '20': string;
    '24': string;
    '27': string;
    '28': string;
    '40': string;
    '24.66': string;
    '16.2': string;
    '15.75': string;
    '15.3': string;
    '14.634': string;
 *   };
 *   space: {
    '5': string;
    '10': string;
    '15': string;
    '20': string;
    '25': string;
    '30': string;
    '40': string;
 *   };
 *   radii: {
    xs: string;
    xl: string;
    full: string;
 *   };
 *   shadows: {
    md: string;
    lg: string;
 *   };
 *   states: {
 *     hover: { opacity: number };
 *     focus: { opacity: number };
 *     active: { opacity: number };
 *     disabled: { opacity: number };
 *   };
 * }
 */

export const theme = {
  "colors": {
    "primary": "#2b5945",
    "secondary": "#3860be",
    "background": "#ffffff",
    "foreground": "#636363",
    "neutral50": "#1e2124",
    "neutral100": "#636363",
    "neutral200": "#767676",
    "neutral300": "#ffffff",
    "neutral400": "#555555",
    "neutral500": "#000000",
    "neutral600": "#f4f7f6",
    "neutral700": "#bbbbbb",
    "neutral800": "#d8d8d8"
  },
  "fonts": {
    "body": "'Alliance No.1', sans-serif"
  },
  "fontSizes": {
    "16": "16px",
    "18": "18px",
    "20": "20px",
    "24": "24px",
    "27": "27px",
    "28": "28px",
    "40": "40px",
    "24.66": "24.66px",
    "16.2": "16.2px",
    "15.75": "15.75px",
    "15.3": "15.3px",
    "14.634": "14.634px"
  },
  "space": {
    "5": "5px",
    "10": "10px",
    "15": "15px",
    "20": "20px",
    "25": "25px",
    "30": "30px",
    "40": "40px"
  },
  "radii": {
    "xs": "2px",
    "xl": "20px",
    "full": "50px"
  },
  "shadows": {
    "md": "rgb(199, 197, 199) 0px 0px 12px 2px",
    "lg": "rgba(0, 0, 0, 0) 0px 2px 4px 0px, rgba(50, 50, 93, 0.1) 0px 7px 14px 0px"
  },
  "states": {
    "hover": {
      "opacity": 0.08
    },
    "focus": {
      "opacity": 0.12
    },
    "active": {
      "opacity": 0.16
    },
    "disabled": {
      "opacity": 0.38
    }
  }
};

// MUI v5 theme
export const muiTheme = {
  "palette": {
    "primary": {
      "main": "#2b5945",
      "light": "hsl(154, 35%, 41%)",
      "dark": "hsl(154, 35%, 11%)"
    },
    "secondary": {
      "main": "#3860be",
      "light": "hsl(222, 54%, 63%)",
      "dark": "hsl(222, 54%, 33%)"
    },
    "background": {
      "default": "#ffffff",
      "paper": "#2b5945"
    },
    "text": {
      "primary": "#636363",
      "secondary": "#1e2124"
    }
  },
  "typography": {
    "fontFamily": "'Alliance No.1', sans-serif",
    "h1": {
      "fontSize": "40px",
      "fontWeight": "400",
      "lineHeight": "64px"
    },
    "h2": {
      "fontSize": "24px",
      "fontWeight": "400",
      "lineHeight": "38.4px"
    },
    "h3": {
      "fontSize": "20px",
      "fontWeight": "400",
      "lineHeight": "28.572px"
    }
  },
  "shape": {
    "borderRadius": 2
  },
  "shadows": [
    "rgb(199, 197, 199) -3px -3px 5px -2px",
    "rgb(199, 197, 199) 0px 0px 12px 2px",
    "rgba(0, 0, 0, 0) 0px 2px 4px 0px, rgba(50, 50, 93, 0.1) 0px 7px 14px 0px"
  ]
};

export default theme;
