import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowingDto {
  @ApiProperty()
  id: number;
}

export class RemoveDto {
  @ApiProperty()
  id: number;
}
