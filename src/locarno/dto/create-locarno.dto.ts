import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateLocationDto {
    @ApiPropertyOptional()
    name: string
    @ApiPropertyOptional()
    category: string
    @ApiProperty()
    latitude: string
    @ApiProperty()
    longitude: string
    @ApiPropertyOptional()
    address1: string
    @ApiPropertyOptional()
    address2: string
    @ApiPropertyOptional()
    city: string
    @ApiPropertyOptional()
    country: string
    @ApiPropertyOptional()
    postcode: number
    @ApiPropertyOptional()
    mobile_no: string
    @ApiPropertyOptional()
    website: string
    @ApiPropertyOptional()
    images: string[]
}
