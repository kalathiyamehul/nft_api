import { ApiProperty } from "@nestjs/swagger"

export class CreateClosefriendDto {
    @ApiProperty()
    closefriendID: number
    @ApiProperty()
    userId:number
}
