import { ApiProperty } from "@nestjs/swagger";

export enum TypeRole {
    REELS = 'reels',
    POSTS = 'posts',
}
export enum CategoryRole {
    SPAM = "It's Spam",
    NOT_LIKE = "I just don't like it",
    NUDITY = "Nudity or Sexual Activity",
    HATE_SPEECH = "Hate Speech or Symbols",
    VIOLENCE = "Violence or Dangerous Organization",
    FALSE_INFO = "False Information",
    BULLING = "Bulling or Harasment",
    SCAM = "Scam or Fraud",
    PROPERTY_VIOLATION = "Intelleactual Property Violation",
    SUCIDE = "Sucide or self Injury",
    ILLEGAL_GOODS = "Sale of Illegal or Regulated Goods"
}
export class ContentReportDto {
    @ApiProperty()
    type_id: number;

    @ApiProperty({ enum: ['reels', 'posts'] })
    type: TypeRole;

    @ApiProperty({ enum: ["It's Spam", "I just don't like it", "Nudity or Sexual Activity", "Hate Speech or Symbols", "Violence or Dangerous Organization", "False Information", "Bulling or Harasment", "Scam or Fraud", "Intelleactual Property Violation", "Sucide or self Injury", "Sale of Illegal or Regulated Goods"] })
    category: CategoryRole;
}
