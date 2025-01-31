import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidadEmailSendExeception extends HttpException {
constructor() {
    super('El token de verificación es inválido.', HttpStatus.OK);
}
}

export class ExpiredTokenException extends HttpException {
  constructor() {
    super('El token de verificación ha expirado.', HttpStatus.BAD_REQUEST);
  }
}