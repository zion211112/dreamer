// React Theme — extracted from https://airtable.com/embed/appL2oaKxSWg9qz8y/shrQ0LMjBK4Sq8JHC
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
    neutral700: string;
 *   };
 *   fonts: {
    heading: string;
 *   };
 *   fontSizes: {
    '11': string;
    '13': string;
    '14': string;
    '15': string;
    '16': string;
    '17': string;
    '24': string;
    '12.8': string;
 *   };
 *   space: {
    '4': string;
    '8': string;
    '12': string;
    '16': string;
    '24': string;
 *   };
 *   radii: {
    xs: string;
    md: string;
    full: string;
 *   };
 *   shadows: {
    none: string;
    xs: string;
    sm: string;
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
    "primary": "#166ee1",
    "secondary": "#88dbff",
    "accent": "#a0c6ff",
    "background": "#ffffff",
    "foreground": "#1d1f25",
    "neutral50": "#ffffff",
    "neutral100": "#616670",
    "neutral200": "#000000",
    "neutral300": "#c4c7cd",
    "neutral400": "#41454d",
    "neutral500": "#808080",
    "neutral600": "#aaaaaa",
    "neutral700": "#dde1e3"
  },
  "fonts": {
    "heading": "'Inter Display', sans-serif"
  },
  "fontSizes": {
    "11": "11px",
    "13": "13px",
    "14": "14px",
    "15": "15px",
    "16": "16px",
    "17": "17px",
    "24": "24px",
    "12.8": "12.8px"
  },
  "space": {
    "4": "4px",
    "8": "8px",
    "12": "12px",
    "16": "16px",
    "24": "24px"
  },
  "radii": {
    "xs": "2px",
    "md": "10px",
    "full": "9999px"
  },
  "shadows": {
    "none": "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px",
    "xs": "rgba(0, 0, 0, 0.1) 0px 1px 0px 0px",
    "sm": "rgba(0, 0, 0, 0.24) 0px 0px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px, rgba(0, 0, 0, 0.08) 0px 2px 4px 0px"
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
      "main": "#166ee1",
      "light": "hsl(214, 82%, 63%)",
      "dark": "hsl(214, 82%, 33%)"
    },
    "secondary": {
      "main": "#88dbff",
      "light": "hsl(198, 100%, 92%)",
      "dark": "hsl(198, 100%, 62%)"
    },
    "background": {
      "default": "#ffffff",
      "paper": "#f2f4f8"
    },
    "text": {
      "primary": "#1d1f25",
      "secondary": "#ffffff"
    }
  },
  "typography": {
    "h2": {
      "fontSize": "24px",
      "fontWeight": "400",
      "lineHeight": "30px",
      "fontFamily": "'Inter Display', sans-serif"
    },
    "body1": {
      "fontSize": "16px",
      "fontWeight": "400",
      "lineHeight": "normal"
    },
    "body2": {
      "fontSize": "13px",
      "fontWeight": "500",
      "lineHeight": "19.5px"
    }
  },
  "shape": {
    "borderRadius": 6
  },
  "shadows": [
    "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px",
    "rgba(0, 0, 0, 0.1) 0px 1px 0px 0px",
    "rgba(0, 0, 0, 0.32) 0px 0px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px, rgba(0, 0, 0, 0.08) 0px 1px 3px 0px",
    "rgba(0, 0, 0, 0) 4px 0px 0px 0px",
    "rgba(0, 0, 0, 0) 4px 0px 0px 0px inset"
  ]
};

export default theme;
