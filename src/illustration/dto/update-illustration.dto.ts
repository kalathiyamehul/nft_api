import { PartialType } from '@nestjs/swagger';
import { CreateIllustrationDto } from './create-illustration.dto';

export class UpdateIllustrationDto extends PartialType(CreateIllustrationDto) {}
