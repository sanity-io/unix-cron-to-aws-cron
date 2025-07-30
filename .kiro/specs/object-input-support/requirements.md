# Requirements Document

## Introduction

This feature enhances the existing Unix-to-AWS cron conversion library to accept structured object input in addition to the current string-based cron expressions. This will provide developers with a more programmatic and type-safe way to construct cron expressions, while maintaining backward compatibility with the existing string-based API.

## Requirements

### Requirement 1

**User Story:** As a developer using the cron conversion library, I want to pass cron field values as an object with named properties, so that I can construct cron expressions programmatically without string concatenation.

#### Acceptance Criteria

1. WHEN I call the function with an object containing cron field properties THEN the system SHALL convert it to the appropriate AWS cron format
2. WHEN I pass an object with properties `minute`, `hour`, `dayOfMonth`, `month`, and `dayOfWeek` THEN the system SHALL process each field according to existing conversion rules
3. WHEN I pass an object with valid cron field values THEN the system SHALL return the same AWS cron format as the equivalent string input
4. WHEN I pass an object with missing required properties THEN the system SHALL throw a descriptive error message

### Requirement 2

**User Story:** As a developer, I want the function to maintain backward compatibility with string input, so that existing code continues to work without modification.

#### Acceptance Criteria

1. WHEN I pass a string as the first argument THEN the system SHALL process it using the existing string-based logic
2. WHEN I pass a string input THEN the system SHALL return the same output as before this enhancement
3. WHEN I pass both string and object formats in different calls THEN the system SHALL produce equivalent results for equivalent cron expressions
4. WHEN existing tests run THEN they SHALL continue to pass without modification

### Requirement 3

**User Story:** As a developer, I want clear validation and error messages for object input, so that I can quickly identify and fix input errors.

#### Acceptance Criteria

1. WHEN I pass an object with invalid property types THEN the system SHALL throw an error indicating the expected type for each field
2. WHEN I pass an object with extra/unknown properties THEN the system SHALL ignore them and process only the recognized cron fields
3. WHEN I pass an object missing required cron fields THEN the system SHALL throw an error listing the missing required fields
4. WHEN I pass an empty object THEN the system SHALL throw an error indicating that cron fields are required

### Requirement 4

**User Story:** As a developer, I want the object input to support the same cron syntax features as string input, so that I have full flexibility in both input formats.

#### Acceptance Criteria

1. WHEN I use cron expressions with ranges (e.g., "1-5") in object properties THEN the system SHALL process them correctly
2. WHEN I use cron expressions with lists (e.g., "1,3,5") in object properties THEN the system SHALL process them correctly
3. WHEN I use cron expressions with intervals (e.g., "*/15") in object properties THEN the system SHALL process them correctly
4. WHEN I use wildcards ("*") in object properties THEN the system SHALL apply the same conversion rules as string input
5. WHEN I specify conflicting day fields in the object THEN the system SHALL apply the same prioritization logic as string input

### Requirement 5

**User Story:** As a developer, I want the year parameter to work consistently with both input formats, so that I can specify custom years regardless of input type.

#### Acceptance Criteria

1. WHEN I pass an object as the first argument and a year as the second argument THEN the system SHALL use the specified year
2. WHEN I pass an object as the first argument without a year parameter THEN the system SHALL default the year to "*"
3. WHEN I include a `year` property in the input object THEN the system SHALL use that value and ignore the second parameter
4. WHEN I specify year in both the object property and second parameter THEN the system SHALL prioritize the object property and warn about the conflict