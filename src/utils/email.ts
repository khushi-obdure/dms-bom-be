// const nodemailer = require('nodemailer');
import nodemailer, { Transporter } from "nodemailer";

import { logger } from "@utils/logger";
import { Email } from "@interfaces/email.interface";
import { MAIL_FROM, MAIL_USERNAME, MAIL_PASSWORD } from "@config";

/**
 * @method sendEmail
 * @param data Email
 * @returns boolean - true if email sent else false
 * @description send mail
 */

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USERNAME,
        pass: MAIL_PASSWORD,
      },
    });
  }

  public async sendMail(data: Email): Promise<boolean | object> {
    const mailOptions = {
      from: MAIL_FROM,
      to: data.emailTo,
      cc: data.cc,
      subject: data.subject,
      html: data.html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info("Email sent", info);
      return info;
    } catch (error) {
      logger.error(`Error in sendmail`, error);
      return false;
    }
  }
}

export default EmailService;
