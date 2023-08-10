import { ApiPropertyOptional } from "@nestjs/swagger";

export class CreateIllustrationDto {

    @ApiPropertyOptional()
    latitude: string;

    @ApiPropertyOptional()
    longitude: string;

    @ApiPropertyOptional()
    actual_latitude: string;

    @ApiPropertyOptional()
    actual_longitude: string;

}
