/**
 * Converts a standard Unix crontab expression to AWS EventBridge cron format
 * 
 * @param {string} unixCron - Standard 5-field Unix crontab expression
 * @param {string|number} [year='*'] - Year field for AWS (default: '*' for all years)
 * @returns {string} AWS EventBridge compatible cron expression
 * @throws {Error} If the input cron expression is invalid
 */
export default function convertUnixToAwsCron(unixCron, year = '*') {
  // Validate input
  if (typeof unixCron !== 'string') {
    throw new Error('Cron expression must be a string')
  }

  const fields = unixCron.trim().split(/\s+/)
  
  if (fields.length !== 5) {
    throw new Error('Unix cron expression must have exactly 5 fields (minute hour day-of-month month day-of-week)')
  }

  let [minute, hour, dayOfMonth, month, dayOfWeek] = fields

  // Convert day-of-week from Unix (0-7, where 0&7=Sunday) to AWS (1-7, where 1=Sunday)
  dayOfWeek = convertDayOfWeek(dayOfWeek)

  // Convert month numbers to AWS format (supports both numeric and text)
  month = convertMonth(month)

  // Handle mutual exclusivity of day fields in AWS
  const { awsDayOfMonth, awsDayOfWeek } = handleDayFieldExclusivity(dayOfMonth, dayOfWeek)

  // Validate year field
  const awsYear = validateYear(year)

  // Construct AWS cron expression
  const awsCron = `cron(${minute} ${hour} ${awsDayOfMonth} ${month} ${awsDayOfWeek} ${awsYear})`

  return awsCron
}

/**
 * Converts Unix day-of-week values to AWS format
 */
function convertDayOfWeek(dayOfWeek) {
  if (dayOfWeek === '*') return '*'
  
  // Handle numeric values
  return dayOfWeek.replace(/\b([0-7])\b/g, (match, day) => {
    const dayNum = parseInt(day)
    if (dayNum === 0 || dayNum === 7) return '1' // Sunday
    return (dayNum + 1).toString() // Shift: Mon(1)→Tue(2), ..., Sat(6)→Sun(7)
  })
}

/**
 * Converts month values - Unix supports only numbers, AWS supports both numbers and names
 */
function convertMonth(month) {
  // AWS already supports 1-12 numeric format, so no conversion needed
  // This function exists for potential future enhancements (e.g., converting to month names)
  return month
}

/**
 * Handles AWS restriction: cannot specify both day-of-month and day-of-week
 * If both are specified, prioritize day-of-week and set day-of-month to '?'
 */
function handleDayFieldExclusivity(dayOfMonth, dayOfWeek) {
  const isDayOfMonthSpecified = dayOfMonth !== '*'
  const isDayOfWeekSpecified = dayOfWeek !== '*'

  if (isDayOfMonthSpecified && isDayOfWeekSpecified) {
    // AWS doesn't allow both - prioritize day-of-week
    console.warn('Both day-of-month and day-of-week specified. Using day-of-week and setting day-of-month to "?"')
    return {
      awsDayOfMonth: '?',
      awsDayOfWeek: dayOfWeek
    }
  }

  // Convert * to ? for the unused field (AWS requirement)
  return {
    awsDayOfMonth: isDayOfMonthSpecified ? dayOfMonth : '?',
    awsDayOfWeek: isDayOfWeekSpecified ? dayOfWeek : '?'
  }
}

/**
 * Validates and formats the year field
 */
function validateYear(year) {
  if (year === '*') return '*'
  
  const yearNum = parseInt(year)
  if (isNaN(yearNum) || yearNum < 1970 || yearNum > 2199) {
    throw new Error('Year must be between 1970-2199 or "*"')
  }
  
  return year.toString()
}
