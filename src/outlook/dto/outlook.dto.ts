import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined,  IsNotEmpty } from 'class-validator';

export class OutlookDto {

  @ApiProperty()
  gender: string;
  
  @ApiProperty()
  education: string;
  
  @ApiProperty()
  work: string;
  
  @ApiProperty()
  height: number;
  
  @ApiProperty()
  weight: number;
  
  @ApiProperty()
  age: number;
  
  @ApiProperty()
  drinking: boolean;
  
  @ApiProperty()
  smoking: boolean;
  
  @ApiProperty()
  relagion: string;
  
  @ApiProperty()
  language: string;
  
  @ApiProperty()
  intrest: string;
  
  @ApiProperty()
  politics: string;
  
  @ApiProperty()
  relationshipStatus: string;
 
  @ApiProperty()
  isSelfData: boolean;
}