import cron from 'node-cron';

import { logger, stream } from "@utils/logger";
import { CronJob } from '../interfaces/cron.types.interface';

export class CronManager {
  private jobs: CronJob[] = [];

  // Register a cron job
  register(job: CronJob) {
    this.jobs.push(job);
  }

  // Start all registered cron jobs
  start() {
    this.jobs.forEach((job) => {
      cron.schedule(job.schedule, () => job.execute(), {
        timezone: job.timezone || 'UTC',
      });
      logger.info(`Cron job registered with schedule: ${job.schedule}`)
    });
  }
}
