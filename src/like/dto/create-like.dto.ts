import { ApiProperty } from "@nestjs/swagger";

export enum TypeRole {
    REELS = 'reels',
    COLLECTION = 'collections',
    NFTS = 'nfts',
    POSTS = 'posts',
}
export enum TypeContent {
    REELS = 'reels',
    COLLECTION = 'collections',
    NFTS = 'nfts',
    STRORIES = 'stories',
    POSTS = 'posts',
}
export class CreateLikeDto {
    @ApiProperty()
    type_id: number;

    @ApiProperty({ enum: ['reels', 'collections', 'nfts', 'posts'] })
    type: TypeRole;
}
