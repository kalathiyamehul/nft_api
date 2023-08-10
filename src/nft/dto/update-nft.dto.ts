import { ApiProperty, PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateNftDBDto, CreateNftDto } from './create-nft.dto';
import { UserSchema } from "src/users/entities/user.entity";

export class UpdateNftDto extends PartialType(CreateNftDBDto) {
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

    @ApiProperty()
    nft_is_minted: boolean
}

export class NftHistoryDto extends PartialType(CreateNftDBDto) {
    @ApiProperty()
    description: string
}
