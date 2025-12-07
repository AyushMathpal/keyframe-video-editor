/**
 * Keyframe Design System - Design Tokens
 * 
 * A comprehensive set of design tokens for the Keyframe AI video editor.
 * Use these tokens for consistent styling across the application.
 */

// ===========================================
// COLOR TOKENS
// ===========================================

export const colors = {
  // Semantic colors for UI states
  semantic: {
    success: 'var(--success)',
    warning: 'var(--warning)',
    destructive: 'var(--destructive)',
    info: 'var(--info)',
  },

  // Surface hierarchy for layered UI
  surface: {
    0: 'var(--surface-0)', // Base layer
    1: 'var(--surface-1)', // Raised layer
    2: 'var(--surface-2)', // Higher elevation
    3: 'var(--surface-3)', // Highest elevation
  },

  // Chart/visualization palette
  chart: {
    1: 'var(--chart-1)',
    2: 'var(--chart-2)',
    3: 'var(--chart-3)',
    4: 'var(--chart-4)',
    5: 'var(--chart-5)',
  },
} as const;

// ===========================================
// TYPOGRAPHY TOKENS
// ===========================================

export const typography = {
  // Font families
  family: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },

  // Font sizes
  size: {
    '2xs': 'var(--text-2xs)',     // 10px - micro labels
    'xs': 'var(--text-xs)',       // 11px - timestamps, badges
    'sm': 'var(--text-sm)',       // 12px - secondary text
    'base': 'var(--text-base)',   // 13px - body text
    'md': 'var(--text-md)',       // 14px - emphasized body
    'lg': 'var(--text-lg)',       // 16px - section headers
    'xl': 'var(--text-xl)',       // 18px - card titles
    '2xl': 'var(--text-2xl)',     // 22px - page titles
    '3xl': 'var(--text-3xl)',     // 28px - hero text
    '4xl': 'var(--text-4xl)',     // 36px - display
    '5xl': 'var(--text-5xl)',     // 48px - hero display
  },

  // Font weights
  weight: {
    thin: 'var(--font-thin)',
    light: 'var(--font-light)',
    normal: 'var(--font-normal)',
    medium: 'var(--font-medium)',
    semibold: 'var(--font-semibold)',
    bold: 'var(--font-bold)',
  },

  // Line heights
  leading: {
    none: 'var(--leading-none)',
    tight: 'var(--leading-tight)',
    snug: 'var(--leading-snug)',
    normal: 'var(--leading-normal)',
    relaxed: 'var(--leading-relaxed)',
  },

  // Letter spacing
  tracking: {
    tighter: 'var(--tracking-tighter)',
    tight: 'var(--tracking-tight)',
    normal: 'var(--tracking-normal)',
    wide: 'var(--tracking-wide)',
    wider: 'var(--tracking-wider)',
    widest: 'var(--tracking-widest)',
  },
} as const;

// ===========================================
// SPACING & SIZING TOKENS
// ===========================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
} as const;

export const radius = {
  none: 'var(--radius-none)',
  xs: 'var(--radius-xs)',     // 2px - badges, tags
  sm: 'var(--radius-sm)',     // 4px - inputs, buttons
  md: 'var(--radius-md)',     // 6px - cards
  lg: 'var(--radius-lg)',     // 8px - modals, panels
  xl: 'var(--radius-xl)',     // 12px - large cards
  '2xl': 'var(--radius-2xl)', // 16px - featured sections
  full: 'var(--radius-full)',
} as const;

// ===========================================
// SHADOW TOKENS
// ===========================================

export const shadows = {
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  '2xl': 'var(--shadow-2xl)',
} as const;

// ===========================================
// ANIMATION TOKENS
// ===========================================

export const animation = {
  // Durations
  duration: {
    instant: 'var(--duration-instant)',   // 50ms
    fast: 'var(--duration-fast)',         // 100ms
    normal: 'var(--duration-normal)',     // 200ms
    slow: 'var(--duration-slow)',         // 300ms
    slower: 'var(--duration-slower)',     // 500ms
  },

  // Easing functions
  easing: {
    linear: 'var(--ease-linear)',
    in: 'var(--ease-in)',
    out: 'var(--ease-out)',
    inOut: 'var(--ease-in-out)',
    spring: 'var(--ease-spring)',
  },
} as const;

// ===========================================
// BREAKPOINTS
// ===========================================

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
} as const;

// ===========================================
// Z-INDEX SCALE
// ===========================================

export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  maximum: 9999,
} as const;

// ===========================================
// EDITOR-SPECIFIC TOKENS
// ===========================================

export const editor = {
  // Timeline dimensions
  timeline: {
    trackHeight: '48px',
    trackMinHeight: '32px',
    trackMaxHeight: '120px',
    rulerHeight: '24px',
    headerWidth: '200px',
  },

  // Panel dimensions
  panel: {
    sidebarWidth: '280px',
    sidebarMinWidth: '200px',
    sidebarMaxWidth: '400px',
    inspectorWidth: '320px',
    headerHeight: '48px',
    toolbarHeight: '40px',
  },

  // Preview dimensions
  preview: {
    minWidth: '320px',
    aspectRatio: '16/9',
  },

  // Playhead & scrubbing
  playhead: {
    width: '2px',
    handleSize: '12px',
  },

  // Clip handles
  clip: {
    handleWidth: '8px',
    minWidth: '24px',
  },
} as const;

// ===========================================
// KEYBOARD SHORTCUTS DISPLAY
// ===========================================

export const keyboardModifiers = {
  mac: {
    cmd: '⌘',
    shift: '⇧',
    alt: '⌥',
    ctrl: '⌃',
    enter: '↵',
    backspace: '⌫',
    delete: '⌦',
    escape: '⎋',
    tab: '⇥',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
  },
  windows: {
    cmd: 'Ctrl',
    shift: 'Shift',
    alt: 'Alt',
    ctrl: 'Ctrl',
    enter: 'Enter',
    backspace: 'Backspace',
    delete: 'Delete',
    escape: 'Esc',
    tab: 'Tab',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
  },
} as const;

// ===========================================
// TYPE EXPORTS
// ===========================================

export type ColorToken = keyof typeof colors.semantic;
export type SurfaceLevel = keyof typeof colors.surface;
export type FontSize = keyof typeof typography.size;
export type FontWeight = keyof typeof typography.weight;
export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadows;
export type Duration = keyof typeof animation.duration;
export type Easing = keyof typeof animation.easing;
export type Breakpoint = keyof typeof breakpoints;
export type ZIndex = keyof typeof zIndex;

