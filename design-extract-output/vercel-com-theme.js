// React Theme — extracted from https://vercel.com/geist
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
    mono: string;
 *   };
 *   fontSizes: {
    '12': string;
    '13': string;
    '14': string;
    '16': string;
    '20': string;
    '24': string;
    '40': string;
 *   };
 *   space: {
    '2': string;
    '4': string;
    '6': string;
    '8': string;
    '10': string;
    '12': string;
    '16': string;
    '24': string;
    '32': string;
    '48': string;
 *   };
 *   radii: {
    sm: string;
    full: string;
 *   };
 *   shadows: {
    none: string;
    sm: string;
    md: string;
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
    "primary": "#0072f5",
    "secondary": "#ff0000",
    "accent": "#ff990a",
    "background": "#ffffff",
    "foreground": "#4d4d4d",
    "neutral50": "#ebebeb",
    "neutral100": "#171717",
    "neutral200": "#4d4d4d",
    "neutral300": "#8f8f8f",
    "neutral400": "#ffffff",
    "neutral500": "#000000",
    "neutral600": "#7d7d7d"
  },
  "fonts": {
    "body": "'GeistSans', sans-serif",
    "mono": "'Geist Mono', monospace"
  },
  "fontSizes": {
    "12": "12px",
    "13": "13px",
    "14": "14px",
    "16": "16px",
    "20": "20px",
    "24": "24px",
    "40": "40px"
  },
  "space": {
    "2": "2px",
    "4": "4px",
    "6": "6px",
    "8": "8px",
    "10": "10px",
    "12": "12px",
    "16": "16px",
    "24": "24px",
    "32": "32px",
    "48": "48px"
  },
  "radii": {
    "sm": "4px",
    "full": "50px"
  },
  "shadows": {
    "none": "rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
    "sm": "rgb(250, 250, 250) 0px 0px 8px 8px inset",
    "md": "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.02) 0px 1px 1px 0px, rgba(0, 0, 0, 0.04) 0px 4px 8px 0px, rgb(250, 250, 250) 0px 0px 0px 1px, rgb(255, 255, 255) 0px 0px 0px 1px"
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
      "main": "#0072f5",
      "light": "hsl(212, 100%, 63%)",
      "dark": "hsl(212, 100%, 33%)"
    },
    "secondary": {
      "main": "#ff0000",
      "light": "hsl(0, 100%, 65%)",
      "dark": "hsl(0, 100%, 35%)"
    },
    "background": {
      "default": "#ffffff",
      "paper": "#fafafa"
    },
    "text": {
      "primary": "#4d4d4d",
      "secondary": "#171717"
    }
  },
  "typography": {
    "fontFamily": "'GeistSans', sans-serif",
    "h1": {
      "fontSize": "40px",
      "fontWeight": "600",
      "lineHeight": "48px"
    },
    "h2": {
      "fontSize": "24px",
      "fontWeight": "600",
      "lineHeight": "32px"
    },
    "h3": {
      "fontSize": "20px",
      "fontWeight": "400",
      "lineHeight": "30px"
    },
    "body1": {
      "fontSize": "16px",
      "fontWeight": "400",
      "lineHeight": "24px"
    },
    "body2": {
      "fontSize": "13px",
      "fontWeight": "400",
      "lineHeight": "20px"
    }
  },
  "shape": {
    "borderRadius": 4
  },
  "shadows": [
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb(235, 235, 235) 0px 0px 0px 1px",
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgb(250, 250, 250) 0px 0px 0px 1px",
    "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px",
    "rgba(0, 0, 0, 0.08) 0px 0px 0px 1px"
  ]
};

export default theme;
