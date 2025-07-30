# Design Document

## Overview

This design enhances the existing `convertUnixToAwsCron` function to accept either a string or an object as the primary input parameter. The enhancement maintains full backward compatibility while providing a more structured and programmatic interface for cron expression construction.

## Architecture

### Input Type Detection
The function will use JavaScript's `typeof` operator to determine the input type and route to appropriate processing logic:

```javascript
export default function convertUnixToAwsCron(input, year = '*') {
  if (typeof input === 'string') {
    return processStringInput(input, year)
  } else if (typeof input === 'object' && input !== null) {
    return processObjectInput(input, year)
  } else {
    throw new Error('Input must be a string or object')
  }
}
```

### Backward Compatibility Strategy
- Existing string processing logic will be extracted into a separate internal function
- All current validation and conversion logic remains unchanged
- Existing tests continue to pass without modification
- Function signature remains the same with optional second parameter

## Components and Interfaces

### Main Function Interface
```javascript
/**
 * Converts Unix cron expression to AWS EventBridge format
 * @param {string|CronObject} input - Unix cron string or object with cron fields
 * @param {string|number} [year='*'] - Year field for AWS (ignored if input.year exists)
 * @returns {string} AWS EventBridge compatible cron expression
 */
function convertUnixToAwsCron(input, year = '*')
```

### CronObject Interface
```javascript
/**
 * @typedef {Object} CronObject
 * @property {string} minute - Minute field (0-59, *, ranges, lists, intervals)
 * @property {string} hour - Hour field (0-23, *, ranges, lists, intervals)  
 * @property {string} dayOfMonth - Day of month field (1-31, *, ranges, lists, intervals)
 * @property {string} month - Month field (1-12, *, ranges, lists, intervals)
 * @property {string} dayOfWeek - Day of week field (0-7, *, ranges, lists, intervals)
 * @property {string} [year] - Optional year field (overrides second parameter)
 */
```

### Internal Processing Functions

#### String Processing (Existing Logic)
```javascript
function processStringInput(unixCron, year) {
  // Current implementation moved here
  // Validates 5-field format
  // Splits string and processes each field
}
```

#### Object Processing (New Logic)
```javascript
function processObjectInput(cronObj, year) {
  // Validate required properties exist
  // Extract and validate each field
  // Handle optional year property
  // Convert to string format and reuse existing logic
}
```

#### Object Validation
```javascript
function validateCronObject(cronObj) {
  const required = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']
  // Check all required fields are present
  // Validate each field is a string
  // Return normalized object
}
```

## Data Models

### Input Validation Flow
1. **Type Detection**: Determine if input is string, object, or invalid
2. **String Path**: Use existing validation (5-field requirement, field parsing)
3. **Object Path**: 
   - Validate required properties exist
   - Validate each property is a string
   - Check for year property conflict
   - Convert to internal string format

### Field Processing
Both input types converge to the same field processing logic:
- Day-of-week conversion (Unix 0-7 to AWS 1-7)
- Day field exclusivity handling
- Year validation and formatting
- AWS cron format construction

## Error Handling

### Object-Specific Errors
```javascript
// Missing required fields
throw new Error('Missing required cron fields: minute, hour, dayOfMonth, month, dayOfWeek')

// Invalid field types
throw new Error('All cron fields must be strings. Invalid field: ${fieldName}')

// Year conflict warning
console.warn('Year specified in both object property and parameter. Using object property value.')

// Invalid input type
throw new Error('Input must be a string or object')
```

### Existing Error Handling
All current error conditions remain unchanged:
- Invalid string format
- Year validation errors
- Field validation errors

## Testing Strategy

### Test Organization
1. **Backward Compatibility Tests**: Ensure all existing string tests pass
2. **Object Input Tests**: Mirror existing test cases using object format
3. **Input Type Validation Tests**: Test type detection and error handling
4. **Year Parameter Tests**: Test year handling with both input types
5. **Equivalence Tests**: Verify string and object inputs produce identical outputs

### Test Structure
```javascript
describe('Object input support', () => {
  describe('Object format conversions', () => {
    // Test cases mirroring existing string tests
  })
  
  describe('Input type validation', () => {
    // Type detection and error handling
  })
  
  describe('Year parameter handling', () => {
    // Year precedence and conflict resolution
  })
  
  describe('Backward compatibility', () => {
    // Ensure existing functionality unchanged
  })
})
```

### Equivalence Testing Pattern
For each existing test case, create an equivalent object test:
```javascript
test('String vs Object equivalence - daily at noon', () => {
  const stringResult = convertUnixToAwsCron('0 12 * * *')
  const objectResult = convertUnixToAwsCron({
    minute: '0',
    hour: '12', 
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*'
  })
  assert.strictEqual(stringResult, objectResult)
})
```

## Implementation Approach

### Phase 1: Core Object Support
1. Add input type detection
2. Implement object validation
3. Create object-to-string conversion
4. Add basic object processing tests

### Phase 2: Feature Parity
1. Ensure all cron syntax features work with objects
2. Implement year parameter handling
3. Add comprehensive test coverage
4. Validate backward compatibility

### Phase 3: Error Handling & Polish
1. Implement detailed error messages
2. Add edge case handling
3. Performance optimization
4. Documentation updates