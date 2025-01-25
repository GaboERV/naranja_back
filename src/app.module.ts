import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { PrismaService } from './prisma/prisma.service';
import { EquipoModule } from './equipo/equipo.module';
import { MiembroModule } from './miembro/miembro.module';

@Module({
  imports: [AuthModule, EquipoModule, MiembroModule],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
