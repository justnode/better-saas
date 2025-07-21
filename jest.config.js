import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^next/font/(.*)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@t3-oss|next-intl|use-intl|@radix-ui|nanostores|better-auth|zustand)/)',
  ],
  // Remove custom transform config to use Next.js defaults
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/error.tsx',
    '!src/middleware.ts',
    '!src/env.ts',
    // Exclude test files and mock files
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    // Include important business logic files
    'src/lib/**/*.{js,jsx,ts,tsx}',
    'src/server/**/*.{js,jsx,ts,tsx}',
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/hooks/**/*.{js,jsx,ts,tsx}',
    'src/store/**/*.{js,jsx,ts,tsx}',
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 85,
      statements: 85,
    },
    // Specific thresholds for critical modules
    'src/lib/auth/**/*.{js,jsx,ts,tsx}': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/lib/file-service.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'src/server/actions/**/*.{js,jsx,ts,tsx}': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  testTimeout: 30000, // Increased timeout for integration tests
  testEnvironment: 'jsdom', // Use jsdom for all tests
  // Verbose output for better debugging
  verbose: true,
  // Fail fast on first test failure in CI
  bail: process.env.CI ? 1 : 0,
  // Clear mocks between tests
  clearMocks: true,
  // Restore mocks after each test
  restoreMocks: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// @ts-ignore
export default createJestConfig(customJestConfig)
