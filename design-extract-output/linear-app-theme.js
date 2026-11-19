// React Theme — extracted from https://linear.app/demo/team/ENG/active
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
    body: string;
 *   };
 *   fontSizes: {
    '12': string;
    '13': string;
    '16': string;
 *   };
 *   space: {

 *   };
 *   radii: {
    lg: string;
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
    "background": "#efeff0",
    "foreground": "#b0b5c0",
    "neutral50": "#000000",
    "neutral100": "#b0b5c0",
    "neutral200": "#efeff0",
    "neutral300": "#f9f9fa",
    "neutral400": "#e2e2e2"
  },
  "fonts": {
    "body": "'Inter Variable', sans-serif"
  },
  "fontSizes": {
    "12": "12px",
    "13": "13px",
    "16": "16px"
  },
  "space": {},
  "radii": {
    "lg": "12px"
  },
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
      "default": "#efeff0",
      "paper": "#f9f9fa"
    },
    "text": {
      "primary": "#b0b5c0",
      "secondary": "#000000"
    }
  },
  "typography": {
    "fontFamily": "'Inter Variable', sans-serif",
    "body1": {
      "fontSize": "16px",
      "fontWeight": "400",
      "lineHeight": "normal"
    },
    "body2": {
      "fontSize": "12px",
      "fontWeight": "500",
      "lineHeight": "18px"
    }
  },
  "shape": {
    "borderRadius": 12
  },
  "shadows": []
};

export default theme;
