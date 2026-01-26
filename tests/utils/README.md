# Test Utilities

Shared utilities, helpers, and common test code.

## Common Files

- `test-helpers.ts` - General testing utilities
- `mock-factories.ts` - Factory functions for creating test data
- `custom-matchers.ts` - Custom Jest matchers
- `setup-helpers.ts` - Test setup and teardown utilities
- `api-mocks.ts` - API mocking utilities

## Usage

```typescript
import { createMockUser, expectToBeValidEmail } from '../utils/test-helpers';
import { setupTestDatabase, cleanupTestDatabase } from '../utils/setup-helpers';

describe('User Service', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create a user with valid email', () => {
    const user = createMockUser();
    expectToBeValidEmail(user.email);
  });
});
```
