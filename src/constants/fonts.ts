// Font family name strings using @expo-google-fonts underscore convention.
// NOTE: PRD shows hyphenated names (e.g., 'ChakraPetch-Bold') — those are WRONG.
// The registered fontFamily string must match the package export name exactly.
export const fonts = {
  display: 'ChakraPetch_700Bold',
  displaySemiBold: 'ChakraPetch_600SemiBold',
  displayRegular: 'ChakraPetch_400Regular',
  heading: 'BarlowCondensed_600SemiBold',
  label: 'BarlowCondensed_500Medium',
  labelRegular: 'BarlowCondensed_400Regular',
  mono: 'JetBrainsMono_700Bold',
  monoLight: 'JetBrainsMono_400Regular',
} as const;
