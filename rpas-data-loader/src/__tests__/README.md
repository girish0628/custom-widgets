# RPAS Data Loader Widget Tests

This directory contains comprehensive unit and integration tests for the RPAS Data Loader widget.

## Test Files

### 1. ValidationService.test.ts
Tests for the validation service that handles input validation for all survey types.

**Coverage:**
- RPAS, TLS, and Small Project Imagery input validation
- Required field validation (file, project name, projection, date, time)
- File extension validation (.las, .laz, .xyz, .txt)
- File size validation
- Project name format validation (alphanumeric, hyphens, underscores)
- Time format validation (HH:MM)
- Case-insensitive file extension handling
- Default configuration value handling

**Key Test Scenarios:**
- Valid inputs return success
- Missing required fields trigger appropriate errors
- Invalid file types are rejected
- Files exceeding max size are rejected
- Project names with special characters are rejected
- Invalid time formats are rejected

### 2. WebhookService.test.ts
Tests for the webhook service that handles POST requests with retry logic.

**Coverage:**
- Successful webhook calls
- Retry mechanism with exponential backoff
- Error handling for network failures
- HTTP error responses (404, 401, 500, etc.)
- Webhook URL validation (HTTP/HTTPS protocols)
- Retry exhaustion handling
- Payload structure validation

**Key Test Scenarios:**
- Successful webhook call on first attempt
- Retry and succeed on subsequent attempts
- All retries fail and error is thrown
- Invalid URLs are rejected
- Exponential backoff delays between retries
- Correct payload structure is sent

### 3. FileUploader.test.tsx
React component tests for the file upload component.

**Coverage:**
- Component rendering
- File selection behavior
- File validation (extension and size)
- Error display
- Disabled state handling
- Custom configuration (extensions, max size)
- User interaction (button clicks, file changes)

**Key Test Scenarios:**
- Button click triggers file input
- Valid files are accepted and passed to callback
- Invalid file extensions show error messages
- Large files show size error messages
- Error messages clear when valid file is selected
- Component handles disabled state correctly
- Custom allowed extensions work properly

### 4. widget.test.tsx
Integration tests for the main widget component.

**Coverage:**
- Widget rendering
- Survey type selection dropdown
- Component switching based on survey type
- Configuration passing to child components
- CSS class application
- Style configuration handling
- Theme integration
- State persistence across re-renders

**Key Test Scenarios:**
- Widget renders with all required elements
- Three survey type options are available
- Default survey type is RPAS Elevation
- Selecting different survey types shows correct component
- Config is properly passed to child components
- Custom style configurations are applied
- Widget handles missing config gracefully

## Running Tests

### Run All Tests
From the client directory:
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- ValidationService.test.ts
npm test -- WebhookService.test.ts
npm test -- FileUploader.test.tsx
npm test -- widget.test.tsx
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Test Structure

All tests follow the Arrange-Act-Assert (AAA) pattern:
1. **Arrange**: Set up test data and mocks
2. **Act**: Execute the function or interaction
3. **Assert**: Verify the expected outcome

## Mocking

Tests use Jest's mocking capabilities for:
- `fetch` API in WebhookService tests
- Child components (RPASElevation, TLSElevation, SmallProjectImagery) in widget tests
- File objects for upload testing
- Console methods (log, warn) for verification

## Dependencies

Tests rely on:
- Jest: Testing framework
- React Testing Library: React component testing
- @testing-library/jest-dom: Custom matchers for DOM testing
- ts-jest: TypeScript support for Jest

## Coverage Goals

The test suite aims for:
- 90%+ line coverage
- 85%+ branch coverage
- 90%+ function coverage
- 85%+ statement coverage

## Best Practices

1. Tests are isolated and independent
2. Each test has a single, clear purpose
3. Descriptive test names explain what is being tested
4. Mock external dependencies
5. Use data-testid for component testing when needed
6. Clean up after each test with beforeEach/afterEach hooks
7. Test both success and failure scenarios
8. Verify error messages and edge cases

## Troubleshooting

### Common Issues

**Issue**: Tests fail with module resolution errors
**Solution**: Ensure jest.config.js has correct moduleNameMapper settings

**Issue**: File mock errors in component tests
**Solution**: Check that file-mock.js exists in __mocks__ directory

**Issue**: Async tests timing out
**Solution**: Use waitFor() from @testing-library/react for async operations

**Issue**: Component tests can't find elements
**Solution**: Use screen.debug() to see rendered output
