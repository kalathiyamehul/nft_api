import { MailInterface } from '../interfaces/mail.interface';
import { createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Transporter } from 'nodemailer';
export let mailTransporter: Transporter<SMTPTransport.SentMessageInfo> =
  createTransport({
    service: 'gmail', // hostname
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'micwilson13892@gmail.com',
      pass: 'mEhul@#123..',
    },
  });

export function getEmailSubject(): string {
  return `Fitness App Reset Password Assistance`;
}

export function getEmailBody(mailInterface: MailInterface): string {
  return `<h2>Hello, ${mailInterface.name}</h2>
  <p>Welcome to <strong>Fitness App</strong></p>
  <p>We have received your password change request. This email contains the required information needed to change your password.</p>
  <p>change password with otp <strong>${mailInterface.otp}</strong></p>
  <p>Thanks & Regards,</p>
  <p>Fitness Team</p>`;
}
