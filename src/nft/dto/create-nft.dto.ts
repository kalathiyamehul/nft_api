import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserSchema } from "src/users/entities/user.entity";

export class CreateNftDto {
    @ApiProperty()
    numberOfNft: number

    @ApiProperty()
    author: string

    @ApiProperty()
    description: string
}

export class AttributesDto {
    @ApiProperty()
    trait_type: string
    @ApiProperty()
    trait_text: string
    @ApiProperty()
    value: string
}
export class CreateNftDBDto {

    @ApiProperty()
    name: string

    @ApiPropertyOptional()
    browser_signature?: string

    @ApiProperty()
    description: string

    @ApiProperty()
    author?: UserSchema;

    @ApiProperty()
    image_url: string;

    @ApiProperty()
    supply: number

    @ApiProperty()
    numberOfNft?: number

    @ApiPropertyOptional()
    cryptoCost?: string;


    @ApiProperty()
    created_by: string;

    @ApiPropertyOptional()
    cryptoType?: string;

    @ApiPropertyOptional()
    ownerId?: string;

    @ApiPropertyOptional()
    unique_string?: string

    @ApiPropertyOptional()
    nft_is_minted?: boolean;

    @ApiPropertyOptional()
    edition?: string

    @ApiPropertyOptional()
    collection_id?: string

    @ApiPropertyOptional()
    attributes?: AttributesDto[]

    @ApiPropertyOptional()
    total_like?: number

    @ApiPropertyOptional()
    total_bookmark?: number


}
export class CreateNftAppDto {

    @ApiProperty()
    name: string

    @ApiProperty()
    description: string

    @ApiProperty()
    author?: UserSchema;

    @ApiProperty()
    image_url: string;

    @ApiPropertyOptional()
    cryptoCost?: string;
     
    @ApiPropertyOptional()
    cryptoType?: string;
    
    @ApiProperty()
    service_fee: number;
    
    @ApiProperty()
    royalties: number;
}
export class GetNftQueryDto {
    limit?: number;
    page?: number;
}