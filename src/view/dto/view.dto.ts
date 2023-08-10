import { ApiProperty } from "@nestjs/swagger";

export enum TypeRole {
    REELS = 'reels',
    POSTS = 'posts',
    STORIES = 'stories',
    NFTS = 'nfts',
}
export enum TypeContent {
    REELS = 'reels',
    POSTS = 'posts',
    STORIES = 'stories',
    NFTS = 'nfts',
}
export class AddViewDto {
    @ApiProperty()
    type_id: number;

    @ApiProperty({ enum: ['reels', 'collections', 'nfts'] })
    type: TypeRole;
}
