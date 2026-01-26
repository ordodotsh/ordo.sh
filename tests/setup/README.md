# Test Setup

Global test configuration, setup, and teardown files.

## Common Files

- `jest.config.js` - Jest configuration
- `global-setup.ts` - Global setup before all tests
- `global-teardown.ts` - Global teardown after all tests
- `test-environment.ts` - Custom test environment configuration
- `setup-after-env.ts` - Setup that runs after test environment is created

## Purpose

- Configure test runners and frameworks
- Set up test databases or external services
- Configure mocks and environment variables
- Establish global test utilities
- Clean up resources after test runs

## Example Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setup-after-env.ts'],
  globalSetup: '<rootDir>/tests/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/setup/global-teardown.ts',
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
```
