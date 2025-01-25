import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateMiembroDto } from './dto/create-miembro.dto';
import { UpdateMiembroDto } from './dto/update-miembro.dto';

@Injectable()
export class MiembroService {
  constructor(private prisma: PrismaService) {}

  async create(createMiembroDto: CreateMiembroDto) {
    const { equipoId, ...miembroData } = createMiembroDto;
      // Verificar si el equipo existe
    const equipo = await this.prisma.equipo.findUnique({
        where: {id: equipoId},
    });
    if(!equipo){
        throw new NotFoundException(`Equipo con ID ${equipoId} no encontrado`);
    }
    try {
      return await this.prisma.miembro.create({
          data: {
              ...miembroData,
              equipo: {
                connect: {
                  id: equipoId
                }
            }
          },
        });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('correo')) {
        throw new ConflictException(
          `Ya existe un miembro con el correo electrónico ${createMiembroDto.correo}.`,
        );
      }
        throw error;
    }
  }

  async findAll() {
    return this.prisma.miembro.findMany();
  }

  async findByEquipoId(equipoId: number) {
      return this.prisma.miembro.findMany({
          where: { equipoId },
      });
  }

  async findOne(id: number) {
    return this.prisma.miembro.findUnique({ where: { id } });
  }

  async update(id: number, updateMiembroDto: UpdateMiembroDto) {
    return this.prisma.miembro.update({
      where: { id },
      data: updateMiembroDto,
    });
  }

  async remove(id: number) {
    return this.prisma.miembro.delete({ where: { id } });
  }
}