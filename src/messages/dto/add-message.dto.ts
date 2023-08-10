import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsEmail, isEmail, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class AddMessageDto {


  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  from: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  to: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string

  @ApiProperty()
  file_url: object;

  @ApiPropertyOptional()
  type: string

  @ApiPropertyOptional()
  source: string

  @ApiPropertyOptional()
  source_id: number

  @ApiPropertyOptional()
  source_author_id: number
}
