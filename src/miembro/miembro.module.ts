import { Module } from '@nestjs/common';
import { MiembroService } from './miembro.service';
import { MiembroController } from './miembro.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MiembroController],
  providers: [MiembroService, PrismaService],
  exports: [MiembroService],
})
export class MiembroModule {}
