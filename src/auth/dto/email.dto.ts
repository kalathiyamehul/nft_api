import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail } from 'class-validator';

export class EmailDto {
  @IsDefined()
  @IsEmail()
  @ApiProperty()
  readonly email: string;
}
