import { test, describe } from 'node:test'
import assert from 'node:assert'
import convertUnixToAwsCron from './index.js'

describe('Unix Crontab to AWS EventBridge Converter', () => {
  
  describe('Basic conversions', () => {
    const testCases = [
      {
        name: 'Daily at midnight',
        input: '0 0 * * *',
        expected: 'cron(0 0 ? * ? *)',
        description: 'Should convert simple daily schedule'
      },
      {
        name: 'Daily at noon',
        input: '0 12 * * *',
        expected: 'cron(0 12 ? * ? *)',
        description: 'Should convert daily schedule with specific hour'
      },
      {
        name: 'Every 15 minutes',
        input: '*/15 * * * *',
        expected: 'cron(*/15 * ? * ? *)',
        description: 'Should preserve minute intervals'
      },
      {
        name: 'Every hour at 30 minutes past',
        input: '30 * * * *',
        expected: 'cron(30 * ? * ? *)',
        description: 'Should convert hourly schedule with minute offset'
      }
    ];

    testCases.forEach(({ name, input, expected, description }) => {
      test(name, () => {
        const result = convertUnixToAwsCron(input);
        assert.strictEqual(result, expected, description);
      });
    });
  });

  describe('Day-of-week conversions', () => {
    const testCases = [
      {
        name: 'Sunday (0) conversion',
        input: '0 9 * * 0',
        expected: 'cron(0 9 ? * 1 *)',
        description: 'Should convert Sunday from 0 to 1'
      },
      {
        name: 'Sunday (7) conversion',
        input: '0 9 * * 7',
        expected: 'cron(0 9 ? * 1 *)',
        description: 'Should convert Sunday from 7 to 1'
      },
      {
        name: 'Monday conversion',
        input: '0 9 * * 1',
        expected: 'cron(0 9 ? * 2 *)',
        description: 'Should convert Monday from 1 to 2'
      },
      {
        name: 'Friday conversion',
        input: '0 17 * * 5',
        expected: 'cron(0 17 ? * 6 *)',
        description: 'Should convert Friday from 5 to 6'
      },
      {
        name: 'Saturday conversion',
        input: '0 8 * * 6',
        expected: 'cron(0 8 ? * 7 *)',
        description: 'Should convert Saturday from 6 to 7'
      },
      {
        name: 'Weekday range',
        input: '30 9 * * 1-5',
        expected: 'cron(30 9 ? * 2-6 *)',
        description: 'Should convert weekday range Mon-Fri'
      },
      {
        name: 'Weekend days',
        input: '0 10 * * 0,6',
        expected: 'cron(0 10 ? * 1,7 *)',
        description: 'Should convert weekend days (Sunday and Saturday)'
      }
    ];

    testCases.forEach(({ name, input, expected, description }) => {
      test(name, () => {
        const result = convertUnixToAwsCron(input);
        assert.strictEqual(result, expected, description);
      });
    });
  });

  describe('Day-of-month conversions', () => {
    const testCases = [
      {
        name: 'First day of month',
        input: '0 0 1 * *',
        expected: 'cron(0 0 1 * ? *)',
        description: 'Should set day-of-week to ? when day-of-month is specified'
      },
      {
        name: 'Mid-month',
        input: '0 12 15 * *',
        expected: 'cron(0 12 15 * ? *)',
        description: 'Should handle specific day of month'
      },
      {
        name: 'Last day of month',
        input: '0 23 31 * *',
        expected: 'cron(0 23 31 * ? *)',
        description: 'Should handle last possible day of month'
      },
      {
        name: 'Day range',
        input: '0 9 1-7 * *',
        expected: 'cron(0 9 1-7 * ? *)',
        description: 'Should handle day-of-month ranges'
      }
    ];

    testCases.forEach(({ name, input, expected, description }) => {
      test(name, () => {
        const result = convertUnixToAwsCron(input);
        assert.strictEqual(result, expected, description);
      });
    });
  });

  describe('Month conversions', () => {
    const testCases = [
      {
        name: 'Specific month',
        input: '0 12 1 6 *',
        expected: 'cron(0 12 1 6 ? *)',
        description: 'Should preserve month numbers'
      },
      {
        name: 'Month range',
        input: '0 9 * 3-9 *',
        expected: 'cron(0 9 ? 3-9 ? *)',
        description: 'Should handle month ranges'
      },
      {
        name: 'Multiple months',
        input: '0 6 1 1,4,7,10 *',
        expected: 'cron(0 6 1 1,4,7,10 ? *)',
        description: 'Should handle comma-separated months'
      }
    ];

    testCases.forEach(({ name, input, expected, description }) => {
      test(name, () => {
        const result = convertUnixToAwsCron(input);
        assert.strictEqual(result, expected, description);
      });
    });
  });

  describe('Year parameter handling', () => {
    const testCases = [
      {
        name: 'Default year (*)',
        input: '0 12 * * *',
        year: undefined,
        expected: 'cron(0 12 ? * ? *)',
        description: 'Should default to * for year when not specified'
      },
      {
        name: 'Specific year',
        input: '0 12 * * *',
        year: '2024',
        expected: 'cron(0 12 ? * ? 2024)',
        description: 'Should use specified year'
      },
      {
        name: 'Year range',
        input: '0 0 1 1 *',
        year: '2024-2026',
        expected: 'cron(0 0 1 1 ? 2024-2026)',
        description: 'Should handle year ranges'
      },
      {
        name: 'Wildcard year',
        input: '30 14 * * 5',
        year: '*',
        expected: 'cron(30 14 ? * 6 *)',
        description: 'Should handle explicit wildcard year'
      }
    ];

    testCases.forEach(({ name, input, year, expected, description }) => {
      test(name, () => {
        const result = year !== undefined 
          ? convertUnixToAwsCron(input, year)
          : convertUnixToAwsCron(input);
        assert.strictEqual(result, expected, description);
      });
    });
  });

  describe('Complex expressions', () => {
    const testCases = [
      {
        name: 'Business hours weekdays',
        input: '0 9-17 * * 1-5',
        expected: 'cron(0 9-17 ? * 2-6 *)',
        description: 'Should handle hour ranges with weekday ranges'
      },
      {
        name: 'Every 5 minutes during business hours',
        input: '*/5 9-17 * * 1-5',
        expected: 'cron(*/5 9-17 ? * 2-6 *)',
        description: 'Should handle minute intervals with hour and day ranges'
      },
      {
        name: 'Multiple minute values',
        input: '0,30 * * * *',
        expected: 'cron(0,30 * ? * ? *)',
        description: 'Should handle comma-separated minute values'
      },
      {
        name: 'Complex time pattern',
        input: '15,45 */2 1,15 */3 *',
        expected: 'cron(15,45 */2 1,15 */3 ? *)',
        description: 'Should handle complex patterns with multiple operators'
      }
    ];

    testCases.forEach(({ name, input, expected, description }) => {
      test(name, () => {
        const result = convertUnixToAwsCron(input);
        assert.strictEqual(result, expected, description);
      });
    });
  });

  describe('Mutual exclusivity handling', () => {
    const testCases = [
      {
        name: 'Both day fields specified - prioritize day-of-week',
        input: '0 12 15 * 1',
        expected: 'cron(0 12 ? * 2 *)',
        description: 'Should prioritize day-of-week when both day fields are specified'
      },
      {
        name: 'Both day fields with ranges',
        input: '30 9 1-7 * 1-5',
        expected: 'cron(30 9 ? * 2-6 *)',
        description: 'Should prioritize day-of-week range over day-of-month range'
      },
      {
        name: 'Complex day conflict',
        input: '0 8 */2 6 0,6',
        expected: 'cron(0 8 ? 6 1,7 *)',
        description: 'Should handle complex day field conflicts'
      }
    ];

    testCases.forEach(({ name, input, expected, description }) => {
      test(name, () => {
        const result = convertUnixToAwsCron(input);
        assert.strictEqual(result, expected, description);
      });
    });
  });

  describe('Object validation', () => {
    test('Valid object should pass validation', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*'
      };
      // Should pass validation and return converted result
      const result = convertUnixToAwsCron(cronObj);
      assert.strictEqual(result, 'cron(0 12 ? * ? *)');
    });

    test('Missing required field should throw error', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*'
        // missing dayOfWeek
      };
      assert.throws(
        () => convertUnixToAwsCron(cronObj),
        /Missing required cron fields: dayOfWeek/,
        'Should throw error for missing dayOfWeek field'
      );
    });

    test('Multiple missing required fields should throw error', () => {
      const cronObj = {
        minute: '0',
        hour: '12'
        // missing dayOfMonth, month, dayOfWeek
      };
      assert.throws(
        () => convertUnixToAwsCron(cronObj),
        /Missing required cron fields: dayOfMonth, month, dayOfWeek/,
        'Should throw error listing all missing fields'
      );
    });

    test('All missing required fields should throw error', () => {
      const cronObj = {};
      assert.throws(
        () => convertUnixToAwsCron(cronObj),
        /Missing required cron fields: minute, hour, dayOfMonth, month, dayOfWeek/,
        'Should throw error for empty object'
      );
    });

    test('Invalid field type should throw error', () => {
      const cronObj = {
        minute: 0, // should be string
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*'
      };
      assert.throws(
        () => convertUnixToAwsCron(cronObj),
        /All cron fields must be strings\. Invalid fields: minute \(received number\)/,
        'Should throw error for non-string field'
      );
    });

    test('Multiple invalid field types should throw error', () => {
      const cronObj = {
        minute: 0, // should be string
        hour: 12, // should be string
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*'
      };
      assert.throws(
        () => convertUnixToAwsCron(cronObj),
        /All cron fields must be strings\. Invalid fields: minute \(received number\), hour \(received number\)/,
        'Should throw error listing all invalid field types'
      );
    });

    test('Extra properties should be ignored', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
        extraField: 'ignored',
        anotherExtra: 123
      };
      // Should ignore extra properties and return converted result
      const result = convertUnixToAwsCron(cronObj);
      assert.strictEqual(result, 'cron(0 12 ? * ? *)');
    });

    test('Valid year property should be accepted', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
        year: '2024'
      };
      // Should accept valid year property and return converted result
      const result = convertUnixToAwsCron(cronObj);
      assert.strictEqual(result, 'cron(0 12 ? * ? 2024)');
    });

    test('Invalid year property type should throw error', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
        year: 2024 // should be string
      };
      assert.throws(
        () => convertUnixToAwsCron(cronObj),
        /Year field must be a string if provided \(received number\)/,
        'Should throw error for non-string year field'
      );
    });

    test('Boolean field values should throw error', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: true, // should be string
        month: '*',
        dayOfWeek: '*'
      };
      assert.throws(
        () => convertUnixToAwsCron(cronObj),
        /All cron fields must be strings\. Invalid fields: dayOfMonth \(received boolean\)/,
        'Should throw error for boolean field value'
      );
    });

    test('Array field values should throw error', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: ['1', '2'], // should be string
        dayOfWeek: '*'
      };
      assert.throws(
        () => convertUnixToAwsCron(cronObj),
        /All cron fields must be strings\. Invalid fields: month \(received object\)/,
        'Should throw error for array field value'
      );
    });

    test('Object field values should throw error', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: { value: '1' } // should be string
      };
      assert.throws(
        () => convertUnixToAwsCron(cronObj),
        /All cron fields must be strings\. Invalid fields: dayOfWeek \(received object\)/,
        'Should throw error for object field value'
      );
    });
  });

  describe('Year parameter handling for object input', () => {
    test('Object with year parameter should use parameter when no year property', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*'
      };
      const result = convertUnixToAwsCron(cronObj, '2024');
      assert.strictEqual(result, 'cron(0 12 ? * ? 2024)');
    });

    test('Object without year parameter should default to wildcard', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*'
      };
      const result = convertUnixToAwsCron(cronObj);
      assert.strictEqual(result, 'cron(0 12 ? * ? *)');
    });

    test('Object year property should take precedence over parameter', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
        year: '2025'
      };
      const result = convertUnixToAwsCron(cronObj, '2024');
      assert.strictEqual(result, 'cron(0 12 ? * ? 2025)');
    });

    test('Should warn when year is specified in both object and parameter', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
        year: '2025'
      };
      
      // Capture console.warn output
      const originalWarn = console.warn;
      let warnMessage = '';
      console.warn = (message) => {
        warnMessage = message;
      };
      
      const result = convertUnixToAwsCron(cronObj, '2024');
      
      // Restore console.warn
      console.warn = originalWarn;
      
      assert.strictEqual(result, 'cron(0 12 ? * ? 2025)');
      assert.strictEqual(warnMessage, 'Year specified in both object property and parameter. Using object property value.');
    });

    test('Should not warn when year parameter matches object year property', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
        year: '2024'
      };
      
      // Capture console.warn output
      const originalWarn = console.warn;
      let warnCalled = false;
      console.warn = () => {
        warnCalled = true;
      };
      
      const result = convertUnixToAwsCron(cronObj, '2024');
      
      // Restore console.warn
      console.warn = originalWarn;
      
      assert.strictEqual(result, 'cron(0 12 ? * ? 2024)');
      assert.strictEqual(warnCalled, false, 'Should not warn when year values match');
    });

    test('Should not warn when year parameter is default wildcard', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
        year: '2024'
      };
      
      // Capture console.warn output
      const originalWarn = console.warn;
      let warnCalled = false;
      console.warn = () => {
        warnCalled = true;
      };
      
      const result = convertUnixToAwsCron(cronObj); // No year parameter, defaults to '*'
      
      // Restore console.warn
      console.warn = originalWarn;
      
      assert.strictEqual(result, 'cron(0 12 ? * ? 2024)');
      assert.strictEqual(warnCalled, false, 'Should not warn when year parameter is default');
    });
  });

  describe('Input type validation', () => {
    test('String input should work', () => {
      const result = convertUnixToAwsCron('0 12 * * *');
      assert.strictEqual(result, 'cron(0 12 ? * ? *)');
    });

    test('Object input should work correctly', () => {
      const cronObj = {
        minute: '0',
        hour: '12',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*'
      };
      const result = convertUnixToAwsCron(cronObj);
      assert.strictEqual(result, 'cron(0 12 ? * ? *)');
    });

    test('Null input should throw error', () => {
      assert.throws(
        () => convertUnixToAwsCron(null),
        /Input must be a string or object, received: null/,
        'Should throw error for null input'
      );
    });

    test('Undefined input should throw error', () => {
      assert.throws(
        () => convertUnixToAwsCron(undefined),
        /Input must be a string or object, received: undefined/,
        'Should throw error for undefined input'
      );
    });

    test('Number input should throw error', () => {
      assert.throws(
        () => convertUnixToAwsCron(123),
        /Input must be a string or object, received: number/,
        'Should throw error for number input'
      );
    });

    test('Boolean input should throw error', () => {
      assert.throws(
        () => convertUnixToAwsCron(true),
        /Input must be a string or object, received: boolean/,
        'Should throw error for boolean input'
      );
    });

    test('Array input should throw error', () => {
      assert.throws(
        () => convertUnixToAwsCron(['0', '12', '*', '*', '*']),
        /Input must be a string or object, received: array/,
        'Should throw error for array input'
      );
    });

    test('Function input should throw error', () => {
      assert.throws(
        () => convertUnixToAwsCron(() => {}),
        /Input must be a string or object, received: function/,
        'Should throw error for function input'
      );
    });

    test('Date object input should throw validation error', () => {
      assert.throws(
        () => convertUnixToAwsCron(new Date()),
        /Missing required cron fields: minute, hour, dayOfMonth, month, dayOfWeek/,
        'Should route Date objects to object processing and fail validation'
      );
    });

    test('RegExp object input should throw validation error', () => {
      assert.throws(
        () => convertUnixToAwsCron(/test/),
        /Missing required cron fields: minute, hour, dayOfMonth, month, dayOfWeek/,
        'Should route RegExp objects to object processing and fail validation'
      );
    });

    test('Symbol input should throw error', () => {
      assert.throws(
        () => convertUnixToAwsCron(Symbol('test')),
        /Input must be a string or object, received: symbol/,
        'Should throw error for symbol input'
      );
    });
  });

  describe('Error handling', () => {
    test('Invalid string input type (legacy test)', () => {
      assert.throws(
        () => convertUnixToAwsCron(123),
        /Input must be a string or object, received: number/,
        'Should throw error for non-string input'
      );
    });

    test('Too few fields', () => {
      assert.throws(
        () => convertUnixToAwsCron('0 12 * *'),
        /Unix cron expression must have exactly 5 fields/,
        'Should throw error for insufficient fields'
      );
    });

    test('Too many fields', () => {
      assert.throws(
        () => convertUnixToAwsCron('0 12 * * * *'),
        /Unix cron expression must have exactly 5 fields/,
        'Should throw error for too many fields'
      );
    });

    test('Invalid year - too low', () => {
      assert.throws(
        () => convertUnixToAwsCron('0 12 * * *', '1969'),
        /Year must be between 1970-2199/,
        'Should throw error for year before 1970'
      );
    });

    test('Invalid year - too high', () => {
      assert.throws(
        () => convertUnixToAwsCron('0 12 * * *', '2200'),
        /Year must be between 1970-2199/,
        'Should throw error for year after 2199'
      );
    });

    test('Invalid year - not a number', () => {
      assert.throws(
        () => convertUnixToAwsCron('0 12 * * *', 'invalid'),
        /Year must be between 1970-2199/,
        'Should throw error for non-numeric year'
      );
    });

    test('Empty input', () => {
      assert.throws(
        () => convertUnixToAwsCron(''),
        /Unix cron expression must have exactly 5 fields/,
        'Should throw error for empty input'
      );
    });

    test('Whitespace only input', () => {
      assert.throws(
        () => convertUnixToAwsCron('   '),
        /Unix cron expression must have exactly 5 fields/,
        'Should throw error for whitespace-only input'
      );
    });
  });

  describe('String vs Object equivalence tests', () => {
    describe('Basic conversions equivalence', () => {
      const testCases = [
        {
          name: 'Daily at midnight',
          stringInput: '0 0 * * *',
          objectInput: { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
        },
        {
          name: 'Daily at noon',
          stringInput: '0 12 * * *',
          objectInput: { minute: '0', hour: '12', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
        },
        {
          name: 'Every 15 minutes',
          stringInput: '*/15 * * * *',
          objectInput: { minute: '*/15', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
        },
        {
          name: 'Every hour at 30 minutes past',
          stringInput: '30 * * * *',
          objectInput: { minute: '30', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
        }
      ];

      testCases.forEach(({ name, stringInput, objectInput }) => {
        test(name, () => {
          const stringResult = convertUnixToAwsCron(stringInput);
          const objectResult = convertUnixToAwsCron(objectInput);
          assert.strictEqual(stringResult, objectResult, `String and object inputs should produce identical results for: ${name}`);
        });
      });
    });

    describe('Day-of-week conversions equivalence', () => {
      const testCases = [
        {
          name: 'Sunday (0) conversion',
          stringInput: '0 9 * * 0',
          objectInput: { minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '0' }
        },
        {
          name: 'Sunday (7) conversion',
          stringInput: '0 9 * * 7',
          objectInput: { minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '7' }
        },
        {
          name: 'Monday conversion',
          stringInput: '0 9 * * 1',
          objectInput: { minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1' }
        },
        {
          name: 'Friday conversion',
          stringInput: '0 17 * * 5',
          objectInput: { minute: '0', hour: '17', dayOfMonth: '*', month: '*', dayOfWeek: '5' }
        },
        {
          name: 'Saturday conversion',
          stringInput: '0 8 * * 6',
          objectInput: { minute: '0', hour: '8', dayOfMonth: '*', month: '*', dayOfWeek: '6' }
        },
        {
          name: 'Weekday range',
          stringInput: '30 9 * * 1-5',
          objectInput: { minute: '30', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' }
        },
        {
          name: 'Weekend days',
          stringInput: '0 10 * * 0,6',
          objectInput: { minute: '0', hour: '10', dayOfMonth: '*', month: '*', dayOfWeek: '0,6' }
        }
      ];

      testCases.forEach(({ name, stringInput, objectInput }) => {
        test(name, () => {
          const stringResult = convertUnixToAwsCron(stringInput);
          const objectResult = convertUnixToAwsCron(objectInput);
          assert.strictEqual(stringResult, objectResult, `String and object inputs should produce identical results for: ${name}`);
        });
      });
    });

    describe('Day-of-month conversions equivalence', () => {
      const testCases = [
        {
          name: 'First day of month',
          stringInput: '0 0 1 * *',
          objectInput: { minute: '0', hour: '0', dayOfMonth: '1', month: '*', dayOfWeek: '*' }
        },
        {
          name: 'Mid-month',
          stringInput: '0 12 15 * *',
          objectInput: { minute: '0', hour: '12', dayOfMonth: '15', month: '*', dayOfWeek: '*' }
        },
        {
          name: 'Last day of month',
          stringInput: '0 23 31 * *',
          objectInput: { minute: '0', hour: '23', dayOfMonth: '31', month: '*', dayOfWeek: '*' }
        },
        {
          name: 'Day range',
          stringInput: '0 9 1-7 * *',
          objectInput: { minute: '0', hour: '9', dayOfMonth: '1-7', month: '*', dayOfWeek: '*' }
        }
      ];

      testCases.forEach(({ name, stringInput, objectInput }) => {
        test(name, () => {
          const stringResult = convertUnixToAwsCron(stringInput);
          const objectResult = convertUnixToAwsCron(objectInput);
          assert.strictEqual(stringResult, objectResult, `String and object inputs should produce identical results for: ${name}`);
        });
      });
    });

    describe('Month conversions equivalence', () => {
      const testCases = [
        {
          name: 'Specific month',
          stringInput: '0 12 1 6 *',
          objectInput: { minute: '0', hour: '12', dayOfMonth: '1', month: '6', dayOfWeek: '*' }
        },
        {
          name: 'Month range',
          stringInput: '0 9 * 3-9 *',
          objectInput: { minute: '0', hour: '9', dayOfMonth: '*', month: '3-9', dayOfWeek: '*' }
        },
        {
          name: 'Multiple months',
          stringInput: '0 6 1 1,4,7,10 *',
          objectInput: { minute: '0', hour: '6', dayOfMonth: '1', month: '1,4,7,10', dayOfWeek: '*' }
        }
      ];

      testCases.forEach(({ name, stringInput, objectInput }) => {
        test(name, () => {
          const stringResult = convertUnixToAwsCron(stringInput);
          const objectResult = convertUnixToAwsCron(objectInput);
          assert.strictEqual(stringResult, objectResult, `String and object inputs should produce identical results for: ${name}`);
        });
      });
    });

    describe('Year parameter handling equivalence', () => {
      const testCases = [
        {
          name: 'Default year (*)',
          stringInput: '0 12 * * *',
          objectInput: { minute: '0', hour: '12', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
          year: undefined
        },
        {
          name: 'Specific year',
          stringInput: '0 12 * * *',
          objectInput: { minute: '0', hour: '12', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
          year: '2024'
        },
        {
          name: 'Year range',
          stringInput: '0 0 1 1 *',
          objectInput: { minute: '0', hour: '0', dayOfMonth: '1', month: '1', dayOfWeek: '*' },
          year: '2024-2026'
        },
        {
          name: 'Wildcard year',
          stringInput: '30 14 * * 5',
          objectInput: { minute: '30', hour: '14', dayOfMonth: '*', month: '*', dayOfWeek: '5' },
          year: '*'
        }
      ];

      testCases.forEach(({ name, stringInput, objectInput, year }) => {
        test(name, () => {
          const stringResult = year !== undefined 
            ? convertUnixToAwsCron(stringInput, year)
            : convertUnixToAwsCron(stringInput);
          const objectResult = year !== undefined 
            ? convertUnixToAwsCron(objectInput, year)
            : convertUnixToAwsCron(objectInput);
          assert.strictEqual(stringResult, objectResult, `String and object inputs should produce identical results for: ${name}`);
        });
      });
    });

    describe('Complex expressions equivalence', () => {
      const testCases = [
        {
          name: 'Business hours weekdays',
          stringInput: '0 9-17 * * 1-5',
          objectInput: { minute: '0', hour: '9-17', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' }
        },
        {
          name: 'Every 5 minutes during business hours',
          stringInput: '*/5 9-17 * * 1-5',
          objectInput: { minute: '*/5', hour: '9-17', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' }
        },
        {
          name: 'Multiple minute values',
          stringInput: '0,30 * * * *',
          objectInput: { minute: '0,30', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
        },
        {
          name: 'Complex time pattern',
          stringInput: '15,45 */2 1,15 */3 *',
          objectInput: { minute: '15,45', hour: '*/2', dayOfMonth: '1,15', month: '*/3', dayOfWeek: '*' }
        }
      ];

      testCases.forEach(({ name, stringInput, objectInput }) => {
        test(name, () => {
          const stringResult = convertUnixToAwsCron(stringInput);
          const objectResult = convertUnixToAwsCron(objectInput);
          assert.strictEqual(stringResult, objectResult, `String and object inputs should produce identical results for: ${name}`);
        });
      });
    });

    describe('Day field conflict handling equivalence', () => {
      const testCases = [
        {
          name: 'Both day fields specified - prioritize day-of-week',
          stringInput: '0 12 15 * 1',
          objectInput: { minute: '0', hour: '12', dayOfMonth: '15', month: '*', dayOfWeek: '1' }
        },
        {
          name: 'Both day fields with ranges',
          stringInput: '30 9 1-7 * 1-5',
          objectInput: { minute: '30', hour: '9', dayOfMonth: '1-7', month: '*', dayOfWeek: '1-5' }
        },
        {
          name: 'Complex day conflict',
          stringInput: '0 8 */2 6 0,6',
          objectInput: { minute: '0', hour: '8', dayOfMonth: '*/2', month: '6', dayOfWeek: '0,6' }
        }
      ];

      testCases.forEach(({ name, stringInput, objectInput }) => {
        test(name, () => {
          // Capture console.warn output for both calls
          const originalWarn = console.warn;
          let stringWarnMessage = '';
          let objectWarnMessage = '';
          
          // Test string input
          console.warn = (message) => {
            stringWarnMessage = message;
          };
          const stringResult = convertUnixToAwsCron(stringInput);
          
          // Test object input
          console.warn = (message) => {
            objectWarnMessage = message;
          };
          const objectResult = convertUnixToAwsCron(objectInput);
          
          // Restore console.warn
          console.warn = originalWarn;
          
          // Both should produce identical results
          assert.strictEqual(stringResult, objectResult, `String and object inputs should produce identical results for: ${name}`);
          
          // Both should produce identical warning messages
          assert.strictEqual(stringWarnMessage, objectWarnMessage, `String and object inputs should produce identical warning messages for: ${name}`);
        });
      });
    });

    describe('Edge cases and real-world examples equivalence', () => {
      const testCases = [
        {
          name: 'Maintenance window - 2 AM on first Sunday',
          stringInput: '0 2 1-7 * 0',
          objectInput: { minute: '0', hour: '2', dayOfMonth: '1-7', month: '*', dayOfWeek: '0' }
        },
        {
          name: 'Backup schedule - Every weeknight at 11 PM',
          stringInput: '0 23 * * 1-5',
          objectInput: { minute: '0', hour: '23', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' }
        },
        {
          name: 'Report generation - 6 AM on weekdays',
          stringInput: '0 6 * * 1-5',
          objectInput: { minute: '0', hour: '6', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' }
        },
        {
          name: 'Database cleanup - Every 6 hours',
          stringInput: '0 */6 * * *',
          objectInput: { minute: '0', hour: '*/6', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
        },
        {
          name: 'Log rotation - Daily at 3:30 AM',
          stringInput: '30 3 * * *',
          objectInput: { minute: '30', hour: '3', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
        }
      ];

      testCases.forEach(({ name, stringInput, objectInput }) => {
        test(name, () => {
          const stringResult = convertUnixToAwsCron(stringInput);
          const objectResult = convertUnixToAwsCron(objectInput);
          assert.strictEqual(stringResult, objectResult, `String and object inputs should produce identical results for: ${name}`);
        });
      });
    });

    describe('Object with year property equivalence', () => {
      test('Object year property should match string with same year parameter', () => {
        const stringResult = convertUnixToAwsCron('0 12 * * *', '2024');
        const objectResult = convertUnixToAwsCron({
          minute: '0',
          hour: '12',
          dayOfMonth: '*',
          month: '*',
          dayOfWeek: '*',
          year: '2024'
        });
        assert.strictEqual(stringResult, objectResult, 'Object with year property should match string with year parameter');
      });

      test('Object year property should match string with year range parameter', () => {
        const stringResult = convertUnixToAwsCron('0 0 1 1 *', '2024-2026');
        const objectResult = convertUnixToAwsCron({
          minute: '0',
          hour: '0',
          dayOfMonth: '1',
          month: '1',
          dayOfWeek: '*',
          year: '2024-2026'
        });
        assert.strictEqual(stringResult, objectResult, 'Object with year range should match string with year range parameter');
      });

      test('Object year property should match string with wildcard year parameter', () => {
        const stringResult = convertUnixToAwsCron('30 14 * * 5', '*');
        const objectResult = convertUnixToAwsCron({
          minute: '30',
          hour: '14',
          dayOfMonth: '*',
          month: '*',
          dayOfWeek: '5',
          year: '*'
        });
        assert.strictEqual(stringResult, objectResult, 'Object with wildcard year should match string with wildcard year parameter');
      });
    });
  });

  describe('Edge cases and real-world examples', () => {
    const testCases = [
      {
        name: 'Maintenance window - 2 AM on first Sunday',
        input: '0 2 1-7 * 0',
        expected: 'cron(0 2 ? * 1 *)',
        description: 'Should handle first week Sunday pattern'
      },
      {
        name: 'Backup schedule - Every weeknight at 11 PM',
        input: '0 23 * * 1-5',
        expected: 'cron(0 23 ? * 2-6 *)',
        description: 'Should convert weeknight backup schedule'
      },
      {
        name: 'Report generation - 6 AM on weekdays',
        input: '0 6 * * 1-5',
        expected: 'cron(0 6 ? * 2-6 *)',
        description: 'Should convert weekday morning schedule'
      },
      {
        name: 'Database cleanup - Every 6 hours',
        input: '0 */6 * * *',
        expected: 'cron(0 */6 ? * ? *)',
        description: 'Should handle 6-hour interval pattern'
      },
      {
        name: 'Log rotation - Daily at 3:30 AM',
        input: '30 3 * * *',
        expected: 'cron(30 3 ? * ? *)',
        description: 'Should convert daily log rotation schedule'
      }
    ];

    testCases.forEach(({ name, input, expected, description }) => {
      test(name, () => {
        const result = convertUnixToAwsCron(input);
        assert.strictEqual(result, expected, description);
      })
    })
  })
})
