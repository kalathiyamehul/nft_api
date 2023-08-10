import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined,  IsNotEmpty } from 'class-validator';

export class CheckVersionDto {

  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  os: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  version: number;
}
