import { ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFutureVisiteDto {

    @ApiPropertyOptional()
    latitude: string;

    @ApiPropertyOptional()
    longitude: string;

    @ApiPropertyOptional()
    priority: string;

    @ApiPropertyOptional()
    expected_date: Date;

}
