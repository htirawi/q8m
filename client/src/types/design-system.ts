/**
 * Design System Type Definitions
 * Core design tokens and system configuration
 */

/**
 * Color palette definition
 */
export interface IColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
  DEFAULT?: string;
}

/**
 * Design system colors
 */
export interface IDesignSystemColors {
  gray: IColorPalette;
  primary: IColorPalette;
  secondary: IColorPalette;
  success: IColorPalette;
  warning: IColorPalette;
  error: IColorPalette;
  info: IColorPalette;
  surface: {
    DEFAULT: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  dark: {
    bg: string;
    surface: string;
    border: string;
  };
}

/**
 * Typography scale
 */
export interface ITypographyScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

/**
 * Font weights
 */
export interface IFontWeights {
  regular: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
}

/**
 * Spacing scale
 */
export interface ISpacingScale {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
}

/**
 * Border radius scale
 */
export interface IBorderRadiusScale {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

/**
 * Shadow definitions
 */
export interface IShadows {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  'inner-lg': string;
  'glow-primary': string;
  'glow-success': string;
  'glow-danger': string;
  'glow-info': string;
}

/**
 * Animation durations
 */
export interface IAnimationDurations {
  instant: string;
  fast: string;
  moderate: string;
  slow: string;
  glacial: string;
}

/**
 * Animation easing functions
 */
export interface IAnimationEasing {
  'in-out': string;
  out: string;
  in: string;
  spring: string;
}

/**
 * Breakpoint definitions
 */
export interface IBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * Z-index scale
 */
export interface IZIndexScale {
  negative: number;
  0: number;
  10: number;
  20: number;
  30: number;
  40: number;
  50: number;
  dropdown: number;
  sticky: number;
  fixed: number;
  'modal-backdrop': number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

/**
 * Complete design system configuration
 */
export interface IDesignSystem {
  colors: IDesignSystemColors;
  typography: {
    scale: ITypographyScale;
    weights: IFontWeights;
    families: {
      sans: string;
      mono: string;
      display: string;
    };
  };
  spacing: ISpacingScale;
  borderRadius: IBorderRadiusScale;
  shadows: IShadows;
  animation: {
    durations: IAnimationDurations;
    easing: IAnimationEasing;
  };
  breakpoints: IBreakpoints;
  zIndex: IZIndexScale;
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Viewport size categories
 */
export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

/**
 * Component size variants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component color variants
 */
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * Button variants
 */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'soft' | 'link';

/**
 * Level selection card state
 */
export interface ILevelCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  difficulty: 'junior' | 'intermediate' | 'senior' | 'custom';
  isLocked: boolean;
  isSelected: boolean;
  requiredPlan?: 'free' | 'pro' | 'team';
  icon?: string;
  color?: string;
  badge?: {
    text: string;
    variant: ComponentVariant;
  };
}

/**
 * Hero section configuration
 */
export interface IHeroSection {
  greeting: string;
  subtitle: string;
  userName?: string;
  stats?: {
    streak?: number;
    coins?: number;
    level?: number;
    progress?: number;
  };
  showStats: boolean;
  animateEntrance: boolean;
}

/**
 * Animation configuration for components
 */
export interface IAnimationConfig {
  enabled: boolean;
  duration?: number;
  delay?: number;
  easing?: keyof IAnimationEasing;
  stagger?: number;
  respectReducedMotion?: boolean;
}