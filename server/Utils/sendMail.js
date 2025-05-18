import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.SMTP_USER);
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendMail({ to, subject, text, html }) {
    const mailOptions = {
      from: `"Digital Wallet" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };
  
    await transporter.sendMail(mailOptions);
}