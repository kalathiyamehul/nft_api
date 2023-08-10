import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, Put } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto, TypeRole } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Comment & Like')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('/addDeletelike/:type_id/:type')
  @ApiQuery({ name: 'type', enum: TypeRole })
  addlike(@Param('type_id') type_id: number,
    @Query('type') type: TypeRole = TypeRole.REELS, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.likeService.addDeletelike(type, type_id, user_id);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/checkLike/:type_id/:type')
  @ApiQuery({ name: 'type', enum: TypeRole })
  checkLike(@Param('type_id') type_id: number,
    @Query('type') type: TypeRole = TypeRole.REELS, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.likeService.checkLike(type,type_id, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('/adddoublelike/:type_id/:type')
  @ApiQuery({ name: 'type', enum: TypeRole })
  adddoublelike(@Param('type_id') type_id: number,
    @Query('type') type: TypeRole = TypeRole.REELS, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.likeService.adddoublelike(type, type_id, user_id);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/checkdoubleLike/:type_id/:type')
  @ApiQuery({ name: 'type', enum: TypeRole })
  checkdoubleLike(@Param('type_id') type_id: number,
    @Query('type') type: TypeRole = TypeRole.REELS, @Req() req) {
    const user_id = req?.user?.payload?.id
    return this.likeService.checkdoubleLike(type, type_id, user_id);
  }

}
