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

  describe('Error handling', () => {
    test('Invalid input type', () => {
      assert.throws(
        () => convertUnixToAwsCron(123),
        /Cron expression must be a string/,
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
