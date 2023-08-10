import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSettingDto { }

export class CreateBlockUserDto {
    @ApiProperty()
    blocked_user_id: number;//3

    // @ApiPropertyOptional()
    // blocker_user_id: number; //2

}

export class CreateResctricUserDto {
    @ApiProperty()
    restricted_user_id: number;//3

    // @ApiPropertyOptional()
    // restricter_user_id: number; //2
}

export class CreateMuteUserDto {
    @ApiProperty()
    muted_user_id: number;//3

    // @ApiPropertyOptional()
    // muter_user_id: number; //2

}
export class ReportProblemSchemaDto {

    @ApiPropertyOptional()
    description: string;

    @ApiPropertyOptional()
    status: string;


    @ApiPropertyOptional()
    subject: string;

    @ApiPropertyOptional()
    attachments: string[];
}
export class Links {
    link: string;
    type: string;
}
export class RequestValidationDto {

    @ApiPropertyOptional()
    full_name: string;

    @ApiPropertyOptional()
    document_url: string;

    @ApiPropertyOptional()
    country: string;

    @ApiPropertyOptional()
    also_known_as: string;

    @ApiPropertyOptional()
    links: Links[];
}
export enum DocumentType {
    DRIVERLICENSE = "Driver's License",
    PASSPORT = 'Passport',
    NATIONAL_ID_CARD = 'NAtional identification card',
    TAX_FILING = 'Tax Filling',
    RECENTBILL = 'Recent utility Bill',
}

export enum Category {
    News = "News/media",
    Sports = 'Sports',
    Government = 'Government and Politics',
    Music = 'Music',
    Fashion = 'Fashion',
    Entertainment = 'Entertainment',
    Gamer = 'Gamer',
    Digital_Creator = 'Digital Creator',
    Other = 'Other',
    Global = 'Global Business/brand/organization',
}

export class ReportContentDto {

    @ApiPropertyOptional()
    report_text: string;

    @ApiPropertyOptional()
    type_id: string;
}

export class ReportContentUpdateDto {
    @ApiProperty()
    report_text: string;
}