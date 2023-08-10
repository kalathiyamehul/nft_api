import { PartialType } from '@nestjs/swagger';
import { CreateFutureVisiteDto } from './create-future-visite.dto';

export class UpdateFutureVisiteDto extends PartialType(CreateFutureVisiteDto) {}
