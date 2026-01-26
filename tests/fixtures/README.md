# Test Fixtures

Test data, mock files, and sample data for testing.

## Structure

```
tests/fixtures/
  data/
    users.json
    products.json
    orders.json
  files/
    sample.pdf
    test-image.jpg
    config.yaml
  api-responses/
    success-responses.json
    error-responses.json
```

## Guidelines

- Keep fixture data minimal but realistic
- Use consistent IDs and relationships
- Include both valid and invalid data for edge case testing
- Store binary files separately from JSON data
- Version control all fixtures (avoid sensitive data)

## Usage

```typescript
import userData from '../fixtures/data/users.json';
import { loadFixture } from '../utils/fixture-loader';

const mockUsers = userData.users;
const configData = await loadFixture('files/config.yaml');
```
