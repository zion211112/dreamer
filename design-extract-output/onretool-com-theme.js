// React Theme — extracted from https://onretool.com/app-gallery/logistics-dispatch-monitor
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
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
    '12': string;
    '14': string;
    '16': string;
    '18': string;
    '44.9231': string;
    '32.9231': string;
    '28.9231': string;
    '22.4615': string;
    '13.2308': string;
    '11.3846': string;
 *   };
 *   space: {
    '4': string;
    '8': string;
    '12': string;
    '16': string;
    '20': string;
    '24': string;
    '32': string;
    '36': string;
    '40': string;
 *   };
 *   radii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
 *   };
 *   shadows: {
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
    "primary": "#e9ebdf",
    "background": "#151515",
    "foreground": "#e9ebdf",
    "neutral50": "#ffffff",
    "neutral100": "#cbccc4",
    "neutral200": "#151515",
    "neutral300": "#433e38",
    "neutral400": "#242424",
    "neutral500": "#b6b8af",
    "neutral600": "#f7f8f4",
    "neutral700": "#8b867f",
    "neutral800": "#000000"
  },
  "fonts": {
    "body": "'saansFont', sans-serif"
  },
  "fontSizes": {
    "12": "12px",
    "14": "14px",
    "16": "16px",
    "18": "18px",
    "44.9231": "44.9231px",
    "32.9231": "32.9231px",
    "28.9231": "28.9231px",
    "22.4615": "22.4615px",
    "13.2308": "13.2308px",
    "11.3846": "11.3846px"
  },
  "space": {
    "4": "4px",
    "8": "8px",
    "12": "12px",
    "16": "16px",
    "20": "20px",
    "24": "24px",
    "32": "32px",
    "36": "36px",
    "40": "40px"
  },
  "radii": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "20px",
    "full": "36px"
  },
  "shadows": {
    "lg": "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px"
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
      "main": "#e9ebdf",
      "light": "hsl(70, 23%, 95%)",
      "dark": "hsl(70, 23%, 75%)"
    },
    "background": {
      "default": "#151515",
      "paper": "#0e0e0e"
    },
    "text": {
      "primary": "#e9ebdf",
      "secondary": "#cbccc4"
    }
  },
  "typography": {
    "fontFamily": "'saansFont', sans-serif",
    "h1": {
      "fontSize": "32.9231px",
      "fontWeight": "300",
      "lineHeight": "34.5693px"
    },
    "h2": {
      "fontSize": "28.9231px",
      "fontWeight": "300",
      "lineHeight": "30.3693px"
    },
    "h3": {
      "fontSize": "22.4615px",
      "fontWeight": "380",
      "lineHeight": "26.9538px"
    },
    "body1": {
      "fontSize": "16px",
      "fontWeight": "400",
      "lineHeight": "24px"
    }
  },
  "shape": {
    "borderRadius": 8
  },
  "shadows": [
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px"
  ]
};

export default theme;
