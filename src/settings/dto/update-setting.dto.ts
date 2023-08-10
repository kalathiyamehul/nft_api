import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateSettingDto, ReportProblemSchemaDto, RequestValidationDto } from './create-setting.dto';

export class UpdateSettingDto extends PartialType(CreateSettingDto) { }
export class UpdateReportProblemSchemaDto extends PartialType(ReportProblemSchemaDto) { }
export class UpdateRequestValidationDto extends PartialType(RequestValidationDto) {
    @ApiPropertyOptional()
    document_type: string

    @ApiPropertyOptional()
    category: string
}
