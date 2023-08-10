import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Category, CreateBlockUserDto, CreateMuteUserDto, CreateResctricUserDto, CreateSettingDto, DocumentType, ReportContentDto, ReportContentUpdateDto, ReportProblemSchemaDto, RequestValidationDto } from './dto/create-setting.dto';
import { UpdateReportProblemSchemaDto, UpdateRequestValidationDto, UpdateSettingDto } from './dto/update-setting.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TypeContent, TypeRole } from 'src/like/dto/create-like.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

}


@ApiTags('User Opration')
@Controller('useropration')
export class UserOperationController {
  constructor(private readonly settingsService: SettingsService) { }
  //block //restrict //mute
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('block')
  createBlocke(@Body() createSettingDto: CreateBlockUserDto, @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.createBlocke(createSettingDto, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('restrict')
  createRestrict(@Body() createSettingDto: CreateResctricUserDto, @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.createRestrict(createSettingDto, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('mute')
  createMute(@Body() createSettingDto: CreateMuteUserDto, @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.createMute(createSettingDto, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('block')
  getBlocke(@Req() req) {
    const user_id = req?.user?.payload?.id;

    return this.settingsService.getBlocke(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('restrict')
  getRestrict(@Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.getRestrict(user_id);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('mute')
  geteMute(@Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.geteMute(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('block/:id')
  removeBlocke(@Param('id') id: string, @Req() req) {
    const user_id = req?.user?.payload?.id;

    return this.settingsService.removeBlock(id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('restrict/:id')
  removeRestrict(@Param('id') id: string, @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.removeRestrict(id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('mute/:id')
  removeMute(@Param('id') id: string, @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.removeMute(id, user_id);
  }


}

@ApiTags('Report Problem')
@Controller('reportproblem')
export class ReportProblemController {
  constructor(private readonly settingsService: SettingsService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('add')
  addReportProblem(@Body() createSettingDto: ReportProblemSchemaDto, @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.addReportProblem(createSettingDto, user_id);
  }


  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('update/:id')
  updateReportProblem(@Param('id') id: number, @Body() createSettingDto: UpdateReportProblemSchemaDto) {
    return this.settingsService.updateReportProblem(createSettingDto, id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get()
  getReportProblem(@Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.getReportProblem(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('delete/:id')
  deleteReportProblem(@Param('id') id: number) {
    return this.settingsService.deleteReportProblem(id);
  }
}
@ApiTags('Report Content')
@Controller('reportcontent')
export class ReportContentController {
  constructor(private readonly settingsService: SettingsService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put()
  @ApiQuery({ name: 'type', enum: TypeContent })
  addreportContent(@Body() reportContentDto: ReportContentDto,
    @Query('type') type: TypeContent = TypeContent.REELS,
    @Req() req) {
    const user_id = req?.user?.payload?.id;
    console.log(reportContentDto)
    return this.settingsService.addreportContent(reportContentDto, type, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('update/:id')
  updatereportContent(@Param('id') id: number,
    @Body() createReportDto: ReportContentUpdateDto,
    @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.updatereportContent(createReportDto,
      id, user_id);
  }

  @Delete('delete/:id')
  deleteReportContent(@Param('id') id: number) {
    return this.settingsService.deleteReportContent(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get()
  getReportContent(@Req() req,
  ) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.getReportContent(user_id);
  }

}

@ApiTags('Request Validation')
@Controller('requestvalidation')
export class RequestValidationController {
  constructor(private readonly settingsService: SettingsService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiQuery({ name: 'document_type', enum: DocumentType })
  @ApiQuery({ name: 'category', enum: Category })
  @Post()
  requestValidation(@Body() requestValidation: RequestValidationDto,
    @Query('document_type') document_type: DocumentType = DocumentType.DRIVERLICENSE,
    @Query('category') category: Category = Category.Digital_Creator,
    @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.requestValidation(requestValidation, document_type, category, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put()
  requestValidationUpdate(@Body() requestValidation: UpdateRequestValidationDto,
    @Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.updateValidation(requestValidation, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get()
  requestValidationGet(@Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.requestValidationGet(user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete()
  requestValidationDelete(@Req() req) {
    const user_id = req?.user?.payload?.id;
    return this.settingsService.requestValidationDelete(user_id);
  }
}