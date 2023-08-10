import { ApiProperty } from "@nestjs/swagger";

export class FavoriteDto {
    @ApiProperty({ nullable: true, default: 'REELS' })
    request_from: string;

    @ApiProperty()
    user_id: number;
}
