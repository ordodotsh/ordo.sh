# Test Directory Structure

This directory contains all test files organized by type:

## Structure

- `unit/` - Unit tests for individual components and functions
- `integration/` - Integration tests that test multiple components together
- `utils/` - Test utilities, helpers, and shared test code
- `fixtures/` - Test data and mock files
- `setup/` - Test setup and configuration files

## Running Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

## Writing Tests

- Place unit tests in the `unit/` directory, mirroring the source structure
- Use the utilities in `utils/` for common test setup and assertions
- Store test data in `fixtures/` directory
- Follow the naming convention: `*.test.ts` or `*.spec.ts`
