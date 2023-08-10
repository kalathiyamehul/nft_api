import { ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateReelDto {

    @ApiPropertyOptional()
    title: string;

    @ApiPropertyOptional()
    video_url: string;

    @ApiPropertyOptional()
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
