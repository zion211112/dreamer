// React Theme — extracted from https://designsystems.one/design-systems/vercel-geist
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
 *   };
 *   fonts: {
    body: string;
 *   };
 *   fontSizes: {
    '13': string;
    '14': string;
    '15': string;
    '16': string;
    '18': string;
    '20': string;
    '24': string;
    '28': string;
    '36': string;
    '40': string;
    '44': string;
    '41.716': string;
 *   };
 *   space: {
    '4': string;
    '8': string;
    '12': string;
    '16': string;
    '20': string;
    '24': string;
    '28': string;
    '32': string;
    '40': string;
    '48': string;
    '56': string;
    '64': string;
 *   };
 *   radii: {
    md: string;
    lg: string;
    xl: string;
    full: string;
 *   };
 *   shadows: {
    sm: string;
    xl: string;
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
    "primary": "#82182e",
    "secondary": "#0070f3",
    "accent": "#ee0000",
    "background": "#f0eae2",
    "foreground": "#0f0f14",
    "neutral50": "#ccc8c3",
    "neutral100": "#62626e",
    "neutral200": "#000000",
    "neutral300": "#ffffff",
    "neutral400": "#e7f0ee",
    "neutral500": "#333333",
    "neutral600": "#737373"
  },
  "fonts": {
    "body": "'Figtree', sans-serif"
  },
  "fontSizes": {
    "13": "13px",
    "14": "14px",
    "15": "15px",
    "16": "16px",
    "18": "18px",
    "20": "20px",
    "24": "24px",
    "28": "28px",
    "36": "36px",
    "40": "40px",
    "44": "44px",
    "41.716": "41.716px"
  },
  "space": {
    "4": "4px",
    "8": "8px",
    "12": "12px",
    "16": "16px",
    "20": "20px",
    "24": "24px",
    "28": "28px",
    "32": "32px",
    "40": "40px",
    "48": "48px",
    "56": "56px",
    "64": "64px"
  },
  "radii": {
    "md": "6px",
    "lg": "16px",
    "xl": "24px",
    "full": "999px"
  },
  "shadows": {
    "sm": "rgba(0, 0, 0, 0.1) 0px 2px 4px 0px",
    "xl": "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px"
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
      "main": "#82182e",
      "light": "hsl(348, 69%, 45%)",
      "dark": "hsl(348, 69%, 15%)"
    },
    "secondary": {
      "main": "#0070f3",
      "light": "hsl(212, 100%, 63%)",
      "dark": "hsl(212, 100%, 33%)"
    },
    "background": {
      "default": "#f0eae2",
      "paper": "#e7f0ee"
    },
    "text": {
      "primary": "#0f0f14",
      "secondary": "#62626e"
    }
  },
  "typography": {
    "fontFamily": "'Figtree', sans-serif",
    "h1": {
      "fontSize": "36px",
      "fontWeight": "600",
      "lineHeight": "40px"
    },
    "h2": {
      "fontSize": "24px",
      "fontWeight": "400",
      "lineHeight": "28.8px"
    }
  },
  "shape": {
    "borderRadius": 6
  },
  "shadows": [
    "rgba(0, 0, 0, 0.1) 0px 2px 4px 0px",
    "rgba(0, 0, 0, 0.12) 0px 8px 30px 0px",
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px"
  ]
};

export default theme;
