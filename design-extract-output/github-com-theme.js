// React Theme — extracted from https://github.com/PostHog/posthog/tree/master/packages/quill
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
    neutral900: string;
 *   };
 *   fonts: {
    body: string;
    mono: string;
 *   };
 *   fontSizes: {
    '11': string;
    '12': string;
    '14': string;
    '16': string;
    '20': string;
    '24': string;
    '32': string;
    '13.6': string;
 *   };
 *   space: {
    '2': string;
    '3': string;
    '4': string;
    '5': string;
    '6': string;
    '7': string;
    '8': string;
    '10': string;
    '12': string;
    '13': string;
    '16': string;
    '20': string;
    '24': string;
    '32': string;
    '40': string;
 *   };
 *   radii: {
    sm: string;
    md: string;
    xl: string;
    full: string;
 *   };
 *   shadows: {
    none: string;
    xs: string;
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
    "primary": "#0969da",
    "secondary": "#9a6700",
    "background": "#ffffff",
    "foreground": "#1f2328",
    "neutral50": "#1f2328",
    "neutral100": "#59636e",
    "neutral200": "#ffffff",
    "neutral300": "#a4aea6",
    "neutral400": "#818b98",
    "neutral500": "#d1d9e0",
    "neutral600": "#000000",
    "neutral700": "#545454",
    "neutral800": "#f0f6fc",
    "neutral900": "#353d37"
  },
  "fonts": {
    "body": "'Mona Sans VF', sans-serif",
    "mono": "'Mona Sans Mono', monospace"
  },
  "fontSizes": {
    "11": "11px",
    "12": "12px",
    "14": "14px",
    "16": "16px",
    "20": "20px",
    "24": "24px",
    "32": "32px",
    "13.6": "13.6px"
  },
  "space": {
    "2": "2px",
    "3": "3px",
    "4": "4px",
    "5": "5px",
    "6": "6px",
    "7": "7px",
    "8": "8px",
    "10": "10px",
    "12": "12px",
    "13": "13px",
    "16": "16px",
    "20": "20px",
    "24": "24px",
    "32": "32px",
    "40": "40px"
  },
  "radii": {
    "sm": "3px",
    "md": "6px",
    "xl": "24px",
    "full": "50px"
  },
  "shadows": {
    "none": "rgba(0, 0, 0, 0) 0px 0px 0px 1px",
    "xs": "rgba(31, 35, 40, 0.04) 0px 1px 0px 0px inset"
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
      "main": "#0969da",
      "light": "hsl(212, 92%, 60%)",
      "dark": "hsl(212, 92%, 30%)"
    },
    "secondary": {
      "main": "#9a6700",
      "light": "hsl(40, 100%, 45%)",
      "dark": "hsl(40, 100%, 15%)"
    },
    "background": {
      "default": "#ffffff",
      "paper": "#0d1117"
    },
    "text": {
      "primary": "#1f2328",
      "secondary": "#59636e"
    }
  },
  "typography": {
    "fontFamily": "'Mona Sans VF', sans-serif",
    "h1": {
      "fontSize": "32px",
      "fontWeight": "600",
      "lineHeight": "48px"
    },
    "h2": {
      "fontSize": "24px",
      "fontWeight": "600",
      "lineHeight": "36px"
    },
    "h3": {
      "fontSize": "20px",
      "fontWeight": "600",
      "lineHeight": "25px"
    },
    "body1": {
      "fontSize": "16px",
      "fontWeight": "400",
      "lineHeight": "normal"
    },
    "body2": {
      "fontSize": "13.6px",
      "fontWeight": "400",
      "lineHeight": "20.4px"
    }
  },
  "shape": {
    "borderRadius": 6
  },
  "shadows": [
    "rgba(0, 0, 0, 0) 0px 0px 0px 1px",
    "rgb(25, 31, 27) 0px -1px 0px 0px inset",
    "rgb(209, 217, 224) 0px -1px 0px 0px inset",
    "rgba(209, 217, 224, 0.7) 0px -1px 0px 0px inset",
    "rgba(31, 35, 40, 0.04) 0px 1px 0px 0px"
  ]
};

export default theme;
