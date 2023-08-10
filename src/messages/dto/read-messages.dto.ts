import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class ReadMessagesDto {
    
  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  ownerId: number;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  senderId: number;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  msg_id: number;

}
