# Product Overview

This is a utility library that converts standard Unix crontab expressions (5-field format) to AWS EventBridge cron expressions (6-field format with `cron()` wrapper).

## Key Purpose
- Enables developers to use familiar Unix cron syntax when working with AWS EventBridge scheduled events
- Handles the format differences and restrictions between Unix and AWS cron formats
- Provides a simple, single-function API for conversion

## Main Conversions
- Converts 5-field Unix format to 6-field AWS format
- Adds required `cron()` wrapper for AWS
- Converts Unix day-of-week numbering (0-7) to AWS format (1-7)
- Handles AWS restriction where day-of-month and day-of-week cannot both be specified
- Replaces unused wildcards (*) with question marks (?) as required by AWS
- Adds configurable year field (defaults to *)

## Target Users
Developers working with AWS EventBridge who want to use standard crontab syntax instead of learning AWS-specific cron format.