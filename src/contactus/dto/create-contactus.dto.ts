import { ApiProperty } from "@nestjs/swagger";

export class CreateContactusDto {

    @ApiProperty()
    name: string;
    
    @ApiProperty()
    email: string;
    
    @ApiProperty()
    subject?: string;

    @ApiProperty()
    description?: string;

}
