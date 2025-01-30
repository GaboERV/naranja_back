import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // o cualquier otro servicio
      auth: {
        user: 'gabrie5887@gmail.com',
        pass: 'svjg fpsx gpvn rgsx',
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const mailOptions = {
      from: 'tu_correo@gmail.com',
      to: email,
      subject: 'Verificación de correo electrónico',
      html: `<p>Haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
             <a href="http://localhost:5173/Verify-email?token=${token}">Verificar correo</a>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}