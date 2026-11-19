// React Theme — extracted from https://app.getreprise.com/launch/BXZjxEX/?itm_category=home
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
 *   };
 *   fonts: {

 *   };
 *   fontSizes: {
    '14': string;
    '16': string;
 *   };
 *   space: {
    '16': string;
 *   };
 *   radii: {

 *   };
 *   shadows: {

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
    "background": "#ffffff",
    "foreground": "#000000",
    "neutral50": "#cbced5",
    "neutral100": "#0a0a0a",
    "neutral200": "#000000",
    "neutral300": "#ffffff",
    "neutral400": "#646875"
  },
  "fonts": {},
  "fontSizes": {
    "14": "14px",
    "16": "16px"
  },
  "space": {
    "16": "16px"
  },
  "radii": {},
  "shadows": {},
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
    "background": {
      "default": "#ffffff",
      "paper": "#ffffff"
    },
    "text": {
      "primary": "#000000",
      "secondary": "#0a0a0a"
    }
  },
  "typography": {
    "body1": {
      "fontSize": "16px",
      "fontWeight": "400",
      "lineHeight": "24px"
    },
    "body2": {
      "fontSize": "14px",
      "fontWeight": "400",
      "lineHeight": "21px"
    }
  },
  "shape": {},
  "shadows": []
};

export default theme;
