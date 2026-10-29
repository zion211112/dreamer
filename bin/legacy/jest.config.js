const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^server-only$': '<rootDir>/src/test/server-only-stub.ts',
  },
  testMatch: ['**/src/**/*.test.{ts,tsx}'],
};

module.exports = createJestConfig(customJestConfig);
