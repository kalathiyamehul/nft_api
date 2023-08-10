import { ApiProperty } from "@nestjs/swagger";

export class CreateCommentDto {

    @ApiProperty()
    comment: string;

    @ApiProperty()
    type_id: number;
    
}

export class updateCommentDto {
    @ApiProperty()
    comment: string;
}