# Integration Tests

Integration tests that verify multiple components working together.

## Structure

Organize by feature or workflow:

```
tests/integration/
  auth/
    login-flow.test.ts
    registration.test.ts
  api/
    user-endpoints.test.ts
    data-sync.test.ts
  workflows/
    complete-user-journey.test.ts
```

## Guidelines

- Test real interactions between components
- Use minimal mocking - prefer real implementations
- Test complete user workflows
- Include error scenarios and edge cases
- May require test database or external services
