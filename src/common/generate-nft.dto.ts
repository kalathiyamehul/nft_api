import { ApiProperty } from "@nestjs/swagger";

export class GenerateNftDTO {
    @ApiProperty()
    numberOfNft: number
}