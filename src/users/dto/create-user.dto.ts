import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined,  IsEmail,  isEmail,  IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateUserDto {

  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string

  @ApiPropertyOptional()
  latitude: string;

  @ApiPropertyOptional()
  longitude: string;

}
