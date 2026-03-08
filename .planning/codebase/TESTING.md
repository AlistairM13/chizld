# Testing Patterns

**Analysis Date:** 2026-03-08

## Test Framework

**Runner:**
- Jest (available in node_modules, detected via react-native/jest-preset.js and @jest dependencies)
- Configured implicitly through Expo and React Native
- No explicit jest.config.js in project root yet

**Assertion Library:**
- Jest built-in `expect()` matchers (standard)
- Optional: @testing-library/react-native for component testing

**Run Commands:**
```bash
npm test                    # Run all tests (when configured)
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

## Current Test Infrastructure Status

**What exists:**
- Jest dependencies are installed
- React Native and Expo include Jest preset support
- react-native-gesture-handler and react-native-reanimated have jest utilities
- @shopify/react-native-skia has Jest setup utilities
- TypeScript strict mode enabled (compile-time type checking provides safety net)

**What needs to be set up:**
- `jest.config.js` in project root
- `jest.setup.js` for test environment configuration
- Test directory structure and naming conventions
- Mock configurations for Expo modules

## Test File Organization

**Location:**
- Recommend co-located tests next to source files
- Pattern: `component.tsx` + `component.test.tsx` in same directory
- Alternatively: `src/__tests__/` subdirectory per feature

**Naming:**
- `*.test.ts` or `*.test.tsx` for unit/component tests
- `*.integration.test.ts` for integration tests
- `*.spec.ts` for spec-style tests (alternative to .test)

**Proposed Structure:**
```
src/
├── components/
│   ├── themed-text.tsx
│   ├── themed-text.test.tsx
│   ├── hint-row.tsx
│   └── hint-row.test.tsx
├── hooks/
│   ├── use-theme.ts
│   ├── use-theme.test.ts
│   ├── use-color-scheme.ts
│   └── use-color-scheme.test.ts
├── constants/
│   ├── colors.ts
│   └── colors.test.ts
└── utils/
    ├── xp-calculator.ts
    └── xp-calculator.test.ts
```

## Test Configuration Template

**jest.config.js (to be created):**
```javascript
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation|@shopify/react-native-skia|expo|react-native-reanimated|react-native-gesture-handler|react-native-mmkv)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/\.next/',
    '/.expo/',
  ],
};
```

**jest.setup.js (to be created):**
```javascript
// Suppress specific console errors/warnings that are expected in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Non-serializable values') ||
       args[0].includes('ViewPropTypes will be removed'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

## Test Structure

**Suite Organization - Unit Test Pattern:**
```typescript
import { render, screen } from '@testing-library/react-native';
import { ThemedText } from '../themed-text';

describe('ThemedText', () => {
  describe('rendering', () => {
    it('renders text with correct content', () => {
      const { getByText } = render(<ThemedText>Hello</ThemedText>);
      expect(getByText('Hello')).toBeTruthy();
    });

    it('applies correct type styling', () => {
      const { UNSAFE_getByType } = render(<ThemedText type="title">Title</ThemedText>);
      const textElement = UNSAFE_getByType(Text);
      expect(textElement.props.style).toContainEqual(
        expect.objectContaining({ fontSize: 48 })
      );
    });
  });

  describe('props', () => {
    it('accepts custom style prop', () => {
      const customStyle = { color: '#FF8C1A' };
      const { UNSAFE_getByType } = render(
        <ThemedText style={customStyle}>Styled</ThemedText>
      );
      const textElement = UNSAFE_getByType(Text);
      expect(textElement.props.style).toContainEqual(customStyle);
    });
  });
});
```

**Suite Organization - Hook Test Pattern:**
```typescript
import { renderHook } from '@testing-library/react-native';
import { useTheme } from '../use-theme';

describe('useTheme', () => {
  it('returns dark theme colors object', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toHaveProperty('text');
    expect(result.current).toHaveProperty('background');
  });

  it('returns consistent colors on multiple calls', () => {
    const { result: result1 } = renderHook(() => useTheme());
    const { result: result2 } = renderHook(() => useTheme());
    expect(result1.current).toEqual(result2.current);
  });
});
```

**Patterns:**
- Use `describe()` blocks to group related tests
- Use nested `describe()` for organizing by feature area
- Each `it()` test should have a clear, single responsibility
- Use descriptive test names that read like documentation

## Mocking

**Framework:** Jest built-in mocking via `jest.mock()`

**Patterns for Expo Modules:**
```typescript
// Mock expo-screen-orientation
jest.mock('expo-screen-orientation', () => ({
  OrientationLock: {
    LANDSCAPE: 'landscape',
  },
  lockAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    getString: jest.fn(),
    setNumber: jest.fn(),
    setBoolean: jest.fn(),
    setString: jest.fn(),
  })),
}));
```

**What to Mock:**
- External Expo modules (camera, file system, notifications, speech)
- Database calls (expo-sqlite)
- Platform-specific code (check with Platform.OS)
- Network requests (when testing API integration)
- Native modules (gesture handler, Skia rendering)

**What NOT to Mock:**
- React Native components (View, Text, StyleSheet)
- Custom hooks (test their actual behavior)
- Utility functions (test their actual logic)
- Constants and theme objects (they're configuration, not behavior)

**Mock Example - Database Operation:**
```typescript
jest.mock('@/db/database', () => ({
  db: {
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
    execAsync: jest.fn(),
  },
}));

describe('Zone Stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches zone stats from database', async () => {
    const mockStats = [{ zone_id: 'biceps', level: 5 }];
    (db.getAllAsync as jest.Mock).mockResolvedValue(mockStats);

    const result = await getZoneStats();
    expect(result).toEqual(mockStats);
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM zone_stats')
    );
  });
});
```

## Fixtures and Factories

**Test Data - Factory Pattern:**
```typescript
// src/__tests__/factories.ts
export function createZoneStats(overrides = {}) {
  return {
    zone_id: 'biceps',
    total_xp: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0,
    last_trained_at: null,
    personal_records: null,
    ...overrides,
  };
}

export function createWorkoutSet(overrides = {}) {
  return {
    id: 'set-1',
    session_id: 'session-1',
    exercise_id: 'exercise-1',
    set_number: 1,
    weight_kg: 80,
    reps: 10,
    rpe: 7,
    completed_at: new Date().toISOString(),
    ...overrides,
  };
}

// Usage in test:
it('increments XP on workout', () => {
  const stats = createZoneStats({ level: 3 });
  const set = createWorkoutSet({ weight_kg: 100 });

  const xpGained = calculateXP(set);
  expect(xpGained).toBeGreaterThan(0);
});
```

**Location:**
- Create `src/__tests__/factories.ts` for shared test data builders
- Import and use in test files to avoid duplicating test data
- Keep factory functions simple and focused

## Coverage

**Requirements:**
- Target: 70%+ overall coverage
- Critical paths (XP calculation, database operations, authentication checks) should have >80%
- UI components: 60%+ coverage acceptable

**View Coverage:**
```bash
npm test -- --coverage
```

Output shows:
- Statements: % of code lines executed
- Branches: % of conditional branches taken
- Functions: % of functions called
- Lines: % of lines executed

**Coverage Config in jest.config.js:**
```javascript
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/**/*.test.{ts,tsx}',
  '!src/**/index.ts', // barrel exports
],
coverageThreshold: {
  global: {
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70,
  },
  './src/utils/xp-calculator.ts': {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90,
  },
},
```

## Test Types

**Unit Tests:**
- Scope: Single function, hook, or component in isolation
- Mocking: Mock all external dependencies
- File location: `component.test.tsx` next to source
- Example: Testing `useTheme()` hook returns correct colors
- Run time: <1 second per test

**Integration Tests:**
- Scope: Multiple components/functions working together
- Mocking: Mock only external APIs (database, file system)
- File location: `src/__tests__/integration/` directory
- Example: Testing workout session creation saves to database and updates XP
- Run time: 1-5 seconds per test

**E2E Tests:**
- Framework: Not configured yet (Detox for React Native)
- Scope: Full user workflow (e.g., "Start workout → Log set → See XP increase")
- Can be added later when app is more stable
- Would require: `detox init` and device/emulator setup

## Common Patterns

**Async Testing:**
```typescript
// Using async/await
it('loads zone stats from database', async () => {
  const stats = await getZoneStats('biceps');
  expect(stats.zone_id).toBe('biceps');
});

// Using waitFor for state updates
it('displays zone name after loading', async () => {
  const { getByText } = render(<ZoneDetailPanel zoneId="biceps" />);

  await waitFor(() => {
    expect(getByText('BICEPS')).toBeTruthy();
  }, { timeout: 1000 });
});

// Using act() for state updates
it('updates streak on workout', async () => {
  const { result } = renderHook(() => useZoneStats('biceps'));

  await act(async () => {
    await result.current.addWorkout();
  });

  expect(result.current.stats.current_streak).toBeGreaterThan(0);
});
```

**Error Testing:**
```typescript
it('throws error for invalid XP amount', () => {
  expect(() => {
    addXP('biceps', -50);
  }).toThrow('XP amount must be positive');
});

it('handles database errors gracefully', async () => {
  (db.getAllAsync as jest.Mock).mockRejectedValue(
    new Error('Database connection failed')
  );

  await expect(getZoneStats()).rejects.toThrow('Database connection failed');
});
```

**Snapshot Testing (Use Sparingly):**
```typescript
// For critical, stable components only
it('renders zone card with correct structure', () => {
  const { toJSON } = render(
    <ZoneCard zone="biceps" level={5} warm={true} />
  );

  expect(toJSON()).toMatchSnapshot();
});
```

Note: Snapshots break easily. Only use for components that rarely change.

## Testing Best Practices

1. **Test behavior, not implementation** – Test what the user sees, not how it's done
2. **Use descriptive test names** – `it('shows level up animation when streak reaches 7 days')`
3. **One assertion per test** – When possible; multiple assertions are OK if they test one behavior
4. **Keep tests isolated** – Each test should be independent and runnable alone
5. **Mock external dependencies** – Database, API, native modules
6. **Test error paths** – Not just happy path
7. **Use beforeEach/afterEach** – For setup and cleanup
8. **Avoid time-dependent tests** – Don't test with actual timers; use `jest.useFakeTimers()`

---

*Testing analysis: 2026-03-08*
