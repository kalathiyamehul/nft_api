import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, Put } from '@nestjs/common';
import { ViewService } from './view.service';
import { AddViewDto, TypeRole } from './dto/view.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('View')
@Controller('view')
export class ViewController {
  constructor(private readonly viewService: ViewService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('/addview/:type_id/:type')
  @ApiQuery({ name: 'type', enum: TypeRole })
  addview(@Param('type_id') type_id: number,
    @Query('type') type: TypeRole = TypeRole.REELS, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.viewService.addview(type, type_id, user_id);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/checkView/:type_id/:type')
  @ApiQuery({ name: 'type', enum: TypeRole })
  checkView(@Param('type_id') type_id: number,
    @Query('type') type: TypeRole = TypeRole.REELS, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.viewService.checkView(type,type_id, user_id);
  }
  
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/listView/:type_id/:type')
  @ApiQuery({ name: 'type', enum: TypeRole })
  listView(@Param('type_id') type_id: number, @Query('type') type: TypeRole = TypeRole.REELS) {
    return this.viewService.listView(type,type_id);
  }

}
