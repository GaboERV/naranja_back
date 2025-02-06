import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EquipoService } from './equipo.service';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { CreateEquipoDto } from './dto/create-equipo.dto';

@Controller('equipo')
export class EquipoController {
  constructor(private readonly equipoService: EquipoService) {}

  @Post()
  create(@Body() createEquipoDto: CreateEquipoDto) {
    return this.equipoService.create(createEquipoDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEquipoDto: UpdateEquipoDto) {
    return this.equipoService.update(+id, updateEquipoDto);
  }
  @Get('/empresa/:empresaId')
  findByEmpresaId(@Param('empresaId') empresaId: string) {
    return this.equipoService.findByEmpresaId(parseInt(empresaId, 10));
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equipoService.remove(+id);
  }
}
