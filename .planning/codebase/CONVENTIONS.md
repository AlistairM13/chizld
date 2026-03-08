# Coding Conventions

**Analysis Date:** 2026-03-08

## Naming Patterns

**Files:**
- Kebab-case with `.tsx` or `.ts` extensions
- Component files: PascalCase preferred for export names, but files use kebab-case (e.g., `themed-text.tsx` exports `ThemedText`)
- Hook files: Use `use-` prefix (e.g., `use-color-scheme.ts`, `use-theme.ts`)
- Platform-specific files: Use `.web`, `.android`, `.ios` suffixes (e.g., `animated-icon.web.tsx`, `animated-icon.tsx`)

**Functions:**
- camelCase for all function declarations and exports
- Descriptive names: `getDevMenuHint()`, `useTheme()`, `useColorScheme()`
- Arrow function syntax preferred for component bodies and callbacks
- Exported component functions start with uppercase (following React convention)

**Variables:**
- camelCase for all variable declarations
- Constants in camelCase (not UPPERCASE), stored in `const` declarations
- Avoid single-letter variables except for loop counters
- Examples from codebase: `colorScheme`, `theme`, `styles`, `otherProps`

**Types:**
- PascalCase for all type/interface names
- Suffix `Props` for component prop types: `ThemedTextProps`, `ThemedViewProps`, `HintRowProps`
- Suffix `Color` for color enums: `ThemeColor`
- Union types inline when simple, separate when complex
- Use `type` keyword (not `interface`) for most declarations

## Code Style

**Formatting:**
- No explicit linting/formatting config detected (uses Expo lint via `expo lint` command)
- Implicit rules observed:
  - 2-space indentation
  - Trailing commas in multi-line arrays/objects
  - No semicolons at end of statements (observed in multiple files)
  - Single quotes for strings (observed in StyleSheet and imports)

**Linting:**
- Tool: Expo lint (built-in Expo standard linting)
- Run: `npm run lint` via expo lint
- TypeScript strict mode enabled in tsconfig.json

**StyleSheet Pattern:**
- All styles defined with `StyleSheet.create()` at bottom of component files
- Styles object always named `styles`
- Never use inline styles; always use `StyleSheet.create()`
- Style names follow object property naming (camelCase)
- Examples: `styles.container`, `styles.heroSection`, `styles.stepRow`

## Import Organization

**Order:**
1. React and React Native imports
2. Expo imports
3. Third-party libraries (reanimated, gesture-handler, etc.)
4. Local imports from `@/` paths
5. Local relative imports

**Path Aliases:**
- `@/*` maps to `./src/*` (e.g., `@/components`, `@/constants`, `@/hooks`)
- `@/assets/*` maps to `./assets/*`
- Always prefer absolute imports over relative paths

**Pattern Example from codebase:**
```typescript
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
```

## Error Handling

**Patterns:**
- No explicit error handling detected in current codebase (starter scaffold)
- For future implementation:
  - Use try-catch for async operations
  - Return null/undefined for optional values rather than throwing
  - Validate database operations (expo-sqlite) with error checks
  - Use TypeScript strict mode to catch null/undefined issues at compile time

**Type Safety:**
- Always define return types for functions (especially async)
- Use optional chaining (`?.`) for potentially null values
- Use nullish coalescing (`??`) for default values

## Logging

**Framework:** console (standard React Native)

**Patterns:**
- No logging infrastructure detected in starter code
- For future implementation:
  - Use `console.log()` for debug output
  - Use `console.warn()` for warnings
  - Use `console.error()` for errors
  - Do NOT use console in production; implement proper logging service later

## Comments

**When to Comment:**
- Avoid obvious comments
- Document WHY, not WHAT (code should be self-documenting)
- Comment complex algorithms, workarounds, or non-obvious logic

**JSDoc/TSDoc:**
- Not observed in current codebase
- For future implementation in utility functions, use JSDoc:
```typescript
/**
 * Calculates XP earned for a workout set.
 * @param volume Total weight × reps
 * @param hasTempoMode Whether voice tempo was used
 * @returns XP points earned
 */
function calculateSetXP(volume: number, hasTempoMode: boolean): number {
```

## Function Design

**Size:**
- Keep functions small and focused (typically <30 lines)
- Extract complex logic into separate utility functions
- React components should focus on rendering and event handling

**Parameters:**
- Destructure objects: `({ title, hint }: HintRowProps)`
- Use rest operator for spread: `({ ...rest }: Props)`
- Avoid more than 3-4 parameters; use objects for complex inputs

**Return Values:**
- React components return JSX
- Hooks return values, callbacks, or state tuples
- Utilities should have explicit return types
- Return early to reduce nesting depth

## Module Design

**Exports:**
- Use named exports for components: `export function ComponentName()`
- Use named exports for utilities: `export function useHook()`, `export const constant = ...`
- One main export per file when possible
- Export types separately: `export type PropType = { ... }`

**Barrel Files:**
- Not observed in current codebase
- When implemented, use `index.ts` in category folders to export from all modules:
```typescript
// src/components/index.ts
export { HintRow } from './hint-row';
export { ThemedText } from './themed-text';
```

## Component Patterns

**Functional Components:**
- All components are function declarations or arrow functions
- No class components
- Example pattern:
```typescript
export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        style,
      ]}
      {...rest}
    />
  );
}
```

**Prop Destructuring:**
- Destructure in function signature
- Extract needed values first
- Keep `...rest` at end to spread remaining props

**Conditional Rendering:**
- Use ternary operators for simple conditions
- Use early returns for complex logic
- Use `&&` for optional rendering only when necessary

## PRD Design System Integration

**Colors:**
From `prd.md` section 4.1, use exact color tokens:
- Primary accent: `#FF8C1A` (ember-500)
- Background: `#0A0A0F` (bg-primary)
- Card background: `#141419` (bg-card)
- Text primary: `#F0F0F5`
- Text secondary: `#8888A0`
- Use `rgba(255,140,26,0.4)` for ember glow effects

Store all colors in `src/constants/colors.ts`:
```typescript
export const colors = {
  bg: {
    primary: '#0A0A0F',
    card: '#141419',
    elevated: '#1C1C24',
  },
  ember: {
    100: '#FFF0E0',
    300: '#FFB366',
    500: '#FF8C1A',
    700: '#CC6600',
    glow: 'rgba(255,140,26,0.4)',
  },
  // ... rest per prd.md
};
```

**Fonts:**
From `prd.md` section 4.2, NEVER use system fonts:
- **Chakra Petch** – titles, branding, zone names (24-32px)
- **Barlow Condensed** – section headers, labels (11-24px)
- **JetBrains Mono** – stat values, system text (9-28px)

Store in `src/constants/fonts.ts`:
```typescript
export const fonts = {
  display: 'ChakraPetch-Bold',
  heading: 'BarlowCondensed-SemiBold',
  label: 'BarlowCondensed-Medium',
  mono: 'JetBrainsMono-Bold',
  monoLight: 'JetBrainsMono-Regular',
};
```

**StyleSheet & Spacing:**
- Border radius: max 4px (sharp, game-like aesthetic)
- Spacing scale in tokens (e.g., 2, 4, 8, 16, 24, 32, 64)
- Shadow/glow: Use `shadowColor: '#FF8C1A', shadowOpacity: 0.3, shadowRadius: 12`

**Landscape Orientation:**
- Lock app to LANDSCAPE globally on startup using `expo-screen-orientation`
- All components must render correctly in landscape
- Use full screen width/height for layout

---

*Convention analysis: 2026-03-08*
