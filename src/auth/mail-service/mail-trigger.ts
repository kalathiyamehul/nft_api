import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MailInterface } from '../interfaces/mail.interface';
import { getEmailBody, getEmailSubject, mailTransporter } from './constants';

export class MailTrigger {
  constructor(private mailInterface: MailInterface) {}

  async sendMail(): Promise<SMTPTransport.SentMessageInfo> {
    return mailTransporter.sendMail({
      from: process.env.EMAIL,
      to: this.mailInterface.email,
      subject: getEmailSubject(),
      html: getEmailBody(this.mailInterface),
    });
  }
}
