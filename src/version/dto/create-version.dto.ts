import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined,  IsNotEmpty } from 'class-validator';

export class CreateVersionDto {

  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  os: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  version: number;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  is_force_update: boolean

}

export class UpdateVersionDto {

  @ApiProperty()
  id: string;

  @IsDefined()
  @ApiProperty()
  os: string;

  @IsDefined()
  @ApiProperty()
  version: number;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  is_force_update: boolean

}