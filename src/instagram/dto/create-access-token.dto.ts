import { ApiProperty } from "@nestjs/swagger";

export class CreateAccessTokenDto {

    @ApiProperty()
    code: string;

}
