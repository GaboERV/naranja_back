import { PartialType } from '@nestjs/swagger';
import { CreateMiembroDto } from './create-miembro.dto';

export class UpdateMiembroDto extends PartialType(CreateMiembroDto) {}
