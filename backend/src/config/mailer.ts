import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'metzsilvoza@gmail.com',
    pass: process.env.EMAIL_PASS || 'vete ajas liln ndtz',
  },
});

export default transporter;
