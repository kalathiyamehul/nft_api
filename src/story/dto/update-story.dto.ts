import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class UpdateStoryDto {
    @ApiPropertyOptional()
    status: string
}