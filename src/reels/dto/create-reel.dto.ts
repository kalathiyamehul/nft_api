import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateReelDto {

    @ApiProperty()
    title: string;

    @ApiProperty()
    video_url: string;

    @ApiProperty()
    description: string;

    @ApiPropertyOptional()
    video_type?: string;

    @ApiPropertyOptional()
    duration?: number;

    @ApiPropertyOptional()
    thumbnail_url?: string;

    @ApiPropertyOptional()
    audio_name: string;

    @ApiPropertyOptional()
    audio_duration: string;
    
    @ApiPropertyOptional()
    language: string;
    
    @ApiPropertyOptional()
    category: string;

}
export class CreateReelDtoVideo {

    @ApiProperty()
    title: string;

    @ApiPropertyOptional()
    video_url: string;

    @ApiProperty()
    description: string;

    @ApiPropertyOptional()
    video_type?: string;

    @ApiPropertyOptional()
    duration?: number;

    @ApiPropertyOptional()
    thumbnail_url?: string;

    @ApiPropertyOptional()
    audio_name: string;
    
    @ApiPropertyOptional()
    audio_id: number;

    @ApiPropertyOptional()
    audio_duration: string;

    @ApiPropertyOptional()
    language: string;
    
    @ApiPropertyOptional()
    category: string;
}
export class CreateWatermarkVideoDto {

    @ApiProperty()
    auther_name: string;

    @ApiProperty()
    video_url: string;
   
    @ApiPropertyOptional()
    audio_url: string;

}

export class WatchReelDto {

    @ApiProperty()
    reel_id: number

    @ApiProperty()
    watch_duration: number
}
