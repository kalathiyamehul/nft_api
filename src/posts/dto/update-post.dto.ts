import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class TaggedUsers {
    @ApiProperty()
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    profile_picture: string;
}
export class UpdatePostDto {

    @ApiProperty()
    file_url: string;

    @ApiProperty()
    description: string;

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
    
    @ApiPropertyOptional()
    postVisibility: string;
}
