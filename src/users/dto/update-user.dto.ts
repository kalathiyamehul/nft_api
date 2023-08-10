import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {

    @ApiPropertyOptional()
    preference: string[];

    @ApiPropertyOptional()
    professional_summery: string;

    @ApiPropertyOptional()
    first_name: string;

    @ApiPropertyOptional()
    last_name: string;

    @ApiPropertyOptional()
    username: string;

    @ApiPropertyOptional()
    email: string;

    @ApiPropertyOptional()
    is_creator: string;

    @ApiPropertyOptional()
    walletAddress: string;

    @ApiPropertyOptional()
    profile_photo: string;

    @ApiPropertyOptional()
    cover_photo: string;

    @ApiPropertyOptional()
    invisible_mode: boolean

    @ApiPropertyOptional()
    phone: string

    @ApiPropertyOptional()
    professional_account: boolean

    @ApiPropertyOptional()
    business_name: string

    @ApiPropertyOptional()
    business_category: string

    @ApiPropertyOptional()
    business_website: string

    @ApiPropertyOptional()
    language: string

    @ApiPropertyOptional()
    reels_category: string[]
}
