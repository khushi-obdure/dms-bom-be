import { logger, stream } from "@utils/logger";
import ApprovalService from "../services/approval.service";
import { CronJob } from "../interfaces/cron.types.interface";

export class DailyTwiceJob implements CronJob {
  public approvalService = new ApprovalService();
  schedule = "0 8,20 * * *"; 
  timezone = "UTC"; // Optional timezone

  async execute() {
    try {
      logger.info("DailyTwice Job started")
      this.approvalService.sendEmailForPendingApproval();
    } catch (error) {
      logger.error("Error in DailyTwice Job", error?.message)
    }
  }
}
