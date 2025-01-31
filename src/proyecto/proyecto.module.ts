import { Module } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ProyectoController],
  providers: [ProyectoService, PrismaService],
  exports:[ProyectoService]
})
export class ProyectoModule {}
