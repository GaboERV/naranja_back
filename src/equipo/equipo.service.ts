import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';

@Injectable()
export class EquipoService {
  constructor(private prisma: PrismaService) {}

  async create(createEquipoDto: CreateEquipoDto) {
    const { empresaId, proyectoId, ...equipoData } = createEquipoDto;

    // Verificar si la empresa existe
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada.`);
    }
    const data: any = {
      ...equipoData,
      empresa: {
        connect: {
          id: empresaId,
        },
      },
    };
    if (proyectoId) {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: proyectoId },
      });
      if (!proyecto) {
        throw new NotFoundException(
          `Proyecto con ID ${proyectoId} no encontrado`,
        );
      }
      data.proyecto = {
        connect: {
          id: proyectoId,
        },
      };
    }

    return this.prisma.equipo.create({
      data: data,
    });
  }

  async findAll() {
    return this.prisma.equipo.findMany();
  }

  async findOne(id: number) {
    return this.prisma.equipo.findUnique({ where: { id } });
  }

  async update(id: number, updateEquipoDto: UpdateEquipoDto) {
    const { empresaId, proyectoId, ...equipoData } = updateEquipoDto;

    const data: any = {
      ...equipoData,
    };
    if (empresaId) {
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: empresaId },
      });
      if (!empresa) {
        throw new NotFoundException(
          `Empresa con ID ${empresaId} no encontrada.`,
        );
      }
      data.empresa = {
        connect: {
          id: empresaId,
        },
      };
    }
    if (proyectoId) {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: proyectoId },
      });
      if (!proyecto) {
        throw new NotFoundException(
          `Proyecto con ID ${proyectoId} no encontrado.`,
        );
      }
      data.proyecto = {
        connect: {
          id: proyectoId,
        },
      };
    }

    return this.prisma.equipo.update({
      where: { id },
      data: data,
    });
  }
  async findByEmpresaId(empresaId: number) {
    return this.prisma.equipo.findMany({
        where: { empresaId },
        include: { miembros: true, proyecto:{select:{nombre:true}} },
    });
}

  async remove(id: number) {
    return this.prisma.equipo.delete({ where: { id } });
  }
}
