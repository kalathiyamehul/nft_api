import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFavoriteDto {
    @ApiProperty()
    post_id: number;
}

export class HidePostDto {
    @ApiProperty()
    post_id: number;
}

export class TaggedUsers {
    @ApiProperty()
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    profile_picture: string;
}

export class CreatePostDto {

    @ApiProperty()
    file_url: string;

    @ApiProperty()
    description: string;
    
    @ApiProperty()
    postVisibility: string;

    @ApiPropertyOptional()
    file_type?: string;

    @ApiPropertyOptional()
    thumbnail_url?: string;

    @ApiPropertyOptional()
    tagged_users?: TaggedUsers[]

    @ApiPropertyOptional()
    source: string;

    @ApiPropertyOptional()
    location: string;
}