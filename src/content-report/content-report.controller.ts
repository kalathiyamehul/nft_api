import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, Put } from '@nestjs/common';
import { ContentReportService } from './content-report.service';
import { CategoryRole, ContentReportDto, TypeRole } from './dto/content-report.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Content Report')
@Controller('content_report')
export class ContentReportController {
  constructor(private readonly contentReportService: ContentReportService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('/addDeletereport/:type_id/:type/:category')
  @ApiQuery({ name: 'type', enum: TypeRole })
  @ApiQuery({ name: 'category', enum: CategoryRole })
  addreport(@Param('type_id') type_id: number,
    @Query('type') type: TypeRole = TypeRole.REELS,@Query('category') category: CategoryRole = CategoryRole.SPAM, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.contentReportService.addreport(type, type_id, category.replace("'","''"), user_id);
  }

  
  @ApiBearerAuth()
  @UseGuards(AuthGuard()) 
  @Get('/getReportCategories')
  getReportCategories() {
    return this.contentReportService.getReportCategories();
  }
  

}
