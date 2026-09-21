export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;
