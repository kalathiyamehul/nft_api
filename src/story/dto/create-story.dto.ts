import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateStoryDto {
    @ApiProperty()
    latitude: string;

    @ApiProperty()
    longitude: string;

    @ApiProperty()
    image_url: string;

    @ApiProperty()
    caption: string;

}
