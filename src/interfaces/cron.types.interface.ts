export interface CronJob {
    schedule: string; // Cron schedule string
    timezone?: string; // Optional timezone
    execute: () => void; // The function to execute
  }
  