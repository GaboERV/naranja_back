import { Injectable } from '@nestjs/common';
import { Proyecto } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProyectoService {
  constructor(private prisma: PrismaService) {}

  async obtenerTodos(): Promise<Proyecto[]> {
    return this.prisma.proyecto.findMany({
      include: {
        empresa: true,
        equipos: true,
        recursos: true,
      },
    });
  }

  async obtenerPorId(id: number): Promise<Proyecto | null> {
    return this.prisma.proyecto.findUnique({
      where: { id },
      include: { empresa: true, equipos: true, recursos: true },
    });
  }

  async crear(datos: Omit<Proyecto, 'id'>): Promise<Proyecto> {
    return this.prisma.proyecto.create({
      data: datos,
    });
  }

  async actualizar(id: number, datos: Partial<Proyecto>): Promise<Proyecto> {
    return this.prisma.proyecto.update({
      where: { id },
      data: datos,
    });
  }

  async eliminar(id: number): Promise<Proyecto> {
    return this.prisma.proyecto.delete({
      where: { id },
    });
  }
}
