import { ApiProperty } from "@nestjs/swagger";

export enum TypeRole {
    REELS = 'reels',
    POSTS = 'posts',
}
export enum TypeContent {
    REELS = 'reels',
    POSTS = 'posts',
}
export class ContentCollectionDto {
    @ApiProperty()
    type_id: number;

    @ApiProperty({ enum: ['reels', 'posts'] })
    type: TypeRole;
}
