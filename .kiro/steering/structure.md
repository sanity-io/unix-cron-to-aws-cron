# Project Structure

## Root Files
- `index.js` - Main library file with default export function and helper functions
- `test.js` - Comprehensive test suite using Node.js built-in test runner
- `package.json` - Minimal package configuration with ES module type
- `readme.md` - Documentation with examples and key conversion rules

## Code Organization

### Main Function (`index.js`)
- `convertUnixToAwsCron()` - Primary export function with JSDoc
- Helper functions for specific conversion logic:
  - `convertDayOfWeek()` - Handles day-of-week number conversion
  - `convertMonth()` - Month format handling (placeholder for future enhancements)
  - `handleDayFieldExclusivity()` - Manages AWS day field restrictions
  - `validateYear()` - Year field validation and formatting

### Test Structure (`test.js`)
- Organized into logical test suites using `describe()` blocks:
  - Basic conversions
  - Day-of-week conversions
  - Day-of-month conversions
  - Month conversions
  - Year parameter handling
  - Complex expressions
  - Mutual exclusivity handling
  - Error handling
  - Edge cases and real-world examples

## Conventions
- Single default export from main module
- All functions documented with JSDoc
- Helper functions are not exported (internal use only)
- Test cases include descriptive names and expected behavior descriptions
- Error messages are user-friendly and specific
- Console warnings for non-fatal edge cases