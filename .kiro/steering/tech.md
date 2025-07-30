# Technology Stack

## Runtime & Language
- **Node.js** with ES modules (`"type": "module"` in package.json)
- **JavaScript** (ES6+) with modern syntax
- No external dependencies - pure JavaScript implementation

## Package Configuration
- Published as `@sanity/unix-cron-to-aws-cron` on npm
- Uses ES module format exclusively
- Single default export function

## Testing
- **Node.js built-in test runner** (`node:test` module)
- **Node.js built-in assertions** (`node:assert` module)
- No external testing frameworks like Jest or Mocha

## Code Style & Patterns
- Comprehensive JSDoc documentation for all functions
- Functional programming approach with pure functions
- Extensive input validation with descriptive error messages
- Helper functions for single responsibilities
- Console warnings for edge cases (e.g., conflicting day fields)

## Common Commands
```bash
# Run tests
npm test
# or
node test

# Test file directly
node test.js
```

## Architecture Notes
- Single-file library with one main export
- Internal helper functions for specific conversion logic
- Error-first approach with detailed error messages
- No build step required - runs directly in Node.js