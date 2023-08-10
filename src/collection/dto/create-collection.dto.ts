import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCollectionDto {

    @ApiProperty()
    description: string;

    @ApiProperty()
    collection_name: string;

    @ApiProperty()
    collection_address: string;

    @ApiProperty()
    collection_symbol: string;

    @ApiProperty()
    category: string

    @ApiProperty()
    created_by: string

    @ApiPropertyOptional()
    collection_cover_image?: string;

    @ApiPropertyOptional()
    collection_logo_image?: string;

    @ApiPropertyOptional()
    number_of_nfts?: number;

    @ApiPropertyOptional()
    total_like?: number

    @ApiPropertyOptional()
    total_bookmark?: number
}
