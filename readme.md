# unix-cron-to-aws-cron

when you want to support standard unix crontab syntax running on aws eventbridge

## key conversions

- field count: converts 5-field unix format to 6-field aws format
- adds cron() wrapper
- converts unix (0-7) to aws (1-7) format
- handles aws restriction where you can't specify both day fields
- replaces unused * with ? as required by aws
- adds configurable year field (defaults to *)

## examples

- daily at noon: `0 12 * * *` → `cron(0 12 ? * ? *)`
- weekdays at 9:30: `30 9 * * 1-5` → `cron(30 9 ? * 2-6 *)`
- every sunday: `0 2 * * 0` → `cron(0 2 ? * 1 *)`
- first of month: `0 0 1 * *` → `cron(0 0 1 * ? *)`
