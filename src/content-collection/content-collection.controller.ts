import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, Put } from '@nestjs/common';
import { ContentCollectionService } from './content-collection.service';
import { ContentCollectionDto, TypeRole } from './dto/content-collection.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Content Collection')
@Controller('content_collection')
export class ContentCollectionController {
  constructor(private readonly contentCollectionService: ContentCollectionService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('/addDeletecollection/:type_id/:type')
  @ApiQuery({ name: 'type', enum: TypeRole })
  addcollection(@Param('type_id') type_id: number,
    @Query('type') type: TypeRole = TypeRole.REELS, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.contentCollectionService.addDeletecollection(type, type_id, user_id);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/checkcollection/:type_id/:type')
  @ApiQuery({ name: 'type', enum: TypeRole })
  checkcollection(@Param('type_id') type_id: number,
    @Query('type') type: TypeRole = TypeRole.REELS, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.contentCollectionService.checkcollection(type,type_id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard()) 
  @Get('/findByAuthorID/:user_id/:type/:page')
  @ApiQuery({ name: 'type', enum: TypeRole })
  findByAuthorID(@Query('type') type: TypeRole = TypeRole.REELS, @Param('page') page: number, @Param('user_id') user_id: number) {
    return this.contentCollectionService.findByAuthorID(type, page, user_id);
  }


}
