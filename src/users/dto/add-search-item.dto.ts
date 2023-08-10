import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class AddSearchItemDto {

  @ApiProperty()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty()
  profile_photo: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;
}
