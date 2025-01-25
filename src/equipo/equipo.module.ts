import { Module } from '@nestjs/common';
import { EquipoService } from './equipo.service';
import { EquipoController } from './equipo.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EquipoController],
  providers: [EquipoService, PrismaService],
  exports: [EquipoService],
})
export class EquipoModule {}
