import { ApiProperty } from "@nestjs/swagger";

export class CreateAuctionDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    auctionDate: Date;

    @ApiProperty()
    start_bid: number;

    @ApiProperty()
    nfts: number;

}

// export class EditAuctionDto extends PartialType(CreateAuctionDto) {}


export class EditAuctionDto {
    @ApiProperty()
    id: string;
    
    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    auctionDate: Date;

    @ApiProperty()
    start_bid: number;

}
