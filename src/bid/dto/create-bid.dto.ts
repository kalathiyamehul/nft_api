import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuctionSchema } from "src/auctions/entities/auction.entity";
import { NftSchema } from "src/nft/entities/nft.entity";

export class CreateBidDto {
    @ApiProperty()
    cryptoCost: number;

    @ApiPropertyOptional()
    cryptoType?: string;


    @ApiPropertyOptional()
    auction_id?: number

}
