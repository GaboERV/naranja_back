import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { Proyecto } from '@prisma/client';

@Controller('proyecto')
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @Get()
  async obtenerTodos(): Promise<Proyecto[]> {
    return this.proyectoService.obtenerTodos();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string): Promise<Proyecto | null> {
    return this.proyectoService.obtenerPorId(Number(id));
  }

  @Post()
  async crear(@Body() datos: Omit<Proyecto, 'id'>): Promise<Proyecto> {
    return this.proyectoService.crear(datos);
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() datos: Partial<Proyecto>): Promise<Proyecto> {
    return this.proyectoService.actualizar(Number(id), datos);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string): Promise<Proyecto> {
    return this.proyectoService.eliminar(Number(id));
  }
}
