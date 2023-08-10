import { ApiProperty } from "@nestjs/swagger"

export class CompileContract {
    @ApiProperty()
    collection_name: string
    @ApiProperty()
    collection_symbol: string
}