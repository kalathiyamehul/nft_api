import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class GetMessagesDto {
    
  @IsDefined()
  @ApiProperty()
  @IsNotEmpty()
  from: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  to: string;

}
